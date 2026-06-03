/**
 * ApiError.js
 * Error con codigo de estado HTTP y un codigo de error estable.
 * El `code` (ej. 'INVALID_CREDENTIALS') permite que el frontend traduzca
 * el mensaje segun el idioma, sin depender del texto del backend.
 *
 * Uso: throw new ApiError(401, 'Credenciales incorrectas', 'INVALID_CREDENTIALS')
 */

class ApiError extends Error {
  constructor(status, message, code = 'ERROR') {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiError';
  }
}

export default ApiError;
