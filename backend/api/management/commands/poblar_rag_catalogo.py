from django.core.management.base import BaseCommand
from api.models import LeyOficial, ArticuloLey
from api.services.rag_engine.vector_store import VectorStore

class Command(BaseCommand):
    help = 'Puebla el catálogo maestro relacional (MySQL/SQLite) con Leyes y Artículos Oficiales, y los indexa en ChromaDB.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('[*] Iniciando población del Catálogo Maestro de Leyes en Base de Datos Relacional...'))

        leyes_catalogo = [
            {
                "codigo_bcn": "1200000",
                "numero_oficial": "Ley 21.719",
                "titulo": "Nueva Ley de Protección de Datos Personales (reemplaza 19.628)",
                "categoria": "Datos y Privacidad",
                "resumen_general": "Nueva normativa que crea la Agencia de Protección de Datos y establece multas altísimas.",
                "articulos": [
                    {
                        "numero": "ARCO",
                        "texto_original": "Derechos de Acceso, Rectificación, Cancelación y Oposición.",
                        "texto_resumido": "Obligación de implementar canales para que usuarios ejerzan derechos ARCO y notificar brechas de seguridad a la Agencia de Protección de Datos."
                    },
                    {
                        "numero": "Consentimiento",
                        "texto_original": "El consentimiento debe ser libre, informado y específico.",
                        "texto_resumido": "Prohibición de pre-marcar casillas. Obligación de consentimiento explícito, informado y por escrito de clientes/usuarios para recolectar o tratar sus datos."
                    }
                ]
            },
            {
                "codigo_bcn": "1195034",
                "numero_oficial": "Ley 21.595",
                "titulo": "Ley de Delitos Económicos y Medioambientales (Actualiza 20.393)",
                "categoria": "Prevención de Delitos",
                "resumen_general": "Sistematiza delitos económicos y atentados contra el medio ambiente, ampliando drásticamente la responsabilidad penal empresarial.",
                "articulos": [
                    {
                        "numero": "Catálogo",
                        "texto_original": "Nuevos delitos base aplicables a la persona jurídica.",
                        "texto_resumido": "Responsabilidad penal directa de la empresa por más de 200 nuevos delitos económicos y medioambientales cometidos en su beneficio."
                    },
                    {
                        "numero": "MPD",
                        "texto_original": "Modelo de prevención de delitos eximente.",
                        "texto_resumido": "Exigencia crítica de actualizar e implementar un Modelo de Prevención de Delitos (MPD) real y efectivo para evitar la disolución de la empresa o comiso de ganancias."
                    }
                ]
            },
            {
                "codigo_bcn": "1200164",
                "numero_oficial": "Ley 21.643",
                "titulo": "Ley Karin - Prevención del Acoso y Violencia Laboral",
                "categoria": "Laboral",
                "resumen_general": "Obligaciones laborales para prevenir, investigar y sancionar el acoso sexual, laboral y violencia en el trabajo.",
                "articulos": [
                    {
                        "numero": "211-A",
                        "texto_original": "Artículo 211-A: Los empleadores deberán contar con un protocolo de prevención del acoso laboral, sexual y violencia en el trabajo, informando semestralmente los canales de denuncia.",
                        "texto_resumido": "Obligación de confeccionar protocolo escrito de prevención del acoso, habilitar canal de denuncia confidencial y capacitar al personal anualmente."
                    },
                    {
                        "numero": "211-B",
                        "texto_original": "Artículo 211-B: Recibida una denuncia de acoso, el empleador deberá adoptar de inmediato medidas de resguardo respecto de los involucrados.",
                        "texto_resumido": "Protocolo de investigación inmediata con medidas de protección cautelares hacia la víctima y reporte formal a la Inspección del Trabajo."
                    }
                ]
            },
            {
                "codigo_bcn": "1090894",
                "numero_oficial": "Ley 20.920",
                "titulo": "Ley REP - Responsabilidad Extendida del Productor",
                "categoria": "Medioambiente & Residuos",
                "resumen_general": "Marco de gestión de residuos y fomento del reciclaje para productores e importadores.",
                "articulos": [
                    {
                        "numero": "9",
                        "texto_original": "Artículo 9: Los productores de productos prioritarios son responsables de la organización y financiamiento de la recolección y valorización de los residuos.",
                        "texto_resumido": "Empresas que introducen envases, embalajes o aparatos prioritarios deben afiliarse a un Sistema de Gestión (GRANSIC) y declarar toneladas anuales."
                    }
                ]
            },
            {
                "codigo_bcn": "61438",
                "numero_oficial": "Ley 19.496",
                "titulo": "Ley de Protección de los Derechos de los Consumidores (SERNAC)",
                "categoria": "Consumidor & E-commerce",
                "resumen_general": "Normas sobre comercio electrónico, derecho a retracto, garantías y publicidad.",
                "articulos": [
                    {
                        "numero": "3-bis",
                        "texto_original": "Artículo 3 bis: El consumidor podrá poner término unilateralmente al contrato en compras a distancia o electrónicas dentro del plazo de 10 días.",
                        "texto_resumido": "Garantizar derecho a retracto de 10 días en plataformas e-commerce, términos y condiciones visibles y soporte postventa expedito."
                    }
                ]
            },
            {
                "codigo_bcn": "1186782",
                "numero_oficial": "Ley 21.521",
                "titulo": "Ley Fintec - Mercado Financiero y Finanzas Abiertas",
                "categoria": "Financiero",
                "resumen_general": "Regula servicios financieros basados en tecnología, plataformas de pago y custodia.",
                "articulos": [
                    {
                        "numero": "5",
                        "texto_original": "Artículo 5: Las entidades que presten servicios de financiamiento colectivo, sistemas de pagos o intermediación deben inscribirse en el Registro de la CMF.",
                        "texto_resumido": "Exigencia de registro obligatorio ante la CMF para plataformas Fintech de pagos, préstamos o custodia de fondos con gobernanza de riesgos."
                    }
                ]
            },
            {
                "codigo_bcn": "1202517",
                "numero_oficial": "Ley 21.663",
                "titulo": "Ley Marco de Ciberseguridad e Infraestructura Crítica",
                "categoria": "Ciberseguridad",
                "resumen_general": "Establece la Agencia Nacional de Ciberseguridad y obligaciones para servicios esenciales en materia de seguridad informática.",
                "articulos": [
                    {
                        "numero": "7",
                        "texto_original": "Las instituciones y operadores de servicios esenciales deberán implementar medidas técnicas, organizacionales y operacionales de ciberseguridad.",
                        "texto_resumido": "Implementación obligatoria de estándares de ciberseguridad (ISO 27001 o NIST), planes de respuesta a incidentes y reportes a la CSIRT Nacional."
                    }
                ]
            },
            {
                "codigo_bcn": "1191341",
                "numero_oficial": "Ley 21.561",
                "titulo": "Reducción de Jornada Laboral a 40 Horas",
                "categoria": "Laboral",
                "resumen_general": "Modifica el Código del Trabajo reduciendo la jornada ordinaria de 45 a 40 horas semanales.",
                "articulos": [
                    {
                        "numero": "22",
                        "texto_original": "La jornada ordinaria de trabajo no excederá de cuarenta horas semanales.",
                        "texto_resumido": "Adaptar los contratos y registros de asistencia para el cumplimiento de la jornada máxima de 40 horas, según la fase de gradualidad vigente."
                    }
                ]
            },
            {
                "codigo_bcn": "16774",
                "numero_oficial": "DS-594",
                "titulo": "Decreto Supremo 594 - Condiciones Sanitarias en Lugares de Trabajo",
                "categoria": "Seguridad Ocupacional",
                "resumen_general": "Condiciones ambientales, sanitarias y de ergonomía en faenas y oficinas.",
                "articulos": [
                    {
                        "numero": "3",
                        "texto_original": "Artículo 3: Todo lugar de trabajo deberá mantener buenas condiciones de higiene y seguridad, provisión de agua potable y servicios higiénicos adecuados.",
                        "texto_resumido": "Mantener extintores vigentes, señalética de evacuación, agua potable y condiciones de higiene laboral fiscalizadas por la Seremi de Salud."
                    }
                ]
            }
        ]

        chunks_para_rag = []

        for item_ley in leyes_catalogo:
            ley_obj, created = LeyOficial.objects.get_or_create(
                codigo_bcn=item_ley["codigo_bcn"],
                defaults={
                    "numero_oficial": item_ley["numero_oficial"],
                    "titulo": item_ley["titulo"],
                    "categoria": item_ley["categoria"],
                    "resumen_general": item_ley["resumen_general"],
                    "activo": True
                }
            )
            
            for art in item_ley["articulos"]:
                art_obj, _ = ArticuloLey.objects.get_or_create(
                    ley=ley_obj,
                    numero_articulo=art["numero"],
                    defaults={
                        "texto_original": art["texto_original"],
                        "texto_resumido": art["texto_resumido"],
                        "categoria_tematica": item_ley["categoria"],
                        "indexado_en_rag": True
                    }
                )
                
                # Preparamos el chunk optimizado (usando el texto resumido) para ChromaDB
                chunks_para_rag.append({
                    "id": f"art_{art_obj.id}",
                    "text": f"[{ley_obj.numero_oficial} - Art. {art_obj.numero_articulo}] {art_obj.texto_resumido}",
                    "metadata": {
                        "articulo_id": art_obj.id,
                        "ley_id": ley_obj.numero_oficial,
                        "nombre": ley_obj.titulo,
                        "numero": art_obj.numero_articulo,
                        "categoria": item_ley["categoria"]
                    }
                })

        self.stdout.write(self.style.SUCCESS(f'[OK] {len(leyes_catalogo)} leyes maestras y {len(chunks_para_rag)} artículos registrados en la Base de Datos Relacional.'))

        # Indexar en ChromaDB
        self.stdout.write(self.style.NOTICE('[*] Sincronizando catálogo con base vectorial ChromaDB...'))
        store = VectorStore()
        store.add_chunks(chunks_para_rag)
        self.stdout.write(self.style.SUCCESS('[OK] ChromaDB sincronizado exitosamente con versión optimizada.'))
