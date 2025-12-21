import { useState, useEffect, useMemo } from "react";
import { NavBar, Footer } from "../dashboard/Dashboard";
import "./MatchUser.css";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../../config/api";

export function MatchUser() {
  const [users, setUsers] = useState([]);
  const [disappearing, setDisappearing] = useState({});
  const [page, setPage] = useState(1);
    const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("ES");

  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const API_BACKEND = API_URL

  const API_USERS = `${API_BACKEND}/users/potentialMatches/${decodedToken.sub}`;
  const API_SEND_LIKE = `${API_BACKEND}/matches/createLike`;

  const PAGE_SIZE = 6;

  // ---- FETCH USERS ----
  useEffect(() => {
    const controller = new AbortController();

    fetch(API_USERS, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const userData = Array.isArray(json) ? json : json.users ?? [];
        setUsers(userData);
        setPage(1);
      })
      .catch((err) => console.log(err.message));

    return () => controller.abort();
  }, []);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;

  const pageItems = useMemo(
    () => users.slice(start, start + PAGE_SIZE),
    [users, start]
  );

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  // ---- HANDLE LIKE ----
  const handleLike = async (user2) => {
    try {
      const body = {
        user_1: decodedToken.sub,
        user_2: user2,
      };

      const res = await fetch(API_SEND_LIKE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      // activar animación
      setDisappearing((prev) => ({ ...prev, [user2]: true }));

      // esperar 300ms y eliminar la tarjeta
      setTimeout(() => {
        setUsers((prev) => prev.filter((u) => u.id_user !== user2));
      }, 300);
    } catch (err) {
      console.error("Error enviando like:", err.message);
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

  return (
    <div className={darkMode ? "dark-mode" : ""}>
    <div className="mainContainer">
      <NavBar />

      <div className="matchHeader">
        <a className="goBackContainer" href="/dashboard">
          <img
            className="arrow"
            src="../../../public/assets/left-arrow.png"
            alt="Volver"
          />
        </a>
        <div className="matchMainTitle">
          <h1 className="mainTitle">¡Hagamos Match!</h1>
        </div>
      </div>

      <div className="matchMainContainer">
        {pageItems.map((u) => (
          <div
            className={`potentialMatchContainer ${
              disappearing[u.id_user] ? "fadeOut" : ""
            }`}
            key={u.id_user}
            id={u.id_user}
          >
            <div className="photoNameContainer">
              <div className="photoContainer">
                <img
                  src={u.profile_photo ? `${API_BACKEND}${u.profile_photo}`: "../../../public/assets/user.png" }
                  alt=""
                  className="matchPhotoo"
                />
              </div>
              <div className="matchName">
                <p className="userName">
                  {u.first_name} {u.last_name} {`(${u.age})`}
                </p>
              </div>
            </div>

            <div className="userDescriptionContainer">
              <p className="userDescription">{u.description}</p>
            </div>

            <div className="connectRateContainer">
              <div className="rateContainer">
                <p className="ratingNumber">{u.country_id}</p>
                <img
                  src={
                    u.country_id
                      ? `../../../public/assets/flag_pics/${u.country_id}.png`
                      : `../../../public/assets/flag_picslanguages.png`
                  }
                  alt=""
                  className="star"
                />
              </div>

              <button
                className="connectButton"
                onClick={() => handleLike(u.id_user)}
              >
                <p className="buttonText">Match</p>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          className="pageBtn"
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          aria-label="Anterior"
        >
          ‹
        </button>

        <span className="pageInfo">
          Página {page} de {totalPages}
        </span>

        <button
          className="pageBtn"
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>

      <Footer />
    </div>
    </div>
  );
}
