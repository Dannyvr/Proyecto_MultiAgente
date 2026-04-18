const API_URL = "http://127.0.0.1:8000/api/run_task";

async function submitTask() {
    const taskInput = document.getElementById('taskInput').value;
    
    if (!taskInput.trim()) {
        alert("Por favor, ingresa una tarea musical primero.");
        return;
    }

    // Mostrar UI de carga
    toggleLoader(true);
    resetMonitor();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ task: taskInput })
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.statusText}`);
        }

        const data = await response.json();
        
        // 1. Mostrar Resultado Final en el Chat Tab
        renderFinalResponse(data.final_response);

        // 2. Popular el panel de monitoreo con las tarjetas del flujo
        renderMonitorSteps(data.steps);

    } catch (error) {
        console.error("Hubo un error:", error);
        alert("Ocurrió un error consultando al equipo de expertos. Revisa la consola.");
    } finally {
        // Apagar UI de carga
        toggleLoader(false);
    }
}

function toggleLoader(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('d-none');
    } else {
        overlay.classList.add('d-none');
    }
}

function resetMonitor() {
    const accordion = document.getElementById('stepsAccordion');
    accordion.innerHTML = '';
    
    document.getElementById('emptyMonitor').classList.remove('d-none');
    document.getElementById('finalResponseWrapper').classList.add('collapse');
}

function renderFinalResponse(markdownText) {
    const finalResponseDiv = document.getElementById('finalResponseContent');
    const finalResponseWrapper = document.getElementById('finalResponseWrapper');
    
    // Parsear el Markdown usando la librería importada en index.html
    finalResponseDiv.innerHTML = marked.parse(markdownText || "No se generó una respuesta final.");
    
    // Mostrar visualmente el contenedor con animación de bootstrap 
    const bsCollapse = new bootstrap.Collapse(finalResponseWrapper, { toggle: false });
    bsCollapse.show();
}

function renderMonitorSteps(steps) {
    const accordion = document.getElementById('stepsAccordion');
    const emptyUI = document.getElementById('emptyMonitor');

    if (!steps || steps.length === 0) return;

    // Ocultar mensaje vacío
    emptyUI.classList.add('d-none');

    // Mapeo amigable de iconos por agente para diseño visual rico
    const agentIcons = {
        "planificador": "bi-diagram-3",
        "experto_instrumentos": "bi-speaker",
        "experto_composicion": "bi-music-note-beamed",
        "redactor": "bi-vector-pen",
        "verificador": "bi-check2-all"
    };

    steps.forEach((step, index) => {
        const agentNameClean = step.agent.replace('_', ' ');
        const collapseId = `collapse-${index}`;
        const headerId = `heading-${index}`;
        const iconInfo = agentIcons[step.agent] || "bi-cpu";

        // Parsea el markdown del agente también para que el log se vea limpio
        const parsedContent = marked.parse(step.content);

        const cardHTML = `
            <div class="accordion-item">
                <h2 class="accordion-header" id="${headerId}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                        <i class="bi ${iconInfo} me-2 text-warning fs-5"></i> Agente: ${agentNameClean}
                    </button>
                </h2>
                <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headerId}" data-bs-parent="#stepsAccordion">
                    <div class="accordion-body markdown-body p-4 text-light-50">
                        ${parsedContent}
                    </div>
                </div>
            </div>
        `;
        
        accordion.insertAdjacentHTML('beforeend', cardHTML);
    });
}
