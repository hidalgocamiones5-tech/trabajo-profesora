// (desarrollado por el informe) - Vista Portal "Mi Trabajo"
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/api';

export const MyWork = () => {
  const [tareas, setTareas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Para simplificar, obtenemos las tareas usando nuestro mock API / API real
    api.getTareas({}).then(data => {
      setTareas(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Cargando tu espacio de trabajo...</div>;
  }

  const tareasAtrasadas = tareas.filter(t => t.esVencida);
  const tareasPendientes = tareas.filter(t => !t.esVencida && t.estado !== 'completada');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mi Trabajo</h1>
        <p className="text-slate-500 mt-1">Resumen personal de obligaciones y tareas asignadas</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tareas Pendientes</h3>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">📋</span>
          </div>
          <div className="text-4xl font-bold text-slate-800">{tareasPendientes.length}</div>
          <p className="text-sm text-slate-500 mt-2">En curso para esta semana</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 flex flex-col relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Atrasadas</h3>
            <span className="p-2 bg-red-50 text-red-600 rounded-lg">⚠️</span>
          </div>
          <div className="text-4xl font-bold text-red-600 relative z-10">{tareasAtrasadas.length}</div>
          <p className="text-sm text-red-500 mt-2 relative z-10">Requieren atención inmediata</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-md p-6 flex flex-col text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-green-50 uppercase tracking-wider">Mi Rendimiento</h3>
            <span className="p-2 bg-white/20 rounded-lg text-white">📈</span>
          </div>
          <div className="text-4xl font-bold">85%</div>
          <p className="text-sm text-green-100 mt-2">Cumplimiento personal este mes</p>
        </motion.div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">Próximos Vencimientos</h2>
          <button className="text-sm font-medium text-[#84CC16] hover:text-[#65A30D]">Ver todas</button>
        </div>
        <ul className="divide-y divide-slate-100">
          {tareas.slice(0, 5).map((tarea, idx) => (
            <motion.li 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
              key={tarea.id} 
              className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-2 h-10 rounded-full ${tarea.esVencida ? 'bg-red-500' : 'bg-blue-400'}`}></div>
                <div>
                  <h4 className="text-md font-medium text-slate-800 group-hover:text-[#84CC16] transition-colors">{tarea.tarea}</h4>
                  <p className="text-sm text-slate-500 mt-1">Vence el: <span className="font-medium">{tarea.fechaVencimiento || tarea.fecha_vencimiento}</span></p>
                </div>
              </div>
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium transition-all shadow-sm">
                Gestionar
              </button>
            </motion.li>
          ))}
          {tareas.length === 0 && (
            <li className="p-8 text-center text-slate-500">No tienes tareas pendientes. ¡Buen trabajo!</li>
          )}
        </ul>
      </div>
    </div>
  );
};
