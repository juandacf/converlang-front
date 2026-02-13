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
    fetch(`${API_BACKEND}/chats/${numericMatchId}`, {
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
