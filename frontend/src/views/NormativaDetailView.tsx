import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { bcnService } from '../services/bcnService';
import type { LeyOficialBCN } from '../services/bcnService';
import { api } from '../services/api';
import {
  ArrowLeft, Download, ShieldCheck, CheckCircle, AlertTriangle, FileText, UploadCloud,
  Users, Scale, Search, PlayCircle, Plus, X, Printer, Clock, Sparkles,
  Check, ShieldAlert, CheckCircle2, RefreshCw, Briefcase, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NormativaDetailViewProps {
  normativaId: string;
  onBack: () => void;
  initialLey?: any;
}

interface ObligacionItem {
  id: string | number;
  title: string;
  descripcion?: string;
  status: 'Cumplida' | 'Parcial' | 'Pendiente';
  criticidad: 'Alta' | 'Media' | 'Baja';
  responsable?: string;
  fechaVencimiento?: string;
  categoria?: string;
}

interface ControlItem {
  id: string | number;
  codigo: string;
  nombre: string;
  descripcion: string;
  periodicidad: 'Diario' | 'Semanal' | 'Mensual' | 'Trimestral' | 'Semestral' | 'Anual';
  estado: 'Activo' | 'Pendiente' | 'Ejecutado' | 'Vencido';
  ultimaEjecucion: string;
  proximaEjecucion: string;
  responsable: string;
}

interface EvidenciaItem {
  id: string | number;
  nombre: string;
  tipo: string;
  tamano: string;
  version: string;
  fechaSubida: string;
  fechaVencimiento?: string;
  subidoPor: string;
  estadoVigencia: 'Vigente' | 'Por Vencer' | 'Vencida';
  archivoUrl?: string;
}

interface RiesgoItem {
  id: string | number;
  nombre: string;
  categoria: string;
  impacto: number; // 1-5
  probabilidad: number; // 1-5
  nivel: number;
  estrategia: 'Mitigar' | 'Transferir' | 'Aceptar' | 'Eliminar';
  responsable: string;
}

interface IncidenteItem {
  id: string | number;
  nombre: string;
  tipo: string;
  severidad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  estado: 'Abierto' | 'En Investigación' | 'Cerrado';
  fecha: string;
}

interface AuditoriaItem {
  id: string | number;
  nombre: string;
  tipo: 'Interna' | 'Externa';
  estado: 'Planificada' | 'En Progreso' | 'Finalizada';
  fechaInicio: string;
  fechaFin: string;
  hallazgosCount: number;
}

interface PlanAccionItem {
  id: string | number;
  tarea: string;
  responsable: string;
  fechaLimite: string;
  estado: 'Abierto' | 'En Progreso' | 'Cerrado';
}

export const NormativaDetailView: React.FC<NormativaDetailViewProps> = ({ normativaId, onBack, initialLey }) => {
  const [ley, setLey] = useState<LeyOficialBCN | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('resumen');

  // Estado reactivo para las 7 pestañas
  const [obligaciones, setObligaciones] = useState<ObligacionItem[]>([]);
  const [controles, setControles] = useState<ControlItem[]>([]);
  const [evidencias, setEvidencias] = useState<EvidenciaItem[]>([]);
  const [riesgos, setRiesgos] = useState<RiesgoItem[]>([]);
  const [incidentes, setIncidentes] = useState<IncidenteItem[]>([]);
  const [auditorias, setAuditorias] = useState<AuditoriaItem[]>([]);
  const [planesAccion, setPlanesAccion] = useState<PlanAccionItem[]>([]);

  // Modales
  const [showInformeModal, setShowInformeModal] = useState(false);
  const [showEjecutarControlModal, setShowEjecutarControlModal] = useState<ControlItem | null>(null);
  const [showSubirEvidenciaModal, setShowSubirEvidenciaModal] = useState(false);
  const [showNuevaObligacionModal, setShowNuevaObligacionModal] = useState(false);
  const [showReportarIncidenteModal, setShowReportarIncidenteModal] = useState(false);
  const [showRemediarBrechaModal, setShowRemediarBrechaModal] = useState<ObligacionItem | null>(null);

  // Form states
  const [controlNotas, setControlNotas] = useState('');
  const [controlResultado, setControlResultado] = useState<'Efectivo' | 'Con Observaciones' | 'Inefectivo'>('Efectivo');
  const [nuevaEvidencia, setNuevaEvidencia] = useState({
    nombre: '',
    tipo: 'PDF',
    version: '1.0',
    fechaVencimiento: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
  });
  const [nuevaObligacion, setNuevaObligacion] = useState({
    title: '',
    descripcion: '',
    criticidad: 'Media' as 'Alta' | 'Media' | 'Baja',
    responsable: 'Equipo Legal & GRC',
    fechaVencimiento: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });
  const [nuevoIncidente, setNuevoIncidente] = useState({
    nombre: '',
    tipo: 'Seguridad / Filtración',
    severidad: 'Media' as 'Baja' | 'Media' | 'Alta' | 'Crítica'
  });
  const [remediarPlan, setRemediarPlan] = useState({
    tarea: '',
    responsable: 'Julian Sosa (Legal)',
    fechaLimite: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  });

  // Carga inicial
  useEffect(() => {
    const fetchExpediente = async () => {
      setIsLoading(true);
      try {
        // 1. Obtener de BCN Service (Catálogo Oficial)
        const bcnData = await bcnService.getLeyPorId(normativaId);
        
        // 2. Intentar obtener expediente backend
        let backendData: any = null;
        try {
          backendData = await api.getFichaNormativaCompleta(normativaId);
        } catch {
          // Fallback a BCN
        }

        if (initialLey) {
          setLey({
            id: initialLey.id || normativaId,
            numero: initialLey.numero || `Ley N° ${normativaId}`,
            nombre: initialLey.nombre || `Normativa ${normativaId}`,
            alias: initialLey.alias || initialLey.nombre || `Ley ${normativaId}`,
            tipo: 'Ley de la República',
            origen: 'BCN Ley Chile',
            criticidad: 'Alta',
            estado: initialLey.estado || 'en_tiempo',
            progreso: initialLey.progreso || 0,
            fechaInicio: initialLey.fechaPublicacion || '2024-01-01',
            fechaTermino: '2026-12-31',
            organismo: 'Ente Regulador / Órgano Competente',
            resumen: initialLey.resumen || 'Marco regulatorio y obligaciones de cumplimiento.',
            articulos: [],
            requisitos: [],
            evidencias: []
          });
        }

        if (bcnData) {
          setLey(bcnData);
        } else if (backendData) {
          setLey({
            id: String(backendData.normativa_id),
            numero: `Ley N° ${backendData.codigo || normativaId}`,
            nombre: backendData.titulo || `Normativa ${normativaId}`,
            alias: backendData.titulo || `Normativa ${normativaId}`,
            tipo: 'Ley de la República',
            origen: 'BCN Ley Chile',
            criticidad: 'Alta',
            estado: 'en_tiempo',
            progreso: backendData.score?.porcentaje || 0,
            fechaInicio: '2024-01-01',
            fechaTermino: '2026-12-31',
            organismo: 'Ente Regulador / Órgano Competente',
            resumen: backendData.resumen || 'Regulación oficial de cumplimiento normativo en Chile.',
            articulos: [],
            requisitos: [],
            evidencias: []
          });
        } else {
          // Generar Ficha Dinámica Automática si no existe en BCN ni Backend
          const safeId = String(normativaId);
          setLey({
            id: safeId,
            numero: safeId.toLowerCase().startsWith('ley') ? safeId.toUpperCase() : `Normativa N° ${safeId}`,
            nombre: `Expediente Regulatorio Ley ${safeId.replace(/[^0-9]/g, '') || safeId}`,
            alias: `Ley ${safeId.replace(/[^0-9]/g, '') || safeId}`,
            tipo: 'Ley de la República',
            origen: 'Catálogo Oficial',
            criticidad: 'Media',
            estado: 'en_tiempo',
            progreso: 0,
            fechaInicio: '2024-01-01',
            fechaTermino: '2026-12-31',
            organismo: 'Superintendencia / Ministerio Competente',
            resumen: 'Marco regulatorio y catálogo de obligaciones aplicables a la empresa en conformidad con la normativa legal vigente en Chile.',
            articulos: [
              {
                numero: 'Art. 1°',
                capitulo: 'Disposiciones Generales',
                titulo: 'Ámbito de Aplicación y Objeto',
                contenido: 'La presente normativa tiene por objeto regular el cumplimiento y las buenas prácticas operativas, garantizando la debida diligencia de la empresa.'
              },
              {
                numero: 'Art. 2°',
                capitulo: 'De las Obligaciones Principales',
                titulo: 'Deber de Supervisión y Control',
                contenido: 'Es responsabilidad de la organización implementar controles preventivos, medidas de seguridad y mantener evidencias documentadas.'
              }
            ],
            requisitos: [],
            evidencias: []
          });
        }

        // Población de Obligaciones
        if (backendData?.obligaciones && backendData.obligaciones.length > 0) {
          setObligaciones(backendData.obligaciones.map((o: any) => ({
            id: o.id,
            title: o.nombre,
            descripcion: o.descripcion,
            status: o.estado === 'cumplido' ? 'Cumplida' : (o.estado === 'parcial' ? 'Parcial' : 'Pendiente'),
            criticidad: o.criticidad === 'alta' ? 'Alta' : (o.criticidad === 'baja' ? 'Baja' : 'Media'),
            responsable: o.responsable || 'Equipo Legal & GRC',
            fechaVencimiento: o.fecha_vencimiento || '2024-12-31'
          })));
        } else if (bcnData?.requisitos && bcnData.requisitos.length > 0) {
          setObligaciones(bcnData.requisitos.map((r, idx) => ({
            id: r.id || `obl_${idx}`,
            title: r.titulo,
            descripcion: r.descripcion,
            status: r.estado === 'completado' ? 'Cumplida' : (r.estado === 'en_progreso' ? 'Parcial' : 'Pendiente'),
            criticidad: 'Alta',
            responsable: r.hitos?.[0]?.responsable || 'Equipo Legal & GRC',
            fechaVencimiento: r.hitos?.[0]?.fechaVencimiento || '2024-10-31',
            categoria: r.categoria
          })));
        } else {
          setObligaciones([
            { id: 101, title: 'Implementar Política de Seguridad y Privacidad', status: 'Cumplida', criticidad: 'Alta', responsable: 'Julian Sosa', fechaVencimiento: '2024-05-15', categoria: 'Gobernanza' },
            { id: 102, title: 'Protocolo de Prevención y Procedimiento Interno', status: 'Parcial', criticidad: 'Alta', responsable: 'Elena Rivas', fechaVencimiento: '2024-08-30', categoria: 'Prevención' },
            { id: 103, title: 'Canal de Denuncias y Registro de Incidentes', status: 'Pendiente', criticidad: 'Media', responsable: 'Felipe Sanchez', fechaVencimiento: '2024-11-20', categoria: 'Operación' },
            { id: 104, title: 'Capacitación Anual al 100% del Personal', status: 'Pendiente', criticidad: 'Alta', responsable: 'Elena Rivas', fechaVencimiento: '2024-12-15', categoria: 'Capacitación' }
          ]);
        }

        // Población de Controles
        if (backendData?.controles && backendData.controles.length > 0) {
          setControles(backendData.controles.map((c: any) => ({
            id: c.id,
            codigo: `CTRL-${c.id}`,
            nombre: c.nombre,
            descripcion: 'Revisión periódica de controles preventivos y de mitigación.',
            periodicidad: (c.periodicidad || 'Mensual') as any,
            estado: c.estado === 'activo' ? 'Activo' : 'Pendiente',
            ultimaEjecucion: c.ultima_ejecucion || '2024-06-15',
            proximaEjecucion: c.proxima_ejecucion || '2024-09-15',
            responsable: c.responsable || 'Oficial de Control'
          })));
        } else {
          setControles([
            {
              id: 'c1',
              codigo: 'CTRL-01',
              nombre: 'Control de Accesos Lógicos y Autenticación MFA',
              descripcion: 'Revisión de permisos de usuarios en sistemas core bajo principio de mínimo privilegio.',
              periodicidad: 'Mensual',
              estado: 'Activo',
              ultimaEjecucion: '2024-07-10',
              proximaEjecucion: '2024-08-10',
              responsable: 'Julian Sosa'
            },
            {
              id: 'c2',
              codigo: 'CTRL-02',
              nombre: 'Auditoría Trimestral de Bitácoras e Incidentes',
              descripcion: 'Inspección de logs de auditoría para detectar intentos de acceso no autorizados o anomalías.',
              periodicidad: 'Trimestral',
              estado: 'Pendiente',
              ultimaEjecucion: '2024-05-15',
              proximaEjecucion: '2024-08-15',
              responsable: 'Felipe Sanchez'
            },
            {
              id: 'c3',
              codigo: 'CTRL-03',
              nombre: 'Verificación de Cláusulas de Confidencialidad en Contratos',
              descripcion: 'Muestreo de anexos de contratos con colaboradores y proveedores estratégicos.',
              periodicidad: 'Semestral',
              estado: 'Activo',
              ultimaEjecucion: '2024-03-20',
              proximaEjecucion: '2024-09-20',
              responsable: 'Elena Rivas'
            }
          ]);
        }

        // Población de Evidencias
        if (bcnData?.evidencias && bcnData.evidencias.length > 0) {
          setEvidencias(bcnData.evidencias.map((ev, i) => ({
            id: ev.id || `ev_${i}`,
            nombre: ev.nombre,
            tipo: ev.tipo || 'PDF Document',
            tamano: ev.tamano || '1.8 MB',
            version: ev.version || '1.0',
            fechaSubida: ev.fechaSubida || '2024-05-10',
            fechaVencimiento: '2025-05-10',
            subidoPor: ev.subidoPor || 'Equipo Legal',
            estadoVigencia: 'Vigente'
          })));
        } else {
          setEvidencias([
            { id: 'ev1', nombre: 'Politica_Seguridad_Informacion_v2.0.pdf', tipo: 'PDF Document', tamano: '2.4 MB', version: '2.0', fechaSubida: '2024-06-15', fechaVencimiento: '2025-06-15', subidoPor: 'Julian Sosa', estadoVigencia: 'Vigente' },
            { id: 'ev2', nombre: 'Registro_Capacitacion_Lideres_Julio.pdf', tipo: 'PDF Document', tamano: '950 KB', version: '1.0', fechaSubida: '2024-07-02', fechaVencimiento: '2025-07-02', subidoPor: 'Elena Rivas', estadoVigencia: 'Vigente' },
            { id: 'ev3', nombre: 'Informe_Vulnerabilidades_Pentest_Q2.xlsx', tipo: 'Excel Sheet', tamano: '1.2 MB', version: '1.1', fechaSubida: '2024-04-10', fechaVencimiento: '2024-08-10', subidoPor: 'Felipe Sanchez', estadoVigencia: 'Por Vencer' }
          ]);
        }

        // Población de Riesgos
        setRiesgos([
          { id: 'r1', nombre: 'Multas y sanciones por falta de protocolos exigidos', categoria: 'Regulatorio / Legal', impacto: 4, probabilidad: 3, nivel: 12, estrategia: 'Mitigar', responsable: 'Elena Rivas' },
          { id: 'r2', nombre: 'Acceso no autorizado y filtración de datos sensibles', categoria: 'Ciberseguridad', impacto: 5, probabilidad: 2, nivel: 10, estrategia: 'Mitigar', responsable: 'Julian Sosa' },
          { id: 'r3', nombre: 'Daño reputacional por denuncias públicas no gestionadas', categoria: 'Operacional / Reputación', impacto: 4, probabilidad: 2, nivel: 8, estrategia: 'Mitigar', responsable: 'Felipe Sanchez' }
        ]);

        // Población de Incidentes
        setIncidentes([
          { id: 'inc1', nombre: 'Alerta de fuerza bruta en panel administrativo', tipo: 'Ciberseguridad', severidad: 'Media', estado: 'Cerrado', fecha: '2024-06-18' }
        ]);

        // Población de Auditorías
        setAuditorias([
          { id: 'aud1', nombre: 'Auditoría Interna Preventiva de Cumplimiento Q3', tipo: 'Interna', estado: 'En Progreso', fechaInicio: '2024-08-01', fechaFin: '2024-08-25', hallazgosCount: 2 },
          { id: 'aud2', nombre: 'Revisión Externa de Cumplimiento Normativo Anual', tipo: 'Externa', estado: 'Planificada', fechaInicio: '2024-11-10', fechaFin: '2024-11-20', hallazgosCount: 0 }
        ]);

        // Población de Planes de Acción
        setPlanesAccion([
          { id: 'pa1', tarea: 'Actualizar cláusulas de confidencialidad en teletrabajo', responsable: 'Elena Rivas', fechaLimite: '2024-09-15', estado: 'En Progreso' },
          { id: 'pa2', tarea: 'Completar simulacro de respuesta a incidentes de seguridad', responsable: 'Julian Sosa', fechaLimite: '2024-10-01', estado: 'Abierto' }
        ]);

      } catch (err) {
        console.error('Error cargando Ficha 360:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpediente();
  }, [normativaId]);

  // Cálculos dinámicos
  const totalObligaciones = obligaciones.length;
  const cumplidasCount = obligaciones.filter(o => o.status === 'Cumplida').length;
  const parcialesCount = obligaciones.filter(o => o.status === 'Parcial').length;
  const pendientesCount = obligaciones.filter(o => o.status === 'Pendiente').length;
  
  const scoreCalculado = totalObligaciones > 0
    ? Math.round(((cumplidasCount * 1.0) + (parcialesCount * 0.5)) / totalObligaciones * 100)
    : (ley?.progreso || 0);

  // Semáforo dinámico
  const semaforoColor = scoreCalculado >= 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                        scoreCalculado >= 50 ? 'text-amber-600 bg-amber-50 border-amber-200' :
                        'text-rose-600 bg-rose-50 border-rose-200';
  const semaforoDot = scoreCalculado >= 80 ? 'bg-emerald-500' : scoreCalculado >= 50 ? 'bg-amber-500' : 'bg-rose-500';
  const semaforoTexto = scoreCalculado >= 80 ? 'Riesgo Bajo' : scoreCalculado >= 50 ? 'Riesgo Medio' : 'Riesgo Alto';

  // Toggle de Obligación
  const handleToggleObligacion = (id: string | number) => {
    setObligaciones(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'Pendiente' ? 'Cumplida' : (item.status === 'Cumplida' ? 'Parcial' : 'Pendiente');
        if (typeof item.id === 'number') {
          const backendEstado = nextStatus === 'Cumplida' ? 'cumplido' : (nextStatus === 'Parcial' ? 'parcial' : 'pendiente');
          api.actualizarObligacion(item.id, { estado: backendEstado }).catch(() => {});
        }
        toast.success(`Obligación marcada como: ${nextStatus}`);
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  // Crear Obligación
  const handleCrearObligacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaObligacion.title.trim()) return;
    
    const nuevoItem: ObligacionItem = {
      id: Date.now(),
      title: nuevaObligacion.title,
      descripcion: nuevaObligacion.descripcion,
      status: 'Pendiente',
      criticidad: nuevaObligacion.criticidad,
      responsable: nuevaObligacion.responsable,
      fechaVencimiento: nuevaObligacion.fechaVencimiento
    };
    
    setObligaciones(prev => [...prev, nuevoItem]);
    setShowNuevaObligacionModal(false);
    setNuevaObligacion({
      title: '',
      descripcion: '',
      criticidad: 'Media',
      responsable: 'Equipo Legal & GRC',
      fechaVencimiento: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    });
    toast.success('Nueva obligación añadida al expediente.');
  };

  // Ejecutar Control
  const handleGuardarEjecucionControl = () => {
    if (!showEjecutarControlModal) return;
    
    const today = new Date().toISOString().split('T')[0];
    const nextDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    setControles(prev => prev.map(c => {
      if (c.id === showEjecutarControlModal.id) {
        return {
          ...c,
          estado: controlResultado === 'Inefectivo' ? 'Pendiente' : 'Ejecutado',
          ultimaEjecucion: today,
          proximaEjecucion: nextDate
        };
      }
      return c;
    }));

    toast.success(`Control "${showEjecutarControlModal.codigo}" ejecutado: ${controlResultado}`);
    setShowEjecutarControlModal(null);
    setControlNotas('');
  };

  // Subir Evidencia
  const handleSubirEvidencia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaEvidencia.nombre.trim()) return;

    const nueva: EvidenciaItem = {
      id: `ev_${Date.now()}`,
      nombre: nuevaEvidencia.nombre.endsWith('.pdf') ? nuevaEvidencia.nombre : `${nuevaEvidencia.nombre}.pdf`,
      tipo: `${nuevaEvidencia.tipo} Document`,
      tamano: '1.5 MB',
      version: nuevaEvidencia.version,
      fechaSubida: new Date().toISOString().split('T')[0],
      fechaVencimiento: nuevaEvidencia.fechaVencimiento,
      subidoPor: 'Usuario Actual (Admin)',
      estadoVigencia: 'Vigente'
    };

    setEvidencias(prev => [nueva, ...prev]);
    setShowSubirEvidenciaModal(false);
    setNuevaEvidencia({
      nombre: '',
      tipo: 'PDF',
      version: '1.0',
      fechaVencimiento: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
    });
    toast.success('Evidencia documental registrada exitosamente.');
  };

  // Reportar Incidente
  const handleGuardarIncidente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoIncidente.nombre.trim()) return;

    const nuevo: IncidenteItem = {
      id: Date.now(),
      nombre: nuevoIncidente.nombre,
      tipo: nuevoIncidente.tipo,
      severidad: nuevoIncidente.severidad,
      estado: 'Abierto',
      fecha: new Date().toISOString().split('T')[0]
    };

    setIncidentes(prev => [nuevo, ...prev]);
    setShowReportarIncidenteModal(false);
    setNuevoIncidente({ nombre: '', tipo: 'Seguridad / Filtración', severidad: 'Media' });
    toast.success('Incidente registrado y vinculado a la normativa.');
  };

  // Remediar Brecha
  const handleCrearPlanRemediacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remediarPlan.tarea.trim()) return;

    const nuevoPlan: PlanAccionItem = {
      id: Date.now(),
      tarea: remediarPlan.tarea,
      responsable: remediarPlan.responsable,
      fechaLimite: remediarPlan.fechaLimite,
      estado: 'Abierto'
    };

    setPlanesAccion(prev => [...prev, nuevoPlan]);
    setShowRemediarBrechaModal(null);
    setRemediarPlan({
      tarea: '',
      responsable: 'Julian Sosa (Legal)',
      fechaLimite: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
    });
    toast.success('Tarea de mitigación agregada al Plan de Acción.');
    setActiveSection('auditorias');
  };

  // Toggle estado Plan de Acción
  const handleTogglePlanAccion = (id: string | number) => {
    setPlanesAccion(prev => prev.map(p => {
      if (p.id === id) {
        const next = p.estado === 'Abierto' ? 'En Progreso' : (p.estado === 'En Progreso' ? 'Cerrado' : 'Abierto');
        return { ...p, estado: next };
      }
      return p;
    }));
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-600 font-medium">Cargando expediente 360° y matriz de cumplimiento...</p>
      </div>
    );
  }

  if (!ley) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        No se encontró la normativa solicitada.
      </div>
    );
  }

  const sections = [
    { id: 'resumen', label: '1. Resumen & Ficha', icon: <FileText className="w-4 h-4" /> },
    { id: 'obligaciones', label: `2. Obligaciones (${cumplidasCount}/${totalObligaciones})`, icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'brechas', label: `3. Mapa de Brechas (${pendientesCount + parcialesCount})`, icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'controles', label: `4. Controles (${controles.length})`, icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'evidencias', label: `5. Evidencias (${evidencias.length})`, icon: <UploadCloud className="w-4 h-4" /> },
    { id: 'riesgos', label: `6. Riesgos & Incidentes (${riesgos.length})`, icon: <Scale className="w-4 h-4" /> },
    { id: 'auditorias', label: `7. Auditorías & Plan (${auditorias.length})`, icon: <Search className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header Ficha 360 */}
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-0 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              title="Volver al catálogo"
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-indigo-100 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Ficha 360°
                </span>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full border border-slate-200">
                  {ley.numero || `Ley N° ${normativaId}`}
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${semaforoColor} flex items-center gap-1.5`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${semaforoDot}`}></span>
                  {semaforoTexto}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                {ley.nombre}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button 
              onClick={() => setShowInformeModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-600 hover:to-emerald-700 text-slate-950 font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer text-xs sm:text-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Generar Informe Ejecutivo</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 mt-6 pb-2 hide-scrollbar border-t border-slate-100 pt-4">
          {sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                activeSection === sec.id 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              {sec.icon} {sec.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 min-h-[520px]">
        
        {/* 1. Resumen General */}
        {activeSection === 'resumen' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" /> Resumen General & Ficha Técnica
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Visión consolidada del estado normativo, organismos involucrados y avance.</p>
              </div>
              <button 
                onClick={() => {
                  toast.success('Puntuación y métricas recalculadas en tiempo real.');
                }}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Recalcular Score
              </button>
            </div>

            {/* KPIs Principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estado Global</p>
                <div className="text-3xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-1">
                  <span className={scoreCalculado >= 80 ? 'text-emerald-600' : scoreCalculado >= 50 ? 'text-amber-600' : 'text-rose-600'}>
                    {scoreCalculado}%
                  </span>
                  <span className="text-xs font-semibold text-slate-400">cumplido</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${scoreCalculado >= 80 ? 'bg-emerald-500' : scoreCalculado >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${scoreCalculado}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Semáforo de Riesgo</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-3.5 h-3.5 rounded-full ${semaforoDot} animate-pulse`} />
                  <span className="text-lg font-bold text-slate-900">{semaforoTexto}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {pendientesCount} obligaciones por regularizar
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Responsable Líder</p>
                <div className="flex items-center gap-2 mt-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-bold text-slate-800">Equipo Legal & GRC</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Oficial de Cumplimiento Titular</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Organismo Fiscalizador</p>
                <div className="flex items-center gap-2 mt-2">
                  <Briefcase className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-bold text-slate-800 truncate" title={ley.organismo || 'Dirección del Trabajo'}>
                    {ley.organismo || 'Dirección del Trabajo'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Jurisdicción República de Chile</p>
              </div>
            </div>

            {/* Tarjetas de Metadatos y Resumen */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <BookOpenIcon className="w-4 h-4 text-indigo-600" />
                  Descripción Oficial y Alcance Normativo (BCN / Ley Chile)
                </h3>
                <div className="p-5 bg-slate-50 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-100 shadow-2xs">
                  {ley.resumen}
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Ficha de Trazabilidad
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Tipo de Documento</span>
                    <span className="font-semibold text-slate-800">{ley.tipo}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Fuente Oficial</span>
                    <span className="font-semibold text-slate-800">BCN Ley Chile</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Controles Activos</span>
                    <span className="font-bold text-indigo-600">{controles.filter(c => c.estado === 'Activo' || c.estado === 'Ejecutado').length} de {controles.length}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Evidencias Vigentes</span>
                    <span className="font-bold text-emerald-600">{evidencias.filter(e => e.estadoVigencia === 'Vigente').length} archivos</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Riesgos Identificados</span>
                    <span className="font-bold text-amber-600">{riesgos.length} registrados</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Obligaciones Asociadas (Checklist Interactivo) */}
        {activeSection === 'obligaciones' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" /> Checklist Interactivo de Obligaciones
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Haz clic en el indicador para cambiar el estado entre Cumplida, Parcial o Pendiente.
                </p>
              </div>
              
              <button
                onClick={() => setShowNuevaObligacionModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Nueva Obligación
              </button>
            </div>

            {/* Barra de progreso rápida */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-600">
                Progreso actual de obligaciones: <span className="text-indigo-600 font-bold">{cumplidasCount}</span> cumplidas, <span className="text-amber-600 font-bold">{parcialesCount}</span> parciales, <span className="text-rose-600 font-bold">{pendientesCount}</span> pendientes.
              </div>
              <div className="w-full sm:w-48 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${scoreCalculado}%` }}
                />
              </div>
            </div>

            {/* Lista de Obligaciones */}
            <div className="space-y-3">
              {obligaciones.map(obl => (
                <div 
                  key={obl.id} 
                  onClick={() => handleToggleObligacion(obl.id)}
                  className="p-4 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3.5">
                    <button 
                      type="button"
                      className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                        obl.status === 'Cumplida' ? 'bg-emerald-500 border-emerald-500 text-white' :
                        obl.status === 'Parcial' ? 'bg-amber-400 border-amber-400 text-white' :
                        'border-slate-300 bg-white group-hover:border-indigo-500'
                      }`}
                    >
                      {obl.status === 'Cumplida' && <Check className="w-4 h-4 stroke-[3]" />}
                      {obl.status === 'Parcial' && <span className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                          {obl.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          obl.criticidad === 'Alta' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          obl.criticidad === 'Media' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {obl.criticidad}
                        </span>
                      </div>
                      {obl.descripcion && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{obl.descripcion}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" /> {obl.responsable}
                        </span>
                        {obl.fechaVencimiento && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> Vence: {obl.fechaVencimiento}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      obl.status === 'Cumplida' ? 'bg-emerald-100 text-emerald-800' :
                      obl.status === 'Parcial' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {obl.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 3. Mapa de Brechas (GAP Analysis) */}
        {activeSection === 'brechas' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Mapa de Brechas (GAP Analysis)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Obligaciones pendientes y riesgos que requieren mitigación inmediata para evitar sanciones o no conformidades.
              </p>
            </div>

            {pendientesCount + parcialesCount === 0 ? (
              <div className="p-12 text-center border border-dashed border-emerald-200 rounded-2xl bg-emerald-50/40">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-emerald-800 text-base">¡Felicidades! No se detectaron brechas activas</h4>
                <p className="text-xs text-emerald-600 mt-1 max-w-md mx-auto">
                  Todas las obligaciones vinculadas a este cuerpo legal se encuentran al 100% de cumplimiento.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Hallazgo / Brecha Detectada</th>
                      <th className="px-4 py-3.5">Criticidad</th>
                      <th className="px-4 py-3.5">Estado Actual</th>
                      <th className="px-4 py-3.5">Responsable</th>
                      <th className="px-5 py-3.5 text-right">Acción Correctiva</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {obligaciones.filter(o => o.status !== 'Cumplida').map(brecha => (
                      <tr key={brecha.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{brecha.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{brecha.descripcion || 'Exigencia normativa sin respaldo de cumplimiento completo.'}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                            brecha.criticidad === 'Alta' ? 'bg-rose-100 text-rose-800' :
                            brecha.criticidad === 'Media' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {brecha.criticidad}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            brecha.status === 'Parcial' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {brecha.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs font-medium text-slate-700">
                          {brecha.responsable}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => {
                              setShowRemediarBrechaModal(brecha);
                              setRemediarPlan({
                                tarea: `Remediar brecha: ${brecha.title}`,
                                responsable: brecha.responsable || 'Julian Sosa (Legal)',
                                fechaLimite: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
                              });
                            }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Remediar Brecha
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* 4. Controles Asociados */}
        {activeSection === 'controles' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" /> Controles Periódicos de Mitigación
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mecanismos operativos para verificar que la ley se cumple de forma continua.
                </p>
              </div>

              <button
                onClick={() => {
                  const cod = `CTRL-0${controles.length + 1}`;
                  setControles(prev => [...prev, {
                    id: Date.now(),
                    codigo: cod,
                    nombre: 'Nuevo Control Operacional',
                    descripcion: 'Verificación periódica de cumplimiento de normativas vigentes.',
                    periodicidad: 'Mensual',
                    estado: 'Pendiente',
                    ultimaEjecucion: '-',
                    proximaEjecucion: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                    responsable: 'Oficial de Cumplimiento'
                  }]);
                  toast.success(`Nuevo control ${cod} añadido.`);
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Nuevo Control
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {controles.map(ctrl => (
                <div 
                  key={ctrl.id} 
                  className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-indigo-200 transition-all flex flex-col justify-between shadow-2xs group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md text-[10px] font-extrabold tracking-wider">
                        {ctrl.codigo}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                        {ctrl.periodicidad}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                      {ctrl.nombre}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {ctrl.descripcion}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Última ejecución: <strong>{ctrl.ultimaEjecucion}</strong></span>
                      <span>Próxima: <strong className="text-indigo-600">{ctrl.proximaEjecucion}</strong></span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Resp: {ctrl.responsable}
                      </span>
                      <button
                        onClick={() => setShowEjecutarControlModal(ctrl)}
                        className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <PlayCircle className="w-3.5 h-3.5" /> Ejecutar Control
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 5. Repositorio de Evidencias */}
        {activeSection === 'evidencias' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-indigo-600" /> Repositorio de Evidencias Documentales
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Documentos legales, actas, certificados y reglamentos que acreditan el cumplimiento.
                </p>
              </div>

              <button 
                onClick={() => setShowSubirEvidenciaModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
              >
                <UploadCloud className="w-4 h-4" /> Subir Evidencia
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
              {evidencias.map(ev => (
                <div key={ev.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{ev.nombre}</p>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                          v{ev.version}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {ev.tamano} • Subido por {ev.subidoPor} el {ev.fechaSubida}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      ev.estadoVigencia === 'Vigente' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      ev.estadoVigencia === 'Por Vencer' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {ev.estadoVigencia}
                    </span>

                    <button 
                      onClick={() => {
                        toast.success(`Descargando archivo: ${ev.nombre}`);
                      }}
                      title="Descargar documento"
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 6. Riesgos & Incidentes */}
        {activeSection === 'riesgos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-600" /> Matriz de Riesgos e Incidentes Asociados
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evaluación de impactos penales, regulatorios y operacionales vinculados a esta materia.
                </p>
              </div>

              <button
                onClick={() => setShowReportarIncidenteModal(true)}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <ShieldAlert className="w-4 h-4" /> Reportar Incidente
              </button>
            </div>

            {/* Matriz de Riesgos */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Riesgos Identificados (Impacto × Probabilidad)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {riesgos.map(r => (
                  <div key={r.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-400 uppercase">{r.categoria}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        r.nivel >= 12 ? 'bg-rose-100 text-rose-800' :
                        r.nivel >= 8 ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        Nivel {r.nivel}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{r.nombre}</h4>
                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                      <span>Estrategia: <strong>{r.estrategia}</strong></span>
                      <span>Resp: <strong>{r.responsable}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incidentes Registrados */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Historial de Incidentes Reportados</h3>
              {incidentes.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                  No hay incidentes abiertos ni infracciones reportadas para esta ley.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
                  {incidentes.map(inc => (
                    <div key={inc.id} className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{inc.nombre}</p>
                        <p className="text-xs text-slate-400">Tipo: {inc.tipo} • Fecha: {inc.fecha}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-100">
                          {inc.severidad}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                          {inc.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 7. Auditorías & Plan */}
        {activeSection === 'auditorias' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" /> Auditorías & Plan de Acción Correctivo
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Seguimiento de auditorías internas, externas y tareas correctivas con fecha límite.
              </p>
            </div>

            {/* Auditorías */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Auditorías Programadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auditorias.map(aud => (
                  <div key={aud.id} className="p-5 border border-l-4 border-l-indigo-600 border-slate-200 rounded-r-2xl bg-white shadow-2xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                          Auditoría {aud.tipo}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base mt-0.5">{aud.nombre}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md">
                        {aud.estado}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex justify-between items-center pt-2 border-t border-slate-100">
                      <span>Período: {aud.fechaInicio} al {aud.fechaFin}</span>
                      <span className="font-bold text-amber-600">{aud.hallazgosCount} hallazgos</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tareas del Plan de Acción */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tareas del Plan de Acción</h3>
                <button
                  onClick={() => {
                    const nuevaTarea: PlanAccionItem = {
                      id: Date.now(),
                      tarea: 'Nueva acción correctiva preventiva',
                      responsable: 'Julian Sosa',
                      fechaLimite: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
                      estado: 'Abierto'
                    };
                    setPlanesAccion(prev => [...prev, nuevaTarea]);
                    toast.success('Nueva tarea agregada al plan de acción.');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Tarea
                </button>
              </div>

              <div className="space-y-2.5">
                {planesAccion.map(pa => (
                  <div key={pa.id} className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 text-sm">{pa.tarea}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Resp: {pa.responsable}</span>
                        <span className="text-rose-500 font-semibold">Vence: {pa.fechaLimite}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePlanAccion(pa.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer self-start sm:self-auto ${
                        pa.estado === 'Cerrado' ? 'bg-emerald-100 text-emerald-800' :
                        pa.estado === 'En Progreso' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {pa.estado}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* ========================================================= */}
      {/* MODAL: INFORME EJECUTIVO 360° PARA DIRECTORIO            */}
      {/* ========================================================= */}
      {showInformeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200"
          >
            {/* Header Reporte */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                    Reporte Ejecutivo 360°
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Fecha de emisión: {new Date().toLocaleDateString('es-CL')}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{ley.nombre}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Expediente de Cumplimiento Regulatorio Oficial • {ley.numero} • BCN Ley Chile
                </p>
              </div>
              <button 
                onClick={() => setShowInformeModal(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumen para Directorio */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase">Cumplimiento Global</p>
                <div className="text-3xl font-extrabold text-indigo-600 mt-1">{scoreCalculado}%</div>
                <p className="text-xs text-slate-500 mt-1">{cumplidasCount} de {totalObligaciones} exigencias</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase">Nivel de Exposición</p>
                <div className="text-xl font-bold text-slate-900 mt-2 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${semaforoDot}`} />
                  {semaforoTexto}
                </div>
                <p className="text-xs text-slate-500 mt-1">{riesgos.length} riesgos monitoreados</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase">Sustento Documental</p>
                <div className="text-3xl font-extrabold text-emerald-600 mt-1">{evidencias.length}</div>
                <p className="text-xs text-slate-500 mt-1">Evidencias auditables vigentes</p>
              </div>
            </div>

            {/* Diagnóstico Ejecutivo */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Diagnóstico y Conclusiones del Auditor
              </h3>
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-slate-700 text-xs leading-relaxed space-y-2">
                <p>
                  <strong>Fortalezas:</strong> La empresa cuenta con {cumplidasCount} obligaciones totalmente regularizadas y controles periódicos implementados con periodicidad {controles[0]?.periodicidad || 'mensual'}.
                </p>
                <p>
                  <strong>Brechas Críticas (GAP):</strong> Se registran {pendientesCount} obligaciones en estado pendiente que requieren asignación presupuestaria y formalización antes del próximo cierre de auditoría.
                </p>
              </div>
            </div>

            {/* Recomendaciones Prioritarias */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Plan de Acción Recomendado para la Gerencia
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Subir actas de capacitación y reglamentos internos actualizados al Repositorio de Evidencias.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Completar la ejecución del control semestral antes de la fecha límite estipulada.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Programar una auditoría interna previa a eventuales fiscalizaciones de {ley.organismo || 'la Dirección del Trabajo'}.</span>
                </li>
              </ul>
            </div>

            {/* Footer con botones de acción */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowInformeModal(false)}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar Previsualización
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  toast.success('Abriendo diálogo de impresión / exportar a PDF...');
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimir / Guardar en PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EJECUTAR CONTROL                                   */}
      {/* ========================================================= */}
      {showEjecutarControlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  Ejecución de Control • {showEjecutarControlModal.codigo}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{showEjecutarControlModal.nombre}</h3>
              </div>
              <button onClick={() => setShowEjecutarControlModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Resultado de la Ejecución:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Efectivo', 'Con Observaciones', 'Inefectivo'] as const).map(res => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setControlResultado(res)}
                      className={`py-2 px-2 text-center rounded-xl font-bold border transition-all cursor-pointer text-xs ${
                        controlResultado === res 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notas / Observaciones del Auditor:</label>
                <textarea
                  rows={3}
                  value={controlNotas}
                  onChange={e => setControlNotas(e.target.value)}
                  placeholder="Escribe comentarios sobre las pruebas realizadas o desviaciones encontradas..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 leading-relaxed">
                Al registrar la ejecución, la fecha de próxima ejecución se reprogramará automáticamente según su periodicidad ({showEjecutarControlModal.periodicidad}).
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEjecutarControlModal(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardarEjecucionControl}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                Confirmar Ejecución
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SUBIR EVIDENCIA                                    */}
      {/* ========================================================= */}
      {showSubirEvidenciaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
          <motion.form 
            onSubmit={handleSubirEvidencia}
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-slate-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Subir Evidencia Documental</h3>
                <p className="text-xs text-slate-500 mt-0.5">Asocia un documento auditado a esta normativa.</p>
              </div>
              <button type="button" onClick={() => setShowSubirEvidenciaModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre o Título del Documento:</label>
                <input
                  type="text"
                  required
                  value={nuevaEvidencia.nombre}
                  onChange={e => setNuevaEvidencia({ ...nuevaEvidencia, nombre: e.target.value })}
                  placeholder="Ej: Acta_Comite_Paritario_Agosto_2024"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Archivo:</label>
                  <select
                    value={nuevaEvidencia.tipo}
                    onChange={e => setNuevaEvidencia({ ...nuevaEvidencia, tipo: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Excel">Excel / Hoja de Cálculo</option>
                    <option value="Word">Word / Documento</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Versión:</label>
                  <input
                    type="text"
                    value={nuevaEvidencia.version}
                    onChange={e => setNuevaEvidencia({ ...nuevaEvidencia, version: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fecha de Vencimiento / Renovación:</label>
                <input
                  type="date"
                  value={nuevaEvidencia.fechaVencimiento}
                  onChange={e => setNuevaEvidencia({ ...nuevaEvidencia, fechaVencimiento: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center cursor-pointer hover:bg-slate-50 transition-colors">
                <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-1" />
                <p className="font-bold text-slate-700">Arrastra tu archivo aquí o haz clic</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Soporta PDF, DOCX, XLSX hasta 25MB</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubirEvidenciaModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                Subir y Registrar
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NUEVA OBLIGACIÓN                                   */}
      {/* ========================================================= */}
      {showNuevaObligacionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
          <motion.form 
            onSubmit={handleCrearObligacion}
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-slate-200"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-slate-900">Agregar Nueva Obligación Legal</h3>
              <button type="button" onClick={() => setShowNuevaObligacionModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título de la Obligación:</label>
                <input
                  type="text"
                  required
                  value={nuevaObligacion.title}
                  onChange={e => setNuevaObligacion({ ...nuevaObligacion, title: e.target.value })}
                  placeholder="Ej: Registro de consentimiento de cookies"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción / Artículo BCN:</label>
                <textarea
                  rows={2}
                  value={nuevaObligacion.descripcion}
                  onChange={e => setNuevaObligacion({ ...nuevaObligacion, descripcion: e.target.value })}
                  placeholder="Detalles sobre lo que exige la ley..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Criticidad:</label>
                  <select
                    value={nuevaObligacion.criticidad}
                    onChange={e => setNuevaObligacion({ ...nuevaObligacion, criticidad: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Responsable Asignado:</label>
                  <input
                    type="text"
                    value={nuevaObligacion.responsable}
                    onChange={e => setNuevaObligacion({ ...nuevaObligacion, responsable: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNuevaObligacionModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                Añadir al Checklist
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REMEDIAR BRECHA / CREAR TAREA                      */}
      {/* ========================================================= */}
      {showRemediarBrechaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
          <motion.form 
            onSubmit={handleCrearPlanRemediacion}
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-slate-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                  Remediación de Brecha Normativa
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{showRemediarBrechaModal.title}</h3>
              </div>
              <button type="button" onClick={() => setShowRemediarBrechaModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Acción Correctiva a Asignar:</label>
                <input
                  type="text"
                  required
                  value={remediarPlan.tarea}
                  onChange={e => setRemediarPlan({ ...remediarPlan, tarea: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Responsable:</label>
                  <input
                    type="text"
                    value={remediarPlan.responsable}
                    onChange={e => setRemediarPlan({ ...remediarPlan, responsable: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha Compromiso:</label>
                  <input
                    type="date"
                    value={remediarPlan.fechaLimite}
                    onChange={e => setRemediarPlan({ ...remediarPlan, fechaLimite: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRemediarBrechaModal(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                Generar Tarea de Mitigación
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REPORTAR INCIDENTE                                 */}
      {/* ========================================================= */}
      {showReportarIncidenteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
          <motion.form 
            onSubmit={handleGuardarIncidente}
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-slate-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Reportar Incidente Vinculado</h3>
                <p className="text-xs text-slate-500 mt-0.5">Registra una no conformidad, denuncia o incidente.</p>
              </div>
              <button type="button" onClick={() => setShowReportarIncidenteModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título del Incidente:</label>
                <input
                  type="text"
                  required
                  value={nuevoIncidente.nombre}
                  onChange={e => setNuevoIncidente({ ...nuevoIncidente, nombre: e.target.value })}
                  placeholder="Ej: Falla de autenticación en servidor secundario"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo:</label>
                  <select
                    value={nuevoIncidente.tipo}
                    onChange={e => setNuevoIncidente({ ...nuevoIncidente, tipo: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Ciberseguridad / Acceso">Ciberseguridad / Acceso</option>
                    <option value="Laboral / Denuncia">Laboral / Denuncia</option>
                    <option value="Privacidad / Datos">Privacidad / Datos</option>
                    <option value="Falla Operacional">Falla Operacional</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Severidad:</label>
                  <select
                    value={nuevoIncidente.severidad}
                    onChange={e => setNuevoIncidente({ ...nuevoIncidente, severidad: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReportarIncidenteModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                Registrar Incidente
              </button>
            </div>
          </motion.form>
        </div>
      )}

    </div>
  );
};

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}
