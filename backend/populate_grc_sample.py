import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import (
    Empresa, PerfilUsuario, Sucursal, Area, Responsable, Normativa,
    Obligacion, Control, Evidencia, Riesgo, Incidente, Auditoria,
    PlanAccion, EventoCompliance, AlertaCompliance
)

def run():
    print("[+] Iniciando la carga de datos de muestra GRC para Chile...")

    # 1. Usuario y Empresa
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@antigravity.cl', 'is_staff': True, 'is_superuser': True}
    )
    admin_user.set_password('Fran_P789@')
    admin_user.save()

    empresa, _ = Empresa.objects.get_or_create(
        nombre="Empresa Demo Chile S.A.",
        defaults={
            'rut': '76.543.210-K',
            'rubro': 'Tecnología',
            'maneja_datos_personales': True,
            'es_b2c_ecommerce': True,
            'genera_residuos_rep': False,
            'setup_completado': True
        }
    )

    PerfilUsuario.objects.get_or_create(
        user=admin_user,
        defaults={'empresa': empresa, 'cargo': 'Gerente de Compliance'}
    )

    # 2. Sucursales y Áreas
    casa_matriz, _ = Sucursal.objects.get_or_create(
        empresa=empresa,
        nombre="Casa Matriz Santiago"
    )

    area_rrhh, _ = Area.objects.get_or_create(empresa=empresa, nombre="Recursos Humanos")
    area_ti, _ = Area.objects.get_or_create(empresa=empresa, nombre="Tecnología de la Información (TI)")
    area_finanzas, _ = Area.objects.get_or_create(empresa=empresa, nombre="Finanzas y Legal")

    resp_rrhh, _ = Responsable.objects.get_or_create(empresa=empresa, area=area_rrhh, nombre="Elena Rivas", defaults={'cargo': 'Jefa de Personas'})
    resp_ti, _ = Responsable.objects.get_or_create(empresa=empresa, area=area_ti, nombre="Felipe Sánchez", defaults={'cargo': 'Lead Security Officer'})

    # 3. Normativas Chilenas
    ley_karin, _ = Normativa.objects.get_or_create(
        empresa=empresa,
        codigo_bcn="LEY-21643",
        defaults={'nombre': "Ley Karin (Prevención Acoso Laboral)", 'descripcion': "Ley N° 21.643 contra el acoso laboral y de género", 'estado': "en_tiempo"}
    )

    ley_datos, _ = Normativa.objects.get_or_create(
        empresa=empresa,
        codigo_bcn="LEY-21719",
        defaults={'nombre': "Ley N° 21.719 Protección Datos Personales", 'descripcion': "Nueva regulación de protección de datos en Chile", 'estado': "atrasada"}
    )

    ley_20393, _ = Normativa.objects.get_or_create(
        empresa=empresa,
        codigo_bcn="LEY-20393",
        defaults={'nombre': "Ley N° 20.393 Responsabilidad Penal PJ", 'descripcion': "Prevención de delitos corporativos (Cohecho, Lavado)", 'estado': "en_tiempo"}
    )

    # 4. Obligaciones y Controles
    ob1, _ = Obligacion.objects.get_or_create(
        normativa=ley_karin,
        nombre="Protocolo de Prevención de Acoso Laboral y Sexual",
        defaults={
            'descripcion': 'Elaborar e informar protocolo interno según modelo Dirección del Trabajo.',
            'estado': 'cumplido',
            'responsable': resp_rrhh,
            'fecha_vencimiento': date.today() + timedelta(days=60)
        }
    )

    ob2, _ = Obligacion.objects.get_or_create(
        normativa=ley_datos,
        nombre="Registro de Actividades de Tratamiento (RAT)",
        defaults={
            'descripcion': 'Mantener inventario actualizado de bases de datos de clientes y colaboradores.',
            'estado': 'pendiente',
            'responsable': resp_ti,
            'fecha_vencimiento': date.today() - timedelta(days=5)
        }
    )

    ctrl1, _ = Control.objects.get_or_create(
        obligacion=ob1,
        nombre="Capacitación Anual Ley Karin a Jefaturas",
        defaults={'estado': 'activo', 'periodicidad': 'Anual', 'responsable': resp_rrhh}
    )

    ctrl2, _ = Control.objects.get_or_create(
        obligacion=ob2,
        nombre="Auditoría de Encriptación de Datos en Reposo",
        defaults={'estado': 'en_revision', 'periodicidad': 'Semestral', 'responsable': resp_ti}
    )

    # 5. Riesgos e Incidentes
    Riesgo.objects.get_or_create(
        empresa=empresa,
        nombre="Fuga de datos de clientes e-commerce",
        defaults={'impacto': 5, 'probabilidad': 4, 'estado': 'en_curso', 'responsable': 'Felipe Sánchez', 'fecha_identificacion': date.today()}
    )

    Incidente.objects.get_or_create(
        empresa=empresa,
        nombre="Intento de phishing detectado en área de finanzas",
        defaults={'denunciante': 'Anonimo', 'responsable': 'Felipe Sánchez', 'tipo': 'Seguridad TI', 'estado': 'abierto', 'fecha': date.today()}
    )

    # 6. Alertas
    AlertaCompliance.objects.get_or_create(
        empresa=empresa,
        origen_modulo='OBLIGACION',
        referencia_id=ob2.id,
        titulo="OBLIGACIÓN VENCIDA: Registro RAT (Ley 21.719)",
        defaults={
            'mensaje': "El Registro de Actividades de Tratamiento lleva 5 días vencido. Requiere regularización inmediata.",
            'criticidad': 'CRITICA',
            'estado': 'ABIERTA'
        }
    )

    print("[OK] Poblado de datos de muestra GRC completado exitosamente!")

if __name__ == '__main__':
    run()
