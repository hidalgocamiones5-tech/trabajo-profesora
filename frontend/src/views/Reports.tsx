import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockRiesgos } from '../data/mockData';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChevronLeft, Download, Filter, FileBarChart } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const REPORTS = [
  { id: 'riesgos', title: 'Reporte Analítico de Riesgos', description: 'Matriz térmica y distribución de riesgos', date: '29 Abr 2026' },
  { id: 'incidentes', title: 'Registro de Incidentes', description: 'Volumen y tiempos de resolución', date: '28 Abr 2026' },
  { id: 'normativas', title: 'Estado de Cumplimiento Global', description: 'Progreso por país y normativa', date: '25 Abr 2026' },
];

const barData = [
  { name: 'LemonTech Chile', Riesgos: 15 },
  { name: 'LemonTech Perú', Riesgos: 8 },
  { name: 'LemonTech Colombia', Riesgos: 12 },
  { name: 'Global', Riesgos: 5 },
];

const donutData = [
  { name: 'Cumplimiento Alto', value: 55, color: '#10b981' }, // emerald-500
  { name: 'Cumplimiento Medio', value: 30, color: '#f59e0b' }, // amber-500
  { name: 'Riesgo Crítico', value: 15, color: '#f43f5e' }, // rose-500
];

export const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const getMatrixColor = (impacto: number, probabilidad: number) => {
    const score = impacto * probabilidad;
    if (score >= 15) return 'bg-red-500'; // Extremo
    if (score >= 10) return 'bg-orange-500'; // Alto
    if (score >= 5) return 'bg-yellow-400'; // Medio
    return 'bg-emerald-400'; // Bajo
  };

  const renderList = () => (
    <motion.div 
      key="list"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <h1 className="text-2xl font-display font-semibold text-slate-800 mb-6">Reportes Analíticos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORTS.map(report => (
          <div key={report.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-lemon-50 text-lemon-600 rounded-lg flex items-center justify-center mb-4">
                <FileBarChart className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-800 text-lg mb-2">{report.title}</h3>
              <p className="text-sm text-slate-500 mb-6">{report.description}</p>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs text-slate-400 font-medium">Actualizado: {report.date}</span>
              <button 
                onClick={() => {
                  if (report.id === 'riesgos') setSelectedReport(report.id);
                  else toast.success(`Abriendo ${report.title}...`);
                }}
                className="text-sm font-medium text-indigo-700 hover:underline cursor-pointer"
              >
                Abrir Reporte
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderRiskReport = () => (
    <motion.div 
      key="risk-report"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setSelectedReport(null)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a Reportes
        </button>
        <button onClick={() => toast.success('Exportando reporte en PDF...')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer">
          <Download className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      <h1 className="text-2xl font-display font-semibold text-slate-800">Reporte Analítico de Riesgos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Matrix */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Matriz de Riesgos</h3>
          <div className="flex flex-col items-center">
            <div className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">Impacto (Y) x Probabilidad (X)</div>
            <div className="grid grid-cols-5 gap-1.5 w-full aspect-square relative">
              {[5, 4, 3, 2, 1].map((y) => (
                [1, 2, 3, 4, 5].map((x) => (
                  <div 
                    key={`${x}-${y}`} 
                    className={clsx(
                      "rounded-sm flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity", 
                      getMatrixColor(y, x)
                    )}
                    title={`Impacto: ${y}, Probabilidad: ${x}`}
                  >
                    <span className="text-white font-bold text-sm drop-shadow-sm">
                      {mockRiesgos.filter(r => r.impacto === y && r.probabilidad === x).length || ''}
                    </span>
                  </div>
                ))
              ))}
            </div>
            <div className="flex items-center justify-between w-full mt-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-400"></div> Bajo</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-yellow-400"></div> Medio</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-orange-500"></div> Alto</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500"></div> Extremo</div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-6">Renovación de Riesgos</h3>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-800">100%</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-6">Riesgos por Empresa</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="Riesgos" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Detalle de Riesgos</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-600 font-medium hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Filtrar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-5 py-3 font-medium">Riesgo</th>
                <th className="px-5 py-3 font-medium">Impacto x Prob.</th>
                <th className="px-5 py-3 font-medium">Empresa</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockRiesgos.map((riesgo) => (
                <tr key={riesgo.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-medium text-slate-800">{riesgo.nombre}</td>
                  <td className="px-5 py-4 text-slate-600">{riesgo.impacto} x {riesgo.probabilidad}</td>
                  <td className="px-5 py-4 text-slate-600">{riesgo.empresa}</td>
                  <td className="px-5 py-4">
                    <span className={clsx(
                      "inline-flex px-2 py-1 rounded text-xs font-medium",
                      riesgo.estado === 'pendiente' ? "bg-red-50 text-red-600" :
                      riesgo.estado === 'en_curso' ? "bg-orange-50 text-orange-600" :
                      "bg-emerald-50 text-emerald-600"
                    )}>
                      {riesgo.estado.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{riesgo.responsable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {selectedReport === 'riesgos' ? renderRiskReport() : renderList()}
    </AnimatePresence>
  );
};
