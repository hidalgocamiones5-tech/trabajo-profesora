import { Bell, Search, Download, FileText, Code, Mail, ChevronDown, Check, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const menuItems = ['Inicio', 'Cumplimiento', 'Gestión', 'Documentos', 'Reportes', 'Configuración'];

  const mockNotifications = [
    { id: 1, title: 'Reunión Transcrita', message: 'La transcripción de "Revisión Q2" está lista.', type: 'success', time: 'Hace 5 min' },
    { id: 2, title: 'Riesgo Crítico', message: 'Se detectó una vulnerabilidad en accesos.', type: 'warning', time: 'Hace 1 hora' },
    { id: 3, title: 'Normativa Atrasada', message: 'Ley de Protección de Datos vencida.', type: 'error', time: 'Hace 2 horas' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('Inicio')}>
            <div className="w-8 h-8 bg-lemon-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-800">---------------</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map(item => (
              <button
                key={item}
                onClick={() => setCurrentView(item)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === item 
                    ? 'bg-lemon-50 text-lemon-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          
          {/* Export Dropdown */}
          <div className="relative hidden sm:block">
            <button 
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            
            <AnimatePresence>
              {isExportOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50"
                >
                  <div className="py-1">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left">
                      <FileText className="w-4 h-4" /> Descargar PDF
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left">
                      <Code className="w-4 h-4" /> Copiar Markdown
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left border-t border-slate-100">
                      <Mail className="w-4 h-4" /> Enviar por Email
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-6 bg-slate-200 hidden lg:block"></div>
          
          <button className="text-slate-400 hover:text-slate-600">
            <Search className="w-5 h-5" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="text-slate-400 hover:text-slate-600 relative p-2 rounded-full hover:bg-slate-50 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 origin-top-right"
                >
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-semibold text-slate-800">Notificaciones</h3>
                    <button 
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {mockNotifications.map(notification => (
                      <div key={notification.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3">
                        <div className="mt-0.5 shrink-0">
                          {notification.type === 'success' && <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Check className="w-4 h-4" /></div>}
                          {notification.type === 'warning' && <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><AlertTriangle className="w-4 h-4" /></div>}
                          {notification.type === 'error' && <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600"><AlertTriangle className="w-4 h-4" /></div>}
                        </div>
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-semibold text-slate-800">{notification.title}</h4>
                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">{notification.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-snug">{notification.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                      Marcar todas como leídas
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-2 ml-2 pl-4 border-l border-slate-200 cursor-pointer">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-medium text-sm">
              FS
            </div>
            <div className="hidden sm:block text-sm">
              <div className="font-medium text-slate-700">Felipe Sanchez</div>
              <div className="text-slate-500 text-xs">JAC</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
