import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { NavBar } from "../dashboard/Dashboard";
import "./editProfile.css";

export function EditProfile() {
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const [languages, setLanguages] = useState([]);

  // === CAMPOS EDITABLES (una sola fuente de verdad) ===
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

  // === Estado inicial basado en los campos editables ===
  const initialForm = editableFields.reduce(
    (acc, field) => {
      acc[field] = "";
      return acc;
    },
    { match_quantity: 10 }
  );

  const [form, setForm] = useState(initialForm);

  // === Cargar usuario desde backend y filtrar campos ===
  useEffect(() => {
    fetch(`http://localhost:3000/users/${decodedToken.sub}`)
      .then((r) => r.json())
      .then((data) => {
        const filtered = {};
        editableFields.forEach((field) => {
          filtered[field] = data[field] ?? "";
        });

        filtered.match_quantity = 10; // Forzado

        setForm(filtered);
      })
      .catch((err) => console.log(err));
  }, [decodedToken.sub]);

  // === Manejo de cambios ===
  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  // === Cargar catálogo de lenguajes ===
  useEffect(() => {
    fetch("http://localhost:3000/languages")
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener los lenguajes");
        return res.json();
      })
      .then((data) => setLanguages(data))
      .catch((error) => console.error(error));
  }, []);

  // === Enviar solo los campos válidos ===
  async function handleSubmit(e) {
    e.preventDefault();

    const dataToSend = {};

    editableFields.forEach((field) => {
      dataToSend[field] = form[field];
    });

    dataToSend.match_quantity = 10;



    const res = await fetch(
      `http://localhost:3000/users/${decodedToken.sub}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      }
    );

    if (!res.ok) {
      const errorMessage = await res.text();
      console.error(errorMessage);
      alert("Error al actualizar");
      return;
    }

    alert("Perfil actualizado!");
  }


  return (
    <>
      <NavBar />
      <div className="preferencesContainer">
        <h2 className="title">Modificar Perfil</h2>

        <form className="preferencesCard" onSubmit={handleSubmit}>
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
              <option value="">Selecciona tu idioma</option>
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
    className="disabledInput"
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
    </>
  );
}
