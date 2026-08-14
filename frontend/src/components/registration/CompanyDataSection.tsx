import React from 'react';
import { Building2 } from 'lucide-react';
import type { RegistrationFormData } from '../../schemas/registrationSchema';

interface CompanyDataSectionProps {
  formData: RegistrationFormData;
  errors: Record<string, string>;
  handleInputChange: (field: keyof RegistrationFormData, value: any) => void;
  handleRutEmpresaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CompanyDataSection: React.FC<CompanyDataSectionProps> = ({
  formData,
  errors,
  handleInputChange,
  handleRutEmpresaChange,
}) => {
  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
        <Building2 className="w-5 h-5 text-indigo-400" />
        2. Datos Tributarios y Operacionales (SII)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Razón Social *
          </label>
          <input
            type="text"
            value={formData.razon_social}
            onChange={(e) => handleInputChange('razon_social', e.target.value)}
            placeholder="Servicios y Tecnologías SpA"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.razon_social && <p className="text-xs text-rose-400 mt-1">{errors.razon_social}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            RUT Empresa (Módulo 11) *
          </label>
          <input
            type="text"
            value={formData.rut_empresa}
            onChange={handleRutEmpresaChange}
            placeholder="77.123.456-K"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.rut_empresa && <p className="text-xs text-rose-400 mt-1">{errors.rut_empresa}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Tipo Sociedad *
          </label>
          <select
            value={formData.tipo_sociedad}
            onChange={(e) => handleInputChange('tipo_sociedad', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="SPA">Sociedad por Acciones (SpA)</option>
            <option value="SA">Sociedad Anónima (S.A.)</option>
            <option value="LTDA">Sociedad Limitada (Ltda.)</option>
            <option value="EIRL">Empresa Individual (EIRL)</option>
            <option value="PERSONA_NATURAL">Persona Natural con Giro</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Rubro Principal *
          </label>
          <select
            value={formData.rubro}
            onChange={(e) => handleInputChange('rubro', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="TECNOLOGIA">Tecnología y Software</option>
            <option value="SALUD">Salud y Clínicas</option>
            <option value="FINANCIERO">Servicios Financieros (Fintech)</option>
            <option value="MINERIA">Minería y Energía</option>
            <option value="RETAIL">Retail y Comercio</option>
            <option value="ALIMENTOS">Alimentos y Bebidas</option>
            <option value="CONSTRUCCION">Construcción</option>
            <option value="EDUCACION">Educación</option>
            <option value="SERVICIOS">Servicios Profesionales</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Dotación de Empleados *
          </label>
          <select
            value={formData.rango_empleados}
            onChange={(e) => handleInputChange('rango_empleados', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="MICRO">Micro (1 - 9 colaboradores)</option>
            <option value="PEQUENA">Pequeña (10 - 49 colaboradores)</option>
            <option value="MEDIANA">Mediana (50 - 199 colaboradores)</option>
            <option value="GRANDE">Grande (200+ colaboradores)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Región Principal *
          </label>
          <select
            value={formData.region_operacion}
            onChange={(e) => handleInputChange('region_operacion', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="RM">Metropolitana</option>
            <option value="V">Valparaíso</option>
            <option value="VIII">Biobío</option>
            <option value="II">Antofagasta</option>
            <option value="I">Tarapacá</option>
            <option value="X">Los Lagos</option>
          </select>
        </div>
      </div>
    </div>
  );
};
