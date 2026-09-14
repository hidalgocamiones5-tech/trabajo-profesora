from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SolicitudARCOViewSet, IncidenteKarinViewSet, RiesgoPenalViewSet, DashboardKPIsViewSet

router = DefaultRouter()
router.register(r'arco', SolicitudARCOViewSet)
router.register(r'karin', IncidenteKarinViewSet)
router.register(r'riesgos', RiesgoPenalViewSet)
router.register(r'kpis', DashboardKPIsViewSet, basename='dashboard-kpis')

urlpatterns = [
    path('', include(router.urls)),
]
