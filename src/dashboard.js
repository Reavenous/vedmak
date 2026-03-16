/**
 * Vědmák: Pogromca Leszych — Hlavní herní obrazovka (Dashboard)
 * Autor: Alexandre Basseville
 */

import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { t, initI18n, setLang, getLang, SUPPORTED_LANGS } from "./i18n.js";
import { esc, showToast, htmlLoading } from "./ui-utils.js";
import { LevelingLogic } from "./logic/leveling-logic.js";
import { renderTravelScreen } from "./travel.js";
import { renderArenaScreen } from "./arena.js";
import { renderShopScreen, renderStablesScreen } from "./shop.js";
import { renderTavernScreen } from "./tavern.js";
import { renderLeaderboardScreen } from "./leaderboard.js";
import { renderChatScreen, destroyChat } from "./chat.js";
import { SIGNS } from "./logic/combat-logic.js";

initI18n();

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────

let currentUser      = null;
let currentCharacter = null;
let equippedItems    = null;
let currentScreen    = "dashboard";

// ─────────────────────────────────────────────
//  EQUIPMENT LOADER
// ─────────────────────────────────────────────

async function loadEquippedItems(character) {
  if (!character) return { bonusSila: 0, bonusObrana: 0, bonusAlch: 0, weapon: null, armor: null };

  const [weapon, armor] = await Promise.all([
    _fetchInventoryItem(currentUser.uid, character.equippedWeaponId),
    _fetchInventoryItem(currentUser.uid, character.equippedArmorId),
  ]);

  return {
    bonusSila:   (weapon?.bonusSila ?? 0)   + (armor?.bonusSila ?? 0),
    bonusObrana: (weapon?.bonusObrana ?? 0) + (armor?.bonusObrana ?? 0),
    bonusAlch:   (weapon?.bonusAlch ?? 0)   + (armor?.bonusAlch ?? 0),
    weapon,
    armor,
  };
}

async function _fetchInventoryItem(uid, itemId) {
  if (!itemId) return null;
  try {
    const snap = await getDoc(doc(db, "inventory", `${uid}_${itemId}`));
    return snap.exists() ? snap.data() : null;
  } catch { return null; }
}

// ─────────────────────────────────────────────
//  RENDER DASHBOARD
// ─────────────────────────────────────────────

