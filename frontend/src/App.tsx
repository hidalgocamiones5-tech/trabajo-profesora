import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Dashboard } from './views/Dashboard';
import { Compliance } from './views/Compliance';
import { Management } from './views/Management';
import { Reports } from './views/Reports';
import { Documents } from './views/Documents';
import { Configuration } from './views/Configuration';
import { Login } from './views/Login';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('Inicio');

  const renderView = () => {
    switch (currentView) {
      case 'Inicio':
        return <Dashboard key="inicio" />;
      case 'Cumplimiento':
        return <Compliance key="cumplimiento" />;
      case 'Gestión':
        return <Management key="gestion" />;
      case 'Documentos':
        return <Documents key="documentos" />;
      case 'Reportes':
        return <Reports key="reportes" />;
      case 'Configuración':
        return <Configuration key="configuracion" />;
      default:
        return (
          <div key="placeholder" className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">Próximamente</h2>
              <p className="text-slate-500">La vista de {currentView} está en construcción.</p>
            </div>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#F9FAFB] flex flex-col"
    >
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {renderView()}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

export default App;
