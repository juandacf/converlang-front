import { useState, useEffect, useMemo } from "react";
import { NavBar, Footer } from "../dashboard/Dashboard";
import "./MatchUser.css";
import { jwtDecode } from "jwt-decode";



export function MatchUser() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const API_USERS = `http://localhost:3000/users/potentialMatches/${decodedToken.sub}`;
  const PAGE_SIZE = 6;

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
        console.log(users)
        setPage(1); 
      })
      .catch((err) => console.log(err.message));
    return () => controller.abort();
  }, []);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = useMemo(() => users.slice(start, start + PAGE_SIZE), [users, start]);
  console.log(pageItems)

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="mainContainer">
      <NavBar />

      <div className="matchHeader">
        <a className="goBackContainer" href="/dashboard">
          <img className="arrow" src="../../../public/assets/left-arrow.png" alt="Volver" />
        </a>
        <div className="matchMainTitle">
          <h1 className="mainTitle">¡Hagamos Match!</h1>
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
                <p className="userName">{u.first_name} {u.last_name}(25)</p>
              </div>
            </div>
            <div className="userDescriptionContainer">
              <p className="userDescription"> {u.description} </p>
            </div>
            <div className="connectRateContainer">
              <div className="rateContainer">
                <p className="ratingNumber">{u.native_lang_id_out}</p>
                <img src="../../../public/assets/languages.png" alt="" className="star" />
              </div>
              <button className="connectButton">
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
  );
}
