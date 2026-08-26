from django.db import models
from django.contrib.auth.models import User

class Empresa(models.Model):
    TIPO_SOCIEDAD_CHOICES = [
        ('SPA', 'Sociedad por Acciones (SpA)'),
        ('SA', 'Sociedad Anónima (S.A.)'),
        ('LTDA', 'Sociedad de Responsabilidad Limitada (Ltda.)'),
        ('EIRL', 'Empresa Individual de Resp. Ltda. (EIRL)'),
        ('PERSONA_NATURAL', 'Persona Natural con Giro')
    ]
    RANGO_EMPLEADOS_CHOICES = [
        ('MICRO', 'Micro (1-9 colaboradores)'),
        ('PEQUENA', 'Pequeña (10-49 colaboradores)'),
        ('MEDIANA', 'Mediana (50-199 colaboradores)'),
        ('GRANDE', 'Grande (200+ colaboradores)')
    ]
    RUBRO_CHOICES = [
        ('TECNOLOGIA', 'Tecnología y Software'), ('SALUD', 'Salud y Clínicas'), ('MINERIA', 'Minería y Energía'),
        ('RETAIL', 'Retail y Comercio'), ('ALIMENTOS', 'Alimentos y Bebidas'), ('FINANCIERO', 'Servicios Financieros (Fintech)'),
        ('CONSTRUCCION', 'Construcción e Inmobiliaria'), ('EDUCACION', 'Educación'), ('SERVICIOS', 'Servicios Profesionales')
    ]
    REGION_CHOICES = [('RM', 'Región Metropolitana')]
    NIVEL_INGRESOS_CHOICES = [('MICRO', 'Micro'), ('PEQUENA', 'Pequeña'), ('MEDIANA', 'Mediana'), ('GRANDE', 'Grande')]
    nombre = models.CharField(max_length=255)
    rut = models.CharField(max_length=50, blank=True, null=True)
    fecha_creacion = models.DateField(auto_now_add=True)
    rubro = models.CharField(max_length=100, blank=True, null=True)
    setup_completado = models.BooleanField(default=False)
    tamano = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    es_b2c_ecommerce = models.BooleanField(default=False)
    genera_residuos_rep = models.BooleanField(default=False)
    maneja_datos_personales = models.BooleanField(default=False)
    procesa_pagos = models.BooleanField(default=False)
    rango_empleados = models.CharField(max_length=50, choices=RANGO_EMPLEADOS_CHOICES, default='PEQUENA')
    tiene_trabajadores = models.BooleanField(default=True)
    tipo_sociedad = models.CharField(max_length=50, choices=TIPO_SOCIEDAD_CHOICES, default='SPA')
    updated_at = models.DateTimeField(auto_now=True, null=True)
    estado_matching = models.CharField(max_length=20, default='PENDIENTE')
    log_matching = models.TextField(blank=True, null=True)
    importa_exporta = models.BooleanField(default=False)
    instalaciones_industriales = models.BooleanField(default=False)
    nivel_ingresos = models.CharField(max_length=20, blank=True, null=True)
    region_operacion = models.CharField(max_length=100, blank=True, null=True)
    tiene_sindicato = models.BooleanField(default=False)
    trabaja_con_estado = models.BooleanField(default=False)
    comuna = models.CharField(max_length=100, blank=True, null=True)
    direccion_matriz = models.CharField(max_length=255, blank=True, null=True)
    nombre_fantasia = models.CharField(max_length=255, blank=True, null=True)
    solicitud_arco_activa = models.BooleanField(default=False)

    def __str__(self):
        return self.nombre

