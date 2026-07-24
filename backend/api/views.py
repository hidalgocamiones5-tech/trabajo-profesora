from rest_framework import viewsets, permissions
from .models import (
    Normativa, ObjetivoChecklist, TratamientoRAT, SolicitudTicket,
    Incidente, TareaPendiente, Riesgo, Sucursal, Area, Responsable,
    Obligacion, Control, Evidencia, Auditoria, PlanAccion, EventoCompliance
)
from .serializers import (
    NormativaSerializer, ObjetivoChecklistSerializer, TratamientoRATSerializer,
    SolicitudTicketSerializer, IncidenteSerializer, TareaPendienteSerializer,
    RiesgoSerializer, SucursalSerializer, AreaSerializer, ResponsableSerializer,
    ObligacionSerializer, ControlSerializer, EvidenciaSerializer, AuditoriaSerializer,
    PlanAccionSerializer, EventoComplianceSerializer
)

class BaseEmpresaViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.is_superuser:
                return self.queryset
            if hasattr(user, 'perfilusuario'):
                return self.queryset.filter(empresa=user.perfilusuario.empresa)
        # Para el prototipo, si no está autenticado devolvemos todo
        return self.queryset

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_authenticated and not user.is_superuser and hasattr(user, 'perfilusuario'):
            serializer.save(empresa=user.perfilusuario.empresa)
        else:
            serializer.save()

class NormativaViewSet(BaseEmpresaViewSet):
    queryset = Normativa.objects.all()
    serializer_class = NormativaSerializer

class ObjetivoChecklistViewSet(BaseEmpresaViewSet):
    queryset = ObjetivoChecklist.objects.all()
    serializer_class = ObjetivoChecklistSerializer

class TratamientoRATViewSet(BaseEmpresaViewSet):
    queryset = TratamientoRAT.objects.all()
    serializer_class = TratamientoRATSerializer

class SolicitudTicketViewSet(BaseEmpresaViewSet):
    queryset = SolicitudTicket.objects.all()
    serializer_class = SolicitudTicketSerializer

class IncidenteViewSet(BaseEmpresaViewSet):
    queryset = Incidente.objects.all()
    serializer_class = IncidenteSerializer

class TareaPendienteViewSet(BaseEmpresaViewSet):
    queryset = TareaPendiente.objects.all()
    serializer_class = TareaPendienteSerializer

class RiesgoViewSet(BaseEmpresaViewSet):
    queryset = Riesgo.objects.all()
    serializer_class = RiesgoSerializer

class SucursalViewSet(BaseEmpresaViewSet):
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer

class AreaViewSet(BaseEmpresaViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer

class ResponsableViewSet(BaseEmpresaViewSet):
    queryset = Responsable.objects.all()
    serializer_class = ResponsableSerializer

class AuditoriaViewSet(BaseEmpresaViewSet):
    queryset = Auditoria.objects.all()
    serializer_class = AuditoriaSerializer

class EventoComplianceViewSet(BaseEmpresaViewSet):
    queryset = EventoCompliance.objects.all()
    serializer_class = EventoComplianceSerializer

class BasePrototypeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]

class ObligacionViewSet(BasePrototypeViewSet):
    queryset = Obligacion.objects.all()
    serializer_class = ObligacionSerializer

class ControlViewSet(BasePrototypeViewSet):
    queryset = Control.objects.all()
    serializer_class = ControlSerializer

class EvidenciaViewSet(BasePrototypeViewSet):
    queryset = Evidencia.objects.all()
    serializer_class = EvidenciaSerializer

class PlanAccionViewSet(BasePrototypeViewSet):
    queryset = PlanAccion.objects.all()
    serializer_class = PlanAccionSerializer
