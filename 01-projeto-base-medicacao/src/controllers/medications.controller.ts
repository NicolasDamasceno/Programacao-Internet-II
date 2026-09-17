/**
 * Controller de Medication -- traduz HTTP <-> dominio. So le req,
 * chama o Service e formata a resposta. Nenhum "if" de regra de
 * negocio mora aqui.
 */
import type { Request, Response } from "express";
import { medicationsService } from "../services/medications.service";

export const medicationsController = {
  list(_request: Request, response: Response) {
    const medications = medicationsService.list();
    response.status(200).json(medications);
  },

  getById(request: Request, response: Response) {
    const medication = medicationsService.getById(request.params.id as string);
    response.status(200).json(medication);
  },

  create(request: Request, response: Response) {
    const { patientName, medicationName, dosage, route, scheduledAt, notes } = request.body ?? {};
    const medication = medicationsService.create({ patientName, medicationName, dosage, route, scheduledAt, notes });
    response.status(201).json(medication);
  },

  remove(request: Request, response: Response) {
    medicationsService.remove(request.params.id as string);
    response.status(204).send();
  },
};
