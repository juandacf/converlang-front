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

  const  handleSubmit = async (e) => {
        e.preventDefault();

    try {
      
      const res = await fetch("http://localhost:4000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error(`Error al crear cuenta: ${res.status}`);
      }

      const createdUser = await res.json();
      console.log("Usuario creado:", createdUser);

     
      setFormData({ first_name: "", last_name: "", email: "", password: "" });

    } catch (error) {
      console.error(error);
    }


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
          <label>Apellido:</label>
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
