import json
import os
from typing import List, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "db.json")

def load_db() -> Dict[str, Any]:
    if not os.path.exists(DB_PATH):
        return {}
    try:
        with open(DB_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_db(data: Dict[str, Any]) -> None:
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def get_session_history(session_id: str) -> List[Dict[str, Any]]:
    db = load_db()
    return db.get(session_id, [])

def save_interaction(session_id: str, interaction_data: Dict[str, Any]) -> None:
    db = load_db()
    if session_id not in db:
        db[session_id] = []
    db[session_id].append(interaction_data)
    save_db(db)
