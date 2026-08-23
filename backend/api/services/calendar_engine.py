from datetime import datetime, time
from django.utils import timezone
from api.models import EventoCompliance, Auditoria, PlanAccion, Obligacion, Evidencia

class CalendarEngine:
    @staticmethod
    def sincronizar_evento(empresa, tipo, titulo, fecha, entidad_id, entidad_tipo, prioridad='MEDIA', estado='PENDIENTE'):
        if not fecha:
            return None
        
        if not isinstance(fecha, datetime):
            fecha_inicio = timezone.make_aware(datetime.combine(fecha, time.min))
        else:
            fecha_inicio = fecha

        evento, created = EventoCompliance.objects.update_or_create(
            empresa=empresa,
            entidad_tipo=entidad_tipo,
            entidad_relacionada_id=entidad_id,
            defaults={
                'tipo': tipo,
                'titulo': titulo,
                'fecha_inicio': fecha_inicio,
                'estado': estado,
                'prioridad': prioridad
            }
        )
        return evento

    @classmethod
    def sincronizar_todo(cls, empresa):
        # 1. Auditorías
        for aud in Auditoria.objects.filter(empresa=empresa):
            cls.sincronizar_evento(
                empresa=empresa,
                tipo='AUDITORIA',
                titulo=f"Auditoría: {aud.nombre}",
                fecha=aud.fecha_inicio,
                entidad_id=aud.id,
                entidad_tipo='Auditoria',
                prioridad='ALTA',
                estado=aud.estado.upper()
            )

        # 2. Planes de Acción
        for plan in PlanAccion.objects.all():
            empresa_plan = None
            if plan.riesgo:
                empresa_plan = plan.riesgo.empresa
            elif plan.incidente:
                empresa_plan = plan.incidente.empresa
            elif plan.auditoria:
                empresa_plan = plan.auditoria.empresa
            
            if empresa_plan == empresa:
                cls.sincronizar_evento(
                    empresa=empresa,
                    tipo='PLAN_ACCION',
                    titulo=f"Plan de Acción: {plan.nombre}",
                    fecha=plan.fecha_limite,
                    entidad_id=plan.id,
                    entidad_tipo='PlanAccion',
                    prioridad='ALTA',
                    estado=plan.estado.upper()
                )

        # 3. Obligaciones por vencer
        for ob in Obligacion.objects.filter(normativa__empresa=empresa, fecha_vencimiento__isnull=False):
            cls.sincronizar_evento(
                empresa=empresa,
                tipo='VENCIMIENTO_OBLIGACION',
                titulo=f"Vencimiento: {ob.nombre}",
                fecha=ob.fecha_vencimiento,
                entidad_id=ob.id,
                entidad_tipo='Obligacion',
                prioridad='MEDIA',
                estado='PENDIENTE' if ob.estado != 'cumplido' else 'CUMPLIDO'
            )
