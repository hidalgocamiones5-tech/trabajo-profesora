import { useState } from 'react';
import { Search, Filter, Plus, FileText, Folder, MoreVertical, Download, Eye, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

interface Document {
  id: string;
  name: string;
  category: string;
  uploadedBy: string;
  date: string;
  size: string;
  status: 'vigente' | 'obsoleto' | 'borrador';
}

const mockDocuments: Document[] = [
  { id: '1', name: 'Política de Seguridad de la Información v2.1.pdf', category: 'Políticas', uploadedBy: 'Ana García', date: '10 May 2026', size: '2.4 MB', status: 'vigente' },
  { id: '2', name: 'Procedimiento de Respuesta a Incidentes.docx', category: 'Procedimientos', uploadedBy: 'Carlos López', date: '08 May 2026', size: '1.1 MB', status: 'borrador' },
  { id: '3', name: 'Auditoría Interna Q1 2026.pdf', category: 'Auditorías', uploadedBy: 'Elena Ruiz', date: '15 Abr 2026', size: '4.5 MB', status: 'vigente' },
  { id: '4', name: 'Matriz de Riesgos 2025.xlsx', category: 'Evidencias', uploadedBy: 'Juan Pérez', date: '10 Dic 2025', size: '8.2 MB', status: 'obsoleto' },
  { id: '5', name: 'Manual de Usuario - Portal Proveedores.pdf', category: 'Manuales', uploadedBy: 'Sofía Martínez', date: '02 May 2026', size: '3.7 MB', status: 'vigente' },
];

const folders = [
  { id: 'f1', name: 'Políticas', count: 12, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  { id: 'f2', name: 'Procedimientos', count: 24, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { id: 'f3', name: 'Evidencias', count: 156, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { id: 'f4', name: 'Auditorías', count: 8, color: 'text-rose-600 bg-rose-50 border-rose-100' },
];

export function Documents() {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vigente': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'obsoleto': return 'bg-red-100 text-red-800 border-red-200';
      case 'borrador': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documentos</h1>
          <p className="text-slate-500">Gestiona y organiza la documentación de cumplimiento</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lemon-500 focus:border-lemon-500 w-64 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-lemon-500 text-slate-900 rounded-lg hover:bg-lemon-400 transition-colors text-sm font-medium shadow-sm">
            <Plus className="w-4 h-4" />
            Subir Documento
          </button>
        </div>
      </div>

      {/* Folders Grid */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Categorías Principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <div key={folder.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${folder.color}`}>
                  <Folder className="w-6 h-6" />
                </div>
                <MoreVertical className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-lemon-600 transition-colors">{folder.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{folder.count} archivos</p>
            </div>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-900">Documentos Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">Categoría</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Modificado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mockDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{doc.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900">{doc.date}</p>
                    <p className="text-xs text-slate-500">por {doc.uploadedBy}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toast.success('Previsualizando documento')} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Ver">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => toast.success(`Descargando ${doc.name}`)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Descargar">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
