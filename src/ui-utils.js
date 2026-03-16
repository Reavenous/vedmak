/**
 * Vědmák: Pogromca Leszych — Sdílené UI utility
 * Autor: Alexandre Basseville
 */

// ─────────────────────────────────────────────
//  HTML ESCAPE
// ─────────────────────────────────────────────

export function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─────────────────────────────────────────────
//  BUTTON LOCK
// ─────────────────────────────────────────────

export async function withButtonLock(btn, loadingText, fn) {
  if (!btn || btn.disabled) return;
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-inline"></span>${loadingText}`;
  try {
    return await fn();
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
}

// ─────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────

export function showToast(msg, type = "info", duration = 3500) {
  const old = document.getElementById("vd-toast");
  if (old) old.remove();

  const colors = {
    success: { bg: "rgba(30,60,20,.97)", border: "rgba(80,180,50,.5)", text: "#a8f080" },
    error:   { bg: "rgba(60,10,10,.97)", border: "rgba(180,30,30,.5)", text: "#f09090" },
    info:    { bg: "rgba(20,15,10,.97)", border: "rgba(138,3,3,.4)",   text: "#c0c0c0" },
  };
  const c = colors[type] ?? colors.info;

  const el = document.createElement("div");
  el.id = "vd-toast";
  el.style.cssText = `
    position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
    background:${c.bg};border:1px solid ${c.border};
    border-radius:8px;padding:12px 24px;color:${c.text};
    font-size:14px;z-index:9999;
    max-width:min(380px,calc(100vw - 32px));
    text-align:center;line-height:1.5;
    box-shadow:0 4px 24px rgba(0,0,0,.6);
    animation:toastIn .25s ease both;
    font-family:'Cinzel',serif;letter-spacing:.04em;
  `;
  el.textContent = msg;
  document.body.appendChild(el);

  if (!document.getElementById("vd-toast-style")) {
    const s = document.createElement("style");
    s.id = "vd-toast-style";
    s.textContent = `
      @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
      .spinner-inline{display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,.3);border-top-color:#c0c0c0;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:8px;}
      @keyframes spin{to{transform:rotate(360deg)}}
    `;
    document.head.appendChild(s);
  }

  setTimeout(() => el.remove(), duration);
}

// ─────────────────────────────────────────────
//  STATUS HELPER
// ─────────────────────────────────────────────

export function showStatus(elId, type, msg) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.className = "status " + type;
  el.innerHTML = msg;
}

export function clearStatus(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.className = "status";
  el.innerHTML = "";
}

// ─────────────────────────────────────────────
//  LOADING HTML
// ─────────────────────────────────────────────

export function htmlLoading(text = "Načítám…") {
  return `<div class="loading-wrap"><div class="rune-spinner"></div><p class="loading-text">${esc(text)}</p></div>`;
}
