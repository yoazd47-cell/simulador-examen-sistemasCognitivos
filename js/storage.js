// js/storage.js

const STORAGE_KEY = 'dl_simulador_history_v1';

/**
 * Obtiene el historial completo de resultados guardados.
 * @returns {Object} Diccionario con los resultados por testId.
 */
export function getSavedResults() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Error leyendo LocalStorage:', error);
    return {};
  }
}

/**
 * Guarda o actualiza el resultado de un micro test.
 * @param {string} testId - Identificador del test (ej. "micro_test_1").
 * @param {Object} scoreData - Objeto con { correct, total, percentage }.
 */
export function saveTestResult(testId, scoreData) {
  try {
    const history = getSavedResults();
    history[testId] = {
      ...scoreData,
      completedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error guardando en LocalStorage:', error);
  }
}

/**
 * Limpia el historial almacenado.
 */
export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
