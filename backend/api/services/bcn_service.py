import logging
from typing import Dict, Any, List, Tuple
from django.db import transaction
from django.db.models import Q
from ..models import Normativa, Empresa, ComplianceEmpresa, Obligacion, TareaPendiente, Area, Responsable

logger = logging.getLogger(__name__)

# Catálogo canónico curado de Leyes Chilenas para Compliance GRC
CATALOGO_CURADO_BCN: List[Dict[str, Any]] = [
    {
        "numero_oficial": "LEY-21643",
        "codigo_bcn": "21643",
        "nombre": "Ley Karin (Ley N° 21.643 - Prevención Acoso Laboral y Violencia)",
        "titulo": "Ley N° 21.643: Ley Karin",
        "materia": "LABORAL",
        "criterio_aplicabilidad": "UNIVERSAL",
        "trigger_asociado": "tiene_trabajadores",
        "min_empleados": 1,
        "criticidad": "Alta",
        "es_transversal": True,
        "requiere_trabajadores": True,
        "resumen": "Modifica el Código del Trabajo en materia de prevención, investigación y sanción del acoso laboral, sexual y violencia en el trabajo. Exige protocolos de prevención y canales de denuncia confidenciales.",
        "descripcion": "Obligatoria para todo empleador en Chile. Exige protocolos preventivos, evaluación de riesgos psicosociales y procedimientos sancionatorios de acoso y violencia laboral.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["21643", "1200164", "L-21643", "LEY-21643", "Ley Karin"]
    },
    {
        "numero_oficial": "LEY-19628",
        "codigo_bcn": "19628",
        "nombre": "Ley de Protección de la Vida Privada y Datos Personales (Ley N° 19.628 / Ley 21.719)",
        "titulo": "Ley N° 19.628 / 21.719: Protección de Datos Personales",
        "materia": "PRIVACIDAD",
        "criterio_aplicabilidad": "TRIGGER",
        "trigger_asociado": "maneja_datos_personales",
        "min_empleados": 0,
        "criticidad": "Alta",
        "es_transversal": True,
        "requiere_datos_personales": True,
        "resumen": "Regula el tratamiento lícito de datos personales, principios de consentimiento, seguridad de la información y cumplimiento de derechos ARCO de titulares.",
        "descripcion": "Aplica a cualquier entidad pública o privada que recopile, almacene o procese datos personales de clientes, colaboradores o usuarios.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["19628", "29631", "L-19628", "LEY-21719", "21719", "Protección Datos Personales"]
    },
    {
        "numero_oficial": "LEY-20393",
        "codigo_bcn": "20393",
        "nombre": "Ley de Responsabilidad Penal de las Personas Jurídicas y Delitos Económicos (Ley N° 20.393)",
        "titulo": "Ley N° 20.393 / 21.595: Responsabilidad Penal PJ",
        "materia": "PENAL_COMPLIANCE",
        "criterio_aplicabilidad": "UNIVERSAL",
        "trigger_asociado": None,
        "min_empleados": 1,
        "criticidad": "Alta",
        "es_transversal": True,
        "resumen": "Establece la responsabilidad penal de personas jurídicas en delitos de cohecho, lavado de activos, financiamiento del terrorismo, corrupción y delitos económicos (Ley 21.595). Exige un Modelo de Prevención del Delito (MPD).",
        "descripcion": "Exige la designación de un Encargado de Prevención, matriz de riesgos penales y canal de denuncias.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["20393", "LEY-20393", "Responsabilidad Penal PJ", "Delitos Económicos"]
    },
    {
        "numero_oficial": "DS-594",
        "codigo_bcn": "16774",
        "nombre": "Decreto Supremo N° 594: Condiciones Sanitarias y Ambientales Básicas en Lugares de Trabajo",
        "titulo": "Decreto Supremo N° 594: Higiene y Seguridad Laboral",
        "materia": "LABORAL",
        "criterio_aplicabilidad": "UNIVERSAL",
        "trigger_asociado": "tiene_trabajadores",
        "min_empleados": 1,
        "criticidad": "Alta",
        "es_transversal": True,
        "requiere_trabajadores": True,
        "resumen": "Fija las condiciones sanitarias y ambientales mínimas que debe cumplir todo lugar de trabajo físico o faena (agua potable, servicios higiénicos, extintores, ergonomía, EPP).",
        "descripcion": "Fiscalizado por la SEREMI de Salud y la Dirección del Trabajo.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Decreto Supremo",
        "aliases": ["16774", "DS-594", "594", "Condiciones Sanitarias"]
    },
    {
        "numero_oficial": "LEY-21459",
        "codigo_bcn": "21459",
        "nombre": "Ley de Delitos Informáticos y Ciberseguridad (Ley N° 21.459)",
        "titulo": "Ley N° 21.459: Delitos Informáticos",
        "materia": "PRIVACIDAD",
        "criterio_aplicabilidad": "UNIVERSAL",
        "trigger_asociado": None,
        "min_empleados": 1,
        "criticidad": "Alta",
        "es_transversal": True,
        "resumen": "Tipifica delitos de acceso ilícito, interceptación indebida, ataque a la integridad de sistemas informáticos, falsificación y fraude informático.",
        "descripcion": "Alineada con el Convenio de Budapest para persecución de cibercrimen en empresas.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["21459", "1176766", "Delitos Informáticos"]
    },
    {
        "numero_oficial": "LEY-21663",
        "codigo_bcn": "1202511",
        "nombre": "Ley Marco de Ciberseguridad e Infraestructura Crítica (Ley N° 21.663)",
        "titulo": "Ley N° 21.663: Marco de Ciberseguridad",
        "materia": "PRIVACIDAD",
        "criterio_aplicabilidad": "TRIGGER",
        "trigger_asociado": None,
        "min_empleados": 0,
        "criticidad": "Alta",
        "es_transversal": True,
        "resumen": "Crea la Agencia Nacional de Ciberseguridad (ANCI) y establece obligaciones de gestión de riesgos y reporte oportuno de incidentes operacionales y ciberataques.",
        "descripcion": "Aplica a prestadores de servicios esenciales y operadores de importancia vital.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["1202511", "21663", "Marco Ciberseguridad"]
    },
    {
        "numero_oficial": "LEY-19496",
        "codigo_bcn": "61438",
        "nombre": "Ley de Protección de los Derechos de los Consumidores (Ley N° 19.496 / SERNAC)",
        "titulo": "Ley N° 19.496: Derechos del Consumidor",
        "materia": "CONSUMO",
        "criterio_aplicabilidad": "TRIGGER",
        "trigger_asociado": "es_b2c_ecommerce",
        "min_empleados": 0,
        "criticidad": "Media",
        "es_transversal": False,
        "requiere_b2c": True,
        "resumen": "Normas sobre protección de los derechos de los consumidores, contratos de adhesión, derecho a retracto, comercio electrónico y garantía legal.",
        "descripcion": "Obligatoria para empresas que comercializan bienes o servicios directamente a clientes finales o plataformas B2C.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["61438", "19496", "1165682", "Derechos del Consumidor", "SERNAC"]
    },
    {
        "numero_oficial": "LEY-20920",
        "codigo_bcn": "20920",
        "nombre": "Ley REP: Responsabilidad Extendida del Productor y Fomento al Reciclaje (Ley N° 20.920)",
        "titulo": "Ley N° 20.920: Ley REP",
        "materia": "AMBIENTAL",
        "criterio_aplicabilidad": "TRIGGER",
        "trigger_asociado": "genera_residuos_rep",
        "min_empleados": 0,
        "criticidad": "Media",
        "es_transversal": False,
        "requiere_residuos": True,
        "resumen": "Obliga a fabricantes e importadores de productos prioritarios (envases, embalajes, neumáticos, baterías, aparatos eléctricos) a organizar y financiar la gestión de sus residuos.",
        "descripcion": "Fiscalizado por la Superintendencia del Medio Ambiente (SMA).",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["20920", "1090894", "Ley REP", "Reciclaje"]
    },
    {
        "numero_oficial": "LEY-21521",
        "codigo_bcn": "21521",
        "nombre": "Ley Fintec: Mercado Financiero y Finanzas Abiertas (Ley N° 21.521)",
        "titulo": "Ley N° 21.521: Ley Fintec",
        "materia": "FINANCIERO",
        "criterio_aplicabilidad": "TRIGGER",
        "trigger_asociado": "procesa_pagos",
        "min_empleados": 0,
        "criticidad": "Media",
        "es_transversal": False,
        "requiere_procesa_pagos": True,
        "resumen": "Regula a las plataformas de financiamiento colectivo, sistemas de pagos abiertos, asesoría financiera automatizada e intermediación de instrumentos financieros ante la CMF.",
        "descripcion": "Establece estándares de resiliencia operativa y protección de fondos.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["21521", "1186782", "Ley Fintec"]
    },
    {
        "numero_oficial": "LEY-19913",
        "codigo_bcn": "219504",
        "nombre": "Ley UAF: Prevención del Lavado de Activos y Financiamiento del Terrorismo (Ley N° 19.913)",
        "titulo": "Ley N° 19.913: Prevención Lavado de Activos (UAF)",
        "materia": "PENAL_COMPLIANCE",
        "criterio_aplicabilidad": "TRIGGER",
        "trigger_asociado": "procesa_pagos",
        "min_empleados": 0,
        "criticidad": "Alta",
        "es_transversal": False,
        "resumen": "Crea la Unidad de Análisis Financiero (UAF) y obliga a sujetos reportantes a implementar sistemas de debida diligencia de clientes y reporte de operaciones sospechosas.",
        "descripcion": "Aplica a entidades financieras, inmobiliarias, automotoras, casas de cambio y pasarelas de pago.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["219504", "19913", "UAF"]
    },
    {
        "numero_oficial": "LEY-21015",
        "codigo_bcn": "21015",
        "nombre": "Ley de Inclusión Laboral para Personas con Discapacidad (Ley N° 21.015)",
        "titulo": "Ley N° 21.015: Inclusión Laboral",
        "materia": "LABORAL",
        "criterio_aplicabilidad": "DOTACION",
        "trigger_asociado": None,
        "min_empleados": 100,
        "criticidad": "Alta",
        "es_transversal": True,
        "requiere_trabajadores": True,
        "resumen": "Exige que empresas con 100 o más trabajadores contraten al menos el 1% de personas con discapacidad o asignatarias de una pensión de invalidez.",
        "descripcion": "Exige registro formal de contratos en la Dirección del Trabajo y medidas de cumplimiento alternativas si proceden.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["21015", "Inclusión Laboral"]
    },
    {
        "numero_oficial": "LEY-20123",
        "codigo_bcn": "20123",
        "nombre": "Ley de Subcontratación y Empresas de Servicios Transitorios (Ley N° 20.123)",
        "titulo": "Ley N° 20.123: Subcontratación Laboral",
        "materia": "LABORAL",
        "criterio_aplicabilidad": "UNIVERSAL",
        "trigger_asociado": "tiene_trabajadores",
        "min_empleados": 1,
        "criticidad": "Alta",
        "es_transversal": True,
        "requiere_trabajadores": True,
        "resumen": "Establece la responsabilidad solidaria y subsidiaria de la empresa mandante respecto de obligaciones laborales y previsionales de sus contratistas.",
        "descripcion": "Exige fiscalización documental (F30 / F30-1) y deber de protección y seguridad en faena.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["20123", "Subcontratación"]
    },
    {
        "numero_oficial": "LEY-21220",
        "codigo_bcn": "21220",
        "nombre": "Ley de Trabajo a Distancia y Teletrabajo (Ley N° 21.220)",
        "titulo": "Ley N° 21.220: Teletrabajo",
        "materia": "LABORAL",
        "criterio_aplicabilidad": "UNIVERSAL",
        "trigger_asociado": "tiene_trabajadores",
        "min_empleados": 1,
        "criticidad": "Media",
        "es_transversal": True,
        "requiere_trabajadores": True,
        "resumen": "Regula el pacto de teletrabajo, provisión de equipos de trabajo y asignaciones de conectividad, derecho a desconexión digital de 12 horas y condiciones de seguridad en el hogar.",
        "descripcion": "Obligatoria para empresas que cuenten con modalidad remota o híbrida.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["21220", "Teletrabajo"]
    },
    {
        "numero_oficial": "DL-211",
        "codigo_bcn": "211",
        "nombre": "Decreto Ley N° 211: Defensa de la Libre Competencia",
        "titulo": "DL N° 211: Libre Competencia",
        "materia": "CORPORATIVO",
        "criterio_aplicabilidad": "UNIVERSAL",
        "trigger_asociado": None,
        "min_empleados": 1,
        "criticidad": "Alta",
        "es_transversal": True,
        "resumen": "Sanciona los acuerdos colusorios, abuso de posición dominante y conductas que impidan o restrinjan la libre competencia en los mercados.",
        "descripcion": "Fiscalizado por la Fiscalía Nacional Económica (FNE) y el Tribunal de Defensa de la Libre Competencia (TDLC).",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Decreto Ley",
        "aliases": ["211", "DL-211", "Libre Competencia"]
    },
    {
        "numero_oficial": "LEY-18046",
        "codigo_bcn": "18046",
        "nombre": "Ley sobre Sociedades Anónimas (Ley N° 18.046)",
        "titulo": "Ley N° 18.046: Sociedades Anónimas",
        "materia": "CORPORATIVO",
        "criterio_aplicabilidad": "UNIVERSAL",
        "trigger_asociado": None,
        "min_empleados": 0,
        "criticidad": "Media",
        "es_transversal": True,
        "resumen": "Regula la administración, directorios, juntas de accionistas, deberes fiduciarios de los administradores y régimen de responsabilidad societaria.",
        "descripcion": "Estándar de referencia en gobierno corporativo.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["18046", "Sociedades Anónimas"]
    },
    {
        "numero_oficial": "LEY-19799",
        "codigo_bcn": "19799",
        "nombre": "Ley sobre Documentos Electrónicos, Firma Electrónica y Certificación (Ley N° 19.799)",
        "titulo": "Ley N° 19.799: Firma Electrónica",
        "materia": "CORPORATIVO",
        "criterio_aplicabilidad": "UNIVERSAL",
        "trigger_asociado": None,
        "min_empleados": 0,
        "criticidad": "Baja",
        "es_transversal": True,
        "resumen": "Otorga validez jurídica y probatoria a los actos y contratos celebrados por medios electrónicos y suscritos con firma electrónica simple o avanzada.",
        "descripcion": "Marco fundamental para la transformación digital empresarial.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["19799", "Firma Electrónica"]
    },
    {
        "numero_oficial": "LEY-20720",
        "codigo_bcn": "20720",
        "nombre": "Ley de Reorganización y Liquidación de Empresas y Personas (Ley N° 20.720)",
        "titulo": "Ley N° 20.720: Insolvencia y Reorganización",
        "materia": "CORPORATIVO",
        "criterio_aplicabilidad": "UNIVERSAL",
        "trigger_asociado": None,
        "min_empleados": 0,
        "criticidad": "Media",
        "es_transversal": True,
        "resumen": "Procedimientos concursales de renegociación, reorganización judicial y liquidación para empresas en situación de insolvencia financiera.",
        "descripcion": "Supervisado por la Superintendencia de Insolvencia y Reemprendimiento (SUPERIR).",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["20720", "Insolvencia", "Reorganización"]
    },
    {
        "numero_oficial": "ISO-27001",
        "codigo_bcn": "ISO-27001",
        "nombre": "Norma Técnica NCh-ISO 27001: Seguridad de la Información y Ciberseguridad",
        "titulo": "ISO/IEC 27001: Sistema de Gestión de Seguridad",
        "materia": "PRIVACIDAD",
        "criterio_aplicabilidad": "UNIVERSAL",
        "trigger_asociado": None,
        "min_empleados": 0,
        "criticidad": "Media",
        "es_transversal": True,
        "resumen": "Estándar internacional para establecer, implementar, mantener y mejorar continuamente un Sistema de Gestión de la Seguridad de la Información (SGSI).",
        "descripcion": "Mejor práctica global para la protección de activos de información empresarial.",
        "origen": "Estándar Internacional / INN",
        "tipo": "Norma Técnica",
        "aliases": ["ISO-27001", "NCh-27001", "ISO 27001", "27001"]
    },
    {
        "numero_oficial": "LEY-20584",
        "codigo_bcn": "20584",
        "nombre": "Ley de Derechos y Deberes de las Personas en Salud (Ley N° 20.584)",
        "titulo": "Ley N° 20.584: Derechos y Deberes del Paciente",
        "materia": "PRIVACIDAD",
        "criterio_aplicabilidad": "SECTORIAL",
        "trigger_asociado": None,
        "min_empleados": 0,
        "criticidad": "Alta",
        "es_transversal": False,
        "rubro_aplicable": "SALUD",
        "resumen": "Regula los derechos y deberes que tienen las personas en relación con acciones vinculadas a su atención en salud y confidencialidad médica.",
        "descripcion": "Estándar obligatorio para clínicas, centros médicos y prestadores de salud.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["20584", "1039348", "Derechos y Deberes del Paciente"]
    },
    {
        "numero_oficial": "LEY-21236",
        "codigo_bcn": "21236",
        "nombre": "Ley de Portabilidad Financiera (Ley N° 21.236)",
        "titulo": "Ley N° 21.236: Portabilidad Financiera",
        "materia": "FINANCIERO",
        "criterio_aplicabilidad": "SECTORIAL",
        "trigger_asociado": None,
        "min_empleados": 0,
        "criticidad": "Media",
        "es_transversal": False,
        "rubro_aplicable": "FINANCIERO",
        "resumen": "Facilita la portabilidad de productos y servicios financieros entre distintas instituciones supervisadas por la CMF.",
        "descripcion": "Aplica a entidades bancarias, cooperativas e instituciones crediticias.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["21236", "Portabilidad Financiera"]
    },
    {
        "numero_oficial": "LEY-19039",
        "codigo_bcn": "19039",
        "nombre": "Ley de Propiedad Industrial y Marcas (Ley N° 19.039)",
        "titulo": "Ley N° 19.039: Propiedad Industrial",
        "materia": "CORPORATIVO",
        "criterio_aplicabilidad": "UNIVERSAL",
        "trigger_asociado": None,
        "min_empleados": 0,
        "criticidad": "Media",
        "es_transversal": True,
        "resumen": "Establece las normas aplicables a los privilegios industriales, patentes de invención, modelos de utilidad, marcas comerciales y secretos comerciales ante INAPI.",
        "descripcion": "Protección de activos intangibles y propiedad intelectual empresarial.",
        "origen": "BCN / datos.gob.cl",
        "tipo": "Ley",
        "aliases": ["19039", "Propiedad Industrial", "Marcas"]
    }
]


