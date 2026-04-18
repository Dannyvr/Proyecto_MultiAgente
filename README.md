# Proyecto MultiAgente - Expertos en Música

Este proyecto consiste en el desarrollo de un **Sistema Multiagente Especializado en Música**, utilizando tecnologías como **LangGraph**, **FastAPI** y los modelos de lenguaje de **Azure AI Foundry**. 

El sistema utiliza varios agentes (Planificador, Especialista en Instrumentación, Especialista en Composición, Redactor y Verificador) que colaboran para analizar y generar contenido musical técnico y detallado.

---

## 📁 Estructura del Proyecto

```text
/Proyecto_MultiAgente
│
├── /backend                    # Lógica de servidor y agentes
│   ├── /Agents                 # Definición de configuraciones y conexión a los LLMs
│   │   ├── config.py           # Configuraciones de entorno (Pydantic Settings)
│   │   └── llm_provider.py     # Proveedor de conexión a Azure OpenAI
│   ├── /Apis                   # (Próximamente) Rutas y Endpoints de FastAPI
│   ├── __init__.py
│   └── test_azure.py           # Script para probar la conexión con el LLM en Azure
│
├── /frontend                   # Interfaz de usuario (Chat y Monitoreo)
│   └── index.html              # Estructura principal del Frontend
│
├── /Contexto                   # Documentación inicial y especificaciones
│   └── contexto.md             # Detalles de diseño, fases y arquitectura
│
├── .env                        # Variables de entorno (Azure credentials) [No incluido en repositorio]
├── .gitignore                  # Archivos ignorados por Git
├── requirements.txt            # Dependencias de Python instaladas
├── LICENSE                     # Licencia del proyecto
└── README.md                   # Documentación del proyecto (Este archivo)
```

---

## ⚙️ Requisitos Previos

- **Python 3.10+**  
- **Cuenta en Azure AI Foundry** (Despliegue activo de modelo de lenguaje, en este caso `gpt-4.1-mini`).
- **Git**

---

## 🚀 Instalación y Ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd Proyecto_MultiAgente
   ```

2. **Crear y activar el entorno virtual:**
   ```bash
   python -m venv .venv
   
   # En Windows:
   .venv\Scripts\activate
   # En macOS/Linux:
   source .venv/bin/activate
   ```

3. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar Variables de Entorno:**
   Crea un archivo `.env` en la raíz del proyecto y agrega tus datos de Azure:
   ```env
   AZURE_OPENAI_API_KEY="tu_api_key_aqui"
   AZURE_OPENAI_ENDPOINT="tu_endpoint_aqui"
   ```

5. **Probar la conexión con Azure (Fase 1 completada):**
   Asegúrate de estar en el directorio raíz y ejecuta:
   ```bash
   python backend/test_azure.py
   ```
   Si la configuración es correcta, recibirás una respuesta del experto en música simulado vía LLM.

---

## 📅 Fases de Desarrollo

Según las especificaciones del proyecto (`Contexto/contexto.md`), el desarrollo se divide en:

- **Fase 1:** Infraestructura y Conexión (✅ *Completada*).
- **Fase 2:** Capa de Orquestación con LangGraph (Definición del estado y grafo de control).
- **Fase 3:** Implementación de Agentes Especialistas en Música (Lógica y Prompts de Instrumentos, Composición y Redacción).
- **Fase 4:** Capa de API FastAPI (Endpoints de Chat y Streaming para monitoreo).
- **Fase 5:** Interfaz Web Frontend (Chat en HTML/JS con panel de monitoreo visual).