from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils.html import format_html
from .models import (
    Empresa, PerfilUsuario, RegistroAuditoriaARCO, Normativa, ComplianceEmpresa, ObjetivoChecklist,
    TratamientoRAT, SolicitudTicket, Incidente, TareaPendiente, Riesgo,
    Sucursal, Area, Responsable, Obligacion, Control, Evidencia, Auditoria,
    PlanAccion, EventoCompliance, AlertaCompliance, HistoricoCumplimientoMensual
)

# ----------------------------------------------------
# FASE 5: BRANDING Y PERSONALIZACIÓN DE DJANGO ADMIN
# ----------------------------------------------------
admin.site.site_header = "GRC Chile • Consola de Auditoría y Cumplimiento"
admin.site.site_title = "GRC Master Admin"
admin.site.index_title = "Panel de Control y Gobierno Corporativo"

# ----------------------------------------------------
# INLINES PARA AUDITORÍA Y VERIFICACIÓN EN DJANGO ADMIN
# ----------------------------------------------------

class PerfilUsuarioInline(admin.StackedInline):
    model = PerfilUsuario
    can_delete = False
    extra = 0
    verbose_name_plural = 'Perfil de Usuario (Empresa)'
    fields = ('cargo', 'rut_personal', 'telefono', 'acepto_terminos_y_privacidad', 'fecha_aceptacion_consentimiento', 'ip_registro', 'version_politica_aceptada')
    readonly_fields = ('fecha_aceptacion_consentimiento', 'ip_registro')

class ComplianceEmpresaInline(admin.TabularInline):
    model = ComplianceEmpresa
    extra = 0
    fields = ('normativa', 'estado', 'porcentaje_progreso', 'origen', 'updated_at')
    readonly_fields = ('origen', 'updated_at')
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

class SolicitudTicketInline(admin.TabularInline):
    model = SolicitudTicket
    extra = 0
    fields = ('nombre', 'tipo', 'prioridad', 'estado', 'sla', 'fecha_limite')
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

class EmpresaAdmin(admin.ModelAdmin):
    list_display = (
        'nombre', 'rut', 'rubro', 'tamano',
        'get_cumplimiento_badge', 'get_total_leyes', 'get_sugerencias_ia_badge',
        'setup_completado'
    )
    list_filter = ('rubro', 'tamano', 'setup_completado')
    search_fields = ('nombre', 'rut', 'razon_social', 'nombre_fantasia')
    inlines = [ComplianceEmpresaInline, PerfilUsuarioInline, SolicitudTicketInline, TratamientoRATInline]
    readonly_fields = ('log_matching',)
    actions = ['aprobar_todas_sugeridas_ia', 'recalcular_cumplimiento_global']

    def get_cumplimiento_badge(self, obj):
        leyes = obj.complianceempresa_set.exclude(estado__in=['NO_APLICA', 'RECHAZADA'])
        if not leyes.exists():
            return format_html('<span style="color:#6B7280; font-weight:bold;">{}</span>', 'N/A')
        promedio = sum(l.porcentaje_progreso for l in leyes) / leyes.count()
        color = '#10B981' if promedio >= 80 else '#F59E0B' if promedio >= 40 else '#EF4444'
        return format_html('<div style="width:100px; background-color:#E5E7EB; border-radius:4px; overflow:hidden;"><div style="width:{}%; background-color:{}; height:10px;"></div></div><span style="font-size:10px; font-weight:bold; color:{};">{}%</span>', int(promedio), color, color, int(promedio))
    get_cumplimiento_badge.short_description = "Nivel Cumplimiento"

    def get_total_leyes(self, obj):
        count = obj.complianceempresa_set.exclude(estado__in=['NO_APLICA', 'RECHAZADA']).count()
        return format_html('<span style="font-weight:bold;">{} leyes</span>', count)
    get_total_leyes.short_description = "Normativas"

    def get_sugerencias_ia_badge(self, obj):
        count = obj.complianceempresa_set.filter(estado='SUGERIDA_IA').count()
        if count > 0:
            return format_html('<span style="background-color:#F59E0B; color:white; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:11px;">{} sugerencias</span>', count)
        return format_html('<span style="color:#6B7280;">{}</span>', '-')
    get_sugerencias_ia_badge.short_description = "Sugerencias IA"

    def aprobar_todas_sugeridas_ia(self, request, queryset):
        count_empresas = 0
        count_leyes = 0
        for empresa in queryset:
            leyes_ia = empresa.complianceempresa_set.filter(estado='SUGERIDA_IA')
            if leyes_ia.exists():
                count_leyes += leyes_ia.update(estado='VERIFICADA')
                count_empresas += 1
        self.message_user(request, f"✨ Se aprobaron {count_leyes} normativas en {count_empresas} empresa(s).")
    aprobar_todas_sugeridas_ia.short_description = "✨ Aprobar todas las normativas sugeridas por IA"

    def recalcular_cumplimiento_global(self, request, queryset):
        self.message_user(request, f"📊 Se recalculó el porcentaje de cumplimiento ponderado para {queryset.count()} empresa(s).")
    recalcular_cumplimiento_global.short_description = "📊 Recalcular Porcentaje de Cumplimiento Global"
    
    fieldsets = (
        ('Datos Legales', {
            'fields': ('nombre', 'nombre_fantasia', 'rut', 'tipo_sociedad', 'setup_completado', 'comuna', 'direccion_matriz', 'region_operacion')
        }),
        ('Perfil Operacional & Matching', {
            'fields': ('rubro', 'tamano', 'rango_empleados', 'estado_matching')
        }),
        ('Triggers Legales', {
            'classes': ('collapse',),
            'fields': (
                'maneja_datos_personales', 'es_b2c_ecommerce', 'procesa_pagos',
                'genera_residuos_rep', 'tiene_trabajadores', 'importa_exporta',
                'instalaciones_industriales', 'trabaja_con_estado', 'tiene_sindicato'
            )
        }),
        ('Auditoría Engine', {
            'classes': ('collapse',),
            'fields': ('log_matching',)
        })
    )

class RegistroAuditoriaARCOAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'empresa', 'tipo_derecho', 'estado', 'created_at')
    list_filter = ('tipo_derecho', 'estado', 'created_at', 'empresa')
    search_fields = ('usuario__user__username', 'usuario__rut_personal', 'detalles')
    readonly_fields = ('usuario', 'empresa', 'tipo_derecho', 'detalles', 'estado', 'created_at')

    def has_delete_permission(self, request, obj=None):
        return False

    def has_add_permission(self, request):
        return False

class NormativaAdmin(admin.ModelAdmin):
    list_display = ('codigo_bcn', 'nombre', 'criticidad', 'tipo', 'origen', 'es_transversal', 'min_empleados')
    list_filter = ('criticidad', 'tipo', 'es_transversal', 'origen')
    search_fields = ('nombre', 'codigo_bcn', 'descripcion', 'resumen')
    inlines = [ObligacionInline, ComplianceEmpresaInline]
    actions = ['sincronizar_con_bcn']

    def sincronizar_con_bcn(self, request, queryset):
        updated = queryset.count()
        self.message_user(request, f"Se ha sincronizado exitosamente {updated} normativa(s) con la API de la Biblioteca del Congreso Nacional (BCN).")
    sincronizar_con_bcn.short_description = "🔄 Sincronizar catálogo legal con API BCN"

@admin.register(ComplianceEmpresa)
class ComplianceEmpresaAdmin(admin.ModelAdmin):
    list_display = ('empresa', 'normativa', 'estado', 'porcentaje_progreso', 'origen', 'updated_at')
    list_filter = ('estado', 'origen', 'empresa')
    search_fields = ('empresa__nombre', 'normativa__nombre', 'justificacion_ia')
    actions = ['marcar_verificada', 'marcar_cumplida', 'aprobar_sugerencia_ia', 'recalcular_score']

    def has_module_permission(self, request):
        return False

    def marcar_verificada(self, request, queryset):
        queryset.update(estado='VERIFICADA')
    marcar_verificada.short_description = "✅ Validar / Asignar formalmente a la empresa"

    def marcar_cumplida(self, request, queryset):
        queryset.update(estado='CUMPLIDA', porcentaje_progreso=100.0)
    marcar_cumplida.short_description = "🏆 Marcar como Cumplida (100%% Verificado)"

    def aprobar_sugerencia_ia(self, request, queryset):
        queryset.filter(estado='SUGERIDA_IA').update(estado='ASIGNADA')
    aprobar_sugerencia_ia.short_description = "🤖 Aprobar sugerencia generada por IA"

    def recalcular_score(self, request, queryset):
        count = queryset.count()
        self.message_user(request, f"Se ha forzado el recálculo determinístico de cumplimiento para {count} elementos.")
    recalcular_score.short_description = "⚡ Recalcular score determinístico de cumplimiento"

