
import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/HttpError";

export function errorHandler(err: unknown, _request: Request, response: Response, _next: NextFunction) {
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
