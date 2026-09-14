/**
 * Middleware generico de validacao: recebe um schema Zod e devolve
 * um middleware Express. Em caso de falha, lanca BadRequestError
 * com os campos invalidos em `details` -- o errorHandler cuida do
 * resto.
 */
import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { BadRequestError } from "../errors/HttpError.ts";

export function validate(schema: ZodType) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      throw new BadRequestError("Dados invalidos.", result.error.flatten().fieldErrors);
    }

    request.body = result.data;
    next();
  };
}
