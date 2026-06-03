/**
 * task.routes.js
 * Rutas CRUD de misiones del usuario autenticado (todas protegidas).
 */

import { Router } from 'express';
import {
  getTasks, createTask, updateTask, deleteTask, completeTask,
} from '../controllers/task.controller.js';
import protect from '../middleware/auth.js';

const router = Router();

router.use(protect); // todas las rutas de misiones requieren sesion

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/complete', completeTask);

export default router;
