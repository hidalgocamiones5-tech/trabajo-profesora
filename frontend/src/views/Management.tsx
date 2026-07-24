import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockSolicitudes } from '../data/mockData';
import type { SolicitudTicket } from '../types';
import { Search, Plus, Filter, ChevronLeft, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export const Management = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SolicitudTicket | null>(null);
  const [formType, setFormType] = useState('');

  const renderList = () => (
    <motion.div 
      key="list"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl font-display font-semibold text-slate-800">Solicitudes y Tickets</h1>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-lemon-500 text-slate-900 rounded-lg hover:bg-lemon-600 transition-colors font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Crear Solicitud
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar ticket..." 
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lemon-500 focus:bg-white transition-all w-full sm:w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50">
              <Filter className="w-4 h-4" /> Filtros
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Prioridad</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">SLA</th>
                <th className="px-5 py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockSolicitudes.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 text-slate-500 font-mono text-xs">{ticket.id}</td>
                  <td className="px-5 py-4 font-medium text-slate-800">
                    {ticket.nombre}
                    <div className="text-xs text-slate-400 font-normal mt-0.5">{ticket.tipo}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={clsx(
                      "inline-flex px-2 py-1 rounded text-xs font-medium",
                      ticket.prioridad === 'urgente' ? "bg-red-50 text-red-600 border border-red-100" :
                      ticket.prioridad === 'alta' ? "bg-orange-50 text-orange-600 border border-orange-100" :
                      "bg-slate-100 text-slate-600 border border-slate-200"
                    )}>
                      {ticket.prioridad.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                      {ticket.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      {ticket.sla === 'en_riesgo' && <AlertCircle className="w-4 h-4 text-orange-500" />}
                      {ticket.sla === 'en_tiempo' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      <span className={clsx("text-xs font-medium", ticket.sla === 'en_riesgo' ? 'text-orange-600' : 'text-emerald-600')}>
                        {ticket.sla.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button 
                      onClick={() => setSelectedTicket(ticket)}
                      className="text-sm font-medium text-lemon-700 hover:underline"
                    >
                      Abrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderCreate = () => (
    <motion.div 
      key="create"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 max-w-3xl mx-auto space-y-6"
    >
      <button 
        onClick={() => setIsCreating(false)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver a Solicitudes
      </button>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-xl font-display font-semibold text-slate-800 mb-6">Nueva Solicitud</h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la solicitud</label>
            <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-lemon-500 focus:border-lemon-500 sm:text-sm" placeholder="Ej. Revisión de NDA con Microsoft" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Solicitud</label>
              <select 
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-lemon-500 focus:border-lemon-500 sm:text-sm"
              >
                <option value="">Seleccione un tipo...</option>
                <option value="Revisión de Contratos">Revisión de Contratos</option>
                <option value="Consultas Legales">Consultas Legales</option>
                <option value="Privacidad">Privacidad de Datos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-lemon-500 focus:border-lemon-500 sm:text-sm">
                <option>Media</option>
                <option>Alta</option>
                <option>Urgente</option>
              </select>
            </div>
          </div>

          <AnimatePresence>
            {formType === 'Revisión de Contratos' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-slate-100 overflow-hidden"
              >
                <h3 className="font-medium text-slate-800 mb-4">Formulario de Revisión de Contrato</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Origen del Contrato</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-slate-600"><input type="radio" name="origen" /> Proveedor</label>
                      <label className="flex items-center gap-2 text-sm text-slate-600"><input type="radio" name="origen" /> Cliente</label>
                      <label className="flex items-center gap-2 text-sm text-slate-600"><input type="radio" name="origen" /> Otro</label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Objetivos de la solicitud</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-lemon-600 focus:ring-lemon-500" /> Revisión Estándar</label>
                      <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-lemon-600 focus:ring-lemon-500" /> Negociación de Cláusulas</label>
                      <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="rounded text-lemon-600 focus:ring-lemon-500" /> Redacción desde cero</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Detalles o contexto adicional</label>
                    <textarea rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-lemon-500 focus:border-lemon-500 sm:text-sm" placeholder="Instrucciones especiales para el equipo legal..."></textarea>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 font-medium">Adjuntar borrador del contrato</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                setIsCreating(false);
                setSelectedTicket({
                  id: 'tk-1004', estado: 'recibida', nombre: 'Nueva Solicitud Generada', tipo: formType, fechaCreacion: 'Hoy', fechaLimite: '-', sla: 'en_tiempo', prioridad: 'media', solicitante: 'Usuario Actual', responsable: 'Sin asignar'
                });
              }}
              className="px-4 py-2 bg-lemon-500 text-slate-900 rounded-md font-medium text-sm hover:bg-lemon-600 transition-colors shadow-sm"
            >
              Guardar y Generar Ticket
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderDetail = () => {
    if (!selectedTicket) return null;
    const stages = ['Recibida', 'Revisando', 'Resolviendo', 'Resuelta'];
    const currentStageIndex = stages.findIndex(s => s.toLowerCase() === selectedTicket.estado.toLowerCase());

    return (
      <motion.div 
        key="detail"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="p-6 max-w-5xl mx-auto space-y-6"
      >
        <button 
          onClick={() => setSelectedTicket(null)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a Solicitudes
        </button>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-slate-800">{selectedTicket.nombre}</h1>
                <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  {selectedTicket.id}
                </span>
              </div>
              <p className="text-slate-500 text-sm">Solicitado por {selectedTicket.solicitante} • {selectedTicket.tipo}</p>
            </div>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors">
              Tomar Ticket
            </button>
          </div>

          <div className="mb-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-lemon-500 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${Math.max(0, currentStageIndex) * 33.33}%` }}></div>
            
            <div className="relative z-10 flex justify-between">
              {stages.map((stage, idx) => {
                const isCompleted = idx <= currentStageIndex;
                const isActive = idx === currentStageIndex;
                
                return (
                  <div key={stage} className="flex flex-col items-center">
                    <div className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors",
                      isCompleted ? "bg-lemon-500 border-lemon-500 text-slate-900" : "bg-white border-slate-300 text-slate-400",
                      isActive && "ring-4 ring-lemon-500/20"
                    )}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={clsx(
                      "mt-2 text-xs font-medium",
                      isActive ? "text-slate-900" : isCompleted ? "text-slate-600" : "text-slate-400"
                    )}>
                      {stage}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="font-medium text-slate-800 mb-4">Tareas de la etapa: {stages[currentStageIndex] || stages[0]}</h3>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-lemon-600 focus:ring-lemon-500" />
                <span className="text-sm font-medium text-slate-700">Recepción y Clasificación de Documentos</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-lemon-600 focus:ring-lemon-500" />
                <span className="text-sm font-medium text-slate-700">Asignación de Abogado Revisor</span>
              </label>
            </div>
            
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors">
              Finalizar etapa y avanzar
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {isCreating ? renderCreate() : selectedTicket ? renderDetail() : renderList()}
    </AnimatePresence>
  );
};
