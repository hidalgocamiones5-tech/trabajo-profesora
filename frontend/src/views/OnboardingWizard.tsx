import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, ArrowRight, ArrowLeft, Loader2, Sparkles,
  ShieldCheck, Users, ShoppingCart, CreditCard,
  Recycle, Briefcase, Check, Landmark, Cpu, HeartPulse,
  Pickaxe, Store, Utensils, Coins, HardHat, GraduationCap,
  Scale
} from 'lucide-react';
import { api } from '../services/api';

const TIPOS_SOCIEDAD = [
  { id: 'SPA', nombre: 'SpA', descripcion: 'Sociedad por Acciones' },
  { id: 'SA', nombre: 'S.A.', descripcion: 'Sociedad Anónima' },
  { id: 'LTDA', nombre: 'Ltda.', descripcion: 'Responsabilidad Limitada' },
  { id: 'EIRL', nombre: 'EIRL', descripcion: 'Individual de Resp. Ltda.' },
  { id: 'PERSONA_NATURAL', nombre: 'Persona Natural', descripcion: 'Con Giro Comercial' },
];

const RUBROS = [
  { id: 'TECNOLOGIA', nombre: 'Tecnología y Software', icon: Cpu },
  { id: 'SALUD', nombre: 'Salud y Clínicas', icon: HeartPulse },
  { id: 'FINANCIERO', nombre: 'Servicios Financieros (Fintech)', icon: Coins },
  { id: 'MINERIA', nombre: 'Minería y Energía', icon: Pickaxe },
  { id: 'RETAIL', nombre: 'Retail y Comercio', icon: Store },
  { id: 'ALIMENTOS', nombre: 'Alimentos y Gastronomía', icon: Utensils },
  { id: 'CONSTRUCCION', nombre: 'Construcción e Inmobiliaria', icon: HardHat },
  { id: 'EDUCACION', nombre: 'Educación y Capacitación', icon: GraduationCap },
  { id: 'SERVICIOS', nombre: 'Servicios Profesionales', icon: Briefcase },
];

const RANGOS_EMPLEADOS = [
  { id: 'MICRO', label: 'Micro', range: '1 - 9 colaboradores', desc: 'Emprendimientos y startups en etapa temprana' },
  { id: 'PEQUENA', label: 'Pequeña', range: '10 - 49 colaboradores', desc: 'Empresas consolidadas con equipo operativo' },
  { id: 'MEDIANA', label: 'Mediana', range: '50 - 199 colaboradores', desc: 'Estructura departamental y RRHH' },
  { id: 'GRANDE', label: 'Grande', range: '200+ colaboradores', desc: 'Corporaciones con altos requisitos regulatorios' },
];

