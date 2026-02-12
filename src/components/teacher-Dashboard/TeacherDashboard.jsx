import { useEffect } from "react";
import { API_URL } from "../../config/api";

export function TeacherDashboard() {
    // ── Heartbeat: reportar que el teacher está activo ──
    useEffect(() => {
        const sendHeartbeat = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                await fetch(`${API_URL}/auth/heartbeat`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (e) { /* silencioso */ }
        };
        sendHeartbeat();
        const interval = setInterval(sendHeartbeat, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <h1>Hola, soy un teacher</h1>
    )
}