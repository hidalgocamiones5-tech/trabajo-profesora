from django.core.management.base import BaseCommand
from django.core.cache import cache
from django.utils import timezone
from api.services.ley_chile import LeyChileClient
from api.models import LeyOficial, ArticuloLey, Normativa
from api.services.rag_engine.vector_store import VectorStore
import time

class Command(BaseCommand):
    help = 'Sincroniza y descarga textos de leyes desde BCN/datos.gob.cl a MySQL/BD y actualiza ChromaDB'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Iniciando sincronización con BCN (datos.gob.cl) y Catálogo Maestro..."))
        client = LeyChileClient()
        store = VectorStore()
        
        # 1. Obtener todas las leyes maestras registradas
        leyes = LeyOficial.objects.filter(activo=True)
        
        chunks_actualizados = []
        
        for ley in leyes:
            if not ley.codigo_bcn:
                continue
                
            self.stdout.write(f"[*] Comprobando actualización oficial para: {ley.titulo} (BCN {ley.codigo_bcn})...")
            try:
                texto_xml = client.obtener_xml_bcn(ley.codigo_bcn, force_refresh=True)
                if texto_xml:
                    cache.set(f"bcn_xml_{ley.codigo_bcn}", texto_xml, timeout=259200)
                    ley.fecha_ultima_modificacion = timezone.now().date()
                    ley.save(update_fields=['fecha_ultima_modificacion', 'updated_at'])
                    
                    # Sincronizar artículos a ChromaDB si existen
                    for art in ley.articulos.all():
                        chunks_actualizados.append({
                            "id": f"art_{art.id}",
                            "text": f"[{ley.numero_oficial} - Art. {art.numero_articulo}] {art.texto_resumido}",
                            "metadata": {
                                "articulo_id": art.id,
                                "ley_id": ley.numero_oficial or ley.codigo_bcn,
                                "nombre": ley.titulo,
                                "numero": art.numero_articulo,
                                "categoria": ley.categoria
                            }
                        })
                    self.stdout.write(self.style.SUCCESS(f"✔ Ley {ley.numero_oficial} sincronizada."))
                else:
                    self.stdout.write(self.style.WARNING(f"⚠ Ley {ley.numero_oficial} no retornó datos nuevos."))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Error al procesar Ley {ley.numero_oficial}: {e}"))
            
            time.sleep(1)

        if chunks_actualizados:
            self.stdout.write(f"[*] Re-indexando {len(chunks_actualizados)} artículos en ChromaDB...")
            store.add_chunks(chunks_actualizados)
            self.stdout.write(self.style.SUCCESS(f"✔ ChromaDB actualizado con los artículos de MySQL."))

        self.stdout.write(self.style.SUCCESS("Sincronización nocturna finalizada con éxito."))
