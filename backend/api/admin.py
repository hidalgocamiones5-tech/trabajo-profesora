from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import (
    Empresa, PerfilUsuario, Normativa, ComplianceEmpresa, ObjetivoChecklist,
    TratamientoRAT, SolicitudTicket, Incidente, TareaPendiente, Riesgo,
    Sucursal, Area, Responsable, Obligacion, Control, Evidencia, Auditoria,
    PlanAccion, EventoCompliance, AlertaCompliance, HistoricoCumplimientoMensual
)

# ----------------------------------------------------
# INLINES PARA AUDITORÍA Y VERIFICACIÓN EN DJANGO ADMIN
# ----------------------------------------------------

class PerfilUsuarioInline(admin.StackedInline):
    model = PerfilUsuario
    can_delete = False
    extra = 0
    verbose_name_plural = 'Perfil de Usuario (Empresa)'

class ComplianceEmpresaInline(admin.TabularInline):
    model = ComplianceEmpresa
    extra = 0
    fields = ('normativa', 'estado', 'porcentaje_progreso', 'origen', 'updated_at')
    readonly_fields = ('updated_at',)
    show_change_link = True

class ObjetivoChecklistInline(admin.TabularInline):
    model = ObjetivoChecklist
    extra = 0
    fields = ('nombre', 'categoria', 'estado', 'responsable')
    show_change_link = True

class TratamientoRATInline(admin.TabularInline):
    model = TratamientoRAT
    extra = 0
    fields = ('tratamiento', 'area', 'estado', 'base_licitud')
    show_change_link = True

class SucursalInline(admin.TabularInline):
    model = Sucursal
    extra = 0
    show_change_link = True

class AreaInline(admin.TabularInline):
    model = Area
    extra = 0
    show_change_link = True

class ObligacionInline(admin.TabularInline):
    model = Obligacion
    extra = 0
    fields = ('nombre', 'area', 'estado', 'criticidad', 'responsable', 'fecha_vencimiento')
    show_change_link = True

# ----------------------------------------------------
# ADMIN REGISTRATIONS
# ----------------------------------------------------

class UserAdmin(BaseUserAdmin):
    inlines = (PerfilUsuarioInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_empresa', 'get_cargo')
    
    def get_empresa(self, instance):
        if hasattr(instance, 'perfilusuario') and instance.perfilusuario.empresa:
            return instance.perfilusuario.empresa.nombre
        return "-"
    get_empresa.short_description = 'Empresa'

    def get_cargo(self, instance):
        if hasattr(instance, 'perfilusuario'):
            return instance.perfilusuario.cargo or "Sin cargo"
        return "-"
    get_cargo.short_description = 'Cargo'

admin.site.unregister(User)
admin.site.register(User, UserAdmin)

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'rut', 'rubro', 'tamano', 'rango_empleados', 'estado_matching', 'setup_completado', 'fecha_creacion')
    list_filter = ('rubro', 'tamano', 'rango_empleados', 'estado_matching', 'setup_completado', 'tipo_sociedad')
    search_fields = ('nombre', 'rut', 'comuna', 'direccion_matriz')
    inlines = [SucursalInline, AreaInline, ComplianceEmpresaInline, ObjetivoChecklistInline, TratamientoRATInline]
    
    fieldsets = (
        ('Datos Básicos', {
            'fields': ('nombre', 'nombre_fantasia', 'rut', 'tipo_sociedad', 'setup_completado')
        }),
        ('Perfil Operacional & Matching', {
            'fields': ('rubro', 'tamano', 'rango_empleados', 'estado_matching', 'log_matching')
        }),
        ('Triggers Legales', {
            'fields': (
                'maneja_datos_personales', 'es_b2c_ecommerce', 'procesa_pagos',
                'genera_residuos_rep', 'tiene_trabajadores', 'importa_exporta',
                'instalaciones_industriales', 'trabaja_con_estado', 'tiene_sindicato'
            )
        }),
        ('Ubicación', {
            'fields': ('comuna', 'direccion_matriz', 'region_operacion')
        })
    )

@admin.register(Normativa)
class NormativaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'codigo_bcn', 'criticidad', 'tipo', 'origen', 'es_transversal', 'min_empleados')
    list_filter = ('criticidad', 'tipo', 'es_transversal', 'origen')
    search_fields = ('nombre', 'codigo_bcn', 'descripcion', 'resumen')
    inlines = [ObligacionInline, ComplianceEmpresaInline]

