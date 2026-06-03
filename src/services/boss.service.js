/**
 * boss.service.js
 * Logica del jefe semanal: obtiene (o crea) la run de la semana actual para
 * un usuario y aplica dano al completar misiones. Centralizado para que los
 * controladores no dupliquen reglas de negocio.
 */

import Boss from '../models/Boss.js';
import BossRun from '../models/BossRun.js';
import ApiError from '../utils/ApiError.js';

/** Devuelve el lunes de la semana actual en formato YYYY-MM-DD */
export const getWeekStart = () => {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // 0 = lunes
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
};

/**
 * Obtiene la run de jefe de la semana actual del usuario; si no existe, la
 * crea eligiendo un jefe del catalogo (rotando por semana).
 */
export const getOrCreateWeeklyRun = async (userId) => {
  const weekStartDate = getWeekStart();
  const existing = await BossRun.findOne({ user: userId, weekStartDate }).populate('boss');
  if (existing) return existing;

  const bosses = await Boss.find().sort({ difficultyTier: 1 });
  if (!bosses.length) throw new ApiError(404, 'No hay jefes en el catalogo', 'NO_BOSSES');

  // Indice deterministico segun la semana, para rotar el jefe
  const seed = weekStartDate.split('-').reduce((acc, part) => acc + Number(part), 0);
  const boss = bosses[seed % bosses.length];

  const run = await BossRun.create({
    user: userId,
    boss: boss._id,
    weekStartDate,
    currentHP: boss.maxHP,
    maxHP: boss.maxHP,
    status: 'active',
  });
  return run.populate('boss');
};

/**
 * Aplica dano al jefe activo de la semana. Si la vida llega a 0, lo marca
 * como derrotado. Devuelve la run actualizada (o null si no hay run activa).
 */
export const applyDamage = async (userId, amount) => {
  const run = await BossRun.findOne({
    user: userId,
    weekStartDate: getWeekStart(),
    status: 'active',
  }).populate('boss');
  if (!run) return null;

  run.currentHP = Math.max(0, run.currentHP - amount);
  const defeated = run.currentHP === 0;
  if (defeated) {
    run.status = 'defeated';
    run.completedAt = new Date();
  }
  await run.save();
  return { run, defeated };
};
