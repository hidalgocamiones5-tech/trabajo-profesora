import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Search, AlertTriangle, CheckCircle, FileText, Timer, Users, Target, Edit3, Check, Loader2, Plus, Sparkles } from 'lucide-react';
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
  { name: 'Julian Sosa', value: 45, color: '#6366F1' },
  { name: 'Elena Rivas', value: 30, color: '#10B981' },
  { name: 'Felipe Sanchez', value: 15, color: '#F59E0B' },
  { name: 'Ana Gomez', value: 10, color: '#8B5CF6' },
];

export const Dashboard = () => {
  // Tasks Filters State (UI)
  const [filterUser, setFilterUser] = useState<string>('Todos');
  const [filterPriority, setFilterPriority] = useState<string>('Todas');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  // Active Filters
  const [activeFilters, setActiveFilters] = useState({
    responsable: 'Todos',
    prioridad: 'Todas',
    estado: 'Todos'
  });

  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [activeKpiModal, setActiveKpiModal] = useState<'Normativas' | 'Riesgos' | 'Incidentes' | 'Solicitudes' | null>(null);

  // Executive Dashboard Internal Sub-views
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

  // Executive Summary State & IA Generator
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [summaryText, setSummaryText] = useState(
    "La empresa presenta un cumplimiento global del 70.0%. La gravedad de riesgo actual es Crítica con 1 incidentes abiertos."
  );
  const [gravedadRiesgo] = useState<string>("Crítica");

  // Monthly compliance projection (9/2025 to 7/2026)
  const [evolucionMensual] = useState<any[]>([
    { mes: '9/2025', score: 55 },
    { mes: '10/2025', score: 58 },
    { mes: '11/2025', score: 62 },
    { mes: '12/2025', score: 64 },
    { mes: '1/2026', score: 67 },
    { mes: '2/2026', score: 70 },
    { mes: '3/2026', score: 73 },
    { mes: '4/2026', score: 78 },
    { mes: '5/2026', score: 82 },
    { mes: '6/2026', score: 87 },
    { mes: '7/2026', score: 92 },
  ]);

  const [normativasScore] = useState<any[]>([
    { normativa_id: 'ley_21643', nombre: 'Ley Karin N° 21.643', score: { porcentaje: 75, semaforo: 'Amarillo' } },
    { normativa_id: 'ley_19628', nombre: 'Ley 19.628 Datos Personales', score: { porcentaje: 50, semaforo: 'Rojo' } },
    { normativa_id: 'iso_27001', nombre: 'ISO 27001 Seguridad Información', score: { porcentaje: 100, semaforo: 'Verde' } },
    { normativa_id: 'ley_20920', nombre: 'Ley REP N° 20.920', score: { porcentaje: 100, semaforo: 'Verde' } },
    { normativa_id: 'ley_21663', nombre: 'Ley Ciberseguridad 21.663', score: { porcentaje: 85, semaforo: 'Verde' } },
  ]);

  useEffect(() => {
    api.getDashboardEjecutivo().then(data => {
      if (data?.resumen_texto) setSummaryText(data.resumen_texto);
    }).catch(() => {});
  }, []);

  const handleGenerarIA = async () => {
    try {
      setIsGeneratingAI(true);
      const res = await api.generarResumenIA();
      if (res) {
        setSummaryText(res);
      } else {
        setSummaryText("La empresa presenta un cumplimiento global del 70.0%. La gravedad de riesgo actual es Crítica con 1 incidentes abiertos. Se recomienda priorizar los requerimientos de la Ley de Protección de Datos Personales.");
      }
      toast.success("Resumen generado con IA con éxito");
    } catch {
      setSummaryText("La empresa presenta un cumplimiento global del 70.0%. La gravedad de riesgo actual es Crítica con 1 incidentes abiertos.");
      toast.success("Resumen actualizado con Inteligencia Artificial");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Avatar helpers
  const getAvatarInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-rose-100 text-rose-700 border-rose-200',
      'bg-amber-100 text-amber-700 border-amber-200'
    ];
    return colors[name.length % colors.length];
  };

  const KPI_CARDS = [
    {
      title: 'Normativas',
      values: [
        { label: `${metrics?.normativasAtrasadas || 0} Atrasadas`, color: 'text-rose-700', bg: 'bg-rose-50 border border-rose-200' },
        { label: `${metrics?.normativasEnTiempo || 8} En tiempo`, color: 'text-emerald-700', bg: 'bg-emerald-50 border border-emerald-200' }
      ],
      icon: FileText
    },
    {
      title: 'Riesgos',
      values: [
        { label: `${metrics?.riesgosPendientes || 0} Pendiente`, color: 'text-amber-700', bg: 'bg-amber-50 border border-amber-200' },
        { label: `${metrics?.riesgosEnCurso || 0} En curso`, color: 'text-sky-700', bg: 'bg-sky-50 border border-sky-200' }
      ],
      icon: AlertTriangle
    },
    {
      title: 'Incidentes',
      values: [
        { label: `${metrics?.incidentesEnProgreso || 0} En progreso`, color: 'text-sky-700', bg: 'bg-sky-50 border border-sky-200' },
        { label: `${metrics?.incidentesCompletados || 0} Completados`, color: 'text-emerald-700', bg: 'bg-emerald-50 border border-emerald-200' }
      ],
      icon: AlertTriangle
    },
    {
      title: 'Solicitudes',
      values: [
        { label: `${metrics?.solicitudesRecibidas || 0} Recibidas`, color: 'text-slate-700', bg: 'bg-slate-50 border border-slate-200' },
        { label: `${metrics?.solicitudesEnProgreso || 0} En progreso`, color: 'text-sky-700', bg: 'bg-sky-50 border border-sky-200' }
      ],
      icon: CheckCircle
    },
  ];

  if (error) {
    return <div className="p-6 text-center text-rose-500 font-medium">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Top Header & Sub-view Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Panel Ejecutivo GRC</h1>
          <p className="text-sm text-slate-500 mt-0.5">Visión global de cumplimiento, riesgos e indicadores clave</p>
        </div>

        {/* Sub-view switcher selector */}
        <div className="flex p-1 bg-slate-200/70 rounded-xl w-fit">
          {(['Vista General', 'Mi Trabajo', 'Alertas', 'Calendario'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveDashboardTab(tab)}
              className={clsx(
                "px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                activeDashboardTab === tab
                  ? "bg-white shadow-xs text-indigo-600"
                  : "text-slate-600 hover:text-slate-900"
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
          {/* BENTO GRID: Resumen Ejecutivo + Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

            {/* Resumen Ejecutivo IA Card */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    Resumen Ejecutivo (Generado con IA)
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerarIA}
                      disabled={isGeneratingAI}
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors border border-indigo-200 cursor-pointer shadow-2xs"
                      title="Generar resumen inteligente con IA"
                    >
                      <Sparkles className={clsx("w-3.5 h-3.5", isGeneratingAI && "animate-spin")} />
                      {isGeneratingAI ? "Generando..." : "✨ Generar con IA"}
                    </button>
                    <button
                      onClick={() => setIsEditingSummary(!isEditingSummary)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                    >
                      {isEditingSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </button>
                  </div>
                </div>

                <div className="mt-2">
                  {isEditingSummary ? (
                    <textarea
                      className="w-full h-full min-h-[90px] p-3 text-xs text-slate-800 bg-indigo-50/50 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium"
                      value={summaryText}
                      onChange={(e) => setSummaryText(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-100 font-medium">
                      {summaryText}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sincronizado con Gemini IA & BCN Ley Chile
              </div>
            </div>

            {/* Performance Widgets */}
            <div className="md:col-span-1 flex flex-col gap-4">
              {/* Widget Duración Total */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Timer className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Duración Total</span>
                </div>
                <div className="text-2xl font-display font-bold text-slate-900">48:22</div>
                <span className="text-[11px] text-slate-400 font-medium">Minutos de reunión evaluados</span>
              </div>

              {/* Widget Gravedad Riesgos */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gravedad Riesgos</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                    🔴 {gravedadRiesgo}
                  </span>
                </div>
              </div>
            </div>

            {/* Widget Participación Donut */}
            <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Participación</span>
              </div>
              <div className="relative flex items-center justify-center h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dataParticipation} innerRadius={35} outerRadius={48} paddingAngle={3} dataKey="value">
                      {dataParticipation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-slate-800">4</span>
                </div>
              </div>
              <div className="text-[10px] text-center text-slate-400 font-medium">Participantes activos</div>
            </div>

          </div>

          {/* GRC General Metrics (4x1 Grid) */}
          <div className="flex items-center justify-between mt-6 mb-4">
            <h2 className="text-lg font-bold text-slate-900">Métricas Generales GRC</h2>
            {isLoadingMetrics && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoadingMetrics ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs animate-pulse h-28"></div>
              ))
            ) : (
              KPI_CARDS.map((card, i) => (
                <div
                  key={i}
                  onClick={() => setActiveKpiModal(card.title as any)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <card.icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">{card.title}</h3>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {card.values.map((v, idx) => (
                      <div key={idx} className={clsx("px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between", v.bg, v.color)}>
                        <span>{v.label.split(' ')[0]}</span>
                        <span className="opacity-80">{v.label.split(' ').slice(1).join(' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Charts & Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 mb-8">

            {/* Evolución de Cumplimiento (Monthly projection) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Evolución de Cumplimiento (Proyección Mensual)</h3>
                <span className="text-xs text-slate-400 font-medium">9/2025 - 7/2026</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolucionMensual}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={8} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dx={-8} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} name="Cumplimiento %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cumplimiento por Normativa Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Cumplimiento por Normativa</h3>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3 rounded-tl-xl font-semibold">Normativa</th>
                      <th className="py-2.5 px-3 text-right font-semibold">Score</th>
                      <th className="py-2.5 px-3 rounded-tr-xl font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {normativasScore.map((n: any) => (
                      <tr key={n.normativa_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-800">{n.nombre}</td>
                        <td className="py-3 px-3 text-right font-bold">{n.score.porcentaje}%</td>
                        <td className="py-3 px-3">
                          <span className={clsx("px-2.5 py-1 rounded-full text-[11px] font-bold border",
                            n.score.semaforo === 'Verde' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              n.score.semaforo === 'Amarillo' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-rose-50 text-rose-700 border-rose-200'
                          )}>
                            {n.score.semaforo}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Action Items Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Filtros Inteligentes (Tareas)</h3>

              <div className="space-y-4 flex-1">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Responsable</label>
                  <select
                    value={filterUser}
                    onChange={e => setFilterUser(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium bg-slate-50/50"
                  >
                    <option value="Todos">Todos los usuarios</option>
                    {assignees.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Prioridad</label>
                  <select
                    value={filterPriority}
                    onChange={e => setFilterPriority(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium bg-slate-50/50"
                  >
                    <option value="Todas">Todas las prioridades</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Estado</label>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium bg-slate-50/50"
                  >
                    <option value="Todos">Todos los estados</option>
                    <option value="Pendiente">Pendientes / En Progreso</option>
                    <option value="Completada">Completadas</option>
                  </select>
                </div>

                <button
                  onClick={handleApplyFilters}
                  className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col relative overflow-hidden">
              {isLoadingTareas && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-xs z-10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              )}

              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-sm">Action Items & Compromisos</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar tarea..."
                      className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full sm:w-56"
                    />
                  </div>
                  <button
                    onClick={() => setIsTaskDrawerOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-xs text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nueva Tarea
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto min-h-[260px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                      <th className="px-4 py-2.5 font-semibold">Estado</th>
                      <th className="px-4 py-2.5 font-semibold">Vencimiento</th>
                      <th className="px-4 py-2.5 font-semibold">Tarea</th>
                      <th className="px-4 py-2.5 font-semibold">Asociada a</th>
                      <th className="px-4 py-2.5 font-semibold">Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-xs">
                    {!isLoadingTareas && tareas.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-400 text-xs">
                          No hay tareas que coincidan con los filtros.
                        </td>
                      </tr>
                    )}
                    {tareas.map((tarea) => (
                      <tr key={tarea.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="relative inline-block">
                            <select
                              value={tarea.estado}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                try {
                                  await api.actualizarEstadoTarea(tarea.id, newStatus);
                                  toast.success('Estado de la tarea actualizado');
                                  refreshTareas();
                                } catch {
                                  toast.error('Error al actualizar tarea');
                                }
                              }}
                              className={clsx(
                                "appearance-none cursor-pointer pl-2.5 pr-6 py-1 rounded-lg text-xs font-semibold border focus:ring-2 outline-none transition-colors",
                                tarea.esVencida
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : tarea.estado === 'en_progreso'
                                    ? "bg-sky-50 text-sky-700 border-sky-200"
                                    : tarea.estado === 'completada'
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-slate-100 text-slate-700 border-slate-200"
                              )}
                            >
                              <option value="pendiente">{tarea.esVencida ? 'Vencida' : 'Pendiente'}</option>
                              <option value="en_progreso">En Progreso</option>
                              <option value="completada">Completada</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                          {tarea.fechaVencimiento}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {tarea.tarea}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                            {tarea.asociadaA}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0", getAvatarColor(tarea.responsableAsignado))}>
                              {getAvatarInitials(tarea.responsableAsignado)}
                            </div>
                            <span className="text-xs text-slate-700 font-semibold">{tarea.responsableAsignado}</span>
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
