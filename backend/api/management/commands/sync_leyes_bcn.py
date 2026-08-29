from django.core.management.base import BaseCommand
from django.core.cache import cache
from api.services.ley_chile import LeyChileClient
from api.models import Normativa
import time

class Command(BaseCommand):
    help = 'Sincroniza y descarga textos de leyes desde BCN cada 3 días en la madrugada'

    def handle(self, *args, **kwargs):
        self.stdout.write("Iniciando sincronización con BCN (datos.gob.cl)...")
        client = LeyChileClient()
        
        # Obtener todas las normativas base que tengan codigo_bcn
        normativas = Normativa.objects.exclude(codigo_bcn__isnull=True).exclude(codigo_bcn='')
        codigos = set([n.codigo_bcn for n in normativas])
        
        # También incluir las del catálogo local por si acaso
        for ley in client.catalogo_leyes:
            if "codigo_bcn" in ley:
                codigos.add(ley["codigo_bcn"])

        for codigo in codigos:
            self.stdout.write(f"Descargando actualización para Ley/Norma {codigo}...")
            # Forzamos la obtención sin leer caché para renovar
            try:
                texto = client.obtener_xml_bcn(codigo, force_refresh=True)
                if texto:
                    # Guardamos en caché por 3 días (259200 segundos)
                    cache.set(f"bcn_xml_{codigo}", texto, timeout=259200)
                    self.stdout.write(self.style.SUCCESS(f"✔ Ley {codigo} actualizada y en caché."))
                else:
                    self.stdout.write(self.style.WARNING(f"⚠ Ley {codigo} no retornó datos válidos."))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Error al procesar Ley {codigo}: {e}"))
            
            # Rate limiting / polite delay
            time.sleep(2)
            
        self.stdout.write(self.style.SUCCESS("Sincronización finalizada con éxito."))
