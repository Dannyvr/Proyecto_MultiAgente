from fastapi import APIRouter
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from backend.Agents.graph import build_graph

# Inicializamos el enrutador en lugar de la aplicación completa
router = APIRouter()

class TaskRequest(BaseModel):
    task: str

@router.post("/run_task")
async def run_task(request: TaskRequest):
    """
    Endpoint que recibe una solicitud musical y orquesta a todo el equipo 
    de agentes a través de LangGraph.
    """
    graph = build_graph()
    initial_state = {"messages": [HumanMessage(content=request.task)]}
    
    agent_steps = []
    redactor_output = ""
    
    for output in graph.stream(initial_state):
        for node_name, node_state in output.items():
            if "messages" in node_state and len(node_state["messages"]) > 0:
                latest_message = node_state["messages"][-1]
                safe_text = latest_message.content
                
                agent_steps.append({
                    "agent": node_name,
                    "content": safe_text
                })
                
                # Rescatar únicamente la respuesta del redactor como output final
                if node_name == "redactor":
                    redactor_output = safe_text

    # Mecanismo de fallback por si el redactor falla o no emite nada
    if not redactor_output:
        redactor_output = "Error: El agente redactor no emitió ningún reporte estructurado válido."

    return {
        "final_response": redactor_output,
        "steps": agent_steps
    }
