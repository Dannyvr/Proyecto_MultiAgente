import sys
import os

# Agregamos la ruta principal para que Python reconozca 'backend' como módulo
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.Agents.llm_provider import get_llm
from langchain_core.messages import HumanMessage

def test_azure_connection():
    print("Iniciando prueba de conexión con Azure AI Foundry...")
    try:
        # 1. Obtener la instancia del modelo configurada en llm_provider
        llm = get_llm(temperature=0.7)
        print("Proveedor LLM cargado correctamente.")
        
        # 2. Definir el mensaje de prueba
        mensaje = [
            HumanMessage(content="Hola, confirma que eres el experto en música para el proyecto de Danny.")
        ]
        
        print("Enviando mensaje al modelo 'gpt-4.1-mini'...")
        
        # 3. Invocar la llamada a la API
        respuesta = llm.invoke(mensaje)
        
        # 4. Mostrar respuesta
        print("\n" + "="*40)
        print("✅ RESPUESTA RECIBIDA CON ÉXITO")
        print("="*40)
        print(respuesta.content)
        print("="*40 + "\n")
        
    except Exception as e:
        print("\n❌ [Error de Conexión] No se ha podido validar el LLM.")
        print(f"Detalles del error: {str(e)}")

if __name__ == "__main__":
    test_azure_connection()
