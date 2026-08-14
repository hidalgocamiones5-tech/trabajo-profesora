import React from 'react';
import { User } from 'lucide-react';
import type { RegistrationFormData } from '../../schemas/registrationSchema';

interface AdminDataSectionProps {
  formData: RegistrationFormData;
  confirmPassword: string;
  errors: Record<string, string>;
  handleInputChange: (field: keyof RegistrationFormData, value: any) => void;
  handleRutPersonalChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setConfirmPassword: (value: string) => void;
}

export const AdminDataSection: React.FC<AdminDataSectionProps> = ({
  formData,
  confirmPassword,
  errors,
  handleInputChange,
  handleRutPersonalChange,
  setConfirmPassword,
}) => {
  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
        <User className="w-5 h-5 text-indigo-400" />
        1. Datos del Usuario Administrador
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Usuario *
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="ej: admin_empresa"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.username && <p className="text-xs text-rose-400 mt-1">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Correo Electrónico Corporativo *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="contacto@empresa.cl"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Nombre Completo *
          </label>
          <input
            type="text"
            value={formData.nombre_completo}
            onChange={(e) => handleInputChange('nombre_completo', e.target.value)}
            placeholder="Juan Pérez González"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.nombre_completo && <p className="text-xs text-rose-400 mt-1">{errors.nombre_completo}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Teléfono (+569...) *
          </label>
          <input
            type="text"
            value={formData.telefono}
            onChange={(e) => handleInputChange('telefono', e.target.value)}
            placeholder="+56912345678"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.telefono && <p className="text-xs text-rose-400 mt-1">{errors.telefono}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Contraseña *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Confirmar Contraseña *
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.confirmPassword && <p className="text-xs text-rose-400 mt-1">{errors.confirmPassword}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            RUT Personal (Módulo 11) - Opcional
          </label>
          <input
            type="text"
            value={formData.rut_personal}
            onChange={handleRutPersonalChange}
            placeholder="12.345.678-K"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.rut_personal && <p className="text-xs text-rose-400 mt-1">{errors.rut_personal}</p>}
        </div>
      </div>
    </div>
  );
};
