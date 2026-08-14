import React from 'react';
import type { RegistrationFormData } from '../../schemas/registrationSchema';

interface TermsSectionProps {
  formData: RegistrationFormData;
  errors: Record<string, string>;
  handleInputChange: (field: keyof RegistrationFormData, value: any) => void;
  setShowTermsModal: (value: boolean) => void;
}

export const TermsSection: React.FC<TermsSectionProps> = ({
  formData,
  errors,
  handleInputChange,
  setShowTermsModal,
}) => {
  return (
    <div className="pt-4 border-t border-slate-800 space-y-4">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="consentimiento"
          checked={formData.acepto_terminos_y_privacidad}
          onChange={(e) => handleInputChange('acepto_terminos_y_privacidad', e.target.checked)}
          className="mt-1 w-5 h-5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label htmlFor="consentimiento" className="text-xs sm:text-sm text-slate-300 leading-relaxed cursor-pointer">
          Acepto expresamente los{' '}
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="text-indigo-400 hover:underline font-semibold"
          >
            Términos y Condiciones
          </button>{' '}
          y el Tratamiento de Datos Personales conforme a la <strong>Ley N° 19.628</strong>. Entiendo que puedo ejercer mis Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) en cualquier momento desde mi perfil.
        </label>
      </div>
      {errors.acepto_terminos_y_privacidad && (
        <p className="text-xs text-rose-400 font-semibold">{errors.acepto_terminos_y_privacidad}</p>
      )}
    </div>
  );
};
