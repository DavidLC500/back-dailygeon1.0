/**
 * auth.controller.js
 * Registro, login y datos del usuario autenticado.
 * Devuelve un token JWT que el frontend guarda para las rutas protegidas.
 */

import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { signToken } from '../utils/token.js';

/** POST /api/auth/register — crea una cuenta y devuelve token + usuario */
export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new ApiError(400, 'username, email y password son obligatorios');
  }

  const user = await User.create({ username, email, password });
  res.status(201).json({ token: signToken(user._id), user });
});

/** POST /api/auth/login — valida credenciales y devuelve token + usuario */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'email y password son obligatorios');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Credenciales incorrectas');
  }

  res.json({ token: signToken(user._id), user });
});

/** GET /api/auth/me — devuelve el usuario autenticado con su personaje */
export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).populate('character');
  if (!user) throw new ApiError(404, 'Usuario no encontrado');
  res.json({ user });
});
