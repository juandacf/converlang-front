import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import "./videoCall.css";
import { jwtDecode } from "jwt-decode";

export default function VideoCall() {
  const { match_id } = useParams();
  const socket = useSocket();

  const location = useLocation();
  const selectedMatch = location.state?.selectedMatch;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userId = Number(decoded.sub);

  const numericMatchId = useMemo(() => Number(match_id), [match_id]);

  const iceServers = useMemo(
    () => ({ iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] }),
    []
  );

  if (!socket) return <div>Conectando con el servidor...</div>;

  // -------- helpers (NORMALIZA payloads) ----------
  const getMsgMatchId = (msg) => Number(msg?.match_id ?? msg?.matchId ?? msg?.matchID);
  const getMsgSenderId = (msg) => Number(msg?.sender_id ?? msg?.senderId ?? msg?.senderID);

  // ======================================================
  // 1) Load historial
  // ======================================================
  useEffect(() => {
    fetch(`http://localhost:3000/chats/${numericMatchId}`)
      .then((res) => res.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));
  }, [numericMatchId]);

  // ======================================================
  // 2) Join room + listener ÚNICO
  // ======================================================
  useEffect(() => {
    // Unirse SIEMPRE con el ID numérico (así tu gateway no depende de strings)
    socket.emit("joinRoom", numericMatchId);

    const handler = (msg) => {
      const mid = getMsgMatchId(msg);
      if (mid !== numericMatchId) return;

      setMessages((prev) => {
        // Si el server devuelve el mensaje real, elimina el optimistic equivalente (si existe)
        // Heurística: mismo sender + mismo texto + estaba marcado como pending
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

  // ======================================================
  // 3) WebRTC (tu lógica; ojo: initCamera() debes llamarla cuando corresponda)
  // ======================================================
  function createPeerConnection() {
    peerRef.current = new RTCPeerConnection(iceServers);

    peerRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerRef.current.onicecandidate = (event) => {
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
      stream.getTracks().forEach((track) => peerRef.current.addTrack(track, stream));
    } catch (err) {
      console.error("Error iniciando cámara:", err);
    }
  }

  // Si quieres iniciar cámara automáticamente al entrar:
  useEffect(() => {
    initCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleReceivedOffer({ offer }) {
    if (!peerRef.current) createPeerConnection();
    await peerRef.current.setRemoteDescription(offer);

    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    socket.emit("webrtcAnswer", {
      matchId: numericMatchId,
      answer,
    });
  }

  async function handleReceivedAnswer({ answer }) {
    if (!peerRef.current) return;
    await peerRef.current.setRemoteDescription(answer);
  }

  async function handleNewICECandidate({ candidate }) {
    try {
      await peerRef.current?.addIceCandidate(candidate);
    } catch (error) {
      console.error("ICE error:", error);
    }
  }

  async function startCall() {
    if (!peerRef.current) createPeerConnection();

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);

    socket.emit("webrtcOffer", {
      matchId: numericMatchId,
      offer,
    });
  }

  // Listeners WebRTC (si ya los tienes en otro lado, ok, pero no los dupliques)
  useEffect(() => {
    socket.on("webrtcOffer", handleReceivedOffer);
    socket.on("webrtcAnswer", handleReceivedAnswer);
    socket.on("webrtcIceCandidate", handleNewICECandidate);
    socket.on("callAccepted", startCall);

    return () => {
      socket.off("webrtcOffer", handleReceivedOffer);
      socket.off("webrtcAnswer", handleReceivedAnswer);
      socket.off("webrtcIceCandidate", handleNewICECandidate);
      socket.off("callAccepted", startCall);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, numericMatchId]);

  // ======================================================
  // 4) Send message (optimistic + sin duplicados)
  // ======================================================
  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;

    // 1) optimistic render
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

    // 2) emit al server
    socket.emit("sendMessage", {
      matchId: numericMatchId,
      senderId: userId,
      message: text,
    });

    setDraft("");
  };

  // ======================================================
  // UI
  // ======================================================
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
