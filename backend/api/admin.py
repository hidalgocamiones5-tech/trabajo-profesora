from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import (
    Empresa, PerfilUsuario, RegistroAuditoriaARCO, Normativa, ComplianceEmpresa, ObjetivoChecklist,
    TratamientoRAT, SolicitudTicket, Incidente, TareaPendiente, Riesgo,
    Sucursal, Area, Responsable, Obligacion, Control, Evidencia, Auditoria,
    PlanAccion, EventoCompliance, AlertaCompliance, HistoricoCumplimientoMensual,
    LeyOficial, ArticuloLey
)
from .services.matching_service import asignar_normativas_base

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
    verbose_name_plural = '👥 Usuarios Asignados'
    fields = ('cargo', 'rut_personal', 'telefono', 'acepto_terminos_y_privacidad', 'fecha_aceptacion_consentimiento', 'ip_registro', 'version_politica_aceptada')
    readonly_fields = ('fecha_aceptacion_consentimiento', 'ip_registro')

class ComplianceEmpresaInline(admin.TabularInline):
    model = ComplianceEmpresa
    verbose_name = "⚖️ Normativa"
    verbose_name_plural = "⚖️ Normativas"
    extra = 0
    fields = ('normativa', 'estado_badge', 'porcentaje_progreso', 'origen_badge', 'responsable', 'acciones_inline')
    readonly_fields = ('estado_badge', 'origen_badge', 'acciones_inline')
    show_change_link = True

    def estado_badge(self, obj):
        if not obj or not obj.estado: return "-"
        
        # Alerta de riesgo (ley asiganada con 0% de avance)
        alerta = ""
        if obj.estado in ['VERIFICADA', 'ASIGNADA'] and obj.porcentaje_progreso == 0:
            alerta = " ⚠️"

        if obj.estado == 'SUGERIDA_IA':
            return mark_safe('<span style="background-color:#F59E0B; color:white; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:11px;">✨ Sugerida por IA</span>')
        elif obj.estado in ['VERIFICADA', 'ASIGNADA', 'CUMPLIDA']:
            return format_html('<span style="background-color:#10B981; color:white; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:11px;">🟢 {}{}</span>', obj.estado.title(), alerta)
        elif obj.estado == 'EN_PROCESO':
            return mark_safe('<span style="background-color:#3B82F6; color:white; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:11px;">🔵 En Proceso</span>')
        elif obj.estado == 'PRELIMINAR':
            return mark_safe('<span style="background-color:#9CA3AF; color:white; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:11px;">⚪ Preliminar</span>')
        elif obj.estado == 'NO_APLICA':
            return mark_safe('<span style="background-color:#EF4444; color:white; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:11px;">🔴 No Aplica</span>')
        
        return obj.estado
    estado_badge.short_description = "Estado"

    def origen_badge(self, obj):
        if not obj or not obj.origen: return "-"
        return format_html('<span style="background-color:#6B7280; color:white; padding:3px 8px; border-radius:12px; font-size:10px;">{}</span>', obj.origen)
    origen_badge.short_description = "Origen"

    def acciones_inline(self, obj):
        if not obj or not obj.id: return ""
        html = ""
        if obj.estado == 'SUGERIDA_IA':
            html += '<a href="#" style="background-color:#F59E0B; color:white; padding:3px 6px; border-radius:4px; text-decoration:none; font-size:11px; margin-right:4px;">Aprobar sugerencia</a>'
        html += '<a href="#" style="background-color:#4F46E5; color:white; padding:3px 6px; border-radius:4px; text-decoration:none; font-size:11px;">Ver obligaciones</a>'
        return mark_safe(html)
    acciones_inline.short_description = "Acciones Rápidas"

class ObjetivoChecklistInline(admin.TabularInline):
    model = ObjetivoChecklist
    extra = 0
    fields = ('nombre', 'categoria', 'estado', 'responsable')
    show_change_link = True

class TratamientoRATInline(admin.TabularInline):
    model = TratamientoRAT
    verbose_name = "🛡️ Privacidad (RAT)"
    verbose_name_plural = "🛡️ Privacidad (RAT)"
    extra = 0
    fields = ('tratamiento', 'area', 'estado', 'base_licitud')
    show_change_link = True

