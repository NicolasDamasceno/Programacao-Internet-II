/**
 * ============================================================
 * RENDERIZAÇÃO — tela de detalhe do paciente
 * ------------------------------------------------------------
 * Mesma regra de ouro de render.js: aqui não se decide nada,
 * só se desenha o que o estado mandar.
 * ============================================================ */
import { escapeHtml, formatDate } from "./render.js";

/** "2026-08-24T09:30" -> "24/08/2026 09:30" (split + template string, sem libs). */
function formatDateTime(isoDateTime) {
  const [datePart, timePart] = isoDateTime.split("T");
  return `${formatDate(datePart)} ${timePart}`;
}

/** Monta o HTML de UM atendimento. */
function encounterItemTemplate(encounter) {
  const notesMarkup = encounter.notes
    ? `<p class="encounter-item__notes">${escapeHtml(encounter.notes)}</p>`
    : `<p class="encounter-item__notes encounter-item__notes--empty">Sem conduta registrada ainda.</p>`;

  return `
    <li class="encounter-item">
      <p class="encounter-item__date">${formatDateTime(encounter.startedAt)}</p>
      <p class="encounter-item__complaint">${escapeHtml(encounter.chiefComplaint)}</p>
      ${notesMarkup}
    </li>
  `;
}

/** Tela de "nenhum atendimento ainda". */
function emptyEncountersTemplate() {
  return `
    <li>
      <div class="empty-state">
        <p class="empty-state__title">Nenhum atendimento registrado</p>
        <p class="m-0">Use o formulário abaixo para abrir o primeiro.</p>
      </div>
    </li>
  `;
}

export function renderEncounterList(encounters, container) {
  container.innerHTML = encounters.length
    ? encounters.map(encounterItemTemplate).join("")
    : emptyEncountersTemplate();
}

/** Cabeçalho com os dados do paciente. */
export function renderPatientSummary(patient, container) {
  const badgeModifier = patient.active ? "status-badge--active" : "status-badge--inactive";
  const badgeLabel = patient.active ? "Ativo" : "Inativo";

  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-start gap-2">
      <h2 class="patient-summary__name">${escapeHtml(patient.name)}</h2>
      <span class="status-badge ${badgeModifier}">${badgeLabel}</span>
    </div>
    <p class="patient-summary__meta">Nascimento: ${formatDate(patient.birthDate)}</p>
    <p class="patient-summary__meta patient-summary__id">CNS ${escapeHtml(patient.nationalId)} · #${patient.id}</p>
  `;
}

/** Enquanto os dados ainda não chegaram. Spinner, não vermelho: não é um erro. */
export function renderLoading(container) {
  container.innerHTML = `
    <div class="empty-state d-flex flex-column align-items-center gap-2">
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Carregando…</span>
      </div>
      <p class="empty-state__title m-0">Buscando os dados do paciente.</p>
    </div>
  `;
}

/** Página inteira falhou (paciente não existe, rede caiu). Vermelho: é um erro de verdade. */
export function renderLoadError(message, container) {
  container.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <p class="empty-state__title m-0">Algo deu errado</p>
      <p class="m-0">${escapeHtml(message)}</p>
      <p class="m-0"><a href="./index.html">&larr; Voltar para a lista de pacientes</a></p>
    </div>
  `;
}

/** Mensagem de erro do formulário (400 vindo do backend, ou null para limpar). */
export function renderFormError(message, container) {
  if (!message) {
    container.innerHTML = "";
    container.classList.add("d-none");
    return;
  }

  container.classList.remove("d-none");
  container.textContent = message;
}
