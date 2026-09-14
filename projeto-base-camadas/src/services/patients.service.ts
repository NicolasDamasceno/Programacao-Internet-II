/**
 * Service de Patient -- SQL + regra de negocio. Nao conhece
 * req/res: recebe e devolve so tipos de dominio (string, number,
 * objetos simples).
 */
import { db } from "../db/database.ts";
import { ConflictError, NotFoundError } from "../errors/HttpError.ts";

type PatientRow = {
  id: number;
  name: string;
  birth_date: string;
  national_id: string;
  active: number;
  photo_path: string | null;
};

function toPatientJson(row: PatientRow) {
  return {
    id: row.id,
    name: row.name,
    birthDate: row.birth_date,
    nationalId: row.national_id,
    active: row.active === 1,
    photoUrl: row.photo_path,
  };
}

export const patientsService = {
  list() {
    const rows = db
      .prepare("SELECT id, name, birth_date, national_id, active, photo_path FROM patients ORDER BY name")
      .all() as PatientRow[];

    return rows.map(toPatientJson);
  },

  getById(id: string) {
    const row = db
      .prepare("SELECT id, name, birth_date, national_id, active, photo_path FROM patients WHERE id = ?")
      .get(id) as PatientRow | undefined;

    if (!row) throw new NotFoundError("Paciente nao encontrado.");

    return toPatientJson(row);
  },

  create(data: { name: string; birthDate: string; nationalId: string }) {
    const name = data.name.trim();
    const nationalId = data.nationalId.trim();

    // 409 Conflict diz exatamente isso: "seu pedido faz sentido,
    // mas conflita com o estado atual do recurso".
    const duplicate = db.prepare("SELECT id FROM patients WHERE national_id = ?").get(nationalId);

    if (duplicate) {
      throw new ConflictError("Ja existe um paciente com este CNS.");
    }

    const result = db
      .prepare(
        `INSERT INTO patients (name, birth_date, national_id, active)
         VALUES (?, ?, ?, 1)`
      )
      .run(name, data.birthDate, nationalId);

    const created = db
      .prepare("SELECT id, name, birth_date, national_id, active, photo_path FROM patients WHERE id = ?")
      .get(result.lastInsertRowid) as PatientRow;

    return toPatientJson(created);
  },

  setPhoto(id: string, filename: string) {
    const row = db.prepare("SELECT id FROM patients WHERE id = ?").get(id);
    if (!row) throw new NotFoundError("Paciente nao encontrado.");

    db.prepare("UPDATE patients SET photo_path = ? WHERE id = ?").run(`/uploads/${filename}`, id);

    const updated = db
      .prepare("SELECT id, name, birth_date, national_id, active, photo_path FROM patients WHERE id = ?")
      .get(id) as PatientRow;

    return toPatientJson(updated);
  },
};
