// ================================================================
// HUXI App — Firebase Cloud Functions
// 5x dagelijkse push notificaties naar alle actieve gebruikers
// Tijdzone: Europe/Brussels (CET/CEST)
// ================================================================

const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

// ═══ BERICHTENPOOL ═══
// Dezelfde 70 berichten als in de app — verdeeld over 7 thema's
const BERICHTEN = [
  // Fysiek & micro-bewegingen
  "Drink een slokje water 💧",
  "Rek je even uit 🙆",
  "Rol je schouders 🧘",
  "Voel even je voeten op de grond 🦶",
  "Maak je kaak los 😌",
  "Laat je schouders zakken 🌿",
  "Ontspan je handen ✋",
  "Rek je nek zachtjes 🧘‍♀️",
  "Sta even recht en strek je 🙆‍♀️",
  "Voel je billen op de stoel 🪑",
  "Voel je handen — warm of koud? 🤲",
  "Span je schouders op, en laat los 💆",
  "Draai je polsen rustig rond 🔄",
  "Wiebel even met je tenen 🦶",
  "Masseer zacht je nek 💆‍♂️",
  "Druk je voeten in de grond 🌍",
  "Open je borstkas, rug recht 🌸",
  "Rek je armen boven je hoofd 🙌",
  "Draai je hoofd zacht van links naar rechts ↔️",
  "Schud je handen los 🙌",
  "Sta op en neem 5 stapjes 🚶",
  // Adem
  "Adem even diep in 🌬️",
  "Neem drie trage ademhalingen 🌬️",
  "Adem uit met een zucht 😮‍💨",
  "Adem door je neus, uit door je mond 🌬️",
  "Adem 4 tellen in, 6 tellen uit 🫁",
  "Volg één ademhaling helemaal 🌊",
  "Adem tot in je buik 🤲",
  "Adem traag als een slapende kat 🐈",
  "Laat je adem doen wat hij wil 🍃",
  // Zintuigen
  "Kijk even naar buiten 🪟",
  "Luister even naar wat je hoort 👂",
  "Zoek iets groens om naar te kijken 🌱",
  "Voel hoe de lucht op je huid voelt 🍃",
  "Knipper een paar keer rustig 👁️",
  "Zoek 5 dingen die je nu kan zien 👀",
  "Noem 3 geluiden die je hoort 🔔",
  "Voel 2 texturen met je vingers ✨",
  "Wat ruik je nu? 👃",
  "Volg een lichtreflectie met je ogen 🌟",
  "Welke kleur zie je het meest? 🎨",
  "Voel de temperatuur in de kamer 🌡️",
  // Gedachten & aanwezigheid
  "Laat die gedachte even los ☁️",
  "Merk wat er nu in je hoofd speelt 💭",
  "Zeg tegen jezelf: dit is oké 🤍",
  "Laat een piekergedachte voorbijvaren 🌊",
  "Je hoeft nu niks op te lossen 🫶",
  "Keer even terug naar dit moment 🕊️",
  "Zet alles even op pauze ⏸️",
  "Niks moet, even rust 🕯️",
  // Hart & zelfcompassie
  "Gun jezelf een glimlach 😊",
  "Bedenk één ding waar je dankbaar voor bent 💛",
  "Je doet het goed — echt 💚",
  "Leg een hand op je hart ❤️",
  "Zeg tegen jezelf: ik mag er zijn 🤗",
  "Wees zacht voor jezelf vandaag 🌷",
  "Denk aan iemand die je graag ziet 💖",
  "Eén ding tegelijk is genoeg 🐢",
  "Je bent meer dan je to-do lijst ✨",
  "Wat heb je nú nodig? 🌼",
  // Rust & omgeving
  "Sluit je ogen 10 seconden 🌙",
  "Kijk naar de lucht, even kort ☁️",
  "Is het licht warm of koel? 💡",
  "Leg je telefoon weg voor 1 minuut 📵",
  "Luister even naar buiten 🌳",
  // Verbinding
  "Denk aan iets wat je vandaag mooi vond 🌻",
  "Stuur iemand een kort lief bericht 💌",
  "Geef jezelf mentaal een schouderklopje 🤚",
  "Glimlach naar iets, gewoon omdat 😊",
  "Bedank je lichaam voor vandaag 🌿"
];

