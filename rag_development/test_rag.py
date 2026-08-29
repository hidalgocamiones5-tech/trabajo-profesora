import json
from llm_service import OllamaSmartDiscoveryService

def ejecutar_auditoria_prueba():
    print("=" * 60)
    print("  TEST DE AUDITORÍA GRC AUTOMÁTICA - CHILE (OLLAMA + RAG)")
    print("=" * 60)
    
    servicio = OllamaSmartDiscoveryService(model_name="llama3.2:3b")
    
    # Perfil corporativo de prueba
    perfil_empresa = {
        "razon_social": "Logística & Retail SpA",
        "rubro": "Comercio Electrónico, Logística y Distribución",
        "empleados": 45,
        "maneja_datos": True,             # Base de datos de clientes y tarjetas
        "es_ecommerce": True,             # Venta web B2C
        "contrata_subcontratistas": True  # Conductores y repartidores externos
    }
    
    print(f"\n[1] Perfil de empresa a evaluar:")
    print(json.dumps(perfil_empresa, indent=2, ensure_ascii=False))
    
    print("\n[2] Ejecutando diagnóstico de cumplimiento normativo y generación de tareas...")
    resultado_crudo = servicio.evaluar_empresa(perfil_empresa)
    
    print("\n[3] Matriz GRC y Plan de Tareas Generadas:")
    try:
        resultado_formateado = json.loads(resultado_crudo)
        print(json.dumps(resultado_formateado, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error parseando JSON: {e}")
        print("Respuesta cruda de Ollama:")
        print(resultado_crudo)

if __name__ == "__main__":
    ejecutar_auditoria_prueba()
