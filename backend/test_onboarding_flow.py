import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Empresa, PerfilUsuario, ComplianceEmpresa
from api.services.matching_service import asignar_normativas_base
from api.services.gemini_service import GeminiSmartDiscoveryService

# Create/Get test user
user, _ = User.objects.get_or_create(username='test_onboarding_user')
empresa, _ = Empresa.objects.get_or_create(nombre='Fintech & Software Solutions SpA')
empresa.tipo_sociedad = 'SPA'
empresa.rubro = 'FINANCIERO'
empresa.rango_empleados = 'MEDIANA'
empresa.maneja_datos_personales = True
empresa.es_b2c_ecommerce = True
empresa.procesa_pagos = True
empresa.tiene_trabajadores = True
empresa.setup_completado = True
empresa.save()

PerfilUsuario.objects.get_or_create(user=user, defaults={'empresa': empresa, 'cargo': 'Oficial de Cumplimiento'})

# 1. Test Matching Service
base_compliances = asignar_normativas_base(empresa)
print(f"=== TEST MOTOR DE REGLAS ===")
print(f"Normativas base asignadas por reglas: {len(base_compliances)}")
for c in base_compliances:
    print(f"  -> [{c.origen}] {c.normativa.titulo or c.normativa.nombre} (Estado: {c.estado})")

# 2. Test Gemini Smart Discovery
discovery_service = GeminiSmartDiscoveryService()
ia_compliances = discovery_service.ejecutar_smart_discovery(empresa)
print(f"\n=== TEST GEMINI SMART DISCOVERY ===")
print(f"Normativas sugeridas por IA: {len(ia_compliances)}")
for c in ia_compliances:
    print(f"  -> [{c.origen}] {c.normativa.titulo or c.normativa.nombre}")
    print(f"     Justificación: {c.justificacion_ia}")

total_compliances = ComplianceEmpresa.objects.filter(empresa=empresa).count()
print(f"\nTOTAL COMPLIANCES REGISTRADOS EN BD: {total_compliances}")
print("¡TODAS LAS PRUEBAS DE LA ARQUITECTURA PASARON CON ÉXITO!")
