import React, { useState } from 'react';
import { registrationSchema, formatearRutChile, type RegistrationFormData } from '../schemas/registrationSchema';
import axiosInstance from '../services/axiosConfig';

export const useRegistration = () => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    username: '',
    email: '',
    password: '',
    nombre_completo: '',
    telefono: '+569',
    cargo: 'Administrador Compliance',
    rut_personal: '',
    razon_social: '',
    nombre_fantasia: '',
    rut_empresa: '',
    tipo_sociedad: 'SPA',
    rubro: 'TECNOLOGIA',
    rango_empleados: 'PEQUENA',
    direccion_matriz: '',
    region_operacion: 'RM',
    comuna: '',
    nivel_ingresos: 'PEQUENA',
    acepto_terminos_y_privacidad: false,
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleInputChange = (field: keyof RegistrationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleRutEmpresaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatearRutChile(e.target.value);
    handleInputChange('rut_empresa', formatted);
  };

  const handleRutPersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatearRutChile(e.target.value);
    handleInputChange('rut_personal', formatted);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setErrors({});

    if (formData.password !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden.' }));
      return;
    }

    // Validar con Zod
    const validation = registrationSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      await axiosInstance.post('/api/auth/registro/', formData);
      setSuccess(true);
    } catch (err: any) {
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          const apiErrors: Record<string, string> = {};
          Object.keys(err.response.data).forEach((key) => {
            const val = err.response.data[key];
            apiErrors[key] = Array.isArray(val) ? val[0] : val;
          });
          setErrors(apiErrors);
        } else {
          setGeneralError(err.response.data.mensaje || 'Error al procesar el registro.');
        }
      } else {
        setGeneralError('Error de conexión con el servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
};
