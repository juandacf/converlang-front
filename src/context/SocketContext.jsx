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
    let interval;

    const initSocket = () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Si ya hay un socket activo, no hacemos nada
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

      newSocket.on("disconnect", () => {
        setSocket(null);
        // Reiniciar el intervalo si se desconecta y seguimos teniendo token
        if (!interval) {
          interval = setInterval(initSocket, 2000);
        }
      });
    };

    // Intento inicial
    initSocket();

    // Intervalo de chequeo (para cuando el usuario hace login sin refrescar)
    interval = setInterval(initSocket, 2000);

    return () => {
      if (interval) clearInterval(interval);
      if (socket) socket.disconnect();
    };
  }, [socket]); // Re-ejecutar si el socket cambia (como al desconectarse)

  // Ya no bloqueamos la interfaz mientras conecta. Se renderiza silenciosamente.
  const token = localStorage.getItem("token");

  return (
    <SocketContext.Provider value={{ socket, incomingCall, setIncomingCall }}>
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

