import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download, Clock, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const mockEvents = [
  { id: 1, title: 'Auditoría Ley Karin', date: '2026-08-30', type: 'Auditorías', status: 'pending' },
  { id: 2, title: 'Capacitación Privacidad', date: '2026-09-02', type: 'Capacitaciones', status: 'pending' },
  { id: 3, title: 'Revisión Controles ISO', date: '2026-09-05', type: 'Controles', status: 'completed' },
  { id: 4, title: 'Renovación Política ARCO', date: '2026-08-28', type: 'Documentos', status: 'urgent' },
  { id: 5, title: 'Evaluación Riesgos TI', date: '2026-09-10', type: 'Riesgos', status: 'pending' },
];

export const Calendar = () => {
  const [view, setView] = useState<'Mes' | 'Semana' | 'Línea de Tiempo'>('Mes');
  const [filter, setFilter] = useState<string>('Todos');

  const handleGenerateAgenda = () => {
    toast.success('Agenda generada y exportada a PDF/ICS correctamente 📅');
  };

  const filters = ['Todos', 'Auditorías', 'Capacitaciones', 'Controles', 'Evidencias', 'Riesgos', 'Incidentes'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Calendario de Cumplimiento</h1>
          <p className="text-slate-500 mt-1">Gestión de hitos y plazos normativos</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGenerateAgenda}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Generar Agenda</span>
          </button>
          <button className="px-4 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-white rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Nuevo Hito</span>
          </button>
        </div>
      </header>

      {/* Dashboard Superior */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Próximos 30 días */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Próximos 30 Días</h3>
            <span className="bg-indigo-50 text-indigo-600 p-2 rounded-lg"><CalendarIcon className="w-4 h-4" /></span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <div className="text-2xl font-bold text-slate-800">3</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase mt-1">Auditorías</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <div className="text-2xl font-bold text-slate-800">5</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase mt-1">Capacitaciones</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <div className="text-2xl font-bold text-slate-800">18</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase mt-1">Controles</div>
            </div>
            <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-center">
              <div className="text-2xl font-bold text-red-600">4</div>
              <div className="text-[10px] font-semibold text-red-500 uppercase mt-1">Vencimientos</div>
            </div>
          </div>
        </div>

        {/* Próximos 90 días */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Próximos 90 Días</h3>
            <span className="bg-emerald-50 text-emerald-600 p-2 rounded-lg"><Clock className="w-4 h-4" /></span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed relative z-10">
            Se proyecta una <strong>carga crítica en Noviembre</strong> debido al ciclo de auditorías internas de ISO 27001 y renovaciones de contratos con encargados de datos (Ley 21.719).
          </p>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#84CC16] w-1/3 rounded-full"></div>
            </div>
            <span className="text-xs font-bold text-slate-500">Q4</span>
          </div>
        </div>
      </div>

      {/* Main Calendar Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col min-h-[500px]">
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 rounded-t-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 cursor-pointer shadow-xs"><ChevronLeft className="w-4 h-4" /></button>
            <span className="font-bold text-slate-800 text-lg px-2">Agosto 2026</span>
            <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 cursor-pointer shadow-xs"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white text-slate-700 shadow-xs focus:ring-2 focus:ring-[#84CC16] outline-none"
            >
              {filters.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto">
              {['Mes', 'Semana', 'Línea de Tiempo'].map(v => (
                <button
                  key={v}
                  onClick={() => setView(v as any)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer w-full sm:w-auto ${
                    view === v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View content placeholder */}
        <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
            <CalendarIcon className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Vista de {view}</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">El calendario interactivo se está sincronizando con tus eventos filtrados por <span className="font-bold">{filter}</span>.</p>
          
          {/* Mock Timeline if timeline selected */}
          {view === 'Línea de Tiempo' && (
            <div className="mt-8 w-full max-w-2xl text-left space-y-4">
              {mockEvents.map(ev => (
                <div key={ev.id} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-[#84CC16] transition-colors cursor-pointer">
                  <div className="flex flex-col items-center justify-center w-12 shrink-0">
                    <span className="text-xs font-bold text-slate-400">AGO</span>
                    <span className="text-xl font-bold text-slate-800">{ev.date.split('-')[2]}</span>
                  </div>
                  <div className="h-10 w-px bg-slate-200"></div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{ev.title}</h4>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">{ev.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
