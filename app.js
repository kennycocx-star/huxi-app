// Fix: timer reset bij nieuwe dag toegevoegd aan resetData
// HUXI App — Hoofd applicatie (HuxiApp)
// Bevat alle React state, UI logica en gebruikersinterface
//
// Afhankelijkheden (geladen via index.html):
//   - React + ReactDOM
//   - js/config.js  (Firebase)
//   - js/data.js    (ACCS, EX)
//   - js/helpers.js (getRealTod, getRealSeason)
//   - js/world.js   (BoomCanvas)
// ================================================================

var {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} = React;

var W = {
  width: "100%",
  height: "100dvh",
  maxWidth: 430,
  margin: "0 auto",
  position: "relative",
  overflow: "hidden",
  fontFamily: "'Quicksand',system-ui,sans-serif",
  userSelect: "none",
  touchAction: "manipulation",
  background: "#F5F7FA",
  WebkitOverflowScrolling: "touch"
};
var F = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
};
var OB = {
  ...F,
  background: "linear-gradient(160deg,#2C3E50 0%,#1A2B3A 30%,#162430 60%,#1E3040 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};
var OBC = {
  textAlign: "center",
  zIndex: 2,
  padding: "16px 20px",
  width: "100%",
  maxWidth: 360
};
// ═══ BREATH AUDIO ═══
// Zachte tonen zodat gebruikers ademoefeningen kunnen volgen zonder te kijken
var breathAudio = (() => {
  var ctx = null;
  var activeNodes = [];
  var getCtx = () => {
    if (!ctx || ctx.state === "closed") ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  var stopAll = () => {
    activeNodes.forEach(n => { try { n.stop(); } catch(e) {} });
    activeNodes = [];
  };
  // Stijgende toon = adem in
  var breathIn = (duration) => {
    stopAll();
    var c = getCtx();
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, c.currentTime);
    osc.frequency.linearRampToValueAtTime(440, c.currentTime + duration);
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, c.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, c.currentTime + duration - 0.3);
    gain.gain.linearRampToValueAtTime(0, c.currentTime + duration);
    osc.connect(gain).connect(c.destination);
    osc.start(); osc.stop(c.currentTime + duration);
    activeNodes.push(osc);
  };
  // Dalende toon = adem uit
  var breathOut = (duration) => {
    stopAll();
    var c = getCtx();
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, c.currentTime);
    osc.frequency.linearRampToValueAtTime(220, c.currentTime + duration);
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, c.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, c.currentTime + duration - 0.3);
    gain.gain.linearRampToValueAtTime(0, c.currentTime + duration);
    osc.connect(gain).connect(c.destination);
    osc.start(); osc.stop(c.currentTime + duration);
    activeNodes.push(osc);
  };
  // Zachte pulse = vasthouden
  var hold = (duration) => {
    stopAll();
    var c = getCtx();
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = 330;
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, c.currentTime + 0.2);
    // Zachte pulse effect
    var pulseRate = 1.5;
    for (var i = 0; i < duration * pulseRate; i++) {
      var t = c.currentTime + i / pulseRate;
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.linearRampToValueAtTime(0.03, t + 0.3 / pulseRate);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.6 / pulseRate);
    }
    gain.gain.setValueAtTime(0.08, c.currentTime + duration - 0.2);
    gain.gain.linearRampToValueAtTime(0, c.currentTime + duration);
    osc.connect(gain).connect(c.destination);
    osc.start(); osc.stop(c.currentTime + duration);
    activeNodes.push(osc);
  };
  // Kling = klaar (zachte afsluiting)
  var done = () => {
    stopAll();
    var c = getCtx();
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(396, c.currentTime);
    osc.frequency.linearRampToValueAtTime(528, c.currentTime + 0.8);
    gain.gain.setValueAtTime(0.1, c.currentTime);
    gain.gain.linearRampToValueAtTime(0, c.currentTime + 1.5);
    osc.connect(gain).connect(c.destination);
    osc.start(); osc.stop(c.currentTime + 1.5);
    activeNodes.push(osc);
  };
  // Rustig SOS geluid — diepe zachte toon
  var sosTone = (duration) => {
    stopAll();
    var c = getCtx();
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = 174; // diepe rustgevende frequentie
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.5);
    gain.gain.setValueAtTime(0.12, c.currentTime + duration - 0.5);
    gain.gain.linearRampToValueAtTime(0, c.currentTime + duration);
    osc.connect(gain).connect(c.destination);
    osc.start(); osc.stop(c.currentTime + duration);
    activeNodes.push(osc);
  };
  return { breathIn, breathOut, hold, done, sosTone, stopAll };
})();

