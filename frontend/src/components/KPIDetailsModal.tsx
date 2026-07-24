import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { api } from '../services/api';

interface KPIDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpiType: 'Normativas' | 'Riesgos' | 'Incidentes' | 'Solicitudes' | null;
}

export const KPIDetailsModal = ({ isOpen, onClose, kpiType }: KPIDetailsModalProps) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !kpiType) return;
    
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let result: any[] = [];
        if (kpiType === 'Normativas') {
          result = await api.getNormativas();
        } else if (kpiType === 'Riesgos') {
          result = await api.getRiesgos();
        } else if (kpiType === 'Incidentes') {
          result = await api.getIncidentes();
        } else if (kpiType === 'Solicitudes') {
          result = await api.getSolicitudes();
        }
        if (isMounted) setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchData();
    return () => { isMounted = false; };
  }, [isOpen, kpiType]);

  const renderIcon = () => {
    if (kpiType === 'Normativas') return <FileText className="w-5 h-5 text-lemon-600" />;
    if (kpiType === 'Solicitudes') return <CheckCircle className="w-5 h-5 text-blue-600" />;
    return <AlertTriangle className="w-5 h-5 text-orange-500" />;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-lemon-500 mb-4" />
          <p>Cargando detalles de {kpiType}...</p>
        </div>
      );
    }

    if (data.length === 0) {
      return <div className="p-10 text-center text-slate-500">No hay datos disponibles.</div>;
    }

    let col1: any[] = [];
    let col2: any[] = [];
    let title1 = '';
    let title2 = '';
    let style1 = '';
    let style2 = '';

    if (kpiType === 'Normativas') {
      col1 = data.filter(n => n.estado === 'atrasada' || n.estado === 'en_riesgo');
      col2 = data.filter(n => n.estado === 'en_tiempo');
      title1 = 'Atrasadas / En Riesgo';
      title2 = 'En Tiempo';
      style1 = 'bg-red-50 text-red-700 border-red-100';
      style2 = 'bg-lemon-50 text-lemon-700 border-lemon-200';
    } else if (kpiType === 'Riesgos') {
      col1 = data.filter(r => r.estado === 'pendiente');
      col2 = data.filter(r => r.estado === 'en_curso');
      title1 = 'Pendientes';
      title2 = 'En Curso';
      style1 = 'bg-orange-50 text-orange-700 border-orange-100';
      style2 = 'bg-blue-50 text-blue-700 border-blue-100';
    } else if (kpiType === 'Incidentes') {
      col1 = data.filter(i => i.estado === 'en_progreso');
      col2 = data.filter(i => i.estado === 'completado');
      title1 = 'En Progreso';
      title2 = 'Completados';
      style1 = 'bg-blue-50 text-blue-700 border-blue-100';
      style2 = 'bg-emerald-50 text-emerald-700 border-emerald-100';
    } else if (kpiType === 'Solicitudes') {
      col1 = data.filter(s => s.estado === 'recibida');
      col2 = data.filter(s => s.estado === 'en_progreso');
      title1 = 'Recibidas';
      title2 = 'En Progreso';
      style1 = 'bg-slate-100 text-slate-700 border-slate-200';
      style2 = 'bg-blue-50 text-blue-700 border-blue-100';
    }

    const renderItem = (item: any) => {
      let mainText = item.nombre || item.titulo || item.tipo;
      let subText = item.origen || item.probabilidad || item.usuario || item.severidad || `ID: ${item.id}`;
      return (
        <div key={item.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm mb-3 hover:shadow-md transition-shadow">
          <h4 className="font-medium text-slate-800 text-sm">{mainText}</h4>
          <p className="text-xs text-slate-500 mt-1">{subText}</p>
        </div>
      );
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        {/* Columna 1 */}
        <div className="flex flex-col h-full bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
          <div className={clsx("p-4 border-b font-semibold flex items-center justify-between", style1)}>
            <span>{title1}</span>
            <span className="px-2 py-0.5 bg-white/50 rounded-md text-sm">{col1.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            {col1.length > 0 ? col1.map(renderItem) : <p className="text-sm text-slate-400 text-center py-4">Sin registros</p>}
          </div>
        </div>

        {/* Columna 2 */}
        <div className="flex flex-col h-full bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
          <div className={clsx("p-4 border-b font-semibold flex items-center justify-between", style2)}>
            <span>{title2}</span>
            <span className="px-2 py-0.5 bg-white/50 rounded-md text-sm">{col2.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            {col2.length > 0 ? col2.map(renderItem) : <p className="text-sm text-slate-400 text-center py-4">Sin registros</p>}
          </div>
        </div>
      </div>
    );
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] min-h-[500px] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    {renderIcon()}
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Detalle de {kpiType}
                  </h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-hidden p-6 bg-white">
                {renderContent()}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
