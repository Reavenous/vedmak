/**
 * Vědmák: Pogromca Leszych — Žebříček (Síň slávy)
 * Autor: Alexandre Basseville
 */

import { db } from "./firebase.js";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { t } from "./i18n.js";
import { esc, htmlLoading } from "./ui-utils.js";

const LIMIT = 20;
const SCHOOL_EMBLEMS = { vlk: "🐺", medved: "🐻", zmije: "🐍" };
const MEDALS = ["🥇", "🥈", "🥉"];

export async function renderLeaderboardScreen(root, currentUid, onBack) {
  if (!root) return;
  root.innerHTML = htmlLoading(t("loading"));

  try {
    const q = query(
      collection(db, "characters"),
      orderBy("xp",    "desc"),
      orderBy("level", "desc"),
      limit(LIMIT)
    );
    const snap = await getDocs(q);
    const players = snap.docs.map(d => ({ id: d.id, data: d.data() }));
    _render(root, players, currentUid, onBack);
  } catch (err) {
    root.innerHTML = `
      <div class="screen-header"><h2>💀 Chyba</h2></div>
      <div class="card"><p class="muted-text">${esc(err.message)}</p>
      <button class="btn-back" id="lb-back">← ${t("back")}</button></div>
    `;
    root.querySelector("#lb-back")?.addEventListener("click", onBack);
  }
}

function _render(root, players, currentUid, onBack) {
  const rows = players.map((p, i) => {
    const d      = p.data;
    const isMe   = p.id === currentUid;
    const medal  = MEDALS[i] ?? null;
    const emblem = SCHOOL_EMBLEMS[d.school] ?? "⚔";
    const { level, progressPct, nextLevelXp } = _levelInfo(d.xp ?? 0);
    const xpReq  = nextLevelXp;

    return `
      <div class="lb-row ${isMe ? "lb-row-me" : ""} ${i < 3 ? "lb-top3" : ""}">
        <div class="lb-rank">
          ${medal ? `<span class="lb-medal">${medal}</span>` : `<span class="lb-num">#${i + 1}</span>`}
        </div>
        <div class="lb-emblem">${emblem}</div>
        <div class="lb-main">
          <div class="lb-name">
            ${esc(d.name ?? "Neznámý")}
            ${isMe ? '<span class="lb-you">ty</span>' : ""}
          </div>
          <div class="lb-school">${_schoolName(d.school)}</div>
          <div class="lb-xp-wrap">
            <div class="lb-xp-bar"><div class="lb-xp-fill" style="width:${progressPct}%"></div></div>
            <span class="lb-xp-text">${d.xp ?? 0} / ${xpReq} XP</span>
          </div>
        </div>
        <div class="lb-stats">
          <span class="lb-level">Lv.${level}</span>
          <span class="lb-sub">⚔ ${d.sila ?? 10}</span>
          <span class="lb-sub">🛡 ${d.obrana ?? 5}</span>
          <span class="lb-sub">💰 ${d.oreny ?? 0}</span>
        </div>
      </div>
    `;
  }).join("");

  root.innerHTML = `
    <div class="screen-header">
      <h2>🏆 ${t("lb_title")}</h2>
      <button class="btn-back" id="lb-back">← ${t("back")}</button>
    </div>
    <div class="card lb-card">
      ${players.length === 0
        ? `<p class="muted-text">${t("lb_empty")}</p>`
        : `<div class="lb-list">${rows}</div>`
      }
    </div>
  `;
  root.querySelector("#lb-back")?.addEventListener("click", onBack);
}

function _levelInfo(xp) {
  const x = Math.max(0, xp);
  const level = Math.floor(Math.sqrt(x / 100)) + 1;
  const base  = Math.pow(level - 1, 2) * 100;
  const next  = Math.pow(level, 2) * 100;
  const pct   = Math.min(100, Math.round(((x - base) / (next - base)) * 100));
  return { level, progressPct: pct, nextLevelXp: next };
}

function _schoolName(school) {
  return { vlk: "Škola Vlka", medved: "Škola Medvěda", zmije: "Škola Zmije" }[school] ?? school ?? "—";
}
