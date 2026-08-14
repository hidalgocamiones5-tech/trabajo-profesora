import React from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-white relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold mb-4 text-indigo-400">Política de Privacidad y Derechos ARCO (Ley 19.628)</h3>
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            En cumplimiento de la Ley N° 19.628 sobre Protección de la Vida Privada,{' '}
            <strong>Antigravity Compliance AI</strong> garantiza la confidencialidad, trazabilidad y seguridad en el
            tratamiento de los datos ingresados.
          </p>
          <h4 className="font-bold text-slate-100">1. Finalidad del Tratamiento:</h4>
          <p>
            Los datos son recopilados para la generación de la matriz de cumplimiento normativo, perfilamiento regulatorio de
            la empresa y entrega de reportes mediante el motor de matching regulatorio.
          </p>
          <h4 className="font-bold text-slate-100">2. Derechos ARCO:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Acceso:</strong> Puede consultar y descargar una copia completa de sus datos mediante el botón "Mis
              Datos (ARCO)" en la plataforma.
            </li>
            <li>
              <strong>Rectificación:</strong> Puede solicitar la modificación de cualquier dato inexacto.
            </li>
            <li>
              <strong>Cancelación / Supresión:</strong> Puede solicitar el borrado seguro de sus registros.
            </li>
            <li>
              <strong>Oposición:</strong> Puede oponerse a tratamientos específicos no requeridos por ley.
            </li>
          </ul>
          <h4 className="font-bold text-slate-100">3. Sello de Tiempo e IP:</h4>
          <p>
            Al registrarse, el sistema captura la dirección IP del cliente y marca un sello de tiempo inmutable garantizando la
            prueba del consentimiento informado.
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm text-white cursor-pointer"
        >
          Entendido y Cerrar
        </button>
      </div>
    </div>
  );
};
