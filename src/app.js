/**
 * app.js
 * Configura la aplicacion Express: middlewares, rutas y manejo de errores.
 * No arranca el servidor ni conecta a la BD (eso es server.js), para poder
 * reutilizar la app en tests o en otros entornos.
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import characterRoutes from './routes/character.routes.js';
import taskRoutes from './routes/task.routes.js';
import bossRoutes from './routes/boss.routes.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// --- Middlewares globales ---
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// --- Ruta de salud ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'dailygeon-api' });
});

// --- Rutas de recursos ---
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/bosses', bossRoutes);

// --- 404 y manejo de errores (siempre al final) ---
app.use(notFound);
app.use(errorHandler);

export default app;
