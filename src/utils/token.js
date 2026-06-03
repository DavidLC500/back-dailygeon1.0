/**
 * token.js
 * Utilidades para firmar y verificar los JSON Web Tokens de sesion.
 * Centraliza el uso de JWT_SECRET y JWT_EXPIRES_IN para no repetirlo.
 */

import jwt from 'jsonwebtoken';

/** Firma un token con el id del usuario como payload */
export const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/** Verifica un token y devuelve su payload; lanza si es invalido */
export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
