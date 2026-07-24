from rest_framework import serializers
from datetime import date
from .models import (
    Normativa, ObjetivoChecklist, TratamientoRAT, SolicitudTicket,
    Incidente, TareaPendiente, Riesgo, Sucursal, Area, Responsable,
    Obligacion, Control, Evidencia, Auditoria, PlanAccion, EventoCompliance
)

class NormativaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Normativa
        fields = '__all__'

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

