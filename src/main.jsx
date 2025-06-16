import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import CombinedProviders from './contexts/CombinedProviders'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <CombinedProviders>
        <App />
      </CombinedProviders>
    </HashRouter>
  </StrictMode>,
)
