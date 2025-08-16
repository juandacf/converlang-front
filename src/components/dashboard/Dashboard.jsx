import './Dashboard.css'
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const API_USERS = 'http://localhost:4000/users';
const API_STATISTICS =  'http://localhost:4000/datachart';


export function Dashboard({user}) {
const [users, setUsers] = useState([]);
const [sessions, setSessions]= useState([]);

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
      .catch((err) => console.log(err.message))

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch(API_STATISTICS, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const userStatistics = Array.isArray(json) ? json : json.users ?? [];
        console.log(userStatistics)
        setSessions(userStatistics);
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
            <div className="recentMatchItems" >
              {users.map((u) => (
                <div className="recentMatch" key={u.id}>
                  <img className="matchPhoto" src="../../../public/assets/user.png" alt="" />
                  <p>{u.first_name}</p>
                  <p>{u.last_name}</p>
                </div>
              ))}
            </div>
            </div>
            <div className='carrouselStatistics'>
                <div className='carrouselContainer'>
                  <div className='carrouselTitle'>Iniciar Match</div>
                  <div className='matchContainer'><div>
                    <a href=""> <button className='matchButton'>Match</button></a>
                  </div>
                  </div>

                </div>

                  <div className='carrouselContainer'>
                  <div className='carrouselTitle'>Tus sesiones (últimos 30 días):</div>
                  <div className='matchContainer matchStatistics'>
                     <ResponsiveContainer className="recentSessions" width="90%" height={150}>
                    <LineChart  width={300} height={180} data={sessions}>
                    <CartesianGrid stroke="#8884d8" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sesiones" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                     </ResponsiveContainer>

                  <div>  
                  </div>
                  </div>
                </div>
                 
            </div>
            <div className='teacherContainer'>

            </div>
        </div>
    </>
)
}



export function NavBar() {
    return (<nav className='navBar'>
        <img src="../../../public/assets/friend-request.png"  alt="connect" className='navBarImage' />
        <img src="../../../public/assets/messages.png" alt="connect" className='navBarImage' />
        <img src="../../../public/assets/sticky-note.png" alt="connect" className='navBarImage' />
    </nav>)
}

