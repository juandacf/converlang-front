import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import "./videoCall.css";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../../config/api";

export default function VideoCall() {
  const { match_id } = useParams();
  const socket = useSocket();

  const location = useLocation();
  const selectedMatch = location.state?.selectedMatch;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const API_BACKEND = API_URL

  // Chat
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  // WebRTC role/state (REFS para evitar carreras)
  const isCallerRef = useRef(false);
  const hasLocalOfferRef = useRef(false);

  // Auth
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userId = Number(decoded.sub);

  const numericMatchId = useMemo(() => Number(match_id), [match_id]);

  const iceServers = useMemo(
    () => ({ iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] }),
    []
  );

  if (!socket) return <div>Conectando con el servidor...</div>;

  // Helpers chat payload
  const getMsgMatchId = (msg) =>
    Number(msg?.match_id ?? msg?.matchId ?? msg?.matchID);
  const getMsgSenderId = (msg) =>
    Number(msg?.sender_id ?? msg?.senderId ?? msg?.senderID);

  /* ======================================================
     1) Load historial de chat
  ====================================================== */
  useEffect(() => {
    fetch(`${API_BACKEND}/chats/${numericMatchId}`)
      .then((res) => res.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));
  }, [numericMatchId]);

  /* ======================================================
     2) Join chat room + listener ÚNICO de mensajes
  ====================================================== */
  useEffect(() => {
    socket.emit("joinRoom", numericMatchId);

    const handler = (msg) => {
      const mid = getMsgMatchId(msg);
      if (mid !== numericMatchId) return;

      setMessages((prev) => {
        const sender = getMsgSenderId(msg);
        const text = msg?.message ?? "";

        const withoutPendingDup = prev.filter(
          (m) =>
            !(
              m?.__pending === true &&
              Number(m?.sender_id) === sender &&
              String(m?.message) === String(text)
            )
        );

        return [...withoutPendingDup, msg];
      });
    };

    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [socket, numericMatchId]);

  /* ======================================================
     3) WebRTC: Peer connection
  ====================================================== */
  function createPeerConnection() {
    if (peerRef.current) return;

    const pc = new RTCPeerConnection(iceServers);
    peerRef.current = pc;

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtcIceCandidate", {
          matchId: numericMatchId,
          candidate: event.candidate,
        });
      }
    };
  }

  async function initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      if (!peerRef.current) createPeerConnection();

      // Añadir tracks UNA sola vez
      const pc = peerRef.current;
      const existingSenders = pc.getSenders().map((s) => s.track).filter(Boolean);
      stream.getTracks().forEach((track) => {
        const alreadyAdded = existingSenders.includes(track);
        if (!alreadyAdded) pc.addTrack(track, stream);
      });
    } catch (err) {
      console.error("Error iniciando cámara:", err);
    }
  }

  useEffect(() => {
    initCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ======================================================
     4) WebRTC: Señalización
     - SOLO caller crea offer al recibir callAccepted
     - SOLO callee responde con answer al recibir offer
  ====================================================== */
  async function handleReceivedOffer({ offer }) {
    // Si soy caller, ignoro offers para evitar glare/doble negociación
    if (isCallerRef.current) return;

    if (!peerRef.current) createPeerConnection();
    const pc = peerRef.current;

    // Solo si estamos en estado estable o esperando offer
    if (pc.signalingState !== "stable") {
      // Si estás en otro estado, no intentes aplicar offer de nuevo
      console.warn("Ignoring offer, signalingState:", pc.signalingState);
      return;
    }

    await pc.setRemoteDescription(offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("webrtcAnswer", {
      matchId: numericMatchId,
      answer,
    });
  }

  async function handleReceivedAnswer({ answer }) {
    // Solo el caller debe procesar answer
    if (!isCallerRef.current) return;
    if (!hasLocalOfferRef.current) return;

    const pc = peerRef.current;
    if (!pc) return;

    // El estado correcto para aplicar answer es have-local-offer
    if (pc.signalingState !== "have-local-offer") {
      console.warn("Ignoring answer, signalingState:", pc.signalingState);
      return;
    }

    await pc.setRemoteDescription(answer);
  }

  async function handleNewICECandidate({ candidate }) {
    const pc = peerRef.current;
    if (!pc) return;

    try {
      await pc.addIceCandidate(candidate);
    } catch (error) {
      console.warn("ICE candidate ignored/error:", error);
    }
  }

  async function startCallAsCaller() {
    if (!peerRef.current) createPeerConnection();
    const pc = peerRef.current;

    // Evitar doble offer
    if (hasLocalOfferRef.current) return;
    if (pc.signalingState !== "stable") {
      console.warn("Not creating offer, signalingState:", pc.signalingState);
      return;
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    hasLocalOfferRef.current = true;

    socket.emit("webrtcOffer", {
      matchId: numericMatchId,
      offer,
    });
  }

  /* ======================================================
     5) Join CALL room + handshake simple
     - Ambos entran a call room
     - El primero "intenta" ser caller y manda callRequest
     - El que recibe incomingCall acepta
     - SOLO caller crea offer al recibir callAccepted
  ====================================================== */
  useEffect(() => {
    socket.emit("joinCallRoom", numericMatchId);
  }, [socket, numericMatchId]);

  // Intenta iniciar llamada al entrar (caller “optimista”)
  useEffect(() => {
    // Resetea banderas al entrar
    isCallerRef.current = true;
    hasLocalOfferRef.current = false;

    socket.emit("callRequest", {
      matchId: numericMatchId,
      caller: { userId },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericMatchId]);

  useEffect(() => {
    const onIncomingCall = () => {
      console.log("📞 Llamada entrante");

      // Este lado es callee
      isCallerRef.current = false;
      hasLocalOfferRef.current = false;

      socket.emit("callAccepted", { matchId: numericMatchId });
    };

    socket.on("incomingCall", onIncomingCall);
    return () => socket.off("incomingCall", onIncomingCall);
  }, [socket, numericMatchId]);

  useEffect(() => {
    const onCallAccepted = async () => {
      // Solo el caller inicia offer
      if (!isCallerRef.current) return;

      console.log("📞 callAccepted → creando OFFER (caller)");
      await startCallAsCaller();
    };

    socket.on("callAccepted", onCallAccepted);
    return () => socket.off("callAccepted", onCallAccepted);
  }, [socket, numericMatchId]);

  // Listeners WebRTC
  useEffect(() => {
    socket.on("webrtcOffer", handleReceivedOffer);
    socket.on("webrtcAnswer", handleReceivedAnswer);
    socket.on("webrtcIceCandidate", handleNewICECandidate);

    return () => {
      socket.off("webrtcOffer", handleReceivedOffer);
      socket.off("webrtcAnswer", handleReceivedAnswer);
      socket.off("webrtcIceCandidate", handleNewICECandidate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, numericMatchId]);

  /* ======================================================
     6) Chat: enviar mensaje (optimistic + sin duplicados)
  ====================================================== */
  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      {
        message_id: `tmp_${Date.now()}_${Math.random()}`,
        match_id: numericMatchId,
        sender_id: userId,
        message: text,
        __pending: true,
      },
    ]);

    socket.emit("sendMessage", {
      matchId: numericMatchId,
      senderId: userId,
      message: text,
    });

    setDraft("");
  };

  /* ======================================================
     UI
  ====================================================== */
  return (
    <div className="videoCallMainContainer">
      <div className="videoArea">
        <div className="videoWrapper">
          <video className="videoBox" ref={remoteVideoRef} autoPlay playsInline />
          <video className="pipVideo" ref={localVideoRef} autoPlay muted playsInline />
        </div>
      </div>

      <div className="videoChatContainer">
        <h3 className="videoChatTitle">Chat con {selectedMatch?.full_name}</h3>

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
                  {isMe ? "Tú" : selectedMatch?.full_name}
                </div>
                <p>{m.message}</p>
              </div>
            );
          })}
        </div>

        <div className="videoChatInputArea">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="videoChatInput"
            placeholder="Escribe un mensaje..."
          />
          <button className="videoChatSendBtn" onClick={sendMessage}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
