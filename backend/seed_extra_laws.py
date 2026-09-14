import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import LeyOficial, ArticuloLey

nuevas_leyes = [
    {
        "codigo_bcn": "207436",
        "numero_oficial": "Código del Trabajo (DFL 1)",
        "titulo": "Fija el texto refundido, coordinado y sistematizado del Código del Trabajo",
        "categoria": "Laboral",
        "resumen_general": "Regula los contratos laborales, jornadas ordinarias, descansos, remuneraciones, finiquitos y el Reglamento Interno de Orden, Higiene y Seguridad.",
        "articulos": [
            {"numero": "Art. 22", "texto": "Jornada ordinaria de trabajo y sus limitaciones. La duración de la jornada ordinaria no excederá de cuarenta horas semanales.", "categoria": "Jornada"},
            {"numero": "Art. 153", "texto": "Empresas con 10 o más trabajadores deben contar con un Reglamento Interno de Orden, Higiene y Seguridad (RIOHS).", "categoria": "Seguridad Laboral"}
        ]
    },
    {
        "codigo_bcn": "1191341",
        "numero_oficial": "Ley 21.561",
        "titulo": "Reducción de Jornada Laboral a 40 Horas",
        "categoria": "Laboral",
        "resumen_general": "Regulación y registro electrónico de asistencia, control de turnos y limitación del Artículo 22 inciso 2°.",
        "articulos": [
            {"numero": "Art. 1", "texto": "Redúcese la jornada de trabajo a 40 horas semanales. Aplicación gradual y obligatoria.", "categoria": "Jornada"}
        ]
    },
    {
        "codigo_bcn": "1195034",
        "numero_oficial": "Ley 21.595",
        "titulo": "Ley de Delitos Económicos y Medioambientales",
        "categoria": "Prevención de Delitos",
        "resumen_general": "Hace penalmente responsables a las empresas por delitos económicos y medioambientales, ampliando el catálogo de delitos base de la Ley 20.393.",
        "articulos": [
            {"numero": "Art. 1-10", "texto": "Sistematiza los delitos económicos en cuatro categorías. Se hace exigible un Modelo de Prevención de Delitos robusto para evitar responsabilidad penal de la persona jurídica y directivos.", "categoria": "Compliance Penal"}
        ]
    },
    {
        "codigo_bcn": "1202517",
        "numero_oficial": "Ley 21.663",
        "titulo": "Ley Marco de Ciberseguridad",
        "categoria": "Ciberseguridad",
        "resumen_general": "Establece directivas generales de resguardo informático y reporte de incidentes graves para entidades y prestadores de servicios digitales.",
        "articulos": [
            {"numero": "Art. 4", "texto": "Obligación de aplicar medidas técnicas y organizativas para gestionar riesgos de ciberseguridad.", "categoria": "Seguridad TI"},
            {"numero": "Art. 7", "texto": "Obligación de reportar ciberataques e incidentes críticos al CSIRT Nacional.", "categoria": "Reporte de Incidentes"}
        ]
    },
    {
        "codigo_bcn": "6326",
        "numero_oficial": "Decreto Ley 830",
        "titulo": "Código Tributario",
        "categoria": "Tributario",
        "resumen_general": "Regula obligaciones fiscales como emisión de DTE, declaraciones F29 y F22, y conservación de libros contables.",
        "articulos": [
            {"numero": "Art. 59", "texto": "Obligación de llevar contabilidad fidedigna, emitir boletas o facturas y conservar documentos tributarios por los plazos de prescripción.", "categoria": "Contabilidad"}
        ]
    },
    {
        "codigo_bcn": "1103997",
        "numero_oficial": "Ley 21.015",
        "titulo": "Ley de Inclusión Laboral",
        "categoria": "Laboral",
        "resumen_general": "Reserva del 1% de la dotación para personas con discapacidad o asignación de medidas alternativas (exigible a empresas de 100 o más trabajadores).",
        "articulos": [
            {"numero": "Art. 157 bis", "texto": "Empresas de 100 o más trabajadores deberán contratar o mantener contratados al menos un 1% de personas con discapacidad.", "categoria": "Inclusión"}
        ]
    }
]

print("Inyectando leyes en el catálogo maestro...")

for data in nuevas_leyes:
    ley, created = LeyOficial.objects.get_or_create(
        codigo_bcn=data["codigo_bcn"],
        defaults={
            "numero_oficial": data["numero_oficial"],
            "titulo": data["titulo"],
            "categoria": data["categoria"],
            "resumen_general": data["resumen_general"],
            "activo": True
        }
    )
    if not created:
        ley.numero_oficial = data["numero_oficial"]
        ley.titulo = data["titulo"]
        ley.categoria = data["categoria"]
        ley.resumen_general = data["resumen_general"]
        ley.save()
    
    for art in data["articulos"]:
        ArticuloLey.objects.get_or_create(
            ley=ley,
            numero_articulo=art["numero"],
            defaults={
                "texto_resumido": art["texto"],
                "categoria_tematica": art["categoria"],
                "indexado_en_rag": True
            }
        )

print("¡Leyes insertadas exitosamente!")
