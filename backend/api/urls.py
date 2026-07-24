from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NormativaViewSet, ObjetivoChecklistViewSet, TratamientoRATViewSet,
    SolicitudTicketViewSet, IncidenteViewSet, TareaPendienteViewSet,
    RiesgoViewSet, SucursalViewSet, AreaViewSet, ResponsableViewSet,
    AuditoriaViewSet, EventoComplianceViewSet, ObligacionViewSet,
    ControlViewSet, EvidenciaViewSet, PlanAccionViewSet
)

router = DefaultRouter()
router.register(r'normativas', NormativaViewSet)
router.register(r'objetivos', ObjetivoChecklistViewSet)
router.register(r'tratamientos', TratamientoRATViewSet)
router.register(r'tickets', SolicitudTicketViewSet)
router.register(r'incidentes', IncidenteViewSet)
router.register(r'tareas', TareaPendienteViewSet)
router.register(r'riesgos', RiesgoViewSet)
router.register(r'sucursales', SucursalViewSet)
router.register(r'areas', AreaViewSet)
router.register(r'responsables', ResponsableViewSet)
router.register(r'auditorias', AuditoriaViewSet)
router.register(r'eventos-compliance', EventoComplianceViewSet)
router.register(r'obligaciones', ObligacionViewSet)
router.register(r'controles', ControlViewSet)
router.register(r'evidencias', EvidenciaViewSet)
router.register(r'planes-accion', PlanAccionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
