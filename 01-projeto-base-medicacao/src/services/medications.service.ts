/**
 * Service de Medication -- SQL + regra de negocio. Nao conhece
 * req/res: recebe e devolve so tipos de dominio (string, number,
 * objetos simples).
 */
import { db } from "../database";
import { NotFoundError } from "../errors/HttpError";

type MedicationRow = {
  id: number;
  patient_name: string;
  medication_name: string;
  dosage: string;
  route: string;
  scheduled_at: string;
  notes: string | null;
};

function toMedicationJson(row: MedicationRow) {
  return {
    id: row.id,
    patientName: row.patient_name,
    medicationName: row.medication_name,
    dosage: row.dosage,
    route: row.route,
    scheduledAt: row.scheduled_at,
    notes: row.notes,
  };
}

function isBlank(value: string | undefined): boolean {
  return !value || value.trim() === "";
}

export const medicationsService = {
  list() {
    const rows = db
      .prepare(
        `SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes
           FROM medication_orders
          ORDER BY scheduled_at ASC`
      )
      .all() as MedicationRow[];

    return rows.map(toMedicationJson);
  },

  getById(id: string) {
    const row = db
      .prepare(
        `SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes
           FROM medication_orders WHERE id = ?`
      )
      .get(id) as MedicationRow | undefined;

    if (!row) throw new NotFoundError("Prescricao nao encontrada.");

    return toMedicationJson(row);
  },

  create(data: {
    patientName: string;
    medicationName: string;
    dosage: string;
    route: string;
    scheduledAt: string;
    notes?: string;
  }) {
    const result = db
      .prepare(
        `INSERT INTO medication_orders
           (patient_name, medication_name, dosage, route, scheduled_at, notes)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.patientName,
        data.medicationName,
        data.dosage,
        data.route,
        data.scheduledAt,
        isBlank(data.notes) ? null : data.notes!.trim()
      );

    const created = db
      .prepare(
        `SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes
           FROM medication_orders WHERE id = ?`
      )
      .get(result.lastInsertRowid) as MedicationRow;

    return toMedicationJson(created);
  },

  remove(id: string) {
    const existing = db.prepare("SELECT id FROM medication_orders WHERE id = ?").get(id);
    if (!existing) throw new NotFoundError("Prescricao nao encontrada.");

    db.prepare("DELETE FROM medication_orders WHERE id = ?").run(id);
  },
};
