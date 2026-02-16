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
    role_code: "user",
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



  const getPasswordStrength = (password) => {
    if (!password) return { label: "", class: "" };
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (hasSpecialChars && password.length >= 8) return { label: "Alta", class: "strength-high" };
    if (password.length >= 8) return { label: "Media", class: "strength-medium" };
    return { label: "Baja", class: "strength-low" };
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.first_name) {
        newErrors.first_name = "Nombre requerido";
      } else if (formData.first_name.length < 3) {
        newErrors.first_name = "Mínimo 3 caracteres";
      }
      if (!formData.last_name) {
        newErrors.last_name = "Apellido requerido";
      } else if (formData.last_name.length < 3) {
        newErrors.last_name = "Mínimo 3 caracteres";
      }
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        newErrors.email = "Correo inválido";
      if (formData.password.length < 8)
        newErrors.password = "Mínimo 8 caracteres";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    if (currentStep === 2) {
      if (!formData.birth_date) {
        newErrors.birth_date = "Requerido";
      } else {
        const birthDate = new Date(formData.birth_date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
        if (age < 15) {
          newErrors.birth_date = "Debes tener al menos 15 años";
        } else if (age > 90) {
          newErrors.birth_date = "La edad máxima permitida es 90 años";
        }
      }
      if (!formData.country_id) newErrors.country_id = "Selecciona un país";
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
      if (!res.ok) {
        const errorMessage = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Error al crear cuenta";
        throw new Error(errorMessage);
      }

      alert("¡Cuenta creada con éxito!");
      onSuccess(); // 👈 Llama a la función del padre
    } catch (err) {
      console.error("Error al crear cuenta:", err);
      alert(err.message);
    }
  };

  return (
    <div className="SignUpContainer">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <img src="/assets/img/converlang_horizontal.png" alt="Converlang" style={{ height: '100px', marginBottom: '1rem', mixBlendMode: 'multiply' }} />
        <h3>Crear cuenta</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Paso {currentStep} de 2</p>
      </div>

      {/* Paso 1 */}
      {currentStep === 1 && (
        <div className="signUpForm">
          <div>
            <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>Nombre</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb'
              }}
            />
            {errors.first_name && <p className="error" style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.first_name}</p>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>Apellido</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb'
              }}
            />
            {errors.last_name && <p className="error" style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.last_name}</p>}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>
              <Mail size={14} className="icon" style={{ marginRight: '5px' }} /> Correo
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb'
              }}
            />
            {errors.email && <p className="error" style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.email}</p>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>
              <Lock size={14} className="icon" style={{ marginRight: '5px' }} /> Contraseña
            </label>
            <div className="passwordField" style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                style={{
                  width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="error" style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.password}</p>}
            {formData.password && (
              <div className={`password-strength ${getPasswordStrength(formData.password).class}`} style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Seguridad: <strong>{getPasswordStrength(formData.password).label}</strong>
              </div>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>Confirmar contraseña</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleChange("confirmPassword", e.target.value)
              }
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb'
              }}
            />
            {errors.confirmPassword && (
              <p className="error" style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      )}

      {/* Paso 2 */}
      {currentStep === 2 && (
        <div className="signUpForm">
          <div>
            <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>
              <Calendar size={14} className="icon" style={{ marginRight: '5px' }} /> Fecha de nacimiento
            </label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => handleChange("birth_date", e.target.value)}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb'
              }}
            />
            {errors.birth_date && <p className="error" style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.birth_date}</p>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>
              <MapPin size={14} className="icon" style={{ marginRight: '5px' }} /> País
            </label>
            <select
              value={formData.country_id}
              onChange={(e) => handleChange("country_id", e.target.value)}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb'
              }}
            >
              <option value="">Selecciona</option>
              {countries.map((c) => (
                <option key={c.country_code} value={c.country_code}>
                  {c.country_name}
                </option>
              ))}
            </select>
            {errors.country_id && <p className="error" style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.country_id}</p>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>Género</label>
            <select
              value={formData.gender_id}
              onChange={(e) => handleChange("gender_id", e.target.value)}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb'
              }}
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
            <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>Idioma nativo</label>
            <select
              value={formData.native_lang_id}
              onChange={(e) =>
                handleChange("native_lang_id", e.target.value)
              }
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb'
              }}
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
              <p className="error" style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.native_lang_id}</p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>Idioma a aprender</label>
            <select
              value={formData.target_lang_id}
              onChange={(e) =>
                handleChange("target_lang_id", e.target.value)
              }
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb'
              }}
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
              <p className="error" style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.target_lang_id}</p>
            )}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>Sobre ti</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                handleChange("description", e.target.value)
              }
              placeholder="Cuéntanos algo..."
              rows={3}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb', fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      )}

      {/* Botones navegación */}
      <div className="navButtons" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>

        <button type="button" onClick={prevStep} className="btn btn-ghost" disabled={currentStep === 1} style={{ visibility: currentStep === 1 ? 'hidden' : 'visible', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ChevronLeft size={16} /> Anterior
        </button>

        {currentStep < 2 ? (
          <button type="button" onClick={nextStep} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Siguiente <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Crear cuenta <MessageCircle size={16} />
          </button>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>¿Ya tienes cuenta? </span>
        <a href="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Inicia Sesión</a>
      </div>
    </div>
  );
}
