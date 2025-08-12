import { useState } from "react";
import './Login.css'

export function Login () {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

   const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    
    const res = await fetch(
      `http://localhost:4000/users?email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}` // esto es momentaneo. Después lo adaptamos al puerto que usemos en postgres
    );

    if (!res.ok) {
      throw new Error(`Error en la petición: ${res.status}`);
    }

    const users = await res.json();

    if (users.length > 0) {
      console.log("Usuario válido:", users[0]);
      alert("Login exitoso", users[0]);
      
    } else {
      console.log("Credenciales incorrectas");
      alert("Correo o contraseña incorrectos");
    }
  } catch (error) {
    console.error("Error al validar usuario:", error);
    alert("Ocurrió un error al intentar iniciar sesión");
  }
};

// const handleSubmit = async (e) => {           // CON POSTGRES SE HARÍA ASÍ
//   e.preventDefault();
//   const res = await fetch("/auth/login", {           // usa proxy de Vite si quieres
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(formData),
//   });
//   if (!res.ok) {
//     alert("Correo o contraseña incorrectos");
//     return;
//   }
//   const user = await res.json();
//   console.log("Login OK", user);
// };
    return (
        <div className="loginContainer">
            <h3>Login</h3>
            <form onSubmit={handleSubmit} className="loginForm">
                <div>
                    <label>Email</label>
                    <input
                    type="email"
                    name="email"
                    value= {formData.email}
                    onChange={handleChange}
                    required
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                    type="password"
                    name="password"
                    value= {formData.password}
                    onChange={handleChange}
                    required
                    />
                </div>

                <button type="submit">Ingresar</button>
            </form>

        </div>
    )
}