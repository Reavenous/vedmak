# Vědmák: Pogromca Leszych
**Autor: Alexandre Basseville**

Temné fantasy RPG ze slovanské mytologie — multi-page webová aplikace s Firebase backendem.

---

## Stack

| Vrstva    | Technologie                            |
|-----------|----------------------------------------|
| Frontend  | Čistý JavaScript (ES Modules), HTML/CSS|
| Bundler   | Vite 5                                 |
| Backend   | Firebase v10 (Auth + Firestore)        |
| Hosting   | Firebase Hosting                       |

---

## Funkce

- 🔐 **Registrace / Přihlášení** — Firebase Auth, výběr školy (Vlk / Medvěd / Zmije)
- ⚔ **Cestování & Lov (PvE)** — 10 slovanských vesnic, 10 bestií, časovač cesty s mount bonusem
- 🏟 **Aréna (PvP)** — matchmaking podle levelu, automatický souboj
- ✦ **Zaklínačská Znamení** — Aard, Igni, Quen, Yrden, Axii s unikátními efekty
- 🔨 **Kovář** — nákup a vybavení zbraní a zbrojí
- 🐎 **Stáje** — oři a amulety zkracující dobu cesty
- 🍺 **Hospoda** — léčení HP za Oreny
- 🏆 **Žebříček** — top 20 Zaklínačů podle XP
- 💬 **Chat školy** — real-time Firestore chat izolovaný per-škola
- 🌐 **7 jazyků** — CS, EN, FR, ES, DE, PL, NL (uloženo v localStorage)

---

## Rychlý start

### 1. Klonuj a nainstaluj závislosti

```bash
npm install
```

### 2. Vytvoř Firebase projekt

1. Přejdi na [console.firebase.google.com](https://console.firebase.google.com)
2. Vytvoř nový projekt
3. Přidej **webovou aplikaci** (ikona `</>`)
4. Zkopíruj `firebaseConfig` objekt

### 3. Nastav Firebase konfiguraci

Otevři `src/firebase.js` a nahraď placeholdery svými hodnotami:

```js
const firebaseConfig = {
  apiKey:            "TVOJE_API_KEY",
  authDomain:        "TVUJ_PROJEKT.firebaseapp.com",
  projectId:         "TVUJ_PROJEKT",
  storageBucket:     "TVUJ_PROJEKT.appspot.com",
  messagingSenderId: "TVOJE_SENDER_ID",
  appId:             "TVOJE_APP_ID",
};
```

### 4. Aktivuj Firebase služby

V Firebase konzoli:
- **Authentication** → Sign-in providers → Email/Password → Povolit
- **Firestore Database** → Vytvořit databázi (Production mode)

### 5. Spusť vývojový server

```bash
npm run dev
```

Aplikace poběží na `http://localhost:5173`

---

## Build a nasazení

```bash
# Build pro produkci
npm run build

# Nasazení na Firebase Hosting
npm run deploy
```

Před nasazením musíš být přihlášen přes Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase use --add   # vyber svůj projekt
```

---

## Firestore bezpečnostní pravidla

Pravidla jsou v `firestore.rules`. Nasazení:
```bash
firebase deploy --only firestore:rules
```

Klíčové bezpečnostní prvky:
- Hráč edituje **pouze svou postavu** (`characters/{uid}`)
- Inventář čte/píše jen **vlastník** záznamu
- Chat čte/píše jen hráč se **stejnou školou**

---

## Hudba

V `dashboard.html` je připraven `<audio id="bg-music">` tag s `<source src="assets/music/theme.mp3">`.  
Přidej soubor `public/assets/music/theme.mp3` pro funkční přehrávač.

---

## Struktura projektu

```
vedmak/
├── index.html          # Přihlášení / registrace
├── dashboard.html      # Hlavní herní obrazovka
├── vite.config.js
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
└── src/
    ├── firebase.js     # Firebase init
    ├── i18n.js         # Multi-language slovník
    ├── ui-utils.js     # Toast, button lock, escape
    ├── auth.js         # Login / register logika
    ├── dashboard.js    # Hlavní herní hub + routing
    ├── travel.js       # Cestování & Lov (PvE)
    ├── arena.js        # Aréna (PvP)
    ├── shop.js         # Kovář + Stáje
    ├── tavern.js       # Hospoda (léčení)
    ├── leaderboard.js  # Žebříček
    ├── chat.js         # Real-time chat školy
    └── logic/
        ├── game-logic.js       # Stat výpočty
        ├── leveling-logic.js   # XP / level křivka
        └── combat-logic.js     # Zaklínačská Znamení + souboj
```

---

*Padislav hra vytvořena jako školní projekt*
