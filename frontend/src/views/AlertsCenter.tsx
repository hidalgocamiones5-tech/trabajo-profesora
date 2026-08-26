// (desarrollado por el informe) - Vista Centro de Alertas
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { Bell, Settings, Eye, Trash2, X, CheckCircle2, ShieldAlert, AlertOctagon, Info, AlertTriangle, ExternalLink, Mail, MessageSquare, Sliders } from 'lucide-react';

interface Alerta {
  id: number;
  tipo: 'Critica' | 'Alta' | 'Media' | 'Informativa';
  titulo: string;
  descripcion: string;
  modulo: string;
  fecha: string;
  leida?: boolean;
}

export const AlertsCenter = () => {
  const [activeTab, setActiveTab] = useState('Todas');
  const [alertas, setAlertas] = useState<Alerta[]>([
    { id: 1, tipo: 'Critica', titulo: 'Documento Vencido', descripcion: 'El documento "Política de Seguridad de la Información" expiró hace 2 días. Requiere revisión urgente.', modulo: 'Documentos', fecha: 'Hoy 09:00', leida: false },
    { id: 2, tipo: 'Alta', titulo: 'Riesgo Elevado en TI', descripcion: 'Se ha detectado un nivel de riesgo alto en la matriz de infraestructura de TI sin plan de mitigación.', modulo: 'Riesgos', fecha: 'Hoy 10:30', leida: false },
    { id: 3, tipo: 'Media', titulo: 'Auditoría Próxima', descripcion: 'La auditoría semestral de cumplimiento Ley Karin comienza en 15 días.', modulo: 'Calendario', fecha: 'Ayer 15:45', leida: false },
    { id: 4, tipo: 'Informativa', titulo: 'Nueva Normativa Publicada', descripcion: 'Se ha publicado una actualización de la Ley N° 21.719 en el catálogo oficial de la BCN.', modulo: 'Normativas', fecha: 'Ayer 11:20', leida: true },
  ]);

  // Modals state
  const [selectedAlert, setSelectedAlert] = useState<Alerta | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Config settings state
  const [configEmail, setConfigEmail] = useState(true);
  const [configWhatsapp, setConfigWhatsapp] = useState(false);
  const [configSlaThreshold, setConfigSlaThreshold] = useState('2');

  const handleDiscard = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAlertas(prev => prev.filter(a => a.id !== id));
    toast.success('Alerta descartada de la bandeja');
  };

  const handleMarkAllAsRead = () => {
    setAlertas(prev => prev.map(a => ({ ...a, leida: true })));
    toast.success('Todas las alertas han sido marcadas como leídas');
  };

  const handleSaveConfig = () => {
    setIsConfigOpen(false);
    toast.success('Configuración de alertas guardada exitosamente ⚙️');
  };

  const getTipoColor = (tipo: string) => {
    switch(tipo) {
      case 'Critica': return 'bg-red-100 text-red-700 border-red-200';
      case 'Alta': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Media': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Informativa': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch(tipo) {
      case 'Critica': return <AlertOctagon className="w-5 h-5 text-red-600" />;
      case 'Alta': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'Media': return <ShieldAlert className="w-5 h-5 text-amber-600" />;
      case 'Informativa': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const tabs = ['Todas', 'Críticas', 'Altas', 'Medias', 'Informativas'];
  
  const alertasFiltradas = alertas.filter(a => {
    if (activeTab === 'Todas') return true;
    if (activeTab === 'Críticas') return a.tipo === 'Critica';
    if (activeTab === 'Altas') return a.tipo === 'Alta';
    if (activeTab === 'Medias') return a.tipo === 'Media';
    if (activeTab === 'Informativas') return a.tipo === 'Informativa';
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Centro de Alertas</h1>
          <p className="text-slate-500 mt-1">Monitoreo de notificaciones y eventos importantes en tiempo real</p>
        </div>
        <button 
          onClick={() => setIsConfigOpen(true)}
          className="px-5 py-2.5 bg-[#84CC16] hover:bg-[#65A30D] text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>Configurar Alertas</span>
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Panel Triage */}
        <div className="w-full md:w-1/4 border-r border-slate-100 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Triage de Alertas</h3>
          <ul className="space-y-2">
            {tabs.map(tab => {
              const count = tab === 'Todas' 
                ? alertas.length 
                : alertas.filter(a => {
                    if (tab === 'Críticas') return a.tipo === 'Critica';
                    if (tab === 'Altas') return a.tipo === 'Alta';
                    if (tab === 'Medias') return a.tipo === 'Media';
                    if (tab === 'Informativas') return a.tipo === 'Informativa';
                    return false;
                  }).length;

              return (
                <li key={tab}>
                  <button 
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex justify-between items-center cursor-pointer ${
                      activeTab === tab 
                        ? 'bg-white shadow-sm border border-slate-200 text-slate-800' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{tab}</span>
                    <span className={`py-0.5 px-2 rounded-full text-xs font-semibold ${
                      activeTab === tab ? 'bg-[#84CC16]/20 text-lime-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Lista de Alertas */}
        <div className="w-full md:w-3/4 p-0 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center sticky top-0 z-10">
            <span className="text-sm font-medium text-slate-500">Mostrando {alertasFiltradas.length} alerta(s)</span>
            {alertas.length > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-sm text-[#84CC16] hover:text-[#65A30D] font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Marcar todas como leídas
              </button>
            )}
          </div>
          
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            <AnimatePresence>
              {alertasFiltradas.map((alerta) => (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.2 }}
                  key={alerta.id}
                  className={`p-6 hover:bg-slate-50/80 transition-colors flex items-start space-x-4 ${alerta.leida ? 'bg-slate-50/40 opacity-75' : ''}`}
                >
                  <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${getTipoColor(alerta.tipo)} border`}>
                    {getTipoIcon(alerta.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{alerta.modulo}</span>
                        <h4 className="text-lg font-semibold text-slate-800 mt-0.5">{alerta.titulo}</h4>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{alerta.fecha}</span>
                    </div>
                    <p className="text-slate-600 mt-2 text-sm leading-relaxed">{alerta.descripcion}</p>
                    
                    <div className="mt-4 flex items-center space-x-3">
                      <button 
                        onClick={() => setSelectedAlert(alerta)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-slate-500" /> Ver detalle
                      </button>
                      <button 
                        onClick={(e) => handleDiscard(alerta.id, e)}
                        className="px-4 py-2 bg-transparent text-slate-400 hover:text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" /> Descartar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {alertasFiltradas.length === 0 && (
              <div className="p-16 text-center text-slate-400 space-y-3">
                <Bell className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
                <p className="text-slate-600 font-medium">No hay alertas en esta categoría</p>
                <p className="text-xs text-slate-400">Todo tu sistema se encuentra al día.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      <AnimatePresence>
        {selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${getTipoColor(selectedAlert.tipo)}`}>
                    {getTipoIcon(selectedAlert.tipo)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{selectedAlert.modulo}</span>
                    <h3 className="font-bold text-slate-800">{selectedAlert.titulo}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm text-slate-600">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Detalle del Evento</label>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">{selectedAlert.descripcion}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Nivel Severidad</label>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getTipoColor(selectedAlert.tipo)}`}>
                      {selectedAlert.tipo}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Marca de Tiempo</label>
                    <p className="text-slate-700 font-medium">{selectedAlert.fecha}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <button 
                  onClick={() => {
                    handleDiscard(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Descartar
                </button>
                <button 
                  onClick={() => {
                    toast.success(`Redirigiendo al módulo ${selectedAlert.modulo}...`);
                    setSelectedAlert(null);
                  }}
                  className="px-4 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-white rounded-xl text-sm font-medium shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Ir al Módulo</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Configuration */}
      <AnimatePresence>
        {isConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2">
                  <span className="p-2 bg-lime-100 text-[#84CC16] rounded-lg">
                    <Sliders className="w-5 h-5" />
                  </span>
                  <h3 className="font-semibold text-slate-800 text-lg">Configuración de Notificaciones</h3>
                </div>
                <button 
                  onClick={() => setIsConfigOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Channel Email */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Notificaciones por Correo</h4>
                      <p className="text-xs text-slate-500">Recibir alertas críticas y reportes en tu e-mail registrado</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={configEmail}
                    onChange={e => setConfigEmail(e.target.checked)}
                    className="w-5 h-5 accent-[#84CC16] rounded cursor-pointer"
                  />
                </div>

                {/* Channel WhatsApp */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Alertas vía WhatsApp (SLA Urgente)</h4>
                      <p className="text-xs text-slate-500">Avisos instantáneos para tareas vencidas o incidentes graves</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={configWhatsapp}
                    onChange={e => setConfigWhatsapp(e.target.checked)}
                    className="w-5 h-5 accent-[#84CC16] rounded cursor-pointer"
                  />
                </div>

                {/* Threshold SLA */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Umbral de Aviso Preventivo de SLA
                  </label>
                  <select 
                    value={configSlaThreshold}
                    onChange={e => setConfigSlaThreshold(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white text-slate-800 focus:ring-2 focus:ring-[#84CC16] outline-none"
                  >
                    <option value="1">Notificar 1 día antes del vencimiento</option>
                    <option value="2">Notificar 2 días antes del vencimiento</option>
                    <option value="5">Notificar 5 días antes del vencimiento</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
                <button 
                  onClick={() => setIsConfigOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-white rounded-xl text-sm font-medium shadow-sm transition-colors cursor-pointer"
                >
                  Guardar Preferencias
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
