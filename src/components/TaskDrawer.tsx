import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, User, Calendar, Tag, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { mockApi } from '../services/mockApi';

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

export const TaskDrawer = ({ isOpen, onClose, onTaskCreated }: TaskDrawerProps) => {
  const [tareaDesc, setTareaDesc] = useState('');
  const [asociadaA, setAsociadaA] = useState('ISO 27001');
  const [responsable, setResponsable] = useState('Felipe Sanchez');
  const [fecha, setFecha] = useState('');
  const [estado, setEstado] = useState<'al_dia' | 'en_progreso' | 'vencido'>('en_progreso');

  const [usuarios, setUsuarios] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      mockApi.getAssignees().then(setUsuarios);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tareaDesc || !fecha) return;

    setIsSubmitting(true);
    try {
      await mockApi.crearTarea({
        tarea: tareaDesc,
        asociadaA: asociadaA,
        responsableAsignado: responsable,
        fechaVencimiento: fecha,
        estado: estado
      });
      onTaskCreated(); // Recarga la lista
      
      // Reset
      setTareaDesc('');
      setFecha('');
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-semibold text-slate-800">Nueva Tarea (Action Item)</h2>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descripción de la Tarea <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    required
                    rows={3}
                    value={tareaDesc}
                    onChange={e => setTareaDesc(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-lemon-500 outline-none resize-none"
                    placeholder="Ej. Actualizar matriz de riesgos de TI..."
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Tag className="w-4 h-4 text-slate-400" />
                    Asociada a
                  </label>
                  <select 
                    value={asociadaA}
                    onChange={e => setAsociadaA(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-lemon-500 outline-none"
                  >
                    <option value="ISO 27001">ISO 27001</option>
                    <option value="Protección de Datos Personales">Protección de Datos Personales</option>
                    <option value="Ley 20137">Ley 20137</option>
                    <option value="Auditoría Interna">Auditoría Interna</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <User className="w-4 h-4 text-slate-400" />
                    Responsable
                  </label>
                  <select 
                    value={responsable}
                    onChange={e => setResponsable(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-lemon-500 outline-none"
                  >
                    {usuarios.length > 0 ? (
                      usuarios.map(u => <option key={u} value={u}>{u}</option>)
                    ) : (
                      <option value="Felipe Sanchez">Felipe Sanchez</option> // Fallback
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Vencimiento <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="date"
                      required
                      value={fecha}
                      onChange={e => setFecha(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-lemon-500 outline-none text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <AlertTriangle className="w-4 h-4 text-slate-400" />
                      Estado Inicial
                    </label>
                    <select 
                      value={estado}
                      onChange={e => setEstado(e.target.value as any)}
                      className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-lemon-500 outline-none"
                    >
                      <option value="en_progreso">En Progreso</option>
                      <option value="al_dia">Al Día (Completada)</option>
                      <option value="vencido">Vencido</option>
                    </select>
                  </div>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex gap-3 bg-white">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                form="task-form"
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-lemon-500 text-slate-900 font-medium rounded-lg hover:bg-lemon-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Guardando...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Asignar Tarea
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
