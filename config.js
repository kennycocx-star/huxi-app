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

// Therapeut laadt al zijn gekoppelde cliënten
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
        clients.push({
          key: clientKey,
          name: clientData.userName || "Onbekend",
          mood: clientData.dailyMood,
          moodHistory: clientData.moodHistory || [],
          sessions: clientData.totalSessions || 0,
          growth: clientData.growth || 0,
          streakShields: clientData.streakShields || 0,
          lastDay: clientData.lastDay,
          dailyBreaths: clientData.dailyBreaths || 0,
          reason: clientData.reason
        });
      }
    }
    return clients;
  } catch(e) { console.warn("Cliënten laden fout:", e); return []; }
};
