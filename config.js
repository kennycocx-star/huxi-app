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