@admin.register(ComplianceEmpresa)
class ComplianceEmpresaAdmin(admin.ModelAdmin):
    list_display = ('empresa', 'normativa', 'estado', 'porcentaje_progreso', 'origen', 'updated_at')
    list_filter = ('estado', 'origen', 'empresa')
    search_fields = ('empresa__nombre', 'normativa__nombre', 'justificacion_ia')
    actions = ['marcar_verificada', 'marcar_cumplida', 'aprobar_sugerencia_ia']

    def marcar_verificada(self, request, queryset):
        queryset.update(estado='VERIFICADA')
    marcar_verificada.short_description = "✅ Validar / Asignar formalmente a la empresa"

    def marcar_cumplida(self, request, queryset):
        queryset.update(estado='CUMPLIDA', porcentaje_progreso=100.0)
    marcar_cumplida.short_description = "🏆 Marcar como Cumplida (100% Verificado)"

    def aprobar_sugerencia_ia(self, request, queryset):
        queryset.filter(estado='SUGERIDA_IA').update(estado='ASIGNADA')
    aprobar_sugerencia_ia.short_description = "🤖 Aprobar sugerencia generada por IA"

@admin.register(ObjetivoChecklist)
class ObjetivoChecklistAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'categoria', 'estado', 'responsable')
    list_filter = ('empresa', 'estado', 'categoria')
    search_fields = ('nombre', 'responsable')

@admin.register(TratamientoRAT)
class TratamientoRATAdmin(admin.ModelAdmin):
    list_display = ('tratamiento', 'empresa', 'area', 'estado', 'base_licitud')
    list_filter = ('empresa', 'estado', 'area')
    search_fields = ('tratamiento', 'finalidad')

@admin.register(SolicitudTicket)
class SolicitudTicketAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'estado', 'prioridad', 'sla', 'fecha_limite')
    list_filter = ('empresa', 'estado', 'prioridad', 'sla')
    search_fields = ('nombre', 'solicitante', 'responsable')

@admin.register(Incidente)
class IncidenteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'tipo', 'estado', 'fecha')
    list_filter = ('empresa', 'tipo', 'estado')
    search_fields = ('nombre', 'denunciante')

@admin.register(TareaPendiente)
class TareaPendienteAdmin(admin.ModelAdmin):
    list_display = ('tarea', 'empresa', 'responsable_asignado', 'estado', 'fecha_vencimiento')
    list_filter = ('empresa', 'estado', 'responsable_asignado')
    search_fields = ('tarea', 'responsable_asignado')
    actions = ['marcar_al_dia']

    def marcar_al_dia(self, request, queryset):
        queryset.update(estado='al_dia')
    marcar_al_dia.short_description = "Marcar tareas seleccionadas como Al día"

@admin.register(Riesgo)
class RiesgoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'estado', 'impacto', 'probabilidad')
    list_filter = ('empresa', 'estado')
    search_fields = ('nombre', 'responsable')

@admin.register(Sucursal)
class SucursalAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'ciudad')
    list_filter = ('empresa', 'ciudad')

@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'sucursal', 'responsable_principal')
    list_filter = ('empresa', 'sucursal')

@admin.register(Responsable)
class ResponsableAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'area', 'cargo')
    list_filter = ('empresa', 'area')

@admin.register(Obligacion)
class ObligacionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'normativa', 'area', 'estado', 'criticidad', 'responsable')
    list_filter = ('estado', 'criticidad', 'normativa')

@admin.register(Control)
class ControlAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'obligacion', 'estado', 'periodicidad', 'responsable', 'ultima_ejecucion', 'proxima_ejecucion')
    list_filter = ('estado', 'periodicidad')

@admin.register(Evidencia)
class EvidenciaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'empresa', 'normativa', 'estado', 'version', 'fecha_vencimiento')
    list_filter = ('estado', 'empresa', 'normativa')

@admin.register(Auditoria)
class AuditoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'tipo', 'estado', 'fecha_inicio', 'hallazgos_count')
    list_filter = ('estado', 'tipo', 'empresa')

@admin.register(PlanAccion)
class PlanAccionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'estado', 'responsable', 'fecha_limite')
    list_filter = ('estado', 'empresa')

@admin.register(EventoCompliance)
class EventoComplianceAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'empresa', 'tipo', 'prioridad', 'estado', 'fecha_inicio')
    list_filter = ('estado', 'prioridad', 'tipo', 'empresa')

@admin.register(AlertaCompliance)
class AlertaComplianceAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'empresa', 'origen_modulo', 'criticidad', 'estado', 'fecha_generacion')
    list_filter = ('estado', 'criticidad', 'origen_modulo', 'empresa')

@admin.register(HistoricoCumplimientoMensual)
class HistoricoCumplimientoMensualAdmin(admin.ModelAdmin):
    list_display = ('empresa', 'mes', 'anio', 'porcentaje_cumplimiento')
    list_filter = ('empresa', 'anio', 'mes')
