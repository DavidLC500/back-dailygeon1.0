/**
 * xp.js
 * Logica de progresion RPG portada de Dailygeon.
 * Calcula la XP por dificultad, la XP necesaria por nivel y resuelve
 * las subidas de nivel al acumular experiencia.
 */

/** XP base otorgada al completar una mision segun su dificultad */
export const XP_BY_DIFFICULTY = {
  easy: 10,
  normal: 20,
  hard: 50,
  legendary: 100,
};

/** Devuelve la XP que otorga una mision segun su dificultad */
export const getXPReward = (difficulty) => XP_BY_DIFFICULTY[difficulty] ?? 20;

/**
 * Calcula la XP necesaria para pasar del nivel dado al siguiente.
 * Formula: floor(100 * 1.3^(nivel-1)) — crece un 30% por nivel.
 */
export const getXPForLevel = (level) => Math.floor(100 * Math.pow(1.3, level - 1));

/**
 * Aplica la XP ganada al estado del personaje y calcula si sube de nivel.
 * Maneja subidas multiples en una sola llamada.
 * Devuelve el nuevo nivel, la XP restante, el cap y si subio.
 */
export const calculateLevelUp = (currentLevel, currentXP, maxXP, xpGained) => {
  let level = currentLevel;
  let xp = currentXP + xpGained;
  let cap = maxXP;
  let levelsGained = 0;

  while (xp >= cap) {
    xp -= cap;
    level += 1;
    levelsGained += 1;
    cap = getXPForLevel(level);
  }

  return {
    newLevel: level,
    newCurrentXP: xp,
    newMaxXP: cap,
    levelsGained,
    leveledUp: levelsGained > 0,
  };
};
