import React from 'react';
import { ShieldAlert, UserPlus, AlertCircle } from 'lucide-react';
import { useRegistration } from '../hooks/useRegistration';
import { AdminDataSection } from '../components/registration/AdminDataSection';
import { CompanyDataSection } from '../components/registration/CompanyDataSection';
import { TermsSection } from '../components/registration/TermsSection';
import { RegistrationSuccess } from '../components/registration/RegistrationSuccess';
import { TermsModal } from '../components/registration/TermsModal';

interface RegisterProps {
  onSwitchToLogin?: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const {
    formData,
    confirmPassword,
    setConfirmPassword,
    errors,
    generalError,
    success,
    isLoading,
    showTermsModal,
    setShowTermsModal,
    handleInputChange,
    handleRutEmpresaChange,
    handleRutPersonalChange,
    handleRegisterSubmit,
  } = useRegistration();

  if (success) {
    return <RegistrationSuccess formData={formData} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 mb-4 ring-1 ring-indigo-500/30">
            <ShieldAlert className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Registro de Empresa y Cumplimiento Ley 19.628
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Plataforma B2B Antigravity Compliance AI • Protección de Datos y Matching Normativo
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 p-6 sm:p-10">
          <form onSubmit={handleRegisterSubmit} className="space-y-8">
            {/* SECCIÓN 1: DATOS DEL USUARIO ADMINISTRADOR */}
            <AdminDataSection
              formData={formData}
              confirmPassword={confirmPassword}
              errors={errors}
              handleInputChange={handleInputChange}
              handleRutPersonalChange={handleRutPersonalChange}
              setConfirmPassword={setConfirmPassword}
            />

            {/* SECCIÓN 2: DATOS TRIBUTARIOS Y OPERACIONALES DE EMPRESA */}
            <CompanyDataSection
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
              handleRutEmpresaChange={handleRutEmpresaChange}
            />

            {/* SECCIÓN 3: CONSENTIMIENTO LEY 19.628 */}
            <TermsSection
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
              setShowTermsModal={setShowTermsModal}
            />

            {/* Error General */}
            {generalError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registrando y Firmando Consentimiento...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Completar Registro Legal y Crear Empresa</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => onSwitchToLogin ? onSwitchToLogin() : (window.location.href = '/login')}
                className="text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                Inicia Sesión
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Modal Términos y Derechos ARCO */}
      {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} />}
    </div>
  );
};
