/**
 * seed.js
 * Siembra la base de datos a partir de los CSV de /data.
 * Lee cada fichero con el modulo fs, parsea con csv-parse y resuelve las
 * relaciones (email -> usuario, slug -> jefe) antes de insertar.
 * Vacia las colecciones antes de sembrar para que sea idempotente.
 *
 * Uso: npm run seed   (requiere MONGO_URI en el .env)
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { parse } from 'csv-parse/sync';

import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Character from '../src/models/Character.js';
import Task from '../src/models/Task.js';
import Boss from '../src/models/Boss.js';
import BossRun from '../src/models/BossRun.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

/** Lee un CSV de /data con fs y lo devuelve como array de objetos */
const readCsv = (name) => {
  const content = fs.readFileSync(path.join(DATA_DIR, `${name}.csv`), 'utf8');
  return parse(content, { columns: true, skip_empty_lines: true, trim: true });
};

/** Conversores de los strings del CSV a tipos reales */
const toNum = (v) => (v === '' || v == null ? 0 : Number(v));
const toBool = (v) => ['true', '1', 'verdadero'].includes(String(v).trim().toLowerCase());
const toDate = (v) => (v ? new Date(v) : null);

const seed = async () => {
  await connectDB();
  console.log('Vaciando colecciones...');
  await Promise.all([
    User.deleteMany({}),
    Character.deleteMany({}),
    Task.deleteMany({}),
    Boss.deleteMany({}),
    BossRun.deleteMany({}),
  ]);

  // 1) Usuarios: create() ejecuta el hook que hashea la contrasena
  const usersCsv = readCsv('users');
  const users = await User.create(usersCsv);
  const userByEmail = new Map(users.map((u) => [u.email, u]));
  console.log(`Usuarios insertados: ${users.length}`);

  // 2) Jefes del catalogo
  const bossesCsv = readCsv('bosses').map((b) => ({
    ...b,
    maxHP: toNum(b.maxHP),
    rewardXP: toNum(b.rewardXP),
    difficultyTier: toNum(b.difficultyTier),
  }));
  const bosses = await Boss.insertMany(bossesCsv);
  const bossBySlug = new Map(bosses.map((b) => [b.slug, b]));
  console.log(`Jefes insertados: ${bosses.length}`);

  // 3) Personajes: resuelve el usuario y enlaza User.character (relacion 1-1)
  const charactersCsv = readCsv('characters');
  const characterDocs = charactersCsv.map((c) => ({
    user: userByEmail.get(c.userEmail)._id,
    name: c.name,
    class: c.class,
    level: toNum(c.level),
    currentXP: toNum(c.currentXP),
    maxXP: toNum(c.maxXP),
    health: toNum(c.health),
    maxHealth: toNum(c.maxHealth),
    avatarColor: c.avatarColor,
  }));
  const characters = await Character.insertMany(characterDocs);
  // Enlaza cada usuario con su personaje
  await Promise.all(
    characters.map((ch) => User.findByIdAndUpdate(ch.user, { character: ch._id }))
  );
  console.log(`Personajes insertados: ${characters.length}`);

  // 4) Misiones: resuelve el usuario por email
  const tasksCsv = readCsv('tasks');
  const taskDocs = tasksCsv.map((t) => ({
    user: userByEmail.get(t.userEmail)._id,
    title: t.title,
    description: t.description || undefined,
    priority: t.priority,
    category: t.category,
    difficulty: t.difficulty,
    dueDate: toDate(t.dueDate),
    completed: toBool(t.completed),
    completedDate: toDate(t.completedDate),
    xpReward: toNum(t.xpReward),
    isDaily: toBool(t.isDaily),
  }));
  const tasks = await Task.insertMany(taskDocs);
  console.log(`Misiones insertadas: ${tasks.length}`);

  // 5) Runs de jefe: resuelve usuario y jefe
  const runsCsv = readCsv('bossRuns');
  const runDocs = runsCsv.map((r) => ({
    user: userByEmail.get(r.userEmail)._id,
    boss: bossBySlug.get(r.bossSlug)._id,
    weekStartDate: r.weekStartDate,
    currentHP: toNum(r.currentHP),
    maxHP: toNum(r.maxHP),
    status: r.status,
    completedAt: r.status === 'active' ? null : new Date(),
  }));
  const runs = await BossRun.insertMany(runDocs);
  console.log(`Runs de jefe insertadas: ${runs.length}`);

  const total = users.length + characters.length + tasks.length + bosses.length + runs.length;
  console.log(`\nSeed completado. TOTAL documentos: ${total}`);
  console.log('Login de prueba -> email: aria@dailygeon.com | password: password123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Error en el seed:', err);
  process.exit(1);
});
