import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, ArrowRight, Loader2, Target } from 'lucide-react';
import { api } from '../services/api';

const RUBROS = ['Tecnología', 'Salud', 'Finanzas', 'Manufactura', 'Servicios', 'Retail', 'Logística', 'Minería', 'Otro'];
const TAMANOS = ['Micro', 'Pequeña', 'Mediana', 'Grande'];

interface OnboardingEmpresaProps {
  onComplete: () => void;
  empresaNombre?: string;
}

export const OnboardingEmpresa: React.FC<OnboardingEmpresaProps> = ({ onComplete, empresaNombre = 'tu empresa' }) => {
  const [rubro, setRubro] = useState('');
  const [tamano, setTamano] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rubro || !tamano) return;
    
    setIsSubmitting(true);
    try {
      await api.setupEmpresa({ rubro, tamano });
      onComplete();
    } catch (err) {
      console.error('Error al guardar configuración de empresa', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        <div className="md:w-5/12 bg-indigo-600 dark:bg-indigo-700 p-8 flex flex-col justify-between text-white">
          <div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Bienvenido a Antigravity</h2>
            <p className="text-indigo-100 text-lg leading-relaxed">
              Para ofrecerte las normativas y alertas exactas, necesitamos conocer un poco más sobre {empresaNombre}.
            </p>
          </div>
          
          <div className="mt-8 flex items-center space-x-3 text-indigo-200 text-sm font-medium">
            <Target className="w-5 h-5 text-indigo-300" />
            <span>Asignación legal impulsada por IA</span>
          </div>
        </div>

        <div className="md:w-7/12 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="h-full flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Configuración Inicial
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  ¿Cuál es el rubro principal?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {RUBROS.slice(0, 8).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRubro(r)}
                      className={`px-4 py-2.5 text-sm font-medium rounded-xl border-2 transition-all ${
                        rubro === r 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'border-gray-200 text-gray-600 hover:border-indigo-200 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-4">
                  Tamaño de la empresa
                </label>
                <div className="flex space-x-2">
                  {TAMANOS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTamano(t)}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-xl border-2 transition-all ${
                        tamano === t 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'border-gray-200 text-gray-600 hover:border-indigo-200 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button
                type="submit"
                disabled={!rubro || !tamano || isSubmitting}
                className="w-full flex items-center justify-center py-3.5 px-6 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continuar al Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
