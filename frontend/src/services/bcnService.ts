export interface ArticuloBCN {
  numero: string;
  titulo?: string;
  contenido: string;
  capitulo?: string;
}

export interface RequisitoNormativo {
  id: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  estado: 'completado' | 'en_progreso' | 'por_hacer' | 'atrasada';
  hitos: {
    id: string;
    nombre: string;
    estado: 'completado' | 'en_progreso' | 'por_hacer' | 'atrasada';
    fechaVencimiento: string;
    responsable: string;
    avatarInitials: string;
  }[];
}

export interface DocumentoEvidencia {
  id: string;
  nombre: string;
  tipo: string;
  tamano: string;
  fechaSubida: string;
  subidoPor: string;
  version: string;
  url?: string;
}

export interface LeyOficialBCN {
  id: string;
  numero: string;
  nombre: string;
  alias: string;
  tipo: string;
  origen: string;
  criticidad: 'Alta' | 'Media' | 'Baja' | 'Crítica';
  estado: 'en_tiempo' | 'en_riesgo' | 'atrasada';
  progreso: number;
  fechaInicio: string;
  fechaTermino: string;
  organismo: string;
  resumen: string;
  articulos: ArticuloBCN[];
  requisitos: RequisitoNormativo[];
  evidencias: DocumentoEvidencia[];
}