class PerfilUsuario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="usuarios")
    cargo = models.CharField(max_length=100, blank=True, null=True)
    acepto_terminos_y_privacidad = models.BooleanField(default=False)
    fecha_aceptacion_consentimiento = models.DateTimeField(blank=True, null=True)
    ip_registro = models.GenericIPAddressField(blank=True, null=True)
    nombre_completo = models.CharField(max_length=255, blank=True, null=True)
    rut_personal = models.CharField(max_length=50, blank=True, null=True)
    telefono = models.CharField(max_length=50, blank=True, null=True)
    version_politica_aceptada = models.CharField(max_length=20, default='v1.0')

    def __str__(self):
        return f"{self.user.username} - {self.empresa.nombre}"

class RegistroAuditoriaARCO(models.Model):
    usuario = models.ForeignKey(PerfilUsuario, on_delete=models.CASCADE)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, null=True, blank=True)
    tipo_derecho = models.CharField(max_length=20)
    detalles = models.TextField()
    estado = models.CharField(max_length=20, default='PENDIENTE')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo_derecho} - {self.usuario}"

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
    fecha_inicio = models.DateField(blank=True, null=True)
    fecha_termino = models.DateField(blank=True, null=True)
    tipo = models.CharField(max_length=100, default='Ley')
    origen = models.CharField(max_length=100)
    codigo_bcn = models.CharField(max_length=100, blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    es_transversal = models.BooleanField(default=False)
    min_empleados = models.IntegerField(default=0)
    requiere_b2c = models.BooleanField(default=False)
    requiere_datos_personales = models.BooleanField(default=False)
    requiere_procesa_pagos = models.BooleanField(default=False)
    requiere_residuos = models.BooleanField(default=False)
    requiere_trabajadores = models.BooleanField(default=False)
    resumen = models.TextField(blank=True, null=True)
    rubro_aplicable = models.CharField(max_length=50, blank=True, null=True)
    titulo = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombre

class ComplianceEmpresa(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    normativa = models.ForeignKey(Normativa, on_delete=models.CASCADE)
    estado_choices = [
        ('PRELIMINAR', 'Preliminar (Pendiente Validación)'),
        ('VERIFICADA', 'Verificada / Asignada'),
        ('ASIGNADA', 'Asignada'),
        ('SUGERIDA_IA', 'Sugerida por IA'),
        ('EN_PROCESO', 'En Proceso'),
        ('CUMPLIDA', 'Cumplida'),
        ('NO_APLICA', 'No Aplica'),
        ('RECHAZADA', 'Rechazada por Admin')
    ]
    estado = models.CharField(max_length=50, choices=estado_choices, default='PRELIMINAR')
    porcentaje_progreso = models.FloatField(default=0.0)
    origen = models.CharField(max_length=50, default='MOTOR_REGLAS')
    justificacion_ia = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('empresa', 'normativa')

    def __str__(self):
        return f"{self.empresa.nombre} - {self.normativa.nombre} ({self.porcentaje_progreso}%)"

    def recalcular_progreso(self):
        """
        Recalcula el porcentaje de progreso en cascada basado en las tareas y obligaciones.
        """
        # Buscar tareas vinculadas
        tareas = self.tareas.all()
        if not tareas.exists() and self.empresa and self.normativa:
            from django.db.models import Q
            cod = self.normativa.codigo_bcn or ''
            alias = self.normativa.nombre or ''
            tareas = TareaPendiente.objects.filter(
                Q(compliance_empresa=self) |
                Q(empresa=self.empresa, normativa=self.normativa) |
                (Q(empresa=self.empresa) & (Q(asociada_a__icontains=cod) | Q(asociada_a__icontains=alias[:15])))
            ).distinct()

        if tareas.exists():
            total = tareas.count()
            completadas = tareas.filter(estado='completada').count()
            self.porcentaje_progreso = round((completadas / total) * 100.0, 1)
        else:
            # Fallback a obligaciones
            obligaciones = self.normativa.obligaciones.all()
            if obligaciones.exists():
                total = obligaciones.count()
                cumplidas = obligaciones.filter(estado='cumplido').count()
                self.porcentaje_progreso = round((cumplidas / total) * 100.0, 1)

        if self.porcentaje_progreso >= 100.0 and self.estado in ['VERIFICADA', 'EN_PROCESO', 'ASIGNADA', 'PRELIMINAR']:
            self.estado = 'CUMPLIDA'
        elif self.porcentaje_progreso > 0 and self.estado in ['VERIFICADA', 'ASIGNADA', 'PRELIMINAR']:
            self.estado = 'EN_PROCESO'

        self.save(update_fields=['porcentaje_progreso', 'estado', 'updated_at'])

        if self.normativa:
            self.normativa.progreso = int(self.porcentaje_progreso)
            if self.porcentaje_progreso >= 100:
                self.normativa.estado = 'completada'
            elif self.porcentaje_progreso > 0:
                self.normativa.estado = 'en_tiempo'
            self.normativa.save(update_fields=['progreso', 'estado'])

        return self.porcentaje_progreso

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
    criticidad = models.CharField(max_length=50, choices=[('alta', 'Alta'), ('media', 'Media'), ('baja', 'Baja')], default='media')

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
    severidad = models.CharField(max_length=50, choices=[('baja', 'Baja'), ('media', 'Media'), ('alta', 'Alta'), ('critica', 'Crítica')], default='media')
    fecha = models.DateField()

    def __str__(self):
        return self.nombre

class TareaPendiente(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, null=True, blank=True, related_name="tareas_pendientes")
    normativa = models.ForeignKey(Normativa, on_delete=models.SET_NULL, null=True, blank=True, related_name="tareas")
    compliance_empresa = models.ForeignKey('ComplianceEmpresa', on_delete=models.SET_NULL, null=True, blank=True, related_name="tareas")
    obligacion = models.ForeignKey('Obligacion', on_delete=models.SET_NULL, null=True, blank=True, related_name="tareas")
    control = models.ForeignKey('Control', on_delete=models.SET_NULL, null=True, blank=True, related_name="tareas")
    
    responsable = models.CharField(max_length=100)
    responsable_asignado = models.CharField(max_length=100)
    tarea = models.CharField(max_length=255)
    asociada_a = models.CharField(max_length=100, blank=True, null=True)
    fecha_vencimiento = models.DateField(null=True, blank=True)
    estado_choices = [
        ('pendiente', 'Pendiente'),
        ('en_progreso', 'En progreso'),
        ('completada', 'Completada'),
    ]
    estado = models.CharField(max_length=50, choices=estado_choices, default='pendiente')
    prioridad_choices = [
        ('alta', 'Alta'),
        ('media', 'Media'),
        ('baja', 'Baja'),
        ('critica', 'Crítica'),
    ]
    prioridad = models.CharField(max_length=50, choices=prioridad_choices, default='media')
    fecha_completada = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return self.tarea

    def save(self, *args, **kwargs):
        from django.utils import timezone
        if self.estado == 'completada' and not self.fecha_completada:
            self.fecha_completada = timezone.now()
        elif self.estado != 'completada':
            self.fecha_completada = None
        super().save(*args, **kwargs)
        
        # Propagar recálculo automático al padre ComplianceEmpresa
        if self.compliance_empresa:
            self.compliance_empresa.recalcular_progreso()
        elif self.empresa and self.normativa:
            ce = ComplianceEmpresa.objects.filter(empresa=self.empresa, normativa=self.normativa).first()
            if ce:
                ce.recalcular_progreso()

class Riesgo(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, null=True, blank=True)
    nombre = models.CharField(max_length=255)
    categoria = models.CharField(max_length=100, blank=True, null=True)
    impacto = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    probabilidad = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    estrategia = models.CharField(max_length=50, choices=[('Mitigar', 'Mitigar'), ('Transferir', 'Transferir'), ('Aceptar', 'Aceptar'), ('Eliminar', 'Eliminar')], default='Mitigar')
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
    direccion = models.CharField(max_length=255, blank=True, null=True)
    ciudad = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return self.nombre

class Area(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="areas")
    sucursal = models.ForeignKey(Sucursal, on_delete=models.SET_NULL, null=True, blank=True)
    nombre = models.CharField(max_length=255)
    responsable_principal = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

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
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name="obligaciones", null=True, blank=True)
    nombre = models.CharField(max_length=255) # titulo
    descripcion = models.TextField(blank=True, null=True)
    estado_choices = [('pendiente', 'Pendiente'), ('cumplido', 'Cumplido'), ('parcial', 'Parcial'), ('en_riesgo', 'En Riesgo')]
    estado = models.CharField(max_length=50, choices=estado_choices, default='pendiente')
    criticidad_choices = [('alta', 'Alta'), ('media', 'Media'), ('baja', 'Baja')]
    criticidad = models.CharField(max_length=50, choices=criticidad_choices, default='media')
    responsable = models.ForeignKey(Responsable, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_vencimiento = models.DateField(null=True, blank=True) # fecha_limite

    def __str__(self):
        return self.nombre

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.normativa:
            from .models import ComplianceEmpresa
            for ce in ComplianceEmpresa.objects.filter(normativa=self.normativa):
                ce.recalcular_progreso()

class Control(models.Model):
    normativa = models.ForeignKey(Normativa, on_delete=models.CASCADE, related_name="controles", null=True, blank=True)
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name="controles", null=True, blank=True)
    obligacion = models.ForeignKey(Obligacion, on_delete=models.CASCADE, related_name="controles", null=True, blank=True)
    nombre = models.CharField(max_length=255)
    estado_choices = [('activo', 'Activo'), ('inactivo', 'Inactivo'), ('ejecutado', 'Ejecutado'), ('pendiente', 'Pendiente'), ('vencido', 'Vencido'), ('proximo', 'Próximo')]
    estado = models.CharField(max_length=50, choices=estado_choices, default='pendiente')
    periodicidad = models.CharField(max_length=50, default='MENSUAL') # diaria, semanal, mensual... (frecuencia)
    responsable = models.ForeignKey(Responsable, on_delete=models.SET_NULL, null=True, blank=True)
    ultima_ejecucion = models.DateField(null=True, blank=True)
    proxima_ejecucion = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.nombre

class Evidencia(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, null=True, blank=True)
    normativa = models.ForeignKey(Normativa, on_delete=models.CASCADE, null=True, blank=True)
    area = models.ForeignKey(Area, on_delete=models.CASCADE, null=True, blank=True)
    obligacion = models.ForeignKey(Obligacion, on_delete=models.CASCADE, null=True, blank=True)
    control = models.ForeignKey(Control, on_delete=models.CASCADE, related_name="evidencias", null=True, blank=True)
    responsable = models.ForeignKey(Responsable, on_delete=models.SET_NULL, null=True, blank=True)
    titulo = models.CharField(max_length=255, default='Evidencia')
    archivo = models.FileField(upload_to='evidencias/', blank=True, null=True)
    archivo_url = models.URLField(blank=True, null=True)
    version = models.CharField(max_length=50, default='1.0')
    estado = models.CharField(max_length=50, choices=[('vigente', 'Vigente'), ('por_vencer', 'Por Vencer'), ('vencido', 'Vencido'), ('pendiente_aprobacion', 'Pendiente Aprobación'), ('desactualizado', 'Desactualizado')], default='vigente')
    fecha_emision = models.DateField(null=True, blank=True)
    fecha_vencimiento = models.DateField(null=True, blank=True)
    fecha_subida = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.titulo

class Auditoria(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    normativa = models.ForeignKey(Normativa, on_delete=models.CASCADE, null=True, blank=True)
    area = models.ForeignKey(Area, on_delete=models.CASCADE, null=True, blank=True)
    nombre = models.CharField(max_length=255)
    tipo = models.CharField(max_length=50, choices=[('interna', 'Interna'), ('externa', 'Externa')], default='interna')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=50, choices=[('planificada', 'Planificada'), ('en_curso', 'En Curso'), ('finalizada', 'Finalizada')])
    responsable = models.ForeignKey(Responsable, on_delete=models.SET_NULL, null=True, blank=True)
    hallazgos_count = models.IntegerField(default=0)
    no_conformidades_count = models.IntegerField(default=0)

    def __str__(self):
        return self.nombre

class PlanAccion(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, null=True, blank=True)
    normativa = models.ForeignKey(Normativa, on_delete=models.CASCADE, null=True, blank=True)
    area = models.ForeignKey(Area, on_delete=models.CASCADE, null=True, blank=True)
    riesgo = models.ForeignKey(Riesgo, on_delete=models.CASCADE, null=True, blank=True)
    incidente = models.ForeignKey(Incidente, on_delete=models.CASCADE, null=True, blank=True)
    auditoria = models.ForeignKey(Auditoria, on_delete=models.CASCADE, null=True, blank=True)
    responsable = models.ForeignKey(Responsable, on_delete=models.SET_NULL, null=True, blank=True)
    nombre = models.CharField(max_length=255) # accion
    estado = models.CharField(max_length=50, choices=[('abierto', 'Abierto'), ('en_progreso', 'En Progreso'), ('atrasado', 'Atrasado'), ('cerrado', 'Cerrado')], default='abierto')
    fecha_limite = models.DateField() # fecha_compromiso

    def __str__(self):
        return self.nombre

class EventoCompliance(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=100) # OBLIGACION, CONTROL, EVIDENCIA, AUDITORIA, RIESGO, INCIDENTE, PLAN_ACCION, CAPACITACION
    titulo = models.CharField(max_length=255)
    normativa = models.ForeignKey(Normativa, on_delete=models.CASCADE, null=True, blank=True)
    area = models.ForeignKey(Area, on_delete=models.CASCADE, null=True, blank=True)
    responsable = models.ForeignKey(Responsable, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField(null=True, blank=True)
    prioridad = models.CharField(max_length=50, choices=[('alta', 'Alta'), ('media', 'Media'), ('baja', 'Baja')], default='media')
    estado = models.CharField(max_length=50, choices=[('pendiente', 'Pendiente'), ('en_proceso', 'En Proceso'), ('cumplido', 'Cumplido'), ('vencido', 'Vencido')], default='pendiente')
    recurrencia = models.CharField(max_length=50, blank=True, null=True) # regla_recurrencia
    es_recurrente = models.BooleanField(default=False)
    entidad_relacionada_id = models.IntegerField(null=True, blank=True)
    entidad_tipo = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.titulo

class AlertaCompliance(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    origen_modulo = models.CharField(max_length=50) # NORMATIVA, OBLIGACION, CONTROL, EVIDENCIA, RIESGO, INCIDENTE, AUDITORIA, PLAN_ACCION
    referencia_id = models.IntegerField(null=True, blank=True)
    titulo = models.CharField(max_length=255)
    mensaje = models.TextField()
    criticidad = models.CharField(max_length=20, default='MEDIA') # CRITICA, ALTA, MEDIA, INFORMATIVA
    estado = models.CharField(max_length=20, default='ABIERTA') # ABIERTA, REVISADA, ESCALADA, RESUELTA
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    fecha_escalamiento = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"[{self.criticidad}] {self.titulo}"

class HistoricoCumplimientoMensual(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    sucursal = models.ForeignKey(Sucursal, on_delete=models.CASCADE, null=True, blank=True)
    area = models.ForeignKey(Area, on_delete=models.CASCADE, null=True, blank=True)
    mes = models.IntegerField()
    anio = models.IntegerField()
    porcentaje_cumplimiento = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('empresa', 'sucursal', 'area', 'mes', 'anio')

    def __str__(self):
        return f"{self.empresa.nombre} - {self.mes}/{self.anio}: {self.porcentaje_cumplimiento}%"