// ═══ KERNFUNCTIE: stuur notificatie naar alle actieve gebruikers ═══
async function stuurDagelijkseReminder(context) {
  const db = admin.database();

  // Laad alle gebruikers
  const snapshot = await db.ref("/users").once("value");
  const users = snapshot.val();

  if (!users) {
    console.log("Geen gebruikers gevonden");
    return null;
  }

  // Verzamel alle FCM tokens van niet-therapeuten
  const tokens = [];
  Object.entries(users).forEach(([key, user]) => {
    if (
      user &&
      user.fcmToken &&
      typeof user.fcmToken === "string" &&
      user.accType !== "therapist"
    ) {
      tokens.push(user.fcmToken);
    }
  });

  if (tokens.length === 0) {
    console.log("Geen FCM tokens gevonden");
    return null;
  }

  // Kies een willekeurig bericht
  const bericht = BERICHTEN[Math.floor(Math.random() * BERICHTEN.length)];

  console.log(`Stuur notificatie naar ${tokens.length} gebruikers: "${bericht}"`);

  // Stuur in batches van 500 (FCM limiet)
  const batches = [];
  for (let i = 0; i < tokens.length; i += 500) {
    batches.push(tokens.slice(i, i + 500));
  }

  for (const batch of batches) {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: batch,
      notification: {
        title: "HUXI 🌱",
        body: bericht
      },
      webpush: {
        notification: {
          icon: "https://kennycocx-star.github.io/huxi-app/icons/icon-192.png",
          badge: "https://kennycocx-star.github.io/huxi-app/icons/icon-72.png",
          vibrate: [200, 100, 200],
          tag: "huxi-reminder",
          renotify: true
        },
        fcmOptions: {
          link: "https://kennycocx-star.github.io/huxi-app/"
        }
      }
    });

    // Verwijder verlopen tokens uit Firebase
    const verlopen = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success && (
        resp.error?.code === "messaging/registration-token-not-registered" ||
        resp.error?.code === "messaging/invalid-registration-token"
      )) {
        verlopen.push(batch[idx]);
      }
    });

    if (verlopen.length > 0) {
      console.log(`${verlopen.length} verlopen tokens verwijderen`);
      // Zoek en verwijder verlopen tokens
      Object.entries(users).forEach(([key, user]) => {
        if (user && verlopen.includes(user.fcmToken)) {
          db.ref(`/users/${key}/fcmToken`).remove();
        }
      });
    }

    console.log(`Batch verstuurd: ${response.successCount} succesvol, ${response.failureCount} mislukt`);
  }

  return null;
}

// ═══ 5 GEPLANDE TRIGGERS PER DAG (Belgische tijd) ═══

// 09:00 — ochtendmoment
exports.reminder_9u = onSchedule({
  schedule: "0 9 * * *",
  timeZone: "Europe/Brussels"
}, stuurDagelijkseReminder);

// 11:30 — voor de lunch
exports.reminder_1130u = onSchedule({
  schedule: "30 11 * * *",
  timeZone: "Europe/Brussels"
}, stuurDagelijkseReminder);

// 14:00 — na de lunch
exports.reminder_14u = onSchedule({
  schedule: "0 14 * * *",
  timeZone: "Europe/Brussels"
}, stuurDagelijkseReminder);

// 16:30 — namiddagdip
exports.reminder_1630u = onSchedule({
  schedule: "30 16 * * *",
  timeZone: "Europe/Brussels"
}, stuurDagelijkseReminder);

// 20:00 — avondmoment
exports.reminder_20u = onSchedule({
  schedule: "0 20 * * *",
  timeZone: "Europe/Brussels"
}, stuurDagelijkseReminder);
