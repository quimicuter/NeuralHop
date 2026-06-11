import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/design-system.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// In development we avoid registering the PWA service worker
// and attempt to unregister any existing service workers to prevent
// stale precached assets (which can cause missing-config errors).
if (import.meta.env.MODE === 'production') {
  registerSW({ immediate: true })
} else {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister())
    }).catch(() => {})
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
