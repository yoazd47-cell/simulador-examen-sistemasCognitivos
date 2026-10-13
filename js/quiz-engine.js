// js/quiz-engine.js

/**
 * Evalúa la selección del usuario frente a una pregunta.
 * @param {Object} question - Objeto de la pregunta con sus opciones.
 * @param {Array<number>} selectedIndices - Índices de las opciones elegidas.
 * @returns {Object} Veredicto y listas de índices correctos/incorrectos.
 */
export function evaluateAnswer(question, selectedIndices) {
  const correctIndices = question.opciones
    .map((op, idx) => (op.correcta ? idx : -1))
    .filter(idx => idx !== -1);

  if (question.tipo === 'seleccion_multiple') {
    // Para selección múltiple: debe marcar todas las correctas y ninguna incorrecta
    const hasAllCorrect = correctIndices.every(idx => selectedIndices.includes(idx));
    const hasNoIncorrect = selectedIndices.every(idx => question.opciones[idx].correcta === true);
    const isCorrect = hasAllCorrect && hasNoIncorrect;

    return {
      isCorrect,
      correctIndices,
      userSelections: selectedIndices
    };
  }

  // Para opción única y verdadero/falso
  const selected = selectedIndices[0];
  const isCorrect = correctIndices.includes(selected);

  return {
    isCorrect,
    correctIndices,
    userSelections: selectedIndices
  };
}

/**
 * Calcula el porcentaje de aciertos.
 * @param {number} correct - Total de aciertos.
 * @param {number} total - Total de preguntas.
 * @returns {number} Porcentaje redondeado.
 */
export function calculatePercentage(correct, total) {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
