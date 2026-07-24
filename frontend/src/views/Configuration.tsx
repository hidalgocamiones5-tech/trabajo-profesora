import { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Building2, Save } from 'lucide-react';
import { motion } from 'motion/react';

export function Configuration() {
  const [activeTab, setActiveTab] = useState('perfil');

  const tabs = [
    { id: 'perfil', name: 'Perfil de Usuario', icon: User },
    { id: 'empresa', name: 'Datos de la Empresa', icon: Building2 },
    { id: 'notificaciones', name: 'Notificaciones', icon: Bell },
    { id: 'seguridad', name: 'Seguridad', icon: Shield },
    { id: 'api', name: 'API & Integraciones', icon: Database },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500">Administra las preferencias y ajustes de tu cuenta en -------</p>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-lemon-50 text-lemon-700 shadow-sm border border-lemon-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-lemon-600' : 'text-slate-400'}`} />
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
                  <div className="w-20 h-20 bg-lemon-100 rounded-full flex items-center justify-center border-4 border-white shadow-md relative group cursor-pointer">
                    <span className="text-2xl font-bold text-lemon-700">FS</span>
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      Cambiar avatar
                    </button>
                    <p className="text-xs text-slate-500 mt-2">JPG, GIF o PNG. Max size de 800K</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Nombre</label>
                    <input type="text" defaultValue="Felipe" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lemon-500 focus:border-lemon-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Apellido</label>
                    <input type="text" defaultValue="Sanchez" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lemon-500 focus:border-lemon-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input type="email" defaultValue="fsanchez@empresa.com" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lemon-500 focus:border-lemon-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Cargo</label>
                    <input type="text" defaultValue="Oficial de Cumplimiento" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lemon-500 focus:border-lemon-500" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-end">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium">
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          )}

          {activeTab !== 'perfil' && (
            <div className="h-[400px] flex flex-col items-center justify-center text-slate-400">
              <Settings className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-600">Configuración en construcción</p>
              <p className="text-sm">Esta sección estará disponible en la próxima versión.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
