from django.contrib import admin
from .models import SolicitudARCO, IncidenteKarin, RiesgoPenal, ControlRiesgo

@admin.register(SolicitudARCO)
class SolicitudARCOAdmin(admin.ModelAdmin):
    list_display = ('ticket_id', 'empresa', 'tipo_arco', 'solicitante_email', 'estado', 'fecha_vencimiento_sla', 'responsable')
    list_filter = ('estado', 'tipo_arco', 'empresa')
    search_fields = ('ticket_id', 'solicitante_nombre', 'solicitante_email')
    readonly_fields = ('fecha_ingreso',)

@admin.register(IncidenteKarin)
class IncidenteKarinAdmin(admin.ModelAdmin):
    list_display = ('ticket_id', 'empresa', 'es_anonimo', 'estado', 'fecha_ingreso', 'responsable')
    list_filter = ('estado', 'empresa', 'es_anonimo')
    search_fields = ('ticket_id', 'descripcion_hechos')
    readonly_fields = ('fecha_ingreso',)

class ControlRiesgoInline(admin.TabularInline):
    model = ControlRiesgo
    extra = 1

@admin.register(RiesgoPenal)
class RiesgoPenalAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'nivel_inherente')
    list_filter = ('nivel_inherente', 'empresa')
    search_fields = ('nombre',)
    inlines = [ControlRiesgoInline]

@admin.register(ControlRiesgo)
class ControlRiesgoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'riesgo', 'responsable', 'fecha_proxima_revision', 'estado_evidencia')
    list_filter = ('estado_evidencia', 'fecha_proxima_revision')
    search_fields = ('nombre', 'riesgo__nombre')
