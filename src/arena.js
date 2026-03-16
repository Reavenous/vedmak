/**
 * Vědmák: Pogromca Leszych — Aréna (PvP)
 * Autor: Alexandre Basseville
 */

import { db } from "./firebase.js";
import {
  collection, query, where, orderBy, limit, getDocs,
  doc, getDoc, updateDoc, addDoc, Timestamp,
} from "firebase/firestore";
import { t } from "./i18n.js";
import { esc, showToast, htmlLoading } from "./ui-utils.js";
import { simulateCombat } from "./logic/combat-logic.js";
import { LevelingLogic } from "./logic/leveling-logic.js";

const LEVEL_RANGE   = 2;
const POOL_LIMIT    = 30;
const WIN_XP        = 60;
const WIN_ORENY     = 40;
const LOSS_ORENY    = -15;

// ─────────────────────────────────────────────
//  MATCHMAKING
// ─────────────────────────────────────────────

async function findOpponent(uid, level) {
  const minLvl = Math.max(1, level - LEVEL_RANGE);
  const maxLvl = level + LEVEL_RANGE;

  const q = query(
    collection(db, "characters"),
    where("level", ">=", minLvl),
    orderBy("level", "asc"),
    limit(POOL_LIMIT)
  );

  const snap = await getDocs(q);
  const candidates = snap.docs
    .filter(d => d.id !== uid)
    .map(d => ({ id: d.id, data: d.data() }))
    .filter(c => (c.data.level ?? 1) <= maxLvl);

  if (!candidates.length) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ─────────────────────────────────────────────
//  RENDER
// ─────────────────────────────────────────────

export async function renderArenaScreen(root, character, uid, equippedItems, onBack) {
  if (!root) return;

  root.innerHTML = `
    <div class="screen-header">
      <h2>⚔ ${t("arena_title")}</h2>
      <button class="btn-back" id="arena-back">← ${t("back")}</button>
    </div>

    <div class="card arena-stats-card">
      <div class="arena-fighter">
        <div class="fighter-avatar">🗡</div>
        <div class="fighter-info">
          <strong>${esc(character.name)}</strong>
          <span class="muted-text">${_schoolLabel(character.school)} · Lv.${character.level ?? 1}</span>
          <span>Síla ${(character.sila ?? 10) + (equippedItems?.bonusSila ?? 0)} · Obrana ${(character.obrana ?? 5) + (equippedItems?.bonusObrana ?? 0)}</span>
        </div>
      </div>
    </div>

    <div class="card" id="arena-opponent-card">
      <p class="muted-text">Stiskni tlačítko pro vyhledání soupeře.</p>
    </div>

    <div class="card">
      <button class="btn-primary" id="btn-find-opp">${t("arena_find_opp")}</button>
    </div>

    <div id="arena-result"></div>
  `;

  root.querySelector("#arena-back")?.addEventListener("click", onBack);

  let foundOpponent = null;

  root.querySelector("#btn-find-opp")?.addEventListener("click", async () => {
    const card = document.getElementById("arena-opponent-card");
    card.innerHTML = htmlLoading("Hledám soupeře…");

    foundOpponent = await findOpponent(uid, character.level ?? 1);
    if (!foundOpponent) {
      card.innerHTML = `<p class="muted-text">${t("arena_no_opp")}</p>`;
      return;
    }

    const opp = foundOpponent.data;
    card.innerHTML = `
      <p class="section-label">Nalezený soupeř</p>
      <div class="arena-fighter">
        <div class="fighter-avatar">⚔</div>
        <div class="fighter-info">
          <strong>${esc(opp.name ?? "Neznámý")}</strong>
          <span class="muted-text">${_schoolLabel(opp.school)} · Lv.${opp.level ?? 1}</span>
          <span>Síla ${opp.sila ?? 10} · Obrana ${opp.obrana ?? 5}</span>
          <span class="muted-text">Znamení: ${opp.equippedSign ?? "žádné"}</span>
        </div>
      </div>
      <button class="btn-danger" id="btn-fight">${t("arena_fight")}</button>
    `;

    document.getElementById("btn-fight")?.addEventListener("click", async () => {
      await _executeFight(root, character, uid, equippedItems, foundOpponent);
    });
  });
}

async function _executeFight(root, character, uid, equippedItems, opponent) {
  const resultEl = document.getElementById("arena-result");
  if (resultEl) resultEl.innerHTML = htmlLoading("Souboj probíhá…");

  await new Promise(r => setTimeout(r, 700));

  const myStats = {
    hp:          character.hp ?? 100,
    sila:        (character.sila ?? 10) + (equippedItems?.bonusSila ?? 0),
    obrana:      (character.obrana ?? 5)  + (equippedItems?.bonusObrana ?? 0),
    equippedSign: character.equippedSign ?? null,
  };

  const oppData = opponent.data;
  const oppStats = {
    hp:     oppData.hp ?? 100,
    sila:   oppData.sila ?? 10,
    obrana: oppData.obrana ?? 5,
    equippedSign: oppData.equippedSign ?? null,
  };

  const { won, rounds } = simulateCombat(myStats, oppStats);

  // DB updates
  const newXp    = (character.xp    ?? 0) + (won ? WIN_XP : 0);
  const newOreny = Math.max(0, (character.oreny ?? 0) + (won ? WIN_ORENY : LOSS_ORENY));
  const { level } = LevelingLogic.getLevelInfo(newXp);

  await updateDoc(doc(db, "characters", uid), {
    xp:    newXp,
    oreny: newOreny,
    level,
  });

  // Log battle record
  await addDoc(collection(db, "battles"), {
    attackerId:  uid,
    defenderId:  opponent.id,
    winnerId:    won ? uid : opponent.id,
    xpGained:    won ? WIN_XP : 0,
    orenyChange: won ? WIN_ORENY : LOSS_ORENY,
    timestamp:   Timestamp.now(),
  });

  const logHtml = rounds.map(r => `<li>${esc(r)}</li>`).join("");

  if (resultEl) {
    resultEl.innerHTML = `
      <div class="card ${won ? "result-win" : "result-loss"}">
        <h3>${won ? t("arena_you_won") : t("arena_you_lost")}</h3>
        ${won
          ? `<p>+${WIN_XP} XP, +${WIN_ORENY} Orenů</p>`
          : `<p>${Math.abs(LOSS_ORENY)} Orenů ztraceno.</p>`
        }
        <details class="battle-log"><summary>Záznam souboje</summary><ul>${logHtml}</ul></details>
      </div>
    `;
  }
}

function _schoolLabel(school) {
  return { vlk: "Škola Vlka", medved: "Škola Medvěda", zmije: "Škola Zmije" }[school] ?? school ?? "—";
}