def fusionar_normativas_duplicadas() -> Tuple[int, int]:
    """
    Deduplicador inteligente:
    Identifica registros redundantes o duplicados en la base de datos (por ejemplo,
    múltiples registros para Ley Karin con códigos '1200164', 'L-21643', '21643')
    y los consolida en una única entidad canónica con su numero_oficial respectivo.
    Reasigna todas las relaciones de ComplianceEmpresa, Tareas y Obligaciones.
    """
    fusionadas = 0
    eliminadas = 0

    for item in CATALOGO_CURADO_BCN:
        canon_num = item["numero_oficial"]
        aliases = item.get("aliases", []) + [item["codigo_bcn"], canon_num]
        
        # Buscar normativas existentes que coincidan con los alias
        q_filter = Q(numero_oficial=canon_num)
        for a in aliases:
            if a:
                q_filter |= Q(codigo_bcn=a) | Q(nombre__icontains=a)
        
        candidatas = list(Normativa.objects.filter(q_filter).distinct())
        
        if not candidatas:
            continue
        
        # Seleccionar o definir la canónica
        canon_obj = None
        for c in candidatas:
            if c.numero_oficial == canon_num:
                canon_obj = c
                break
        
        if not canon_obj:
            canon_obj = candidatas[0]
            canon_obj.numero_oficial = canon_num

        # Actualizar datos canónicos en el objeto principal
        canon_obj.nombre = item["nombre"]
        canon_obj.titulo = item["titulo"]
        canon_obj.materia = item["materia"]
        canon_obj.criterio_aplicabilidad = item["criterio_aplicabilidad"]
        canon_obj.trigger_asociado = item.get("trigger_asociado")
        canon_obj.codigo_bcn = item["codigo_bcn"]
        canon_obj.resumen = item["resumen"]
        canon_obj.descripcion = item.get("descripcion", canon_obj.descripcion)
        canon_obj.criticidad = item["criticidad"]
        canon_obj.es_transversal = item["es_transversal"]
        canon_obj.min_empleados = item.get("min_empleados", 0)
        canon_obj.tipo = item.get("tipo", "Ley")
        canon_obj.origen = item.get("origen", "BCN / datos.gob.cl")
        canon_obj.requiere_trabajadores = item.get("requiere_trabajadores", False)
        canon_obj.requiere_datos_personales = item.get("requiere_datos_personales", False)
        canon_obj.requiere_b2c = item.get("requiere_b2c", False)
        canon_obj.requiere_procesa_pagos = item.get("requiere_procesa_pagos", False)
        canon_obj.requiere_residuos = item.get("requiere_residuos", False)
        canon_obj.estado = "en_tiempo"
        canon_obj.save()

        # Reasignar relaciones de los duplicados hacia canon_obj y eliminarlos
        for duplicado in candidatas:
            if duplicado.id == canon_obj.id:
                continue

            # 1. ComplianceEmpresa
            for comp in duplicado.complianceempresa_set.all():
                # Si la empresa ya tiene compliance con el canon_obj, evitar error de unique_together
                existente = ComplianceEmpresa.objects.filter(empresa=comp.empresa, normativa=canon_obj).first()
                if not existente:
                    comp.normativa = canon_obj
                    comp.save()
                else:
                    # Si ya existe, conservar el que tenga mayor progreso o esté validado
                    if comp.porcentaje_progreso > existente.porcentaje_progreso:
                        existente.porcentaje_progreso = comp.porcentaje_progreso
                        existente.estado = comp.estado
                        existente.save()
                    comp.delete()

            # 2. Tareas
            if hasattr(duplicado, 'tareas'):
                duplicado.tareas.all().update(normativa=canon_obj)

            # 3. Obligaciones
            if hasattr(duplicado, 'obligaciones'):
                duplicado.obligaciones.all().update(normativa=canon_obj)

            # 4. Controles
            if hasattr(duplicado, 'controles'):
                duplicado.controles.all().update(normativa=canon_obj)

            # Eliminar duplicado consolidado
            duplicado.delete()
            eliminadas += 1
            fusionadas += 1

    return fusionadas, eliminadas