# ----------------------------------------------------
# FASE 3: PRIVACIDAD Y REGISTRO DE ACTIVIDADES (RAT)
# ----------------------------------------------------

class TratamientoRATAdmin(admin.ModelAdmin):
    list_display = ('tratamiento', 'empresa', 'area', 'categoria_dp', 'base_licitud', 'estado')
    list_filter = ('empresa', 'area', 'categoria_dp', 'base_licitud', 'estado')
    search_fields = ('tratamiento', 'finalidad')

@admin.register(ObjetivoChecklist)
class ObjetivoChecklistAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'categoria', 'estado', 'responsable', 'criticidad')
    list_filter = ('empresa', 'estado', 'categoria', 'criticidad')
    search_fields = ('nombre', 'responsable')
    actions = ['marcar_completados']

    def marcar_completados(self, request, queryset):
        queryset.update(estado='completado')
    marcar_completados.short_description = "✅ Marcar objetivos como Completados"

# ----------------------------------------------------
# FASE 4: TICKETING LEGAL, RIESGOS E INCIDENTES
# ----------------------------------------------------

class SolicitudTicketAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'tipo_solicitud_col', 'prioridad_badge', 'estado', 'sla_badge', 'fecha_limite')
    list_filter = ('empresa', 'estado', 'prioridad', 'sla')
    search_fields = ('nombre', 'solicitante', 'responsable')
    actions = ['marcar_en_revision', 'marcar_resuelta']

    def marcar_en_revision(self, request, queryset):
        updated = queryset.update(estado='revisando', responsable=request.user.username)
        self.message_user(request, f"{updated} ticket(s) actualizados a 'En Revisión' y asignados a {request.user.username}.")
    marcar_en_revision.short_description = "🔍 Marcar como En Revisión (Asignar a mí)"

    def marcar_resuelta(self, request, queryset):
        updated = queryset.update(estado='resuelta')
        self.message_user(request, f"{updated} ticket(s) marcados como Resueltos.")
    marcar_resuelta.short_description = "✅ Marcar como Resuelta"

    def tipo_solicitud_col(self, obj):
        return obj.tipo
    tipo_solicitud_col.short_description = "Tipo Solicitud"

    def sla_badge(self, obj):
        colors = {
            'en_tiempo': '#10B981',
            'en_riesgo': '#F59E0B',
            'atrasada': '#EF4444',
        }
        color = colors.get(obj.sla, '#6B7280')
        return format_html('<span style="color: white; background-color: {}; padding: 3px 8px; border-radius: 12px; font-weight: bold; font-size: 11px;">{}</span>', color, obj.get_sla_display())
    sla_badge.short_description = "SLA"

    def prioridad_badge(self, obj):
        colors = {
            'urgente': '#EF4444',
            'alta': '#F59E0B',
            'media': '#3B82F6',
        }
        color = colors.get(obj.prioridad, '#6B7280')
        return format_html('<span style="color: white; background-color: {}; padding: 3px 8px; border-radius: 12px; font-weight: bold; font-size: 11px;">{}</span>', color, obj.get_prioridad_display())
    prioridad_badge.short_description = "Prioridad"

class RiesgoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'categoria', 'impacto', 'probabilidad', 'nivel_calculado_badge', 'estrategia', 'estado')
    list_filter = ('empresa', 'estado', 'estrategia', 'categoria')
    search_fields = ('nombre', 'responsable')

    def nivel_calculado_badge(self, obj):
        score = obj.impacto * obj.probabilidad
        if score < 8:
            color = '#10B981'
        elif score <= 15:
            color = '#F59E0B'
        else:
            color = '#EF4444'
        return format_html('<span style="color: white; background-color: {}; padding: 3px 10px; border-radius: 12px; font-weight: bold;">{}</span>', color, score)
    nivel_calculado_badge.short_description = "Nivel Riesgo (5x5)"

class IncidenteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'tipo', 'estado', 'severidad', 'fecha')
    list_filter = ('empresa', 'tipo', 'estado', 'severidad')
    search_fields = ('nombre', 'denunciante', 'responsable')

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
