/**
 * ============================================================
 * ORQUESTRAÇÃO
 * ------------------------------------------------------------
 * Este arquivo é o maestro. Ele não guarda estado e não desenha
 * nada sozinho. Ele apenas:
 *
 *   1. liga eventos do usuário às AÇÕES do estado
 *   2. manda a tela ser redesenhada quando o estado muda
 *   3. dispara a carga inicial dos dados
 *
 * O fluxo é sempre o mesmo, e sempre em um sentido só:
 *
 *   evento  ->  ação  ->  estado  ->  render  ->  tela
 *
 * Nunca o contrário. A tela nunca é a fonte da verdade.
 * ============================================================
 */
import { listPatients, createPatient, uploadPatientPhoto } from "./api.js";
import {
  subscribe,
  getState,
  setPatients,
  setSearchTerm,
  setOnlyActive,
  setError,
  addPatient,
  updatePatient,
  setFormError,
  clearFormError,
  setPreviewUrl,
  clearPreviewUrl,
} from "./state.js";
import { renderPatientList, renderCounter, renderLoading, renderError, renderFormError, renderPhotoPreview } from "./render.js";
import { renderApiError } from "./errors.js";

/* --- Os elementos que existem na página. Buscamos UMA vez. --- */
const searchInput = document.querySelector("#search-input");
const onlyActiveInput = document.querySelector("#only-active-input");
const patientListElement = document.querySelector("#patient-list");
const resultCounterElement = document.querySelector("#result-counter");
const patientFormElement = document.querySelector("#patient-form");
const photoInput = document.querySelector("#photo");
const formErrorContainer = document.querySelector("#form-error-container");
const photoPreviewContainer = document.querySelector("#photo-preview-container");

/**
 * A ÚNICA função que desenha a tela inteira.
 * Ela é chamada toda vez que o estado muda — e apenas por isso.
 */
function renderApp(state) {
  renderFormError(state.formError, formErrorContainer);
  renderPhotoPreview(state.previewUrl, photoPreviewContainer);

  if (state.errorMessage) {
    renderError(state.errorMessage, patientListElement);
    resultCounterElement.textContent = "";
    return;
  }

  if (state.isLoading) {
    renderLoading(patientListElement);
    resultCounterElement.textContent = "";
    return;
  }

  renderPatientList(state.visiblePatients, state.searchTerm, patientListElement);
  renderCounter(state.visiblePatients.length, state.patients.length, resultCounterElement);
}

/* --- Eventos do usuário viram AÇÕES, nunca alterações de DOM --- */
searchInput.addEventListener("input", (event) => {
  setSearchTerm(event.target.value);
});

onlyActiveInput.addEventListener("change", (event) => {
  setOnlyActive(event.target.checked);
});

photoInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  setPreviewUrl(file ? URL.createObjectURL(file) : null);
});

patientFormElement.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearFormError();

  const form = event.target;
  const payload = {
    name: form.name.value,
    birthDate: form.birthDate.value,
    nationalId: form.nationalId.value,
  };
  const photoFile = form.photo.files[0];

  try {
    const created = await createPatient(payload);
    addPatient(created);
    form.reset();
    clearPreviewUrl();

    if (photoFile) {
      try {
        const withPhoto = await uploadPatientPhoto(created.id, photoFile);
        updatePatient(withPhoto);
      } catch (uploadErr) {
        if (uploadErr.apiError) renderApiError(uploadErr.apiError);
      }
    }
  } catch (err) {
    if (err.apiError) {
      renderApiError(err.apiError);
    } else {
      setFormError("Falha ao cadastrar paciente.");
    }
  }
});

/* --- Sempre que o estado mudar, a tela é redesenhada --- */
subscribe(renderApp);

/* --- Carga inicial --- */
async function start() {
  renderApp(getState());

  try {
    const patients = await listPatients();
    setPatients(patients);
  } catch (error) {
    setError(error.message);
  }
}

start();
