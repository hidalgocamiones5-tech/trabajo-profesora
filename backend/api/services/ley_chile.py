import os
import requests
import time
import xml.etree.ElementTree as ET
from typing import List, Dict, Any

class LeyChileClient:
    """
    Cliente para interactuar con la API pública de la Biblioteca del Congreso Nacional (BCN - Ley Chile).
    Permite consultar textos legales oficiales, buscar leyes por código/categoría y realizar parsing de XML.
    """
    
    def __init__(self):
        self.base_url = "https://www.leychile.cl/Consulta/obtxml"
        # API Token provisto por el usuario desde datos.gob.cl
        self.api_key = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJnbGlqaHpvUzlXSkpoQ05SUXJOWlNpMVlEdkxIZG5JSFMyU0l5M2RSMzBZIiwiaWF0IjoxNzg3ODk4NTc0fQ.KuD8a1NIVaLRt9gyDJ5jmIkZhSAz9cvdeCvXTOX-pZA"
        # Forzar el uso real de la API ahora que tenemos el token
        self.use_mock = False
        
        # Catálogo base indexado por rubros y materias para filtrado de alta velocidad y fallback de seguridad
        self.catalogo_leyes = [
            {
                "codigo_bcn": "21643",
                "nombre": "Ley Karin (Ley N° 21.643)",
                "resumen": "Previene, investiga y sanciona el acoso laboral, sexual y violencia en el trabajo.",
                "criticidad": "alta",
                "rubros": ["TODOS", "TECNOLOGIA", "RETAIL", "SALUD", "MINERIA", "SERVICIOS", "CONSTRUCCION", "ALIMENTOS"],
                "ente_regulador": "Dirección del Trabajo",
                "min_empleados": 1,
                "requiere_trabajadores": True
            },
            {
                "codigo_bcn": "19628",
                "nombre": "Ley de Protección de Datos Personales (Ley N° 19.628)",
                "resumen": "Regula el tratamiento de datos de carácter personal y la protección de la privacidad.",
                "criticidad": "alta",
                "rubros": ["TODOS", "TECNOLOGIA", "SALUD", "FINANCIERO", "RETAIL", "SERVICIOS"],
                "ente_regulador": "Agencia de Protección de Datos",
                "requiere_datos_personales": True
            },
            {
                "codigo_bcn": "21459",
                "nombre": "Ley de Delitos Informáticos (Ley N° 21.459)",
                "resumen": "Tipifica delitos contra la confidencialidad, integridad y disponibilidad de sistemas informáticos.",
                "criticidad": "alta",
                "rubros": ["TODOS", "TECNOLOGIA", "FINANCIERO", "SERVICIOS"],
                "ente_regulador": "Ministerio Público / CSIRT",
                "min_empleados": 1
            },
            {
                "codigo_bcn": "21521",
                "nombre": "Ley Fintec (Ley N° 21.521)",
                "resumen": "Promueve la competencia e inclusión financiera a través de la innovación y tecnología.",
                "criticidad": "media",
                "rubros": ["FINANCIERO", "TECNOLOGIA"],
                "ente_regulador": "CMF",
                "requiere_procesa_pagos": True
            },
            {
                "codigo_bcn": "20584",
                "nombre": "Ley de Derechos y Deberes del Paciente (Ley N° 20.584)",
                "resumen": "Regula los derechos y deberes en relación con acciones vinculadas a la atención en salud.",
                "criticidad": "alta",
                "rubros": ["SALUD"],
                "ente_regulador": "Superintendencia de Salud"
            },
            {
                "codigo_bcn": "20920",
                "nombre": "Ley REP (Ley N° 20.920)",
                "resumen": "Marco para la gestión de residuos, responsabilidad extendida del productor.",
                "criticidad": "media",
                "rubros": ["RETAIL", "ALIMENTOS", "MINERIA", "CONSTRUCCION", "INDUSTRIA"],
                "ente_regulador": "Ministerio del Medio Ambiente",
                "requiere_residuos": True
            },
            {
                "codigo_bcn": "20393",
                "nombre": "Ley de Responsabilidad Penal de las Personas Jurídicas (Ley N° 20.393)",
                "resumen": "Responsabilidad de personas jurídicas en delitos de cohecho y lavado de activos.",
                "criticidad": "alta",
                "rubros": ["TODOS", "FINANCIERO", "CONSTRUCCION", "MINERIA", "SERVICIOS", "TECNOLOGIA"],
                "ente_regulador": "Ministerio Público",
                "min_empleados": 1
            },
            {
                "codigo_bcn": "16774",
                "nombre": "Decreto Supremo N° 594: Condiciones Sanitarias",
                "resumen": "Establece las condiciones sanitarias y ambientales básicas en lugares de trabajo.",
                "criticidad": "alta",
                "rubros": ["TODOS", "MINERIA", "CONSTRUCCION", "INDUSTRIA"],
                "ente_regulador": "Ministerio de Salud",
                "min_empleados": 1,
                "requiere_trabajadores": True
            },
            {
                "codigo_bcn": "1202511",
                "nombre": "Ley Marco de Ciberseguridad (Ley N° 21.663)",
                "resumen": "Fija obligaciones de reporte de incidentes para empresas de servicios esenciales.",
                "criticidad": "alta",
                "rubros": ["TODOS", "TECNOLOGIA", "FINANCIERO", "SERVICIOS"],
                "ente_regulador": "Agencia Nacional de Ciberseguridad"
            },
            {
                "codigo_bcn": "61438",
                "nombre": "Ley del Consumidor (Ley N° 19.496)",
                "resumen": "Regula los actos de consumo, comercio electrónico y garantías.",
                "criticidad": "media",
                "rubros": ["TODOS", "RETAIL", "SERVICIOS", "ALIMENTOS"],
                "ente_regulador": "SERNAC"
            },
            {
                "codigo_bcn": "20720",
                "nombre": "Ley de Reorganización y Liquidación de Empresas (Ley N° 20.720)",
                "resumen": "Regula los procedimientos concursales de reorganización y liquidación.",
                "criticidad": "media",
                "rubros": ["TODOS", "FINANCIERO", "SERVICIOS", "RETAIL", "INDUSTRIA"],
                "ente_regulador": "Superintendencia de Insolvencia"
            },
            {
                "codigo_bcn": "21015",
                "nombre": "Ley de Inclusión Laboral (Ley N° 21.015)",
                "resumen": "Incentiva la inclusión de personas con discapacidad al mundo laboral.",
                "criticidad": "alta",
                "rubros": ["TODOS"],
                "ente_regulador": "Dirección del Trabajo",
                "min_empleados": 100,
                "requiere_trabajadores": True
            },
            {
                "codigo_bcn": "21220",
                "nombre": "Ley de Teletrabajo (Ley N° 21.220)",
                "resumen": "Modifica el Código del Trabajo en materia de trabajo a distancia.",
                "criticidad": "media",
                "rubros": ["TODOS", "TECNOLOGIA", "SERVICIOS", "FINANCIERO"],
                "ente_regulador": "Dirección del Trabajo",
                "min_empleados": 1,
                "requiere_trabajadores": True
            },
            {
                "codigo_bcn": "19799",
                "nombre": "Ley de Firma Electrónica (Ley N° 19.799)",
                "resumen": "Sobre documentos electrónicos, firma electrónica y servicios de certificación.",
                "criticidad": "baja",
                "rubros": ["TODOS", "TECNOLOGIA", "FINANCIERO"],
                "ente_regulador": "Ministerio de Economía"
            },
            {
                "codigo_bcn": "20123",
                "nombre": "Ley de Subcontratación (Ley N° 20.123)",
                "resumen": "Regula el trabajo en régimen de subcontratación y empresas de servicios transitorios.",
                "criticidad": "alta",
                "rubros": ["TODOS", "CONSTRUCCION", "MINERIA", "INDUSTRIA"],
                "ente_regulador": "Dirección del Trabajo",
                "min_empleados": 1,
                "requiere_trabajadores": True
            },
            {
                "codigo_bcn": "211",
                "nombre": "Ley de Libre Competencia (Decreto Ley N° 211)",
                "resumen": "Fija normas para la defensa de la libre competencia.",
                "criticidad": "alta",
                "rubros": ["TODOS", "RETAIL", "FINANCIERO", "INDUSTRIA", "MINERIA"],
                "ente_regulador": "FNE / TDLC"
            },
            {
                "codigo_bcn": "18046",
                "nombre": "Ley de Sociedades Anónimas (Ley N° 18.046)",
                "resumen": "Regula la constitución, administración y fiscalización de sociedades anónimas.",
                "criticidad": "media",
                "rubros": ["TODOS", "FINANCIERO", "INDUSTRIA"],
                "ente_regulador": "CMF"
            },
            {
                "codigo_bcn": "21236",
                "nombre": "Ley de Portabilidad Financiera (Ley N° 21.236)",
                "resumen": "Permite el traslado de productos financieros entre distintas instituciones.",
                "criticidad": "media",
                "rubros": ["FINANCIERO"],
                "ente_regulador": "CMF"
            },
            {
                "codigo_bcn": "19039",
                "nombre": "Ley de Propiedad Industrial (Ley N° 19.039)",
                "resumen": "Establece normas aplicables a los privilegios industriales y protección de derechos.",
                "criticidad": "media",
                "rubros": ["TODOS", "TECNOLOGIA", "INDUSTRIA", "SERVICIOS"],
                "ente_regulador": "INAPI"
            }
        ]

    def buscar_normas_por_empresa(self, rubro: str, tiene_datos: bool = False, es_ecommerce: bool = False, tiene_residuos: bool = False) -> List[Dict[str, Any]]:
        """
        Filtra y devuelve las normativas relevantes según el rubro y características operacionales de la empresa.
        """
        rubro_normalizado = (rubro or "TODOS").upper()
        resultados = []

        for ley in self.catalogo_leyes:
            aplica_rubro = "TODOS" in ley["rubros"] or any(r in rubro_normalizado for r in ley["rubros"])
            aplica_datos = ley.get("requiere_datos_personales", False) and tiene_datos
            aplica_residuos = ley.get("requiere_residuos", False) and tiene_residuos

            if aplica_rubro or aplica_datos or aplica_residuos:
                resultados.append(ley)

        return resultados

    def obtener_xml_bcn(self, id_norma: str, force_refresh: bool = False) -> str:
        """
        Descarga el XML oficial de la BCN y extrae el texto o encabezados relevantes con fallback de seguridad.
        """
        if self.use_mock:
            return f"<xml><titulo>Texto oficial de la Ley BCN {id_norma}</titulo><resumen>Contenido simulado bajo ambiente de pruebas.</resumen></xml>"

        from django.core.cache import cache
        cache_key = f"bcn_xml_{id_norma}"
        
        if not force_refresh:
            cached_text = cache.get(cache_key)
            if cached_text:
                print(f"[LeyChile API] Usando versión en caché de {id_norma}")
                return cached_text

        try:
            url = f"{self.base_url}?opt=7&idLey={id_norma}"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Accept": "application/xml"
            }
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200 and response.content:
                # Parsear XML nativo con ElementTree
                root = ET.fromstring(response.content)
                textos = [elem.text for elem in root.iter() if elem.text and len(elem.text.strip()) > 0]
                texto_final = "\n".join(textos[:15]) # Tomamos los primeros encabezados
                # Guardar en caché automáticamente si no viene de comando cron (fallback)
                if not force_refresh:
                    cache.set(cache_key, texto_final, timeout=259200) # 3 días
                return texto_final
            return ""
        except Exception as e:
            print(f"[LeyChile API Fallback] No se pudo obtener XML en vivo para {id_norma} ({str(e)}). Usando caché local.")
            return cache.get(cache_key) or f"Norma {id_norma} registrada en catálogo oficial."
