/**
 * Vědmák: Pogromca Leszych — Kovář & Stáje
 * Autor: Alexandre Basseville
 */

import { db } from "./firebase.js";
import {
  doc, getDoc, updateDoc, runTransaction, setDoc, Timestamp, collection, query, where, getDocs,
} from "firebase/firestore";
import { t } from "./i18n.js";
import { esc, showToast, withButtonLock } from "./ui-utils.js";

// ─────────────────────────────────────────────
//  KATALOG ZBRANÍ & ZBROJÍ
// ─────────────────────────────────────────────

export const WEAPONS = [
  { id: "iron_sword",    name: "Železný meč",      icon: "🗡",  price: 80,  bonusSila: 4,  bonusObrana: 0, bonusAlch: 0 },
  { id: "silver_sword",  name: "Stříbrný meč",     icon: "⚔",  price: 180, bonusSila: 8,  bonusObrana: 0, bonusAlch: 0 },
  { id: "runic_axe",     name: "Runová sekera",     icon: "🪓",  price: 250, bonusSila: 12, bonusObrana: 1, bonusAlch: 0 },
  { id: "cursed_dagger", name: "Prokletá dýka",     icon: "🔪",  price: 130, bonusSila: 6,  bonusObrana: 0, bonusAlch: 3 },
];

export const ARMORS = [
  { id: "hunter_jacket", name: "Lovecká kazajka",  icon: "🧥",  price: 70,  bonusSila: 0,  bonusObrana: 4, bonusAlch: 0 },
  { id: "studded_armor", name: "Okovaná zbroj",    icon: "🛡",  price: 160, bonusSila: 0,  bonusObrana: 8, bonusAlch: 0 },
  { id: "plate_armor",   name: "Plátová zbroj",    icon: "🔰",  price: 300, bonusSila: 1,  bonusObrana: 14,bonusAlch: 0 },
  { id: "rune_ring",     name: "Runový prstenec",  icon: "💍",  price: 200, bonusSila: 2,  bonusObrana: 3, bonusAlch: 5 },
];

// ─────────────────────────────────────────────
//  KATALOG STÁJÍ
// ─────────────────────────────────────────────

export const MOUNTS = [
  { id: "klepna",    name: "Klepna",              icon: "🐴", price: 80,  mountBonus: 0.10, desc: "-10% doby cesty" },
  { id: "war_horse", name: "Válečný kůň",         icon: "🐎", price: 200, mountBonus: 0.25, desc: "-25% doby cesty" },
  { id: "teleport",  name: "Amulet teleportace",  icon: "💎", price: 400, mountBonus: 0.50, desc: "-50% doby cesty" },
];

// ─────────────────────────────────────────────
//  KOVÁŘ
// ─────────────────────────────────────────────

export async function renderShopScreen(root, character, uid, onBack, onRefresh) {
  if (!root) return;

  const ownedIds = await _loadOwnedIds(uid);

  root.innerHTML = `
    <div class="screen-header">
      <h2>🔨 ${t("shop_title")}</h2>
      <button class="btn-back" id="shop-back">← ${t("back")}</button>
    </div>

    <div class="card">
      <span class="oreny-display">💰 ${character.oreny ?? 0} Orenů</span>
    </div>

    <div class="card">
      <p class="section-label">${t("shop_weapons")}</p>
      <div class="item-grid" id="weapons-grid">
        ${WEAPONS.map(w => _itemCard(w, ownedIds, character.equippedWeaponId, "weapon")).join("")}
      </div>
    </div>

    <div class="card">
      <p class="section-label">${t("shop_armors")}</p>
      <div class="item-grid" id="armors-grid">
        ${ARMORS.map(a => _itemCard(a, ownedIds, character.equippedArmorId, "armor")).join("")}
      </div>
    </div>

    <div id="shop-status"></div>
  `;

  root.querySelector("#shop-back")?.addEventListener("click", onBack);

  root.querySelectorAll(".btn-buy").forEach(btn => {
    btn.addEventListener("click", async () => {
      const itemId = btn.dataset.item;
      const itemType = btn.dataset.type;
      const item = [...WEAPONS, ...ARMORS].find(i => i.id === itemId);
      if (!item) return;

      await withButtonLock(btn, "Kupuji…", async () => {
        try {
          await _buyItem(uid, item, character, itemType);
          showToast(t("shop_bought"), "success");
          onRefresh();
        } catch (e) {
          showToast(e.message, "error");
          throw e;
        }
      });
    });
  });

  root.querySelectorAll(".btn-equip").forEach(btn => {
    btn.addEventListener("click", async () => {
      const itemId = btn.dataset.item;
      const itemType = btn.dataset.type;
      const field = itemType === "weapon" ? "equippedWeaponId" : "equippedArmorId";

      await withButtonLock(btn, "…", async () => {
        await updateDoc(doc(db, "characters", uid), { [field]: itemId });
        showToast("Vybaveno!", "success");
        onRefresh();
      });
    });
  });
}

