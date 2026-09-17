/**
 * ============================================================
 * CAMADA DE COMUNICAÇÃO
 * ------------------------------------------------------------
 * Este é o ÚNICO arquivo do frontend autorizado a chamar `fetch`.
 *
 * Por quê? Porque no dia em que a URL mudar, o servidor exigir
 * um cabeçalho de autenticação, ou o formato do erro mudar, você
 * quer abrir UM arquivo — não caçar `fetch` espalhado em cinco.
 *
 * Ninguém aqui fora precisa saber que existe HTTP. Quem chama
 * `listPatients()` recebe uma lista de pacientes. Ponto.
 * ============================================================
 */

/**
 * A fonte dos dados.
 *
 * ENCONTRO 1: apontava para um arquivo JSON estático (mock/patients.json).
 * Atividade 01 (Nível 3): trocado por "/api/patients" — a promessa que
 * o comentário original fazia — porque o contador de atendimentos do
 * cartão do paciente precisa de dados reais, vindos do banco.
 */
const PATIENTS_URL = "/api/patients";

/**
 * Busca a lista de pacientes.
 * @returns {Promise<Array<{id:number,name:string,birthDate:string,nationalId:string,active:boolean,encounterCount:number}>>}
 */
export async function listPatients() {
  const response = await fetch(PATIENTS_URL);

  // ATENÇÃO: `fetch` NÃO lança erro em 404 ou 500.
  // Ele só lança quando a rede falha (sem conexão, DNS, CORS).
  // Um 404 chega aqui como uma resposta perfeitamente "bem-sucedida".
  // Por isso a checagem de `response.ok` é obrigatória.
  if (!response.ok) {
    throw new Error(`Não foi possível carregar os pacientes (HTTP ${response.status})`);
  }

  return response.json();
}

/**
 * Busca um paciente específico.
 * @param {number} id
 */
export async function getPatient(id) {
  const response = await fetch(`/api/patients/${id}`);

  if (response.status === 404) {
    throw new Error("Paciente não encontrado.");
  }
  if (!response.ok) {
    throw new Error(`Falha ao buscar o paciente (HTTP ${response.status})`);
  }

  return response.json();
}

/**
 * Cadastra um paciente.
 *
 * Diferente do GET: precisa de method, headers e body. E o erro
 * (400 de validação, 409 de CNS duplicado) chega no contrato
 * { error: { message, statusCode, details } } -- repassamos o
 * corpo inteiro para quem chamou, sem reescrever a mensagem, para
 * que renderApiError (em errors.js) saiba o que desenhar.
 * @param {{name:string,birthDate:string,nationalId:string}} patient
 */
export async function createPatient(patient) {
  const response = await fetch(PATIENTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patient),
  });

  const body = await response.json();
  if (!response.ok) throw { apiError: body };
  return body;
}

/**
 * Envia a foto de um paciente já cadastrado.
 * @param {number} patientId
 * @param {File} file
 */
export async function uploadPatientPhoto(patientId, file) {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch(`${PATIENTS_URL}/${patientId}/photo`, {
    method: "POST",
    body: formData, // SEM Content-Type manual -- o navegador define
    // o boundary do multipart sozinho.
  });

  const body = await response.json();
  if (!response.ok) throw { apiError: body };
  return body;
}

/* ============================================================
   ATIVIDADE 01 (Nível 2) — Encounters
   ============================================================ */

/**
 * Busca os atendimentos de um paciente.
 * @param {number} patientId
 * @returns {Promise<Array<{id:number,patientId:number,startedAt:string,chiefComplaint:string,notes:string|null}>>}
 */
export async function listEncounters(patientId) {
  const response = await fetch(`/api/patients/${patientId}/encounters`);

  if (response.status === 404) {
    throw new Error("Paciente não encontrado.");
  }
  if (!response.ok) {
    throw new Error(`Falha ao buscar os atendimentos (HTTP ${response.status})`);
  }

  return response.json();
}

/**
 * Cria um atendimento para um paciente.
 * @param {number} patientId
 * @param {{startedAt:string,chiefComplaint:string,notes?:string}} encounter
 */
export async function createEncounter(patientId, encounter) {
  const response = await fetch(`/api/patients/${patientId}/encounters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(encounter),
  });

  if (!response.ok) {
    // 400 (validação) e 404 (paciente sumiu) chegam no mesmo formato:
    // { error: "mensagem" }. Repassamos a mensagem do backend, sem
    // inventar um texto genérico — quem decidiu a mensagem foi a API.
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Falha ao criar o atendimento (HTTP ${response.status})`);
  }

  return response.json();
}
