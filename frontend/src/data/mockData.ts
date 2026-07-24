import type {
  Normativa,
  ObjetivoChecklist,
  TratamientoRAT,
  SolicitudTicket,
  TareaPendiente,
  Riesgo
} from '../types';

export const mockNormativas: Normativa[] = [
  {
    id: 'n-1',
    nombre: 'Protección de Datos Personales',
    progreso: 8,
    estado: 'en_tiempo',
    criticidad: 'alta',
    fechaInicio: '2026-01-10',
    fechaTermino: '2026-12-31',
    tipo: 'Ley',
    origen: 'Nacional'
  },
  {
    id: 'n-2',
    nombre: 'Ley 20137',
    progreso: 0,
    estado: 'en_riesgo',
    criticidad: 'media',
    fechaInicio: '2026-02-15',
    fechaTermino: '2026-10-20',
    tipo: 'Ley',
    origen: 'Nacional'
  },
  {
    id: 'n-3',
    nombre: 'Ley 20463',
    progreso: 0,
    estado: 'atrasada',
    criticidad: 'alta',
    fechaInicio: '2025-11-01',
    fechaTermino: '2026-05-30',
    tipo: 'Ley',
    origen: 'Nacional'
  },
  {
    id: 'n-4',
    nombre: 'Ley Karin',
    progreso: 0,
    estado: 'en_tiempo',
    criticidad: 'media',
    fechaInicio: '2026-03-01',
    fechaTermino: '2026-11-30',
    tipo: 'Ley',
    origen: 'Nacional'
  }
];

export const mockChecklistPDP: ObjetivoChecklist[] = [
  { id: 'chk-1', categoria: 'Diagnóstico Inicial', nombre: 'Mapeo de Datos Personales', estado: 'completado', responsable: 'Felipe Sanchez' },
  { id: 'chk-2', categoria: 'Diagnóstico Inicial', nombre: 'Evaluación de Riesgos (PIA)', estado: 'por_hacer', responsable: 'Ana Gomez' },
  { id: 'chk-3', categoria: 'Políticas Internas', nombre: 'Política de Privacidad', estado: 'por_hacer', responsable: 'Carlos Perez' },
  { id: 'chk-4', categoria: 'Políticas Internas', nombre: 'Política de Retención', estado: 'atrasado', responsable: 'Camila Rojas' },
];

export const mockRAT: TratamientoRAT[] = [
  { id: 'rat-1', area: 'Recursos Humanos', tratamiento: 'Nómina y Pago', finalidad: 'Pago de salarios', categoriaDP: 'Datos de Identificación, Financieros', baseLicitud: 'Ejecución de Contrato', estado: 'completado' },
  { id: 'rat-2', area: 'Marketing', tratamiento: 'Envío de Newsletter', finalidad: 'Promoción comercial', categoriaDP: 'Email, Nombre', baseLicitud: 'Consentimiento', estado: 'pendiente' },
  { id: 'rat-3', area: 'TI', tratamiento: 'Monitoreo de red', finalidad: 'Seguridad', categoriaDP: 'IP, Logs', baseLicitud: 'Interés Legítimo', estado: 'borrador' },
];

export const mockSolicitudes: SolicitudTicket[] = [
  { id: 'tk-1001', estado: 'recibida', nombre: 'Revisión Contrato Proveedor X', tipo: 'Revisión de Contratos', fechaCreacion: '2026-04-28', fechaLimite: '2026-05-02', sla: 'en_tiempo', prioridad: 'alta', solicitante: 'Andres Munoz', responsable: 'Felipe Sanchez' },
  { id: 'tk-1002', estado: 'revisando', nombre: 'Solicitud ARCO - Eliminación', tipo: 'Privacidad', fechaCreacion: '2026-04-25', fechaLimite: '2026-04-30', sla: 'en_riesgo', prioridad: 'urgente', solicitante: 'Cliente Externo', responsable: 'Ana Gomez' },
  { id: 'tk-1003', estado: 'resuelta', nombre: 'Aprobación Política Interna', tipo: 'Compliance', fechaCreacion: '2026-04-10', fechaLimite: '2026-04-15', sla: 'en_tiempo', prioridad: 'media', solicitante: 'RRHH', responsable: 'Carlos Perez' },
];

export const mockTareasPendientes: TareaPendiente[] = [
  { id: 'tar-1', responsable: 'Andres', estado: 'vencido', fechaVencimiento: '2026-04-20', tarea: 'Actualizar matriz de riesgos', asociadaA: 'ISO 27001', responsableAsignado: 'Andres Munoz' },
  { id: 'tar-2', responsable: 'Ana', estado: 'en_progreso', fechaVencimiento: '2026-04-30', tarea: 'Revisar contratos de proveedores', asociadaA: 'Protección de Datos Personales', responsableAsignado: 'Ana Gomez' },
  { id: 'tar-3', responsable: 'Camila', estado: 'al_dia', fechaVencimiento: '2026-05-15', tarea: 'Capacitación Ley Karin', asociadaA: 'Ley Karin', responsableAsignado: 'Camila Rojas' },
  { id: 'tar-4', responsable: 'Felipe', estado: 'vencido', fechaVencimiento: '2026-04-25', tarea: 'Subir evidencia mensual', asociadaA: 'Ley 20137', responsableAsignado: 'Felipe Sanchez' },
];

export const mockRiesgos: Riesgo[] = [
  { id: 'r-1', nombre: 'Fuga de datos por phishing', impacto: 5, probabilidad: 3, estado: 'pendiente', responsable: 'Ana Gomez', empresa: 'LemonTech Chile', fechaIdentificacion: '2026-01-15' },
  { id: 'r-2', nombre: 'Incumplimiento normativo Ley Karin', impacto: 4, probabilidad: 2, estado: 'en_curso', responsable: 'Camila Rojas', empresa: 'LemonTech Perú', fechaIdentificacion: '2026-02-10' },
  { id: 'r-3', nombre: 'Caída de servidores AWS', impacto: 5, probabilidad: 1, estado: 'mitigado', responsable: 'Carlos Perez', empresa: 'Global', fechaIdentificacion: '2025-12-05' },
  { id: 'r-4', nombre: 'Pérdida de dispositivo móvil', impacto: 3, probabilidad: 4, estado: 'pendiente', responsable: 'Andres Munoz', empresa: 'LemonTech Colombia', fechaIdentificacion: '2026-03-20' },
  { id: 'r-5', nombre: 'Acceso no autorizado a BBDD', impacto: 5, probabilidad: 2, estado: 'en_curso', responsable: 'Felipe Sanchez', empresa: 'Global', fechaIdentificacion: '2026-04-01' },
];
