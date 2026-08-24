/**
 * ============================================================
 * ESTADO — tela de detalhe do paciente
 * ------------------------------------------------------------
 * Mesma regra de ouro de state.js: nada de `document` aqui.
 * O domínio é diferente do da lista (um paciente + os atendimentos
 * dele, não uma lista filtrável), por isso é um estado à parte.
 * ============================================================ */

const state = {
  patient: null,
  encounters: [],
  isLoading: true,
  errorMessage: null, // falha ao carregar a página inteira (404, rede)
  isSubmitting: false,
  formError: null, // erro de validação devolvido pelo backend ao criar
};

const listeners = [];

/** @param {(state: object) => void} listener */
export function subscribe(listener) {
  listeners.push(listener);
}

function notify() {
  const snapshot = { ...state };
  listeners.forEach((listener) => listener(snapshot));
}

export function getState() {
  return { ...state };
}

/* ------------------------------------------------------------
   AÇÕES
   ------------------------------------------------------------ */

/** Carga inicial (ou recarga) bem-sucedida: paciente + atendimentos. */
export function setPatientAndEncounters(patient, encounters) {
  state.patient = patient;
  state.encounters = encounters;
  state.isLoading = false;
  state.errorMessage = null;
  notify();
}

/** Só os atendimentos mudaram (ex.: depois de criar um novo). */
export function setEncounters(encounters) {
  state.encounters = encounters;
  notify();
}

/** A página inteira falhou ao carregar (paciente não existe, rede caiu). */
export function setLoadError(message) {
  state.errorMessage = message;
  state.isLoading = false;
  notify();
}

/** Liga/desliga o estado "enviando formulário" (desabilita o botão). */
export function setSubmitting(isSubmitting) {
  state.isSubmitting = isSubmitting;
  notify();
}

/** Mensagem de erro do formulário de novo atendimento (ou null para limpar). */
export function setFormError(message) {
  state.formError = message;
  notify();
}
