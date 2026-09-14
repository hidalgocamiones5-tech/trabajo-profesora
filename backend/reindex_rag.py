import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import LeyOficial, ArticuloLey
from api.services.rag_engine.vector_store import VectorStore

vs = VectorStore()
chunks = []

articulos = ArticuloLey.objects.filter(indexado_en_rag=True, ley__activo=True)
for art in articulos:
    chunks.append({
        "id": f"{art.ley.codigo_bcn}_{art.numero_articulo.replace(' ', '_')}",
        "text": f"Ley: {art.ley.titulo} ({art.ley.numero_oficial}). Art. {art.numero_articulo}: {art.texto_resumido}",
        "metadata": {
            "ley_id": art.ley.codigo_bcn or "N/A",
            "numero": art.numero_articulo,
            "categoria": art.categoria_tematica or "General",
            "ley_titulo": art.ley.titulo
        }
    })

print(f"Indexando {len(chunks)} artículos en ChromaDB...")
if chunks:
    vs.add_chunks(chunks)
    print("¡Indexación completa!")
else:
    print("No hay artículos para indexar.")
