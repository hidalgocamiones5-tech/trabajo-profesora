// (desarrollado por el informe) - Vista Portal "Mi Trabajo"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, Search, X, Upload, UserCheck, AlertCircle, FileText, Check, ListTodo, ArchiveRestore, Trash2, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export const MyWork = () => {
  const [tareas, setTareas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'activas' | 'historial'>('activas');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'vencidas' | 'en_tiempo'>('todas');
  const [mainCategory, setMainCategory] = useState('Mis Vencimientos');
  const categorias = ['Mis Obligaciones', 'Mis Controles', 'Mis Evidencias', 'Mis Riesgos', 'Mis Acciones', 'Mis Vencimientos'];
  
  // State for Modal/Drawer
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [editEstado, setEditEstado] = useState<string>('');
  const [editResponsable, setEditResponsable] = useState<string>('');

  useEffect(() => {
    api.getTareas({}).then(data => {
      // Add a simulated completion date for mock tasks that might already be completed
      const enriched = data.map((t: any) => ({
        ...t,
        fechaCompletada: (t.estado === 'completada' || t.completada) ? new Date().toLocaleDateString() : undefined
      }));
      setTareas(enriched);
      setLoading(false);
    });
  }, []);

  const handleOpenTask = (tarea: any) => {
    setSelectedTask(tarea);
    setEditEstado(tarea.estado || (tarea.esVencida ? 'atrasado' : 'pendiente'));
    setEditResponsable(tarea.responsable_asignado || tarea.responsable || 'Usuario Actual');
  };

  const handleToggleComplete = async (tareaId: number, e?: React.ChangeEvent<HTMLInputElement>) => {
    if (e) e.stopPropagation();
    const currentTask = tareas.find(t => t.id === tareaId);
    if (!currentTask) return;

    const isDone = currentTask.estado === 'completada' || currentTask.completada;
    const newStatus = isDone ? 'pendiente' : 'completada';

    // Actualización optimista en UI
    setTareas(prev => prev.map(t => {
      if (t.id === tareaId) {
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
      setTareas(prev => prev.map(t => t.id === tareaId ? currentTask : t));
    }
  };

  const handleSaveTask = async () => {
    if (!selectedTask) return;
    const previousTask = { ...selectedTask };
    const justCompleted = editEstado === 'completada' && selectedTask.estado !== 'completada';

    // Actualización optimista
    setTareas(prev => prev.map(t => {
      if (t.id === selectedTask.id) {
        return {
          ...t,
          estado: editEstado,
          responsable_asignado: editResponsable,
          esVencida: editEstado === 'completada' ? false : t.esVencida,
          completada: editEstado === 'completada',
          fechaCompletada: justCompleted ? new Date().toLocaleDateString() : t.fechaCompletada
        };
      }
      return t;
    }));
    setSelectedTask(null);

    try {
      await api.actualizarTarea(selectedTask.id, {
        estado: editEstado,
        responsable_asignado: editResponsable
      });
      if (justCompleted) {
        toast.success(`Tarea movida al historial e impacto en cumplimiento calculado 🎉`);
      } else {
        toast.success('Tarea guardada y sincronizada correctamente');
      }
    } catch (err) {
      console.error('Error al actualizar tarea:', err);
      toast.error('No se pudo guardar la tarea en el servidor');
      setTareas(prev => prev.map(t => t.id === previousTask.id ? previousTask : t));
    }
  };

  const handleUploadEvidence = () => {
    toast.success('Evidencia adjuntada exitosamente 📄');
  };

  const handleClearHistory = () => {
    setTareas(prev => prev.filter(t => t.estado !== 'completada' && !t.completada));
    toast.success('Historial limpiado correctamente');
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
        color: 'bg-red-50 text-red-600 border-red-200 font-semibold' 
      };
    } else if (diffDays === 0) {
      return { text: 'Vence Hoy', color: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold' };
    } else if (diffDays <= 3) {
      return { text: `Vence en ${diffDays} día${diffDays > 1 ? 's' : ''}`, color: 'bg-orange-50 text-orange-600 border-orange-200 font-medium' };
    } else {
      return { text: `Vence en ${diffDays} días`, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium' };
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse font-medium">Cargando tu espacio de trabajo...</div>;
  }

  const tareasCompletadas = tareas.filter(t => t.estado === 'completada' || t.completada);
  const tareasActivas = tareas.filter(t => t.estado !== 'completada' && !t.completada);
  const tareasAtrasadas = tareasActivas.filter(t => t.esVencida);
  
  const progressPercent = tareas.length > 0 ? Math.round((tareasCompletadas.length / tareas.length) * 100) : 100;

  // Filter for the active list view based on search/status
  const listToRender = activeTab === 'activas' ? tareasActivas : tareasCompletadas;
  const filteredTareas = listToRender.filter(t => {
    const matchSearch = (t.tarea || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (t.asociada_a || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;

    if (activeTab === 'activas') {
      if (statusFilter === 'vencidas') return t.esVencida;
      if (statusFilter === 'en_tiempo') return !t.esVencida;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mi Trabajo</h1>
            <p className="text-slate-500 mt-1">Gestión operativa de compromisos normativos</p>
          </div>
        </div>
        
        {/* Pestañas de Gestión Personal */}
        <div className="flex overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar">
          <div className="flex space-x-2">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setMainCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  mainCategory === cat
                    ? 'bg-[#84CC16] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pendientes</h3>
            <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><ListTodo className="w-5 h-5" /></span>
          </div>
          <div className="text-4xl font-bold text-slate-800">{tareasActivas.length}</div>
          <p className="text-sm text-slate-500 mt-2">Obligaciones y tareas en curso</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 flex flex-col relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Vencen esta semana</h3>
            <span className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-5 h-5" /></span>
          </div>
          <div className="text-4xl font-bold text-amber-600 relative z-10">{tareasActivas.filter(t => !t.esVencida && t.fechaVencimiento).length}</div>
          <p className="text-sm text-amber-600 mt-2 relative z-10">Próximos compromisos</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 flex flex-col relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Atrasadas</h3>
            <span className="p-2.5 bg-red-50 text-red-600 rounded-xl"><AlertCircle className="w-5 h-5" /></span>
          </div>
          <div className="text-4xl font-bold text-red-600 relative z-10">{tareasAtrasadas.length}</div>
          <p className="text-sm text-red-600 mt-2 relative z-10">Requieren atención inmediata</p>
        </motion.div>
      </div>

      {/* Main List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Navigation Tabs & Progress */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 pb-0 flex flex-col sm:flex-row gap-4 justify-between items-end">
          <div className="flex space-x-6 px-2">
            <button
              onClick={() => setActiveTab('activas')}
              className={`pb-4 text-sm font-semibold transition-colors relative flex items-center gap-2 cursor-pointer ${
                activeTab === 'activas' ? 'text-[#84CC16]' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              Tareas Activas
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'activas' ? 'bg-[#84CC16]/20 text-lime-800' : 'bg-slate-200 text-slate-600'}`}>
                {tareasActivas.length}
              </span>
              {activeTab === 'activas' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#84CC16] rounded-t-full"></div>}
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`pb-4 text-sm font-semibold transition-colors relative flex items-center gap-2 cursor-pointer ${
                activeTab === 'historial' ? 'text-[#84CC16]' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ArchiveRestore className="w-4 h-4" />
              Historial
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'historial' ? 'bg-[#84CC16]/20 text-lime-800' : 'bg-slate-200 text-slate-600'}`}>
                {tareasCompletadas.length}
              </span>
              {activeTab === 'historial' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#84CC16] rounded-t-full"></div>}
            </button>
          </div>

          <div className="hidden sm:flex flex-col items-end pb-4 w-48">
            <div className="flex justify-between w-full text-xs font-semibold text-slate-500 mb-1.5">
              <span>Progreso de Tareas</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div className="bg-[#84CC16] h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center bg-white">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar tarea u obligación..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#84CC16] text-slate-700 transition-shadow"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto items-center justify-between sm:justify-end">
            {activeTab === 'activas' ? (
              <>
                <button 
                  onClick={() => setStatusFilter('todas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${statusFilter === 'todas' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                  Todas
                </button>
                <button 
                  onClick={() => setStatusFilter('vencidas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${statusFilter === 'vencidas' ? 'bg-red-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-red-50 hover:text-red-600'}`}
                >
                  Vencidas
                </button>
                <button 
                  onClick={() => setStatusFilter('en_tiempo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${statusFilter === 'en_tiempo' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'}`}
                >
                  En Tiempo
                </button>
              </>
            ) : (
              <button 
                onClick={handleClearHistory}
                disabled={tareasCompletadas.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpiar Historial
              </button>
            )}
          </div>
        </div>

        {/* Task List */}
        <ul className="divide-y divide-slate-100 min-h-[300px]">
          <AnimatePresence>
            {filteredTareas.map((tarea, idx) => {
              const isCompleted = tarea.estado === 'completada' || tarea.completada;
              const dueDateInfo = getDueDateInfo(tarea.fechaVencimiento || tarea.fecha_vencimiento, tarea.esVencida);

              return (
                <motion.li 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  key={`tarea-${tarea.id}-${idx}`} 
                  className={`p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between group gap-4 ${isCompleted ? 'bg-slate-50/40' : ''}`}
                >
                  <div className="flex items-start sm:items-center space-x-4 min-w-0 flex-1">
                    {/* Quick Checkbox */}
                    <button 
                      onClick={(e) => handleToggleComplete(tarea.id, e as any)}
                      className={`w-6 h-6 mt-0.5 sm:mt-0 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                        isCompleted 
                          ? 'bg-[#84CC16] border-[#84CC16] text-white shadow-xs' 
                          : 'border-slate-300 hover:border-[#84CC16]'
                      }`}
                      title={isCompleted ? "Restaurar tarea" : "Marcar como completada"}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <h4 className={`text-md font-medium transition-colors truncate ${isCompleted ? 'text-slate-500' : 'text-slate-800 group-hover:text-[#84CC16]'}`}>
                        {tarea.tarea}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {!isCompleted ? (
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] border ${dueDateInfo.color}`}>
                            {dueDateInfo.text}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Completada: {tarea.fechaCompletada}
                          </span>
                        )}
                        {tarea.asociada_a && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            <FileText className="w-3 h-3" /> {tarea.asociada_a}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleOpenTask(tarea)}
                    className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition-all shadow-xs flex-shrink-0 cursor-pointer"
                  >
                    {isCompleted ? 'Ver Detalles' : 'Gestionar'}
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>

          {/* Empty States */}
          {filteredTareas.length === 0 && activeTab === 'activas' && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-lime-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-[#84CC16]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">¡Todo al día!</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">No tienes obligaciones ni tareas pendientes activas en este momento.</p>
            </div>
          )}

          {filteredTareas.length === 0 && activeTab === 'historial' && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <ArchiveRestore className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Historial vacío</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">Las tareas que completes aparecerán aquí para tu registro.</p>
            </div>
          )}
        </ul>
      </div>

      {/* Task Drawer / Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2">
                  <span className="p-2 bg-lime-100 text-[#84CC16] rounded-lg">
                    <FileText className="w-5 h-5" />
                  </span>
                  <h3 className="font-semibold text-slate-800 text-lg">
                    {(selectedTask.estado === 'completada' || selectedTask.completada) ? 'Detalle de Tarea' : 'Gestionar Tarea'}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nombre de la Tarea</label>
                  <p className="text-base font-semibold text-slate-800 mt-1">{selectedTask.tarea}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha Vencimiento</label>
                    <p className="text-sm font-medium text-slate-700 mt-1">
                      {selectedTask.fechaVencimiento || selectedTask.fecha_vencimiento}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Vinculada a</label>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                      <span className="text-sm font-semibold text-slate-700">{selectedTask.asociada_a || 'Cumplimiento General'}</span>
                      <button className="text-xs text-[#84CC16] font-bold hover:underline flex items-center gap-1 cursor-pointer">
                        Ver Normativa <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* State selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Estado Actual</label>
                  <select 
                    value={editEstado}
                    onChange={(e) => setEditEstado(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white text-slate-800 focus:ring-2 focus:ring-[#84CC16] outline-none"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>

                {/* Responsible selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Responsable Asignado</label>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      value={editResponsable}
                      onChange={(e) => setEditResponsable(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white text-slate-800 focus:ring-2 focus:ring-[#84CC16] outline-none"
                    />
                  </div>
                </div>

                {/* Upload Evidence Mock */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Evidencia de Cumplimiento</label>
                  <button 
                    type="button"
                    onClick={handleUploadEvidence}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-sm text-slate-600 hover:border-[#84CC16] hover:text-[#84CC16] transition-colors bg-slate-50/50 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Adjuntar archivo (PDF, JPG, PNG)
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveTask}
                  className="px-4 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-white rounded-xl text-sm font-medium shadow-sm transition-colors cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
