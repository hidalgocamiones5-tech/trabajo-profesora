import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, Filter } from 'lucide-react';
import clsx from 'clsx';
import { api } from '../services/api';

// Tipos locales para el calendario
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'tarea' | 'normativa' | 'incidente' | 'solicitud';
  status: string;
}

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'Mes' | 'Semana'>('Mes');
  
  // Filtros
  const [activeFilters, setActiveFilters] = useState({
    tarea: true,
    normativa: true,
    incidente: true,
    solicitud: true
  });

  useEffect(() => {
    const fetchAllEvents = async () => {
      setIsLoading(true);
      try {
        const [tareas, normativas, incidentes, solicitudes] = await Promise.all([
          api.getTareas({}),
          api.getNormativas(),
          api.getIncidentes(),
          api.getSolicitudes()
        ]);

        const allEvents: CalendarEvent[] = [];

        // Mapear Tareas (fechaVencimiento)
        tareas.forEach(t => {
          if (t.fechaVencimiento) {
            // Asegurarnos de ajustar la fecha a la zona local para evitar que se pinte en un día diferente si la hora es 00:00 UTC
            const localDate = new Date(t.fechaVencimiento + 'T12:00:00');
            allEvents.push({
              id: `tarea-${t.id}`,
              title: t.tarea,
              date: localDate,
              type: 'tarea',
              status: t.estado
            });
          }
        });

        // Mapear Normativas (fechaTermino)
        normativas.forEach(n => {
          if (n.fechaTermino) {
            const localDate = new Date(n.fechaTermino + 'T12:00:00');
            allEvents.push({
              id: `normativa-${n.id}`,
              title: n.nombre,
              date: localDate,
              type: 'normativa',
              status: n.estado
            });
          }
        });

        // Mapear Incidentes (fecha)
        incidentes.forEach(i => {
          if (i.fecha) {
            const localDate = new Date(i.fecha + 'T12:00:00');
            allEvents.push({
              id: `incidente-${i.id}`,
              title: i.nombre,
              date: localDate,
              type: 'incidente',
              status: i.estado
            });
          }
        });

        // Mapear Solicitudes (fechaLimite)
        solicitudes.forEach(s => {
          if (s.fechaLimite) {
            const localDate = new Date(s.fechaLimite + 'T12:00:00');
            allEvents.push({
              id: `solicitud-${s.id}`,
              title: s.nombre,
              date: localDate,
              type: 'solicitud',
              status: s.estado
            });
          }
        });

        setEvents(allEvents);
      } catch (err) {
        console.error("Error cargando eventos para el calendario", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEvents();
  }, []);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Ajustar para que Lunes sea 0 y Domingo 6
  };

  const getEventsForDate = (day: number) => {
    return events.filter(e => {
      // Aplicar filtros visuales
      if (!activeFilters[e.type]) return false;
      
      return e.date.getFullYear() === currentDate.getFullYear() &&
             e.date.getMonth() === currentDate.getMonth() &&
             e.date.getDate() === day;
    });
  };

  const renderMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month); // Lunes(0) - Domingo(6)
    
    const days = [];
    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    // Cabecera de días
    const headers = weekDays.map(day => (
      <div key={`header-${day}`} className="text-center font-semibold text-xs text-slate-400 uppercase py-2 bg-slate-50">
        {day}
      </div>
    ));

    // Días vacíos del mes anterior
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[100px] sm:min-h-[120px] p-2 border border-slate-100 bg-slate-50/50"></div>);
    }

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    // Días reales del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && today.getDate() === day;
      const dayEvents = getEventsForDate(day);
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={clsx(
            "min-h-[100px] sm:min-h-[120px] p-2 border border-slate-100 transition-colors hover:bg-slate-50 group flex flex-col relative",
            isToday ? "bg-indigo-50/30 ring-1 ring-inset ring-indigo-100" : "bg-white"
          )}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={clsx(
              "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium",
              isToday ? "bg-indigo-600 text-white shadow-sm" : "text-slate-700 group-hover:text-indigo-600"
            )}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                {dayEvents.length}
              </span>
            )}
          </div>
          
          <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
            {dayEvents.map(event => {
              // Colores según el tipo
              let bgColor = "bg-slate-100 text-slate-700 border-slate-200";
              if (event.type === 'tarea') bgColor = "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
              if (event.type === 'normativa') bgColor = "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100";
              if (event.type === 'incidente') bgColor = "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100";
              if (event.type === 'solicitud') bgColor = "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";

              return (
                <div 
                  key={event.id}
                  title={`${event.type.toUpperCase()}: ${event.title}`}
                  className={clsx(
                    "text-[10px] sm:text-xs font-medium px-2 py-1 rounded border cursor-pointer transition-colors shadow-sm",
                    "whitespace-nowrap overflow-hidden text-ellipsis",
                    bgColor
                  )}
                >
                  {event.title}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
        {headers}
        {days}
      </div>
    );
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <CalendarIcon className="w-7 h-7" />
            </div>
            Calendario GRC
          </h1>
          <p className="text-slate-500 mt-1 ml-[52px]">
            Visualización unificada de obligaciones, tareas e incidentes
          </p>
        </div>
        
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
          {['Mes', 'Semana'].map(v => (
            <button
              key={v}
              onClick={() => setView(v as any)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                view === v ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panel lateral: Proyecciones y Filtros */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
             <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Filter className="w-4 h-4 text-slate-400" /> Filtros Activos
             </h3>
             <div className="space-y-3">
               {[
                 { key: 'tarea', label: 'Tareas y Tiempos', color: 'bg-blue-500' },
                 { key: 'normativa', label: 'Venc. Normativos', color: 'bg-purple-500' },
                 { key: 'incidente', label: 'Incidentes', color: 'bg-rose-500' },
                 { key: 'solicitud', label: 'Tickets & Solicitudes', color: 'bg-emerald-500' }
               ].map(filter => (
                 <label key={filter.key} className="flex items-center gap-3 cursor-pointer group select-none">
                   <div className={clsx(
                     "w-5 h-5 rounded border flex items-center justify-center transition-all",
                     activeFilters[filter.key as keyof typeof activeFilters] ? filter.color + " border-transparent shadow-sm" : "border-slate-300 bg-slate-50"
                   )}>
                     {activeFilters[filter.key as keyof typeof activeFilters] && <span className="text-white text-xs">✓</span>}
                   </div>
                   <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                     {filter.label}
                   </span>
                   <input 
                     type="checkbox" 
                     className="hidden" 
                     checked={activeFilters[filter.key as keyof typeof activeFilters]}
                     onChange={() => setActiveFilters(prev => ({...prev, [filter.key]: !prev[filter.key as keyof typeof activeFilters]}))}
                   />
                 </label>
               ))}
             </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm border-none p-5 text-white">
            <h3 className="text-sm font-semibold opacity-90 mb-4">Resumen del Mes</h3>
            <div className="flex justify-between items-end mb-4">
               <div>
                  <div className="text-4xl font-display font-bold">
                    {events.filter(e => e.date.getMonth() === currentDate.getMonth() && e.date.getFullYear() === currentDate.getFullYear()).length}
                  </div>
                  <div className="text-xs opacity-80 uppercase tracking-wider mt-1 font-medium">Eventos Totales</div>
               </div>
            </div>
            
            <div className="space-y-2 mt-6">
               <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div className="bg-white h-1.5 rounded-full" style={{width: '60%'}}></div>
               </div>
               <div className="flex justify-between text-xs font-medium opacity-90">
                 <span>Progreso Mensual</span>
                 <span>60%</span>
               </div>
            </div>
          </div>
        </div>

        {/* Grilla principal del Calendario */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-slate-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 bg-slate-50/50">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                  <p className="font-medium text-sm">Sincronizando eventos con GRC...</p>
                </div>
              ) : (
                <motion.div 
                  key={currentDate.toISOString()}
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {view === 'Mes' ? renderMonthGrid() : (
                    <div className="text-center py-20 text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-xl bg-white shadow-sm">
                      <div className="max-w-md mx-auto">
                        <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 mb-2">Vista Semanal Próximamente</h3>
                        <p className="text-sm">Esta vista de planificación táctica detallada está actualmente en desarrollo. Por favor, utilice la vista mensual.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
