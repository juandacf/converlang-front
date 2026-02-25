import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config/api";
import { jwtDecode } from "jwt-decode";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const API_BACKEND = API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io(`${API_BACKEND}`, {
      transports: ["websocket"],
      auth: { token }
    });

    newSocket.on("connect", () => {
      setSocket(newSocket);

      // Unirse a sala personal de notificaciones
      try {
        const decoded = jwtDecode(token);
        const userId = Number(decoded.sub);
        newSocket.emit("joinNotifications", userId);
      } catch (e) {
        console.error("Error decodificando token para notificaciones:", e);
      }
    });

    // Escuchar notificaciones globales de llamadas
    const callTypes = ["incoming_call", "call_rejected", "call_ended", "user_busy"];
    newSocket.on("newNotification", (notification) => {
      if (callTypes.includes(notification.type)) {
        setIncomingCall(notification);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Solo mostrar "Conectando..." si hay token pero el socket aún no conecta.
  // Si NO hay token (páginas públicas), renderizar children normalmente.
  const token = localStorage.getItem("token");
  if (token && !socket) {
    return <div>Conectando con el servidor...</div>;
  }

  return (
    <SocketContext.Provider value={{ socket, incomingCall, setIncomingCall }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  // Retro-compatibilidad: si alguien usa useSocket() esperando solo el socket
  return ctx?.socket ?? ctx;
}

export function useIncomingCall() {
  const ctx = useContext(SocketContext);
  return [ctx?.incomingCall, ctx?.setIncomingCall];
}

