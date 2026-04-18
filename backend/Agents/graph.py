from langgraph.graph import StateGraph, START, END
from langchain_core.messages import SystemMessage
from .state import AgentState
from .llm_provider import get_llm

# ==========================================
# Nodos (Agentes con LLM)
# ==========================================

def planificador(state: AgentState):
    llm = get_llm(temperature=0.7)
    system_msg = SystemMessage(content=(
        "Eres el Agente Planificador Jefe de un equipo de expertos musicales. "
        "Tu tarea es analizar la petición inicial del usuario y delinear un plan claro "
        "sobre qué aspectos debe cubrir el Especialista en Instrumentación y el "
        "Especialista en Composición. No necesitas componer ni hacer el trabajo técnico por ellos, "
        "solo dar las directrices y estructurar los pasos a seguir de forma breve y organizativa."
    ))
    response = llm.invoke([system_msg] + state["messages"])
    return {"messages": [response], "sender": "planificador"}

def experto_instrumentos(state: AgentState):
    llm = get_llm(temperature=0.7)
    system_msg = SystemMessage(content=(
        "Eres el Agente Especialista en Instrumentación. "
        "Tu enfoque estricto es la acústica, los timbres, los rangos dinámicos y "
        "las técnicas de ejecución de los instrumentos musicales solicitados o implicados. "
        "Aporta detalles técnicos reales sobre los instrumentos requeridos según el contexto del planificador."
    ))
    response = llm.invoke([system_msg] + state["messages"])
    return {"messages": [response], "sender": "experto_instrumentos"}

def experto_composicion(state: AgentState):
    llm = get_llm(temperature=0.7)
    system_msg = SystemMessage(content=(
        "Eres el Agente Especialista en Composición. "
        "Tu área de dominio es la teoría musical, las progresiones de acordes, la armonía y "
        "las estructuras específicas de los distintos géneros musicales. Proporciona el diseño armónico "
        "y teórico del plan inicial, integrándolo con las decisiones tomadas por el experto en instrumentación."
    ))
    response = llm.invoke([system_msg] + state["messages"])
    return {"messages": [response], "sender": "experto_composicion"}

def redactor(state: AgentState):
    llm = get_llm(temperature=0.6)
    system_msg = SystemMessage(content=(
        "Eres el Agente Redactor. "
        "Tu objetivo es consolidar todos los hallazgos e ideas técnicas generadas por el equipo "
        "(Planificador, Instrumentación y Composición) y presentarlos en un reporte, ensayo "
        "o guía musical coherente, bien estructurado y altamente atractivo para el usuario final."
    ))
    response = llm.invoke([system_msg] + state["messages"])
    return {"messages": [response], "sender": "redactor"}

def verificador(state: AgentState):
    # Temperatura más baja para el verificador para obtener mayor rigor y consistencia.
    llm = get_llm(temperature=0.2)
    system_msg = SystemMessage(content=(
        "Eres el Agente Verificador (Auditor de Calidad). "
        "¡REGLA ABSOLUTA!: NO vuelvas a escribir la guía musical ni generes contenido nuevo derivado. "
        "Tu ÚNICO trabajo es evaluar y criticar el trabajo entregado por el 'Redactor'. "
        "Emite un dictamen final de la calidad técnica y armónica, otorga una calificación "
        "explícita del 1 al 10, y da un breve veredicto (máximo 3-4 líneas) justificando tu nota "
        "respecto a la petición musical original. Compórtate estrictamente como un auditor."
    ))
    response = llm.invoke([system_msg] + state["messages"])
    return {"messages": [response], "sender": "verificador"}

# ==========================================
# Constructor del Grafo
# ==========================================

def build_graph():
    """
    Inicializa el grafo de LangGraph, añade los agentes (nodos) y 
    define un flujo lineal (edges) temporal.
    """
    builder = StateGraph(AgentState)
    
    # 1. Agregar nodos (Agentes)
    builder.add_node("planificador", planificador)
    builder.add_node("experto_instrumentos", experto_instrumentos)
    builder.add_node("experto_composicion", experto_composicion)
    builder.add_node("redactor", redactor)
    builder.add_node("verificador", verificador)
    
    # 2. Configurar el flujo (Aristas / Edges)
    # Por ahora es completamente lineal para asegurar la estructura de la Fase 2.
    builder.add_edge(START, "planificador")
    builder.add_edge("planificador", "experto_instrumentos")
    builder.add_edge("experto_instrumentos", "experto_composicion")
    builder.add_edge("experto_composicion", "redactor")
    builder.add_edge("redactor", "verificador")
    builder.add_edge("verificador", END)
    
    # 3. Compilar el grafo
    graph = builder.compile()
    
    return graph
