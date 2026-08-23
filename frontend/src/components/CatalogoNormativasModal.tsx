import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, BookOpen, Plus, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface CatalogoNormativasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CatalogoNormativasModal: React.FC<CatalogoNormativasModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [normativas, setNormativas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      cargarNormativas();
    }
  }, [isOpen]);

  const cargarNormativas = async () => {
    setIsLoading(true);
    try {
      const data = await api.getNormativasDisponibles();
      setNormativas(data);
    } catch (error) {
      console.error('Error cargando normativas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAsignar = async (id: number) => {
    setIsAssigning(id);
    try {
      await api.asignarNormativa(id);
      onSuccess();
      cargarNormativas();
    } catch (error) {
      console.error('Error asignando normativa:', error);
    } finally {
      setIsAssigning(null);
    }
  };

  const normativasFiltradas = normativas.filter(n => 
    n.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.resumen?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display">Catálogo de Normativas</h2>
                  <p className="text-slate-400 text-sm">Explora e incorpora leyes a tu empresa</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="relative max-w-md mx-auto">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar normativa..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                  <p>Cargando catálogo...</p>
                </div>
              ) : normativasFiltradas.length === 0 ? (
                <div className="text-center p-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                  <p>No se encontraron normativas disponibles.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {normativasFiltradas.map((normativa: any) => (
                    <div key={normativa.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                            {normativa.codigo_bcn || normativa.origen || 'General'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1">{normativa.nombre}</h3>
                        <p className="text-sm text-slate-500 line-clamp-3 mb-4">{normativa.resumen || normativa.descripcion || 'Sin descripción disponible.'}</p>
                      </div>
                      <button 
                        onClick={() => handleAsignar(normativa.id)}
                        disabled={isAssigning === normativa.id}
                        className="w-full py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isAssigning === normativa.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Incorporar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
