import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../config/api';

export function ForgotPasswordModal({ isOpen, onClose }) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message);
            } else {
                setStatus('error');
                setMessage(data.message || 'Error al procesar la solicitud');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Error de conexión con el servidor');
        }
    };

    return (
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose} style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000,
                display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="modal-content"
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: 'white', padding: '2rem', borderRadius: '12px',
                        width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                >
                    <h3 style={{ marginTop: 0, color: 'var(--text-color)' }}>Recuperar Contraseña</h3>

                    {status === 'success' ? (
                        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                            <p style={{ color: '#10b981', marginBottom: '1.5rem', fontWeight: '500' }}>{message}</p>
                            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Entendido</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
                            </p>

                            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                <label style={{ display: 'block', marginBottom: '.5rem', fontWeight: '500' }}>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="tu@correo.com"
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '12px',
                                        border: '1px solid #e5e7eb', background: '#f9fafb'
                                    }}
                                />
                            </div>

                            {status === 'error' && <p style={{ color: 'red', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{message}</p>}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={onClose} className="btn" style={{ flex: 1, background: '#f3f4f6', color: '#374151', justifyContent: 'center' }}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={status === 'loading'}>
                                    {status === 'loading' ? 'Enviando...' : 'Enviar'}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
