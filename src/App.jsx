import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import { Authentication } from './components/authentication/Authentication'
import { Dashboard } from './components/dashboard/Dashboard';


export function App() {

  return (
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Authentication />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}



