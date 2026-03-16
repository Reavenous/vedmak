/**
 * Vědmák: Pogromca Leszych — Bojová logika (Zaklínačská Znamení)
 * Autor: Alexandre Basseville
 */

const RAND = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Efekty Zaklínačských Znamení.
 */
export const SIGNS = {
  Aard: {
    label: "Aard",
    icon: "✦",
    desc: { cs: "+15% šance na krit", en: "+15% crit chance" },
    applyCritBonus: (baseCrit) => baseCrit + 0.15,
  },
  Igni: {
    label: "Igni",
    icon: "🔥",
    desc: { cs: "Ohnivé poškození +20%", en: "Fire damage +20%" },
    applyDmgBonus: (dmg) => Math.round(dmg * 1.2),
  },
  Quen: {
    label: "Quen",
    icon: "🛡",
    desc: { cs: "Ignoruje prvních 20% poškození", en: "Ignores first 20% damage" },
    applyDmgReduction: (dmgReceived) => Math.round(dmgReceived * 0.8),
  },
  Yrden: {
    label: "Yrden",
    icon: "⬡",
    desc: { cs: "Snižuje obranu soupeře o 10%", en: "Reduces opponent defense by 10%" },
    applyEnemyDefenseDebuff: (defense) => Math.round(defense * 0.9),
  },
  Axii: {
    label: "Axii",
    icon: "👁",
    desc: { cs: "Šance ukrást část odměny navíc", en: "Chance to steal extra reward" },
    extraRewardChance: 0.35,
    extraRewardPct: 0.3,
  },
};

/**
 * Simuluje souboj Zaklínače s bestií nebo jiným Zaklínačem.
 * Vrátí { won, rounds, log, finalHpAttacker, finalHpDefender }
 *
 * @param {object} attacker  — { sila, obrana, alchymie, maxHp, hp, equippedSign }
 * @param {object} defender  — { sila, obrana, hp }
 * @param {object} [opts]
 * @returns {{ won: boolean, rounds: string[], finalHpA: number, finalHpD: number }}
 */
export function simulateCombat(attacker, defender, opts = {}) {
  let hpA = attacker.hp   ?? 100;
  let hpD = defender.hp   ?? 50;

  const silaA   = attacker.sila   ?? 10;
  const obranaA = attacker.obrana ?? 5;
  const silaD   = defender.sila   ?? 8;
  let   obranaD = defender.obrana ?? 3;

  const sign = attacker.equippedSign ?? null;

  // Yrden: oslabí obranu protivníka
  if (sign === "Yrden") {
    obranaD = SIGNS.Yrden.applyEnemyDefenseDebuff(obranaD);
  }

  let critChance = 0.1;
  // Aard: zvýšená šance na krit
  if (sign === "Aard") {
    critChance = SIGNS.Aard.applyCritBonus(critChance);
  }

  const rounds = [];
  const MAX_ROUNDS = 20;
  let round = 0;

  while (hpA > 0 && hpD > 0 && round < MAX_ROUNDS) {
    round++;

    // Útok A → D
    const isCrit = Math.random() < critChance;
    let rawDmgA  = Math.max(1, silaA - obranaD + RAND(-2, 4));
    if (sign === "Igni") rawDmgA = SIGNS.Igni.applyDmgBonus(rawDmgA);
    if (isCrit) rawDmgA = Math.round(rawDmgA * 1.5);
    hpD = Math.max(0, hpD - rawDmgA);
    rounds.push(`Kolo ${round}: Zaklínač zasáhl za ${rawDmgA}${isCrit ? " 💥KRIT" : ""} — soupeř má ${hpD} HP`);

    if (hpD <= 0) break;

    // Útok D → A
    let rawDmgD = Math.max(1, silaD - obranaA + RAND(-2, 3));
    if (sign === "Quen") rawDmgD = SIGNS.Quen.applyDmgReduction(rawDmgD);
    hpA = Math.max(0, hpA - rawDmgD);
    rounds.push(`Kolo ${round}: Soupeř udeřil za ${rawDmgD}${sign === "Quen" ? " (Quen absorboval část)" : ""} — Zaklínač má ${hpA} HP`);
  }

  const won = hpD <= 0;
  return { won, rounds, finalHpA: hpA, finalHpD: hpD };
}

export const SIGN_LIST = Object.keys(SIGNS);
