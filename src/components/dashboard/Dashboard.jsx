import './Dashboard.css'

export function Dashboard() {

return (
    <>
    <NavBar />
        <div className="dashboardMainContainer">
            <div className="greetingContainer"> 
                <div className='greetingLeft'></div>
                <div className='greetingRight'></div>
            </div>        
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