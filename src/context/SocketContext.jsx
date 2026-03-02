import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config/api";
import { jwtDecode } from "jwt-decode";

const SocketContext = createContext(null);

// ID único estable por pestaña (sobrevive re-renders pero no recarga)
const TAB_ID = Math.random().toString(36).slice(2);

// Canal compartido entre todas las pestañas del mismo origen
const callChannel = typeof BroadcastChannel !== "undefined"
  ? new BroadcastChannel("converlang_calls")
  : null;

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const API_BACKEND = API_URL;

  // ¿Esta pestaña tiene la llamada activa?
  const isClaimer = useRef(false);

  // =====================================================
  // Coordinación entre pestañas via BroadcastChannel
  // =====================================================
  useEffect(() => {
    if (!callChannel) return;

    const handler = (event) => {
      const msg = event.data;

      if (msg?.type === "call_claimed") {
        // Otra pestaña reclamó la llamada.
        // Si su TAB_ID es menor que el nuestro, ellos ganan → ceder.
        // Si su TAB_ID es mayor, nosotros ganamos → ignorar.
        if (msg.tabId < TAB_ID) {
          isClaimer.current = false;
          setIncomingCall(null);
        }
        // Si msg.tabId > TAB_ID → nosotros ganamos, no hacer nada
      }

      if (msg?.type === "call_dismissed") {
        // La pestaña reclamante cerró el overlay → limpiar en todas
        isClaimer.current = false;
        setIncomingCall(null);
      }
    };

    callChannel.addEventListener("message", handler);
    return () => callChannel.removeEventListener("message", handler);
  }, []);

  // =====================================================
  // Conexión de socket
  // =====================================================
  useEffect(() => {
    let interval;

    const initSocket = () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (socket) {
        if (interval) clearInterval(interval);
        return;
      }

      console.log("Token detectado, inicializando socket...");

      const newSocket = io(`${API_BACKEND}`, {
        transports: ["websocket"],
        auth: { token }
      });

      newSocket.on("connect", () => {
        setSocket(newSocket);
        if (interval) clearInterval(interval);

        try {
          const decoded = jwtDecode(token);
          const userId = Number(decoded.sub);
          newSocket.emit("joinNotifications", userId);
        } catch (e) {
          console.error("Error decodificando token para notificaciones:", e);
        }
      });

      const callTypes = ["incoming_call", "call_rejected", "call_ended", "user_busy"];
      newSocket.on("newNotification", (notification) => {
        if (!callTypes.includes(notification.type)) return;

        if (notification.type === "incoming_call") {
          // ─── Reclamar la llamada con coordinación entre pestañas ───
          isClaimer.current = true;
          setIncomingCall(notification);
          // Avisar a otras pestañas: "esta pestaña reclama la llamada"
          // Las pestañas con TAB_ID > nuestro TAB_ID cederán.
          callChannel?.postMessage({ type: "call_claimed", tabId: TAB_ID });
        } else {
          // call_rejected / call_ended / user_busy:
          // Siempre pasar — el caller necesita estos eventos aunque nunca sea claimer.
          setIncomingCall(notification);
        }
      });

      newSocket.on("disconnect", () => {
        setSocket(null);
        if (!interval) {
          interval = setInterval(initSocket, 2000);
        }
      });
    };

    initSocket();
    interval = setInterval(initSocket, 2000);

    return () => {
      if (interval) clearInterval(interval);
      if (socket) socket.disconnect();
    };
  }, [socket]);

  // =====================================================
  // Heartbeat global — mantiene al usuario como "online"
  // en cualquier página, no solo en el dashboard
  // =====================================================
  useEffect(() => {
    const sendHeartbeat = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        await fetch(`${API_BACKEND}/auth/heartbeat`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // silencioso — no bloquear si falla
      }
    };

    sendHeartbeat(); // inmediato al montar
    const hbInterval = setInterval(sendHeartbeat, 60_000); // cada 60s
    return () => clearInterval(hbInterval);
  }, []);

  // =====================================================
  // dismissCall: al cerrar la llamada, avisar a otras pestañas
  // =====================================================
  const dismissCall = (value) => {
    if (isClaimer.current && value === null) {
      callChannel?.postMessage({ type: "call_dismissed" });
    }
    isClaimer.current = false;
    setIncomingCall(value);
  };

  return (
    <SocketContext.Provider value={{ socket, incomingCall, setIncomingCall: dismissCall }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  return ctx?.socket;
}

export function useIncomingCall() {
  const ctx = useContext(SocketContext);
  return [ctx?.incomingCall, ctx?.setIncomingCall];
}
