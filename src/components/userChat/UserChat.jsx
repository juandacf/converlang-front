import { useState, useEffect } from "react";
import { NavBar, Footer } from "../dashboard/Dashboard";
import './UserChat.css'


const API_USERS = 'http://localhost:4000/users';


export function UserChat () {
    const [users, setUsers] = useState([]);
      useEffect(() => {   //  Traemos los usuarios con los que se ha ehecho match
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
          .catch((err) => console.log(err.message))
    
        return () => controller.abort();
      }, []);

    return (
        <div className="userChatMainContainer">
            <div className="chatItemsContainer">
                <div className="chatBarTitle"> 
                    <h3 className="chatTitle">Conversaciones</h3>
                </div>
                <div className="chatSearchBar">
                    <input type="text" className="searchChatInput"/>
                    <img src="../../../public/assets/search.png" alt="" />
                </div>
                {users.map((u)=> (
                   <div className="chatMatchContainer">
                        <p> {u.first_name} {u.last_name}</p>
                   </div>
               ) )}
            </div>
              <NavBar />
              <Footer />
        </div>
    )
}