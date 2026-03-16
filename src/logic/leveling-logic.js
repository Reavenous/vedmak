/**
 * Vědmák: Pogromca Leszych — Levelovací logika
 * Autor: Alexandre Basseville
 */

export class LevelingLogic {
  /**
   * Křivka: Level = floor(sqrt(xp / 100)) + 1
   */
  static getLevelInfo(totalXp) {
    const xp = Math.max(0, Number(totalXp) || 0);
    const currentLevel = Math.floor(Math.sqrt(xp / 100)) + 1;
    const currentBase  = Math.pow(currentLevel - 1, 2) * 100;
    const nextBase     = Math.pow(currentLevel, 2)     * 100;
    const xpInLevel    = xp - currentBase;
    const xpRequired   = nextBase - currentBase;
    const progressPct  = Math.min(100, Math.max(0, Math.round((xpInLevel / xpRequired) * 100)));

    return { level: currentLevel, currentXp: xp, nextLevelXp: nextBase, progressPct };
  }

  /**
   * Vrátí bonusy statistik za dosažený level.
   * Každý level: +2 Síla, +1 Obrana, +1 Alchymie, +10 maxHP
   */
  static getLevelBonuses(level) {
    const l = Math.max(1, level);
    return {
      sila:    (l - 1) * 2,
      obrana:  (l - 1) * 1,
      alchymie:(l - 1) * 1,
      maxHp:   100 + (l - 1) * 10,
    };
  }
}
