from langchain_openai import AzureChatOpenAI
from .config import settings

def get_llm(temperature: float = 0.7) -> AzureChatOpenAI:
    """
    Devuelve una instancia de AzureChatOpenAI de la librería langchain-openai. 
    Esta instancia está pre-configurada con las credenciales de config.py.
    """
    return AzureChatOpenAI(
        api_key=settings.AZURE_OPENAI_API_KEY,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        azure_deployment=settings.AZURE_OPENAI_DEPLOYMENT_NAME,
        api_version=settings.AZURE_OPENAI_API_VERSION,
        temperature=temperature,
    )
