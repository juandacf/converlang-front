import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import "../common/CustomAlert.css"; // Reuse basic modal styles if possible or add specific ones

export function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
    if (!isOpen) return null;

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
                        <div className="custom-alert-icon-wrapper error">
                            <AlertTriangle size={32} />
                        </div>

                        <p className="custom-alert-message" style={{ margin: '1rem 0' }}>
                            {message}
                        </p>

                        <div className="custom-alert-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
                            <button
                                onClick={onClose}
                                className="secondaryBtn"
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={onConfirm}
                                className="primaryBtn"
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '8px',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Eliminar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
