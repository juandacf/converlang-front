import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../config/api';
import './Login.css';

export function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('El enlace de recuperación es inválido o no existe.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setStatus('loading');
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Error al restablecer la contraseña.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Error de conexión con el servidor.');
        }
    };

    return (
        <div className="loginContainer">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <img src="/assets/img/converlang_horizontal.png" alt="Converlang" style={{ height: '130px', width: 'auto', marginBottom: '1rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
                <h3>Ingresa tu nueva contraseña</h3>
                <p style={{ color: 'var(--text-muted)' }}>Elige una nueva contraseña para tu cuenta</p>
            </div>

            {status === 'success' ? (
                <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                    <p style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: '600' }}>{message}</p>
                    <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Serás redirigido al inicio de sesión en unos segundos...</p>
                    <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ marginTop: '2rem', width: '100%', justifyContent: 'center' }}>
                        Ir al Login
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="loginForm">
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>Nueva Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={!token}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={!token}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb' }}
                        />
                    </div>

                    {status === 'error' && <p style={{ color: 'red', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>{message}</p>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={status === 'loading' || !token}>
                        {status === 'loading' ? 'Guardando...' : 'Cambiar Contraseña'}
                    </button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <a href="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Volver al Login</a>
                    </div>
                </form>
            )}
        </div>
    );
}
