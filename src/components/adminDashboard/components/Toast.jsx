import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Componente de notificación Toast estilo Power BI
 * 
 * @param {Object} toast - {message: string, type: 'success'|'error'|'warning'|'info'}
 * @param {function} onClose - Callback para cerrar el toast
 */
export const Toast = ({ toast, onClose }) => {
    // Auto-cerrar después de 4 segundos
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast, onClose]);

    if (!toast) return null;

    const types = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            iconColor: 'text-green-600',
            textColor: 'text-green-800'
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconColor: 'text-red-600',
            textColor: 'text-red-800'
        },
        warning: {
            icon: AlertCircle,
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            iconColor: 'text-yellow-600',
            textColor: 'text-yellow-800'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-800'
        }
    };

    const config = types[toast.type] || types.info;
    const Icon = config.icon;

    return (
        <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
            <div className={`${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[320px] max-w-md`}>
                <Icon className={`${config.iconColor} flex-shrink-0 mt-0.5`} size={20} />
                <p className={`${config.textColor} text-sm font-medium flex-1`}>{toast.message}</p>
                <button
                    onClick={onClose}
                    className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};
