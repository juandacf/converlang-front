import './Authentication.css';
import { SignUp } from '../signUP/SignUp';
import { Login } from '../login/Login';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export function Authentication() {
  const [chosenAuth, setAuth] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      const role = decoded.roles?.[0];
      if (role === "admin") {
        navigate("/adminDashboard");
      } else if (role === "teacher") {
        navigate("/teacherDashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [navigate]);

  const authenticatorSwitch = () => {
    setAuth(chosenAuth + 1);
  };

  return (
    <div className="mainContainerAuth">
      <div className="smallContainer">
        <div className="halfPart loginLeft"></div>

        <div className="halfPart loginRight">
          <button onClick={authenticatorSwitch}>
            {chosenAuth % 2 === 0 ? 'Ya tengo cuenta' : 'No tengo una cuenta'}
          </button>

          {chosenAuth % 2 === 0 ? (
            <SignUp onSuccess={() => setAuth(1)} />
          ) : (
            <Login />
          )}
        </div>
      </div>
    </div>
  );
}
