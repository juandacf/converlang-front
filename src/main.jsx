import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SocketProvider } from './context/SocketContext.jsx'

const root = createRoot(document.getElementById('root'))

root.render(
    <SocketProvider>
      <App />
    </SocketProvider>
)
