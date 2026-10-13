// js/app.js

import * as State from './state.js';
import * as Engine from './quiz-engine.js';
import * as UI from './ui.js';
import * as Storage from './storage.js';

// Rutas de búsqueda del archivo de preguntas
const DATA_PATHS = [
  './data/preguntas.json',
  './preguntas_simulador_examen.json'
];

async function loadQuestionsData() {
  for (const path of DATA_PATHS) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const data = await response.json();
        return data.micro_tests;
      }
    } catch (_) {
      // Intenta la siguiente ruta si falla
    }
  }
  throw new Error('No se pudo encontrar el archivo de preguntas en las rutas especificadas.');
}

function setupEventListeners() {
  // Manejo de clics en las opciones
  const optionsContainer = document.getElementById('options-container');
  optionsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.option-btn');
    if (!btn || State.isCurrentChecked()) return;

    const index = parseInt(btn.dataset.index, 10);
    const question = State.getCurrentQuestion();
    State.toggleOptionSelection(index, question.tipo);
    UI.updateOptionSelections(State.getSelectedOptions());
  });

  // Botón principal (Comprobar o Siguiente)
  const actionBtn = document.getElementById('btn-submit-action');
  actionBtn.addEventListener('click', () => {
    if (!State.isCurrentChecked()) {
      handleCheckAnswer();
    } else {
      handleNextStep();
    }
  });

  // Salir del test actual
  document.getElementById('btn-exit-quiz').addEventListener('click', () => {
    if (confirm('¿Deseas volver al menú principal? Se perderá el avance actual de este test.')) {
      UI.showScreen('home');
    }
  });

  // Botón reintentar desde resultados
  document.getElementById('btn-retry-test').addEventListener('click', () => {
    startSelectedTest(State.getCurrentTestId());
  });

  // Botón volver a inicio desde resultados
  document.getElementById('btn-back-home').addEventListener('click', () => {
    UI.showScreen('home');
  });
}

function startSelectedTest(testId) {
  const test = State.startTest(testId);
  document.getElementById('quiz-test-title').textContent = test.titulo;
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

// Inicialización de la aplicación al cargar la página
async function init() {
  setupEventListeners();
  try {
    const tests = await loadQuestionsData();
    State.setTestsData(tests);
    UI.renderTestList(tests, (testId) => startSelectedTest(testId));
  } catch (error) {
    alert('Error al inicializar las preguntas: ' + error.message);
  }
}

document.addEventListener('DOMContentLoaded', init);
