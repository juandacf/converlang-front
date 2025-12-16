import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "./videoCall.css";
import { jwtDecode } from "jwt-decode";
import { useSocket } from "../../context/SocketContext";

export default function VideoCall() {
  const { match_id } = useParams();
  const location = useLocation();

  // Persona con la que hablo
  const selectedMatch = location.state?.selectedMatch;

  // Obtener userId desde el token
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userId = decoded.sub;

  // Referencias de video
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Chat
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

const socket = useSocket();

if (!socket) {
  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      Conectando a la sala...
    </div>
  );
}


  /* ===============================
     1. Cargar mensajes antiguos
  =============================== */
  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch(`http://localhost:3000/chats/${match_id}`);
        const data = await res.json();

        if (Array.isArray(data)) setMessages(data);
      } catch (err) {
        console.error("Error cargando mensajes:", err);
      }
    }

    loadMessages();
  }, [match_id]);


  /* ===============================
     2. Unirse a la sala WebSocket
  =============================== */
  useEffect(() => {
    socket.emit("joinRoom", Number(match_id));
  }, [socket, match_id]);


  /* ===============================
     3. Escuchar nuevos mensajes
  =============================== */
  useEffect(() => {
    const handler = (msg) => {
      if (msg.match_id === Number(match_id)) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [socket, match_id]);


  /* ===============================
     4. Enviar mensaje
  =============================== */
const sendMessage = () => {
  if (!draft.trim() || !socket) return;

  const newMessage = {
    message: draft,
    sender_id: userId,
    match_id: Number(match_id),
    timestamp: Date.now(),
    message_id: Math.random() // Id temporal
  };

  setMessages(prev => [...prev, newMessage]);

  socket.emit("sendMessage", {
    matchId: Number(match_id),
    senderId: userId,
    message: draft,
  });

  setDraft("");
};



  /* ===============================
     5. Activar cámara local
  =============================== */
  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("No se pudo iniciar cámara:", err);
      }
    }

    initCamera();
  }, []);

  return (
    <div className="videoCallMainContainer">

      {/* ===============================
          ZONA DE VIDEO + PIP
      =============================== */}
      <div className="videoArea">
        <div className="videoWrapper">
          
          {/* Video remoto (cuando WebRTC esté listo) */}
          <video
            className="videoBox"
            ref={remoteVideoRef}
            autoPlay
            playsInline
          />

          {/* Picture-in-picture: tú */}
          <video
            className="pipVideo"
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
          />

        </div>
      </div>
      <div className="videoChatContainer">
        <h3 className="videoChatTitle">
          Chat con {selectedMatch?.full_name}
        </h3>

        <div className="videoChatMessages">
          {messages.map((m) => {
            const isMe = m.sender_id === userId;

            return (
              <div
                key={m.message_id || Math.random()}
                className={isMe ? "selfVideoMessage" : "otherVideoMessage"}
              >
                <div className="messageMeta">
                  <span className="senderName">
                    {isMe ? "Tú" : selectedMatch?.full_name}
                  </span>
                </div>

                <p className="messageText">{m.message}</p>
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
