// (desarrollado por el informe) - Vista Calendario Dinámico
import { useState } from 'react';
import { motion } from 'motion/react';

export const Calendar = () => {
  const [view, setView] = useState('Mes');

  // Datos simulados para eventos de compliance
  const eventos = [
    { id: 1, titulo: 'Auditoría ISO 27001', fecha: '25', dia: 'Mié', tipo: 'Auditoria' },
    { id: 2, titulo: 'Vencimiento Contrato X', fecha: '28', dia: 'Sáb', tipo: 'Vencimiento' },
    { id: 3, titulo: 'Revisión Matriz Riesgos', fecha: '12', dia: 'Jue', tipo: 'Revision' },
  ];

  const getTipoEstilo = (tipo: string) => {
    switch (tipo) {
      case 'Auditoria': return 'bg-purple-100 text-purple-700 border-l-4 border-purple-500';
      case 'Vencimiento': return 'bg-red-100 text-red-700 border-l-4 border-red-500';
      case 'Revision': return 'bg-blue-100 text-blue-700 border-l-4 border-blue-500';
      default: return 'bg-slate-100 text-slate-700 border-l-4 border-slate-500';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Calendario de Compliance</h1>
          <p className="text-slate-500 mt-1">Visualización de eventos y obligaciones proyectadas</p>
        </div>
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
          {['Semana', 'Mes', 'Trimestre'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === v ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panel lateral de filtros/proyección */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Proyección 30 Días</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Auditorías</span>
                  <span className="font-semibold text-slate-800">2</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full w-1/4"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Vencimientos</span>
                  <span className="font-semibold text-slate-800">5</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full w-2/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grilla principal */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500">←</button>
            <h2 className="text-lg font-semibold text-slate-800">Noviembre 2026</h2>
            <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500">→</button>
          </div>
          
          <div className="p-6">
            {/* Simulación simplificada de lista para el prototipo en vez de cuadrícula completa */}
            <div className="space-y-4">
              {eventos.map((evento, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  key={evento.id} 
                  className={`flex items-center p-4 rounded-xl ${getTipoEstilo(evento.tipo)}`}
                >
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-white/50 rounded-lg mr-4 flex-shrink-0">
                    <span className="text-xs uppercase font-bold opacity-70">{evento.dia}</span>
                    <span className="text-2xl font-bold">{evento.fecha}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">{evento.titulo}</h4>
                    <span className="text-sm opacity-80 mt-1 inline-block">{evento.tipo}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
