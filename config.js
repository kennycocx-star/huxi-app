// ================================================================
// HUXI App — Firebase configuratie
// Firebase URL, opslaan en laden van gebruikersdata
// ================================================================

var FIREBASE_URL = "https://huxi-app-a1876-default-rtdb.europe-west1.firebasedatabase.app";

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
      if (!links[clientKey].consent) continue;
      var clientData = await firebaseLoad(clientKey);
      if (clientData) {
        // Laad ook opdrachten van deze cliënt
        var assignments = [];
        try {
          var aRes = await fetch(FIREBASE_URL + "/assignments/" + clientKey + ".json");
          var aData = await aRes.json();
          if (aData) assignments = Object.keys(aData).map(k => ({ ...aData[k], fbKey: k }));
        } catch(e2) {}
        clients.push({
          key: clientKey,
          userName: clientData.userName || "Onbekend",
          treeName: clientData.treeName || "",
          dailyMood: clientData.dailyMood,
          moodHistory: clientData.moodHistory || [],
          totalSessions: clientData.totalSessions || 0,
          growth: clientData.growth || 0,
          streakShields: clientData.streakShields || 0,
          lastDay: clientData.lastDay,
          dailyBreaths: clientData.dailyBreaths || 0,
          reason: clientData.reason,
          assignments: assignments
        });
      }
    }
    return clients;
  } catch(e) { console.warn("Cliënten laden fout:", e); return []; }
};
