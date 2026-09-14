import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import (
    Empresa, Normativa, ComplianceEmpresa, TareaPendiente, 
    AlertaCompliance, EventoCompliance, HistoricoCumplimientoMensual
)
from rag_admin.models import RegistroAuditoriaRAG

# Find the company
empresa = Empresa.objects.filter(nombre__icontains="TechCorp Chile").first()

if not empresa:
    print("Empresa no encontrada")
else:
    print(f"Borrando datos para: {empresa.nombre}")
    
    # Delete related records
    Normativa.objects.filter(empresa=empresa).delete()
    ComplianceEmpresa.objects.filter(empresa=empresa).delete()
    TareaPendiente.objects.filter(empresa=empresa).delete()
    RegistroAuditoriaRAG.objects.filter(empresa=empresa).delete()
    AlertaCompliance.objects.filter(empresa=empresa).delete()
    EventoCompliance.objects.filter(empresa=empresa).delete()
    HistoricoCumplimientoMensual.objects.filter(empresa=empresa).delete()
    
    # Reset company state
    empresa.estado_matching = 'PENDIENTE'
    empresa.log_matching = 'Reseteado para prueba desde cero.'
    empresa.save()
    
    print("¡Empresa reseteada con éxito!")
