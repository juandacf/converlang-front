import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import { Authentication } from './components/authentication/Authentication'
import { Dashboard } from './components/dashboard/Dashboard';
import { MatchUser } from './components/matchUser/MatchUser';
import { MatchTeacher } from './components/matchTeacher/MatchTeacher';
import { UserChat } from './components/userChat/UserChat';
import { TeacherDashboard } from "./components/teacher-Dashboard/TeacherDashboard";
import {AdminDashboard}from "./components/adminDashboard/AdminDashboard";
import { EditProfile } from "./components/editProfile/editProfile";
import VideoCall from "./components/videoCall/VideoCall";

export default function App() {

  const userExample = {  // Esta data se debe obtener de alguna forma después de hacer el login
    name: "Juan",
    lastname: "Caballero"
  }


  return (
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Authentication />} />
        <Route path="/dashboard" element={<Dashboard user={userExample} />} />
        <Route path="/matchUser" element={<MatchUser />} />
        <Route path="/matchTeacher" element={<MatchTeacher />} />
        <Route path="/userChat" element={<UserChat />} />
        <Route path="/teacherDashboard" element={<TeacherDashboard />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/editProfile" element={<EditProfile />} />
        <Route path="/videocall/:match_id" element={<VideoCall />} />
      </Routes>
    </BrowserRouter>
  )
}



