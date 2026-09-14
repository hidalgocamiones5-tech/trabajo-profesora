from django.db import models
from django.contrib.auth.models import User
from api.models import Empresa
import datetime
from django.utils import timezone

class SolicitudARCO(models.Model):
    TIPO_CHOICES = [
        ('ACCESO', 'Acceso'),
        ('RECTIFICACION', 'Rectificación'),
        ('CANCELACION', 'Cancelación'),
        ('OPOSICION', 'Oposición'),
    ]
    ESTADO_CHOICES = [
        ('RECIBIDA', 'Recibida'),
        ('REVISANDO', 'Revisando'),
        ('RESOLVIENDO', 'Resolviendo'),
        ('RESUELTA', 'Resuelta'),
        ('RECHAZADA', 'Rechazada'),
    ]

    ticket_id = models.CharField(max_length=20, unique=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='solicitudes_arco')
    tipo_arco = models.CharField(max_length=20, choices=TIPO_CHOICES)
    solicitante_nombre = models.CharField(max_length=255)
    solicitante_email = models.EmailField()
    usuario_tipo = models.CharField(max_length=50, default="B2C")
    
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='RECIBIDA')
    
    fecha_ingreso = models.DateTimeField(auto_now_add=True)
    fecha_vencimiento_sla = models.DateTimeField(null=True, blank=True)
    fecha_resolucion = models.DateTimeField(null=True, blank=True)
    
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_arco_asignados')
    motivo_rechazo = models.TextField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Solicitud ARCO"
        verbose_name_plural = "Solicitudes ARCO"

    def save(self, *args, **kwargs):
        from gestion_operativa.services.sla_manager import SLAManager
        if not self.fecha_vencimiento_sla:
            # Si no hay fecha de ingreso aún (creación inicial), calculamos desde ahora.
            fecha_base = self.fecha_ingreso or timezone.now()
            self.fecha_vencimiento_sla = SLAManager.calculate_arco_deadline(fecha_base)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.ticket_id}] {self.get_tipo_arco_display()} - {self.solicitante_email}"


class IncidenteKarin(models.Model):
    ESTADO_CHOICES = [
        ('INGRESADA', 'Denuncia Ingresada'),
        ('CAUTELARES_APLICADAS', 'Medidas Cautelares Aplicadas'),
        ('INVESTIGACION', 'Investigación Interna'),
        ('RESUELTA', 'Resolución / Reporte DT'),
    ]

    ticket_id = models.CharField(max_length=20, unique=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='incidentes_karin')
    
    es_anonimo = models.BooleanField(default=True)
    denunciante_nombre = models.CharField(max_length=255, null=True, blank=True)
    denunciante_email = models.EmailField(null=True, blank=True)
    
    descripcion_hechos = models.TextField()
    estado = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='INGRESADA')
    
    medidas_cautelares_adoptadas = models.TextField(
        null=True, blank=True, 
        help_text="Requisito legal para pasar a fase de Investigación"
    )
    
    fecha_ingreso = models.DateTimeField(auto_now_add=True)
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='incidentes_karin_asignados')
    
    class Meta:
        verbose_name = "Incidente Ley Karin"
        verbose_name_plural = "Incidentes Ley Karin"

    def __str__(self):
        return f"[{self.ticket_id}] Ley Karin - Estado: {self.get_estado_display()}"


class RiesgoPenal(models.Model):
    NIVEL_CHOICES = [
        ('BAJO', 'Bajo'),
        ('MEDIO', 'Medio'),
        ('ALTO', 'Alto'),
        ('CRITICO', 'Crítico'),
    ]
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='riesgos_penales')
    nombre = models.CharField(max_length=255, help_text="Ej. Cohecho, Lavado de Activos")
    descripcion = models.TextField(null=True, blank=True)
    nivel_inherente = models.CharField(max_length=20, choices=NIVEL_CHOICES, default='MEDIO')
    
    class Meta:
        verbose_name = "Riesgo Penal (Ley 21.595)"
        verbose_name_plural = "Riesgos Penales"

    def __str__(self):
        return f"{self.nombre} ({self.empresa.nombre})"


class ControlRiesgo(models.Model):
    ESTADO_CHOICES = [
        ('AL_DIA', 'Al Día'),
        ('VENCIDO', 'Vencido'),
        ('PENDIENTE_REVISION', 'Pendiente de Revisión'),
    ]
    riesgo = models.ForeignKey(RiesgoPenal, on_delete=models.CASCADE, related_name='controles')
    nombre = models.CharField(max_length=255, help_text="Ej. Cláusula anticorrupción en contratos")
    responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    fecha_proxima_revision = models.DateField()
    estado_evidencia = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='AL_DIA')
    
    class Meta:
        verbose_name = "Control Preventivo"
        verbose_name_plural = "Controles Preventivos"

    def __str__(self):
        return f"Control: {self.nombre} para {self.riesgo.nombre}"
