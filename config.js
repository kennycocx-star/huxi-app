// ================================================================
// HUXI App â€” Firebase configuratie
// Firebase URL, opslaan en laden van gebruikersdata
// ================================================================

var FIREBASE_URL = "https://huxi-app-a1876-default-rtdb.europe-west1.firebasedatabase.app";

// â•â•â• FIREBASE APP CONFIG (voor FCM push notificaties) â•â•â•h
// TODO: Vul in vanuit Firebase Console â†’ Project Settings â†’ General â†’ Your apps
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyDESfbeHRWA-xv0MEc_TiCgM2-Rt_ujlNA",
  authDomain: "huxi-app-a1876.firebaseapp.com",
  databaseURL: "https://huxi-app-a1876-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "huxi-app-a1876",
  storageBucket: "huxi-app-a1876.firebasestorage.app",
  messagingSenderId: "699548699062",
  appId: "1:699548699062:web:0f0b16510671d0b0e01917"
};

// TODO: Vul in vanuit Firebase Console â†’ Project Settings â†’ Cloud Messaging â†’ Web configuration â†’ Key pair
var FCM_VAPID_KEY = "BNkliFPMhgdUuj-aF2H6wLgN2W-Lic1jKh2iFUuVlLiBS3qMLQm1dqSTp8HR5_STCacSrHdMRC9hHQOOfAklM9o";

// â•â•â• FCM INITIALISATIE â•â•â•
// Wordt aangeroepen na inloggen â€” vraagt toestemming en slaat FCM token op
var initFCM = async (userKey) => {
  try {
    // Controleer browser support
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.log('[FCM] Push notificaties niet ondersteund in deze browser');
      return;
    }

    // Firebase app initialiseren (enkel de eerste keer)
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }

    // Service worker registreren
    await navigator.serviceWorker.register('/huxi-app/sw.js');
        const registration = await navigator.serviceWorker.ready;
        console.log('[FCM] Service worker actief:', registration.active?.state);

    // Toestemming vragen voor notificaties
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[FCM] Notificatie toestemming geweigerd');
      return;
    }

    // FCM token ophalen
    const messaging = firebase.messaging();
    const token = await messaging.getToken({
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('[FCM] Token ontvangen, opslaan in Firebase');
      // Sla token op in Firebase (apart veld, niet de volledige user data overschrijven)
      await fetch(FIREBASE_URL + "/users/" + userKey + "/fcmToken.json", {
        method: "PUT",
        body: JSON.stringify(token)
      });
      await fetch(FIREBASE_URL + "/users/" + userKey + "/fcmUpdatedAt.json", {
        method: "PUT",
        body: JSON.stringify(Date.now())
      });
      console.log('[FCM] Token opgeslagen voor', userKey);
    }
  } catch(e) {
    console.warn('[FCM] Initialisatie fout (niet kritiek):', e);
  }
};

var firebaseSave = async (key, data) => {
  try {
    await fetch(FIREBASE_URL + "/users/" + key + ".json", {
      method: "PUT", body: JSON.stringify(data)
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

// â•â•â• THERAPEUT KOPPELING â•â•â•

// Therapeut registreert zich â€” slaat koppelcode op
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

// CliÃ«nt koppelt zich aan therapeut
var clientLinkToTherapist = async (clientKey, therapistCode) => {
  try {
    // Voeg cliÃ«nt toe aan therapeut's cliÃ«ntenlijst
    await fetch(FIREBASE_URL + "/links/" + therapistCode + "/" + clientKey + ".json", {
      method: "PUT",
      body: JSON.stringify({ linked: Date.now(), consent: true })
    });
    return true;
  } catch(e) { console.warn("Koppeling fout:", e); return false; }
};

// CliÃ«nt ontkoppelt zich
var clientUnlinkTherapist = async (clientKey, therapistCode) => {
  try {
    await fetch(FIREBASE_URL + "/links/" + therapistCode + "/" + clientKey + ".json", {
      method: "DELETE"
    });
    return true;
  } catch(e) { console.warn("Ontkoppeling fout:", e); return false; }
};

// Therapeut wijst oefening toe aan cliÃªît
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

// CliÃ«nt laadt zijn toegewezen oefeningen
var clientLoadAssignments = async (clientKey) => {
  try {
    var res = await fetch(FIREBASE_URL + "/assignments/" + clientKey + ".json");
    var data = await res.json();
    if (!data) return [];
    return Object.keys(data).map(k => ({ ...data[k], fbKey: k }));
  } catch(e) { console.warn("Opdrachten laden fout:", e); return []; }
};

// CliÃ«nt markeert oefening als gedaan
var clientCompleteAssignment = async (clientKey, fbKey) => {
  try {
    await fetch(FIREBASE_URL + "/assignments/" + clientKey + "/" + fbKey + ".json", {
      method: "PATCH",
      body: JSON.stringify({ done: true, completedAt: Date.now() })
    });
    return true;
  } catch(e) { console.warn("Opdracht afronden fout:", e); return false; }
};

// Therapeut stuurt motivatiebericht naar cliÃ«nt
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

// CliÃªît laadt berichten van therapeut
var clientLoadMessages = async (clientKey) => {
  try {
    var res = await fetch(FIREBASE_URL + "/messages/" + clientKey + ".json");
    var data = await res.json();
    if (!data) return [];
    return Object.keys(data).map(k => ({ ...data[k], fbKey: k })).sort((a,b) => b.sentAt - a.sentAt);
  } catch(e) { console.warn("Berichten laden fout:", e); return []; }
};

// Volledige account verwijdering â€” ruimt ALLES op (user, assignments, messages, link)
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

// Therapeut account verwijderen â€” ruimt ook therapeut-registratie en alle links op
var firebaseDeleteTherapist = async (therapistKey, therapistCode) => {
  try {
    // 1. Verwijder gebruikersdata
    await fetch(FIREBASE_URL + "/users/" + therapistKey + ".json", { method: "DELETE" });
    // 2. Verwijder therapeut registratie
    if (therapistCode) {
      await fetch(FIREBASE_URL + "/therapists/" + therapistCode + ".json", { method: "DELETE" });
      // 3. Verwijder alle links (cliÃªîten worden automatisch ontkoppeld)
      await fetch(FIREBASE_URL + "/links/" + therapistCode + ".json", { method: "DELETE" });
    }
    return true;
  } catch(e) { console.warn("Therapeut verwijderen fout:", e); return false; }
};

// Therapeut laadt al zijn gekoppelde cliÃ«nten + hun opdrachtstatus
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
  } catch(e) { console.warn("CliÃ«nten laden fout:", e); return []; }
};
