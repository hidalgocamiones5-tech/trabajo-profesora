import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Sparkles, Filter, BookOpen, Loader2, ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import { CreateNormativaModal } from '../components/CreateNormativaModal';
import { CatalogoNormativasModal } from '../components/CatalogoNormativasModal';
import { bcnService } from '../services/bcnService';
import type { LeyOficialBCN } from '../services/bcnService';
import { api } from '../services/api';
import { NormativaDetailView } from './NormativaDetailView';
import toast from 'react-hot-toast';

export const Compliance = () => {
  const [selectedNormativaId, setSelectedNormativaId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCatalogoModalOpen, setIsCatalogoModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [leyes, setLeyes] = useState<LeyOficialBCN[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeyes = async () => {
      setIsLoading(true);
      try {
        const complianceData = await api.getEmpresaCompliance().catch(() => []);
        
        if (complianceData && complianceData.length > 0) {
          // Filtrar leyes que no aplican o que están aún en revisión por los administradores (sugeridas por IA)
          const activas = complianceData.filter((c: any) => 
            c.estado !== 'NO_APLICA' && 
            c.estado !== 'RECHAZADA' && 
            c.estado !== 'SUGERIDA_IA'
          );
          
          const mapped = activas.map((c: any) => {
            const isBase = c.origen === 'MOTOR_REGLAS';
            const isIA = c.origen === 'SMART_DISCOVERY_IA';
            
            return {
              id: c.normativa?.codigo_bcn || c.normativa?.id?.toString() || Math.random().toString(),
              numero: c.normativa?.codigo_bcn ? `Ley N° ${c.normativa.codigo_bcn}` : (isIA ? 'Sugerencia IA' : 'Regulación Base'),
              nombre: c.normativa?.nombre || 'Normativa',
              alias: c.normativa?.nombre || '',
              fechaPublicacion: c.created_at?.split('T')[0] || '',
              resumen: c.justificacion_ia || c.normativa?.resumen || c.normativa?.descripcion || 'Sin descripción.',
              sectores: [isBase ? 'Transversal' : (isIA ? 'IA Específica' : 'General')],
              progreso: c.porcentaje_progreso || 0,
              estado: c.porcentaje_progreso >= 80 ? 'en_tiempo' : 'en_riesgo',
              origen: c.origen,
              estado_compliance: c.estado,
              db_compliance_id: c.id
            };
          });
          setLeyes(mapped);
        } else {
          setLeyes([]);
        }
      } catch (err) {
        console.error('Error al cargar catálogo:', err);
        setLeyes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeyes();
  }, []);

  const filteredLeyes = leyes.filter(l =>
    l.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.numero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalLeyes = leyes.length;
  const globalCompliance = totalLeyes > 0 
    ? (leyes.reduce((acc, l) => acc + (l.progreso || 0), 0) / totalLeyes).toFixed(1)
    : '0.0';
  const enTiempoCount = leyes.filter(l => (l.progreso || 0) >= 50 || l.estado === 'en_tiempo').length;
  const atrasadasCount = leyes.filter(l => l.estado === 'atrasada' || l.estado === 'en_riesgo').length;

  const [isDiscovering, setIsDiscovering] = useState(false);

  const handleCrearConIA = async () => {
    toast.success("Iniciando Asistente IA para sugerir normativas según tu rubro...");
    setIsDiscovering(true);
    try {
      const res = await api.ejecutarSmartDiscovery();
      toast.success(res.message || "Descubrimiento completado con éxito.");
      const updated = await api.getEmpresaCompliance();
      setLeyes(updated);
    } catch (e) {
      toast.error("Error al ejecutar descubrimiento IA");
    } finally {
      setIsDiscovering(false);
    }
  };

  const renderNormativasList = () => (
    <motion.div
      key="list"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">
            Catálogo de Cumplimiento & Regulaciones
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Gestión y seguimiento de normativas chilenas e internacionales para la empresa
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCatalogoModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-semibold text-xs shadow-xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            Explorar Catálogo
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-semibold text-xs shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            + Crear normativa (Manual)
          </button>
          <button
            onClick={handleCrearConIA}
            disabled={isDiscovering}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-colors font-semibold text-xs cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${isDiscovering ? 'animate-spin' : ''}`} />
            {isDiscovering ? 'Analizando...' : '+ Crear con IA'}
          </button>
        </div>
      </div>

      {/* KPI Bar de Cumplimiento (Dinámico) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Normativas Activas</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{totalLeyes}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cumplimiento Global</div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{globalCompliance}%</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">En Tiempo</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{enTiempoCount}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Atrasadas / Alertas</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{atrasadasCount}</div>
          </div>
        </div>
      </div>

      {/* Toolbar / Search Bar */}
      <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar normativa por nombre o palabra clave..."
            className="w-full pl-9 pr-4 py-1.5 text-xs font-medium bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800"
          />
        </div>
        <div className="w-px h-6 bg-slate-200"></div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold">
          <Filter className="w-3.5 h-3.5" /> Filtrar
        </button>
      </div>

      {/* Grid de Tarjetas de Normativas (Leyes Chilenas Oficiales) */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-xs font-semibold">Cargando catálogo de leyes chilenas BCN...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLeyes.map((law) => (
            <div
              key={law.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Badges: Estado & Origen */}
                <div className="flex items-center justify-between mb-3">
                  {law.estado === 'en_tiempo' && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      EN TIEMPO
                    </span>
                  )}
                  {law.estado === 'en_riesgo' && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      EN RIESGO
                    </span>
                  )}
                  {law.estado === 'atrasada' && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      ATRASADA
                    </span>
                  )}

                  {law.origen === 'SMART_DISCOVERY_IA' ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> IA ESPECÍFICA
                    </span>
                  ) : law.origen === 'MOTOR_REGLAS' ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> BASE UNIVERSAL
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200">
                      MANUAL
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-mono font-bold text-indigo-600 mb-1">{law.numero}</div>
                <h3 className="font-bold text-slate-900 text-sm mb-2 group-hover:text-indigo-600 transition-colors leading-snug">
                  {law.nombre}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                  {law.resumen}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>Avance de Cumplimiento</span>
                    <span className="text-indigo-600 font-bold">{law.progreso}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${law.progreso}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Button: Ver Detalle (Ficha 360°) */}
              <button
                onClick={() => setSelectedNormativaId(law.id)}
                className="w-full py-2 bg-slate-50 hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-indigo-600 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Ver Detalle
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      <CatalogoNormativasModal
        isOpen={isCatalogoModalOpen}
        onClose={() => setIsCatalogoModalOpen(false)}
        onSuccess={() => {
          bcnService.getLeyes().then(setLeyes);
        }}
      />
      <CreateNormativaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          bcnService.getLeyes().then(setLeyes);
        }}
      />
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {selectedNormativaId ? (
        <NormativaDetailView
          key="detail"
          normativaId={selectedNormativaId}
          onBack={() => setSelectedNormativaId(null)}
        />
      ) : (
        renderNormativasList()
      )}
    </AnimatePresence>
  );
};
