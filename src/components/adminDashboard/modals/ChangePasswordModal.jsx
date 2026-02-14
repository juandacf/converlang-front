import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usersService } from '../../../adminServices';

export const ChangePasswordModal = ({ isOpen, onClose, onSuccess, userId }) => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error al escribir
        if (error) setError(null);
    };

    const validateForm = () => {
        if (!userId) {
            setError('No se pudo identificar al usuario. Intenta cerrar sesión e ingresar de nuevo.');
            return false;
        }
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }
        return true;
    };

    const handleClose = () => {
        // Resetear todo al cerrar
        setSuccess(false);
        setError(null);
        setFormData({ password: '', confirmPassword: '' });
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            setError(null);

            await usersService.changePassword(userId, formData.password);

            // Mostrar pantalla de éxito
            setSuccess(true);
            onSuccess();

            // Auto-cerrar después de 2.5 segundos
            setTimeout(() => {
                setSuccess(false);
                setFormData({ password: '', confirmPassword: '' });
                onClose();
            }, 2500);
        } catch (err) {
            console.error('Error changing password:', err);
            const errorMessage = err.message || 'Error al cambiar la contraseña. Inténtalo de nuevo.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                onClick={!success ? handleClose : undefined}
            ></div>

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Success state */}
                {success ? (
                    <div className="p-10 text-center">
                        <div className="flex justify-center mb-5">
                            <div
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.4)',
                                    animation: 'successPulse 1.5s ease-in-out infinite'
                                }}
                            >
                                <CheckCircle2 size={40} color="white" strokeWidth={2.5} />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">
                            ¡Contraseña Actualizada!
                        </h2>
                        <p className="text-sm text-slate-500">
                            La contraseña se ha cambiado exitosamente.
                            <br />
                            Este diálogo se cerrará automáticamente.
                        </p>
                        <div className="mt-5">
                            <div
                                style={{
                                    height: 4,
                                    borderRadius: 2,
                                    background: '#e2e8f0',
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    style={{
                                        height: '100%',
                                        borderRadius: 2,
                                        background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                                        animation: 'progressShrink 2.5s linear forwards'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Inline keyframes */}
                        <style>{`
                            @keyframes successPulse {
                                0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
                                50% { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
                            }
                            @keyframes progressShrink {
                                from { width: 100%; }
                                to { width: 0%; }
                            }
                        `}</style>
                    </div>
                ) : (
                    <>
                        {/* Header con gradiente */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
                            <div className="mx-auto bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold">Cambiar Contraseña</h2>
                            <p className="text-indigo-100 text-sm mt-1">
                                Actualiza tu clave de acceso de forma segura
                            </p>

                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form id="change-password-form" onSubmit={handleSubmit} className="space-y-4" action="javascript:void(0);">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nueva Contraseña
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="pl-10 pr-10 w-full py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="Mínimo 6 caracteres"
                                            autoComplete="new-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Confirmar Contraseña
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="pl-10 pr-10 w-full py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="Repite la contraseña"
                                            autoComplete="new-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Guardando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                <span>Guardar Cambios</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
