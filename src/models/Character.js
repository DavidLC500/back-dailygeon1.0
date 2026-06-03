/**
 * Character.js
 * Modelo del personaje RPG del jugador.
 * Progresa en nivel, XP y vida conforme se completan misiones.
 * Pertenece a un usuario (relacion 1-1 con User).
 */

import mongoose from 'mongoose';

/** Clases disponibles, cada una con estadisticas distintas */
export const CHARACTER_CLASSES = ['warrior', 'mage', 'rogue', 'cleric'];

const characterSchema = new mongoose.Schema(
  {
    /** Usuario propietario del personaje */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Nombre elegido por el jugador */
    name: {
      type: String,
      required: [true, 'El nombre del personaje es obligatorio'],
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    /** Clase del personaje (guerrero, mago, picaro o clerigo) */
    class: {
      type: String,
      enum: CHARACTER_CLASSES,
      required: true,
    },
    /** Nivel actual (empieza en 1) */
    level: { type: Number, default: 1, min: 1 },
    /** XP acumulada en el nivel actual */
    currentXP: { type: Number, default: 0, min: 0 },
    /** XP necesaria para subir de nivel */
    maxXP: { type: Number, default: 100, min: 1 },
    /** Puntos de vida actuales */
    health: { type: Number, default: 100, min: 0 },
    /** Puntos de vida maximos segun la clase */
    maxHealth: { type: Number, default: 100, min: 1 },
    /** Color hexadecimal del avatar en la UI */
    avatarColor: { type: String, default: '#7c3aed' },
    /** Fecha de la ultima mision completada (null si nunca) */
    lastActivityDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// Un usuario solo puede tener un personaje (evita duplicados por carrera)
characterSchema.index({ user: 1 }, { unique: true });

export default mongoose.model('Character', characterSchema);
