import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { bcnService } from '../services/bcnService';
import type { LeyOficialBCN } from '../services/bcnService';
import {
  ArrowLeft, Download, ShieldCheck, CheckCircle, AlertTriangle, FileText, UploadCloud,
  Calendar, Users, Scale, Search, PlayCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NormativaDetailViewProps {
  normativaId: string;
  onBack: () => void;
}

export const NormativaDetailView: React.FC<NormativaDetailViewProps> = ({ normativaId, onBack }) => {
  const [ley, setLey] = useState<LeyOficialBCN | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('resumen');

  useEffect(() => {
    const fetchLey = async () => {
      setIsLoading(true);
      const data = await bcnService.getLeyPorId(normativaId);
      if (data) {
        setLey(data);
      }
      setIsLoading(false);
    };
    fetchLey();
  }, [normativaId]);

  const handleGenerarInforme = () => {
    toast.success('Generando Informe Ejecutivo... El PDF se descargará en breve 📄');
  };

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Cargando expediente 360°...</div>;
  }

  if (!ley) {
    return <div className="p-12 text-center text-slate-500 font-medium">No se encontró la normativa.</div>;
  }

  const sections = [
    { id: 'resumen', label: '1. Resumen & Ficha', icon: <FileText className="w-4 h-4" /> },
    { id: 'obligaciones', label: '2. Obligaciones', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'brechas', label: '3. Mapa de Brechas', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'controles', label: '4. Controles', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'evidencias', label: '5. Evidencias', icon: <UploadCloud className="w-4 h-4" /> },
    { id: 'riesgos', label: '6. Riesgos & Incidentes', icon: <Scale className="w-4 h-4" /> },
    { id: 'auditorias', label: '7. Auditorías & Plan', icon: <Search className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Ficha 360 */}
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-0 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-indigo-100">Ficha 360°</span>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full border border-slate-200">ID: {ley.numero}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">{ley.nombre}</h1>
            </div>
          </div>
          <button 
            onClick={handleGenerarInforme}
            className="px-5 py-2.5 bg-[#84CC16] hover:bg-[#65A30D] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Generar Informe Ejecutivo</span>
          </button>
        </div>

        {/* Tab Navigation for sections */}
        <div className="flex overflow-x-auto gap-2 mt-6 pb-2 hide-scrollbar">
          {sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer border ${
                activeSection === sec.id 
                  ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              {sec.icon} {sec.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
        
        {/* 1. Resumen General */}
        {activeSection === 'resumen' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600"/> Resumen General & Ficha</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estado Global</p>
                <div className="text-3xl font-bold text-[#84CC16]">{ley.progreso}%</div>
                <p className="text-xs text-slate-500 font-medium mt-1">Cumplimiento {ley.estado}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Semáforo</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-4 h-4 rounded-full shadow-inner ${ley.criticidad === 'Crítica' ? 'bg-red-500' : ley.criticidad === 'Alta' ? 'bg-orange-500' : 'bg-amber-500'}`}></div>
                  <span className={`font-bold ${ley.criticidad === 'Crítica' ? 'text-red-700' : ley.criticidad === 'Alta' ? 'text-orange-700' : 'text-amber-700'}`}>Riesgo {ley.criticidad}</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Responsable</p>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-700">Equipo Legal & GRC</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Última Revisión</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-700">Hace 15 días</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-bold text-slate-500 mb-2">Descripción Oficial (Extraída BCN):</p>
              <div className="p-4 bg-slate-50 rounded-xl text-slate-700 text-sm leading-relaxed border border-slate-100">
                {ley.resumen}
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Obligaciones Asociadas */}
        {activeSection === 'obligaciones' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-600"/> Checklist de Obligaciones</h2>
            <div className="space-y-3">
              {[
                { title: 'Actualizar Reglamento Interno', status: 'Cumplida', color: 'bg-emerald-100 text-emerald-700' },
                { title: 'Protocolo de Prevención', status: 'Parcial', color: 'bg-amber-100 text-amber-700' },
                { title: 'Canal de Denuncias Anónimo', status: 'Pendiente', color: 'bg-red-100 text-red-700' }
              ].map((obl, i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-xl flex justify-between items-center bg-white hover:border-[#84CC16] transition-colors cursor-pointer shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center">
                      {obl.status === 'Cumplida' && <CheckCircle className="w-4 h-4 text-[#84CC16]" />}
                    </div>
                    <span className="font-semibold text-slate-800">{obl.title}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${obl.color}`}>{obl.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 3. Mapa de Brechas */}
        {activeSection === 'brechas' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500"/> Mapa de Brechas (GAP Analysis)</h2>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">Hallazgo / Brecha</th>
                    <th className="px-4 py-3">Nivel Riesgo</th>
                    <th className="px-4 py-3">Acción Requerida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-800">Falta capacitación anual a geraturas</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-red-100 text-red-700 rounded-md font-bold text-[10px]">Alto</span></td>
                    <td className="px-4 py-3">Agendar capacitación en plataforma externa</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-800">Políticas no firmadas por 15% de empleados</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md font-bold text-[10px]">Medio</span></td>
                    <td className="px-4 py-3">Enviar recordatorio automático vía RRHH</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* 4. Controles */}
        {activeSection === 'controles' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-500"/> Controles Asociados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800">Control de Accesos Lógicos (C-{i})</h4>
                    <span className="px-2 py-1 bg-white border border-slate-200 text-slate-500 rounded text-[10px] font-bold">Semestral</span>
                  </div>
                  <p className="text-xs text-slate-500">Revisión de permisos en sistemas core para asegurar el principio de mínimo privilegio.</p>
                  <button className="mt-2 text-xs font-bold text-[#84CC16] hover:underline self-start flex items-center gap-1">
                    <PlayCircle className="w-3.5 h-3.5" /> Ejecutar Control
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 5. Evidencias */}
        {activeSection === 'evidencias' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><UploadCloud className="w-5 h-5 text-slate-500"/> Repositorio de Evidencias</h2>
              <button className="px-3 py-1.5 bg-[#84CC16]/10 text-lime-700 border border-[#84CC16]/20 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">
                <UploadCloud className="w-3.5 h-3.5" /> Subir Evidencia
              </button>
            </div>
            <div className="space-y-2">
              <div className="p-3 border border-slate-200 rounded-xl flex justify-between items-center hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-500 rounded-lg"><FileText className="w-4 h-4" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Reglamento_Interno_v2.pdf</p>
                    <p className="text-[10px] font-medium text-slate-400">Subido por Juan Pérez - Hace 2 días</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </motion.div>
        )}

        {/* 6. Riesgos */}
        {activeSection === 'riesgos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Scale className="w-5 h-5 text-red-500"/> Riesgos e Incidentes Relacionados</h2>
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">No hay incidentes reportados</p>
              <p className="text-xs text-slate-400 mt-1">La matriz de riesgos asociada se encuentra dentro del apetito de riesgo aceptable.</p>
            </div>
          </motion.div>
        )}

        {/* 7. Auditorias */}
        {activeSection === 'auditorias' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Search className="w-5 h-5 text-indigo-500"/> Auditorías y Plan de Acción</h2>
            <div className="p-4 border border-l-4 border-l-indigo-500 border-slate-200 rounded-r-xl bg-white shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800">Auditoría Interna Q3-2026</h4>
                  <p className="text-xs text-slate-500 mt-1">Revisión de cumplimiento normativo transversal.</p>
                </div>
                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">En Progreso</span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tareas Correctivas (Plan de Acción)</p>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 ml-1">
                  <li>Ajustar cláusulas laborales de teletrabajo. <span className="text-red-500 font-medium">(Vence 15/09)</span></li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
