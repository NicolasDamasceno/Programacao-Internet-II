/**
 * ============================================================
 * Mini-Prontuario - Servidor HTTP
 * ============================================================
 * Esta semana o servidor e PROPOSITALMENTE simples:
 * um unico arquivo, sem camadas, sem arquitetura.
 * O objetivo e enxergar o HTTP acontecendo.
 *
 * A separacao em camadas chega na Semana 03. Ate la, o que
 * queremos e que voce saiba exatamente o que cada linha faz.
 */
import express from "express";
import { db } from "./database";

const app = express();
const PORT = 3000;

// ------------------------------------------------------------
// MIDDLEWARES - executam ANTES das rotas, em ordem
// ------------------------------------------------------------

// Le o corpo da requisicao quando o Content-Type e application/json
// e coloca o resultado em req.body.
// SEM ESTA LINHA, req.body vem `undefined`. Erro numero 1 da turma.
app.use(express.json());

// Serve os arquivos de public/ como conteudo estatico.
// Por isso o frontend e a API vivem na MESMA origem (localhost:3000)
// e nao precisamos falar de CORS ainda.
app.use(express.static("public"));

// ------------------------------------------------------------
// ROTAS
// ------------------------------------------------------------

/** Rota de saude: serve para saber se o servidor esta de pe. */
app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

// ============================================================
// TODO 1 (Encontro 2, Pratica 1) — leitura implementada na
// Atividade 01 (Nivel 3), porque o contador de atendimentos do
// cartao do paciente precisa de uma lista vinda do banco de
// verdade. A escrita (POST, TODO 2) continua pendente.
// ============================================================
app.get("/api/patients", (_request, response) => {
  const patients = db
    .prepare(
      `SELECT p.id, p.name, p.birth_date AS birthDate, p.national_id AS nationalId, p.active,
              COUNT(e.id) AS encounterCount
       FROM patients p
       LEFT JOIN encounters e ON e.patient_id = p.id
       GROUP BY p.id
       ORDER BY p.name`
    )
    .all() as Array<{
    id: number;
    name: string;
    birthDate: string;
    nationalId: string;
    active: number;
    encounterCount: number;
  }>;

  response.json(patients.map((patient) => ({ ...patient, active: Boolean(patient.active) })));
});

// ============================================================
// TODO 2 (Encontro 2, Pratica 2)
// POST /api/patients
//   - leia req.body
//   - valide: name obrigatorio (texto nao vazio)
//              birthDate obrigatorio no formato AAAA-MM-DD
//              nationalId obrigatorio
//   - se invalido:  400  { "error": "mensagem util" }
//   - se valido:    201  com o paciente criado
// ============================================================

// ============================================================
// TODO 3 (Encontro 2, Pratica 3)
// Troque o array em memoria pelo banco:
//   import { db } from "./database";
//   const rows = db.prepare("SELECT ... FROM patients ORDER BY name").all();
// E crie GET /api/patients/:id devolvendo 404 quando nao existir.
// ============================================================

// ============================================================
// ATIVIDADE 01 - Encounters (atendimentos)
// Rotas aninhadas dentro do paciente: um atendimento nao existe
// sozinho, ele sempre pertence a alguem.
// ============================================================

// GET /api/patients/:id isolado do restante do TODO 3 (que ainda
// depende do TODO 1/2 para a listagem e a criacao). A tela de
// detalhe do paciente (Nivel 2 da atividade) precisa so desta parte.
app.get("/api/patients/:id", (request, response) => {
  const patient = db
    .prepare(
      `SELECT id, name, birth_date AS birthDate, national_id AS nationalId, active
       FROM patients
       WHERE id = ?`
    )
    .get(Number(request.params.id)) as
    | { id: number; name: string; birthDate: string; nationalId: string; active: number }
    | undefined;

  if (!patient) {
    response.status(404).json({ error: "Paciente nao encontrado." });
    return;
  }

  response.json({ ...patient, active: Boolean(patient.active) });
});

/** AAAA-MM-DDTHH:MM — so a forma, sem checar se a data existe de verdade. */
const STARTED_AT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** Le o :id da URL e confirma que o paciente existe. Devolve null se nao existir. */
function findPatientId(idParam: string): number | null {
  const patientId = Number(idParam);
  const patient = db.prepare("SELECT id FROM patients WHERE id = ?").get(patientId);
  return patient ? patientId : null;
}

app.get("/api/patients/:id/encounters", (request, response) => {
  const patientId = findPatientId(request.params.id);

  if (patientId === null) {
    response.status(404).json({ error: "Paciente nao encontrado." });
    return;
  }

  const encounters = db
    .prepare(
      `SELECT id, patient_id AS patientId, started_at AS startedAt,
              chief_complaint AS chiefComplaint, notes
       FROM encounters
       WHERE patient_id = ?
       ORDER BY started_at DESC`
    )
    .all(patientId);

  response.json(encounters);
});

app.post("/api/patients/:id/encounters", (request, response) => {
  const patientId = findPatientId(request.params.id);

  if (patientId === null) {
    response.status(404).json({ error: "Paciente nao encontrado." });
    return;
  }

  const { startedAt, chiefComplaint, notes } = request.body ?? {};

  if (typeof chiefComplaint !== "string" || chiefComplaint.trim() === "") {
    response.status(400).json({ error: "chiefComplaint e obrigatorio." });
    return;
  }

  if (typeof startedAt !== "string" || !STARTED_AT_PATTERN.test(startedAt)) {
    response.status(400).json({ error: "startedAt precisa estar no formato AAAA-MM-DDTHH:MM." });
    return;
  }

  // string vazia (ou ausente) vira null: "nao existe", nao "existe e e nada".
  const notesValue = typeof notes === "string" && notes.trim() !== "" ? notes : null;

  const result = db
    .prepare(
      `INSERT INTO encounters (patient_id, started_at, chief_complaint, notes)
       VALUES (?, ?, ?, ?)`
    )
    .run(patientId, startedAt, chiefComplaint.trim(), notesValue);

  const created = db
    .prepare(
      `SELECT id, patient_id AS patientId, started_at AS startedAt,
              chief_complaint AS chiefComplaint, notes
       FROM encounters
       WHERE id = ?`
    )
    .get(result.lastInsertRowid);

  response.status(201).json(created);
});

// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Mini-Prontuario no ar em http://localhost:${PORT}`);
});
