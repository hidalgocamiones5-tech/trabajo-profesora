import os
import json
import time

class GeminiAIService:
    """Servicio para procesar textos legales con Google Gemini AI"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.use_mock = os.getenv("USE_MOCKS", "True").lower() == "true"
        # En prod: google.generativeai.configure(api_key=self.api_key)

    def generar_checklist_desde_ley(self, texto_ley: str, metadata_ley: dict):
        """
        Toma el texto legal y le pide a Gemini generar un JSON con el checklist.
        """
        if self.use_mock:
            time.sleep(2) # Simula procesamiento LLM
            return self._mock_respuesta_checklist(metadata_ley)

        if not self.api_key:
            print("[Gemini Error] No API Key found, cayendo a mock...")
            return self._mock_respuesta_checklist(metadata_ley)

        try:
            # Implementación Real usando google-generativeai
            # import google.generativeai as genai
            # model = genai.GenerativeModel('gemini-1.5-pro')
            # prompt = f"Eres un abogado experto. Analiza la ley {metadata_ley['nombre']}. Texto: {texto_ley}. Extrae un checklist en formato estricto JSON."
            # response = model.generate_content(prompt)
            # return json.loads(response.text)
            pass
        except Exception as e:
            print(f"[Gemini Error] Falló generación: {str(e)}")
            return self._mock_respuesta_checklist(metadata_ley)

    def _mock_respuesta_checklist(self, metadata_ley: dict):
        """Respuesta hardcodeada simulando a Gemini"""
        return {
            "id": f"gen_{metadata_ley['id']}",
            "nombre": metadata_ley["nombre"],
            "descripcion": metadata_ley["descripcion"],
            "criticidad": metadata_ley["criticidad"],
            "origen": "Ley Chile - BCN",
            "fechaInicio": "2024-01-01",
            "fechaTermino": "2026-12-31",
            "progreso": 0,
            "estado": "en_tiempo",
            "checklist": [
                {
                    "id": "chk_1",
                    "categoria": "Diagnóstico Inicial",
                    "nombre": "Realizar evaluación de brechas (Gap Analysis)",
                    "estado": "pendiente",
                    "responsable": "Sin asignar"
                },
                {
                    "id": "chk_2",
                    "categoria": "Políticas Internas",
                    "nombre": "Redactar política de cumplimiento normativo",
                    "estado": "pendiente",
                    "responsable": "Sin asignar"
                },
                {
                    "id": "chk_3",
                    "categoria": "Políticas Internas",
                    "nombre": "Capacitación a empleados clave",
                    "estado": "pendiente",
                    "responsable": "Sin asignar"
                }
            ],
            "rat": [
                {
                    "id": "rat_1",
                    "area": "Recursos Humanos",
                    "tratamiento": "Datos de nómina",
                    "finalidad": "Cumplimiento legal",
                    "baseLicitud": "Obligación legal",
                    "estado": "pendiente"
                }
            ]
        }
