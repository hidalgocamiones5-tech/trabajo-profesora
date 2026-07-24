import type { TareaPendiente } from '../types';

const API_URL = 'http://localhost:8000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token && token !== 'null' && token !== 'undefined') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const fetchAPI = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: { ...getHeaders(), ...options.headers }
  });
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.reload();
    throw new Error('Sesión expirada o no autorizada');
  }
  return response;
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

export const api = {
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    // In a real app, this might be a specific endpoint. 
    // Here we compute it by fetching basic stats or we can just fetch everything and compute.
    // For now, let's fetch lists and compute to avoid making a custom Django endpoint yet.
    const [normativas, riesgos, incidentes, solicitudes] = await Promise.all([
      fetchAPI(`${API_URL}/normativas/`, { headers: getHeaders() }).then(res => res.json()),
      fetchAPI(`${API_URL}/riesgos/`, { headers: getHeaders() }).then(res => res.json()),
      fetchAPI(`${API_URL}/incidentes/`, { headers: getHeaders() }).then(res => res.json()),
      fetchAPI(`${API_URL}/tickets/`, { headers: getHeaders() }).then(res => res.json())
    ]);

    return {
      normativasAtrasadas: normativas.filter((n: any) => n.estado === 'atrasada').length,
      normativasEnTiempo: normativas.filter((n: any) => n.estado === 'en_tiempo').length,
      riesgosPendientes: riesgos.filter((r: any) => r.estado === 'pendiente').length,
      riesgosEnCurso: riesgos.filter((r: any) => r.estado === 'en_curso').length,
      incidentesEnProgreso: incidentes.filter((i: any) => i.estado === 'en_progreso').length,
      incidentesCompletados: incidentes.filter((i: any) => i.estado === 'completado').length,
      solicitudesRecibidas: solicitudes.filter((s: any) => s.estado === 'recibida').length,
      solicitudesEnProgreso: solicitudes.filter((s: any) => s.estado === 'en_progreso').length,
    };
  },

  getTareas: async (filters: { responsable?: string, prioridad?: string, estado?: string }): Promise<TareaPendiente[]> => {
    const response = await fetchAPI(`${API_URL}/tareas/`, { headers: getHeaders() });
    let tareas: any[] = await response.json();
    
    return tareas.filter((t: any) => {
      const matchUser = !filters.responsable || filters.responsable === 'Todos' || t.responsable_asignado === filters.responsable;
      const matchStatus = !filters.estado || filters.estado === 'Todos' || 
                         (filters.estado === 'Pendiente' && t.estado !== 'al_dia') ||
                         (filters.estado === 'Completada' && t.estado === 'al_dia');
      return matchUser && matchStatus;
    }).map(t => ({
        ...t, 
        responsableAsignado: t.responsable_asignado,
        fechaVencimiento: t.fecha_vencimiento,
        esVencida: t.es_vencida
    }));
  },

  getAssignees: async (): Promise<string[]> => {
    const response = await fetchAPI(`${API_URL}/tareas/`, { headers: getHeaders() });
    const tareas = await response.json();
    return Array.from(new Set(tareas.map((t: any) => t.responsable_asignado)));
  },

  crearTarea: async (nuevaTarea: Omit<TareaPendiente, 'id'>): Promise<TareaPendiente> => {
    const payload = {
        ...nuevaTarea,
        responsable_asignado: (nuevaTarea as any).responsableAsignado || 'Sin asignar',
        fecha_vencimiento: nuevaTarea.fechaVencimiento
    };
    
    const response = await fetchAPI(`${API_URL}/tareas/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    return {
        ...data,
        responsableAsignado: data.responsable_asignado,
        fechaVencimiento: data.fecha_vencimiento,
        esVencida: data.es_vencida
    };
  },

  reasignarTarea: async (idTarea: string, nuevoResponsable: string): Promise<void> => {
    await fetchAPI(`${API_URL}/tareas/${idTarea}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ responsable_asignado: nuevoResponsable })
    });
  },

  actualizarEstadoTarea: async (idTarea: string, nuevoEstado: string): Promise<void> => {
    await fetchAPI(`${API_URL}/tareas/${idTarea}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ estado: nuevoEstado })
    });
  },

  getNormativas: async (): Promise<any[]> => {
    const response = await fetchAPI(`${API_URL}/normativas/`, { headers: getHeaders() });
    const data = await response.json();
    return data.map((d: any) => ({
        ...d,
        fechaInicio: d.fecha_inicio,
        fechaTermino: d.fecha_termino
    }));
  },

  getRiesgos: async (): Promise<any[]> => {
    const response = await fetchAPI(`${API_URL}/riesgos/`, { headers: getHeaders() });
    return response.json();
  },

  getIncidentes: async (): Promise<any[]> => {
    const response = await fetchAPI(`${API_URL}/incidentes/`, { headers: getHeaders() });
    return response.json();
  },

  getSolicitudes: async (): Promise<any[]> => {
    const response = await fetchAPI(`${API_URL}/tickets/`, { headers: getHeaders() });
    return response.json();
  },

  getNormativaDetalle: async (id: string): Promise<any> => {
    const response = await fetchAPI(`${API_URL}/normativas/${id}/`, { headers: getHeaders() });
    const data = await response.json();
    // Simulate extra details that might not be fully modeled yet
    return {
        ...data,
        fechaInicio: data.fecha_inicio,
        fechaTermino: data.fecha_termino,
        checklist: [],
        rat: [],
        documentos: []
    };
  }
};
