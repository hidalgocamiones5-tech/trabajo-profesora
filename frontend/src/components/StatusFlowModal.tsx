import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  Upload, 
  FileText, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  Calendar,
  FileCheck2,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { TareaPendiente } from '../types';

interface StatusFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  tarea: TareaPendiente | null;
  targetState: 'pendiente' | 'en_progreso' | 'completada';
  onConfirm: (payload: {
    estado: string;
    comentario?: string;
    nombreArchivo?: string;
    archivo?: File;
  }) => Promise<void>;
}

export const StatusFlowModal = ({
  isOpen,
  onClose,
  tarea,
  targetState,
  onConfirm
}: StatusFlowModalProps) => {
  const [comentario, setComentario] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !tarea) return null;

  const isTransitionToProgress = targetState === 'en_progreso';
  const isTransitionToCompleted = targetState === 'completada';
  const isTransitionToPending = targetState === 'pendiente';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (isTransitionToProgress && comentario.trim().length < 5) {
      toast.error('Por favor ingresa un comentario o plan de acción inicial (mín. 5 caracteres)');
      return;
    }

    if (isTransitionToCompleted && !selectedFile && !tarea.nombreArchivoEvidencia) {
      toast.error('Es obligatorio adjuntar un archivo de evidencia probatoria para cerrar la tarea.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm({
        estado: targetState,
        comentario: comentario.trim(),
        nombreArchivo: selectedFile ? selectedFile.name : undefined,
        archivo: selectedFile || undefined
      });
      toast.success(
        isTransitionToProgress
          ? 'Tarea iniciada con registro de plan de acción 🚀'
          : isTransitionToCompleted
            ? 'Evidencia validada y tarea completada con éxito 🎉'
            : 'Tarea reabierta y devuelta a pendiente'
      );
      setComentario('');
      setSelectedFile(null);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Hubo un error al procesar el cambio de estado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className={`p-5 border-b flex items-start justify-between ${
            isTransitionToProgress 
              ? 'bg-sky-50/70 border-sky-100' 
              : isTransitionToCompleted 
                ? 'bg-emerald-50/70 border-emerald-100' 
                : 'bg-slate-50 border-slate-100'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`p-2.5 rounded-xl ${
                isTransitionToProgress
                  ? 'bg-sky-500 text-white'
                  : isTransitionToCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-600 text-white'
              }`}>
                {isTransitionToProgress && <Clock className="w-5 h-5" />}
                {isTransitionToCompleted && <ShieldCheck className="w-5 h-5" />}
                {isTransitionToPending && <AlertCircle className="w-5 h-5" />}
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isTransitionToProgress && 'Iniciar Ejecución (Paso a En Progreso)'}
                  {isTransitionToCompleted && 'Cierre y Verificación de Cumplimiento'}
                  {isTransitionToPending && 'Reabrir Tarea (Paso a Pendiente)'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Flujo de trazabilidad y validación de evidencias GRC
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Task Info Summary */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Tarea Seleccionada
              </div>
              <h4 className="text-xs font-bold text-slate-800 leading-snug">
                {tarea.tarea}
              </h4>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  <FileText className="w-3 h-3 text-slate-400" />
                  {tarea.asociadaA || 'General'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Límite: {tarea.fechaVencimiento || 'Sin fecha'}
                </span>
              </div>
            </div>

            {/* Transition to IN PROGRESS */}
            {isTransitionToProgress && (
              <div className="space-y-4">
                <div className="p-3 bg-sky-50/50 border border-sky-100 rounded-xl flex items-start gap-2.5 text-xs text-sky-900">
                  <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Requisito de Inicio:</span> Para asegurar que el trabajo ha comenzado de forma estructurada, describe el plan de acción, alcance inicial o reunión de kickoff.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Plan de Acción / Justificación de Avance <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Ej: Se coordinó reunión con el área de operaciones y se definió la plantilla de protocolo a implementar esta semana..."
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Documento de Inicio / Plan de Trabajo <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <div className="relative border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-xl p-3.5 text-center transition-colors bg-slate-50/30">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      {selectedFile ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                          <FileCheck2 className="w-4 h-4 text-sky-600" />
                          {selectedFile.name}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Arrastra o <span className="text-sky-600 font-semibold underline">selecciona un archivo</span> (PDF, DOCX, XLSX)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transition to COMPLETED */}
            {isTransitionToCompleted && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Control de Cumplimiento:</span> Para dar por cerrada la tarea y computar el porcentaje de cumplimiento normativo, es obligatorio adjuntar el archivo probatorio (evidencia firmada, informe, certificado, etc.).
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Evidencia Probatoria Obligatoria <span className="text-rose-500">*</span>
                  </label>
                  <div className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                    selectedFile || tarea.nombreArchivoEvidencia
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-200 hover:border-emerald-400 bg-slate-50/30'
                  }`}>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center">
                      <Upload className={`w-6 h-6 mb-1.5 ${selectedFile ? 'text-emerald-600' : 'text-slate-400'}`} />
                      {selectedFile ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-xs">
                          <FileCheck2 className="w-4 h-4 text-emerald-600" />
                          {selectedFile.name}
                        </div>
                      ) : tarea.nombreArchivoEvidencia ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <FileCheck2 className="w-4 h-4 text-emerald-600" />
                          Evidencia actual: {tarea.nombreArchivoEvidencia} (haz clic para reemplazar)
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs font-semibold text-slate-700 block">
                            Subir archivo de evidencia probatoria
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Formatos admitidos: PDF, PNG, JPG, ZIP, DOCX (Máx. 15MB)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Conclusiones y Observaciones de Cierre <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Detalles sobre la ejecución final, fecha de aprobación o notas para auditoría..."
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Transition to PENDING */}
            {isTransitionToPending && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Reapertura de Tarea:</span> Al volver la tarea a estado pendiente, el progreso asociado a esta normativa disminuirá en el cálculo general.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Motivo de reapertura <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Ej: Se requieren correcciones adicionales en el documento..."
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer ${
                  isTransitionToProgress
                    ? 'bg-sky-600 hover:bg-sky-700'
                    : isTransitionToCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-slate-800 hover:bg-slate-900'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting
                  ? 'Guardando...'
                  : isTransitionToProgress
                    ? 'Confirmar e Iniciar'
                    : isTransitionToCompleted
                      ? 'Validar y Completar'
                      : 'Confirmar Reapertura'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
