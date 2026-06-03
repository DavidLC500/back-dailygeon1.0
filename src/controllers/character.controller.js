/**
 * character.controller.js
 * Gestion del personaje RPG del usuario autenticado (relacion 1-1).
 */

import Character from '../models/Character.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getXPForLevel } from '../utils/xp.js';

/** POST /api/characters — crea el personaje del usuario (uno por usuario) */
export const createCharacter = asyncHandler(async (req, res) => {
  const existing = await Character.findOne({ user: req.userId });
  if (existing) throw new ApiError(409, 'El usuario ya tiene un personaje');

  const { name, class: charClass, avatarColor } = req.body;
  if (!name || !charClass) throw new ApiError(400, 'name y class son obligatorios');

  const character = await Character.create({
    user: req.userId,
    name,
    class: charClass,
    avatarColor,
    maxXP: getXPForLevel(1),
  });
  // Enlaza el personaje con su usuario (relacion 1-1)
  await User.findByIdAndUpdate(req.userId, { character: character._id });

  res.status(201).json({ character });
});

/** GET /api/characters/me — devuelve el personaje del usuario */
export const getMyCharacter = asyncHandler(async (req, res) => {
  const character = await Character.findOne({ user: req.userId });
  if (!character) throw new ApiError(404, 'Personaje no encontrado');
  res.json({ character });
});

/** PATCH /api/characters/me — actualiza nombre o color del avatar */
export const updateMyCharacter = asyncHandler(async (req, res) => {
  const { name, avatarColor } = req.body;
  const character = await Character.findOneAndUpdate(
    { user: req.userId },
    { ...(name && { name }), ...(avatarColor && { avatarColor }) },
    { new: true, runValidators: true }
  );
  if (!character) throw new ApiError(404, 'Personaje no encontrado');
  res.json({ character });
});
