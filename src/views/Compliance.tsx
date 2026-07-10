import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockNormativas, mockChecklistPDP, mockRAT } from '../data/mockData';
import { Search, Plus, Sparkles, Filter, ChevronRight, ChevronDown, UploadCloud, FileText } from 'lucide-react';
import clsx from 'clsx';

export const Compliance = () => {
  const [selectedNormativa, setSelectedNormativa] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Checklist');

  const renderNormativasList = () => (
    <motion.div 
      key="list"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl font-display font-semibold text-slate-800">Normativas</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">
            <Plus className="w-4 h-4" />
            Crear normativa
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-lemon-500 text-slate-900 rounded-lg hover:bg-lemon-600 transition-colors font-medium text-sm shadow-sm">
            <Sparkles className="w-4 h-4" />
            Crear con IA
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar normativa..." 
            className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border-none focus:outline-none focus:ring-0"
          />
        </div>
        <div className="w-px h-6 bg-slate-200"></div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-slate-700 text-sm font-medium">
          Empresas <ChevronDown className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-slate-700 text-sm font-medium">
          Países <ChevronDown className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-slate-700 text-sm font-medium pr-2">
          Estado <Filter className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Destacadas</h2>
        {mockNormativas.filter(n => n.progreso > 0).map(normativa => (
          <div key={normativa.id} className="bg-white border-2 border-lemon-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                En tiempo
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{normativa.nombre}</h3>
                <p className="text-sm text-slate-500 mb-4">Vence el {normativa.fechaTermino}</p>
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
        ))}

        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-8">Otras Normativas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockNormativas.filter(n => n.progreso === 0).map(normativa => (
            <div key={normativa.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={clsx(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                    normativa.estado === 'atrasada' ? "bg-red-50 text-red-600" :
                    normativa.estado === 'en_riesgo' ? "bg-orange-50 text-orange-600" :
                    "bg-emerald-50 text-emerald-600"
                  )}>
                    {normativa.estado.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">{normativa.origen}</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{normativa.nombre}</h3>
                <p className="text-xs text-slate-500 mb-4">{normativa.fechaInicio} - {normativa.fechaTermino}</p>
                
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
                Ver
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderDetailView = () => {
    const normativa = mockNormativas.find(n => n.id === selectedNormativa);
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
                <h1 className="text-2xl font-display font-semibold text-slate-800 mb-2">{normativa?.nombre}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-500">Progreso general:</span>
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-lemon-500 rounded-full" style={{ width: `${normativa?.progreso}%` }}></div>
                    </div>
                    {normativa?.progreso}%
                  </div>
                </div>
              </div>
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
          {activeTab === 'Checklist' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div className="text-3xl font-bold text-slate-800 mb-1">1/23</div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Objetivos Completados</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div className="text-3xl font-bold text-lemon-600 mb-1">4%</div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Progreso Global</div>
                </div>
              </div>

              {['Diagnóstico Inicial', 'Políticas Internas'].map((categoria) => {
                const items = mockChecklistPDP.filter(c => c.categoria === categoria);
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
                          {items.map(item => (
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
                                  {item.estado.replace('_', ' ').toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <select className="text-sm bg-transparent border-none focus:ring-0 text-slate-600 cursor-pointer w-full p-0">
                                  <option>{item.responsable}</option>
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
                <div className="text-sm font-bold text-slate-800">29% (Total: 26)</div>
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
                        <th className="px-4 py-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {mockRAT.map(rat => (
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
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button className="text-blue-500 hover:underline text-xs font-medium">Editar</button>
                              <button className="text-slate-400 hover:text-slate-600 text-xs font-medium">Revisión</button>
                            </div>
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
                          <div className="text-xs text-slate-400">Subido por Admin el 12/04/2026 • 2.4 MB</div>
                        </div>
                      </div>
                      <button className="text-sm text-lemon-600 font-medium hover:underline">Descargar</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {selectedNormativa ? renderDetailView() : renderNormativasList()}
    </AnimatePresence>
  );
};
