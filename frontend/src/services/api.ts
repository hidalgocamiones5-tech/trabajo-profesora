import type { TareaPendiente } from '../types';
import * as mock from '../data/mockData';

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
    return {
      normativasAtrasadas: mock.mockNormativas.filter((n: any) => n.estado === 'atrasada').length,
      normativasEnTiempo: mock.mockNormativas.filter((n: any) => n.estado === 'en_tiempo').length,
      riesgosPendientes: mock.mockRiesgos.filter((r: any) => r.estado === 'pendiente').length,
      riesgosEnCurso: mock.mockRiesgos.filter((r: any) => r.estado === 'en_curso').length,
      incidentesEnProgreso: mock.mockRiesgos.filter((i: any) => i.estado === 'en_curso').length,
      incidentesCompletados: mock.mockRiesgos.filter((i: any) => i.estado === 'mitigado').length,
      solicitudesRecibidas: mock.mockSolicitudes.filter((s: any) => s.estado === 'recibida').length,
      solicitudesEnProgreso: mock.mockSolicitudes.filter((s: any) => s.estado === 'revisando').length,
    };
  },

  getTareas: async (filters: { responsable?: string, prioridad?: string, estado?: string }): Promise<TareaPendiente[]> => {
    let tareas = [...mock.mockTareasPendientes];
    
    return tareas.filter((t: any) => {
      const matchUser = !filters.responsable || filters.responsable === 'Todos' || t.responsableAsignado === filters.responsable;
      const matchStatus = !filters.estado || filters.estado === 'Todos' || 
                         (filters.estado === 'Pendiente' && t.estado !== 'al_dia' && t.estado !== 'completada') ||
                         (filters.estado === 'Completada' && (t.estado === 'al_dia' || t.estado === 'completada'));
      return matchUser && matchStatus;
    });
  },

  getAssignees: async (): Promise<string[]> => {
    return Array.from(new Set(mock.mockTareasPendientes.map((t: any) => t.responsableAsignado)));
  },

  crearTarea: async (nuevaTarea: Omit<TareaPendiente, 'id'>): Promise<TareaPendiente> => {
    const newTask = { 
        ...nuevaTarea, 
        id: `tar-${Math.random()}`,
        responsableAsignado: (nuevaTarea as any).responsableAsignado || nuevaTarea.responsable,
        esVencida: false 
    } as TareaPendiente;
    mock.mockTareasPendientes.push(newTask);
    return newTask;
  },

  reasignarTarea: async (idTarea: string, nuevoResponsable: string): Promise<void> => {
    const t = mock.mockTareasPendientes.find(x => x.id === idTarea);
    if (t) {
        t.responsableAsignado = nuevoResponsable;
    }
  },

  actualizarEstadoTarea: async (idTarea: string, nuevoEstado: string): Promise<void> => {
    const t = mock.mockTareasPendientes.find(x => x.id === idTarea);
    if (t) {
        t.estado = nuevoEstado as any;
    }
  },

  getNormativas: async (): Promise<any[]> => mock.mockNormativas,

  getRiesgos: async (): Promise<any[]> => mock.mockRiesgos,

  getIncidentes: async (): Promise<any[]> => mock.mockRiesgos, // Using risks as fallback mock

  getSolicitudes: async (): Promise<any[]> => mock.mockSolicitudes,

  getNormativaDetalle: async (id: string): Promise<any> => {
    const data = mock.mockNormativas.find(x => x.id === id) || mock.mockNormativas[0];
    return {
        ...data,
        checklist: mock.mockChecklistPDP,
        rat: mock.mockRAT,
        documentos: []
    };
  }
};
