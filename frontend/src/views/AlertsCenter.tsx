// (desarrollado por el informe) - Vista Centro de Alertas
import { useState } from 'react';
import { motion } from 'motion/react';

export const AlertsCenter = () => {
  const [activeTab, setActiveTab] = useState('Todas');
  
  // Datos simulados para el prototipo
  const alertas = [
    { id: 1, tipo: 'Critica', titulo: 'Documento Vencido', descripcion: 'El documento "Política de Seguridad" expiró hace 2 días.', modulo: 'Documentos', fecha: 'Hoy 09:00' },
    { id: 2, tipo: 'Alta', titulo: 'Riesgo Elevado', descripcion: 'Se ha detectado un riesgo alto en el área de TI.', modulo: 'Riesgos', fecha: 'Hoy 10:30' },
    { id: 3, tipo: 'Media', titulo: 'Auditoría Próxima', descripcion: 'La auditoría semestral comienza en 15 días.', modulo: 'Calendario', fecha: 'Ayer 15:45' },
    { id: 4, tipo: 'Informativa', titulo: 'Nueva Normativa', descripcion: 'Se ha publicado una actualización de la Ley Karin.', modulo: 'Normativas', fecha: 'Ayer 11:20' },
  ];

  const getTipoColor = (tipo: string) => {
    switch(tipo) {
      case 'Critica': return 'bg-red-100 text-red-700 border-red-200';
      case 'Alta': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Media': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Informativa': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch(tipo) {
      case 'Critica': return '🚨';
      case 'Alta': return '⚠️';
      case 'Media': return '⏱️';
      case 'Informativa': return 'ℹ️';
      default: return '🔔';
    }
  };

  const tabs = ['Todas', 'Críticas', 'Altas', 'Medias', 'Informativas'];
  const alertasFiltradas = activeTab === 'Todas' ? alertas : alertas.filter(a => a.tipo + 's' === activeTab || a.tipo === activeTab);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Centro de Alertas</h1>
          <p className="text-slate-500 mt-1">Monitoreo de notificaciones y eventos importantes</p>
        </div>
        <button className="px-5 py-2.5 bg-[#84CC16] hover:bg-[#65A30D] text-white rounded-xl font-medium transition-colors shadow-sm flex items-center space-x-2">
          <span>⚙️ Configurar Alertas</span>
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Panel Triage */}
        <div className="w-full md:w-1/4 border-r border-slate-100 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Triage</h3>
          <ul className="space-y-2">
            {tabs.map(tab => (
              <li key={tab}>
                <button 
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex justify-between items-center ${activeTab === tab ? 'bg-white shadow-sm border border-slate-200 text-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <span>{tab}</span>
                  {tab === 'Todas' ? (
                    <span className="bg-slate-200 text-slate-600 py-0.5 px-2 rounded-full text-xs">{alertas.length}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Lista de Alertas */}
        <div className="w-full md:w-3/4 p-0">
          <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center sticky top-0">
            <span className="text-sm font-medium text-slate-500">Mostrando {alertasFiltradas.length} alertas</span>
            <button className="text-sm text-slate-500 hover:text-slate-700">Marcar todas como leídas</button>
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {alertasFiltradas.map((alerta, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                key={alerta.id}
                className="p-6 hover:bg-slate-50 transition-colors flex items-start space-x-4"
              >
                <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${getTipoColor(alerta.tipo)} border`}>
                  {getTipoIcon(alerta.tipo)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{alerta.modulo}</span>
                      <h4 className="text-lg font-semibold text-slate-800 mt-1">{alerta.titulo}</h4>
                    </div>
                    <span className="text-xs text-slate-400">{alerta.fecha}</span>
                  </div>
                  <p className="text-slate-600 mt-2 text-sm leading-relaxed">{alerta.descripcion}</p>
                  
                  <div className="mt-4 flex space-x-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700 transition-colors">
                      Ver detalle
                    </button>
                    <button className="px-4 py-2 bg-transparent text-slate-500 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">
                      Descartar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {alertasFiltradas.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <div className="text-4xl mb-4">🎉</div>
                No hay alertas en esta categoría.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
