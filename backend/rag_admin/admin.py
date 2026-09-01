import json
from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.shortcuts import redirect, render, get_object_or_404
from django.urls import path, reverse
from django.contrib import messages

from .models import AuditoriaIaEmpresa, RegistroAuditoriaRAG
from api.services.rag_engine.audit_service import GrcAuditService


@admin.register(AuditoriaIaEmpresa)
class AuditoriaIaEmpresaAdmin(admin.ModelAdmin):
    list_display = (
        'nombre', 'rubro', 'rango_empleados',
        'get_triggers_badge', 'get_estado_ia_badge', 'get_total_normas', 'get_total_tareas',
        'acciones_rag_btn'
    )
    list_filter = ('rubro', 'rango_empleados', 'estado_matching', 'maneja_datos_personales', 'es_b2c_ecommerce', 'tiene_trabajadores')
    search_fields = ('nombre', 'rut', 'rubro')
    actions = ['ejecutar_rag_masivo']

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<int:object_id>/auditar-rag/', self.admin_site.admin_view(self.auditar_rag_view), name='rag_admin_auditar_empresa'),
        ]
        return custom_urls + urls

    def auditar_rag_view(self, request, object_id):
        empresa = self.get_object(request, object_id)
        if empresa:
            servicio = GrcAuditService()
            res = servicio.auditar_y_generar_borrador(empresa)
            if res.get("success"):
                registro_id = res.get("registro_id")
                messages.info(
                    request,
                    f"🤖 Diagnóstico IA generado para {empresa.nombre}. Por favor revisa y aprueba las normativas y tareas asignadas."
                )
                return redirect('admin:rag_admin_registroauditoriarag_revisar', object_id=registro_id)
            else:
                self.message_user(request, f"❌ Error ejecutando RAG: {res.get('error')}", level="ERROR")
        return redirect('admin:rag_admin_auditoriaiaempresa_changelist')

    def ejecutar_rag_masivo(self, request, queryset):
        servicio = GrcAuditService()
        auditadas = 0
        ultimo_registro_id = None
        for emp in queryset:
            r = servicio.auditar_y_generar_borrador(emp)
            if r.get("success"):
                auditadas += 1
                ultimo_registro_id = r.get("registro_id")
        
        if auditadas == 1 and queryset.count() == 1 and ultimo_registro_id:
            messages.info(request, "🤖 Diagnóstico IA generado. Por favor revisa y aprueba el borrador.")
            return redirect('admin:rag_admin_registroauditoriarag_revisar', object_id=ultimo_registro_id)

        self.message_user(request, f"🤖 Auditoría RAG masiva generada: {auditadas} borradores creados para revisión.", level="SUCCESS")
    ejecutar_rag_masivo.short_description = "🤖 Generar Borradores RAG + Ollama en lote"

    def get_triggers_badge(self, obj):
        badges = []
        if obj.maneja_datos_personales:
            badges.append('<span style="background:#0284c7; color:white; padding:2px 6px; border-radius:4px; font-size:10px; margin-right:3px;">Datos</span>')
        if obj.es_b2c_ecommerce:
            badges.append('<span style="background:#7c3aed; color:white; padding:2px 6px; border-radius:4px; font-size:10px; margin-right:3px;">E-commerce</span>')
        if obj.tiene_trabajadores:
            badges.append('<span style="background:#059669; color:white; padding:2px 6px; border-radius:4px; font-size:10px; margin-right:3px;">Trabajadores</span>')
        if not badges:
            return mark_safe('<span style="color:#64748b; font-size:11px;">Sin triggers</span>')
        return mark_safe(''.join(badges))
    get_triggers_badge.short_description = "Triggers Activos"

    def get_estado_ia_badge(self, obj):
        if obj.estado_matching == 'COMPLETADO':
            return mark_safe('<span style="background:#10b981; color:white; padding:3px 8px; border-radius:10px; font-weight:bold; font-size:11px;">✅ Auditada</span>')
        elif obj.estado_matching == 'PENDIENTE_REVISION':
            return mark_safe('<span style="background:#3b82f6; color:white; padding:3px 8px; border-radius:10px; font-weight:bold; font-size:11px;">🔍 En Revisión</span>')
        return mark_safe('<span style="background:#f59e0b; color:white; padding:3px 8px; border-radius:10px; font-weight:bold; font-size:11px;">⏳ Pendiente</span>')
    get_estado_ia_badge.short_description = "Estado RAG"

    def get_total_normas(self, obj):
        return obj.normativa_set.count()
    get_total_normas.short_description = "Normativas"

    def get_total_tareas(self, obj):
        return obj.tareas_pendientes.count()
    get_total_tareas.short_description = "Tareas"

    def acciones_rag_btn(self, obj):
        url = reverse('admin:rag_admin_auditar_empresa', args=[obj.id])
        return format_html(
            '<a href="{}" style="background:#10b981; color:white; padding:5px 10px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:11px; display:inline-block;">⚡ Auditar con RAG</a>',
            url
        )
    acciones_rag_btn.short_description = "Acción RAG"