def sincronizar_catalogo_grc_curado() -> Tuple[int, int]:
    """
    Sincroniza y pobla el catálogo de leyes con el dataset curado de BCN / datos.gob.
    Asegura que no se generen duplicados utilizando `numero_oficial` como clave canónica.
    """
    # Primero fusionar duplicados previos si los hubiese
    fusionar_normativas_duplicadas()

    creadas = 0
    actualizadas = 0

    for item in CATALOGO_CURADO_BCN:
        canon_num = item["numero_oficial"]
        
        defaults_data = {
            "codigo_bcn": item["codigo_bcn"],
            "nombre": item["nombre"],
            "titulo": item["titulo"],
            "materia": item["materia"],
            "criterio_aplicabilidad": item["criterio_aplicabilidad"],
            "trigger_asociado": item.get("trigger_asociado"),
            "resumen": item["resumen"],
            "descripcion": item.get("descripcion", ""),
            "criticidad": item["criticidad"],
            "es_transversal": item["es_transversal"],
            "min_empleados": item.get("min_empleados", 0),
            "tipo": item.get("tipo", "Ley"),
            "origen": item.get("origen", "BCN / datos.gob.cl"),
            "requiere_trabajadores": item.get("requiere_trabajadores", False),
            "requiere_datos_personales": item.get("requiere_datos_personales", False),
            "requiere_b2c": item.get("requiere_b2c", False),
            "requiere_procesa_pagos": item.get("requiere_procesa_pagos", False),
            "requiere_residuos": item.get("requiere_residuos", False),
            "estado": "en_tiempo"
        }

        obj, created = Normativa.objects.update_or_create(
            numero_oficial=canon_num,
            defaults=defaults_data
        )

        if created:
            creadas += 1
        else:
            actualizadas += 1

        # Generar las obligaciones y tareas de cumplimiento para esta normativa
        generar_tareas_para_normativa(obj)

    return creadas, actualizadas


