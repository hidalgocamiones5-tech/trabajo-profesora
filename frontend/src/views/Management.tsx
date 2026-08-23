import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockSolicitudes, mockRiesgos } from '../data/mockData';
import type { SolicitudTicket } from '../types';
import { 
  Search, Plus, Filter, ChevronLeft, UploadCloud, CheckCircle, 
  AlertCircle, AlertTriangle, MessageSquareWarning, Zap 
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

type TabType = 'solicitudes' | 'incidentes' | 'riesgos';

export const Management = () => {
  const [activeTab, setActiveTab] = useState<TabType>('solicitudes');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SolicitudTicket | null>(null);
  const [formType, setFormType] = useState('');
  const [isGeneratingRiesgos, setIsGeneratingRiesgos] = useState(false);

  const tabs = [
    { id: 'solicitudes', label: 'Mesa de Solicitudes', icon: AlertCircle },
    { id: 'incidentes', label: 'Incidentes (Ley Karin)', icon: MessageSquareWarning },
    { id: 'riesgos', label: 'Matriz de Riesgos', icon: AlertTriangle },
  ];

  // --- MESA DE SOLICITUDES ---
  const renderSolicitudesList = () => (
    <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h2 className="text-xl font-display font-semibold text-slate-800">Tickets y Solicitudes Legales</h2>
        <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm">
          <Plus className="w-4 h-4" /> Crear Solicitud
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar ticket..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 cursor-pointer">
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
                    <span className={clsx("inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wide",
                      ticket.prioridad === 'urgente' ? "bg-rose-100 text-rose-700" :
                      ticket.prioridad === 'alta' ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-600"
                    )}>{ticket.prioridad.toUpperCase()}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase">{ticket.estado}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      {ticket.sla === 'en_riesgo' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                      {ticket.sla === 'atrasada' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                      {ticket.sla === 'en_tiempo' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      <span className={clsx("text-xs font-bold", ticket.sla === 'en_riesgo' ? 'text-amber-600' : ticket.sla === 'atrasada' ? 'text-rose-600' : 'text-emerald-600')}>
                        {ticket.sla === 'en_tiempo' ? '🟢 EN TIEMPO' : ticket.sla === 'en_riesgo' ? '🟡 EN RIESGO' : '🔴 ATRASADA'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => setSelectedTicket(ticket)} className="text-indigo-600 font-medium text-xs hover:underline cursor-pointer">[Abrir]</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderSolicitudesCreate = () => (
    <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl space-y-6">
      <button onClick={() => setIsCreating(false)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium cursor-pointer">
        <ChevronLeft className="w-4 h-4" /> Volver a Solicitudes
      </button>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-xl font-display font-semibold text-slate-800 mb-6">Nueva Solicitud</h2>
        <div className="space-y-5">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la solicitud</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Ej. Revisión de Contrato Comercial" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select value={formType} onChange={(e) => setFormType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 sm:text-sm">
                <option value="">Seleccione...</option><option value="Revisión de Contratos">Revisión de Contratos</option><option value="Consulta Legal">Consulta Legal</option><option value="Solicitud ARCO">Solicitud ARCO</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 sm:text-sm"><option>Media</option><option>Alta</option><option>Urgente</option></select>
            </div>
          </div>
          {formType === 'Revisión de Contratos' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 border-t border-slate-100">
              <h3 className="font-medium text-slate-800 mb-4">Detalles del Contrato</h3>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Origen</label>
                  <div className="flex gap-4"><label className="text-sm text-slate-600"><input type="radio" name="origen" className="mr-1" /> Proveedor</label><label className="text-sm text-slate-600"><input type="radio" name="origen" className="mr-1" /> Cliente</label></div>
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 font-medium">Arrastra el contrato aquí o haz clic para subir</p>
                </div>
              </div>
            </motion.div>
          )}
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsCreating(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 cursor-pointer">Cancelar</button>
            <button onClick={() => { setIsCreating(false); toast.success('Solicitud creada exitosamente.'); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 cursor-pointer">Crear Solicitud</button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSolicitudesDetail = () => {
    if (!selectedTicket) return null;
    const stages = ['Recibida', 'Revisando', 'Resolviendo', 'Resuelta'];
    const currentStageIndex = stages.findIndex(s => s.toLowerCase() === selectedTicket.estado.toLowerCase());

    return (
      <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-5xl space-y-6">
        <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> Volver a Solicitudes
        </button>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-slate-800">{selectedTicket.nombre}</h1>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">{selectedTicket.id}</span>
              </div>
              <p className="text-slate-500 text-sm">Solicitado por {selectedTicket.solicitante} • {selectedTicket.tipo}</p>
            </div>
          </div>
          <div className="mb-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${(Math.max(0, currentStageIndex) / (stages.length - 1)) * 100}%` }}></div>
            <div className="relative z-10 flex justify-between">
              {stages.map((stage, idx) => {
                const isCompleted = idx <= currentStageIndex;
                const isActive = idx === currentStageIndex;
                return (
                  <div key={stage} className="flex flex-col items-center">
                    <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors", isCompleted ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300 text-slate-400", isActive && "ring-4 ring-indigo-600/20")}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={clsx("mt-2 text-xs font-bold uppercase tracking-wide", isActive ? "text-indigo-700" : isCompleted ? "text-slate-600" : "text-slate-400")}>{stage}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-6">
            <h3 className="font-semibold text-slate-800 mb-4">Checklist: {stages[currentStageIndex] || stages[0]}</h3>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-medium text-slate-700">Revisión inicial del documento legal</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-medium text-slate-700">Aprobación por gerencia</span>
              </label>
            </div>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors cursor-pointer" onClick={() => toast.success('Etapa finalizada')}>
              Finalizar etapa
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // --- CANAL DE INCIDENTES (Ley Karin) ---
  const renderIncidentes = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="bg-white border border-rose-200 rounded-xl shadow-sm p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-10"></div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
            <MessageSquareWarning className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Canal de Denuncias Seguro</h3>
            <p className="text-slate-500 text-sm mt-1 mb-4">Cumplimiento estricto Ley Karin 21.643. Este formulario es confidencial y garantiza la no represalia.</p>
            <button className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 shadow-sm cursor-pointer">
              Registrar Nuevo Incidente
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h4 className="font-semibold text-slate-800 text-sm">Investigaciones Internas</h4>
        </div>
        <div className="p-8 text-center text-slate-500 text-sm">No hay incidentes reportados activos.</div>
      </div>
    </motion.div>
  );

  // --- MATRIZ DE RIESGOS ---
  const handleGenerarRiesgos = () => {
    setIsGeneratingRiesgos(true);
    setTimeout(() => {
      setIsGeneratingRiesgos(false);
      toast.success('Riesgos generados mediante IA.');
    }, 2500);
  };

  const renderRiesgos = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-800">Gestión Integral de Riesgos</h2>
          <p className="text-sm text-slate-500 mt-1">Identificación, evaluación y tratamiento.</p>
        </div>
        <button 
          onClick={handleGenerarRiesgos}
          disabled={isGeneratingRiesgos}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm shadow-sm disabled:opacity-70 cursor-pointer"
        >
          {isGeneratingRiesgos ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Zap className="w-4 h-4" /></motion.div> : <Zap className="w-4 h-4" />}
          {isGeneratingRiesgos ? 'Analizando perfil...' : '✨ Generar riesgos con IA'}
        </button>
      </div>

      {/* Matriz 5x5 Simulada Visualmente */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden">
        <h3 className="font-semibold text-slate-800 mb-4 text-sm">Matriz de Calor (Severidad)</h3>
        <div className="grid grid-cols-6 gap-1 max-w-2xl text-xs font-semibold">
          <div className="col-span-1 row-span-5 flex flex-col justify-center items-center -rotate-90 text-slate-400 uppercase tracking-widest min-h-[250px]">Probabilidad</div>
          <div className="col-span-5 grid grid-cols-5 gap-1">
            {/* Row 5 */}
            <div className="bg-yellow-200 h-12 rounded flex items-center justify-center">5</div>
            <div className="bg-orange-300 h-12 rounded flex items-center justify-center">10</div>
            <div className="bg-rose-400 h-12 rounded flex items-center justify-center text-white">15</div>
            <div className="bg-rose-500 h-12 rounded flex items-center justify-center text-white">20</div>
            <div className="bg-rose-600 h-12 rounded flex items-center justify-center text-white font-bold">25</div>
            {/* Row 4 */}
            <div className="bg-emerald-200 h-12 rounded flex items-center justify-center">4</div>
            <div className="bg-yellow-200 h-12 rounded flex items-center justify-center">8</div>
            <div className="bg-orange-300 h-12 rounded flex items-center justify-center">12</div>
            <div className="bg-rose-400 h-12 rounded flex items-center justify-center text-white">16</div>
            <div className="bg-rose-500 h-12 rounded flex items-center justify-center text-white">20</div>
            {/* Row 3 */}
            <div className="bg-emerald-300 h-12 rounded flex items-center justify-center">3</div>
            <div className="bg-emerald-200 h-12 rounded flex items-center justify-center">6</div>
            <div className="bg-yellow-200 h-12 rounded flex items-center justify-center">9</div>
            <div className="bg-orange-300 h-12 rounded flex items-center justify-center">12</div>
            <div className="bg-rose-400 h-12 rounded flex items-center justify-center text-white">15</div>
            {/* Row 2 */}
            <div className="bg-emerald-400 h-12 rounded flex items-center justify-center text-white">2</div>
            <div className="bg-emerald-300 h-12 rounded flex items-center justify-center">4</div>
            <div className="bg-emerald-200 h-12 rounded flex items-center justify-center">6</div>
            <div className="bg-yellow-200 h-12 rounded flex items-center justify-center">8</div>
            <div className="bg-orange-300 h-12 rounded flex items-center justify-center">10</div>
            {/* Row 1 */}
            <div className="bg-emerald-500 h-12 rounded flex items-center justify-center text-white">1</div>
            <div className="bg-emerald-400 h-12 rounded flex items-center justify-center text-white">2</div>
            <div className="bg-emerald-300 h-12 rounded flex items-center justify-center">3</div>
            <div className="bg-emerald-200 h-12 rounded flex items-center justify-center">4</div>
            <div className="bg-yellow-200 h-12 rounded flex items-center justify-center">5</div>
          </div>
          <div className="col-span-1"></div>
          <div className="col-span-5 text-center text-slate-400 uppercase tracking-widest mt-2">Impacto</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-3 font-semibold">Riesgo</th>
              <th className="px-5 py-3 font-semibold text-center">P x I</th>
              <th className="px-5 py-3 font-semibold">Estado</th>
              <th className="px-5 py-3 font-semibold">Tratamiento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockRiesgos.map(r => {
              const severidad = r.probabilidad * r.impacto;
              const color = severidad >= 15 ? 'bg-rose-100 text-rose-700' : severidad >= 8 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
              return (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-800">{r.nombre}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={clsx("inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold", color)}>{severidad}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wide">{r.estado}</span>
                  </td>
                  <td className="px-5 py-4">
                    <select className="px-2 py-1 text-xs border border-slate-200 rounded-md bg-white focus:ring-indigo-500">
                      <option>Mitigar</option><option>Transferir</option><option>Aceptar</option><option>Eliminar</option>
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Gestión GRC</h1>
        <p className="text-slate-500 mt-1">Ticketing, incidentes y análisis de riesgos centralizado.</p>
      </div>

      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-max mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as TabType); setIsCreating(false); setSelectedTicket(null); }}
              className={clsx(
                "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                isActive ? "text-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              {isActive && (
                <motion.div layoutId="management-tabs" className="absolute inset-0 bg-white rounded-lg shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'solicitudes' && (
            <div key="solicitudes">
              {isCreating ? renderSolicitudesCreate() : selectedTicket ? renderSolicitudesDetail() : renderSolicitudesList()}
            </div>
          )}
          {activeTab === 'incidentes' && <div key="incidentes">{renderIncidentes()}</div>}
          {activeTab === 'riesgos' && <div key="riesgos">{renderRiesgos()}</div>}
        </AnimatePresence>
      </div>
    </div>
  );
};
