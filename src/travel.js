/**
 * Vědmák: Pogromca Leszych — Cestování & Lov
 * Autor: Alexandre Basseville
 */

import { db } from "./firebase.js";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { t } from "./i18n.js";
import { esc, showToast } from "./ui-utils.js";
import { simulateCombat } from "./logic/combat-logic.js";
import { LevelingLogic } from "./logic/leveling-logic.js";

// ─────────────────────────────────────────────
//  DATA: VESNICE A BESTIE
// ─────────────────────────────────────────────

export const VILLAGES = [
  { id: "belovodi",       name: "Bělovodí",       flavor: "Tichá ves u bílých pramenů" },
  { id: "vrani_myto",     name: "Vraní Mýto",     flavor: "Kde havrani přinášejí smrt" },
  { id: "temny_hvozd",    name: "Temný Hvozd",    flavor: "Les, kde slunce nedosvítí" },
  { id: "zlate_lany",     name: "Zlaté Lány",     flavor: "Bohaté pšeničné pole, dnes prokleté" },
  { id: "ruzovy_uval",    name: "Růžový Úval",    flavor: "Údolí s krví zabarveným potokem" },
  { id: "kamenna_straz",  name: "Kamenná Stráž",  flavor: "Ruiny staré pevnosti na skále" },
  { id: "mokrady",        name: "Mokřady",         flavor: "Bažiny, kde se utopení mstí" },
  { id: "cerna_voda",     name: "Černá Voda",     flavor: "Jezero s temným dnem" },
  { id: "medvedi_kout",   name: "Medvědí Kout",   flavor: "Horský výběžek, klid mraků" },
  { id: "krkavci_skala",  name: "Krkavčí Skála",  flavor: "Skalnatý útes kde chodí duchové" },
];

export const BEASTS = [
  { id: "leshy",     name: "Lešij",        hp: 40,  sila: 8,  obrana: 2, xp: 40,  oreny: 25, icon: "🌲", difficulty: 1 },
  { id: "kikimora",  name: "Kikimora",     hp: 35,  sila: 10, obrana: 1, xp: 50,  oreny: 30, icon: "🕷", difficulty: 1 },
  { id: "rusalka",   name: "Rusalka",      hp: 55,  sila: 12, obrana: 3, xp: 70,  oreny: 45, icon: "🌊", difficulty: 2 },
  { id: "strzyga",   name: "Strzyga",      hp: 70,  sila: 15, obrana: 4, xp: 90,  oreny: 60, icon: "🦇", difficulty: 2 },
  { id: "utopiec",   name: "Utopiec",      hp: 60,  sila: 13, obrana: 3, xp: 80,  oreny: 50, icon: "💀", difficulty: 2 },
  { id: "mora",      name: "Mora",         hp: 80,  sila: 18, obrana: 5, xp: 110, oreny: 75, icon: "😱", difficulty: 3 },
  { id: "wilkolak",  name: "Wilkołak",     hp: 100, sila: 20, obrana: 6, xp: 140, oreny: 95, icon: "🐺", difficulty: 3 },
  { id: "topielec",  name: "Topielec",     hp: 45,  sila: 9,  obrana: 2, xp: 45,  oreny: 28, icon: "🌧", difficulty: 1 },
  { id: "zmora",     name: "Zmora",        hp: 90,  sila: 22, obrana: 7, xp: 160, oreny: 110, icon: "👻", difficulty: 4 },
  { id: "skrzak",    name: "Skrzak",       hp: 30,  sila: 6,  obrana: 1, xp: 30,  oreny: 18, icon: "🪲", difficulty: 1 },
];

/** Základní čas cesty v ms (2 minuty) */
const BASE_TRAVEL_MS = 2 * 60 * 1000;

// ─────────────────────────────────────────────
//  RENDER
// ─────────────────────────────────────────────

export async function renderTravelScreen(root, character, uid, equippedItems, onBack) {
  if (!root) return;
  _showSelection(root, character, uid, equippedItems, onBack);
}

// ── Fáze 1: Výběr vesnice a bestie ──────────

function _showSelection(root, character, uid, equippedItems, onBack) {
  const villageOptions = VILLAGES.map(v =>
    `<option value="${v.id}">${esc(v.name)} — ${esc(v.flavor)}</option>`
  ).join("");

  const beastCards = BEASTS.map(b =>
    `<button class="beast-card diff-${b.difficulty}" data-beast="${b.id}">
      <span class="beast-icon">${b.icon}</span>
      <span class="beast-name">${esc(b.name)}</span>
      <span class="beast-stats">HP ${b.hp} · ⚔ ${b.sila}</span>
      <span class="beast-reward">+${b.xp} XP / ${b.oreny} oren</span>
      <span class="beast-diff">${"★".repeat(b.difficulty)}</span>
    </button>`
  ).join("");

  root.innerHTML = `
    <div class="screen-header">
      <h2>⚔ ${t("travel_title")}</h2>
      <button class="btn-back" onclick="">← ${t("back")}</button>
    </div>

    <div class="card">
      <label class="field-label">${t("travel_pick_village")}</label>
      <select id="village-select" class="styled-select">${villageOptions}</select>
    </div>

    <div class="card">
      <label class="field-label">${t("travel_pick_beast")}</label>
      <div class="beast-grid" id="beast-grid">${beastCards}</div>
      <p id="selected-beast-info" class="muted-text" style="margin-top:10px;"></p>
    </div>

    <div class="card">
      <div class="mount-info">
        🐴 Bonus oře/amuletu: <strong>-${Math.round((character.mountBonus ?? 0) * 100)}%</strong> doby cesty
      </div>
      <button class="btn-primary" id="btn-travel">${t("travel_contract")} →</button>
    </div>
  `;

  root.querySelector(".btn-back").addEventListener("click", onBack);

  let selectedBeastId = null;

  root.querySelectorAll(".beast-card").forEach(btn => {
    btn.addEventListener("click", () => {
      root.querySelectorAll(".beast-card").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedBeastId = btn.dataset.beast;
      const beast = BEASTS.find(b => b.id === selectedBeastId);
      document.getElementById("selected-beast-info").textContent =
        `Vybráno: ${beast.name} (HP ${beast.hp}, Síla ${beast.sila})`;
    });
  });

  document.getElementById("btn-travel").addEventListener("click", () => {
    if (!selectedBeastId) { showToast("Vyber bestii!", "error"); return; }
    const villageId = document.getElementById("village-select").value;
    const village = VILLAGES.find(v => v.id === villageId);
    const beast   = BEASTS.find(b => b.id === selectedBeastId);
    _showTravel(root, character, uid, equippedItems, village, beast, onBack);
  });
}

