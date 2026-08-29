import json
from typing import Dict, Any, List
from pydantic import BaseModel, Field
import ollama

from vector_store import VectorStore


# ==========================================
# 1. ESQUEMAS DE AUDITORÍA GRC DETALLADOS
# ==========================================

class TareaCompliance(BaseModel):
    id_tarea: str
    titulo: str
    descripcion: str
    area_responsable: str
    plazo_sugerido_dias: int
    prioridad: str
    impacto_incumplimiento: str


class NormativaSugerida(BaseModel):
    ley_id: str
    nombre_ley: str
    articulos_clave: List[str]
    justificacion_juridica: str
    nivel_riesgo_general: str
    tareas: List[TareaCompliance]


class EvaluacionGRC(BaseModel):
    resumen_ejecutivo: str
    normativas_aplicables: List[NormativaSugerida]


# ==========================================
# 2. SERVICIO DE AUDITORÍA CON OLLAMA (OPTIMIZADO PARA 3B)
# ==========================================

class OllamaSmartDiscoveryService:
    def __init__(self, model_name: str = "llama3.2:3b"):
        self.model_name = model_name
        self.vector_store = VectorStore()

    def evaluar_empresa(self, perfil_empresa: Dict[str, Any]) -> str:
        """
        Toma el perfil corporativo, recupera los fragmentos de leyes relevantes
        desde ChromaDB y solicita a Llama 3.2 una matriz de auditoría GRC completa.
        """
        query_text = (
            f"Empresa rubro {perfil_empresa.get('rubro', 'General')}. "
            f"Trabajadores: {perfil_empresa.get('empleados', 0)}. "
        )
        if perfil_empresa.get("maneja_datos"):
            query_text += "Datos personales y sensibles. "
        if perfil_empresa.get("es_ecommerce"):
            query_text += "Comercio electronico y pagos online. "
        if perfil_empresa.get("contrata_subcontratistas"):
            query_text += "Subcontratacion laboral. "

        print(f"[*] Buscando antecedentes normativos en ChromaDB...")
        resultados_rag = self.vector_store.search(query=query_text, top_k=6)
        
        contexto_legal = ""
        for idx, res in enumerate(resultados_rag):
            meta = res.get('metadata', {})
            contexto_legal += f"[Ley {meta.get('ley_id')} - {meta.get('nombre')}]\n{res.get('text')}\n\n"

        # Plantilla JSON de ejemplo directo para guiar a Llama 3.2 sin ambigüedad
        plantilla_ejemplo = {
            "resumen_ejecutivo": "Diagnóstico claro del nivel de cumplimiento y exposición legal de la empresa en Chile.",
            "normativas_aplicables": [
                {
                    "ley_id": "19628",
                    "nombre_ley": "Ley de Protección de la Vida Privada / Datos Personales",
                    "articulos_clave": ["Artículo 4", "Artículo 10"],
                    "justificacion_juridica": "La empresa almacena datos de clientes en su plataforma web, requiriendo autorización expresa.",
                    "nivel_riesgo_general": "Alto",
                    "tareas": [
                        {
                            "id_tarea": "T-19628-01",
                            "titulo": "Implementar Cláusula de Consentimiento Informado en Web",
                            "descripcion": "Agregar checkbox explícito de aceptación de políticas de privacidad en el checkout.",
                            "area_responsable": "TI / Ciberseguridad",
                            "plazo_sugerido_dias": 30,
                            "prioridad": "Alta",
                            "impacto_incumplimiento": "Multas por infracción a la protección de datos personales."
                        }
                    ]
                }
            ]
        }

        prompt = f"""Eres un Auditor Senior de Compliance Legal en Chile.
Analiza la siguiente empresa y las leyes chilenas oficiales recuperadas.
Genera el diagnóstico GRC y las tareas operativas obligatorias.

CONTEXTO LEGAL CHILENO RECUPERADO:
{contexto_legal}

PERFIL DE LA EMPRESA:
{json.dumps(perfil_empresa, indent=2, ensure_ascii=False)}

INSTRUCCIÓN:
Responde ÚNICAMENTE con un JSON con valores reales para esta empresa siguiendo exactamente esta estructura:
{json.dumps(plantilla_ejemplo, indent=2, ensure_ascii=False)}
"""

        print(f"[*] Solicitando análisis de auditoría a Ollama ({self.model_name})...")

        try:
            response = ollama.chat(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "Eres un auditor legal chileno estricto. Responde únicamente con el JSON de datos poblados. No des explicaciones en texto."},
                    {"role": "user", "content": prompt}
                ],
                format="json",
                options={
                    "temperature": 0.2
                }
            )
            return response["message"]["content"]
        except Exception as e:
            return json.dumps({"error": f"Error conectando con Ollama: {str(e)}"})
