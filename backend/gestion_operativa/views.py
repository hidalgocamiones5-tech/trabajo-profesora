from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import SolicitudARCO, IncidenteKarin, RiesgoPenal
from .serializers import SolicitudARCOSerializer, IncidenteKarinSerializer, RiesgoPenalSerializer
from .services.sla_manager import SLAManager

class SolicitudARCOViewSet(viewsets.ModelViewSet):
    queryset = SolicitudARCO.objects.all().order_by('-fecha_ingreso')
    serializer_class = SolicitudARCOSerializer

    @action(detail=True, methods=['patch'])
    def actualizar_estado(self, request, pk=None):
        solicitud = self.get_object()
        nuevo_estado = request.data.get('estado')
        
        if nuevo_estado in dict(SolicitudARCO.ESTADO_CHOICES).keys():
            solicitud.estado = nuevo_estado
            if nuevo_estado in ['RESUELTA', 'RECHAZADA']:
                solicitud.fecha_resolucion = timezone.now()
            solicitud.save()
            return Response(self.get_serializer(solicitud).data)
        return Response({"error": "Estado inválido"}, status=status.HTTP_400_BAD_REQUEST)

class IncidenteKarinViewSet(viewsets.ModelViewSet):
    queryset = IncidenteKarin.objects.all().order_by('-fecha_ingreso')
    serializer_class = IncidenteKarinSerializer

    @action(detail=True, methods=['patch'])
    def aplicar_cautelares(self, request, pk=None):
        incidente = self.get_object()
        medidas = request.data.get('medidas_cautelares_adoptadas')
        
        if not medidas:
            return Response({"error": "Debe especificar las medidas adoptadas"}, status=status.HTTP_400_BAD_REQUEST)
            
        incidente.medidas_cautelares_adoptadas = medidas
        incidente.estado = 'CAUTELARES_APLICADAS'
        incidente.save()
        return Response(self.get_serializer(incidente).data)

class RiesgoPenalViewSet(viewsets.ModelViewSet):
    queryset = RiesgoPenal.objects.all()
    serializer_class = RiesgoPenalSerializer

class DashboardKPIsViewSet(viewsets.ViewSet):
    def list(self, request):
        """Devuelve los KPIs globales para las tarjetas del Dashboard superior."""
        # 1. ARCO Activas (no resueltas/rechazadas)
        arco_activas = SolicitudARCO.objects.exclude(estado__in=['RESUELTA', 'RECHAZADA'])
        
        sla_critico = 0
        for arco in arco_activas:
            st = SLAManager.check_sla_status(arco.fecha_vencimiento_sla)
            if st in ['CRITICAL', 'WARNING']:
                sla_critico += 1
                
        total_resueltas = SolicitudARCO.objects.filter(estado='RESUELTA').count()
        resueltas_a_tiempo = 0
        # Simplificación: asumimos 100% si no hay un cálculo exacto de resoluciones fuera de plazo por ahora
        cumplimiento = 100 if total_resueltas > 0 else 0 
        
        # 2. Incidentes Karin Activos
        karin_activos = IncidenteKarin.objects.exclude(estado='RESUELTA').count()
        
        # 3. Riesgos
        total_riesgos = RiesgoPenal.objects.count()
        
        return Response({
            "arco_activas": arco_activas.count(),
            "arco_sla_critico": sla_critico,
            "cumplimiento_sla_arco": cumplimiento,
            "karin_incidentes_activos": karin_activos,
            "riesgos_penales_totales": total_riesgos
        })
