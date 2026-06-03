/**
 * character.routes.js
 * Rutas del personaje del usuario autenticado (todas protegidas).
 */

import { Router } from 'express';
import {
  createCharacter, getMyCharacter, updateMyCharacter,
} from '../controllers/character.controller.js';
import protect from '../middleware/auth.js';

const router = Router();

router.use(protect); // todas las rutas de personaje requieren sesion

router.post('/', createCharacter);
router.get('/me', getMyCharacter);
router.patch('/me', updateMyCharacter);

export default router;
