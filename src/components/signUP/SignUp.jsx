import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  MessageCircle,
  Lock,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";
import "./SignUp.css";
import { API_URL } from "../../config/api";

export function SignUp({ onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birth_date: "",
    country_id: "",
    gender_id: "",
    role_code: "",
    native_lang_id: "",
    target_lang_id: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([])
  const [languages, setLanguages] = useState([])
  const [genders, setGenders] = useState([])
  const API_BACKEND = API_URL


  useEffect(() => {  //Traemos los países de la bdd
    fetch(`${API_BACKEND}/countries`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener los países");
        console.log(res.body)
        return res.json();
      })
      .then((data) => setCountries(data))
      .catch((error) => console.error(error))
  }, []);


  useEffect(() => {
    fetch(`${API_BACKEND}/languages`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener los lenguajes");
        console.log(res.body)
        return res.json();
      })
      .then((data) => setLanguages(data))
      .catch((error) => console.error(error))
  }, []);

  useEffect(() => {
    fetch(`${API_BACKEND}/gender-type`)
      .then((res) => {
        if (!res.ok) { throw new Error("Error al obtener los géneros") }
        return res.json();
      }
      )
      .then((data) => setGenders(data))
      .catch((error) => console.error(error))
  }, []
  )

  const roles = [
    { value: "user", label: "Usuario" },
  ];

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.first_name) newErrors.first_name = "Nombre requerido";
      if (!formData.last_name) newErrors.last_name = "Apellido requerido";
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        newErrors.email = "Correo inválido";
      if (formData.password.length < 8)
        newErrors.password = "Mínimo 8 caracteres";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    if (currentStep === 2) {
      if (!formData.birth_date) newErrors.birth_date = "Requerido";
      if (!formData.country_id) newErrors.country_id = "Selecciona un país";
      if (!formData.role_code) newErrors.role_code = "Selecciona un rol"; // 👈 validación
    }
    if (currentStep === 3) {
      if (!formData.native_lang_id)
        newErrors.native_lang_id = "Idioma nativo requerido";
      if (!formData.target_lang_id)
        newErrors.target_lang_id = "Idioma objetivo requerido";
      if (
        formData.native_lang_id &&
        formData.target_lang_id &&
        formData.native_lang_id === formData.target_lang_id
      ) {
        newErrors.target_lang_id = "Debe ser diferente al idioma nativo";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    const userData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      birth_date: formData.birth_date,
      country_id: formData.country_id,
      gender_id: Number(formData.gender_id),
      role_code: formData.role_code,
      native_lang_id: formData.native_lang_id,
      target_lang_id: formData.target_lang_id,
      description: formData.description || "No especificado",
    };

    try {
      const res = await fetch(`${API_BACKEND}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al crear cuenta");

      alert("¡Cuenta creada con éxito!");
      onSuccess(); // 👈 Llama a la función del padre
    } catch (err) {
      console.error("Error al crear cuenta:", err);
      alert(err.message);
    }
  };

  return (
    <div className="SignUpContainer">
      <h3>Registro</h3>

      {/* Paso 1 */}
      {currentStep === 1 && (
        <div className="signUpForm">
          <div>
            <label>Nombre</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
            />
            {errors.first_name && <p className="error">{errors.first_name}</p>}
          </div>
          <div>
            <label>Apellido</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
            />
            {errors.last_name && <p className="error">{errors.last_name}</p>}
          </div>
          <div>
            <label>
              <Mail size={14} className="icon" /> Correo
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>
          <div>
            <label>
              <Lock size={14} className="icon" /> Contraseña
            </label>
            <div className="passwordField">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          <div>
            <label>Confirmar contraseña</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleChange("confirmPassword", e.target.value)
              }
            />
            {errors.confirmPassword && (
              <p className="error">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      )}

      {/* Paso 2 */}
      {currentStep === 2 && (
        <div className="signUpForm">
          <div>
            <label>
              <Calendar size={14} className="icon" /> Fecha de nacimiento
            </label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => handleChange("birth_date", e.target.value)}
            />
            {errors.birth_date && <p className="error">{errors.birth_date}</p>}
          </div>
          <div>
            <label>
              <MapPin size={14} className="icon" /> País
            </label>
            <select
              value={formData.country_id}
              onChange={(e) => handleChange("country_id", e.target.value)}
            >
              <option value="">Selecciona</option>
              {countries.map((c) => (
                <option key={c.country_code} value={c.country_code}>
                  {c.country_name}
                </option>
              ))}
            </select>
            {errors.country_id && <p className="error">{errors.country_id}</p>}
          </div>
          <div>
            <label>Género</label>
            <select
              value={formData.gender_id}
              onChange={(e) => handleChange("gender_id", e.target.value)}
            >
              <option value="">Prefiero no decir</option>
              {genders.map((g) => (
                <option key={g.gender_id} value={g.gender_id}>
                  {g.gender_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Rol</label>
            <select
              value={formData.role}
              onChange={(e) => handleChange("role_code", e.target.value)}
            >
              <option value="">Selecciona tu rol</option>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {errors.role_code && <p className="error">{errors.role_code}</p>}
          </div>
        </div>
      )}

      {/* Paso 3 */}
      {currentStep === 3 && (
        <div className="signUpForm">
          <div>
            <label>Idioma nativo</label>
            <select
              value={formData.native_lang_id}
              onChange={(e) =>
                handleChange("native_lang_id", e.target.value)
              }
            >
              <option value="">Selecciona</option>
              {
                languages.map((l) => (
                  <option key={l.language_code} value={l.language_code}>
                    {l.language_name}
                  </option>
                ))}
            </select>
            {errors.native_lang_id && (
              <p className="error">{errors.native_lang_id}</p>
            )}
          </div>
          <div>
            <label>Idioma a aprender</label>
            <select
              value={formData.target_lang_id}
              onChange={(e) =>
                handleChange("target_lang_id", e.target.value)
              }
            >
              <option value="">Selecciona</option>
              {languages
                .filter((l) => l.language_code !== formData.native_lang_id)
                .map((l) => (
                  <option key={l.language_code} value={l.language_code}>
                    {l.language_name}
                  </option>
                ))}
            </select>
            {errors.target_lang_id && (
              <p className="error">{errors.target_lang_id}</p>
            )}
          </div>
          <div>
            <label>Sobre ti</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                handleChange("description", e.target.value)
              }
              placeholder="Cuéntanos algo..."
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Botones navegación */}
      <div className="navButtons">
        {currentStep > 1 && (
          <button type="button" onClick={prevStep} className="secondaryBtn">
            <ChevronLeft size={14} /> Anterior
          </button>
        )}
        {currentStep < 3 ? (
          <button type="button" onClick={nextStep} className="primaryBtn">
            Siguiente <ChevronRight size={14} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} className="primaryBtn">
            Crear cuenta <MessageCircle size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
