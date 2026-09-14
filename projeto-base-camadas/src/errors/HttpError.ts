
export class HttpError extends Error {
  statusCode: number;
  details: unknown;

  constructor(statusCode: number, message: string, details: unknown = null) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Requisicao invalida.", details: unknown = null) {
    super(400, message, details);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Recurso nao encontrado.", details: unknown = null) {
    super(404, message, details);
  }
}

export class ConflictError extends HttpError {
  constructor(message = "O recurso ja existe.", details: unknown = null) {
    super(409, message, details);
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message = "Nao foi possivel processar a requisicao.", details: unknown = null) {
    super(422, message, details);
  }
}

export class PayloadTooLargeError extends HttpError {
  constructor(message = "Arquivo maior que o limite permitido.", details: unknown = null) {
    super(413, message, details);
  }
}
