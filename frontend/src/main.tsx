import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ProjectAccess } from './components/ProjectAccess.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProjectAccess>
      <AuthProvider>
        <Toaster position="bottom-right" />
        <App />
      </AuthProvider>
    </ProjectAccess>
  </StrictMode>,
)