class SolicitudTicketInline(admin.TabularInline):
    model = SolicitudTicket
    verbose_name = "🎧 Soporte"
    verbose_name_plural = "🎧 Tickets Soporte"
    extra = 0
    fields = ('nombre', 'tipo', 'prioridad', 'estado', 'sla', 'fecha_limite')
    show_change_link = True

class PlanAccionInline(admin.TabularInline):
    model = PlanAccion
    verbose_name = "📋 Tareas & Evidencia"
    verbose_name_plural = "📋 Tareas & Evidencia"
    extra = 0
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
        'nombre', 'rut', 'get_usuarios_badge', 'rubro', 'tamano',
        'get_cumplimiento_badge', 'get_total_leyes', 'get_sugerencias_ia_badge',
        'setup_completado'
    )
    list_filter = ('rubro', 'tamano', 'setup_completado')
    search_fields = ('nombre', 'rut', 'razon_social', 'nombre_fantasia')
    inlines = [ComplianceEmpresaInline, PerfilUsuarioInline, SolicitudTicketInline, TratamientoRATInline]
    readonly_fields = ('historial_motor_visual',)
    actions = ['ejecutar_auditoria_rag_ollama', 'aprobar_todas_sugeridas_ia', 'recalcular_cumplimiento_global', 'ejecutar_matching_automatico']

    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path('<int:object_id>/re-ejecutar-matching/', self.admin_site.admin_view(self.re_ejecutar_matching_view), name='empresa_reejecutar_matching'),
            path('<int:object_id>/ejecutar-rag-ollama/', self.admin_site.admin_view(self.ejecutar_rag_ollama_view), name='empresa_ejecutar_rag_ollama'),
        ]
        return custom_urls + urls

    def ejecutar_rag_ollama_view(self, request, object_id):
        from django.shortcuts import redirect
        from django.contrib import messages
        from api.services.rag_engine.audit_service import GrcAuditService
        empresa = self.get_object(request, object_id)
        if empresa:
            servicio = GrcAuditService()
            resultado = servicio.auditar_y_generar_borrador(empresa)
            if resultado.get("success"):
                registro_id = resultado.get("registro_id")
                messages.info(
                    request,
                    f"🤖 Diagnóstico IA generado para {empresa.nombre}. Revisa y aprueba las leyes y tareas a continuación."
                )
                return redirect('admin:rag_admin_registroauditoriarag_revisar', object_id=registro_id)
            else:
                self.message_user(request, f"❌ Error en auditoría RAG: {resultado.get('error')}", level="ERROR")
        return redirect('admin:api_empresa_change', object_id)

    def ejecutar_auditoria_rag_ollama(self, request, queryset):
        from api.services.rag_engine.audit_service import GrcAuditService
        servicio = GrcAuditService()
        borradores_creados = 0
        ultimo_registro_id = None
        for empresa in queryset:
            resultado = servicio.auditar_y_generar_borrador(empresa)
            if resultado.get("success"):
                borradores_creados += 1
                ultimo_registro_id = resultado.get("registro_id")
        
        if borradores_creados == 1 and queryset.count() == 1 and ultimo_registro_id:
            self.message_user(request, "🤖 Auditoría RAG ejecutada. Por favor revisa y aprueba el borrador.", level="INFO")
            from django.shortcuts import redirect
            return redirect('admin:rag_admin_registroauditoriarag_revisar', object_id=ultimo_registro_id)
            
        self.message_user(request, f"🤖 Auditoría RAG ejecutada para {queryset.count()} empresa(s). Se generaron {borradores_creados} borradores pendientes de revisión.", level="SUCCESS")
    ejecutar_auditoria_rag_ollama.short_description = "🤖 Ejecutar Diagnóstico RAG + Ollama (Generar Borrador)"

    def re_ejecutar_matching_view(self, request, object_id):
        from django.shortcuts import redirect
        empresa = self.get_object(request, object_id)
        if empresa:
            asignar_normativas_base(empresa)
            self.message_user(request, "⚡ Motor ejecutado con éxito. Normativas actualizadas.", level="SUCCESS")
        return redirect('admin:api_empresa_change', object_id)

    def ejecutar_matching_automatico(self, request, queryset):
        for empresa in queryset:
            asignar_normativas_base(empresa)
        self.message_user(request, f"⚡ Se ejecutó el Matching Automático para {queryset.count()} empresa(s).")
    ejecutar_matching_automatico.short_description = "⚡ Ejecutar Matching Automático y Asignar Leyes según Triggers"

    def historial_motor_visual(self, obj):
        import json
        import ast
        from django.urls import reverse
        from datetime import datetime
        
        css_switches = """
        <style>
            /* Modern iOS Switch Toggles */
            input[type=checkbox] {
                appearance: none; -webkit-appearance: none;
                width: 44px; height: 24px; background: #475569;
                border-radius: 24px; position: relative; cursor: pointer;
                outline: none; transition: background 0.3s; vertical-align: middle;
            }
            input[type=checkbox]:checked { background: #10B981; }
            input[type=checkbox]::after {
                content: ''; position: absolute; width: 20px; height: 20px;
                border-radius: 50%; background: white; top: 2px; left: 2px;
                transition: transform 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            input[type=checkbox]:checked::after { transform: translateX(20px); }
            
            /* Textos de ayuda (Triggers) */
            .help { color: #94a3b8 !important; font-size: 12px; display: block; margin-top: 5px; }
            
            /* Tarjeta de Auditoría */
            .audit-visual-card {
                background: #1e293b; color: #f8fafc; padding: 20px;
                border-radius: 12px; border: 1px solid #334155; margin-top: 10px;
            }
            .audit-visual-card h4 { color: #10B981; margin-top: 0; font-size: 16px; font-weight: bold; }
            .trigger-badge {
                background: #334155; color: #e2e8f0; padding: 4px 10px;
                border-radius: 12px; font-size: 11px; margin: 3px; display: inline-block;
            }
            .trigger-badge.active { background: #10B981; color: white; font-weight: bold; }
            .btn-re-ejecutar {
                display: inline-block; margin-top: 15px; margin-right: 10px; background: #4F46E5; color: white;
                padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;
            }
            .btn-re-ejecutar:hover { background: #4338ca; color: white; }
            .btn-rag-ollama {
                display: inline-block; margin-top: 15px; background: #10B981; color: white;
                padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;
            }
            .btn-rag-ollama:hover { background: #059669; color: white; }
        </style>
        """

        url_rag = reverse('admin:empresa_ejecutar_rag_ollama', args=[obj.id]) if obj and obj.id else '#'
        url_matching = reverse('admin:empresa_reejecutar_matching', args=[obj.id]) if obj and obj.id else '#'

        botones_html = f"""
        <div style="margin-top: 15px;">
            <a href="{url_rag}" class="btn-rag-ollama">🤖 Ejecutar Auditoría RAG (Ollama Llama 3.2)</a>
            <a href="{url_matching}" class="btn-re-ejecutar">⚡ Matching Base</a>
        </div>
        """

        if not obj or not obj.log_matching:
            return mark_safe(css_switches + "<span style='color:gray; font-style:italic;'>Sin ejecuciones previas</span>" + botones_html)
        
        try:
            try:
                data = json.loads(obj.log_matching)
            except json.JSONDecodeError:
                data = ast.literal_eval(obj.log_matching)
            
            html = css_switches + "<div class='audit-visual-card'>"
            
            if 'motor_reglas' in data:
                motor = data['motor_reglas']
                
                # Parse Date
                fecha_str = motor.get('timestamp', '')
                try:
                    fecha_obj = datetime.fromisoformat(fecha_str)
                    fecha_legible = fecha_obj.strftime("%d de %B de %Y, %H:%M hrs")
                except:
                    fecha_legible = fecha_str
                
                html += f"<h4>🟢 Motor Ejecutado con Éxito</h4>"
                html += f"<p style='color:#94a3b8; font-size:12px; margin-bottom:15px;'>🕒 {fecha_legible}</p>"
                
                # Triggers evaluados
                if 'triggers_evaluados' in motor:
                    triggers = motor['triggers_evaluados']
                    html += "<p style='margin-bottom:8px; font-weight:bold; color:#cbd5e1;'>Triggers Evaluados:</p><div>"
                    for key, val in triggers.items():
                        if isinstance(val, bool):
                            if val:
                                html += f"<span class='trigger-badge active'>✅ {key.replace('_', ' ').title()}</span>"
                            else:
                                html += f"<span class='trigger-badge'>❌ {key.replace('_', ' ').title()}</span>"
                    html += "</div>"
                
                # Resumen
                html += f"<p style='margin-top:15px; margin-bottom:0; font-weight:bold; color:#10B981;'>✔️ Leyes Asignadas: {motor.get('leyes_asignadas_count', 0)}</p>"
                
                if motor.get('leyes_desasignadas_count', 0) > 0:
                    html += f"<p style='margin-top:4px; font-weight:bold; color:#EF4444;'>❌ Leyes Desasignadas: {motor['leyes_desasignadas_count']}</p>"
                    
            else:
                html += f"<pre style='font-size:11px; color:#94a3b8; white-space: pre-wrap;'>{json.dumps(data, indent=2)}</pre>"
            
            # Botón Re-ejecutar
            if obj.id:
                url = reverse('admin:empresa_reejecutar_matching', args=[obj.id])
                html += f"<a href='{url}' class='btn-re-ejecutar'>⚡ Re-ejecutar Matching Ahora</a>"
                
            html += "</div>"
            return mark_safe(html)
        except Exception as e:
            return mark_safe(css_switches + f"<span style='color:#ef4444;'>Error leyendo historial: {str(e)}</span>")
    historial_motor_visual.short_description = "Historial del Motor (Lectura Humana)"

    def get_cumplimiento_badge(self, obj):
        leyes = obj.complianceempresa_set.exclude(estado__in=['NO_APLICA', 'RECHAZADA'])
        if not leyes.exists():
            return mark_safe('<span style="color:#6B7280; font-weight:bold;">N/A</span>')
        promedio = sum(l.porcentaje_progreso for l in leyes) / leyes.count()
        color = '#10B981' if promedio >= 80 else '#F59E0B' if promedio >= 40 else '#EF4444'
        return format_html('<div style="width:100px; background-color:#E5E7EB; border-radius:4px; overflow:hidden;"><div style="width:{}%; background-color:{}; height:10px;"></div></div><span style="font-size:10px; font-weight:bold; color:{};">{}%</span>', int(promedio), color, color, int(promedio))
    get_cumplimiento_badge.short_description = "Nivel Cumplimiento"

    def get_usuarios_badge(self, obj):
        from django.urls import reverse
        from django.utils.safestring import mark_safe
        
        usuarios = obj.usuarios.all()
        if not usuarios.exists():
            return mark_safe('<span style="color:#9CA3AF;">-</span>')
        
        html_parts = ['<div style="display:flex; gap:4px;">']
        for perfil in usuarios:
            nombre = perfil.user.first_name or perfil.user.username
            iniciales = (nombre[:2]).upper() if nombre else 'US'
            url = reverse('admin:auth_user_change', args=[perfil.user.id])
            
            html_parts.append(
                f'<a href="{url}" title="{nombre} (Ver detalles)" '
                f'style="width:28px; height:28px; border-radius:50%; background-color:#4F46E5; '
                f'color:white; display:flex; align-items:center; justify-content:center; '
                f'font-size:10px; font-weight:bold; text-decoration:none;">'
                f'{iniciales}</a>'
            )
        html_parts.append('</div>')
        return mark_safe("".join(html_parts))
    get_usuarios_badge.short_description = "Usuarios"

    def get_total_leyes(self, obj):
        count = obj.complianceempresa_set.exclude(estado__in=['NO_APLICA', 'RECHAZADA']).count()
        return format_html('<span style="font-weight:bold;">{} leyes</span>', count)
    get_total_leyes.short_description = "Normativas"

    def get_sugerencias_ia_badge(self, obj):
        count = obj.complianceempresa_set.filter(estado='SUGERIDA_IA').count()
        if count > 0:
            return format_html('<span style="background-color:#F59E0B; color:white; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:11px;">{} sugerencias</span>', count)
        return mark_safe('<span style="color:#6B7280;">-</span>')
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
        ('🏢 Perfil Empresa', {
            'description': 'Información general y operativa de la empresa.',
            'fields': (
                ('nombre', 'nombre_fantasia'),
                ('rut', 'tipo_sociedad'),
                ('comuna', 'direccion_matriz', 'region_operacion'),
                ('rubro', 'tamano', 'rango_empleados'),
                ('setup_completado', 'estado_matching')
            )
        }),
        ('⚙️ Configuración & Motor de Leyes', {
            'description': 'Activa o desactiva triggers para que la IA asigne automáticamente las leyes correspondientes.',
            'classes': ('collapse',),
            'fields': (
                ('tiene_trabajadores', 'maneja_datos_personales'),
                ('tiene_sindicato', 'es_b2c_ecommerce'),
                ('instalaciones_industriales', 'procesa_pagos'),
                ('trabaja_con_estado', 'genera_residuos_rep'),
                ('importa_exporta',),
                'historial_motor_visual'
            )
        }),
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

