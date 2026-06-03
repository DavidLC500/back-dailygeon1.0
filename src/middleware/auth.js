/**
 * auth.js
 * Middleware de proteccion de rutas. Lee el token Bearer de la cabecera
 * Authorization, lo verifica y deja el id del usuario en req.userId.
 * Si falta o es invalido, responde 401.
 */

import { verifyToken } from '../utils/token.js';
import ApiError from '../utils/ApiError.js';

const protect = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'No autorizado: falta el token'));
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.id;
    next();
  } catch {
    next(new ApiError(401, 'No autorizado: token invalido o expirado'));
  }
};

export default protect;
