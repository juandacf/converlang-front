import { useEffect, useRef, useState } from "react";
import "./videoCall.css";

export default function VideoCall({ socket, userId, remoteUser }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  /* ====== Inicializar cámara ====== */
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

        // Aquí luego conectaremos WebRTC y enviaremos stream al remoteVideoRef

      } catch (error) {
        console.error("Error al acceder a la cámara:", error);
      }
    }

    initCamera();
  }, []);

  /* ====== Mensajes entrantes del chat ====== */
  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat") {
        setMessages((prev) => [...prev, data]);
      }
    };
  }, [socket]);


  /* ====== Enviar mensaje ====== */
  const sendMessage = () => {
    if (!draft.trim()) return;

    const message = {
      type: "chat",
      sender_id: userId,
      message: draft,
      timestamp: Date.now(),
    };

    socket.send(JSON.stringify(message));
    setDraft("");
  };


  return (
    <div className="videoCallMainContainer">

      {/* ======= Columna de videollamada ======= */}
<div className="videoArea">
  <div className="videoWrapper">
    <video className="videoBox" ref={remoteVideoRef} autoPlay />
    <video className="pipVideo" ref={localVideoRef} autoPlay muted />
  </div>
</div>


      {/* ======= Columna de Chat ======= */}
      <div className="videoChatContainer">
        <h3 className="videoChatTitle">Chat de la videollamada</h3>

        <div className="videoChatMessages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.sender_id === userId ? "selfVideoMessage" : "otherVideoMessage"
              }
            >
              <p>{m.message}</p>
            </div>
          ))}
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
