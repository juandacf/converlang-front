import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";
import "./CustomAlert.css";
import { Translations } from "../../translations/translations";

export function CustomAlert({ isOpen, onClose, type = "success", message, language = "ES" }) {
    if (!isOpen) return null;

    const isSuccess = type === "success";

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="custom-alert-overlay"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="custom-alert-modal"
                    >
                        <div className={`custom-alert-icon-wrapper ${isSuccess ? 'success' : 'error'}`}>
                            {isSuccess ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                        </div>

                        <p className="custom-alert-message">
                            {message}
                        </p>

                        <button
                            onClick={onClose}
                            className="primaryBtn custom-alert-btn"
                        >
                            {Translations[language]?.alert?.buttonText || "Entendido"}
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
