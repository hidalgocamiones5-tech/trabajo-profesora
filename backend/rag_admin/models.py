from django.db import models
from api.models import Empresa

class AuditoriaIaEmpresa(Empresa):
    class Meta:
        proxy = True
        verbose_name = '🤖 Auditoría RAG / Asignación'
        verbose_name_plural = '🤖 1. Consola de Auditoría RAG'

class RegistroAuditoriaRAG(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="registros_rag")
    modelo_ia = models.CharField(max_length=50, default="llama3.2:3b")
    fecha_ejecucion = models.DateTimeField(auto_now_add=True)
    resumen_ejecutivo = models.TextField(blank=True, null=True)
    normativas_detectadas = models.IntegerField(default=0)
    tareas_generadas = models.IntegerField(default=0)
    ESTADOS_AUDITORIA = [
        ('PENDIENTE', 'Pendiente de Revisión'),
        ('APROBADO', 'Aprobado y Aplicado'),
        ('RECHAZADO', 'Rechazado / Descartado'),
    ]
    estado = models.CharField(max_length=20, choices=ESTADOS_AUDITORIA, default='PENDIENTE')
    exito = models.BooleanField(default=True)
    error_detalle = models.TextField(blank=True, null=True)
    datos_completos_json = models.JSONField(blank=True, null=True)

    class Meta:
        verbose_name = '📜 Log de Auditoría IA'
        verbose_name_plural = '📜 2. Historial de Ejecuciones RAG'
        ordering = ['-fecha_ejecucion']

    def __str__(self):
        return f"{self.empresa.nombre} - {self.fecha_ejecucion.strftime('%d/%m/%Y %H:%M')}"
