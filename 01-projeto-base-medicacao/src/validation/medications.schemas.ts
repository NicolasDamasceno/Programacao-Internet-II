import { z } from "zod";

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export const createMedicationSchema = z.object({
  patientName: z.string().trim().min(1, "O campo 'patientName' e obrigatorio."),
  medicationName: z.string().trim().min(1, "O campo 'medicationName' e obrigatorio."),
  dosage: z.string().trim().min(1, "O campo 'dosage' e obrigatorio."),
  route: z.string().trim().min(1, "O campo 'route' e obrigatorio."),
  scheduledAt: z
    .string()
    .regex(ISO_DATE_TIME, "O campo 'scheduledAt' e obrigatorio no formato AAAA-MM-DDTHH:MM."),
  notes: z.string().trim().optional(),
});
