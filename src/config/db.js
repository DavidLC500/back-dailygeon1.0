/**
 * db.js
 * Conexion unica a MongoDB mediante Mongoose.
 * Lee la cadena de conexion de la variable de entorno MONGO_URI.
 * Si la conexion falla, corta el proceso: sin BD no tiene sentido arrancar.
 */

import mongoose from 'mongoose';
import dns from 'dns';

/**
 * Abre la conexion con MongoDB.
 * Devuelve la instancia de conexion ya establecida.
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Falta la variable MONGO_URI en el .env');
    process.exit(1);
  }

  // Algunas redes no resuelven los registros SRV de mongodb+srv://
  // (error querySrv ECONNREFUSED). Solo en ese caso forzamos un DNS publico.
  if (uri.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB conectado: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error.message);
    process.exit(1);
  }
};
