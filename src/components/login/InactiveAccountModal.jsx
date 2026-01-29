import React from 'react';
import { AlertCircle, X, Mail } from 'lucide-react';

/**
 * Modal para mostrar mensaje de cuenta inactiva
 * Se muestra cuando un usuario intenta iniciar sesión con una cuenta desactivada
 */
export function InactiveAccountModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                <AlertCircle size={24} />
                            </div>
                            <h2 className="text-xl font-bold">Cuenta Inactiva</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Su cuenta ha sido <span className="font-semibold text-red-600">desactivada</span> por un administrador.
                        </p>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Si cree que esto es un error o desea solicitar la reactivación de su cuenta,
                            por favor comuníquese con nuestro equipo de soporte.
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <Mail size={20} className="text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Contacto de Soporte</p>
                                <a
                                    href="mailto:converlang@gmail.com"
                                    className="text-indigo-600 font-semibold hover:underline"
                                >
                                    converlang@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