@admin.register(RegistroAuditoriaRAG)
class RegistroAuditoriaRAGAdmin(admin.ModelAdmin):
    list_display = ('empresa', 'modelo_ia', 'fecha_ejecucion', 'normativas_detectadas', 'tareas_generadas', 'get_estado_badge', 'acciones_revision_btn')
    list_filter = ('estado', 'modelo_ia', 'exito', 'fecha_ejecucion')
    search_fields = ('empresa__nombre', 'resumen_ejecutivo')
    readonly_fields = ('empresa', 'modelo_ia', 'fecha_ejecucion', 'normativas_detectadas', 'tareas_generadas', 'estado', 'exito', 'resumen_ejecutivo', 'ver_json_visual')

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<int:object_id>/revisar/', self.admin_site.admin_view(self.revisar_borrador_view), name='rag_admin_registroauditoriarag_revisar'),
            path('<int:object_id>/aprobar/', self.admin_site.admin_view(self.aprobar_borrador_view), name='rag_admin_registroauditoriarag_aprobar'),
            path('<int:object_id>/rechazar/', self.admin_site.admin_view(self.rechazar_borrador_view), name='rag_admin_registroauditoriarag_rechazar'),
        ]
        return custom_urls + urls

    def revisar_borrador_view(self, request, object_id):
        registro = get_object_or_404(RegistroAuditoriaRAG, id=object_id)
        json_data = registro.datos_completos_json or {}
        context = {
            **self.admin_site.each_context(request),
            'title': f"Revisión de Auditoría: {registro.empresa.nombre}",
            'registro': registro,
            'json_data': json_data,
        }
        return render(request, 'admin/rag_admin/revisar_borrador.html', context)

    def aprobar_borrador_view(self, request, object_id):
        if request.method == 'POST':
            res = GrcAuditService.aprobar_y_aplicar_auditoria(object_id)
            if res.get("success"):
                self.message_user(
                    request,
                    f"✅ Auditoría aprobada con éxito. Se asignaron {res.get('normativas_asignadas')} normativas y {res.get('tareas_creadas')} tareas a la empresa.",
                    level="SUCCESS"
                )
            else:
                self.message_user(request, f"❌ Error al aprobar auditoría: {res.get('error')}", level="ERROR")
        return redirect('admin:rag_admin_registroauditoriarag_changelist')

    def rechazar_borrador_view(self, request, object_id):
        if request.method == 'POST':
            res = GrcAuditService.rechazar_auditoria(object_id)
            if res.get("success"):
                self.message_user(request, "❌ Borrador de auditoría descartado correctamente.", level="WARNING")
            else:
                self.message_user(request, f"Error: {res.get('error')}", level="ERROR")
        return redirect('admin:rag_admin_registroauditoriarag_changelist')

    def get_estado_badge(self, obj):
        if obj.estado == 'APROBADO':
            return mark_safe('<span style="background:#10b981; color:white; padding:3px 8px; border-radius:10px; font-weight:bold; font-size:11px;">✅ Aprobado</span>')
        elif obj.estado == 'RECHAZADO':
            return mark_safe('<span style="background:#ef4444; color:white; padding:3px 8px; border-radius:10px; font-weight:bold; font-size:11px;">❌ Rechazado</span>')
        return mark_safe('<span style="background:#f59e0b; color:white; padding:3px 8px; border-radius:10px; font-weight:bold; font-size:11px;">⏳ Pendiente</span>')
    get_estado_badge.short_description = "Estado Revisión"

    def acciones_revision_btn(self, obj):
        url = reverse('admin:rag_admin_registroauditoriarag_revisar', args=[obj.id])
        return format_html(
            '<a href="{}" style="background:#3b82f6; color:white; padding:4px 8px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:11px; display:inline-block;">🔍 Ver / Revisar</a>',
            url
        )
    acciones_revision_btn.short_description = "Revisión"

    def ver_json_visual(self, obj):
        if not obj.datos_completos_json:
            return mark_safe("<span style='color:gray;'>Sin JSON</span>")
        formateado = json.dumps(obj.datos_completos_json, indent=2, ensure_ascii=False)
        return mark_safe(f"<pre style='background:#1e293b; color:#38bdf8; padding:15px; border-radius:8px; max-height:400px; overflow:auto;'>{formateado}</pre>")
    ver_json_visual.short_description = "JSON Estructurado Generado por Ollama"

