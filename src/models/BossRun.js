/**
 * BossRun.js
 * Instancia semanal de un jefe asociada a un usuario.
 * Relaciona User (N-1) y Boss (N-1): un usuario tiene una run por semana,
 * cada run apunta a un jefe del catalogo.
 */

import mongoose from 'mongoose';

/** Estados posibles de una run */
export const BOSS_RUN_STATUSES = ['active', 'defeated', 'expired'];

const bossRunSchema = new mongoose.Schema(
  {
    /** Usuario dueno de esta run */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Jefe del catalogo al que pertenece la run */
    boss: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Boss',
      required: true,
    },
    /** Lunes (YYYY-MM-DD) de la semana de esta run */
    weekStartDate: { type: String, required: true },
    /** HP actual del jefe, decrementado al completar misiones */
    currentHP: { type: Number, required: true, min: 0 },
    /** HP inicial, copiado del catalogo para mantener el historico */
    maxHP: { type: Number, required: true, min: 1 },
    /** Estado actual de la run */
    status: { type: String, enum: BOSS_RUN_STATUSES, default: 'active' },
    /** Fecha en que paso a defeated o expired (null mientras activa) */
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Un usuario solo puede tener una run por semana
bossRunSchema.index({ user: 1, weekStartDate: 1 }, { unique: true });

export default mongoose.model('BossRun', bossRunSchema);
