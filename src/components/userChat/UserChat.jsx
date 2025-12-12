import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { NavBar, Footer } from "../dashboard/Dashboard";
import "./UserChat.css";
import { jwtDecode } from "jwt-decode";

export function UserChat() {
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);

  const [chatList, setChatList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [showConfigMenu, setShowConfigMenu] = useState(false);
const configMenuRef = useRef(null);



  const socketRef = useRef(null);
  console.log(decodedToken.sub);

  // =====================================================
  // 1. Inicializar socket SOLO una vez
  // =====================================================
  useEffect(() => {
    socketRef.current = io("http://localhost:3000", {
      transports: ["websocket"],
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // =====================================================
  // 2. Obtener lista de chats
  // =====================================================
  useEffect(() => {
    fetch(`http://localhost:3000/chats/list/${decodedToken.sub}`)
      .then((res) => res.json())
      .then((data) => setChatList(data));
  }, [decodedToken.sub]);

  // =====================================================
  // 3. Cuando selecciono un match → cargar mensajes + unirme a sala
  // =====================================================
  useEffect(() => {
    if (!selectedMatch) return;

    socketRef.current.emit("joinRoom", selectedMatch.match_id);

    fetch(`http://localhost:3000/chats/${selectedMatch.match_id}`)
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, [selectedMatch]);

  // =====================================================
  // 4. Recibir mensajes nuevos en tiempo real
  // =====================================================
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current.off("newMessage");
    };
  }, []);

  // =====================================================
  // 5. Enviar mensaje
  // =====================================================
  const sendMessage = () => {
    if (!draft.trim() || !selectedMatch) return;

    socketRef.current.emit("sendMessage", {
      matchId: selectedMatch.match_id,
      senderId: decodedToken.sub,
      message: draft,
    });

    setDraft("");
  };

  const filteredChats = chatList.filter((chat) =>
  chat.full_name.toLowerCase().includes(search.toLowerCase())
);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (
      configMenuRef.current &&
      !configMenuRef.current.contains(e.target)
    ) {
      setShowConfigMenu(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

const handleDeleteMatch = async () => {
  if (!selectedMatch) return;

  const confirmDelete = window.confirm(
    "¿Estás seguro de que deseas eliminar este match?"
  );
  if (!confirmDelete) return;

  try {
    // IDs correctos
    const user1 = Number(decodedToken.sub);
    const user2 = Number(selectedMatch.other_user_id);

    if (Number.isNaN(user1) || Number.isNaN(user2)) {
      throw new Error("IDs de usuario inválidos");
    }

    const res = await fetch(
      `http://localhost:3000/matches/deleteMatch?user_1=${user1}&user_2=${user2}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Error al eliminar el match");
    }

    // Limpiar UI
    setChatList((prev) =>
      prev.filter((c) => c.match_id !== selectedMatch.match_id)
    );
    setSelectedMatch(null);
    setMessages([]);
    setShowConfigMenu(false);

  } catch (err) {
    alert(err.message);
  }
};


  return (
    <>
      <div className="userChatMainContainer">
        {/* Chat List */}
        <div className="chatItemsContainer">
          <div className="chatSearchContainer">
  <input
    type="text"
    className="chatSearchInput"
    placeholder="Buscar..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</div>

          {filteredChats.map((chat) => (
            <div
              className="chatMatchContainer"
              key={chat.match_id}
              onClick={() => setSelectedMatch(chat)}
            >
              <div className="chatPhotoContainer">
                <img
                  className="userPhoto purpleMargin"
                  src={
                    chat.profile_photo
                      ? `http://localhost:3000${chat.profile_photo}`
                      : "../../../public/assets/user.png"
                  }
                  alt=""
                />
              </div>
              <div className="chatNameContainer">
                <p>{chat.full_name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div className="messagesContainer">
          {selectedMatch ? (
            <>
              <div className="messagesTitle">
                <div className="chatPhotoContainer">
                  <img
                    className="userPhoto purpleMargin"
src={
  selectedMatch?.profile_photo
    ? `http://localhost:3000${selectedMatch.profile_photo}`
    : "../../../public/assets/user.png"
}
                    alt=""
                  />
                </div>
                <p className="chatName">{selectedMatch.full_name}</p>
<img
  className="userPhoto configButton"
  src="../../../public/assets/dots.png"
  alt=""
  onClick={() => setShowConfigMenu((prev) => !prev)}
/>

{showConfigMenu && (
  <div className="configMenu" ref={configMenuRef}>
    <p onClick={() => alert("Función de llamada próximamente 🚧")}>
      📞 Iniciar llamada
    </p>
    <p className="danger" onClick={handleDeleteMatch}>
      ❌ Eliminar match
    </p>
  </div>
)}
              </div>

              <div className="actualMessageContainer">
                {messages.map((m) => (
                  <div
                    key={m.message_id}
                    className={
                      m.sender_id === decodedToken.sub
                        ? "selfMessage"
                        : "otherMessage"
                    }
                  >
                    <p>{m.message}</p>
                  </div>
                ))}
              </div>

              <div className="inputContainer">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  className="inputChat"
                  placeholder="Escribe un mensaje..."
                />

                <img
                  src="../../../public/assets/send.png"
                  alt="send"
                  className="sendMessage inputImage"
                  onClick={sendMessage}
                />
              </div>
            </>
          ) : (
            <p style={{ textAlign: "center", marginTop: "20%" }}>
              Selecciona un chat
            </p>
          )}
        </div>
      </div>

      <NavBar />
      <Footer />
    </>
  );
}
