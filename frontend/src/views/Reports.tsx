import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockRiesgos, mockIncidentes } from '../data/mockData';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChevronLeft, Download, Filter, FileBarChart, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const REPORTS = [
  { id: 'riesgos', title: 'Reporte Analítico de Riesgos', description: 'Matriz térmica y distribución de riesgos', date: '29 Abr 2026' },
  { id: 'incidentes', title: 'Registro de Incidentes', description: 'Volumen y tiempos de resolución', date: '28 Abr 2026' },
  { id: 'normativas', title: 'Estado de Cumplimiento Global', description: 'Progreso por país y normativa', date: '25 Abr 2026' },
];

const barData = [
  { name: 'LemonTech Chile', Riesgos: 15, Incidentes: 4, Cumplimiento: 88 },
  { name: 'LemonTech Perú', Riesgos: 8, Incidentes: 2, Cumplimiento: 72 },
  { name: 'LemonTech Colombia', Riesgos: 12, Incidentes: 5, Cumplimiento: 80 },
  { name: 'Global', Riesgos: 5, Incidentes: 1, Cumplimiento: 95 },
];

const donutData = [
  { name: 'Cumplimiento Alto', value: 55, color: '#10b981' },
  { name: 'Cumplimiento Medio', value: 30, color: '#f59e0b' },
  { name: 'Riesgo Crítico', value: 15, color: '#f43f5e' },
];

const incidentTypesData = [
  { name: 'Acoso / Ley Karin', value: 40, color: '#ec4899' },
  { name: 'Fuga de Datos', value: 35, color: '#ef4444' },
  { name: 'Seguridad TI', value: 25, color: '#3b82f6' },
];

const mockComplianceDetails = [
  { id: 1, normativa: 'Ley N° 21.643 (Ley Karin)', pais: 'Chile', progreso: 90, estado: 'VERIFICADA', responsable: 'Elena Rivas' },
  { id: 2, normativa: 'Ley N° 21.719 (Protección Datos)', pais: 'Chile', progreso: 45, estado: 'EN_PROCESO', responsable: 'Felipe Sánchez' },
  { id: 3, normativa: 'Ley N° 20.393 (Responsabilidad Penal PJ)', pais: 'Chile', progreso: 100, estado: 'CUMPLIDA', responsable: 'Finanzas & Legal' },
  { id: 4, normativa: 'ISO 27001 (Seguridad Información)', pais: 'Global', progreso: 85, estado: 'VERIFICADA', responsable: 'Oficina TI' },
];

