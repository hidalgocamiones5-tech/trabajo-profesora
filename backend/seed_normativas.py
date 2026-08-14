import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Normativa

normativas_base = [
    {
        "titulo": "Ley N° 19.628: Sobre Protección de la Vida Privada (Datos Personales)",
        "codigo_bcn": "29631",
        "resumen": "Regula el tratamiento de datos personales de personas naturales en registros o bancos de datos públicos o privados.",
        "descripcion": "Establece principios de licitud, consentimiento y derechos ARCO para empresas que recopilan información de usuarios, clientes o trabajadores.",
        "es_transversal": False,
        "rubro_aplicable": None,
        "min_empleados": 0,
        "requiere_datos_personales": True,
        "requiere_b2c": False,
        "requiere_residuos": False,
        "requiere_procesa_pagos": False,
        "requiere_trabajadores": False,
        "criticidad": "alta",
        "estado": "en_tiempo"
    },
    {
        "titulo": "Ley N° 21.643: Ley Karin (Prevención del Acoso Laboral y Violencia)",
        "codigo_bcn": "1200164",
        "resumen": "Modifica el Código del Trabajo en materia de prevención, investigación y sanción del acoso laboral, sexual o violencia en el trabajo.",
        "descripcion": "Obliga a todo empleador a contar con protocolos formales de prevención de acoso y canales de denuncia confidenciales.",
        "es_transversal": True,
        "rubro_aplicable": None,
        "min_empleados": 1,
        "requiere_datos_personales": False,
        "requiere_b2c": False,
        "requiere_residuos": False,
        "requiere_procesa_pagos": False,
        "requiere_trabajadores": True,
        "criticidad": "alta",
        "estado": "en_tiempo"
    },
    {
        "titulo": "Ley N° 20.920: Ley REP (Responsabilidad Extendida del Productor)",
        "codigo_bcn": "1090894",
        "resumen": "Marco para la gestión de residuos, responsabilidad extendida del productor y fomento del reciclaje.",
        "descripcion": "Aplica a empresas que introducen en el mercado productos prioritarios (envases, embalajes, neumáticos, baterías, aparatos eléctricos).",
        "es_transversal": False,
        "rubro_aplicable": None,
        "min_empleados": 0,
        "requiere_datos_personales": False,
        "requiere_b2c": False,
        "requiere_residuos": True,
        "requiere_procesa_pagos": False,
        "requiere_trabajadores": False,
        "criticidad": "alta",
        "estado": "en_tiempo"
    },
    {
        "titulo": "Ley N° 19.496: Normas sobre Protección de los Derechos de los Consumidores",
        "codigo_bcn": "61438",
        "resumen": "Regula los actos de consumo, comercio electrónico, derecho a retracto, garantías y publicidad engañosa.",
        "descripcion": "Aplica obligatoriamente a todo comercio que venda bienes o servicios directos al consumidor final (B2C / E-commerce).",
        "es_transversal": False,
        "rubro_aplicable": None,
        "min_empleados": 0,
        "requiere_datos_personales": False,
        "requiere_b2c": True,
        "requiere_residuos": False,
        "requiere_procesa_pagos": False,
        "requiere_trabajadores": False,
        "criticidad": "media",
        "estado": "en_tiempo"
    },
    {
        "titulo": "Ley N° 21.521: Ley Fintec (Mercado Financiero y Finanzas Abiertas)",
        "codigo_bcn": "1186782",
        "resumen": "Regula los servicios financieros basados en tecnología, plataformas de financiamiento colectivo, sistemas de pagos y custodia.",
        "descripcion": "Exige acreditaciones ante la CMF, protocolos de ciberseguridad y gestión de riesgos tecnológicos.",
        "es_transversal": False,
        "rubro_aplicable": "FINANCIERO",
        "min_empleados": 0,
        "requiere_datos_personales": False,
        "requiere_b2c": False,
        "requiere_residuos": False,
        "requiere_procesa_pagos": True,
        "requiere_trabajadores": False,
        "criticidad": "alta",
        "estado": "en_tiempo"
    },
    {
        "titulo": "Ley N° 21.663: Ley Marco de Ciberseguridad e Infraestructura Crítica",
        "codigo_bcn": "1202511",
        "resumen": "Crea la Agencia Nacional de Ciberseguridad y fija obligaciones de reporte de incidentes para empresas de servicios esenciales y tecnología.",
        "descripcion": "Obliga a operadores de software y servicios en la nube a reportar brechas de seguridad y mantener estándares de ciberseguridad.",
        "es_transversal": False,
        "rubro_aplicable": "TECNOLOGIA",
        "min_empleados": 0,
        "requiere_datos_personales": False,
        "requiere_b2c": False,
        "requiere_residuos": False,
        "requiere_procesa_pagos": False,
        "requiere_trabajadores": False,
        "criticidad": "alta",
        "estado": "en_tiempo"
    },
    {
        "titulo": "Ley N° 20.584: Derechos y Deberes de las Personas en Salud",
        "codigo_bcn": "1039348",
        "resumen": "Regula los derechos y deberes que tienen las personas en relación con acciones vinculadas a su atención de salud y confidencialidad médica.",
        "descripcion": "Estándar obligatorio para clínicas, centros médicos y prestadores de salud en Chile.",
        "es_transversal": False,
        "rubro_aplicable": "SALUD",
        "min_empleados": 0,
        "requiere_datos_personales": True,
        "requiere_b2c": False,
        "requiere_residuos": False,
        "requiere_procesa_pagos": False,
        "requiere_trabajadores": False,
        "criticidad": "alta",
        "estado": "en_tiempo"
    },
    {
        "titulo": "Decreto Supremo N° 594: Condiciones Sanitarias y Ambientales Básicas en los Lugares de Trabajo",
        "codigo_bcn": "16774",
        "resumen": "Establece las condiciones sanitarias, ergonómicas y de seguridad que debe cumplir toda empresa física o faena.",
        "descripcion": "Aplica a empresas con más de 10 trabajadores y faenas industriales.",
        "es_transversal": True,
        "rubro_aplicable": None,
        "min_empleados": 10,
        "requiere_datos_personales": False,
        "requiere_b2c": False,
        "requiere_residuos": False,
        "requiere_procesa_pagos": False,
        "requiere_trabajadores": True,
        "criticidad": "media",
        "estado": "en_tiempo"
    }
]

created_count = 0
for norm in normativas_base:
    obj, created = Normativa.objects.get_or_create(
        codigo_bcn=norm["codigo_bcn"],
        defaults={
            "nombre": norm["titulo"],
            "titulo": norm["titulo"],
            "resumen": norm["resumen"],
            "descripcion": norm["descripcion"],
            "es_transversal": norm["es_transversal"],
            "rubro_aplicable": norm["rubro_aplicable"],
            "min_empleados": norm["min_empleados"],
            "requiere_datos_personales": norm["requiere_datos_personales"],
            "requiere_b2c": norm["requiere_b2c"],
            "requiere_residuos": norm["requiere_residuos"],
            "requiere_procesa_pagos": norm["requiere_procesa_pagos"],
            "requiere_trabajadores": norm["requiere_trabajadores"],
            "criticidad": norm["criticidad"],
            "estado": norm["estado"],
            "tipo": "Ley",
            "origen": "BCN Ley Chile"
        }
    )
    if created:
        created_count += 1
    else:
        # Update existing
        for k, v in norm.items():
            setattr(obj, k, v)
        obj.save()

print(f"Normativas procesadas. Creadas: {created_count}, Total en BD: {Normativa.objects.count()}")
