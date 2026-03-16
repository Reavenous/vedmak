/**
 * Vědmák: Pogromca Leszych — Autentizace
 * Autor: Alexandre Basseville
 */

import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { t, initI18n, setLang, getLang, SUPPORTED_LANGS } from "./i18n.js";
import { showStatus, clearStatus, withButtonLock } from "./ui-utils.js";

initI18n();

// ─────────────────────────────────────────────
//  CHYBOVÉ PŘEKLADY
// ─────────────────────────────────────────────

function friendlyError(code) {
  const map = {
    "auth/user-not-found":    t("auth_user_not_found"),
    "auth/wrong-password":    t("auth_wrong_pass"),
    "auth/invalid-email":     t("auth_unknown"),
    "auth/email-already-in-use": t("auth_email_used"),
    "auth/weak-password":     t("auth_weak_pass"),
    "auth/too-many-requests": t("auth_unknown"),
    "auth/invalid-credential": t("auth_wrong_pass"),
  };
  return map[code] ?? t("auth_unknown");
}

// ─────────────────────────────────────────────
//  TAB PŘEPÍNÁNÍ
// ─────────────────────────────────────────────

window.switchTab = function(tab) {
  document.querySelectorAll(".tab-btn").forEach((b, i) => {
    b.classList.toggle("active",
      (tab === "login" && i === 0) || (tab === "register" && i === 1)
    );
  });
  document.getElementById("form-login")?.classList.toggle("active", tab === "login");
  document.getElementById("form-register")?.classList.toggle("active", tab === "register");
  clearStatus("login-status");
  clearStatus("register-status");
};

// ─────────────────────────────────────────────
//  PŘIHLÁŠENÍ
// ─────────────────────────────────────────────

async function handleLogin() {
  const email = document.getElementById("login-email")?.value.trim();
  const pass  = document.getElementById("login-password")?.value;

  clearStatus("login-status");
  if (!email || !pass) { showStatus("login-status", "error", t("fill_all_fields")); return; }

  const btn = document.getElementById("btn-login");
  await withButtonLock(btn, t("loading"), async () => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      showStatus("login-status", "success", t("login_success"));
    } catch (e) {
      showStatus("login-status", "error", friendlyError(e.code));
      throw e;
    }
  });
}

// ─────────────────────────────────────────────
//  REGISTRACE
// ─────────────────────────────────────────────

let isRegistering = false;

async function handleRegister() {
  const name   = document.getElementById("register-name")?.value.trim();
  const school = document.getElementById("register-school")?.value;
  const email  = document.getElementById("register-email")?.value.trim();
  const pass   = document.getElementById("register-password")?.value;

  clearStatus("register-status");

  if (!name || !school || !email || !pass) {
    showStatus("register-status", "error", t("fill_all_fields")); return;
  }
  if (name.length < 2) {
    showStatus("register-status", "error", t("name_too_short")); return;
  }

  const btn = document.getElementById("btn-register");
  isRegistering = true;

  await withButtonLock(btn, t("loading"), async () => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const uid  = cred.user.uid;
      const now  = Timestamp.now();

      showStatus("register-status", "success", "Zapisuji Zaklínačský průkaz…");

      await setDoc(doc(db, "characters", uid), {
        userId:         uid,
        name,
        school,
        email,
        level:          1,
        xp:             0,
        hp:             100,
        maxHp:          100,
        sila:           10,
        obrana:         5,
        alchymie:       3,
        oreny:          100,
        equippedWeaponId: null,
        equippedArmorId:  null,
        equippedSign:     null,
        mountBonus:       0,
        createdAt:      now,
      });

      showStatus("register-status", "success", t("register_success"));
      isRegistering = false;
      setTimeout(() => { window.location.href = "/dashboard.html"; }, 800);

    } catch (e) {
      isRegistering = false;
      const isAuthErr = e.code?.startsWith("auth/");
      showStatus("register-status", "error",
        isAuthErr ? friendlyError(e.code) : `DB chyba: ${e.message}`
      );
      throw e;
    }
  });
}

// ─────────────────────────────────────────────
//  GLOBÁLNÍ EXPOZICE
// ─────────────────────────────────────────────

window.handleLogin    = handleLogin;
window.handleRegister = handleRegister;
window.switchLang     = function(lang) { setLang(lang); location.reload(); };

// ─────────────────────────────────────────────
//  ENTER KLÁVESA
// ─────────────────────────────────────────────

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (document.getElementById("form-login")?.classList.contains("active")) {
    handleLogin();
  } else {
    handleRegister();
  }
});

// ─────────────────────────────────────────────
//  AUTH STATE → přesměrování
// ─────────────────────────────────────────────

onAuthStateChanged(auth, (user) => {
  if (user && !isRegistering) {
    window.location.href = "/dashboard.html";
  }
});

// ─────────────────────────────────────────────
//  POZADÍ — runy / kapky krve
// ─────────────────────────────────────────────

function createBloodDrops() {
  const bg = document.getElementById("blood-bg");
  if (!bg) return;
  for (let i = 0; i < 30; i++) {
    const d = document.createElement("div");
    d.className = "blood-drop";
    d.style.cssText = `
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      width:${1 + Math.random() * 2}px;
      height:${4 + Math.random() * 12}px;
      animation-delay:-${(Math.random() * 8).toFixed(1)}s;
      opacity:${0.1 + Math.random() * 0.25};
    `;
    bg.appendChild(d);
  }
}

// ─────────────────────────────────────────────
//  INICIALIZACE STRÁNKY (překlady)
// ─────────────────────────────────────────────

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-val]").forEach(el => {
    el.value = t(el.dataset.i18nVal);
  });

  // Žlutá aktivní vlaječka
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === getLang());
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyTranslations();
  createBloodDrops();
});
