// ================================================================
// HUXI App — Firebase configuratie
// Firebase URL, opslaan en laden van gebruikersdata
// ================================================================

var FIREBASE_URL = "https://huxi-app-a1876-default-rtdb.europe-west1.firebasedatabase.app";

// ═══ COOKIE HELPERS ═══
// iOS Safari wist localStorage na 7 dagen inactiviteit.
// Cookies blijven tot 1 jaar bewaard — wij gebruiken ze als backup voor de userKey.
// Zo kan de app de gebruiker automatisch herstellen uit Firebase, zelfs na een iOS-wipe.
var setCookie = (name, value, days) => {
  try {
    var expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + expires.toUTCString() + ";path=/;SameSite=Lax";
  } catch(e) {}
};
var getCookie = (name) => {
  try {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
    }
  } catch(e) {}
  return null;
};

// ═══ FIREBASE APP CONFIG (voor FCM push notificaties) ═══
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyDESfbeHRWA-xv0MEc_TiCgM2-Rt_ujlNA",
  authDomain: "huxi-app-a1876.firebaseapp.com",
  databaseURL: "https://huxi-app-a1876-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "huxi-app-a1876",
  storageBucket: "huxi-app-a1876.firebasestorage.app",
  messagingSenderId: "699548699062",
  appId: "1:699548699062:web:0f0b16510671d0b0e01917"
};

var FCM_VAPID_KEY = "BNkliFPMhgdUuj-aF2H6wLgN2W-Lic1jKh2iFUuVlLiBS3qMLQm1dqSTp8HR5_STCacSrHdMRC9hHQOOfAklM9o";

// ═══ FCM INITIALISATIE ═══
// Wordt aangeroepen na inloggen — vraagt toestemming en slaat FCM token op
var initFCM = async (userKey) => {
  try {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    if (!firebase.apps.length) { firebase.initializeApp(FIREBASE_CONFIG); }

    await navigator.serviceWorker.register('/huxi-app/sw.js');
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('SW timeout')), 15000))
    ]);

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const messaging = firebase.messaging();
    const token = await messaging.getToken({
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      await fetch(FIREBASE_URL + "/users/" + userKey + "/fcmToken.json", { method: "PUT", body: JSON.stringify(token) });
      await fetch(FIREBASE_URL + "/users/" + userKey + "/fcmUpdatedAt.json", { method: "PUT", body: JSON.stringify(Date.now()) });
    }
  } catch(e) {
    console.warn('[FCM] Initialisatie fout:', e);
  }
};

var firebaseSave = async (key, data) => {
  try {
    // PATCH ipv PUT: overschrijft alleen de meegestuurde velden.
    // fcmToken wordt apart opgeslagen door initFCM en mag NOOIT overschreven worden door een algemene save.
    await fetch(FIREBASE_URL + "/users/" + key + ".json", {
      method: "PATCH", body: JSON.stringify(data)
    });
  } catch(e) { console.warn("Firebase save fout:", e); }
};

var firebaseLoad = async (key) => {
  try {
    const res = await fetch(FIREBASE_URL + "/users/" + key + ".json");
    const data = await res.json();
    return data && data !== "null" ? data : null;
  } catch(e) { console.warn("Firebase load fout:", e); return null; }
};

var makeKey = (name, pin) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + pin;

// ═══ THERAPEUT KOPPELING ═══

// Therapeut registreert zich — slaat koppelcode op
var therapistRegister = async (therapistKey, displayName) => {
  try {
    // Maak een 6-cijferige koppelcode
    var code = String(Math.floor(100000 + Math.random() * 900000));
    await fetch(FIREBASE_URL + "/therapists/" + code + ".json", {
      method: "PUT",
      body: JSON.stringify({ key: therapistKey, name: displayName, created: Date.now() })
    });
    return code;
  } catch(e) { console.warn("Therapeut registratie fout:", e); return null; }
};

// Zoek bestaande koppelcode voor een therapeut (recovery als code verloren is)
var therapistFindCode = async (therapistKey) => {
  try {
    var res = await fetch(FIREBASE_URL + "/therapists.json");
    var data = await res.json();
    if (!data) return null;
    for (var code of Object.keys(data)) {
      if (data[code] && data[code].key === therapistKey) return code;
    }
    return null;
  } catch(e) { console.warn("Therapeut code zoeken fout:", e); return null; }
};

// Check of koppelcode bestaat en geef therapeut-info terug
var therapistLookup = async (code) => {
  try {
    var res = await fetch(FIREBASE_URL + "/therapists/" + code + ".json");
    var data = await res.json();
    return data && data.key ? data : null;
  } catch(e) { console.warn("Therapeut lookup fout:", e); return null; }
};

