
import { useState } from 'react'
import './App.css'
import { Authentication } from './components/authentication/Authentication'
import { BrowserRouter, Routes, Route } from "react-router-dom";

export function App() {

  return (
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Authentication />} />
      </Routes>
    </BrowserRouter>
  )
}



