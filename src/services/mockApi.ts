import { mockTareasPendientes, mockNormativas, mockChecklistPDP, mockRAT, mockRiesgos } from '../data/mockData';
import type { TareaPendiente } from '../types';

// Utilidad para simular el tiempo de respuesta del servidor
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

export const mockApi = {
  // Simula obtener los KPIs generales
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    await delay(800); // 800ms de carga simulada
    return {
      normativasAtrasadas: 122,
      normativasEnTiempo: 47,
      riesgosPendientes: 192,
      riesgosEnCurso: 13,
      incidentesEnProgreso: 70,
      incidentesCompletados: 6,
      solicitudesRecibidas: 0,
      solicitudesEnProgreso: 127
    };
  },

  // Simula obtener tareas con filtros aplicados en el "servidor"
  getTareas: async (filters: { responsable?: string, prioridad?: string, estado?: string }): Promise<TareaPendiente[]> => {
    await delay(600);
    
    return mockTareasPendientes.filter(t => {
      const matchUser = !filters.responsable || filters.responsable === 'Todos' || t.responsableAsignado === filters.responsable;
      const matchStatus = !filters.estado || filters.estado === 'Todos' || 
                         (filters.estado === 'Pendiente' && t.estado !== 'al_dia') ||
                         (filters.estado === 'Completada' && t.estado === 'al_dia');
      return matchUser && matchStatus;
    });
  },

  // Obtiene los usuarios únicos para el filtro
  getAssignees: async (): Promise<string[]> => {
    await delay(300);
    return Array.from(new Set(mockTareasPendientes.map(t => t.responsableAsignado)));
  },

  // ---- NUEVOS METODOS PARA TAREAS ----
  crearTarea: async (nuevaTarea: Omit<TareaPendiente, 'id'>): Promise<TareaPendiente> => {
    await delay(800); // simulamos guardado
    const tarea: TareaPendiente = {
      ...nuevaTarea,
      id: `t-${Date.now()}` // id random
    };
    mockTareasPendientes.unshift(tarea); // agregamos al inicio
    return tarea;
  },

  reasignarTarea: async (idTarea: string, nuevoResponsable: string): Promise<void> => {
    await delay(500);
    const tareaIndex = mockTareasPendientes.findIndex(t => t.id === idTarea);
    if (tareaIndex !== -1) {
      mockTareasPendientes[tareaIndex].responsableAsignado = nuevoResponsable;
    }
  },

  // ---- CUMPLIMIENTO (COMPLIANCE) ----
  getNormativas: async (): Promise<any[]> => {
    await delay(700);
    return mockNormativas;
  },

  getRiesgos: async (): Promise<any[]> => {
    await delay(700);
    // Para simplificar, devolvemos mockRiesgos si existe, o un arreglo dummy
    return typeof mockRiesgos !== 'undefined' ? mockRiesgos : [
      { id: '1', nombre: 'Riesgo de Ciberseguridad', estado: 'pendiente' },
      { id: '2', nombre: 'Riesgo Financiero', estado: 'en_curso' }
    ];
  },

  getIncidentes: async (): Promise<any[]> => {
    await delay(600);
    return [
      { id: 'i-1', titulo: 'Caída de servidor principal', estado: 'en_progreso', severidad: 'Alta' },
      { id: 'i-2', titulo: 'Acceso no autorizado', estado: 'completado', severidad: 'Crítica' }
    ];
  },

  getSolicitudes: async (): Promise<any[]> => {
    await delay(500);
    return [
      { id: 's-1', tipo: 'Acceso a Datos', estado: 'en_progreso', usuario: 'Elena Rivas' },
      { id: 's-2', tipo: 'Revisión de Contrato', estado: 'en_progreso', usuario: 'Andres Munoz' }
    ];
  },

  getNormativaDetalle: async (id: string): Promise<any> => {
    await delay(600);
    const normativa = mockNormativas.find(n => n.id === id);
    if (!normativa) throw new Error("Normativa no encontrada");
    // Simulamos que el detalle trae la info extra
    return {
      ...normativa,
      checklist: mockChecklistPDP,
      rat: mockRAT,
      documentos: [] // mock empty docs
    };
  }
};
