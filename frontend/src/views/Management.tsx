import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SolicitudTicket, Incidente, Riesgo, Responsable } from '../types';
import { 
  Search, Plus, ChevronLeft, CheckCircle, 
  AlertCircle, AlertTriangle, MessageSquareWarning, Zap,
  UserCheck, RefreshCw, X, ArrowRight
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { api } from '../services/api';

type TabType = 'solicitudes' | 'incidentes' | 'riesgos';

export const Management = () => {
  const [activeTab, setActiveTab] = useState<TabType>('solicitudes');
  const [, setLoading] = useState(true);

  // Data states
  const [solicitudes, setSolicitudes] = useState<SolicitudTicket[]>([]);
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [riesgos, setRiesgos] = useState<Riesgo[]>([]);
  const [responsables, setResponsables] = useState<Responsable[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('todas');

  // Modals & Navigation
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SolicitudTicket | null>(null);
  const [isCreatingIncidente, setIsCreatingIncidente] = useState(false);
  const [selectedIncidente, setSelectedIncidente] = useState<Incidente | null>(null);
  const [isCreatingRiesgo, setIsCreatingRiesgo] = useState(false);
  const [isGeneratingRiesgos, setIsGeneratingRiesgos] = useState(false);

  // Form states - Solicitud
  const [ticketNombre, setTicketNombre] = useState('');
  const [ticketTipo, setTicketTipo] = useState('Solicitud ARCO - Acceso');
  const [ticketPrioridad, setTicketPrioridad] = useState<'media' | 'alta' | 'urgente'>('media');
  const [ticketSolicitante, setTicketSolicitante] = useState('');
  const [ticketResponsable, setTicketResponsable] = useState('');
  const [ticketFechaLimite] = useState('');

  // Form states - Incidente
  const [incNombre, setIncNombre] = useState('');
  const [incTipo, setIncTipo] = useState('Acoso Laboral (Ley Karin)');
  const [incDenunciante, setIncDenunciante] = useState('Anónimo / Confidencial');
  const [incResponsable, setIncResponsable] = useState('');
  const [incSeveridad, setIncSeveridad] = useState<'baja' | 'media' | 'alta' | 'critica'>('alta');
  const [incFecha] = useState(new Date().toISOString().split('T')[0]);

  // Form states - Riesgo
  const [riesgoNombre, setRiesgoNombre] = useState('');
  const [riesgoCategoria, setRiesgoCategoria] = useState('Cumplimiento Legal');
  const [riesgoImpacto, setRiesgoImpacto] = useState<number>(3);
  const [riesgoProbabilidad, setRiesgoProbabilidad] = useState<number>(3);
  const [riesgoEstrategia, setRiesgoEstrategia] = useState<'Mitigar' | 'Transferir' | 'Aceptar' | 'Eliminar'>('Mitigar');
  const [riesgoResponsable, setRiesgoResponsable] = useState('');

  const tabs = [
    { id: 'solicitudes', label: 'Mesa de Solicitudes (ARCO/Legal)', icon: AlertCircle, count: solicitudes.length },
    { id: 'incidentes', label: 'Incidentes (Ley Karin)', icon: MessageSquareWarning, count: incidentes.length },
    { id: 'riesgos', label: 'Matriz de Riesgos', icon: AlertTriangle, count: riesgos.length },
  ];

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [solRes, incRes, riesgRes, respRes] = await Promise.all([
        api.getSolicitudes(),
        api.getIncidentes(),
        api.getRiesgos(),
        api.getResponsables(),
      ]);
      setSolicitudes(solRes);
      setIncidentes(incRes);
      setRiesgos(riesgRes);
      setResponsables(respRes);

      if (respRes.length > 0) {
        setTicketResponsable(respRes[0].nombre);
        setIncResponsable(respRes[0].nombre);
        setRiesgoResponsable(respRes[0].nombre);
      }
    } catch (err) {
      console.error('Error al cargar datos de GRC:', err);
      toast.error('Error al sincronizar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS TICKET ---
  const handleCrearTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNombre.trim()) {
      toast.error('El nombre de la solicitud es obligatorio');
      return;
    }
    try {
      const newTicket = await api.crearSolicitud({
        nombre: ticketNombre,
        tipo: ticketTipo,
        prioridad: ticketPrioridad,
        solicitante: ticketSolicitante || 'Titular de Datos',
        responsable: ticketResponsable || 'Oficial de Privacidad',
        fechaLimite: ticketFechaLimite || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        estado: 'recibida',
        sla: 'en_tiempo',
      });
      setSolicitudes(prev => [newTicket, ...prev]);
      toast.success('Solicitud registrada y enviada al flujo legal.');
      setIsCreatingTicket(false);
      setTicketNombre('');
      setTicketSolicitante('');
    } catch (err) {
      console.error('Error al crear ticket:', err);
      toast.error('Error al crear la solicitud.');
    }
  };

  const handleAvanzarEtapaTicket = async (ticket: SolicitudTicket) => {
    const stages = ['recibida', 'revisando', 'resolviendo', 'resuelta'];
    const currentIndex = stages.indexOf(ticket.estado.toLowerCase());
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      try {
        const updated = await api.actualizarSolicitud(ticket.id, { estado: nextStage as any });
        setSolicitudes(prev => prev.map(s => s.id === ticket.id ? updated : s));
        setSelectedTicket(updated);
        toast.success(`Ticket avanzado a etapa: ${nextStage.toUpperCase()} ✅`);
      } catch (err) {
        toast.error('No se pudo actualizar el estado del ticket.');
      }
    }
  };

  // --- HANDLERS INCIDENTES ---
  const handleCrearIncidente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incNombre.trim()) {
      toast.error('El título o descripción es obligatorio');
      return;
    }
    try {
      const newInc = await api.crearIncidente({
        nombre: incNombre,
        tipo: incTipo,
        denunciante: incDenunciante || 'Anónimo / Confidencial',
        responsable: incResponsable || 'Comité de Ética',
        severidad: incSeveridad,
        fecha: incFecha,
        estado: 'abierto',
      });
      setIncidentes(prev => [newInc, ...prev]);
      toast.success('Incidente registrado de forma segura (Protocolo Ley Karin activado).');
      setIsCreatingIncidente(false);
      setIncNombre('');
    } catch (err) {
      console.error('Error al registrar incidente:', err);
      toast.error('Error al registrar el incidente.');
    }
  };

  const handleCambiarEstadoIncidente = async (incId: string, nuevoEstado: string) => {
    try {
      const updated = await api.actualizarIncidente(incId, { estado: nuevoEstado });
      setIncidentes(prev => prev.map(i => i.id === incId ? updated : i));
      if (selectedIncidente?.id === incId) setSelectedIncidente(updated);
      toast.success(`Estado actualizado a: ${nuevoEstado}`);
    } catch (err) {
      toast.error('Error al actualizar el estado.');
    }
  };

  // --- HANDLERS RIESGOS ---
  const handleCrearRiesgo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riesgoNombre.trim()) {
      toast.error('El nombre del riesgo es obligatorio');
      return;
    }
    try {
      const newRiesgo = await api.crearRiesgo({
        nombre: riesgoNombre,
        categoria: riesgoCategoria,
        impacto: riesgoImpacto as any,
        probabilidad: riesgoProbabilidad as any,
        estrategia: riesgoEstrategia,
        responsable: riesgoResponsable || 'Oficial de Cumplimiento',
        estado: 'pendiente',
        fechaIdentificacion: new Date().toISOString().split('T')[0],
      });
      setRiesgos(prev => [newRiesgo, ...prev]);
      toast.success('Riesgo añadido a la matriz corporativa.');
      setIsCreatingRiesgo(false);
      setRiesgoNombre('');
    } catch (err) {
      console.error('Error al crear riesgo:', err);
      toast.error('Error al guardar el riesgo.');
    }
  };

  const handleActualizarEstrategiaRiesgo = async (riesgoId: string, nuevaEstrategia: string) => {
    try {
      const updated = await api.actualizarRiesgo(riesgoId, { estrategia: nuevaEstrategia as any });
      setRiesgos(prev => prev.map(r => r.id === riesgoId ? updated : r));
      toast.success('Tratamiento de riesgo actualizado');
    } catch (err) {
      toast.error('Error al actualizar tratamiento de riesgo');
    }
  };

  const handleGenerarRiesgosIA = async () => {
    setIsGeneratingRiesgos(true);
    try {
      const defaultRisks = [
        {
          nombre: 'Fuga o brecha de seguridad en base de datos de clientes (Ley 19.628)',
          categoria: 'Privacidad y Datos',
          impacto: 5,
          probabilidad: 3,
          estrategia: 'Mitigar',
          responsable: responsables[0]?.nombre || 'Oficial de Seguridad',
          estado: 'en_curso',
        },
        {
          nombre: 'Falta de canal confidencial de denuncias laborales (Ley Karin 21.643)',
          categoria: 'Laboral',
          impacto: 4,
          probabilidad: 2,
          estrategia: 'Mitigar',
          responsable: responsables[0]?.nombre || 'Recursos Humanos',
          estado: 'pendiente',
        },
        {
          nombre: 'Incumplimiento de metas de reciclaje y recolección Ley REP (Ley 20.920)',
          categoria: 'Medioambiental',
          impacto: 4,
          probabilidad: 4,
          estrategia: 'Transferir',
          responsable: responsables[0]?.nombre || 'Operaciones',
          estado: 'pendiente',
        }
      ];

      for (const r of defaultRisks) {
        const created = await api.crearRiesgo(r as any);
        setRiesgos(prev => [created, ...prev]);
      }
      toast.success('Riesgos generados y mapeados según las leyes vigentes de tu empresa ✨');
    } catch (err) {
      console.error(err);
      toast.error('Error al generar riesgos con IA');
    } finally {
      setIsGeneratingRiesgos(false);
    }
  };

  // --- RENDER SOLICITUDES LIST ---
  const renderSolicitudesList = () => {
    const filtered = solicitudes.filter(s => {
      const matchSearch = s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.solicitante.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPriority = filterPriority === 'todas' || s.prioridad === filterPriority;
      return matchSearch && matchPriority;
    });

    return (
      <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Tickets y Solicitudes Legales</h2>
            <p className="text-sm text-slate-500">Manejo de peticiones ARCO (Acceso, Rectificación, Cancelación, Oposición) y revisiones legales.</p>
          </div>
          <button 
            onClick={() => setIsCreatingTicket(true)} 
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold text-sm shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Crear Solicitud
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, tipo o solicitante..." 
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
              <select 
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="todas">Todas las prioridades</option>
                <option value="urgente">Urgente</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
              </select>
            </div>
            <button onClick={fetchData} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer self-end sm:self-auto">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Solicitud / Tipo</th>
                  <th className="px-5 py-3.5">Solicitante</th>
                  <th className="px-5 py-3.5">Prioridad</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5">Responsable</th>
                  <th className="px-5 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                      No hay solicitudes registradas con estos filtros. Haz clic en "Crear Solicitud".
                    </td>
                  </tr>
                ) : (
                  filtered.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs font-semibold">TK-{ticket.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{ticket.nombre}</p>
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-medium mt-1 inline-block">
                          {ticket.tipo}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">
                        {ticket.solicitante}
                      </td>
                      <td className="px-5 py-4">
                        <span className={clsx(
                          "inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                          ticket.prioridad === 'urgente' ? "bg-rose-100 text-rose-700" :
                          ticket.prioridad === 'alta' ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-600"
                        )}>
                          {ticket.prioridad}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={clsx(
                          "inline-flex px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide",
                          ticket.estado === 'resuelta' ? 'bg-emerald-100 text-emerald-700' :
                          ticket.estado === 'resolviendo' ? 'bg-blue-100 text-blue-700' :
                          ticket.estado === 'revisando' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                        )}>
                          {ticket.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          {ticket.responsable}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button 
                          onClick={() => setSelectedTicket(ticket)} 
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  // --- RENDER SOLICITUDES CREATE MODAL ---
  const renderSolicitudesCreate = () => (
    <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl space-y-6">
      <button onClick={() => setIsCreatingTicket(false)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-semibold cursor-pointer">
        <ChevronLeft className="w-4 h-4" /> Volver a Solicitudes
      </button>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Nueva Solicitud / Ticket ARCO</h2>
        <p className="text-sm text-slate-500 mb-6">Registra un requerimiento legal o de privacidad de datos para gestionar su trazabilidad y SLA.</p>
        
        <form onSubmit={handleCrearTicket} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre o Asunto de la solicitud</label>
            <input 
              type="text" 
              required
              value={ticketNombre}
              onChange={(e) => setTicketNombre(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
              placeholder="Ej. Petición de Cancelación de Datos Personales (Usuario X)" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Solicitud</label>
              <select 
                value={ticketTipo} 
                onChange={(e) => setTicketTipo(e.target.value)} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700"
              >
                <option value="Solicitud ARCO - Acceso">Solicitud ARCO - Acceso (Ley 19.628)</option>
                <option value="Solicitud ARCO - Rectificación">Solicitud ARCO - Rectificación</option>
                <option value="Solicitud ARCO - Cancelación / Supresión">Solicitud ARCO - Cancelación / Supresión</option>
                <option value="Solicitud ARCO - Oposición">Solicitud ARCO - Oposición</option>
                <option value="Revisión de Contrato Proveedor">Revisión de Contrato Legal</option>
                <option value="Consulta Legal Corporativa">Consulta Legal Corporativa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Prioridad</label>
              <select 
                value={ticketPrioridad}
                onChange={(e) => setTicketPrioridad(e.target.value as any)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700"
              >
                <option value="media">Media (15 días SLA)</option>
                <option value="alta">Alta (5 días SLA)</option>
                <option value="urgente">Urgente (48 horas SLA)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Solicitante (Titular / Cliente)</label>
              <input 
                type="text" 
                value={ticketSolicitante}
                onChange={(e) => setTicketSolicitante(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                placeholder="Ej. Roberto Gómez (cliente@email.com)" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Responsable Asignado</label>
              <select 
                value={ticketResponsable}
                onChange={(e) => setTicketResponsable(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700"
              >
                {responsables.length === 0 ? (
                  <option value="Oficial de Privacidad">Oficial de Privacidad</option>
                ) : (
                  responsables.map(r => (
                    <option key={r.id} value={r.nombre}>{r.nombre} ({r.cargo || 'Trabajador'})</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsCreatingTicket(false)} 
              className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
            >
              Guardar Solicitud
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );

  // --- RENDER SOLICITUDES DETAIL ---
  const renderSolicitudesDetail = () => {
    if (!selectedTicket) return null;
    const stages = ['recibida', 'revisando', 'resolviendo', 'resuelta'];
    const currentStageIndex = stages.indexOf(selectedTicket.estado.toLowerCase());

    return (
      <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-5xl space-y-6">
        <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-semibold cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> Volver a Solicitudes
        </button>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{selectedTicket.nombre}</h1>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  TK-{selectedTicket.id}
                </span>
              </div>
              <p className="text-slate-500 text-sm">
                Solicitado por <span className="font-semibold text-slate-700">{selectedTicket.solicitante}</span> • Responsable: <span className="font-semibold text-slate-700">{selectedTicket.responsable}</span>
              </p>
            </div>
            <span className={clsx(
              "px-3 py-1 rounded-full text-xs font-bold uppercase",
              selectedTicket.prioridad === 'urgente' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
            )}>
              Prioridad: {selectedTicket.prioridad}
            </span>
          </div>

          {/* Stepper Timeline */}
          <div className="mb-10 relative px-4">
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
            <div 
              className="absolute top-1/2 left-8 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500" 
              style={{ width: `${(Math.max(0, currentStageIndex) / (stages.length - 1)) * 90}%` }}
            ></div>
            <div className="relative z-10 flex justify-between">
              {stages.map((stage, idx) => {
                const isCompleted = idx <= currentStageIndex;
                const isActive = idx === currentStageIndex;
                return (
                  <div key={stage} className="flex flex-col items-center">
                    <div className={clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                      isCompleted ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300 text-slate-400",
                      isActive && "ring-4 ring-indigo-600/20 scale-110"
                    )}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={clsx("mt-2 text-xs font-bold uppercase tracking-wider", isActive ? "text-indigo-700" : isCompleted ? "text-slate-700" : "text-slate-400")}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500">
              Estado actual: <span className="font-bold text-slate-800 uppercase">{selectedTicket.estado}</span>
            </div>
            {currentStageIndex < stages.length - 1 ? (
              <button 
                onClick={() => handleAvanzarEtapaTicket(selectedTicket)} 
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
              >
                Avanzar a etapa "{stages[currentStageIndex + 1].toUpperCase()}" <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl">
                <CheckCircle className="w-4 h-4" /> Solicitud Finalizada y Resuelta
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // --- RENDER INCIDENTES (Ley Karin) ---
  const renderIncidentes = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      {/* Banner Ley Karin */}
      <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20 text-white">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Canal de Denuncias Seguro y Confidencial (Ley Karin 21.643)</h3>
              <p className="text-slate-600 text-sm mt-1 max-w-2xl">
                Registra y canaliza denuncias sobre acoso laboral, acoso sexual o violencia en el trabajo. Cumple con la trazabilidad y medidas de resguardo inmediatas.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsCreatingIncidente(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white font-semibold text-sm rounded-xl hover:bg-rose-700 shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Registrar Nuevo Incidente
          </button>
        </div>
      </div>

      {/* Incident List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h4 className="font-bold text-slate-800 text-sm">Registro de Casos e Investigaciones</h4>
          <span className="text-xs text-slate-500 font-medium">{incidentes.length} casos registrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-xs font-semibold">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Asunto / Descripción</th>
                <th className="px-5 py-3.5">Tipo</th>
                <th className="px-5 py-3.5">Severidad</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5">Responsable</th>
                <th className="px-5 py-3.5 text-right">Cambiar Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incidentes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    No hay incidentes reportados en la plataforma.
                  </td>
                </tr>
              ) : (
                incidentes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 text-slate-400 font-mono text-xs font-semibold">INC-{inc.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{inc.nombre}</p>
                      <span className="text-xs text-slate-400">{inc.fecha} • Denunciante: {inc.denunciante}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium text-xs">
                      {inc.tipo}
                    </td>
                    <td className="px-5 py-4">
                      <span className={clsx(
                        "inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase",
                        inc.severidad === 'critica' || inc.severidad === 'alta' ? 'bg-rose-100 text-rose-700' :
                        inc.severidad === 'media' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      )}>
                        {inc.severidad || 'Media'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={clsx(
                        "inline-flex px-2.5 py-1 rounded-lg text-xs font-bold uppercase",
                        inc.estado === 'resuelto' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {inc.estado}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 font-medium">
                      {inc.responsable}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select 
                        value={inc.estado} 
                        onChange={(e) => handleCambiarEstadoIncidente(inc.id, e.target.value)}
                        className="px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="abierto">Abierto</option>
                        <option value="en_investigacion">En Investigación</option>
                        <option value="medidas_cautelares">Medidas Cautelares</option>
                        <option value="resuelto">Resuelto</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Incidente */}
      <AnimatePresence>
        {isCreatingIncidente && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsCreatingIncidente(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                    <MessageSquareWarning className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Registrar Denuncia / Incidente</h3>
                </div>
                <button onClick={() => setIsCreatingIncidente(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCrearIncidente} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Título o Hecho Denunciado</label>
                  <input 
                    type="text" 
                    required 
                    value={incNombre} 
                    onChange={(e) => setIncNombre(e.target.value)} 
                    placeholder="Ej. Hostigamiento reiterado en área de bodega"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo de Falta</label>
                    <select 
                      value={incTipo} 
                      onChange={(e) => setIncTipo(e.target.value)} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white"
                    >
                      <option value="Acoso Laboral (Ley Karin)">Acoso Laboral</option>
                      <option value="Acoso Sexual (Ley Karin)">Acoso Sexual</option>
                      <option value="Violencia en el Trabajo">Violencia en el Trabajo</option>
                      <option value="Fuga de Información">Fuga de Datos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Severidad</label>
                    <select 
                      value={incSeveridad} 
                      onChange={(e) => setIncSeveridad(e.target.value as any)} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white"
                    >
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Denunciante</label>
                    <input 
                      type="text" 
                      value={incDenunciante} 
                      onChange={(e) => setIncDenunciante(e.target.value)} 
                      placeholder="Anónimo / Nombre"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Investigador Asignado</label>
                    <select 
                      value={incResponsable} 
                      onChange={(e) => setIncResponsable(e.target.value)} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white"
                    >
                      {responsables.length === 0 ? (
                        <option value="Comité de Ética">Comité de Ética</option>
                      ) : (
                        responsables.map(r => <option key={r.id} value={r.nombre}>{r.nombre}</option>)
                      )}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsCreatingIncidente(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
                  <button type="submit" className="px-5 py-2 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 shadow-sm">Registrar Caso</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // --- RENDER MATRIZ DE RIESGOS ---
  const renderRiesgos = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Matriz Corporativa de Riesgos</h2>
          <p className="text-sm text-slate-500">Evaluación de impacto y probabilidad para Modelo de Prevención de Delitos (Ley 20.393) y Ciberseguridad.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCreatingRiesgo(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold text-sm shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nuevo Riesgo
          </button>
          <button 
            onClick={handleGenerarRiesgosIA}
            disabled={isGeneratingRiesgos}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold text-sm shadow-sm disabled:opacity-70 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            {isGeneratingRiesgos ? 'Mapeando Leyes...' : '✨ Sugerir con IA'}
          </button>
        </div>
      </div>

      {/* Heat Map 5x5 Matrix Visual */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden">
        <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center justify-between">
          <span>Matriz de Calor (Severidad P x I)</span>
          <span className="text-xs text-slate-400 font-normal">P = Probabilidad • I = Impacto</span>
        </h3>
        
        <div className="grid grid-cols-6 gap-1.5 max-w-xl mx-auto text-xs font-bold">
          <div className="col-span-1 row-span-5 flex flex-col justify-center items-center -rotate-90 text-slate-400 uppercase tracking-widest text-[10px]">
            Probabilidad ↑
          </div>
          <div className="col-span-5 grid grid-cols-5 gap-1.5">
            {/* Row 5 */}
            <div className="bg-yellow-100 text-yellow-800 h-10 rounded-lg flex items-center justify-center">5</div>
            <div className="bg-orange-200 text-orange-800 h-10 rounded-lg flex items-center justify-center">10</div>
            <div className="bg-rose-300 text-rose-900 h-10 rounded-lg flex items-center justify-center">15</div>
            <div className="bg-rose-500 text-white h-10 rounded-lg flex items-center justify-center">20</div>
            <div className="bg-rose-700 text-white h-10 rounded-lg flex items-center justify-center">25</div>
            {/* Row 4 */}
            <div className="bg-emerald-100 text-emerald-800 h-10 rounded-lg flex items-center justify-center">4</div>
            <div className="bg-yellow-100 text-yellow-800 h-10 rounded-lg flex items-center justify-center">8</div>
            <div className="bg-orange-200 text-orange-800 h-10 rounded-lg flex items-center justify-center">12</div>
            <div className="bg-rose-300 text-rose-900 h-10 rounded-lg flex items-center justify-center">16</div>
            <div className="bg-rose-500 text-white h-10 rounded-lg flex items-center justify-center">20</div>
            {/* Row 3 */}
            <div className="bg-emerald-200 text-emerald-800 h-10 rounded-lg flex items-center justify-center">3</div>
            <div className="bg-emerald-100 text-emerald-800 h-10 rounded-lg flex items-center justify-center">6</div>
            <div className="bg-yellow-100 text-yellow-800 h-10 rounded-lg flex items-center justify-center">9</div>
            <div className="bg-orange-200 text-orange-800 h-10 rounded-lg flex items-center justify-center">12</div>
            <div className="bg-rose-300 text-rose-900 h-10 rounded-lg flex items-center justify-center">15</div>
            {/* Row 2 */}
            <div className="bg-emerald-300 text-emerald-900 h-10 rounded-lg flex items-center justify-center">2</div>
            <div className="bg-emerald-200 text-emerald-800 h-10 rounded-lg flex items-center justify-center">4</div>
            <div className="bg-emerald-100 text-emerald-800 h-10 rounded-lg flex items-center justify-center">6</div>
            <div className="bg-yellow-100 text-yellow-800 h-10 rounded-lg flex items-center justify-center">8</div>
            <div className="bg-orange-200 text-orange-800 h-10 rounded-lg flex items-center justify-center">10</div>
            {/* Row 1 */}
            <div className="bg-emerald-400 text-emerald-900 h-10 rounded-lg flex items-center justify-center">1</div>
            <div className="bg-emerald-300 text-emerald-900 h-10 rounded-lg flex items-center justify-center">2</div>
            <div className="bg-emerald-200 text-emerald-800 h-10 rounded-lg flex items-center justify-center">3</div>
            <div className="bg-emerald-100 text-emerald-800 h-10 rounded-lg flex items-center justify-center">4</div>
            <div className="bg-yellow-100 text-yellow-800 h-10 rounded-lg flex items-center justify-center">5</div>
          </div>
          <div className="col-span-1"></div>
          <div className="col-span-5 text-center text-slate-400 uppercase tracking-widest text-[10px] mt-2">
            Impacto →
          </div>
        </div>
      </div>

      {/* Risks Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h4 className="font-bold text-slate-800 text-sm">Inventario de Riesgos Registrados</h4>
          <span className="text-xs text-slate-500 font-medium">{riesgos.length} riesgos evaluados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-xs font-semibold">
              <tr>
                <th className="px-5 py-3.5">Riesgo / Categoría</th>
                <th className="px-5 py-3.5 text-center">P x I (Severidad)</th>
                <th className="px-5 py-3.5">Responsable</th>
                <th className="px-5 py-3.5">Estrategia de Tratamiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {riesgos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                    No hay riesgos cargados. Presiona "Nuevo Riesgo" o "Sugerir con IA".
                  </td>
                </tr>
              ) : (
                riesgos.map((r) => {
                  const severidad = (r.probabilidad || 1) * (r.impacto || 1);
                  const badgeColor = severidad >= 15 ? 'bg-rose-100 text-rose-800' :
                                     severidad >= 8 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{r.nombre}</p>
                        <span className="text-xs text-slate-400">{r.categoria || 'General'}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={clsx("inline-flex w-8 h-8 items-center justify-center rounded-xl text-xs font-bold shadow-sm", badgeColor)}>
                          {severidad}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600 font-medium">
                        {r.responsable}
                      </td>
                      <td className="px-5 py-4">
                        <select 
                          value={r.estrategia || 'Mitigar'}
                          onChange={(e) => handleActualizarEstrategiaRiesgo(r.id, e.target.value)}
                          className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value="Mitigar">🛡️ Mitigar</option>
                          <option value="Transferir">🔄 Transferir</option>
                          <option value="Aceptar">✅ Aceptar</option>
                          <option value="Eliminar">❌ Eliminar</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Riesgo */}
      <AnimatePresence>
        {isCreatingRiesgo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsCreatingRiesgo(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Nuevo Riesgo de Cumplimiento</h3>
                </div>
                <button onClick={() => setIsCreatingRiesgo(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCrearRiesgo} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre / Evento de Riesgo</label>
                  <input 
                    type="text" 
                    required 
                    value={riesgoNombre} 
                    onChange={(e) => setRiesgoNombre(e.target.value)} 
                    placeholder="Ej. Sanción por tratamiento ilícito de datos sensibles"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Categoría</label>
                    <select 
                      value={riesgoCategoria} 
                      onChange={(e) => setRiesgoCategoria(e.target.value)} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white"
                    >
                      <option value="Cumplimiento Legal">Cumplimiento Legal</option>
                      <option value="Privacidad y Datos">Privacidad y Datos</option>
                      <option value="Laboral y Personas">Laboral y Personas</option>
                      <option value="Ciberseguridad">Ciberseguridad</option>
                      <option value="Medioambiental">Medioambiental</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estrategia</label>
                    <select 
                      value={riesgoEstrategia} 
                      onChange={(e) => setRiesgoEstrategia(e.target.value as any)} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white"
                    >
                      <option value="Mitigar">Mitigar</option>
                      <option value="Transferir">Transferir</option>
                      <option value="Aceptar">Aceptar</option>
                      <option value="Eliminar">Eliminar</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Probabilidad (1 al 5)</label>
                    <select 
                      value={riesgoProbabilidad} 
                      onChange={(e) => setRiesgoProbabilidad(Number(e.target.value))} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
                    >
                      <option value={1}>1 - Muy Baja</option>
                      <option value={2}>2 - Baja</option>
                      <option value={3}>3 - Media</option>
                      <option value={4}>4 - Alta</option>
                      <option value={5}>5 - Muy Alta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Impacto (1 al 5)</label>
                    <select 
                      value={riesgoImpacto} 
                      onChange={(e) => setRiesgoImpacto(Number(e.target.value))} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
                    >
                      <option value={1}>1 - Leve</option>
                      <option value={2}>2 - Menor</option>
                      <option value={3}>3 - Moderado</option>
                      <option value={4}>4 - Mayor</option>
                      <option value={5}>5 - Catastrófico</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Responsable Asignado</label>
                  <select 
                    value={riesgoResponsable} 
                    onChange={(e) => setRiesgoResponsable(e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white"
                  >
                    {responsables.length === 0 ? (
                      <option value="Oficial de Cumplimiento">Oficial de Cumplimiento</option>
                    ) : (
                      responsables.map(r => <option key={r.id} value={r.nombre}>{r.nombre}</option>)
                    )}
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsCreatingRiesgo(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
                  <button type="submit" className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm">Guardar Riesgo</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Gestión Operativa GRC</h1>
          <p className="text-slate-500 mt-1 text-sm">Administración en tiempo real de peticiones ARCO, canal Ley Karin y evaluación de riesgos.</p>
        </div>
      </div>

      {/* Top Tabs */}
      <div className="flex space-x-2 bg-slate-200/60 p-1.5 rounded-2xl w-max overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as TabType); setIsCreatingTicket(false); setSelectedTicket(null); setIsCreatingIncidente(false); }}
              className={clsx(
                "relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap",
                isActive ? "text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {isActive && (
                <motion.div layoutId="management-tabs" className="absolute inset-0 bg-white rounded-xl shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
              )}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
              <span className={clsx(
                "relative z-10 px-2 py-0.5 rounded-full text-xs font-bold",
                isActive ? "bg-indigo-100 text-indigo-800" : "bg-slate-300/60 text-slate-600"
              )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <div className="min-h-[450px]">
        <AnimatePresence mode="wait">
          {activeTab === 'solicitudes' && (
            <div key="solicitudes">
              {isCreatingTicket ? renderSolicitudesCreate() : selectedTicket ? renderSolicitudesDetail() : renderSolicitudesList()}
            </div>
          )}
          {activeTab === 'incidentes' && <div key="incidentes">{renderIncidentes()}</div>}
          {activeTab === 'riesgos' && <div key="riesgos">{renderRiesgos()}</div>}
        </AnimatePresence>
      </div>
    </div>
  );
};