// Cliënt koppelt zich aan therapeut
var clientLinkToTherapist = async (clientKey, therapistCode) => {
  try {
    // Voeg cliënt toe aan therapeut's cliëntenlijst
    await fetch(FIREBASE_URL + "/links/" + therapistCode + "/" + clientKey + ".json", {
      method: "PUT",
      body: JSON.stringify({ linked: Date.now(), consent: true })
    });
    return true;
  } catch(e) { console.warn("Koppeling fout:", e); return false; }
};

// Cliënt ontkoppelt zich
var clientUnlinkTherapist = async (clientKey, therapistCode) => {
  try {
    await fetch(FIREBASE_URL + "/links/" + therapistCode + "/" + clientKey + ".json", {
      method: "DELETE"
    });
    return true;
  } catch(e) { console.warn("Ontkoppeling fout:", e); return false; }
};

// Therapeut wijst oefening toe aan cliënt
var therapistAssignExercise = async (therapistCode, clientKey, exercise) => {
  try {
    var id = Date.now();
    await fetch(FIREBASE_URL + "/assignments/" + clientKey + "/" + id + ".json", {
      method: "PUT",
      body: JSON.stringify({ name: exercise.name, id: exercise.id || id, assignedBy: therapistCode, assignedAt: id, done: false })
    });
    return true;
  } catch(e) { console.warn("Toewijzing fout:", e); return false; }
};

// Cliënt laadt zijn toegewezen oefeningen
var clientLoadAssignments = async (clientKey) => {
  try {
    var res = await fetch(FIREBASE_URL + "/assignments/" + clientKey + ".json");
    var data = await res.json();
    if (!data) return [];
    return Object.keys(data).map(k => ({ ...data[k], fbKey: k }));
  } catch(e) { console.warn("Opdrachten laden fout:", e); return []; }
};

// Cliënt markeert oefening als gedaan
var clientCompleteAssignment = async (clientKey, fbKey) => {
  try {
    await fetch(FIREBASE_URL + "/assignments/" + clientKey + "/" + fbKey + ".json", {
      method: "PATCH",
      body: JSON.stringify({ done: true, completedAt: Date.now() })
    });
    return true;
  } catch(e) { console.warn("Opdracht afronden fout:", e); return false; }
};

// Therapeut stuurt motivatiebericht naar cliënt
var therapistSendMessage = async (clientKey, message, therapistName) => {
  try {
    var id = Date.now();
    await fetch(FIREBASE_URL + "/messages/" + clientKey + "/" + id + ".json", {
      method: "PUT",
      body: JSON.stringify({ text: message, from: therapistName, sentAt: id, read: false })
    });
    return true;
  } catch(e) { console.warn("Bericht sturen fout:", e); return false; }
};

// Cliënt laadt berichten van therapeut
var clientLoadMessages = async (clientKey) => {
  try {
    var res = await fetch(FIREBASE_URL + "/messages/" + clientKey + ".json");
    var data = await res.json();
    if (!data) return [];
    return Object.keys(data).map(k => ({ ...data[k], fbKey: k })).sort((a,b) => b.sentAt - a.sentAt);
  } catch(e) { console.warn("Berichten laden fout:", e); return []; }
};

// Volledige account verwijdering — ruimt ALLES op (user, assignments, messages, link)
var firebaseDeleteAccount = async (clientKey, linkedTherapist) => {
  try {
    // 1. Verwijder gebruikersdata
    await fetch(FIREBASE_URL + "/users/" + clientKey + ".json", { method: "DELETE" });
    // 2. Verwijder alle opdrachten
    await fetch(FIREBASE_URL + "/assignments/" + clientKey + ".json", { method: "DELETE" });
    // 3. Verwijder alle berichten
    await fetch(FIREBASE_URL + "/messages/" + clientKey + ".json", { method: "DELETE" });
    // 4. Verwijder de koppellink (als er een therapeut gekoppeld was)
    if (linkedTherapist) {
      await fetch(FIREBASE_URL + "/links/" + linkedTherapist + "/" + clientKey + ".json", { method: "DELETE" });
    }
    return true;
  } catch(e) { console.warn("Account verwijderen fout:", e); return false; }
};

// Therapeut account verwijderen — ruimt ook therapeut-registratie en alle links op
var firebaseDeleteTherapist = async (therapistKey, therapistCode) => {
  try {
    // 1. Verwijder gebruikersdata
    await fetch(FIREBASE_URL + "/users/" + therapistKey + ".json", { method: "DELETE" });
    // 2. Verwijder therapeut registratie
    if (therapistCode) {
      await fetch(FIREBASE_URL + "/therapists/" + therapistCode + ".json", { method: "DELETE" });
      // 3. Verwijder alle links (cliënten worden automatisch ontkoppeld)
      await fetch(FIREBASE_URL + "/links/" + therapistCode + ".json", { method: "DELETE" });
    }
    return true;
  } catch(e) { console.warn("Therapeut verwijderen fout:", e); return false; }
};

