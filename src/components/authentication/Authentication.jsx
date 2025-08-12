import './Authentication.css'
import { SignUp } from '../signUP/SignUp'
import { useState } from 'react'
import { Login } from '../login/Login';

export function Authentication() {
  const [chosenAuth, setAuth] = useState(0);

  const authenticatorSwitch = () => {
    setAuth(chosenAuth + 1);
  };

  return (
    <div className="mainContainer"> 
      <div className="smallContainer">
        <div className="halfPart loginLeft">

        </div>
        <div className="halfPart loginRight">
          <button onClick={authenticatorSwitch}>
            {chosenAuth % 2 === 0 ? 'Ya tengo cuenta' : 'No tengo una cuenta'}
          </button>

          {chosenAuth % 2 === 0 ? <SignUp /> : <Login />}
        </div>
      </div>
    </div>
  );
}
