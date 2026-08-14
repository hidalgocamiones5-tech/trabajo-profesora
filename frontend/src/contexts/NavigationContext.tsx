import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type ViewName = 'Inicio' | 'Cumplimiento' | 'Gestión' | 'Documentos' | 'Reportes' | 'Configuración';

interface NavigationState {
  currentView: ViewName;
  viewParams: Record<string, any>;
}

interface NavigationContextType extends NavigationState {
  navigate: (view: ViewName, params?: Record<string, any>) => void;
  clearParams: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<NavigationState>({
    currentView: 'Inicio',
    viewParams: {},
  });

  const navigate = (view: ViewName, params?: Record<string, any>) => {
    setState({
      currentView: view,
      viewParams: params || {},
    });
  };

  const clearParams = () => {
    setState(prev => ({ ...prev, viewParams: {} }));
  };

  return (
    <NavigationContext.Provider value={{ ...state, navigate, clearParams }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
