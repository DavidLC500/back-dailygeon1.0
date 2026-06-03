/**
 * ApiError.js
 * Error con codigo de estado HTTP. Permite lanzar errores controlados
 * desde los controladores (ej. throw new ApiError(404, 'No encontrado'))
 * que el errorHandler convierte en una respuesta JSON coherente.
 */

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export default ApiError;
