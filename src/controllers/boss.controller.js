/**
 * boss.controller.js
 * Catalogo de jefes y la run semanal del usuario autenticado.
 */

import Boss from '../models/Boss.js';
import BossRun from '../models/BossRun.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

/** GET /api/bosses — devuelve el catalogo de jefes por dificultad */
export const getBosses = asyncHandler(async (req, res) => {
  const bosses = await Boss.find().sort({ difficultyTier: 1 });
  res.json({ bosses });
});

/** GET /api/bosses/my-run — devuelve la run mas reciente del usuario */
export const getMyRun = asyncHandler(async (req, res) => {
  const run = await BossRun.findOne({ user: req.userId })
    .sort({ weekStartDate: -1 })
    .populate('boss');
  if (!run) throw new ApiError(404, 'No hay run de jefe para este usuario', 'RUN_NOT_FOUND');
  res.json({ run });
});