function renderDashboard() {
  const root = document.getElementById("root");
  if (!root || !currentCharacter) return;

  destroyChat();
  currentScreen = "dashboard";

  const c  = currentCharacter;
  const li = LevelingLogic.getLevelInfo(c.xp ?? 0);
  const hp     = c.hp    ?? 100;
  const maxHp  = c.maxHp ?? 100;
  const hpPct  = Math.min(100, Math.round((hp / maxHp) * 100));
  const school = { vlk: "Škola Vlka 🐺", medved: "Škola Medvěda 🐻", zmije: "Škola Zmije 🐍" }[c.school] ?? c.school;
  const signInfo = c.equippedSign ? SIGNS[c.equippedSign] : null;

  root.innerHTML = `
    <!-- HLAVIČKA -->
    <div class="dash-header">
      <div class="witcher-emblem">${_schoolEmblem(c.school)}</div>
      <div class="dash-hero-info">
        <h1 class="witcher-name">${esc(c.name ?? "Zaklínač")}</h1>
        <span class="witcher-school">${esc(school)}</span>
      </div>
      <div class="dash-lang-row">
        ${SUPPORTED_LANGS.map(l =>
          `<button class="lang-btn ${l.code === getLang() ? "active" : ""}"
            onclick="window.switchLang('${l.code}')" title="${l.label}">${l.flag}</button>`
        ).join("")}
        <button class="btn-logout" id="btn-logout">⏏ ${t("nav_logout")}</button>
      </div>
    </div>

    <!-- STATUS BARY -->
    <div class="card status-card">
      <div class="stat-bars">
        <div class="stat-row">
          <span class="stat-label">❤ ${t("dash_hp")}</span>
          <div class="bar-outer hp-bar-outer"><div class="bar-inner hp-bar-inner" style="width:${hpPct}%"></div></div>
          <span class="stat-value">${hp} / ${maxHp}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">✦ ${t("dash_xp")}</span>
          <div class="bar-outer xp-bar-outer"><div class="bar-inner xp-bar-inner" style="width:${li.progressPct}%"></div></div>
          <span class="stat-value">Lv.${li.level} — ${li.currentXp}/${li.nextLevelXp}</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-chip">⚔ <strong>${(c.sila ?? 10) + (equippedItems?.bonusSila ?? 0)}</strong><span>Síla</span></div>
        <div class="stat-chip">🛡 <strong>${(c.obrana ?? 5) + (equippedItems?.bonusObrana ?? 0)}</strong><span>Obrana</span></div>
        <div class="stat-chip">⚗ <strong>${(c.alchymie ?? 3) + (equippedItems?.bonusAlch ?? 0)}</strong><span>Alchymie</span></div>
        <div class="stat-chip">💰 <strong>${c.oreny ?? 0}</strong><span>Oreny</span></div>
      </div>
    </div>

    <!-- VYBAVENÍ -->
    <div class="card equip-card">
      <p class="section-label">Vybavení</p>
      <div class="equip-grid">
        <div class="equip-slot">
          <span class="equip-icon">🗡</span>
          <span class="equip-label">${t("dash_weapon")}</span>
          <span class="equip-name">${equippedItems?.weapon ? esc(equippedItems.weapon.name) : t("dash_none_equipped")}</span>
        </div>
        <div class="equip-slot">
          <span class="equip-icon">🛡</span>
          <span class="equip-label">${t("dash_armor")}</span>
          <span class="equip-name">${equippedItems?.armor ? esc(equippedItems.armor.name) : t("dash_none_equipped")}</span>
        </div>
        <div class="equip-slot">
          <span class="equip-icon">${signInfo ? signInfo.icon : "✦"}</span>
          <span class="equip-label">${t("dash_sign")}</span>
          <span class="equip-name">${c.equippedSign ?? t("dash_none_equipped")}</span>
        </div>
        <div class="equip-slot">
          <span class="equip-icon">🐴</span>
          <span class="equip-label">${t("dash_mount")}</span>
          <span class="equip-name">-${Math.round((c.mountBonus ?? 0) * 100)}% cesty</span>
        </div>
      </div>
    </div>

    <!-- NAVIGACE -->
    <div class="nav-grid">
      <button class="nav-btn" data-screen="travel">⚔<span>${t("nav_travel")}</span></button>
      <button class="nav-btn" data-screen="arena">🏟<span>${t("nav_arena")}</span></button>
      <button class="nav-btn" data-screen="shop">🔨<span>${t("nav_shop")}</span></button>
      <button class="nav-btn" data-screen="stables">🐎<span>${t("nav_stables")}</span></button>
      <button class="nav-btn" data-screen="tavern">🍺<span>${t("nav_tavern")}</span></button>
      <button class="nav-btn" data-screen="leaderboard">🏆<span>${t("nav_leaderboard")}</span></button>
      <button class="nav-btn" data-screen="chat">💬<span>${t("nav_chat")}</span></button>
      <button class="nav-btn" data-screen="signs">✦<span>Znamení</span></button>
    </div>

    <!-- AUDIO PŘEHRÁVAČ -->
    <div class="card audio-card">
      <span class="audio-label">🎵 Hudba</span>
      <audio id="bg-music" controls style="flex:1;min-width:0;">
        <source src="assets/music/theme.mp3" type="audio/mpeg" />
      </audio>
    </div>

    <footer class="site-footer">${t("footer_text")}</footer>
  `;

  document.getElementById("btn-logout")?.addEventListener("click", async () => {
    destroyChat();
    await signOut(auth);
    window.location.href = "/";
  });

  root.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.screen));
  });
}

// ─────────────────────────────────────────────
//  NAVIGACE
// ─────────────────────────────────────────────

