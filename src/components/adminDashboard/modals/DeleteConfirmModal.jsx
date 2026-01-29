import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { usersService } from '../../../adminServices';

/**
 * Modal de confirmación para eliminar (inactivar) usuarios
 *
 * Características:
 * - Confirmación visual clara
 * - Advertencia de soft delete
 * - Integración con usersService.deleteUser()
 * - Diseño profesional con énfasis en acción destructiva
 *
 * @param {boolean} isOpen - Controla la visibilidad del modal
    * @param {function} onClose - Callback al cerrar el modal
    * @param {function} onSuccess - Callback después de eliminar usuario
    * @param {Object} user - Objeto del usuario a eliminar {id_user, first_name, last_name}
    */
export const DeleteConfirmModal = ({ isOpen, onClose, onSuccess, user }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Maneja la confirmación de eliminación
     */
    const handleConfirm = async () => {
        if (!user) return;

        setLoading(true);
        setError('');

        try {
            await usersService.deleteUser(user.id_user);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Error al inactivar usuario');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">

                    {/* Header con icono de advertencia */}
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="text-red-600" size={32} />
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            ¿Inactivar Usuario?
                        </h2>

                        <p className="text-slate-600 text-sm">
                            Estás a punto de inactivar al usuario:
                        </p>

                        {/* Información del usuario */}
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="font-bold text-slate-900 text-lg">
                                {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">{user.email}</p>
                            <p className="text-xs text-slate-400 mt-1">ID: {user.id_user}</p>
                        </div>

                        {/* Advertencia de soft delete */}
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-800 flex items-start gap-2">
                                <span className="inline-block w-1 h-1 bg-yellow-600 rounded-full mt-1.5 flex-shrink-0"></span>
                                <span className="text-left">
                                    <strong>Nota:</strong> Esta acción marcará al usuario como inactivo pero no eliminará sus datos permanentemente. El usuario no podrá iniciar sesión.
                                </span>
                            </p>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs text-red-600">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer con botones */}
                    <div className="flex items-center gap-3 p-6 border-t border-slate-200">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex-1 px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Inactivando...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    Sí, Inactivar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
