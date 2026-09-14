import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import (
    Empresa, Normativa, ComplianceEmpresa, TareaPendiente, 
    AlertaCompliance, EventoCompliance, HistoricoCumplimientoMensual
)
from rag_admin.models import RegistroAuditoriaRAG

empresas = Empresa.objects.all()

for empresa in empresas:
    print(f"Reseteando empresa: {empresa.nombre}")
    
    # Delete related records
    Normativa.objects.filter(empresa=empresa).delete()
    ComplianceEmpresa.objects.filter(empresa=empresa).delete()
    TareaPendiente.objects.filter(empresa=empresa).delete()
    RegistroAuditoriaRAG.objects.filter(empresa=empresa).delete()
    AlertaCompliance.objects.filter(empresa=empresa).delete()
    EventoCompliance.objects.filter(empresa=empresa).delete()
    HistoricoCumplimientoMensual.objects.filter(empresa=empresa).delete()
    
    # Reset all boolean triggers and fields
    empresa.setup_completado = False
    empresa.estado_matching = 'PENDIENTE'
    empresa.log_matching = 'Reseteado para prueba desde cero.'
    
    # Clear specific fields
    empresa.rubro = ''
    empresa.tamano = ''
    empresa.rut = ''
    
    # Booleans
    empresa.es_b2c_ecommerce = False
    empresa.genera_residuos_rep = False
    empresa.maneja_datos_personales = False
    
    if hasattr(empresa, 'procesa_pagos'): empresa.procesa_pagos = False
    if hasattr(empresa, 'tiene_trabajadores'): empresa.tiene_trabajadores = False
    if hasattr(empresa, 'importa_exporta'): empresa.importa_exporta = False
    if hasattr(empresa, 'trabaja_con_estado'): empresa.trabaja_con_estado = False
    if hasattr(empresa, 'tiene_sindicato'): empresa.tiene_sindicato = False
    if hasattr(empresa, 'instalaciones_industriales'): empresa.instalaciones_industriales = False
    
    # Text choices that can't be null
    if hasattr(empresa, 'tipo_sociedad'): empresa.tipo_sociedad = 'SPA'
    if hasattr(empresa, 'rango_empleados'): empresa.rango_empleados = 'PEQUENA'
    if hasattr(empresa, 'region_operacion'): empresa.region_operacion = 'RM'
    if hasattr(empresa, 'nivel_ingresos'): empresa.nivel_ingresos = 'PEQUENA'
    
    empresa.save()

print("¡Todas las empresas han sido reseteadas por completo a estado en blanco!")
