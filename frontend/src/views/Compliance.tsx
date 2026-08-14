import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Sparkles, Filter, ChevronRight, ChevronDown, UploadCloud, FileText, Loader2, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { useCompliance } from '../hooks/useCompliance';
import { useNavigation } from '../contexts/NavigationContext';
import { CreateNormativaModal } from '../components/CreateNormativaModal';
import { ComplianceMetrics } from '../components/compliance/ComplianceMetrics';
import { AIRecommendations } from '../components/compliance/AIRecommendations';
import { CircularProgress } from '../components/compliance/CircularProgress';
import { api } from '../services/api';

export const Compliance = () => {
  useNavigation();
  const [selectedNormativa, setSelectedNormativa] = useState<string | null>(null);
  const [selectedEmpresaFilter, setSelectedEmpresaFilter] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Checklist');
  const [searchTerm, setSearchTerm] = useState('');
  const [userCompany, setUserCompany] = useState<any>(null);
  const [addedAiIds, setAddedAiIds] = useState<string[]>([]);

  const { normativas, detalleNormativa, empresas, isLoading, isLoadingDetalle, error, addNormativaLocal } = useCompliance(selectedNormativa);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await api.getMe();
        if (userData?.empresa) {
          setUserCompany(userData.empresa);
        }
      } catch (e) {
        console.error('Error fetching user info in Compliance:', e);
      }
    };
    fetchUserData();
  }, []);

  if (error) {
    return <div className="p-6 text-center text-red-500 font-medium">{error}</div>;
  }

  const filteredNormativas = normativas.filter(n => {
    const matchesSearch = n.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmpresa = selectedEmpresaFilter ? String(n.empresa_id || n.empresa?.id || n.empresa) === selectedEmpresaFilter : true;
    return matchesSearch && matchesEmpresa;
  });

  const handleAddAiNormativa = (recommended: any) => {
    const nuevaNormativa = {
      id: `ai_${recommended.id}_${Date.now()}`,
      nombre: recommended.nombre,
      progreso: 0,
      estado: 'en_tiempo',
      criticidad: recommended.criticidad,
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaTermino: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tipo: 'Norma / Ley',
      origen: 'Sugerencia IA',
      empresa_nombre: userCompany?.nombre || 'Mi Empresa'
    };
    addNormativaLocal(nuevaNormativa);
    setAddedAiIds(prev => [...prev, recommended.id]);
  };

  const renderNormativasList = () => (
    <motion.div 
      key="list"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-6 max-w-7xl mx-auto space-y-6 relative"
    >
      {selectedEmpresaFilter && (
        <button 
          onClick={() => setSelectedEmpresaFilter(null)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-2 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Ver todas las normativas
        </button>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-800">
            Cumplimiento Normativo {userCompany?.nombre ? `• ${userCompany.nombre}` : ''}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestión y seguimiento de regulaciones asignadas a la empresa
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm shadow-sm">
            <Plus className="w-4 h-4" />
            Crear normativa
          </button>
          <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-lemon-500 text-slate-900 rounded-lg hover:bg-lemon-600 transition-colors font-medium text-sm shadow-sm">
            <Sparkles className="w-4 h-4" />
            Crear con IA
          </button>
        </div>
      </div>

      {/* Métricas Resumen */}
      <ComplianceMetrics normativas={normativas} />

      {/* Recomendaciones de IA basadas en Rubro */}
      <AIRecommendations 
        rubro={userCompany?.rubro} 
        onAddNormativa={handleAddAiNormativa}
        addedIds={addedAiIds}
      />

      <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar normativa por nombre o palabra clave..." 
            className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border-none focus:outline-none focus:ring-0"
          />
        </div>
        <div className="w-px h-6 bg-slate-200"></div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-slate-700 text-sm font-medium pr-2">
          Filtrar <Filter className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-lemon-500 mb-4" />
          <p>Cargando normativas...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Normativas Destacadas</h2>
          
          {filteredNormativas.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              No se encontraron normativas asociadas a los criterios ingresados.
            </div>
          ) : (
            filteredNormativas.filter((n: any) => n.progreso > 0).map((normativa: any) => (
              <div key={normativa.id} className="bg-white border-2 border-lemon-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                  <span className={clsx(
                    "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border",
                    normativa.estado === 'atrasada' ? "bg-red-50 text-red-600 border-red-100" :
                    normativa.estado === 'en_riesgo' ? "bg-amber-50 text-amber-600 border-amber-100" :
                    "bg-emerald-50 text-emerald-600 border-emerald-100"
                  )}>
                    {normativa.estado ? normativa.estado.replace('_', ' ').toUpperCase() : 'EN TIEMPO'}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">{normativa.nombre}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-medium text-slate-600 text-xs px-2 py-0.5 bg-slate-100 rounded">
                        Origen: {normativa.origen || 'Reglamento Nacional'}
                      </span>
                      {normativa.fechaTermino && <p className="text-sm text-slate-500">Vence el {normativa.fechaTermino}</p>}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-700">
                      <span>Progreso: {normativa.progreso}%</span>
                      <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-lemon-500 rounded-full" style={{ width: `${normativa.progreso}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedNormativa(normativa.id)}
                    className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Ver Detalle
                  </button>
                </div>
              </div>
            ))
          )}

          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-8">Todas las Normativas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNormativas.filter((n: any) => n.progreso === 0).map((normativa: any) => (
              <div key={normativa.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={clsx(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      normativa.estado === 'atrasada' ? "bg-red-50 text-red-600" :
                      normativa.estado === 'en_riesgo' ? "bg-orange-50 text-orange-600" :
                      "bg-emerald-50 text-emerald-600"
                    )}>
                      {normativa.estado ? normativa.estado.replace('_', ' ').toUpperCase() : 'PENDIENTE'}
                    </span>
                    <span className="text-xs text-slate-400">{normativa.origen || 'General'}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">{normativa.nombre}</h3>
                  <div className="flex flex-col gap-1 mb-4">
                    {normativa.fechaInicio && <p className="text-xs text-slate-500">{normativa.fechaInicio} - {normativa.fechaTermino}</p>}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-4">
                    <span>0%</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-300 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedNormativa(normativa.id)}
                  className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Ver Detalle
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderDetailView = () => {
    const tabs = ['Checklist', 'RAT', 'Solicitudes', 'Documentos', 'Detalle normativa'];

    return (
      <motion.div 
        key="detail"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-7xl mx-auto"
      >
        <div className="bg-white border-b border-slate-200">
          <div className="p-6 pb-0">
            <button 
              onClick={() => setSelectedNormativa(null)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors font-medium"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Volver a Normativas
            </button>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-display font-semibold text-slate-800 mb-2">
                  {isLoadingDetalle ? <div className="h-8 w-64 bg-slate-100 animate-pulse rounded"></div> : detalleNormativa?.nombre}
                </h1>
                {!isLoadingDetalle && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-500">Empresa: {userCompany?.nombre || 'Mi Empresa'}</span>
                  </div>
                )}
              </div>
              {!isLoadingDetalle && (
                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <CircularProgress percentage={detalleNormativa?.progreso || 0} size={54} strokeWidth={5} />
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avance Global</p>
                    <p className="text-sm font-bold text-slate-700">{detalleNormativa?.progreso || 0}% Completado</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-6 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    activeTab === tab 
                      ? "border-lemon-500 text-slate-900" 
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoadingDetalle ? (
            <div className="flex flex-col items-center justify-center p-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-lemon-500 mb-4" />
              <p>Cargando detalles de normativa...</p>
            </div>
          ) : (
            <>
              {activeTab === 'Checklist' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <div className="text-3xl font-bold text-slate-800 mb-1">
                        {(detalleNormativa?.checklist || []).filter((c: any) => c.estado === 'completado').length}/{(detalleNormativa?.checklist || []).length || 1}
                      </div>
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Objetivos Completados</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <div className="text-3xl font-bold text-lemon-600 mb-1">{detalleNormativa?.progreso || 0}%</div>
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Progreso Global</div>
                    </div>
                  </div>

                  {['Diagnóstico Inicial', 'Políticas Internas', 'Fase Inicial'].map((categoria) => {
                    const items = (detalleNormativa?.checklist || []).filter((c: any) => c.categoria === categoria || (!c.categoria && categoria === 'Fase Inicial'));
                    if (items.length === 0) return null;
                    return (
                      <div key={categoria} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer">
                          <h3 className="font-semibold text-slate-800">{categoria}</h3>
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="p-0">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-white text-slate-500 border-b border-slate-100">
                              <tr>
                                <th className="px-4 py-3 font-medium w-16">ID</th>
                                <th className="px-4 py-3 font-medium">Nombre del Objetivo</th>
                                <th className="px-4 py-3 font-medium w-32">Estado</th>
                                <th className="px-4 py-3 font-medium w-48">Responsable</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {items.map((item: any) => (
                                <tr key={item.id} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{item.id}</td>
                                  <td className="px-4 py-3 font-medium text-slate-700">{item.nombre}</td>
                                  <td className="px-4 py-3">
                                    <span className={clsx(
                                      "inline-flex px-2 py-1 rounded text-xs font-medium",
                                      item.estado === 'completado' ? "bg-emerald-50 text-emerald-600" :
                                      item.estado === 'atrasado' ? "bg-red-50 text-red-600" :
                                      "bg-slate-100 text-slate-600"
                                    )}>
                                      {item.estado ? item.estado.replace('_', ' ').toUpperCase() : 'PENDIENTE'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <select className="text-sm bg-transparent border-none focus:ring-0 text-slate-600 cursor-pointer w-full p-0">
                                      <option>{item.responsable || 'Sin asignar'}</option>
                                      <option>Felipe Sanchez</option>
                                      <option>Ana Gomez</option>
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'RAT' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="font-medium text-slate-700">Progreso RAT:</div>
                    <div className="flex-1 max-w-md h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-lemon-500 rounded-full" style={{ width: '29%' }}></div>
                    </div>
                    <div className="text-sm font-bold text-slate-800">29%</div>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-semibold text-slate-800">Registro de Actividades de Tratamiento</h3>
                      <button className="text-sm text-lemon-700 font-medium bg-lemon-50 px-3 py-1.5 rounded-md hover:bg-lemon-100">
                        + Añadir Actividad
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white text-slate-500">
                          <tr>
                            <th className="px-4 py-3 font-medium">Área</th>
                            <th className="px-4 py-3 font-medium">Tratamiento</th>
                            <th className="px-4 py-3 font-medium">Finalidad</th>
                            <th className="px-4 py-3 font-medium">Base Licitud</th>
                            <th className="px-4 py-3 font-medium">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {(detalleNormativa?.rat || []).map((rat: any) => (
                            <tr key={rat.id} className="hover:bg-slate-50">
                              <td className="px-4 py-4 font-medium text-slate-700">{rat.area}</td>
                              <td className="px-4 py-4 text-slate-600">{rat.tratamiento}</td>
                              <td className="px-4 py-4 text-slate-500 max-w-[200px] truncate">{rat.finalidad}</td>
                              <td className="px-4 py-4 text-slate-600">{rat.baseLicitud}</td>
                              <td className="px-4 py-4">
                                <span className={clsx(
                                  "inline-flex px-2 py-1 rounded text-xs font-medium",
                                  rat.estado === 'completado' ? "bg-emerald-50 text-emerald-600" :
                                  rat.estado === 'pendiente' ? "bg-orange-50 text-orange-600" :
                                  "bg-slate-100 text-slate-600"
                                )}>
                                  {rat.estado}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Documentos' && (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-lemon-100 text-lemon-600 rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-1">Subir documento</h3>
                    <p className="text-sm text-slate-500">Arrastra archivos aquí o haz clic para explorar</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                    <h3 className="font-semibold text-slate-800 mb-4">Documentos de la Normativa</h3>
                    <div className="space-y-3">
                      {[1, 2].map(i => (
                        <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-500" />
                            <div>
                              <div className="font-medium text-slate-700 text-sm">Ley_Oficial_Texto_v{i}.pdf</div>
                              <div className="text-xs text-slate-400">Subido por Admin • 2.4 MB</div>
                            </div>
                          </div>
                          <button className="text-sm text-lemon-600 font-medium hover:underline">Descargar</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {selectedNormativa ? renderDetailView() : renderNormativasList()}
      </AnimatePresence>
      <CreateNormativaModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={(nuevaNormativa) => {
          addNormativaLocal(nuevaNormativa);
        }}
        empresas={empresas}
      />
    </>
  );
};
