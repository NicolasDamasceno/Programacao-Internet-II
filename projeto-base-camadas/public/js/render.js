/**
 * Renderizacao -- PRONTA. Uma unica funcao render() le o estado
 * inteiro e redesenha a lista. Nada de manipulacao pontual de DOM
 * espalhada pelo projeto.
 */
import { state } from "./state.js";

export function render() {
  renderFormError();
  renderPatientList();
  renderPhotoPreview();
}

function renderFormError() {
  const container = document.getElementById("form-error-container");
  container.innerHTML = "";
  if (!state.formError) return;

  const box = document.createElement("div");
  box.className = "form-error";
  box.textContent = state.formError;
  container.appendChild(box);
}

function renderPatientList() {
  const list = document.getElementById("patient-list");
  list.innerHTML = "";

  for (const patient of state.patients) {
    const li = document.createElement("li");
    li.className = "patient-card";
    li.dataset.patientId = patient.id;

    const photoSrc = patient.photoUrl || "";
    li.innerHTML = `
      ${photoSrc ? `<img class="patient-card__photo" src="${photoSrc}" alt="" />` : `<div class="patient-card__photo"></div>`}
      <div>
        <p class="patient-card__name">${patient.name}</p>
        <p class="patient-card__meta">CNS ${patient.nationalId} · ${patient.active ? "ativo" : "inativo"}</p>
      </div>
    `;
    list.appendChild(li);
  }
}

function renderPhotoPreview() {
  const container = document.getElementById("photo-preview-container");
  container.innerHTML = "";
  if (!state.previewUrl) return;

  const img = document.createElement("img");
  img.className = "photo-preview";
  img.src = state.previewUrl;
  img.alt = "Preview da foto selecionada";
  container.appendChild(img);
}
