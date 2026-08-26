from rest_framework import serializers
from datetime import date
from .models import (
    Empresa, ComplianceEmpresa, PerfilUsuario, RegistroAuditoriaARCO,
    Normativa, ObjetivoChecklist, TratamientoRAT, SolicitudTicket,
    Incidente, TareaPendiente, Riesgo, Sucursal, Area, Responsable,
    Obligacion, Control, Evidencia, Auditoria, PlanAccion, EventoCompliance, AlertaCompliance
)

from django.contrib.auth.models import User
from django.utils import timezone
from .validators import validar_rut_chile

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class RegistroUsuarioEmpresaSerializer(serializers.Serializer):
    # Datos Usuario
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    nombre_completo = serializers.CharField(max_length=255, required=False, allow_blank=True)
    telefono = serializers.CharField(max_length=50, required=False, allow_blank=True)
    cargo = serializers.CharField(max_length=100, required=False, allow_blank=True, default="Administrador")
    rut_personal = serializers.CharField(max_length=50, required=False, allow_blank=True)

    # Consentimiento Ley 19.628
    acepto_terminos_y_privacidad = serializers.BooleanField(required=True)
    version_politica_aceptada = serializers.CharField(default="v1.0")

    # Datos Empresa
    razon_social = serializers.CharField(max_length=255)
    nombre_fantasia = serializers.CharField(max_length=255, required=False, allow_blank=True)
    rut_empresa = serializers.CharField(max_length=50)
    tipo_sociedad = serializers.ChoiceField(choices=Empresa.TIPO_SOCIEDAD_CHOICES, default='SPA')
    rubro = serializers.ChoiceField(choices=Empresa.RUBRO_CHOICES, default='TECNOLOGIA')
    rango_empleados = serializers.ChoiceField(choices=Empresa.RANGO_EMPLEADOS_CHOICES, default='PEQUENA')
    direccion_matriz = serializers.CharField(max_length=255, required=False, allow_blank=True)
    region_operacion = serializers.ChoiceField(choices=Empresa.REGION_CHOICES, default='RM')
    comuna = serializers.CharField(max_length=100, required=False, allow_blank=True)
    nivel_ingresos = serializers.ChoiceField(choices=Empresa.NIVEL_INGRESOS_CHOICES, default='PEQUENA')

    def validate_acepto_terminos_y_privacidad(self, value):
        if not value:
            raise serializers.ValidationError("Debe aceptar explícitamente los Términos y la Política de Privacidad conforme a la Ley N° 19.628.")
        return value

    def validate_rut_empresa(self, value):
        return validar_rut_chile(value)

    def validate_rut_personal(self, value):
        if value:
            return validar_rut_chile(value)
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("El nombre de usuario ya está registrado.")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        ip_cliente = '127.0.0.1'
        if request:
            x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded:
                ip_cliente = x_forwarded.split(',')[0].strip()
            else:
                ip_cliente = request.META.get('REMOTE_ADDR', '127.0.0.1')

        # 1. Crear Usuario
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('nombre_completo', '').split(' ')[0] if validated_data.get('nombre_completo') else '',
            last_name=' '.join(validated_data.get('nombre_completo', '').split(' ')[1:]) if validated_data.get('nombre_completo') else ''
        )

        # 2. Crear o Vincular Empresa
        empresa, _ = Empresa.objects.get_or_create(
            rut=validated_data['rut_empresa'],
            defaults={
                'nombre': validated_data['razon_social'],
                'nombre_fantasia': validated_data.get('nombre_fantasia', ''),
                'tipo_sociedad': validated_data.get('tipo_sociedad', 'SPA'),
                'rubro': validated_data.get('rubro', 'TECNOLOGIA'),
                'rango_empleados': validated_data.get('rango_empleados', 'PEQUENA'),
                'direccion_matriz': validated_data.get('direccion_matriz', ''),
                'region_operacion': validated_data.get('region_operacion', 'RM'),
                'comuna': validated_data.get('comuna', ''),
                'nivel_ingresos': validated_data.get('nivel_ingresos', 'PEQUENA'),
                'setup_completado': True,
            }
        )

        # 3. Crear PerfilUsuario con Trazabilidad Ley 19.628
        PerfilUsuario.objects.create(
            user=user,
            empresa=empresa,
            nombre_completo=validated_data.get('nombre_completo', ''),
            telefono=validated_data.get('telefono', ''),
            cargo=validated_data.get('cargo', 'Administrador'),
            rut_personal=validated_data.get('rut_personal', ''),
            acepto_terminos_y_privacidad=True,
            fecha_aceptacion_consentimiento=timezone.now(),
            ip_registro=ip_cliente,
            version_politica_aceptada=validated_data.get('version_politica_aceptada', 'v1.0')
        )

        # 4. Asignar normativas base por motor de matching
        from .services.matching_service import asignar_normativas_base
        asignar_normativas_base(empresa)

        return {
            'user': user,
            'empresa': empresa
        }

class RegistroAuditoriaARCOSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroAuditoriaARCO
        fields = ['id', 'usuario', 'tipo_derecho', 'detalles', 'estado', 'created_at']
        read_only_fields = ['id', 'usuario', 'estado', 'created_at']

class EmpresaOnboardingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = [
            'id', 'nombre', 'rut', 'tipo_sociedad', 'rubro', 'rango_empleados',
            'region_operacion', 'nivel_ingresos', 'importa_exporta', 
            'trabaja_con_estado', 'tiene_sindicato', 'instalaciones_industriales',
            'maneja_datos_personales', 'es_b2c_ecommerce', 'procesa_pagos',
            'genera_residuos_rep', 'tiene_trabajadores', 'setup_completado',
            'estado_matching',
            'created_at', 'updated_at'
        ]

class NormativaSerializer(serializers.ModelSerializer):
    empresa_nombre = serializers.CharField(source='empresa.nombre', read_only=True)

    class Meta:
        model = Normativa
        fields = '__all__'

class ComplianceEmpresaSerializer(serializers.ModelSerializer):
    normativa = NormativaSerializer(read_only=True)
    normativa_id = serializers.PrimaryKeyRelatedField(
        queryset=Normativa.objects.all(), source='normativa', write_only=True
    )

    class Meta:
        model = ComplianceEmpresa
        fields = [
            'id', 'empresa', 'normativa', 'normativa_id', 'estado',
            'porcentaje_progreso', 'origen', 'justificacion_ia',
            'created_at', 'updated_at'
        ]

class ObjetivoChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjetivoChecklist
        fields = '__all__'

class TratamientoRATSerializer(serializers.ModelSerializer):
    class Meta:
        model = TratamientoRAT
        fields = '__all__'

class SolicitudTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitudTicket
        fields = '__all__'

class IncidenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incidente
        fields = '__all__'

class TareaPendienteSerializer(serializers.ModelSerializer):
    es_vencida = serializers.SerializerMethodField()

    class Meta:
        model = TareaPendiente
        fields = '__all__'

    def get_es_vencida(self, obj):
        if not obj.fecha_vencimiento:
            return False
        return obj.estado != 'completada' and date.today() > obj.fecha_vencimiento

class RiesgoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Riesgo
        fields = '__all__'

class SucursalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sucursal
        fields = '__all__'

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = '__all__'

class ResponsableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Responsable
        fields = '__all__'

class ObligacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Obligacion
        fields = '__all__'

class ControlSerializer(serializers.ModelSerializer):
    class Meta:
        model = Control
        fields = '__all__'

class EvidenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evidencia
        fields = '__all__'

class AuditoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Auditoria
        fields = '__all__'

class PlanAccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanAccion
        fields = '__all__'

class EventoComplianceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventoCompliance
        fields = '__all__'

class AlertaComplianceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertaCompliance
        fields = '__all__'


