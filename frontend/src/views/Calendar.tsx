import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download, Clock, Plus,
  Search, ShieldCheck, User, X, Trash2, Edit3, Share2, Printer, Check
} from 'lucide-react';
import { api } from '../services/api';

export type EventType = 'Auditorías' | 'Capacitaciones' | 'Controles' | 'Evidencias' | 'Riesgos' | 'Incidentes' | 'Documentos';
export type EventStatus = 'pendiente' | 'en_progreso' | 'completado' | 'urgente' | 'atrasado';
export type EventPriority = 'Crítica' | 'Alta' | 'Media' | 'Baja';

export interface CalendarEvent {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: EventType;
  normativa: string;
  status: EventStatus;
  priority: EventPriority;
  responsable: string;
  descripcion: string;
  ubicacion?: string;
}

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 1,
    title: 'Auditoría Anual de Prevención Ley Karin',
    date: '2026-08-30',
    time: '09:30 - 12:00',
    type: 'Auditorías',
    normativa: 'Ley Karin 21.643',
    status: 'urgente',
    priority: 'Crítica',
    responsable: 'Felipe Sánchez (Auditor Líder)',
    descripcion: 'Revisión exhaustiva del canal de denuncias anónimas, actas de la comisión investigadora y protocolos de resguardo cautelar.',
    ubicacion: 'Oficina Central / Sala Directorio'
  },
  {
    id: 2,
    title: 'Taller Obligatorio de Protección de Datos Personales',
    date: '2026-09-02',
    time: '15:00 - 17:00',
    type: 'Capacitaciones',
    normativa: 'Ley 21.719 Datos Personales',
    status: 'pendiente',
    priority: 'Alta',
    responsable: 'Elena Rivas (Oficial de Privacidad)',
    descripcion: 'Capacitación al equipo de Ventas, TI y RRHH sobre ejercicio de derechos ARCO y bases de licitud.',
    ubicacion: 'Plataforma Virtual (Teams)'
  },
  {
    id: 3,
    title: 'Revisión Semestral de Controles de Acceso ISO 27001',
    date: '2026-09-05',
    time: '11:00 - 13:00',
    type: 'Controles',
    normativa: 'ISO 27001 / SGSI',
    status: 'completado',
    priority: 'Media',
    responsable: 'Julián Sosa (CISO)',
    descripcion: 'Verificación periódica del principio de mínimo privilegio en bases de datos productivas y directorio activo.',
    ubicacion: 'Área de Infraestructura TI'
  },
  {
    id: 4,
    title: 'Vencimiento y Renovación de Política de Cookies & Privacidad',
    date: '2026-08-28',
    time: '18:00',
    type: 'Documentos',
    normativa: 'Ley 21.719 / Ley 19.628',
    status: 'urgente',
    priority: 'Crítica',
    responsable: 'Elena Rivas',
    descripcion: 'Plazo legal máximo para actualizar los avisos de cookies y cláusulas de consentimiento web para clientes.',
    ubicacion: 'Portal Corporativo'
  },
  {
    id: 5,
    title: 'Evaluación de Matriz de Riesgos Penales Ley 20.393',
    date: '2026-09-10',
    time: '10:00 - 12:30',
    type: 'Riesgos',
    normativa: 'Ley 20.393 / Ley 21.595 Delitos Económicos',
    status: 'pendiente',
    priority: 'Alta',
    responsable: 'Felipe Sánchez (Compliance Officer)',
    descripcion: 'Actualización periódica de factores de riesgo de cohecho, lavado de activos y delitos ambientales.',
    ubicacion: 'Sala de Juntas'
  },
  {
    id: 6,
    title: 'Inspección Sanitaria de Condiciones de Trabajo D.S. 594',
    date: '2026-09-15',
    time: '09:00 - 13:00',
    type: 'Auditorías',
    normativa: 'D.S. N° 594 / Código del Trabajo',
    status: 'pendiente',
    priority: 'Media',
    responsable: 'Comité Paritario (CPHS)',
    descripcion: 'Recorrido de seguridad e higiene ambiental en sucursales y bodegas.',
    ubicacion: 'Bodega Principal Pudahuel'
  },
  {
    id: 7,
    title: 'Carga de Evidencia: Declaración Anual RETC',
    date: '2026-08-25',
    time: '16:00',
    type: 'Evidencias',
    normativa: 'Ley REP 20.920',
    status: 'completado',
    priority: 'Media',
    responsable: 'Julián Sosa',
    descripcion: 'Subida del comprobante timbrado de declaración de residuos de envases y embalajes.',
    ubicacion: 'Ventanilla Única RETC'
  },
  {
    id: 8,
    title: 'Simulacro de Fuga de Datos y Notificación CSIRT',
    date: '2026-09-22',
    time: '14:00 - 17:00',
    type: 'Incidentes',
    normativa: 'Ley Ciberseguridad 21.663',
    status: 'pendiente',
    priority: 'Alta',
    responsable: 'Julián Sosa (SOC Team)',
    descripcion: 'Prueba de respuesta ante brechas de seguridad y tiempo de reporte en 3 horas a la Agencia Nacional de Ciberseguridad.',
    ubicacion: 'Centro de Operaciones SOC'
  }
];

