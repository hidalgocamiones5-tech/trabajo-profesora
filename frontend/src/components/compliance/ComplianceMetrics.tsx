import React from 'react';
import { ShieldCheck, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import type { Normativa } from '../../types';

interface ComplianceMetricsProps {
  normativas: Normativa[];
}

export const ComplianceMetrics: React.FC<ComplianceMetricsProps> = ({ normativas }) => {
  const total = normativas.length;
  const enTiempo = normativas.filter((n) => n.estado === 'en_tiempo' || n.progreso > 50).length;
  const atrasadas = normativas.filter((n) => n.estado === 'atrasada').length;
  
  const promedioProgreso = total > 0 
    ? Math.round(normativas.reduce((acc, curr) => acc + (curr.progreso || 0), 0) / total)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Normativas Activas</p>
          <p className="text-2xl font-bold text-slate-800">{total}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cumplimiento Global</p>
          <p className="text-2xl font-bold text-slate-800">{promedioProgreso}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-lemon-50 rounded-lg text-lemon-600">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">En Tiempo</p>
          <p className="text-2xl font-bold text-slate-800">{enTiempo}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Atrasadas / Alertas</p>
          <p className="text-2xl font-bold text-rose-600">{atrasadas}</p>
        </div>
      </div>
    </div>
  );
};
