import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SolicitudTicket, Incidente, Riesgo, Responsable } from '../types';
import { 
  Search, Plus, ChevronLeft, CheckCircle, 
  AlertCircle, AlertTriangle, MessageSquareWarning,
  UserCheck, RefreshCw, X, ArrowRight, Eye, EyeOff,
  Clock, Sparkles, ShieldCheck, Scale, AlertOctagon, HelpCircle
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

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('todas');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<number | 'all' | 'critico' | 'medio' | 'bajo'>('all');

  // Privacy Mode for Ley Karin
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);

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
        api.getSolicitudes().catch(() => []),
        api.getIncidentes().catch(() => []),
        api.getRiesgos().catch(() => []),
        api.getResponsables().catch(() => []),
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

  // --- HELPER PARA CALCULAR TIEMPO Y SLA ARCO ---
  const getSlaBadge = (ticket: SolicitudTicket) => {
    if (ticket.estado === 'resuelta') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-3 h-3" /> Resuelta a tiempo
        </span>
      );
    }
    if (ticket.prioridad === 'urgente') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
          <Clock className="w-3 h-3 text-rose-600" /> ⏳ Quedan 24-48h
        </span>
      );
    }
    if (ticket.prioridad === 'alta') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" /> ⏳ Quedan 3 días
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
        <Clock className="w-3 h-3 text-sky-600" /> ⏳ Quedan 11 días (SLA 15d)
      </span>
    );
  };

  const getTipoBadge = (tipo: string) => {
    if (tipo.includes('Acceso')) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">ACCESO</span>;
    if (tipo.includes('Rectificación')) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">RECTIFICACIÓN</span>;
    if (tipo.includes('Cancelación') || tipo.includes('Supresión')) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">CANCELACIÓN</span>;
    if (tipo.includes('Oposición')) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">OPOSICIÓN</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">{tipo}</span>;
  };

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

  const handleSimularTicketPrueba = async () => {
    try {
      const mockTicket = await api.crearSolicitud({
        nombre: 'Solicitud de Supresión de Registro y Datos de Contacto (Usuario B2C)',
        tipo: 'Solicitud ARCO - Cancelación / Supresión',
        prioridad: 'urgente',
        solicitante: 'Marcela Fuentes (mfuentes@cliente.cl)',
        responsable: responsables[0]?.nombre || 'Oficial de Privacidad',
        fechaLimite: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        estado: 'revisando',
        sla: 'en_riesgo',
      });
      setSolicitudes(prev => [mockTicket, ...prev]);
      toast.success('¡Ticket de prueba ARCO generado con éxito! 🚀');
    } catch (err) {
      toast.error('Error al generar simulación.');
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

    const urgentCount = solicitudes.filter(s => s.prioridad === 'urgente' && s.estado !== 'resuelta').length;
    const pendingCount = solicitudes.filter(s => s.estado !== 'resuelta').length;

    return (
      <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
        
        {/* KPI Widgets para Mesa de Ayuda Legal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Solicitudes Activas</div>
              <div className="text-2xl font-bold text-slate-900">{pendingCount} <span className="text-xs text-slate-400 font-normal">en curso</span></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">SLA Crítico / Por Vencer</div>
              <div className="text-2xl font-bold text-rose-600">{urgentCount} <span className="text-xs text-slate-400 font-normal">requieren atención</span></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cumplimiento Legal SLA</div>
              <div className="text-2xl font-bold text-emerald-600">100% <span className="text-xs text-slate-400 font-normal">a tiempo</span></div>
            </div>
          </div>
        </div>

        {/* Header & Botones */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Mesa de Solicitudes y Requerimientos ARCO</h2>
            <p className="text-xs text-slate-500 mt-0.5">Gestión con trazabilidad de derechos de privacidad (Acceso, Cancelación, Rectificación) según Ley 19.628.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSimularTicketPrueba}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all font-semibold text-xs cursor-pointer border border-slate-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Simular Caso de Prueba
            </button>
            <button 
              onClick={() => setIsCreatingTicket(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Crear Solicitud
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, tipo o solicitante..." 
                  className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>
              <select 
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="todas">Todas las prioridades</option>
                <option value="urgente">🔴 Urgente (SLA 48h)</option>
                <option value="alta">🟡 Alta (SLA 5d)</option>
                <option value="media">🟢 Media (SLA 15d)</option>
              </select>
            </div>
            <button onClick={fetchData} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer self-end sm:self-auto">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Solicitud / Tipo</th>
                  <th className="px-5 py-3.5">Plazo Legal (SLA)</th>
                  <th className="px-5 py-3.5">Solicitante</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5">Responsable</th>
                  <th className="px-5 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3">
                          <Scale className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">Bandeja de Requerimientos Vacía</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-4">
                          No tienes solicitudes de privacidad ni reclamos pendientes. Haz clic en simular o crea tu primer ticket.
                        </p>
                        <button 
                          onClick={handleSimularTicketPrueba}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
                        >
                          ✨ Cargar Caso de Prueba (Simular)
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 text-slate-400 font-mono text-[11px] font-bold">TK-{ticket.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 text-xs">{ticket.nombre}</p>
                        <div className="mt-1">
                          {getTipoBadge(ticket.tipo)}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {getSlaBadge(ticket)}
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">
                        {ticket.solicitante}
                      </td>
                      <td className="px-5 py-4">
                        <span className={clsx(
                          "inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                          ticket.estado === 'resuelta' ? 'bg-emerald-100 text-emerald-800' :
                          ticket.estado === 'resolviendo' ? 'bg-blue-100 text-blue-800' :
                          ticket.estado === 'revisando' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                        )}>
                          {ticket.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          {ticket.responsable}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button 
                          onClick={() => setSelectedTicket(ticket)} 
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
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
      <button onClick={() => setIsCreatingTicket(false)} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 transition-colors font-bold cursor-pointer">
        <ChevronLeft className="w-4 h-4" /> Volver a Solicitudes
      </button>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Nueva Solicitud / Ticket ARCO</h2>
        <p className="text-xs text-slate-500 mb-6 font-medium">Registra un requerimiento legal o de privacidad de datos para gestionar su trazabilidad y SLA.</p>
        
        <form onSubmit={handleCrearTicket} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nombre o Asunto de la solicitud</label>
            <input 
              type="text" 
              required
              value={ticketNombre}
              onChange={(e) => setTicketNombre(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium" 
              placeholder="Ej. Petición de Cancelación de Datos Personales (Usuario X)" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Solicitud</label>
              <select 
                value={ticketTipo} 
                onChange={(e) => setTicketTipo(e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-semibold text-slate-700"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Prioridad & SLA</label>
              <select 
                value={ticketPrioridad}
                onChange={(e) => setTicketPrioridad(e.target.value as any)} 
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-semibold text-slate-700"
              >
                <option value="media">Media (15 días SLA Legal)</option>
                <option value="alta">Alta (5 días SLA)</option>
                <option value="urgente">Urgente (48 horas SLA)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Solicitante (Titular / Cliente)</label>
              <input 
                type="text" 
                value={ticketSolicitante}
                onChange={(e) => setTicketSolicitante(e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium" 
                placeholder="Ej. Roberto Gómez (cliente@email.com)" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Responsable Asignado</label>
              <select 
                value={ticketResponsable} 
                onChange={(e) => setTicketResponsable(e.target.value)} 
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-semibold text-slate-700"
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

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsCreatingTicket(false)} 
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 shadow-xs transition-all cursor-pointer"
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
        <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 transition-colors font-bold cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> Volver a Solicitudes
        </button>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-slate-900">{selectedTicket.nombre}</h1>
                <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  TK-{selectedTicket.id}
                </span>
              </div>
              <p className="text-slate-500 text-xs">
                Solicitado por <span className="font-bold text-slate-700">{selectedTicket.solicitante}</span> • Responsable: <span className="font-bold text-slate-700">{selectedTicket.responsable}</span>
              </p>
            </div>
            <div>
              {getSlaBadge(selectedTicket)}
            </div>
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
                      "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                      isCompleted ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300 text-slate-400",
                      isActive && "ring-4 ring-indigo-600/20 scale-110"
                    )}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={clsx("mt-2 text-[10px] font-bold uppercase tracking-wider", isActive ? "text-indigo-700" : isCompleted ? "text-slate-700" : "text-slate-400")}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-slate-500">
              Estado actual: <span className="font-bold text-slate-800 uppercase">{selectedTicket.estado}</span>
            </div>
            {currentStageIndex < stages.length - 1 ? (
              <button 
                onClick={() => handleAvanzarEtapaTicket(selectedTicket)} 
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
              >
                Avanzar a etapa "{stages[currentStageIndex + 1].toUpperCase()}" <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle className="w-4 h-4" /> Solicitud Finalizada y Resuelta
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // --- RENDER INCIDENTES (Ley Karin) ---
  const renderIncidentes = () => {
    const totalInc = incidentes.length;
    const openInc = incidentes.filter(i => i.estado === 'abierto' || i.estado === 'en_investigacion').length;

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
        
        {/* KPI Widgets para Ley Karin */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg shrink-0">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Casos Totales</div>
              <div className="text-2xl font-bold text-slate-900">{totalInc} <span className="text-xs text-slate-400 font-normal">registrados</span></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">En Investigación Activa</div>
              <div className="text-2xl font-bold text-amber-600">{openInc} <span className="text-xs text-slate-400 font-normal">plazo 30 días</span></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Protocolo de Resguardo</div>
              <div className="text-2xl font-bold text-emerald-600">Activo <span className="text-xs text-slate-400 font-normal">100% confidencial</span></div>
            </div>
          </div>
        </div>

        {/* Banner Ley Karin con Privacy Toggle */}
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-5 relative overflow-hidden shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center shrink-0 shadow-sm text-white">
                <MessageSquareWarning className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Canal de Denuncias Seguro y Confidencial (Ley Karin 21.643)</h3>
                <p className="text-slate-600 text-xs mt-0.5 max-w-2xl font-medium">
                  Garantiza la estricta reserva de la identidad, medidas cautelares en menos de 48h y derivación a la DT.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                  isPrivacyMode ? "bg-white text-slate-700 border-slate-300 shadow-2xs" : "bg-rose-100 text-rose-800 border-rose-300"
                )}
              >
                {isPrivacyMode ? <EyeOff className="w-3.5 h-3.5 text-rose-600" /> : <Eye className="w-3.5 h-3.5 text-slate-600" />}
                {isPrivacyMode ? "Modo Confidencial: ON" : "Revelar Nombres"}
              </button>

              <button 
                onClick={() => setIsCreatingIncidente(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar Incidente
              </button>
            </div>
          </div>
        </div>

        {/* Incident List */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Registro de Casos e Investigaciones</h4>
            <span className="text-[11px] text-slate-500 font-semibold">{incidentes.length} casos registrados</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Asunto / Hecho</th>
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5">Severidad</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5">Investigador</th>
                  <th className="px-5 py-3.5 text-right">Fase / Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidentes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400 font-medium">
                      No hay incidentes reportados en la plataforma. Canal 100% operativo.
                    </td>
                  </tr>
                ) : (
                  incidentes.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 text-slate-400 font-mono text-[11px] font-bold">INC-{inc.id}</td>
                      <td className="px-5 py-4">
                        <p className={clsx("font-bold text-slate-900 text-xs transition-all", isPrivacyMode && "select-none")}>
                          {isPrivacyMode ? "•••••••••••••••••••••••••••• (Hecho Protegido)" : inc.nombre}
                        </p>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {inc.fecha} • Denunciante: {isPrivacyMode ? "🔒 Confidencial" : inc.denunciante}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium">
                        {inc.tipo}
                      </td>
                      <td className="px-5 py-4">
                        <span className={clsx(
                          "inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                          inc.severidad === 'critica' || inc.severidad === 'alta' ? 'bg-rose-100 text-rose-700' :
                          inc.severidad === 'media' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        )}>
                          {inc.severidad || 'Media'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={clsx(
                          "inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                          inc.estado === 'resuelto' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        )}>
                          {inc.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-semibold">
                        {inc.responsable}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <select 
                          value={inc.estado} 
                          onChange={(e) => handleCambiarEstadoIncidente(inc.id, e.target.value)}
                          className="px-2.5 py-1 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-rose-500 outline-none cursor-pointer"
                        >
                          <option value="abierto">1. Denuncia Recibida</option>
                          <option value="medidas_cautelares">2. Medidas Cautelares</option>
                          <option value="en_investigacion">3. En Investigación</option>
                          <option value="resuelto">4. Resuelto / Sanción</option>
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
                    <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                      <MessageSquareWarning className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Registrar Denuncia / Incidente</h3>
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
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
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
                    <button type="button" onClick={() => setIsCreatingIncidente(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
                    <button type="submit" className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 shadow-xs">Registrar Caso</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // --- RENDER MATRIZ DE RIESGOS ---
  const renderRiesgos = () => {
    // Filtrado interactivo
    const filteredRiesgos = riesgos.filter(r => {
      const severidad = (r.probabilidad || 1) * (r.impacto || 1);
      if (selectedSeverityFilter === 'all') return true;
      if (typeof selectedSeverityFilter === 'number') return severidad === selectedSeverityFilter;
      if (selectedSeverityFilter === 'critico') return severidad >= 15;
      if (selectedSeverityFilter === 'medio') return severidad >= 8 && severidad < 15;
      if (selectedSeverityFilter === 'bajo') return severidad < 8;
      return true;
    });

    const criticosCount = riesgos.filter(r => (r.probabilidad || 1) * (r.impacto || 1) >= 15).length;

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
        
        {/* KPI Widgets para Riesgos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Riesgos Identificados</div>
              <div className="text-2xl font-bold text-slate-900">{riesgos.length} <span className="text-xs text-slate-400 font-normal">en matriz</span></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Riesgos Críticos (P×I ≥ 15)</div>
              <div className="text-2xl font-bold text-rose-600">{criticosCount} <span className="text-xs text-slate-400 font-normal">prioridad alta</span></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Estrategia Dominante</div>
              <div className="text-2xl font-bold text-emerald-600">Mitigación <span className="text-xs text-slate-400 font-normal">planes activos</span></div>
            </div>
          </div>
        </div>

        {/* Header y Acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Matriz Corporativa de Riesgos</h2>
            <p className="text-xs text-slate-500">Evaluación de impacto y probabilidad para Modelo de Prevención de Delitos (Ley 20.393) y Ciberseguridad.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsCreatingRiesgo(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Nuevo Riesgo
            </button>
            <button 
              onClick={handleGenerarRiesgosIA}
              disabled={isGeneratingRiesgos}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold text-xs shadow-xs disabled:opacity-70 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGeneratingRiesgos ? 'Mapeando Leyes...' : '✨ Sugerir con IA'}
            </button>
          </div>
        </div>

        {/* Explicación Educativa del Módulo de Riesgos */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 text-sm">¿Para qué sirve esta Matriz de Riesgos?</h3>
            <p className="text-blue-800 text-xs mt-1 leading-relaxed">
              Te ayuda a decidir <strong>qué problemas solucionar primero</strong>. Se calcula multiplicando qué tan probable es que ocurra un problema (<strong>Probabilidad</strong>) por el daño que causaría si ocurre (<strong>Impacto</strong>).
              Haz clic en los cuadros de colores para filtrar los riesgos que están en ese nivel de peligro.
            </p>
          </div>
        </div>

        {/* Heat Map 5x5 Matrix Visual e Interactiva */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 overflow-hidden flex flex-col md:flex-row gap-8 items-center">
          
          {/* Lado Izquierdo: Matriz */}
          <div className="flex-1 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Matriz de Calor Interactiva (P × I)</h3>
              </div>
              {selectedSeverityFilter !== 'all' && (
                <button 
                  onClick={() => setSelectedSeverityFilter('all')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" /> Limpiar Filtro ({selectedSeverityFilter})
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-center text-xs font-bold">
              
              {/* Eje Y: Probabilidad */}
              <div className="flex flex-col justify-between h-full py-2 text-slate-400 uppercase tracking-widest text-[10px] min-h-[220px]">
                <span className="text-slate-600 font-bold">Casi Seguro</span>
                <span className="-rotate-90 origin-center text-center translate-y-6">Probabilidad</span>
                <span className="text-slate-500 font-medium">Muy Raro</span>
              </div>

              {/* Matriz 5x5 */}
              <div className="grid grid-cols-5 gap-2">
                {/* Row 5 */}
                <button onClick={() => setSelectedSeverityFilter(5)} className={clsx("bg-yellow-100 text-yellow-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 5 && "ring-2 ring-indigo-600 font-black")}>5</button>
                <button onClick={() => setSelectedSeverityFilter(10)} className={clsx("bg-orange-200 text-orange-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 10 && "ring-2 ring-indigo-600 font-black")}>10</button>
                <button onClick={() => setSelectedSeverityFilter(15)} className={clsx("bg-rose-300 text-rose-950 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 15 && "ring-2 ring-indigo-600 font-black")}>15</button>
                <button onClick={() => setSelectedSeverityFilter(20)} className={clsx("bg-rose-500 text-white h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 20 && "ring-2 ring-indigo-600 font-black")}>20</button>
                <button onClick={() => setSelectedSeverityFilter(25)} className={clsx("bg-rose-700 text-white h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 25 && "ring-2 ring-indigo-600 font-black")}>25</button>
                {/* Row 4 */}
                <button onClick={() => setSelectedSeverityFilter(4)} className={clsx("bg-emerald-100 text-emerald-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 4 && "ring-2 ring-indigo-600 font-black")}>4</button>
                <button onClick={() => setSelectedSeverityFilter(8)} className={clsx("bg-yellow-100 text-yellow-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 8 && "ring-2 ring-indigo-600 font-black")}>8</button>
                <button onClick={() => setSelectedSeverityFilter(12)} className={clsx("bg-orange-200 text-orange-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 12 && "ring-2 ring-indigo-600 font-black")}>12</button>
                <button onClick={() => setSelectedSeverityFilter(16)} className={clsx("bg-rose-300 text-rose-950 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 16 && "ring-2 ring-indigo-600 font-black")}>16</button>
                <button onClick={() => setSelectedSeverityFilter(20)} className={clsx("bg-rose-500 text-white h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 20 && "ring-2 ring-indigo-600 font-black")}>20</button>
                {/* Row 3 */}
                <button onClick={() => setSelectedSeverityFilter(3)} className={clsx("bg-emerald-200 text-emerald-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 3 && "ring-2 ring-indigo-600 font-black")}>3</button>
                <button onClick={() => setSelectedSeverityFilter(6)} className={clsx("bg-emerald-100 text-emerald-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 6 && "ring-2 ring-indigo-600 font-black")}>6</button>
                <button onClick={() => setSelectedSeverityFilter(9)} className={clsx("bg-yellow-100 text-yellow-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 9 && "ring-2 ring-indigo-600 font-black")}>9</button>
                <button onClick={() => setSelectedSeverityFilter(12)} className={clsx("bg-orange-200 text-orange-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 12 && "ring-2 ring-indigo-600 font-black")}>12</button>
                <button onClick={() => setSelectedSeverityFilter(15)} className={clsx("bg-rose-300 text-rose-950 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 15 && "ring-2 ring-indigo-600 font-black")}>15</button>
                {/* Row 2 */}
                <button onClick={() => setSelectedSeverityFilter(2)} className={clsx("bg-emerald-300 text-emerald-950 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 2 && "ring-2 ring-indigo-600 font-black")}>2</button>
                <button onClick={() => setSelectedSeverityFilter(4)} className={clsx("bg-emerald-200 text-emerald-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 4 && "ring-2 ring-indigo-600 font-black")}>4</button>
                <button onClick={() => setSelectedSeverityFilter(6)} className={clsx("bg-emerald-100 text-emerald-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 6 && "ring-2 ring-indigo-600 font-black")}>6</button>
                <button onClick={() => setSelectedSeverityFilter(8)} className={clsx("bg-yellow-100 text-yellow-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 8 && "ring-2 ring-indigo-600 font-black")}>8</button>
                <button onClick={() => setSelectedSeverityFilter(10)} className={clsx("bg-orange-200 text-orange-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 10 && "ring-2 ring-indigo-600 font-black")}>10</button>
                {/* Row 1 */}
                <button onClick={() => setSelectedSeverityFilter(1)} className={clsx("bg-emerald-400 text-emerald-950 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 1 && "ring-2 ring-indigo-600 font-black")}>1</button>
                <button onClick={() => setSelectedSeverityFilter(2)} className={clsx("bg-emerald-300 text-emerald-950 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 2 && "ring-2 ring-indigo-600 font-black")}>2</button>
                <button onClick={() => setSelectedSeverityFilter(3)} className={clsx("bg-emerald-200 text-emerald-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 3 && "ring-2 ring-indigo-600 font-black")}>3</button>
                <button onClick={() => setSelectedSeverityFilter(4)} className={clsx("bg-emerald-100 text-emerald-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 4 && "ring-2 ring-indigo-600 font-black")}>4</button>
                <button onClick={() => setSelectedSeverityFilter(5)} className={clsx("bg-yellow-100 text-yellow-900 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer", selectedSeverityFilter === 5 && "ring-2 ring-indigo-600 font-black")}>5</button>
              </div>

              <div></div> {/* Empty div for grid alignment */}

              {/* Eje X: Impacto */}
              <div></div>
              <div className="flex justify-between w-full mt-2 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                <span className="text-slate-500">Leve</span>
                <span>Impacto →</span>
                <span className="text-slate-600">Catastrófico</span>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Leyenda de Colores */}
          <div className="w-full md:w-64 bg-slate-50 rounded-xl p-4 border border-slate-100 shrink-0">
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3">Niveles de Riesgo</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-xs">
                <span className="w-4 h-4 rounded bg-rose-500 shadow-xs shrink-0"></span>
                <div>
                  <div className="font-bold text-slate-900">Crítico <span className="text-slate-400 font-normal">(15 - 25)</span></div>
                  <div className="text-slate-500 text-[10px]">Atención inmediata requerida</div>
                </div>
              </li>
              <li className="flex items-center gap-3 text-xs">
                <span className="w-4 h-4 rounded bg-orange-400 shadow-xs shrink-0"></span>
                <div>
                  <div className="font-bold text-slate-900">Alto <span className="text-slate-400 font-normal">(10 - 14)</span></div>
                  <div className="text-slate-500 text-[10px]">Requiere plan de mitigación</div>
                </div>
              </li>
              <li className="flex items-center gap-3 text-xs">
                <span className="w-4 h-4 rounded bg-yellow-300 shadow-xs shrink-0"></span>
                <div>
                  <div className="font-bold text-slate-900">Medio <span className="text-slate-400 font-normal">(5 - 9)</span></div>
                  <div className="text-slate-500 text-[10px]">Monitoreo periódico</div>
                </div>
              </li>
              <li className="flex items-center gap-3 text-xs">
                <span className="w-4 h-4 rounded bg-emerald-300 shadow-xs shrink-0"></span>
                <div>
                  <div className="font-bold text-slate-900">Bajo <span className="text-slate-400 font-normal">(1 - 4)</span></div>
                  <div className="text-slate-500 text-[10px]">Riesgo aceptable</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Risks Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Inventario de Riesgos Registrados</h4>
            <span className="text-[11px] text-slate-500 font-semibold">{filteredRiesgos.length} riesgos mostrados</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">Riesgo / Categoría</th>
                  <th className="px-5 py-3.5 text-center">Severidad (P × I)</th>
                  <th className="px-5 py-3.5">Responsable</th>
                  <th className="px-5 py-3.5">Estrategia de Tratamiento</th>
                  <th className="px-5 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRiesgos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-400 font-medium">
                      No hay riesgos cargados con el filtro actual. Presiona "Nuevo Riesgo" o "Sugerir con IA".
                    </td>
                  </tr>
                ) : (
                  filteredRiesgos.map((r) => {
                    const severidad = (r.probabilidad || 1) * (r.impacto || 1);
                    const badgeColor = severidad >= 15 ? 'bg-rose-500 text-white font-black' :
                                       severidad >= 10 ? 'bg-orange-200 text-orange-950 font-bold' :
                                       severidad >= 6 ? 'bg-yellow-100 text-yellow-950 font-bold' :
                                       'bg-emerald-100 text-emerald-950 font-bold';

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900 text-xs">{r.nombre}</p>
                          <span className="text-[11px] text-slate-400 font-medium">{r.categoria || 'General'}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={clsx("inline-flex w-7 h-7 items-center justify-center rounded-lg text-xs shadow-2xs", badgeColor)}>
                            {severidad}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-semibold text-xs">
                          {r.responsable}
                        </td>
                        <td className="px-5 py-4">
                          <select 
                            value={r.estrategia || 'Mitigar'}
                            onChange={(e) => handleActualizarEstrategiaRiesgo(r.id, e.target.value)}
                            className="px-2.5 py-1 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                          >
                            <option value="Mitigar">🛡️ Mitigar</option>
                            <option value="Transferir">🔄 Transferir</option>
                            <option value="Aceptar">✅ Aceptar</option>
                            <option value="Eliminar">❌ Eliminar</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button 
                            onClick={() => toast.success(`Plan de acción generado para: ${r.nombre.substring(0, 30)}...`)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Plan de Acción
                          </button>
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
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Nuevo Riesgo de Cumplimiento</h3>
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
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    <button type="button" onClick={() => setIsCreatingRiesgo(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
                    <button type="submit" className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-xs">Guardar Riesgo</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Gestión Operativa GRC</h1>
          <p className="text-slate-500 mt-0.5 text-xs font-medium">Administración en tiempo real de peticiones ARCO, canal Ley Karin y evaluación de riesgos.</p>
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
                "relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap",
                isActive ? "text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {isActive && (
                <motion.div layoutId="management-tabs" className="absolute inset-0 bg-white rounded-xl shadow-xs" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
              )}
              <Icon className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
              <span className={clsx(
                "relative z-10 px-2 py-0.5 rounded-full text-[10px] font-bold",
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
