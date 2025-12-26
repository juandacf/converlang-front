import { useState, useEffect, useRef } from "react";
import { NavBar, Footer } from "../dashboard/Dashboard";
import "./UserChat.css";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { API_URL } from "../../config/api";
import { Translations } from "../../translations/translations";


export function UserChat() {
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const translations = Translations
  const [chatList, setChatList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("ES");
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const configMenuRef = useRef(null);
  const navigate = useNavigate();
  const API_BACKEND = API_URL

  const socket = useSocket();


  if (!socket) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        Conectando con el servidor...
      </div>
    );
  }

  // =====================================================
  // 1. Obtener lista de chats del usuario
  // =====================================================
  useEffect(() => {
    fetch(`${API_BACKEND}/chats/list/${decodedToken.sub}`)
      .then((res) => res.json())
      .then((data) => setChatList(data));
  }, [decodedToken.sub]);

  // =====================================================
  // 2. Al seleccionar un chat → unirme a la sala + cargar mensajes
  // =====================================================
  useEffect(() => {
    if (!selectedMatch || !socket) return;

   socket.emit("joinRoom", Number(selectedMatch.match_id));



    fetch(`${API_BACKEND}/chats/${selectedMatch.match_id}`)
      .then((res) => res.json())
      .then((data) => setMessages(data));

  }, [selectedMatch, socket]);

  // =====================================================
  // 3. Escuchar mensajes nuevos
  // =====================================================
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("newMessage", handler);

    return () => socket.off("newMessage", handler);

  }, [socket]);

  // =====================================================
  // 4. Enviar mensaje
  // =====================================================
  const sendMessage = () => {
    if (!draft.trim() || !selectedMatch || !socket) return;

    socket.emit("sendMessage", {
      matchId: selectedMatch.match_id,
      senderId: decodedToken.sub,
      message: draft,
    });

    setDraft("");
  };

  // =====================================================
  // 5. Filtrar chats por búsqueda
  // =====================================================
  const filteredChats = chatList.filter((chat) =>
    chat.full_name.toLowerCase().includes(search.toLowerCase())
  );

  // =====================================================
  // 6. Cerrar menú contextual al hacer clic fuera
  // =====================================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        configMenuRef.current &&
        !configMenuRef.current.contains(e.target)
      ) {
        setShowConfigMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =====================================================
  // 7. Eliminar match
  // =====================================================
  const handleDeleteMatch = async () => {
    if (!selectedMatch) return;

    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este match?"
    );
    if (!confirmDelete) return;

    try {
      const user1 = Number(decodedToken.sub);
      const user2 = Number(selectedMatch.other_user_id);

      const res = await fetch(
        `${API_BACKEND}/matches/deleteMatch?user_1=${user1}&user_2=${user2}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al eliminar el match");
      }

      setChatList((prev) =>
        prev.filter((c) => c.match_id !== selectedMatch.match_id)
      );

      setSelectedMatch(null);
      setMessages([]);
      setShowConfigMenu(false);

    } catch (err) {
      alert(err.message);
    }
  };

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
  

  // =====================================================
  //  RENDER
  // =====================================================

  return (
    <>
    <div className={darkMode ? "dark-mode" : ""}>
      <div className="userChatMainContainer">

        {/* ========================
             LISTA DE CHATS
        ======================== */}
        <div className="chatItemsContainer">
          <div className="chatSearchContainer">
            <input
              type="text"
              className="chatSearchInput"
              placeholder={translations[language].chatModule.searchBarPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredChats.map((chat) => (
            <div
              className="chatMatchContainer"
              key={chat.match_id}
              onClick={() => setSelectedMatch(chat)}
            >
              <div className="chatPhotoContainer">
                <img
                  className="userPhoto purpleMargin"
                  src={
                    chat.profile_photo
                      ? `${API_BACKEND}${chat.profile_photo}`
                      : "../../../public/assets/user.png"
                  }
                  alt=""
                />
              </div>

              <div className="chatNameContainer">
                <p>{chat.full_name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ========================
             VENTANA DE CHAT
        ======================== */}
        <div className="messagesContainer">
          {selectedMatch ? (
            <>
              <div className="messagesTitle">
                <div className="chatPhotoContainer">
                  <img
                    className="userPhoto purpleMargin"
                    src={
                      selectedMatch?.profile_photo
                        ? `${API_BACKEND}${selectedMatch.profile_photo}`
                        : "../../../public/assets/user.png"
                    }
                    alt=""
                  />
                </div>

                <p className="chatName">{selectedMatch.full_name}</p>

                <img
                  className="userPhoto configButton"
                  src="../../../public/assets/dots.png"
                  alt=""
                  onClick={() => setShowConfigMenu((prev) => !prev)}
                />

                {showConfigMenu && (
                  <div className="configMenu" ref={configMenuRef}>
                    <p
                      onClick={() =>
                        navigate(`/videocall/${selectedMatch.match_id}`, {
                          state: { selectedMatch },
                        })
                      }
                    >
                      📞 {translations[language].chatModule.startACall}
                    </p>

                    <p className="danger" onClick={handleDeleteMatch}>
                      ❌ {translations[language].chatModule.deleteMatch}
                    </p>
                  </div>
                )}
              </div>

              <div className="actualMessageContainer">
                {messages.map((m) => (
                  <div
                    key={m.message_id}
                    className={
                      m.sender_id === decodedToken.sub
                        ? "selfMessage"
                        : "otherMessage"
                    }
                  >
                    <p>{m.message}</p>
                  </div>
                ))}
              </div>

              <div className="inputContainer">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="inputChat"
                  placeholder={translations[language].chatModule.sendMessagePlaceholder}
                />

                <img
                  src="../../../public/assets/send.png"
                  alt="send"
                  className="sendMessage inputImage"
                  onClick={sendMessage}
                />
              </div>
            </>
          ) : (
            <p style={{ textAlign: "center", marginTop: "20%" }}>
              Selecciona un chat
            </p>
          )}
        </div>
      </div>

      <NavBar />
      <Footer />
      </div>
    </>
    
  );
}
