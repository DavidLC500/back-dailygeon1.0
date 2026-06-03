/**
 * asyncHandler.js
 * Envuelve un controlador asincrono para capturar sus errores y reenviarlos
 * al manejador de errores central, evitando repetir try/catch en cada ruta.
 */

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
