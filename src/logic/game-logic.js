/**
 * Vědmák: Pogromca Leszych — Herní logika
 * Autor: Alexandre Basseville
 */

export const XP_PER_LEVEL_BASE = 100;

export class GameLogic {
  /**
   * Vypočítá finální bojové statistiky Zaklínače včetně bonusů z vybavení.
   */
  static calculateFinalStats(character, equippedItems = null) {
    let sila    = character.sila    ?? 10;
    let obrana  = character.obrana  ?? 5;
    let alchymie = character.alchymie ?? 3;

    if (equippedItems) {
      sila    += equippedItems.bonusSila   ?? 0;
      obrana  += equippedItems.bonusObrana ?? 0;
      alchymie += equippedItems.bonusAlch  ?? 0;
    }

    return { sila, obrana, alchymie };
  }

  /**
   * HP odměna za healing v hospodě.
   */
  static healingAmount(character, foodTier) {
    const maxHp = character.maxHp ?? 100;
    const curHp = character.hp    ?? 100;
    const pct   = { basic: 0.3, feast: 0.6, mead: 1.0 }[foodTier] ?? 0.3;
    return Math.min(maxHp - curHp, Math.round(maxHp * pct));
  }
}
