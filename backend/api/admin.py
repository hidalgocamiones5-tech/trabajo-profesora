from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import (
    Empresa, PerfilUsuario, Normativa, ObjetivoChecklist,
    TratamientoRAT, SolicitudTicket, Incidente, TareaPendiente, Riesgo
)

# PerfilUsuario Inline for the User page
class PerfilUsuarioInline(admin.StackedInline):
    model = PerfilUsuario
    can_delete = False
    verbose_name_plural = 'Perfil de Usuario (Empresa)'

class UserAdmin(BaseUserAdmin):
    inlines = (PerfilUsuarioInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_empresa')
    
    def get_empresa(self, instance):
        if hasattr(instance, 'perfilusuario'):
            return instance.perfilusuario.empresa.nombre
        return "-"
    get_empresa.short_description = 'Empresa'

admin.site.unregister(User)
admin.site.register(User, UserAdmin)

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'rut', 'fecha_creacion')
    search_fields = ('nombre', 'rut')

@admin.register(Normativa)
class NormativaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'estado', 'criticidad', 'progreso')
    list_filter = ('empresa', 'estado', 'criticidad')
    search_fields = ('nombre',)
    actions = ['marcar_completada']

    def marcar_completada(self, request, queryset):
        queryset.update(estado='completada', progreso=100)
    marcar_completada.short_description = "Marcar normativas seleccionadas como Completadas"

@admin.register(ObjetivoChecklist)
class ObjetivoChecklistAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'empresa', 'categoria', 'estado', 'responsable')
    list_filter = ('empresa', 'estado', 'categoria')
    search_fields = ('nombre', 'responsable')

@admin.register(TratamientoRAT)
class TratamientoRATAdmin(admin.ModelAdmin):
    list_display = ('tratamiento', 'empresa', 'area', 'estado')
    list_filter = ('empresa', 'estado', 'area')
    search_fields = ('tratamiento',)

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
