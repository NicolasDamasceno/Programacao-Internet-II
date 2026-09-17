import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const createPatientSchema = z.object({
  name: z.string().trim().min(1, "O campo 'name' e obrigatorio e nao pode ser vazio."),
  birthDate: z
    .string()
    .regex(ISO_DATE, "O campo 'birthDate' e obrigatorio e deve estar no formato AAAA-MM-DD."),
  nationalId: z.string().trim().min(1, "O campo 'nationalId' e obrigatorio."),
});
