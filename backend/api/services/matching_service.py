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

    return compliances_asignados