// ─────────────────────────────────────────────
//  STÁJE
// ─────────────────────────────────────────────

export async function renderStablesScreen(root, character, uid, onBack, onRefresh) {
  if (!root) return;

  root.innerHTML = `
    <div class="screen-header">
      <h2>🐎 ${t("stables_title")}</h2>
      <button class="btn-back" id="stables-back">← ${t("back")}</button>
    </div>

    <div class="card">
      <span class="oreny-display">💰 ${character.oreny ?? 0} Orenů</span>
      <p class="muted-text" style="margin-top:8px;">
        Aktuální bonus: <strong>-${Math.round((character.mountBonus ?? 0) * 100)}%</strong>
      </p>
    </div>

    <div class="card">
      <div class="mounts-grid">
        ${MOUNTS.map(m => _mountCard(m, character)).join("")}
      </div>
    </div>
  `;

  root.querySelector("#stables-back")?.addEventListener("click", onBack);

  root.querySelectorAll(".btn-buy-mount").forEach(btn => {
    btn.addEventListener("click", async () => {
      const mountId = btn.dataset.mount;
      const mount   = MOUNTS.find(m => m.id === mountId);
      if (!mount) return;

      await withButtonLock(btn, "Kupuji…", async () => {
        if ((character.oreny ?? 0) < mount.price) {
          showToast(t("shop_not_enough"), "error"); return;
        }
        const newOreny  = (character.oreny ?? 0) - mount.price;
        const newBonus  = Math.max(character.mountBonus ?? 0, mount.mountBonus);
        await updateDoc(doc(db, "characters", uid), {
          oreny: newOreny,
          mountBonus: newBonus,
        });
        showToast(`${mount.name} zakoupen!`, "success");
        onRefresh();
      });
    });
  });
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

async function _loadOwnedIds(uid) {
  const q = query(collection(db, "inventory"), where("userId", "==", uid));
  const snap = await getDocs(q);
  return new Set(snap.docs.map(d => d.data().itemId));
}

async function _buyItem(uid, item, character, itemType) {
  const charRef  = doc(db, "characters", uid);
  const invRef   = doc(db, "inventory",  `${uid}_${item.id}`);

  await runTransaction(db, async (tx) => {
    const charSnap = await tx.get(charRef);
    const invSnap  = await tx.get(invRef);

    if (!charSnap.exists()) throw new Error("Postava nenalezena.");
    if (invSnap.exists())   throw new Error("Tento předmět již vlastníš.");

    const data = charSnap.data();
    if ((data.oreny ?? 0) < item.price) throw new Error(t("shop_not_enough"));

    tx.update(charRef, { oreny: (data.oreny ?? 0) - item.price });
    tx.set(invRef, {
      userId:      uid,
      itemId:      item.id,
      name:        item.name,
      type:        itemType,
      bonusSila:   item.bonusSila   ?? 0,
      bonusObrana: item.bonusObrana ?? 0,
      bonusAlch:   item.bonusAlch   ?? 0,
      price:       item.price,
      ownedAt:     Timestamp.now(),
    });
  });
}

function _itemCard(item, ownedIds, equippedId, type) {
  const owned    = ownedIds.has(item.id);
  const equipped = equippedId === item.id;

  return `
    <div class="item-card ${equipped ? "equipped" : ""}">
      <span class="item-icon">${item.icon}</span>
      <div class="item-info">
        <strong>${esc(item.name)}</strong>
        <span class="item-stats">
          ${item.bonusSila > 0  ? `⚔ +${item.bonusSila}` : ""}
          ${item.bonusObrana > 0 ? `🛡 +${item.bonusObrana}` : ""}
          ${item.bonusAlch > 0  ? `⚗ +${item.bonusAlch}` : ""}
        </span>
        <span class="item-price">💰 ${item.price} oren</span>
      </div>
      ${equipped
        ? `<span class="badge-equipped">Nasazeno</span>`
        : owned
          ? `<button class="btn-equip" data-item="${item.id}" data-type="${type}">${t("shop_equip")}</button>`
          : `<button class="btn-buy"   data-item="${item.id}" data-type="${type}">${t("shop_buy")}</button>`
      }
    </div>
  `;
}

function _mountCard(mount, character) {
  const active = (character.mountBonus ?? 0) >= mount.mountBonus;
  return `
    <div class="mount-card ${active ? "mount-active" : ""}">
      <span class="mount-icon">${mount.icon}</span>
      <div class="mount-info">
        <strong>${esc(mount.name)}</strong>
        <span class="muted-text">${esc(mount.desc)}</span>
        <span class="item-price">💰 ${mount.price} oren</span>
      </div>
      ${active
        ? `<span class="badge-equipped">Vlastníš</span>`
        : `<button class="btn-buy-mount" data-mount="${mount.id}">${t("shop_buy")}</button>`
      }
    </div>
  `;
}
