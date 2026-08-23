import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, FileText, Calendar, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

interface CreateNormativaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (nuevaNormativa: any) => void;
  empresas?: any[];
}

export const CreateNormativaModal: React.FC<CreateNormativaModalProps> = ({ isOpen, onClose, onSuccess, empresas = [] }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    titulo: '',
    codigo_bcn: '',
    resumen: '',
    descripcion: '',
    fechaInicio: '',
    fechaTermino: '',
    criticidad: 'media',
    empresa_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        fecha_inicio: formData.fechaInicio,
        fecha_termino: formData.fechaTermino,
        empresa: formData.empresa_id ? parseInt(formData.empresa_id) : null
      };
      const result = await api.crearNormativa(payload);
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error("Error creating normativa", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-lemon-500/20 rounded-lg text-lemon-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold font-display">Crear Nueva Normativa</h2>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <form id="crear-normativa-form" onSubmit={handleSubmit} className="space-y-6">
                
                {empresas.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Empresa Asignada</label>
                    <select
                      name="empresa_id"
                      value={formData.empresa_id}
                      onChange={handleChange}
                      className="w-full border-slate-200 rounded-lg p-3 text-slate-700 focus:ring-lemon-500 focus:border-lemon-500"
                    >
                      <option value="">-- General (Todas las empresas) --</option>
                      {empresas.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre (Corto) *</label>
                    <input
                      required
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej. Ley Karin"
                      className="w-full border-slate-200 rounded-lg p-3 focus:ring-lemon-500 focus:border-lemon-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Código BCN / Norma</label>
                    <input
                      name="codigo_bcn"
                      value={formData.codigo_bcn}
                      onChange={handleChange}
                      placeholder="Ej. Ley N° 21.643"
                      className="w-full border-slate-200 rounded-lg p-3 focus:ring-lemon-500 focus:border-lemon-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Título Oficial</label>
                  <input
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Modifica el Código del Trabajo en materia de prevención..."
                    className="w-full border-slate-200 rounded-lg p-3 focus:ring-lemon-500 focus:border-lemon-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Resumen (Dashboard)</label>
                  <textarea
                    name="resumen"
                    rows={2}
                    value={formData.resumen}
                    onChange={handleChange}
                    className="w-full border-slate-200 rounded-lg p-3 focus:ring-lemon-500 focus:border-lemon-500 resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
                      <Calendar className="w-4 h-4 text-slate-400" /> Fecha Inicio
                    </label>
                    <input
                      type="date"
                      name="fechaInicio"
                      required
                      value={formData.fechaInicio}
                      onChange={handleChange}
                      className="w-full border-slate-200 rounded-lg p-3 focus:ring-lemon-500 focus:border-lemon-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
                      <Calendar className="w-4 h-4 text-slate-400" /> Fecha Término
                    </label>
                    <input
                      type="date"
                      name="fechaTermino"
                      value={formData.fechaTermino}
                      onChange={handleChange}
                      className="w-full border-slate-200 rounded-lg p-3 focus:ring-lemon-500 focus:border-lemon-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
                      <AlertTriangle className="w-4 h-4 text-slate-400" /> Criticidad
                    </label>
                    <select
                      name="criticidad"
                      value={formData.criticidad}
                      onChange={handleChange}
                      className="w-full border-slate-200 rounded-lg p-3 text-slate-700 focus:ring-lemon-500 focus:border-lemon-500"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="crear-normativa-form"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-lemon-500 text-slate-900 font-semibold rounded-lg hover:bg-lemon-600 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Guardando...' : 'Guardar Normativa'}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
