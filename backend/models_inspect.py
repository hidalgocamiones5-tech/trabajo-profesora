# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class ApiEmpresa(models.Model):
    nombre = models.CharField(max_length=255)
    rut = models.CharField(max_length=50, blank=True, null=True)
    fecha_creacion = models.DateField()
    rubro = models.CharField(max_length=50)
    setup_completado = models.BooleanField()
    tamano = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    es_b2c_ecommerce = models.BooleanField()
    genera_residuos_rep = models.BooleanField()
    maneja_datos_personales = models.BooleanField()
    procesa_pagos = models.BooleanField()
    rango_empleados = models.CharField(max_length=50)
    tiene_trabajadores = models.BooleanField()
    tipo_sociedad = models.CharField(max_length=50)
    updated_at = models.DateTimeField(blank=True, null=True)
    estado_matching = models.CharField(max_length=20)
    log_matching = models.JSONField()
    importa_exporta = models.BooleanField()
    instalaciones_industriales = models.BooleanField()
    nivel_ingresos = models.CharField(max_length=20)
    region_operacion = models.CharField(max_length=5)
    tiene_sindicato = models.BooleanField()
    trabaja_con_estado = models.BooleanField()
    comuna = models.CharField(max_length=100, blank=True, null=True)
    direccion_matriz = models.CharField(max_length=255, blank=True, null=True)
    nombre_fantasia = models.CharField(max_length=255, blank=True, null=True)
    solicitud_arco_activa = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'api_empresa'


class ApiNormativa(models.Model):
    nombre = models.CharField(max_length=255)
    progreso = models.IntegerField()
    estado = models.CharField(max_length=50)
    criticidad = models.CharField(max_length=50)
    fecha_inicio = models.DateField(blank=True, null=True)
    fecha_termino = models.DateField(blank=True, null=True)
    origen = models.CharField(max_length=100)
    empresa = models.ForeignKey(ApiEmpresa, models.DO_NOTHING, blank=True, null=True)
    codigo_bcn = models.CharField(max_length=100, blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    es_transversal = models.BooleanField()
    min_empleados = models.IntegerField()
    requiere_b2c = models.BooleanField()
    requiere_datos_personales = models.BooleanField()
    requiere_procesa_pagos = models.BooleanField()
    requiere_residuos = models.BooleanField()
    requiere_trabajadores = models.BooleanField()
    resumen = models.TextField(blank=True, null=True)
    rubro_aplicable = models.CharField(max_length=50, blank=True, null=True)
    titulo = models.CharField(max_length=255, blank=True, null=True)
    tipo = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'api_normativa'


class ApiComplianceempresa(models.Model):
    porcentaje_progreso = models.FloatField()
    origen = models.CharField(max_length=50)
    justificacion_ia = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    empresa = models.ForeignKey(ApiEmpresa, models.DO_NOTHING)
    normativa = models.ForeignKey(ApiNormativa, models.DO_NOTHING)
    estado = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'api_complianceempresa'
        unique_together = (('empresa', 'normativa'),)


class ApiRegistroauditoriaarco(models.Model):
    tipo_derecho = models.CharField(max_length=20)
    detalles = models.TextField()
    estado = models.CharField(max_length=20)
    created_at = models.DateTimeField()
    usuario = models.ForeignKey('AuthUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'api_registroauditoriaarco'
