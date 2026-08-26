import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { Bell, Settings, Eye, Trash2, X, CheckCircle2, ShieldAlert, AlertOctagon, Info, AlertTriangle, ExternalLink, Mail, Sliders, Smartphone, Calendar, FileText, Scale, RefreshCw } from 'lucide-react';

interface Alerta {
  id: number;
  priority: 'critica' | 'alta' | 'media' | 'informativa';
  title: string;
  description: string;
  category: string;
  timestamp: string;
  impactoLegal: string;
  actionLabel: string;
  targetView: string;
}

const mockInitialAlerts: Alerta[] = [
  { 
    id: 1, 
    priority: 'critica', 
    title: 'Documento Vencido', 
    description: 'El documento "Política de Seguridad de la Información" expiró hace 2 días. Requiere revisión urgente para evitar sanciones en auditorías.', 
    category: 'Documentos', 
    timestamp: 'Hoy 09:00',
    impactoLegal: 'El no cumplimiento de la actualización anual de la Política de Seguridad supone una infracción grave según los estándares de ISO 27001 y posible multa de fiscalización.',
    actionLabel: 'Actualizar Documento',
    targetView: 'Documentos'
  },
  { 
    id: 2, 
    priority: 'alta', 
    title: 'Riesgo Elevado en TI', 
    description: 'Se ha detectado un nivel de riesgo alto en la matriz de infraestructura de TI sin plan de mitigación asociado.', 
    category: 'Riesgos', 
    timestamp: 'Hoy 10:30',
    impactoLegal: 'La falta de controles para un riesgo de nivel alto expone a la empresa a multas por negligencia en el cuidado de los datos personales (Ley 21.719).',
    actionLabel: 'Mitigar Riesgo',
    targetView: 'Riesgos'
  },
  { 
    id: 3, 
    priority: 'media', 
    title: 'Auditoría Próxima', 
    description: 'La auditoría semestral de cumplimiento Ley Karin comienza en 15 días.', 
    category: 'Calendario', 
    timestamp: 'Ayer 15:45',
    impactoLegal: 'La preparación para la auditoría garantiza que se pueda evidenciar el cumplimiento del protocolo de prevención de acoso.',
    actionLabel: 'Ver en Calendario',
    targetView: 'Calendario'
  },
  { 
    id: 4, 
    priority: 'informativa', 
    title: 'Nueva Normativa Publicada', 
    description: 'Se ha publicado una actualización de la Ley N° 21.719 en el catálogo oficial de la BCN.', 
    category: 'Normativas', 
    timestamp: 'Ayer 11:20',
    impactoLegal: 'Revisar la modificación legal para determinar si impacta directamente en la Matriz RAT (Registro de Actividades de Tratamiento).',
    actionLabel: 'Revisar Ley BCN',
    targetView: 'Cumplimiento'
  },
];

