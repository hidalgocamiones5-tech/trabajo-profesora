import { Bell, Search, Download, FileText, Code, Mail, ChevronDown, Check, AlertTriangle, X, Building2, ShieldCheck, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CommandPaletteModal } from '../CommandPaletteModal';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);

  // Single registered company state from API/Registration
  const [userCompany, setUserCompany] = useState<{ nombre: string; rut?: string } | null>(null);
  const [userName, setUserName] = useState<string>('Felipe Sanchez');
  const [userCargo, setUserCargo] = useState<string>('Administrador GRC & Legal');

  useEffect(() => {
    api.getMe().then((res) => {
      if (res?.name) setUserName(res.name);
      if (res?.cargo) setUserCargo(res.cargo);
      if (res?.empresa?.nombre) {
        setUserCompany({ nombre: res.empresa.nombre, rut: res.empresa.rut || undefined });
      }
    }).catch(() => {});
  }, []);

  const menuItems = ['Inicio', 'Cumplimiento', 'Gestión', 'Documentos', 'Reportes', 'Configuración'];

  const mockNotifications = [
    { id: 1, title: 'Ley Karin 21.643', message: 'Protocolo de prevención actualizado al 75%.', type: 'success', time: 'Hace 5 min' },
    { id: 2, title: 'Riesgo Crítico', message: 'Falta actualización en términos ARCO Ley 19.628.', type: 'warning', time: 'Hace 1 hora' },
    { id: 3, title: 'Alerta Normativa', message: 'Revisión anual de Reglamento Interno pendiente.', type: 'error', time: 'Hace 2 horas' },
  ];

  const handleExport = (format: string) => {
    setIsExportOpen(false);
    toast.success(`Exportando reporte en formato ${format}...`);
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo / Branding Configurable (Título no definido aún) */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentView('Inicio')}>
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg tracking-tight text-slate-900 leading-tight">
                  Plataforma GRC
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-indigo-600 uppercase leading-none">
                  COMPLIANCE & LEGALTECH CHILE
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>

            {/* Single Registered Company Display (Focus on the user's registered business) */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs font-semibold text-indigo-900 shadow-2xs">
              <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="font-bold">{userCompany?.nombre || 'TechCorp Chile S.A.'}</span>
                {userCompany?.rut && <span className="text-[10px] text-indigo-600 font-mono font-medium">({userCompany.rut})</span>}
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 ml-2">
              {menuItems.map(item => {
                const isActive = currentView === item;
                return (
                  <button
                    key={item}
                    onClick={() => setCurrentView(item)}
                    className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {item}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabHeader"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Cmd+K Search trigger button */}
            <button
              onClick={() => setIsCommandModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Buscar...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-slate-200 text-slate-400">⌘K</kbd>
            </button>

            {/* Export Dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-medium text-slate-700 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Exportar
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <AnimatePresence>
                {isExportOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 p-1"
                  >
                    <button onClick={() => handleExport('PDF')} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors text-left cursor-pointer">
                      <FileText className="w-4 h-4 text-rose-500" /> Exportar Informe PDF
                    </button>
                    <button onClick={() => handleExport('Markdown')} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors text-left cursor-pointer">
                      <Code className="w-4 h-4 text-emerald-500" /> Copiar Markdown
                    </button>
                    <button onClick={() => handleExport('Email')} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors text-left border-t border-slate-100 mt-1 pt-2 cursor-pointer">
                      <Mail className="w-4 h-4 text-sky-500" /> Enviar por Email
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="text-slate-400 hover:text-slate-600 relative p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 origin-top-right"
                  >
                    <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">Alertas GRC & Notificaciones</h3>
                      <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-50">
                      {mockNotifications.map(notification => (
                        <div key={notification.id} className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3">
                          <div className="mt-0.5 shrink-0">
                            {notification.type === 'success' && <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center"><Check className="w-3.5 h-3.5" /></div>}
                            {notification.type === 'warning' && <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center"><AlertTriangle className="w-3.5 h-3.5" /></div>}
                            {notification.type === 'error' && <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center"><AlertTriangle className="w-3.5 h-3.5" /></div>}
                          </div>
                          <div>
                            <div className="flex justify-between items-start mb-0.5">
                              <h4 className="text-xs font-semibold text-slate-800">{notification.title}</h4>
                              <span className="text-[10px] text-slate-400 ml-2 whitespace-nowrap">{notification.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-snug">{notification.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-90"
              >
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-xs">
                  {getInitials(userName)}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-slate-800 leading-none">{userName}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{userCargo}</div>
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 p-1"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="font-semibold text-xs text-slate-800">{userName}</div>
                      <div className="text-[10px] text-slate-400">{userCompany?.nombre || 'Empresa Registrada'}</div>
                    </div>
                    <button onClick={() => { setCurrentView('Configuración'); setIsProfileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left mt-1 cursor-pointer">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Mi Perfil & Empresa
                    </button>
                    <button onClick={() => { setIsProfileOpen(false); toast.success('Sesión activa'); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left border-t border-slate-100 mt-1 cursor-pointer">
                      <LogOut className="w-3.5 h-3.5 text-rose-500" /> Cerrar Sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Command Palette Modal (Cmd+K) */}
      <CommandPaletteModal
        isOpen={isCommandModalOpen}
        onClose={() => setIsCommandModalOpen(false)}
        onSelectView={(v) => setCurrentView(v)}
      />
    </>
  );
};