export const CHILEAN_LAWS_DB: LeyOficialBCN[] = [
  {
    id: 'ley_21643',
    numero: 'Ley N° 21.643',
    nombre: 'Ley Karin - Modifica el Código del Trabajo en materia de prevención, investigación y sanción del acoso laboral, sexual y violencia en el trabajo',
    alias: 'Ley Karin',
    tipo: 'Ley de la República',
    origen: 'BCN Ley Chile',
    criticidad: 'Crítica',
    estado: 'en_tiempo',
    progreso: 75,
    fechaInicio: '2024-01-15',
    fechaTermino: '2026-08-01',
    organismo: 'Ministerio del Trabajo y Previsión Social / Dirección del Trabajo',
    resumen: 'Establece la obligación de contar con un protocolo de prevención del acoso laboral, sexual y la violencia en el ambiente de trabajo, garantizando espacios seguros e investigaciones con perspectiva de género.',
    articulos: [
      {
        numero: 'Art. 1°',
        capitulo: 'Título I: Disposiciones Generales',
        titulo: 'Principios rectores de la ley',
        contenido: 'Las relaciones laborales deberán siempre fundarse en un trato libre de todo tipo de violencia, ser compatibles con la dignidad de la persona y con perspectiva de género. Es obligación del empleador velar por un ambiente libre de acoso laboral, sexual y violencia en el trabajo.'
      },
      {
        numero: 'Art. 2°',
        capitulo: 'Título I: Disposiciones Generales',
        titulo: 'Definiciones de Acoso y Violencia',
        contenido: 'Se entiende por acoso sexual el que una persona realice de forma indebida, por cualquier medio, requerimientos de carácter sexual, no consentidos por quien los recibe y que amenacen o perjudiquen su situación laboral. Se entiende por acoso laboral toda conducta que constituya agresión u hostigamiento reiterado.'
      },
      {
        numero: 'Art. 154-bis',
        capitulo: 'Título II: De los Protocolos de Prevención',
        titulo: 'Obligación del Protocolo de Prevención',
        contenido: 'El Reglamento Interno de Orden, Higiene y Seguridad deberá incorporar el Protocolo de Prevención del Acoso Sexual, Laboral y la Violencia en el Trabajo elaborado de acuerdo a las directrices dictadas por la SUSESO y la Dirección del Trabajo.'
      },
      {
        numero: 'Art. 211-A',
        capitulo: 'Título III: Del Procedimiento de Investigación',
        titulo: 'Procedimiento formal de denuncia',
        contenido: 'Recibida la denuncia, el empleador deberá adoptar de inmediato medidas de resguardo respecto de los involucrados. La investigación podrá llevarse a cabo internamente o remitirse a la Inspección del Trabajo dentro del plazo de tres días hábiles.'
      }
    ],
    requisitos: [
      {
        id: 'req_karin_1',
        categoria: 'Prevención & Protocolos',
        titulo: 'Elaborar e Implementar el Protocolo de Prevención Ley Karin',
        descripcion: 'Diseño del protocolo ajustado a la matriz de riesgos de la empresa conforme norma SUSESO.',
        estado: 'completado',
        hitos: [
          { id: 'hit_1', nombre: 'Diagnóstico y mapa de riesgos psicosociales', estado: 'completado', fechaVencimiento: '2024-05-10', responsable: 'Julian Sosa', avatarInitials: 'JS' },
          { id: 'hit_2', nombre: 'Redacción y aprobación de Política Interna de Trato Digno', estado: 'completado', fechaVencimiento: '2024-06-15', responsable: 'Elena Rivas', avatarInitials: 'ER' }
        ]
      },
      {
        id: 'req_karin_2',
        categoria: 'Capacitación & Difusión',
        titulo: 'Capacitar al 100% de la dotación y líderes',
        descripcion: 'Realización de talleres obligatorios sobre prevención del acoso e investigación imparcial.',
        estado: 'en_progreso',
        hitos: [
          { id: 'hit_3', nombre: 'Capacitación a Jefaturas y Recursos Humanos', estado: 'completado', fechaVencimiento: '2024-07-01', responsable: 'Felipe Sanchez', avatarInitials: 'FS' },
          { id: 'hit_4', nombre: 'Difusión de canales de denuncia y flujogramas a colaboradores', estado: 'en_progreso', fechaVencimiento: '2024-09-30', responsable: 'Elena Rivas', avatarInitials: 'ER' }
        ]
      },
      {
        id: 'req_karin_3',
        categoria: 'Canal de Denuncias & Investigación',
        titulo: 'Habilitar Canal Seguro e Imparcial de Denuncias',
        descripcion: 'Sistema garantizado para la recepción, confidencialidad y medidas cautelares en denuncias.',
        estado: 'en_progreso',
        hitos: [
          { id: 'hit_5', nombre: 'Implementar canal digital cifrado de recepción', estado: 'completado', fechaVencimiento: '2024-06-01', responsable: 'Julian Sosa', avatarInitials: 'JS' },
          { id: 'hit_6', nombre: 'Designación y formación de la comisión investigadora interna', estado: 'por_hacer', fechaVencimiento: '2024-10-15', responsable: 'Felipe Sanchez', avatarInitials: 'FS' }
        ]
      }
    ],
    evidencias: [
      { id: 'ev_1', nombre: 'Protocolo_Prevencion_Ley_Karin_TechCorp_v2.pdf', tipo: 'PDF Document', tamano: '2.4 MB', fechaSubida: '2024-06-16', subidoPor: 'Julian Sosa', version: '2.0' },
      { id: 'ev_2', nombre: 'Acta_Capacitacion_Lideres_Julio2024.pdf', tipo: 'PDF Document', tamano: '1.1 MB', fechaSubida: '2024-07-02', subidoPor: 'Felipe Sanchez', version: '1.0' },
      { id: 'ev_3', nombre: 'Reglamento_Interno_RIOHS_Actualizado_2024.pdf', tipo: 'PDF Document', tamano: '4.8 MB', fechaSubida: '2024-05-20', subidoPor: 'Elena Rivas', version: '3.1' }
    ]
  },
  {
    id: 'ley_19628',
    numero: 'Ley N° 19.628 / Ley N° 21.719',
    nombre: 'Ley sobre Protección de la Vida Privada y Protección de Datos Personales',
    alias: 'Ley 19.628 Datos Personales',
    tipo: 'Ley de la República',
    origen: 'BCN Ley Chile',
    criticidad: 'Crítica',
    estado: 'en_riesgo',
    progreso: 50,
    fechaInicio: '2023-03-01',
    fechaTermino: '2026-11-30',
    organismo: 'Agencia de Protección de Datos Personales / Ministerio de Economía',
    resumen: 'Regula el tratamiento de datos personales en registros o bancos de datos por organismos públicos o privados, estableciendo los derechos ARCO y modelos de cumplimiento regulatorio.',
    articulos: [
      {
        numero: 'Art. 1°',
        capitulo: 'Título I: Principios Generales',
        titulo: 'Tratamiento de datos personales',
        contenido: 'El tratamiento de los datos de carácter personal sólo podrá efectuarse cuando esta ley u otras disposiciones legales lo autoricen o el titular consienta expresamente en ello.'
      },
      {
        numero: 'Art. 4°',
        capitulo: 'Título I: Principios Generales',
        titulo: 'Consentimiento informado del titular',
        contenido: 'El consentimiento debe ser previo, informado, inequívoco y otorgado por escrito o mediante un medio equivalente que acredite su emisión.'
      },
      {
        numero: 'Art. 12',
        capitulo: 'Título II: Derechos de los Titulares (ARCO)',
        titulo: 'Derecho de Acceso, Rectificación, Cancelación y Oposición',
        contenido: 'Toda persona tiene derecho a solicitar información sobre los datos relativos a su persona, su procedencia y destinatario, el propósito del almacenamiento y la individualización de las personas a quienes sus datos son transmitidos de manera habitual.'
      }
    ],
    requisitos: [
      {
        id: 'req_dp_1',
        categoria: 'Registro de Actividades (RAT)',
        titulo: 'Elaborar el Registro de Actividades de Tratamiento (RAT)',
        descripcion: 'Inventario exhaustivo de bases de datos, finalidades y bases de licitud.',
        estado: 'completado',
        hitos: [
          { id: 'hit_dp1', nombre: 'Mapeo de bases de datos de RRHH y Clientes', estado: 'completado', fechaVencimiento: '2024-03-15', responsable: 'Elena Rivas', avatarInitials: 'ER' }
        ]
      },
      {
        id: 'req_dp_2',
        categoria: 'Políticas de Privacidad',
        titulo: 'Actualizar Términos y Políticas de Privacidad B2C/B2B',
        descripcion: 'Adecuación de cláusulas contractuales y avisos de privacidad web.',
        estado: 'en_progreso',
        hitos: [
          { id: 'hit_dp2', nombre: 'Aviso de privacidad web y cookies', estado: 'en_progreso', fechaVencimiento: '2024-09-01', responsable: 'Felipe Sanchez', avatarInitials: 'FS' }
        ]
      }
    ],
    evidencias: [
      { id: 'ev_dp1', nombre: 'Inventario_RAT_TechCorp_2024.xlsx', tipo: 'Spreadsheet', tamano: '850 KB', fechaSubida: '2024-03-20', subidoPor: 'Elena Rivas', version: '1.2' }
    ]
  },
  {
    id: 'ley_20920',
    numero: 'Ley N° 20.920',
    nombre: 'Ley Marco para la Gestión de Residuos, Responsabilidad Extendida del Productor y Fomento al Reciclaje',
    alias: 'Ley REP 20.920',
    tipo: 'Ley de la República',
    origen: 'BCN Ley Chile',
    criticidad: 'Media',
    estado: 'en_tiempo',
    progreso: 100,
    fechaInicio: '2023-01-01',
    fechaTermino: '2026-12-31',
    organismo: 'Ministerio del Medio Ambiente (MMA)',
    resumen: 'Establece regímenes de responsabilidad extendida del productor para productos prioritarios como envases, embalajes, aparatos eléctricos y electrónicos.',
    articulos: [
      {
        numero: 'Art. 9°',
        capitulo: 'Título II: Responsabilidad Extendida del Productor',
        titulo: 'Obligaciones de los productores',
        contenido: 'Los productores de productos prioritarios son responsables de la organización y financiamiento de la gestión de los residuos derivados de los productos que comercializan en el mercado nacional.'
      }
    ],
    requisitos: [
      {
        id: 'req_rep_1',
        categoria: 'Declaración MMA',
        titulo: 'Declaración Anual de Envases y Embalajes en RETC',
        descripcion: 'Reporte oficial de toneladas introducidas al mercado nacional.',
        estado: 'completado',
        hitos: [
          { id: 'hit_rep1', nombre: 'Carga de datos de producción e importaciones en RETC', estado: 'completado', fechaVencimiento: '2024-05-30', responsable: 'Julian Sosa', avatarInitials: 'JS' }
        ]
      }
    ],
    evidencias: [
      { id: 'ev_rep1', nombre: 'Comprobante_Declaracion_RETC_MMA_2024.pdf', tipo: 'PDF Document', tamano: '920 KB', fechaSubida: '2024-05-31', subidoPor: 'Julian Sosa', version: '1.0' }
    ]
  },
  {
    id: 'ley_19496',
    numero: 'Ley N° 19.496',
    nombre: 'Ley sobre Protección de los Derechos de los Consumidores',
    alias: 'Ley SERNAC 19.496',
    tipo: 'Ley de la República',
    origen: 'BCN Ley Chile',
    criticidad: 'Media',
    estado: 'en_tiempo',
    progreso: 80,
    fechaInicio: '2024-02-01',
    fechaTermino: '2026-10-30',
    organismo: 'Servicio Nacional del Consumidor (SERNAC)',
    resumen: 'Establece normas sobre protección de los derechos de los consumidores, comercio electrónico, garantías legales y deberes de los proveedores.',
    articulos: [
      {
        numero: 'Art. 3°',
        capitulo: 'Título I: Derechos del Consumidor',
        titulo: 'Derecho a información veraz y oportuna',
        contenido: 'Son derechos básicos del consumidor la elección libre del bien o servicio y el derecho a una información veraz y oportuna sobre los bienes y servicios ofrecidos.'
      }
    ],
    requisitos: [
      {
        id: 'req_sernac_1',
        categoria: 'Comercio Electrónico',
        titulo: 'Ajuste de Botón de Arrepentimiento y Garantía Legal de 6 Meses',
        descripcion: 'Términos e interfaces digitales transparentes para devoluciones y despachos.',
        estado: 'completado',
        hitos: [
          { id: 'hit_ser1', nombre: 'Implementación de flujo de reclamos y devoluciones', estado: 'completado', fechaVencimiento: '2024-04-10', responsable: 'Felipe Sanchez', avatarInitials: 'FS' }
        ]
      }
    ],
    evidencias: [
      { id: 'ev_ser1', nombre: 'Auditoria_UX_Legales_ECommerce_SERNAC.pdf', tipo: 'PDF Document', tamano: '3.2 MB', fechaSubida: '2024-04-12', subidoPor: 'Felipe Sanchez', version: '1.0' }
    ]
  },
  {
    id: 'ley_21521',
    numero: 'Ley N° 21.521',
    nombre: 'Ley para Promover la Innovación y Tecnología Financiera (Ley Fintec)',
    alias: 'Ley Fintec 21.521',
    tipo: 'Ley de la República',
    origen: 'BCN Ley Chile',
    criticidad: 'Alta',
    estado: 'en_tiempo',
    progreso: 65,
    fechaInicio: '2024-01-01',
    fechaTermino: '2026-12-31',
    organismo: 'Comisión para el Mercado Financiero (CMF)',
    resumen: 'Marco regulatorio para plataformas de financiamiento colectivo, custodia de activos, intermediación y Sistema de Finanzas Abiertas (Open Finance).',
    articulos: [
      {
        numero: 'Art. 5°',
        capitulo: 'Título II: Servicios Fintec',
        titulo: 'Registro de Prestadores de Servicios Financieros',
        contenido: 'Los prestadores de servicios Fintec deberán inscribirse en el Registro de Prestadores de Servicios Financieros que llevará la CMF.'
      }
    ],
    requisitos: [
      {
        id: 'req_fin_1',
        categoria: 'Acreditación CMF',
        titulo: 'Inscripción en Registro CMF & Sistema de Gestión de Riesgo Operacional',
        descripcion: 'Manual de gobernanza de datos y seguridad de la información para Open Finance.',
        estado: 'en_progreso',
        hitos: [
          { id: 'hit_fin1', nombre: 'Plan de continuidad de negocio y ciberseguridad', estado: 'en_progreso', fechaVencimiento: '2024-11-15', responsable: 'Julian Sosa', avatarInitials: 'JS' }
        ]
      }
    ],
    evidencias: [
      { id: 'ev_fin1', nombre: 'Manual_Riesgo_Operacional_CMF.pdf', tipo: 'PDF Document', tamano: '2.9 MB', fechaSubida: '2024-06-01', subidoPor: 'Julian Sosa', version: '1.0' }
    ]
  },
  {
    id: 'ley_21663',
    numero: 'Ley N° 21.663',
    nombre: 'Ley Marco de Ciberseguridad e Infraestructura Crítica de la Información',
    alias: 'Ley Ciberseguridad 21.663',
    tipo: 'Ley de la República',
    origen: 'BCN Ley Chile',
    criticidad: 'Crítica',
    estado: 'en_tiempo',
    progreso: 85,
    fechaInicio: '2024-03-26',
    fechaTermino: '2026-09-30',
    organismo: 'Agencia Nacional de Ciberseguridad (ANCI) / CSIRT Nacional',
    resumen: 'Establece los principios y exigencias mínimas para la gestión del riesgo de ciberseguridad y el reporte de incidentes en operadores de importancia vital.',
    articulos: [
      {
        numero: 'Art. 7°',
        capitulo: 'Título III: De las Obligaciones de los Operadores de Importancia Vital',
        titulo: 'Notificación obligatoria de incidentes',
        contenido: 'Los operadores deberán notificar al CSIRT Nacional todo incidente de ciberseguridad con efecto significativo dentro del plazo máximo de 3 horas de haberlo detectado.'
      }
    ],
    requisitos: [
      {
        id: 'req_ciber_1',
        categoria: 'SGSI & Reportes CSIRT',
        titulo: 'Plan de Respuesta a Incidentes & Reporte a CSIRT',
        descripcion: 'Flujograma de escalamiento automático e integraciones SIEM/SOC.',
        estado: 'completado',
        hitos: [
          { id: 'hit_c1', nombre: 'Simulacro anual de ransomware e incidentes', estado: 'completado', fechaVencimiento: '2024-05-15', responsable: 'Julian Sosa', avatarInitials: 'JS' }
        ]
      }
    ],
    evidencias: [
      { id: 'ev_c1', nombre: 'Reporte_Simulacro_CSIRT_Ciberseguridad.pdf', tipo: 'PDF Document', tamano: '5.1 MB', fechaSubida: '2024-05-16', subidoPor: 'Julian Sosa', version: '1.0' }
    ]
  },
  {
    id: 'ley_20393',
    numero: 'Ley N° 20.393 / Ley N° 21.595',
    nombre: 'Ley sobre Responsabilidad Penal de las Personas Jurídicas y Sistematización de Delitos Económicos y Medioambientales',
    alias: 'Ley 20.393 / 21.595 Delitos Económicos',
    tipo: 'Ley de la República',
    origen: 'BCN Ley Chile',
    criticidad: 'Crítica',
    estado: 'en_tiempo',
    progreso: 90,
    fechaInicio: '2023-08-01',
    fechaTermino: '2026-12-31',
    organismo: 'Ministerio de Justicia y Derechos Humanos / Fiscalía de Chile',
    resumen: 'Regula la responsabilidad penal de las empresas para la prevención de cohecho, lavado de activos, receptación, financiamiento del terrorismo y delitos ambientales.',
    articulos: [
      {
        numero: 'Art. 4°',
        capitulo: 'Título II: Modelo de Prevención de Delitos (MPD)',
        titulo: 'Modelo de Prevención de Delitos',
        contenido: 'La persona jurídica podrá adoptar un Modelo de Prevención de Delitos que considere la identificación de actividades o procesos expuestos a riesgo, la existencia de protocolos y la designación de un Encargado de Prevención (OIC).'
      }
    ],
    requisitos: [
      {
        id: 'req_mpd_1',
        categoria: 'Modelo de Prevención de Delitos',
        titulo: 'Actualización de Matriz de Riesgos Penales y Código de Ética',
        descripcion: 'Inclusión de nuevos tipos penales ambientales y económicos Ley 21.595.',
        estado: 'completado',
        hitos: [
          { id: 'hit_m1', nombre: 'Certificación del Modelo de Prevención por Entidad Acreditada', estado: 'completado', fechaVencimiento: '2024-02-28', responsable: 'Elena Rivas', avatarInitials: 'ER' }
        ]
      }
    ],
    evidencias: [
      { id: 'ev_m1', nombre: 'Certificado_MPD_Ley20393_TechCorp.pdf', tipo: 'PDF Document', tamano: '1.8 MB', fechaSubida: '2024-03-01', subidoPor: 'Elena Rivas', version: '2.0' }
    ]
  },
  {
    id: 'codigo_trabajo_ds594',
    numero: 'Código del Trabajo / D.S. N° 594',
    nombre: 'Reglamento sobre Condiciones Sanitarias y Ambientales Básicas en los Lugares de Trabajo',
    alias: 'Código del Trabajo & D.S. 594',
    tipo: 'Norma Sanitaria / Laboral',
    origen: 'BCN Ley Chile',
    criticidad: 'Media',
    estado: 'en_tiempo',
    progreso: 100,
    fechaInicio: '2023-01-01',
    fechaTermino: '2026-12-31',
    organismo: 'Ministerio de Salud (MINSAL) / Seremi de Salud / Dirección del Trabajo',
    resumen: 'Establece las condiciones sanitarias y ambientales que debe cumplir todo lugar de trabajo para la protección de la salud y la seguridad de los trabajadores.',
    articulos: [
      {
        numero: 'Art. 3°',
        capitulo: 'Título I: Disposiciones Generales',
        titulo: 'Obligaciones del empleador en higiene y seguridad',
        contenido: 'La empresa está obligada a mantener en los lugares de trabajo las condiciones sanitarias y ambientales necesarias para proteger la vida y la salud de los trabajadores que en ellos se desempeñan.'
      }
    ],
    requisitos: [
      {
        id: 'req_ds594_1',
        categoria: 'Comité Paritario & Salud Ocupacional',
        titulo: 'Constitución del Comité Paritario de Higiene y Seguridad (CPHS)',
        descripcion: 'Reuniones mensuales, actas e inspección de condiciones ambientales en oficinas.',
        estado: 'completado',
        hitos: [
          { id: 'hit_ds1', nombre: 'Renovación de miembros CPHS 2024-2026', estado: 'completado', fechaVencimiento: '2024-01-10', responsable: 'Felipe Sanchez', avatarInitials: 'FS' }
        ]
      }
    ],
    evidencias: [
      { id: 'ev_ds1', nombre: 'Acta_Constitucion_CPHS_2024.pdf', tipo: 'PDF Document', tamano: '1.4 MB', fechaSubida: '2024-01-12', subidoPor: 'Felipe Sanchez', version: '1.0' }
    ]
  }
];

export const bcnService = {
  getLeyes: async (): Promise<LeyOficialBCN[]> => {
    return CHILEAN_LAWS_DB;
  },

  getLeyPorId: async (id: string): Promise<LeyOficialBCN | undefined> => {
    return CHILEAN_LAWS_DB.find(l => l.id === id || l.numero.toLowerCase().includes(id.toLowerCase()) || l.alias.toLowerCase().includes(id.toLowerCase()));
  },

  buscarLeyesBCN: async (query: string): Promise<LeyOficialBCN[]> => {
    const q = query.toLowerCase().trim();
    if (!q) return CHILEAN_LAWS_DB;
    return CHILEAN_LAWS_DB.filter(l =>
      l.nombre.toLowerCase().includes(q) ||
      l.alias.toLowerCase().includes(q) ||
      l.numero.toLowerCase().includes(q) ||
      l.resumen.toLowerCase().includes(q)
    );
  }
};
