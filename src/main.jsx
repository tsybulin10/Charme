import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SalonProvider } from './context/SalonContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SalonProvider>
      <App />
    </SalonProvider>
  </StrictMode>,
)
