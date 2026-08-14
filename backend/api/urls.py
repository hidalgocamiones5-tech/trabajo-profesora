from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    NormativaViewSet, ObjetivoChecklistViewSet, TratamientoRATViewSet,
    SolicitudTicketViewSet, IncidenteViewSet, TareaPendienteViewSet,
    RiesgoViewSet, SucursalViewSet, AreaViewSet, ResponsableViewSet,
    AuditoriaViewSet, EventoComplianceViewSet, ObligacionViewSet,
    ControlViewSet, EvidenciaViewSet, PlanAccionViewSet, me_view,
    EmpresaViewSet
)

router = DefaultRouter()
router.register(r'empresas', EmpresaViewSet, basename='empresa')
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

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', views.auth_register, name='auth_register'),
    path('auth/registro/', views.auth_register, name='auth_registro'),
    path('privacidad/solicitud-arco/', views.solicitud_arco_view, name='solicitud_arco'),
    path('privacidad/mis-datos/', views.mis_datos_view, name='mis_datos'),
    path('me/', me_view, name='me'),
    path('empresas/onboarding/', views.empresas_onboarding, name='empresas_onboarding'),
    path('empresas/compliance/', views.empresas_compliance, name='empresas_compliance'),
    path('empresa/setup/', views.empresa_setup, name='empresa_setup'),
    path('recomendaciones_legales/', views.recomendaciones_legales, name='recomendaciones_legales'),
    path('generar_checklist/', views.generar_checklist, name='generar_checklist'),
    path('', include(router.urls)),
]
