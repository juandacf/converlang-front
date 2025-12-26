import { useState, useEffect, useMemo } from "react";
import { NavBar, Footer } from "../dashboard/Dashboard";
import "./MatchTeacher.css";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../../config/api";
import { Translations } from "../../translations/translations";


const API_USERS = "http://localhost:4000/users";
const PAGE_SIZE = 6;
const translations = Translations;

export function MatchTeacher() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("ES");

    const API_BACKEND = API_URL
    const token = localStorage.getItem("token");
    const decodedToken = jwtDecode(token);

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
        setPage(1); // resetea a la primera página cuando llegan datos
      })
      .catch((err) => console.log(err.message));
    return () => controller.abort();
  }, []);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = useMemo(() => users.slice(start, start + PAGE_SIZE), [users, start]);

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

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
          <img className="arrow" src="../../../public/assets/left-arrow.png" alt="Volver" />
        </a>
        <div className="matchMainTitlet">
          <h1 className="mainTitlet">             {translations[language].teacherMatchModule.teacherModuleTitle}</h1>
        </div>
      </div>

      <div className="matchMainContainer">
        {pageItems.map((u, i) => (
          <div
            className="potentialMatchContainer"
            key={u.id ?? u._id ?? `${start + i}`}
          >
            <div className="photoNameContainer">
              <div className="photoContainer">
                <img src="../../../public/assets/mi_pic.png" alt="" className="matchPhotoo" />
              </div>
              <div className="matchName">
                <p className="userName">{u.first_name} {u.last_name}($25)</p>
              </div>
            </div>
            <div className="userDescriptionContainer">
              <h3 className="userTitle">Título</h3>
              <p className="userDescription"> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean nisl nisl, blandit vel elit et. </p>
            </div>
            <div className="connectRateContainer">
              <div className="rateContainer">
                <p className="ratingNumber">5.9</p>
                <img src="../../../public/assets/star.png" alt="" className="star" />
              </div>
              <button className="connectButtont">
                <p className="buttonText">             {translations[language].teacherMatchModule.hireButton}</p>
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
