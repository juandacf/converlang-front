import './Dashboard.css'

export function Dashboard({user}) {

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
            <div className='recentMatchContainer'>f</div>
            <div className='carrouselStatistics'>f</div>
            <div className='teacherContainer'>f</div>
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