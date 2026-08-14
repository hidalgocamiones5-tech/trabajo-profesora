import os
import requests
import time
# from bs4 import BeautifulSoup # Descomentar cuando se instale bs4/lxml

class LeyChileClient:
    """Cliente para interactuar con la Biblioteca del Congreso Nacional (BCN)"""
    
    def __init__(self):
        self.base_url = "https://www.leychile.cl/Consulta/obtxml"
        self.use_mock = os.getenv("USE_MOCKS", "True").lower() == "true"
        
        # Mock database for fast prototyping without hitting BCN limits
        self.mock_data = [
            {
                "id": "21643", 
                "nombre": "Ley Karin (Ley 21.643)", 
                "descripcion": "Previene, investiga y sanciona el acoso laboral, sexual y violencia en el trabajo.", 
                "criticidad": "Alta", 
                "rubros": ["Todos", "Servicios", "Retail", "Manufactura"],
                "ente": "Dirección del Trabajo"
            },
            {
                "id": "19628", 
                "nombre": "Ley de Protección de Datos Personales (Ley 19.628)", 
                "descripcion": "Regula el tratamiento de datos de carácter personal y protección de la privacidad.", 
                "criticidad": "Alta", 
                "rubros": ["Todos", "Tecnología", "Salud", "Finanzas"],
                "ente": "Agencia de Protección de Datos"
            },
            {
                "id": "21521", 
                "nombre": "Ley Fintec (Ley 21.521)", 
                "descripcion": "Promueve la competencia e inclusión financiera a través de la innovación y tecnología.", 
                "criticidad": "Media", 
                "rubros": ["Finanzas", "Tecnología"],
                "ente": "CMF"
            },
             {
                "id": "20584", 
                "nombre": "Ley de Derechos y Deberes del Paciente (Ley 20.584)", 
                "descripcion": "Regula los derechos y deberes en relación con acciones de salud.", 
                "criticidad": "Alta", 
                "rubros": ["Salud"],
                "ente": "Superintendencia de Salud"
            }
        ]

    def buscar_normas_por_rubro(self, rubro: str, tamano: str):
        """Devuelve normativas relevantes según el perfil de la empresa."""
        if self.use_mock:
            time.sleep(1.5) # Simula retraso de red
            # Filtro básico
            resultados = [ley for ley in self.mock_data if "Todos" in ley["rubros"] or rubro in ley["rubros"]]
            return resultados
        
        # NOTA PARA PRODUCCIÓN: La BCN no tiene un filtro por "rubro empresarial".
        # En producción real, este método debe consultar a Gemini para que mapee el rubro a palabras clave
        # y luego usar el buscador de la BCN, o consultar un índice vectorial local (RAG).
        # Por ahora fallamos de vuelta al mock inteligentemente.
        resultados = [ley for ley in self.mock_data if "Todos" in ley["rubros"] or rubro in ley["rubros"]]
        return resultados

    def obtener_texto_norma(self, id_norma: str):
        """Descarga el XML oficial de la BCN y extrae el texto en crudo."""
        if self.use_mock:
            return f"TEXTO LEGAL SIMULADO DE LA LEY {id_norma}: Artículo 1. La empresa deberá establecer políticas internas. Artículo 2. Mantener registros actualizados de datos."

        try:
            # Ejemplo: GET https://www.leychile.cl/Consulta/obtxml?opt=7&idLey=21643
            response = requests.get(f"{self.base_url}?opt=7&idLey={id_norma}", timeout=10)
            if response.status_code == 200:
                # Extraemos el texto usando BeautifulSoup
                # soup = BeautifulSoup(response.content, 'xml') # Requiere lxml
                # textos = soup.find_all('Texto')
                # texto_limpio = " ".join([t.text for t in textos])
                # return texto_limpio
                return "XML Parseado (simulado)"
            return ""
        except Exception as e:
            print(f"[LeyChile API Error] No se pudo obtener la norma {id_norma}: {str(e)}")
            return ""
