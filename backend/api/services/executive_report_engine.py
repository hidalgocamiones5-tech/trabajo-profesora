from api.models import (
    Normativa, Area, Responsable, Obligacion, Riesgo, Incidente, 
    Auditoria, PlanAccion, Control, Evidencia, TareaPendiente
)
from api.services.score_engine import ScoreEngine

class ExecutiveReportEngine:
    @staticmethod
    def generar_ficha_normativa(normativa):
        score_data = ScoreEngine.get_score_normativa(normativa)
        obligaciones_qs = normativa.obligaciones.all()
        controles_qs = Control.objects.filter(normativa=normativa)
        evidencias_qs = Evidencia.objects.filter(normativa=normativa)
        riesgos_qs = Riesgo.objects.filter(empresa=normativa.empresa) if normativa.empresa else Riesgo.objects.none()
        incidentes_qs = Incidente.objects.filter(empresa=normativa.empresa) if normativa.empresa else Incidente.objects.none()
        auditorias_qs = Auditoria.objects.filter(normativa=normativa)
        planes_qs = PlanAccion.objects.filter(normativa=normativa)
        
        # Serializar obligaciones
        obligaciones_data = []
        for o in obligaciones_qs:
            obligaciones_data.append({
                "id": o.id,
                "nombre": o.nombre,
                "descripcion": o.descripcion or "",
                "estado": o.estado,
                "criticidad": o.criticidad,
                "fecha_vencimiento": str(o.fecha_vencimiento) if o.fecha_vencimiento else None,
                "responsable": o.responsable.nombre if o.responsable else "Equipo Legal & GRC"
            })
            
        # Serializar controles
        controles_data = []
        for c in controles_qs:
            controles_data.append({
                "id": c.id,
                "nombre": c.nombre,
                "estado": c.estado,
                "periodicidad": c.periodicidad,
                "ultima_ejecucion": str(c.ultima_ejecucion) if c.ultima_ejecucion else None,
                "proxima_ejecucion": str(c.proxima_ejecucion) if c.proxima_ejecucion else None,
                "responsable": c.responsable.nombre if c.responsable else "Oficial de Control"
            })

        # Serializar evidencias
        evidencias_data = []
        for ev in evidencias_qs:
            evidencias_data.append({
                "id": ev.id,
                "titulo": ev.titulo,
                "version": ev.version,
                "estado": ev.estado,
                "fecha_vencimiento": str(ev.fecha_vencimiento) if ev.fecha_vencimiento else None,
                "fecha_subida": str(ev.fecha_subida) if ev.fecha_subida else None,
                "responsable": ev.responsable.nombre if ev.responsable else "Admin",
                "archivo_url": ev.archivo.url if ev.archivo else (ev.archivo_url or None)
            })

        # Serializar riesgos
        riesgos_data = []
        for r in riesgos_qs:
            riesgos_data.append({
                "id": r.id,
                "nombre": r.nombre,
                "categoria": r.categoria or "Legal/Normativo",
                "impacto": r.impacto,
                "probabilidad": r.probabilidad,
                "nivel": r.impacto * r.probabilidad,
                "estrategia": r.estrategia,
                "estado": r.estado,
                "responsable": r.responsable
            })

        # Serializar auditorias
        auditorias_data = []
        for a in auditorias_qs:
            auditorias_data.append({
                "id": a.id,
                "nombre": a.nombre,
                "tipo": a.tipo,
                "estado": a.estado,
                "fecha_inicio": str(a.fecha_inicio) if a.fecha_inicio else None,
                "fecha_fin": str(a.fecha_fin) if a.fecha_fin else None,
                "hallazgos_count": a.hallazgos_count,
                "responsable": a.responsable.nombre if a.responsable else "Auditoría Interna"
            })

        # Serializar planes de acción
        planes_data = []
        for p in planes_qs:
            planes_data.append({
                "id": p.id,
                "nombre": p.nombre,
                "estado": p.estado,
                "fecha_limite": str(p.fecha_limite) if p.fecha_limite else None,
                "responsable": p.responsable.nombre if p.responsable else "Responsable Asignado"
            })

        fortalezas = []
        brechas = []
        if score_data['porcentaje'] >= 85:
            fortalezas.append("Alto nivel de cumplimiento normativo global en esta regulación.")
        else:
            brechas.append(f"Existen {score_data['pendientes']} obligaciones pendientes por regularizar.")

        if any(r['impacto'] >= 4 for r in riesgos_data):
            brechas.append("Se identificaron riesgos de alto impacto asociados a esta materia.")
        else:
            fortalezas.append("No hay riesgos de impacto crítico activos en esta normativa.")

        codigo_display = getattr(normativa, 'codigo_bcn', None) or getattr(normativa, 'numero_oficial', None) or str(normativa.id)

        return {
            "normativa_id": normativa.id,
            "titulo": normativa.nombre,
            "codigo": codigo_display,
            "resumen": normativa.resumen or normativa.descripcion or "",
            "score": score_data,
            "fortalezas": fortalezas,
            "brechas": brechas,
            "obligaciones_count": len(obligaciones_data),
            "obligaciones": obligaciones_data,
            "controles_count": len(controles_data),
            "controles": controles_data,
            "evidencias_count": len(evidencias_data),
            "evidencias": evidencias_data,
            "riesgos_count": len(riesgos_data),
            "riesgos": riesgos_data,
            "incidentes_count": incidentes_qs.count(),
            "incidentes": [
                {
                    "id": inc.id,
                    "nombre": inc.nombre,
                    "tipo": inc.tipo,
                    "estado": inc.estado,
                    "severidad": inc.severidad,
                    "fecha": str(inc.fecha)
                } for inc in incidentes_qs
            ],
            "auditorias_count": len(auditorias_data),
            "auditorias": auditorias_data,
            "planes_accion": planes_data,
            "recomendaciones": [
                "Priorizar la resolución de obligaciones con criticidad alta o vencimiento en menos de 30 días.",
                "Cargar evidencias documentales en controles clave para asegurar trazabilidad en fiscalizaciones.",
                "Programar una auditoría interna preventiva antes del cierre de trimestre."
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
