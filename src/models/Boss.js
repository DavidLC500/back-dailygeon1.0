/**
 * Boss.js
 * Modelo del catalogo de jefes semanales.
 * Es un registro fijo (catalogo) del que cada semana se instancia una
 * BossRun por usuario. No depende de ningun usuario.
 */

import mongoose from 'mongoose';

const bossSchema = new mongoose.Schema(
  {
    /** Slug estable que identifica al jefe (ej. "goblin-procrastinador") */
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    /** Nombre visible del jefe */
    name: {
      type: String,
      required: [true, 'El nombre del jefe es obligatorio'],
      trim: true,
    },
    /** Puntos de vida con los que arranca la run */
    maxHP: { type: Number, required: true, min: 1 },
    /** Emoji que lo representa */
    emoji: { type: String, default: '👾' },
    /** Descripcion narrativa breve */
    description: { type: String, trim: true, maxlength: 300 },
    /** XP otorgada al derrotarlo */
    rewardXP: { type: Number, default: 100, min: 0 },
    /** Posicion en la rotacion segun dificultad (1 = mas facil) */
    difficultyTier: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

export default mongoose.model('Boss', bossSchema);
