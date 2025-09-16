import './Dashboard.css'
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "react-big-calendar/lib/css/react-big-calendar.css";

const API_USERS = 'http://localhost:4000/users';
const API_STATISTICS = 'http://localhost:4000/datachart';


export function Dashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);

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

  useEffect(() => {  //  Traemos la cantidad de sesiones durante algunos días del mes1
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
            <img className="navBarElement" src="../../../public/assets/notification.png" alt="" />
            <img className="navBarElement" src="../../../public/assets/setting.png" alt="" />
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
              <a href="/matchUser"> <button className='matchButton'>Match</button></a>
            </div>
            </div>

          </div>

          <div className='carrouselContainer'>
            <div className='carrouselTitle'>Tus sesiones (últimos 30 días):</div>
            <div className='matchContainer matchStatistics'>
              <ResponsiveContainer className="recentSessions" width="90%" height={150}>
                <LineChart width={300} height={180} data={sessions}>
                  <CartesianGrid stroke="#D88484FF" />
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
          <div className='carrouselContainer'>
            <div className='carrouselTitle'>Contratar a un profesor</div>
            <div className='matchContainer'><div>
              <a href="/matchTeacher"> <button className='matchButton buttonPremium'>Premium</button></a>
            </div>
            </div>

          </div>
        </div>

      </div>
      <Footer />
    </>
  )
}



export function NavBar() {
  return (<nav className='navBar'>
    <a href="/dashboard"> <img src="../../../public/assets/home.png" alt="connect" className='navBarImage' /></a>
    <a href="/"> <img src="../../../public/assets/friend-request.png" alt="connect" className='navBarImage' /></a>
    <a href=""><img src="../../../public/assets/messages.png" alt="connect" className='navBarImage' /> </a>
    <a href=""><img src="../../../public/assets/sticky-note.png" alt="connect" className='navBarImage' /></a>
  </nav>)
}

export function Footer() {
  return (
    <footer className='footerContainer'>
      <div className='footerSection' id='socialMedia'>
        <a href="" className='socialMediaLink'><img src="../../../public/assets/twitter.png" alt="" className="socialMediaIcon" /></a>
        <a href="" className='socialMediaLink'><img src="../../../public/assets/instagram.png" alt="" className="socialMediaIcon" /></a>
        <a href="" className='socialMediaLink'><img src="../../../public/assets/linkedin.png" alt="" className="socialMediaIcon" /></a>
        <a href="" className='socialMediaLink'><img src="../../../public/assets/youtube.png" alt="" className="socialMediaIcon" /></a>
      </div>
      <div className='aboutUs footerSection'>
        <h3>Sobre nosotros</h3>
        <p>Misión</p>
        <p>Eficacia</p>
      </div>
      <div className='helpSupport footerSection'>
        <h3>Ayuda y soporte</h3>
        <p>Contacto</p>
        <p>Preguntas</p>
      </div>
      <div className='termsPrivacy footerSection'>
        <h3>Términos y Privacidad</h3>
        <p>Blog de la comunidad</p>
        <p>Términos</p>
      </div>
    </footer>
  )
}