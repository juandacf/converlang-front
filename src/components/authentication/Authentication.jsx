import './Authentication.css'
import { SignUp } from '../signUP/SignUp'
import { Login } from '../login/login'

export function  Authentication() {
    return (
    <div className="mainContainer"> 
      <div className="smallContainer">
        <div className="halfPart loginLeft">

        </div>
        <div className="halfPart loginRight">
        <SignUp />
        </div>
      </div>
    </div>
  )
}
