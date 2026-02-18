import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import { Authentication } from './components/authentication/Authentication'
import { Login } from './components/login/Login';
import { SignUp } from './components/signUP/SignUp';
import { Dashboard } from './components/dashboard/Dashboard';
import { MatchUser } from './components/matchUser/MatchUser';
import { MatchTeacher } from './components/matchTeacher/MatchTeacher';
import { UserChat } from './components/userChat/UserChat';
import { TeacherDashboard } from "./components/teacher-Dashboard/TeacherDashboard";
import { AdminDashboard } from "./components/adminDashboard/AdminDashboard";
import { EditProfile } from "./components/editProfile/EditProfile";
import VideoCall from "./components/videoCall/VideoCall";
import UserPreferencesCard from "./components/preferences/Preferences";
import { UserRoute } from "./components/guards/UserRoute";
import { AdminRoute } from "./components/guards/AdminRoute";
import { TermsAndConditions } from "./components/termsAndConditions/TermsAndConditions";

export default function App() {

  const userExample = {  // Esta data se debe obtener de alguna forma después de hacer el login
    name: "Juan",
    lastname: "Caballero"
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Authentication />} />
        <Route path="/login" element={<div className="auth-page"><Login /></div>} />
        <Route path="/signup" element={<div className="auth-page"><SignUp /></div>} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

        {/* Rutas de usuario - admin no puede acceder */}
        <Route path="/dashboard" element={<UserRoute><Dashboard user={userExample} /></UserRoute>} />
        <Route path="/matchUser" element={<UserRoute><MatchUser /></UserRoute>} />
        <Route path="/matchTeacher" element={<UserRoute><MatchTeacher /></UserRoute>} />
        <Route path="/userChat" element={<UserRoute><UserChat /></UserRoute>} />
        <Route path="/teacherDashboard" element={<UserRoute><TeacherDashboard /></UserRoute>} />
        <Route path="/editProfile" element={<UserRoute><EditProfile /></UserRoute>} />
        <Route path="/videocall/:match_id" element={<UserRoute><VideoCall /></UserRoute>} />
        <Route path="/preferences" element={<UserRoute><UserPreferencesCard /></UserRoute>} />

        {/* Rutas de admin - usuario no puede acceder */}
        <Route path="/adminDashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  )
}



