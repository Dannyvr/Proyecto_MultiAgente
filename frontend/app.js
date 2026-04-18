const API_BASE = "http://127.0.0.1:8000/api";
let sessionId = localStorage.getItem('music_session_id');

if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem('music_session_id', sessionId);
}

// Scope global para guardar la interacciones (y sus "steps" de monitoreo)
let sessionInteractions = {}; 

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    // Cargar el historial previo si existe
    try {
        const res = await fetch(`${API_BASE}/history/${sessionId}`);
        if (res.ok) {
            const history = await res.json();
            if (history && history.length > 0) {
                const welcomeMsg = document.getElementById('welcomeMessage');
                if (welcomeMsg) welcomeMsg.classList.add('d-none');

                history.forEach(interaction => {
                    sessionInteractions[interaction.message_id] = interaction;
                    renderUserMessage(interaction.question);
                    renderAIMessage(interaction.answer, interaction.message_id, interaction.feedback);
                    addQuestionToMonitor(interaction.question, interaction.message_id);
                });
            }
        }
    } catch (e) {
        console.error("Error cargando historial de la DB:", e);
    }
});

async function submitTask() {
    const taskInput = document.getElementById('taskInput');
    const question = taskInput.value.trim();
    
    if (!question) {
        alert("Por favor, ingresa una tarea musical primero.");
        return;
    }

    const welcomeMsg = document.getElementById('welcomeMessage');
    if (welcomeMsg) welcomeMsg.classList.add('d-none');
    
    // Inyectar en chat local
    renderUserMessage(question);
    taskInput.value = '';

    toggleLoader(true);

    try {
        const response = await fetch(`${API_BASE}/run_task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: question, session_id: sessionId })
        });

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        const data = await response.json();
        
        // Guardar para el monitor de agentes
        sessionInteractions[data.message_id] = {
            question: question,
            answer: data.final_response,
            steps: data.steps,
            message_id: data.message_id
        };

        // Renderizar Burbuja IA
        renderAIMessage(data.final_response, data.message_id);
        
        // Añadir a lista de Monitor
        addQuestionToMonitor(question, data.message_id);

    } catch (error) {
        console.error(error);
        alert("Ocurrió un error consultando al equipo de expertos.");
    } finally {
        toggleLoader(false);
    }
}

function renderUserMessage(text) {
    const template = document.getElementById('userMessageTemplate');
    const clone = template.content.cloneNode(true);
    clone.querySelector('.user-text').textContent = text;
    
    const chatHistory = document.getElementById('chatHistory');
    chatHistory.appendChild(clone);
    scrollChat();
}

function renderAIMessage(markdownText, messageId, feedbackMap) {
    const template = document.getElementById('aiMessageTemplate');
    const clone = template.content.cloneNode(true);
    
    const htmlText = marked.parse(markdownText || "Sin respuesta");
    clone.querySelector('.ai-text').innerHTML = htmlText;
    
    const card = clone.querySelector('.glass-card');
    card.setAttribute('data-id', messageId);
    
    const btnLike = clone.querySelector('.btn-like');
    const btnDislike = clone.querySelector('.btn-dislike');
    const btnComment = clone.querySelector('.btn-comment');
    const commentArea = clone.querySelector('.comment-area');
    const btnSubmitComment = clone.querySelector('.btn-submit-comment');
    const commentInput = clone.querySelector('.comment-input');

    let currentRating = null;

    if (feedbackMap) {
        if (feedbackMap.rating === 'like') {
            btnLike.classList.remove('text-secondary');
            btnLike.classList.add('text-success');
            currentRating = 'like';
        } else if (feedbackMap.rating === 'dislike') {
            btnDislike.classList.remove('text-secondary');
            btnDislike.classList.add('text-danger');
            currentRating = 'dislike';
        }
        if (feedbackMap.comment) {
            btnComment.disabled = true;
            btnLike.disabled = true;
            btnDislike.disabled = true;
        }
    }

    btnLike.onclick = () => {
        btnLike.classList.remove('text-secondary');
        btnLike.classList.add('text-success');
        btnDislike.classList.remove('text-danger');
        btnDislike.classList.add('text-secondary');
        currentRating = 'like';
        submitFeedback(messageId, 'like', null);
    };

    btnDislike.onclick = () => {
        btnDislike.classList.remove('text-secondary');
        btnDislike.classList.add('text-danger');
        btnLike.classList.remove('text-success');
        btnLike.classList.add('text-secondary');
        currentRating = 'dislike';
        submitFeedback(messageId, 'dislike', null);
    };

    btnComment.onclick = () => {
        commentArea.classList.toggle('d-none');
        if (!commentArea.classList.contains('d-none')) {
            commentInput.focus();
            scrollChat();
        }
    };

    btnSubmitComment.onclick = () => {
        const txt = commentInput.value.trim();
        const ratingToSend = currentRating || 'neutral';
        submitFeedback(messageId, ratingToSend, txt || "Sin comentario");
        
        commentArea.innerHTML = `<p class="text-success small mb-0"><i class="bi bi-check-circle me-1"></i>¡Gracias por tu comentario!</p>`;
        btnLike.disabled = true;
        btnDislike.disabled = true;
        btnComment.disabled = true;
    };

    const chatHistory = document.getElementById('chatHistory');
    chatHistory.appendChild(clone);
    scrollChat();
}

function scrollChat() {
    const chatHistory = document.getElementById('chatHistory');
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function submitFeedback(messageId, rating, comment) {
    try {
        await fetch(`${API_BASE}/feedback`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                message_id: messageId,
                rating: rating,
                comment: comment
            })
        });
    } catch (e) {
        console.error("Error enviando el feedback:", e);
    }
}

// Lógica para Tab 2: Monitoreo
function addQuestionToMonitor(question, messageId) {
    const list = document.getElementById('questionList');
    
    if(document.getElementById('emptyQuestionsMsg')) {
        document.getElementById('emptyQuestionsMsg').remove();
    }

    const btn = document.createElement('button');
    btn.className = "list-group-item list-group-item-action bg-transparent text-light border-secondary border-opacity-25 pb-3 pt-3 px-3";
    btn.innerHTML = `<i class="bi bi-chat-right-text text-primary me-2"></i> <span class="fw-medium">${question.length > 50 ? question.substring(0, 50) + "..." : question}</span>`;
    
    btn.onclick = (e) => {
        Array.from(list.children).forEach(child => {
            child.classList.remove('bg-dark', 'bg-opacity-25', 'border-start', 'border-info', 'border-3');
        });
        btn.classList.add('bg-dark', 'bg-opacity-25', 'border-start', 'border-info', 'border-3');
        
        renderMonitorSteps(messageId);
    };
    
    list.appendChild(btn);
}

function renderMonitorSteps(messageId) {
    const interaction = sessionInteractions[messageId];
    const steps = interaction ? interaction.steps : [];
    
    const accordion = document.getElementById('stepsAccordion');
    const emptyUI = document.getElementById('emptyMonitor');

    accordion.innerHTML = '';
    
    if (!steps || steps.length === 0) {
        emptyUI.classList.remove('d-none');
        return;
    }

    emptyUI.classList.add('d-none');

    const agentIcons = {
        "planificador": "bi-diagram-3 text-info",
        "experto_instrumentos": "bi-speaker text-warning",
        "experto_composicion": "bi-music-note-beamed text-success",
        "redactor": "bi-vector-pen text-primary",
        "verificador": "bi-shield-check text-danger"
    };

    steps.forEach((step, index) => {
        const agentNameClean = step.agent.replace('_', ' ');
        const collapseId = `collapse-${index}`;
        const headerId = `heading-${index}`;
        const iconInfo = agentIcons[step.agent] || "bi-cpu";

        const parsedContent = marked.parse(step.content);

        const cardHTML = `
            <div class="accordion-item mb-2" style="border: none; background: rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden;">
                <h2 class="accordion-header" id="${headerId}">
                    <button class="accordion-button collapsed py-3 bg-transparent text-light shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                        <i class="bi ${iconInfo} me-3 fs-5"></i> <span class="text-capitalize fw-bold tracking-wide">${agentNameClean}</span>
                    </button>
                </h2>
                <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headerId}" data-bs-parent="#stepsAccordion">
                    <div class="accordion-body markdown-body p-4 text-light-50 border-top border-secondary border-opacity-25">
                        ${parsedContent}
                    </div>
                </div>
            </div>
        `;
        accordion.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// Lógica para Tab 3: Analíticas
async function loadAnalytics() {
    try {
        const res = await fetch(`${API_BASE}/analytics`);
        if (res.ok) {
            const data = await res.json();
            
            document.getElementById('stat-total').textContent = data.total_interactions;
            document.getElementById('stat-likes').textContent = data.total_likes;
            document.getElementById('stat-dislikes').textContent = data.total_dislikes;
            document.getElementById('stat-approval').textContent = data.approval_rate.toFixed(1) + "%";

            const commentsList = document.getElementById('commentsList');
            commentsList.innerHTML = '';
            
            if (!data.comments_with_text || data.comments_with_text.length === 0) {
                commentsList.innerHTML = '<div class="col-12 text-center py-5 glass-card mb-3"><i class="bi bi-chat-square-dots display-4 text-secondary mb-3"></i><p class="text-muted">Aún no hay feedback narrativo.</p></div>';
            } else {
                data.comments_with_text.forEach(item => {
                    const isLike = item.rating === 'like';
                    const badgeClass = isLike ? 'bg-success' : 'bg-danger';
                    const icon = isLike ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-down-fill';
                    const borderColor = isLike ? 'border-success' : 'border-danger';
                    
                    const el = document.createElement('div');
                    el.className = 'col-md-6 col-lg-4';
                    el.innerHTML = `
                        <div class="glass-card p-4 d-flex flex-column h-100 border-start border-4 ${borderColor}">
                            <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-secondary border-opacity-25">
                                <span class="badge ${badgeClass} shadow-glow"><i class="bi ${icon} me-1"></i> ${item.rating.toUpperCase()}</span>
                                <small class="text-muted font-monospace" style="font-size: 0.65rem;">SID: ${item.session_id.split('-')[0]}</small>
                            </div>
                            <p class="mb-0 text-light opacity-75 fst-italic">"${item.comment}"</p>
                        </div>
                    `;
                    commentsList.appendChild(el);
                });
            }
        }
    } catch (e) {
        console.error("Error al obtener las analíticas", e);
    }
}

// Helpers
function toggleLoader(show) {
    if (show) {
        const template = document.getElementById('loadingMessageTemplate');
        if (template) {
            const clone = template.content.cloneNode(true);
            const chatHistory = document.getElementById('chatHistory');
            chatHistory.appendChild(clone);
            scrollChat();
        }
    } else {
        const activeLoader = document.getElementById('inlineLoaderContainer');
        if (activeLoader) {
            activeLoader.remove();
        }
    }
}

// Atajo para enviar con la tecla Enter (sin Shift)
document.getElementById('taskInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        submitTask();
    }
});

// Lógica de Modales de Confirmación Reutilizable
function showConfirmModal(title, text, confirmBtnText = "Continuar") {
    return new Promise((resolve) => {
        const modalEl = document.getElementById('confirmModal');
        document.getElementById('confirmModalLabel').innerHTML = title;
        document.getElementById('confirmModalBody').innerHTML = text;
        
        const confirmBtn = document.getElementById('confirmModalBtn');
        const cancelBtn = modalEl.querySelector('.btn-cancel-modal');
        confirmBtn.textContent = confirmBtnText;

        // Si es una alerta informativa ("Aceptar"), ocultamos "Cancelar" para simular un Alert de popup
        if (confirmBtnText === "Aceptar") {
            cancelBtn.classList.add('d-none');
            confirmBtn.className = "btn btn-primary-gradient rounded-3 px-4 shadow-glow";
        } else {
            cancelBtn.classList.remove('d-none');
            confirmBtn.className = "btn btn-danger rounded-3 px-4 shadow-glow";
        }

        const bsModal = new bootstrap.Modal(modalEl);
        
        // Quitar listeners previos usando clone para evitar disparos múltiples
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        newConfirmBtn.addEventListener('click', () => {
            bsModal.hide();
            resolve(true);
        });

        const handleHidden = () => {
            modalEl.removeEventListener('hidden.bs.modal', handleHidden);
            resolve(false);
        };
        modalEl.addEventListener('hidden.bs.modal', handleHidden);

        bsModal.show();
    });
}

// Limpiar el historial del chat
async function clearChat() {
    const isConfirmed = await showConfirmModal(
        "<i class='bi bi-exclamation-triangle text-warning me-2'></i>Limpiar Conversación", 
        "¿Estás seguro de que quieres limpiar toda la conversación?<br><br>Esta acción eliminará el historial de esta sesión y no se puede deshacer.",
        "Sí, Eliminar"
    );

    if (!isConfirmed) return;

    try {
        const response = await fetch(`${API_BASE}/history/${sessionId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.statusText}`);
        }

        // Limpiar DOM del Chat
        const chatHistory = document.getElementById('chatHistory');
        chatHistory.innerHTML = `
            <div class="text-center py-5 text-muted" id="welcomeMessage">
                <i class="bi bi-music-note-beamed display-1 text-light-50 mb-3 opacity-25"></i>
                <p class="mb-0 text-light-50 fw-bold fs-5">¿Qué obra maestra musical vamos a visualizar hoy?</p>
                <span class="small text-muted">Escribe un género o tarea abajo para despertar a la mente colmena.</span>
            </div>
        `;

        // Limpiar el Monitor (Acordeón y Lista lateral)
        document.getElementById('questionList').innerHTML = '<p class="text-muted small text-center my-4" id="emptyQuestionsMsg">No hay consultas registradas aún.</p>';
        document.getElementById('stepsAccordion').innerHTML = '';
        document.getElementById('emptyMonitor').classList.remove('d-none');
        
        // Limpiar memoria global local
        sessionInteractions = {};

    } catch (error) {
        console.error(error);
        showConfirmModal("<i class='bi bi-x-circle text-danger me-2'></i>Error", "Ocurrió un error al intentar limpiar la conversación.", "Aceptar");
    }
}

// Resetear las métricas analíticas
async function clearAnalytics() {
    const isConfirmed = await showConfirmModal(
        "<i class='bi bi-shield-exclamation text-danger me-2'></i>RESETEO GLOBAL", 
        "¿Estás verdaderamente seguro?<br><br>Esto reiniciará y <b>borrará absolutamente toda la base de datos</b> de los chats y métricas de todos los usuarios.<br>Esta acción es irreversible.", 
        "Purgar Base de Datos"
    );

    if (!isConfirmed) return;

    try {
        const response = await fetch(`${API_BASE}/analytics/clear`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.statusText}`);
        }

        // Refrescar el tab de analiticas actualizando a cero
        loadAnalytics();

        // Limpiar el chat actual y memoria para no recargar de un local desincronizado
        sessionInteractions = {};
        const chatHistory = document.getElementById('chatHistory');
        chatHistory.innerHTML = `
            <div class="text-center py-5 text-muted" id="welcomeMessage">
                <i class="bi bi-music-note-beamed display-1 text-light-50 mb-3 opacity-25"></i>
                <p class="mb-0 text-light-50 fw-bold fs-5">¿Qué obra maestra musical vamos a visualizar hoy?</p>
                <span class="small text-muted">Escribe un género o tarea abajo para despertar a la mente colmena.</span>
            </div>
        `;
        document.getElementById('questionList').innerHTML = '<p class="text-muted small text-center my-4" id="emptyQuestionsMsg">No hay consultas registradas aún.</p>';
        document.getElementById('stepsAccordion').innerHTML = '';
        document.getElementById('emptyMonitor').classList.remove('d-none');

        showConfirmModal("<i class='bi bi-check-circle text-success me-2'></i>Éxito", "Base de datos métrica global limpiada exitosamente.", "Aceptar");

    } catch (error) {
        console.error(error);
        showConfirmModal("<i class='bi bi-x-circle text-danger me-2'></i>Error", "Ocurrió un error al intentar resetear las métricas.", "Aceptar");
    }
}
