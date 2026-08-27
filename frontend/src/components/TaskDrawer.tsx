import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Save, 
  User, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  CheckSquare, 
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import type { Responsable } from '../types';

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

export const TaskDrawer = ({ isOpen, onClose, onTaskCreated }: TaskDrawerProps) => {
  // Tab mode: 'normativa' (suggested tasks derived from compliance) | 'libre' (manual / ad-hoc task)
  const [taskMode, setTaskMode] = useState<'normativa' | 'libre'>('normativa');

  // Normative state
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  
  // Free task state
  const [tareaTitulo, setTareaTitulo] = useState('');
  const [categoriaLibre, setCategoriaLibre] = useState('General');

  // Shared form fields
  const [responsable, setResponsable] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [prioridad, setPrioridad] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [estado, setEstado] = useState<'en_progreso' | 'pendiente' | 'al_dia'>('en_progreso');

  // Lists
  const [unassignedTasks, setUnassignedTasks] = useState<any[]>([]);
  const [responsablesList, setResponsablesList] = useState<Responsable[]>([]);
  const [assigneesFallback, setAssigneesFallback] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.allSettled([
        api.getTareas({}),
        api.getResponsables(),
        api.getAssignees()
      ]).then(([tareasRes, respRes, assigneesRes]) => {
        if (tareasRes.status === 'fulfilled') {
          const unassigned = (tareasRes.value || []).filter(
            (t: any) => t.responsable === 'Sin Asignar' || t.responsableAsignado === 'Sin Asignar' || !t.responsable
          );
          setUnassignedTasks(unassigned);
          if (unassigned.length > 0 && !selectedTaskId) {
            setSelectedTaskId(String(unassigned[0].id));
          } else if (unassigned.length === 0) {
            setTaskMode('libre');
          }
        }
        if (respRes.status === 'fulfilled') {
          setResponsablesList(respRes.value || []);
        }
        if (assigneesRes.status === 'fulfilled') {
          setAssigneesFallback(
            (assigneesRes.value || []).filter((u: string) => u && u !== 'Sin Asignar')
          );
        }
      });
    }
  }, [isOpen]);

  // Group unassigned tasks by normative law name
  const groupedTasks = useMemo(() => {
    const map: Record<string, any[]> = {};
    unassignedTasks.forEach((t) => {
      const law = t.asociada_a || t.asociadaA || 'Normativa General';
      if (!map[law]) map[law] = [];
      map[law].push(t);
    });
    return map;
  }, [unassignedTasks]);

  // Active selected normative task details
  const activeSelectedTask = useMemo(() => {
    return unassignedTasks.find((t) => String(t.id) === String(selectedTaskId));
  }, [unassignedTasks, selectedTaskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!responsable) {
      toast.error('Por favor, selecciona un responsable para la tarea');
      return;
    }
    if (!fechaVencimiento) {
      toast.error('Por favor, indica una fecha de vencimiento');
      return;
    }

    setIsSubmitting(true);
    try {
      if (taskMode === 'normativa') {
        if (!selectedTaskId) {
          toast.error('Debes seleccionar una obligación normativa');
          setIsSubmitting(false);
          return;
        }

        // Update the existing unassigned compliance task
        await api.actualizarTarea(selectedTaskId, {
          estado: estado,
          responsable: responsable,
          responsable_asignado: responsable,
          fecha_vencimiento: fechaVencimiento,
          prioridad: prioridad,
        });

        toast.success(`Tarea normativa asignada a ${responsable} con éxito 🎯`);
      } else {
        // Create a new free operational task
        if (!tareaTitulo.trim()) {
          toast.error('Por favor, escribe una descripción o título para la tarea');
          setIsSubmitting(false);
          return;
        }

        await api.crearTarea({
          tarea: tareaTitulo.trim(),
          asociadaA: categoriaLibre.trim() || 'General',
          responsable: responsable,
          responsableAsignado: responsable,
          fechaVencimiento: fechaVencimiento,
          estado: estado as any,
          prioridad: prioridad,
        });

        toast.success('Nueva tarea operativa creada exitosamente 🚀');
      }

      onTaskCreated();
      resetForm();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Hubo un error al guardar la tarea. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTareaTitulo('');
    setCategoriaLibre('General');
    setResponsable('');
    setFechaVencimiento('');
    setPrioridad('media');
    setEstado('en_progreso');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    Nueva Tarea / Compromiso
                  </h2>
                  <p className="text-xs text-slate-500">
                    Asigna obligaciones normativas o crea tareas libres
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Mode Selector (Tabs) */}
            <div className="px-6 pt-5 pb-3">
              <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setTaskMode('normativa')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    taskMode === 'normativa'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Obligación Normativa
                  {unassignedTasks.length > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      taskMode === 'normativa' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {unassignedTasks.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setTaskMode('libre')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    taskMode === 'libre'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  Tarea Libre / Operativa
                </button>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
              <form id="task-drawer-form" onSubmit={handleSubmit} className="space-y-5">
                
                {/* 1. NORMATIVE MODE */}
                {taskMode === 'normativa' && (
                  <div className="space-y-4">
                    {unassignedTasks.length === 0 ? (
                      <div className="p-6 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-center space-y-2">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-emerald-900">
                          ¡No hay obligaciones pendientes por asignar!
                        </h4>
                        <p className="text-xs text-emerald-700 max-w-xs mx-auto">
                          Todas las tareas derivadas de tus normativas ya tienen un responsable o no hay nuevas sugerencias.
                        </p>
                        <button
                          type="button"
                          onClick={() => setTaskMode('libre')}
                          className="mt-2 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          + Crear Tarea Libre en su lugar
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                            <span>Seleccionar Obligación de Ley <span className="text-rose-500">*</span></span>
                            <span className="text-[11px] text-indigo-600 font-medium lowercase">
                              {unassignedTasks.length} sugerencias disponibles
                            </span>
                          </label>
                          <select
                            value={selectedTaskId}
                            onChange={(e) => setSelectedTaskId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                          >
                            {Object.entries(groupedTasks).map(([lawName, items]) => (
                              <optgroup key={lawName} label={`📜 ${lawName}`}>
                                {items.map((t) => (
                                  <option key={t.id} value={String(t.id)}>
                                    {t.tarea}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>

                        {/* Selected Task Details Preview Box */}
                        {activeSelectedTask && (
                          <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                <Layers className="w-3 h-3" />
                                {activeSelectedTask.asociada_a || activeSelectedTask.asociadaA || 'General'}
                              </span>
                              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                Pendiente
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                              {activeSelectedTask.tarea}
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                              Esta tarea fue identificada como un requisito obligatorio de cumplimiento.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 2. FREE OPERATIONAL MODE */}
                {taskMode === 'libre' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Descripción de la Tarea <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={tareaTitulo}
                        onChange={(e) => setTareaTitulo(e.target.value)}
                        placeholder="Ej. Realizar respaldo trimestral de bases de datos y documentar protocolo..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          Categoría / Área / Etiqueta
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
                      </label>
                      <input
                        type="text"
                        value={categoriaLibre}
                        onChange={(e) => setCategoriaLibre(e.target.value)}
                        placeholder="Ej. Operaciones, TI, RRHH, General"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                      />
                      {/* Quick Chips */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {['General', 'Operativa', 'TI / Seguridad', 'RRHH', 'Finanzas', 'Auditoría'].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => setCategoriaLibre(chip)}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                              categoriaLibre === chip
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SHARED FIELDS */}
                <div className="pt-2 border-t border-slate-100 space-y-4">
                  {/* Responsable */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Responsable Asignado <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={responsable}
                      onChange={(e) => setResponsable(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="" disabled>Selecciona un colaborador del equipo...</option>
                      {responsablesList.length > 0 ? (
                        responsablesList.map((r) => (
                          <option key={r.id} value={r.nombre}>
                            {r.nombre} {r.cargo ? `(${r.cargo})` : ''}
                          </option>
                        ))
                      ) : assigneesFallback.length > 0 ? (
                        assigneesFallback.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))
                      ) : (
                        <option value="Felipe Sanchez">Felipe Sanchez (Administrador)</option>
                      )}
                    </select>
                  </div>

                  {/* Vencimiento & Prioridad */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Fecha Límite <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={fechaVencimiento}
                        onChange={(e) => setFechaVencimiento(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                        Prioridad
                      </label>
                      <select
                        value={prioridad}
                        onChange={(e) => setPrioridad(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="critica">Crítica 🔥</option>
                      </select>
                    </div>
                  </div>

                  {/* Estado Inicial */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Estado Inicial
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'en_progreso', label: 'En Progreso', color: 'border-amber-200 bg-amber-50 text-amber-800' },
                        { id: 'pendiente', label: 'Pendiente', color: 'border-blue-200 bg-blue-50 text-blue-800' },
                        { id: 'al_dia', label: 'Completada', color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setEstado(st.id as any)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                            estado === st.id
                              ? `${st.color} ring-2 ring-indigo-500 font-extrabold shadow-xs`
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/80 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                form="task-drawer-form"
                type="submit"
                disabled={isSubmitting || (taskMode === 'normativa' && unassignedTasks.length === 0)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{taskMode === 'normativa' ? 'Asignar Obligación' : 'Crear Tarea'}</span>
                  </>
                )}
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
