import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { bcnService } from '../services/bcnService';
import type { LeyOficialBCN } from '../services/bcnService';
import {
  ArrowLeft, Edit3, Plus, CheckCircle, FileText, UploadCloud,
  ChevronDown, ChevronRight, ShieldCheck, Download, Search, Copy, Check
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface NormativaDetailViewProps {
  normativaId: string;
  onBack: () => void;
}

export const NormativaDetailView: React.FC<NormativaDetailViewProps> = ({ normativaId, onBack }) => {
  const [ley, setLey] = useState<LeyOficialBCN | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requisitos' | 'evidencias' | 'articulado'>('requisitos');
  const [expandedReqs, setExpandedReqs] = useState<Record<string, boolean>>({
    'req_karin_1': true,
    'req_karin_2': true,
    'req_dp_1': true,
    'req_rep_1': true
  });
  const [searchArticle, setSearchArticle] = useState('');
  const [copiedArt, setCopiedArt] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeyData = async () => {
      setIsLoading(true);
      const data = await bcnService.getLeyPorId(normativaId);
      if (data) {
        setLey(data);
      } else {
        // Fallback default ley Ley Karin if ID not found directly
        const fallback = await bcnService.getLeyPorId('ley_21643');
        setLey(fallback || null);
      }
      setIsLoading(false);
    };
    fetchLeyData();
  }, [normativaId]);

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Cargando Ficha 360° de la Normativa BCN...</p>
      </div>
    );
  }

  if (!ley) {
    return (
      <div className="p-10 text-center text-slate-500">
        <p>No se encontró la información de la normativa seleccionada.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Volver a Normativas
        </button>
      </div>
    );
  }

  const toggleReq = (id: string) => {
    setExpandedReqs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyText = (num: string, text: string) => {
    navigator.clipboard.writeText(`${num}: ${text}`);
    setCopiedArt(num);
    toast.success(`Copiado ${num} al portapapeles`);
    setTimeout(() => setCopiedArt(null), 2000);
  };

  const filteredArticles = ley.articulos.filter(art =>
    art.numero.toLowerCase().includes(searchArticle.toLowerCase()) ||
    art.contenido.toLowerCase().includes(searchArticle.toLowerCase()) ||
    (art.capitulo && art.capitulo.toLowerCase().includes(searchArticle.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Catálogo de Normativas
      </button>

      {/* Header Ficha 360° */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                {ley.origen}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {ley.tipo}
              </span>
              <span className={clsx(
                "px-2.5 py-0.5 rounded-md text-xs font-bold border",
                ley.criticidad === 'Crítica' ? "bg-rose-50 text-rose-700 border-rose-200" :
                ley.criticidad === 'Alta' ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-emerald-50 text-emerald-700 border-emerald-200"
              )}>
                Criticidad: {ley.criticidad}
              </span>
            </div>

            <h1 className="text-2xl font-display font-bold text-slate-900 leading-tight">
              {ley.numero} - {ley.alias}
            </h1>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              {ley.nombre}
            </p>
            <p className="text-xs text-slate-400 italic">
              Organismo fiscalizador: {ley.organismo}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Vigencia Oficial</div>
              <div className="text-xs font-mono font-semibold text-slate-700">{ley.fechaInicio} a {ley.fechaTermino}</div>
            </div>
            <button
              onClick={() => toast.success("Modo de edición activado")}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              Editar Ficha
            </button>
          </div>
        </div>

        {/* KPIs Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tareas completadas</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">1/35</div>
          </div>
          <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Completado</div>
            <div className="text-lg font-bold text-emerald-800 mt-0.5">{ley.progreso}%</div>
          </div>
          <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80">
            <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">En progreso</div>
            <div className="text-lg font-bold text-amber-800 mt-0.5">15%</div>
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={() => toast.success("Nuevo requisito añadido")}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Agregar requisito
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-2 rounded-xl shadow-2xs">
        <button
          onClick={() => setActiveTab('requisitos')}
          className={clsx(
            "px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'requisitos' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <CheckCircle className="w-4 h-4" />
          Pestaña 1: Requisitos & Hitos
        </button>
        <button
          onClick={() => setActiveTab('evidencias')}
          className={clsx(
            "px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'evidencias' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <FileText className="w-4 h-4" />
          Pestaña 2: Documentos & Evidencias
        </button>
        <button
          onClick={() => setActiveTab('articulado')}
          className={clsx(
            "px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'articulado' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          Pestaña 3: Detalle Normativo BCN
        </button>
      </div>

      {/* Tab 1: Requisitos & Hitos (Hierarchical Accordion) */}
      {activeTab === 'requisitos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Desglose Jerárquico de Requisitos e Hitos de Cumplimiento</h3>
            <span className="text-xs text-slate-400 font-medium">{ley.requisitos.length} categorías oficiales</span>
          </div>

          <div className="space-y-4">
            {ley.requisitos.map((req) => {
              const isExpanded = expandedReqs[req.id] ?? true;
              return (
                <div key={req.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  {/* Category Header Accordion */}
                  <div
                    onClick={() => toggleReq(req.id)}
                    className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-600" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">{req.categoria}</span>
                        <h4 className="text-sm font-bold text-slate-800">{req.titulo}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-bold border",
                        req.estado === 'completado' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        req.estado === 'en_progreso' ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      )}>
                        {req.estado.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Collapsible Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4"
                      >
                        <p className="text-xs text-slate-500 mb-4 font-medium">{req.descripcion}</p>

                        {/* Milestones / Tasks Table */}
                        <div className="overflow-x-auto border border-slate-100 rounded-xl">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                              <tr>
                                <th className="px-4 py-2.5 w-16">ID Hito</th>
                                <th className="px-4 py-2.5">Nombre del Hito / Tarea</th>
                                <th className="px-4 py-2.5 w-32">Estado</th>
                                <th className="px-4 py-2.5 w-32">Vencimiento</th>
                                <th className="px-4 py-2.5 w-40">Responsable</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {req.hitos.map((hito) => (
                                <tr key={hito.id} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">{hito.id}</td>
                                  <td className="px-4 py-3 text-slate-800 font-semibold">{hito.nombre}</td>
                                  <td className="px-4 py-3">
                                    <span className={clsx(
                                      "px-2 py-0.5 rounded-md text-[11px] font-bold border",
                                      hito.estado === 'completado' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                      hito.estado === 'en_progreso' ? "bg-sky-50 text-sky-700 border-sky-200" :
                                      hito.estado === 'atrasada' ? "bg-rose-50 text-rose-700 border-rose-200" :
                                      "bg-slate-100 text-slate-600 border-slate-200"
                                    )}>
                                      {hito.estado.replace('_', ' ').toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-500 font-mono">{hito.fechaVencimiento}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                                        {hito.avatarInitials}
                                      </div>
                                      <span className="text-slate-700">{hito.responsable}</span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Documentos & Evidencias */}
      {activeTab === 'evidencias' && (
        <div className="space-y-6">
          {/* Upload Dropzone */}
          <div
            onClick={() => toast.success("Selecciona un archivo PDF o documento de respaldo")}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Subir evidencia o documento oficial</h4>
            <p className="text-xs text-slate-400 mt-1">Arrastra tus archivos aquí o haz clic para explorar en tu equipo (PDF, DOCX, XLSX)</p>
          </div>

          {/* Documents Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h4 className="font-bold text-slate-800 text-sm">Evidencias Cargadas para {ley.alias}</h4>
              <span className="text-xs text-slate-400 font-medium">{ley.evidencias.length} archivos adjuntos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Documento</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Tamaño</th>
                    <th className="px-4 py-3">Versión</th>
                    <th className="px-4 py-3">Fecha Subida</th>
                    <th className="px-4 py-3">Subido por</th>
                    <th className="px-4 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {ley.evidencias.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-slate-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        {doc.nombre}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{doc.tipo}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono">{doc.tamano}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                          v{doc.version}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono">{doc.fechaSubida}</td>
                      <td className="px-4 py-3 text-slate-700">{doc.subidoPor}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toast.success(`Descargando ${doc.nombre}`)}
                          className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> Descargar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Detalle Normativo BCN */}
      {activeTab === 'articulado' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar artículo por palabra clave o número (ej. Art 1°)..."
                value={searchArticle}
                onChange={(e) => setSearchArticle(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Mostrando {filteredArticles.length} artículos oficiales de la BCN
            </div>
          </div>

          <div className="space-y-4">
            {filteredArticles.map((art, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md font-bold text-xs">
                      {art.numero}
                    </span>
                    {art.capitulo && (
                      <span className="text-xs font-semibold text-slate-400">
                        {art.capitulo}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopyText(art.numero, art.contenido)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors p-1 cursor-pointer"
                    title="Copiar texto del artículo"
                  >
                    {copiedArt === art.numero ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {art.titulo && (
                  <h4 className="text-sm font-bold text-slate-800 mb-2">{art.titulo}</h4>
                )}

                <p className="text-xs text-slate-600 leading-relaxed font-normal bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {art.contenido}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
