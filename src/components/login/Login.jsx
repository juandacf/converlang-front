import { useState } from "react";
import './Login.css'
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../../config/api";



export function Login () {
    const API_BACKEND = API_URL
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const navigate = useNavigate();
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

   
const handleSubmit = async (e) => {          
  e.preventDefault();
  const res = await fetch(`${API_BACKEND}/auth/login`, {           
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!res.ok) {
    alert("Correo o contraseña incorrectos");
    return;
  }
  const user = await res.json();

    localStorage.setItem("token", user.access_token);
    const decoded = jwtDecode(user.access_token);
    const role = decoded.roles?.[0];
    if (role === "admin") {
    navigate("/adminDashboard");
} 
else if (role === "teacher") {
    navigate("/teacherDashboard");
}
else {
    navigate("/dashboard");
}

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