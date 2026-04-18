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
    final_response = ""
    
    for output in graph.stream(initial_state):
        for node_name, node_state in output.items():
            if "messages" in node_state and len(node_state["messages"]) > 0:
                latest_message = node_state["messages"][-1]
                safe_text = latest_message.content
                
                agent_steps.append({
                    "agent": node_name,
                    "content": safe_text
                })
                
                final_response = safe_text

    return {
        "final_response": final_response,
        "steps": agent_steps
    }
