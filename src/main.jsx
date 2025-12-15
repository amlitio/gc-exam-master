import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Mount the React app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// PWA registration (safe no-op in browsers without service workers)
// Registers /sw.js from your public folder to enable offline shell and "Add to Home Screen"
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch(() => {
        /* registration failed, ignore */
      })
  })
}
