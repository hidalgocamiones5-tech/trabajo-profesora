import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ProjectAccess } from './components/ProjectAccess.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProjectAccess>
      <App />
    </ProjectAccess>
  </StrictMode>,
)