async function navigate(screen) {
  const root = document.getElementById("root");
  if (!root) return;

  destroyChat();
  currentScreen = screen;

  const back = () => { refreshCharacter().then(renderDashboard); };

  switch (screen) {
    case "travel":
      renderTravelScreen(root, currentCharacter, currentUser.uid, equippedItems, back);
      break;
    case "arena":
      renderArenaScreen(root, currentCharacter, currentUser.uid, equippedItems, back);
      break;
    case "shop":
      renderShopScreen(root, currentCharacter, currentUser.uid, back, () => refreshCharacter().then(renderDashboard));
      break;
    case "stables":
      renderStablesScreen(root, currentCharacter, currentUser.uid, back, () => refreshCharacter().then(renderDashboard));
      break;
    case "tavern":
      renderTavernScreen(root, currentCharacter, currentUser.uid, back, () => refreshCharacter().then(renderDashboard));
      break;
    case "leaderboard":
      renderLeaderboardScreen(root, currentUser.uid, back);
      break;
    case "chat":
      renderChatScreen(root, currentCharacter, currentUser.uid, back);
      break;
    case "signs":
      renderSignsScreen(root, currentCharacter, currentUser.uid, back);
      break;
    default:
      renderDashboard();
  }
}

// ─────────────────────────────────────────────
//  OBRAZOVKA ZNAMENÍ
// ─────────────────────────────────────────────

function renderSignsScreen(root, character, uid, onBack) {
  const signKeys = Object.keys(SIGNS);

  root.innerHTML = `
    <div class="screen-header">
      <h2>✦ Zaklínačská Znamení</h2>
      <button class="btn-back" id="signs-back">← ${t("back")}</button>
    </div>
    <div class="card">
      <p class="muted-text" style="margin-bottom:14px;">Nasazené znamení: <strong>${character.equippedSign ?? "žádné"}</strong></p>
      <div class="signs-grid">
        ${signKeys.map(key => {
          const s = SIGNS[key];
          const equipped = character.equippedSign === key;
          return `
            <div class="sign-card ${equipped ? "sign-equipped" : ""}">
              <span class="sign-icon">${s.icon}</span>
              <strong>${esc(s.label)}</strong>
              <span class="muted-text">${esc(s.desc?.cs ?? "")}</span>
              ${equipped
                ? `<span class="badge-equipped">Nasazeno</span>`
                : `<button class="btn-buy btn-equip-sign" data-sign="${key}">Nasadit</button>`
              }
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  root.querySelector("#signs-back")?.addEventListener("click", onBack);

  root.querySelectorAll(".btn-equip-sign").forEach(btn => {
    btn.addEventListener("click", async () => {
      const { updateDoc, doc: firestoreDoc } = await import("firebase/firestore");
      await updateDoc(firestoreDoc(db, "characters", uid), {
        equippedSign: btn.dataset.sign,
      });
      showToast(`Znamení ${btn.dataset.sign} nasazeno!`, "success");
      await refreshCharacter();
      renderSignsScreen(root, currentCharacter, uid, onBack);
    });
  });
}

// ─────────────────────────────────────────────
//  REFRESH POSTAVY
// ─────────────────────────────────────────────

async function refreshCharacter() {
  if (!currentUser) return;
  const snap = await getDoc(doc(db, "characters", currentUser.uid));
  if (snap.exists()) {
    currentCharacter = snap.data();
    equippedItems    = await loadEquippedItems(currentCharacter);
  }
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

function _schoolEmblem(school) {
  return { vlk: "🐺", medved: "🐻", zmije: "🐍" }[school] ?? "⚔";
}

// ─────────────────────────────────────────────
//  GLOBÁLNÍ EXPOZICE
// ─────────────────────────────────────────────

window.switchLang = function(lang) { setLang(lang); location.reload(); };

// ─────────────────────────────────────────────
//  AUTH GUARD + INIT
// ─────────────────────────────────────────────

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "/"; return; }
  currentUser = user;

  const root = document.getElementById("root");
  if (root) root.innerHTML = htmlLoading(t("loading"));

  const snap = await getDoc(doc(db, "characters", user.uid));
  if (!snap.exists()) {
    if (root) root.innerHTML = `<div class="card"><p class="error-text">Postava nenalezena. Zaregistruj se znovu.</p></div>`;
    return;
  }

  currentCharacter = snap.data();
  equippedItems    = await loadEquippedItems(currentCharacter);
  renderDashboard();
});
