/**
 * Service de Encounter -- SQL + regra de negocio.
 */
import { db } from "../db/database.ts";
import { BadRequestError, NotFoundError } from "../errors/HttpError.ts";

type EncounterRow = {
  id: number;
  patient_id: number;
  started_at: string;
  chief_complaint: string;
  notes: string | null;
};

function toEncounterJson(row: EncounterRow) {
  return {
    id: row.id,
    patientId: row.patient_id,
    startedAt: row.started_at,
    chiefComplaint: row.chief_complaint,
    notes: row.notes,
  };
}

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim() === "";
}

function patientExists(patientId: string): boolean {
  return db.prepare("SELECT 1 FROM patients WHERE id = ?").get(patientId) !== undefined;
}

export const encountersService = {
  list(patientId: string) {
    if (!patientExists(patientId)) {
      throw new NotFoundError("Paciente nao encontrado.");
    }

    const rows = db
      .prepare(
        `SELECT id, patient_id, started_at, chief_complaint, notes
           FROM encounters
          WHERE patient_id = ?
          ORDER BY started_at DESC`
      )
      .all(patientId) as EncounterRow[];

    return rows.map(toEncounterJson);
  },

  create(patientId: string, data: { startedAt: string; chiefComplaint: string; notes?: string }) {
    if (!patientExists(patientId)) {
      throw new NotFoundError("Paciente nao encontrado.");
    }

    if (isBlank(data.chiefComplaint)) {
      throw new BadRequestError("O campo 'chiefComplaint' e obrigatorio.");
    }
    if (isBlank(data.startedAt) || !ISO_DATE_TIME.test(data.startedAt)) {
      throw new BadRequestError("O campo 'startedAt' e obrigatorio no formato AAAA-MM-DDTHH:MM.");
    }

    const result = db
      .prepare(
        `INSERT INTO encounters (patient_id, started_at, chief_complaint, notes)
         VALUES (?, ?, ?, ?)`
      )
      .run(patientId, data.startedAt, data.chiefComplaint.trim(), isBlank(data.notes) ? null : data.notes!.trim());

    const created = db
      .prepare(
        `SELECT id, patient_id, started_at, chief_complaint, notes
           FROM encounters WHERE id = ?`
      )
      .get(result.lastInsertRowid) as EncounterRow;

    return toEncounterJson(created);
  },
};
