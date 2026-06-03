/**
 * notFound.js
 * Middleware para rutas inexistentes: responde 404 con un mensaje claro.
 */

const notFound = (req, res) => {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

export default notFound;
