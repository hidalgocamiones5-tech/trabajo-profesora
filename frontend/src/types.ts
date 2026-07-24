export interface Normativa {
  id: string;
  nombre: string;
  progreso: number; // 0 to 100
  estado: 'en_tiempo' | 'atrasada' | 'en_riesgo' | 'completada';
  criticidad: 'alta' | 'media' | 'baja';
  fechaInicio: string;
  fechaTermino: string;
  tipo: string;
  origen: string;
}

export interface ObjetivoChecklist {
  id: string;
  categoria: string;
  nombre: string;
  estado: 'completado' | 'atrasado' | 'por_hacer';
  responsable: string;
}

export interface TratamientoRAT {
  id: string;
  area: string;
  tratamiento: string;
  finalidad: string;
  categoriaDP: string;
  baseLicitud: string;
  estado: 'completado' | 'pendiente' | 'borrador';
}

export interface SolicitudTicket {
  id: string;
  estado: 'recibida' | 'revisando' | 'resolviendo' | 'resuelta';
  nombre: string;
  tipo: string;
  fechaCreacion: string;
  fechaLimite: string;
  sla: 'en_tiempo' | 'en_riesgo' | 'atrasada';
  prioridad: 'alta' | 'urgente' | 'media';
  solicitante: string;
  responsable: string;
}

export interface Incidente {
  id: string;
  nombre: string;
  denunciante: string;
  responsable: string;
  tipo: string;
  estado: string;
  fecha: string;
}

export interface TareaPendiente {
  id: string;
  responsable: string;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  fechaVencimiento: string;
  tarea: string;
  asociadaA: string; // Origen (Normativa, etc.)
  responsableAsignado: string;
  esVencida?: boolean;
}

export interface Riesgo {
  id: string;
  nombre: string;
  impacto: 1 | 2 | 3 | 4 | 5;
  probabilidad: 1 | 2 | 3 | 4 | 5;
  estado: 'pendiente' | 'mitigado' | 'en_curso';
  responsable: string;
  empresa: string;
  fechaIdentificacion: string;
}
