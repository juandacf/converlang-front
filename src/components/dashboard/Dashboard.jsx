import "./Dashboard.css";
import { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";
import { authFetch } from "../../config/authFetch";
import { Translations } from "../../translations/translations";
import { io } from "socket.io-client";
import { CustomAlert } from "../common/CustomAlert";
import { Footer } from "../common/Footer";
import { getAvatarUrl } from "../../utils/avatarUtils";
import { CalendarCard } from "./CalendarCard";
import { ConfirmModal } from "../common/ConfirmModal";
import { Bell, Settings, AlignJustify } from 'lucide-react'; // Assuming lucide-react is available, or use images if not




const API_STATISTICS = "http://localhost:4000/datachart";
const API_BACKEND = API_URL
const translations = Translations

export function Dashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [authUser, setAuthUser] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("ES");
  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: "success",
    message: ""
  });

  // Estados para notificaciones
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Estado para ConfirmModal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    matchId: null
  });

  // Refs para detectar clic fuera
  const notificationRef = useRef(null);
  const settingsRef = useRef(null);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const Navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  useEffect(() => {
    const controller = new AbortController();

    authFetch(`${API_BACKEND}/users/${decodedToken.sub}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((r) => {
        if (!r.ok) {
          console.error('Error fetching user data:', r.status, r.statusText);
          throw new Error(`HTTP ${r.status}`);
        }
        return r.json();
      })
      .then((json) => {
        setAuthUser(json);

        if (json.profile_photo) {
          setPhotoPreview(getAvatarUrl(json.profile_photo));
        }
      })
      .catch((err) => console.error('User fetch error:', err.message));
  }, []);

  // ── Heartbeat: reportar que el usuario está activo en su dashboard ──
  useEffect(() => {
    const sendHeartbeat = async () => {
      const t = localStorage.getItem('token');
      if (!t) return;
      try {
        await authFetch(`${API_BACKEND}/auth/heartbeat`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${t}` }
        });
      } catch (e) { /* silencioso — no interrumpir UX si falla */ }
    };
    sendHeartbeat(); // enviar inmediatamente al montar
    const interval = setInterval(sendHeartbeat, 60000); // cada 60s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    authFetch(`${API_BACKEND}/users/getCurrentMatches/${decodedToken.sub}`, {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((r) => {
        if (!r.ok) {
          console.error('Error fetching matches:', r.status, r.statusText);
          throw new Error(`HTTP ${r.status}`);
        }
        return r.json();
      })
      .then((json) => {
        const userData = Array.isArray(json) ? json : json.users ?? [];
        setUsers(userData);
      })
      .catch((err) => console.error('Matches fetch error:', err.message));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    authFetch(`${API_BACKEND}/call/${decodedToken.sub}`, {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const userStatistics = Array.isArray(json) ? json : json.users ?? [];
        setSessions(userStatistics);
      })
      .catch((err) => console.error(err.message));

    return () => controller.abort();
  }, []);

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
        setLanguage(data.language_code);
      } catch (error) {
        console.error("Error cargando preferencias:", error);
      }
    };

    fetchPreferences();
  }, []);

  // Cargar notificaciones
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await authFetch(
          `${API_BACKEND}/notifications/${decodedToken.sub}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.is_read).length);
        }
      } catch (error) {
        console.error("Error cargando notificaciones:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Conexión WebSocket para notificaciones en tiempo real
  useEffect(() => {
    const socket = io(API_BACKEND, {
      auth: {
        token: token
      }
    });

    socket.emit('joinNotifications', decodedToken.sub);

    socket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => socket.disconnect();
  }, []);

  // Formatear tiempo relativo
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
  };

  // Manejar click en notificación
  const handleNotificationClick = async (notification) => {
    // Marcar como leída
    try {
      await authFetch(
        `${API_BACKEND}/notifications/${notification.notification_id}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(n =>
          n.notification_id === notification.notification_id
            ? { ...n, is_read: true }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marcando notificación:", error);
    }

    // Si es notificación de like, redirigir a match con highlight
    if (notification.notification_type === 'like_request') {
      localStorage.setItem('highlightUser', notification.related_entity_id);
      Navigate('/matchUser');
    }

    setShowNotifications(false);
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      const res = await authFetch(
        `${API_BACKEND}/notifications/${decodedToken.sub}/read-all`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marcando todas las notificaciones como leídas:", error);
    }
  };

  const handleDeleteMatchClick = (matchedUserId) => {
    setConfirmModal({
      isOpen: true,
      matchId: matchedUserId
    });
  };

  const confirmDeleteMatch = async () => {
    const matchedUserId = confirmModal.matchId;
    if (!matchedUserId) return;

    // Cerrar modal inmediatamente
    setConfirmModal({ isOpen: false, matchId: null });

    const user1 = decodedToken.sub;
    const user2 = matchedUserId;

    try {
      const response = await authFetch(
        `${API_BACKEND}/matches/deleteMatch?user_1=${user1}&user_2=${user2}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("BACKEND ERROR:", text);
        throw new Error(text || "Error al eliminar el match");
      }

      // actualizar UI
      setUsers((prev) =>
        prev.filter((u) => u.matched_user_id !== matchedUserId)
      );

      setAlertState({
        isOpen: true,
        type: "success",
        message: "Match eliminado correctamente"
      });

    } catch (err) {
      setAlertState({
        isOpen: true,
        type: "error",
        message: err.message
      });
    }
  };
  translations[language].dashboard.matchSection.deleteMatchWarning


  return (
    <>
      <div className={darkMode ? "dark-mode" : ""}>
        <NavBar />
        <div className="dashboardMainContainer">

          <div className="dashboard-content-wrapper">
            <div className="greetingContainer">
              <div className="header-left-actions">
                <div className="ios-toggle-switch">
                  <div className="toggle-handle"></div>
                </div>
              </div>

              <div className="greeting-center">
                <div className="UserPic">
                  <img
                    className="actualPic"
                    src={photoPreview || "../../../public/assets/user.png"}
                    alt=""
                  />
                </div>
                <div className="greeting-text">
                  <h3 className="bigGreeting">
                    {translations[language].dashboard.mainBox.greeting} {authUser.first_name} {authUser.last_name}
                  </h3>
                  <h3 className="smallGreeting">{translations[language].dashboard.mainBox.letUsBegin}</h3>
                </div>
              </div>

              <div className="header-right-actions">
                <div className="notificationWrapper" ref={notificationRef}>
                  <img
                    className="navBarElement"
                    src="../../../public/assets/notification.png"
                    alt="notifications"
                    onClick={() => {
                      const nextShow = !showNotifications;
                      setShowNotifications(nextShow);
                      if (nextShow && unreadCount > 0) {
                        handleMarkAllAsRead();
                      }
                    }}
                  />
                  {unreadCount > 0 && (
                    <span className="notificationBadge">{unreadCount}</span>
                  )}
                  {showNotifications && (
                    <div className="notificationsPanel">
                      <div className="notificationsPanelHeader">
                        <h4 className="notificationsPanelTitle">
                          {translations[language].notifications.title || 'Notificaciones'}
                        </h4>
                        <button className="closeNotificationsBtn" onClick={(e) => { e.stopPropagation(); setShowNotifications(false); }}>✕</button>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="noNotifications">{translations[language]?.dashboard?.notifications?.empty || 'No tienes notificaciones'}</p>
                      ) : (
                        notifications.slice(0, 10).map((notif) => (
                          <div key={notif.notification_id} className="notificationItem" onClick={() => handleNotificationClick(notif)}>
                            <p className="notificationTitle">{notif.title}</p>
                            <p className="notificationMessage">{notif.message}</p>
                            <span className="notificationTime">{formatTimeAgo(notif.created_at)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="settingsWrapper" ref={settingsRef}>
                  <img
                    className="navBarElement"
                    src="../../../public/assets/setting.png"
                    alt="settings"
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  />
                  {showSettingsMenu && (
                    <div className="settingsMenu">
                      <p onClick={() => Navigate('/editProfile')}>{translations[language].dashboard.settingMenu.editProfile}</p>
                      <p onClick={() => Navigate('/preferences')}>{translations[language].dashboard.settingMenu.preferences}</p>
                      <p onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/";
                      }}>{translations[language].dashboard.settingMenu.logOut}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="recentMatchContainer">
              <h3 className="recentMatchTitle">{translations[language].dashboard.matchSection.recentMatches}</h3>
              <div className="recentMatchItems">
                {users.map((u) => (
                  <div
                    className="recentMatch"
                    key={u.matched_user_id}
                    onClick={() => Navigate('/userChat', { state: { targetUserId: u.matched_user_id } })}
                    style={{ cursor: 'pointer' }}
                  >


                    <button
                      className="deleteMatchBtn"
                      onClick={() => handleDeleteMatchClick(u.matched_user_id)}
                    >
                      ✕
                    </button>

                    <img
                      className="matchPhoto"
                      src={getAvatarUrl(u.profile_photo)}
                      alt=""
                    />
                    <p>{u.first_name}</p>
                    <p>{u.last_name}</p>
                  </div>
                ))}
              </div>

            </div>
            <div className="dashboard-grid-3">
              {/* 1. MATCH CTA CARD */}
              <div className="grid-card match-cta-card">
                <div className="match-content">
                  <button className="matchButtonLarge" onClick={() => Navigate('/matchUser')}>
                    Match <span style={{ fontSize: '1.5rem' }}>♥</span>
                  </button>
                </div>
              </div>

              {/* 2. STATISTICS CARD */}
              <div className="grid-card stats-card ios-card">
                <div className="carrouselTitle">
                  {translations[language].dashboard.servicesSection.sessionsGraphicTitle}
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={sessions}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sesiones"
                      stroke="url(#colorGradient)" /* We will define gradient below or just solid */
                      strokeWidth={4}
                      dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 3. CALENDAR CARD */}
              <div className="grid-card">
                <CalendarCard />
              </div>
            </div>
          </div>
        </div>
        <Footer language={language} darkMode={darkMode} />
      </div >

      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        type={alertState.type}
        message={alertState.message}
        language={language}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, matchId: null })}
        onConfirm={confirmDeleteMatch}
        message={translations[language].dashboard.matchSection.deleteMatchWarning}
      />
    </>
  );
}

export function NavBar() {
  return (
    <nav className="navBar">
      <a href="/dashboard" className="navItem" title="Ir al Inicio">
        <img
          src="../../../public/assets/home.png"
          alt="Home"
          className="navBarImage"
        />
        <span className="navLabel">Home</span>
      </a>
      <a href="/matchUser" className="navItem" title="Buscar personas para practicar">
        <img
          src="../../../public/assets/friend-request.png"
          alt="Match"
          className="navBarImage"
        />
        <span className="navLabel">Match</span>
      </a>
      <a href="/userChat" className="navItem" title="Ver tus mensajes">
        <img
          src="../../../public/assets/messages.png"
          alt="Messages"
          className="navBarImage"
        />
        <span className="navLabel">Messages</span>
      </a>
      <a href="" className="navItem" title="Tus notas personales">
        <img
          src="../../../public/assets/sticky-note.png"
          alt="Notes"
          className="navBarImage"
        />
        <span className="navLabel">Notes</span>
      </a>
    </nav>
  );
}
