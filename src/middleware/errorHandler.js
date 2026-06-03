/**
 * errorHandler.js
 * Manejador de errores central. Convierte cualquier error en una respuesta
 * JSON con { code, message }. El `code` es estable y lo traduce el frontend;
 * el `message` queda como texto por defecto y para depuracion.
 */

const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Error interno del servidor';
  // Codigo estable: el de ApiError, o uno generico segun el tipo de error
  let code = typeof err.code === 'string' ? err.code : 'SERVER_ERROR';

  // Errores de validacion de Mongoose
  if (err.name === 'ValidationError') {
    status = 400;
    code = 'VALIDATION';
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  // Clave duplicada (ej. email o username ya registrado) -> err.code numerico 11000
  if (err.code === 11000) {
    status = 409;
    code = 'DUPLICATE';
    message = `Ya existe un registro con ese ${Object.keys(err.keyValue).join(', ')}`;
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ code, message });
};

export default errorHandler;
