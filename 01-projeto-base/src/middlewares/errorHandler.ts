
import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { HttpError, PayloadTooLargeError } from "../errors/HttpError";

export function errorHandler(err: unknown, _request: Request, response: Response, _next: NextFunction) {
  // O multer lanca MulterError (nao HttpError) quando o arquivo
  // excede o limite -- traduzimos para o mesmo formato de erro aqui.
  if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
    err = new PayloadTooLargeError("Arquivo maior que o limite permitido (2MB).");
  }

  if (err instanceof HttpError) {
    response.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
        details: err.details ?? null,
      },
    });
    return;
  }

  console.error(err);
  response.status(500).json({
    error: {
      message: "Erro interno do servidor.",
      statusCode: 500,
      details: null,
    },
  });
}
