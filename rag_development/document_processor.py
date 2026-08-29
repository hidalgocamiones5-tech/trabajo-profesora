import re
from bs4 import BeautifulSoup
from typing import List, Dict, Any

class DocumentProcessor:
    """
    Clase encargada de parsear los XML de la BCN y fragmentarlos lógicamente.
    """

    @staticmethod
    def clean_text(text: str) -> str:
        """Limpia el texto de espacios excesivos y saltos de línea inútiles."""
        if not text:
            return ""
        # Reemplazar múltiples espacios/saltos por un solo espacio
        cleaned = re.sub(r'\s+', ' ', text)
        return cleaned.strip()

    def parse_datos_gob_json(self, registros_json: List[Dict[str, Any]], metadata_base: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Toma una lista de registros JSON descargados de la API de datos.gob.cl
        y los convierte en fragmentos lógicos (chunks).
        
        Args:
            registros_json: Lista de diccionarios devueltos por DatosGobClient.
            metadata_base: Metadatos básicos (ej. {"ley_id": 19628, "nombre": "Ley de Privacidad"})
            
        Returns:
            Lista de chunks vectorizables.
        """
        chunks = []
        
        for registro in registros_json:
            # datos.gob.cl puede tener distintas columnas según el dataset.
            # Asumimos que tiene columnas como 'articulo', 'texto', 'titulo', etc.
            
            # Buscar el texto del artículo (adaptar claves según el dataset real)
            texto = registro.get('texto') or registro.get('contenido') or registro.get('descripcion')
            if not texto:
                continue
                
            numero_art = registro.get('articulo') or registro.get('numero_articulo') or "Sin número"
            
            texto_limpio = self.clean_text(str(texto))
            
            if len(texto_limpio) < 20:
                continue
                
            chunk_meta = metadata_base.copy()
            chunk_meta.update({
                'tipo': 'articulo',
                'numero': numero_art,
                # Guardar el ID original del registro si existe
                'registro_id': registro.get('_id', '')
            })
            
            chunks.append({
                'text': f"Artículo {numero_art}: {texto_limpio}",
                'metadata': chunk_meta
            })
                
        return chunks
