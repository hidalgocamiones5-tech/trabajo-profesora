from rest_framework import serializers
from .models import SolicitudARCO, IncidenteKarin, RiesgoPenal, ControlRiesgo
from .services.sla_manager import SLAManager

class SolicitudARCOSerializer(serializers.ModelSerializer):
    estado_sla = serializers.SerializerMethodField()
    responsable_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = SolicitudARCO
        fields = '__all__'
        
    def get_estado_sla(self, obj):
        return SLAManager.check_sla_status(obj.fecha_vencimiento_sla)
        
    def get_responsable_nombre(self, obj):
        return obj.responsable.get_full_name() if obj.responsable else "Sin asignar"

class IncidenteKarinSerializer(serializers.ModelSerializer):
    responsable_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = IncidenteKarin
        fields = '__all__'
        
    def get_responsable_nombre(self, obj):
        return obj.responsable.get_full_name() if obj.responsable else "Sin asignar"

class ControlRiesgoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ControlRiesgo
        fields = '__all__'

class RiesgoPenalSerializer(serializers.ModelSerializer):
    controles = ControlRiesgoSerializer(many=True, read_only=True)
    
    class Meta:
        model = RiesgoPenal
        fields = '__all__'
