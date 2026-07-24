import { useState } from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Search, Clock, AlertTriangle, CheckCircle, FileText, Timer, Users, Target, Edit3, Check, Loader2, Plus } from 'lucide-react';
import clsx from 'clsx';
import { useDashboard } from '../hooks/useDashboard';
import { TaskDrawer } from '../components/TaskDrawer';
import { KPIDetailsModal } from '../components/KPIDetailsModal';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { MyWork } from './MyWork';
import { AlertsCenter } from './AlertsCenter';
import { Calendar } from './Calendar';

const dataParticipation = [
  { name: 'Julian Sosa', value: 45, color: '#3b82f6' },
  { name: 'Elena Rivas', value: 30, color: '#10b981' },
  { name: 'Felipe Sanchez', value: 15, color: '#f59e0b' },
  { name: 'Ana', value: 10, color: '#8b5cf6' },
];

export const Dashboard = () => {
  // Tasks Filters State (UI)
  const [filterUser, setFilterUser] = useState<string>('Todos');
  const [filterPriority, setFilterPriority] = useState<string>('Todas');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  
  // Active Filters (sent to hook)
  const [activeFilters, setActiveFilters] = useState({
    responsable: 'Todos',
    prioridad: 'Todas',
    estado: 'Todos'
  });

  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [activeKpiModal, setActiveKpiModal] = useState<'Normativas' | 'Riesgos' | 'Incidentes' | 'Solicitudes' | null>(null);

  // Executive Dashboard Tabs
  const [activeDashboardTab, setActiveDashboardTab] = useState<'Vista General' | 'Mi Trabajo' | 'Alertas' | 'Calendario'>('Vista General');

  // Custom Hook (Mock API)
  const { metrics, tareas, assignees, isLoadingMetrics, isLoadingTareas, error, refreshTareas } = useDashboard(activeFilters);

  const handleApplyFilters = () => {
    setActiveFilters({
      responsable: filterUser,
      prioridad: filterPriority,
      estado: filterStatus
    });
  };

  // Executive Summary Inline Editing
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState("Durante la revisión trimestral, se acordó priorizar la actualización de normativas ISO 27001 para el próximo mes. Los riesgos críticos asociados a infraestructura cloud han sido mitigados en un 80%, pero persisten vulnerabilidades en el control de accesos que deben ser atendidas por el equipo de TI de inmediato.");

  // Avatar helper
  const getAvatarInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const getAvatarColor = (name: string) => {
    const colors = ['bg-indigo-100 text-indigo-700 border-indigo-200', 'bg-emerald-100 text-emerald-700 border-emerald-200', 'bg-rose-100 text-rose-700 border-rose-200', 'bg-amber-100 text-amber-700 border-amber-200'];
    return colors[name.length % colors.length];
  };

  const KPI_CARDS = [
    { 
      title: 'Normativas', 
      values: [
        { label: `${metrics?.normativasAtrasadas || 0} Atrasadas`, color: 'text-red-500', bg: 'bg-red-50' }, 
        { label: `${metrics?.normativasEnTiempo || 0} En tiempo`, color: 'text-lemon-600', bg: 'bg-lemon-50' }
      ], 
      icon: FileText 
    },
    { 
      title: 'Riesgos', 
      values: [
        { label: `${metrics?.riesgosPendientes || 0} Pendiente`, color: 'text-orange-500', bg: 'bg-orange-50' }, 
        { label: `${metrics?.riesgosEnCurso || 0} En curso`, color: 'text-blue-500', bg: 'bg-blue-50' }
      ], 
      icon: AlertTriangle 
    },
    { 
      title: 'Incidentes', 
      values: [
        { label: `${metrics?.incidentesEnProgreso || 0} En progreso`, color: 'text-blue-500', bg: 'bg-blue-50' }, 
        { label: `${metrics?.incidentesCompletados || 0} Completados`, color: 'text-emerald-500', bg: 'bg-emerald-50' }
      ], 
      icon: AlertTriangle 
    },
    { 
      title: 'Solicitudes', 
      values: [
        { label: `${metrics?.solicitudesRecibidas || 0} Recibidas`, color: 'text-slate-500', bg: 'bg-slate-50' }, 
        { label: `${metrics?.solicitudesEnProgreso || 0} En progreso`, color: 'text-blue-500', bg: 'bg-blue-50' }
      ], 
      icon: CheckCircle 
    },
  ];

  if (error) {
    return <div className="p-6 text-center text-red-500 font-medium">{error}</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4">
        <h1 className="text-2xl font-display font-semibold text-slate-800">Panel Ejecutivo</h1>
        
        {/* Pestañas Internas del Dashboard */}
        <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
          {['Vista General', 'Mi Trabajo', 'Alertas', 'Calendario'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveDashboardTab(tab as any)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeDashboardTab === tab 
                  ? "bg-white shadow-sm text-slate-900" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeDashboardTab === 'Mi Trabajo' && (
        <div className="-mx-6"><MyWork /></div>
      )}
      
      {activeDashboardTab === 'Alertas' && (
        <div className="-mx-6"><AlertsCenter /></div>
      )}
      
      {activeDashboardTab === 'Calendario' && (
        <div className="-mx-6"><Calendar /></div>
      )}

      {activeDashboardTab === 'Vista General' && (
        <>
          {/* INFORME EJECUTIVO - MÓDULO DE REUNIÓN BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        
        {/* Resumen Ejecutivo Editable */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative group flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Resumen Ejecutivo (Última Reunión)
            </h2>
            <button 
              onClick={() => setIsEditingSummary(!isEditingSummary)}
              className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
            >
              {isEditingSummary ? <Check className="w-4 h-4 text-emerald-500" /> : <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          </div>
          
          <div className="flex-1">
            {isEditingSummary ? (
              <textarea 
                className="w-full h-full min-h-[100px] p-3 text-sm text-slate-700 bg-indigo-50/50 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                autoFocus
              />
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">
                {summaryText}
              </p>
            )}
          </div>
        </div>

        {/* Widgets de Datos Rápidos */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Timer className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Duración Total</span>
            </div>
            <div className="text-3xl font-display font-bold text-slate-800">48:22</div>
            <span className="text-xs text-slate-400 mt-1">Minutos</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex-1 flex flex-col justify-center">
             <div className="flex items-center gap-2 text-slate-500 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Gravedad Riesgos</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse"></div>
              <span className="text-lg font-semibold text-slate-700">Crítica</span>
            </div>
          </div>
        </div>

        {/* Gráfico de Participación */}
        <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-slate-500 mb-4">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Participación</span>
          </div>
          <div className="flex-1 relative flex items-center justify-center -mt-4">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={dataParticipation} innerRadius={40} outerRadius={55} paddingAngle={2} dataKey="value">
                  {dataParticipation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-4">
               <span className="text-lg font-bold text-slate-700">4</span>
            </div>
          </div>
        </div>

      </div>
      {/* FIN MÓDULO BENTO REUNIÓN */}

      <div className="flex items-center justify-between mt-10 mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Métricas Generales GRC</h2>
        {isLoadingMetrics && <Loader2 className="w-5 h-5 text-lemon-500 animate-spin" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingMetrics ? (
          // Skeletons para las tarjetas
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse h-32">
               <div className="h-6 w-1/2 bg-slate-100 rounded mb-4"></div>
               <div className="h-8 w-full bg-slate-100 rounded mb-2"></div>
               <div className="h-8 w-full bg-slate-100 rounded"></div>
            </div>
          ))
        ) : (
          KPI_CARDS.map((card, i) => (
            <div 
              key={i} 
              onClick={() => setActiveKpiModal(card.title as any)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-lemon-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-4 transition-transform group-hover:scale-105">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:bg-lemon-50 group-hover:text-lemon-600 transition-colors">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-slate-700">{card.title}</h3>
              </div>
              <div className="flex flex-col gap-2">
                {card.values.map((v, idx) => (
                  <div key={idx} className={clsx("px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between", v.bg, v.color)}>
                    <span>{v.label.split(' ')[0]}</span>
                    <span className="opacity-80">{v.label.split(' ').slice(1).join(' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-6">Filtros Inteligentes (Tareas)</h3>
          
          <div className="space-y-5 flex-1 relative">
            {isLoadingMetrics && (
              <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center"></div>
            )}
            <div>
              <label className="text-sm font-medium text-slate-500 mb-2 block">Responsable</label>
              <select 
                value={filterUser}
                onChange={e => setFilterUser(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lemon-500 outline-none"
              >
                <option value="Todos">Todos los usuarios</option>
                {assignees.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-500 mb-2 block">Prioridad</label>
              <select 
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lemon-500 outline-none"
              >
                <option value="Todas">Todas las prioridades</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-500 mb-2 block">Estado</label>
              <select 
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lemon-500 outline-none"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Pendiente">Pendientes / En Progreso</option>
                <option value="Completada">Completadas</option>
              </select>
            </div>
            
            <button 
              onClick={handleApplyFilters}
              className="w-full mt-4 py-2 bg-lemon-500 hover:bg-lemon-600 text-slate-900 font-medium rounded-lg transition-colors shadow-sm"
            >
              Aplicar Filtro
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
          {isLoadingTareas && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-lemon-500 animate-spin" />
            </div>
          )}
          
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-semibold text-slate-800">Action Items de Reuniones</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar tarea..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lemon-500 focus:bg-white transition-all w-full sm:w-64"
                />
              </div>
              <button 
                onClick={() => setIsTaskDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-lemon-500 text-slate-900 font-medium rounded-lg hover:bg-lemon-600 transition-colors shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" />
                Nueva Tarea
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Vencimiento</th>
                  <th className="px-5 py-3 font-medium">Tarea</th>
                  <th className="px-5 py-3 font-medium">Asociada a</th>
                  <th className="px-5 py-3 font-medium">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!isLoadingTareas && tareas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-500 text-sm">
                      No hay tareas que coincidan con los filtros.
                    </td>
                  </tr>
                )}
                {tareas.map((tarea) => (
                  <tr key={tarea.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="relative inline-block">
                        <select
                          value={tarea.estado}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                                await api.actualizarEstadoTarea(tarea.id, newStatus);
                                toast.success('Estado de la tarea actualizado');
                                refreshTareas();
                            } catch(err) {
                                toast.error('Error al actualizar tarea');
                            }
                          }}
                          className={clsx(
                            "appearance-none cursor-pointer pl-2.5 pr-6 py-1 rounded-md text-xs font-medium border-none focus:ring-2 outline-none transition-colors",
                            tarea.esVencida 
                                ? "bg-red-50 text-red-600 focus:ring-red-500/50" 
                                : tarea.estado === 'en_progreso' 
                                    ? "bg-blue-50 text-blue-600 focus:ring-blue-500/50" 
                                    : tarea.estado === 'completada'
                                        ? "bg-emerald-50 text-emerald-600 focus:ring-emerald-500/50"
                                        : "bg-slate-100 text-slate-600 focus:ring-slate-500/50"
                          )}
                        >
                          <option value="pendiente">{tarea.esVencida ? 'Vencida' : 'Pendiente'}</option>
                          <option value="en_progreso">En Progreso</option>
                          <option value="completada">Completada</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center px-1">
                          <svg className={clsx("h-3 w-3", tarea.esVencida ? "text-red-500" : tarea.estado === 'en_progreso' ? "text-blue-500" : tarea.estado === 'completada' ? "text-emerald-500" : "text-slate-500")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {tarea.fechaVencimiento}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-800">
                      {tarea.tarea}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs">
                        {tarea.asociadaA}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* Avatar Dinámico */}
                        <div className={clsx("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border shrink-0", getAvatarColor(tarea.responsableAsignado))}>
                          {getAvatarInitials(tarea.responsableAsignado)}
                        </div>
                        <select 
                          value={tarea.responsableAsignado}
                          onChange={async (e) => {
                            await api.reasignarTarea(tarea.id, e.target.value);
                            refreshTareas();
                          }}
                          className="text-sm font-medium text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-slate-100 rounded px-1 py-0.5 -ml-1 transition-colors outline-none"
                        >
                          <option value={tarea.responsableAsignado}>{tarea.responsableAsignado}</option>
                          {assignees.filter(a => a !== tarea.responsableAsignado).map(a => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <TaskDrawer 
        isOpen={isTaskDrawerOpen}
        onClose={() => setIsTaskDrawerOpen(false)}
        onTaskCreated={() => refreshTareas()}
      />

      <KPIDetailsModal 
        isOpen={activeKpiModal !== null}
        onClose={() => setActiveKpiModal(null)}
        kpiType={activeKpiModal}
      />
        </>
      )}
    </motion.div>
  );
};
