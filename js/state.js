// js/state.js

const state = {
  allTests: [],
  currentTest: null,
  currentQuestionIndex: 0,
  selectedOptionIndices: [],
  isChecked: false,
  score: {
    correct: 0,
    incorrect: 0
  }
};

export function setTestsData(tests) {
  state.allTests = tests;
}

export function getAllTests() {
  return state.allTests;
}

export function startTest(testId) {
  const foundTest = state.allTests.find(t => t.id === testId);
  if (!foundTest) throw new Error(`Test no encontrado: ${testId}`);

  state.currentTest = foundTest;
  state.currentQuestionIndex = 0;
  state.selectedOptionIndices = [];
  state.isChecked = false;
  state.score = { correct: 0, incorrect: 0 };
  return state.currentTest;
}

export function getCurrentQuestion() {
  if (!state.currentTest) return null;
  return state.currentTest.preguntas[state.currentQuestionIndex];
}

export function getCurrentIndex() {
  return state.currentQuestionIndex;
}

export function getTotalQuestions() {
  return state.currentTest ? state.currentTest.preguntas.length : 0;
}

export function toggleOptionSelection(index, questionType) {
  if (state.isChecked) return; // Bloquear selecciones si ya se comprobó

  if (questionType === 'seleccion_multiple') {
    const exists = state.selectedOptionIndices.indexOf(index);
    if (exists > -1) {
      state.selectedOptionIndices.splice(exists, 1);
    } else {
      state.selectedOptionIndices.push(index);
    }
  } else {
    // Opción única o V/F solo admite un índice seleccionado
    state.selectedOptionIndices = [index];
  }
}

export function getSelectedOptions() {
  return [...state.selectedOptionIndices];
}

export function markAsChecked(isCorrect) {
  state.isChecked = true;
  if (isCorrect) {
    state.score.correct++;
  } else {
    state.score.incorrect++;
  }
}

export function isCurrentChecked() {
  return state.isChecked;
}

export function nextQuestion() {
  state.currentQuestionIndex++;
  state.selectedOptionIndices = [];
  state.isChecked = false;
  return state.currentQuestionIndex < state.currentTest.preguntas.length;
}

export function getScore() {
  return { ...state.score, total: getTotalQuestions() };
}

export function getCurrentTestId() {
  return state.currentTest ? state.currentTest.id : null;
}
