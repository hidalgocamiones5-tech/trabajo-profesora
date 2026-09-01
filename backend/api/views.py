from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import (
    Empresa, ComplianceEmpresa,
    Normativa, ObjetivoChecklist, TratamientoRAT, SolicitudTicket,
    Incidente, TareaPendiente, Riesgo, Sucursal, Area, Responsable,
    Obligacion, Control, Evidencia, Auditoria, PlanAccion, EventoCompliance,
    PerfilUsuario
)
from .serializers import (
    EmpresaOnboardingSerializer, ComplianceEmpresaSerializer,
    NormativaSerializer, ObjetivoChecklistSerializer, TratamientoRATSerializer,
    SolicitudTicketSerializer, IncidenteSerializer, TareaPendienteSerializer,
    RiesgoSerializer, SucursalSerializer, AreaSerializer, ResponsableSerializer,
    ObligacionSerializer, ControlSerializer, EvidenciaSerializer, AuditoriaSerializer,
    PlanAccionSerializer, EventoComplianceSerializer
)
from .services.matching_service import asignar_normativas_base
from .services.gemini_service import GeminiSmartDiscoveryService

smart_discovery_service = GeminiSmartDiscoveryService()

from django.utils import timezone
from rest_framework import status
from .serializers import (
    RegistroUsuarioSerializer, RegistroUsuarioEmpresaSerializer,
    RegistroAuditoriaARCOSerializer
)
from .models import RegistroAuditoriaARCO

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def auth_register(request):
    # Si viene con razon_social o acepto_terminos_y_privacidad, usar el serializer avanzado Ley 19.628
    if 'razon_social' in request.data or 'acepto_terminos_y_privacidad' in request.data or 'rut_empresa' in request.data:
        serializer = RegistroUsuarioEmpresaSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            result = serializer.save()
            return Response({
                "mensaje": "Usuario y Empresa registrados exitosamente conforme a la Ley N° 19.628.",
                "usuario": result['user'].username,
                "empresa": result['empresa'].nombre
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Fallback para registro básico
    serializer = RegistroUsuarioSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"mensaje": "Usuario creado exitosamente."}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def solicitud_arco_view(request):
    """
    Permite a los usuarios autenticados solicitar la supresión, rectificación, acceso u oposición de sus datos (Ley 19.628).
    """
    tipo_derecho = request.data.get('tipo_derecho')
    detalles = request.data.get('detalles')

    if not tipo_derecho or not detalles:
        return Response({'error': 'Debe especificar el tipo_derecho y los detalles de la solicitud.'}, status=status.HTTP_400_BAD_REQUEST)

    solicitud = RegistroAuditoriaARCO.objects.create(
        usuario=request.user,
        tipo_derecho=tipo_derecho,
        detalles=detalles,
        estado='PENDIENTE'
    )

    # Marcar flag en la empresa si aplica
    if hasattr(request.user, 'perfilusuario') and request.user.perfilusuario.empresa:
        empresa = request.user.perfilusuario.empresa
        empresa.solicitud_arco_activa = True
        empresa.save()

    return Response({
        'mensaje': f'Solicitud de Derecho ARCO ({tipo_derecho}) registrada exitosamente.',
        'solicitud': RegistroAuditoriaARCOSerializer(solicitud).data
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def mis_datos_view(request):
    """
    Permite descargar en JSON todos los datos personales y corporativos (Derecho de Acceso Ley 19.628).
    """
    user = request.user
    perfil = getattr(user, 'perfilusuario', None)
    empresa = perfil.empresa if perfil else None

    datos = {
        'ley_aplicable': 'Ley N° 19.628 sobre Protección de la Vida Privada / Datos Personales (Chile)',
        'fecha_extraccion': timezone.now().isoformat(),
        'usuario': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined.isoformat(),
        },
        'perfil_privacidad': {
            'nombre_completo': perfil.nombre_completo if perfil else None,
            'telefono': perfil.telefono if perfil else None,
            'cargo': perfil.cargo if perfil else None,
            'rut_personal': perfil.rut_personal if perfil else None,
            'acepto_terminos_y_privacidad': perfil.acepto_terminos_y_privacidad if perfil else False,
            'fecha_aceptacion_consentimiento': perfil.fecha_aceptacion_consentimiento.isoformat() if perfil and perfil.fecha_aceptacion_consentimiento else None,
            'ip_registro': perfil.ip_registro if perfil else None,
            'version_politica_aceptada': perfil.version_politica_aceptada if perfil else None,
        },
        'empresa': EmpresaOnboardingSerializer(empresa).data if empresa else None,
        'solicitudes_arco': RegistroAuditoriaARCOSerializer(user.solicitudes_arco.all(), many=True).data
    }

    return Response(datos, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    user = request.user
    full_name = f"{user.first_name} {user.last_name}".strip()
    if not full_name:
        full_name = "Felipe Sanchez" if user.username in ['empleado', 'admin'] else user.username
    
    empresa_data = None
    if hasattr(user, 'perfilusuario') and user.perfilusuario.empresa:
        empresa = user.perfilusuario.empresa
        empresa_data = EmpresaOnboardingSerializer(empresa).data
    else:
        # Si no tiene empresa pero está logueado, le aseguramos una instancia vinculada
        empresa, _ = Empresa.objects.get_or_create(nombre=f"Empresa de {user.username}")
        PerfilUsuario.objects.get_or_create(user=user, defaults={'empresa': empresa, 'cargo': 'Administrador'})
        empresa_data = EmpresaOnboardingSerializer(empresa).data

    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'name': full_name,
        'cargo': user.perfilusuario.cargo if hasattr(user, 'perfilusuario') else 'Administrador',
        'empresa': empresa_data
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def empresas_onboarding(request):
    """
    Endpoint POST /api/empresas/onboarding/
    Recibe los datos del formulario multi-paso, guarda la empresa, ejecuta
    el motor de matching y dispara el Smart Discovery con Gemini.
    """
    user = request.user
    perfil, _ = PerfilUsuario.objects.get_or_create(user=user)
    
    empresa = perfil.empresa
    serializer = EmpresaOnboardingSerializer(empresa, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)
    
    empresa = serializer.save(setup_completado=True, estado_matching='PENDIENTE')
    perfil.empresa = empresa
    perfil.save()

    # Ya NO asignamos las leyes automáticamente aquí, para que pase por el Human-in-the-Loop RAG.
    
    return Response({
        "mensaje": "Onboarding completado exitosamente",
        "empresa": EmpresaOnboardingSerializer(empresa).data,
        "normativas_asignadas_count": 0,
        "normativas_sugeridas_ia_count": 0,
        "compliances": []
    })

@api_view(['GET', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def empresas_compliance(request, compliance_id=None):
    """
    Endpoint GET /api/empresas/compliance/ (lista todos)
    Endpoint PATCH /api/empresas/compliance/<id>/ (actualiza responsable de una ley y tareas)
    """
    user = request.user
    if not hasattr(user, 'perfilusuario') or not user.perfilusuario.empresa:
        return Response([])
    
    empresa = user.perfilusuario.empresa

    if request.method == 'PATCH' and compliance_id:
        try:
            compliance = ComplianceEmpresa.objects.get(id=compliance_id, empresa=empresa)
            responsable = request.data.get('responsable')
            
            if responsable is not None:
                compliance.responsable = responsable
                compliance.save()
                
                # Cascade update to tasks
                tareas = TareaPendiente.objects.filter(compliance_empresa=compliance)
                tareas.update(responsable=responsable, responsable_asignado=responsable)
                
            return Response(ComplianceEmpresaSerializer(compliance).data)
        except ComplianceEmpresa.DoesNotExist:
            return Response({"error": "No encontrado"}, status=404)
            
    compliances = ComplianceEmpresa.objects.filter(empresa=empresa).select_related('normativa')
    for comp in compliances:
        comp.recalcular_progreso()
        comp.save(update_fields=['porcentaje_progreso', 'estado'])
    return Response(ComplianceEmpresaSerializer(compliances, many=True).data)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def empresa_setup(request):
    user = request.user
    perfil, _ = PerfilUsuario.objects.get_or_create(user=user)
    empresa = perfil.empresa
    if not empresa:
        empresa = Empresa.objects.create(nombre=f"Empresa de {user.username}")
        perfil.empresa = empresa
        perfil.save()
    
    serializer = EmpresaOnboardingSerializer(empresa, data=request.data, partial=True)
    if serializer.is_valid():
        empresa = serializer.save(setup_completado=True)
        asignar_normativas_base(empresa)
        return Response({
            "mensaje": "Empresa actualizada",
            "empresa": EmpresaOnboardingSerializer(empresa).data
        })
    return Response(serializer.errors, status=400)

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

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaOnboardingSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and not user.is_superuser:
            if hasattr(user, 'perfilusuario') and user.perfilusuario.empresa:
                return self.queryset.filter(id=user.perfilusuario.empresa.id)
            return self.queryset.none()
        return self.queryset

class NormativaViewSet(viewsets.ModelViewSet):
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

    def perform_create(self, serializer):
        super().perform_create(serializer)
        tarea = serializer.instance
        if tarea and tarea.compliance_empresa:
            tarea.compliance_empresa.recalcular_progreso()
            tarea.compliance_empresa.save(update_fields=['porcentaje_progreso', 'estado'])

    def perform_update(self, serializer):
        super().perform_update(serializer)
        tarea = serializer.instance
        if tarea and tarea.compliance_empresa:
            tarea.compliance_empresa.recalcular_progreso()
            tarea.compliance_empresa.save(update_fields=['porcentaje_progreso', 'estado'])
        elif tarea and tarea.empresa:
            for comp in ComplianceEmpresa.objects.filter(empresa=tarea.empresa):
                comp.recalcular_progreso()
                comp.save(update_fields=['porcentaje_progreso', 'estado'])

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

# --- NUEVOS ENDPOINTS DE INTEGRACION BCN / GEMINI ---
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services.ley_chile import LeyChileClient
from .services.gemini import GeminiAIService

ley_chile_client = LeyChileClient()
gemini_service = GeminiAIService()

@api_view(['GET'])
def recomendaciones_legales(request):
    rubro = request.query_params.get('rubro')
    tiene_datos = request.query_params.get('tiene_datos', 'false').lower() == 'true'
    es_ecommerce = request.query_params.get('es_ecommerce', 'false').lower() == 'true'
    tiene_residuos = request.query_params.get('tiene_residuos', 'false').lower() == 'true'

    # Si el usuario estÃ¡ autenticado, inferir datos de su empresa
    if request.user.is_authenticated and hasattr(request.user, 'perfilusuario') and request.user.perfilusuario.empresa:
        empresa = request.user.perfilusuario.empresa
        if not rubro:
            rubro = empresa.rubro
        tiene_datos = tiene_datos or empresa.maneja_datos_personales
        es_ecommerce = es_ecommerce or empresa.es_b2c_ecommerce
        tiene_residuos = tiene_residuos or empresa.genera_residuos_rep

    leyes = ley_chile_client.buscar_normas_por_empresa(
        rubro=rubro or 'TODOS',
        tiene_datos=tiene_datos,
        es_ecommerce=es_ecommerce,
        tiene_residuos=tiene_residuos
    )
    return Response(leyes)

@api_view(['POST'])
def generar_checklist(request):
    ley_data = request.data
    id_norma = ley_data.get('id') or ley_data.get('codigo_bcn')
    
    # 1. Obtener texto de BCN
    texto_legal = ley_chile_client.obtener_xml_bcn(str(id_norma))
    
    # 2. Procesar con Gemini AI
    checklist_estructurado = gemini_service.generar_checklist_desde_ley(texto_legal, ley_data)
    
    return Response(checklist_estructurado)

# -------------------------------------------------------------
# FASE 3: ENDPOINTS GRC & SERVICIOS
# -------------------------------------------------------------
from .models import AlertaCompliance
from .serializers import AlertaComplianceSerializer
from .services.score_engine import ScoreEngine
from .services.alert_engine import AlertEngine
from .services.calendar_engine import CalendarEngine
from .services.executive_report_engine import ExecutiveReportEngine

class AlertaComplianceViewSet(BaseEmpresaViewSet):
    queryset = AlertaCompliance.objects.all()
    serializer_class = AlertaComplianceSerializer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_ejecutivo_view(request):
    user = request.user
    empresa = getattr(user.perfilusuario, 'empresa', None) if hasattr(user, 'perfilusuario') else None
    if not empresa:
        empresa, _ = Empresa.objects.get_or_create(nombre=f"Empresa de {user.username}")
    
    # Escanear alertas y calendarizar
    AlertEngine.escanear_vencimientos(empresa)
    AlertEngine.verificar_reglas_escalamiento(empresa)
    CalendarEngine.sincronizar_todo(empresa)
    
    reporte = ExecutiveReportEngine.generar_reporte_ejecutivo_global(empresa)
    return Response(reporte)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ficha_normativa_view(request, normativa_id):
    try:
        normativa = Normativa.objects.get(id=normativa_id)
        ficha = ExecutiveReportEngine.generar_ficha_normativa(normativa)
        return Response(ficha)
    except Normativa.DoesNotExist:
        return Response({'error': 'Normativa no encontrada'}, status=404)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def area_desempeno_view(request, area_id):
    try:
        area = Area.objects.get(id=area_id)
        score = ScoreEngine.get_score_area(area)
        controles = Control.objects.filter(obligacion__area=area)
        return Response({
            "area": area.nombre,
            "score": score,
            "controles_count": controles.count()
        })
    except Area.DoesNotExist:
        return Response({'error': 'Área no encontrada'}, status=404)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def responsable_ficha_view(request, responsable_id):
    try:
        resp = Responsable.objects.get(id=responsable_id)
        obligaciones = Obligacion.objects.filter(responsable=resp)
        score = ScoreEngine.calcular_score_obligaciones(obligaciones)
        return Response({
            "responsable": resp.nombre,
            "cargo": resp.cargo,
            "score": score,
            "carga_laboral_count": obligaciones.count()
        })
    except Responsable.DoesNotExist:
        return Response({'error': 'Responsable no encontrado'}, status=404)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def mi_trabajo_view(request):
    user = request.user
    empresa = getattr(user.perfilusuario, 'empresa', None) if hasattr(user, 'perfilusuario') else None
    
    tareas = TareaPendiente.objects.all()
    if empresa:
        tareas = tareas.filter(empresa=empresa)
    
    # Filtrar si hay responsable que coincida con el nombre de usuario
    tareas_usuario = tareas.filter(responsable_asignado__icontains=user.username)
    if not tareas_usuario.exists():
        tareas_usuario = tareas

    serializer = TareaPendienteSerializer(tareas_usuario, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def escalar_alerta_view(request, alerta_id):
    try:
        alerta = AlertaCompliance.objects.get(id=alerta_id)
        alerta.estado = 'ESCALADA'
        alerta.fecha_escalamiento = timezone.now()
        alerta.save()
        return Response({'mensaje': 'Alerta escalada con éxito', 'alerta': AlertaComplianceSerializer(alerta).data})
    except AlertaCompliance.DoesNotExist:
        return Response({'error': 'Alerta no encontrada'}, status=404)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def calendario_eventos_view(request):
    user = request.user
    empresa = getattr(user.perfilusuario, 'empresa', None) if hasattr(user, 'perfilusuario') else None
    if empresa:
        eventos = EventoCompliance.objects.filter(empresa=empresa)
    else:
        eventos = EventoCompliance.objects.all()
    
    serializer = EventoComplianceSerializer(eventos, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generar_resumen_ia_view(request):
    user = request.user
    empresa = getattr(user.perfilusuario, 'empresa', None) if hasattr(user, 'perfilusuario') else None
    reporte = ExecutiveReportEngine.generar_reporte_ejecutivo_global(empresa) if empresa else {}
    
    prompt = f"Genera un resumen ejecutivo directivo de 3 líneas para la empresa {empresa.nombre if empresa else 'General'}. Contexto: Cumplimiento global del {reporte.get('score_global', {}).get('porcentaje', 80)}%, Gravedad de riesgos: {reporte.get('gravedad_riesgos', 'Media')}."
    
    resumen = gemini_service.generar_respuesta_libre(prompt)
    return Response({'resumen': resumen})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def normativas_disponibles_view(request):
    user = request.user
    empresa = getattr(user.perfilusuario, 'empresa', None) if hasattr(user, 'perfilusuario') else None
    if not empresa:
        return Response([])
    
    asignadas = ComplianceEmpresa.objects.filter(empresa=empresa).values_list('normativa_id', flat=True)
    disponibles = Normativa.objects.exclude(id__in=asignadas)
    
    serializer = NormativaSerializer(disponibles, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def asignar_normativa_view(request):
    user = request.user
    empresa = getattr(user.perfilusuario, 'empresa', None) if hasattr(user, 'perfilusuario') else None
    if not empresa:
        return Response({'error': 'Usuario no tiene empresa asignada'}, status=400)
        
    normativa_id = request.data.get('normativa_id')
    if not normativa_id:
        return Response({'error': 'normativa_id es requerido'}, status=400)
        
    try:
        normativa = Normativa.objects.get(id=normativa_id)
        compliance, created = ComplianceEmpresa.objects.get_or_create(
            empresa=empresa,
            normativa=normativa,
            defaults={
                'estado': 'PRELIMINAR',
                'origen': 'CATALOGO_MANUAL',
                'porcentaje_progreso': 0.0
            }
        )
        if created:
            return Response({'mensaje': 'Normativa asignada con éxito'}, status=201)
        else:
            return Response({'mensaje': 'La normativa ya estaba asignada'}, status=200)
    except Normativa.DoesNotExist:
        return Response({'error': 'Normativa no encontrada'}, status=404)

from .services.gemini_service import GeminiSmartDiscoveryService

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def smart_discovery_view(request):
    user = request.user
    empresa = getattr(user.perfilusuario, 'empresa', None) if hasattr(user, 'perfilusuario') else None
    if not empresa:
        return Response({'error': 'Usuario no tiene empresa asignada'}, status=400)
        
    try:
        service = GeminiSmartDiscoveryService()
        sugerencias = service.ejecutar_smart_discovery(empresa)
        return Response({'message': 'Sugerencias IA generadas', 'count': len(sugerencias)})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def evaluar_compliance_rag_view(request):
    """
    Endpoint RAG: Realiza diagnóstico GRC mediante Ollama (Llama 3.2) y asigna normativas
    y tareas de cumplimiento a la empresa del usuario autenticado.
    """
    user = request.user
    empresa = getattr(user.perfilusuario, 'empresa', None) if hasattr(user, 'perfilusuario') else None
    
    # Permitir a administradores evaluar una empresa específica enviando 'empresa_id'
    empresa_id_param = request.data.get('empresa_id')
    if user.is_staff and empresa_id_param:
        empresa = Empresa.objects.filter(id=empresa_id_param).first()
        
    if not empresa:
        return Response({'error': 'No se encontró empresa para auditar'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        from .services.rag_engine.audit_service import GrcAuditService
        audit_service = GrcAuditService()
        resultado = audit_service.auditar_y_asignar(empresa)
        
        if resultado.get("success"):
            return Response({
                'mensaje': 'Auditoría RAG completada con éxito',
                'empresa': empresa.nombre,
                'resumen_ejecutivo': resultado.get('resumen_ejecutivo'),
                'normativas_asignadas': resultado.get('normativas_asignadas'),
                'tareas_creadas': resultado.get('tareas_creadas'),
                'datos': resultado.get('datos_completos')
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': resultado.get('error')}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': f'Excepción en motor de auditoría: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

