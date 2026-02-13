import "./Dashboard.css";
import { useState, useEffect } from "react";
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
import { Translations } from "../../translations/translations";
import { io } from "socket.io-client";



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

  // Estados para notificaciones
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const Navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BACKEND}/users/${decodedToken.sub}`, {
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
          setPhotoPreview(`${API_BACKEND}${json.profile_photo}`);
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
        await fetch(`${API_BACKEND}/auth/heartbeat`, {
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

    fetch(`${API_BACKEND}/users/getCurrentMatches/${decodedToken.sub}`, {
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

    fetch(`${API_BACKEND}/call/${decodedToken.sub}`, {
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
      .catch((err) => console.log(err.message));

    return () => controller.abort();
  }, []);

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

  // Cargar notificaciones
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
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
    const socket = io(API_BACKEND);

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
      await fetch(
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

  const handleDeleteMatch = async (matchedUserId) => {
    const confirmDelete = window.confirm(
      translations[language].dashboard.matchSection.deleteMatchWarning
    );
    if (!confirmDelete) return;

    const user1 = decodedToken.sub;
    const user2 = matchedUserId;

    try {
      const response = await fetch(
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
    } catch (err) {
      alert(err.message);
    }
  };
  translations[language].dashboard.matchSection.deleteMatchWarning

  console.log(sessions)
  return (
    <>
      <div className={darkMode ? "dark-mode" : ""}>
        <NavBar />
        <div className="dashboardMainContainer">
          <div className="dashNavBar">
            <div className="notificationWrapper">
              <img
                className="navBarElement"
                src="../../../public/assets/notification.png"
                alt="notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              />
              {unreadCount > 0 && (
                <span className="notificationBadge">{unreadCount}</span>
              )}

              {showNotifications && (
                <div className="notificationsPanel">
                  <div className="notificationsPanelHeader">
                    <h4 className="notificationsPanelTitle">
                      {translations[language]?.dashboard?.notifications?.title || 'Notificaciones'}
                    </h4>
                    <button
                      className="closeNotificationsBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNotifications(false);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="noNotifications">
                      {translations[language]?.dashboard?.notifications?.empty || 'No tienes notificaciones'}
                    </p>
                  ) : (
                    notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.notification_id}
                        className={`notificationItem ${!notif.is_read ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <p className="notificationTitle">{notif.title}</p>
                        <p className="notificationMessage">{notif.message}</p>
                        <span className="notificationTime">
                          {formatTimeAgo(notif.created_at)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

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
          <div className="greetingContainer">
            <div className="UserPic">
              <img
                className="actualPic"
                src={photoPreview || "../../../public/assets/user.png"}
                alt=""
              />
            </div>
            <div className="greeting">
              <h3 className="bigGreeting">
                {translations[language].dashboard.mainBox.greeting} {authUser.first_name + " " + authUser.last_name}
              </h3>
              <h3 className="smallGreeting">{translations[language].dashboard.mainBox.letUsBegin}</h3>
            </div>
          </div>
          <div className="recentMatchContainer">
            <h3 className="recentMatchTitle">{translations[language].dashboard.matchSection.recentMatches}</h3>
            <div className="recentMatchItems">
              {users.map((u) => (
                <div className="recentMatch" key={u.matched_user_id}>


                  <button
                    className="deleteMatchBtn"
                    onClick={() => handleDeleteMatch(u.matched_user_id)}
                  >
                    ✕
                  </button>

                  <img
                    className="matchPhoto"
                    src={
                      u.profile_photo
                        ? `${API_BACKEND}${u.profile_photo}`
                        : "../../../public/assets/user.png"
                    }
                    alt=""
                  />
                  <p>{u.first_name}</p>
                  <p>{u.last_name}</p>
                </div>
              ))}
            </div>

          </div>
          <div className="carrouselStatistics">
            <div className="carrouselContainer">
              <div className="carrouselTitle">{translations[language].dashboard.servicesSection.matchServiceTitle}</div>
              <div className="matchContainer">
                <div>
                  <a href="/matchUser">
                    {" "}
                    <button className="matchButton">{translations[language].dashboard.servicesSection.matchButton}</button>
                  </a>
                </div>
              </div>
            </div>

            <div className="carrouselContainer">
              <div className="carrouselTitle">
                {translations[language].dashboard.servicesSection.sessionsGraphicTitle}
              </div>
              <div className="matchContainer matchStatistics">
                <ResponsiveContainer
                  className="recentSessions"
                  width="90%"
                  height={150}
                >
                  <LineChart data={sessions}>
                    <CartesianGrid stroke="#D88484FF" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="sesiones"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div></div>
              </div>
            </div>
            <div className="carrouselContainer">
              <div className="carrouselTitle">{translations[language].dashboard.servicesSection.hireATeacherTitle}</div>
              <div className="matchContainer">
                <div>
                  <a href="/matchTeacher">
                    {" "}
                    <button className="matchButton buttonPremium">{translations[language].dashboard.servicesSection.premium}</button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export function NavBar() {
  return (
    <nav className="navBar">
      <a href="/dashboard">
        {" "}
        <img
          src="../../../public/assets/home.png"
          alt="connect"
          className="navBarImage"
        />
      </a>
      <a href="/matchUser">
        {" "}
        <img
          src="../../../public/assets/friend-request.png"
          alt="connect"
          className="navBarImage"
        />
      </a>
      <a href="/userChat">
        <img
          src="../../../public/assets/messages.png"
          alt="connect"
          className="navBarImage"
        />{" "}
      </a>
      <a href="">
        <img
          src="../../../public/assets/sticky-note.png"
          alt="connect"
          className="navBarImage"
        />
      </a>
    </nav>
  );
}

export function Footer() {

  const [language, setLanguage] = useState("ES");
  const [darkMode, setDarkMode] = useState(false);
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
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

  return (
    <footer className="footerContainer">
      <div className="footerSection" id="socialMedia">
        <a href="" className="socialMediaLink">
          <img
            src="../../../public/assets/twitter.png"
            alt=""
            className="socialMediaIcon"
          />
        </a>
        <a href="" className="socialMediaLink">
          <img
            src="../../../public/assets/instagram.png"
            alt=""
            className="socialMediaIcon"
          />
        </a>
        <a href="" className="socialMediaLink">
          <img
            src="../../../public/assets/linkedin.png"
            alt=""
            className="socialMediaIcon"
          />
        </a>
        <a href="" className="socialMediaLink">
          <img
            src="../../../public/assets/youtube.png"
            alt=""
            className="socialMediaIcon"
          />
        </a>
      </div>
      <div className="aboutUs footerSection">
        <h3>{translations[language].dashboard.footer.aboutUs}</h3>
        <p>{translations[language].dashboard.footer.mission}</p>
        <p>{translations[language].dashboard.footer.efficacy}</p>
      </div>
      <div className="helpSupport footerSection">
        <h3>{translations[language].dashboard.footer.helpAndSupport}</h3>
        <p>{translations[language].dashboard.footer.contact}</p>
        <p>{translations[language].dashboard.footer.helpAndSupport}</p>
      </div>
      <div className="termsPrivacy footerSection">
        <h3>{translations[language].dashboard.footer.termsAndPrivacy}</h3>
        <p>{translations[language].dashboard.footer.communityBlog}</p>
        <p>{translations[language].dashboard.footer.tems}</p>
      </div>
    </footer>
  );
}
