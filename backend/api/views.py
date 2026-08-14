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
    
    empresa = serializer.save(setup_completado=True)
    perfil.empresa = empresa
    perfil.save()

    # 1. Motor de Matching Automático (Reglas base)
    compliances_base = asignar_normativas_base(empresa)

    # 2. Smart Discovery con Gemini 1.5 Pro
    compliances_ia = smart_discovery_service.ejecutar_smart_discovery(empresa)

    # 3. Serializar y devolver respuesta enriquecida
    todos_compliances = ComplianceEmpresa.objects.filter(empresa=empresa).select_related('normativa')
    
    return Response({
        "mensaje": "Onboarding completado exitosamente",
        "empresa": EmpresaOnboardingSerializer(empresa).data,
        "normativas_asignadas_count": len(compliances_base),
        "normativas_sugeridas_ia_count": len(compliances_ia),
        "compliances": ComplianceEmpresaSerializer(todos_compliances, many=True).data
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def empresas_compliance(request):
    """
    Endpoint GET /api/empresas/compliance/
    Lista todas las normativas asignadas y sugeridas para la empresa del usuario.
    """
    user = request.user
    if not hasattr(user, 'perfilusuario') or not user.perfilusuario.empresa:
        return Response([])
    
    empresa = user.perfilusuario.empresa
    compliances = ComplianceEmpresa.objects.filter(empresa=empresa).select_related('normativa')
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
        smart_discovery_service.ejecutar_smart_discovery(empresa)
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

