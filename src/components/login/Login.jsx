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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData)
        // En este espacio se enviarán los datos al backed
    }
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