// Therapeut laadt al zijn gekoppelde cliënten + hun opdrachtstatus
var therapistLoadClients = async (therapistCode) => {
  try {
    var res = await fetch(FIREBASE_URL + "/links/" + therapistCode + ".json");
    var links = await res.json();
    if (!links) return [];
    var clients = [];
    for (var clientKey of Object.keys(links)) {
      if (links[clientKey]) {
        try {
          var userRes = await fetch(FIREBASE_URL + "/users/" + clientKey + ".json");
          var userData = await userRes.json();
          var assignRes = await fetch(FIREBASE_URL + "/assignments/" + clientKey + ".json");
          var assignData = await assignRes.json();
          var assignments = assignData ? Object.keys(assignData).map(k => ({ ...assignData[k], fbKey: k })) : [];
          clients.push({ key: clientKey, ...(userData || {}), assignments });
        } catch(e) { /* skip */ }
      }
    }
    return clients;
  } catch(e) { console.warn("Cliënten laden fout:", e); return []; }
};

// ═══ FCM FALLBACK: trigger vanuit config.js als app.js de auto-login mist ═══
// Config.js weten we dat het vers geladen is — wacht 4s en trigger FCM als er
// een lastKey in localStorage staat en FCM nog niet geregistreerd is.
setTimeout(async function() {
  try {
    var lastKey = localStorage.getItem('huxi-last-key');
    if (!lastKey) return;
    // Check of token al bestaat
    var res = await fetch(FIREBASE_URL + "/users/" + lastKey + "/fcmToken.json");
    var existing = await res.json();
    if (existing) return; // al geregistreerd
    // Check of het geen therapeut-account is
    var userRes = await fetch(FIREBASE_URL + "/users/" + lastKey + "/accType.json");
    var accType = await userRes.json();
    if (accType === "therapist") return;
    // Trigger FCM
    await initFCM(lastKey);
  } catch(e) {}
}, 4000);

// ═══════════════════════════════════════════════════════════════
// THERAPEUT-AUTHENTICATIE (echte login — fase 1)
// Additief: raakt de bestaande naam+pincode-login NIET.
// Therapeut logt in met e-mail+wachtwoord (Firebase Auth). De eerste
// keer koppelen we zijn bestaande praktijkdata (onder naam_pincode) via
// een uid -> oude-sleutel mapping. Data wordt NIET verplaatst.
// ═══════════════════════════════════════════════════════════════
var ensureFirebaseApp = () => {
  try { if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG); return true; }
  catch(e) { console.warn("[HUXI auth] Firebase init mislukt:", e); return false; }
};

// Nieuw therapeut-account aanmaken
var therapistAuthRegister = async (email, password) => {
  if (!ensureFirebaseApp()) return { ok:false, error:"firebase" };
  try {
    var cred = await firebase.auth().createUserWithEmailAndPassword(email.trim(), password);
    return { ok:true, uid: cred.user.uid };
  } catch(e) {
    console.warn("[HUXI auth] registratie mislukt:", e);
    return { ok:false, error: e.code || "onbekend" };
  }
};

// Inloggen met bestaand therapeut-account
var therapistAuthLogin = async (email, password) => {
  if (!ensureFirebaseApp()) return { ok:false, error:"firebase" };
  try {
    var cred = await firebase.auth().signInWithEmailAndPassword(email.trim(), password);
    return { ok:true, uid: cred.user.uid };
  } catch(e) {
    console.warn("[HUXI auth] login mislukt:", e);
    return { ok:false, error: e.code || "onbekend" };
  }
};

// Uitloggen uit het Auth-account
var therapistAuthLogout = async () => {
  if (!ensureFirebaseApp()) return;
  try { await firebase.auth().signOut(); } catch(e) { console.warn("[HUXI auth] uitloggen mislukt:", e); }
};

// uid -> bestaande therapeut-sleutel (naam_pincode) ophalen
var therapistAuthGetMapping = async (uid) => {
  try {
    var r = await fetch(FIREBASE_URL + "/therapistAuth/" + uid + ".json");
    var d = await r.json();
    return (d && typeof d === "string") ? d : null;
  } catch(e) { console.warn("[HUXI auth] mapping ophalen mislukt:", e); return null; }
};

// uid -> bestaande therapeut-sleutel opslaan (eenmalige koppeling)
var therapistAuthSetMapping = async (uid, oldKey) => {
  try {
    await fetch(FIREBASE_URL + "/therapistAuth/" + uid + ".json", { method:"PUT", body: JSON.stringify(oldKey) });
    return true;
  } catch(e) { console.warn("[HUXI auth] mapping opslaan mislukt:", e); return false; }
};
