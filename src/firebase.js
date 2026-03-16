/**
 * Vědmák: Pogromca Leszych — Firebase inicializace
 * Autor: Alexandre Basseville
 *
 * Exportuje:
 *   auth  — Firebase Authentication
 *   db    — Firestore databáze
 *
 * INSTRUKCE: Nahraď firebaseConfig hodnotami z tvého Firebase projektu:
 *   https://console.firebase.google.com → Nastavení projektu → Webová aplikace
 */

import { initializeApp } from "firebase/app";
import { getAuth }        from "firebase/auth";
import { getFirestore }   from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "TVOJE_API_KEY",
  authDomain:        "TVUJ_PROJEKT.firebaseapp.com",
  projectId:         "TVUJ_PROJEKT",
  storageBucket:     "TVUJ_PROJEKT.appspot.com",
  messagingSenderId: "TVOJE_SENDER_ID",
  appId:             "TVOJE_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

export default app;
