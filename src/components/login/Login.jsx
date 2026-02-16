import { useState, useEffect } from "react";
import './Login.css'
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../../config/api";
import { InactiveAccountModal } from "./InactiveAccountModal";




export function Login() {
    const API_BACKEND = API_URL
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [showInactiveModal, setShowInactiveModal] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Detectar si viene del guard con parámetro ?inactive=true
    useEffect(() => {
        if (searchParams.get('inactive') === 'true') {
            setShowInactiveModal(true);
            // Limpiar el parámetro de la URL
            navigate('/', { replace: true });
        }
    }, [searchParams, navigate]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BACKEND}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();

                // Detectar si es un error de cuenta inactiva
                if (errorData.message && errorData.message.includes('ACCOUNT_INACTIVE')) {
                    setShowInactiveModal(true);
                    return;
                }

                // Error genérico para otros casos
                alert("Correo o contraseña incorrectos");
                return;
            }

            const user = await res.json();
            localStorage.setItem("token", user.access_token);
            const decoded = jwtDecode(user.access_token);
            const role = decoded.roles?.[0];

            if (role === "admin") {
                navigate("/adminDashboard");
            } else if (role === "teacher") {
                navigate("/teacherDashboard");
            } else {
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Error en login:", error);
            alert("Error al intentar iniciar sesión");
        }
    };


    return (
        <>
            <InactiveAccountModal
                isOpen={showInactiveModal}
                onClose={() => setShowInactiveModal(false)}
            />
            <div className="loginContainer">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src="/assets/img/converlang_horizontal.png" alt="Converlang" style={{ height: '100px', marginBottom: '1rem', mixBlendMode: 'multiply' }} />
                    <h3>Bienvenido de nuevo</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="loginForm">
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                background: '#f9fafb'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                background: '#f9fafb'
                            }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        Ingresar
                    </button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>¿No tienes cuenta? </span>
                        <a href="/signup" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Regístrate</a>
                    </div>
                </form>

            </div>
        </>
    )
}