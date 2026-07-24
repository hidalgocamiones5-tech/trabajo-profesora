from django.db import models
from django.contrib.auth.models import User

class Empresa(models.Model):
    nombre = models.CharField(max_length=255)
    rut = models.CharField(max_length=50, blank=True, null=True)
    fecha_creacion = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.nombre

class PerfilUsuario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="usuarios")
    cargo = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.empresa.nombre}"

class Normativa(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, null=True, blank=True)
    nombre = models.CharField(max_length=255)
    progreso = models.IntegerField(default=0)
    estado_choices = [
        ('en_tiempo', 'En tiempo'),
        ('atrasada', 'Atrasada'),
        ('en_riesgo', 'En riesgo'),
        ('completada', 'Completada'),
    ]
    estado = models.CharField(max_length=50, choices=estado_choices)
    criticidad_choices = [
        ('alta', 'Alta'),
        ('media', 'Media'),
        ('baja', 'Baja'),
    ]
    criticidad = models.CharField(max_length=50, choices=criticidad_choices)
    fecha_inicio = models.DateField()
    fecha_termino = models.DateField()
    tipo = models.CharField(max_length=100)
    origen = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class ObjetivoChecklist(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, null=True, blank=True)
    categoria = models.CharField(max_length=100)
    nombre = models.CharField(max_length=255)
    estado_choices = [
        ('completado', 'Completado'),
        ('atrasado', 'Atrasado'),
        ('por_hacer', 'Por hacer'),
    ]
    estado = models.CharField(max_length=50, choices=estado_choices)
    responsable = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class TratamientoRAT(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, null=True, blank=True)
    area = models.CharField(max_length=100)
    tratamiento = models.CharField(max_length=255)
    finalidad = models.TextField()
    categoria_dp = models.CharField(max_length=100)
    base_licitud = models.CharField(max_length=100)
    estado_choices = [
        ('completado', 'Completado'),
        ('pendiente', 'Pendiente'),
        ('borrador', 'Borrador'),
    ]
    estado = models.CharField(max_length=50, choices=estado_choices)

    def __str__(self):
        return self.tratamiento

class SolicitudTicket(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, null=True, blank=True)
    estado_choices = [
        ('recibida', 'Recibida'),
        ('revisando', 'Revisando'),
        ('resolviendo', 'Resolviendo'),
        ('resuelta', 'Resuelta'),
    ]
    estado = models.CharField(max_length=50, choices=estado_choices)
    nombre = models.CharField(max_length=255)
    tipo = models.CharField(max_length=100)
    fecha_creacion = models.DateField(auto_now_add=True)
    fecha_limite = models.DateField()
    sla_choices = [
        ('en_tiempo', 'En tiempo'),
        ('en_riesgo', 'En riesgo'),
        ('atrasada', 'Atrasada'),
    ]
    sla = models.CharField(max_length=50, choices=sla_choices)
    prioridad_choices = [
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
        ('media', 'Media'),
    ]
    prioridad = models.CharField(max_length=50, choices=prioridad_choices)
    solicitante = models.CharField(max_length=100)
    responsable = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class Incidente(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, null=True, blank=True)
    nombre = models.CharField(max_length=255)
    denunciante = models.CharField(max_length=100)
    responsable = models.CharField(max_length=100)
    tipo = models.CharField(max_length=100)
    estado = models.CharField(max_length=50)
    fecha = models.DateField()

    def __str__(self):
        return self.nombre

class TareaPendiente(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, null=True, blank=True)
    responsable = models.CharField(max_length=100)
    estado_choices = [
        ('pendiente', 'Pendiente'),
        ('en_progreso', 'En progreso'),
        ('completada', 'Completada'),
    ]
    estado = models.CharField(max_length=50, choices=estado_choices)
    fecha_vencimiento = models.DateField()
    tarea = models.CharField(max_length=255)
    asociada_a = models.CharField(max_length=100)
    responsable_asignado = models.CharField(max_length=100)

    def __str__(self):
        return self.tarea