# Catálogo maestro de Tareas y Obligaciones Operacionales por Normativa
TAREAS_POR_NORMATIVA: Dict[str, List[Dict[str, Any]]] = {
    "LEY-21643": [
        {"tarea": "Elaborar Protocolo de Prevención de Acoso Laboral, Sexual y Violencia en el Trabajo", "prioridad": "critica", "area": "Recursos Humanos"},
        {"tarea": "Implementar y difundir Canal de Denuncias Confidencial y Seguro", "prioridad": "alta", "area": "Legal & Compliance"},
        {"tarea": "Capacitar a directivos, jefaturas y colaboradores en estándares Ley Karin", "prioridad": "alta", "area": "Recursos Humanos"},
        {"tarea": "Actualizar Reglamento Interno (RIOHS) con el nuevo procedimiento de investigación y sanción", "prioridad": "media", "area": "Legal & Compliance"},
    ],
    "LEY-19628": [
        {"tarea": "Redactar y publicar Política Integral de Privacidad y Protección de Datos Personales", "prioridad": "critica", "area": "Legal & Compliance"},
        {"tarea": "Confeccionar el Registro de Actividades de Tratamiento (RAT) de la empresa", "prioridad": "alta", "area": "Legal & Compliance"},
        {"tarea": "Implementar procedimiento y canal para respuesta a Derechos ARCO", "prioridad": "alta", "area": "Operaciones"},
        {"tarea": "Suscribir Acuerdos de Tratamiento de Datos (DPA) con proveedores que procesen información", "prioridad": "media", "area": "Tecnología"},
    ],
    "LEY-20393": [
        {"tarea": "Designar formalmente al Encargado de Prevención del Delito (EPD)", "prioridad": "critica", "area": "Gobierno Corporativo"},
        {"tarea": "Elaborar y actualizar Matriz de Riesgos Penales y Delitos Económicos (Ley 21.595)", "prioridad": "alta", "area": "Riesgos & Auditoría"},
        {"tarea": "Publicar y difundir el Código de Ética y Conducta Empresarial", "prioridad": "alta", "area": "Recursos Humanos"},
        {"tarea": "Implementar protocolo de Due Diligence para proveedores críticos y contrapartes comerciales", "prioridad": "media", "area": "Finanzas & Compras"},
    ],
    "DS-594": [
        {"tarea": "Actualizar el Reglamento Interno de Orden, Higiene y Seguridad (RIOHS)", "prioridad": "alta", "area": "Prevención de Riesgos"},
        {"tarea": "Inspección periódica y mantención de extintores, vías de evacuación y señalética", "prioridad": "alta", "area": "Prevención de Riesgos"},
        {"tarea": "Entrega y registro firmado de Elementos de Protección Personal (EPP)", "prioridad": "media", "area": "Operaciones"},
        {"tarea": "Verificar condiciones de agua potable, ventilación y servicios higiénicos en faena", "prioridad": "media", "area": "Prevención de Riesgos"},
    ],
    "LEY-21459": [
        {"tarea": "Implementar política de contraseñas robustas, control de accesos y doble factor (2FA)", "prioridad": "alta", "area": "Tecnología"},
        {"tarea": "Configurar y verificar respaldos inmutables periódicos de bases de datos críticas", "prioridad": "alta", "area": "Tecnología"},
        {"tarea": "Establecer protocolo de detección y respuesta inmediata ante accesos no autorizados o ransomware", "prioridad": "critica", "area": "Tecnología"},
    ],
    "LEY-21663": [
        {"tarea": "Designar al Oficial / Punto de Contacto de Enlace ante la Agencia Nacional de Ciberseguridad", "prioridad": "alta", "area": "Tecnología"},
        {"tarea": "Elaborar Plan de Respuesta a Incidentes de Ciberseguridad y continuidad operacional", "prioridad": "critica", "area": "Tecnología"},
        {"tarea": "Inventariar y clasificar activos de información y sistemas informáticos críticos", "prioridad": "media", "area": "Tecnología"},
    ],
    "LEY-19496": [
        {"tarea": "Revisar y publicar Términos y Condiciones, políticas de garantía legal y derecho a retracto", "prioridad": "alta", "area": "Legal & Compliance"},
        {"tarea": "Asegurar que los precios exhibidos en plataformas y web incluyan IVA y costos finales", "prioridad": "alta", "area": "Comercial / E-commerce"},
        {"tarea": "Implementar canal y protocolo de atención ágil a reclamos de consumidores (SERNAC)", "prioridad": "media", "area": "Servicio al Cliente"},
    ],
    "LEY-20920": [
        {"tarea": "Declarar anualmente volúmenes de productos prioritarios en el portal RETC/SMA", "prioridad": "critica", "area": "Medioambiente & Operaciones"},
        {"tarea": "Adherir a un Sistema de Gestión de Residuos (Individual o Colectivo - GRANSIC)", "prioridad": "alta", "area": "Medioambiente & Operaciones"},
    ],
    "LEY-21521": [
        {"tarea": "Implementar políticas de gestión de riesgos operacionales y tecnológicos bajo norma CMF", "prioridad": "alta", "area": "Riesgos & Finanzas"},
        {"tarea": "Definir mecanismos de seguridad para APIs y protocolos de consentimiento de datos abiertos", "prioridad": "alta", "area": "Tecnología"},
    ],
    "LEY-19913": [
        {"tarea": "Designar y registrar Oficial de Cumplimiento ante la Unidad de Análisis Financiero (UAF)", "prioridad": "critica", "area": "Legal & Compliance"},
        {"tarea": "Implementar políticas de Debida Diligencia y Conozca a su Cliente (KYC)", "prioridad": "alta", "area": "Operaciones & Finanzas"},
        {"tarea": "Establecer matriz de señales de alerta para Reporte de Operaciones Sospechosas (ROS)", "prioridad": "alta", "area": "Riesgos & Auditoría"},
    ],
    "LEY-21015": [
        {"tarea": "Realizar cómputo anual de dotación y verificar cumplimiento de cuota del 1% de inclusión", "prioridad": "alta", "area": "Recursos Humanos"},
        {"tarea": "Registrar contratos de personas con discapacidad en la plataforma de la Dirección del Trabajo", "prioridad": "media", "area": "Recursos Humanos"},
    ],
    "LEY-20123": [
        {"tarea": "Exigir y auditar mensualmente los Certificados F30 y F30-1 de empresas contratistas", "prioridad": "alta", "area": "Recursos Humanos / Compras"},
        {"tarea": "Supervisar el cumplimiento de estándares de seguridad y salud en faenas de subcontratistas", "prioridad": "media", "area": "Prevención de Riesgos"},
    ],
    "LEY-21220": [
        {"tarea": "Pactar y firmar Anexos de Contrato de Teletrabajo con colaboradores a distancia", "prioridad": "media", "area": "Recursos Humanos"},
        {"tarea": "Garantizar y monitorear el respeto efectivo al Derecho de Desconexión Digital (12 horas)", "prioridad": "media", "area": "Recursos Humanos"},
    ],
    "DL-211": [
        {"tarea": "Capacitar a ejecutivos comerciales en prevención de prácticas colusorias y libre competencia", "prioridad": "alta", "area": "Legal & Compliance"},
        {"tarea": "Auditar políticas de precios mayoristas, descuentos y acuerdos con distribuidores", "prioridad": "media", "area": "Comercial & Legal"},
    ],
    "LEY-18046": [
        {"tarea": "Planificar, convocar y celebrar la Junta Ordinaria Anual de Accionistas", "prioridad": "alta", "area": "Gobierno Corporativo"},
        {"tarea": "Mantener al día el Libro de Actas de Directorio y Registro de Accionistas", "prioridad": "media", "area": "Legal & Compliance"},
    ],
    "LEY-19799": [
        {"tarea": "Implementar prestador acreditado de Firma Electrónica Avanzada (FEA) para contratos clave", "prioridad": "media", "area": "Tecnología & Legal"},
        {"tarea": "Establecer repositorio centralizado seguro para preservación de documentos firmados", "prioridad": "baja", "area": "Operaciones"},
    ],
    "LEY-20720": [
        {"tarea": "Monitorear trimestralmente ratios de solvencia, liquidez y endeudamiento financiero", "prioridad": "media", "area": "Finanzas"},
    ],
    "ISO-27001": [
        {"tarea": "Realizar Evaluación de Riesgos de Seguridad de la Información (SGSI)", "prioridad": "alta", "area": "Tecnología & Seguridad"},
        {"tarea": "Elaborar y actualizar la Declaración de Aplicabilidad (SoA) del Anexo A", "prioridad": "alta", "area": "Tecnología & Seguridad"},
        {"tarea": "Ejecutar auditoría interna anual del Sistema de Gestión de Seguridad de la Información", "prioridad": "media", "area": "Auditoría Interna"},
    ],
    "LEY-20584": [
        {"tarea": "Asegurar protocolos de confidencialidad estricta y acceso controlado a fichas clínicas", "prioridad": "alta", "area": "Operaciones de Salud"},
        {"tarea": "Implementar formatos y procesos de Consentimiento Informado previo a atenciones", "prioridad": "alta", "area": "Operaciones de Salud"},
    ],
    "LEY-21236": [
        {"tarea": "Habilitar formato estandarizado y oportuno de Certificados de Liquidación de Deudas", "prioridad": "media", "area": "Operaciones Financieras"},
    ],
    "LEY-19039": [
        {"tarea": "Verificar vigencia, custodia y renovación de marcas comerciales registradas ante INAPI", "prioridad": "media", "area": "Legal & Compliance"},
    ]
}


