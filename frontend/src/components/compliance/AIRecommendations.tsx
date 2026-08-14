import React from 'react';
import { Sparkles, Plus, Check } from 'lucide-react';

interface RecommendedNorm {
  id: string;
  nombre: string;
  descripcion: string;
  criticidad: 'alta' | 'media' | 'baja';
}

interface AIRecommendationsProps {
  rubro?: string;
  onAddNormativa: (norm: RecommendedNorm) => void;
  addedIds: string[];
}

const DEFAULT_RECOMMENDATIONS: Record<string, RecommendedNorm[]> = {
  default: [
    {
      id: 'rec_ley_19628',
      nombre: 'Ley 19.628 - Protección de Datos Personales',
      descripcion: 'Obligatoria para empresas que almacenan o procesan información personal de clientes o empleados.',
      criticidad: 'alta',
    },
    {
      id: 'rec_iso_27001',
      nombre: 'ISO/IEC 27001:2022',
      descripcion: 'Estándar internacional para Sistemas de Gestión de Seguridad de la Información (SGSI).',
      criticidad: 'alta',
    },
    {
      id: 'rec_ley_20393',
      nombre: 'Ley 20.393 - Responsabilidad Penal de las Personas Jurídicas',
      descripcion: 'Prevención de delitos como cohecho, lavado de activos y financiamiento del terrorismo.',
      criticidad: 'media',
    },
  ],
};

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  rubro,
  onAddNormativa,
  addedIds,
}) => {
  const recommendations = DEFAULT_RECOMMENDATIONS[rubro?.toLowerCase() || 'default'] || DEFAULT_RECOMMENDATIONS.default;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-lg border border-indigo-500/20 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
        <h3 className="text-base font-semibold text-white">Recomendaciones de IA para tu Empresa</h3>
        {rubro && (
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30">
            Rubro: {rubro}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-300 mb-4">
        Basado en el perfil de tu empresa, nuestro motor normativo sugiere adherir a las siguientes regulaciones:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recommendations.map((norm) => {
          const isAdded = addedIds.includes(norm.id);
          return (
            <div
              key={norm.id}
              className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col justify-between hover:bg-white/10 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      norm.criticidad === 'alta'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    Prioridad {norm.criticidad}
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-slate-100 mb-1">{norm.nombre}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">{norm.descripcion}</p>
              </div>

              <button
                onClick={() => onAddNormativa(norm)}
                disabled={isAdded}
                className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-medium transition-all ${
                  isAdded
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Añadida</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Incorporar</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
