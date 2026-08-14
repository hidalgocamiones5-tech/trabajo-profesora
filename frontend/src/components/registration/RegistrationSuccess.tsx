import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { RegistrationFormData } from '../../schemas/registrationSchema';

interface RegistrationSuccessProps {
  formData: RegistrationFormData;
}

export const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ formData }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 text-center border border-slate-700 shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-6 ring-8 ring-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">¡Registro Completado con Éxito!</h2>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          Tu usuario y empresa han sido dados de alta bajo cumplimiento estricto de la <strong>Ley N° 19.628</strong> sobre Protección de Datos Personales.
        </p>
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60 text-left text-xs text-slate-400 mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-300">Usuario:</span> <span>{formData.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-300">Empresa:</span> <span>{formData.razon_social}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-300">RUT Empresa:</span> <span>{formData.rut_empresa}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-300">Consentimiento Ley 19.628:</span>{' '}
            <span className="text-emerald-400 font-bold">Válido & Firmado (IP Registrada)</span>
          </div>
        </div>
        <a
          href="/login"
          className="inline-block w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30"
        >
          Iniciar Sesión
        </a>
      </div>
    </div>
  );
};
