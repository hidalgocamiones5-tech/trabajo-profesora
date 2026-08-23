import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from api.models import (
    Empresa, PerfilUsuario, Sucursal, Area, Responsable, Normativa,
    Obligacion, Control, Evidencia, Auditoria, PlanAccion, EventoCompliance,
    AlertaCompliance, HistoricoCumplimientoMensual, Riesgo, Incidente
)

class Command(BaseCommand):
    help = 'Inyecta datos de prueba realistas para el Dashboard GRC'

    def handle(self, *args, **kwargs):
        self.stdout.write("Limpiando datos antiguos...")
        # Cuidado: Esto borra TODO. En un proyecto real no se hace sin avisar.
        Empresa.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

        # 1. EMPRESA Y USUARIO ADMIN
        empresa = Empresa.objects.create(
            nombre="TechCorp Chile S.A.",
            nombre_fantasia="TechCorp",
            rut="76.543.210-K",
            rubro="Tecnología",
            tamano="mediana",
            rango_empleados="51-200",
            setup_completado=True
        )

        user = User.objects.create_user(username='admin_techcorp', email='admin@techcorp.cl', password='password123')
        PerfilUsuario.objects.create(user=user, empresa=empresa, cargo="Gerente de Cumplimiento")

        # 2. SUCURSAL Y ÁREAS
        sucursal = Sucursal.objects.create(empresa=empresa, nombre="Casa Matriz Santiago", ciudad="Santiago")
        area_ti = Area.objects.create(empresa=empresa, sucursal=sucursal, nombre="Tecnología de la Información (TI)")
        area_rrhh = Area.objects.create(empresa=empresa, sucursal=sucursal, nombre="Recursos Humanos")
        area_legal = Area.objects.create(empresa=empresa, sucursal=sucursal, nombre="Fiscalía / Legal")

        # 3. RESPONSABLES
        resp_ti = Responsable.objects.create(empresa=empresa, area=area_ti, nombre="Felipe Sánchez", cargo="CISO")
        resp_rrhh = Responsable.objects.create(empresa=empresa, area=area_rrhh, nombre="Elena Rivas", cargo="Gerente RRHH")
        resp_legal = Responsable.objects.create(empresa=empresa, area=area_legal, nombre="Julián Sosa", cargo="Abogado Jefe")

        # 4. NORMATIVAS
        norm_karin = Normativa.objects.create(
            empresa=empresa, nombre="Ley 21.643 (Ley Karin)", codigo_bcn="L-21643", 
            criticidad="ALTA", tipo="LABORAL"
        )
        norm_datos = Normativa.objects.create(
            empresa=empresa, nombre="Ley 19.628 (Datos Personales)", codigo_bcn="L-19628", 
            criticidad="CRITICA", tipo="PRIVACIDAD"
        )
        norm_iso = Normativa.objects.create(
            empresa=empresa, nombre="ISO 27001 (Seguridad Info)", codigo_bcn="ISO-27001", 
            criticidad="MEDIA", tipo="CIBERSEGURIDAD"
        )

        # 5. OBLIGACIONES Y CONTROLES
        hoy = timezone.now().date()
        
        # Ley Karin - Obligaciones
        ob1 = Obligacion.objects.create(
            normativa=norm_karin, area=area_rrhh, responsable=resp_rrhh,
            nombre="Protocolo de Prevención de Acoso", estado="cumplido", criticidad="ALTA",
            fecha_vencimiento=hoy + timedelta(days=120)
        )
        Control.objects.create(obligacion=ob1, area=area_rrhh, nombre="Revisión Anual del Protocolo", estado="operativo", periodicidad="anual")

        ob2 = Obligacion.objects.create(
            normativa=norm_karin, area=area_rrhh, responsable=resp_rrhh,
            nombre="Capacitación Semestral a Trabajadores", estado="parcial", criticidad="MEDIA",
            fecha_vencimiento=hoy + timedelta(days=15)
        )
        c2 = Control.objects.create(obligacion=ob2, area=area_rrhh, nombre="Registro de Asistencia a Capacitación", estado="pendiente", periodicidad="semestral")
        
        # Ley Datos - Obligaciones
        ob3 = Obligacion.objects.create(
            normativa=norm_datos, area=area_ti, responsable=resp_ti,
            nombre="Registro de Bases de Datos", estado="pendiente", criticidad="CRITICA",
            fecha_vencimiento=hoy - timedelta(days=5) # Vencida!
        )
        Control.objects.create(obligacion=ob3, area=area_ti, nombre="Auditoría de Bases de Datos", estado="fallido", periodicidad="mensual")
        
        ob4 = Obligacion.objects.create(
            normativa=norm_datos, area=area_legal, responsable=resp_legal,
            nombre="Consentimiento Informado en Contratos", estado="cumplido", criticidad="ALTA",
            fecha_vencimiento=hoy + timedelta(days=300)
        )
        
        # ISO 27001 - Obligaciones
        ob5 = Obligacion.objects.create(
            normativa=norm_iso, area=area_ti, responsable=resp_ti,
            nombre="Política de Control de Accesos", estado="cumplido", criticidad="ALTA"
        )
        
        # 6. EVIDENCIAS
        Evidencia.objects.create(
            control=c2, empresa=empresa, normativa=norm_karin, area=area_rrhh, responsable=resp_rrhh,
            titulo="Listado de Asistencia Q1", estado="aprobado", fecha_emision=hoy - timedelta(days=30)
        )
        
        Evidencia.objects.create(
            empresa=empresa, normativa=norm_datos, area=area_ti, responsable=resp_ti,
            titulo="Reporte de Cifrado de BD", estado="vencido", fecha_vencimiento=hoy - timedelta(days=35)
        )
        
        # 7. RIESGOS E INCIDENTES
        Riesgo.objects.create(empresa=empresa, nombre="Fuga de Datos de Clientes VIP", impacto=5, probabilidad=3, estado="mitigado", fecha_identificacion=hoy)
        Riesgo.objects.create(empresa=empresa, nombre="Incumplimiento de Protocolo de Acoso", impacto=4, probabilidad=2, estado="activo", fecha_identificacion=hoy)
        
        Incidente.objects.create(empresa=empresa, nombre="Intento de acceso no autorizado a BD", tipo="ciberseguridad", estado="abierto", fecha=hoy - timedelta(days=2))
        
        # 8. EVOLUCIÓN MENSUAL (Últimos 12 meses)
        meses = [
            (8, 2025, 65.5), (9, 2025, 68.0), (10, 2025, 67.5), (11, 2025, 71.0),
            (12, 2025, 75.0), (1, 2026, 74.5), (2, 2026, 78.0), (3, 2026, 82.5),
            (4, 2026, 85.0), (5, 2026, 86.5), (6, 2026, 88.0), (7, 2026, 91.5)
        ]
        
        for m, a, p in meses:
            HistoricoCumplimientoMensual.objects.create(
                empresa=empresa, mes=m, anio=a, porcentaje_cumplimiento=p
            )

        self.stdout.write(self.style.SUCCESS("¡Datos de prueba inyectados exitosamente!"))
