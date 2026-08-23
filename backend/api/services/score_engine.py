from api.models import Obligacion, Normativa, Area, Responsable, Control, Riesgo

class ScoreEngine:
    @staticmethod
    def calcular_score_obligaciones(obligaciones_queryset):
        total = obligaciones_queryset.count()
        if total == 0:
            return {
                "porcentaje": 100.0,
                "semaforo": "Verde",
                "cumplidas": 0,
                "parciales": 0,
                "pendientes": 0,
                "total": 0
            }
        
        cumplidas = obligaciones_queryset.filter(estado='cumplido').count()
        parciales = obligaciones_queryset.filter(estado='parcial').count()
        pendientes = total - (cumplidas + parciales)

        # Fórmula: ((Cumplidas * 1.0) + (Parciales * 0.5)) / Total * 100
        score = ((cumplidas * 1.0) + (parciales * 0.5)) / total * 100.0
        score = round(score, 1)

        if score >= 85.0:
            semaforo = "Verde"
        elif score >= 70.0:
            semaforo = "Amarillo"
        else:
            semaforo = "Rojo"

        return {
            "porcentaje": score,
            "semaforo": semaforo,
            "cumplidas": cumplidas,
            "parciales": parciales,
            "pendientes": pendientes,
            "total": total
        }

    @classmethod
    def get_score_empresa(cls, empresa, sucursal=None, periodo=None):
        qs = Obligacion.objects.filter(normativa__empresa=empresa)
        if sucursal:
            qs = qs.filter(area__sucursal=sucursal)
        # TODO: Implement periodo filtering if needed
        return cls.calcular_score_obligaciones(qs)

    @classmethod
    def calcular_cumplimiento_por_normativa(cls, empresa):
        normativas = Normativa.objects.filter(empresa=empresa)
        resultados = []
        for norm in normativas:
            score = cls.calcular_score_obligaciones(norm.obligaciones.all())
            resultados.append({
                "normativa_id": norm.id,
                "nombre": norm.nombre,
                "score": score
            })
        return resultados

    @classmethod
    def calcular_cumplimiento_por_area(cls, empresa):
        areas = Area.objects.filter(empresa=empresa)
        resultados = []
        for area in areas:
            score = cls.calcular_score_obligaciones(area.obligaciones.all())
            controles_pendientes = Control.objects.filter(area=area, estado='pendiente').count()
            riesgos_criticos = Riesgo.objects.filter(area=area, impacto__gte=4).count() if hasattr(Riesgo, 'area') else 0
            
            resultados.append({
                "area_id": area.id,
                "nombre": area.nombre,
                "score": score,
                "controles_pendientes": controles_pendientes,
                "riesgos_criticos": riesgos_criticos
            })
        return resultados

    @classmethod
    def calcular_cumplimiento_por_responsable(cls, empresa):
        responsables = Responsable.objects.filter(empresa=empresa)
        resultados = []
        for resp in responsables:
            score = cls.calcular_score_obligaciones(Obligacion.objects.filter(responsable=resp))
            resultados.append({
                "responsable_id": resp.id,
                "nombre": resp.nombre,
                "score": score
            })
        return resultados