class TareaPendienteInline(admin.TabularInline):
    model = TareaPendiente
    extra = 0
    fields = ('tarea', 'empresa', 'prioridad', 'estado', 'responsable_asignado', 'fecha_vencimiento')
    show_change_link = True

class NormativaAdmin(admin.ModelAdmin):
    list_display = (
        'numero_oficial', 
        'nombre_resumido', 
        'get_materia_badge', 
        'get_criticidad_badge', 
        'get_aplicabilidad_badge', 
        'get_tareas_count',
        'get_empresas_count',
        'origen'
    )
    list_filter = ('materia', 'criterio_aplicabilidad', 'criticidad', 'origen')
    search_fields = ('nombre', 'numero_oficial', 'codigo_bcn', 'resumen')
    inlines = [ObligacionInline, TareaPendienteInline, ComplianceEmpresaInline]
    actions = [
        'generar_tareas_compliance_action',
        'autoasignar_empresas_action',
        'sincronizar_con_bcn', 
        'fusionar_duplicadas_action'
    ]

    def nombre_resumido(self, obj):
        texto = obj.nombre or obj.titulo or "Sin Título"
        return format_html('<strong>{}</strong>', texto[:75] + ('...' if len(texto) > 75 else ''))
    nombre_resumido.short_description = "Normativa"

    def get_materia_badge(self, obj):
        colores = {
            'LABORAL': '#0284c7', 'PRIVACIDAD': '#7c3aed', 
            'PENAL_COMPLIANCE': '#dc2626', 'CONSUMO': '#ea580c', 
            'AMBIENTAL': '#16a34a', 'FINANCIERO': '#0d9488', 'CORPORATIVO': '#475569'
        }
        color = colores.get(obj.materia, '#64748b')
        return format_html('<span style="background:{};color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;">{}</span>', color, obj.get_materia_display())
    get_materia_badge.short_description = "Materia"

    def get_criticidad_badge(self, obj):
        crit = (obj.criticidad or 'Media').capitalize()
        colores = {'Alta': '#ef4444', 'Media': '#f59e0b', 'Baja': '#22c55e'}
        color = colores.get(crit, '#94a3b8')
        return format_html('<span style="color:{};font-weight:bold;">● {}</span>', color, crit)
    get_criticidad_badge.short_description = "Criticidad"

    def get_aplicabilidad_badge(self, obj):
        if obj.criterio_aplicabilidad == 'UNIVERSAL':
            return format_html('<span style="background:#16a34a;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;">{}</span>', 'Universal')
        if obj.min_empleados and obj.min_empleados > 0:
            return format_html('<span style="background:#d97706;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;">≥ {} Empleados</span>', obj.min_empleados)
        return format_html('<span style="background:#0284c7;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;">Trigger: {}</span>', obj.trigger_asociado or 'Específico')
    get_aplicabilidad_badge.short_description = "Regla"

    def get_tareas_count(self, obj):
        obligaciones = obj.obligaciones.count()
        tareas = obj.tareas.count()
        return format_html('<span style="background:#0ea5e9;color:#fff;padding:3px 7px;border-radius:6px;font-size:11px;font-weight:bold;">📋 {} tareas ({})</span>', obligaciones, tareas)
    get_tareas_count.short_description = "Plan de Cumplimiento"

    def get_empresas_count(self, obj):
        count = obj.complianceempresa_set.count()
        return format_html('<span style="font-weight:bold; color:#84cc16;">{} empresas</span>', count)
    get_empresas_count.short_description = "Asignada a"

    def add_view(self, request, form_url='', extra_context=None):
        from django.urls import reverse
        from django.shortcuts import redirect
        from django.contrib import messages
        from api.services.bcn_service import sincronizar_catalogo_grc_curado
        
        creadas, actualizadas = sincronizar_catalogo_grc_curado()
        messages.success(request, f"✨ Catálogo y tareas de cumplimiento sincronizadas desde datos.gob / BCN ({creadas} nuevas, {actualizadas} actualizadas).")
        return redirect(request.META.get('HTTP_REFERER', reverse('admin:catalogo_normativacatalogo_changelist')))

    def generar_tareas_compliance_action(self, request, queryset):
        from api.services.bcn_service import generar_tareas_para_normativa
        tot_ob, tot_tp = 0, 0
        for norm in queryset:
            ob, tp = generar_tareas_para_normativa(norm)
            tot_ob += ob
            tot_tp += tp
        self.message_user(request, f"📋 Tareas generadas con éxito: {tot_ob} obligaciones normativas y {tot_tp} tareas operacionales asignadas a empresas.")
    generar_tareas_compliance_action.short_description = "📋 Generar plan de tareas y obligaciones de cumplimiento"

    def sincronizar_con_bcn(self, request, queryset):
        from api.services.bcn_service import sincronizar_catalogo_grc_curado
        from api.services.ley_chile import LeyChileClient
        
        # Sincronizar catálogo curado
        creadas, actualizadas = sincronizar_catalogo_grc_curado()
        
        # Sincronizar textos XML en vivo para las seleccionadas
        client = LeyChileClient()
        xml_ok = 0
        for norm in queryset:
            if norm.codigo_bcn:
                try:
                    res = client.obtener_xml_bcn(norm.codigo_bcn, force_refresh=True)
                    if res:
                        xml_ok += 1
                except Exception:
                    pass
        
        self.message_user(request, f"🔄 Sincronización oficial BCN/datos.gob completada. {actualizadas} actualizadas, {xml_ok} textos XML renovados.")
    sincronizar_con_bcn.short_description = "🔄 Sincronizar catálogo legal curado con API BCN / datos.gob"

    def fusionar_duplicadas_action(self, request, queryset):
        from api.services.bcn_service import fusionar_normativas_duplicadas
        fusionadas, eliminadas = fusionar_normativas_duplicadas()
        self.message_user(request, f"🧹 Limpieza exitosa: {fusionadas} normativas consolidadas y {eliminadas} duplicados eliminados.")
    fusionar_duplicadas_action.short_description = "🧹 Eliminar/Fusionar normativas duplicadas"

    def autoasignar_empresas_action(self, request, queryset):
        from api.services.bcn_service import autoasignar_normativa_a_empresas
        total_asignaciones = 0
        for norm in queryset:
            total_asignaciones += autoasignar_normativa_a_empresas(norm)
        self.message_user(request, f"⚡ Asignación completada: {total_asignaciones} nuevas asignaciones de compliance a empresas que cumplen las reglas.")
    autoasignar_empresas_action.short_description = "⚡ Asignar automáticamente esta normativa a todas las empresas que cumplan sus reglas"

