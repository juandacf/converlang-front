import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIncomingCall, useSocket } from "../../context/SocketContext";
import { getAvatarUrl } from "../../utils/avatarUtils";
import { Translations } from "../../translations/translations";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../../config/api";
import { authFetch } from "../../config/authFetch";
import "./IncomingCallOverlay.css";

export default function IncomingCallOverlay() {
    const [incomingCall, setIncomingCall] = useIncomingCall();
    const socket = useSocket();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(15);
    const [language, setLanguage] = useState("ES");

    // Obtener idioma del usuario
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const decoded = jwtDecode(token);
            authFetch(`${API_URL}/preferences/${decoded.sub}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.ok ? r.json() : null)
                .then(data => { if (data?.language_code) setLanguage(data.language_code); });
        } catch (e) { /* fallback ES */ }
    }, []);

    const t = Translations[language]?.callNotifications || Translations["ES"].callNotifications;

    // Auto-dismiss después de 15 segundos
    useEffect(() => {
        if (!incomingCall) {
            setCountdown(60);
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Notificar al caller que no fue contestada
                    if (socket && incomingCall) {
                        socket.emit("callRejected", {
                            matchId: incomingCall.matchId,
                            callerUserId: incomingCall.caller?.userId,
                            reason: "no_answer"
                        });
                    }
                    setIncomingCall(null);
                    return 15;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [incomingCall, setIncomingCall]);

    if (!incomingCall || incomingCall.type !== 'incoming_call') return null;

    const caller = incomingCall.caller || {};
    const matchId = incomingCall.matchId;

    const handleAccept = () => {
        navigate(`/videocall/${matchId}`, {
            state: {
                selectedMatch: {
                    match_id: matchId,
                    other_user_id: caller.userId,
                    full_name: caller.userName || "Usuario",
                },
            },
        });
        setIncomingCall(null);
    };

    const handleReject = () => {
        if (socket) {
            socket.emit("callRejected", {
                matchId,
                callerUserId: caller.userId,
                reason: "rejected"
            });
        }
        setIncomingCall(null);
    };

    return (
        <div className="incoming-call-overlay" onClick={(e) => e.stopPropagation()}>
            <div className="incoming-call-card">
                <div className="incoming-call-ring">
                    <img
                        className="incoming-call-avatar"
                        src={getAvatarUrl(caller.userPhoto)}
                        alt={caller.userName || "Caller"}
                    />
                </div>

                <p className="incoming-call-label">{t.incomingCall}</p>
                <p className="incoming-call-name">{caller.userName || "Usuario"}</p>

                <div className="incoming-call-actions">
                    <div>
                        <button
                            className="call-action-btn reject"
                            onClick={handleReject}
                            title={t.reject}
                        >
                            ✕
                        </button>
                        <p className="call-action-btn-label">{t.reject}</p>
                    </div>

                    <div>
                        <button
                            className="call-action-btn accept"
                            onClick={handleAccept}
                            title={t.accept}
                        >
                            📞
                        </button>
                        <p className="call-action-btn-label">{t.accept}</p>
                    </div>
                </div>

                <p className="incoming-call-timer">{t.autoCloseTimer} {countdown}s</p>
            </div>
        </div>
    );
}