def generar_tareas_para_normativa(normativa: Normativa) -> Tuple[int, int]:
    """
    Genera las Obligaciones estructurales de la normativa y las TareasPendientes
    asociadas para todas las empresas asignadas en ComplianceEmpresa.
    """
    canon_num = normativa.numero_oficial or ""
    tareas_data = TAREAS_POR_NORMATIVA.get(canon_num, [])
    
    if not tareas_data:
        # Fallback genérico para normativas sin plantilla específica
        tareas_data = [
            {"tarea": f"Evaluar impacto y brecha operacional de cumplimiento para {normativa.nombre[:60]}", "prioridad": "alta", "area": "Legal & Compliance"},
            {"tarea": f"Implementar controles y evidencias requeridas por {normativa.nombre[:60]}", "prioridad": "media", "area": "Operaciones"},
            {"tarea": f"Capacitar al personal responsable sobre las obligaciones de {normativa.nombre[:60]}", "prioridad": "media", "area": "Recursos Humanos"}
        ]

    obligaciones_creadas = 0
    tareas_creadas = 0

    # 1. Crear Obligaciones base de la Normativa
    for t in tareas_data:
        area_obj = None
        if t.get("area"):
            area_obj = Area.objects.filter(nombre__icontains=t["area"]).first()

        ob, created = Obligacion.objects.get_or_create(
            normativa=normativa,
            nombre=t["tarea"],
            defaults={
                "descripcion": f"Obligación formal derivada de {normativa.nombre}",
                "criticidad": "alta" if t.get("prioridad") in ["alta", "critica"] else "media",
                "estado": "pendiente",
                "area": area_obj
            }
        )
        if created:
            obligaciones_creadas += 1

        # 2. Asignar TareasPendientes a cada empresa que tenga la normativa en ComplianceEmpresa
        compliances = ComplianceEmpresa.objects.filter(normativa=normativa)
        for comp in compliances:
            tp, tp_created = TareaPendiente.objects.get_or_create(
                empresa=comp.empresa,
                normativa=normativa,
                tarea=t["tarea"],
                defaults={
                    "compliance_empresa": comp,
                    "obligacion": ob,
                    "responsable": comp.responsable or "Oficial de Cumplimiento",
                    "responsable_asignado": comp.responsable or "Oficial de Cumplimiento",
                    "asociada_a": normativa.numero_oficial or normativa.nombre[:40],
                    "prioridad": t.get("prioridad", "media"),
                    "estado": "pendiente"
                }
            )
            if tp_created:
                tareas_creadas += 1

        # Recalcular score de las empresas vinculadas
        for comp in compliances:
            comp.recalcular_progreso()

    return obligaciones_creadas, tareas_creadas