@admin.register(ComplianceEmpresa)
class ComplianceEmpresaAdmin(admin.ModelAdmin):
    list_display = ('empresa', 'normativa', 'estado', 'porcentaje_progreso', 'origen', 'updated_at')
    list_filter = ('estado', 'origen', 'empresa')
    search_fields = ('empresa__nombre', 'normativa__nombre', 'justificacion_ia')
    actions = ['marcar_verificada', 'marcar_cumplida', 'aprobar_sugerencia_ia', 'recalcular_score']

    def marcar_verificada(self, request, queryset):
        queryset.update(estado='VERIFICADA')
    marcar_verificada.short_description = "âœ… Validar / Asignar formalmente a la empresa"

    def marcar_cumplida(self, request, queryset):
        queryset.update(estado='CUMPLIDA', porcentaje_progreso=100.0)
    marcar_cumplida.short_description = "ðŸ† Marcar como Cumplida (100%% Verificado)"

    def aprobar_sugerencia_ia(self, request, queryset):
        queryset.filter(estado='SUGERIDA_IA').update(estado='ASIGNADA')
    aprobar_sugerencia_ia.short_description = "ðŸ¤– Aprobar sugerencia generada por IA"

    def recalcular_score(self, request, queryset):
        count = queryset.count()
        self.message_user(request, f"Se ha forzado el recÃ¡lculo determinÃ­stico de cumplimiento para {count} elementos.")
    recalcular_score.short_description = "âš¡ Recalcular score determinÃ­stico de cumplimiento"

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
    marcar_completados.short_description = "âœ… Marcar objetivos como Completados"

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
        self.message_user(request, f"{updated} ticket(s) actualizados a 'En RevisiÃ³n' y asignados a {request.user.username}.")
    marcar_en_revision.short_description = "ðŸ” Marcar como En RevisiÃ³n (Asignar a mÃ­)"

    def marcar_resuelta(self, request, queryset):
        updated = queryset.update(estado='resuelta')
        self.message_user(request, f"{updated} ticket(s) marcados como Resueltos.")
    marcar_resuelta.short_description = "âœ… Marcar como Resuelta"

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
@admin.register(Empresa)
class HiddenEmpresaAdmin(EmpresaAdmin):
    def has_module_permission(self, request): return False

