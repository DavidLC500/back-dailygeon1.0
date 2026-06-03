/**
 * errorHandler.js
 * Manejador de errores central. Convierte cualquier error (incluido ApiError
 * y los errores de validacion de Mongoose) en una respuesta JSON coherente.
 */

const errorHandler = (err, req, res, next) => {
  // Estado: el de ApiError, 400 para validacion de Mongoose, o 500 por defecto
  let status = err.status || 500;
  let message = err.message || 'Error interno del servidor';

  // Errores de validacion de Mongoose
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  // Clave duplicada (ej. email o username ya registrado)
  if (err.code === 11000) {
    status = 409;
    message = `Ya existe un registro con ese ${Object.keys(err.keyValue).join(', ')}`;
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ message });
};

export default errorHandler;
