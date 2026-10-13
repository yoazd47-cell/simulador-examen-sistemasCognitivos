// js/ui.js

const screens = {
  home: document.getElementById('screen-home'),
  quiz: document.getElementById('screen-quiz'),
  results: document.getElementById('screen-results')
};

export function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  if (screens[screenName]) {
    screens[screenName].classList.add('active');
    window.scrollTo(0, 0);
  }
}

export function renderTestList(tests, onSelect) {
  const container = document.getElementById('test-list');
  container.innerHTML = '';

  tests.forEach(test => {
    const card = document.createElement('div');
    card.className = 'test-card';
    card.innerHTML = `
      <div>
        <h3 class="test-card-title">${test.titulo}</h3>
        <span class="test-card-count">${test.preguntas.length} preguntas</span>
      </div>
      <span class="badge">&#9654; Iniciar</span>
    `;
    card.addEventListener('click', () => onSelect(test.id));
    container.appendChild(card);
  });
}

export function renderQuestion(question, currentIndex, totalQuestions, score) {
  document.getElementById('question-counter').textContent = `Pregunta ${currentIndex + 1} de ${totalQuestions}`;
  document.getElementById('quiz-score-preview').textContent = `Aciertos: ${score.correct}`;
  
  // Actualizar barra de progreso
  const progressPct = ((currentIndex) / totalQuestions) * 100;
  document.getElementById('progress-fill').style.width = `${progressPct}%`;

  // Etiqueta de tipo
  const badgeType = document.getElementById('question-type-badge');
  badgeType.textContent = formatTypeLabel(question.tipo);

  // Texto de la pregunta
  document.getElementById('question-text').textContent = question.texto;

  // Renderizado de opciones
  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';

  question.opciones.forEach((opcion, idx) => {
    const btn = document.createElement('button');
    btn.className = `option-btn ${question.tipo === 'seleccion_multiple' ? 'is-multiple' : ''}`;
    btn.dataset.index = idx;
    btn.innerHTML = `
      <div class="option-indicator">${idx + 1}</div>
      <span>${opcion.texto}</span>
    `;
    optionsContainer.appendChild(btn);
  });

  // Ocultar retroalimentación previa
  const feedback = document.getElementById('feedback-banner');
  feedback.className = 'feedback-banner hidden';
  feedback.textContent = '';

  // Reset de botón principal
  const actionBtn = document.getElementById('btn-submit-action');
  actionBtn.textContent = 'Comprobar respuesta';
  actionBtn.disabled = true;
}

export function updateOptionSelections(selectedIndices) {
  const optionButtons = document.querySelectorAll('.option-btn');
  optionButtons.forEach(btn => {
    const idx = parseInt(btn.dataset.index, 10);
    if (selectedIndices.includes(idx)) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });

  const actionBtn = document.getElementById('btn-submit-action');
  actionBtn.disabled = selectedIndices.length === 0;
}

export function showEvaluationFeedback(evaluation, isLastQuestion) {
  const optionButtons = document.querySelectorAll('.option-btn');
  
  optionButtons.forEach(btn => {
    const idx = parseInt(btn.dataset.index, 10);
    btn.disabled = true; // Desactivar pulsaciones tras comprobar

    if (evaluation.correctIndices.includes(idx)) {
      btn.classList.add('correct');
    } else if (evaluation.userSelections.includes(idx)) {
      btn.classList.add('incorrect');
    }
  });

  const actionBtn = document.getElementById('btn-submit-action');
  actionBtn.disabled = false;
  actionBtn.textContent = isLastQuestion ? 'Ver resultados' : 'Siguiente pregunta';
}

export function renderResults(scoreData) {
  document.getElementById('final-percentage').textContent = `${scoreData.percentage}%`;
  document.getElementById('score-summary-text').textContent = 
    `Has respondido correctamente ${scoreData.correct} de ${scoreData.total} preguntas`;
  document.getElementById('metric-correct').textContent = scoreData.correct;
  document.getElementById('metric-incorrect').textContent = scoreData.incorrect;
}

function formatTypeLabel(tipo) {
  switch (tipo) {
    case 'verdadero_falso': return 'Verdadero o Falso';
    case 'seleccion_multiple': return 'Selección múltiple';
    case 'opcion_unica': return 'Opción única';
    default: return 'Pregunta';
  }
}
