import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, CheckCircle, Clock, 
  Search, Plus, Filter, Database, FileKey, ShieldAlert 
} from 'lucide-react';
import clsx from 'clsx';
import { mockChecklistPDP, mockRAT } from '../data/mockData';

type TabType = 'checklist' | 'rat' | 'arco' | 'repositorio';

export const Privacy = () => {
  const [activeTab, setActiveTab] = useState<TabType>('checklist');
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>('Diagnóstico Inicial');

  const tabs = [
    { id: 'checklist', label: 'Checklist DPO', icon: Shield },
    { id: 'rat', label: 'RAT (Tratamientos)', icon: Database },
    { id: 'arco', label: 'Derechos ARCO', icon: ShieldAlert },
    { id: 'repositorio', label: 'Repositorio & Consentimientos', icon: FileKey },
  ];

  const checklistCategorias = [
    'Diagnóstico Inicial',
    'Políticas y Procedimientos Internos',
    'Medidas de Seguridad',
    'Evaluación de Impacto (PIA)',
    'Respuesta a Incidentes',
    'Transferencia a Terceros'
  ];

  const renderChecklist = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Checklist de Cumplimiento PDP</h2>
          <p className="text-sm text-slate-500">Gestión de cumplimiento Ley 21.719 / 19.628</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <span className="text-xs font-semibold text-emerald-700">Completado: 45%</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-100">
        {checklistCategorias.map(categoria => (
          <div key={categoria} className="flex flex-col">
            <button
              onClick={() => setExpandedChecklist(expandedChecklist === categoria ? null : categoria)}
              className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors w-full text-left"
            >
              <span className="font-semibold text-slate-800 text-sm">{categoria}</span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {mockChecklistPDP.filter(c => c.categoria === categoria).length} tareas
              </span>
            </button>
            <AnimatePresence>
              {expandedChecklist === categoria && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-slate-50/50"
                >
                  <div className="px-5 pb-4 space-y-3 pt-2">
                    {mockChecklistPDP.filter(c => c.categoria === categoria).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={item.estado === 'completado'} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" readOnly />
                          <span className={clsx("text-sm font-medium", item.estado === 'completado' ? "text-slate-500 line-through" : "text-slate-700")}>
                            {item.nombre}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">{item.responsable}</span>
                          <span className={clsx(
                            "px-2 py-1 rounded text-[10px] font-semibold uppercase",
                            item.estado === 'completado' ? "bg-emerald-100 text-emerald-700" :
                            item.estado === 'atrasado' ? "bg-rose-100 text-rose-700" :
                            "bg-slate-100 text-slate-600"
                          )}>
                            {item.estado.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                    {mockChecklistPDP.filter(c => c.categoria === categoria).length === 0 && (
                      <div className="text-center py-4 text-sm text-slate-500">No hay tareas en esta categoría.</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderRAT = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Tratamientos</p>
            <p className="text-2xl font-bold text-slate-800">26</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
            <Database className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Completado</p>
            <p className="text-2xl font-bold text-emerald-600">29%</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Última Actualización</p>
            <p className="text-2xl font-bold text-slate-800">29/04/2026</p>
          </div>
          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-slate-600" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar tratamiento..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50">
              <Filter className="w-4 h-4" /> Filtros
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm">
            <Plus className="w-4 h-4" /> Nuevo Tratamiento
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-5 py-3 font-medium">Área</th>
                <th className="px-5 py-3 font-medium">Tratamiento</th>
                <th className="px-5 py-3 font-medium">Finalidad</th>
                <th className="px-5 py-3 font-medium">Categoría DP</th>
                <th className="px-5 py-3 font-medium">Base de Licitud</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockRAT.map(rat => (
                <tr key={rat.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-800">{rat.area}</td>
                  <td className="px-5 py-4 text-slate-600">{rat.tratamiento}</td>
                  <td className="px-5 py-4 text-slate-500 text-xs">{rat.finalidad}</td>
                  <td className="px-5 py-4 text-slate-500 text-xs">{rat.categoriaDP}</td>
                  <td className="px-5 py-4 text-slate-600 text-xs">{rat.baseLicitud}</td>
                  <td className="px-5 py-4">
                    <span className={clsx(
                      "inline-flex px-2 py-1 rounded text-[10px] font-semibold uppercase",
                      rat.estado === 'completado' ? "bg-emerald-100 text-emerald-700" :
                      rat.estado === 'borrador' ? "bg-slate-100 text-slate-600" :
                      "bg-amber-100 text-amber-700"
                    )}>
                      {rat.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs cursor-pointer">Ver/Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderARCO = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ l: 'Total', v: 45, c: 'text-slate-800' }, { l: 'Resueltas a tiempo', v: '92%', c: 'text-emerald-600' }, { l: 'En riesgo', v: 3, c: 'text-amber-600' }, { l: 'Atrasado', v: 1, c: 'text-rose-600' }].map((stat, i) => (
          <div key={i} className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">{stat.l}</p>
            <p className={clsx("text-2xl font-bold mt-1", stat.c)}>{stat.v}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center text-slate-500">
        <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-700">Matriz de Solicitudes ARCO</h3>
        <p className="text-sm mt-1 mb-4">Aquí se listarán las solicitudes de Portabilidad, Acceso, Rectificación y Cancelación.</p>
        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm cursor-pointer">
          Simular Solicitud ARCO
        </button>
      </div>
    </motion.div>
  );

  const renderRepositorio = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center text-slate-500">
        <FileKey className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-700">Repositorio Documental & Consentimientos</h3>
        <p className="text-sm mt-1">Centralización de cláusulas contractuales, consentimientos explícitos registrados y políticas vigentes.</p>
      </div>
    </motion.div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Privacidad y Datos Personales</h1>
        <p className="text-slate-500 mt-1">Gestión integral para el Oficial de Protección de Datos (DPO).</p>
      </div>

      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-max mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={clsx(
                "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                isActive ? "text-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="privacy-tabs"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'checklist' && <div key="checklist">{renderChecklist()}</div>}
          {activeTab === 'rat' && <div key="rat">{renderRAT()}</div>}
          {activeTab === 'arco' && <div key="arco">{renderARCO()}</div>}
          {activeTab === 'repositorio' && <div key="repositorio">{renderRepositorio()}</div>}
        </AnimatePresence>
      </div>
    </div>
  );
};
