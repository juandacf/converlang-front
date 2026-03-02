import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import "../common/CustomAlert.css";
import { Translations } from "../../translations/translations";

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    message,
    confirmText,
    cancelText,
    type = "danger",
    language = "ES"
}) {
    if (!isOpen) return null;

    const t = Translations[language]?.videoModule || {};
    const defaultCancel = t.cancelButton || "Cancelar";
    const defaultConfirm = Translations[language]?.dashboard?.matchSection?.deleteMatchWarning ? "Eliminar" : "Confirmar";

    const isDanger = type === "danger";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="custom-alert-overlay" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="custom-alert-modal"
                        style={{ maxWidth: '400px' }}
                    >
                        <div className={`custom-alert-icon-wrapper ${isDanger ? 'error' : 'success'}`}>
                            {isDanger ? <ShieldAlert size={32} /> : <AlertTriangle size={32} />}
                        </div>

                        <p className="custom-alert-message" style={{ margin: '1.5rem 0' }}>
                            {message}
                        </p>

                        <div className="custom-alert-actions" style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center',
                            width: '100%',
                            marginTop: '0.5rem'
                        }}>
                            <button
                                onClick={onClose}
                                className="secondaryBtn custom-alert-btn"
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-light)',
                                    background: 'var(--card)',
                                    color: 'var(--text)',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.95rem'
                                }}
                            >
                                {cancelText || defaultCancel}
                            </button>
                            <button
                                onClick={onConfirm}
                                className="primaryBtn custom-alert-btn"
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    borderRadius: '12px',
                                    background: isDanger ? '#ef4444' : 'var(--gradient-primary)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.95rem',
                                    boxShadow: isDanger ? '0 4px 12px rgba(239, 68, 68, 0.25)' : 'none'
                                }}
                            >
                                {confirmText || defaultConfirm}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
