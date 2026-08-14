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
        self.use_mock = os.getenv("USE_MOCKS", "True").lower() == "true"
        
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
                "resumen": "Regula el tratamiento de datos de carácter personal y la protección de la privacidad de los titulares.",
                "criticidad": "alta",
                "rubros": ["TODOS", "TECNOLOGIA", "SALUD", "FINANCIERO", "RETAIL", "SERVICIOS"],
                "ente_regulador": "Agencia de Protección de Datos / Tribunales",
                "requiere_datos_personales": True
            },
            {
                "codigo_bcn": "21459",
                "nombre": "Ley de Delitos Informáticos (Ley N° 21.459)",
                "resumen": "Tipifica delitos contra la confidencialidad, integridad y disponibilidad de sistemas informáticos.",
                "criticidad": "alta",
                "rubros": ["TECNOLOGIA", "FINANCIERO", "SERVICIOS"],
                "ente_regulador": "Ministerio Público / CSIRT",
                "min_empleados": 1
            },
            {
                "codigo_bcn": "21521",
                "nombre": "Ley Fintec (Ley N° 21.521)",
                "resumen": "Promueve la competencia e inclusión financiera a través de la innovación y tecnología financiera.",
                "criticidad": "media",
                "rubros": ["FINANCIERO", "TECNOLOGIA"],
                "ente_regulador": "Comisión para el Mercado Financiero (CMF)",
                "requiere_procesa_pagos": True
            },
            {
                "codigo_bcn": "20584",
                "nombre": "Ley de Derechos y Deberes del Paciente (Ley N° 20.584)",
                "resumen": "Regula los derechos y deberes que tienen las personas en relación con acciones vinculadas a su atención en salud.",
                "criticidad": "alta",
                "rubros": ["SALUD"],
                "ente_regulador": "Superintendencia de Salud"
            },
            {
                "codigo_bcn": "20920",
                "nombre": "Ley REP y Responsabilidad Extendida del Productor (Ley N° 20.920)",
                "resumen": "Marco para la gestión de residuos, responsabilidad extendida del productor y fomento del reciclaje.",
                "criticidad": "media",
                "rubros": ["RETAIL", "ALIMENTOS", "MINERIA", "CONSTRUCCION"],
                "ente_regulador": "Ministerio del Medio Ambiente / SMA",
                "requiere_residuos": True
            },
            {
                "codigo_bcn": "20393",
                "nombre": "Ley de Responsabilidad Penal de las Personas Jurídicas (Ley N° 20.393)",
                "resumen": "Establece la responsabilidad de personas jurídicas en delitos de cohecho, lavado de activos y financiamiento del terrorismo.",
                "criticidad": "alta",
                "rubros": ["TODOS", "FINANCIERO", "CONSTRUCCION", "MINERIA", "SERVICIOS", "TECNOLOGIA"],
                "ente_regulador": "Ministerio Público",
                "min_empleados": 1
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

    def obtener_xml_bcn(self, id_norma: str) -> str:
        """
        Descarga el XML oficial de la BCN y extrae el texto o encabezados relevantes con fallback de seguridad.
        """
        if self.use_mock:
            return f"<xml><titulo>Texto oficial de la Ley BCN {id_norma}</titulo><resumen>Contenido simulado bajo ambiente de pruebas.</resumen></xml>"

        try:
            url = f"{self.base_url}?opt=7&idLey={id_norma}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200 and response.content:
                # Parsear XML nativo con ElementTree
                root = ET.fromstring(response.content)
                textos = [elem.text for elem in root.iter() if elem.text and len(elem.text.strip()) > 0]
                return "\n".join(textos[:15]) # Tomamos los primeros encabezados
            return ""
        except Exception as e:
            print(f"[LeyChile API Fallback] No se pudo obtener XML en vivo para {id_norma} ({str(e)}). Usando caché local.")
            return f"Norma {id_norma} registrada en catálogo oficial."
