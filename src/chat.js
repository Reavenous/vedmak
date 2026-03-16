/**
 * Vědmák: Pogromca Leszych — Chat školy (real-time)
 * Autor: Alexandre Basseville
 *
 * Pouze členové stejné školy vidí své zprávy.
 * Firestore query: where("school", "==", user.school)
 * Maximálně 50 posledních zpráv, seřazených dle timestamp.
 */

import { db } from "./firebase.js";
import {
  collection, query, where, orderBy, limit,
  addDoc, onSnapshot, Timestamp, serverTimestamp,
} from "firebase/firestore";
import { t } from "./i18n.js";
import { esc, showToast } from "./ui-utils.js";

let _unsubscribe = null;

export function renderChatScreen(root, character, uid, onBack) {
  if (!root) return;

  // Odhlásíme předchozí listener pokud existuje
  if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }

  root.innerHTML = `
    <div class="screen-header">
      <h2>💬 ${t("chat_title")} — ${_schoolName(character.school)}</h2>
      <button class="btn-back" id="chat-back">← ${t("back")}</button>
    </div>

    <div class="card chat-card">
      <div class="chat-messages" id="chat-messages">
        <p class="muted-text chat-loading">Načítám zprávy…</p>
      </div>
      <div class="chat-input-row">
        <input
          type="text"
          id="chat-input"
          class="chat-input"
          maxlength="300"
          placeholder="${t("chat_placeholder")}"
        />
        <button class="btn-primary btn-send" id="btn-send">${t("chat_send")}</button>
      </div>
    </div>
  `;

  root.querySelector("#chat-back")?.addEventListener("click", () => {
    if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
    onBack();
  });

  // Real-time listener
  const q = query(
    collection(db, "schoolChat"),
    where("school", "==", character.school),
    orderBy("timestamp", "asc"),
    limit(50)
  );

  _unsubscribe = onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    _renderMessages(msgs, uid);
  }, (err) => {
    console.error("[Vědmák/chat] Firestore chyba:", err);
    showToast("Chat nedostupný.", "error");
  });

  // Odeslání zprávy
  const sendBtn   = document.getElementById("btn-send");
  const chatInput = document.getElementById("chat-input");

  async function sendMessage() {
    const text = chatInput?.value.trim();
    if (!text) return;

    chatInput.value = "";
    chatInput.disabled = true;
    sendBtn.disabled = true;

    try {
      await addDoc(collection(db, "schoolChat"), {
        uid,
        school:     character.school,
        senderName: character.name ?? "Zaklínač",
        text,
        timestamp:  serverTimestamp(),
      });
    } catch (e) {
      console.error("[Vědmák/chat] Chyba odesílání:", e);
      showToast("Zprávu se nepodařilo odeslat.", "error");
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled   = false;
      chatInput.focus();
    }
  }

  sendBtn?.addEventListener("click", sendMessage);
  chatInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
}

function _renderMessages(msgs, myUid) {
  const container = document.getElementById("chat-messages");
  if (!container) return;

  if (msgs.length === 0) {
    container.innerHTML = `<p class="muted-text">${t("chat_empty")}</p>`;
    return;
  }

  container.innerHTML = msgs.map(m => {
    const isMe = m.uid === myUid;
    const time = m.timestamp?.toDate
      ? m.timestamp.toDate().toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })
      : "";

    return `
      <div class="chat-msg ${isMe ? "chat-msg-me" : "chat-msg-other"}">
        ${!isMe ? `<span class="chat-sender">${esc(m.senderName)}</span>` : ""}
        <div class="chat-bubble">
          <span class="chat-text">${esc(m.text)}</span>
          <span class="chat-time">${time}</span>
        </div>
      </div>
    `;
  }).join("");

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function _schoolName(school) {
  return { vlk: "Škola Vlka 🐺", medved: "Škola Medvěda 🐻", zmije: "Škola Zmije 🐍" }[school] ?? school ?? "—";
}

/** Zavolej při opuštění stránky aby se odpojil listener */
export function destroyChat() {
  if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
}
