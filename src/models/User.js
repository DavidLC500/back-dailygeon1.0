/**
 * User.js
 * Modelo de usuario: la entidad de autenticacion de Dailygeon.
 * La contrasena se hashea con bcrypt antes de guardarse (nunca en texto plano).
 * Cada usuario tiene un personaje RPG asociado (relacion 1-1 con Character).
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    /** Nombre de usuario visible, unico en la plataforma */
    username: {
      type: String,
      required: [true, 'El nombre de usuario es obligatorio'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    /** Correo electronico, unico, usado para iniciar sesion */
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    /** Contrasena hasheada con bcrypt */
    password: {
      type: String,
      required: [true, 'La contrasena es obligatoria'],
      minlength: 6,
    },
    /** Personaje RPG asociado a este usuario (relacion 1-1) */
    character: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Character',
      default: null,
    },
  },
  { timestamps: true }
);

// Hashea la contrasena solo si es nueva o ha cambiado, antes de guardar
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/** Compara una contrasena en texto plano con el hash almacenado */
userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

// Oculta la contrasena al serializar el documento a JSON
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
