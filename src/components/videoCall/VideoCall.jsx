import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import "./VideoCall.css";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../../config/api";
import { Translations } from "../../translations/translations";

export default function VideoCall() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("ES");
  const token1 = localStorage.getItem("token");
  const decodedToken = jwtDecode(token1);
  const { match_id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const location = useLocation();
  const selectedMatch = location.state?.selectedMatch;
  const translations = Translations
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const isCallerRef = useRef(false);
  const hasLocalOfferRef = useRef(false);

  // ⬇️ GUARDA CUÁNDO EMPIEZA LA LLAMADA
  const callStartTimeRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  const API_BACKEND = API_URL;
  const numericMatchId = useMemo(() => Number(match_id), [match_id]);

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userId = Number(decoded.sub);

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

    await fetch(`${API_BACKEND}/call`, {
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
    fetch(`${API_BACKEND}/chats/${numericMatchId}`)
      .then((r) => r.json())
      .then((d) => setMessages(Array.isArray(d) ? d : []))
      .catch(() => setMessages([]));
  }, [numericMatchId]);

  useEffect(() => {
    socket.emit("joinRoom", numericMatchId);

    const handler = (msg) => {
      if (getMsgMatchId(msg) !== numericMatchId) return;

      setMessages((prev) => {
        const sender = getMsgSenderId(msg);
        const text = msg.message;

        const filtered = prev.filter(
          (m) =>
            !(
              m.__pending &&
              getMsgSenderId(m) === sender &&
              m.message === text
            )
        );
        return [...filtered, msg];
      });
    };

    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [socket, numericMatchId]);

  /* ======================================================
     WebRTC
  ====================================================== */
  function createPeerConnection() {
    if (peerRef.current) return;

    const pc = new RTCPeerConnection(iceServers);
    peerRef.current = pc;

    pc.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtcIceCandidate", {
          matchId: numericMatchId,
          candidate: e.candidate,
        });
      }
    };
  }

  async function initCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // ⬇️ MARCA INICIO DE LLAMADA
    if (!callStartTimeRef.current) {
      callStartTimeRef.current = new Date().toISOString();
    }

    localStreamRef.current = stream;
    localVideoRef.current.srcObject = stream;

    createPeerConnection();

    const pc = peerRef.current;
    const senders = pc.getSenders().map((s) => s.track);
    stream.getTracks().forEach((t) => {
      if (!senders.includes(t)) pc.addTrack(t, stream);
    });
  }

  useEffect(() => {
    initCamera();
  }, []);

  async function handleOffer({ offer }) {
    if (isCallerRef.current) return;

    createPeerConnection();
    const pc = peerRef.current;

    if (pc.signalingState !== "stable") return;

    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("webrtcAnswer", {
      matchId: numericMatchId,
      answer,
    });
  }

  async function handleAnswer({ answer }) {
    if (!isCallerRef.current || !hasLocalOfferRef.current) return;
    const pc = peerRef.current;
    if (pc.signalingState === "have-local-offer") {
      await pc.setRemoteDescription(answer);
    }
  }

  async function handleIce({ candidate }) {
    try {
      await peerRef.current?.addIceCandidate(candidate);
    } catch { }
  }

  async function startCallAsCaller() {
    if (!peerRef.current) {
      createPeerConnection();
    }

    const pc = peerRef.current;

    if (!pc) return; // ultra defensivo

    if (hasLocalOfferRef.current || pc.signalingState !== "stable") return;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    hasLocalOfferRef.current = true;

    socket.emit("webrtcOffer", {
      matchId: numericMatchId,
      offer,
    });
  }


  /* ======================================================
     Señalización llamada
  ====================================================== */
  useEffect(() => {
    socket.emit("joinCallRoom", numericMatchId);

    isCallerRef.current = true;
    hasLocalOfferRef.current = false;

    socket.emit("callRequest", {
      matchId: numericMatchId,
      caller: { userId },
    });
  }, [numericMatchId]);

  useEffect(() => {
    socket.on("incomingCall", () => {
      isCallerRef.current = false;
      socket.emit("callAccepted", { matchId: numericMatchId });
    });

    socket.on("callAccepted", startCallAsCaller);
    socket.on("webrtcOffer", handleOffer);
    socket.on("webrtcAnswer", handleAnswer);
    socket.on("webrtcIceCandidate", handleIce);

    socket.on("callEnded", () => {
      alert(translations[language].videoModule.endCallAlert);

      cleanupCall();
      navigate(-1);
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("webrtcOffer");
      socket.off("webrtcAnswer");
      socket.off("webrtcIceCandidate");
      socket.off("callEnded");
    };
  }, [socket]);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch(
          `${API_BACKEND}/preferences/${decodedToken.sub}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }

        const data = await res.json();

        // Backend: theme = true (light) | false (dark)
        setDarkMode(!data.theme);
        setLanguage(data.language_code);
      } catch (error) {
        console.error("Error cargando preferencias:", error);
      }
    };

    fetchPreferences();
  }, []);

  /* ======================================================
     Cierre de pestaña
  ====================================================== */
  useEffect(() => {
    const onUnload = () => {
      socket.emit("endCall", { matchId: numericMatchId });

      // ⚠️ sendBeacon para no bloquear cierre
      navigator.sendBeacon(
        `${API_BACKEND}/call`,
        JSON.stringify({
          idUser1: userId,
          idUser2: selectedMatch.id_user,
          startTime: callStartTimeRef.current,
          endTime: new Date().toISOString(),
          sessionStatus: "completed",
        })
      );

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

    setMessages((p) => [
      ...p,
      {
        message_id: `tmp_${Date.now()}`,
        sender_id: userId,
        match_id: numericMatchId,
        message: draft,
        __pending: true,
      },
    ]);

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

            <button className="endCallBtn" onClick={endCall}>
              🔴 {translations[language].videoModule.endCallButton}
            </button>
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
    </div>
  );
}
