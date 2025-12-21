import { useEffect, useState } from "react";
import "./Preferences.css";
import { NavBar } from "../dashboard/Dashboard";
import { API_URL } from "../../config/api";
import { jwtDecode } from "jwt-decode";

export default function UserPreferencesCard() {
  // 🌙 Frontend: true = dark mode
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("ES");
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState([]);

  const API_BACKEND = API_URL;

  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const user_id = decodedToken.sub;

    useEffect(() => {
    fetch(`${API_BACKEND}/languages`)
      .then((res) => res.json())
      .then((data) => setLanguages(data))
      .catch((error) => console.error(error));
  }, []);


  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch(
          `${API_BACKEND}/preferences/${user_id}`,
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
  }, [API_BACKEND, user_id, token]);

  /* ======================================================
     Guardar preferencias
  ====================================================== */
  const handleSave = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BACKEND}/preferences/${user_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            theme: !darkMode, // frontend → backend
            languageCode: language,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      alert("Preferencias actualizadas correctamente");
    } catch (error) {
      console.error("Error guardando preferencias:", error);
      alert("No se pudieron guardar las preferencias");
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     UI
  ====================================================== */
  return (
    <div className="PreferencesContainer">
      <div className="preferences-card">
        <div className="preferences-header">
          <h2>Preferencias</h2>
          <p>Personaliza tu experiencia</p>
        </div>

        {/* 🌙 Tema oscuro */}
        <div className="preferences-row">
          <div>
            <span className="label">Tema oscuro</span>
            <span className="sub-label">
              Cambia el aspecto de la aplicación
            </span>
          </div>

          <button
            className={`toggle ${darkMode ? "active" : ""}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            <span className="toggle-circle" />
          </button>
        </div>

        {/* 🌍 Idioma */}
<div className="preferences-field">
  <label>Idioma</label>
  <select
    value={language}
    onChange={(e) => setLanguage(e.target.value)}
  >
    {languages.map((lang) => (
      <option
        key={lang.language_code}
        value={lang.language_code}
      >
        {lang.language_name}
      </option>
    ))}
  </select>
</div>


        <button
          className="save-button"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>

        <NavBar />
      </div>
    </div>
  );
}
