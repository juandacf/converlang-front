import './Dashboard.css'
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:4000/users';


export function Dashboard({user}) {
const [users, setUsers] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(API_URL, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const data = Array.isArray(json) ? json : json.users ?? [];
        setUsers(data);
      })
      .catch((err) => console.log(err.message))

    return () => controller.abort();
  }, []);

return (
    <>
    <NavBar />
        <div className="dashboardMainContainer">
            <div className="dashNavBar">
                <div className="elementsNavBar">
                    <img className= "navBarElement" src="../../../public/assets/notification.png" alt="" />
                    <img className= "navBarElement" src="../../../public/assets/setting.png" alt="" />
                </div>
            </div>
            <div className="greetingContainer"> 
                <div className="UserPic">
                    <img className="actualPic" src="../../../public/assets/mi_pic.png" alt="" />
                </div>
                <div className="greeting">
                    <h3 className='bigGreeting'>
                        Hola, {user.name + " " + user.lastname}
                    </h3>
                    <h3 className='smallGreeting'>
                        ¡Empecemos!
                    </h3>
                </div>
            </div>        
            <div className='recentMatchContainer'>
                <h3 className='recentMatchTitle'>Match recientes</h3>
                <div className='recentMatchItems'>
                    {users.map((user)=> {
                       return (
                       <div className="recentMatch">
                        <img className="matchPhoto" src="../../../public/assets/user.png" alt="" />
                        <p>{user.first_name}</p>
                       </div> )
                    })}
                </div>
            </div>
            <div className='carrouselStatistics'></div>
            <div className='teacherContainer'></div>
        </div>
    </>
)
}



function NavBar() {
    return (<nav className='navBar'>
        <img src="../../../public/assets/friend-request.png" alt="connect" className='navBarImage' />
        <img src="../../../public/assets/messages.png" alt="connect" className='navBarImage' />
        <img src="../../../public/assets/sticky-note.png" alt="connect" className='navBarImage' />
    </nav>)
}