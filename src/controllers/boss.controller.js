/**
 * boss.controller.js
 * Catalogo de jefes y la run semanal del usuario (se crea automaticamente
 * la primera vez que se consulta cada semana) mas el historial.
 */

import Boss from '../models/Boss.js';
import BossRun from '../models/BossRun.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getOrCreateWeeklyRun, getWeekStart } from '../services/boss.service.js';

/** GET /api/bosses — devuelve el catalogo de jefes por dificultad */
export const getBosses = asyncHandler(async (req, res) => {
  const bosses = await Boss.find().sort({ difficultyTier: 1 });
  res.json({ bosses });
});

/** GET /api/bosses/my-run — run de la semana actual (la crea si no existe) */
export const getMyRun = asyncHandler(async (req, res) => {
  const run = await getOrCreateWeeklyRun(req.userId);
  res.json({ run });
});

/** GET /api/bosses/history — runs de semanas anteriores (excluye la actual) */
export const getHistory = asyncHandler(async (req, res) => {
  const history = await BossRun.find({
    user: req.userId,
    weekStartDate: { $ne: getWeekStart() },
  })
    .sort({ weekStartDate: -1 })
    .limit(10)
    .populate('boss');
  res.json({ history });
});
