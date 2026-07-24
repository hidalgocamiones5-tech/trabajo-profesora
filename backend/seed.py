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

def seed_data():
    print("Seeding database (B2B SaaS with Login)...")
    
    # 1. Crear Empresa
    empresa, created = Empresa.objects.get_or_create(
        nombre="------------",
        rut="12345678-9"
    )
    print(f"Empresa creada: {empresa.nombre}")

    # 2. Crear Superusuario (Admin)
    if not User.objects.filter(username="admin").exists():
        admin_user = User.objects.create_superuser("admin", "admin@------------.com", "admin")
        PerfilUsuario.objects.create(user=admin_user, empresa=empresa, cargo="Super Administrador")
        print("Superusuario 'admin' creado (pass: admin).")

    # 3. Crear Usuario Cliente (Frontend)
    if not User.objects.filter(username="empleado").exists():
        empleado_user = User.objects.create_user("empleado", "empleado@------------.com", "empleado123")
        PerfilUsuario.objects.create(user=empleado_user, empresa=empresa, cargo="Analista de Cumplimiento")
        print("Usuario cliente 'empleado' creado (pass: empleado123).")

    # 4. Datos de prueba asignados a la Empresa
    if not Normativa.objects.exists():
        Normativa.objects.create(
            empresa=empresa,
            nombre="Ley de Protección de Datos Personales",
            progreso=85,
            estado="en_tiempo",
            criticidad="alta",
            fecha_inicio=date.today() - timedelta(days=30),
            fecha_termino=date.today() + timedelta(days=60),
            tipo="Ley",
            origen="Nacional"
        )
        Normativa.objects.create(
            empresa=empresa,
            nombre="Norma ISO 27001",
            progreso=40,
            estado="atrasada",
            criticidad="media",
            fecha_inicio=date.today() - timedelta(days=90),
            fecha_termino=date.today() + timedelta(days=10),
            tipo="Certificación",
            origen="Internacional"
        )

    if not SolicitudTicket.objects.exists():
        SolicitudTicket.objects.create(
            empresa=empresa,
            estado="recibida",
            nombre="Revisión de Contrato Proveedor X",
            tipo="Revisión Legal",
            fecha_limite=date.today() + timedelta(days=5),
            sla="en_tiempo",
            prioridad="alta",
            solicitante="Juan Perez",
            responsable="Maria Gomez"
        )
        SolicitudTicket.objects.create(
            empresa=empresa,
            estado="en_progreso",
            nombre="Acceso a datos de RRHH",
            tipo="Acceso a Datos",
            fecha_limite=date.today() - timedelta(days=2),
            sla="atrasada",
            prioridad="media",
            solicitante="Luis Sanchez",
            responsable="Maria Gomez"
        )

    if not TareaPendiente.objects.exists():
        TareaPendiente.objects.create(
            empresa=empresa,
            responsable="Maria Gomez",
            estado="en_progreso",
            fecha_vencimiento=date.today() + timedelta(days=1),
            tarea="Actualizar políticas de privacidad",
            asociada_a="Ley de Protección de Datos",
            responsable_asignado="Maria Gomez"
        )
        TareaPendiente.objects.create(
            empresa=empresa,
            responsable="Carlos Diaz",
            estado="vencido",
            fecha_vencimiento=date.today() - timedelta(days=5),
            tarea="Auditoría interna trimestral",
            asociada_a="ISO 27001",
            responsable_asignado="Carlos Diaz"
        )

    if not Riesgo.objects.exists():
        Riesgo.objects.create(
            empresa=empresa,
            nombre="Fuga de Información en BD Clientes",
            impacto=5,
            probabilidad=3,
            estado="en_curso",
            responsable="IT Sec",
            fecha_identificacion=date.today() - timedelta(days=15)
        )

    if not Incidente.objects.exists():
        Incidente.objects.create(
            empresa=empresa,
            nombre="Caída de servidor principal",
            denunciante="Sistema de Monitoreo",
            responsable="IT Ops",
            tipo="Disponibilidad",
            estado="en_progreso",
            fecha=date.today()
        )

    print("Seed completado. Todos los registros fueron asociados a ------------.")

if __name__ == '__main__':
    seed_data()
