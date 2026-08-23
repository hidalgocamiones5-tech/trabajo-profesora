import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, CheckSquare, ShieldAlert, BookOpen, X, ArrowRight } from 'lucide-react';
import { CHILEAN_LAWS_DB } from '../services/bcnService';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView?: (view: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose, onSelectView }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled externally if listener placed high enough
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredLaws = CHILEAN_LAWS_DB.filter(law =>
    law.nombre.toLowerCase().includes(query.toLowerCase()) ||
    law.alias.toLowerCase().includes(query.toLowerCase()) ||
    law.numero.toLowerCase().includes(query.toLowerCase())
  );

  const quickActions = [
    { title: 'Ver Panel Ejecutivo', view: 'Inicio', icon: FileText, category: 'Navegación' },
    { title: 'Catálogo de Cumplimiento & Leyes BCN', view: 'Cumplimiento', icon: BookOpen, category: 'Navegación' },
    { title: 'Gestión de Tareas & Action Items', view: 'Gestión', icon: CheckSquare, category: 'Navegación' },
    { title: 'Alertas & Riesgos Críticos', view: 'Alertas', icon: ShieldAlert, category: 'Navegación' },
  ].filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden"
        >
          {/* Header Input */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Search className="w-5 h-5 text-indigo-500 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Escribe un comando o busca normativas (ej: Ley Karin, Datos Personales, Cmd+K)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none text-base font-medium"
            />
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[380px] overflow-y-auto p-2 space-y-4">
            {/* Quick Actions */}
            {quickActions.length > 0 && (
              <div>
                <h4 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vistas & Accesos Rápidos</h4>
                <div className="space-y-1">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (onSelectView) onSelectView(action.view);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-indigo-50/70 hover:text-indigo-700 text-slate-700 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-indigo-600 rounded-lg transition-colors">
                          <action.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{action.title}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chilean Laws BCN */}
            <div>
              <h4 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Leyes & Regulaciones Oficiales BCN</h4>
              <div className="space-y-1">
                {filteredLaws.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400">No se encontraron normativas que coincidan con "{query}"</div>
                ) : (
                  filteredLaws.map((law) => (
                    <button
                      key={law.id}
                      onClick={() => {
                        if (onSelectView) onSelectView('Cumplimiento');
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-indigo-50/70 text-slate-700 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 whitespace-nowrap">
                          {law.numero}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600">{law.alias}</div>
                          <div className="text-xs text-slate-400 line-clamp-1">{law.nombre}</div>
                        </div>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                        {law.progreso}% Cumplido
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer keyboard guide */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500 font-mono shadow-xs">ESC</kbd>
              <span>para cerrar</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500 font-mono shadow-xs">⌘ K</kbd>
              <span>Atajo directo</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