export const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const handleExportPDF = (reportName: string) => {
    toast.success(`Exportando ${reportName} a PDF... 📄`);
  };

  const handleExportExcel = (reportName: string) => {
    toast.success(`Exportando ${reportName} a Excel (XLSX)... 📊`);
  };

  const getMatrixColor = (impacto: number, probabilidad: number) => {
    const score = impacto * probabilidad;
    if (score >= 15) return 'bg-red-500';
    if (score >= 10) return 'bg-orange-500';
    if (score >= 5) return 'bg-yellow-400';
    return 'bg-emerald-400';
  };

  const renderList = () => (
    <motion.div 
      key="list"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <h1 className="text-2xl font-display font-semibold text-slate-800 mb-6">Reportes Analíticos Ejecutivos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORTS.map(report => (
          <div key={report.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-lime-100 text-[#84CC16] rounded-lg flex items-center justify-center mb-4">
                <FileBarChart className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-800 text-lg mb-2">{report.title}</h3>
              <p className="text-sm text-slate-500 mb-6">{report.description}</p>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs text-slate-400 font-medium">Actualizado: {report.date}</span>
              <button 
                onClick={() => setSelectedReport(report.id)}
                className="text-sm font-semibold text-[#84CC16] hover:text-[#65A30D] flex items-center gap-1 cursor-pointer"
              >
                Abrir Reporte →
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <button 
          onClick={() => setSelectedReport(null)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a Reportes
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => handleExportExcel('Reporte de Riesgos')}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button 
            onClick={() => handleExportPDF('Reporte de Riesgos')}
            className="flex items-center gap-2 px-4 py-2 bg-[#84CC16] text-white rounded-lg text-sm font-medium hover:bg-[#65A30D] shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-display font-semibold text-slate-800">Reporte Analítico de Riesgos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Matrix */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Matriz Térmica de Riesgos</h3>
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
            <h3 className="font-semibold text-slate-800 mb-6">Distribución por Severidad</h3>
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
                  <Bar dataKey="Riesgos" fill="#84CC16" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Detalle de Riesgos Registrados</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-600 font-medium hover:bg-slate-50 cursor-pointer">
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
                      "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold",
                      riesgo.estado === 'pendiente' ? "bg-red-50 text-red-600" :
                      riesgo.estado === 'en_curso' ? "bg-amber-50 text-amber-600" :
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

  const renderIncidentsReport = () => (
    <motion.div 
      key="incidents-report"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <button 
          onClick={() => setSelectedReport(null)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a Reportes
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => handleExportExcel('Registro de Incidentes')}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button 
            onClick={() => handleExportPDF('Registro de Incidentes')}
            className="flex items-center gap-2 px-4 py-2 bg-[#84CC16] text-white rounded-lg text-sm font-medium hover:bg-[#65A30D] shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-display font-semibold text-slate-800">Reporte Analítico de Incidentes y Denuncias</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Tipología de Incidentes</h3>
          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={incidentTypesData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {incidentTypesData.map((entry, index) => (
                    <Cell key={`cell-inc-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Volumen de Incidentes por Tenant</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="Incidentes" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Bandeja de Incidentes Registrados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-5 py-3 font-medium">Incidente</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockIncidentes.map((inc: any) => (
                <tr key={inc.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-medium text-slate-800">{inc.nombre}</td>
                  <td className="px-5 py-4 text-slate-600">{inc.tipo}</td>
                  <td className="px-5 py-4 text-slate-600">{inc.fecha}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                      {(inc.estado || '').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{inc.responsable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderNormativasReport = () => (
    <motion.div 
      key="normativas-report"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <button 
          onClick={() => setSelectedReport(null)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a Reportes
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => handleExportExcel('Estado de Cumplimiento Global')}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button 
            onClick={() => handleExportPDF('Estado de Cumplimiento Global')}
            className="flex items-center gap-2 px-4 py-2 bg-[#84CC16] text-white rounded-lg text-sm font-medium hover:bg-[#65A30D] shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-display font-semibold text-slate-800">Reporte de Estado de Cumplimiento Global</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">% Cumplimiento por Empresa / Sede</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="Cumplimiento" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Índice Global de Gobierno Corporativo</h3>
            <p className="text-xs text-slate-500 mb-6">Basado en reglas activas de la Biblioteca del Congreso Nacional (BCN)</p>
          </div>
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="text-5xl font-extrabold text-[#84CC16] tracking-tight">83.5%</div>
            <p className="text-sm font-semibold text-slate-700 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Nivel de Salud Legal Robusto
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mt-6">
            <div className="bg-[#84CC16] h-3 rounded-full" style={{ width: '83.5%' }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Desglose de Normativas Monitoreadas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-5 py-3 font-medium">Normativa</th>
                <th className="px-5 py-3 font-medium">País / Alcance</th>
                <th className="px-5 py-3 font-medium">Progreso (%)</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockComplianceDetails.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-medium text-slate-800">{c.normativa}</td>
                  <td className="px-5 py-4 text-slate-600">{c.pais}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 w-8">{c.progreso}%</span>
                      <div className="w-24 bg-slate-100 rounded-full h-2">
                        <div className="bg-[#84CC16] h-2 rounded-full" style={{ width: `${c.progreso}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={clsx(
                      "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold",
                      c.estado === 'CUMPLIDA' ? "bg-emerald-50 text-emerald-600" :
                      c.estado === 'VERIFICADA' ? "bg-blue-50 text-blue-600" :
                      "bg-amber-50 text-amber-600"
                    )}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{c.responsable}</td>
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
      {selectedReport === 'riesgos' && renderRiskReport()}
      {selectedReport === 'incidentes' && renderIncidentsReport()}
      {selectedReport === 'normativas' && renderNormativasReport()}
      {!selectedReport && renderList()}
    </AnimatePresence>
  );
};
