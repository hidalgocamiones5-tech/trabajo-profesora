import os
import json
import time
from typing import List, Dict, Any
from ..models import Empresa, Normativa, ComplianceEmpresa

class GeminiSmartDiscoveryService:
    """Servicio de Smart Discovery Legal con Gemini 1.5 Pro"""

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.use_mock = os.getenv("USE_MOCKS", "True").lower() == "true" or not bool(self.api_key)

    def ejecutar_smart_discovery(self, empresa: Empresa) -> List[ComplianceEmpresa]:
        """
        Ejecuta Smart Discovery con IA para encontrar normativas complejas o emergentes
        específicas para el perfil operacional de la empresa.
        """
        datos_empresa = {
            "nombre": empresa.nombre,
            "tipo_sociedad": empresa.tipo_sociedad,
            "rubro": empresa.get_rubro_display() if hasattr(empresa, 'get_rubro_display') else empresa.rubro,
            "rango_empleados": empresa.get_rango_empleados_display() if hasattr(empresa, 'get_rango_empleados_display') else empresa.rango_empleados,
            "maneja_datos_personales": empresa.maneja_datos_personales,
            "es_b2c_ecommerce": empresa.es_b2c_ecommerce,
            "procesa_pagos": empresa.procesa_pagos,
            "genera_residuos_rep": empresa.genera_residuos_rep,
            "tiene_trabajadores": empresa.tiene_trabajadores,
        }

        if not isinstance(empresa.log_matching, dict):
            empresa.log_matching = {}

        try:
            if self.use_mock:
                empresa.estado_matching = 'FALLBACK_IA'
                empresa.log_matching['gemini_status'] = 'mocked (USE_MOCKS=True)'
                resultado_json = self._mock_smart_discovery(datos_empresa)
            else:
                resultado_json = self._consultar_gemini_api(datos_empresa)
                if empresa.estado_matching != 'FALLBACK_IA' and empresa.estado_matching != 'ERROR':
                    if empresa.estado_matching != 'ADVERTENCIA': 
                        empresa.estado_matching = 'EXITOSO'
        except Exception as e:
            empresa.estado_matching = 'ERROR'
            empresa.log_matching['gemini_error_critico'] = str(e)
            empresa.save()
            return []

        empresa.save()

        compliances_sugeridos = []
        for ley in resultado_json.get("leyes_sugeridas", []):
            normativa, _ = Normativa.objects.get_or_create(
                titulo=ley.get("titulo"),
                defaults={
                    "nombre": ley.get("titulo"),
                    "codigo_bcn": ley.get("codigo_bcn") or "IA-BCN",
                    "resumen": ley.get("justificacion", "Sugerida por Smart Discovery IA"),
                    "descripcion": ley.get("justificacion", ""),
                    "criticidad": (ley.get("nivel_criticidad") or "MEDIA").lower(),
                    "origen": "Smart Discovery (Gemini 1.5 Pro)",
                    "tipo": "Ley Sugerida"
                }
            )

            compliance, _ = ComplianceEmpresa.objects.get_or_create(
                empresa=empresa,
                normativa=normativa,
                defaults={
                    "estado": "SUGERIDA_IA",
                    "origen": "SMART_DISCOVERY_IA",
                    "justificacion_ia": ley.get("justificacion", ""),
                    "porcentaje_progreso": 0.0
                }
            )
            compliances_sugeridos.append(compliance)

        return compliances_sugeridos

    def _consultar_gemini_api(self, datos_empresa: Dict[str, Any]) -> Dict[str, Any]:
        """Llamada directa al SDK de Google Gemini con salida JSON Schema estricta."""
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=self.api_key)
            prompt = (
                f"Eres un Asesor Legal Corporativo especializado en la legislación de Chile. "
                f"Analiza el siguiente perfil de empresa chilena y determina leyes, decretos o reglamentos "
                f"específicos adicionales que debe cumplir obligatoriamente.\n\n"
                f"Perfil de la Empresa:\n{json.dumps(datos_empresa, indent=2, ensure_ascii=False)}\n\n"
                f"Genera sugerencias precisas con código BCN si aplica y justificación técnica."
            )

            response = client.models.generate_content(
                model='gemini-1.5-pro',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"[Gemini Smart Discovery Warning] Falló llamada API ({e}), usando motor heurístico mock...")
            return self._mock_smart_discovery(datos_empresa)

    def _mock_smart_discovery(self, datos_empresa: Dict[str, Any]) -> Dict[str, Any]:
        """Motor mock contextual para pruebas sin consumir cuotas de API."""
        rubro = datos_empresa.get("rubro", "").upper()
        sugerencias = []

        if "TECNOLOGIA" in rubro or "SOFTWARE" in rubro:
            sugerencias.append({
                "titulo": "Ley N° 21.459: Establece Normas sobre Delitos Informáticos",
                "codigo_bcn": "1176766",
                "justificacion": f"Para empresas de {rubro}, esta ley tipifica el acceso ilícito, interceptación y falsificación de datos informáticos.",
                "nivel_criticidad": "ALTA"
            })
            sugerencias.append({
                "titulo": "Norma Técnica NCh-ISO 27001 de Seguridad de la Información",
                "codigo_bcn": "NCh-27001",
                "justificacion": "Recomendada como estándar de gobernanza de datos y mitigación de riesgos de ciberseguridad corporativa.",
                "nivel_criticidad": "MEDIA"
            })
        elif "SALUD" in rubro:
            sugerencias.append({
                "titulo": "Decreto Supremo N° 466: Reglamento de Farmacias y Establecimientos Asistenciales",
                "codigo_bcn": "13467",
                "justificacion": "Aplica por el rubro de Salud para almacenamiento de insumos y permisos sanitarios SEREMI.",
                "nivel_criticidad": "ALTA"
            })
        elif "FINANCIERO" in rubro:
            sugerencias.append({
                "titulo": "Ley N° 19.913: Prevención del Lavado de Activos y Financiamiento del Terrorismo (UAF)",
                "codigo_bcn": "219504",
                "justificacion": "Obliga a entidades de servicios financieros a designar un Oficial de Cumplimiento y reportar operaciones sospechosas.",
                "nivel_criticidad": "ALTA"
            })
        else:
            sugerencias.append({
                "titulo": "Ley N° 20.393: Responsabilidad Penal de las Personas Jurídicas",
                "codigo_bcn": "1008637",
                "justificacion": f"Fundamental para toda {datos_empresa.get('tipo_sociedad', 'sociedad')} para implementar Modelos de Prevención de Delitos (MPD).",
                "nivel_criticidad": "ALTA"
            })

        if datos_empresa.get("es_b2c_ecommerce"):
            sugerencias.append({
                "titulo": "Reglamento de Comercio Electrónico (Decreto N° 6 del Ministerio de Economía)",
                "codigo_bcn": "1165682",
                "justificacion": "Exige publicar precios finales con despacho, tiempos de entrega y canales directos de contacto al consumidor.",
                "nivel_criticidad": "MEDIA"
            })

        return {"leyes_sugeridas": sugerencias}
