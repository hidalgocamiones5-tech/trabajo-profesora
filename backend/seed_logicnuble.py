import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import (
    Empresa, PerfilUsuario, Normativa, ObjetivoChecklist, TratamientoRAT, SolicitudTicket,
    Incidente, TareaPendiente, Riesgo
)

def seed_logicnuble():
    print("Creando empresa 'logicÑuble' y datos de prueba...")
    
    # 1. Crear Empresa logicÑuble
    empresa, created = Empresa.objects.get_or_create(
        nombre="logicÑuble",
        rut="98765432-1"
    )
    print(f"Empresa creada: {empresa.nombre}")

    # 2. Crear Usuario Cliente (Frontend) para logicÑuble
    if not User.objects.filter(username="empleado_logic").exists():
        empleado_user = User.objects.create_user("empleado_logic", "empleado@logicnuble.cl", "logic123")
        PerfilUsuario.objects.create(user=empleado_user, empresa=empresa, cargo="Gerente de Operaciones")
        print("Usuario cliente 'empleado_logic' creado (pass: logic123).")

    # 3. Datos de prueba exclusivos de logicÑuble
    Normativa.objects.get_or_create(
        empresa=empresa,
        nombre="Certificación ISO 9001 (logicÑuble)",
        defaults={
            "progreso": 60,
            "estado": "en_tiempo",
            "criticidad": "media",
            "fecha_inicio": date.today() - timedelta(days=20),
            "fecha_termino": date.today() + timedelta(days=100),
            "tipo": "Calidad",
            "origen": "Interno"
        }
    )

    SolicitudTicket.objects.get_or_create(
        empresa=empresa,
        nombre="Actualización de Software Contable (logicÑuble)",
        defaults={
            "estado": "revisando",
            "tipo": "Soporte TI",
            "fecha_limite": date.today() + timedelta(days=10),
            "sla": "en_tiempo",
            "prioridad": "media",
            "solicitante": "Pedro Martinez",
            "responsable": "Soporte Externo"
        }
    )

    TareaPendiente.objects.get_or_create(
        empresa=empresa,
        tarea="Revisión de Inventario Trimestral (logicÑuble)",
        defaults={
            "responsable": "Pedro Martinez",
            "estado": "vencido",
            "fecha_vencimiento": date.today() - timedelta(days=2),
            "asociada_a": "ISO 9001",
            "responsable_asignado": "Pedro Martinez"
        }
    )

    Incidente.objects.get_or_create(
        empresa=empresa,
        nombre="Fallo eléctrico en bodega principal (logicÑuble)",
        defaults={
            "denunciante": "Guardia de Seguridad",
            "responsable": "Mantenimiento",
            "tipo": "Infraestructura",
            "estado": "revisando",
            "fecha": date.today() - timedelta(days=1)
        }
    )

    print("Seed de logicÑuble completado exitosamente.")

if __name__ == '__main__':
    seed_logicnuble()
