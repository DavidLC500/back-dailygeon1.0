/**
 * boss.routes.js
 * Rutas de jefes: catalogo publico y la run del usuario (protegida).
 */

import { Router } from 'express';
import { getBosses, getMyRun, getHistory } from '../controllers/boss.controller.js';
import protect from '../middleware/auth.js';

const router = Router();

router.get('/', getBosses);
router.get('/my-run', protect, getMyRun);
router.get('/history', protect, getHistory);

export default router;
