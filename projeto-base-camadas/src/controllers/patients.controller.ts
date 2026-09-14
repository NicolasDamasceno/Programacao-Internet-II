/**
 * Controller de Patient -- traduz HTTP <-> dominio. So le req,
 * chama o Service e formata a resposta. Nenhum "if" de regra de
 * negocio mora aqui.
 */
import type { Request, Response } from "express";
import { patientsService } from "../services/patients.service.ts";
import { UnprocessableEntityError } from "../errors/HttpError.ts";

export const patientsController = {
  list(_request: Request, response: Response) {
    const patients = patientsService.list();
    response.status(200).json(patients);
  },

  getById(request: Request, response: Response) {
    const patient = patientsService.getById(request.params.id as string);
    response.status(200).json(patient);
  },

  create(request: Request, response: Response) {
    const { name, birthDate, nationalId } = request.body ?? {};
    const patient = patientsService.create({ name, birthDate, nationalId });
    response.status(201).json(patient);
  },

  uploadPhoto(request: Request, response: Response) {
    if (!request.file) {
      throw new UnprocessableEntityError("Nenhum arquivo de foto foi enviado.");
    }

    const patient = patientsService.setPhoto(request.params.id as string, request.file.filename);
    response.status(200).json(patient);
  },
};
