/**
 * Orquestracao -- PRONTA. Liga os elementos do DOM as acoes de
 * estado + api. Nenhuma logica de negocio mora aqui.
 */
import { listPatients, createPatient, uploadPatientPhoto } from "./api.js";
import { state, setPatients, addPatient, updatePatient, setFormError, clearFormError, setPreviewUrl, clearPreviewUrl } from "./state.js";
import { render } from "./render.js";
import { renderApiError } from "./errors.js";

async function init() {
  try {
    const patients = await listPatients();
    setPatients(patients);
  } catch (err) {
    setFormError(err.message ?? "Falha ao carregar pacientes.");
  }
  render();
}

document.getElementById("photo").addEventListener("change", (event) => {
  const file = event.target.files[0];
  setPreviewUrl(file ? URL.createObjectURL(file) : null);
  render();
});

document.getElementById("patient-form").addEventListener("submit", async (event) => {
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
  render();
});

init();
