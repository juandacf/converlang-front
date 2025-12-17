import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config/api";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const API_BACKEND = API_URL

  useEffect(() => {
    const newSocket = io(`${API_BACKEND}`, {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("🔌 Socket conectado:", newSocket.id);
      setSocket(newSocket); // 🔥 Actualizamos el estado, react hace re-render
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  if (!socket) {
    return <div>Conectando con el servidor...</div>;
  }

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