interface OnboardingWizardProps {
  onComplete: () => void;
  empresaInicial?: {
    nombre?: string;
    rut?: string;
  };
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, empresaInicial }) => {
  const [paso, setPaso] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analisisExitoso, setAnalisisExitoso] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    nombre: empresaInicial?.nombre || '',
    rut: empresaInicial?.rut || '',
    tipo_sociedad: 'SPA',
    rubro: 'TECNOLOGIA',
    rango_empleados: 'PEQUENA',
    region_operacion: 'RM',
    nivel_ingresos: 'PEQUENA',
    maneja_datos_personales: true,
    es_b2c_ecommerce: false,
    procesa_pagos: false,
    genera_residuos_rep: false,
    tiene_trabajadores: true,
    importa_exporta: false,
    trabaja_con_estado: false,
    tiene_sindicato: false,
    instalaciones_industriales: false,
  });

  // Pre-cargar datos si ya se ingresaron en el registro
  React.useEffect(() => {
    api.getEmpresas().then((res) => {
      if (res && Array.isArray(res) && res.length > 0) {
        const emp = res[0];
        setFormData(prev => ({
          ...prev,
          nombre: emp.nombre || emp.razon_social || prev.nombre,
          rut: emp.rut || prev.rut,
          tipo_sociedad: emp.tipo_sociedad || prev.tipo_sociedad,
          rubro: emp.rubro || prev.rubro,
          rango_empleados: emp.rango_empleados || prev.rango_empleados,
          region_operacion: emp.region_operacion || prev.region_operacion,
          nivel_ingresos: emp.nivel_ingresos || prev.nivel_ingresos,
          tiene_trabajadores: emp.tiene_trabajadores ?? prev.tiene_trabajadores,
          maneja_datos_personales: emp.maneja_datos_personales ?? prev.maneja_datos_personales,
          es_b2c_ecommerce: emp.es_b2c_ecommerce ?? prev.es_b2c_ecommerce,
          procesa_pagos: emp.procesa_pagos ?? prev.procesa_pagos,
          genera_residuos_rep: emp.genera_residuos_rep ?? prev.genera_residuos_rep,
          importa_exporta: emp.importa_exporta ?? prev.importa_exporta,
          trabaja_con_estado: emp.trabaja_con_estado ?? prev.trabaja_con_estado,
          tiene_sindicato: emp.tiene_sindicato ?? prev.tiene_sindicato,
          instalaciones_industriales: emp.instalaciones_industriales ?? prev.instalaciones_industriales,
        }));
      }
    }).catch(() => {});
  }, []);

  const handleNext = () => setPaso((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setPaso((prev) => Math.max(prev - 1, 1));

  const toggleTrigger = (key: keyof typeof formData) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.onboardingEmpresa(formData);
      setAnalisisExitoso(response);
      setTimeout(() => {
        onComplete();
      }, 3500);
    } catch (err) {
      console.error("Error completando onboarding", err);
      setIsSubmitting(false);
    }
  };

  const isPaso1Valido = formData.nombre.trim().length >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto"
      >
        {/* Header con Indicador de Pasos */}
        <div className="bg-slate-900 px-6 py-6 sm:px-10 sm:py-8 text-white border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lemon-500/10 border border-lemon-500/20 text-lemon-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Antigravity Compliance AI
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
                Perfilado Regulatorio de Empresa
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Configura tu marco operativo para activar el Motor de Matching Regulador.
              </p>
            </div>

            {/* Stepper Pill */}
            <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 self-start sm:self-auto">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    paso === num
                      ? 'bg-lemon-500 text-slate-950 shadow-md shadow-lemon-500/20'
                      : paso > num
                      ? 'bg-slate-700/60 text-lemon-400'
                      : 'text-slate-400'
                  }`}
                >
                  {paso > num ? <Check className="w-3.5 h-3.5" /> : <span>{num}</span>}
                  <span className="hidden md:inline">
                    {num === 1 ? 'Identidad' : num === 2 ? 'Sector & Escala' : 'Operación'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-lemon-500 to-amber-400 h-full rounded-full"
              initial={{ width: '33%' }}
              animate={{ width: `${(paso / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 flex-1 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* PASO 1: Datos Básicos */}
            {paso === 1 && (
              <motion.div
                key="paso1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-lemon-500" />
                    Paso 1: Identificación Legal y Razón Social
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Ingresa los antecedentes generales de la persona jurídica o natural.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Razón Social o Nombre de Fantasía *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Inversiones y Servicios SpA"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-lemon-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      RUT Empresa (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 77.123.456-K"
                      value={formData.rut}
                      onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-lemon-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 mt-4">
                    Tipo de Estructura Societaria
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {TIPOS_SOCIEDAD.map((t) => {
                      const isSelected = formData.tipo_sociedad === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, tipo_sociedad: t.id })}
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-lemon-500 bg-lemon-50/50 dark:bg-lemon-500/10 text-slate-900 dark:text-white shadow-sm'
                              : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="font-bold text-sm">{t.nombre}</span>
                            {isSelected && <Check className="w-4 h-4 text-lemon-600 dark:text-lemon-400" />}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                            {t.descripcion}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Región Principal de Operación *
                    </label>
                    <select
                      value={formData.region_operacion}
                      onChange={(e) => setFormData({ ...formData, region_operacion: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-lemon-500 outline-none text-sm font-medium"
                    >
                      <option value="RM">Metropolitana</option>
                      <option value="V">Valparaíso</option>
                      <option value="VIII">Biobío</option>
                      <option value="II">Antofagasta</option>
                      <option value="I">Tarapacá</option>
                      <option value="X">Los Lagos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Nivel de Ingresos Estimado (SII) *
                    </label>
                    <select
                      value={formData.nivel_ingresos}
                      onChange={(e) => setFormData({ ...formData, nivel_ingresos: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-lemon-500 outline-none text-sm font-medium"
                    >
                      <option value="MICRO">Microempresa (hasta 2.400 UF)</option>
                      <option value="PEQUENA">Pequeña Empresa (2.400 - 25.000 UF)</option>
                      <option value="MEDIANA">Mediana Empresa (25.000 - 100.000 UF)</option>
                      <option value="GRANDE">Gran Empresa (más de 100.000 UF)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PASO 2: Rubro y Rango de Empleados */}
            {paso === 2 && (
              <motion.div
                key="paso2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-lemon-500" />
                    Paso 2: Industria y Rango de Dotación
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    El sector y número de trabajadores definen qué normativas sectoriales y laborales aplican.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                    Rubro o Actividad Económica Principal
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {RUBROS.map((r) => {
                      const IconComponent = r.icon;
                      const isSelected = formData.rubro === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, rubro: r.id })}
                          className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'border-lemon-500 bg-lemon-50/50 dark:bg-lemon-500/10 text-slate-900 dark:text-white shadow-sm'
                              : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-lemon-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-xs leading-snug">{r.nombre}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                    Tamaño de la Dotación (Colaboradores)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {RANGOS_EMPLEADOS.map((r) => {
                      const isSelected = formData.rango_empleados === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, rango_empleados: r.id })}
                          className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-lemon-500 bg-lemon-50/50 dark:bg-lemon-500/10 text-slate-900 dark:text-white shadow-sm'
                              : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm">{r.label}</span>
                              {isSelected && <Check className="w-4 h-4 text-lemon-600 dark:text-lemon-400" />}
                            </div>
                            <span className="text-xs font-semibold text-lemon-600 dark:text-lemon-400 block mb-1">
                              {r.range}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {r.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PASO 3: Triggers Operacionales */}
            {paso === 3 && (
              <motion.div
                key="paso3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-lemon-500" />
                    Paso 3: Triggers Operacionales y Regulatorios
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Activa las casillas según las actividades reales de tu operación para activar leyes específicas (Datos Personales, Ley Karin, Ley REP, Consumidor, Fintec).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Trigger 1: Datos Personales */}
                  <div
                    onClick={() => toggleTrigger('maneja_datos_personales')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                      formData.maneja_datos_personales
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${formData.maneja_datos_personales ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Trata Datos Personales</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${formData.maneja_datos_personales ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                          {formData.maneja_datos_personales && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Recopila nombres, RUT, emails de clientes o usuarios (Dispara Ley 19.628 / LPDP).
                      </p>
                    </div>
                  </div>

                  {/* Trigger 2: B2C Ecommerce */}
                  <div
                    onClick={() => toggleTrigger('es_b2c_ecommerce')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                      formData.es_b2c_ecommerce
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${formData.es_b2c_ecommerce ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Venta B2C / E-commerce</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${formData.es_b2c_ecommerce ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                          {formData.es_b2c_ecommerce && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Venta directa al consumidor final online o presencial (Dispara Ley 19.496 del Consumidor).
                      </p>
                    </div>
                  </div>

                  {/* Trigger 3: Procesa Pagos */}
                  <div
                    onClick={() => toggleTrigger('procesa_pagos')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                      formData.procesa_pagos
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${formData.procesa_pagos ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Procesa Pagos o Pasarelas</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${formData.procesa_pagos ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                          {formData.procesa_pagos && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Transbank, Stripe, MercadoPago o servicios financieros (Dispara Ley Fintec y PCI-DSS).
                      </p>
                    </div>
                  </div>

                  {/* Trigger 4: Residuos REP */}
                  <div
                    onClick={() => toggleTrigger('genera_residuos_rep')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                      formData.genera_residuos_rep
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${formData.genera_residuos_rep ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Recycle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Envases / Embalajes (REP)</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${formData.genera_residuos_rep ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                          {formData.genera_residuos_rep && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Introduce productos con cajas, plásticos o baterías al mercado (Dispara Ley REP 20.920).
                      </p>
                    </div>
                  </div>

                  {/* Trigger 5: Tiene Trabajadores */}
                  <div
                    onClick={() => toggleTrigger('tiene_trabajadores')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                      formData.tiene_trabajadores
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${formData.tiene_trabajadores ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Scale className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Tiene Trabajadores Contratados</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${formData.tiene_trabajadores ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                          {formData.tiene_trabajadores && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Aplica Ley Karin (N° 21.643) e Higiene (DS 594).
                      </p>
                    </div>
                  </div>

                  {/* Trigger 6: Importa/Exporta */}
                  <div
                    onClick={() => toggleTrigger('importa_exporta')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                      formData.importa_exporta
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${formData.importa_exporta ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Importa o Exporta</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${formData.importa_exporta ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                          {formData.importa_exporta && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Ley de Aduanas y Comercio Exterior.
                      </p>
                    </div>
                  </div>

                  {/* Trigger 7: Estado */}
                  <div
                    onClick={() => toggleTrigger('trabaja_con_estado')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                      formData.trabaja_con_estado
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${formData.trabaja_con_estado ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Proveedor del Estado</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${formData.trabaja_con_estado ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                          {formData.trabaja_con_estado && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Ley de Compras Públicas (Mercado Público).
                      </p>
                    </div>
                  </div>

                  {/* Trigger 8: Sindicato */}
                  <div
                    onClick={() => toggleTrigger('tiene_sindicato')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                      formData.tiene_sindicato
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${formData.tiene_sindicato ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Tiene Sindicato</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${formData.tiene_sindicato ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                          {formData.tiene_sindicato && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Normativa sobre Negociación Colectiva (DT).
                      </p>
                    </div>
                  </div>

                  {/* Trigger 9: Instalaciones Industriales */}
                  <div
                    onClick={() => toggleTrigger('instalaciones_industriales')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                      formData.instalaciones_industriales
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${formData.instalaciones_industriales ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Instalaciones Industriales</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${formData.instalaciones_industriales ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                          {formData.instalaciones_industriales && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Permisos Sanitarios, Ambientales e Higiene.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback de Análisis Exitoso con IA y Fase de Auditoría */}
          {analisisExitoso && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-slate-900 dark:text-slate-100 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                    ¡Diagnóstico Recibido con Éxito!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Se han activado <strong>{analisisExitoso.normativas_asignadas_count || 0} normativas base</strong> inmediatamente en tu panel.
                  </p>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-400">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>Fase de Validación y Auditoría en Curso:</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed pl-6">
                  Las normativas sectoriales y sugerencias específicas han sido derivadas a nuestro equipo de compliance en la consola de auditoría. Las leyes adicionales estarán disponibles y verificadas en tu panel dentro de poco tiempo.
                </p>
              </div>
            </motion.div>
          )}

          {/* Footer Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            {paso > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>
            ) : <div />}

            {paso < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isPaso1Valido}
                className="px-6 py-3 rounded-xl bg-lemon-500 hover:bg-lemon-600 text-slate-950 font-bold text-sm shadow-md shadow-lemon-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                Siguiente <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-lemon-500 to-amber-500 hover:from-lemon-600 hover:to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-lemon-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando marco legal...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Finalizar y Generar Marco Legal
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};
