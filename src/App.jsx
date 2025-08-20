import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import { Authentication } from './components/authentication/Authentication'
import { Dashboard } from './components/dashboard/Dashboard';
import { MatchUser } from './components/matchUser/MatchUser';
import { MatchTeacher } from './components/matchTeacher/matchTeacher';


export function App() {

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
      </Routes>
    </BrowserRouter>
  )
}



