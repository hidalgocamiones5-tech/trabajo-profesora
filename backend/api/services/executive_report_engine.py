from api.models import Normativa, Area, Responsable, Obligacion, Riesgo, Incidente, Auditoria, PlanAccion
from api.services.score_engine import ScoreEngine

class ExecutiveReportEngine:
    @staticmethod
    def generar_ficha_normativa(normativa):
        score_data = ScoreEngine.get_score_normativa(normativa)
        obligaciones = normativa.obligaciones.all()
        riesgos = Riesgo.objects.filter(empresa=normativa.empresa)
        incidentes = Incidente.objects.filter(empresa=normativa.empresa)
        auditorias = Auditoria.objects.filter(empresa=normativa.empresa)
        
        fortalezas = []
        brechas = []
        if score_data['porcentaje'] >= 85:
            fortalezas.append("Alto nivel de cumplimiento normativo global.")
        else:
            brechas.append(f"Existen {score_data['pendientes']} obligaciones pendientes por regularizar.")

        if riesgos.filter(impacto='Alto').exists():
            brechas.append("Se identificaron riesgos de alto impacto asociados.")
        else:
            fortalezas.append("No hay riesgos de impacto alto activos.")

        return {
            "normativa_id": normativa.id,
            "titulo": normativa.nombre,
            "codigo": normativa.codigo,
            "score": score_data,
            "fortalezas": fortalezas,
            "brechas": brechas,
            "obligaciones_count": obligaciones.count(),
            "riesgos_count": riesgos.count(),
            "incidentes_count": incidentes.count(),
            "auditorias_count": auditorias.count(),
            "recomendaciones": [
                "Priorizar la resolución de obligaciones con vencimiento menor a 30 días.",
                "Realizar auditoría preventiva antes del cierre de trimestre."
            ]
        }

    @staticmethod
    def generar_reporte_ejecutivo_global(empresa):
        score_data = ScoreEngine.get_score_empresa(empresa)
        total_riesgos = Riesgo.objects.filter(empresa=empresa).count()
        riesgos_criticos = Riesgo.objects.filter(empresa=empresa, impacto__gte=4).count()
        incidentes_abiertos = Incidente.objects.filter(empresa=empresa, estado='abierto').count()
        
        # Max gravedad de riesgos
        if riesgos_criticos > 0:
            gravedad_riesgo = "Crítica"
        elif total_riesgos > 0:
            gravedad_riesgo = "Media"
        else:
            gravedad_riesgo = "Baja"
            
        # Evolución Mensual
        from api.models import HistoricoCumplimientoMensual
        historico = HistoricoCumplimientoMensual.objects.filter(empresa=empresa, sucursal__isnull=True, area__isnull=True).order_by('anio', 'mes')
        evolucion_mensual = [{"mes": f"{h.mes}/{h.anio}", "score": h.porcentaje_cumplimiento} for h in historico]
        
        # Normativas Score
        normativas_score = ScoreEngine.calcular_cumplimiento_por_normativa(empresa)

        return {
            "score_global": score_data,
            "gravedad_riesgos": gravedad_riesgo,
            "riesgos_criticos_count": riesgos_criticos,
            "incidentes_abiertos_count": incidentes_abiertos,
            "resumen_texto": f"La empresa presenta un cumplimiento global del {score_data['porcentaje']}%. La gravedad de riesgo actual es {gravedad_riesgo} con {incidentes_abiertos} incidentes abiertos.",
            "evolucion_mensual": evolucion_mensual,
            "normativas_score": normativas_score
        }
