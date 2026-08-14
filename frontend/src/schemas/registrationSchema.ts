import { z } from 'zod';

export const validarRutChileModulo11 = (rut: string): boolean => {
  if (!rut || typeof rut !== 'string') return false;
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
  if (rutLimpio.length < 2) return false;

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  if (!/^\d+$/.test(cuerpo)) return false;
  if (!/^[0-9K]$/.test(dv)) return false;

  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = 11 - (suma % 11);
  let dvEsperado = '';

  if (resto === 11) dvEsperado = '0';
  else if (resto === 10) dvEsperado = 'K';
  else dvEsperado = resto.toString();

  return dv === dvEsperado;
};

export const formatearRutChile = (val: string): string => {
  const limpio = val.replace(/[^0-9kK]/g, '').toUpperCase();
  if (limpio.length <= 1) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpoFormateado}-${dv}`;
};

export const registrationSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres.'),
  email: z.string().email('Ingrese un correo electrónico corporativo válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  nombre_completo: z.string().min(2, 'El nombre completo es requerido.'),
  telefono: z.string().regex(/^(\+?56)?\s?9\d{8}$/, 'Ingrese un teléfono chileno válido (+569XXXXXXXX).'),
  cargo: z.string().optional(),
  rut_personal: z.string().optional().refine((val) => !val || validarRutChileModulo11(val), {
    message: 'El RUT personal no es válido según el algoritmo Módulo 11 (Chile).',
  }),

  // Datos Empresa
  razon_social: z.string().min(2, 'La razón social es requerida.'),
  nombre_fantasia: z.string().optional(),
  rut_empresa: z.string().refine(validarRutChileModulo11, {
    message: 'El RUT de la empresa no es válido según el algoritmo Módulo 11 (Chile).',
  }),
  tipo_sociedad: z.string().min(1, 'Seleccione el tipo de sociedad.'),
  rubro: z.string().min(1, 'Seleccione el rubro principal.'),
  rango_empleados: z.string().min(1, 'Seleccione el rango de empleados.'),
  direccion_matriz: z.string().optional(),
  region_operacion: z.string().default('RM'),
  comuna: z.string().optional(),
  nivel_ingresos: z.string().default('PEQUENA'),

  // Consentimiento Ley 19.628
  acepto_terminos_y_privacidad: z.boolean().refine((val) => val === true, {
    message: 'Debe aceptar expresamente los Términos y la Política de Privacidad conforme a la Ley N° 19.628.',
  }),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