function HuxiApp() {
  // ═══ ALL HOOKS FIRST ═══
  const [phase, setPhase] = useState("login");
  const [loginName, setLoginName] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [userKey, setUserKey] = useState("");
  const [secretQ, setSecretQ] = useState(0);
  const [secretA, setSecretA] = useState("");
  const [loginMode, setLoginMode] = useState("login");
  const [accType, setAccType] = useState(null);
  const [reason, setReason] = useState(null);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [worldReward, setWorldReward] = useState(null);
  const [letterPeriod, setLetterPeriod] = useState(30);
  const [letterStep, setLetterStep] = useState(0);
  const [letterAnswers, setLetterAnswers] = useState(["","","",""]);
  const [showStreak, setShowStreak] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [warnAcknowledged, setWarnAcknowledged] = useState(false);
  const [postMood, setPostMood] = useState(null);
  const [showPostMood, setShowPostMood] = useState(false);
  const [exPerEx, setExPerEx] = useState({});
  const [isOffline, setIsOffline] = useState(false);
  const [bonusEx, setBonusEx] = useState(null);
  const [petPositions, setPetPositions] = useState({}); // {petId: {x, y}} percentage of screen // weekly surprise exercise
  const [goals, setGoals] = useState([]);
  const [goalDraft, setGoalDraft] = useState("");
  const [goalDraftText, setGoalDraftText] = useState("");
  const [goalPeriod, setGoalPeriod] = useState(180);
  const [plantSecQ, setPlantSecQ] = useState(0);
  const [buddy, setBuddy] = useState("pet_none");
  const [plantSecA, setPlantSecA] = useState("");
  const [lastCheckinDate, setLastCheckinDate] = useState("");
  const [moodHistory, setMoodHistory] = useState([]); // [{date, mood, ts}]
  const [streakShields, setStreakShields] = useState(0);
  const [experience, setExperience] = useState(null);
  const [treeName, setTreeName] = useState("");
  const [userName, setUserName] = useState("");
  const [nameIn, setNameIn] = useState("");
  const [userNameIn, setUserNameIn] = useState("");
  const [season, setSeason] = useState(getRealSeason());
  const [tod, setTod] = useState(getRealTod());
  const [growth, setGrowth] = useState(0.01);
  // Granular world items - each earned one by one
  const [wi, setWi] = useState({
    leaves: 0,
    flowers: 0,
    grass: 0,
    stones: 0,
    shrooms: 0,
    bushes: 0,
    streakDays: 0,
    brieven: 0,
    dagboeken: 0,
    tools: 0,
    checkins: 0,
    tasks: 0
  });
  const [dailyMood, setDailyMood] = useState(null);
  const [checkinDone, setCheckinDone] = useState(false);
  const [showEx, setShowEx] = useState(false);
  const [curEx, setCurEx] = useState(null);
  const [exPhase, setExPhase] = useState("idle");
  const [exRound, setExRound] = useState(0);
  const [exCountdown, setExCountdown] = useState(0);
  const [showSci, setShowSci] = useState(false);
  const [seenEx, setSeenEx] = useState([]);
  const [lastExId, setLastExId] = useState(null);
  const [showOffer, setShowOffer] = useState(false);
  const [exDone, setExDone] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [custRounds, setCustRounds] = useState(null);
  const [showMem, setShowMem] = useState(false);
  const [memTxt, setMemTxt] = useState("");
  const [showSett, setShowSett] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [letterDraft, setLetterDraft] = useState("");
  const [letters, setLetters] = useState([]);
  const [showLetters, setShowLetters] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [diaryDraft, setDiaryDraft] = useState("");
  const [diary, setDiary] = useState([]);
  const [wMsg, setWMsg] = useState("");
  const [animalMsg, setAnimalMsg] = useState("");
  const [showTools, setShowTools] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [toolStep, setToolStep] = useState(0);
  const [gratItems, setGratItems] = useState(["", "", ""]);
  const [affirmation] = useState(() => MEMZ[Math.floor(Math.random() * MEMZ.length)]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [lastTaskTexts, setLastTaskTexts] = useState([]);
  const [tasksGenerated, setTasksGenerated] = useState(false);
  const [dailyBreaths, setDailyBreaths] = useState(0);
  const [lastBreathTime, setLastBreathTime] = useState(null);
  const [lastTaskTime, setLastTaskTime] = useState(null);
  const [cdTick, setCdTick] = useState(Date.now());
  const [curTask, setCurTask] = useState(null);
  const [taskInput, setTaskInput] = useState("");
  const [taskTimer, setTaskTimer] = useState(0);
  const [dailyActions, setDailyActions] = useState(0);
  // ═══ THERAPEUT ═══
  const [therapistCode, setTherapistCode] = useState(null);
  const [therapistClients, setTherapistClients] = useState([]);
  const [therapistLoading, setTherapistLoading] = useState(false);
  const [linkedTherapist, setLinkedTherapist] = useState(null);
  const [linkInput, setLinkInput] = useState("");
  const [linkMsg, setLinkMsg] = useState("");
  const [showTherapistPanel, setShowTherapistPanel] = useState(false);
  // ═══ SOS ═══
  const [sosActive, setSosActive] = useState(false);
  const [sosStep, setSosStep] = useState(0);
  const [lastDay, setLastDay] = useState(() => new Date().toDateString());
  const [totalSessions, setTotalSessions] = useState(0);
  // Invisible level: based on total sessions completed, not shown to user
  // Level 1 (0-4 sessions): check-in + 1 ademhaling + 1 taak, max 2 acties
  // Welzijnsniveau based on mood + reason + experience
  // Beginners/slecht gevoel: MORE micro-moments, LESS choice
  // Gevorderd/goed gevoel: LESS verplicht, MORE freedom
  const moodScore = dailyMood === "calm" ? 5 : dailyMood === "ok" ? 4 : dailyMood === "restless" ? 3 : dailyMood === "tense" ? 2 : dailyMood === "overwhelmed" ? 1 : 3;
  const lvl = totalSessions < 5 ? 1 : totalSessions < 15 ? 2 : totalSessions < 30 ? 3 : totalSessions < 60 ? 4 : 5;
  // Daily limits: worse mood = more short tasks, better = fewer but free
  // Burnout: always less pressure
  const isBurnout = reason === "burnout";
  const maxTasks = accType === "child" ? 3 : accType === "junior" ? 4 : isBurnout ? 3 : lvl <= 2 ? 5 : lvl <= 3 ? 4 : 3;
  const maxBreath = (() => {
    if (accType === "child") return 3;
    if (accType === "junior") {
      if (dailyMood === "overwhelmed" || dailyMood === "tense") return 2;
      return 3;
    }
    // Volwassenen: op basis van ervaring + stemming
    const tense = dailyMood === "overwhelmed" || dailyMood === "tense" || dailyMood === "restless";
    const calm = dailyMood === "calm" || dailyMood === "ok";
    // Check structureel stabiel: 5 van laatste 7 post-moods kalm
    const recentPost = moodHistory.filter(m => m.type === "post").slice(0, 7);
    const stablePost = recentPost.filter(m => m.mood === "calm" || m.mood === "ok").length;
    const isStructurallyStable = stablePost >= 5 && recentPost.length >= 5;
    if (experience === "experienced") {
      if (isStructurallyStable) return 99; // vrij
      if (calm) return 5;
      if (tense) return 3;
      return 4;
    }
    if (experience === "some") {
      if (calm) return 4;
      if (tense) return 2;
      return 3;
    }
    // beginner
    if (tense) return 2;
    if (calm) return 3;
    return 2;
  })();
  const canDoBreath = dailyBreaths < maxBreath;
  const canDoTask = dailyTasks.length > 0;
  const allDone = !canDoTask && !canDoBreath && tasksGenerated;
  const [soundOn, setSoundOn] = useState(true);
  const [reminder, setReminder] = useState("");
  const [isPremium] = useState(true);
  const [coins, setCoins] = useState(0);
  const [ownedItems, setOwnedItems] = useState(["hat_none", "shirt_none", "pants_none", "shoes_none", "skin_light", "hair_short", "hairc_brown", "acc_none", "pet_none"]);
  const [avatar, setAvatar] = useState({
    hat: "hat_none",
    shirt: "shirt_none",
    pants: "pants_none",
    shoes: "shoes_none",
    skin: "skin_light",
    hair: "hair_short",
    hairc: "hairc_brown",
    acc: "acc_none",
    pet: "pet_none"
  });
  const [showAvatar, setShowAvatar] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [thClients, setThClients] = useState([]);
  const [selClient, setSelClient] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [showAddEx, setShowAddEx] = useState(false);
  const [custExName, setCustExName] = useState("");
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [custExDesc, setCustExDesc] = useState("");
  const [custExList, setCustExList] = useState([]);
  const [careAlert, setCareAlert] = useState(true);
  const [thAgenda, setThAgenda] = useState([]);
  const [showAgendaAdd, setShowAgendaAdd] = useState(false);
  const [agClient, setAgClient] = useState("");
  const [agDate, setAgDate] = useState("");
  const [agTime, setAgTime] = useState("");
  const countRef = useRef(null);
  const exRef = useRef(null);
  const c = SC[season];
  const moods = accType === "child" ? MCH : accType === "junior" ? MJ : MA;
  const reasons = accType === "child" ? REASONS_C : accType === "junior" ? REASONS_J : REASONS_A;
  const checkinQ = useMemo(() => CQ[Math.floor(Math.random() * CQ.length)], [checkinDone]);
  const offerTxt = useMemo(() => OFFR[Math.floor(Math.random() * OFFR.length)], [showOffer]);
  const flowers = useMemo(() => {
    const n = Math.min(wi.flowers, 40);
    return Array.from({
      length: n
    }, (_, i) => ({
      x: -175 + i / Math.max(n, 1) * 350 + Math.sin(i * 7) * 20,
      y: 14 + Math.abs(Math.sin(i * 3)) * 35,
      color: c.fl[i % c.fl.length],
      sz: 0.35 + Math.random() * 0.55,
      id: i
    }));
  }, [wi.flowers, c.fl]);
  const particles = useMemo(() => {
    const isN = tod === "Nacht";
    return Array.from({
      length: 16
    }, (_, i) => ({
      x: Math.random() * 100,
      y: 5 + Math.random() * 78,
      sz: isN ? 2 + Math.random() * 3 : 1.2 + Math.random() * 2,
      del: Math.random() * 8,
      dur: 4 + Math.random() * 6,
      glow: isN,
      id: i
    }));
  }, [tod]);
  const stars = useMemo(() => Array.from({
    length: 40
  }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 38,
    sz: 0.8 + Math.random() * 2,
    del: Math.random() * 3,
    id: i
  })), []);
  useEffect(() => {
    if (phase !== "world" && phase !== "therapist_dash") return;
    const iv = setInterval(() => {
      setTod(getRealTod());
      setSeason(getRealSeason());
    }, 60000);
    return () => clearInterval(iv);
  }, [phase]);
  // Reset daily state on new day - maar NIET als lastDay leeg is (dan laden we data)
  useEffect(() => {
    if (!lastDay) return; // Nog geen data geladen - niet resetten
    const today = new Date().toDateString();
    if (today !== lastDay) {
      setLastDay(today);
      setDailyActions(0);
      setCheckinDone(false);
      setExDone(false);
      setDailyTasks([]);
      setTasksGenerated(false);
      setDailyBreaths(0);
      setDailyMood(null); // FIX C1: reset mood bij nieuwe dag
      const resetData = { ...saveDataRef.current, lastDay: today, dailyActions: 0, checkinDone: false, dailyTasks: [], tasksGenerated: false, dailyBreaths: 0, dailyMood: null, wi: saveDataRef.current.wi, lastBreathTime: null, lastTaskTime: null };
      try { localStorage.setItem("huxi-profile", JSON.stringify(resetData)); } catch(e) {}
      if (saveDataRef.current.userKey) firebaseSave(saveDataRef.current.userKey, resetData);
    }
  }, [lastDay]);
  // Enrich derived from world items - slow accumulation
  const enrich = Math.min(1, wi.leaves * 0.0013 + wi.flowers * 0.0025 + wi.grass * 0.001 + wi.stones * 0.0017 + wi.shrooms * 0.0017 + wi.bushes * 0.002 + wi.checkins * 0.0003 + wi.tasks * 0.0005);
  // World progress - unlocks landscape features
  const wpBoost = growth >= 0.8 ? 3.0 : 1.0;
  const wp = Math.min(1, (totalSessions * 0.0004 + wi.leaves * 0.0008 + wi.flowers * 0.0016 + wi.grass * 0.0006 + wi.stones * 0.0012 + wi.shrooms * 0.0012 + wi.bushes * 0.0016 + wi.brieven * 0.002 + wi.dagboeken * 0.0008 + wi.streakDays * 0.002) * wpBoost);
  useEffect(() => {
    if (phase !== "world") return;
    setWMsg((userName ? "Hoi " + userName + "! " : "") + "Welkom bij " + treeName + " 🌿");
    const t = setTimeout(() => setWMsg(""), 4000);
    return () => clearTimeout(t);
  }, [phase, treeName, userName]);
  useEffect(() => {
    if (phase !== "world") return;
    const iv = setInterval(() => saveData(), 30000);
    const onUnload = () => saveData();
    window.addEventListener("beforeunload", onUnload);
    return () => { clearInterval(iv); window.removeEventListener("beforeunload", onUnload); };
  }, [phase]);

  // Update cooldown tick every second
  useEffect(() => {
    const iv = setInterval(() => setCdTick(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Reminders - stay until dismissed
  useEffect(() => {
    if (phase !== "world") return;
    const msgs = ["Drink een slokje water 💧", "Rek je even uit 🙆", "Adem even diep in 🌬️", "Kijk even naar buiten 🪟", "Rol je schouders 🧘"];
    const iv = setInterval(() => {
      if (!reminder) setReminder(msgs[Math.floor(Math.random() * msgs.length)]);
    }, 180000);
    return () => clearInterval(iv);
  }, [phase, reminder]);
  // Generate daily tasks ONCE after checkin - never regenerate same day
  useEffect(() => {
    if (checkinDone && !tasksGenerated) {
      const type = accType === "child" ? "child" : accType === "junior" ? "junior" : "adult";
      const allTasks = [...MICRO[type]];
      const fresh = allTasks.filter(t => !lastTaskTexts.includes(t));
      const pool = fresh.length >= maxTasks ? fresh : allTasks;
      const shuffled = pool.sort(() => Math.random() - 0.5);
      const picked = [];
      const usedPrefixes = new Set();
      for (const t of shuffled) {
        if (picked.length >= maxTasks) break;
        const prefix = t.substring(0, 15);
        if (!usedPrefixes.has(prefix)) {
          picked.push(t);
          usedPrefixes.add(prefix);
        }
      }
      if (picked.length < maxTasks) {
        for (const t of shuffled) {
          if (picked.length >= maxTasks) break;
          if (!picked.includes(t)) picked.push(t);
        }
      }
      const newTasks = picked.map((t, i) => ({ id: Date.now() + i, text: t }));
      const newLastTaskTexts = [...picked, ...lastTaskTexts].slice(0, 30);
      setDailyTasks(newTasks);
      setLastTaskTexts(newLastTaskTexts);
      setTasksGenerated(true);
      // FIX C2: directe save zodat taken niet verloren gaan bij sluiten
      const saveTaskGen = { accType, reason, experience, treeName, userName, growth, coins, ownedItems, avatar, letters, diary, seenEx, lastExId, dailyMood, totalSessions, wi, lastDay, dailyActions, lastTaskTexts: newLastTaskTexts, dailyBreaths, dailyTasks: newTasks, tasksGenerated: true, checkinDone, lastCheckinDate, streakShields, secretQ, secretA, goals, buddy, moodHistory, petPositions, exPerEx, therapistCode, linkedTherapist };
      try { localStorage.setItem("huxi-profile", JSON.stringify(saveTaskGen)); } catch(e) {}
      if (userKey) firebaseSave(userKey, saveTaskGen);
    }
  }, [checkinDone, tasksGenerated]);
  // Rare animal
  const rareAnimal = useMemo(() => {
    const m = new Date().getMinutes();
    if (season === "Winter" && tod === "Nacht" && m < 10) return "🦉";
    if (season === "Lente" && tod === "Ochtend" && m < 15) return "🦌";
    if (season === "Zomer" && tod === "Avond" && m < 10) return "✨";
    if (season === "Herfst" && tod === "Middag" && m < 8) return "🦔";
    return null;
  }, [season, tod]);
  const onLeaf = useCallback(() => {
    const all = [...MEMZ];
    const now = Date.now();
    letters.forEach(l => {
      if (![30, 90, 180, 365].some(d => now - l.id < d * 86400000)) all.push(l.text);
    });
    setMemTxt(all[Math.floor(Math.random() * all.length)]);
    setShowMem(true);
    setTimeout(() => setShowMem(false), 4000);
  }, [letters]);
  const runEx = useCallback(() => {
    if (!curEx) return;
    const ex = curEx;
    const childMult = accType === "child" ? 0.5 : 1;
    const tot = custRounds || Math.round(ex.r * childMult);
    let rnd = 0;
    setShowSci(false);
    const startCount = secs => {
      setExCountdown(Math.ceil(secs));
      clearInterval(countRef.current);
      countRef.current = setInterval(() => setExCountdown(c => c > 0 ? c - 1 : 0), 1000);
    };
    const fin = () => {
      clearInterval(countRef.current);
      setExPhase("done");
      breathAudio.done();
      // Bereken nieuwe waarden DIRECT - geen setTimeout meer
      const newBreaths = dailyBreaths + 1;
      const newActions = dailyActions + 1;
      const newSessions = totalSessions + 1;
      const newCoinsF = coins + (ex.pts || 10);
      const newGrowthF = Math.min(1, growth + 0.004);
      const newWiF = { ...wi, leaves: wi.leaves + 1 };
      const newExPerEx = { ...exPerEx, [ex.id]: (exPerEx[ex.id] || 0) + 1 };
      // State updates
      setShowEx(false);
      setExDone(true);
      setGrowth(newGrowthF);
      setWi(newWiF);
      setLastExId(ex.id);
      setCoins(newCoinsF);
      setDailyActions(newActions);
      setDailyBreaths(newBreaths);
      setTotalSessions(newSessions);
      setExPerEx(newExPerEx);
      setPostMood(null);
      setShowPostMood(true);
      setLastBreathTime(Date.now());
      showWorldReward("breath");
      // DIRECTE SAVE - geen delay
      const saveF = { accType, reason, experience, treeName, userName, growth: newGrowthF, coins: newCoinsF, ownedItems, avatar, letters, diary, seenEx, lastExId: ex.id, dailyMood, totalSessions: newSessions, wi: newWiF, lastDay, dailyActions: newActions, lastTaskTexts, dailyBreaths: newBreaths, dailyTasks, tasksGenerated, checkinDone, lastCheckinDate, streakShields, secretQ, secretA, goals, buddy, moodHistory, petPositions, exPerEx: newExPerEx, therapistCode, linkedTherapist };
      try { localStorage.setItem("huxi-profile", JSON.stringify(saveF)); } catch(e) {}
      if (userKey) firebaseSave(userKey, saveF);
    };
    const cyc = () => {
      setExPhase("in");
      startCount(ex.iS);
      breathAudio.breathIn(ex.iS);
      exRef.current = setTimeout(() => {
        if (ex.hI > 0) {
          setExPhase("hold");
          startCount(ex.hI);
          breathAudio.hold(ex.hI);
          exRef.current = setTimeout(() => {
            setExPhase("out");
            startCount(ex.oS);
            breathAudio.breathOut(ex.oS);
            exRef.current = setTimeout(() => {
              if (ex.hO > 0) {
                setExPhase("hold2");
                startCount(ex.hO);
                breathAudio.hold(ex.hO);
                exRef.current = setTimeout(() => {
                  rnd++;
                  setExRound(rnd);
                  rnd >= tot ? fin() : cyc();
                }, ex.hO * 1000);
              } else {
                rnd++;
                setExRound(rnd);
                rnd >= tot ? fin() : cyc();
              }
            }, ex.oS * 1000);
          }, ex.hI * 1000);
        } else {
          setExPhase("out");
          startCount(ex.oS);
          breathAudio.breathOut(ex.oS);
          exRef.current = setTimeout(() => {
            rnd++;
            setExRound(rnd);
            rnd >= tot ? fin() : cyc();
          }, ex.oS * 1000);
        }
      }, ex.iS * 1000);
    };
    cyc();
  }, [curEx, custRounds, accType]);
  const stopEx = useCallback(() => {
    clearTimeout(exRef.current);
    clearInterval(countRef.current);
    breathAudio.stopAll();
    setShowEx(false);
  }, []);

  // Persistent storage
  // saveDataRef houdt altijd de MEEST RECENTE state bij - geen stale closure
  const saveDataRef = useRef({});
  useEffect(() => {
    saveDataRef.current = {
      accType, reason, experience, treeName, userName, growth, coins,
      ownedItems, avatar, letters, diary, seenEx, lastExId, dailyMood,
      totalSessions, wi, lastDay, dailyActions, lastTaskTexts,
      dailyBreaths, lastBreathTime, lastTaskTime, dailyTasks, tasksGenerated, checkinDone,
      lastCheckinDate, streakShields, secretQ, secretA, goals, buddy, moodHistory, petPositions, exPerEx,
      userKey, goalPeriod, reminder, lastBreathTime, lastTaskTime, // FIX M2+M3: goalPeriod en reminder opgeslagen
      therapistCode, linkedTherapist
    };
  });
  const saveData = () => {
    const data = saveDataRef.current;
    if (!data.accType) return;
    try { localStorage.setItem("huxi-profile", JSON.stringify(data)); } catch(e) {}
    if (data.userKey) firebaseSave(data.userKey, data);
  };
  const loadData = () => {
    try {
      const raw = localStorage.getItem("huxi-profile");
      if (raw) {
        const d = JSON.parse(raw);
        if (d.accType) {
          setAccType(d.accType);
          setReason(d.reason);
          setExperience(d.experience);
          setTreeName(d.treeName);
          setUserName(d.userName || "");
          setGrowth(d.growth || 0.01);
          setCoins(d.coins || 0);
          setDailyMood(d.dailyMood || null);
          setTotalSessions(d.totalSessions || 0);
          if (d.wi) setWi(d.wi);
          const today = new Date().toDateString();
          if (d.lastDay === today) {
            setLastDay(today);
            setDailyActions(d.dailyActions || 0);
            setDailyBreaths(d.dailyBreaths || 0);
            setDailyTasks(d.dailyTasks || []);
            setTasksGenerated(d.tasksGenerated || false);
            setCheckinDone(d.checkinDone || false);
          } else {
            setLastDay(today);
            setDailyActions(0);
            setDailyBreaths(0);
            setDailyTasks([]);
            setTasksGenerated(false);
            setCheckinDone(false);
            setDailyMood(null); // FIX C1b: reset mood bij nieuwe dag
          }
          setOwnedItems(d.ownedItems || ["hat_none", "shirt_none", "pants_none", "shoes_none", "skin_light", "hair_short", "hairc_brown", "acc_none", "pet_none"]);
          setAvatar(d.avatar || {
            hat: "hat_none",
            shirt: "shirt_none",
            pants: "pants_none",
            shoes: "shoes_none",
            skin: "skin_light",
            hair: "hair_short",
            hairc: "hairc_brown",
            acc: "acc_none",
            pet: "pet_none"
          });
          setLetters(d.letters || []);
          setDiary(d.diary || []);
          setSeenEx(d.seenEx || []);
          setLastExId(d.lastExId || null);
          if (d.lastTaskTexts) setLastTaskTexts(d.lastTaskTexts);
          if (d.lastCheckinDate) setLastCheckinDate(d.lastCheckinDate);
          if (d.streakShields !== undefined) setStreakShields(d.streakShields);
          if (d.goalPeriod !== undefined) setGoalPeriod(d.goalPeriod); // FIX M2
          if (d.reminder) setReminder(d.reminder); // FIX M3
          if (d.lastBreathTime) setLastBreathTime(d.lastBreathTime);
          if (d.lastTaskTime) setLastTaskTime(d.lastTaskTime);
          if (d.secretQ !== undefined) setSecretQ(d.secretQ);
          if (d.secretA) setSecretA(d.secretA);
          if (d.goals) setGoals(d.goals);
          if (d.buddy) setBuddy(d.buddy);
          if (Array.isArray(d.moodHistory)) setMoodHistory(d.moodHistory);
          if (d.petPositions && typeof d.petPositions === "object") setPetPositions(d.petPositions);
          if (d.exPerEx && typeof d.exPerEx === "object") setExPerEx(d.exPerEx);
          setPhase("world");
        }
      }
    } catch (e) {}
  };
  useEffect(() => {
    loadData();
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    if (!navigator.onLine) setIsOffline(true);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  // ═══ FUNCTIONS (no hooks) ═══
  // Smart exercise unlocking based on mood, experience, reason, sessions
  const isExUnlocked = ex => {
    // ── KINDEREN: speelse progressie op basis van sessies ──
    if (accType === "child") {
      // Wetenschappelijk verantwoorde oefeningen voor 6-11 jaar:
      // ✅ Langere uitademing dan inademing = kalmerend zenuwstelsel
      // ✅ Zachte vasthoudmomenten (max 4 tellen)
      // ❌ Geen hyperventilatie (Wim Hof, energize)
      // ❌ Geen activerende oefeningen
      if (ex.lv === "b") {
        if (ex.id === "basic") return true;                                          // 4in/4uit — altijd
        if ((ex.id === "calm2" || ex.id === "pursed") && totalSessions >= 3) return true;  // langere uitademing
        if (ex.id === "diaphragm" && totalSessions >= 6) return true;               // buikademhaling
      }
      if (ex.lv === "i") {
        if (ex.id === "sigh" && totalSessions >= 8) return true;                    // fysiologische zucht: veilig
        if (ex.id === "box" && totalSessions >= 12) return true;                    // vierkant: milde hold
        if (ex.id === "coherence" && totalSessions >= 18) return true;              // langzame hartcoherentie
      }
      if (ex.lv === "x") {
        // Wim Hof en energize: NOOIT voor kinderen (hyperventilatie/activerend)
        if (ex.id === "wimhof" || ex.id === "energize") return false;
        // Alternate nostril: complexe motoriek, alleen voor gevorderde kinderen
        if (ex.id === "alternate" && totalSessions >= 30) return true;
      }
      return false;
    }

    // ── JUNIOR: iets sneller progressie, meer variety ──
    if (accType === "junior") {
      if (ex.lv === "b") return true;
      if (ex.lv === "i") {
        if (ex.id === "sigh" && totalSessions >= 3) return true;
        if (totalSessions >= 5) return true;
      }
      if (ex.lv === "x") {
        // Wetenschappelijk: adolescenten (12-17) zijn neurologisch in ontwikkeling
        // en gevoeliger voor CO2-verlaging → hogere drempels dan volwassenen
        const recent7j = moodHistory.slice(0, 7);
        const stableDaysJ = recent7j.filter(e => e.mood === "calm" || e.mood === "ok").length;
        const isStableJ = stableDaysJ >= 6 && recent7j.length >= 7; // stricter dan volwassene
        const moodOkJ = dailyMood === "calm" || dailyMood === "ok";
        // Alternate nostril: veilig, complexe motoriek
        if (ex.id === "alternate" && totalSessions >= 30 && moodOkJ) return true;
        // Resonantie: rustig en veilig
        if (ex.id === "resonance" && totalSessions >= 35 && isStableJ) return true;
        // Wim Hof: adolescenten hebben HOGERE drempel dan volwassenen
        if (ex.id === "wimhof" && totalSessions >= 60 && isStableJ) return true;
        // Energize: ook hogere drempel
        if (ex.id === "energize" && totalSessions >= 55 && isStableJ) return true;
      }
      return false;
    }

    // ── VOLWASSENEN: op basis van exPerEx + ervaring + stemming ──
    // Drempels: hoe vaak een oefening gedaan moet zijn voor vrijspelen
    const threshold = experience === "experienced" ? 1 : experience === "some" ? 2 : 3;
    const done = id => (exPerEx[id] || 0) >= threshold;
    const doneOnce = id => (exPerEx[id] || 0) >= 1;
    
    // Familie 1 (basis) - altijd beschikbaar na 1 sessie
    const fam1 = ["basic", "calm2", "pursed", "diaphragm", "sigh"];
    const fam2 = ["box", "478", "coherence"];
    const fam3 = ["resonance", "alternate"];
    
    // Basis: altijd beschikbaar
    if (fam1.includes(ex.id)) return true;
    
    // Familie 2: vrijgespeeld als minstens 2 oefeningen uit fam1 voldoende gedaan
    const fam1Done = fam1.filter(id => done(id)).length;
    if (fam2.includes(ex.id)) {
      if (experience === "experienced") return true;
      if (experience === "some") return fam1Done >= 1;
      return fam1Done >= 2;
    }
    
    // Familie 3: vrijgespeeld als minstens 1 oefening uit fam2 voldoende gedaan
    const fam2Done = fam2.filter(id => done(id)).length;
    if (fam3.includes(ex.id)) {
      const recentPost = moodHistory.filter(m => m.type === "post").slice(0, 7);
      const stablePost = recentPost.filter(m => m.mood === "calm" || m.mood === "ok").length;
      const isStable = stablePost >= 3 || experience === "experienced";
      if (experience === "experienced") return fam1Done >= 1;
      return fam2Done >= 1 && isStable;
    }
    if (ex.lv === "x") {
      // Volwassenen: meer lichaamsbewustzijn, lagere drempel dan juniors
      // maar nog steeds enkel voor stabiele en ervaren gebruikers
      const recent7 = moodHistory.slice(0, 7);
      const stableDays = recent7.filter(e => e.mood === "calm" || e.mood === "ok").length;
      const isStableOverTime = stableDays >= 5 && recent7.length >= 5;
      const moodOkToday = dailyMood === "calm" || dailyMood === "ok";

      // Alternate nostril: veilig, complexe motoriek
      if (ex.id === "alternate" && totalSessions >= 25 && moodOkToday) return true;
      // Resonantie: rustig en veilig voor ervaren gebruikers
      if (ex.id === "resonance" && totalSessions >= 30 && isStableOverTime) return true;
      // Wim Hof: LAGER dan junior want meer lichaamskennis bij volwassenen
      if (ex.id === "wimhof" && totalSessions >= 45 && isStableOverTime && !isBurnout) return true;
      // Energize: activerend, ook lager dan junior
      if (ex.id === "energize" && totalSessions >= 40 && isStableOverTime && !isBurnout) return true;
    }
    return false;
  };
  const getWeekBonus = () => {
    // Week-based surprise: different exercise each week, based on week number
    const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const allEx = EX.filter(e => e.lv !== "x" && e.id !== "wimhof" && e.id !== "energize"); // not advanced, never auto-offer dangerous
    return allEx[weekNum % allEx.length];
  };
  const pickEx = () => {
    let pool = EX.filter(e => isExUnlocked(e));
    if (pool.length === 0) pool = EX.filter(e => e.lv === "b");
    // For child/junior: mood-based selection
    if (accType === "child" || accType === "junior") {
      const tense = dailyMood === "tense" || dailyMood === "overwhelmed" || dailyMood === "restless";
      const calm = dailyMood === "calm" || dailyMood === "ok";
      // NOOIT Wim Hof of energize voor kinderen
      if (accType === "child") pool = pool.filter(e => e.id !== "wimhof" && e.id !== "energize");
      if (tense) {
        // prioritize calming exercises
        const calming = pool.filter(e => e.en === "calm" || e.id === "basic" || e.id === "calm2" || e.id === "pursed");
        if (calming.length > 0) pool = calming;
      } else if (calm && totalSessions >= 5) {
        // mix in something new
        const weekBonus = getWeekBonus();
        // Wim Hof en energize nooit als bonus voor kinderen
        if (weekBonus && weekBonus.id !== "wimhof" && weekBonus.id !== "energize" && !pool.find(e => e.id === weekBonus.id)) {
          pool = [...pool, weekBonus];
        }
      }
    }
    // Wim Hof en Energize NOOIT automatisch - alleen als gebruiker zelf kiest
    pool = pool.filter(e => e.id !== "wimhof" && e.id !== "energize");
    if (pool.length === 0) pool = EX.filter(e => e.lv === "b");
    if (pool.length > 1) pool = pool.filter(e => e.id !== lastExId);
    if (pool.length > 1 && accType !== "child" && accType !== "junior") pool = pool.filter(e => {
      if (e.en === "up" && (dailyMood === "tense" || dailyMood === "overwhelmed" || dailyMood === "restless")) return false;
      return true;
    });
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : EX[0];
  };
  const launchEx = (ex, r) => {
    setCurEx(ex);
    setCustRounds(r || null);
    setShowOffer(false);
    setShowPicker(false);
    setShowEx(true);
    setExRound(0);
    setExPhase("idle");
    setWarnAcknowledged(false);
    if (!seenEx.includes(ex.id)) {
      setShowSci(true);
      setSeenEx(p => [...p, ex.id].slice(-200)); // FIX H2: max 200 geziene oefeningen
    } else setShowSci(false);
  };
  const startAuto = () => launchEx(pickEx(), null);
  const getSeasonalName = (ex) => {
    if (accType !== "child") return null;
    const m = new Date().getMonth(); // 0-11
    const isWinter = m === 11 || m === 0 || m === 1;
    const isSpring = m >= 2 && m <= 4;
    const isSummer = m >= 5 && m <= 7;
    const seasonal = {
      basic: isWinter ? "\u2744\uFE0F Sneeuwvlok-adem" : isSpring ? "\uD83C\uDF38 Bloesem-adem" : isSummer ? "\u2600\uFE0F Zonnestraal-adem" : "\uD83C\uDF42 Herfstwind-adem",
      box: isWinter ? "\u2744\uFE0F IJsblokje ademen" : isSpring ? "\uD83C\uDF33 Boom-adem" : isSummer ? "\uD83C\uDF0A Golf-adem" : "\uD83C\uDF42 Bladeren-adem",
      pursed: isWinter ? "\uD83C\uDF86 Kaarsje-adem" : "\uD83E\uDD2F Magisch uitblazen",
      wimhof: "\uD83E\uDDB8 Superheld-adem",
      energize: "\uD83D\uDE80 Raket-adem"
    };
    return seasonal[ex.id] || null;
  };
  const showWorldReward = (type) => {
    setWorldReward(type);
    setTimeout(() => setWorldReward(null), 2500);
  };
  const PET_EM = { pet_cat: "\uD83D\uDC31", pet_dog: "\uD83D\uDC36", pet_rabbit: "\uD83D\uDC30", pet_dragon: "\uD83D\uDC09", pet_unicorn: "\uD83E\uDD84", pet_phoenix: "\uD83D\uDD25", pet_dino: "\uD83E\uDD95", pet_hamster: "\uD83D\uDC39", pet_fish: "\uD83D\uDC1F", pet_parrot: "\uD83E\uDD9C", pet_turtle: "\uD83D\uDC22", pet_pony: "\uD83D\uDC34" , pet_fox: "\uD83E\uDD8A", pet_owl: "\uD83E\uDD89", pet_bear: "\uD83D\uDC3B", pet_penguin: "\uD83D\uDC27", pet_frog: "\uD83D\uDC38", pet_butterfly: "\uD83E\uDD8B", pet_wolf: "\uD83D\uDC3A", pet_lion: "\uD83E\uDD81", pet_galaxy_cat: "\u2728\uD83D\uDC31", pet_lava_dragon: "\uD83D\uDD25\uD83D\uDC09", pet_aurora_fox: "\uD83C\uDF0C\uD83E\uDD8A", pet_crystal_wolf: "\uD83D\uDC8E\uD83D\uDC3A", pet_rainbow_pony: "\uD83C\uDF08\uD83E\uDD84" };

  const doCheckin = id => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const twoDaysAgo = new Date(Date.now() - 2*86400000).toDateString();
    // Bereken alle nieuwe waarden INLINE zodat de save correct is
    const newGrowthC = Math.min(1, growth + 0.001);
    let newStreak = wi.streakDays || 0;
    let newShields = streakShields;
    if (lastCheckinDate === today) {
      // al ingecheckt vandaag - geen streak update
    } else if (lastCheckinDate === yesterday) {
      newStreak = newStreak + 1;
      if (newStreak % 7 === 0) newShields = Math.min(2, newShields + 1);
    } else if (lastCheckinDate === twoDaysAgo && streakShields > 0) {
      newStreak = newStreak + 1;
      newShields = newShields - 1;
    } else {
      newStreak = 1;
    }
    const newWiC = { ...wi, checkins: wi.checkins + 1, streakDays: newStreak };
    const newMoodH = [{ date: today, mood: id, ts: Date.now() }, ...moodHistory.filter(e => e.date !== today)].slice(0, 90);
    const newCoinsC = (accType === "child" || accType === "junior") ? coins + 2 : coins;
    // Stel alle state in
    setDailyMood(id);
    setCheckinDone(true);
    setGrowth(newGrowthC);
    setWi(newWiC);
    setStreakShields(newShields);
    setLastCheckinDate(today);
    setMoodHistory(newMoodH);
    if (accType === "child" || accType === "junior") setCoins(newCoinsC);
    // Inline save met nieuwe waarden (geen stale closure probleem)
    const saveCI = { accType, reason, experience, treeName, userName, growth: newGrowthC, coins: newCoinsC, ownedItems, avatar, letters, diary, seenEx, lastExId, dailyMood: id, totalSessions, wi: newWiC, lastDay, dailyActions, lastTaskTexts, dailyBreaths, lastBreathTime, lastTaskTime, dailyTasks, tasksGenerated, checkinDone: true, lastCheckinDate: today, streakShields: newShields, secretQ, secretA, goals, buddy, moodHistory: newMoodH, petPositions, exPerEx, therapistCode, linkedTherapist };
    try { localStorage.setItem("huxi-profile", JSON.stringify(saveCI)); } catch(e) {}
    if (userKey) firebaseSave(userKey, saveCI);
  };
  const saveLetter = () => {
    if (!letterDraft.trim()) return;
    const periods = letters.length === 0 ? [30] : letters.length === 1 ? [90] : letters.length === 2 ? [180] : letters.length === 3 ? [365] : [180, 365];
    const period = letterPeriod && periods.includes(letterPeriod) ? letterPeriod : periods[0];
    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + period);
    const newLetter = {
      text: letterDraft.trim(),
      date: new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }),
      id: Date.now(),
      unlockDate: unlockDate.toISOString()
    };
    const newLetters = [...letters, newLetter].slice(-60); // FIX H1: max 60 brieven
    setLetters(newLetters);
    setLetterDraft("");
    setShowLetter(false);
    showWorldReward("letter");
    const newWi = { ...wi, flowers: wi.flowers + 1, brieven: wi.brieven + 1 };
    setWi(newWi);
    const newCoins = (accType === "child" || accType === "junior") ? coins + 8 : coins;
    if (accType === "child" || accType === "junior") setCoins(newCoins); // FIX H5: consistent met save
    const saveL = { accType, reason, experience, treeName, userName, growth, coins: newCoins, ownedItems, avatar, letters: newLetters, diary, seenEx, lastExId, dailyMood, totalSessions, wi: newWi, lastDay, dailyActions, lastTaskTexts, dailyBreaths, lastBreathTime, lastTaskTime, dailyTasks, tasksGenerated, checkinDone, lastCheckinDate, streakShields, secretQ, secretA, goals, buddy, moodHistory, petPositions, exPerEx, therapistCode, linkedTherapist };
    try { localStorage.setItem("huxi-profile", JSON.stringify(saveL)); } catch(e) {}
    if (userKey) firebaseSave(userKey, saveL);
  };
  const saveDiary = () => {
    if (!diaryDraft.trim()) return;
    const newEntry = { text: diaryDraft.trim(), date: new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long" }), id: Date.now() };
    const newDiary = [newEntry, ...diary].slice(0, 90);
    setDiary(newDiary);
    setDiaryDraft("");
    setShowDiary(false);
    showWorldReward("diary");
    const newWi = { ...wi, grass: wi.grass + 1, dagboeken: wi.dagboeken + 1 };
    setWi(newWi);
    const newCoins = (accType === "child" || accType === "junior") ? coins + 5 : coins;
    if (accType === "child" || accType === "junior") setCoins(newCoins); // FIX H5: consistent met save
    const saveD = { accType, reason, experience, treeName, userName, growth, coins: newCoins, ownedItems, avatar, letters, diary: newDiary, seenEx, lastExId, dailyMood, totalSessions, wi: newWi, lastDay, dailyActions, lastTaskTexts, dailyBreaths, lastBreathTime, lastTaskTime, dailyTasks, tasksGenerated, checkinDone, lastCheckinDate, streakShields, secretQ, secretA, goals, buddy, moodHistory, petPositions, exPerEx, therapistCode, linkedTherapist };
    try { localStorage.setItem("huxi-profile", JSON.stringify(saveD)); } catch(e) {}
    if (userKey) firebaseSave(userKey, saveD);
  };
  const switchAcc = () => {
    try {
      localStorage.removeItem("huxi-profile");
    } catch (e) {}
    setShowSett(false);
    setUserKey("");
    setLoginName("");
    setLoginPin("");
    setBuddy("pet_none");
    setGoals([]);
    setStreakShields(0);
    setLastCheckinDate("");
    setPhase("login");
    setAccType(null);
    setReason(null);
    setExperience(null);
    setTreeName("");
    setUserName("");
    setNameIn("");
    setUserNameIn("");
    setGrowth(0.01);
    setWi({
      leaves: 0,
      flowers: 0,
      grass: 0,
      stones: 0,
      shrooms: 0,
      bushes: 0,
      streakDays: 0,
      brieven: 0,
      dagboeken: 0,
      tools: 0,
      checkins: 0,
      tasks: 0
    });
    setTotalSessions(0);
    setCheckinDone(false);
    setExDone(false);
    setCoins(0);
    setOwnedItems(["hat_none", "shirt_none", "pants_none", "shoes_none", "skin_light", "hair_short", "hairc_brown", "acc_none", "pet_none"]);
    setAvatar({
      hat: "hat_none",
      shirt: "shirt_none",
      pants: "pants_none",
      shoes: "shoes_none",
      skin: "skin_light",
      hair: "hair_short",
      hairc: "hairc_brown",
      acc: "acc_none",
      pet: "pet_none"
    });
    setLetters([]);
    setDiary([]);
    setSeenEx([]);
    setLastExId(null);
    setDailyMood(null);
    setLastTaskTexts([]);
    setDailyActions(0);
    setDailyBreaths(0);
    setDailyTasks([]);
    setTasksGenerated(false);
    setCheckinDone(false);
    setLastDay("");
    setLastCheckinDate("");
    setStreakShields(0);
    setBuddy("pet_none");
    setGoals([]);
  };
  const tapA = msg => {
    setAnimalMsg(msg);
    setTimeout(() => setAnimalMsg(""), 2500);
  };
  const finTool = () => {
    const newGrowthT = Math.min(1, growth + 0.002);
    const newWiT = {
      ...wi,
      tools: wi.tools + 1,
      stones: wi.stones + (wi.tools % 2 === 0 ? 1 : 0),
      shrooms: wi.shrooms + (wi.tools % 2 === 1 ? 1 : 0)
    };
    const newActionsT = dailyActions + 1;
    const newSessionsT = totalSessions + 1;
    const newCoinsT = (accType === "child" || accType === "junior") ? coins + 6 : coins;
    setActiveTool(null);
    setToolStep(0);
    setShowTools(false);
    setGrowth(newGrowthT);
    setWi(newWiT);
    setDailyActions(newActionsT);
    setTotalSessions(newSessionsT);
    if (accType === "child" || accType === "junior") setCoins(newCoinsT);
    const saveTL = { accType, reason, experience, treeName, userName, growth: newGrowthT, coins: newCoinsT, ownedItems, avatar, letters, diary, seenEx, lastExId, dailyMood, totalSessions: newSessionsT, wi: newWiT, lastDay, dailyActions: newActionsT, lastTaskTexts, dailyBreaths, lastBreathTime, lastTaskTime, dailyTasks, tasksGenerated, checkinDone, lastCheckinDate, streakShields, secretQ, secretA, goals, buddy, moodHistory, petPositions, exPerEx, therapistCode, linkedTherapist };
    try { localStorage.setItem("huxi-profile", JSON.stringify(saveTL)); } catch(e) {}
    if (userKey) firebaseSave(userKey, saveTL);
  };
  const nextStep = steps => {
    toolStep < steps.length - 1 ? setToolStep(s => s + 1) : finTool();
  };
  // Task system
  const isQuestion = text => {
    const t = text.toLowerCase();
    return /^(noem|wat|wie|hoe|waar|beschrijf|welk|als je|aan wie|verzin|teken|rate|vertel)/.test(t);
  };
  const taskTimerRef = useRef(null);
  const startTask = task => {
    setCurTask(task);
    setTaskInput("");
    setTaskTimer(isQuestion(task.text) ? 0 : 12);
    if (taskTimerRef.current) clearInterval(taskTimerRef.current);
    if (!isQuestion(task.text)) {
      let t = 12;
      taskTimerRef.current = setInterval(() => {
        t--;
        setTaskTimer(t);
        if (t <= 0) {
          clearInterval(taskTimerRef.current);
          taskTimerRef.current = null;
          completeTask(task.id);
        }
      }, 1000);
    }
  };
  const completeTask = tid => {
    const newTasks = dailyTasks.filter(t => t.id !== tid);
    const newGrowth = Math.min(1, growth + 0.002);
    const newWi = { ...wi, tasks: wi.tasks + 1, bushes: wi.bushes + (wi.tasks % 5 === 0 ? 1 : 0) };
    const newActions = dailyActions + 1;
    const newSessions = totalSessions + 1;
    const newCoins = (accType === "child" || accType === "junior") ? coins + 5 : coins;
    setCurTask(null);
    setLastTaskTime(Date.now());
    setDailyTasks(newTasks);
    setGrowth(newGrowth);
    setWi(newWi);
    setDailyActions(newActions);
    setTotalSessions(newSessions);
    if (accType === "child" || accType === "junior") setCoins(newCoins); // FIX H5: consistent met save
    showWorldReward("task");
    const saveT = { accType, reason, experience, treeName, userName, growth: newGrowth, coins: newCoins, ownedItems, avatar, letters, diary, seenEx, lastExId, dailyMood, totalSessions: newSessions, wi: newWi, lastDay, dailyActions: newActions, lastTaskTexts, dailyBreaths: dailyBreaths, dailyTasks: newTasks, tasksGenerated, checkinDone, lastCheckinDate, streakShields, secretQ, secretA, goals, buddy, moodHistory, petPositions, exPerEx, therapistCode, linkedTherapist };
    try { localStorage.setItem("huxi-profile", JSON.stringify(saveT)); } catch(e) {}
    if (userKey) firebaseSave(userKey, saveT);
  };
  const finishTask = () => {
    if (taskTimerRef.current) {
      clearInterval(taskTimerRef.current);
      taskTimerRef.current = null;
    }
    if (curTask) completeTask(curTask.id);
  };
  const moodSlow = dailyMood === "overwhelmed" ? 2.5 : dailyMood === "tense" ? 1.8 : 1;
  const moodWarm = dailyMood === "overwhelmed" ? "rgba(255,180,100,0.1)" : dailyMood === "tense" ? "rgba(255,160,80,0.06)" : "transparent";
  const tI = {
    Ochtend: "🌅",
    Middag: "☀️",
    Avond: "🌇",
    Nacht: "🌙"
  }[tod];
  const sI = {
    Lente: "🌸",
    Zomer: "☀️",
    Herfst: "🍂",
    Winter: "❄️"
  }[season];
  const showCreek = wp > 0.35;
  const showBridge = wp > 0.55;
  const showPond = wp > 0.5;
  const showMountains = wp > 0.6;
  const showBench = wp > 0.65;

  // ═══ RENDERS ═══
  // CSS wordt geladen via css/style.css

  const overlay = children => ({
    ...F,
    zIndex: 30,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });
  const modal = {
    background: "rgba(255,255,255,0.97)",
    borderRadius: 24,
    padding: "24px 22px",
    width: 300,
    maxHeight: "80vh",
    overflow: "auto"
  };
  const g = "#45545E";
  const g5 = "rgba(61,74,88,0.5)";
  const g3 = "rgba(61,74,88,0.3)";

  // WELCOME
  if (phase === "login") return /*#__PURE__*/React.createElement("div", {
    style: W
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100%", padding: "32px 24px",
      background: "linear-gradient(160deg,#1a2f1f 0%,#0d1f12 100%)"
    }
  },
    /*#__PURE__*/React.createElement("div", { className: "fadeUp", style: { textAlign: "center", width: "100%", maxWidth: 340 } },
      /*#__PURE__*/React.createElement("div", { style: { fontSize: 64, marginBottom: 8 } }, "\uD83C\uDF31"),
      /*#__PURE__*/React.createElement("h1", { style: { color: "#70BCBC", fontSize: 28, fontWeight: 700, margin: "0 0 4px", letterSpacing: 6 } }, "HUXI"),
      /*#__PURE__*/React.createElement("p", { style: { color: "rgba(168,213,181,0.6)", fontSize: 13, margin: "0 0 28px", fontStyle: "italic" } }, "Jouw rustige natuurwereld"),
      loginMode === "login" && /*#__PURE__*/React.createElement(React.Fragment, null,
        /*#__PURE__*/React.createElement("div", { style: { background: "rgba(255,255,255,0.07)", borderRadius: 20, padding: "24px 20px", marginBottom: 16 } },
          /*#__PURE__*/React.createElement("p", { style: { color: "#A8D5B5", fontSize: 13, fontWeight: 600, margin: "0 0 8px", textAlign: "left" } }, "Jouw naam"),
          /*#__PURE__*/React.createElement("input", {
            type: "text", placeholder: "Bijv. Emma",
            value: loginName, onChange: e => setLoginName(e.target.value),
            style: { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid rgba(112,188,188,0.3)", fontSize: 15, outline: "none", marginBottom: 16, boxSizing: "border-box", color: "#45545E", background: "white" }
          }),
          /*#__PURE__*/React.createElement("p", { style: { color: "#A8D5B5", fontSize: 13, fontWeight: 600, margin: "0 0 8px", textAlign: "left" } }, "Jouw pincode (4 cijfers)"),
          /*#__PURE__*/React.createElement("input", {
            type: "number", placeholder: "1234",
            value: loginPin, onChange: e => setLoginPin(e.target.value.slice(0,4)),
            style: { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid rgba(112,188,188,0.3)", fontSize: 15, outline: "none", marginBottom: 8, boxSizing: "border-box", color: "#45545E", background: "white" }
          }),
          /*#__PURE__*/React.createElement("p", { style: { color: "rgba(168,213,181,0.45)", fontSize: 11, margin: "0 0 4px", textAlign: "center" } }, "Bestaand profiel? Gebruik je naam en pincode. Nieuw? Kies gewoon een naam en 4 cijfers.")
        ),
        loginError && /*#__PURE__*/React.createElement("p", { style: { color: "#E07850", fontSize: 12, textAlign: "center", marginBottom: 10 } }, loginError),
        /*#__PURE__*/React.createElement("button", {
          onClick: async () => {
            if (!loginName.trim() || loginPin.length !== 4 || !/^\d{4}$/.test(loginPin)) { setLoginError("Vul je naam en een pincode van 4 cijfers (alleen cijfers) in"); return; }
            setLoginLoading(true); setLoginError("");
            const key = makeKey(loginName, loginPin);
            const data = await firebaseLoad(key);
            if (data && data.accType) {
              setUserKey(key); setAccType(data.accType);
              if (data.reason) setReason(data.reason);
              if (data.experience) setExperience(data.experience);
              if (data.treeName) setTreeName(data.treeName);
              if (data.userName) setUserName(data.userName);
              if (data.growth) setGrowth(data.growth);
              if (data.coins) setCoins(data.coins);
              setOwnedItems(Array.isArray(data.ownedItems) && data.ownedItems.length > 0 ? data.ownedItems : ["hat_none","shirt_none","pants_none","shoes_none","skin_light","hair_short","hairc_brown","acc_none","pet_none"]);
              if (data.avatar) setAvatar(data.avatar);
              setLetters(Array.isArray(data.letters) ? data.letters : []);
              setDiary(Array.isArray(data.diary) ? data.diary : []);
              setSeenEx(Array.isArray(data.seenEx) ? data.seenEx : []);
              if (data.lastExId) setLastExId(data.lastExId);
              if (data.totalSessions !== undefined) setTotalSessions(data.totalSessions || 0);
              if (data.wi) setWi(data.wi);
              if (data.dailyMood) setDailyMood(data.dailyMood);
              if (data.lastCheckinDate) setLastCheckinDate(data.lastCheckinDate);
              if (data.streakShields !== undefined) setStreakShields(data.streakShields);
              if (data.goalPeriod !== undefined) setGoalPeriod(data.goalPeriod); // FIX M2
              if (data.reminder) setReminder(data.reminder); // FIX M3
              if (data.lastBreathTime) setLastBreathTime(data.lastBreathTime);
              if (data.lastTaskTime) setLastTaskTime(data.lastTaskTime);
              if (data.secretQ !== undefined) setSecretQ(data.secretQ);
              if (data.secretA) setSecretA(data.secretA);
              setGoals(Array.isArray(data.goals) ? data.goals : []);
              setBuddy(data.buddy && typeof data.buddy === "string" ? data.buddy : "pet_none");
              if (Array.isArray(data.moodHistory)) setMoodHistory(data.moodHistory);
              if (data.petPositions && typeof data.petPositions === "object") setPetPositions(data.petPositions);
              if (data.exPerEx && typeof data.exPerEx === "object") setExPerEx(data.exPerEx);
              if (data.therapistCode) setTherapistCode(data.therapistCode);
              if (data.linkedTherapist) setLinkedTherapist(data.linkedTherapist);
              setLastTaskTexts(Array.isArray(data.lastTaskTexts) ? data.lastTaskTexts : []);
              const today = new Date().toDateString();
              if (data.lastDay === today) {
                setLastDay(today); setDailyActions(data.dailyActions || 0);
                setDailyBreaths(data.dailyBreaths || 0); setDailyTasks(data.dailyTasks || []);
                setTasksGenerated(data.tasksGenerated || false); setCheckinDone(data.checkinDone || false);
              } else {
                setLastDay(today); setDailyActions(0); setDailyBreaths(0);
                setDailyTasks([]); setTasksGenerated(false); setCheckinDone(false);
                setDailyMood(null);
              }
              if (data.lastTaskTexts) setLastTaskTexts(data.lastTaskTexts);
              setPhase("world");
            } else {
              setUserKey(key); setPhase("onboarding");
            }
            setLoginLoading(false);
          },
          disabled: loginLoading,
          style: { width: "100%", padding: "14px 0", borderRadius: 14, background: loginLoading ? "#666" : "linear-gradient(135deg,#DC7553,#70BCBC)", color: "white", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", marginBottom: 12 }
        }, loginLoading ? "Even laden... \uD83C\uDF3F" : "Ga naar mijn wereld \uD83C\uDF31"),
        /*#__PURE__*/React.createElement("button", {
          onClick: () => { setLoginMode("forgot"); setLoginError(""); },
          style: { background: "none", border: "none", color: "rgba(168,213,181,0.5)", fontSize: 12, cursor: "pointer", display: "block", marginBottom: 6 }
        }, "Pincode vergeten?")
      ),
      loginMode === "forgot" && /*#__PURE__*/React.createElement(React.Fragment, null,
        /*#__PURE__*/React.createElement("div", { style: { background: "rgba(255,255,255,0.07)", borderRadius: 20, padding: "24px 20px", marginBottom: 16 } },
          /*#__PURE__*/React.createElement("p", { style: { color: "#A8D5B5", fontSize: 14, fontWeight: 700, margin: "0 0 12px" } }, "\uD83D\uDD11 Pincode vergeten"),
          /*#__PURE__*/React.createElement("p", { style: { color: "#A8D5B5", fontSize: 13, fontWeight: 600, margin: "0 0 8px", textAlign: "left" } }, "Jouw naam"),
          /*#__PURE__*/React.createElement("input", {
            type: "text", placeholder: "Jouw naam",
            value: loginName, onChange: e => setLoginName(e.target.value),
            style: { width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid rgba(112,188,188,0.3)", fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box", color: "#45545E", background: "white" }
          }),
          /*#__PURE__*/React.createElement("p", { style: { color: "#A8D5B5", fontSize: 13, fontWeight: 600, margin: "0 0 8px", textAlign: "left" } }, "Geheime vraag antwoord"),
          /*#__PURE__*/React.createElement("input", {
            type: "text", placeholder: "Jouw antwoord",
            value: loginPin, onChange: e => setLoginPin(e.target.value),
            style: { width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid rgba(112,188,188,0.3)", fontSize: 14, outline: "none", marginBottom: 8, boxSizing: "border-box", color: "#45545E", background: "white" }
          }),
          /*#__PURE__*/React.createElement("p", { style: { color: "rgba(168,213,181,0.4)", fontSize: 11, marginBottom: 0 } }, "Antwoord op je geheime vraag bij aanmaken")
        ),
        loginError && /*#__PURE__*/React.createElement("p", { style: { color: "#E07850", fontSize: 12, textAlign: "center", marginBottom: 10 } }, loginError),
        /*#__PURE__*/React.createElement("button", {
          onClick: () => { setLoginMode("login"); setLoginError(""); setLoginPin(""); },
          style: { background: "none", border: "none", color: "rgba(168,213,181,0.5)", fontSize: 12, cursor: "pointer", marginBottom: 8, display: "block", width: "100%", textAlign: "center" }
        }, "\u2190 Terug naar inloggen")
      )
    )
  ));

  if (phase === "onboarding") return /*#__PURE__*/React.createElement("div", {
    style: W
  }, /*#__PURE__*/React.createElement("div", {
    style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "40px 28px", background: "linear-gradient(160deg,#1a2f1f 0%,#0d1f12 100%)" }
  },
    /*#__PURE__*/React.createElement("div", { className: "fadeUp", style: { textAlign: "center", maxWidth: 320 } },
      /*#__PURE__*/React.createElement("div", { style: { fontSize: 80, marginBottom: 20 } }, "\uD83C\uDF31"),
      /*#__PURE__*/React.createElement("div", {
        style: { background: "rgba(255,255,255,0.07)", borderRadius: 20, padding: "24px 20px", marginBottom: 28 }
      },
        /*#__PURE__*/React.createElement("p", { style: { color: "#A8D5B5", fontSize: 20, fontWeight: 700, margin: "0 0 14px", lineHeight: 1.4 } }, "Vandaag planten we een zaadje."),
        /*#__PURE__*/React.createElement("p", { style: { color: "rgba(168,213,181,0.7)", fontSize: 15, margin: "0 0 10px", lineHeight: 1.6 } }, "Elke keer je oefent, groei jij en je wereld een beetje."),
        /*#__PURE__*/React.createElement("p", { style: { color: "rgba(168,213,181,0.5)", fontSize: 13, margin: 0, lineHeight: 1.6 } }, "Geen grote stappen \u2014 gewoon elke dag een klein moment voor jezelf.")
      ),
      /*#__PURE__*/React.createElement("button", {
        className: "mb",
        style: { width: "100%", padding: "16px 0", fontSize: 16, fontWeight: 700 },
        onClick: () => setPhase("welcome")
      }, "Begin \uD83C\uDF31")
    )
  ));

  if (phase === "welcome") return /*#__PURE__*/React.createElement("div", {
    style: W
  }, /*#__PURE__*/React.createElement("div", {
    style: OB
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: OBC
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 52
    }
  }, "\uD83C\uDF33"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 44,
      fontWeight: 700,
      color: "#70BCBC",
      letterSpacing: 8,
      margin: "4px 0"
    }
  }, "HUXI"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(200,230,180,0.8)",
      fontSize: 14,
      marginBottom: 22
    }
  }, "Jouw rustige natuurwereld"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(220,240,200,0.9)",
      fontSize: 16,
      fontWeight: 600,
      marginBottom: 16
    }
  }, "Wie ben jij?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      maxWidth: 300,
      margin: "0 auto"
    }
  }, ACCS.map(a => /*#__PURE__*/React.createElement("button", {
    key: a.id,
    className: "card",
    onClick: () => {
      setAccType(a.id);
      setPhase(a.id === "therapist" ? "planting" : "reason");
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 26
    }
  }, a.emoji), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      color: "#B8D8CC"
    }
  }, a.label), a.age && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: "rgba(200,230,180,0.6)"
    }
  }, a.age), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: "rgba(200,230,180,0.45)"
    }
  }, a.desc)))))));

  // REASON
  if (phase === "reason") return /*#__PURE__*/React.createElement("div", {
    style: W
  }, /*#__PURE__*/React.createElement("div", { style: OB },
    /*#__PURE__*/React.createElement("div", { className: "fadeUp", style: { ...OBC, maxHeight: "90vh", overflowY: "auto" } },
      /*#__PURE__*/React.createElement("div", { style: { fontSize: 40, marginBottom: 12 } }, accType === "child" ? "\uD83E\uDD8B" : "\uD83C\uDF3F"),
      /*#__PURE__*/React.createElement("h2", { style: { fontSize: 20, fontWeight: 700, color: "#70BCBC", marginBottom: 4 } },
        accType === "child" ? "Waarom ben je hier?" : "Wat brengt je hier?"
      ),
      /*#__PURE__*/React.createElement("p", { style: { color: "rgba(200,230,180,0.6)", fontSize: 12, marginBottom: 16 } }, "Je mag meerdere dingen aanduiden"),
      reasons.map(r => /*#__PURE__*/React.createElement("button", {
        key: r.id, className: "rb",
        style: {
          border: selectedReasons.includes(r.id) ? "2px solid #70BCBC" : "2px solid transparent",
          background: selectedReasons.includes(r.id) ? "rgba(112,188,188,0.15)" : "rgba(255,255,255,0.06)",
          position: "relative"
        },
        onClick: () => setSelectedReasons(prev =>
          prev.includes(r.id) ? prev.filter(x => x !== r.id) : [...prev, r.id]
        )
      },
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 20 } }, r.e),
        /*#__PURE__*/React.createElement("span", { style: { color: "#D8E8F0", fontSize: 14, fontWeight: 600 } }, r.l),
        selectedReasons.includes(r.id) && /*#__PURE__*/React.createElement("span", {
          style: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#70BCBC", fontSize: 18 }
        }, "\u2713")
      )),
      /*#__PURE__*/React.createElement("button", {
        className: "mb",
        style: { width: "100%", marginTop: 16, padding: "13px 0", opacity: selectedReasons.length === 0 ? 0.4 : 1 },
        onClick: () => {
          if (selectedReasons.length === 0) return;
          setReason(selectedReasons[0]);
          setPhase("mood_first");
        }
      }, selectedReasons.length === 0 ? "Kies minstens 1 reden" : "Volgende \u2192")
    )
  ))

  // MOOD
  if (phase === "mood_first") return /*#__PURE__*/React.createElement("div", {
    style: W
  }, /*#__PURE__*/React.createElement("div", {
    style: OB
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: OBC
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 40,
      marginBottom: 12
    }
  }, accType === "child" ? "🐰" : "🌱"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 20,
      fontWeight: 700,
      color: "#70BCBC",
      marginBottom: 6
    }
  }, "Hoe voel je je nu?"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(200,230,180,0.6)",
      fontSize: 12,
      marginBottom: 20
    }
  }, accType === "child" ? "Kies het diertje dat bij je past" : "Er is geen goed of fout antwoord"), moods.map(m => /*#__PURE__*/React.createElement("button", {
    key: m.id,
    className: "mb2",
    style: {
      borderColor: m.c + "66"
    },
    onClick: () => {
      setDailyMood(m.id);
      if (accType === "child") {
        setExperience("none");
        setPhase("planting");
      } else setPhase("experience");
    }
  }, accType === "child" && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 24
    }
  }, m.a), /*#__PURE__*/React.createElement("span", {
    style: {
      color: m.c,
      fontSize: 14,
      fontWeight: 600
    }
  }, m.l))))));

  // EXPERIENCE
  if (phase === "experience") return /*#__PURE__*/React.createElement("div", {
    style: W
  }, /*#__PURE__*/React.createElement("div", {
    style: OB
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: OBC
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 40,
      marginBottom: 12
    }
  }, "\uD83C\uDF2C\uFE0F"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 20,
      fontWeight: 700,
      color: "#70BCBC",
      marginBottom: 6
    }
  }, "Heb je ervaring met ademhaling?"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(200,230,180,0.6)",
      fontSize: 12,
      marginBottom: 20
    }
  }, "Dit helpt ons de juiste oefeningen te kiezen"), EXPLVL.map(e => /*#__PURE__*/React.createElement("button", {
    key: e.id,
    className: "rb",
    onClick: () => {
      setExperience(e.id);
      setPhase("planting");
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22
    }
  }, e.e), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#D8E8F0",
      fontSize: 14,
      fontWeight: 600
    }
  }, e.l))))));

  // PLANTING
  if (phase === "planting") {
    const isT = accType === "therapist";
    const SECQS = ["Wat is de naam van je huisdier?","Wat is je favoriete kleur?","Wat is de naam van je beste vriend?","Wat is je favoriete dier?"];
    const go = () => {
      if (!userNameIn.trim()) return;
      if (accType === "child" && !plantSecA) return;
      if (accType !== "child" && !isT && !plantSecA.trim()) return;
      setUserName(userNameIn.trim() || "");
      setTreeName(nameIn.trim() || (accType === "child" ? "Sprout" : "Mijn Boom"));
      setSecretQ(plantSecQ);
      setSecretA(plantSecA.trim().toLowerCase());
      setPhase(isT ? "therapist_dash" : "world");
      setGrowth(0.01);
      if (!isT) setShowWelcome(true);
      const saveOB = { accType, reason, experience, treeName: nameIn.trim() || (accType === "child" ? "Sprout" : "Mijn Boom"), userName: userNameIn.trim() || "", growth: 0.01, coins, ownedItems, avatar, letters: [], diary: [], seenEx: [], lastExId: null, dailyMood: null, totalSessions: 0, wi, lastDay, dailyActions: 0, lastTaskTexts: [], dailyBreaths: 0, dailyTasks: [], tasksGenerated: false, checkinDone: false, lastCheckinDate: null, streakShields: 0, secretQ: plantSecQ, secretA: plantSecA.trim().toLowerCase(), goals: [], buddy: "pet_none", moodHistory: [], petPositions: {}, exPerEx: {} };
      try { localStorage.setItem("huxi-profile", JSON.stringify(saveOB)); } catch(e) {}
      if (userKey) firebaseSave(userKey, saveOB);
    };
    return /*#__PURE__*/React.createElement("div", {
      style: W
    }, /*#__PURE__*/React.createElement("div", {
      style: OB
    }, /*#__PURE__*/React.createElement("div", {
      className: "fadeUp",
      style: OBC
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 64,
        marginBottom: 12
      }
    }, isT ? "🔬" : "🌱"), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 22,
        fontWeight: 700,
        color: "#70BCBC",
        marginBottom: 8
      }
    }, isT ? "Je praktijk instellen" : accType === "child" ? "Hoe heet jij?" : "Nog even voorstellen"), /*#__PURE__*/React.createElement("input", {
      className: "ni",
      placeholder: "Jouw naam",
      value: userNameIn,
      onChange: e => setUserNameIn(e.target.value),
      maxLength: 20,
      style: {
        marginBottom: 10
      }
    }), /*#__PURE__*/React.createElement("input", {
      className: "ni",
      placeholder: isT ? "Praktijknaam..." : "Naam van je boom...",
      value: nameIn,
      onChange: e => setNameIn(e.target.value),
      maxLength: 20,
      onKeyDown: e => {
        if (e.key === "Enter") go();
      }
    }), !isT && accType !== "child" && /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement("p", { style: { color: "rgba(200,230,180,0.7)", fontSize: 12, margin: "14px 0 8px", textAlign: "center" } }, "Geheime vraag (voor als je je pincode vergeet)"),
      /*#__PURE__*/React.createElement("select", {
        className: "ni",
        value: plantSecQ,
        onChange: e => setPlantSecQ(Number(e.target.value)),
        style: { marginBottom: 8, cursor: "pointer" }
      },
        ["Wat is de naam van je huisdier?","Wat is je favoriete kleur?","Wat is de naam van je beste vriend?","Wat is je favoriete dier?"].map((q,i) =>
          /*#__PURE__*/React.createElement("option", { key: i, value: i }, q)
        )
      ),
      /*#__PURE__*/React.createElement("input", {
        className: "ni",
        placeholder: "Jouw antwoord...",
        value: plantSecA,
        onChange: e => setPlantSecA(e.target.value),
        maxLength: 30,
        style: { marginBottom: 10 }
      })
    ),
    !isT && accType === "child" && /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement("p", { style: { color: "rgba(200,230,180,0.7)", fontSize: 12, margin: "10px 0 8px", textAlign: "center" } }, "\uD83D\uDD11 Kies een geheim dier (voor als je je pincode vergeet)"),
      /*#__PURE__*/React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "center", marginBottom: 10 } },
        ["\uD83D\uDC31","\uD83D\uDC36","\uD83D\uDC30","\uD83D\uDC22","\uD83D\uDC3C"].map(emoji =>
          /*#__PURE__*/React.createElement("button", {
            key: emoji,
            onClick: () => { setPlantSecQ(0); setPlantSecA(emoji); },
            style: {
              fontSize: 32, background: plantSecA === emoji ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
              border: plantSecA === emoji ? "2px solid rgba(255,255,255,0.6)" : "2px solid transparent",
              borderRadius: 14, padding: "8px 12px", cursor: "pointer",
              transform: plantSecA === emoji ? "scale(1.15)" : "scale(1)",
              transition: "all 0.2s"
            }
          }, emoji)
        )
      )
    ), /*#__PURE__*/React.createElement("button", {
      className: "gb",
      onClick: go
    }, isT ? "Start dashboard 🔬" : accType === "child" ? "Laten we beginnen! \uD83C\uDF1F" : "We hebben het zaadje geplant \uD83C\uDF3F"))));
  }

  // THERAPIST DASHBOARD
  if (phase === "therapist_dash") return /*#__PURE__*/React.createElement("div", {
    style: W
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...F,
      background: "linear-gradient(180deg,#F5F7FA,#EDF0F5)",
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px",
      maxWidth: 420,
      margin: "0 auto",
      paddingBottom: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#E8A840",
      borderRadius: 12,
      padding: "10px 16px",
      marginBottom: 16,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: "white",
      fontSize: 11,
      fontWeight: 600,
      margin: 0
    }
  }, "Testversie \u2014 koppeling met cli\xEBnten wordt beschikbaar in de volledige app")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: g,
      margin: 0
    }
  }, treeName), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: g5,
      margin: 0
    }
  }, "Dashboard")), /*#__PURE__*/React.createElement("button", {
    className: "tb",
    onClick: switchAcc
  }, "\uD83D\uDD04 Wissel")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "white",
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: g,
      margin: 0
    }
  }, "Cli\xEBnten"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "rgba(220,117,83,0.1)",
      border: "1px solid rgba(220,117,83,0.3)",
      borderRadius: 8,
      padding: "4px 10px",
      fontSize: 10,
      color: g,
      cursor: "pointer",
      fontFamily: "inherit"
    },
    onClick: () => setShowAddClient(true)
  }, "+ Cli\xEBnt")), showAddClient && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      background: "rgba(220,117,83,0.04)",
      borderRadius: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    style: {
      width: "100%",
      padding: "8px 12px",
      borderRadius: 8,
      border: "1px solid " + g3,
      fontSize: 13,
      fontFamily: "inherit",
      color: g,
      outline: "none"
    },
    placeholder: "Naam van de cli\xEBnt",
    value: newClientName,
    onChange: e => setNewClientName(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter" && newClientName.trim()) {
        setThClients(p => [...p, {
          name: newClientName.trim(),
          mood: "ok",
          lastActive: "Nieuw",
          hw: [],
          id: Date.now()
        }]);
        setNewClientName("");
        setShowAddClient(false);
      }
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      flex: 1,
      background: "none",
      border: "1px solid " + g3,
      borderRadius: 8,
      padding: "6px",
      fontSize: 10,
      color: g5,
      cursor: "pointer"
    },
    onClick: () => {
      setShowAddClient(false);
      setNewClientName("");
    }
  }, "Annuleren"), /*#__PURE__*/React.createElement("button", {
    className: "mb",
    style: {
      flex: 1,
      padding: "6px",
      fontSize: 10
    },
    onClick: () => {
      if (newClientName.trim()) {
        setThClients(p => [...p, {
          name: newClientName.trim(),
          mood: "ok",
          lastActive: "Nieuw",
          hw: [],
          id: Date.now()
        }]);
        setNewClientName("");
        setShowAddClient(false);
      }
    }
  }, "Toevoegen"))), thClients.length === 0 && !showAddClient && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: g5
    }
  }, "Nog geen cli\xEBnten toegevoegd"), thClients.map(cl => /*#__PURE__*/React.createElement("div", {
    key: cl.id,
    style: {
      padding: "10px 0",
      borderBottom: "1px solid rgba(61,74,88,0.08)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: g,
      margin: 0
    }
  }, cl.name), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 10,
      color: g5,
      margin: 0
    }
  }, cl.lastActive)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      background: "rgba(220,117,83,0.1)",
      border: "1px solid rgba(220,117,83,0.3)",
      borderRadius: 8,
      padding: "4px 10px",
      fontSize: 10,
      color: g,
      cursor: "pointer",
      fontFamily: "inherit"
    },
    onClick: () => {
      setSelClient(cl);
      setShowAssign(true);
    }
  }, "+ Oefening"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "none",
      border: "none",
      fontSize: 14,
      cursor: "pointer",
      color: "#C4553A"
    },
    onClick: () => setThClients(p => p.filter(c => c.id !== cl.id))
  }, "\u2715"))), cl.hw.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, cl.hw.map(h => /*#__PURE__*/React.createElement("div", {
    key: h.id,
    style: {
      fontSize: 11,
      color: g,
      padding: "2px 0"
    }
  }, h.done ? "✅" : "⬜", " ", h.name)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "white",
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: g,
      margin: 0
    }
  }, "Eigen oefeningen"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "rgba(220,117,83,0.1)",
      border: "1px solid rgba(220,117,83,0.3)",
      borderRadius: 8,
      padding: "4px 10px",
      fontSize: 10,
      color: g,
      cursor: "pointer",
      fontFamily: "inherit"
    },
    onClick: () => setShowAddEx(true)
  }, "+ Toevoegen")), custExList.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: g5
    }
  }, "Nog geen eigen oefeningen") : custExList.map(ce => /*#__PURE__*/React.createElement("div", {
    key: ce.id,
    style: {
      padding: "6px 0"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: g,
      margin: 0
    }
  }, ce.name)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "white",
      borderRadius: 16,
      padding: 16,
      marginTop: 16,
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: g,
      marginBottom: 8
    }
  }, "Agenda"), thAgenda.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
      borderBottom: "1px solid rgba(61,74,88,0.06)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: g,
      margin: 0
    }
  }, a.client), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 10,
      color: g5,
      margin: 0
    }
  }, a.date, " om ", a.time)), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "none",
      border: "none",
      fontSize: 14,
      cursor: "pointer",
      color: "#C4553A"
    },
    onClick: () => setThAgenda(p => p.filter(x => x.id !== a.id))
  }, "\u2715"))), !showAgendaAdd ? /*#__PURE__*/React.createElement("button", {
    style: {
      marginTop: 8,
      background: "rgba(220,117,83,0.1)",
      border: "1px solid rgba(220,117,83,0.3)",
      borderRadius: 8,
      padding: "6px 12px",
      fontSize: 10,
      color: g,
      cursor: "pointer",
      fontFamily: "inherit"
    },
    onClick: () => setShowAgendaAdd(true)
  }, "+ Afspraak") : /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      padding: 10,
      background: "rgba(220,117,83,0.04)",
      borderRadius: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    style: {
      width: "100%",
      padding: "6px 10px",
      borderRadius: 8,
      border: "1px solid " + g3,
      fontSize: 12,
      fontFamily: "inherit",
      marginBottom: 6,
      color: g,
      outline: "none"
    },
    placeholder: "Cli\xEBnt naam",
    value: agClient,
    onChange: e => setAgClient(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    style: {
      flex: 1,
      padding: "6px 8px",
      borderRadius: 8,
      border: "1px solid " + g3,
      fontSize: 11,
      fontFamily: "inherit",
      color: g,
      outline: "none"
    },
    value: agDate,
    onChange: e => setAgDate(e.target.value)
  }), /*#__PURE__*/React.createElement("input", {
    type: "time",
    style: {
      flex: 1,
      padding: "6px 8px",
      borderRadius: 8,
      border: "1px solid " + g3,
      fontSize: 11,
      fontFamily: "inherit",
      color: g,
      outline: "none"
    },
    value: agTime,
    onChange: e => setAgTime(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      flex: 1,
      background: "none",
      border: "1px solid " + g3,
      borderRadius: 8,
      padding: "6px",
      fontSize: 10,
      color: g5,
      cursor: "pointer"
    },
    onClick: () => {
      setShowAgendaAdd(false);
      setAgClient("");
      setAgDate("");
      setAgTime("");
    }
  }, "Annuleren"), /*#__PURE__*/React.createElement("button", {
    className: "mb",
    style: {
      flex: 1,
      padding: "6px",
      fontSize: 10
    },
    onClick: () => {
      if (agClient.trim() && agDate && agTime) {
        setThAgenda(p => [...p, {
          client: agClient.trim(),
          date: agDate,
          time: agTime,
          id: Date.now()
        }]);
        setShowAgendaAdd(false);
        setAgClient("");
        setAgDate("");
        setAgTime("");
      }
    }
  }, " Toevoegen")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "white",
      borderRadius: 16,
      padding: 16,
      marginTop: 16,
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: g,
      margin: 0
    }
  }, "Zorgmelding"), /*#__PURE__*/React.createElement("button", {
    className: "tb",
    onClick: () => setCareAlert(a => !a)
  }, careAlert ? "🔔 Aan" : "🔕 Uit")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 10,
      color: g5,
      marginTop: 6
    }
  }, "Ontvang een melding als een cli\xEBnt meerdere dagen slecht scoort"))), showAssign && selClient && /*#__PURE__*/React.createElement("div", {
    style: overlay(),
    onClick: () => setShowAssign(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeIn",
    style: modal,
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: g,
      fontSize: 16,
      fontWeight: 700,
      textAlign: "center",
      marginBottom: 14
    }
  }, "Toewijzen aan ", selClient.name), EX.map(ex => /*#__PURE__*/React.createElement("button", {
    key: ex.id,
    className: "rb",
    style: {
      background: "rgba(220,117,83,0.05)",
      borderColor: "rgba(220,117,83,0.15)"
    },
    onClick: () => {
      setThClients(p => p.map(cl => cl.id === selClient.id ? {
        ...cl,
        hw: [...cl.hw, {
          name: ex.name,
          done: false,
          id: Date.now()
        }]
      } : cl));
      setShowAssign(false);
    }
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDF2C\uFE0F"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: g
    }
  }, accType === "child" && ex.nameChild || ex.name))), custExList.map(ce => /*#__PURE__*/React.createElement("button", {
    key: ce.id,
    className: "rb",
    style: {
      background: "rgba(220,117,83,0.05)",
      borderColor: "rgba(220,117,83,0.15)"
    },
    onClick: () => {
      setThClients(p => p.map(cl => cl.id === selClient.id ? {
        ...cl,
        hw: [...cl.hw, {
          name: ce.name,
          done: false,
          id: Date.now()
        }]
      } : cl));
      setShowAssign(false);
    }
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: g
    }
  }, ce.name))))), showAddEx && /*#__PURE__*/React.createElement("div", {
    style: overlay(),
    onClick: () => setShowAddEx(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeIn",
    style: modal,
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: g,
      fontSize: 16,
      fontWeight: 700,
      textAlign: "center",
      marginBottom: 14
    }
  }, "Eigen oefening"), /*#__PURE__*/React.createElement("input", {
    style: {
      width: "100%",
      padding: "10px 14px",
      borderRadius: 12,
      border: "2px solid rgba(220,117,83,0.2)",
      background: "rgba(220,117,83,0.04)",
      color: g,
      fontSize: 14,
      fontFamily: "inherit",
      outline: "none",
      marginBottom: 10
    },
    placeholder: "Naam",
    value: custExName,
    onChange: e => setCustExName(e.target.value)
  }), /*#__PURE__*/React.createElement("textarea", {
    className: "ta",
    placeholder: "Beschrijving",
    value: custExDesc,
    onChange: e => setCustExDesc(e.target.value),
    rows: 3
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      flex: 1,
      background: "none",
      border: "1px solid " + g3,
      borderRadius: 14,
      padding: "10px 0",
      color: g,
      fontSize: 13,
      cursor: "pointer"
    },
    onClick: () => {
      setShowAddEx(false);
      setCustExName("");
      setCustExDesc("");
    }
  }, "Annuleren"), /*#__PURE__*/React.createElement("button", {
    className: "mb",
    style: {
      flex: 1,
      padding: "10px 0"
    },
    onClick: () => {
      if (!custExName.trim()) return;
      setCustExList(p => [...p, {
        name: custExName.trim(),
        desc: custExDesc.trim(),
        id: Date.now()
      }]);
      setCustExName("");
      setCustExDesc("");
      setShowAddEx(false);
    }
  }, "Toevoegen"))))));

  // ═══ COOLDOWNS ═══
  const breathCooldown = lastBreathTime ? Math.max(0, 1800000 - (cdTick - lastBreathTime)) : 0;
  const taskCooldown = lastTaskTime ? Math.max(0, 1800000 - (cdTick - lastTaskTime)) : 0;
  const breathOnCooldown = breathCooldown > 0;
  const taskOnCooldown = taskCooldown > 0;
  const CDMAX = 1800000;
  const fmtMin = ms => { const m = Math.floor(ms/60000); const s = Math.ceil((ms%60000)/1000); return m > 0 ? m + ":" + String(s).padStart(2,"0") : s + "s"; };
  const CdBar = ({remain}) => React.createElement("div", {style:{width:"100%",height:3,borderRadius:2,background:"rgba(220,117,83,0.15)",marginTop:3,overflow:"hidden"}}, React.createElement("div", {style:{width: (1-remain/CDMAX)*100+"%",height:"100%",borderRadius:2,background:"linear-gradient(90deg,#DC7553,#70BCBC)",transition:"width 1s linear"}}));

  // ═══ WORLD ═══
  return /*#__PURE__*/React.createElement("div", {
    style: W
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...F,
      background: `linear-gradient(180deg,${c.s1} 0%,${c.s2} 55%,${c.gl} 100%)`,
      zIndex: 1,
      display: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...F,
      background: TOVL[tod],
      zIndex: 2,
      display: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...F,
      background: moodWarm,
      zIndex: 2,
      display: "none"
    }
  }), tod === "Nacht" && /*#__PURE__*/React.createElement("div", {
    style: {
      ...F,
      zIndex: 3
    }
  }, stars.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.id,
    className: "star",
    style: {
      position: "absolute",
      left: s.x + "%",
      top: s.y + "%",
      width: s.sz,
      height: s.sz,
      animationDelay: s.del + "s"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...F,
      zIndex: 4,
      opacity: tod === "Nacht" ? 0.12 : 0.7
    }
  }, [{
    l: "3%",
    t: "6%",
    s: 1
  }, {
    l: "30%",
    t: "2%",
    s: 1.3
  }, {
    l: "60%",
    t: "9%",
    s: 0.85
  }].map((cl, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "cloud",
    style: {
      position: "absolute",
      left: cl.l,
      top: cl.t,
      transform: "scale(" + cl.s + ")"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cp c1"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cp c2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cp c3"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: "16%",
      left: 0,
      right: 0,
      height: "30%",
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 400 140",
    preserveAspectRatio: "none",
    style: {
      width: "100%",
      height: "100%"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0,95 Q40,40 100,65 Q150,30 220,55 Q290,20 350,48 Q390,35 400,50 L400,140 L0,140Z",
    fill: c.gd,
    opacity: 0.25
  }), /*#__PURE__*/React.createElement("path", {
    d: "M0,105 Q60,50 140,72 Q210,38 280,60 Q350,35 400,55 L400,140 L0,140Z",
    fill: c.gd,
    opacity: 0.35
  }), /*#__PURE__*/React.createElement("path", {
    d: "M0,110 Q80,65 160,82 Q240,55 320,72 Q380,58 400,65 L400,140 L0,140Z",
    fill: c.gd,
    opacity: 0.45
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "22%",
      zIndex: 7,
      background: `linear-gradient(180deg,${c.gd}DD,${c.gd})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...F,
      zIndex: 12,
      pointerEvents: "none"
    }
  }, particles.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: p.glow ? "ff" : "po",
    style: {
      position: "absolute",
      left: p.x + "%",
      top: p.y + "%",
      width: p.sz,
      height: p.sz,
      animationDelay: p.del + "s",
      animationDuration: p.dur * moodSlow + "s"
    }
  }))), accType !== "junior" && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      filter: !checkinDone ? "blur(3px)" : "none",
      transition: "filter 1.5s",
      opacity: !checkinDone ? 0.7 : 1
    }
  }, /*#__PURE__*/React.createElement(BoomCanvas, {
    season: season,
    growth: growth,
    wp: wp,
    tod: tod,
    c: c,
    totalSessions: totalSessions,
    wi: wi,
    accType: accType,
    tapA: tapA,
    rareAnimal: rareAnimal
  })), accType === "child" && /*#__PURE__*/React.createElement(React.Fragment, null,
    buddy && buddy !== "pet_none" && PET_EM[buddy] && /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        bottom: "18%",
        left: "55%",
        fontSize: 28,
        zIndex: 11,
        userSelect: "none",
        animation: "petWalk 1.8s ease-in-out infinite",
        cursor: "pointer",
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
      },
      onClick: () => tapA("\uD83D\uDC3E " + (PET_EM[buddy] || "") + " loopt met je mee!")
    }, PET_EM[buddy]),
    ownedItems.filter(p => p.startsWith("pet_") && p !== "pet_none" && p !== buddy && petPositions[p] !== false).map(petId => {
      const pos = petPositions[petId] || { x: 10 + (ownedItems.filter(p => p.startsWith("pet_") && p !== "pet_none").indexOf(petId) * 18) % 70, y: 30 + (ownedItems.filter(p => p.startsWith("pet_") && p !== "pet_none").indexOf(petId) * 13) % 35 };
      return /*#__PURE__*/React.createElement("div", {
        key: petId,
        draggable: true,
        onDragEnd: e => {
          const rect = e.currentTarget.parentElement.getBoundingClientRect();
          const x = Math.max(2, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
          const y = Math.max(5, Math.min(75, ((e.clientY - rect.top) / rect.height) * 100));
          const newPos = { ...petPositions, [petId]: { x, y } };
          setPetPositions(newPos);
          const saveP = { accType, reason, experience, treeName, userName, growth, coins, ownedItems, avatar, letters, diary, seenEx, lastExId, dailyMood, totalSessions, wi, lastDay, dailyActions, lastTaskTexts, dailyBreaths, lastBreathTime, lastTaskTime, dailyTasks, tasksGenerated, checkinDone, lastCheckinDate, streakShields, secretQ, secretA, goals, buddy, moodHistory, petPositions: newPos, exPerEx, therapistCode, linkedTherapist };
          try { localStorage.setItem("huxi-profile", JSON.stringify(saveP)); } catch(e2) {}
          if (userKey) firebaseSave(userKey, saveP);
        },
        onClick: () => tapA("\uD83C\uDF33 " + (PET_EM[petId] || "") + " woont in jouw wereld!"),
        style: {
          position: "absolute",
          left: pos.x + "%",
          top: pos.y + "%",
          fontSize: 28,
          zIndex: 9,
          cursor: "grab",
          userSelect: "none",
          transform: "translateZ(0)"
        }
      }, PET_EM[petId] || "\uD83D\uDC3E");
    })
  ), animalMsg && /*#__PURE__*/React.createElement("div", {
    className: "sl",
    style: {
      position: "absolute",
      top: "35%",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 22
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(8px)",
      padding: "8px 16px",
      borderRadius: 14,
      color: g,
      fontSize: 12,
      fontWeight: 600
    }
  }, animalMsg)), wMsg && /*#__PURE__*/React.createElement("div", {
    className: "wm",
    style: {
      position: "absolute",
      top: 50,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 20
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(10px)",
      padding: "8px 20px",
      borderRadius: 18,
      color: g,
      fontSize: 13,
      fontWeight: 600,
      whiteSpace: "nowrap"
    }
  }, wMsg)), reminder && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 80,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 22,
      cursor: "pointer"
    },
    onClick: () => setReminder("")
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(8px)",
      padding: "10px 18px",
      borderRadius: 16,
      color: "#4A5568",
      fontSize: 12,
      fontWeight: 600,
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
    }
  }, reminder, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 9,
      color: "rgba(74,85,104,0.4)",
      marginTop: 4
    }
  }, "Tik om te sluiten"))), !checkinDone && /*#__PURE__*/React.createElement("div", {
    style: {
      ...F,
      zIndex: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      textAlign: "center",
      padding: 20,
      maxWidth: 320
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#FFF",
      fontSize: 18,
      fontWeight: 700,
      textShadow: "0 2px 10px rgba(0,0,0,0.3)",
      marginBottom: 20
    }
  }, checkinQ), moods.map(m => /*#__PURE__*/React.createElement("button", {
    key: m.id,
    className: "ci",
    style: {
      borderColor: m.c + "44"
    },
    onClick: () => doCheckin(m.id)
  }, accType === "child" && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22
    }
  }, m.a), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#45545E",
      fontSize: 14,
      fontWeight: 600
    }
  }, m.l), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 4,
      borderRadius: 2,
      background: m.c,
      opacity: 0.6
    }
  }))))), showEx && curEx && /*#__PURE__*/React.createElement("div", {
    style: {
      ...F,
      zIndex: 28,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.25)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeIn",
    style: {
      background: "rgba(255,255,255,0.96)",
      borderRadius: 28,
      padding: "28px 32px",
      textAlign: "center",
      maxWidth: 300,
      width: "90%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: g,
      fontSize: 16,
      fontWeight: 700,
      margin: 0
    }
  }, (accType === "child" && (getSeasonalName(curEx) || curEx.nameChild)) || (accType === "junior" && curEx.nameJunior) || curEx.name), /*#__PURE__*/React.createElement("button", {
    style: {
      background: "rgba(220,117,83,0.1)",
      border: "1px solid rgba(220,117,83,0.2)",
      borderRadius: "50%",
      width: 22,
      height: 22,
      fontSize: 10,
      cursor: "pointer",
      color: g,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    onClick: () => setShowSci(s => !s)
  }, "\uD83D\uDD2C")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: g5,
      fontSize: 12,
      marginBottom: 16
    }
  }, curEx.desc), showSci && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(220,117,83,0.08)",
      borderRadius: 14,
      padding: "12px 14px",
      marginBottom: 16,
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: g,
      fontSize: 11,
      lineHeight: 1.5
    }
  }, "\uD83D\uDD2C ", curEx.sci)),
  curEx && curEx.warn && exPhase === "idle" && (seenEx.includes(curEx.id)
    ? /*#__PURE__*/React.createElement("p", {
        style: { fontSize: 10, color: "rgba(200,140,40,0.7)", textAlign: "center", marginBottom: 8 }
      }, "\u26A0\uFE0F Niet in water of achter het stuur")
    : /*#__PURE__*/React.createElement("div", {
        style: {
          background: warnAcknowledged ? "rgba(220,117,83,0.08)" : "rgba(230,168,50,0.1)",
          border: warnAcknowledged ? "1px solid rgba(220,117,83,0.3)" : "1.5px solid rgba(230,168,50,0.5)",
          borderRadius: 14, padding: "12px 14px", marginBottom: 12, textAlign: "left"
        }
      },
      /*#__PURE__*/React.createElement("p", {
        style: { color: warnAcknowledged ? "#DC7553" : "#C4882A", fontSize: 11, lineHeight: 1.7, margin: warnAcknowledged ? 0 : "0 0 10px" }
      }, warnAcknowledged ? "\u2705 Gelezen \u2014 je kan starten." : curEx.warn),
      !warnAcknowledged && /*#__PURE__*/React.createElement("button", {
        style: {
          background: "rgba(230,168,50,0.15)", border: "1px solid rgba(230,168,50,0.4)",
          borderRadius: 10, padding: "8px 14px", fontSize: 11, fontWeight: 700,
          color: "#C4882A", cursor: "pointer", width: "100%"
        },
        onClick: () => setWarnAcknowledged(true)
      }, "\u2714 Ik heb dit gelezen"))), exPhase === "idle" ? /*#__PURE__*/React.createElement("button", {
    className: "mb",
    style: {
      padding: "12px 30px",
      fontSize: 15,
      opacity: (curEx && curEx.warn && !seenEx.includes(curEx.id) && !warnAcknowledged) ? 0.35 : 1
    },
    disabled: !!(curEx && curEx.warn && !seenEx.includes(curEx.id) && !warnAcknowledged),
    onClick: () => { if (curEx && curEx.warn && !seenEx.includes(curEx.id) && !warnAcknowledged) return; runEx(); }
  }, (curEx && curEx.warn && !seenEx.includes(curEx.id) && !warnAcknowledged) ? "Lees eerst de waarschuwing ↑" : showSci ? "Begrepen, start" : "Start") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 140,
      height: 140,
      margin: "0 auto 12px",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      border: "4px solid " + (exPhase === "hold" || exPhase === "hold2" ? "#E8A840" : "#70BCBC"),
      transition: `transform ${exPhase === "in" ? curEx.iS : exPhase === "out" ? curEx.oS : exPhase === "hold" ? curEx.hI : exPhase === "hold2" ? curEx.hO : 1}s ease-in-out, border-color 0.3s`,
      transform: exPhase === "in" ? "scale(1.15)" : exPhase === "hold" ? "scale(1.15)" : exPhase === "out" ? "scale(0.6)" : exPhase === "hold2" ? "scale(0.6)" : "scale(1)",
      opacity: exPhase === "done" ? 1 : exPhase === "in" || exPhase === "hold" ? 1 : 0.5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      zIndex: 1,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: g,
      display: "block"
    }
  }, exPhase === "in" ? "Adem in" : exPhase === "hold" || exPhase === "hold2" ? "Vasthouden" : exPhase === "out" ? "Adem uit" : "Goed gedaan!"), exPhase !== "done" && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28,
      fontWeight: 700,
      color: "#DC7553",
      display: "block",
      marginTop: 2
    }
  }, exCountdown))), /*#__PURE__*/React.createElement("p", {
    style: {
      color: g5,
      fontSize: 12,
      marginBottom: 4
    }
  }, exRound, " van ", custRounds || Math.round(curEx.r * (accType === "child" ? 0.5 : 1))), /*#__PURE__*/React.createElement("p", {
    style: {
      color: g3,
      fontSize: 10,
      marginBottom: 8
    }
  }, "~", Math.round(((custRounds || Math.round(curEx.r * (accType === "child" ? 0.5 : 1))) - exRound) * (curEx.iS + curEx.oS + curEx.hI + curEx.hO) / 60), " min"), exPhase === "done" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#DC7553",
      fontSize: 13,
      fontWeight: 600
    }
  }, "Je wereld groeit \uD83C\uDF31"), (accType === "child" || accType === "junior") && /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#E6A832",
      fontSize: 12,
      fontWeight: 600,
      marginTop: 4
    }
  }, "+", curEx.pts, " muntjes verdiend! \uD83E\uDE99"))), exPhase !== "done" && exPhase !== "idle" && /*#__PURE__*/React.createElement("button", {
    style: {
      display: "block",
      margin: "12px auto 0",
      background: "none",
      border: "none",
      color: g3,
      fontSize: 11,
      cursor: "pointer"
    },
    onClick: stopEx
  }, "Stoppen"))), showMem && /*#__PURE__*/React.createElement("div", {
    style: {
      ...F,
      zIndex: 25,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer"
    },
    onClick: () => setShowMem(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(255,255,255,0.93)",
      backdropFilter: "blur(15px)",
      padding: "26px 34px",
      borderRadius: 24,
      textAlign: "center",
      maxWidth: 260
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 34,
      marginBottom: 10
    }
  }, "\uD83C\uDF43"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: g,
      fontSize: 17,
      fontWeight: 600,
      lineHeight: 1.5
    }
  }, memTxt))), checkinDone && !showEx && !showMem && !showSett && !showGuide && !showLetter && !showLetters && !showDiary && !showPicker && !showTools && showPostMood && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed", inset: 0, zIndex: 90,
      background: "rgba(245,247,250,0.97)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 24px"
    }
  },
    /*#__PURE__*/React.createElement("div", {
      className: "fadeUp",
      style: { textAlign: "center", maxWidth: 320, width: "100%" }
    },
      /*#__PURE__*/React.createElement("div", { style: { fontSize: 40, marginBottom: 12 } }, "🌬️"),
      /*#__PURE__*/React.createElement("h2", {
        style: { color: "#DC7553", fontSize: 18, fontWeight: 700, marginBottom: 6 }
      }, "Oefening gedaan!"),
      /*#__PURE__*/React.createElement("p", {
        style: { color: "rgba(61,74,88,0.6)", fontSize: 13, marginBottom: 20 }
      }, "Hoe voel je je nu?"),
      /*#__PURE__*/React.createElement("div", {
        style: { display: "flex", flexDirection: "column", gap: 8 }
      },
        moods.map(m => /*#__PURE__*/React.createElement("button", {
          key: m.id,
          style: accType === "child" ? {
            background: postMood === m.id ? m.c : "white",
            color: postMood === m.id ? "white" : m.c,
            border: "2px solid " + m.c,
            borderRadius: 14, padding: "11px 16px",
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 10,
            transition: "all 0.15s"
          } : {
            background: postMood === m.id ? m.c + "22" : "transparent",
            color: "rgba(61,74,88,0.75)",
            border: "none", borderRadius: 12, padding: "10px 14px",
            fontSize: 14, fontWeight: postMood === m.id ? 700 : 500,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
            transition: "all 0.15s", width: "100%",
            borderLeft: postMood === m.id ? "3px solid " + m.c : "3px solid transparent"
          },
          onClick: () => {
            setPostMood(m.id);
            const newMoodH = [{ date: new Date().toISOString().slice(0,10), mood: m.id, ts: Date.now(), type: "post" }, ...moodHistory].slice(0, 90);
            setMoodHistory(newMoodH);
            setExPerEx(prev => {
              const updated = { ...prev };
              const saveP2 = { accType, reason, experience, treeName, userName, growth, coins, ownedItems, avatar, letters, diary, seenEx, lastExId, dailyMood, totalSessions, wi, lastDay, dailyActions, lastTaskTexts, dailyBreaths, lastBreathTime, lastTaskTime, dailyTasks, tasksGenerated, checkinDone, lastCheckinDate, streakShields, secretQ, secretA, goals, buddy, moodHistory: newMoodH, petPositions, exPerEx: updated };
              try { localStorage.setItem("huxi-profile", JSON.stringify(saveP2)); } catch(e) {}
              if (userKey) firebaseSave(userKey, saveP2);
              return updated;
            });
            setTimeout(() => setShowPostMood(false), 600);
          }
        }, accType === "child" ? m.a + " " + m.l : m.l))
      )
    )
  ), isOffline && phase === "world" && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute", top: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(196,85,58,0.92)", padding: "8px 16px",
      display: "flex", alignItems: "center", gap: 8
    }
  },
    /*#__PURE__*/React.createElement("span", { style: { fontSize: 14 } }, "\uD83D\uDCF5"),
    /*#__PURE__*/React.createElement("p", {
      style: { color: "white", fontSize: 12, fontWeight: 600, margin: 0 }
    }, "Geen internetverbinding \u2014 je voortgang wordt bewaard zodra je terug online bent.")
  ), worldReward && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      position: "absolute", top: "30%", left: "50%",
      transform: "translateX(-50%)", zIndex: 40,
      fontSize: 52, pointerEvents: "none",
      filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))",
      animation: "treeGrow 0.4s ease-out"
    }
  }, worldReward === "breath" ? "\uD83E\uDD8B" : worldReward === "task" ? "\uD83C\uDF38" : worldReward === "diary" ? "\uD83D\uDC9A" : worldReward === "letter" ? "\u2728" : worldReward === "shop" ? "\uD83C\uDF89" : "\uD83C\uDF1F"),
  !activeTool && !showAvatar && !showShop && !showGoals && !showJourney && !curTask && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 20,
      padding: "8px 12px 36px",
      background: "linear-gradient(0deg,rgba(245,247,250,0.97) 70%,rgba(245,247,250,0))"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: "center",
      color: allDone ? "#DC7553" : g5,
      fontSize: 10,
      fontWeight: allDone ? 600 : 400,
      marginBottom: 6
    }
  }, allDone ? "Goed gedaan vandaag! \uD83C\uDF31" : "Jouw moment van de dag"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 6,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "ab",
    style: {
      opacity: (!canDoBreath || breathOnCooldown) ? 0.35 : 1
    },
    onClick: () => {
      if (!canDoBreath) {
        setWMsg("Je ademhaling voor vandaag is klaar \u2014 tot morgen \uD83C\uDF3F");
        setTimeout(() => setWMsg(""), 3000);
        return;
      }
      if (breathOnCooldown) {
        setWMsg("\u23F3 Nog " + fmtMin(breathCooldown) + " wachten voor je volgende ademhaling");
        setTimeout(() => setWMsg(""), 3000);
        return;
      }
      const uniqueEx = Object.keys(exPerEx).length;
      if (uniqueEx < 2) {
        startAuto();
      } else {
        setShowPicker(true);
      }
    }
  }, breathOnCooldown ? "\u23F3 " + fmtMin(breathCooldown) : "\uD83C\uDF2C\uFE0F Adem"), /*#__PURE__*/React.createElement("button", {
    className: "ab",
    style: {
      opacity: (!canDoTask || taskOnCooldown) ? 0.35 : 1
    },
    onClick: () => {
      if (!canDoTask) {
        setWMsg("Alle opdrachten van vandaag zijn klaar \u2014 tot morgen \uD83C\uDF3F");
        setTimeout(() => setWMsg(""), 3000);
        return;
      }
      if (taskOnCooldown) {
        setWMsg("\u23F3 Nog " + fmtMin(taskCooldown) + " wachten voor je volgende opdracht");
        setTimeout(() => setWMsg(""), 3000);
        return;
      }
      startTask(dailyTasks[0]);
    }
  }, taskOnCooldown ? "\u23F3 " + fmtMin(taskCooldown) : "\uD83C\uDF3F Opdracht"), /*#__PURE__*/React.createElement("button", {
    className: "ab",
    onClick: () => {
      const lastLetter = letters[0];
      if (lastLetter && lastLetter.unlockDate) {
        const unlockTime = new Date(lastLetter.unlockDate).getTime();
        if (Date.now() < unlockTime) {
          const dl = Math.ceil((unlockTime - Date.now()) / 86400000);
          setWMsg("Je volgende brief kan pas geschreven worden als je huidige brief opengaat — nog " + dl + " dagen \uD83D\uDCCD");
          setTimeout(() => setWMsg(""), 4000);
          return;
        }
      }
      setShowLetter(true);
    }
  }, "\u2709\uFE0F Brief"), /*#__PURE__*/React.createElement("button", {
    className: "ab",
    onClick: () => setShowGoals(true)
  }, "\uD83C\uDFAF Doelen"), /*#__PURE__*/React.createElement("button", {
    className: "ab",
    onClick: () => setShowJourney(true)
  }, "\uD83C\uDF31 Mijn Reis"), letters.length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "ab",
    onClick: () => setShowLetters(true)
  }, "\uD83C\uDF43"), /*#__PURE__*/React.createElement("button", {
    className: "ab",
    onClick: () => setShowDiary(true)
  }, "\uD83D\uDCD4 Dagboek"), accType === "child" && /*#__PURE__*/React.createElement("button", {
    className: "ab",
    onClick: () => setShowAvatar(true)
  }, "\uD83D\uDC64 Avatar"), accType === "junior" && /*#__PURE__*/React.createElement("button", {
    className: "ab",
    onClick: () => setShowStreak(true)
  }, "\uD83D\uDD25 " + (wi.streakDays || 0) + " dagen"))), curTask && /*#__PURE__*/React.createElement("div", {
    style: {
      ...F,
      zIndex: 30,
      background: "rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeIn",
    style: {
      background: "rgba(255,255,255,0.96)",
      borderRadius: 28,
      padding: "28px 32px",
      textAlign: "center",
      maxWidth: 300,
      width: "90%"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#45545E",
      fontSize: 17,
      fontWeight: 700,
      lineHeight: 1.5,
      marginBottom: 18
    }
  }, curTask.text), isQuestion(curTask.text) ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("textarea", {
    className: "ta",
    placeholder: accType === "child" ? "Schrijf hier..." : "Schrijf hier wat in je opkomt...",
    value: taskInput,
    onChange: e => setTaskInput(e.target.value),
    rows: 2,
    style: {
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "mb",
    style: {
      padding: "12px 30px",
      opacity: taskInput.trim().length >= 2 ? 1 : 0.3
    },
    onClick: () => {
      if (taskInput.trim().length >= 2) finishTask();
    }
  }, "Klaar \uD83C\uDF3F")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 50,
      height: 50,
      margin: "0 auto 12px",
      borderRadius: "50%",
      border: "3px solid #70BCBC",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: "#45545E"
    }
  }, taskTimer))))), showPicker && /*#__PURE__*/React.createElement("div", {
    style: overlay(),
    onClick: () => setShowPicker(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeIn",
    style: modal,
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: g,
      fontSize: 17,
      fontWeight: 700,
      textAlign: "center",
      marginBottom: 6
    }
  }, "\uD83C\uDF2C\uFE0F Ademhaling"), /*#__PURE__*/React.createElement("button", {
    className: "rb",
    style: {
      justifyContent: "center",
      background: "rgba(220,117,83,0.1)",
      borderColor: "rgba(220,117,83,0.3)",
      marginBottom: 10
    },
    onClick: () => {
      if (!canDoBreath) {
        setWMsg("Je ademhaling voor vandaag is klaar \u2014 tot morgen \uD83C\uDF3F");
        setTimeout(() => setWMsg(""), 3000);
        return;
      }
      startAuto();
      setShowPicker(false);
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u2728"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: g,
      fontSize: 14,
      fontWeight: 600
    }
  }, canDoBreath ? "Laat HUXI kiezen" : "Klaar voor vandaag \uD83C\uDF3F")),
    accType === "junior" && totalSessions >= 5 && /*#__PURE__*/React.createElement("p", {
      style: { color: "rgba(61,74,88,0.35)", fontSize: 10, textAlign: "center", margin: "-6px 0 8px", fontStyle: "italic" }
    }, dailyMood === "tense" || dailyMood === "overwhelmed" || dailyMood === "restless"
      ? "\uD83D\uDCA1 HUXI kiest iets rustgevends voor jou"
      : "\uD83C\uDF1F HUXI heeft deze week iets nieuws voor je"),
    EX.map(ex => {
    const unlocked = isExUnlocked(ex);
    const nm = (accType === "child" && (getSeasonalName(ex) || ex.nameChild)) || (accType === "junior" && ex.nameJunior) || ex.name;
    const hasWarn = !!ex.warn;
    return /*#__PURE__*/React.createElement("button", {
      key: ex.id,
      className: "rb",
      style: {
        opacity: unlocked ? 1 : 0.5,
        background: unlocked ? "white" : "rgba(245,247,250,0.8)",
        borderStyle: unlocked ? "solid" : "dashed"
      },
      onClick: () => {
        if (!unlocked) {
          setWMsg("\uD83C\uDF31 Blijf oefenen — deze oefening komt beschikbaar naarmate je groeit");
          setTimeout(() => setWMsg(""), 3000);
          return;
        }
        launchEx(ex, null);
      }
    }, /*#__PURE__*/React.createElement("span", null, unlocked ? "🌬️" : "🔒"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        textAlign: "left"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: g,
        fontSize: 13,
        fontWeight: 600,
        display: "block"
      }
    }, unlocked ? nm : "\uD83D\uDD12 " + nm, hasWarn && /*#__PURE__*/React.createElement("span", {
      style: { fontSize: 10, marginLeft: 4, opacity: 0.7 }
    }, "\u26A0\uFE0F")), /*#__PURE__*/React.createElement("span", {
      style: {
        color: g5,
        fontSize: 10
      }
    }, ex.desc)), unlocked && experience === "experienced" && /*#__PURE__*/React.createElement("select", {
      onClick: e => e.stopPropagation(),
      onChange: e => {
        if (e.target.value) launchEx(ex, parseInt(e.target.value));
      },
      style: {
        background: "rgba(255,255,255,0.2)",
        border: "1px solid rgba(112,188,188,0.3)",
        borderRadius: 8,
        padding: "2px",
        color: g,
        fontSize: 10
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "x", ex.r), /*#__PURE__*/React.createElement("option", {
      value: ex.r + 3
    }, "x", ex.r + 3), /*#__PURE__*/React.createElement("option", {
      value: ex.r + 6
    }, "x", ex.r + 6), /*#__PURE__*/React.createElement("option", {
      value: ex.r + 10
    }, "x", ex.r + 10)));
  }))), showLetter && /*#__PURE__*/React.createElement("div", {
    style: overlay(),
    onClick: () => setShowLetter(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeIn",
    style: modal,
    onClick: e => e.stopPropagation()
  }, (() => {
    const now = Date.now();
    const lk = letters.find(l => [30, 90, 180, 365].some(d => now - l.id < d * 86400000));
    if (lk) {
      const age = now - lk.id;
      const nd = [30, 90, 180, 365].find(d => age < d * 86400000);
      const dl = Math.ceil((nd * 86400000 - age) / 86400000);
      const ud = new Date(lk.id + nd * 86400000).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      return /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: "center"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 36
        }
      }, "\uD83D\uDD12"), /*#__PURE__*/React.createElement("h3", {
        style: {
          color: g,
          fontSize: 18,
          fontWeight: 700,
          margin: "8px 0"
        }
      }, "Brief op slot"), /*#__PURE__*/React.createElement("p", {
        style: {
          color: g5,
          fontSize: 13,
          margin: "12px 0 6px"
        }
      }, "Nog ", /*#__PURE__*/React.createElement("strong", {
        style: {
          color: g
        }
      }, dl, " dagen")), /*#__PURE__*/React.createElement("p", {
        style: {
          color: g3,
          fontSize: 11,
          margin: "0 0 20px"
        }
      }, "Vrijkomt op ", ud), /*#__PURE__*/React.createElement("button", {
        className: "mb",
        onClick: () => setShowLetter(false)
      }, "Begrepen"));
    }
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 36
      }
    }, "\u2709\uFE0F"), /*#__PURE__*/React.createElement("h3", {
      style: {
        color: g,
        fontSize: 18,
        fontWeight: 700,
        margin: "8px 0"
      }
    }, "Brief aan jezelf")), /*#__PURE__*/React.createElement("textarea", {
      className: "ta",
      placeholder: "Lieve ik...",
      value: letterDraft, onChange: e => setLetterDraft(e.target.value), rows: 6,
      placeholder: "Lieve ik... \n\nGebruik de vragen hieronder als inspiratie of schrijf gewoon wat in je opkomt."
    }),
    /*#__PURE__*/React.createElement("div", {
      style: { background: "rgba(220,117,83,0.06)", borderRadius: 12, padding: "10px 12px", marginBottom: 14 }
    },
      /*#__PURE__*/React.createElement("p", { style: { color: "rgba(61,74,88,0.5)", fontSize: 11, fontWeight: 600, margin: "0 0 6px" } }, "Voorbeeldvragen als inspiratie:"),
      ["Hoe gaat het nu met jou? \uD83D\uDCAD",
       "Waar loop je tegen aan? \uD83C\uDF0A",
       "Wat wil je veranderen tegen de volgende brief? \uD83C\uDF31",
       "Wat zijn je doelen voor de langere termijn? \u2B50"
      ].map((q,i) => /*#__PURE__*/React.createElement("p", {
        key: i,
        style: { color: "rgba(61,74,88,0.45)", fontSize: 11, margin: "2px 0", cursor: "pointer" },
        onClick: () => setLetterDraft(d => d + (d ? "\n\n" : "") + q.replace(/ [\uD83D\uDCAD\uD83C\uDF0A\uD83C\uDF31\u2B50]/g,"").trim() + "\n")
      }, "\u2022 " + q)
    ),
    /*#__PURE__*/React.createElement("p", { style: { color: g, fontSize: 13, fontWeight: 600, marginBottom: 8 } }, "Wanneer wil je de brief openen?"),
    /*#__PURE__*/React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 } },
      (() => {
      const nextPeriods = letters.length === 0 ? [30] :
        letters.length === 1 ? [90] :
        letters.length === 2 ? [180] :
        letters.length === 3 ? [365] :
        [180, 365];
      if (nextPeriods.length === 1 && letterPeriod !== nextPeriods[0]) {
        setTimeout(() => setLetterPeriod(nextPeriods[0]), 0);
      }
      const labels = {30:"1 maand",90:"3 maanden",180:"6 maanden",365:"1 jaar"};
      return nextPeriods.map(d => /*#__PURE__*/React.createElement("button", {
        key: d,
        onClick: () => setLetterPeriod(d),
        style: { flex: 1, padding: "12px 8px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
          border: letterPeriod === d ? "2px solid #DC7553" : "2px solid rgba(220,117,83,0.2)",
          background: letterPeriod === d ? "rgba(220,117,83,0.1)" : "white", color: g }
      }, labels[d] || d + " dagen"));
    })()
    ),
    /*#__PURE__*/React.createElement("button", {
      className: "mb", style: { width: "100%", padding: "12px 0" },
      disabled: !letterDraft.trim(),
      onClick: () => {
        if (!letterDraft.trim()) return;
        const unlockDate = new Date();
        unlockDate.setDate(unlockDate.getDate() + letterPeriod);
        // letterPeriod is in days: 30=1mo, 90=3mo, 180=6mo, 365=1yr
        setLetters(p => [{
          text: letterDraft.trim(),
          date: new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"long",year:"numeric"}),
          unlockDate: unlockDate.toISOString(),
          unlockDays: letterPeriod,
          id: Date.now()
        }, ...p]);
        setLetterDraft("");
        setShowLetter(false);
        const newWiL = {...wi, flowers: wi.flowers+1, brieven: wi.brieven+1};
        const newGrowthL = Math.min(1, growth+0.003);
        setWi(newWiL);
        setGrowth(newGrowthL);
        showWorldReward("letter");
        const saveLW = { accType, reason, experience, treeName, userName, growth: newGrowthL, coins, ownedItems, avatar, letters, diary, seenEx, lastExId, dailyMood, totalSessions, wi: newWiL, lastDay, dailyActions, lastTaskTexts, dailyBreaths, lastBreathTime, lastTaskTime, dailyTasks, tasksGenerated, checkinDone, lastCheckinDate, streakShields, secretQ, secretA, goals, buddy, moodHistory, petPositions, exPerEx, therapistCode, linkedTherapist };
        try { localStorage.setItem("huxi-profile", JSON.stringify(saveLW)); } catch(e) {}
        if (userKey) firebaseSave(userKey, saveLW);
      }
    }, !letterDraft.trim() ? "Schrijf eerst je brief..." : "Bewaar brief \uD83C\uDF3F")));
  })())), showLetters && /*#__PURE__*/React.createElement("div", {
    style: overlay(),
    onClick: () => setShowLetters(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeIn",
    style: modal,
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: g,
      fontSize: 17,
      fontWeight: 700,
      textAlign: "center",
      marginBottom: 14
    }
  }, "\uD83C\uDF43 Jouw brieven"), letters.map(l => {
    const now = Date.now(),
      unlockTime = l.unlockDate ? new Date(l.unlockDate).getTime() : (l.id + (l.unlockDays || 30) * 86400000),
      isL = now < unlockTime,
      dl = isL ? Math.ceil((unlockTime - now) / 86400000) : 0;
    return /*#__PURE__*/React.createElement("div", {
      key: l.id,
      style: {
        padding: "12px 14px",
        marginBottom: 8,
        background: isL ? "rgba(150,150,150,0.08)" : "rgba(220,117,83,0.06)",
        borderRadius: 14
      }
    }, isL ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD12"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      style: {
        color: g5,
        fontSize: 12,
        fontWeight: 600,
        margin: 0
      }
    }, "Op slot"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: g3,
        fontSize: 10,
        margin: 0
      }
    }, "Nog ", dl, " dagen"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
      style: {
        color: g,
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.4,
        margin: 0
      }
    }, l.text), /*#__PURE__*/React.createElement("p", {
      style: {
        color: g3,
        fontSize: 10,
        marginTop: 6
      }
    }, "\uD83D\uDCC5 ", l.date)));
  }), /*#__PURE__*/React.createElement("button", {
    className: "mb",
    style: {
      width: "100%",
      marginTop: 14,
      padding: "10px 0"
    },
    onClick: () => setShowLetters(false)
  }, "Sluiten"))), showDiary && /*#__PURE__*/React.createElement("div", {
    style: overlay(),
    onClick: () => setShowDiary(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeIn",
    style: modal,
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 30
    }
  }, "\uD83D\uDCD4"), /*#__PURE__*/React.createElement("h3", {
    style: {
      color: g,
      fontSize: 17,
      fontWeight: 700,
      margin: "6px 0"
    }
  }, "Dagboek")), /*#__PURE__*/React.createElement("textarea", {
    className: "ta",
    placeholder: "Vandaag\u2026",
    value: diaryDraft,
    onChange: e => setDiaryDraft(e.target.value),
    maxLength: 1000,
    rows: 4
  }), /*#__PURE__*/React.createElement("button", {
    className: "mb",
    style: {
      width: "100%",
      marginTop: 10,
      padding: "10px 0"
    },
    onClick: saveDiary
  }, "Opslaan"), diary.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid rgba(61,74,88,0.08)",
      margin: "14px 0 10px"
    }
  }), diary.slice(0, 10).map(d => /*#__PURE__*/React.createElement("div", {
    key: d.id,
    style: {
      padding: "6px 0"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: g,
      fontSize: 12,
      margin: 0
    }
  }, d.text), /*#__PURE__*/React.createElement("p", {
    style: {
      color: g3,
      fontSize: 9,
      margin: "4px 0 0"
    }
  }, d.date))), /*#__PURE__*/React.createElement("button", {
    style: {
      width: "100%",
      marginTop: 10,
      background: "none",
      border: "1px solid " + g3,
      borderRadius: 14,
      padding: "8px 0",
      color: g5,
      fontSize: 12,
      cursor: "pointer"
    },
    onClick: () => setShowDiary(false)
  }, "Sluiten"))), showStreak && /*#__PURE__*/React.createElement("div", {
    style: overlay(),
    onClick: () => setShowStreak(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeIn",
    style: { ...modal, textAlign: "center" },
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", { style: { fontSize: 48, marginBottom: 8 } },
      wi.streakDays >= 100 ? "\uD83D\uDC8E" : wi.streakDays >= 30 ? "\u2B50" : "\uD83D\uDD25"
    ),
    /*#__PURE__*/React.createElement("h3", { style: { color: g, fontSize: 22, fontWeight: 700, margin: "0 0 4px" } }, wi.streakDays || 0, " dagen"),
    /*#__PURE__*/React.createElement("p", { style: { color: "#70BCBC", fontSize: 13, margin: "0 0 4px" } },
      wi.streakDays >= 365 ? "HUXI Legende \uD83C\uDFC6" : wi.streakDays >= 100 ? "Zen Master \uD83D\uDC8E" :
      wi.streakDays >= 60 ? "Inner Balance \uD83D\uDD25" : wi.streakDays >= 30 ? "Mindful Pro \u2B50" :
      wi.streakDays >= 14 ? "Rustige Kracht \uD83C\uDF33" : wi.streakDays >= 7 ? "Doorzetter \uD83C\uDF3F" :
      wi.streakDays >= 3 ? "Starter \uD83C\uDF31" : "Begin je streak vandaag!"
    ),
    /*#__PURE__*/React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 6, margin: "8px 0 16px" } },
      [0,1].map(i => /*#__PURE__*/React.createElement("span", { key: i, style: { fontSize: 20, opacity: i < streakShields ? 1 : 0.2 } }, "\uD83D\uDEE1\uFE0F")),
      /*#__PURE__*/React.createElement("span", { style: { fontSize: 11, color: "rgba(61,74,88,0.4)", alignSelf: "center" } },
        streakShields > 0 ? streakShields + " shield beschikbaar" : "Verdien een shield na 7 dagen"
      )
    ),
    /*#__PURE__*/React.createElement("div", { style: { background: "rgba(220,117,83,0.06)", borderRadius: 12, padding: "12px", marginBottom: 14, textAlign: "left" } },
      [[3,"\uD83C\uDF31","Je boom glinster"],[7,"\uD83E\uDD8C","Hert in je wereld"],[14,"\uD83C\uDF38","Bloemen op je boom"],[30,"\uD83C\uDF08","Regenboog"],[100,"\uD83C\uDF41","Gouden bladeren"],[365,"\uD83C\uDFC6","Gouden boom"]].map(([d,ic,lbl]) =>
        /*#__PURE__*/React.createElement("div", { key: d, style: { display: "flex", alignItems: "center", gap: 8, padding: "5px 0", opacity: (wi.streakDays||0) >= d ? 1 : 0.35 } },
          /*#__PURE__*/React.createElement("span", { style: { fontSize: 18, minWidth: 22 } }, (wi.streakDays||0) >= d ? ic : "\uD83D\uDD12"),
          /*#__PURE__*/React.createElement("span", { style: { fontSize: 12, color: g } }, d + " dagen \u2014 " + lbl)
        )
      )
    ),
    (wi.streakDays||0) < 365 && /*#__PURE__*/React.createElement("p", { style: { color: "rgba(61,74,88,0.4)", fontSize: 11, marginBottom: 12 } },
      (wi.streakDays||0) < 3 ? "Nog " + (3-(wi.streakDays||0)) + " dagen tot je eerste beloning!" :
      (wi.streakDays||0) < 7 ? "Nog " + (7-(wi.streakDays||0)) + " dagen tot het hert!" :
      "Je bent geweldig bezig! \uD83C\uDF1F"
    ),
    /*#__PURE__*/React.createElement("button", { className: "mb", style: { width: "100%", padding: "10px 0" }, onClick: () => setShowStreak(false) }, "Sluiten")
  )), showAvatar && /*#__PURE__*/React.createElement("div", {
    style: overlay(),
    onClick: () => { setShowAvatar(false); setShowShop(false); }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeIn",
    style: { ...modal, maxHeight: "92vh", padding: "14px 14px 10px", display: "flex", flexDirection: "column", gap: 0 },
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
      /*#__PURE__*/React.createElement("h3", { style: { color: g, fontSize: 16, fontWeight: 700, margin: 0 } }, "\uD83D\uDC64 Jouw Avatar"),
      /*#__PURE__*/React.createElement("span", { style: { color: "#E6A832", fontSize: 13, fontWeight: 700 } }, "\uD83E\uDE99 ", coins)
    ),
    /*#__PURE__*/React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" } },
      /*#__PURE__*/React.createElement("div", { style: { flexShrink: 0 } },
        (() => {
  const sk = {skin_light:"#FFDBB4",skin_medium:"#D4A574",skin_dark:"#8D6E4C",skin_pale:"#FFE8D0"}[avatar.skin]||"#FFDBB4";
  const hc = {hairc_brown:"#5C4033",hairc_black:"#1A1A2E",hairc_blonde:"#E6C86E",hairc_red:"#C4553A",hairc_blue:"#4A90C4",hairc_pink:"#FF85A1",hairc_green:"#3D9E6A",hairc_purple:"#9B59B6",hairc_rainbow:"url(#rainbowG)",hairc_silver:"#BDC3C7",hairc_orange:"#E67E22",hairc_teal:"#1ABC9C",hairc_galaxy:"url(#galaxyG)"}[avatar.hairc]||"#5C4033";
  const shC = {shoes_none:"#555",shoes_sneaker:"#E85D3A",shoes_boot:"#4A3020",shoes_gold:"#DAA520",shoes_rainbow:"#FF69B4",shoes_sandal:"#C8A870",shoes_rocket:"#C4553A",shoes_cloud:"#A8C4D8",shoes_star_shoes:"#FFD700",shoes_dragon:"#8B2500",shoes_galaxy:"url(#galaxyG)"}[avatar.shoes]||"#555";
  const pC = {pants_none:"#4A5568",pants_jeans:"#4A6FA5",pants_red:"#C4553A",pants_purple:"#7B4DAA",pants_gold:"#DAA520",pants_star:"#2D5A87",pants_camo:"#4A5E3A",pants_galaxy:"url(#galaxyG)",pants_cloud:"#A8C4D8",pants_dino:"#5C8A4A",pants_rainbow:"url(#rainbowG)",pants_aurora:"url(#auroraG)"}[avatar.pants]||"#4A5568";
  const tC = {shirt_none:"#DC7553",shirt_stripes:"#E6A832",shirt_heart:"#E85D75",shirt_star:"#4A90C4",shirt_cool:"#333",shirt_rainbow:"url(#rainbowG)",shirt_nature:"#5CAB7D",shirt_space:"#1A1A2E",shirt_fire:"url(#fireG)",shirt_ice:"#87CEEB",shirt_gold:"url(#goldG)",shirt_cloud:"#A8C4D8",shirt_dino:"#5C8A4A",shirt_cat:"#F4A460",shirt_galaxy:"url(#galaxyG)",shirt_aurora:"url(#auroraG)"}[avatar.shirt]||"#DC7553";
  const h = avatar.hair, hat = avatar.hat, acc = avatar.acc;
  const E = React.createElement, F = React.Fragment;

  return E("svg", {width:120,height:160,viewBox:"0 0 120 160"},
    E("defs", null,
      E("linearGradient", {id:"galaxyG",x1:"0%",y1:"0%",x2:"100%",y2:"100%"}, E("stop",{offset:"0%",stopColor:"#2C1654"}), E("stop",{offset:"50%",stopColor:"#4A2578"}), E("stop",{offset:"100%",stopColor:"#1A1A4E"})),
      E("linearGradient", {id:"auroraG",x1:"0%",y1:"0%",x2:"100%",y2:"100%"}, E("stop",{offset:"0%",stopColor:"#1ABC9C"}), E("stop",{offset:"50%",stopColor:"#9B59B6"}), E("stop",{offset:"100%",stopColor:"#3498DB"})),
      E("linearGradient", {id:"rainbowG",x1:"0%",y1:"0%",x2:"100%",y2:"0%"}, E("stop",{offset:"0%",stopColor:"#FF6B6B"}), E("stop",{offset:"25%",stopColor:"#FFD93D"}), E("stop",{offset:"50%",stopColor:"#6BCB77"}), E("stop",{offset:"75%",stopColor:"#4D96FF"}), E("stop",{offset:"100%",stopColor:"#9B59B6"})),
      E("linearGradient", {id:"goldG",x1:"0%",y1:"0%",x2:"100%",y2:"100%"}, E("stop",{offset:"0%",stopColor:"#FFD700"}), E("stop",{offset:"50%",stopColor:"#FFA500"}), E("stop",{offset:"100%",stopColor:"#FFD700"})),
      E("linearGradient", {id:"fireG",x1:"0%",y1:"100%",x2:"0%",y2:"0%"}, E("stop",{offset:"0%",stopColor:"#FF4500"}), E("stop",{offset:"50%",stopColor:"#FF6347"}), E("stop",{offset:"100%",stopColor:"#FFD700"}))
    ),
    E("ellipse", {cx:60,cy:155,rx:25,ry:5,fill:"rgba(0,0,0,0.08)"}),
    acc==="acc_cape" && E("path", {d:"M38,74 Q25,110 38,140 Q60,130 82,140 Q95,110 82,74",fill:"#C4553A",opacity:0.85}),
    acc==="acc_wings" && E(F, null, E("ellipse",{cx:14,cy:92,rx:20,ry:30,fill:"#E8D5FF",opacity:0.75}), E("ellipse",{cx:106,cy:92,rx:20,ry:30,fill:"#E8D5FF",opacity:0.75}), E("ellipse",{cx:18,cy:85,rx:12,ry:20,fill:"#F0E6FF",opacity:0.6}), E("ellipse",{cx:102,cy:85,rx:12,ry:20,fill:"#F0E6FF",opacity:0.6})),
    acc==="acc_dragon_wings" && E(F, null, E("path",{d:"M8,68 Q-2,38 18,28 L28,48 Q16,58 22,72 Z",fill:"url(#fireG)",opacity:0.85}), E("path",{d:"M112,68 Q122,38 102,28 L92,48 Q104,58 98,72 Z",fill:"url(#fireG)",opacity:0.85})),
    acc==="acc_rainbow_acc" && E("path", {d:"M15,95 Q60,30 105,95",fill:"none",stroke:"url(#rainbowG)",strokeWidth:4,opacity:0.5}),
    E("ellipse", {cx:45,cy:148,rx:11,ry:6,fill:shC,stroke:"rgba(0,0,0,0.1)",strokeWidth:0.5}),
    E("ellipse", {cx:75,cy:148,rx:11,ry:6,fill:shC,stroke:"rgba(0,0,0,0.1)",strokeWidth:0.5}),
    avatar.shoes==="shoes_sneaker" && E(F,null, E("line",{x1:40,y1:147,x2:50,y2:147,stroke:"white",strokeWidth:1,opacity:0.6}), E("line",{x1:70,y1:147,x2:80,y2:147,stroke:"white",strokeWidth:1,opacity:0.6})),
    avatar.shoes==="shoes_boot" && E(F,null, E("rect",{x:38,y:138,width:14,height:10,rx:3,fill:shC}), E("rect",{x:68,y:138,width:14,height:10,rx:3,fill:shC}), E("rect",{x:42,y:140,width:6,height:2,rx:1,fill:"#DAA520"}), E("rect",{x:72,y:140,width:6,height:2,rx:1,fill:"#DAA520"})),
    avatar.shoes==="shoes_rocket" && E(F,null, E("path",{d:"M38,150 L42,155 L48,150",fill:"#FF6347"}), E("path",{d:"M68,150 L72,155 L78,150",fill:"#FF6347"})),
    E("rect", {x:40,y:118,width:12,height:32,rx:5,fill:pC}),
    E("rect", {x:68,y:118,width:12,height:32,rx:5,fill:pC}),
    avatar.pants==="pants_star" && E(F,null, E("text",{x:46,y:138,textAnchor:"middle",fontSize:8,fill:"#FFD700"},"\u2605"), E("text",{x:74,y:138,textAnchor:"middle",fontSize:8,fill:"#FFD700"},"\u2605")),
    E("path", {d:"M35,76 Q35,72 40,72 L80,72 Q85,72 85,76 L85,120 Q85,124 80,124 L40,124 Q35,124 35,120 Z",fill:tC}),
    avatar.shirt==="shirt_stripes" && E(F,null, [82,90,98,106].map(y=>E("line",{key:y,x1:38,y1:y,x2:82,y2:y,stroke:"white",strokeWidth:2,opacity:0.35}))),
    avatar.shirt==="shirt_heart" && E("path",{d:"M55,92 Q55,86 60,90 Q65,86 65,92 Q65,98 60,102 Q55,98 55,92Z",fill:"white",opacity:0.8}),
    avatar.shirt==="shirt_star" && E("polygon",{points:"60,86 62,93 69,93 63,97 65,104 60,100 55,104 57,97 51,93 58,93",fill:"white",opacity:0.8}),
    avatar.shirt==="shirt_cool" && E("text",{x:60,y:103,textAnchor:"middle",fontSize:12,fontWeight:700,fill:"white",opacity:0.9},"COOL"),
    avatar.shirt==="shirt_nature" && E("path",{d:"M55,100 Q60,85 65,100 Q60,95 55,100Z",fill:"white",opacity:0.7}),
    avatar.shirt==="shirt_space" && E(F,null, E("path",{d:"M58,88 L60,82 L62,88 L58,88Z",fill:"#87CEEB"}), E("circle",{cx:60,cy:92,r:4,fill:"#C0C0C0"}), E("path",{d:"M56,96 L58,92 L62,92 L64,96Z",fill:"#FF6347"})),
    avatar.shirt==="shirt_fire" && E("path",{d:"M55,102 Q58,90 60,95 Q62,88 64,94 Q66,86 65,102Z",fill:"#FFD700",opacity:0.8}),
    avatar.shirt==="shirt_ice" && E(F,null, E("line",{x1:60,y1:88,x2:60,y2:104,stroke:"white",strokeWidth:1.5,opacity:0.7}), E("line",{x1:52,y1:96,x2:68,y2:96,stroke:"white",strokeWidth:1.5,opacity:0.7}), E("line",{x1:54,y1:90,x2:66,y2:102,stroke:"white",strokeWidth:1,opacity:0.5}), E("line",{x1:66,y1:90,x2:54,y2:102,stroke:"white",strokeWidth:1,opacity:0.5})),
    avatar.shirt==="shirt_dino" && E("path",{d:"M56,92 Q58,86 60,92 Q62,86 64,92",fill:"none",stroke:"white",strokeWidth:2,opacity:0.7}),
    avatar.shirt==="shirt_cat" && E(F,null, E("path",{d:"M54,90 L57,84 L60,90Z",fill:"white",opacity:0.6}), E("path",{d:"M60,90 L63,84 L66,90Z",fill:"white",opacity:0.6}), E("circle",{cx:57,cy:94,r:1.5,fill:"white",opacity:0.6}), E("circle",{cx:63,cy:94,r:1.5,fill:"white",opacity:0.6})),
    avatar.shirt==="shirt_cloud" && E(F,null, E("circle",{cx:55,cy:96,r:5,fill:"white",opacity:0.4}), E("circle",{cx:62,cy:94,r:6,fill:"white",opacity:0.4}), E("circle",{cx:68,cy:97,r:4,fill:"white",opacity:0.4})),
    E("rect", {x:22,y:78,width:12,height:36,rx:6,fill:sk}),
    E("rect", {x:86,y:78,width:12,height:36,rx:6,fill:sk}),
    E("circle", {cx:28,cy:116,r:6,fill:sk}),
    E("circle", {cx:92,cy:116,r:6,fill:sk}),
    E("rect", {x:54,y:64,width:12,height:12,rx:4,fill:sk}),
    E("circle", {cx:60,cy:42,r:28,fill:sk}),
    (h==="hair_short"||!h||h==="hair_none") && E("path",{d:"M32,38 Q32,12 60,8 Q88,12 88,38 Q88,20 60,16 Q32,20 32,38",fill:hc}),
    h==="hair_long" && E(F,null, E("path",{d:"M32,38 Q32,12 60,8 Q88,12 88,38 Q88,20 60,16 Q32,20 32,38",fill:hc}), E("path",{d:"M32,38 Q28,55 30,78",fill:"none",stroke:hc,strokeWidth:10,strokeLinecap:"round"}), E("path",{d:"M88,38 Q92,55 90,78",fill:"none",stroke:hc,strokeWidth:10,strokeLinecap:"round"})),
    h==="hair_curly" && E(F,null, ...[{cx:38,cy:22,r:12},{cx:60,cy:14,r:14},{cx:82,cy:22,r:12},{cx:34,cy:38,r:8},{cx:86,cy:38,r:8}].map((c,i)=>E("circle",{key:i,...c,fill:hc}))),
    h==="hair_spiky" && E(F,null, E("path",{d:"M32,35 Q35,12 60,8 Q85,12 88,35 Q88,22 60,18 Q32,22 32,35",fill:hc}), ...[{p:"M38,20 Q42,-2 46,20"},{p:"M50,16 Q55,-6 60,16"},{p:"M62,16 Q67,-6 72,16"},{p:"M74,20 Q78,-2 82,20"}].map((s,i)=>E("path",{key:i,d:s.p,fill:hc}))),
    h==="hair_bun" && E(F,null, E("path",{d:"M32,38 Q32,12 60,8 Q88,12 88,38 Q88,20 60,16 Q32,20 32,38",fill:hc}), E("circle",{cx:60,cy:6,r:12,fill:hc})),
    h==="hair_mohawk" && E(F,null, E("rect",{x:50,y:2,width:20,height:22,rx:5,fill:hc}), E("rect",{x:52,y:-4,width:16,height:12,rx:4,fill:hc})),
    h==="hair_pigtails" && E(F,null, E("path",{d:"M32,38 Q32,12 60,8 Q88,12 88,38 Q88,20 60,16 Q32,20 32,38",fill:hc}), E("circle",{cx:28,cy:30,r:10,fill:hc}), E("circle",{cx:92,cy:30,r:10,fill:hc}), E("circle",{cx:28,cy:30,r:3,fill:"#FF85A1"}), E("circle",{cx:92,cy:30,r:3,fill:"#FF85A1"})),
    h==="hair_afro" && E(F,null, E("circle",{cx:60,cy:28,r:35,fill:hc}), ...[{cx:40,cy:10},{cx:60,cy:2},{cx:80,cy:10},{cx:30,cy:30},{cx:90,cy:30}].map((c,i)=>E("circle",{key:i,cx:c.cx,cy:c.cy,r:8,fill:hc,opacity:0.7}))),
    h==="hair_ponytail" && E(F,null, E("path",{d:"M32,38 Q32,12 60,8 Q88,12 88,38 Q88,20 60,16 Q32,20 32,38",fill:hc}), E("path",{d:"M85,28 Q95,35 92,55 Q90,70 85,80",fill:"none",stroke:hc,strokeWidth:10,strokeLinecap:"round"}), E("circle",{cx:85,cy:28,r:4,fill:"#DC7553"})),
    E("circle", {cx:48,cy:42,r:5,fill:"white"}),
    E("circle", {cx:72,cy:42,r:5,fill:"white"}),
    E("circle", {cx:49,cy:42,r:2.8,fill:"#333"}),
    E("circle", {cx:73,cy:42,r:2.8,fill:"#333"}),
    E("circle", {cx:50,cy:41,r:1.2,fill:"white"}),
    E("circle", {cx:74,cy:41,r:1.2,fill:"white"}),
    E("path", {d:"M53,54 Q60,60 67,54",fill:"none",stroke:"#C4553A",strokeWidth:2,strokeLinecap:"round"}),
    E("circle", {cx:40,cy:52,r:5,fill:"#FFB6B6",opacity:0.35}),
    E("circle", {cx:80,cy:52,r:5,fill:"#FFB6B6",opacity:0.35}),
    hat==="hat_cap" && E(F,null, E("ellipse",{cx:60,cy:18,rx:30,ry:12,fill:"#E85D3A"}), E("rect",{x:30,y:16,width:60,height:8,rx:3,fill:"#E85D3A"}), E("circle",{cx:60,cy:10,r:3,fill:"#C44A2A"})),
    hat==="hat_beanie" && E(F,null, E("ellipse",{cx:60,cy:18,rx:28,ry:18,fill:"#E85D3A"}), E("rect",{x:32,y:18,width:56,height:8,rx:3,fill:"#CC4E30"}), E("circle",{cx:60,cy:4,r:5,fill:"#FFD700"})),
    hat==="hat_bow" && E(F,null, E("ellipse",{cx:46,cy:14,rx:12,ry:8,fill:"#FF85A1"}), E("ellipse",{cx:74,cy:14,rx:12,ry:8,fill:"#FF85A1"}), E("circle",{cx:60,cy:14,r:6,fill:"#FF69B4"})),
    hat==="hat_flower" && E(F,null, ...[0,60,120,180,240,300].map((a,i)=>E("circle",{key:i,cx:60+14*Math.cos(a*Math.PI/180),cy:10+14*Math.sin(a*Math.PI/180),r:5,fill:["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF85A1","#E67E22"][i]})), E("circle",{cx:60,cy:10,r:5,fill:"#FFD700"})),
    hat==="hat_crown" && E(F,null, E("rect",{x:36,y:18,width:48,height:8,rx:2,fill:"#FFD700"}), E("polygon",{points:"36,18 42,2 48,14 54,-2 60,14 66,-2 72,14 78,2 84,18",fill:"#FFD700"}), E("circle",{cx:48,cy:10,r:2.5,fill:"#FF6347"}), E("circle",{cx:60,cy:4,r:2.5,fill:"#4A90C4"}), E("circle",{cx:72,cy:10,r:2.5,fill:"#2ECC71"})),
    hat==="hat_wizard" && E(F,null, E("path",{d:"M38,24 L60,-14 L82,24Z",fill:"#4A3FA5"}), E("rect",{x:34,y:24,width:52,height:6,rx:2,fill:"#4A3FA5"}), E("circle",{cx:60,cy:-8,r:4,fill:"#FFD700"}), E("circle",{cx:52,cy:8,r:2,fill:"#FFD700",opacity:0.7}), E("circle",{cx:65,cy:14,r:1.5,fill:"#FFD700",opacity:0.5})),
    hat==="hat_party" && E(F,null, E("path",{d:"M46,22 L60,-8 L74,22Z",fill:"#FF6347"}), E("circle",{cx:60,cy:-8,r:5,fill:"#FFD700"}), E("circle",{cx:53,cy:10,r:2.5,fill:"#4A90C4"}), E("circle",{cx:63,cy:6,r:2,fill:"#2ECC71"}), E("circle",{cx:68,cy:14,r:2.5,fill:"#FFD700"})),
    hat==="hat_pirate" && E(F,null, E("path",{d:"M32,24 L32,12 Q60,-2 88,12 L88,24Z",fill:"#222"}), E("rect",{x:28,y:24,width:64,height:6,rx:2,fill:"#222"}), E("text",{x:60,y:20,textAnchor:"middle",fontSize:12,fill:"white"},"\u2620")),
    hat==="hat_astro" && E(F,null, E("ellipse",{cx:60,cy:18,rx:30,ry:22,fill:"#C0C0C0",opacity:0.9}), E("ellipse",{cx:60,cy:20,rx:22,ry:16,fill:"#87CEEB",opacity:0.6}), E("ellipse",{cx:52,cy:16,rx:6,ry:4,fill:"white",opacity:0.3})),
    hat==="hat_halo" && E(F,null, E("ellipse",{cx:60,cy:6,rx:24,ry:7,fill:"none",stroke:"#FFD700",strokeWidth:3}), E("ellipse",{cx:60,cy:6,rx:24,ry:7,fill:"none",stroke:"#FFF8DC",strokeWidth:1,opacity:0.6})),
    hat==="hat_bunny" && E(F,null, E("ellipse",{cx:46,cy:4,rx:8,ry:18,fill:"#F0EDE8"}), E("ellipse",{cx:74,cy:4,rx:8,ry:18,fill:"#F0EDE8"}), E("ellipse",{cx:46,cy:4,rx:4,ry:13,fill:"#FFB6B6",opacity:0.6}), E("ellipse",{cx:74,cy:4,rx:4,ry:13,fill:"#FFB6B6",opacity:0.6})),
    hat==="hat_dino" && E(F,null, E("path",{d:"M44,18 L48,2 L52,18Z",fill:"#5C8A4A"}), E("path",{d:"M56,16 L60,-2 L64,16Z",fill:"#5C8A4A"}), E("path",{d:"M68,18 L72,2 L76,18Z",fill:"#5C8A4A"})),
    hat==="hat_cloud" && E(F,null, E("circle",{cx:48,cy:12,r:10,fill:"white",opacity:0.9}), E("circle",{cx:60,cy:6,r:12,fill:"white",opacity:0.9}), E("circle",{cx:72,cy:12,r:10,fill:"white",opacity:0.9}), E("circle",{cx:54,cy:8,r:8,fill:"#F0F8FF",opacity:0.7})),
    hat==="hat_galaxy" && E(F,null, E("ellipse",{cx:60,cy:14,rx:30,ry:14,fill:"url(#galaxyG)"}), E("circle",{cx:48,cy:10,r:1.5,fill:"white",opacity:0.8}), E("circle",{cx:60,cy:6,r:1,fill:"white",opacity:0.9}), E("circle",{cx:72,cy:12,r:1.5,fill:"white",opacity:0.7}), E("circle",{cx:55,cy:16,r:1,fill:"#FFD700"})),
    hat==="hat_dragon_helm" && E(F,null, E("path",{d:"M34,26 Q34,10 60,6 Q86,10 86,26Z",fill:"#8B2500"}), E("path",{d:"M34,20 L24,0 L42,14Z",fill:"#8B2500"}), E("path",{d:"M86,20 L96,0 L78,14Z",fill:"#8B2500"}), E("rect",{x:34,y:26,width:52,height:4,rx:1,fill:"#DAA520"})),
    acc==="acc_glasses" && E(F,null, E("circle",{cx:48,cy:42,r:8,fill:"none",stroke:"#333",strokeWidth:1.5}), E("circle",{cx:72,cy:42,r:8,fill:"none",stroke:"#333",strokeWidth:1.5}), E("line",{x1:56,y1:42,x2:64,y2:42,stroke:"#333",strokeWidth:1.5}), E("line",{x1:40,y1:42,x2:36,y2:40,stroke:"#333",strokeWidth:1}), E("line",{x1:80,y1:42,x2:84,y2:40,stroke:"#333",strokeWidth:1})),
    acc==="acc_sunglasses" && E(F,null, E("rect",{x:40,y:38,width:16,height:10,rx:4,fill:"#222",opacity:0.9}), E("rect",{x:64,y:38,width:16,height:10,rx:4,fill:"#222",opacity:0.9}), E("line",{x1:56,y1:43,x2:64,y2:43,stroke:"#222",strokeWidth:2}), E("rect",{x:42,y:39,width:6,height:2,rx:1,fill:"white",opacity:0.2}), E("rect",{x:66,y:39,width:6,height:2,rx:1,fill:"white",opacity:0.2})),
    acc==="acc_scarf" && E(F,null, E("path",{d:"M35,68 Q60,80 85,68",fill:"none",stroke:"#E85D3A",strokeWidth:6,strokeLinecap:"round"}), E("rect",{x:36,y:70,width:8,height:18,rx:3,fill:"#E85D3A"})),
    acc==="acc_necklace" && E(F,null, E("path",{d:"M42,70 Q60,82 78,70",fill:"none",stroke:"#FFD700",strokeWidth:2}), E("circle",{cx:60,cy:80,r:4,fill:"#FFD700"}), E("circle",{cx:60,cy:80,r:2,fill:"#FF6347"})),
    acc==="acc_crown_acc" && E(F,null, E("rect",{x:44,y:24,width:32,height:5,rx:1,fill:"#FFD700"}), E("polygon",{points:"44,24 48,12 52,24",fill:"#FFD700"}), E("polygon",{points:"56,24 60,8 64,24",fill:"#FFD700"}), E("polygon",{points:"68,24 72,12 76,24",fill:"#FFD700"})),
    acc==="acc_fairy_wand" && E(F,null, E("line",{x1:94,y1:65,x2:110,y2:35,stroke:"#9B59B6",strokeWidth:2.5,strokeLinecap:"round"}), E("polygon",{points:"110,28 112,35 119,35 113,39 115,46 110,42 105,46 107,39 101,35 108,35",fill:"#FFD700"})),
    acc==="acc_flower_acc" && E(F,null, ...[0,72,144,216,288].map((a,i)=>E("circle",{key:i,cx:88+6*Math.cos(a*Math.PI/180),cy:26+6*Math.sin(a*Math.PI/180),r:3,fill:["#FF6B6B","#FF85A1","#FF6B6B","#FF85A1","#FF6B6B"][i]})), E("circle",{cx:88,cy:26,r:3,fill:"#FFD700"})),
    acc==="acc_star_acc" && E("polygon",{points:"92,20 94,26 100,26 95,30 97,36 92,32 87,36 89,30 84,26 90,26",fill:"#FFD700"}),
    acc==="acc_halo_gold" && E(F,null, E("ellipse",{cx:60,cy:6,rx:24,ry:7,fill:"none",stroke:"#FFD700",strokeWidth:4}), E("ellipse",{cx:60,cy:6,rx:24,ry:7,fill:"none",stroke:"#FFF8DC",strokeWidth:1.5,opacity:0.7})),
    (avatar.shirt==="shirt_galaxy"||avatar.pants==="pants_galaxy"||avatar.shoes==="shoes_galaxy") && E(F,null, ...[{cx:45,cy:85},{cx:65,cy:95},{cx:55,cy:110},{cx:72,cy:130},{cx:48,cy:140}].map((s,i)=>E("circle",{key:"gs"+i,cx:s.cx,cy:s.cy,r:1,fill:"white",opacity:0.8}))),
    (avatar.shirt==="shirt_aurora"||avatar.pants==="pants_aurora") && E(F,null, ...[{cx:42,cy:82},{cx:58,cy:90},{cx:75,cy:88},{cx:50,cy:105}].map((s,i)=>E("circle",{key:"as"+i,cx:s.cx,cy:s.cy,r:1.5,fill:"#1ABC9C",opacity:0.5})))
  );
})()
      ),
      /*#__PURE__*/React.createElement("div", { style: { flex: 1, minWidth: 0 } },
        (() => {
          const PET_EM = { pet_cat: "\uD83D\uDC31", pet_dog: "\uD83D\uDC36", pet_rabbit: "\uD83D\uDC30", pet_dragon: "\uD83D\uDC09", pet_unicorn: "\uD83E\uDD84", pet_phoenix: "\uD83D\uDD25", pet_dino: "\uD83E\uDD95", pet_hamster: "\uD83D\uDC39", pet_fish: "\uD83D\uDC1F", pet_parrot: "\uD83E\uDD9C", pet_turtle: "\uD83D\uDC22", pet_pony: "\uD83D\uDC34" , pet_fox: "\uD83E\uDD8A", pet_owl: "\uD83E\uDD89", pet_bear: "\uD83D\uDC3B", pet_penguin: "\uD83D\uDC27", pet_frog: "\uD83D\uDC38", pet_butterfly: "\uD83E\uDD8B", pet_wolf: "\uD83D\uDC3A", pet_lion: "\uD83E\uDD81", pet_galaxy_cat: "\u2728\uD83D\uDC31", pet_lava_dragon: "\uD83D\uDD25\uD83D\uDC09", pet_aurora_fox: "\uD83C\uDF0C\uD83E\uDD8A", pet_crystal_wolf: "\uD83D\uDC8E\uD83D\uDC3A", pet_rainbow_pony: "\uD83C\uDF08\uD83E\uDD84" };
          const ownedPets = ownedItems.filter(i => i.startsWith("pet_") && i !== "pet_none");
          if (ownedPets.length === 0) return /*#__PURE__*/React.createElement("p", {
            style: { color: "rgba(61,74,88,0.35)", fontSize: 10, margin: "4px 0" }
          }, "Koop een huisdier \uD83D\uDC3E");
          const buddyEM = buddy && buddy !== "pet_none" ? (PET_EM[buddy] || "\uD83D\uDC3E") : null;
          return /*#__PURE__*/React.createElement("div", null,
            buddyEM && /*#__PURE__*/React.createElement("div", {
              style: { position: "absolute", top: 50, left: 148, fontSize: 30, lineHeight: 1, zIndex: 2, animation: "petWalk 1.8s ease-in-out infinite" }
            }, buddyEM),
            /*#__PURE__*/React.createElement("p", { style: { color: "rgba(61,74,88,0.5)", fontSize: 10, fontWeight: 700, margin: "0 0 4px" } },
              "\uD83D\uDC3E Huisdieren"
            ),
            /*#__PURE__*/React.createElement("div", {
              style: { maxHeight: 130, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }
            },
              ownedPets.map(petId => {
                const isBuddy = buddy === petId;
                return /*#__PURE__*/React.createElement("div", {
                  key: petId,
                  style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", borderRadius: 8, background: "transparent", border: "none" }
                },
                  /*#__PURE__*/React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
                    /*#__PURE__*/React.createElement("span", { style: { fontSize: 18 } }, PET_EM[petId] || "\uD83D\uDC3E"),
                    /*#__PURE__*/React.createElement("span", { style: { fontSize: 11, color: "#45545E" } }, petId.replace("pet_","").replace(/_/g," "))
                  ),
                  /*#__PURE__*/React.createElement("button", {
                    title: isBuddy ? "Vriend verwijderen" : "Maak vriend",
                    style: { background: "none", border: "none", fontSize: 15, cursor: "pointer", opacity: isBuddy ? 1 : 0.18, transition: "opacity 0.15s", padding: "0 2px" },
                    onClick: () => {
                      const newBuddy = isBuddy ? "pet_none" : petId;
                      setBuddy(newBuddy);
                      const s = { accType, reason, experience, treeName, userName, growth, coins, ownedItems, avatar, letters, diary, seenEx, lastExId, dailyMood, totalSessions, wi, lastDay, dailyActions, lastTaskTexts, dailyBreaths, lastBreathTime, lastTaskTime, dailyTasks, tasksGenerated, checkinDone, lastCheckinDate, streakShields, secretQ, secretA, goals, buddy: newBuddy, moodHistory, petPositions, exPerEx, therapistCode, linkedTherapist };
                      try { localStorage.setItem("huxi-profile", JSON.stringify(s)); } catch(e2) {}
                      if (userKey) firebaseSave(userKey, s);
                    }
                  }, "\u2B50")
                );
              })
            )
          );
        })()
      )
    ),
    /*#__PURE__*/React.createElement("div", { style: { overflowY: "auto", flex: 1 } },
      /*#__PURE__*/React.createElement(React.Fragment, null, [{
    cat: "Huid",
    k: "skin",
    items: [{
      id: "skin_medium",
      n: "Medium",
      p: 0
    }, {
      id: "skin_dark",
      n: "Donker",
      p: 0
    }, {
      id: "skin_pale",
      n: "Bleek",
      p: 0
    }]
  }, {
    cat: "Haar",
    k: "hair",
    items: [{
      id: "hair_long",
      n: "Lang",
      p: 20
    }, {
      id: "hair_curly",
      n: "Krullen",
      p: 20
    }, {
      id: "hair_spiky",
      n: "Stekels",
      p: 25
    }, {
      id: "hair_bun",
      n: "Knotje",
      p: 30
    }, {
      id: "hair_mohawk",
      n: "Hanenkam",
      p: 50
    }, {
      id: "hair_pigtails",
      n: "Vlechtjes",
      p: 75
    }, {
      id: "hair_afro",
      n: "Afro",
      p: 90
    }, {
      id: "hair_ponytail",
      n: "Staartje",
      p: 65
    }
    ]
  }, {
    cat: "Haarkleur",
    k: "hairc",
    items: [{
      id: "hairc_black",
      n: "Zwart",
      p: 10
    }, {
      id: "hairc_blonde",
      n: "Blond",
      p: 10
    }, {
      id: "hairc_red",
      n: "Rood",
      p: 10
    }, {
      id: "hairc_blue",
      n: "Blauw",
      p: 25
    }, {
      id: "hairc_pink",
      n: "Roze",
      p: 25
    }, {
      id: "hairc_green",
      n: "Groen",
      p: 25
    }, {
      id: "hairc_purple",
      n: "Paars",
      p: 30
    }, {
      id: "hairc_rainbow",
      n: "Regenboog",
      p: 100
    }, {
      id: "hairc_silver",
      n: "Zilver",
      p: 90
    }, {
      id: "hairc_orange",
      n: "Oranje",
      p: 65
    }, {
      id: "hairc_teal",
      n: "Teal",
      p: 75
    }, {
      id: "hairc_galaxy",
      n: "Galaxy",
      p: 250
    }
    ]
  }, {
    cat: "Hoeden",
    k: "hat",
    items: [{
      id: "hat_cap",
      n: "Petje",
      p: 20
    }, {
      id: "hat_beanie",
      n: "Muts",
      p: 25
    }, {
      id: "hat_bow",
      n: "Strik",
      p: 15
    }, {
      id: "hat_flower",
      n: "Bloem",
      p: 10
    }, {
      id: "hat_crown",
      n: "Kroon",
      p: 90
    }, {
      id: "hat_wizard",
      n: "Tovenaar",
      p: 150
    }, {
      id: "hat_party",
      n: "Feest",
      p: 40
    }, {
      id: "hat_pirate",
      n: "Piraat",
      p: 60
    }, {
      id: "hat_astro",
      n: "Astronaut",
      p: 200
    }, {
      id: "hat_halo",
      n: "Halo",
      p: 250
    }, {
      id: "hat_bunny",
      n: "Konijnen",
      p: 115
    }, {
      id: "hat_dino",
      n: "Dino",
      p: 150
    }, {
      id: "hat_cloud",
      n: "Wolk",
      p: 140
    }, {
      id: "hat_galaxy",
      n: "Galaxy",
      p: 450
    }, {
      id: "hat_dragon_helm",
      n: "Drakenhelm",
      p: 550
    }
    ]
  }, {
    cat: "Shirts",
    k: "shirt",
    items: [{
      id: "shirt_stripes",
      n: "Strepen",
      p: 15
    }, {
      id: "shirt_heart",
      n: "Hart",
      p: 20
    }, {
      id: "shirt_star",
      n: "Ster",
      p: 20
    }, {
      id: "shirt_nature",
      n: "Natuur",
      p: 25
    }, {
      id: "shirt_cool",
      n: "Cool",
      p: 40
    }, {
      id: "shirt_rainbow",
      n: "Regenboog",
      p: 50
    }, {
      id: "shirt_space",
      n: "Ruimte",
      p: 75
    }, {
      id: "shirt_fire",
      n: "Vuur",
      p: 60
    }, {
      id: "shirt_ice",
      n: "IJs",
      p: 60
    }, {
      id: "shirt_gold",
      n: "Goud",
      p: 125
    }, {
      id: "shirt_cloud",
      n: "Wolken",
      p: 90
    }, {
      id: "shirt_dino",
      n: "Dino",
      p: 115
    }, {
      id: "shirt_cat",
      n: "Kat",
      p: 100
    }, {
      id: "shirt_galaxy",
      n: "Galaxy",
      p: 350
    }, {
      id: "shirt_aurora",
      n: "Aurora",
      p: 480
    }
    ]
  }, {
    cat: "Broeken",
    k: "pants",
    items: [{
      id: "pants_jeans",
      n: "Jeans",
      p: 15
    }, {
      id: "pants_red",
      n: "Rood",
      p: 20
    }, {
      id: "pants_purple",
      n: "Paars",
      p: 20
    }, {
      id: "pants_camo",
      n: "Camo",
      p: 30
    }, {
      id: "pants_star",
      n: "Sterren",
      p: 40
    }, {
      id: "pants_gold",
      n: "Goud",
      p: 90
    }, {
      id: "pants_galaxy",
      n: "Galaxy",
      p: 110
    }, {
      id: "pants_cloud",
      n: "Wolken",
      p: 100
    }, {
      id: "pants_dino",
      n: "Dino",
      p: 125
    }, {
      id: "pants_rainbow",
      n: "Regenboog",
      p: 140
    }, {
      id: "pants_aurora",
      n: "Aurora",
      p: 420
    }
    ]
  }, {
    cat: "Schoenen",
    k: "shoes",
    items: [{
      id: "shoes_sneaker",
      n: "Sneakers",
      p: 15
    }, {
      id: "shoes_boot",
      n: "Laarzen",
      p: 25
    }, {
      id: "shoes_sandal",
      n: "Sandalen",
      p: 10
    }, {
      id: "shoes_rainbow",
      n: "Regenboog",
      p: 50
    }, {
      id: "shoes_gold",
      n: "Goud",
      p: 90
    }, {
      id: "shoes_rocket",
      n: "Raket",
      p: 150
    }, {
      id: "shoes_cloud",
      n: "Wolken",
      p: 110
    }, {
      id: "shoes_star_shoes",
      n: "Sterren",
      p: 140
    }, {
      id: "shoes_dragon",
      n: "Draak",
      p: 250
    }, {
      id: "shoes_galaxy",
      n: "Galaxy",
      p: 380
    }
    ]
  }, {
    cat: "Accessoires",
    k: "acc",
    items: [{
      id: "acc_glasses",
      n: "Bril",
      p: 20
    }, {
      id: "acc_sunglasses",
      n: "Zonnebril",
      p: 30
    }, {
      id: "acc_scarf",
      n: "Sjaal",
      p: 15
    }, {
      id: "acc_necklace",
      n: "Ketting",
      p: 40
    }, {
      id: "acc_cape",
      n: "Cape",
      p: 75
    }, {
      id: "acc_wings",
      n: "Vleugels",
      p: 200
    }, {
      id: "acc_crown_acc",
      n: "Tiara",
      p: 110
    }, {
      id: "acc_fairy_wand",
      n: "Toverstaf",
      p: 150
    }, {
      id: "acc_flower_acc",
      n: "Bloemen",
      p: 90
    }, {
      id: "acc_star_acc",
      n: "Sterren",
      p: 115
    }, {
      id: "acc_rainbow_acc",
      n: "Regenboog",
      p: 175
    }, {
      id: "acc_halo_gold",
      n: "Gouden Halo",
      p: 500
    }, {
      id: "acc_dragon_wings",
      n: "Drakenvleugels",
      p: 600
    }
    ]
  }, {
    cat: "Huisdieren",
    k: "pet",
    items: [{
      id: "pet_cat",
      n: "Kat",
      p: 50
    }, {
      id: "pet_dog",
      n: "Hond",
      p: 50
    }, {
      id: "pet_rabbit",
      n: "Konijn",
      p: 40
    }, {
      id: "pet_hamster",
      n: "Hamster",
      p: 30
    }, {
      id: "pet_fish",
      n: "Vis",
      p: 20
    }, {
      id: "pet_parrot",
      n: "Papegaai",
      p: 60
    }, {
      id: "pet_turtle",
      n: "Schildpad",
      p: 45
    }, {
      id: "pet_pony",
      n: "Pony",
      p: 125
    }, {
      id: "pet_dragon",
      n: "Draak",
      p: 375
    }, {
      id: "pet_unicorn",
      n: "Eenhoorn",
      p: 300
    }, {
      id: "pet_phoenix",
      n: "Feniks",
      p: 500
    }, {
      id: "pet_dino",
      n: "Dino",
      p: 750
    }, {
      id: "pet_fox",
      n: "Vos",
      p: 200
    }, {
      id: "pet_owl",
      n: "Uil",
      p: 240
    }, {
      id: "pet_bear",
      n: "Beer",
      p: 275
    }, {
      id: "pet_penguin",
      n: "Pinguïn",
      p: 215
    }, {
      id: "pet_frog",
      n: "Kikker",
      p: 165
    }, {
      id: "pet_butterfly",
      n: "Vlinder",
      p: 300
    }, {
      id: "pet_wolf",
      n: "Wolf",
      p: 325
    }, {
      id: "pet_lion",
      n: "Leeuw",
      p: 375
    }, {
      id: "pet_galaxy_cat",
      n: "Galaxy Kat",
      p: 600
    }, {
      id: "pet_lava_dragon",
      n: "Lava Draak",
      p: 800
    }, {
      id: "pet_aurora_fox",
      n: "Aurora Vos",
      p: 700
    }, {
      id: "pet_crystal_wolf",
      n: "Kristallen Wolf",
      p: 900
    }, {
      id: "pet_rainbow_pony",
      n: "Regenboog Pony",
      p: 650
    }]
  }].map(grp => /*#__PURE__*/React.createElement("div", {
    key: grp.cat,
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: g,
      fontSize: 11,
      fontWeight: 700,
      marginBottom: 4
    }
  }, grp.cat), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10
    }
  }, grp.items.map(item => {
    const owned = ownedItems.includes(item.id);
    const canBuy = coins >= item.p || item.p === 0;
    return /*#__PURE__*/React.createElement("button", {
      key: item.id,
      style: {
        fontSize: 9,
        padding: "5px 8px",
        borderRadius: 8,
        border: owned ? "2px solid #DC7553" : "1px solid rgba(220,117,83,0.2)",
        background: owned ? "rgba(220,117,83,0.1)" : "white",
        cursor: owned || canBuy ? "pointer" : "default",
        opacity: owned || canBuy ? 1 : 0.35,
        fontFamily: "inherit",
        color: g
      },
      onClick: () => {
        if (owned) {
          const newAv = { ...avatar, [grp.k]: item.id };
          setAvatar(newAv);
          const saveEq = {
            accType, reason, experience, treeName, userName, growth, coins,
            ownedItems, avatar: newAv, letters, diary, seenEx, lastExId, dailyMood,
            totalSessions, wi, lastDay, dailyActions, lastTaskTexts,
            dailyBreaths, lastBreathTime, lastTaskTime, dailyTasks, tasksGenerated, checkinDone,
            lastCheckinDate, streakShields, secretQ, secretA, goals, buddy, moodHistory, petPositions, exPerEx
          };
          try { localStorage.setItem("huxi-profile", JSON.stringify(saveEq)); } catch(e) {}
          if (userKey) firebaseSave(userKey, saveEq);
        } else if (canBuy) {
          if (item.p > 0) setCoins(c => c - item.p);
          const newOwned = [...ownedItems, item.id];
          const newAvatar = { ...avatar, [grp.k]: item.id };
          setOwnedItems(newOwned);
          setAvatar(newAvatar);
          if (grp.k === 'pet') setBuddy(item.id);
          const saveNow = {
            accType, reason, experience, treeName, userName, growth,
            coins: item.p > 0 ? coins - item.p : coins,
            ownedItems: newOwned,
            avatar: newAvatar,
            letters, diary, seenEx, lastExId, dailyMood,
            totalSessions, wi, lastDay, dailyActions, lastTaskTexts,
            dailyBreaths, lastBreathTime, lastTaskTime, dailyTasks, tasksGenerated, checkinDone,
            lastCheckinDate, streakShields, secretQ, secretA, goals, buddy, moodHistory, petPositions, exPerEx
          };
          try { localStorage.setItem("huxi-profile", JSON.stringify(saveNow)); } catch(e) {}
          if (userKey) firebaseSave(userKey, saveNow);
          showWorldReward("shop");
        }
      }
    }, (() => {
      // Mini color preview for items
      const previewColors = {skin_medium:"#D4A574",skin_dark:"#8D6E4C",skin_pale:"#FFE8D0",hair_long:"#5C4033",hair_curly:"#5C4033",hair_spiky:"#5C4033",hair_bun:"#5C4033",hair_mohawk:"#5C4033",hair_pigtails:"#5C4033",hair_afro:"#5C4033",hair_ponytail:"#5C4033",hairc_black:"#1A1A2E",hairc_blonde:"#E6C86E",hairc_red:"#C4553A",hairc_blue:"#4A90C4",hairc_pink:"#FF85A1",hairc_green:"#3D9E6A",hairc_purple:"#9B59B6",hairc_rainbow:"linear-gradient(90deg,#FF6B6B,#FFD93D,#6BCB77,#4D96FF)",hairc_silver:"#BDC3C7",hairc_orange:"#E67E22",hairc_teal:"#1ABC9C",hairc_galaxy:"linear-gradient(135deg,#2C1654,#4A2578)",hat_cap:"#E85D3A",hat_beanie:"#E85D3A",hat_bow:"#FF85A1",hat_flower:"#FF6B6B",hat_crown:"#FFD700",hat_wizard:"#4A3FA5",hat_party:"#FF6347",hat_pirate:"#222",hat_astro:"#C0C0C0",hat_halo:"#FFD700",hat_bunny:"#F0EDE8",hat_dino:"#5C8A4A",hat_cloud:"#E8F0FE",hat_galaxy:"linear-gradient(135deg,#2C1654,#4A2578)",hat_dragon_helm:"#8B2500",shirt_stripes:"#E6A832",shirt_heart:"#E85D75",shirt_star:"#4A90C4",shirt_cool:"#333",shirt_rainbow:"linear-gradient(90deg,#FF6B6B,#FFD93D,#6BCB77)",shirt_nature:"#5CAB7D",shirt_space:"#1A1A2E",shirt_fire:"linear-gradient(0deg,#FF4500,#FFD700)",shirt_ice:"#87CEEB",shirt_gold:"linear-gradient(135deg,#FFD700,#FFA500)",shirt_cloud:"#A8C4D8",shirt_dino:"#5C8A4A",shirt_cat:"#F4A460",shirt_galaxy:"linear-gradient(135deg,#2C1654,#4A2578)",shirt_aurora:"linear-gradient(135deg,#1ABC9C,#9B59B6)",pants_jeans:"#4A6FA5",pants_red:"#C4553A",pants_purple:"#7B4DAA",pants_camo:"#4A5E3A",pants_star:"#2D5A87",pants_gold:"#DAA520",pants_galaxy:"linear-gradient(135deg,#2C1654,#4A2578)",pants_cloud:"#A8C4D8",pants_dino:"#5C8A4A",pants_rainbow:"linear-gradient(90deg,#FF6B6B,#FFD93D,#6BCB77)",pants_aurora:"linear-gradient(135deg,#1ABC9C,#9B59B6)",shoes_sneaker:"#E85D3A",shoes_boot:"#4A3020",shoes_sandal:"#C8A870",shoes_rainbow:"#FF69B4",shoes_gold:"#DAA520",shoes_rocket:"#C4553A",shoes_cloud:"#A8C4D8",shoes_star_shoes:"#FFD700",shoes_dragon:"#8B2500",shoes_galaxy:"linear-gradient(135deg,#2C1654,#4A2578)",acc_glasses:"#333",acc_sunglasses:"#222",acc_scarf:"#E85D3A",acc_necklace:"#FFD700",acc_cape:"#C4553A",acc_wings:"#E8D5FF",acc_crown_acc:"#FFD700",acc_fairy_wand:"#9B59B6",acc_flower_acc:"#FF6B6B",acc_star_acc:"#FFD700",acc_rainbow_acc:"linear-gradient(90deg,#FF6B6B,#FFD93D,#6BCB77)",acc_halo_gold:"#FFD700",acc_dragon_wings:"linear-gradient(0deg,#FF4500,#8B2500)"};
      const bg = previewColors[item.id];
      return bg ? React.createElement("span", {style:{display:"inline-block",width:10,height:10,borderRadius:item.id.startsWith("hair")||item.id.startsWith("skin")?"50%":2,background:bg,marginRight:3,verticalAlign:"middle",border:"1px solid rgba(0,0,0,0.1)"}}) : null;
    })(), item.n, " ", !owned && item.p > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: canBuy ? "#E6A832" : "#999"
      }
    }, "\uD83E\uDE99", item.p), owned && "\u2713");
  })),
  /*#__PURE__*/React.createElement("button", {
    key: "none_" + grp.k,
    style: {
      fontSize: 9, padding: "5px 8px", borderRadius: 8,
      border: avatar[grp.k] === grp.k + "_none" ? "2px solid #E07850" : "1px solid rgba(224,120,80,0.3)",
      background: avatar[grp.k] === grp.k + "_none" ? "rgba(224,120,80,0.1)" : "white",
      cursor: "pointer", fontFamily: "inherit", color: "#E07850"
    },
    onClick: () => {
      setAvatar(a => ({ ...a, [grp.k]: grp.k + "_none" }));
      const newAvReset = { ...avatar, [grp.k]: grp.k + "_none" };
      const saveAR = { accType, reason, experience, treeName, userName, growth, coins, ownedItems, avatar: newAvReset, letters, diary, seenEx, lastExId, dailyMood, totalSessions, wi, lastDay, dailyActions, lastTaskTexts, dailyBreaths, lastBreathTime, lastTaskTime, dailyTasks, tasksGenerated, checkinDone, lastCheckinDate, streakShields, secretQ, secretA, goals, buddy, moodHistory, petPositions, exPerEx, therapistCode, linkedTherapist };
      try { localStorage.setItem("huxi-profile", JSON.stringify(saveAR)); } catch(e) {}
      if (userKey) firebaseSave(userKey, saveAR);
    }
  }, "Geen \u2715"))))
    ),
    /*#__PURE__*/React.createElement("button", {
      className: "mb",
      style: { width: "100%", marginTop: 20, padding: "9px 0", flexShrink: 0 },
      onClick: () => { setShowAvatar(false); setShowShop(false); }
    }, "Sluiten")
  )), showGuide && /*#__PURE__*/React.createElement("div", {
    style: overlay(),
    onClick: () => setShowGuide(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeIn",
    style: modal,
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: g,
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 14,
      textAlign: "center"
    }
  }, "Wat kan je doen? \uD83C\uDF33"), [{
    i: "🌿",
    t: "Dagelijkse taken",
    d: "5 korte opdrachten per dag: ademen, grounding, dankbaarheid, lichaam checken"
  }, {
    i: "🌬️",
    t: "Ademhaling",
    d: "12 bewezen technieken. Beginners worden rustig begeleid."
  }, {
    i: "✉️",
    t: "Brief",
    d: "Tijdcapsule — opens na 30/90/180/365 dagen"
  }, {
    i: "📔",
    t: "Dagboek",
    d: "Even je hart luchten"
  }, {
    i: "🍃",
    t: "Bladeren",
    d: "Tik voor herinneringen"
  }, {
    i: "🌱",
    t: "Boom",
    d: "Groeit langzaam met alles wat je doet. Geen haast."
  }].map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 25,
      padding: "8px 0",
      borderBottom: i < 5 ? "1px solid rgba(61,74,88,0.06)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, item.i), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: g,
      fontSize: 12,
      fontWeight: 700,
      margin: 0
    }
  }, item.t), /*#__PURE__*/React.createElement("p", {
    style: {
      color: g5,
      fontSize: 10,
      margin: 0
    }
  }, item.d)))), /*#__PURE__*/React.createElement("button", {
    className: "mb",
    style: {
      width: "100%",
      marginTop: 35,
      padding: "10px 0"
    },
    onClick: () => setShowGuide(false)
  }, "Begrepen! \uD83C\uDF3F"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 20,
      padding: "10px 12px",
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "sb",
    onClick: () => setShowSett(true)
  }, "\u2699\uFE0F")), showWelcome && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed", inset: 0, zIndex: 100,
      background: "linear-gradient(160deg, #1a3a2a 0%, #0d2418 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column"
    }
  },
    /*#__PURE__*/React.createElement("div", {
      className: "fadeUp",
      style: { textAlign: "center", padding: "0 30px", maxWidth: 340 }
    },
      /*#__PURE__*/React.createElement("div", {
        style: { fontSize: accType === "child" ? 80 : 64, marginBottom: 20, animation: "treeGrow 1.2s ease-out" }
      }, accType === "child" ? "\uD83C\uDF30" : accType === "junior" ? "\uD83C\uDF31" : "\uD83C\uDF3F"),
      /*#__PURE__*/React.createElement("h1", {
        style: { color: "#7ED4A0", fontSize: accType === "child" ? 26 : 22, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }
      },
        accType === "child"
          ? "Hoi " + (userName || userNameIn || "jij") + "! \uD83C\uDF1F"
          : accType === "junior"
          ? "Welkom, " + (userName || userNameIn || "") + " \uD83C\uDF3F"
          : "Welkom, " + (userName || userNameIn || "") + " \uD83C\uDF43"
      ),
      /*#__PURE__*/React.createElement("p", {
        style: { color: "rgba(180,230,200,0.75)", fontSize: accType === "child" ? 15 : 14, lineHeight: 1.7, marginBottom: 24 }
      },
        accType === "child"
          ? "Jouw boom \u201C" + (nameIn.trim() || "Sprout") + "\u201D is net geplant! \uD83C\uDF31 Kom elke dag ademen en kijk hoe hij groeit."
          : accType === "junior"
          ? "Jouw boom \u201C" + (nameIn.trim() || "Mijn Boom") + "\u201D is geplant. Kleine momenten elke dag maken een groot verschil."
          : "Jouw boom \u201C" + (nameIn.trim() || "Mijn Boom") + "\u201D is geplant. Elke ademhaling, elke dag \u2014 zo groeit hij."
      ),
      accType === "child" && /*#__PURE__*/React.createElement("div", {
        style: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }
      },
        ["\uD83D\uDCA7 Ademen", "\uD83C\uDFAF Opdrachten", "\uD83D\uDCD3 Dagboek", "\uD83D\uDECD\uFE0F Winkeltje"].map(tip =>
          /*#__PURE__*/React.createElement("span", {
            key: tip,
            style: {
              background: "rgba(126,212,160,0.12)", border: "1px solid rgba(126,212,160,0.25)",
              borderRadius: 20, padding: "5px 12px", fontSize: 11, color: "rgba(180,230,200,0.8)"
            }
          }, tip)
        )
      ),
      /*#__PURE__*/React.createElement("button", {
        style: {
          background: "linear-gradient(135deg,#DC7553,#70BCBC)", color: "white",
          border: "none", borderRadius: 16, padding: "14px 40px",
          fontSize: accType === "child" ? 16 : 15, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(220,117,83,0.4)"
        },
        onClick: () => setShowWelcome(false)
      },
        accType === "child" ? "Mijn wereld in! \uD83C\uDF33" :
        accType === "junior" ? "Aan de slag \uD83C\uDF3F" :
        "Beginnen \uD83C\uDF43"
      )
    )
  ), showJourney && /*#__PURE__*/React.createElement("div", {
    style: overlay(),
    onClick: () => setShowJourney(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeIn",
    style: { ...modal, maxHeight: "90vh", overflowY: "auto" },
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("h3", {
      style: { color: g, fontSize: 17, fontWeight: 700, textAlign: "center", marginBottom: 4 }
    }, accType === "child" ? "\uD83C\uDF31 Jouw Wereld Groeit!" : accType === "junior" ? "\uD83C\uDF3F Jouw Reis" : "\uD83C\uDF43 Mijn Weg"),

    accType === "child" && /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement("p", { style: { color: "rgba(61,74,88,0.5)", fontSize: 12, textAlign: "center", marginBottom: 16 } },
        "Kijk hoe ver je al gekomen bent!"
      ),
      /*#__PURE__*/React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 25, marginBottom: 16 } },
        [
          ["\uD83C\uDF2C\uFE0F", "Ademhalingen", wi.leaves || 0, "keer"],
          ["\u2705", "Opdrachten", wi.tasks || 0, "gedaan"],
          ["\uD83D\uDCD3", "Dagboeken", wi.dagboeken || 0, "geschreven"],
          ["\uD83D\uDE0A", "Ingecheckt", wi.checkins || 0, "keer"]
        ].map(([ico, lbl, val, unit]) => /*#__PURE__*/React.createElement("div", {
          key: lbl,
          style: { background: "rgba(220,117,83,0.08)", borderRadius: 14, padding: "14px 10px", textAlign: "center" }
        },
          /*#__PURE__*/React.createElement("div", { style: { fontSize: 28, marginBottom: 4 } }, ico),
          /*#__PURE__*/React.createElement("div", { style: { color: "#DC7553", fontSize: 22, fontWeight: 700 } }, val),
          /*#__PURE__*/React.createElement("div", { style: { color: "rgba(61,74,88,0.5)", fontSize: 10 } }, lbl)
        ))
      ),
      moodHistory.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { background: "rgba(220,117,83,0.06)", borderRadius: 14, padding: "12px", marginBottom: 12 }
      },
        /*#__PURE__*/React.createElement("p", { style: { color: g, fontSize: 12, fontWeight: 700, margin: "0 0 8px" } }, "\uD83D\uDFE1 Hoe voelde je je de laatste tijd?"),
        /*#__PURE__*/React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } },
          moodHistory.slice(0, 14).map((entry, i) => {
            const MC = { calm: "#DC7553", ok: "#6BC5A0", restless: "#E6A832", tense: "#D4842A", overwhelmed: "#C4553A", sad: "#A0A0C0" };
            const emoji = entry.mood === "calm" ? "\uD83D\uDE0A" : entry.mood === "ok" ? "\uD83D\uDE42" : entry.mood === "restless" ? "\uD83D\uDE10" : entry.mood === "tense" ? "\uD83D\uDE1F" : "\uD83D\uDE22";
            return /*#__PURE__*/React.createElement("div", {
              key: i,
              title: entry.date,
              style: { fontSize: 18, opacity: 0.6 + (i / moodHistory.length) * 0.4 }
            }, emoji);
          })
        ),
        /*#__PURE__*/React.createElement("p", { style: { color: "rgba(61,74,88,0.35)", fontSize: 10, margin: "6px 0 0" } },
          "Elke emoji is 1 dag \u2014 links is vandaag"
        )
      ),
      /*#__PURE__*/React.createElement("div", {
        style: { background: "linear-gradient(135deg,rgba(112,188,188,0.1),rgba(220,117,83,0.1))", borderRadius: 14, padding: "14px", textAlign: "center" }
      },
        /*#__PURE__*/React.createElement("div", { style: { fontSize: 36, marginBottom: 6 } }, growth > 0.8 ? "\uD83C\uDF33" : growth > 0.5 ? "\uD83C\uDF32" : growth > 0.3 ? "\uD83C\uDF31" : "\uD83C\uDF30"),
        /*#__PURE__*/React.createElement("p", { style: { color: "#DC7553", fontSize: 14, fontWeight: 700, margin: "0 0 2px" } },
          growth > 0.8 ? "Jouw boom is een grote boom!" : growth > 0.5 ? "Jouw boom groeit goed!" : growth > 0.3 ? "Jouw boom groeit!" : "Jouw zaadje groeit!"
        ),
        /*#__PURE__*/React.createElement("p", { style: { color: "rgba(61,74,88,0.4)", fontSize: 11, margin: 0 } },
          "Blijf oefenen en je wereld wordt mooier \uD83C\uDF1F"
        )
      )
    ),

    accType === "junior" && /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement("p", { style: { color: "rgba(61,74,88,0.4)", fontSize: 12, textAlign: "center", marginBottom: 14 } },
        "Jouw persoonlijke overzicht \u2014 voor jou alleen"
      ),
      moodHistory.length >= 3 && /*#__PURE__*/React.createElement("div", {
        style: { background: "rgba(255,255,255,0.8)", borderRadius: 14, padding: "14px", marginBottom: 12 }
      },
        /*#__PURE__*/React.createElement("p", { style: { color: g, fontSize: 12, fontWeight: 700, margin: "0 0 10px" } },
          "\uD83D\uDCC8 Hoe voelde je je de laatste " + Math.min(moodHistory.length, 30) + " dagen"
        ),
        /*#__PURE__*/React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 10, height: 50, marginBottom: 6 } },
          moodHistory.slice(0, 30).reverse().map((entry, i) => {
            const MC = { calm: "#DC7553", ok: "#6BC5A0", restless: "#E6A832", tense: "#D4842A", overwhelmed: "#C4553A", sad: "#A0A0C0" };
            const h = entry.mood === "calm" ? 50 : entry.mood === "ok" ? 40 : entry.mood === "restless" ? 28 : entry.mood === "tense" ? 18 : 10;
            const c = MC[entry.mood] || "#ccc";
            return /*#__PURE__*/React.createElement("div", {
              key: i,
              title: entry.date + ": " + entry.mood,
              style: { flex: 1, height: h, borderRadius: 3, background: c, opacity: 0.75, minWidth: 4 }
            });
          })
        ),
        /*#__PURE__*/React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } },
          /*#__PURE__*/React.createElement("span", { style: { color: "rgba(61,74,88,0.35)", fontSize: 9 } }, moodHistory.length >= 30 ? "30 dagen geleden" : moodHistory.length + " dagen geleden"),
          /*#__PURE__*/React.createElement("span", { style: { color: "rgba(61,74,88,0.35)", fontSize: 9 } }, "vandaag")
        )
      ),
      moodHistory.length < 3 && /*#__PURE__*/React.createElement("div", {
        style: { background: "rgba(220,117,83,0.06)", borderRadius: 14, padding: "16px", textAlign: "center", marginBottom: 12 }
      },
        /*#__PURE__*/React.createElement("p", { style: { color: "rgba(61,74,88,0.5)", fontSize: 13 } },
          "Check elke dag in om je stemming bij te houden \uD83D\uDCC8"
        )
      ),
      /*#__PURE__*/React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 12 } },
        [
          ["\uD83D\uDD25", wi.checkins || 0, "dagen actief"],
          ["\uD83C\uDF2C\uFE0F", wi.leaves || 0, "oefeningen"],
          ["\uD83D\uDCDD", wi.dagboeken || 0, "dagboeken"]
        ].map(([ico, val, lbl]) => /*#__PURE__*/React.createElement("div", {
          key: lbl,
          style: { background: "rgba(220,117,83,0.08)", borderRadius: 12, padding: "12px 6px", textAlign: "center" }
        },
          /*#__PURE__*/React.createElement("div", { style: { fontSize: 22 } }, ico),
          /*#__PURE__*/React.createElement("div", { style: { color: "#DC7553", fontSize: 20, fontWeight: 700 } }, val),
          /*#__PURE__*/React.createElement("div", { style: { color: "rgba(61,74,88,0.4)", fontSize: 9 } }, lbl)
        ))
      ),
      moodHistory.length >= 5 && /*#__PURE__*/React.createElement("div", {
        style: { background: "rgba(220,117,83,0.06)", borderRadius: 12, padding: "12px", marginBottom: 8 }
      },
        /*#__PURE__*/React.createElement("p", { style: { color: g, fontSize: 12, fontWeight: 600, margin: "0 0 4px" } }, "\uD83D\uDCA1 Inzicht"),
        /*#__PURE__*/React.createElement("p", { style: { color: "rgba(61,74,88,0.6)", fontSize: 12, margin: 0, lineHeight: 1.5 } }, (() => {
          const calmCount = moodHistory.filter(e => e.mood === "calm" || e.mood === "ok").length;
          const pct = Math.round(calmCount / moodHistory.length * 100);
          return pct >= 60 ? "Je voelt je de meeste dagen rustig of oké. Dat is knap." : pct >= 40 ? "Je hebt goede en zwaardere dagen. Dat hoort erbij." : "Je hebt het momenteel niet makkelijk. Blijf kleine stappen zetten.";
        })())
      )
    ),

    (accType === "adult" || accType === "therapist") && /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement("p", { style: { color: "rgba(61,74,88,0.4)", fontSize: 12, textAlign: "center", marginBottom: 14 } },
        "Een eerlijk beeld van jouw weg \u2014 zonder oordeel"
      ),
      moodHistory.length >= 3 && /*#__PURE__*/React.createElement("div", {
        style: { background: "rgba(255,255,255,0.8)", borderRadius: 14, padding: "16px", marginBottom: 12 }
      },
        /*#__PURE__*/React.createElement("p", { style: { color: g, fontSize: 13, fontWeight: 700, margin: "0 0 12px" } },
          "Stemming \u2014 laatste " + Math.min(moodHistory.length, 30) + " check-ins"
        ),
        /*#__PURE__*/React.createElement("div", { style: { position: "relative", height: 60, marginBottom: 8 } },
          /*#__PURE__*/React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 5, height: "100%", position: "absolute", inset: 0 } },
            moodHistory.slice(0, 30).reverse().map((entry, i) => {
              const MC = { calm: "#DC7553", ok: "#6BC5A0", restless: "#E6A832", tense: "#D4842A", overwhelmed: "#C4553A", sad: "#A0A0C0" };
              const h = entry.mood === "calm" ? 100 : entry.mood === "ok" ? 78 : entry.mood === "restless" ? 52 : entry.mood === "tense" ? 32 : 15;
              return /*#__PURE__*/React.createElement("div", {
                key: i,
                title: entry.date,
                style: { flex: 1, height: h + "%", borderRadius: "3px 3px 0 0", background: MC[entry.mood] || "#ccc", opacity: 0.7, minWidth: 5 }
              });
            })
          )
        ),
        /*#__PURE__*/React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } },
          /*#__PURE__*/React.createElement("span", { style: { color: "rgba(61,74,88,0.35)", fontSize: 10 } }, moodHistory.length >= 30 ? "30 dagen geleden" : moodHistory.length + "d geleden"),
          /*#__PURE__*/React.createElement("span", { style: { color: "rgba(61,74,88,0.35)", fontSize: 10 } }, "vandaag")
        ),
        /*#__PURE__*/React.createElement("div", { style: { display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" } },
          [["#DC7553","Rustig"],["#6BC5A0","Oké"],["#E6A832","Onrustig"],["#D4842A","Gespannen"],["#C4553A","Overweldigd"]].map(([c,l]) =>
            /*#__PURE__*/React.createElement("div", { key: l, style: { display: "flex", alignItems: "center", gap: 10 } },
              /*#__PURE__*/React.createElement("div", { style: { width: 8, height: 8, borderRadius: 2, background: c } }),
              /*#__PURE__*/React.createElement("span", { style: { color: "rgba(61,74,88,0.4)", fontSize: 9 } }, l)
            )
          )
        )
      ),
      moodHistory.length < 3 && /*#__PURE__*/React.createElement("div", {
        style: { background: "rgba(220,117,83,0.06)", borderRadius: 14, padding: "20px", textAlign: "center", marginBottom: 12 }
      },
        /*#__PURE__*/React.createElement("p", { style: { color: "rgba(61,74,88,0.5)", fontSize: 13, lineHeight: 1.5 } },
          "Check elke dag even in om na een paar dagen je stemming als grafiek te zien."
        )
      ),
      moodHistory.length >= 7 && /*#__PURE__*/React.createElement("div", {
        style: { background: "rgba(220,117,83,0.06)", borderRadius: 14, padding: "14px", marginBottom: 12 }
      },
        /*#__PURE__*/React.createElement("p", { style: { color: g, fontSize: 13, fontWeight: 600, margin: "0 0 6px" } }, "\uD83D\uDCA1 Patroon"),
        /*#__PURE__*/React.createElement("p", { style: { color: "rgba(61,74,88,0.6)", fontSize: 13, margin: 0, lineHeight: 1.6 } }, (() => {
          const recent7 = moodHistory.slice(0, 7);
          const calmCount = recent7.filter(e => e.mood === "calm" || e.mood === "ok").length;
          const allTime = moodHistory.filter(e => e.mood === "calm" || e.mood === "ok").length;
          const trend = calmCount > allTime / moodHistory.length * 7;
          return trend
            ? "De laatste week voelde je je vaker rustig dan gemiddeld. Dat is een mooie beweging."
            : "Elke zwaardere periode hoort bij het proces. Kleine stappen tellen.";
        })())
      ),
      /*#__PURE__*/React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 25, marginBottom: 12 } },
        [
          ["\uD83C\uDF2C\uFE0F", wi.leaves || 0, "oefeningen"],
          ["\u2705", wi.tasks || 0, "opdrachten"],
          ["\uD83D\uDCD3", wi.dagboeken || 0, "dagboeken"],
          ["\uD83D\uDD25", wi.streakDays || 0, "dagen actief"]
        ].map(([ico, val, lbl]) => /*#__PURE__*/React.createElement("div", {
          key: lbl,
          style: { background: "rgba(220,117,83,0.06)", borderRadius: 12, padding: "12px", textAlign: "center" }
        },
          /*#__PURE__*/React.createElement("div", { style: { fontSize: 22 } }, ico),
          /*#__PURE__*/React.createElement("div", { style: { color: "#DC7553", fontSize: 22, fontWeight: 700 } }, val),
          /*#__PURE__*/React.createElement("div", { style: { color: "rgba(61,74,88,0.4)", fontSize: 10 } }, lbl)
        ))
      ),
      letters.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: { background: "rgba(220,117,83,0.06)", borderRadius: 12, padding: "12px" }
      },
        /*#__PURE__*/React.createElement("p", { style: { color: g, fontSize: 12, fontWeight: 600, margin: "0 0 6px" } }, "\u2709\uFE0F Jouw brieven"),
        letters.map((l, i) => {
          const unlockTime = l.unlockDate ? new Date(l.unlockDate).getTime() : 0;
          const locked = Date.now() < unlockTime;
          const dl = locked ? Math.ceil((unlockTime - Date.now()) / 86400000) : 0;
          return /*#__PURE__*/React.createElement("div", {
            key: l.id,
            style: { display: "flex", alignItems: "center", gap: 20, padding: "6px 0", borderBottom: i < letters.length - 1 ? "1px solid rgba(61,74,88,0.06)" : "none" }
          },
            /*#__PURE__*/React.createElement("span", { style: { fontSize: 16 } }, locked ? "\uD83D\uDD12" : "\uD83D\uDCEC"),
            /*#__PURE__*/React.createElement("span", { style: { flex: 1, color: "rgba(61,74,88,0.5)", fontSize: 11 } }, l.date),
            /*#__PURE__*/React.createElement("span", { style: { color: locked ? "#E6A832" : "#DC7553", fontSize: 10, fontWeight: 600 } }, locked ? "Nog " + dl + " dagen" : "Open")
          );
        })
      )
    ),

    /*#__PURE__*/React.createElement("button", {
      className: "mb",
      style: { width: "100%", marginTop: 40, padding: "10px 0" },
      onClick: () => setShowJourney(false)
    }, "Sluiten")
  )), showGoals && /*#__PURE__*/React.createElement("div", {
    style: overlay(),
    onClick: () => setShowGoals(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeIn",
    style: { ...modal, maxHeight: "88vh", overflowY: "auto" },
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("h3", { style: { color: g, fontSize: 17, fontWeight: 700, textAlign: "center", marginBottom: 4 } }, "\uD83C\uDFAF Mijn Doelen"),
    /*#__PURE__*/React.createElement("p", { style: { color: "rgba(61,74,88,0.45)", fontSize: 12, textAlign: "center", marginBottom: 14, lineHeight: 1.5 } },
      "Schrijf je doelen op en kies wanneer je ze wil heropenen. Ze gaan op slot \u2014 zo wordt het een echte verrassing."
    ),
    (() => {
      const PERIODS = [
        { days: 90, label: "Over 3 maanden" },
        { days: 180, label: "Over 6 maanden" },
        { days: 365, label: "Over 1 jaar" },
        { days: 548, label: "Over 1,5 jaar" }
      ];
      const canAdd = goals.filter(g2 => !g2.unlockDate || Date.now() >= new Date(g2.unlockDate).getTime()).length < 2 || goals.length === 0;
      const draft = goalDraftText;
      const setDraft = setGoalDraftText;
      const period = goalPeriod;
      const setPeriod = setGoalPeriod;
      const openGoals = goals.filter(g2 => !g2.unlockDate || Date.now() >= new Date(g2.unlockDate).getTime());
      const lockedGoals = goals.filter(g2 => g2.unlockDate && Date.now() < new Date(g2.unlockDate).getTime());
      return /*#__PURE__*/React.createElement(React.Fragment, null,
        goals.length < 4 && /*#__PURE__*/React.createElement("div", { style: { marginBottom: 14 } },
          /*#__PURE__*/React.createElement("textarea", {
            className: "ta",
            placeholder: "Wat wil jij bereiken? Schrijf het hier...",
            value: draft,
            onChange: e => setDraft(e.target.value),
            rows: 3,
            style: { marginBottom: 10 }
          }),
          /*#__PURE__*/React.createElement("p", { style: { color: g, fontSize: 12, fontWeight: 600, margin: "0 0 8px" } }, "Wanneer wil je dit doel heropenen?"),
          /*#__PURE__*/React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 12 } },
            PERIODS.map(p => /*#__PURE__*/React.createElement("button", {
              key: p.days,
              onClick: () => setPeriod(p.days),
              style: {
                padding: "10px 6px", borderRadius: 12, fontSize: 11, fontWeight: 600, cursor: "pointer",
                border: period === p.days ? "2px solid #DC7553" : "2px solid rgba(220,117,83,0.2)",
                background: period === p.days ? "rgba(220,117,83,0.1)" : "white",
                color: g
              }
            }, p.label))
          ),
          /*#__PURE__*/React.createElement("button", {
            className: "mb",
            style: { width: "100%", padding: "11px 0", opacity: draft.trim() ? 1 : 0.4 },
            onClick: () => {
              if (!draft.trim()) return;
              const unlockDate = new Date();
              unlockDate.setDate(unlockDate.getDate() + period);
              const newGoal = {
                text: draft.trim(),
                date: new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }),
                unlockDate: unlockDate.toISOString(),
                unlockDays: period,
                id: Date.now()
              };
              const newGoals = [newGoal, ...goals];
              setGoals(newGoals);
              setDraft("");
              const saveG = { accType, reason, experience, treeName, userName, growth, coins, ownedItems, avatar, letters, diary, seenEx, lastExId, dailyMood, totalSessions, wi, lastDay, dailyActions, lastTaskTexts, dailyBreaths, lastBreathTime, lastTaskTime, dailyTasks, tasksGenerated, checkinDone, lastCheckinDate, streakShields, secretQ, secretA, goals: newGoals, buddy, moodHistory, petPositions, exPerEx, therapistCode, linkedTherapist };
              try { localStorage.setItem("huxi-profile", JSON.stringify(saveG)); } catch(e2) {}
              if (userKey) firebaseSave(userKey, saveG);
            }
          }, draft.trim() ? "Doel bewaren \uD83C\uDFAF" : "Schrijf eerst je doel...")
        ),
        goals.length >= 4 && /*#__PURE__*/React.createElement("p", {
          style: { color: "rgba(61,74,88,0.4)", fontSize: 12, textAlign: "center", marginBottom: 14 }
        }, "Je hebt al 4 doelen bewaard."),
        lockedGoals.length > 0 && /*#__PURE__*/React.createElement("div", { style: { marginBottom: 12 } },
          /*#__PURE__*/React.createElement("p", { style: { color: g, fontSize: 13, fontWeight: 700, margin: "0 0 8px" } }, "\uD83D\uDD12 Op slot"),
          lockedGoals.map(goal => {
            const unlockTime = new Date(goal.unlockDate).getTime();
            const dl = Math.ceil((unlockTime - Date.now()) / 86400000);
            const months = Math.round(dl / 30);
            return /*#__PURE__*/React.createElement("div", {
              key: goal.id,
              style: { background: "rgba(61,74,88,0.04)", borderRadius: 14, padding: "14px", marginBottom: 8, border: "1px dashed rgba(61,74,88,0.12)" }
            },
              /*#__PURE__*/React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 20, marginBottom: 6 } },
                /*#__PURE__*/React.createElement("span", { style: { fontSize: 20 } }, "\uD83D\uDD12"),
                /*#__PURE__*/React.createElement("span", { style: { color: "rgba(61,74,88,0.35)", fontSize: 11 } }, "Geschreven op " + goal.date),
                /*#__PURE__*/React.createElement("span", { style: { marginLeft: "auto", color: "#E6A832", fontSize: 11, fontWeight: 700 } },
                  dl <= 30 ? "Nog " + dl + " dagen" : "Nog " + months + " maanden"
                )
              ),
              /*#__PURE__*/React.createElement("p", { style: { color: "rgba(61,74,88,0.3)", fontSize: 13, margin: 0, fontStyle: "italic" } },
                "Dit doel is verborgen tot " + new Date(goal.unlockDate).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
              )
            );
          })
        ),
        openGoals.length > 0 && /*#__PURE__*/React.createElement("div", null,
          /*#__PURE__*/React.createElement("p", { style: { color: g, fontSize: 13, fontWeight: 700, margin: "0 0 8px" } }, "\uD83D\uDCEC Geopend"),
          openGoals.map(goal => /*#__PURE__*/React.createElement("div", {
            key: goal.id,
            style: { background: "rgba(220,117,83,0.06)", borderRadius: 14, padding: "12px 14px", marginBottom: 8, border: "1px solid rgba(220,117,83,0.15)" }
          },
            /*#__PURE__*/React.createElement("p", { style: { color: "rgba(61,74,88,0.35)", fontSize: 10, margin: "0 0 4px" } }, goal.date),
            /*#__PURE__*/React.createElement("p", { style: { color: g, fontSize: 13, margin: "0 0 6px", lineHeight: 1.5 } }, goal.text),
            /*#__PURE__*/React.createElement("button", {
              style: { background: "none", border: "none", color: "rgba(61,74,88,0.3)", fontSize: 10, cursor: "pointer", padding: 0 },
              onClick: () => {
                const newGoals = goals.filter(x => x.id !== goal.id);
                setGoals(newGoals);
                const saveG = { accType, reason, experience, treeName, userName, growth, coins, ownedItems, avatar, letters, diary, seenEx, lastExId, dailyMood, totalSessions, wi, lastDay, dailyActions, lastTaskTexts, dailyBreaths, lastBreathTime, lastTaskTime, dailyTasks, tasksGenerated, checkinDone, lastCheckinDate, streakShields, secretQ, secretA, goals: newGoals, buddy, moodHistory, petPositions, exPerEx, therapistCode, linkedTherapist };
                try { localStorage.setItem("huxi-profile", JSON.stringify(saveG)); } catch(e2) {}
                if (userKey) firebaseSave(userKey, saveG);
              }
            }, "Verwijderen")
          ))
        )
      );
    })(),
    /*#__PURE__*/React.createElement("button", {
      className: "mb",
      style: { width: "100%", padding: "10px 0", marginTop: 30 },
      onClick: () => setShowGoals(false)
    }, "Sluiten")
  )), showDeleteConfirm && /*#__PURE__*/React.createElement("div", {
    style: { ...overlay(), background: "rgba(0,0,0,0.6)" },
    onClick: () => setShowDeleteConfirm(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeIn",
    style: { ...modal, textAlign: "center" },
    onClick: e => e.stopPropagation()
  },
    /*#__PURE__*/React.createElement("div", { style: { fontSize: 40, marginBottom: 12 } }, "\uD83D\uDDD1\uFE0F"),
    /*#__PURE__*/React.createElement("h3", { style: { color: "#E07850", fontSize: 18, fontWeight: 700, margin: "0 0 8px" } }, "Account verwijderen"),
    /*#__PURE__*/React.createElement("p", { style: { color: g, fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 } },
      "Ben je zeker? Je boom, voortgang en alles wat je geschreven hebt wordt definitief verwijderd."
    ),
    /*#__PURE__*/React.createElement("div", { style: { display: "flex", gap: 25 } },
      /*#__PURE__*/React.createElement("button", {
        style: { flex: 1, background: "none", border: "1px solid rgba(61,74,88,0.2)", borderRadius: 12, padding: "12px 0", color: g, fontSize: 13, cursor: "pointer" },
        onClick: () => setShowDeleteConfirm(false)
      }, "Annuleren"),
      /*#__PURE__*/React.createElement("button", {
        style: { flex: 1, background: "#E07850", border: "none", borderRadius: 12, padding: "12px 0", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" },
        onClick: async () => {
          if (userKey) {
            try { await fetch(FIREBASE_URL + "/users/" + userKey + ".json", { method: "DELETE" }); } catch(e) {}
          }
          try { localStorage.removeItem("huxi-profile"); } catch(e) {}
          setShowDeleteConfirm(false); setShowSett(false);
          setPhase("login"); setAccType(null); setUserKey(""); setLoginName(""); setLoginPin("");
          setGrowth(0.01); setCoins(0); setLetters([]); setDiary([]);
          setWi({ leaves:0,flowers:0,grass:0,stones:0,shrooms:0,bushes:0,streakDays:0,brieven:0,dagboeken:0,tools:0,checkins:0,tasks:0 });
        }
      }, "Ja, verwijder alles")
    )
  )), showSett && /*#__PURE__*/React.createElement("div", {
    style: overlay(),
    onClick: () => setShowSett(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeIn",
    style: {
      ...modal,
      width: 270
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: g,
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 16,
      textAlign: "center"
    }
  }, "Instellingen"), [["Geluid", /*#__PURE__*/React.createElement("button", {
    key: "so",
    className: "tb",
    onClick: () => setSoundOn(s => !s)
  }, soundOn ? "\uD83D\uDD0A Aan" : "\uD83D\uDD07 Uit")],
  ["Account", /*#__PURE__*/React.createElement("button", {
    key: "a",
    className: "tb",
    onClick: () => {
          try { localStorage.removeItem("huxi-profile"); } catch(e) {}
          setPhase("login");
          setAccType(null);
          setCheckinDone(false);
          setUserKey("");
          setLoginName("");
          setLoginPin("");
          setBuddy("pet_none");
          setGoals([]);
          setStreakShields(0);
          setLastCheckinDate("");
          setOwnedItems(["hat_none","shirt_none","pants_none","shoes_none","skin_light","hair_short","hairc_brown","acc_none","pet_none"]);
          setAvatar({ hat:"hat_none", shirt:"shirt_none", pants:"pants_none", shoes:"shoes_none", skin:"skin_light", hair:"hair_short", hairc:"hairc_brown", acc:"acc_none", pet:"pet_none" });
          setLetters([]);
          setDiary([]);
          setGrowth(0.01);
          setCoins(0);
          setWi({ leaves:0, flowers:0, grass:0, stones:0, shrooms:0, bushes:0, streakDays:0, brieven:0, dagboeken:0, tools:0, checkins:0, tasks:0 });
          setTotalSessions(0);
          setSeenEx([]);
          setLastTaskTexts([]);
        }
  }, "Uitloggen")],
  // Therapeut koppeling in instellingen
  accType === "therapist" ? ["Mijn koppelcode", /*#__PURE__*/React.createElement("button", {
    key: "tc",
    className: "tb",
    onClick: async () => {
      if (therapistCode) { setLinkMsg("Je code: " + therapistCode); return; }
      setLinkMsg("Code aanmaken...");
      var code = await therapistRegister(userKey, userName);
      if (code) { setTherapistCode(code); setLinkMsg("Je code: " + code); saveData(); }
      else setLinkMsg("Fout bij aanmaken");
    }
  }, therapistCode ? "\uD83D\uDD11 " + therapistCode : "\uD83D\uDD11 Code aanmaken")] :
  ["Therapeut koppelen", /*#__PURE__*/React.createElement("div", { key: "tl", style: { display: "flex", gap: 6, alignItems: "center" } },
    linkedTherapist
      ? /*#__PURE__*/React.createElement("button", { className: "tb", style: { color: "#E07850", fontSize: 11 }, onClick: async () => {
          await clientUnlinkTherapist(userKey, linkedTherapist);
          setLinkedTherapist(null); setLinkMsg("Ontkoppeld"); saveData();
        } }, "\u274C Ontkoppelen")
      : /*#__PURE__*/React.createElement(React.Fragment, null,
          /*#__PURE__*/React.createElement("input", { type: "text", maxLength: 6, placeholder: "Code", value: linkInput,
            onChange: e => setLinkInput(e.target.value.replace(/\D/g, "")),
            style: { width: 70, padding: "6px 8px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, textAlign: "center" }
          }),
          /*#__PURE__*/React.createElement("button", { className: "tb", style: { fontSize: 11 }, onClick: async () => {
            if (linkInput.length !== 6) { setLinkMsg("Vul 6 cijfers in"); return; }
            setLinkMsg("Koppelen...");
            var th = await therapistLookup(linkInput);
            if (!th) { setLinkMsg("Code niet gevonden"); return; }
            var ok = await clientLinkToTherapist(userKey, linkInput);
            if (ok) { setLinkedTherapist(linkInput); setLinkMsg("Gekoppeld aan " + th.name); setLinkInput(""); saveData(); }
            else setLinkMsg("Koppeling mislukt");
          } }, "\u2705 Koppel"))
  )],
  linkMsg ? ["", /*#__PURE__*/React.createElement("span", { key: "lm", style: { fontSize: 11, color: "#70BCBC" } }, linkMsg)] : null,
  accType === "therapist" ? ["Dashboard", /*#__PURE__*/React.createElement("button", {
    key: "td",
    className: "tb",
    onClick: () => { setShowTherapistPanel(true); setShowSett(false); }
  }, "\uD83D\uDCCA Cliënten bekijken")] : null,
  ["Nieuw begin", /*#__PURE__*/React.createElement("button", {
    key: "del",
    className: "tb",
    style: { color: "#E07850" },
    onClick: () => setShowDeleteConfirm(true)
  }, "\uD83D\uDDD1\uFE0F Verwijderen")]].filter(Boolean).map(([l, ctrl], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 0",
      borderBottom: "1px solid rgba(61,74,88,0.08)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: g,
      fontSize: 13
    }
  }, l), ctrl)), /*#__PURE__*/React.createElement("button", {
    className: "mb",
    style: {
      width: "100%",
      marginTop: 45,
      padding: "11px 0"
    },
    onClick: () => setShowSett(false)
  }, "Sluiten"))),

  // ═══ THERAPEUT DASHBOARD ═══
  showTherapistPanel && /*#__PURE__*/React.createElement("div", {
    style: { ...F, background: "rgba(0,0,0,0.5)", zIndex: 800, display: "flex", alignItems: "center", justifyContent: "center" },
    onClick: () => setShowTherapistPanel(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: { background: "#fff", borderRadius: 20, padding: 24, width: "90%", maxWidth: 380, maxHeight: "80vh", overflowY: "auto" },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", { style: { color: g, fontSize: 18, fontWeight: 700, marginBottom: 4, textAlign: "center" } }, "\uD83D\uDCCA Cliënten Dashboard"),
    /*#__PURE__*/React.createElement("p", { style: { color: g5, fontSize: 12, textAlign: "center", marginBottom: 16 } }, therapistCode ? "Koppelcode: " + therapistCode : "Nog geen koppelcode"),
    !therapistLoading && therapistClients.length === 0 && /*#__PURE__*/React.createElement("p", { style: { color: g5, fontSize: 13, textAlign: "center", padding: "20px 0" } }, "Nog geen cliënten gekoppeld. Deel je koppelcode met cliënten zodat zij zich kunnen verbinden."),
    therapistLoading && /*#__PURE__*/React.createElement("p", { style: { color: g5, fontSize: 13, textAlign: "center" } }, "Laden..."),
    therapistClients.map((cl, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: { background: "#F5F7FA", borderRadius: 14, padding: 14, marginBottom: 10 }
    },
      /*#__PURE__*/React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 } },
        /*#__PURE__*/React.createElement("span", { style: { fontWeight: 700, color: g, fontSize: 14 } }, cl.name),
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 11, color: cl.lastDay === new Date().toDateString() ? "#70BCBC" : "#E07850" } }, cl.lastDay === new Date().toDateString() ? "\u2705 Vandaag actief" : "\u23F0 " + (cl.lastDay || "Niet actief"))
      ),
      /*#__PURE__*/React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 11, color: g5, background: "#fff", borderRadius: 8, padding: "3px 8px" } },
          "\uD83D\uDE42 " + (cl.mood === "calm" ? "Kalm" : cl.mood === "ok" ? "Oké" : cl.mood === "restless" ? "Rusteloos" : cl.mood === "tense" ? "Gespannen" : cl.mood === "overwhelmed" ? "Overweldigd" : "Geen check-in")),
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 11, color: g5, background: "#fff", borderRadius: 8, padding: "3px 8px" } },
          "\uD83C\uDF2C\uFE0F " + cl.sessions + " sessies"),
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 11, color: g5, background: "#fff", borderRadius: 8, padding: "3px 8px" } },
          "\uD83C\uDF31 " + Math.round(cl.growth * 100) + "% groei"),
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 11, color: g5, background: "#fff", borderRadius: 8, padding: "3px 8px" } },
          "\uD83D\uDCA7 " + cl.dailyBreaths + "x geademd vandaag")
      ),
      cl.moodHistory && cl.moodHistory.length > 0 && /*#__PURE__*/React.createElement("div", { style: { marginTop: 8, display: "flex", gap: 3, alignItems: "flex-end" } },
        /*#__PURE__*/React.createElement("span", { style: { fontSize: 10, color: g5, marginRight: 4 } }, "Stemming:"),
        cl.moodHistory.filter(m => m.type === "daily").slice(-7).map((m, j) => /*#__PURE__*/React.createElement("div", {
          key: j,
          style: { width: 8, height: m.mood === "calm" ? 20 : m.mood === "ok" ? 16 : m.mood === "restless" ? 12 : m.mood === "tense" ? 8 : 4,
            background: m.mood === "calm" ? "#70BCBC" : m.mood === "ok" ? "#70BCBC" : m.mood === "restless" ? "#E8A840" : m.mood === "tense" ? "#E07850" : "#DC7553",
            borderRadius: 3, opacity: 0.8 }
        }))
      )
    )),
    /*#__PURE__*/React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } },
      /*#__PURE__*/React.createElement("button", {
        className: "mb",
        style: { flex: 1, padding: "10px 0" },
        onClick: async () => {
          if (!therapistCode) return;
          setTherapistLoading(true);
          var cls = await therapistLoadClients(therapistCode);
          setTherapistClients(cls);
          setTherapistLoading(false);
        }
      }, "\uD83D\uDD04 Vernieuwen"),
      /*#__PURE__*/React.createElement("button", {
        className: "mb",
        style: { flex: 1, padding: "10px 0" },
        onClick: () => setShowTherapistPanel(false)
      }, "Sluiten")
    )
  )),

  // ═══ SOS NOODKNOP ═══
  sosActive && /*#__PURE__*/React.createElement("div", {
    style: { ...F, background: "linear-gradient(160deg, #1A2B3A 0%, #162430 100%)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 30 }
  },
    /*#__PURE__*/React.createElement("div", { style: { textAlign: "center", maxWidth: 340 } },
      /*#__PURE__*/React.createElement("span", { style: { fontSize: 48 } }, ["\uD83D\uDC41\uFE0F", "\uD83D\uDC42", "\u270B", "\uD83D\uDC43", "\uD83D\uDC45"][sosStep] || "\uD83C\uDF1F"),
      /*#__PURE__*/React.createElement("h2", { style: { color: "#fff", fontSize: 22, fontWeight: 700, margin: "16px 0 8px" } },
        sosStep === 0 ? "Noem 5 dingen die je ZIET" :
        sosStep === 1 ? "Noem 4 dingen die je HOORT" :
        sosStep === 2 ? "Noem 3 dingen die je VOELT" :
        sosStep === 3 ? "Noem 2 dingen die je RUIKT" :
        sosStep === 4 ? "Noem 1 ding dat je PROEFT" :
        "Je bent hier. Je bent veilig."
      ),
      /*#__PURE__*/React.createElement("p", { style: { color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 30 } },
        sosStep < 5 ? "Neem de tijd. Adem rustig." : "De storm gaat voorbij. Jij bent sterker."
      ),
      sosStep < 5
        ? /*#__PURE__*/React.createElement("button", {
            onClick: () => {
              setSosStep(sosStep + 1);
              if (sosStep < 4) breathAudio.sosTone(3);
              else breathAudio.done();
            },
            style: { padding: "14px 40px", borderRadius: 50, background: "linear-gradient(135deg,#70BCBC,#DC7553)", color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer" }
          }, "Volgende \u2192")
        : /*#__PURE__*/React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" } },
            /*#__PURE__*/React.createElement("button", {
              onClick: () => { setSosActive(false); setSosStep(0); breathAudio.stopAll(); },
              style: { padding: "14px 30px", borderRadius: 50, background: "#70BCBC", color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }
            }, "\uD83C\uDF3F Ik voel me beter"),
            /*#__PURE__*/React.createElement("button", {
              onClick: () => { setSosStep(0); breathAudio.sosTone(4); },
              style: { padding: "14px 30px", borderRadius: 50, background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }
            }, "\uD83D\uDD04 Nog een keer")
          )
    )
  ),

  // SOS knop — altijd zichtbaar in world
  phase === "world" && !showEx && !sosActive && /*#__PURE__*/React.createElement("button", {
    onClick: () => { setSosActive(true); setSosStep(0); breathAudio.sosTone(4); },
    style: { position: "absolute", top: 12, left: 12, zIndex: 50, width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#DC7553,#E07850)", color: "#fff", fontSize: 14, fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 2px 8px rgba(220,117,83,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }
  }, "SOS"));
}
// Render de HUXI app
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(HuxiApp));
