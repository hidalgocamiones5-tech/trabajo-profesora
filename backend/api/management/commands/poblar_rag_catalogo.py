from django.core.management.base import BaseCommand
from api.services.rag_engine.vector_store import VectorStore

class Command(BaseCommand):
    help = 'Puebla la base de datos vectorial ChromaDB del backend con las leyes chilenas oficiales.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('[*] Inicializando ChromaDB para Django...'))
        store = VectorStore()
        
        normativas_chile = [
            {
                "text": "Artículo 4: El tratamiento de los datos personales sólo puede efectuarse cuando esta ley u otras disposiciones legales lo autoricen o el titular consienta expresamente en ello. La autorización debe ser informada y por escrito.",
                "metadata": {"ley_id": "19628", "nombre": "Ley de Protección de la Vida Privada / Datos Personales", "numero": "4", "tipo": "articulo", "categoria": "Datos y Privacidad"}
            },
            {
                "text": "Artículo 10: No pueden ser objeto de tratamiento los datos sensibles, a menos que la ley lo autorice, exista consentimiento expreso o sean necesarios para la determinación de beneficios de salud.",
                "metadata": {"ley_id": "19628", "nombre": "Ley de Protección de la Vida Privada / Datos Personales", "numero": "10", "tipo": "articulo", "categoria": "Datos y Privacidad"}
            },
            {
                "text": "Artículo 3: Las personas jurídicas serán responsables de los delitos señalados en el artículo 1 (cohecho, lavado de activos, financiamiento del terrorismo, delitos informáticos) cometidos directa e inmediatamente en su interés o para su provecho por sus dueños, controladores o ejecutivos principales, siempre que la comisión del delito fuere consecuencia del incumplimiento de sus deberes de dirección y supervisión.",
                "metadata": {"ley_id": "20393", "nombre": "Ley de Responsabilidad Penal de las Personas Jurídicas", "numero": "3", "tipo": "articulo", "categoria": "Prevención de Delitos"}
            },
            {
                "text": "Artículo 4: Modelo de prevención de delitos. La persona jurídica deberá adoptar e implementar un modelo de prevención de delitos eficaz, que considere la designación de un encargado de prevención, recursos materiales y protocolos y procedimientos de control interno.",
                "metadata": {"ley_id": "20393", "nombre": "Ley de Responsabilidad Penal de las Personas Jurídicas", "numero": "4", "tipo": "articulo", "categoria": "Prevención de Delitos"}
            },
            {
                "text": "Artículo 211-A: En las empresas, los empleadores deberán contar con un protocolo de prevención del acoso laboral, sexual y violencia en el trabajo, debiendo informar semestralmente a los trabajadores sobre los canales de denuncia e implementar medidas de resguardo tempranas.",
                "metadata": {"ley_id": "21643", "nombre": "Ley Karin - Prevención del Acoso y Violencia Laboral", "numero": "211-A", "tipo": "articulo", "categoria": "Laboral"}
            }
        ]
        
        self.stdout.write(f"[*] Indexando {len(normativas_chile)} fragmentos legales...")
        store.add_chunks(normativas_chile)
        self.stdout.write(self.style.SUCCESS('[OK] ChromaDB de Django poblado exitosamente.'))
