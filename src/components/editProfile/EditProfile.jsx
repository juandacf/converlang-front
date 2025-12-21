import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { NavBar } from "../dashboard/Dashboard";
import "./editProfile.css";
import { API_URL } from "../../config/api";

export function EditProfile() {
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const [languages, setLanguages] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("ES");
  const API_BACKEND = API_URL
 

  const editableFields = [
    "first_name",
    "last_name",
    "email",
    "gender_id",
    "birth_date",
    "country_id",
    "native_lang_id",
    "target_lang_id",
    "description",
    "bank_id",
  ];

  async function handleDeletePhoto() {
    const res = await fetch(
      `${API_BACKEND}/users/photo/${decodedToken.sub}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      alert("Error al eliminar la foto");
      return;
    }

    setPhotoPreview(null);
    setForm({ ...form, profile_photo: null });

    alert("Foto eliminada!");
  }

  const initialForm = editableFields.reduce(
    (acc, field) => {
      acc[field] = "";
      return acc;
    },
    { match_quantity: 10 }
  );

   const [form, setForm] = useState(initialForm);

  // Cargar usuario
  useEffect(() => {
    fetch(`${API_BACKEND}/users/${decodedToken.sub}`)
      .then((r) => r.json())
      .then((data) => {
        const filtered = {};
        editableFields.forEach((field) => {
          filtered[field] = data[field] ?? "";
        });

        filtered.match_quantity = 10;
        setForm(filtered);

        // Vista previa de foto
        if (data.profile_photo) {
          setPhotoPreview(`${API_BACKEND}${data.profile_photo}`);
        }
      })
      .catch((err) => console.log(err));
  }, [decodedToken.sub]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  // Cargar lenguajes
  useEffect(() => {
    fetch(`${API_BACKEND}/languages`)
      .then((res) => res.json())
      .then((data) => setLanguages(data))
      .catch((error) => console.error(error));
  }, []);

  // Subir foto
  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    const res = await fetch(
      `${API_BACKEND}/users/photo/${decodedToken.sub}`,
      {
        method: "PATCH",
        body: formData,
      }
    );

    if (!res.ok) {
      alert("Error al subir la foto");
      return;
    }

    const json = await res.json();

    // Nueva foto
    setPhotoPreview(`${API_BACKEND}${json.path}`);
    setForm({ ...form, profile_photo: json.path });

    alert("Foto actualizada!");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const dataToSend = {};
    editableFields.forEach((field) => {
      dataToSend[field] = form[field];
    });

    dataToSend.match_quantity = 10;

    const res = await fetch(`${API_BACKEND}/users/${decodedToken.sub}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (!res.ok) {
      alert("Error al actualizar");
      return;
    }

    alert("Perfil actualizado!");
  }
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
    <>
    <div className={darkMode ? "dark-mode" : ""}>
      <NavBar />
      <div className="preferencesContainer">
        <h2 className="title">Modificar Perfil</h2>

        <form className="preferencesCard" onSubmit={handleSubmit}>
          <img
            src={photoPreview}
            className="profilePhotoPreview"
          />

          <div className="inputGroup fullWidth">
            <label>Cambiar foto</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </div>
          {photoPreview && (
            <button
              type="button"
              className="deletePhotoBtn"
              onClick={handleDeletePhoto}
            >
              Eliminar foto
            </button>
          )}

          <div className="inputGroup">
            <label>Nombre</label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
            />
          </div>

          <div className="inputGroup">
            <label>Apellido</label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
            />
          </div>

          <div className="inputGroup">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="inputGroup">
            <label>Idioma nativo</label>
            <select
              name="native_lang_id"
              value={form.native_lang_id}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              {languages.map((l) => (
                <option key={l.language_code} value={l.language_code}>
                  {l.language_name}
                </option>
              ))}
            </select>
          </div>

          <div className="inputGroup">
            <label>Idioma a aprender</label>
            <select
              name="target_lang_id"
              value={form.target_lang_id}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              {languages
                .filter((l) => l.language_code !== form.native_lang_id)
                .map((l) => (
                  <option key={l.language_code} value={l.language_code}>
                    {l.language_name}
                  </option>
                ))}
            </select>
          </div>

          <div className="inputGroup">
            <label>Fecha de nacimiento</label>
            <input
              type="date"
              name="birth_date"
              value={form.birth_date?.split("T")[0] || ""}
              readOnly
            />
          </div>

          <div className="inputGroup">
            <label>Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <button className="saveBtn" type="submit">
            Guardar cambios
          </button>
        </form>
      </div>
      </div>
    </>
  );
}
