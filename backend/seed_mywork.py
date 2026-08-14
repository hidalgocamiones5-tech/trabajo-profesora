import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import TareaPendiente, Empresa
from datetime import date, timedelta

empresa = Empresa.objects.first()

# Clear existing tasks or add specific ones
tasks_data = [
    {
        "tarea": "Actualizar políticas de privacidad",
        "asociada_a": "Ley 20137",
        "responsable": "Felipe Sanchez",
        "responsable_asignado": "Felipe Sanchez",
        "estado": "pendiente",
        "fecha_vencimiento": date.today() + timedelta(days=1),
    },
    {
        "tarea": "Auditoría interna trimestral",
        "asociada_a": "ISO 27001",
        "responsable": "Felipe Sanchez",
        "responsable_asignado": "Felipe Sanchez",
        "estado": "pendiente",
        "fecha_vencimiento": date.today() - timedelta(days=5), # Atrasada!
    },
    {
        "tarea": "Revisión de accesos a base de datos",
        "asociada_a": "Seguridad TI",
        "responsable": "Felipe Sanchez",
        "responsable_asignado": "Felipe Sanchez",
        "estado": "completada",
        "fecha_vencimiento": date.today() - timedelta(days=2),
    },
    {
        "tarea": "Firma de NDA con proveedores",
        "asociada_a": "Contratos",
        "responsable": "Felipe Sanchez",
        "responsable_asignado": "Felipe Sanchez",
        "estado": "completada",
        "fecha_vencimiento": date.today() - timedelta(days=10),
    },
]

for t in tasks_data:
    TareaPendiente.objects.get_or_create(
        tarea=t["tarea"],
        defaults={
            "empresa": empresa,
            "asociada_a": t["asociada_a"],
            "responsable": t["responsable"],
            "responsable_asignado": t["responsable_asignado"],
            "estado": t["estado"],
            "fecha_vencimiento": t["fecha_vencimiento"],
        }
    )

print("Tareas para 'Mi Trabajo' aseguradas en la base de datos.")
