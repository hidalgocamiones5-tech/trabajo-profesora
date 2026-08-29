import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Empresa, Normativa, TareaPendiente
from api.services.rag_engine.audit_service import GrcAuditService

def test_auditoria_empresa_django():
    print("=" * 60)
    print("  TEST: AUDITORÍA RAG EN DJANGO (OLLAMA + PERSISTENCIA BD)")
    print("=" * 60)
    
    # Obtener o crear empresa representativa
    empresa = Empresa.objects.first()
    if not empresa:
        empresa = Empresa.objects.create(
            nombre="Comercial e Inversiones Andina SpA",
            rubro="RETAIL",
            tamano="PEQUENA",
            rango_empleados="PEQUENA",
            tiene_trabajadores=True,
            maneja_datos_personales=True,
            es_b2c_ecommerce=True
        )
    
    print(f"[*] Evaluando empresa: {empresa.nombre} (ID: {empresa.id})")
    print(f"[*] Rubro: {empresa.rubro} | Empleados: {empresa.rango_empleados} | Datos: {empresa.maneja_datos_personales}")
    
    servicio = GrcAuditService()
    resultado = servicio.auditar_y_asignar(empresa)
    
    print(f"\n[+] Resultado de la ejecución:")
    print(f"  - Éxito: {resultado.get('success')}")
    print(f"  - Resumen: {resultado.get('resumen_ejecutivo')}")
    print(f"  - Normativas asignadas: {resultado.get('normativas_asignadas')}")
    print(f"  - Tareas creadas en BD: {resultado.get('tareas_creadas')}")
    
    # Verificar persistencia en base de datos
    normas_guardadas = Normativa.objects.filter(empresa=empresa)
    tareas_guardadas = TareaPendiente.objects.filter(empresa=empresa)
    
    print(f"\n[+] Verificación en Base de Datos de Django:")
    print(f"  - Total Normativas asociadas a la empresa: {normas_guardadas.count()}")
    for n in normas_guardadas:
        print(f"    • [{n.criticidad.upper()}] {n.nombre}")
        
    print(f"  - Total Tareas asociadas a la empresa: {tareas_guardadas.count()}")
    for t in tareas_guardadas[:5]:
        print(f"    • [{t.responsable}] {t.tarea} (Vence: {t.fecha_vencimiento})")

if __name__ == "__main__":
    test_auditoria_empresa_django()
