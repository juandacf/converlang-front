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
  const res = await fetch("http://localhost:3000/auth/login", {           
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!res.ok) {
    alert("Correo o contraseña incorrectos");
    return;
  }
  const user = await res.json();
  console.log("Login OK", user);
};


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