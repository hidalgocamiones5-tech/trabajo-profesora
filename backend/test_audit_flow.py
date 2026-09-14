import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Empresa, LeyOficial, ArticuloLey, Normativa, ComplianceEmpresa, TareaPendiente
from api.services.rag_engine.vector_store import VectorStore

print("=== VERIFICACIÓN DE ARQUITECTURA RELACIONAL & RAG ===")

# 1. Verificar Leyes y Artículos en BD Relacional
num_leyes = LeyOficial.objects.count()
num_articulos = ArticuloLey.objects.count()
print(f"[1] Base de Datos Relacional:")
print(f"    - Leyes Maestras registradas: {num_leyes}")
print(f"    - Artículos registrados: {num_articulos}")

# 2. Verificar Búsqueda Vectorial RAG
store = VectorStore()
resultados = store.search("Empresa Fintech de pagos y comercio electrónico con trabajadores", top_k=3)
print(f"[2] Búsqueda Vectorial ChromaDB:")
print(f"    - Fragmentos recuperados: {len(resultados)}")
for idx, r in enumerate(resultados):
    print(f"      {idx+1}. {r['text'][:80]}...")

print("\n[OK] Verificación de arquitectura completada con éxito.")
