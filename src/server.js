/**
 * server.js
 * Punto de arranque: carga el entorno, conecta a MongoDB y levanta la app.
 */

import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
});
