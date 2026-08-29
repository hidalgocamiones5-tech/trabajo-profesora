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
router.register(r'alertas-compliance', views.AlertaComplianceViewSet, basename='alerta-compliance')

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
    path('empresas/compliance/<int:compliance_id>/', views.empresas_compliance, name='empresas_compliance_patch'),
    path('empresa/setup/', views.empresa_setup, name='empresa_setup'),
    path('recomendaciones_legales/', views.recomendaciones_legales, name='recomendaciones_legales'),
    path('generar_checklist/', views.generar_checklist, name='generar_checklist'),

    
    # GRC Endpoints
    path('dashboard/ejecutivo/', views.dashboard_ejecutivo_view, name='dashboard_ejecutivo'),
    path('compliance/normativas/<int:normativa_id>/ficha-completa/', views.ficha_normativa_view, name='ficha_normativa'),
    path('compliance/areas/<int:area_id>/desempeno/', views.area_desempeno_view, name='area_desempeno'),
    path('compliance/responsables/<int:responsable_id>/ficha/', views.responsable_ficha_view, name='responsable_ficha'),
    path('compliance/mi-trabajo/', views.mi_trabajo_view, name='compliance_mi_trabajo'),
    path('normativas/disponibles/', views.normativas_disponibles_view, name='normativas_disponibles'),
    path('normativas/asignar/', views.asignar_normativa_view, name='asignar_normativa'),
    path('empresas/smart-discovery/', views.smart_discovery_view, name='smart_discovery'),
    path('alertas/<int:alerta_id>/escalar/', views.escalar_alerta_view, name='escalar_alerta'),
    path('calendario/eventos/', views.calendario_eventos_view, name='calendario_eventos'),
    path('dashboard/generar_resumen/', views.generar_resumen_ia_view, name='generar_resumen_ia'),
    path('compliance/evaluar-rag/', views.evaluar_compliance_rag_view, name='compliance_evaluar_rag'),
    
    path('', include(router.urls)),
]
