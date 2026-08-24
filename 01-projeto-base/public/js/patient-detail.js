/**
 * ============================================================
 * ORQUESTRAÇÃO — tela de detalhe do paciente
 * ------------------------------------------------------------
 * Mesmo fluxo de app.js: evento -> ação -> estado -> render.
 * ============================================================ */
import { getPatient, listEncounters, createEncounter } from "./api.js";
import {
  subscribe,
  getState,
  setPatientAndEncounters,
  setEncounters,
  setLoadError,
  setSubmitting,
  setFormError,
} from "./patient-detail-state.js";
import { renderPatientSummary, renderEncounterList, renderLoading, renderLoadError, renderFormError } from "./patient-detail-render.js";

const patientId = Number(new URLSearchParams(window.location.search).get("id"));

const pageStateElement = document.querySelector("#page-state");
const pageContentElement = document.querySelector("#page-content");
const patientSummaryElement = document.querySelector("#patient-summary");
const encounterListElement = document.querySelector("#encounter-list");
const encounterFormElement = document.querySelector("#encounter-form");
const formErrorElement = document.querySelector("#form-error");
const submitButtonElement = document.querySelector("#submit-button");

function renderApp(state) {
  if (state.errorMessage) {
    pageContentElement.classList.add("d-none");
    pageStateElement.classList.remove("d-none");
    renderLoadError(state.errorMessage, pageStateElement);
    return;
  }

  if (state.isLoading) {
    pageContentElement.classList.add("d-none");
    pageStateElement.classList.remove("d-none");
    renderLoading(pageStateElement);
    return;
  }

  pageStateElement.classList.add("d-none");
  pageContentElement.classList.remove("d-none");

  renderPatientSummary(state.patient, patientSummaryElement);
  renderEncounterList(state.encounters, encounterListElement);
  renderFormError(state.formError, formErrorElement);

  submitButtonElement.disabled = state.isSubmitting;
  submitButtonElement.textContent = state.isSubmitting ? "Salvando…" : "Registrar atendimento";
}

encounterFormElement.addEventListener("submit", async (event) => {
  event.preventDefault();

  setFormError(null);
  setSubmitting(true);

  const formData = new FormData(encounterFormElement);

  try {
    await createEncounter(patientId, {
      startedAt: formData.get("startedAt"),
      chiefComplaint: formData.get("chiefComplaint"),
      notes: formData.get("notes"),
    });

    encounterFormElement.reset();
    const encounters = await listEncounters(patientId);
    setEncounters(encounters);
  } catch (error) {
    setFormError(error.message);
  } finally {
    setSubmitting(false);
  }
});

subscribe(renderApp);

async function start() {
  renderApp(getState());

  if (!Number.isInteger(patientId)) {
    setLoadError("Link inválido: nenhum paciente foi informado na URL.");
    return;
  }

  try {
    const [patient, encounters] = await Promise.all([getPatient(patientId), listEncounters(patientId)]);
    setPatientAndEncounters(patient, encounters);
  } catch (error) {
    setLoadError(error.message);
  }
}

start();
