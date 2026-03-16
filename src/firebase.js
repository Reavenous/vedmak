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

  apiKey: "AIzaSyCmZtVUzMcF0cXsOtmpNlFugWcXceYk9XY",

  authDomain: "vedmak-eeff.firebaseapp.com",

  databaseURL: "https://vedmak-eeff-default-rtdb.europe-west1.firebasedatabase.app",

  projectId: "vedmak-eeff",

  storageBucket: "vedmak-eeff.firebasestorage.app",

  messagingSenderId: "281135497000",

  appId: "1:281135497000:web:be1448859538bba5361a1d",

  measurementId: "G-866NPGC66W"

};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

export default app;
