/**
 * task.controller.js
 * CRUD de misiones del usuario autenticado y completado con recompensa de XP.
 * Todas las operaciones filtran por req.userId para garantizar la propiedad.
 */

import Task from '../models/Task.js';
import Character from '../models/Character.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getXPReward, calculateLevelUp } from '../utils/xp.js';

/** GET /api/tasks — lista las misiones del usuario (mas recientes primero) */
export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json({ tasks });
});

/** POST /api/tasks — crea una mision; la XP se deriva de la dificultad */
export const createTask = asyncHandler(async (req, res) => {
  const { title, dueDate, difficulty = 'normal' } = req.body;
  if (!title || !dueDate) throw new ApiError(400, 'title y dueDate son obligatorios');

  const task = await Task.create({
    ...req.body,
    user: req.userId,
    xpReward: getXPReward(difficulty),
  });
  res.status(201).json({ task });
});

/** PATCH /api/tasks/:id — actualiza una mision propia */
export const updateTask = asyncHandler(async (req, res) => {
  // No permite cambiar el dueno
  const { user, ...updates } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    updates,
    { new: true, runValidators: true }
  );
  if (!task) throw new ApiError(404, 'Mision no encontrada');
  res.json({ task });
});

/** DELETE /api/tasks/:id — elimina una mision propia */
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!task) throw new ApiError(404, 'Mision no encontrada');
  res.json({ message: 'Mision eliminada' });
});

/** POST /api/tasks/:id/complete — completa la mision y otorga XP al personaje */
export const completeTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.userId });
  if (!task) throw new ApiError(404, 'Mision no encontrada');
  if (task.completed) throw new ApiError(400, 'La mision ya estaba completada');

  task.completed = true;
  task.completedDate = new Date();
  await task.save();

  // Aplica la XP al personaje y resuelve posibles subidas de nivel
  const character = await Character.findOne({ user: req.userId });
  let levelUp = null;
  if (character) {
    const result = calculateLevelUp(
      character.level,
      character.currentXP,
      character.maxXP,
      task.xpReward
    );
    character.level = result.newLevel;
    character.currentXP = result.newCurrentXP;
    character.maxXP = result.newMaxXP;
    character.lastActivityDate = new Date();
    await character.save();
    levelUp = result.leveledUp ? { levelsGained: result.levelsGained, newLevel: result.newLevel } : null;
  }

  res.json({ task, xpGained: task.xpReward, levelUp });
});