def autoasignar_normativa_a_empresas(normativa: Normativa) -> int:
    """
    Evalúa la normativa contra todas las empresas registradas y la asigna
    en ComplianceEmpresa a aquellas que cumplan con sus criterios de aplicabilidad,
    generando automáticamente sus tareas correspondientes.
    """
    empresas = Empresa.objects.all()
    asignadas = 0

    for emp in empresas:
        aplica = False

        # Criterio Universal
        if normativa.criterio_aplicabilidad == 'UNIVERSAL':
            if normativa.requiere_trabajadores and not emp.tiene_trabajadores:
                aplica = False
            else:
                aplica = True

        # Criterio por Dotación
        elif normativa.criterio_aplicabilidad == 'DOTACION':
            from .matching_service import cantidad_minima
            cant = cantidad_minima(emp.rango_empleados)
            if cant >= normativa.min_empleados:
                aplica = True

        # Criterio por Trigger Específico
        elif normativa.criterio_aplicabilidad == 'TRIGGER':
            trigger = normativa.trigger_asociado
            if trigger and hasattr(emp, trigger) and getattr(emp, trigger):
                aplica = True
            elif normativa.requiere_datos_personales and emp.maneja_datos_personales:
                aplica = True
            elif normativa.requiere_b2c and emp.es_b2c_ecommerce:
                aplica = True
            elif normativa.requiere_procesa_pagos and emp.procesa_pagos:
                aplica = True
            elif normativa.requiere_residuos and emp.genera_residuos_rep:
                aplica = True

        # Criterio Sectorial
        elif normativa.criterio_aplicabilidad == 'SECTORIAL':
            if normativa.rubro_aplicable and emp.rubro and normativa.rubro_aplicable.upper() in emp.rubro.upper():
                aplica = True

        if aplica:
            comp, created = ComplianceEmpresa.objects.get_or_create(
                empresa=emp,
                normativa=normativa,
                defaults={
                    "estado": "VERIFICADA",
                    "porcentaje_progreso": 0.0,
                    "origen": "MOTOR_REGLAS"
                }
            )
            if created:
                asignadas += 1

    # Generar tareas para todas las empresas asignadas
    generar_tareas_para_normativa(normativa)

    return asignadas
