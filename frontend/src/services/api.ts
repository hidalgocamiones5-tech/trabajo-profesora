import axiosInstance from './axiosConfig';
import type {
  TareaPendiente,
  Normativa,
  Riesgo,
  SolicitudTicket,
  Incidente,
  TratamientoRAT,
  ObjetivoChecklist,
  Responsable
} from '../types';

// AUTHENTICATION
export const login = async (credentials: any) => {
  const response = await axiosInstance.post('/api/auth/login/', credentials);
  return response.data;
};

export const register = async (userData: any) => {
  const response = await axiosInstance.post('/api/auth/register/', userData);
  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get('/api/me/');
  return response.data;
};

export interface DashboardMetrics {
  normativasAtrasadas: number;
  normativasEnTiempo: number;
  riesgosPendientes: number;
  riesgosEnCurso: number;
  incidentesEnProgreso: number;
  incidentesCompletados: number;
  solicitudesRecibidas: number;
  solicitudesEnProgreso: number;
}

// Helpers to map DRF snake_case to frontend camelCase
const mapNormativa = (item: any): Normativa => ({
  id: String(item.id),
  nombre: item.nombre,
  progreso: item.progreso || 0,
  estado: item.estado,
  criticidad: item.criticidad,
  fechaInicio: item.fecha_inicio || item.fechaInicio,
  fechaTermino: item.fecha_termino || item.fechaTermino,
  tipo: item.tipo,
  origen: item.origen,
});

const mapTarea = (item: any): TareaPendiente => ({
  id: String(item.id),
  responsable: item.responsable,
  estado: item.estado,
  fechaVencimiento: item.fecha_vencimiento || item.fechaVencimiento,
  tarea: item.tarea,
  asociadaA: item.asociada_a || item.asociadaA || 'General',
  responsableAsignado: item.responsable_asignado || item.responsableAsignado || item.responsable,
  esVencida: item.es_vencida ?? false,
  prioridad: item.prioridad || 'media',
  completada: item.estado === 'completada' || item.estado === 'al_dia',
  comentarioProgreso: item.comentario_progreso || item.comentarioProgreso || '',
  comentarioCierre: item.comentario_cierre || item.comentarioCierre || '',
  nombreArchivoEvidencia: item.nombre_archivo_evidencia || item.nombreArchivoEvidencia || '',
});

const mapRiesgo = (item: any): Riesgo => ({
  id: String(item.id),
  nombre: item.nombre,
  impacto: item.impacto,
  probabilidad: item.probabilidad,
  estado: item.estado,
  responsable: item.responsable,
  empresa: item.empresa ? String(item.empresa) : '',
  fechaIdentificacion: item.fecha_identificacion || item.fechaIdentificacion || new Date().toISOString().split('T')[0],
  categoria: item.categoria || 'General',
  estrategia: item.estrategia || 'Mitigar',
});

const mapSolicitud = (item: any): SolicitudTicket => ({
  id: String(item.id),
  estado: item.estado || 'recibida',
  nombre: item.nombre,
  tipo: item.tipo,
  fechaCreacion: item.fecha_creacion || item.fechaCreacion || new Date().toISOString().split('T')[0],
  fechaLimite: item.fecha_limite || item.fechaLimite || new Date().toISOString().split('T')[0],
  sla: item.sla || 'en_tiempo',
  prioridad: item.prioridad || 'media',
  solicitante: item.solicitante || 'Usuario',
  responsable: item.responsable || 'Equipo Legal',
});

const mapIncidente = (item: any): Incidente => ({
  id: String(item.id),
  nombre: item.nombre,
  denunciante: item.denunciante,
  responsable: item.responsable,
  tipo: item.tipo,
  estado: item.estado || 'abierto',
  fecha: item.fecha || new Date().toISOString().split('T')[0],
  severidad: item.severidad || 'media',
});

const mapRAT = (item: any): TratamientoRAT => ({
  id: String(item.id),
  area: item.area,
  tratamiento: item.tratamiento,
  finalidad: item.finalidad,
  categoriaDP: item.categoria_dp || item.categoriaDP,
  baseLicitud: item.base_licitud || item.baseLicitud,
  estado: item.estado,
});

const mapObjetivo = (item: any): ObjetivoChecklist => ({
  id: String(item.id),
  categoria: item.categoria,
  nombre: item.nombre,
  estado: item.estado,
  responsable: item.responsable,
});

