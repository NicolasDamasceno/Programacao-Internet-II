/**
 * ============================================================
 * Painel de Medicacao - Servidor HTTP
 * ============================================================
 * Isto e um "Hello World": so a rota de saude e o servidor
 * estatico. As quatro rotas da atividade (listar, criar, obter
 * um, remover) ainda nao existem — sao o que voce vai construir.
 */
import express from "express";
import { db } from "./database";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

// ============================================================
// PASSO 1 — GET /api/medications

type MedicationRow = {id: number, patient_name: string, medication_name: string, dosage: string, route: string, scheduled_at: string, notes: string};

function toMedicationJson(row: MedicationRow) {
  return {
    id: row.id,
    patientName: row.patient_name,
    medicationName: row.medication_name,
    dosage: row.dosage,
    route: row.route,
    scheduledAt: row.scheduled_at,
    notes: row.notes
  };
}

db.prepare("SELECT * FROM medication_orders").all()
app.get('/api/medications', (_request, response) => {
  const rows = db.prepare(
    `SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes
    FROM medication_orders
    ORDER BY scheduled_at ASC`
  ).all() as MedicationRow[];
  response.status(200).json(rows.map(toMedicationJson));
});
//   Nao esqueca de traduzir snake_case -> camelCase antes de responder.
// ============================================================

// ============================================================
// PASSO 3 — POST /api/medications
//   valide patientName, medicationName, dosage, route, scheduledAt
//   INSERT parametrizado -> responda 201 com o registro criado
// ============================================================

function validateMedicationInput(input: any): string | null {
  if (!input.patientName || typeof input.patientName !== "string") {
    return "Nome do Paciente é obrigatório e deve ser uma string";
  }
  if (!input.medicationName || typeof input.medicationName !== "string") {
    return "Nome da Medicação é obrigatório e deve ser uma string";
  }
  if (!input.dosage || typeof input.dosage !== "string") {
    return "Dosagem é obrigatória e deve ser uma string";
  }
  if (!input.route || typeof input.route !== "string") {
    return "Rota é obrigatória e deve ser uma string";
  }
  if (!input.scheduledAt || typeof input.scheduledAt !== "string") {
    return "Data e hora do agendamento é obrigatória e deve ser uma string";
  }
  if (input.notes && typeof input.notes !== "string") {
    return "Notas devem ser uma string se fornecidas";
  }
  return null;
}

function isBlank(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

app.post('/api/medications', (request, response) => {
  const problem = validateMedicationInput(request.body);
  if (problem) {
    response.status(400).json({ error: problem });
    return;
  }

  const { patientName, medicationName, dosage, route, scheduledAt, notes } = request.body;

  const result = db
    .prepare(
      `INSERT INTO medication_orders
    (patient_name, medication_name, dosage, route, scheduled_at, notes)
    VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      patientName,
      medicationName,
      dosage,
      route,
      scheduledAt,
      isBlank(notes) ? null : notes.trim(),
    );

  const newMedicationId = result.lastInsertRowid as number;
  const newMedicationRow = db.prepare(
    `SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes
    FROM medication_orders
    WHERE id = ?`
  ).get(newMedicationId) as MedicationRow;

  response.status(201).json(toMedicationJson(newMedicationRow));
});
// ============================================================
// PASSO 4 — GET /api/medications/:id
//   db.prepare("SELECT ... WHERE id = ?").get(id)
//   undefined -> 404
// ============================================================
app.get('/api/medications/:id', (request, response) => {
  const row = db.prepare(
    `SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes
    FROM medication_orders where id = ?`
  ).get(request.params.id) as MedicationRow | undefined;

  if(!row){
    response.status(404).json({error: 'Prescrição não encontrada.'});
    return;
  }
  response.status(200).json(toMedicationJson(row));
});

// ============================================================
// PASSO 5 — DELETE /api/medications/:id
//   db.prepare("DELETE FROM medication_orders WHERE id = ?").run(id)
//   responda 204, sem corpo
// ============================================================
app.delete('/api/medications/:id', (request, response) => {
  const existing = db
    .prepare('SELECT id FROM medication_orders WHERE id = ?')
    .get(request.params.id);
  
  if (!existing) {
    response.status(404).json({ error: 'Prescrição não encontrada.' });
    return;
  }

  db.prepare('DELETE FROM medication_orders WHERE id = ?').run(request.params.id);

  response.status(204).send();
});


app.listen(PORT, () => {
  console.log(`Painel de Medicacao no ar em http://localhost:${PORT}`);
});