// ── Fáze 2: Odpočet cesty ────────────────────

function _showTravel(root, character, uid, equippedItems, village, beast, onBack) {
  const mountBonus  = character.mountBonus ?? 0;
  const travelMs    = Math.round(BASE_TRAVEL_MS * (1 - mountBonus));
  const endTime     = Date.now() + travelMs;

  root.innerHTML = `
    <div class="screen-header">
      <h2>🐎 ${t("travel_traveling")} ${esc(village.name)}</h2>
    </div>
    <div class="card travel-card">
      <div class="travel-anim">🗺</div>
      <p class="travel-dest">${esc(village.flavor)}</p>
      <p class="muted-text">Zakázka: <strong>${esc(beast.name)}</strong> ${beast.icon}</p>
      <div class="countdown-wrap">
        <div class="countdown-bar-outer"><div class="countdown-bar-inner" id="travel-bar"></div></div>
        <p class="countdown-text" id="travel-countdown"></p>
      </div>
    </div>
  `;

  const interval = setInterval(() => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) {
      clearInterval(interval);
      _showCombat(root, character, uid, equippedItems, village, beast, onBack);
      return;
    }
    const pct = Math.round(((travelMs - remaining) / travelMs) * 100);
    const secs = Math.ceil(remaining / 1000);
    const bar = document.getElementById("travel-bar");
    const txt = document.getElementById("travel-countdown");
    if (bar) bar.style.width = pct + "%";
    if (txt) txt.textContent = `Zbývá ${secs}s…`;
  }, 200);
}

// ── Fáze 3: Souboj a odměna ──────────────────

async function _showCombat(root, character, uid, equippedItems, village, beast, onBack) {
  root.innerHTML = `
    <div class="screen-header"><h2>${beast.icon} ${t("travel_fighting")}</h2></div>
    <div class="card"><div class="rune-spinner"></div><p class="muted-text">Simuluji souboj…</p></div>
  `;

  await new Promise(r => setTimeout(r, 600));

  const charStats = {
    hp:          character.hp    ?? 100,
    sila:        (character.sila  ?? 10) + (equippedItems?.bonusSila ?? 0),
    obrana:      (character.obrana ?? 5)  + (equippedItems?.bonusObrana ?? 0),
    equippedSign: character.equippedSign ?? null,
  };

  const { won, rounds, finalHpA } = simulateCombat(charStats, beast);

  const logHtml = rounds.map(r => `<li>${esc(r)}</li>`).join("");

  if (won) {
    // Axii: šance na bonus odměnu
    let bonusOreny = 0;
    if (character.equippedSign === "Axii" && Math.random() < 0.35) {
      bonusOreny = Math.round(beast.oreny * 0.3);
    }
    const totalOreny = beast.oreny + bonusOreny;

    // Zápis do DB
    const newXp     = (character.xp ?? 0) + beast.xp;
    const newOreny  = (character.oreny ?? 0) + totalOreny;
    const newHp     = Math.max(1, Math.min(character.maxHp ?? 100, finalHpA));
    const { level } = LevelingLogic.getLevelInfo(newXp);

    await updateDoc(doc(db, "characters", uid), {
      xp:    newXp,
      oreny: newOreny,
      hp:    newHp,
      level,
    });

    root.innerHTML = `
      <div class="screen-header"><h2>🏆 ${t("travel_reward")}</h2></div>
      <div class="card reward-card">
        <p class="reward-won">Bestie poražena!</p>
        <div class="reward-grid">
          <div class="reward-item"><span>⚔</span><strong>+${beast.xp} XP</strong></div>
          <div class="reward-item"><span>💰</span><strong>+${totalOreny} Orenů</strong>${bonusOreny > 0 ? '<span class="axii-bonus">(Axii bonus!)</span>' : ""}</div>
          <div class="reward-item"><span>❤</span><strong>HP: ${newHp}</strong></div>
        </div>
        <details class="battle-log"><summary>Záznam souboje</summary><ul>${logHtml}</ul></details>
        <button class="btn-primary" id="btn-travel-back">${t("travel_back")}</button>
      </div>
    `;
  } else {
    await updateDoc(doc(db, "characters", uid), { hp: 1 });
    root.innerHTML = `
      <div class="screen-header"><h2>💀 ${t("travel_lost")}</h2></div>
      <div class="card">
        <p class="reward-lost">${t("travel_lost")}</p>
        <details class="battle-log"><summary>Záznam souboje</summary><ul>${logHtml}</ul></details>
        <button class="btn-primary" id="btn-travel-back">${t("travel_back")}</button>
      </div>
    `;
  }

  document.getElementById("btn-travel-back")?.addEventListener("click", onBack);
}