class Riesgo(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, null=True, blank=True)
    nombre = models.CharField(max_length=255)
    impacto = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    probabilidad = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    estado_choices = [
        ('pendiente', 'Pendiente'),
        ('mitigado', 'Mitigado'),
        ('en_curso', 'En curso'),
    ]
    estado = models.CharField(max_length=50, choices=estado_choices)
    responsable = models.CharField(max_length=100)
    fecha_identificacion = models.DateField()

    def __str__(self):
        return self.nombre

# Nuevos Modelos Base (Dashboard Ejecutivo) - (desarrollado por el informe)
class Sucursal(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="sucursales")
    nombre = models.CharField(max_length=255)
    
    def __str__(self):
        return self.nombre

class Area(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="areas")
    sucursal = models.ForeignKey(Sucursal, on_delete=models.SET_NULL, null=True, blank=True)
    nombre = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre

class Responsable(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True, blank=True)
    nombre = models.CharField(max_length=255)
    cargo = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.nombre

class Obligacion(models.Model):
    normativa = models.ForeignKey(Normativa, on_delete=models.CASCADE, related_name="obligaciones")
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    estado_choices = [('pendiente', 'Pendiente'), ('cumplido', 'Cumplido'), ('en_riesgo', 'En Riesgo')]
    estado = models.CharField(max_length=50, choices=estado_choices, default='pendiente')
    responsable = models.ForeignKey(Responsable, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_vencimiento = models.DateField(null=True, blank=True)

class Control(models.Model):
    obligacion = models.ForeignKey(Obligacion, on_delete=models.CASCADE, related_name="controles")
    nombre = models.CharField(max_length=255)
    estado = models.CharField(max_length=50, choices=[('activo', 'Activo'), ('inactivo', 'Inactivo'), ('en_revision', 'En Revisión')])
    periodicidad = models.CharField(max_length=50) # diaria, semanal, mensual...
    responsable = models.ForeignKey(Responsable, on_delete=models.SET_NULL, null=True, blank=True)

class Evidencia(models.Model):
    control = models.ForeignKey(Control, on_delete=models.CASCADE, related_name="evidencias")
    archivo_url = models.URLField(blank=True, null=True)
    estado = models.CharField(max_length=50, choices=[('vigente', 'Vigente'), ('por_vencer', 'Por Vencer'), ('desactualizado', 'Desactualizado')])
    fecha_subida = models.DateField(auto_now_add=True)
    fecha_vencimiento = models.DateField(null=True, blank=True)

class Auditoria(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=255)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=50, choices=[('planificada', 'Planificada'), ('en_curso', 'En Curso'), ('finalizada', 'Finalizada')])
    responsable = models.ForeignKey(Responsable, on_delete=models.SET_NULL, null=True, blank=True)

class PlanAccion(models.Model):
    riesgo = models.ForeignKey(Riesgo, on_delete=models.CASCADE, null=True, blank=True)
    incidente = models.ForeignKey(Incidente, on_delete=models.CASCADE, null=True, blank=True)
    auditoria = models.ForeignKey(Auditoria, on_delete=models.CASCADE, null=True, blank=True)
    nombre = models.CharField(max_length=255)
    estado = models.CharField(max_length=50, choices=[('abierto', 'Abierto'), ('en_progreso', 'En Progreso'), ('cerrado', 'Cerrado')])
    fecha_limite = models.DateField()

class EventoCompliance(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=100) # Auditoría, Revisión Riesgo, Vencimiento Documento
    titulo = models.CharField(max_length=255)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField(null=True, blank=True)
    estado = models.CharField(max_length=50)
    recurrencia = models.CharField(max_length=50, blank=True, null=True) # diaria, mensual, etc.
    entidad_relacionada_id = models.IntegerField(null=True, blank=True)
    entidad_tipo = models.CharField(max_length=100, blank=True, null=True)
