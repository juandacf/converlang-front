import { useState, useEffect } from "react";
import { NavBar, Footer } from "../dashboard/Dashboard";
import "./UserChat.css";

const API_USERS = "http://localhost:4000/users";

export function UserChat() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetch(API_USERS, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const userData = Array.isArray(json) ? json : json.users ?? [];
        setUsers(userData);
      })
      .catch((err) => console.log(err.message));

    return () => controller.abort();
  }, []);

  const filteredUsers = users.filter((u) =>
    `${u.first_name} ${u.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <div className="userChatMainContainer">
        <div className="chatItemsContainer">
          <div className="chatSearchBar">
            <input
              type="text"
              className="searchChatInput"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img
              src="../../../public/assets/search.png"
              alt=""
              className="chatSearchButton"
            />
          </div>
          {filteredUsers.map((u) => (
            <div
              className="chatMatchContainer"
              key={u.id}
              onClick={() => setSelectedUser(`${u.first_name} ${u.last_name}`)}
            >
              <div className="chatPhotoContainer">
                <img
                  className="userPhoto"
                  src="../../../public/assets/user.png"
                  alt=""
                />
              </div>
              <div className="chatNameContainer">
                <p>
                  {u.first_name} {u.last_name}
                </p>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <p style={{ color: "#6b7280", paddingLeft: "1rem" }}>
              Sin resultados
            </p>
          )}
        </div>
        <div className="messagesContainer">
          <div className="messagesTitle">
            <div className="selectedUserInfo">
              <div className="currentUserPhotoContainer">
                <img
                  className="currentUserPhoto"
                  src="../../../public/assets/user.png"
                  alt=""
                />
              </div>
              <div className="currentChosenNameContainer">
                <p className="currentChosenName">
                  {selectedUser}
                </p>
              </div>
            </div>

            <div className="otherIcons">
              <div className="chatIcon">
                <img className="chatIconImage" src="../../../public/assets/video-camera.png" alt="" />
              </div>
              <div className="chatIcon">
                <img className="chatIconImage" src="../../../public/assets/dots.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <NavBar />
      <Footer />
    </>
  );
}
