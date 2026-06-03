/**
 * Task.js
 * Modelo de mision (tarea) del jugador.
 * Prioridad, categoria y dificultad determinan la XP que otorga al completarse.
 * Pertenece a un usuario (relacion N-1 con User).
 */

import mongoose from 'mongoose';

/** Valores permitidos para los campos enumerados */
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'];
export const TASK_CATEGORIES = ['health', 'work', 'learning', 'fitness', 'general'];
export const TASK_DIFFICULTIES = ['easy', 'normal', 'hard', 'legendary'];

const taskSchema = new mongoose.Schema(
  {
    /** Usuario propietario de la mision */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Titulo breve de la mision */
    title: {
      type: String,
      required: [true, 'El titulo es obligatorio'],
      trim: true,
      maxlength: 100,
    },
    /** Descripcion opcional con mas detalle */
    description: { type: String, trim: true, maxlength: 500 },
    /** Prioridad visual mostrada con colores */
    priority: { type: String, enum: TASK_PRIORITIES, default: 'medium' },
    /** Categoria tematica para las estadisticas */
    category: { type: String, enum: TASK_CATEGORIES, default: 'general' },
    /** Dificultad que determina la xpReward */
    difficulty: { type: String, enum: TASK_DIFFICULTIES, default: 'normal' },
    /** Fecha limite de la mision */
    dueDate: { type: Date, required: true },
    /** Indica si la mision ya fue completada */
    completed: { type: Boolean, default: false },
    /** Fecha en que se completo (null si no completada) */
    completedDate: { type: Date, default: null },
    /** XP otorgada al completar la mision */
    xpReward: { type: Number, default: 20, min: 0 },
    /** Si es true, la mision se resetea diariamente */
    isDaily: { type: Boolean, default: false },
    /** Fecha/hora del recordatorio (opcional) */
    reminderTime: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Task', taskSchema);
