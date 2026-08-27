import { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Database, Building2, Save, Users, Plus, MailPlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { api } from '../services/api';
import type { Responsable } from '../types';

export function Configuration() {
  const [activeTab, setActiveTab] = useState('perfil');
  const [isInviting, setIsInviting] = useState(false);
  
  // Responsables state
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [newRespNombre, setNewRespNombre] = useState('');
  const [newRespCargo, setNewRespCargo] = useState('');
  const [newRespEmail, setNewRespEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'equipo') {
      cargarResponsables();
    }
  }, [activeTab]);

  const cargarResponsables = async () => {
    try {
      const resps = await api.getResponsables();
      setResponsables(resps);
    } catch (error) {
      toast.error('Error al cargar responsables');
    }
  };

  const tabs = [
    { id: 'perfil', name: 'Perfil de Usuario', icon: User },
    { id: 'empresa', name: 'Datos de la Empresa', icon: Building2 },
    { id: 'equipo', name: 'Equipo y Usuarios', icon: Users },
    { id: 'notificaciones', name: 'Notificaciones', icon: Bell },
    { id: 'seguridad', name: 'Seguridad', icon: Shield },
    { id: 'api', name: 'API & Integraciones', icon: Database },
  ];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRespNombre) {
      toast.error('El nombre es obligatorio');
      return;
    }
    setLoading(true);
    try {
      await api.crearResponsable({
        nombre: newRespNombre,
        cargo: newRespCargo,
        email: newRespEmail,
      });
      toast.success('Trabajador registrado exitosamente.');
      setIsInviting(false);
      setNewRespNombre('');
      setNewRespCargo('');
      setNewRespEmail('');
      cargarResponsables();
    } catch (error) {
      toast.error('Error al registrar trabajador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500">Administra las preferencias y ajustes de tu cuenta corporativa.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
          {activeTab === 'perfil' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Información Personal</h2>
                <p className="text-sm text-slate-500 mb-6">Actualiza tus datos personales y foto de perfil.</p>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-md relative group cursor-pointer">
                    <span className="text-2xl font-bold text-indigo-700">FS</span>
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                      Cambiar avatar
                    </button>
                    <p className="text-xs text-slate-500 mt-2">JPG, GIF o PNG. Max size de 800K</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Nombre</label>
                    <input type="text" defaultValue="Felipe" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Apellido</label>
                    <input type="text" defaultValue="Sanchez" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input type="email" defaultValue="fsanchez@empresa.com" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Cargo</label>
                    <input type="text" defaultValue="Oficial de Cumplimiento" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-end">
                <button onClick={() => toast.success('Perfil actualizado correctamente')} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors font-medium cursor-pointer">
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'empresa' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Datos de la Empresa</h2>
                <p className="text-sm text-slate-500 mb-6">Información fiscal y operativa para los reportes.</p>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Razón Social</label>
                    <input type="text" defaultValue="TechCorp Chile S.A." className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">RUT Empresa</label>
                    <input type="text" defaultValue="76.543.210-K" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-200 flex justify-end">
                <button onClick={() => toast.success('Datos de la empresa guardados')} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors font-medium cursor-pointer">
                  <Save className="w-4 h-4" /> Guardar
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'equipo' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Equipo y Usuarios</h2>
                  <p className="text-sm text-slate-500">Administra los accesos y roles de tu equipo.</p>
                </div>
                <button 
                  onClick={() => setIsInviting(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Invitar Trabajador
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-5 py-3 font-medium">Usuario</th>
                      <th className="px-5 py-3 font-medium">Rol</th>
                      <th className="px-5 py-3 font-medium">Área</th>
                      <th className="px-5 py-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {responsables.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                              {user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{user.nombre}</p>
                              <p className="text-xs text-slate-500">{user.email || 'Trabajador'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-medium">{user.cargo || 'N/A'}</td>
                        <td className="px-5 py-4 text-slate-600">N/A</td>
                        <td className="px-5 py-4">
                          <span className={clsx(
                            "inline-flex px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700"
                          )}>
                            Activo
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'notificaciones' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Preferencias de Notificaciones</h2>
                <p className="text-sm text-slate-500 mb-6">Controla cómo y cuándo recibes alertas del sistema.</p>
                
                <div className="space-y-4">
                  {['Alertas de Nuevas Leyes (BCN)', 'Vencimiento de SLAs (Derechos ARCO)', 'Nuevos Incidentes (Ley Karin)', 'Reportes Semanales de Cumplimiento'].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                      <div>
                        <p className="font-medium text-slate-800">{item}</p>
                        <p className="text-xs text-slate-500">Recibir notificación por email y sistema.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={i !== 3} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-6 border-t border-slate-200 flex justify-end">
                <button onClick={() => toast.success('Preferencias de notificaciones guardadas')} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors font-medium cursor-pointer">
                  <Save className="w-4 h-4" /> Guardar
                </button>
              </div>
            </motion.div>
          )}

          {['seguridad', 'api'].includes(activeTab) && (
            <div className="h-[400px] flex flex-col items-center justify-center text-slate-400">
              <Settings className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-600">Configuración avanzada</p>
              <p className="text-sm">Esta sección estará disponible en la próxima versión del prototipo.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Invitación */}
      <AnimatePresence>
        {isInviting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsInviting(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <MailPlus className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg">Registrar Trabajador</h3>
                </div>
                <button onClick={() => setIsInviting(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleInvite} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Nombre Completo</label>
                  <input required type="text" value={newRespNombre} onChange={(e) => setNewRespNombre(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm" placeholder="Ej. Juan Pérez" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Correo Electrónico (Opcional)</label>
                  <input type="email" value={newRespEmail} onChange={(e) => setNewRespEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm" placeholder="Ej. juan@empresa.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Cargo</label>
                  <input type="text" value={newRespCargo} onChange={(e) => setNewRespCargo(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm" placeholder="Ej. Operario, DPO" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsInviting(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                    Cancelar
                  </button>
                  <button disabled={loading} type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50">
                    {loading ? 'Registrando...' : 'Registrar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
