import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  children: React.ReactNode;
}

export const ProjectAccess = ({ children }: Props) => {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Check if previously unlocked in this session
  useEffect(() => {
    if (sessionStorage.getItem('grc_boceto_unlocked') === 'true') {
      setUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Proyecto2026@') {
      setUnlocked(true);
      sessionStorage.setItem('grc_boceto_unlocked', 'true');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className={unlocked ? "" : "blur-md pointer-events-none select-none opacity-40 transition-all duration-700"}>
        {children}
      </div>

      <AnimatePresence>
        {!unlocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full border border-white/20"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-600">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Proyecto Privado</h2>
              <p className="text-sm text-slate-500 mb-6">Ingresa la contraseña maestra para acceder a la maqueta interactiva.</p>
              
              <form onSubmit={handleSubmit}>
                <div className="relative mb-4">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña del proyecto"
                    className={`w-full pl-4 pr-12 py-3.5 rounded-xl border ${error ? 'border-red-500 bg-red-50 text-red-900' : 'border-slate-200 bg-slate-50'} focus:outline-none focus:ring-2 focus:ring-slate-800 transition-colors font-medium`}
                    autoFocus
                  />
                  <button type="submit" className="absolute right-2 top-2 bottom-2 aspect-square bg-slate-800 text-white rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {error && <p className="text-xs text-red-500 font-medium animate-pulse">Contraseña incorrecta</p>}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
