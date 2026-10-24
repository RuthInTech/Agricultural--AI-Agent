import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './assets/css-files/global.css'
import './assets/css-files/intro-page.css'
import './assets/css-files/register-login.css'
import './assets/css-files/header.css'
import './assets/css-files/home-page.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)