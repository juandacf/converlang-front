import { useState } from "react";
import './SignUp.css';

export function SignUp() {
  const [formData, setFormData] = useState({  //Se definen los datos con los que se va a crear la cuenta y se les linkea a un estado
    first_name: "",
    last_name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData, 
      [name]: value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos enviados:", formData);
    // En este espacio enviaremos los datos al backend
  };

  return (
    <div className="SignUpContainer">
      <h3>Sign up</h3>

      <form onSubmit={handleSubmit} className="signUpForm">
        <div>
          <label>Primer nombre:</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Segundo nombre:</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Correo:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Crear cuenta</button>
      </form>
    </div>
  );
}
