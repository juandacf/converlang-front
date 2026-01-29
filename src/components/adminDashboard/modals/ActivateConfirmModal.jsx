import React, { useState } from 'react';
import { CheckCircle, X, AlertCircle, AlertTriangle } from 'lucide-react';
import { usersService } from '../../../adminServices';

/**
 * Modal de confirmación para reactivar un usuario
 * Similar a DeleteConfirmModal pero para reactivación
 */
export function ActivateConfirmModal({ isOpen, onClose, onSuccess, user }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Maneja la confirmación de reactivación
     */
    const handleConfirm = async () => {
        if (!user) return;

        setLoading(true);
        setError('');

        try {
            await usersService.activateUser(user.id_user);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Error al reactivar usuario');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                <CheckCircle size={24} />
                            </div>
                            <h2 className="text-xl font-bold">Reactivar Usuario</h2>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors disabled:opacity-50"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="flex items-start gap-3 mb-6">
                        <div className="bg-green-50 p-2 rounded-lg">
                            <AlertCircle size={20} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-700 leading-relaxed mb-2">
                                ¿Está seguro que desea <span className="font-semibold text-green-600">reactivar</span> este usuario?
                            </p>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-3">
                                <p className="text-sm text-slate-600">
                                    <span className="font-semibold">Usuario:</span> {user.first_name} {user.last_name}
                                </p>
                                <p className="text-sm text-slate-600">
                                    <span className="font-semibold">Email:</span> {user.email}
                                </p>
                                <p className="text-sm text-slate-600">
                                    <span className="font-semibold">ID:</span> {user.id_user}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Warning about blocking reasons */}
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-yellow-100 p-2 rounded-lg flex-shrink-0">
                                <AlertTriangle size={20} className="text-yellow-700" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-yellow-900 mb-2">
                                    Razones comunes de bloqueo:
                                </p>
                                <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                                    <li>Contenido obsceno o inapropiado</li>
                                    <li>Usuario menor de edad</li>
                                    <li>Contenido sensible o violación de políticas</li>
                                </ul>
                                <p className="text-xs text-yellow-800 mt-3 font-medium">
                                    Verifique que el caso ha sido revisado antes de reactivar.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                        <p className="text-xs text-green-700 leading-relaxed">
                            <span className="font-semibold">Nota:</span> El usuario podrá iniciar sesión nuevamente y
                            mantendrá su historial completo (sesiones, matches, etc.).
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Reactivando...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} />
                                    <span>Reactivar</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
