/**
 * Traduz o contrato de erro da API -- { error: { message,
 * statusCode, details } } -- para o estado do formulario.
 */
import { setFormError } from "./state.js";

export function renderApiError(body) {
  const { message, details } = body.error;
  setFormError(message, details ?? {});
}
