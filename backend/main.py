from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importamos nuestro enrutador estructurado
from backend.Apis.api import router as api_router

# Inicialización de FastAPI principal
app = FastAPI(
    title="API - Sistema Multiagente de Música",
    description="Backend que orquesta múltiples agentes musicales usando LangGraph y Azure AI"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enlazamos todas las apis modularizadas bajo el prefijo "/api"
app.include_router(api_router, prefix="/api")
