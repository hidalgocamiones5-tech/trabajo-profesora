from typing import List
from django.db.models import Q
from ..models import Empresa, Normativa, ComplianceEmpresa

def cantidad_minima(rango_empleados: str) -> int:
    """Retorna la cantidad representativa mínima de trabajadores según el rango."""
    mapping = {
        'MICRO': 1,
        'PEQUENA': 10,
        'MEDIANA': 50,
        'GRANDE': 200,
    }
    return mapping.get(rango_empleados, 1)

def asignar_normativas_base(empresa: Empresa) -> List[ComplianceEmpresa]:
    """
    Motor de Matching de Reglas:
    Evalúa el perfil de la empresa contra el catálogo de leyes chilenas y asigna
    automáticamente las obligaciones aplicables en ComplianceEmpresa.
    """
    cant_empleados = cantidad_minima(empresa.rango_empleados)

    # 1. Filtro base de tamaño: la empresa debe superar o igualar el umbral mínimo de empleados
    criterios = Q(min_empleados__lte=cant_empleados)

    # 2. Regla Transversal o de Rubro
    regla_alcance = Q(es_transversal=True)
    if empresa.rubro:
        regla_alcance |= Q(rubro_aplicable=empresa.rubro)

    # 3. Reglas de Triggers Operacionales Activos
    reglas_triggers = Q()
    if empresa.maneja_datos_personales:
        reglas_triggers |= Q(requiere_datos_personales=True)
    if empresa.es_b2c_ecommerce:
        reglas_triggers |= Q(requiere_b2c=True)
    if empresa.procesa_pagos:
        reglas_triggers |= Q(requiere_procesa_pagos=True)
    if empresa.genera_residuos_rep:
        reglas_triggers |= Q(requiere_residuos=True)
    if empresa.tiene_trabajadores:
        reglas_triggers |= Q(requiere_trabajadores=True)

    # Combinamos: (Es transversal O Coincide Rubro O Activa un Trigger) Y Cumple umbral de empleados
    filtro_final = criterios & (regla_alcance | reglas_triggers)

    normativas_coincidentes = Normativa.objects.filter(filtro_final).distinct()

    compliances_asignados = []
    
    # Audit log entry
    log_entry = {
        'timestamp': None, # We can use django.utils.timezone.now().isoformat()
        'triggers_evaluados': {
            'cant_empleados': cant_empleados,
            'rubro': empresa.rubro,
            'maneja_datos_personales': empresa.maneja_datos_personales,
            'es_b2c_ecommerce': empresa.es_b2c_ecommerce,
            'procesa_pagos': empresa.procesa_pagos,
            'genera_residuos_rep': empresa.genera_residuos_rep,
            'tiene_trabajadores': empresa.tiene_trabajadores,
        },
        'leyes_asignadas_count': len(normativas_coincidentes)
    }

    from django.utils import timezone
    log_entry['timestamp'] = timezone.now().isoformat()

    if isinstance(empresa.log_matching, dict):
        empresa.log_matching['motor_reglas'] = log_entry
    else:
        empresa.log_matching = {'motor_reglas': log_entry}

    if len(normativas_coincidentes) == 0:
        empresa.estado_matching = 'ADVERTENCIA'
    else:
        # Solo lo marcamos como EXITOSO si estaba pendiente o ya era exitoso (no pisamos errores de IA aquí)
        if empresa.estado_matching in ['PENDIENTE', 'EXITOSO']:
            empresa.estado_matching = 'EXITOSO'
            
    empresa.save()

    from datetime import date, timedelta
    from ..models import TareaPendiente

    TAREAS_BASE_MAP = {
        '21643': [
            ("Implementar Protocolo de Prevención de Acoso y Violencia en el Trabajo", "Ley Karin", "alta", 7),
            ("Capacitación obligatoria al personal sobre prevención de acoso", "Ley Karin", "media", 14),
            ("Habilitar canal seguro de recepción de denuncias internas", "Ley Karin", "alta", 3),
        ],
        '19628': [
            ("Confección del Registro de Actividades de Tratamiento (RAT)", "Ley 19.628 / 21.719", "alta", 10),
            ("Actualización de Políticas de Privacidad y Consentimiento", "Ley 19.628 / 21.719", "media", 15),
            ("Procedimiento de Atención de Derechos ARCO", "Ley 19.628 / 21.719", "media", 20),
        ],
        '21719': [
            ("Auditoría de Bases de Datos y Medidas de Seguridad de la Información", "Ley 21.719", "alta", 12),
            ("Designación de Oficial de Protección de Datos (DPO)", "Ley 21.719", "media", 30),
        ],
        '21663': [
            ("Revisión del Plan de Continuidad Operacional y Ciberseguridad", "Ley 21.663", "alta", 5),
            ("Configurar procedimiento de notificación temprana a CSIRT / ANCI", "Ley 21.663", "critica", 2),
        ],
        '594': [
            ("Renovación de Miembros y Actas del Comité Paritario (CPHS)", "D.S. N° 594", "media", 25),
            ("Inspección de Extintores, Salidas de Emergencia y Botiquines", "D.S. N° 594", "media", 15),
        ],
        '20920': [
            ("Declaración de Envases y Embalajes en Ventanilla Única RETC", "Ley REP 20.920", "alta", 30),
        ],
        '19496': [
            ("Revisión de Cláusulas de Garantía Legal y Retracto Web", "Ley SERNAC 19.496", "media", 14),
        ],
        '21521': [
            ("Adecuación de Políticas de Resguardo y Finanzas Abiertas CMF", "Ley Fintec 21.521", "alta", 20),
        ],
        '20393': [
            ('Diagnóstico de riesgos penales Ley 21.595', 'Ley 21.595', 'alta', 10),
            ('Nombramiento y autonomía de Encargado de Prevención (DPO/CCO)', 'Ley 21.595', 'alta', 15)
        ]
    }

    for normativa in normativas_coincidentes:
        compliance, created = ComplianceEmpresa.objects.get_or_create(
            empresa=empresa,
            normativa=normativa,
            defaults={
                'estado': 'PRELIMINAR',
                'origen': 'MOTOR_REGLAS',
                'porcentaje_progreso': 0.0
            }
        )
        compliances_asignados.append(compliance)

        # Generar tareas iniciales vinculadas si no existen
        cod = str(normativa.codigo_bcn or '').replace('.', '')
        nombre_norm = str(normativa.nombre or '').replace('.', '')
        clave = next((k for k in TAREAS_BASE_MAP if k in cod or k in nombre_norm), None)
        
        if clave and not TareaPendiente.objects.filter(empresa=empresa, compliance_empresa=compliance).exists():
            for tit, asoc, prio, dias in TAREAS_BASE_MAP[clave]:
                TareaPendiente.objects.create(
                    empresa=empresa,
                    normativa=normativa,
                    compliance_empresa=compliance,
                    tarea=tit,
                    asociada_a=asoc,
                    responsable='Sin Asignar',
                    responsable_asignado='Sin Asignar',
                    prioridad=prio,
                    estado='pendiente',
                    fecha_vencimiento=date.today() + timedelta(days=dias)
                )
            compliance.recalcular_progreso()

    return compliances_asignados
