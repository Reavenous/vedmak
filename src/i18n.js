/**
 * Vědmák: Pogromca Leszych — Internationalizace (i18n)
 * Autor: Alexandre Basseville
 *
 * Podporované jazyky: CS, EN, FR, ES, DE, PL, NL
 * Volba se ukládá do localStorage pod klíčem "vedmak_lang".
 */

const STORAGE_KEY = "vedmak_lang";
const SUPPORTED   = ["cs", "en", "fr", "es", "de", "pl", "nl"];
const DEFAULT     = "cs";

// ─────────────────────────────────────────────
//  SLOVNÍK
// ─────────────────────────────────────────────

const DICT = {
  // ── Přihlášení / Registrace ─────────────────
  login_title:         { cs:"Zaklínač se vrací", en:"The Witcher Returns", fr:"Le Sorceleur revient", es:"El Brujo regresa", de:"Der Hexer kehrt zurück", pl:"Wiedźmin powraca", nl:"De Heksenmeester keert terug" },
  login_subtitle:      { cs:"Přihlaš se ke svému kontratu", en:"Sign in to your contract", fr:"Connectez-vous à votre contrat", es:"Inicia sesión en tu contrato", de:"Melde dich bei deinem Vertrag an", pl:"Zaloguj się do swojego kontraktu", nl:"Log in op uw contract" },
  tab_login:           { cs:"Přihlášení", en:"Login", fr:"Connexion", es:"Iniciar sesión", de:"Anmelden", pl:"Logowanie", nl:"Inloggen" },
  tab_register:        { cs:"Registrace", en:"Register", fr:"S'inscrire", es:"Registrarse", de:"Registrieren", pl:"Rejestracja", nl:"Registreren" },
  email:               { cs:"Email", en:"Email", fr:"Email", es:"Correo", de:"E-Mail", pl:"Email", nl:"E-mail" },
  password:            { cs:"Heslo", en:"Password", fr:"Mot de passe", es:"Contraseña", de:"Passwort", pl:"Hasło", nl:"Wachtwoord" },
  witcher_name:        { cs:"Jméno Zaklínače", en:"Witcher Name", fr:"Nom du Sorceleur", es:"Nombre del Brujo", de:"Name des Hexers", pl:"Imię Wiedźmina", nl:"Naam van de Heksenmeester" },
  choose_school:       { cs:"Zaklínačská škola", en:"Witcher School", fr:"École du Sorceleur", es:"Escuela del Brujo", de:"Hexerschule", pl:"Szkoła Wiedźmina", nl:"Heksenmeesters School" },
  school_vlk:          { cs:"Škola Vlka", en:"School of the Wolf", fr:"École du Loup", es:"Escuela del Lobo", de:"Schule des Wolfes", pl:"Szkoła Wilka", nl:"School van de Wolf" },
  school_medved:       { cs:"Škola Medvěda", en:"School of the Bear", fr:"École de l'Ours", es:"Escuela del Oso", de:"Schule des Bären", pl:"Szkoła Niedźwiedzia", nl:"School van de Beer" },
  school_zmije:        { cs:"Škola Zmije", en:"School of the Viper", fr:"École de la Vipère", es:"Escuela de la Víbora", de:"Schule der Viper", pl:"Szkoła Żmii", nl:"School van de Viper" },
  btn_login:           { cs:"Vstoupit", en:"Enter", fr:"Entrer", es:"Entrar", de:"Eintreten", pl:"Wejdź", nl:"Binnentreden" },
  btn_register:        { cs:"Stát se Zaklínačem", en:"Become a Witcher", fr:"Devenir un Sorceleur", es:"Convertirse en Brujo", de:"Zum Hexer werden", pl:"Zostań Wiedźminem", nl:"Word een Heksenmeester" },
  fill_all_fields:     { cs:"Vyplň všechna pole.", en:"Fill in all fields.", fr:"Remplissez tous les champs.", es:"Complete todos los campos.", de:"Füllen Sie alle Felder aus.", pl:"Wypełnij wszystkie pola.", nl:"Vul alle velden in." },
  name_too_short:      { cs:"Jméno musí mít alespoň 2 znaky.", en:"Name must be at least 2 characters.", fr:"Le nom doit comporter au moins 2 caractères.", es:"El nombre debe tener al menos 2 caracteres.", de:"Der Name muss mindestens 2 Zeichen haben.", pl:"Imię musi mieć co najmniej 2 znaki.", nl:"Naam moet minimaal 2 tekens hebben." },
  login_success:       { cs:"Vítej zpět, Zaklínači.", en:"Welcome back, Witcher.", fr:"Bienvenue, Sorceleur.", es:"Bienvenido de nuevo, Brujo.", de:"Willkommen zurück, Hexer.", pl:"Witaj z powrotem, Wiedźminie.", nl:"Welkom terug, Heksenmeester." },
  register_success:    { cs:"Kontrakt podepsán. Přesměrovávám…", en:"Contract signed. Redirecting…", fr:"Contrat signé. Redirection…", es:"Contrato firmado. Redirigiendo…", de:"Vertrag unterzeichnet. Weiterleitung…", pl:"Kontrakt podpisany. Przekierowanie…", nl:"Contract ondertekend. Omleiden…" },
  auth_user_not_found: { cs:"Zaklínač s tímto emailem neexistuje.", en:"No Witcher with this email.", fr:"Aucun Sorceleur avec cet email.", es:"No existe Brujo con este correo.", de:"Kein Hexer mit dieser E-Mail.", pl:"Brak Wiedźmina z tym emailem.", nl:"Geen Heksenmeester met dit e-mailadres." },
  auth_wrong_pass:     { cs:"Nesprávné heslo.", en:"Wrong password.", fr:"Mot de passe incorrect.", es:"Contraseña incorrecta.", de:"Falsches Passwort.", pl:"Nieprawidłowe hasło.", nl:"Onjuist wachtwoord." },
  auth_email_used:     { cs:"Tento email je již používán.", en:"Email already in use.", fr:"Email déjà utilisé.", es:"Correo ya en uso.", de:"E-Mail bereits verwendet.", pl:"Email jest już używany.", nl:"E-mail al in gebruik." },
  auth_weak_pass:      { cs:"Heslo musí mít alespoň 6 znaků.", en:"Password must be at least 6 characters.", fr:"Le mot de passe doit comporter au moins 6 caractères.", es:"La contraseña debe tener al menos 6 caracteres.", de:"Passwort muss mindestens 6 Zeichen haben.", pl:"Hasło musi mieć co najmniej 6 znaków.", nl:"Wachtwoord moet minimaal 6 tekens hebben." },
  auth_unknown:        { cs:"Nastala neznámá chyba.", en:"An unknown error occurred.", fr:"Une erreur inconnue s'est produite.", es:"Ocurrió un error desconocido.", de:"Ein unbekannter Fehler ist aufgetreten.", pl:"Wystąpił nieznany błąd.", nl:"Er is een onbekende fout opgetreden." },

  // ── Dashboard ───────────────────────────────
  dash_welcome:        { cs:"Vítej,", en:"Welcome,", fr:"Bienvenue,", es:"Bienvenido,", de:"Willkommen,", pl:"Witaj,", nl:"Welkom," },
  dash_school:         { cs:"Škola", en:"School", fr:"École", es:"Escuela", de:"Schule", pl:"Szkoła", nl:"School" },
  dash_level:          { cs:"Úroveň", en:"Level", fr:"Niveau", es:"Nivel", de:"Stufe", pl:"Poziom", nl:"Niveau" },
  dash_hp:             { cs:"Životy", en:"Health", fr:"Santé", es:"Salud", de:"Leben", pl:"Życie", nl:"Gezondheid" },
  dash_xp:             { cs:"Zkušenosti", en:"Experience", fr:"Expérience", es:"Experiencia", de:"Erfahrung", pl:"Doświadczenie", nl:"Ervaring" },
  dash_oreny:          { cs:"Oreny", en:"Orens", fr:"Orens", es:"Oren", de:"Orens", pl:"Oreny", nl:"Orens" },
  dash_weapon:         { cs:"Zbraň", en:"Weapon", fr:"Arme", es:"Arma", de:"Waffe", pl:"Broń", nl:"Wapen" },
  dash_armor:          { cs:"Brnění", en:"Armor", fr:"Armure", es:"Armadura", de:"Rüstung", pl:"Zbroja", nl:"Wapenrusting" },
  dash_sign:           { cs:"Znamení", en:"Sign", fr:"Signe", es:"Signo", de:"Zeichen", pl:"Znak", nl:"Teken" },
  dash_mount:          { cs:"Oř / Amulet", en:"Mount / Amulet", fr:"Monture / Amulette", es:"Montura / Amuleto", de:"Reittier / Amulett", pl:"Wierzchowiec / Amulet", nl:"Rijdier / Amulet" },
  dash_none_equipped:  { cs:"Nevybaveno", en:"None equipped", fr:"Aucun équipé", es:"Sin equipar", de:"Nichts ausgerüstet", pl:"Nie wyposażono", nl:"Niets uitgerust" },
  nav_travel:          { cs:"Cestování & Lov", en:"Travel & Hunt", fr:"Voyage & Chasse", es:"Viaje & Caza", de:"Reise & Jagd", pl:"Podróż & Łowy", nl:"Reizen & Jagen" },
  nav_arena:           { cs:"Aréna", en:"Arena", fr:"Arène", es:"Arena", de:"Arena", pl:"Arena", nl:"Arena" },
  nav_shop:            { cs:"Kovář", en:"Blacksmith", fr:"Forgeron", es:"Herrero", de:"Schmied", pl:"Kowal", nl:"Smid" },
  nav_stables:         { cs:"Stáje", en:"Stables", fr:"Écuries", es:"Establos", de:"Ställe", pl:"Stajnie", nl:"Stallen" },
  nav_tavern:          { cs:"Hospoda", en:"Tavern", fr:"Taverne", es:"Taberna", de:"Taverne", pl:"Karczma", nl:"Herberg" },
  nav_leaderboard:     { cs:"Žebříček", en:"Leaderboard", fr:"Classement", es:"Clasificación", de:"Rangliste", pl:"Ranking", nl:"Ranglijst" },
  nav_chat:            { cs:"Chat školy", en:"School Chat", fr:"Chat de l'école", es:"Chat de la escuela", de:"Schulchat", pl:"Czat szkoły", nl:"Schoolchat" },
  nav_logout:          { cs:"Odhlásit", en:"Logout", fr:"Déconnexion", es:"Cerrar sesión", de:"Abmelden", pl:"Wyloguj", nl:"Uitloggen" },

  // ── Cestování ───────────────────────────────
  travel_title:        { cs:"Cestování & Lov", en:"Travel & Hunt", fr:"Voyage & Chasse", es:"Viaje & Caza", de:"Reise & Jagd", pl:"Podróż & Łowy", nl:"Reizen & Jagen" },
  travel_pick_village: { cs:"Vyber vesnici", en:"Choose a village", fr:"Choisir un village", es:"Elige un pueblo", de:"Dorf auswählen", pl:"Wybierz wioskę", nl:"Kies een dorp" },
  travel_pick_beast:   { cs:"Vyber bestii", en:"Choose a beast", fr:"Choisir une bête", es:"Elige una bestia", de:"Wähle ein Biest", pl:"Wybierz bestię", nl:"Kies een beest" },
  travel_contract:     { cs:"Vzít zakázku", en:"Take contract", fr:"Prendre le contrat", es:"Tomar el contrato", de:"Vertrag annehmen", pl:"Przyjmij kontrakt", nl:"Neem het contract" },
  travel_traveling:    { cs:"Cestuješ do", en:"Traveling to", fr:"En route vers", es:"Viajando a", de:"Reise nach", pl:"Podróżujesz do", nl:"Reizen naar" },
  travel_fighting:     { cs:"Souboj!", en:"Combat!", fr:"Combat!", es:"¡Combate!", de:"Kampf!", pl:"Walka!", nl:"Gevecht!" },
  travel_reward:       { cs:"Odměna za kontrakt", en:"Contract reward", fr:"Récompense du contrat", es:"Recompensa del contrato", de:"Vertragsbelohnung", pl:"Nagroda za kontrakt", nl:"Contractbeloning" },
  travel_lost:         { cs:"Byl jsi poražen. HP kleslo na 1.", en:"You were defeated. HP dropped to 1.", fr:"Vous avez été vaincu. PV tombé à 1.", es:"Fuiste derrotado. PS bajó a 1.", de:"Du wurdest besiegt. HP auf 1 gesunken.", pl:"Zostałeś pokonany. HP spadło do 1.", nl:"Je bent verslagen. HP gedaald naar 1." },
  travel_back:         { cs:"Zpět na přehled", en:"Back to overview", fr:"Retour à l'aperçu", es:"Volver al resumen", de:"Zurück zur Übersicht", pl:"Powrót do przeglądu", nl:"Terug naar overzicht" },

  // ── Aréna ───────────────────────────────────
  arena_title:         { cs:"Zaklínačská aréna", en:"Witcher Arena", fr:"Arène du Sorceleur", es:"Arena del Brujo", de:"Hexerarena", pl:"Arena Wiedźmińska", nl:"Heksenmeesters Arena" },
  arena_find_opp:      { cs:"Hledat soupeře", en:"Find opponent", fr:"Trouver un adversaire", es:"Buscar oponente", de:"Gegner suchen", pl:"Szukaj przeciwnika", nl:"Zoek tegenstander" },
  arena_fight:         { cs:"Bojovat!", en:"Fight!", fr:"Combattre!", es:"¡Luchar!", de:"Kämpfen!", pl:"Walcz!", nl:"Vecht!" },
  arena_no_opp:        { cs:"Žádný soupeř nalezen.", en:"No opponent found.", fr:"Aucun adversaire trouvé.", es:"No se encontró oponente.", de:"Kein Gegner gefunden.", pl:"Nie znaleziono przeciwnika.", nl:"Geen tegenstander gevonden." },
  arena_you_won:       { cs:"Vítězství! Sláva Zaklínači!", en:"Victory! Glory to the Witcher!", fr:"Victoire! Gloire au Sorceleur!", es:"¡Victoria! ¡Gloria al Brujo!", de:"Sieg! Ruhm dem Hexer!", pl:"Zwycięstwo! Chwała Wiedźminowi!", nl:"Overwinning! Eer aan de Heksenmeester!" },
  arena_you_lost:      { cs:"Porážka. Čest na chvíli vybledla.", en:"Defeat. Honor faded briefly.", fr:"Défaite. L'honneur a brièvement pâli.", es:"Derrota. El honor se desvaneció.", de:"Niederlage. Die Ehre verblasste kurz.", pl:"Porażka. Honor chwilowo zbladł.", nl:"Nederlaag. De eer vervaagde even." },

  // ── Obchod ──────────────────────────────────
  shop_title:          { cs:"Kovářova dílna", en:"Blacksmith's Forge", fr:"Forge du forgeron", es:"Forja del herrero", de:"Schmiede", pl:"Kuźnia Kowala", nl:"Smidse" },
  shop_weapons:        { cs:"Zbraně", en:"Weapons", fr:"Armes", es:"Armas", de:"Waffen", pl:"Broń", nl:"Wapens" },
  shop_armors:         { cs:"Zbroje", en:"Armors", fr:"Armures", es:"Armaduras", de:"Rüstungen", pl:"Zbroje", nl:"Wapenrustingen" },
  shop_buy:            { cs:"Koupit", en:"Buy", fr:"Acheter", es:"Comprar", de:"Kaufen", pl:"Kup", nl:"Kopen" },
  shop_equip:          { cs:"Vybavit", en:"Equip", fr:"Équiper", es:"Equipar", de:"Ausrüsten", pl:"Wyposażenie", nl:"Uitrusten" },
  shop_owned:          { cs:"Vlastníš", en:"Owned", fr:"Possédé", es:"Poseído", de:"Besessen", pl:"Posiadany", nl:"Bezit" },
  shop_not_enough:     { cs:"Nedostatek Orenů.", en:"Not enough Orens.", fr:"Orens insuffisants.", es:"Orens insuficientes.", de:"Nicht genug Orens.", pl:"Za mało Orenów.", nl:"Niet genoeg Orens." },
  shop_bought:         { cs:"Zakoupeno!", en:"Purchased!", fr:"Acheté!", es:"¡Comprado!", de:"Gekauft!", pl:"Kupiono!", nl:"Gekocht!" },

  // ── Stáje ───────────────────────────────────
  stables_title:       { cs:"Stáje a amulety", en:"Stables & Amulets", fr:"Écuries et amulettes", es:"Establos y amuletos", de:"Ställe & Amulette", pl:"Stajnie i amulety", nl:"Stallen & Amuletten" },
  stables_bonus:       { cs:"Zkracuje čas cesty o", en:"Reduces travel time by", fr:"Réduit le temps de voyage de", es:"Reduce el tiempo de viaje en", de:"Reduziert Reisezeit um", pl:"Skraca czas podróży o", nl:"Verkort reistijd met" },

  // ── Hospoda ─────────────────────────────────
  tavern_title:        { cs:"U Starého Mlynáře", en:"The Old Miller's Inn", fr:"À l'Auberge du Vieux Meunier", es:"En la Posada del Viejo Molinero", de:"Beim Alten Müller", pl:"Pod Starym Młynarzem", nl:"Bij de Oude Molenaar" },
  tavern_heal:         { cs:"Objednat jídlo a léčení", en:"Order food & healing", fr:"Commander nourriture et soins", es:"Pedir comida y curación", de:"Essen & Heilung bestellen", pl:"Zamów jedzenie i leczenie", nl:"Bestel eten & genezing" },
  tavern_healed:       { cs:"HP doplněno!", en:"HP restored!", fr:"PV restaurés!", es:"¡PS restaurados!", de:"HP wiederhergestellt!", pl:"HP uzupełnione!", nl:"HP hersteld!" },
  tavern_full_hp:      { cs:"Jsi plně uzdraven.", en:"You are fully healed.", fr:"Vous êtes entièrement soigné.", es:"Estás completamente curado.", de:"Du bist vollständig geheilt.", pl:"Jesteś w pełni uleczony.", nl:"Je bent volledig genezen." },

  // ── Žebříček ────────────────────────────────
  lb_title:            { cs:"Síň slávy Zaklínačů", en:"Witcher Hall of Fame", fr:"Panthéon des Sorceleurs", es:"Salón de la Fama de los Brujos", de:"Hexer-Ruhmeshalle", pl:"Sala Sławy Wiedźminów", nl:"Heksenmeesters Eregalerij" },
  lb_rank:             { cs:"#", en:"#", fr:"#", es:"#", de:"#", pl:"#", nl:"#" },
  lb_name:             { cs:"Jméno", en:"Name", fr:"Nom", es:"Nombre", de:"Name", pl:"Imię", nl:"Naam" },
  lb_school:           { cs:"Škola", en:"School", fr:"École", es:"Escuela", de:"Schule", pl:"Szkoła", nl:"School" },
  lb_level:            { cs:"Úroveň", en:"Level", fr:"Niveau", es:"Nivel", de:"Stufe", pl:"Poziom", nl:"Niveau" },
  lb_xp:               { cs:"XP", en:"XP", fr:"XP", es:"XP", de:"XP", pl:"XP", nl:"XP" },
  lb_empty:            { cs:"Žebříček je prázdný. Buď první!", en:"Leaderboard is empty. Be the first!", fr:"Le classement est vide. Soyez le premier!", es:"El ranking está vacío. ¡Sé el primero!", de:"Rangliste ist leer. Sei der Erste!", pl:"Ranking jest pusty. Bądź pierwszy!", nl:"Ranglijst is leeg. Wees de eerste!" },

  // ── Chat ────────────────────────────────────
  chat_title:          { cs:"Chat školy", en:"School Chat", fr:"Chat de l'école", es:"Chat de la escuela", de:"Schulchat", pl:"Czat szkoły", nl:"Schoolchat" },
  chat_placeholder:    { cs:"Zapiš zprávu bratřím…", en:"Write to your brothers…", fr:"Écrivez à vos frères…", es:"Escribe a tus hermanos…", de:"Schreibe an deine Brüder…", pl:"Napisz do braci…", nl:"Schrijf aan uw broeders…" },
  chat_send:           { cs:"Odeslat", en:"Send", fr:"Envoyer", es:"Enviar", de:"Senden", pl:"Wyślij", nl:"Versturen" },
  chat_empty:          { cs:"Zatím žádné zprávy.", en:"No messages yet.", fr:"Pas encore de messages.", es:"Sin mensajes aún.", de:"Noch keine Nachrichten.", pl:"Brak wiadomości.", nl:"Nog geen berichten." },

  // ── Obecné ──────────────────────────────────
  back:                { cs:"← Zpět", en:"← Back", fr:"← Retour", es:"← Atrás", de:"← Zurück", pl:"← Wróć", nl:"← Terug" },
  loading:             { cs:"Načítám…", en:"Loading…", fr:"Chargement…", es:"Cargando…", de:"Lade…", pl:"Ładowanie…", nl:"Laden…" },
  error_generic:       { cs:"Nastala chyba. Zkus to znovu.", en:"An error occurred. Try again.", fr:"Une erreur est survenue. Réessayez.", es:"Ocurrió un error. Intenta de nuevo.", de:"Fehler aufgetreten. Bitte erneut versuchen.", pl:"Wystąpił błąd. Spróbuj ponownie.", nl:"Er is een fout opgetreden. Probeer opnieuw." },
  footer_text:         { cs:"Padislav hra vytvořena jako školní projekt", en:"Padislav game created as a school project", fr:"Jeu Padislav créé comme projet scolaire", es:"Juego Padislav creado como proyecto escolar", de:"Padislav-Spiel als Schulprojekt erstellt", pl:"Gra Padislav stworzona jako projekt szkolny", nl:"Padislav spel gemaakt als schoolproject" },

  // ── Znamení ─────────────────────────────────
  sign_aard:           { cs:"Aard — +15% šance na krit", en:"Aard — +15% crit chance", fr:"Aard — +15% chance critique", es:"Aard — +15% chance de crítico", de:"Aard — +15% kritische Chance", pl:"Aard — +15% szansa na trafienie krytyczne", nl:"Aard — +15% kans op kritieke treffer" },
  sign_igni:           { cs:"Igni — ohnivé poškození", en:"Igni — fire damage bonus", fr:"Igni — bonus de dégâts de feu", es:"Igni — bono de daño de fuego", de:"Igni — Feuerbonus", pl:"Igni — dodatkowe obrażenia od ognia", nl:"Igni — vuurschadebonus" },
  sign_quen:           { cs:"Quen — ignoruje 20% poškození", en:"Quen — ignores first 20% damage", fr:"Quen — ignore 20% des dégâts", es:"Quen — ignora 20% del daño", de:"Quen — ignoriert 20% Schaden", pl:"Quen — ignoruje 20% obrażeń", nl:"Quen — negeert 20% schade" },
  sign_yrden:          { cs:"Yrden — -10% obrana soupeře", en:"Yrden — -10% opponent defense", fr:"Yrden — -10% défense adversaire", es:"Yrden — -10% defensa rival", de:"Yrden — -10% Gegnerverteidigung", pl:"Yrden — -10% obrona przeciwnika", nl:"Yrden — -10% verdediging tegenstander" },
  sign_axii:           { cs:"Axii — šance ukrást část odměny", en:"Axii — chance to steal extra reward", fr:"Axii — chance de voler une récompense", es:"Axii — oportunidad de robar recompensa", de:"Axii — Chance extra Belohnung zu stehlen", pl:"Axii — szansa na kradzież nagrody", nl:"Axii — kans extra beloning te stelen" },
};

// ─────────────────────────────────────────────
//  AKTUÁLNÍ JAZYK
// ─────────────────────────────────────────────

let currentLang = DEFAULT;

export function initI18n() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED.includes(saved)) currentLang = saved;
  else currentLang = DEFAULT;
}

export function setLang(lang) {
  if (!SUPPORTED.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
}

export function getLang() {
  return currentLang;
}

/**
 * Přeloží klíč do aktuálního jazyka.
 * Fallback: CS → raw key.
 */
export function t(key) {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[currentLang] ?? entry["cs"] ?? key;
}

export const SUPPORTED_LANGS = [
  { code: "cs", flag: "🇨🇿", label: "Čeština" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
  { code: "pl", flag: "🇵🇱", label: "Polski" },
  { code: "nl", flag: "🇳🇱", label: "Nederlands" },
];
