import json
import datetime
from typing import Dict, Any, List
from django.db import transaction
from django.utils import timezone
import ollama

from api.models import Empresa, Normativa, ComplianceEmpresa, TareaPendiente
from api.services.rag_engine.vector_store import VectorStore


class GrcAuditService:
    """
    Servicio de Auditoría GRC Inteligente y Asignación Automática de Normativas
    y Tareas para empresas en Chile usando RAG + Ollama (Llama 3.2).
    """
    def __init__(self, model_name: str = "llama3.2:3b"):
        self.model_name = model_name
        self.vector_store = VectorStore()

    def _generar_query_perfil(self, empresa: Empresa) -> str:
        """Construye un query descriptivo basado en los atributos del modelo Empresa."""
        rango_dict = {
            'MICRO': 'Microempresa de 1 a 9 trabajadores',
            'PEQUENA': 'Pequeña empresa de 10 a 49 trabajadores',
            'MEDIANA': 'Mediana empresa de 50 a 199 trabajadores',
            'GRANDE': 'Gran empresa de más de 200 trabajadores'
        }
        
        query = f"Empresa del rubro {empresa.rubro or 'General'}. {rango_dict.get(empresa.rango_empleados, 'Pequeña empresa')}. "
        if empresa.maneja_datos_personales:
            query += "Tratamiento de datos personales de clientes y privacidad. "
        if empresa.es_b2c_ecommerce:
            query += "Comercio electronico B2C, SERNAC y pasarelas de pago web. "
        if empresa.tiene_trabajadores:
            query += "Relaciones laborales, Ley Karin y prevencion de acoso laboral. "
        if empresa.procesa_pagos:
            query += "Procesamiento de pagos, Fintech y prevencion de lavado de activos. "
        if empresa.instalaciones_industriales:
            query += "Instalaciones industriales y seguridad laboral DS 594. "
        if empresa.genera_residuos_rep:
            query += "Gestion de residuos y Ley REP. "
            
        return query

    def auditar_y_asignar(self, empresa: Empresa) -> Dict[str, Any]:
        """
        Ejecuta el ciclo completo:
        1. Query semántico en ChromaDB.
        2. Inferencia determinista en Ollama (Llama 3.2).
        3. Persistencia atómica de Normativas y Tareas en la BD de Django.
        """
        query_text = self._generar_query_perfil(empresa)
        resultados_rag = self.vector_store.search(query=query_text, top_k=6)
        
        contexto_legal = ""
        for idx, res in enumerate(resultados_rag):
            meta = res.get('metadata', {})
            contexto_legal += f"[Ley {meta.get('ley_id')} - {meta.get('nombre')}]\n{res.get('text')}\n\n"

        perfil_dict = {
            "nombre": empresa.nombre,
            "rubro": empresa.rubro,
            "rango_empleados": empresa.rango_empleados,
            "maneja_datos_personales": empresa.maneja_datos_personales,
            "es_b2c_ecommerce": empresa.es_b2c_ecommerce,
            "tiene_trabajadores": empresa.tiene_trabajadores,
            "procesa_pagos": empresa.procesa_pagos
        }

        plantilla_ejemplo = {
            "resumen_ejecutivo": "Diagnóstico de cumplimiento legal chileno.",
            "normativas_aplicables": [
                {
                    "ley_id": "19628",
                    "nombre_ley": "Ley de Protección de la Vida Privada / Datos Personales",
                    "articulos_clave": ["Artículo 4"],
                    "justificacion_juridica": "Aplica por almacenamiento de datos de clientes.",
                    "nivel_riesgo_general": "Alto",
                    "tareas": [
                        {
                            "id_tarea": "T-19628-01",
                            "titulo": "Implementar Cláusula de Consentimiento en Sitio Web",
                            "descripcion": "Publicar política de privacidad y checkbox de aceptación.",
                            "area_responsable": "TI / Ciberseguridad",
                            "plazo_sugerido_dias": 30,
                            "prioridad": "Alta",
                            "impacto_incumplimiento": "Multas legales."
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
{json.dumps(perfil_dict, indent=2, ensure_ascii=False)}

INSTRUCCIÓN:
Responde ÚNICAMENTE con un JSON válido que siga exactamente esta estructura:
{json.dumps(plantilla_ejemplo, indent=2, ensure_ascii=False)}
"""

        try:
            response = ollama.chat(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "Eres un auditor legal chileno estricto. Responde únicamente con el JSON poblado."},
                    {"role": "user", "content": prompt}
                ],
                format="json",
                options={"temperature": 0.2}
            )
            
            data_json = json.loads(response["message"]["content"])
        except Exception as e:
            return {"success": False, "error": f"Fallo en inferencia de Ollama: {str(e)}"}

        # 4. Persistencia en Base de Datos Relacional de Django
        normativas_creadas = 0
        tareas_creadas = 0
        
        with transaction.atomic():
            hoy = timezone.now().date()
            
            for item_norma in data_json.get("normativas_aplicables", []):
                nombre_norma = item_norma.get("nombre_ley", f"Ley {item_norma.get('ley_id')}")
                riesgo_raw = item_norma.get("nivel_riesgo_general", "Media").lower()
                criticidad_map = {'crítico': 'alta', 'critico': 'alta', 'alto': 'alta', 'alta': 'alta', 'moderado': 'media', 'medio': 'media', 'media': 'media', 'bajo': 'baja', 'baja': 'baja'}
                criticidad = criticidad_map.get(riesgo_raw, 'media')
                
                # Crear o actualizar Normativa
                normativa_obj, _ = Normativa.objects.get_or_create(
                    empresa=empresa,
                    nombre=nombre_norma,
                    defaults={
                        'estado': 'en_tiempo',
                        'criticidad': criticidad,
                        'progreso': 0,
                        'fecha_inicio': hoy,
                        'fecha_termino': hoy + datetime.timedelta(days=90)
                    }
                )
                normativas_creadas += 1
                
                # Crear o actualizar ComplianceEmpresa
                ce_obj, _ = ComplianceEmpresa.objects.get_or_create(
                    empresa=empresa,
                    normativa=normativa_obj,
                    defaults={
                        'estado': 'ASIGNADA',
                        'porcentaje_progreso': 0.0,
                        'origen': 'RAG_OLLAMA_IA',
                        'justificacion_ia': item_norma.get('justificacion_juridica', '')
                    }
                )
                
                # Crear Tareas asociadas
                for t in item_norma.get("tareas", []):
                    plazo_dias = t.get("plazo_sugerido_dias", 30)
                    vencimiento = hoy + datetime.timedelta(days=plazo_dias)
                    prioridad_tarea = criticidad_map.get(t.get("prioridad", "media").lower(), "media")
                    
                    # Evitar duplicar la misma tarea si ya existe
                    tarea_existente = TareaPendiente.objects.filter(
                        empresa=empresa,
                        normativa=normativa_obj,
                        tarea=t.get("titulo")
                    ).first()
                    
                    if not tarea_existente:
                        TareaPendiente.objects.create(
                            empresa=empresa,
                            normativa=normativa_obj,
                            compliance_empresa=ce_obj,
                            tarea=t.get("titulo", "Tarea de cumplimiento"),
                            responsable=t.get("area_responsable", "Compliance"),
                            responsable_asignado=t.get("area_responsable", "Compliance"),
                            asociada_a=f"Ley {item_norma.get('ley_id')}",
                            fecha_vencimiento=vencimiento,
                            prioridad=prioridad_tarea,
                            estado='pendiente'
                        )
                        tareas_creadas += 1

            # Actualizar estado de matching de la empresa
            empresa.estado_matching = 'COMPLETADO'
            empresa.log_matching = f"Auditoría RAG completada el {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}. Normativas evaluadas: {normativas_creadas}, Tareas generadas: {tareas_creadas}."
            empresa.save(update_fields=['estado_matching', 'log_matching'])

            # Registrar log de auditoría
            try:
                from rag_admin.models import RegistroAuditoriaRAG
                RegistroAuditoriaRAG.objects.create(
                    empresa=empresa,
                    modelo_ia=self.model_name,
                    resumen_ejecutivo=data_json.get("resumen_ejecutivo", ""),
                    normativas_detectadas=normativas_creadas,
                    tareas_generadas=tareas_creadas,
                    exito=True,
                    datos_completos_json=data_json
                )
            except Exception as e_log:
                print(f"[Warn] No se pudo guardar log RAG: {e_log}")

        return {
            "success": True,
            "resumen_ejecutivo": data_json.get("resumen_ejecutivo"),
            "normativas_asignadas": normativas_creadas,
            "tareas_creadas": tareas_creadas,
            "datos_completos": data_json
        }