export const api = {
  getMe: async (): Promise<{
    username: string;
    name: string;
    cargo: string;
    empresa?: {
      id: number;
      nombre: string;
      rut: string | null;
      tipo_sociedad: string;
      rubro: string | null;
      rango_empleados: string | null;
      tamano: string | null;
      setup_completado: boolean;
      maneja_datos_personales?: boolean;
      es_b2c_ecommerce?: boolean;
      procesa_pagos?: boolean;
      genera_residuos_rep?: boolean;
      tiene_trabajadores?: boolean;
    };
  }> => {
    try {
      const res = await axiosInstance.get('/api/me/');
      return res.data;
    } catch {
      return { username: 'empleado', name: 'Felipe Sanchez', cargo: 'JAC' };
    }
  },

  onboardingEmpresa: async (data: any) => {
    const res = await axiosInstance.post('/api/empresas/onboarding/', data);
    return res.data;
  },

  getEmpresaCompliance: async () => {
    try {
      const res = await axiosInstance.get('/api/empresas/compliance/');
      return res.data;
    } catch {
      return [];
    }
  },

  // ==========================================
  // COMPLIANCE / NORMATIVAS (Nuevos Endpoints)
  // ==========================================
  getNormativasDisponibles: async () => {
    try {
      const res = await axiosInstance.get('/api/normativas/disponibles/');
      return res.data;
    } catch (error) {
      console.error('Error in getNormativasDisponibles:', error);
      throw error;
    }
  },

  asignarNormativa: async (normativaId: number) => {
    try {
      const res = await axiosInstance.post('/api/normativas/asignar/', { normativa_id: normativaId });
      return res.data;
    } catch (error) {
      console.error('Error in asignarNormativa:', error);
      throw error;
    }
  },

  getEmpresas: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/empresas/');
      return res.data;
    } catch (err) {
      console.error('Error al obtener empresas:', err);
      return [];
    }
  },

  setupEmpresa: async (data: { rubro?: string, tamano?: string }) => {
    const res = await axiosInstance.patch('/api/empresa/setup/', data);
    return res.data;
  },

  getNormativasAsignadas: async () => {
    const res = await axiosInstance.get('/api/empresas/compliance/');
    return res.data;
  },

  asignarResponsableLey: async (complianceId: number, responsable: string) => {
    const res = await axiosInstance.patch(`/api/empresas/compliance/${complianceId}/`, { responsable });
    return res.data;
  },

  getResponsables: async (): Promise<Responsable[]> => {
    try {
      const res = await axiosInstance.get('/api/responsables/');
      return res.data;
    } catch (err) {
      console.error('Error al obtener responsables:', err);
      return [];
    }
  },

  crearResponsable: async (data: Partial<Responsable>): Promise<Responsable> => {
    const res = await axiosInstance.post('/api/responsables/', data);
    return res.data;
  },

  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    try {
      const [compRes, riesgRes, incRes, solicRes] = await Promise.allSettled([
        axiosInstance.get('/api/empresas/compliance/'),
        axiosInstance.get('/api/riesgos/'),
        axiosInstance.get('/api/incidentes/'),
        axiosInstance.get('/api/tickets/'),
      ]);

      const compliances = compRes.status === 'fulfilled' ? compRes.value.data : [];
      const riesgos = riesgRes.status === 'fulfilled' ? riesgRes.value.data : [];
      const incidentes = incRes.status === 'fulfilled' ? incRes.value.data : [];
      const solicitudes = solicRes.status === 'fulfilled' ? solicRes.value.data : [];

      const normativasAtrasadas = compliances.filter((n: any) => (n.porcentaje_progreso || 0) < 50 || n.estado === 'EN_RIESGO' || n.estado === 'PENDIENTE').length;
      const normativasEnTiempo = compliances.filter((n: any) => (n.porcentaje_progreso || 0) >= 50 && n.estado !== 'EN_RIESGO').length;

      return {
        normativasAtrasadas,
        normativasEnTiempo,
        riesgosPendientes: riesgos.filter((r: any) => r.estado === 'pendiente' || !r.estado).length,
        riesgosEnCurso: riesgos.filter((r: any) => r.estado === 'en_curso' || r.estado === 'mitigando').length,
        incidentesEnProgreso: incidentes.filter((i: any) => i.estado === 'en_progreso' || i.estado === 'revisando' || i.estado === 'abierto').length,
        incidentesCompletados: incidentes.filter((i: any) => i.estado === 'completado' || i.estado === 'cerrado' || i.estado === 'mitigado').length,
        solicitudesRecibidas: solicitudes.filter((s: any) => s.estado === 'recibida' || s.estado === 'pendiente').length,
        solicitudesEnProgreso: solicitudes.filter((s: any) => s.estado === 'revisando' || s.estado === 'resolviendo' || s.estado === 'en_progreso').length,
      };
    } catch {
      return {
        normativasAtrasadas: 0,
        normativasEnTiempo: 0,
        riesgosPendientes: 0,
        riesgosEnCurso: 0,
        incidentesEnProgreso: 0,
        incidentesCompletados: 0,
        solicitudesRecibidas: 0,
        solicitudesEnProgreso: 0,
      };
    }
  },

  getTareas: async (filters: { responsable?: string; prioridad?: string; estado?: string }): Promise<TareaPendiente[]> => {
    try {
      const res = await axiosInstance.get('/api/tareas/');
      let tareas: TareaPendiente[] = (res.data || []).map(mapTarea);

      return tareas.filter((t) => {
        const matchUser = !filters.responsable || filters.responsable === 'Todos' || t.responsableAsignado === filters.responsable;
        const matchStatus = !filters.estado || filters.estado === 'Todos' ||
                           (filters.estado === 'Pendiente' && t.estado !== 'al_dia' && t.estado !== 'completada') ||
                           (filters.estado === 'Completada' && (t.estado === 'al_dia' || t.estado === 'completada'));
        return matchUser && matchStatus;
      });
    } catch (err) {
      console.error('Error al obtener tareas:', err);
      return [];
    }
  },

  getAssignees: async (): Promise<string[]> => {
    try {
      const res = await axiosInstance.get('/api/tareas/');
      const tareas: TareaPendiente[] = (res.data || []).map(mapTarea);
      return Array.from(new Set(tareas.map((t) => t.responsableAsignado).filter(Boolean)));
    } catch {
      return [];
    }
  },

  getAlertas: async (): Promise<any[]> => {
    try {
      const res = await axiosInstance.get('/api/alertas-compliance/');
      return res.data;
    } catch (err) {
      console.error('Error al obtener alertas:', err);
      return [];
    }
  },

  actualizarAlerta: async (id: number, data: any): Promise<any> => {
    const res = await axiosInstance.patch(`/api/alertas-compliance/${id}/`, data);
    return res.data;
  },

  crearTarea: async (nuevaTarea: Omit<TareaPendiente, 'id'>): Promise<TareaPendiente> => {
    const payload = {
      responsable: nuevaTarea.responsable,
      estado: nuevaTarea.estado || 'pendiente',
      fecha_vencimiento: nuevaTarea.fechaVencimiento,
      tarea: nuevaTarea.tarea,
      asociada_a: nuevaTarea.asociadaA,
      responsable_asignado: nuevaTarea.responsableAsignado || nuevaTarea.responsable,
    };
    const res = await axiosInstance.post('/api/tareas/', payload);
    return mapTarea(res.data);
  },

  reasignarTarea: async (idTarea: string, nuevoResponsable: string): Promise<void> => {
    await axiosInstance.patch(`/api/tareas/${idTarea}/`, {
      responsable_asignado: nuevoResponsable,
    });
  },

  actualizarEstadoTarea: async (
    idTarea: string | number, 
    nuevoEstado: string, 
    extraData?: { comentario_progreso?: string; comentario_cierre?: string; nombre_archivo_evidencia?: string }
  ): Promise<any> => {
    const res = await axiosInstance.patch(`/api/tareas/${idTarea}/`, {
      estado: nuevoEstado,
      ...(extraData || {})
    });
    return res.data;
  },

  actualizarTarea: async (idTarea: string | number, data: any): Promise<any> => {
    const res = await axiosInstance.patch(`/api/tareas/${idTarea}/`, data);
    return res.data;
  },

  getNormativas: async (): Promise<Normativa[]> => {
    try {
      const res = await axiosInstance.get('/api/normativas/');
      return (res.data || []).map(mapNormativa);
    } catch (err) {
      console.error('Error al obtener normativas:', err);
      return [];
    }
  },

  crearNormativa: async (data: any): Promise<Normativa> => {
    const res = await axiosInstance.post('/api/normativas/', data);
    return mapNormativa(res.data);
  },

  getRiesgos: async (): Promise<Riesgo[]> => {
    try {
      const res = await axiosInstance.get('/api/riesgos/');
      return (res.data || []).map(mapRiesgo);
    } catch (err) {
      console.error('Error al obtener riesgos:', err);
      return [];
    }
  },

  crearRiesgo: async (data: Partial<Riesgo>): Promise<Riesgo> => {
    const payload = {
      nombre: data.nombre,
      categoria: data.categoria || 'Operacional',
      impacto: data.impacto || 3,
      probabilidad: data.probabilidad || 3,
      estrategia: data.estrategia || 'Mitigar',
      estado: data.estado || 'pendiente',
      responsable: data.responsable || 'Oficial de Cumplimiento',
      fecha_identificacion: data.fechaIdentificacion || new Date().toISOString().split('T')[0],
    };
    const res = await axiosInstance.post('/api/riesgos/', payload);
    return mapRiesgo(res.data);
  },

  actualizarRiesgo: async (id: string | number, data: Partial<Riesgo>): Promise<Riesgo> => {
    const res = await axiosInstance.patch(`/api/riesgos/${id}/`, data);
    return mapRiesgo(res.data);
  },

  getIncidentes: async (): Promise<Incidente[]> => {
    try {
      const res = await axiosInstance.get('/api/incidentes/');
      return (res.data || []).map(mapIncidente);
    } catch (err) {
      console.error('Error al obtener incidentes:', err);
      return [];
    }
  },

  crearIncidente: async (data: Partial<Incidente>): Promise<Incidente> => {
    const payload = {
      nombre: data.nombre,
      denunciante: data.denunciante || 'Anónimo',
      responsable: data.responsable || 'Comité de Ética',
      tipo: data.tipo || 'Acoso Laboral',
      estado: data.estado || 'abierto',
      severidad: data.severidad || 'media',
      fecha: data.fecha || new Date().toISOString().split('T')[0],
    };
    const res = await axiosInstance.post('/api/incidentes/', payload);
    return mapIncidente(res.data);
  },

  actualizarIncidente: async (id: string | number, data: Partial<Incidente>): Promise<Incidente> => {
    const res = await axiosInstance.patch(`/api/incidentes/${id}/`, data);
    return mapIncidente(res.data);
  },

  getSolicitudes: async (): Promise<SolicitudTicket[]> => {
    try {
      const res = await axiosInstance.get('/api/tickets/');
      return (res.data || []).map(mapSolicitud);
    } catch (err) {
      console.error('Error al obtener solicitudes:', err);
      return [];
    }
  },

  crearSolicitud: async (data: Partial<SolicitudTicket>): Promise<SolicitudTicket> => {
    const payload = {
      nombre: data.nombre,
      tipo: data.tipo || 'Derecho ARCO - Acceso',
      estado: data.estado || 'recibida',
      prioridad: data.prioridad || 'media',
      sla: data.sla || 'en_tiempo',
      fecha_limite: data.fechaLimite || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      solicitante: data.solicitante || 'Titular de Datos',
      responsable: data.responsable || 'Oficial de Privacidad',
    };
    const res = await axiosInstance.post('/api/tickets/', payload);
    return mapSolicitud(res.data);
  },

  actualizarSolicitud: async (id: string | number, data: Partial<SolicitudTicket>): Promise<SolicitudTicket> => {
    const res = await axiosInstance.patch(`/api/tickets/${id}/`, data);
    return mapSolicitud(res.data);
  },

  getNormativaDetalle: async (id: string): Promise<any> => {
    try {
      const [normRes, chkRes, ratRes] = await Promise.allSettled([
        axiosInstance.get(`/api/normativas/${id}/`),
        axiosInstance.get('/api/objetivos/'),
        axiosInstance.get('/api/tratamientos/'),
      ]);

      const normativa = normRes.status === 'fulfilled' ? mapNormativa(normRes.value.data) : null;
      const checklist = chkRes.status === 'fulfilled' ? (chkRes.value.data || []).map(mapObjetivo) : [];
      const rat = ratRes.status === 'fulfilled' ? (ratRes.value.data || []).map(mapRAT) : [];

      return {
        ...normativa,
        checklist,
        rat,
        documentos: [],
      };
    } catch (err) {
      console.error('Error al obtener detalle de normativa:', err);
      return null;
    }
  },

  // --- INTEGRACION BCN / GEMINI ---
  getRecomendacionesLegales: async (rubro: string, tamano: string): Promise<any[]> => {
    try {
      const res = await axiosInstance.get(`/api/recomendaciones_legales/?rubro=${encodeURIComponent(rubro)}&tamano=${encodeURIComponent(tamano)}`);
      return res.data;
    } catch (err) {
      console.error('Error obteniendo recomendaciones:', err);
      return [];
    }
  },

  generarChecklist: async (leyData: any): Promise<any> => {
    const res = await axiosInstance.post('/api/generar_checklist/', leyData);
    return res.data;
  },

  // --- GRC ENDPOINTS ---
  getDashboardEjecutivo: async (): Promise<any> => {
    const res = await axiosInstance.get('/api/dashboard/ejecutivo/');
    return res.data;
  },

  generarResumenIA: async (): Promise<string> => {
    const res = await axiosInstance.post('/api/dashboard/generar_resumen/');
    return res.data.resumen || '';
  },

  getFichaNormativaCompleta: async (id: number | string): Promise<any> => {
    const res = await axiosInstance.get(`/api/compliance/normativas/${id}/ficha-completa/`);
    return res.data;
  },

  getAlertasCompliance: async (): Promise<any[]> => {
    const res = await axiosInstance.get('/api/alertas-compliance/');
    return res.data || [];
  },

  escalarAlerta: async (id: number): Promise<any> => {
    const res = await axiosInstance.post(`/api/alertas/${id}/escalar/`);
    return res.data;
  },

  getCalendarioEventos: async (): Promise<any[]> => {
    const res = await axiosInstance.get('/api/calendario/eventos/');
    return res.data || [];
  }
};