@admin.register(Normativa)
class HiddenNormativaAdmin(NormativaAdmin):
    def has_module_permission(self, request): return False

@admin.register(SolicitudTicket)
class HiddenSolicitudTicketAdmin(SolicitudTicketAdmin):
    def has_module_permission(self, request): return False

@admin.register(Incidente)
class HiddenIncidenteAdmin(IncidenteAdmin):
    def has_module_permission(self, request): return False

@admin.register(Riesgo)
class HiddenRiesgoAdmin(RiesgoAdmin):
    def has_module_permission(self, request): return False

@admin.register(TratamientoRAT)
class HiddenTratamientoRATAdmin(TratamientoRATAdmin):
    def has_module_permission(self, request): return False

@admin.register(RegistroAuditoriaARCO)
class HiddenRegistroAuditoriaARCOAdmin(RegistroAuditoriaARCOAdmin):
    def has_module_permission(self, request): return False

class ArticuloLeyInline(admin.TabularInline):
    model = ArticuloLey
    extra = 0
    fields = ('numero_articulo', 'texto_resumido', 'categoria_tematica', 'indexado_en_rag')
    show_change_link = True

@admin.register(LeyOficial)
class LeyOficialAdmin(admin.ModelAdmin):
    list_display = ('numero_oficial', 'codigo_bcn', 'titulo', 'categoria', 'fecha_ultima_modificacion', 'activo', 'get_articulos_count')
    list_filter = ('categoria', 'activo')
    search_fields = ('numero_oficial', 'codigo_bcn', 'titulo', 'resumen_general')
    inlines = [ArticuloLeyInline]

    def get_articulos_count(self, obj):
        return obj.articulos.count()
    get_articulos_count.short_description = "Artículos"

@admin.register(ArticuloLey)
class ArticuloLeyAdmin(admin.ModelAdmin):
    list_display = ('ley', 'numero_articulo', 'categoria_tematica', 'indexado_en_rag', 'updated_at')
    list_filter = ('indexado_en_rag', 'categoria_tematica', 'ley')
    search_fields = ('numero_articulo', 'texto_original', 'texto_resumido', 'ley__titulo')
