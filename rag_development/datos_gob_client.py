import requests
from typing import Dict, Any, List

class DatosGobClient:
    """
    Cliente para consumir la API de datos.gob.cl usando autenticación JWT.
    (Basado en CKAN API)
    """
    BASE_URL = "https://datos.gob.cl/api/3/action"

    def __init__(self, jwt_token: str):
        self.headers = {
            "Authorization": jwt_token,
            "Content-Type": "application/json"
        }

    def obtener_ley_por_recurso(self, resource_id: str) -> List[Dict[str, Any]]:
        """
        Descarga los registros de un dataset específico (Resource ID) que contenga la ley.
        Utiliza el endpoint datastore_search típico de CKAN.
        """
        url = f"{self.BASE_URL}/datastore_search"
        params = {
            "resource_id": resource_id,
            "limit": 5000  # Ajustar según necesidad
        }
        
        print(f"Descargando datos del recurso: {resource_id}...")
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                return data["result"]["records"]
            else:
                raise Exception(f"Error en la API: {data.get('error')}")
        else:
            raise Exception(f"HTTP Error {response.status_code}: {response.text}")

