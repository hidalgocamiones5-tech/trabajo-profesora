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
        
        # 1. Filtro Duro (Búsqueda Híbrida post-retrieval)
        resultados_rag_brutos = self.vector_store.search(query=query_text, top_k=12)
        
        excluir_categorias = []
        if not empresa.tiene_trabajadores:
            excluir_categorias.extend(["Laboral", "Seguridad Ocupacional"])
        if not empresa.genera_residuos_rep:
            excluir_categorias.append("Medioambiente & Residuos")
            
        resultados_rag = []
        for res in resultados_rag_brutos:
            cat = res.get('metadata', {}).get('categoria', '')
            if cat not in excluir_categorias:
                resultados_rag.append(res)
            if len(resultados_rag) >= 6:
                break
        
        contexto_legal = ""
        for idx, res in enumerate(resultados_rag):
            meta = res.get('metadata', {})
            contexto_legal += f"- {res.get('text')}\n"

        perfil_dict = {
            "nombre": empresa.nombre,
            "rubro": empresa.rubro or "General",
            "empleados": empresa.rango_empleados,
            "maneja_datos_personales": empresa.maneja_datos_personales,
            "es_b2c_ecommerce": empresa.es_b2c_ecommerce,
            "tiene_trabajadores": empresa.tiene_trabajadores,
            "procesa_pagos": empresa.procesa_pagos
        }

        # 2. Plantilla con Pensamiento Simplificado para modelos pequeños
        plantilla_ejemplo = {
            "resumen_ejecutivo": "Diagnóstico conciso de cumplimiento.",
            "normativas_aplicables": [
                {
                    "ley_id": "[NÚMERO DE LA LEY, EJ. Ley 20.393]",
                    "nombre_ley": "[NOMBRE DE LA LEY]",
                    "justificacion_juridica": "La empresa maneja datos de clientes, por ende aplica la norma de privacidad.",
                    "articulos_clave": ["Art. 4"],
                    "nivel_riesgo_general": "Alta",
                    "tareas": [
                        {
                            "id_tarea": "T-1",
                            "titulo": "Publicar política de privacidad",
                            "descripcion": "Implementar checkbox en plataforma.",
                            "area_responsable": "Legal",
                            "plazo_sugerido_dias": 30,
                            "prioridad": "Alta",
                            "impacto_incumplimiento": "Multas."
                        }
                    ]
                }
            ]
        }

        prompt = f"""Eres un Auditor Senior de Compliance Legal en Chile.
Genera el diagnóstico y tareas obligatorias según el perfil de la empresa y las leyes aplicables.

REGLAS LEGALES VIGENTES RECUPERADAS:
{contexto_legal}

PERFIL EMPRESA:
{json.dumps(perfil_dict, ensure_ascii=False)}

INSTRUCCIÓN:
1. Revisa las reglas recuperadas. Si la empresa NO tiene trabajadores (tiene_trabajadores: false), NO asocies normas Laborales.
2. Es CRÍTICO que el campo 'ley_id' coincida exactamente con el número de la ley evaluada (ej. "Ley 21.643", "Ley 20.393") tal como aparece en el contexto, y NO copies el de la plantilla.
3. Genera un JSON válido con la siguiente estructura exacta, incluyendo la 'justificacion_juridica' detallada para cada ley:
{json.dumps(plantilla_ejemplo, ensure_ascii=False)}
"""
        
        with open("rag_ia.log", "a", encoding="utf-8") as log_file:
            log_file.write(f"\n[{timezone.now().strftime('%Y-%m-%d %H:%M:%S')}] Iniciando auditoría RAG optimizada para: {empresa.nombre}\n")
            log_file.write(f"[{timezone.now().strftime('%Y-%m-%d %H:%M:%S')}] Contexto legal ({len(resultados_rag)} reglas) despachado a Ollama ({self.model_name})...\n")

        try:
            stream = ollama.chat(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "Eres un auditor legal experto. Debes responder estrictamente en formato JSON válido."},
                    {"role": "user", "content": prompt}
                ],
                format="json",
                options={
                    "temperature": 0.1
                },
                stream=True
            )
            
            full_response = ""
            with open("rag_ia.log", "a", encoding="utf-8") as log_file:
                for chunk in stream:
                    content = chunk['message']['content']
                    full_response += content
                    log_file.write(content)
                    log_file.flush()
                log_file.write(f"\n[{timezone.now().strftime('%Y-%m-%d %H:%M:%S')}] Respuesta de Ollama recibida exitosamente.\n")
                log_file.write(f"[{timezone.now().strftime('%Y-%m-%d %H:%M:%S')}] Guardando borrador de auditoría pendiente de aprobación...\n")
                
            data_json = json.loads(full_response)
        except Exception as e:
            with open("rag_ia.log", "a", encoding="utf-8") as log_file:
                log_file.write(f"[{timezone.now().strftime('%Y-%m-%d %H:%M:%S')}] ERROR: Fallo en inferencia de Ollama: {str(e)}\n")
            return {"success": False, "error": f"Fallo en inferencia de Ollama: {str(e)}"}

        # Contabilizar propuestas de normativas y tareas
        normativas_propuestas = len(data_json.get("normativas_aplicables", []))
        tareas_propuestas = sum(len(item.get("tareas", [])) for item in data_json.get("normativas_aplicables", []))

        # Registrar en Historial/Borrador RAG en estado PENDIENTE
        from rag_admin.models import RegistroAuditoriaRAG
        registro = RegistroAuditoriaRAG.objects.create(
            empresa=empresa,
            modelo_ia=self.model_name,
            resumen_ejecutivo=data_json.get("resumen_ejecutivo", ""),
            normativas_detectadas=normativas_propuestas,
            tareas_generadas=tareas_propuestas,
            estado='PENDIENTE',
            exito=True,
            datos_completos_json=data_json
        )

        empresa.estado_matching = 'PENDIENTE_REVISION'
        empresa.log_matching = f"Borrador IA generado el {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}. Pendiente de revisión del auditor."
        empresa.save(update_fields=['estado_matching', 'log_matching'])

        return {
            "success": True,
            "registro_id": registro.id,
            "resumen_ejecutivo": data_json.get("resumen_ejecutivo"),
            "normativas_asignadas": normativas_propuestas,
            "tareas_creadas": tareas_propuestas,
            "datos_completos": data_json
        }

    def auditar_y_generar_borrador(self, empresa: Empresa) -> Dict[str, Any]:
        """Alias descriptivo para generar el borrador."""
        return self.auditar_y_asignar(empresa)

    @classmethod
    def aprobar_y_aplicar_auditoria(cls, registro_id: int) -> Dict[str, Any]:
        """
        Lee el borrador JSON de RegistroAuditoriaRAG aprobado por el administrador
        y persiste de forma definitiva las Normativas y Tareas en el backend.
        """
        from rag_admin.models import RegistroAuditoriaRAG
        try:
            registro = RegistroAuditoriaRAG.objects.get(id=registro_id)
        except RegistroAuditoriaRAG.DoesNotExist:
            return {"success": False, "error": f"Registro de auditoría #{registro_id} no encontrado."}

        data_json = registro.datos_completos_json or {}
        empresa = registro.empresa
        normativas_creadas = 0
        tareas_creadas = 0

        with transaction.atomic():
            hoy = timezone.now().date()
            criticidad_map = {
                'crítico': 'alta', 'critico': 'alta', 'alto': 'alta', 'alta': 'alta',
                'moderado': 'media', 'medio': 'media', 'media': 'media',
                'bajo': 'baja', 'baja': 'baja'
            }

            for item_norma in data_json.get("normativas_aplicables", []):
                nombre_norma = item_norma.get("nombre_ley", f"Ley {item_norma.get('ley_id')}")
                riesgo_raw = item_norma.get("nivel_riesgo_general", "Media").lower()
                criticidad = criticidad_map.get(riesgo_raw, 'media')

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

                for t in item_norma.get("tareas", []):
                    plazo_dias = t.get("plazo_sugerido_dias", 30)
                    vencimiento = hoy + datetime.timedelta(days=plazo_dias)
                    prioridad_tarea = criticidad_map.get(t.get("prioridad", "media").lower(), "media")

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

            # Actualizar registro RAG a APROBADO
            registro.estado = 'APROBADO'
            registro.normativas_detectadas = normativas_creadas
            registro.tareas_generadas = tareas_creadas
            registro.save(update_fields=['estado', 'normativas_detectadas', 'tareas_generadas'])

            # Actualizar empresa a COMPLETADO
            empresa.estado_matching = 'COMPLETADO'
            empresa.log_matching = f"Auditoría RAG aprobada y aplicada el {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}. Normativas: {normativas_creadas}, Tareas: {tareas_creadas}."
            empresa.save(update_fields=['estado_matching', 'log_matching'])

        return {
            "success": True,
            "normativas_asignadas": normativas_creadas,
            "tareas_creadas": tareas_creadas
        }

    @classmethod
    def rechazar_auditoria(cls, registro_id: int, motivo: str = "") -> Dict[str, Any]:
        """Marca un borrador RAG como RECHAZADO."""
        from rag_admin.models import RegistroAuditoriaRAG
        try:
            registro = RegistroAuditoriaRAG.objects.get(id=registro_id)
            registro.estado = 'RECHAZADO'
            if motivo:
                registro.error_detalle = motivo
            registro.save(update_fields=['estado', 'error_detalle'])

            registro.empresa.estado_matching = 'RECHAZADO'
            registro.empresa.log_matching = f"Borrador IA rechazado el {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}."
            registro.empresa.save(update_fields=['estado_matching', 'log_matching'])
            return {"success": True}
        except RegistroAuditoriaRAG.DoesNotExist:
            return {"success": False, "error": "Registro no encontrado"}