const NORMATIVAS_OPTIONS = [
  'Ley Karin 21.643',
  'Ley 21.719 Datos Personales',
  'Ley 20.393 / Ley 21.595 Delitos Económicos',
  'Ley Ciberseguridad 21.663',
  'ISO 27001 / SGSI',
  'D.S. N° 594 / Código del Trabajo',
  'Ley REP 20.920',
  'Ley SERNAC 19.496',
  'Cumplimiento General'
];

export const Calendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [view, setView] = useState<'Mes' | 'Semana' | 'Línea de Tiempo'>('Mes');
  const [typeFilter, setTypeFilter] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Navigation State (Current month being viewed, default August 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7); // 0-indexed: 7 = August

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState<boolean>(false);

  // Form state for Create / Edit
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '09:00 - 10:30',
    type: 'Auditorías' as EventType,
    normativa: 'Ley Karin 21.643',
    status: 'pendiente' as EventStatus,
    priority: 'Alta' as EventPriority,
    responsable: 'Felipe Sánchez',
    descripcion: '',
    ubicacion: 'Oficina Central'
  });

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const [eventosData, tareasData] = await Promise.all([
          api.getCalendarioEventos(),
          api.getTareas({})
        ]);

        const combinedEvents: CalendarEvent[] = [];

        // Map backend eventos if they exist
        if (eventosData && eventosData.length > 0) {
          eventosData.forEach((ev: any) => {
            combinedEvents.push({
              id: ev.id,
              title: ev.titulo || 'Evento',
              date: ev.fecha_inicio ? ev.fecha_inicio.split('T')[0] : new Date().toISOString().split('T')[0],
              time: ev.fecha_inicio && ev.fecha_inicio.includes('T') ? ev.fecha_inicio.split('T')[1].substring(0, 5) : '',
              type: (ev.tipo === 'Auditoria' ? 'Auditorías' : ev.tipo === 'Capacitacion' ? 'Capacitaciones' : 'Controles') as EventType,
              normativa: ev.normativa_nombre || 'General',
              status: ev.estado === 'cumplido' || ev.estado === 'completado' ? 'completado' : 'pendiente',
              priority: ev.prioridad === 'alta' ? 'Alta' : 'Media',
              responsable: ev.responsable_nombre || 'Oficial',
              descripcion: ev.descripcion || '',
              ubicacion: ev.ubicacion || 'Central'
            });
          });
        }

        // Map tareas to events (so they appear in the calendar)
        if (tareasData && tareasData.length > 0) {
          tareasData.forEach(t => {
            combinedEvents.push({
              id: 10000 + Number(t.id), // offset ID to avoid collisions
              title: t.tarea,
              date: t.fechaVencimiento || new Date().toISOString().split('T')[0],
              time: '12:00',
              type: 'Documentos' as EventType,
              normativa: t.asociadaA || 'Cumplimiento General',
              status: t.estado === 'completada' ? 'completado' : (t.estado === 'vencido' ? 'urgente' : 'pendiente'),
              priority: 'Alta',
              responsable: t.responsableAsignado || t.responsable || 'Equipo',
              descripcion: `Tarea generada automáticamente desde el dashboard de cumplimiento: ${t.tarea}`,
              ubicacion: 'Sistema GRC'
            });
          });
        }

        setEvents(combinedEvents);
      } catch (err) {
        console.error('Error fetching calendar data', err);
        toast.error('No se pudieron sincronizar las tareas del calendario.');
      }
    };
    
    fetchCalendarData();
  }, []);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const filters = ['Todos', 'Auditorías', 'Capacitaciones', 'Controles', 'Evidencias', 'Riesgos', 'Incidentes', 'Documentos'];

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(7); // Agosto 2026
    toast('Navegando al mes en curso (Agosto 2026)', { icon: '📍' });
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const matchType = typeFilter === 'Todos' || ev.type === typeFilter;
      const matchSearch =
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.normativa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.responsable.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [events, typeFilter, searchTerm]);

  // Dynamic KPI Calculations for Dashboard
  const kpiData = useMemo(() => {
    const auds = events.filter(e => e.type === 'Auditorías').length;
    const caps = events.filter(e => e.type === 'Capacitaciones').length;
    const ctrls = events.filter(e => e.type === 'Controles').length;
    const docs = events.filter(e => e.type === 'Documentos' || e.status === 'urgente').length;
    const totalCriticas = events.filter(e => e.priority === 'Crítica' || e.priority === 'Alta').length;

    return {
      auditorias: auds,
      capacitaciones: caps,
      controles: ctrls,
      vencimientos: docs,
      totalCriticas
    };
  }, [events]);

  // Helper styles by event type
  const getTypeColor = (type: EventType) => {
    switch (type) {
      case 'Auditorías': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Capacitaciones': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Controles': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Evidencias': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Riesgos': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Incidentes': return 'bg-red-50 text-red-700 border-red-200';
      case 'Documentos': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (priority: EventPriority) => {
    switch (priority) {
      case 'Crítica': return 'bg-red-100 text-red-700 border-red-200';
      case 'Alta': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Media': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Baja': return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Calendar Grid Calculation for Month View
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    // In JS Sunday is 0, convert to Monday-first (0 = Mon, 6 = Sun)
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: { dayNumber: number; monthOffset: number; dateString: string }[] = [];

    // Previous month filler days
    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({ dayNumber: dayNum, monthOffset: -1, dateString: dateStr });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, monthOffset: 0, dateString: dateStr });
    }

    // Next month filler days to complete 35 or 42 grid cells
    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, monthOffset: 1, dateString: dateStr });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Open Form to Create
  const handleOpenCreateModal = (prefilledDate?: string) => {
    setEditingEventId(null);
    setFormData({
      title: '',
      date: prefilledDate || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`,
      time: '09:00 - 10:30',
      type: 'Auditorías',
      normativa: 'Ley Karin 21.643',
      status: 'pendiente',
      priority: 'Alta',
      responsable: 'Felipe Sánchez',
      descripcion: '',
      ubicacion: 'Oficina Central'
    });
    setIsFormModalOpen(true);
  };

  // Open Form to Edit
  const handleOpenEditModal = (event: CalendarEvent) => {
    setEditingEventId(event.id);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time || '09:00 - 10:30',
      type: event.type,
      normativa: event.normativa,
      status: event.status,
      priority: event.priority,
      responsable: event.responsable,
      descripcion: event.descripcion,
      ubicacion: event.ubicacion || 'Oficina Central'
    });
    setSelectedEvent(null);
    setIsFormModalOpen(true);
  };

  // Save Event (Create or Update)
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date) {
      toast.error('Por favor completa el título y la fecha');
      return;
    }

    if (editingEventId !== null) {
      setEvents(prev => prev.map(ev => {
        if (ev.id === editingEventId) {
          return {
            ...ev,
            ...formData
          };
        }
        return ev;
      }));
      toast.success('Hito actualizado correctamente ✅');
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now(),
        ...formData
      };
      setEvents(prev => [newEvent, ...prev]);
      toast.success('Nuevo hito agendado en el calendario 🎉');
    }

    setIsFormModalOpen(false);
  };

  // Delete Event
  const handleDeleteEvent = (id: number) => {
    setEvents(prev => prev.filter(ev => ev.id !== id));
    setSelectedEvent(null);
    toast.success('Hito eliminado del calendario');
  };

  // Toggle Status
  const handleToggleStatus = (id: number) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === id) {
        const isDone = ev.status === 'completado';
        const newStatus: EventStatus = isDone ? 'pendiente' : 'completado';
        toast.success(isDone ? 'Hito reabierto como pendiente' : 'Hito marcado como completado 🎉');
        return { ...ev, status: newStatus };
      }
      return ev;
    }));
    if (selectedEvent && selectedEvent.id === id) {
      setSelectedEvent(prev => prev ? { ...prev, status: prev.status === 'completado' ? 'pendiente' : 'completado' } : null);
    }
  };

  // Export ICS Calendar
  const handleDownloadICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//GRC Chile//Calendario de Cumplimiento//ES\nCALSCALE:GREGORIAN\n";
    
    events.forEach(ev => {
      const cleanDate = ev.date.replace(/-/g, '');
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `UID:grc-${ev.id}@lemonflow.cl\n`;
      icsContent += `DTSTAMP:${cleanDate}T090000Z\n`;
      icsContent += `DTSTART;VALUE=DATE:${cleanDate}\n`;
      icsContent += `SUMMARY:[${ev.type}] ${ev.title}\n`;
      icsContent += `DESCRIPTION:${ev.normativa} - Responsable: ${ev.responsable}\\n${ev.descripcion}\n`;
      icsContent += `LOCATION:${ev.ubicacion || 'Chile'}\n`;
      icsContent += "STATUS:CONFIRMED\n";
      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `agenda_cumplimiento_grc_${monthNames[currentMonth].toLowerCase()}_${currentYear}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsAgendaModalOpen(false);
    toast.success('Calendario .ics exportado con éxito 📅');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-[#84CC16]/20 text-lime-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
              Módulo de Planificación GRC
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Calendario de Cumplimiento</h1>
          <p className="text-slate-500 mt-1">Gestión integral de hitos, auditorías, controles y plazos normativos</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAgendaModalOpen(true)}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Generar Agenda</span>
          </button>
          <button 
            onClick={() => handleOpenCreateModal()}
            className="px-5 py-2.5 bg-[#84CC16] hover:bg-[#65A30D] text-white rounded-xl font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Hito</span>
          </button>
        </div>
      </header>

      {/* Dashboard Superior de Cumplimiento Futuro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Próximos 30 días (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-600 p-2 rounded-xl border border-indigo-100">
                <CalendarIcon className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Próximos 30 Días</h3>
                <p className="text-xs text-slate-400 font-medium">Hitos de cumplimiento proyectados a corto plazo</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
              {events.length} compromisos totales
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 text-center hover:bg-indigo-50 transition-colors">
              <div className="text-2xl font-black text-indigo-700">{kpiData.auditorias}</div>
              <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mt-1">Auditorías</div>
            </div>
            <div className="bg-sky-50/50 p-3.5 rounded-xl border border-sky-100 text-center hover:bg-sky-50 transition-colors">
              <div className="text-2xl font-black text-sky-700">{kpiData.capacitaciones}</div>
              <div className="text-[11px] font-bold text-sky-900 uppercase tracking-wider mt-1">Capacitaciones</div>
            </div>
            <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 text-center hover:bg-emerald-50 transition-colors">
              <div className="text-2xl font-black text-emerald-700">{kpiData.controles}</div>
              <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mt-1">Controles</div>
            </div>
            <div className="bg-red-50/60 p-3.5 rounded-xl border border-red-100 text-center hover:bg-red-50 transition-colors">
              <div className="text-2xl font-black text-red-600">{kpiData.vencimientos}</div>
              <div className="text-[11px] font-bold text-red-800 uppercase tracking-wider mt-1">Vencimientos</div>
            </div>
          </div>
        </div>

        {/* Próximos 90 días (1 col on lg) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-50 text-amber-600 p-2 rounded-xl border border-amber-100">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Próximos 90 Días (Q3/Q4)</h3>
                <p className="text-xs text-slate-400 font-medium">Proyección de carga regulatoria</p>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-slate-600 leading-relaxed mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            Se proyectan <strong>{kpiData.totalCriticas} actividades críticas</strong> enfocadas en auditorías de la Ley Karin, adecuación a la Ley 21.719 y renovación de políticas.
          </p>

          <div className="mt-4">
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>Carga Regulatoria</span>
              <span className="text-lime-700 font-bold">75% Capacidad</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#84CC16] w-3/4 rounded-full"></div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Calendar Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Navigation, Search & View Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/70">
          
          {/* Month Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
              <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-50 text-slate-600 border-r border-slate-100 cursor-pointer"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleToday}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hoy
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-50 text-slate-600 border-l border-slate-100 cursor-pointer"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h2 className="font-bold text-slate-800 text-lg sm:text-xl">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>

          {/* Search, Filter & View Mode Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Search */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar hito..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select 
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700 shadow-2xs focus:ring-2 focus:ring-[#84CC16] outline-none cursor-pointer"
              >
                {filters.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* View Switcher */}
            <div className="flex items-center p-1 bg-slate-200/70 rounded-xl border border-slate-200">
              {(['Mes', 'Semana', 'Línea de Tiempo'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    view === v 
                      ? 'bg-white text-slate-800 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* 1. MONTH VIEW */}
        {view === 'Mes' && (
          <div className="p-4 sm:p-6">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
              {daysOfWeek.map((day, idx) => (
                <div key={day} className={`text-xs font-bold uppercase tracking-wider py-2 ${idx >= 5 ? 'text-slate-400' : 'text-slate-600'}`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((cell, idx) => {
                const dayEvents = filteredEvents.filter(e => e.date === cell.dateString);
                const isCurrentMonth = cell.monthOffset === 0;
                const isToday = cell.dateString === '2026-08-26';

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (dayEvents.length === 0) {
                        handleOpenCreateModal(cell.dateString);
                      }
                    }}
                    className={`min-h-[105px] sm:min-h-[120px] p-2 rounded-xl border transition-all flex flex-col justify-between group ${
                      isCurrentMonth
                        ? 'bg-white border-slate-200 hover:border-[#84CC16] hover:shadow-xs'
                        : 'bg-slate-50/60 border-slate-100 opacity-40'
                    } ${isToday ? 'ring-2 ring-[#84CC16] ring-offset-1 font-bold' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                        isToday ? 'bg-[#84CC16] text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                      }`}>
                        {cell.dayNumber}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCreateModal(cell.dateString);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition-opacity cursor-pointer"
                        title="Agregar hito en este día"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Day Events Pills */}
                    <div className="space-y-1 mt-1 overflow-y-auto max-h-[75px] hide-scrollbar">
                      {dayEvents.map(ev => (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border truncate transition-transform hover:scale-[1.02] cursor-pointer flex items-center justify-between gap-1 shadow-2xs ${getTypeColor(ev.type)} ${
                            ev.status === 'completado' ? 'line-through opacity-70' : ''
                          }`}
                          title={`${ev.time ? ev.time + ' - ' : ''}${ev.title}`}
                        >
                          <span className="truncate">{ev.title}</span>
                          {ev.status === 'completado' && <Check className="w-2.5 h-2.5 shrink-0 text-emerald-600 stroke-[3]" />}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. WEEK VIEW */}
        {view === 'Semana' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600">Semana del 24 al 30 de Agosto, 2026</span>
              <span className="text-xs text-slate-400 font-medium">{filteredEvents.length} eventos programados</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {['2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27', '2026-08-28', '2026-08-29', '2026-08-30'].map((dateStr, idx) => {
                const dayEvs = filteredEvents.filter(e => e.date === dateStr);
                const dayNum = dateStr.split('-')[2];
                const dayName = daysOfWeek[idx];
                const isToday = dateStr === '2026-08-26';

                return (
                  <div key={dateStr} className={`p-3 rounded-xl border flex flex-col min-h-[300px] ${isToday ? 'bg-lime-50/30 border-[#84CC16]' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">{dayName}</div>
                        <div className={`text-base font-bold ${isToday ? 'text-lime-800' : 'text-slate-800'}`}>{dayNum} Ago</div>
                      </div>
                      <button 
                        onClick={() => handleOpenCreateModal(dateStr)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto">
                      {dayEvs.map(ev => (
                        <div 
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer hover:shadow-xs transition-all ${getTypeColor(ev.type)}`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-bold text-[11px] leading-tight">{ev.title}</span>
                          </div>
                          {ev.time && <div className="text-[10px] opacity-75 mt-1 font-mono">{ev.time}</div>}
                          <div className="mt-2 flex items-center justify-between pt-1 border-t border-black/5">
                            <span className="text-[9px] font-semibold opacity-80">{ev.normativa.split(' ')[0]}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(ev.id);
                              }}
                              className="p-0.5 rounded hover:bg-black/10 text-slate-600"
                              title="Marcar completado"
                            >
                              <Check className={`w-3 h-3 ${ev.status === 'completado' ? 'text-emerald-700 stroke-[3]' : ''}`} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {dayEvs.length === 0 && (
                        <div className="text-center py-8 text-[11px] text-slate-400 font-medium">
                          Sin hitos
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. TIMELINE VIEW */}
        {view === 'Línea de Tiempo' && (
          <div className="p-6 max-w-4xl mx-auto w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Cronograma Proyectado de Obligaciones</h3>
              <span className="text-xs text-slate-500 font-medium">{filteredEvents.length} hitos registrados</span>
            </div>

            <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6 pt-2">
              {filteredEvents.map(ev => {
                const isCompleted = ev.status === 'completado';
                return (
                  <div key={ev.id} className="relative group">
                    {/* Circle on timeline */}
                    <div className={`absolute -left-[31px] top-4 w-4 h-4 rounded-full border-2 border-white shadow-xs transition-transform group-hover:scale-125 ${
                      isCompleted ? 'bg-emerald-500' : ev.priority === 'Crítica' ? 'bg-red-500' : 'bg-[#84CC16]'
                    }`}></div>

                    {/* Timeline Card */}
                    <div 
                      onClick={() => setSelectedEvent(ev)}
                      className={`p-5 rounded-2xl border bg-white hover:border-[#84CC16] hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isCompleted ? 'opacity-70 bg-slate-50/50' : ''
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getTypeColor(ev.type)}`}>
                            {ev.type}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(ev.priority)}`}>
                            {ev.priority}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            📅 {ev.date} {ev.time ? `• ⏰ ${ev.time}` : ''}
                          </span>
                        </div>
                        
                        <h4 className={`text-base font-bold text-slate-900 group-hover:text-lime-800 transition-colors ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}>
                          {ev.title}
                        </h4>
                        
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {ev.descripcion}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> {ev.normativa}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" /> {ev.responsable}
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(ev.id);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                            isCompleted 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {isCompleted ? 'Completado' : 'Completar'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer"
                        >
                          Ver Detalle
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* MODAL: EVENT DETAILS */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 relative">
                <div className="flex items-center space-x-3">
                  <span className={`p-2.5 rounded-xl border shadow-2xs ${getTypeColor(selectedEvent.type)}`}>
                    <CalendarIcon className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{selectedEvent.type}</span>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{selectedEvent.title}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeColor(selectedEvent.type)}`}>
                    {selectedEvent.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityBadge(selectedEvent.priority)}`}>
                    Prioridad {selectedEvent.priority}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedEvent.status === 'completado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {selectedEvent.status === 'completado' ? '✅ Completado' : '⏳ Pendiente'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Fecha & Horario</span>
                    <p className="font-semibold text-slate-800">📅 {selectedEvent.date} {selectedEvent.time ? `(${selectedEvent.time})` : ''}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Normativa Vinculada</span>
                    <p className="font-semibold text-indigo-700">⚖️ {selectedEvent.normativa}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Responsable Asignado</span>
                    <p className="font-semibold text-slate-800">👤 {selectedEvent.responsable}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Ubicación / Medio</span>
                    <p className="font-semibold text-slate-800">📍 {selectedEvent.ubicacion || 'No especificada'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Descripción & Alcance</label>
                  <p className="text-slate-700 text-sm leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                    {selectedEvent.descripcion}
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
                <button 
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenEditModal(selectedEvent)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(selectedEvent.id)}
                    className="px-4 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    {selectedEvent.status === 'completado' ? 'Reabrir Hito' : 'Marcar Completado'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CREATE / EDIT EVENT */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2">
                  <span className="p-2 bg-lime-100 text-lime-800 rounded-lg">
                    <CalendarIcon className="w-5 h-5" />
                  </span>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {editingEventId ? 'Editar Hito de Cumplimiento' : 'Nuevo Hito de Cumplimiento'}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsFormModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Título del Hito *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Auditoría Interna Ley Karin..."
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#84CC16] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Tipo de Evento</label>
                    <select 
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as EventType })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-[#84CC16] outline-none"
                    >
                      {filters.filter(f => f !== 'Todos').map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Prioridad / Criticidad</label>
                    <select 
                      value={formData.priority}
                      onChange={e => setFormData({ ...formData, priority: e.target.value as EventPriority })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-[#84CC16] outline-none"
                    >
                      <option value="Crítica">🔴 Crítica</option>
                      <option value="Alta">🟠 Alta</option>
                      <option value="Media">🟡 Media</option>
                      <option value="Baja">⚪ Baja</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Fecha *</label>
                    <input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#84CC16] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Horario (Opcional)</label>
                    <input 
                      type="text"
                      placeholder="09:00 - 11:30"
                      value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#84CC16] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Normativa Asociada</label>
                  <select 
                    value={formData.normativa}
                    onChange={e => setFormData({ ...formData, normativa: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-[#84CC16] outline-none"
                  >
                    {NORMATIVAS_OPTIONS.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Responsable</label>
                    <input 
                      type="text"
                      placeholder="Nombre del responsable"
                      value={formData.responsable}
                      onChange={e => setFormData({ ...formData, responsable: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#84CC16] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Ubicación / Modalidad</label>
                    <input 
                      type="text"
                      placeholder="Teams / Oficina"
                      value={formData.ubicacion}
                      onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#84CC16] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Descripción / Objetivos</label>
                  <textarea 
                    rows={3}
                    placeholder="Detalles del hito, tareas requeridas, etc."
                    value={formData.descripcion}
                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#84CC16] outline-none resize-none"
                  />
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3 mt-4 -mx-6 -mb-6 rounded-b-2xl">
                  <button 
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    {editingEventId ? 'Guardar Cambios' : 'Agendar Hito'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EXPORT AGENDA */}
      <AnimatePresence>
        {isAgendaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2">
                  <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                    <Download className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Generar y Exportar Agenda</h3>
                    <p className="text-xs text-slate-500 font-medium">Exporta los compromisos y plazos normativos</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAgendaModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Selecciona el formato deseado para exportar los <strong>{events.length} hitos</strong> registrados en el sistema de cumplimiento:
                </p>

                <div className="space-y-3">
                  {/* ICS Download */}
                  <div 
                    onClick={handleDownloadICS}
                    className="p-4 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700">Exportar a Calendario (.ICS)</h4>
                        <p className="text-xs text-slate-500">Compatible con Outlook, Google Calendar y Apple Calendar</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  </div>

                  {/* PDF Agenda */}
                  <div 
                    onClick={() => {
                      setIsAgendaModalOpen(false);
                      toast.success('Generando Informe de Agenda en PDF para impresión...');
                      window.print();
                    }}
                    className="p-4 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                        <Printer className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700">Imprimir Agenda Ejecutiva (PDF)</h4>
                        <p className="text-xs text-slate-500">Resumen ejecutivo mensual listo para presentar a directorio</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                  </div>

                  {/* Copy Link */}
                  <div 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Enlace de suscripción al calendario copiado 📋');
                      setIsAgendaModalOpen(false);
                    }}
                    className="p-4 border border-slate-200 rounded-xl hover:border-lime-500 hover:bg-lime-50/30 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-lime-100 text-lime-800 rounded-lg">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-lime-800">Copiar Enlace Webcal</h4>
                        <p className="text-xs text-slate-500">Para sincronización en vivo mediante URL</p>
                      </div>
                    </div>
                    <Share2 className="w-4 h-4 text-slate-400 group-hover:text-lime-600" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setIsAgendaModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
