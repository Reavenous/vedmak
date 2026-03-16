/**
 * Vědmák: Pogromca Leszych — Hospoda (léčení)
 * Autor: Alexandre Basseville
 */

import { db } from "./firebase.js";
import { doc, updateDoc } from "firebase/firestore";
import { t } from "./i18n.js";
import { esc, showToast, withButtonLock } from "./ui-utils.js";

const FOOD_MENU = [
  { id: "bread",  name: "Chleba s loja",  icon: "🍞", price: 10, healPct: 0.25, desc: "Obnoví 25% maxHP" },
  { id: "stew",   name: "Hustá polévka",  icon: "🍲", price: 30, healPct: 0.55, desc: "Obnoví 55% maxHP" },
  { id: "mead",   name: "Plná medovina",  icon: "🍺", price: 60, healPct: 1.00, desc: "Obnoví plné HP" },
];

export async function renderTavernScreen(root, character, uid, onBack, onRefresh) {
  if (!root) return;

  const maxHp = character.maxHp ?? 100;
  const curHp = character.hp    ?? 100;
  const hpPct = Math.round((curHp / maxHp) * 100);

  root.innerHTML = `
    <div class="screen-header">
      <h2>🍺 ${t("tavern_title")}</h2>
      <button class="btn-back" id="tav-back">← ${t("back")}</button>
    </div>

    <div class="card">
      <p class="section-label">Tvůj stav</p>
      <div class="hp-display">
        <div class="hp-bar-outer"><div class="hp-bar-inner" style="width:${hpPct}%"></div></div>
        <span>${curHp} / ${maxHp} HP</span>
      </div>
      <span class="oreny-display" style="margin-top:10px;display:block;">💰 ${character.oreny ?? 0} Orenů</span>
      ${curHp >= maxHp ? `<p class="muted-text" style="margin-top:8px;">${t("tavern_full_hp")}</p>` : ""}
    </div>

    <div class="card">
      <p class="section-label">Jídelní lístek</p>
      <div class="food-grid">
        ${FOOD_MENU.map(f => `
          <div class="food-card">
            <span class="food-icon">${f.icon}</span>
            <div>
              <strong>${esc(f.name)}</strong>
              <span class="muted-text">${esc(f.desc)}</span>
              <span class="item-price">💰 ${f.price} oren</span>
            </div>
            <button class="btn-buy btn-heal" data-food="${f.id}"
              ${curHp >= maxHp ? "disabled" : ""}>${t("tavern_heal")}</button>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  root.querySelector("#tav-back")?.addEventListener("click", onBack);

  root.querySelectorAll(".btn-heal").forEach(btn => {
    btn.addEventListener("click", async () => {
      const foodId = btn.dataset.food;
      const food   = FOOD_MENU.find(f => f.id === foodId);
      if (!food) return;

      await withButtonLock(btn, "…", async () => {
        if ((character.oreny ?? 0) < food.price) {
          showToast(t("shop_not_enough"), "error"); return;
        }
        const heal    = Math.round(maxHp * food.healPct);
        const newHp   = Math.min(maxHp, curHp + heal);
        const newOren = (character.oreny ?? 0) - food.price;
        await updateDoc(doc(db, "characters", uid), { hp: newHp, oreny: newOren });
        showToast(`${t("tavern_healed")} +${heal} HP`, "success");
        onRefresh();
      });
    });
  });
}
