import { useState, useEffect, useRef } from "react";
import { NavBar } from "../dashboard/Dashboard";

import "./UserChat.css";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { API_URL } from "../../config/api";
import { authFetch } from "../../config/authFetch";
import { Translations } from "../../translations/translations";
import { CustomAlert } from "../common/CustomAlert";
import { getAvatarUrl } from "../../utils/avatarUtils";


export function UserChat() {
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const translations = Translations
  const [chatList, setChatList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [draft, setDraft] = useState("");
  const [authUser, setAuthUser] = useState({});
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [language, setLanguage] = useState("ES");
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: "success",
    message: ""
  });
  const configMenuRef = useRef(null);
  const navigate = useNavigate();
  const API_BACKEND = API_URL

  const socket = useSocket();


  const location = useLocation();

  // =====================================================
  // 1. Obtener lista de chats del usuario
  // =====================================

  // Obtener datos del usuario autenticado (nombre + foto)
  useEffect(() => {
    authFetch(`${API_BACKEND}/users/${decodedToken.sub}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setAuthUser(data); })
      .catch((err) => console.error('Error fetching user:', err));
  }, []);

  useEffect(() => {
    authFetch(`${API_BACKEND}/chats/list/${decodedToken.sub}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setChatList(data);

        // Auto-select chat if navigating from dashboard
        const targetId = location.state?.targetUserId;
        if (targetId) {
          const found = data.find(c => Number(c.other_user_id) === Number(targetId));
          if (found) {
            setSelectedMatch(found);
            // Limpiar el state para no re-seleccionar al recargar si no se quiere
            // window.history.replaceState({}, document.title)
          }
        }
      });
  }, [decodedToken.sub]);

  // =====================================================
  // 2. Al seleccionar un chat → unirme a la sala + cargar mensajes
  // =====================================================
  useEffect(() => {
    if (!selectedMatch || !socket) return;

    socket.emit("joinRoom", Number(selectedMatch.match_id));



    authFetch(`${API_BACKEND}/chats/${selectedMatch.match_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
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

      const res = await authFetch(
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
      setAlertState({
        isOpen: true,
        type: "error",
        message: err.message
      });
    }
  };

  // =====================================================
  // 8. Reportar usuario
  // =====================================================
  const handleReportUser = async () => {
    if (!selectedMatch) return;

    const confirmReport = window.confirm(
      translations[language].chatModule.confirmReport
    );
    if (!confirmReport) return;

    try {
      // 1. Reportar al usuario
      const res = await authFetch(
        `${API_BACKEND}/users/report/${selectedMatch.other_user_id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al reportar usuario");
      }

      // 2. Eliminar el match para evitar reportes múltiples del mismo usuario
      const user1 = Number(decodedToken.sub);
      const user2 = Number(selectedMatch.other_user_id);

      await authFetch(
        `${API_BACKEND}/matches/deleteMatch?user_1=${user1}&user_2=${user2}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 3. Actualizar la UI
      setChatList((prev) =>
        prev.filter((c) => c.match_id !== selectedMatch.match_id)
      );

      setSelectedMatch(null);
      setMessages([]);
      setShowConfigMenu(false);

      setAlertState({
        isOpen: true,
        type: "success",
        message: translations[language].chatModule.reportSuccess
      });
    } catch (err) {
      setAlertState({
        isOpen: true,
        type: "error",
        message: err.message
      });
    }
  };

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await authFetch(
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
        localStorage.setItem("theme", !data.theme ? "dark" : "light");
        setLanguage(data.language_code);
      } catch (error) {
        console.error("Error cargando preferencias:", error);
      }
    };

    fetchPreferences();
  }, []);


  if (!socket) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        Conectando con el servidor...
      </div>
    );
  }

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
                    src={getAvatarUrl(chat.profile_photo)}
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
                      src={getAvatarUrl(selectedMatch?.profile_photo)}
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
                        onClick={() => {
                          // Emitir callRequest con datos del caller ANTES de navegar
                          if (socket && selectedMatch) {
                            socket.emit("callRequest", {
                              matchId: Number(selectedMatch.match_id),
                              caller: {
                                userId: Number(decodedToken.sub),
                                userName: `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim() || 'Usuario',
                                userPhoto: authUser.profile_photo || null,
                              },
                              targetUserId: Number(selectedMatch.other_user_id),
                            });
                          }
                          navigate(`/videocall/${selectedMatch.match_id}`, {
                            state: { selectedMatch },
                          });
                        }}
                      >
                        📞 {translations[language].chatModule.startACall}
                      </p>

                      <p className="danger" onClick={handleDeleteMatch}>
                        ❌ {translations[language].chatModule.deleteMatch}
                      </p>
                      <p className="danger" onClick={handleReportUser}>
                        ⚠️ {translations[language].chatModule.reportUser}
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

        <NavBar language={language} />

      </div>

      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        type={alertState.type}
        message={alertState.message}
        language={language}
      />
    </>

  );
}
