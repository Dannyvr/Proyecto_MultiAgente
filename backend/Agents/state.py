from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """
    Estado global del Grafo (LangGraph) que fluye a través de todos los agentes.
    """
    # Lista de mensajes, usando add_messages para que no se sobrescriban, sino que se concatenen.
    messages: Annotated[list[BaseMessage], add_messages]
    
    # String para identificar quién fue el último agente en hablar.
    sender: str
    
    # String para definir cuál debe ser el próximo nodo a ejecutar en un futuro enrutamiento condicional.
    next_step: str
