import './Dashboard.css'

export function Dashboard({}) {

return (
    <>
    <NavBar />
        <div className="dashboardMainContainer">
            <div className="greetingContainer"> 
                <div className="UserPic">
                    <img className="actualPic" src="../../../public/assets/user.png" alt="" />
                </div>
                <div className="greeting">
                    <h3 className='bigGreeting'>
                        Hola, Juan David Caballero.
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