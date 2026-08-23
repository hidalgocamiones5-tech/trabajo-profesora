from datetime import date, timedelta
from django.utils import timezone
from api.models import AlertaCompliance, Obligacion, Control, Evidencia, Auditoria, PlanAccion

class AlertEngine:
    @staticmethod
    def escanear_vencimientos(empresa):
        hoy = date.today()
        dias_umbrales = [90, 60, 30, 15, 7, 1]
        
        # 1. Obligaciones
        obligaciones = Obligacion.objects.filter(normativa__empresa=empresa, fecha_vencimiento__isnull=False, estado='pendiente')
        for ob in obligaciones:
            dias_restantes = (ob.fecha_vencimiento - hoy).days
            if dias_restantes in dias_umbrales or dias_restantes <= 0:
                criticidad = 'CRITICA' if dias_restantes <= 7 else ('ALTA' if dias_restantes <= 30 else 'MEDIA')
                AlertaCompliance.objects.get_or_create(
                    empresa=empresa,
                    origen_modulo='OBLIGACION',
                    referencia_id=ob.id,
                    titulo=f"Obligación por vencer: {ob.nombre}",
                    defaults={
                        'mensaje': f"La obligación '{ob.nombre}' vence en {dias_restantes} días ({ob.fecha_vencimiento}).",
                        'criticidad': criticidad,
                        'estado': 'ABIERTA'
                    }
                )

        # 2. Evidencias
        evidencias = Evidencia.objects.filter(control__obligacion__normativa__empresa=empresa, fecha_vencimiento__isnull=False)
        for ev in evidencias:
            dias_restantes = (ev.fecha_vencimiento - hoy).days
            if dias_restantes in dias_umbrales or dias_restantes <= 0:
                AlertaCompliance.objects.get_or_create(
                    empresa=empresa,
                    origen_modulo='EVIDENCIA',
                    referencia_id=ev.id,
                    titulo=f"Evidencia próxima a vencer",
                    defaults={
                        'mensaje': f"La evidencia para el control '{ev.control.nombre}' vence en {dias_restantes} días.",
                        'criticidad': 'ALTA' if dias_restantes <= 15 else 'MEDIA',
                        'estado': 'ABIERTA'
                    }
                )

        # 3. Planes de Acción
        planes = PlanAccion.objects.filter(estado__in=['abierto', 'en_progreso'])
        for pl in planes:
            dias_restantes = (pl.fecha_limite - hoy).days
            if dias_restantes <= 7:
                AlertaCompliance.objects.get_or_create(
                    empresa=empresa,
                    origen_modulo='PLAN_ACCION',
                    referencia_id=pl.id,
                    titulo=f"Plan de Acción Crítico: {pl.nombre}",
                    defaults={
                        'mensaje': f"El plan de acción '{pl.nombre}' vence el {pl.fecha_limite}.",
                        'criticidad': 'CRITICA',
                        'estado': 'ABIERTA'
                    }
                )

    @staticmethod
    def verificar_reglas_escalamiento(empresa):
        hace_15_dias = timezone.now() - timedelta(days=15)
        alertas_criticas = AlertaCompliance.objects.filter(
            empresa=empresa,
            criticidad='CRITICA',
            estado='ABIERTA',
            fecha_generacion__lte=hace_15_dias
        )
        for alerta in alertas_criticas:
            alerta.estado = 'ESCALADA'
            alerta.fecha_escalamiento = timezone.now()
            alerta.save()
            
        # Si una evidencia sigue vencida >30 días -> genera automáticamente un PlanAccion correctivo.
        hace_30_dias = timezone.now().date() - timedelta(days=30)
        evidencias_vencidas = Evidencia.objects.filter(
            empresa=empresa,
            estado='vencido',
            fecha_vencimiento__lte=hace_30_dias
        )
        for ev in evidencias_vencidas:
            PlanAccion.objects.get_or_create(
                empresa=empresa,
                normativa=ev.normativa,
                area=ev.area,
                responsable=ev.responsable,
                nombre=f"Plan Correctivo (Auto): Actualizar Evidencia '{ev.titulo}'",
                defaults={
                    'estado': 'abierto',
                    'fecha_limite': timezone.now().date() + timedelta(days=15)
                }
            )
