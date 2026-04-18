import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage
from backend.Agents.graph import build_graph
from backend.database.database import get_session_history, save_interaction, load_db, save_db

# Inicializamos el enrutador en lugar de la aplicación completa
router = APIRouter()

class TaskRequest(BaseModel):
    task: str
    session_id: str

class FeedbackRequest(BaseModel):
    message_id: str
    rating: str
    comment: str | None = None

@router.post("/run_task")
async def run_task(request: TaskRequest):
    """
    Endpoint que recibe una solicitud musical y orquesta a todo el equipo 
    de agentes a través de LangGraph.
    """
    # 1. Obtener historial previo de la base de datos local
    history = get_session_history(request.session_id)
    
    # 2. Inyectar memoria en LangGraph reconstruyendo la conversación
    messages = []
    for interaccion in history:
        messages.append(HumanMessage(content=interaccion["question"]))
        messages.append(AIMessage(content=interaccion["answer"]))
        
    messages.append(HumanMessage(content=request.task))

    graph = build_graph()
    initial_state = {"messages": messages}
    
    agent_steps = []
    redactor_output = ""
    
    # 3. Ejecutar el grafo de agentes
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

    # 4. Guardar la interacción actual con identificador único
    new_message_id = str(uuid.uuid4())
    interaction_data = {
        "message_id": new_message_id,
        "question": request.task,
        "answer": redactor_output,
        "steps": agent_steps,
        "feedback": {
            "rating": None,
            "comment": None
        }
    }
    save_interaction(request.session_id, interaction_data)

    # 5. Devolver los resultados conforme a la estructura esperada
    return {
        "session_id": request.session_id,
        "message_id": new_message_id,
        "final_response": redactor_output,
        "steps": agent_steps
    }

@router.get("/history/{session_id}")
async def get_history(session_id: str):
    """
    Retorna el historial de la sesión especificada.
    """
    return get_session_history(session_id)

@router.post("/feedback")
async def add_feedback(request: FeedbackRequest):
    """
    Añade un rating y comentario a una interacción específica a través de su message_id.
    """
    db = load_db()
    for session_id, interactions in db.items():
        for interaction in interactions:
            if interaction.get("message_id") == request.message_id:
                if "feedback" not in interaction:
                    interaction["feedback"] = {"rating": None, "comment": None}
                interaction["feedback"]["rating"] = request.rating
                interaction["feedback"]["comment"] = request.comment
                save_db(db)
                return {"message": "Feedback actualizado con éxito"}
    
    raise HTTPException(status_code=404, detail="Mensaje no encontrado")

@router.get("/analytics")
async def get_analytics():
    """
    Recorre toda la base de datos para extraer métricas y estadísticas globales.
    """
    db = load_db()
    total_interactions = 0
    total_likes = 0
    total_dislikes = 0
    comments_with_text = []
    
    for session_id, interactions in db.items():
        total_interactions += len(interactions)
        for interaction in interactions:
            feedback = interaction.get("feedback")
            if feedback:
                rating = feedback.get("rating")
                comment = feedback.get("comment")
                
                if rating == "like":
                    total_likes += 1
                elif rating == "dislike":
                    total_dislikes += 1
                    
                if comment and comment.strip() != "":
                    comments_with_text.append({
                        "session_id": session_id,
                        "message_id": interaction.get("message_id"),
                        "rating": rating,
                        "comment": comment
                    })

    approval_rate = 0.0
    if total_interactions > 0:
        # Se calcula base al total de las interacciones, pudiendo ajustarse a base del total de interacciones votadas.
        approval_rate = (total_likes / total_interactions) * 100
        
    return {
        "total_interactions": total_interactions,
        "total_likes": total_likes,
        "total_dislikes": total_dislikes,
        "comments_with_text": comments_with_text,
        "approval_rate": approval_rate
    }

@router.delete("/analytics/clear")
async def clear_database():
    """
    Limpia completamente el contenido de db.json en su totalidad dejándolo vacío.
    """
    save_db({})
    return {"message": "Base de datos reiniciada con éxito"}

@router.delete("/history/{session_id}")
async def delete_session_history(session_id: str):
    """
    Elimina el historial de una conversación específica dada su ID.
    """
    db = load_db()
    if session_id in db:
        del db[session_id]
        save_db(db)
        return {"message": f"Historial para la sesión {session_id} ha sido eliminado"}
    
    raise HTTPException(status_code=404, detail="Sesión no encontrada")
