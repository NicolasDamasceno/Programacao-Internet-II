/**
 * Controller de Encounter -- traduz HTTP <-> dominio.
 * O id do paciente vem de req.params.id (mergeParams no router).
 */
import type { Request, Response } from "express";
import { encountersService } from "../services/encounters.service.ts";

export const encountersController = {
  list(request: Request, response: Response) {
    const encounters = encountersService.list(request.params.id as string);
    response.status(200).json(encounters);
  },

  create(request: Request, response: Response) {
    const { startedAt, chiefComplaint, notes } = request.body ?? {};
    const encounter = encountersService.create(request.params.id as string, { startedAt, chiefComplaint, notes });
    response.status(201).json(encounter);
  },
};
