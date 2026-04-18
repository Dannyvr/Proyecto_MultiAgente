# HARMONYIA - Sistema Multiagente de Expertos en Música

Este proyecto consiste en el desarrollo de un **Sistema Multiagente Especializado en Música**, orquestado por **LangGraph**, servido mediante **FastAPI**, interactuado por una UI en **Vanilla JS y Bootstrap 5** bajo un estética Glassmorphism, y potenciado en conocimiento por los modelos de **Azure AI Foundry**. 

El sistema utiliza varios agentes (Planificador, Especialista en Instrumentación, Especialista en Composición, Redactor y Verificador) que colaboran de manera encadenada para analizar y generar contenido musical técnico y detallado. Integra **memoria conversacional persistente** y **recolección de analíticas** a través de una base de datos distribuida en JSON.

---

## 📁 Estructura del Proyecto

```text
/Proyecto_MultiAgente
│
├── /backend                    # Lógica de servidor, orquestación y DB
│   ├── /Agents                 # Configuración de LLM (AzureProvider), sub-agentes y flujo de LangGraph
│   ├── /Apis                   # Rutas y Endpoints REST de FastAPI (api.py)
│   ├── /database               # Almacenamiento local de memoria mediante JSON (database.py)
│   └── main.py                 # Punto de entrada y middlewares (CORS) de FastAPI
│
├── /frontend                   # Interfaz visual de usuario para Chat, Monitoreo y Métricas
│   ├── index.html              # Capa estructural (Layout moderno en Sidebar + Grid)
│   ├── style.css               # Definiciones y animación del visual Glassmorphism
│   └── app.js                  # Lógica de UX, Modales interactivos, feedback loop y Peticiones asíncronas
│
├── /Contexto                   # Documentación inicial y especificaciones
│   └── contexto.md             # Detalles de diseño, fases y arquitectura propuesta original
│
├── .env                        # Variables confidenciales requeridas (Azure credentials) [No incluido]
├── requirements.txt            # Gestor de dependencias de Backend en Python
└── README.md                   # Documentación centralizada del proyecto (Este archivo)
```

---

## ⚙️ Características Clave Implementadas

1. **Orquestación Multiagente Inteligente (LangGraph):** Ruteo especializado de tareas musicales en nodos conversacionales.
2. **Back-End API REST Modernizado (FastAPI):** Arquitectura modular mediante endpoints separados con `APIRouter` para orquestación de LLM (`/run_task`), memoria (`/history`), feedback directo y reportería paralela (`/analytics`).
3. **Memoria y Persistencia de Sesión Local:** Base de datos ligera en formato `.json` (`db.json`) que retiene preguntas, respuestas y rastro de interacciones paso-a-paso de los agentes basado en un identificador UUID nativo.
4. **Ciclo de Retroalimentación de Calidad y Dashboard Analítico:** Flujo en que el usuario puede calificar cada respuesta individual de los agentes. Esto alimenta dinámicamente gráficos tabulados calculados y renderizados en un panel exclusivo del frontend que tabula todo, desde porcentaje de aprobación hasta críticas constructivas de los usuarios.
5. **UI/UX Innovadora y Autocontenida:** Pestañas visuales de uso intuitivo sin necesidad de navegar a múltiples URLs. Animaciones dinámicas, carga *in-line*, modales nativos para evitar cajas de alertas destructivas, entre otras.

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

3. **Instalar dependencias necesarias:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Variables de Entorno Clave:**
   Crea un archivo `.env` en la raíz del entorno e incluye tus métricas de Azure:
   ```env
   AZURE_OPENAI_API_KEY="tu_api_key_aqui"
   AZURE_OPENAI_ENDPOINT="tu_endpoint_aqui"
   ```

5. **Levantando el Sistema:**
   El proyecto opera en dos ambientes simultáneos (servidor lógico y estático).

   **Terminal 1 (Backend de FastAPI):**
   ```bash
   uvicorn backend.main:app --reload
   ```
   *(El cerebro corre por defecto en http://127.0.0.1:8000)*

   **Terminal 2 (Servidor Frontend HTML/JS/CSS):**
   ```bash
   python -m http.server 8080 --directory frontend
   ```
   *(Abra desde el navegador http://127.0.0.1:8080 para ingresar a la UI principal)*

---

## 📅 Estado de Desarrollo Integrado

El total de las fases operativas de acuerdo a la documentación matriz ya se ha superado y refinado:

- **Fase 1:** Arquitectura, Entorno y Conexión Cloud (Azure). (✅ *Completada*).
- **Fase 2:** Capilla de Orquestación LLM mediante LangGraph. (✅ *Completada*).
- **Fase 3:** Parametrización en Prompts de Modelos Reactivos (Agentes expertos). (✅ *Completada*).
- **Fase 4:** Migración REST con FastAPI, Memoria Persistente de Sesiones y Funciones Analíticas. (✅ *Completada*).
- **Fase 5:** Empoderamiento de un super Dashboard en Frontend (Vanilla JS + Bootstrap). (✅ *Completada*).