export const AlertsCenter = () => {
  const [alerts, setAlerts] = useState<Alerta[]>(mockInitialAlerts);
  const [activeTab, setActiveTab] = useState('Todas');
  
  // Modals state
  const [selectedAlert, setSelectedAlert] = useState<Alerta | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Config settings state
  const [configEmail, setConfigEmail] = useState(true);
  const [configInApp, setConfigInApp] = useState(true);
  const [configWhatsapp, setConfigWhatsapp] = useState(false);
  const [configSlaThreshold, setConfigSlaThreshold] = useState('15');
  const [configArco, setConfigArco] = useState(true);
  const [configBcn, setConfigBcn] = useState(true);
  const [configKarin, setConfigKarin] = useState(true);

  const handleDiscard = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast.success('Alerta descartada correctamente');
  };

  const handleMarkAllAsRead = () => {
    setAlerts([]);
    toast.success('Todas las alertas han sido marcadas como leídas');
  };

  const handleRestoreAlerts = () => {
    setAlerts(mockInitialAlerts);
    toast.success('Alertas de prueba restablecidas');
  };

  const handleSaveConfig = () => {
    setIsConfigOpen(false);
    toast.success('Configuración de alertas guardada exitosamente ⚙️');
  };

  const handleQuickAction = (alert: Alerta) => {
    toast.success(`Ejecutando acción: ${alert.actionLabel}...`);
    setSelectedAlert(null);
    setAlerts(prev => prev.filter(a => a.id !== alert.id));
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'critica': return 'bg-red-100 text-red-700 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'media': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'informativa': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadgeText = (priority: string) => {
    switch(priority) {
      case 'critica': return '🔴 Crítica';
      case 'alta': return '🟠 Alta';
      case 'media': return '🟡 Media';
      case 'informativa': return '🔵 Informativa';
      default: return '⚪ Baja';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'critica': return <AlertOctagon className="w-5 h-5 text-red-600" />;
      case 'alta': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'media': return <ShieldAlert className="w-5 h-5 text-amber-600" />;
      case 'informativa': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const tabs = ['Todas', 'Críticas', 'Altas', 'Medias', 'Informativas'];
  
  const alertsFiltered = alerts.filter(a => {
    if (activeTab === 'Todas') return true;
    if (activeTab.includes('Críticas')) return a.priority === 'critica';
    if (activeTab.includes('Altas')) return a.priority === 'alta';
    if (activeTab.includes('Medias')) return a.priority === 'media';
    if (activeTab.includes('Informativas')) return a.priority === 'informativa';
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
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Triage de Alertas
          </h3>
          <ul className="space-y-2">
            {tabs.map(tab => {
              const count = tab === 'Todas' 
                ? alerts.length 
                : alerts.filter(a => {
                    if (tab.includes('Críticas')) return a.priority === 'critica';
                    if (tab.includes('Altas')) return a.priority === 'alta';
                    if (tab.includes('Medias')) return a.priority === 'media';
                    if (tab.includes('Informativas')) return a.priority === 'informativa';
                    return false;
                  }).length;

              const isActive = activeTab === tab;

              return (
                <li key={tab}>
                  <button 
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors flex justify-between items-center cursor-pointer ${
                      isActive 
                        ? 'bg-[#84CC16]/10 border border-[#84CC16]/20 text-lime-900 font-semibold shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-100 border border-transparent font-medium'
                    }`}
                  >
                    <span>{tab}</span>
                    <span className={`py-0.5 px-2 rounded-full text-xs ${
                      isActive ? 'bg-[#84CC16] text-white' : 'bg-slate-200 text-slate-600 font-semibold'
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
        <div className="w-full md:w-3/4 p-0 flex flex-col relative min-h-[500px]">
          <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center sticky top-0 z-10">
            <span className="text-sm font-medium text-slate-500">Mostrando {alertsFiltered.length} alerta(s)</span>
            {alerts.length > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-sm text-[#84CC16] hover:text-[#65A30D] font-semibold transition-colors flex items-center gap-1 cursor-pointer bg-[#84CC16]/10 px-3 py-1.5 rounded-lg"
              >
                <CheckCircle2 className="w-4 h-4" /> Marcar todas como leídas
              </button>
            )}
          </div>
          
          <div className="divide-y divide-slate-100 overflow-y-auto">
            <AnimatePresence>
              {alertsFiltered.map((alerta) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.2 }}
                  key={alerta.id}
                  className="p-6 hover:bg-slate-50/80 transition-colors flex items-start space-x-4"
                >
                  <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${getPriorityColor(alerta.priority)} border shadow-xs`}>
                    {getPriorityIcon(alerta.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{alerta.category}</span>
                        <h4 className="text-lg font-semibold text-slate-800 mt-0.5">{alerta.title}</h4>
                      </div>
                      <span className="text-xs font-medium text-slate-400 flex-shrink-0 bg-slate-100 px-2.5 py-1 rounded-full">{alerta.timestamp}</span>
                    </div>
                    <p className="text-slate-600 mt-2 text-sm leading-relaxed">{alerta.description}</p>
                    
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button 
                        onClick={() => setSelectedAlert(alerta)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-slate-500" /> Ver detalle
                      </button>
                      <button 
                        onClick={(e) => handleDiscard(alerta.id, e)}
                        className="px-4 py-2 bg-transparent text-slate-400 hover:text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" /> Descartar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Estado Vacío Amigable */}
            {alertsFiltered.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-20 h-20 bg-lime-50 rounded-full flex items-center justify-center mb-5 border-4 border-white shadow-sm">
                  <CheckCircle2 className="w-10 h-10 text-[#84CC16]" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">¡Excelente!</h3>
                <p className="text-slate-500 font-medium max-w-sm mb-6">No tienes alertas pendientes de atención en esta categoría. Todo está en orden.</p>
                <button 
                  onClick={handleRestoreAlerts}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" /> Restablecer alertas de prueba
                </button>
              </motion.div>
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
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 relative">
                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: selectedAlert.priority === 'critica' ? '#ef4444' : selectedAlert.priority === 'alta' ? '#f97316' : selectedAlert.priority === 'media' ? '#f59e0b' : '#3b82f6' }}></div>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${getPriorityColor(selectedAlert.priority)}`}>
                    {getPriorityIcon(selectedAlert.priority)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{selectedAlert.category}</span>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{selectedAlert.title}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(selectedAlert.priority)}`}>
                    {getPriorityBadgeText(selectedAlert.priority)}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold flex items-center gap-1 border border-slate-200">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedAlert.timestamp}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Descripción de la Alerta</label>
                  <p className="text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-xs">{selectedAlert.description}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Impacto Legal / Regulatorio</label>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-3 text-slate-700 shadow-xs">
                    <Scale className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">{selectedAlert.impactoLegal}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center mt-auto">
                <button 
                  onClick={() => handleDiscard(selectedAlert.id)}
                  className="px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer border border-transparent hover:border-red-100"
                >
                  <Trash2 className="w-4 h-4" /> Descartar
                </button>
                <button 
                  onClick={() => handleQuickAction(selectedAlert)}
                  className="px-5 py-2.5 bg-[#84CC16] hover:bg-[#65A30D] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{selectedAlert.actionLabel}</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#84CC16]"></div>
                <div className="flex items-center space-x-3">
                  <span className="p-2.5 bg-lime-100 text-[#84CC16] rounded-xl shadow-xs border border-lime-200">
                    <Sliders className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Configuración de Alertas</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Define cómo y cuándo recibirás notificaciones clave</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsConfigOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-8 overflow-y-auto">
                
                {/* Canales de Notificación */}
                <section>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Canales de Notificación</h4>
                  <div className="space-y-4">
                    {/* In-App */}
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                          <Bell className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Plataforma (In-App)</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Bandeja superior y Centro de Alertas</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={configInApp} onChange={e => setConfigInApp(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#84CC16]"></div>
                      </label>
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Correo Electrónico</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Recibir resúmenes diarios y alertas críticas</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={configEmail} onChange={e => setConfigEmail(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#84CC16]"></div>
                      </label>
                    </div>

                    {/* WhatsApp / SMS */}
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">WhatsApp / SMS</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Exclusivo para notificaciones de Urgencia/SLA rotos</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={configWhatsapp} onChange={e => setConfigWhatsapp(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#84CC16]"></div>
                      </label>
                    </div>
                  </div>
                </section>

                {/* Umbrales Legales y Operativos */}
                <section>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Umbrales Legales & Reglas</h4>
                  <div className="space-y-5 px-3">
                    
                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" /> Preaviso de Documentos por Vencer
                      </label>
                      <select 
                        value={configSlaThreshold}
                        onChange={e => setConfigSlaThreshold(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white text-slate-800 focus:ring-2 focus:ring-[#84CC16] outline-none shadow-xs"
                      >
                        <option value="1">Avisar 1 día antes del vencimiento</option>
                        <option value="7">Avisar 7 días antes del vencimiento</option>
                        <option value="15">Avisar 15 días antes del vencimiento</option>
                        <option value="30">Avisar 30 días antes del vencimiento</option>
                        <option value="60">Avisar 60 días antes del vencimiento</option>
                        <option value="90">Avisar 90 días antes del vencimiento</option>
                      </select>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-start space-x-3 cursor-pointer group">
                        <input type="checkbox" checked={configArco} onChange={e => setConfigArco(e.target.checked)} className="mt-1 w-4 h-4 text-[#84CC16] border-slate-300 rounded focus:ring-[#84CC16]" />
                        <div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-[#84CC16] transition-colors">Alerta de Riesgo ARCO (Ley 21.719)</span>
                          <p className="text-xs text-slate-500 font-medium">Notificar cuando un ticket de solicitud de privacidad tenga menos de 5 días de plazo.</p>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 cursor-pointer group">
                        <input type="checkbox" checked={configBcn} onChange={e => setConfigBcn(e.target.checked)} className="mt-1 w-4 h-4 text-[#84CC16] border-slate-300 rounded focus:ring-[#84CC16]" />
                        <div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-[#84CC16] transition-colors">Sincronización Normativas BCN</span>
                          <p className="text-xs text-slate-500 font-medium">Alertar si se publica una nueva ley/decreto vinculada a las categorías de la empresa.</p>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 cursor-pointer group">
                        <input type="checkbox" checked={configKarin} onChange={e => setConfigKarin(e.target.checked)} className="mt-1 w-4 h-4 text-[#84CC16] border-slate-300 rounded focus:ring-[#84CC16]" />
                        <div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-[#84CC16] transition-colors">Incidentes Críticos - Ley Karin</span>
                          <p className="text-xs text-slate-500 font-medium">Notificación inmediata ante registro de una nueva denuncia de acoso laboral/sexual.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </section>

              </div>

              <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3 mt-auto">
                <button 
                  onClick={() => setIsConfigOpen(false)}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-xs"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveConfig}
                  className="px-6 py-2.5 bg-[#84CC16] hover:bg-[#65A30D] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Guardar Configuración
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
