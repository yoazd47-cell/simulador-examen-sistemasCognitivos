// js/app.js

import * as State from './state.js';
import * as Engine from './quiz-engine.js';
import * as UI from './ui.js';
import * as Storage from './storage.js';

// Rutas de búsqueda para el banco de preguntas
const DATA_PATHS = [
  './data/preguntas.json',
  'data/preguntas.json',
  './preguntas_simulador_examen.json'
];

async function loadQuestionsData() {
  for (const path of DATA_PATHS) {
    try {
      console.log(`Intentando cargar preguntas desde: ${path}`);
      const response = await fetch(path);
      if (response.ok) {
        const data = await response.json();
        console.log(`Datos cargados con éxito desde: ${path}`, data);
        if (data.micro_tests && data.micro_tests.length > 0) {
          return data.micro_tests;
        }
      } else {
        console.warn(`Respuesta no satisfactoria para ${path}: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.warn(`Fallo al intentar acceder a ${path}:`, err);
    }
  }
  throw new Error('No fue posible localizar data/preguntas.json en las rutas relativas especificadas.');
}

function setupEventListeners() {
  // Selección de respuestas dentro del cuestionario
  const optionsContainer = document.getElementById('options-container');
  if (optionsContainer) {
    optionsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-btn');
      if (!btn || State.isCurrentChecked()) return;

      const index = parseInt(btn.dataset.index, 10);
      const question = State.getCurrentQuestion();
      State.toggleOptionSelection(index, question.tipo);
      UI.updateOptionSelections(State.getSelectedOptions());
    });
  }

  // Botón principal de acción (Comprobar / Siguiente)
  const actionBtn = document.getElementById('btn-submit-action');
  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      if (!State.isCurrentChecked()) {
        handleCheckAnswer();
      } else {
        handleNextStep();
      }
    });
  }

  // Botón para salir al menú principal
  const exitBtn = document.getElementById('btn-exit-quiz');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      if (confirm('¿Deseas volver al menú principal? Se perderá el avance actual de este test.')) {
        UI.showScreen('home');
      }
    });
  }

  // Reintentar test desde la pantalla de resultados
  const retryBtn = document.getElementById('btn-retry-test');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      startSelectedTest(State.getCurrentTestId());
    });
  }

  // Volver al listado desde resultados
  const backHomeBtn = document.getElementById('btn-back-home');
  if (backHomeBtn) {
    backHomeBtn.addEventListener('click', () => {
      UI.showScreen('home');
    });
  }
}

function startSelectedTest(testId) {
  const test = State.startTest(testId);
  const titleBadge = document.getElementById('quiz-test-title');
  if (titleBadge) {
    titleBadge.textContent = test.titulo;
  }
  UI.showScreen('quiz');
  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  const question = State.getCurrentQuestion();
  UI.renderQuestion(
    question,
    State.getCurrentIndex(),
    State.getTotalQuestions(),
    State.getScore()
  );
}

function handleCheckAnswer() {
  const question = State.getCurrentQuestion();
  const selected = State.getSelectedOptions();
  const evaluation = Engine.evaluateAnswer(question, selected);

  State.markAsChecked(evaluation.isCorrect);

  const isLast = State.getCurrentIndex() === State.getTotalQuestions() - 1;
  UI.showEvaluationFeedback(evaluation, isLast);
}

function handleNextStep() {
  const hasNext = State.nextQuestion();
  if (hasNext) {
    renderCurrentQuestion();
  } else {
    finishTest();
  }
}

function finishTest() {
  const score = State.getScore();
  const percentage = Engine.calculatePercentage(score.correct, score.total);
  const scoreData = { ...score, percentage };

  Storage.saveTestResult(State.getCurrentTestId(), scoreData);
  UI.renderResults(scoreData);
  UI.showScreen('results');
}

// Inicialización de la aplicación
async function init() {
  console.log('Iniciando simulador...');
  setupEventListeners();
  try {
    const tests = await loadQuestionsData();
    console.log(`Se procesaron ${tests.length} micro tests.`);
    State.setTestsData(tests);
    UI.renderTestList(tests, (testId) => startSelectedTest(testId));
  } catch (error) {
    console.error('Error durante la inicialización:', error);
    alert('Error al inicializar las preguntas: ' + error.message);
  }
}

// Ejecución segura: si el DOM ya cargó, arranca al instante sin esperar el evento
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
