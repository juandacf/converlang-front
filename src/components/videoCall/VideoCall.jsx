import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import "./VideoCall.css";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../../config/api";
import { authFetch } from "../../config/authFetch";
import { Translations } from "../../translations/translations";
import { CustomAlert } from "../common/CustomAlert";

export default function VideoCall() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("ES");

  const { match_id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const location = useLocation();
  const selectedMatch = location.state?.selectedMatch;
  const translations = Translations;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  // States para controles de media
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  // Refs para controlar el estado de la conexión
  const isCallerRef = useRef(false);
  const hasLocalOfferRef = useRef(false);
  const isNegotiatingRef = useRef(false);

  // ⬇️ GUARDA CUÁNDO EMPIEZA LA LLAMADA
  const callStartTimeRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  const API_BACKEND = API_URL;
  const numericMatchId = useMemo(() => Number(match_id), [match_id]);

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userId = Number(decoded.sub);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await authFetch(
          `${API_BACKEND}/preferences/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          // Backend: theme = true (light) | false (dark)
          setDarkMode(!data.theme);
          setLanguage(data.language_code || "ES");
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };

    fetchPreferences();
  }, [userId, token, API_BACKEND]);

  const iceServers = useMemo(
    () => ({ iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] }),
    []
  );

  /* ======================================================
     Utils
  ====================================================== */
  const getMsgMatchId = (m) =>
    Number(m?.match_id ?? m?.matchId ?? m?.matchID);
  const getMsgSenderId = (m) =>
    Number(m?.sender_id ?? m?.senderId ?? m?.senderID);

  /* ======================================================
     1. Obtener Media (Cámara/Micrófono) de forma robusta
  ====================================================== */
  async function getMedia() {
    try {
      // Intenta video + audio
      return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err1) {
      console.warn("Fallo al obtener video+audio:", err1);
      try {
        // Intenta solo audio
        return await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      } catch (err2) {
        console.warn("Fallo al obtener audio:", err2);
        try {
          // Intenta solo video
          return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (err3) {
          console.error("No se pudo obtener ni video ni audio", err3);
          return null; // El usuario estará en modo "espectador" (sin tracks locales)
        }
      }
    }
  }

  /* ======================================================
     2. Inicializar WebRTC
  ====================================================== */
  async function initWebRTC() {
    // 1. Obtener stream local (puede ser null si no hay disp.)
    const stream = await getMedia();
    localStreamRef.current = stream;

    // Sincronizar estado inicial de botones con los tracks obtenidos
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      setIsCameraOn(videoTracks.length > 0 && videoTracks[0].enabled);
      setIsMicOn(audioTracks.length > 0 && audioTracks[0].enabled);
    } else {
      setIsCameraOn(false);
      setIsMicOn(false);
    }

    // Mostrar en video local (si hay video track)
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
      // Truco: a veces hay que mutear el local para evitar eco local (aunque ya esté muted en HTML)
      localVideoRef.current.muted = true;
    }

    // 2. Crear PeerConnection
    peerRef.current = new RTCPeerConnection(iceServers);

    // 3. Agregar tracks locales al Peer
    if (stream) {
      stream.getTracks().forEach((track) => {
        peerRef.current.addTrack(track, stream);
      });
    }

    // 4. Manejar tracks remotos (u otros eventos)
    peerRef.current.ontrack = (event) => {
      console.log("Track remoto recibido:", event.streams);
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // 5. Manejar candidatos ICE
    peerRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtcIceCandidate", {
          matchId: numericMatchId,
          candidate: event.candidate,
        });
      }
    };
  }

  // Funciones para Toggle Hub
  const toggleMic = () => {
    const stream = localStreamRef.current;
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach(t => t.enabled = !t.enabled);
        setIsMicOn(audioTracks[0].enabled);
      }
    }
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach(t => t.enabled = !t.enabled);
        setIsCameraOn(videoTracks[0].enabled);
      }
    }
  };

  // Helper: Crear oferta
  async function createOffer() {
    if (!peerRef.current) return;
    try {
      isNegotiatingRef.current = true;
      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);

      hasLocalOfferRef.current = true;
      socket.emit("webrtcOffer", {
        matchId: numericMatchId,
        offer: peerRef.current.localDescription
      });
    } catch (err) {
      console.error("Error creando oferta:", err);
    } finally {
      isNegotiatingRef.current = false;
    }
  }

  // Helper: Crear respuesta
  async function createAnswer() {
    if (!peerRef.current) return;
    try {
      isNegotiatingRef.current = true;
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);

      socket.emit("webrtcAnswer", {
        matchId: numericMatchId,
        answer: peerRef.current.localDescription,
      });
    } catch (err) {
      console.error("Error creando respuesta:", err);
    } finally {
      isNegotiatingRef.current = false;
    }
  }

  /* ======================================================
     3. Ciclo de vida: Join Room + Signal Listeners
  ====================================================== */
  useEffect(() => {
    if (!socket || !numericMatchId) return;

    // A. Inicializar recursos locales
    initWebRTC().then(() => {
      // B. Unirse a la sala
      socket.emit("joinCallRoom", numericMatchId);
      socket.emit("joinRoom", numericMatchId); // Unirse a la sala de chat tambien

      // C. Anunciar "estoy listo" para ver si hay alguien más
      //    (o esperar a que el otro se una)
      //    Nota: El backend retransmite 'callRequest' o 'incomingCall'.
      //    Podemos enviar un 'callRequest' genérico para iniciar el handshake.
      socket.emit("callRequest", {
        matchId: numericMatchId,
        caller: { userId } // data minima
      });

      callStartTimeRef.current = new Date().toISOString();
    });

    // --- Listeners de Signaling ---

    // 1. Otro usuario se unió o envió solicitud
    socket.on("incomingCall", async ({ caller }) => {
      console.log("Recibida incomingCall de:", caller);
      // Aceptamos automáticamente para establecer P2P
      // Decidir quién es Caller basado en ID para evitar colisiones
      const imCaller = userId > (selectedMatch?.other_user_id || 0);
      isCallerRef.current = imCaller;

      socket.emit("callAccepted", { matchId: numericMatchId });

      if (imCaller) {
        console.log("Soy el Caller, crearé oferta...");
        await createOffer();
      } else {
        console.log("Soy el Callee, esperaré oferta...");
      }
    });

    // 2. Alguien aceptó mi llamada (o handshake inicial)
    socket.on("callAccepted", async () => {
      console.log("callAccepted recibido.");
      // Si yo soy el caller y aún no he ofertado, oferto.
      // (La lógica de arriba en incomingCall suele cubrir el inicio, 
      //  pero esto cubre si el otro usuario ya estaba en la sala y responde a mi join)

      const imCaller = userId > (selectedMatch?.other_user_id || 0);
      // Solo si soy caller y NO he ofertado aun
      if (imCaller && !hasLocalOfferRef.current) {
        console.log("Soy Caller (por callAccepted), creando oferta...");
        await createOffer();
      }
    });

    // 3. Recibir Oferta
    socket.on("webrtcOffer", async ({ offer }) => {
      if (!peerRef.current) return;
      console.log("Oferta recibida");

      // Si recibimos oferta, somos Callee (o collision recovery, WebRTC lo maneja si hay glare)
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      await createAnswer();
    });

    // 4. Recibir Respuesta
    socket.on("webrtcAnswer", async ({ answer }) => {
      if (!peerRef.current) return;
      console.log("Respuesta recibida");
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // 5. Recibir Candidato ICE
    socket.on("webrtcIceCandidate", async ({ candidate }) => {
      if (!peerRef.current) return;
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error al agregar ICE candidate", err);
      }
    });

    // 6. Fin de llamada
    socket.on("callEnded", () => {
      console.log("El otro usuario colgó.");
      cleanupCall();
      setAlertState({
        isOpen: true,
        type: "success",
        message: "La llamada ha finalizado."
      });
      setTimeout(() => navigate(-1), 1500);
    });

    // 7. Recibir Mensajes de Chat
    const handleNewMessage = (msg) => {
      if (getMsgMatchId(msg) === numericMatchId) {
        setMessages((prev) => {
          // Evitar duplicados si el mensaje ya está en la lista (por ejemplo, el que enviamos localmente como optimista)
          if (prev.find((m) => m.message_id === msg.message_id)) return prev;
          return [...prev, msg];
        });
      }
    };
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("webrtcOffer");
      socket.off("webrtcAnswer");
      socket.off("webrtcIceCandidate");
      socket.off("callEnded");
      socket.off("newMessage", handleNewMessage);
      cleanupCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, numericMatchId, userId]);


  /* ======================================================
     Cleanup llamada
  ====================================================== */
  function cleanupCall() {
    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    isCallerRef.current = false;
    hasLocalOfferRef.current = false;
  }

  /* ======================================================
     ENVÍO A BACKEND (POST /call)
  ====================================================== */
  async function persistSession() {
    const startTime =
      callStartTimeRef.current ?? new Date().toISOString();

    const idUser2 = selectedMatch?.other_user_id;

    if (!idUser2) {
      console.error("idUser2 inválido", selectedMatch);
      return;
    }

    await authFetch(`${API_BACKEND}/call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        idUser1: userId,
        idUser2,
        startTime,
        endTime: new Date().toISOString(),
        sessionNotes: "Videollamada finalizada",
      }),
    });
  }



  /* ======================================================
     Terminar llamada (botón)
  ====================================================== */
  async function endCall() {
    socket.emit("endCall", { matchId: numericMatchId });

    // ⬇️ PERSISTE SESIÓN
    await persistSession("completed");

    cleanupCall();
    navigate(-1);
  }

  /* ======================================================
     Chat
  ====================================================== */
  useEffect(() => {
    authFetch(`${API_BACKEND}/chats/${numericMatchId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then((d) => setMessages(Array.isArray(d) ? d : []))
      .catch(() => setMessages([]));
  }, [numericMatchId]);

  /* ======================================================
     Cierre de pestaña
  ====================================================== */
  useEffect(() => {
    const onUnload = () => {
      socket.emit("endCall", { matchId: numericMatchId });

      // ⚠️ Usamos fetch con keepalive en lugar de sendBeacon para enviar headers
      fetch(`${API_BACKEND}/call`, {
        method: "POST",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idUser1: userId,
          idUser2: selectedMatch.id_user,
          startTime: callStartTimeRef.current,
          endTime: new Date().toISOString(),
          sessionStatus: "completed",
        }),
      });

      cleanupCall();
    };

    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [numericMatchId]);

  /* ======================================================
     Chat send
  ====================================================== */
  const sendMessage = () => {
    if (!draft.trim()) return;

    socket.emit("sendMessage", {
      matchId: numericMatchId,
      senderId: userId,
      message: draft,
    });

    setDraft("");
  };

  /* ======================================================
     UI
  ====================================================== */
  return (
    <div className={darkMode ? "dark-mode" : ""}>
      <div className="videoCallMainContainer">
        <div className="videoArea">
          <div className="videoWrapper">
            <video
              className="videoBox"
              ref={remoteVideoRef}
              autoPlay
              playsInline
            />

            <video
              className="pipVideo"
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
            />

            {/* Controles: Mic, Cam, Colgar */}
            <div className="controlsContainer">
              <button
                className={`controlBtn ${!isMicOn ? 'off' : ''}`}
                onClick={toggleMic}
                title="Toggle Microphone"
              >
                {isMicOn ? '🎤' : '🔇'}
              </button>

              <button
                className={`controlBtn ${!isCameraOn ? 'off' : ''}`}
                onClick={toggleCamera}
                title="Toggle Camera"
              >
                {isCameraOn ? '📷' : '🚫'}
              </button>

              <button
                className="controlBtn hangupBtn"
                onClick={endCall}
                title="End Call"
              >
                🔴
              </button>
            </div>
          </div>
        </div>

        <div className="videoChatContainer">
          <h3 className="videoChatTitle">
            {translations[language].videoModule.chatTitle} {selectedMatch?.full_name}
          </h3>

          <div className="videoChatMessages">
            {messages.map((m) => {
              const isMe = getMsgSenderId(m) === userId;
              return (
                <div
                  key={m.message_id}
                  className={isMe ? "selfVideoMessage" : "otherVideoMessage"}
                  style={m.__pending ? { opacity: 0.6 } : undefined}
                >
                  <div className="messageMeta">
                    {isMe ? translations[language].videoModule.you : selectedMatch?.full_name}
                  </div>
                  <p>{m.message}</p>
                </div>
              );
            })}
          </div>

          <div className="videoChatInputArea">
            <input
              className="videoChatInput"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={translations[language].videoModule.messageInputPlaceholder}
            />
            <button className="videoChatSendBtn" onClick={sendMessage}>
              {translations[language].videoModule.sendAMessageButton}
            </button>
          </div>
        </div>
      </div>

      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        type={alertState.type}
        message={alertState.message}
        language={language}
      />
    </div>
  );
}
