// (desarrollado por el informe) - Vista Portal "Mi Trabajo" Mejorada con Agrupación y Categorías
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { 
  CheckCircle, 
  Clock, 
  Search, 
  X, 
  Upload, 
  UserCheck, 
  AlertCircle, 
  FileText, 
  Check, 
  ListTodo, 
  ArchiveRestore, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Shield, 
  Layers, 
  User, 
  Filter 
} from 'lucide-react';
import { api } from '../services/api';
import type { TareaPendiente } from '../types';

export const MyWork = () => {
  const [tareas, setTareas] = useState<TareaPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'activas' | 'historial' | 'delegacion'>('activas');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'vencidas' | 'en_tiempo'>('todas');
  const [priorityFilter, setPriorityFilter] = useState<'todas' | 'criticas_altas' | 'medias_bajas'>('todas');
  const [selectedLawFilter, setSelectedLawFilter] = useState<string>('todas');
  const [viewMode, setViewMode] = useState<'agrupado' | 'lista'>('agrupado');
  
  // Delegacion State
  const [leyes, setLeyes] = useState<any[]>([]);

  // Collapse state for law groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // State for Modal/Drawer
  const [selectedTask, setSelectedTask] = useState<TareaPendiente | null>(null);
  const [editEstado, setEditEstado] = useState<string>('');
  const [editResponsable, setEditResponsable] = useState<string>('');
  const [editComentario, setEditComentario] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Responsables para dropdown
  const [responsables, setResponsables] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tareasData, responsablesData, leyesData] = await Promise.all([
          api.getTareas({}),
          api.getResponsables(),
          api.getNormativasAsignadas()
        ]);
        const enriched = tareasData.map((t: any) => ({
          ...t,
          fechaCompletada: (t.estado === 'completada' || t.completada) ? new Date().toLocaleDateString() : undefined
        }));
        setTareas(enriched);
        setResponsables(responsablesData);
        setLeyes(leyesData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenTask = (tarea: TareaPendiente) => {
    setSelectedTask(tarea);
    setEditEstado(tarea.estado || (tarea.esVencida ? 'vencido' : 'pendiente'));
    setEditResponsable(tarea.responsableAsignado || tarea.responsable || 'Usuario Actual');
    setEditComentario('');
    setSelectedFile(null);
  };

  const handleToggleComplete = async (tareaId: string | number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentTask = tareas.find(t => String(t.id) === String(tareaId));
    if (!currentTask) return;

    const isDone = currentTask.estado === 'completada' || currentTask.completada;
    const newStatus = isDone ? 'pendiente' : 'completada';

    // Actualización optimista en UI
    setTareas(prev => prev.map(t => {
      if (String(t.id) === String(tareaId)) {
        return { 
          ...t, 
          estado: newStatus, 
          completada: !isDone,
          fechaCompletada: !isDone ? new Date().toLocaleDateString() : undefined
        };
      }
      return t;
    }));

    try {
      await api.actualizarEstadoTarea(tareaId, newStatus);
      if (!isDone) {
        toast.success(`Tarea "${currentTask.tarea}" completada y recálculo de cumplimiento aplicado 🎉`);
      } else {
        toast('Tarea restaurada a pendientes y recálculo actualizado', { icon: '🔄' });
      }
    } catch (err) {
      console.error('Error al actualizar tarea en backend:', err);
      toast.error('No se pudo sincronizar el estado con el servidor');
      // Rollback
      setTareas(prev => prev.map(t => String(t.id) === String(tareaId) ? currentTask : t));
    }
  };

  const handleSaveTask = async () => {
    if (!selectedTask) return;

    // GRC Validations
    if (editEstado === 'en_progreso' && editComentario.trim().length < 5) {
      toast.error('Para iniciar la tarea, debes ingresar un plan de acción o justificación inicial (mín. 5 caracteres).');
      return;
    }
    if (editEstado === 'completada' && !selectedFile && !selectedTask.nombreArchivoEvidencia) {
      toast.error('Para completar la tarea es obligatorio adjuntar un archivo de evidencia.');
      return;
    }

    const previousTask = { ...selectedTask };
    const justCompleted = editEstado === 'completada' && selectedTask.estado !== 'completada';

    // Actualización optimista
    setTareas(prev => prev.map(t => {
      if (String(t.id) === String(selectedTask.id)) {
        return {
          ...t,
          estado: editEstado as any,
          responsableAsignado: editResponsable,
          esVencida: editEstado === 'completada' ? false : t.esVencida,
          completada: editEstado === 'completada',
          fechaCompletada: justCompleted ? new Date().toLocaleDateString() : (t as any).fechaCompletada
        };
      }
      return t;
    }));
    setSelectedTask(null);

    try {
      await api.actualizarTarea(selectedTask.id, {
        estado: editEstado,
        responsable_asignado: editResponsable,
        comentario_progreso: editEstado === 'en_progreso' ? editComentario : undefined,
        comentario_cierre: editEstado === 'completada' ? editComentario : undefined,
        nombre_archivo_evidencia: selectedFile ? selectedFile.name : undefined
      });
      if (justCompleted) {
        toast.success(`Tarea movida al historial e impacto en cumplimiento calculado 🎉`);
      } else {
        toast.success('Tarea guardada y sincronizada correctamente');
      }
    } catch (err) {
      console.error('Error al actualizar tarea:', err);
      toast.error('No se pudo guardar la tarea en el servidor');
      setTareas(prev => prev.map(t => String(t.id) === String(previousTask.id) ? previousTask : t));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleClearHistory = () => {
    setTareas(prev => prev.filter(t => t.estado !== 'completada' && !t.completada));
    toast.success('Historial limpiado correctamente');
  };

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Helper calculation for due date badges
  const getDueDateInfo = (fechaStr?: string, esVencida?: boolean) => {
    if (!fechaStr) return { text: 'Sin fecha', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(fechaStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || esVencida) {
      const daysAgo = Math.abs(diffDays) || 1;
      return { 
        text: `Vencida hace ${daysAgo} día${daysAgo > 1 ? 's' : ''}`, 
        color: 'bg-rose-50 text-rose-600 border-rose-200 font-semibold' 
      };
    } else if (diffDays === 0) {
      return { text: 'Vence Hoy', color: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold' };
    } else if (diffDays <= 3) {
      return { text: `Vence en ${diffDays} día${diffDays > 1 ? 's' : ''}`, color: 'bg-orange-50 text-orange-600 border-orange-200 font-medium' };
    } else {
      return { text: `Vence en ${diffDays} días`, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium' };
    }
  };

  const getPriorityBadge = (prioridad?: string) => {
    switch ((prioridad || '').toLowerCase()) {
      case 'critica':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider">Crítica</span>;
      case 'alta':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wider">Alta</span>;
      case 'baja':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">Baja</span>;
      case 'media':
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">Media</span>;
    }
  };

  const tareasCompletadas = useMemo(() => tareas.filter(t => t.estado === 'completada' || t.completada), [tareas]);
  const tareasActivas = useMemo(() => tareas.filter(t => t.estado !== 'completada' && !t.completada), [tareas]);
  const tareasAtrasadas = useMemo(() => tareasActivas.filter(t => t.esVencida), [tareasActivas]);
  
  const progressPercent = tareas.length > 0 ? Math.round((tareasCompletadas.length / tareas.length) * 100) : 100;

  // Distinct Laws for filter buttons
  const availableLaws = useMemo(() => {
    const list = Array.from(new Set(tareas.map(t => t.asociadaA || 'General'))).filter(Boolean);
    return list;
  }, [tareas]);

  // Filtered task list
  const filteredTareas = useMemo(() => {
    const listToRender = activeTab === 'activas' ? tareasActivas : tareasCompletadas;
    return listToRender.filter(t => {
      // Search filter
      const matchSearch = (t.tarea || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.asociadaA || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.responsableAsignado || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      // Status filter
      if (activeTab === 'activas') {
        if (statusFilter === 'vencidas' && !t.esVencida) return false;
        if (statusFilter === 'en_tiempo' && t.esVencida) return false;
      }

      // Priority filter
      if (priorityFilter === 'criticas_altas') {
        const p = (t.prioridad || '').toLowerCase();
        if (p !== 'critica' && p !== 'alta') return false;
      } else if (priorityFilter === 'medias_bajas') {
        const p = (t.prioridad || '').toLowerCase();
        if (p === 'critica' || p === 'alta') return false;
      }

      // Law category filter
      if (selectedLawFilter !== 'todas') {
        if ((t.asociadaA || 'General') !== selectedLawFilter) return false;
      }

      return true;
    });
  }, [activeTab, tareasActivas, tareasCompletadas, searchTerm, statusFilter, priorityFilter, selectedLawFilter]);

  // Grouped tasks by Law
  const groupedTareas = useMemo(() => {
    const groups: Record<string, TareaPendiente[]> = {};
    filteredTareas.forEach(t => {
      const law = t.asociadaA || 'Cumplimiento General';
      if (!groups[law]) groups[law] = [];
      groups[law].push(t);
    });
    return groups;
  }, [filteredTareas]);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <div className="w-10 h-10 border-4 border-[#84CC16] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-semibold text-slate-700">Cargando tu espacio de trabajo...</p>
        <p className="text-xs text-slate-400 mt-1">Sincronizando obligaciones y estado de cumplimiento</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-[#84CC16]/20 text-lime-800 rounded-lg">
              <ListTodo className="w-5 h-5 text-lime-700" />
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mi Trabajo</h1>
          </div>
          <p className="text-slate-500 text-sm">Bandeja de gestión operativa de tareas y obligaciones normativas de la empresa</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setViewMode('agrupado')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'agrupado' 
                ? 'bg-white text-slate-800 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Agrupado por Ley
          </button>
          <button
            onClick={() => setViewMode('lista')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'lista' 
                ? 'bg-white text-slate-800 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            Lista Simple
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ y: 15, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Obligaciones Pendientes</span>
            <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><ListTodo className="w-5 h-5" /></span>
          </div>
          <div className="text-4xl font-extrabold text-slate-800 tracking-tight">{tareasActivas.length}</div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="font-medium text-blue-600">{tareas.length} total</span>
            <span>•</span>
            <span>{tareasCompletadas.length} completadas</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 15, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl shadow-xs border border-amber-200/80 p-6 flex flex-col relative overflow-hidden hover:border-amber-300 transition-all"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Vencen Próximamente</span>
            <span className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-5 h-5" /></span>
          </div>
          <div className="text-4xl font-extrabold text-amber-600 tracking-tight relative z-10">
            {tareasActivas.filter(t => !t.esVencida && t.fechaVencimiento).length}
          </div>
          <p className="text-xs text-amber-700/80 mt-2 relative z-10 font-medium">Compromisos vigentes en calendario</p>
        </motion.div>

        <motion.div 
          initial={{ y: 15, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.16 }}
          className="bg-white rounded-2xl shadow-xs border border-rose-200/80 p-6 flex flex-col relative overflow-hidden hover:border-rose-300 transition-all"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Atrasadas / Críticas</span>
            <span className="p-2.5 bg-rose-50 text-rose-600 rounded-xl"><AlertCircle className="w-5 h-5" /></span>
          </div>
          <div className="text-4xl font-extrabold text-rose-600 tracking-tight relative z-10">{tareasAtrasadas.length}</div>
          <p className="text-xs text-rose-700/80 mt-2 relative z-10 font-medium">Requieren acción inmediata para cumplimiento</p>
        </motion.div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        {/* Navigation Tabs & Progress */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 pb-0 flex flex-col sm:flex-row gap-4 justify-between items-end">
          <div className="flex space-x-6 px-2">
            <button
              onClick={() => setActiveTab('activas')}
              className={`pb-3.5 text-sm font-bold transition-colors relative flex items-center gap-2 cursor-pointer ${
                activeTab === 'activas' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ListTodo className="w-4 h-4 text-[#84CC16]" />
              Tareas Pendientes
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'activas' ? 'bg-[#84CC16] text-white shadow-xs' : 'bg-slate-200 text-slate-600'}`}>
                {tareasActivas.length}
              </span>
              {activeTab === 'activas' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#84CC16] rounded-t-full"></div>}
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`pb-3.5 text-sm font-bold transition-colors relative flex items-center gap-2 cursor-pointer ${
                activeTab === 'historial' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ArchiveRestore className="w-4 h-4 text-emerald-600" />
              Historial Completadas
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'historial' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'}`}>
                {tareasCompletadas.length}
              </span>
              {activeTab === 'historial' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full"></div>}
            </button>
            <button
              onClick={() => setActiveTab('delegacion')}
              className={`pb-3.5 text-sm font-bold transition-colors relative flex items-center gap-2 cursor-pointer ${
                activeTab === 'delegacion' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-600" />
              Delegación
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'delegacion' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'}`}>
                {leyes.filter(l => !l.responsable || l.responsable === 'Sin Asignar').length}
              </span>
              {activeTab === 'delegacion' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>}
            </button>
          </div>

          <div className="hidden sm:flex flex-col items-end pb-3 w-56">
            <div className="flex justify-between w-full text-xs font-bold text-slate-600 mb-1.5">
              <span>Progreso de Tareas</span>
              <span className="text-[#84CC16]">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-[#84CC16] h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {activeTab !== 'delegacion' && (
          <>
            {/* Dynamic Category Filter Pills */}
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3 h-3" /> Filtrar Ley:
          </span>
          <button
            onClick={() => setSelectedLawFilter('todas')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              selectedLawFilter === 'todas'
                ? 'bg-[#84CC16] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todas ({filteredTareas.length})
          </button>
          {availableLaws.map(law => {
            const count = tareas.filter(t => (t.asociadaA || 'General') === law && (activeTab === 'activas' ? (!t.completada && t.estado !== 'completada') : (t.completada || t.estado === 'completada'))).length;
            return (
              <button
                key={law}
                onClick={() => setSelectedLawFilter(law)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  selectedLawFilter === law
                    ? 'bg-[#84CC16] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-3 h-3 opacity-70" />
                {law}
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedLawFilter === law ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Quick Action Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 justify-between items-center bg-white">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar por tarea, ley o responsable..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#84CC16] text-slate-700 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-between md:justify-end">
            {/* Priority Filter */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setPriorityFilter('todas')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  priorityFilter === 'todas' ? 'bg-white text-slate-800 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Prioridad: Todas
              </button>
              <button
                onClick={() => setPriorityFilter('criticas_altas')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  priorityFilter === 'criticas_altas' ? 'bg-red-50 text-red-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Críticas / Altas
              </button>
            </div>

            {/* Status Filter */}
            {activeTab === 'activas' ? (
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button 
                  onClick={() => setStatusFilter('todas')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    statusFilter === 'todas' ? 'bg-white text-slate-800 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Todas
                </button>
                <button 
                  onClick={() => setStatusFilter('vencidas')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    statusFilter === 'vencidas' ? 'bg-rose-50 text-rose-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Vencidas
                </button>
                <button 
                  onClick={() => setStatusFilter('en_tiempo')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    statusFilter === 'en_tiempo' ? 'bg-emerald-50 text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  En Tiempo
                </button>
              </div>
            ) : (
              <button 
                onClick={handleClearHistory}
                disabled={tareasCompletadas.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpiar Historial
              </button>
            )}
          </div>
        </div>

        {/* Task Content: Grouped vs List View */}
        <div className="p-4 sm:p-6 bg-slate-50/40 min-h-[350px]">
          {viewMode === 'agrupado' ? (
            <div className="space-y-6">
              {Object.keys(groupedTareas).length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200">
                  <div className="w-14 h-14 bg-lime-50 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle className="w-8 h-8 text-[#84CC16]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">No hay tareas que coincidan</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">Prueba cambiando los filtros de búsqueda o seleccionando otra ley.</p>
                </div>
              ) : (
                Object.entries(groupedTareas).map(([lawName, groupTasks]) => {
                  const isCollapsed = collapsedGroups[lawName] || false;
                  const completedInGroup = groupTasks.filter(t => t.estado === 'completada' || t.completada).length;
                  const totalInGroup = groupTasks.length;
                  const groupPct = Math.round((completedInGroup / totalInGroup) * 100);

                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={lawName}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all hover:border-slate-300"
                    >
                      {/* Group Header */}
                      <div 
                        onClick={() => toggleGroupCollapse(lawName)}
                        className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#84CC16]/10 text-lime-800 rounded-xl">
                            <Shield className="w-4 h-4 text-lime-700" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              {lawName}
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px] font-semibold border border-slate-200">
                                {totalInGroup} {totalInGroup === 1 ? 'tarea' : 'tareas'}
                              </span>
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <span>{completedInGroup}/{totalInGroup}</span>
                            <div className="w-16 bg-slate-200 rounded-full h-1.5">
                              <div className="bg-[#84CC16] h-1.5 rounded-full" style={{ width: `${groupPct}%` }}></div>
                            </div>
                          </div>
                          <div className="text-slate-400 hover:text-slate-600 transition-colors">
                            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>
                      </div>

                      {/* Group Task Items */}
                      {!isCollapsed && (
                        <ul className="divide-y divide-slate-100">
                          {groupTasks.map((tarea, idx) => {
                            const isCompleted = tarea.estado === 'completada' || tarea.completada;
                            const dueDateInfo = getDueDateInfo(tarea.fechaVencimiento, tarea.esVencida);

                            return (
                              <li 
                                key={`grouped-task-${tarea.id}-${idx}`}
                                className={`p-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors group ${
                                  isCompleted ? 'bg-slate-50/50' : ''
                                }`}
                              >
                                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                                  {/* Interactive Checkbox */}
                                  <button 
                                    onClick={(e) => handleToggleComplete(tarea.id, e)}
                                    className={`w-6 h-6 mt-0.5 sm:mt-0 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                                      isCompleted 
                                        ? 'bg-[#84CC16] border-[#84CC16] text-white shadow-xs' 
                                        : 'border-slate-300 hover:border-[#84CC16] bg-white'
                                    }`}
                                    title={isCompleted ? "Restaurar a pendiente" : "Completar tarea"}
                                  >
                                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </button>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className={`text-sm font-semibold transition-colors ${
                                        isCompleted ? 'line-through text-slate-400' : 'text-slate-800 group-hover:text-[#84CC16]'
                                      }`}>
                                        {tarea.tarea}
                                      </h4>
                                      {getPriorityBadge(tarea.prioridad)}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                                      {!isCompleted ? (
                                        <span className={`px-2 py-0.5 rounded-md text-[11px] border ${dueDateInfo.color}`}>
                                          {dueDateInfo.text}
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-md text-[11px] border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                                          <CheckCircle className="w-3 h-3" /> Completada
                                        </span>
                                      )}

                                      <span className="flex items-center gap-1 text-slate-400">
                                        <User className="w-3 h-3" />
                                        {tarea.responsableAsignado || tarea.responsable || 'Felipe Sanchez'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                  <button 
                                    onClick={() => handleOpenTask(tarea)}
                                    className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                                  >
                                    {isCompleted ? 'Ver Detalle' : 'Gestionar'}
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          ) : (
            /* Flat List View */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {filteredTareas.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    No se encontraron tareas pendientes con los filtros actuales.
                  </div>
                ) : (
                  filteredTareas.map((tarea, idx) => {
                    const isCompleted = tarea.estado === 'completada' || tarea.completada;
                    const dueDateInfo = getDueDateInfo(tarea.fechaVencimiento, tarea.esVencida);

                    return (
                      <li 
                        key={`flat-task-${tarea.id}-${idx}`}
                        className={`p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group ${
                          isCompleted ? 'bg-slate-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                          <button 
                            onClick={(e) => handleToggleComplete(tarea.id, e)}
                            className={`w-6 h-6 mt-0.5 sm:mt-0 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                              isCompleted 
                                ? 'bg-[#84CC16] border-[#84CC16] text-white shadow-xs' 
                                : 'border-slate-300 hover:border-[#84CC16] bg-white'
                            }`}
                          >
                            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className={`text-sm font-semibold transition-colors ${
                                isCompleted ? 'line-through text-slate-400' : 'text-slate-800 group-hover:text-[#84CC16]'
                              }`}>
                                {tarea.tarea}
                              </h4>
                              {getPriorityBadge(tarea.prioridad)}
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                {tarea.asociadaA || 'General'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className={`px-2 py-0.5 rounded-md text-[11px] border ${dueDateInfo.color}`}>
                                {dueDateInfo.text}
                              </span>
                              <span>•</span>
                              <span className="text-slate-400">
                                {tarea.responsableAsignado || tarea.responsable || 'Felipe Sanchez'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleOpenTask(tarea)}
                          className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-xs font-semibold transition-all shadow-xs cursor-pointer self-end sm:self-auto"
                        >
                          {isCompleted ? 'Ver Detalle' : 'Gestionar'}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
          </div>
          </>
        )}

        {/* Delegacion UI */}
        {activeTab === 'delegacion' && (
          <div className="p-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Leyes por Asignar</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Las siguientes normativas han sido detectadas. Asígnalas a un responsable para que empiecen a ser gestionadas en Mi Trabajo.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {leyes.filter(l => !l.responsable || l.responsable === 'Sin Asignar').length === 0 ? (
                <div className="p-16 flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <UserCheck className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Todas las leyes han sido asignadas</h3>
                  <p className="text-sm text-slate-500 max-w-sm mt-1">Has delegado todas tus normativas vigentes exitosamente.</p>
                </div>
              ) : (
                leyes.filter(l => !l.responsable || l.responsable === 'Sin Asignar').map(ley => {
                  const lawTasks = tareasActivas.filter(t => t.asociadaA === ley.normativa?.nombre);
                  return (
                    <div key={ley.id} className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col gap-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            {ley.normativa?.nombre || 'Normativa Desconocida'}
                          </h4>
                          <div className="flex gap-2 mt-2 items-center">
                             <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium border border-slate-200">
                               {ley.normativa?.organismo_emisor || 'Organismo Regulador'}
                             </span>
                             <span className="text-xs text-slate-500">Progreso: {ley.porcentaje_progreso}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="flex-1 sm:flex-initial">
                            <label className="text-xs font-semibold text-slate-500 block mb-1">Delegar a Responsable</label>
                            <select 
                              className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              onChange={(e) => {
                                if (e.target.value) {
                                  api.asignarResponsableLey(ley.id, e.target.value).then(() => {
                                    toast.success(`Ley delegada a ${e.target.value} exitosamente 🎉`);
                                    setLeyes(prev => prev.map(l => l.id === ley.id ? { ...l, responsable: e.target.value } : l));
                                  });
                                }
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>Seleccionar...</option>
                              {responsables.map(r => (
                                <option key={r.id} value={r.nombre}>{r.nombre} ({r.rol})</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      {/* Lista de tareas pendientes */}
                      {lawTasks.length > 0 && (
                        <div className="mt-2 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <ListTodo className="w-3.5 h-3.5 text-blue-400" /> 
                            Tareas que se asignarán a este responsable ({lawTasks.length})
                          </h5>
                          <ul className="space-y-2">
                            {lawTasks.map((t, idx) => (
                              <li key={t.id || idx} className="text-sm text-slate-700 flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                                <span className="font-medium text-slate-600 leading-tight">{t.tarea}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            {leyes.filter(l => l.responsable && l.responsable !== 'Sin Asignar').length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Leyes Ya Delegadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leyes.filter(l => l.responsable && l.responsable !== 'Sin Asignar').map(ley => (
                    <div key={ley.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                      <div className="truncate pr-4">
                        <h4 className="font-semibold text-slate-700 text-sm truncate">{ley.normativa?.nombre}</h4>
                      </div>
                      <div className="flex items-center relative w-40 sm:w-48 shrink-0">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                        <select 
                          className="w-full bg-white border border-slate-200 rounded-md pl-8 pr-6 py-1.5 text-xs font-medium text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-xs appearance-none cursor-pointer"
                          value={ley.responsable}
                          onChange={(e) => {
                            if (e.target.value) {
                              api.asignarResponsableLey(ley.id, e.target.value).then(() => {
                                toast.success(`Delegación cambiada a ${e.target.value} exitosamente 🔄`);
                                setLeyes(prev => prev.map(l => l.id === ley.id ? { ...l, responsable: e.target.value } : l));
                              });
                            }
                          }}
                        >
                          {responsables.map(r => (
                            <option key={r.id} value={r.nombre}>{r.nombre}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Drawer / Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2.5">
                  <span className="p-2 bg-[#84CC16]/20 text-lime-800 rounded-xl">
                    <FileText className="w-5 h-5 text-lime-700" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {(selectedTask.estado === 'completada' || selectedTask.completada) ? 'Detalle de Obligación' : 'Gestionar Obligación'}
                    </h3>
                    <p className="text-xs text-slate-500">{selectedTask.asociadaA || 'Normativa de Cumplimiento'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre de la Tarea / Compromiso</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{selectedTask.tarea}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha Límite</label>
                    <p className="text-sm font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {selectedTask.fechaVencimiento || 'Sin fecha asignada'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prioridad</label>
                    <div className="mt-1">
                      {getPriorityBadge(selectedTask.prioridad)}
                    </div>
                  </div>
                </div>

                {/* State selector */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Estado de Ejecución</label>
                  <select 
                    value={editEstado}
                    onChange={(e) => setEditEstado(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-[#84CC16] outline-none"
                  >
                    <option value="pendiente">⏳ Pendiente</option>
                    <option value="en_progreso">⚡ En Progreso</option>
                    <option value="completada">✅ Completada</option>
                  </select>
                </div>

                {/* Responsible selector */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Responsable Asignado</label>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <select
                      value={editResponsable}
                      onChange={(e) => setEditResponsable(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white text-slate-800 focus:ring-2 focus:ring-[#84CC16] outline-none cursor-pointer"
                    >
                      <option value="" disabled>Seleccionar responsable...</option>
                      {/* Check if the current responsable exists in the list, otherwise show it as an option so it doesn't break if it was free text before */}
                      {editResponsable && !responsables.find(r => r.nombre === editResponsable) && (
                        <option value={editResponsable}>{editResponsable}</option>
                      )}
                      {responsables.map((r: any) => (
                        <option key={r.id} value={r.nombre}>{r.nombre} {r.cargo ? `(${r.cargo})` : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conditional GRC Comment */}
                {(editEstado === 'en_progreso' || editEstado === 'completada' || editEstado === 'pendiente') && (
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      {editEstado === 'en_progreso' 
                        ? 'Plan de Acción / Justificación de Avance *' 
                        : editEstado === 'completada' 
                          ? 'Observaciones de Cierre (Opcional)'
                          : 'Motivo de Reapertura (Opcional)'}
                    </label>
                    <textarea
                      rows={2}
                      value={editComentario}
                      onChange={(e) => setEditComentario(e.target.value)}
                      placeholder={editEstado === 'en_progreso' ? "Detalla el plan inicial de trabajo..." : "Comentarios adicionales..."}
                      className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#84CC16] outline-none transition-all"
                    />
                  </div>
                )}

                {/* Upload Evidence */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    {editEstado === 'completada' ? 'Evidencia de Cumplimiento *' : 'Documento Adjunto (Opcional)'}
                  </label>
                  <div className={`relative border-2 border-dashed rounded-xl p-3 text-center transition-colors ${
                    selectedFile || selectedTask.nombreArchivoEvidencia
                      ? 'border-[#84CC16] bg-[#84CC16]/5'
                      : 'border-slate-200 hover:border-[#84CC16] bg-slate-50/50'
                  }`}>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center">
                      <Upload className={`w-4 h-4 mb-1.5 ${selectedFile ? 'text-[#84CC16]' : 'text-slate-400'}`} />
                      {selectedFile ? (
                        <div className="text-xs font-bold text-[#84CC16]">
                          {selectedFile.name}
                        </div>
                      ) : selectedTask.nombreArchivoEvidencia ? (
                        <div className="text-xs font-bold text-[#84CC16]">
                          Archivo actual: {selectedTask.nombreArchivoEvidencia}
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-600">
                          Adjuntar archivo probatorio (PDF, JPG, Documento BCN)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveTask}
                  className="px-4 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Guardar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
