/**
 * generate-data.js
 * Genera el dataset inicial de Dailygeon.
 * Crea un Excel (dailygeon-seed.xlsx) con una hoja por coleccion y exporta
 * cada hoja a CSV en /data. El seed leera luego esos CSV con el modulo fs.
 *
 * Uso: npm run generate-data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';
import { getXPReward, getXPForLevel } from '../src/utils/xp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

// --- Catalogos de valores para generar variedad ---
const CLASSES = ['warrior', 'mage', 'rogue', 'cleric'];
const COLORS = ['#7c3aed', '#dc2626', '#2563eb', '#059669', '#d97706', '#db2777'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const CATEGORIES = ['health', 'work', 'learning', 'fitness', 'general'];
const DIFFICULTIES = ['easy', 'normal', 'hard', 'legendary'];

/** Titulos de mision por categoria para dar realismo */
const TASK_TITLES = {
  health: ['Beber 2L de agua', 'Dormir 8 horas', 'Meditar 10 min', 'Cocinar sano', 'Paseo de 30 min'],
  work: ['Revisar emails', 'Cerrar el informe', 'Reunion de equipo', 'Preparar la demo', 'Planificar sprint'],
  learning: ['Estudiar React 1h', 'Leer 20 paginas', 'Curso de Node', 'Practicar ingles', 'Repasar apuntes'],
  fitness: ['Ir al gimnasio', 'Correr 5km', 'Rutina de fuerza', 'Estiramientos', '100 flexiones'],
  general: ['Hacer la compra', 'Ordenar el cuarto', 'Llamar a la familia', 'Pagar facturas', 'Regar las plantas'],
};

/** 10 usuarios base; la contrasena en claro se hashea en el seed */
const USERS = [
  'aria', 'bran', 'cira', 'dorian', 'elwin',
  'fenna', 'goran', 'hilda', 'ivar', 'jora',
].map((name) => ({
  username: name,
  email: `${name}@dailygeon.com`,
  password: 'password123',
}));

/** 8 jefes del catalogo, dificultad creciente */
const BOSSES = [
  { slug: 'goblin-procrastinador', name: 'Goblin Procrastinador', maxHP: 300, emoji: '👺', rewardXP: 80, difficultyTier: 1, description: 'Te susurra que lo dejes para manana.' },
  { slug: 'slime-del-desorden', name: 'Slime del Desorden', maxHP: 450, emoji: '🟢', rewardXP: 100, difficultyTier: 2, description: 'Se expande por cada tarea sin hacer.' },
  { slug: 'espectro-del-cansancio', name: 'Espectro del Cansancio', maxHP: 600, emoji: '👻', rewardXP: 130, difficultyTier: 3, description: 'Drena tu energia al amanecer.' },
  { slug: 'golem-de-la-rutina', name: 'Golem de la Rutina', maxHP: 800, emoji: '🗿', rewardXP: 160, difficultyTier: 4, description: 'Inamovible ante los nuevos habitos.' },
  { slug: 'dragon-de-la-distraccion', name: 'Dragon de la Distraccion', maxHP: 1000, emoji: '🐉', rewardXP: 200, difficultyTier: 5, description: 'Escupe notificaciones sin parar.' },
  { slug: 'lich-del-aplazamiento', name: 'Lich del Aplazamiento', maxHP: 1300, emoji: '💀', rewardXP: 260, difficultyTier: 6, description: 'Revive cada excusa que creias muerta.' },
  { slug: 'titan-del-agobio', name: 'Titan del Agobio', maxHP: 1600, emoji: '👹', rewardXP: 320, difficultyTier: 7, description: 'Aplasta con mil tareas a la vez.' },
  { slug: 'sombra-final', name: 'Sombra Final', maxHP: 2000, emoji: '🌑', rewardXP: 400, difficultyTier: 8, description: 'El jefe definitivo de la productividad.' },
];

/** Devuelve un elemento aleatorio de un array */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Suma dias a una fecha y la devuelve como YYYY-MM-DD */
const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

// --- Genera personajes: uno por usuario ---
const characters = USERS.map((u, i) => {
  const level = 1 + (i % 8);
  return {
    userEmail: u.email,
    name: u.username.charAt(0).toUpperCase() + u.username.slice(1),
    class: pick(CLASSES),
    level,
    currentXP: Math.floor(getXPForLevel(level) * Math.random()),
    maxXP: getXPForLevel(level),
    health: 100,
    maxHealth: 100,
    avatarColor: COLORS[i % COLORS.length],
  };
});

// --- Genera misiones: ~13 por usuario => 130 registros ---
const tasks = [];
USERS.forEach((u) => {
  const count = 12 + Math.floor(Math.random() * 4); // 12-15
  for (let i = 0; i < count; i++) {
    const category = pick(CATEGORIES);
    const difficulty = pick(DIFFICULTIES);
    const completed = Math.random() < 0.45;
    tasks.push({
      userEmail: u.email,
      title: pick(TASK_TITLES[category]),
      description: '',
      priority: pick(PRIORITIES),
      category,
      difficulty,
      dueDate: dateOffset(Math.floor(Math.random() * 21) - 7),
      completed,
      completedDate: completed ? dateOffset(-Math.floor(Math.random() * 7)) : '',
      xpReward: getXPReward(difficulty),
      isDaily: Math.random() < 0.25,
    });
  }
});

// --- Genera runs de jefe: ~2 por usuario ---
const bossRuns = [];
USERS.forEach((u, i) => {
  const runsCount = 1 + (i % 2);
  for (let r = 0; r < runsCount; r++) {
    const boss = BOSSES[(i + r) % BOSSES.length];
    const status = r === 0 ? 'active' : pick(['defeated', 'expired']);
    bossRuns.push({
      userEmail: u.email,
      bossSlug: boss.slug,
      weekStartDate: dateOffset(-7 * r),
      currentHP: status === 'active' ? Math.floor(boss.maxHP * Math.random()) : 0,
      maxHP: boss.maxHP,
      status,
    });
  }
});

// --- Escribe el Excel (una hoja por coleccion) y los CSV ---
fs.mkdirSync(DATA_DIR, { recursive: true });
const workbook = XLSX.utils.book_new();

const sheets = {
  users: USERS,
  characters,
  tasks,
  bosses: BOSSES,
  bossRuns,
};

for (const [name, rows] of Object.entries(sheets)) {
  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, name);
  // Exporta cada hoja a su CSV usando fs
  const csv = XLSX.utils.sheet_to_csv(sheet);
  fs.writeFileSync(path.join(DATA_DIR, `${name}.csv`), csv, 'utf8');
}

XLSX.writeFile(workbook, path.join(DATA_DIR, 'dailygeon-seed.xlsx'));

const total = USERS.length + characters.length + tasks.length + BOSSES.length + bossRuns.length;
console.log('Dataset generado en /data:');
console.log(`  users: ${USERS.length} | characters: ${characters.length} | tasks: ${tasks.length} | bosses: ${BOSSES.length} | bossRuns: ${bossRuns.length}`);
console.log(`  TOTAL registros: ${total}`);
console.log('  Ficheros: dailygeon-seed.xlsx + users.csv, characters.csv, tasks.csv, bosses.csv, bossRuns.csv');
