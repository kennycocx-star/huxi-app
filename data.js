// ================================================================
// HUXI App — Data
// ACCS: account type definities (kind, junior, volwassene, therapeut)
// EX: alle ademhalingsoefeningen met parameters
// ================================================================

const ACCS = [{
  id: "child",
  label: "Kinderen",
  age: "6–11",
  emoji: "🌱",
  desc: "Speels en vriendelijk"
}, {
  id: "junior",
  label: "Junior",
  age: "12–17",
  emoji: "🌿",
  desc: "Ontdek en groei"
}, {
  id: "adult",
  label: "Volwassenen",
  age: "18+",
  emoji: "🌳",
  desc: "Rust en reflectie"
}, {
  id: "therapist",
  label: "Therapeut",
  age: "",
  emoji: "🔬",
  desc: "Begeleid je cliënten"
}];
const REASONS_A = [{
  id: "stress",
  l: "Stress en spanning",
  e: "😰"
}, {
  id: "burnout",
  l: "Burnout",
  e: "🔥"
}, {
  id: "panic",
  l: "Paniekaanvallen of angst",
  e: "💨"
}, {
  id: "sleep",
  l: "Beter slapen",
  e: "🌙"
}, {
  id: "calm",
  l: "Meer rust in mijn hoofd",
  e: "🧠"
}, {
  id: "overstim",
  l: "Overprikkeling",
  e: "⚡"
}, {
  id: "curious",
  l: "Gewoon nieuwsgierig",
  e: "🌿"
}];
const REASONS_C = [{
  id: "worried",
  l: "Ik maak me soms zorgen",
  e: "🌧️"
}, {
  id: "angry",
  l: "Ik word soms boos of verdrietig",
  e: "🌪️"
}, {
  id: "sleep",
  l: "Ik kan soms niet goed slapen",
  e: "🌙"
}, {
  id: "busy",
  l: "Alles gaat soms te snel",
  e: "🎢"
}, {
  id: "curious",
  l: "Ik wil gewoon leren ontspannen!",
  e: "🌈"
}];
const REASONS_J = [{
  id: "stress",
  l: "Stress (school, thuis, etc.)",
  e: "😰"
}, {
  id: "anxiety",
  l: "Onrustig of angstig gevoel",
  e: "💨"
}, {
  id: "sleep",
  l: "Moeite met slapen",
  e: "🌙"
}, {
  id: "overstim",
  l: "Te veel prikkels",
  e: "⚡"
}, {
  id: "calm",
  l: "Meer rust in mijn hoofd",
  e: "🧠"
}, {
  id: "curious",
  l: "Gewoon kijken wat het is",
  e: "🌿"
}];
const MA = [{
  id: "calm",
  l: "Rustig",
  c: "#70BCBC"
}, {
  id: "ok",
  l: "Oké",
  c: "#6BC5A0"
}, {
  id: "restless",
  l: "Onrustig",
  c: "#E6A832"
}, {
  id: "tense",
  l: "Gespannen",
  c: "#D4842A"
}, {
  id: "overwhelmed",
  l: "Overweldigd",
  c: "#C4553A"
}];
const MJ = [{
  id: "calm",
  l: "Chill",
  c: "#70BCBC"
}, {
  id: "ok",
  l: "Gaat wel",
  c: "#6BC5A0"
}, {
  id: "restless",
  l: "Beetje stress",
  c: "#E6A832"
}, {
  id: "tense",
  l: "Niet zo lekker",
  c: "#D4842A"
}, {
  id: "overwhelmed",
  l: "Echt niet oké",
  c: "#C4553A"
}];
const MCH = [{
  id: "calm",
  l: "Blij",
  c: "#70BCBC",
  a: "🐰"
}, {
  id: "ok",
  l: "Gaat wel",
  c: "#6BC5A0",
  a: "🦊"
}, {
  id: "restless",
  l: "Beetje raar",
  c: "#E6A832",
  a: "🐿️"
}, {
  id: "tense",
  l: "Niet fijn",
  c: "#D4842A",
  a: "🦉"
}, {
  id: "overwhelmed",
  l: "Heel moeilijk",
  c: "#C4553A",
  a: "🐻"
}];
const EXPLVL = [{
  id: "none",
  l: "Nee, helemaal nieuw",
  e: "🌱"
}, {
  id: "some",
  l: "Een beetje",
  e: "🌿"
}, {
  id: "experienced",
  l: "Ja, ik heb ervaring",
  e: "🌳"
}];
const CQ = ["Hoe voel je je vandaag?", "Hoe is je dag tot nu toe?", "Hoe gaat het met je?", "Waar sta je vandaag?", "Hoe voel je je nu?"];
const OFFR = ["Zullen we samen ademen?", "Even een moment voor jezelf?", "Zullen we even stilstaan?"];
const MEMZ = ["Je bent dapper en sterk 💚", "Elke dag is een nieuw begin 🌅", "Jij maakt de wereld mooier 🌸", "Adem in… en laat los 🍃", "Je bent precies goed zoals je bent ✨", "Kleine stappen maken grote reizen 🦋", "Dit moment is van jou 🌼", "Je doet het geweldig 🌻"];
// 450 micro-opdrachten: 10 categorieën x 15 per cat x 3 leeftijdsgroepen
const MICRO = {
  adult: [
  // Ademhaling snel
  "Haal vijf keer diep adem door je neus", "Adem langzaam in voor vier tellen, uit voor zes — herhaal dit rustig", "Zucht drie keer alles van je af — echt luid", "Adem in door je neus, blaas uit door je mond — op je eigen tempo", "Leg je hand op je buik en voel hoe hij meebeweegt met je adem", "Doe een dubbele inademing en blaas dan héél langzaam uit", "Adem in alsof je aan een bloem ruikt, uit alsof je een kaarsje uitblaast", "Sluit je ogen en neem een paar bewuste ademhalingen", "Adem naar je schouders toe en laat ze zakken bij het uitademen", "Houd na het inademen even je adem vast en laat dan alles los", "Probeer zo langzaam mogelijk uit te ademen", "Voel de koele lucht bij je neus als je inademt", "Adem in terwijl je je handen opheft, uit terwijl je ze laat zakken", "Neem één hele diepe ademhaling — de diepste van de dag", "Adem in en tel rustig mee in je hoofd",
  // Lichaamsbewustzijn
  "Scan even je lichaam — waar voel je spanning?", "Rol je schouders langzaam naar achteren", "Ontspan je kaak — laat hem even hangen", "Voel je voeten op de grond — druk ze er even bewust in", "Laat je armen hangen en schud ze even los", "Trek je schouders op naar je oren en laat ze dan vallen", "Voel waar je lichaam de stoel raakt", "Ontspan je voorhoofd — laat alle frons los", "Leg je hand op je hart en voel het kloppen", "Draai langzaam je hoofd van links naar rechts", "Knijp je handen samen tot vuisten en laat dan los — voel het verschil", "Strek je armen boven je hoofd en maak jezelf zo lang mogelijk", "Voel de temperatuur van je handen — zijn ze warm of koud?", "Sta even op en voel hoe je gewicht op je voeten rust", "Leg je handen op je knieën en voel de warmte",
  // Zintuigen
  "Noem vijf dingen die je nu ziet", "Sluit je ogen en luister — wat hoor je allemaal?", "Voel de temperatuur op je huid — is het warm of koel?", "Kijk om je heen en zoek iets dat blauw is", "Luister naar het verste geluid dat je kan horen", "Raak iets aan en beschrijf hoe het voelt", "Wat ruik je op dit moment?", "Kijk naar je handen — bestudeer de lijntjes", "Luister naar je eigen ademhaling — hoe klinkt die?", "Kijk naar buiten en beschrijf de lucht in drie woorden", "Voel de stof van je kleding tussen je vingers", "Zoek het mooiste ding in de ruimte waar je nu bent", "Merk op welke kleuren er het meest om je heen zijn", "Voel de grond onder je voeten — is het hard of zacht?", "Beschrijf de geur van de ruimte waar je bent",
  // Dankbaarheid
  "Noem één ding waar je vandaag dankbaar voor bent", "Wie heeft je de afgelopen week blij gemaakt?", "Wat is iets kleins dat vandaag goed ging?", "Welk moment van vandaag wil je onthouden?", "Noem iets dat je elke dag hebt maar nooit bij stilstaat", "Wie zou je vandaag willen bedanken?", "Wat is iets in de natuur waar je van geniet?", "Welke simpele luxe heb je vandaag gehad?", "Noem een herinnering die je aan het lachen maakt", "Wat is iets dat je vandaag geleerd hebt?", "Welk eten of drinken heb je echt van genoten?", "Noem iemand die altijd voor je klaarstaat", "Wat kan je lichaam dat je bijzonder vindt?", "Waar voel je je het meest thuis?", "Wat is iets moois dat je vandaag gezien hebt?",
  // Reflectie
  "Hoe voel je je nu vergeleken met vanmorgen?", "Wat heb je vandaag nodig?", "Waar denk je het meest aan op dit moment?", "Als je je gevoel een kleur moest geven — welke?", "Wat zou je tegen jezelf van vanmorgen willen zeggen?", "Wat wil je vandaag nog loslaten?", "Wat heeft je vandaag energie gegeven?", "Wat heeft je vandaag energie gekost?", "Wat heb je vandaag voor iemand anders gedaan?", "Waar kijk je naar uit deze week?", "Wat accepteer je vandaag zoals het is?", "Welk woord past bij hoe je je nu voelt?", "Wat is iets dat je vandaag anders zou doen?", "Hoe vriendelijk ben je vandaag voor jezelf geweest?", "Hoe zou je dag er perfect uitzien vanaf nu?",
  // Positief denken
  "Noem één ding waar je goed in bent", "Wat maakt jou uniek?", "Waar ben je trots op — hoe klein ook?", "Wat is een uitdaging die je overwonnen hebt?", "Noem iets aardigs dat iemand ooit tegen je gezegd heeft", "Wat zou je beste vriend over je zeggen?", "Welke eigenschap van jezelf waardeer je het meest?", "Wat heb je de afgelopen maand bereikt?", "Noem een moment waarop je dapper was", "Welk compliment zou je jezelf willen geven?", "Wat is iets dat je goed hebt aangepakt?", "Waar mag je trots op zijn vandaag?", "Wat is een droom die je hebt — groot of klein?", "Wat zou je tegen iemand zeggen die zich voelt zoals jij?", "Noem drie dingen die je leuk vindt aan jezelf",
  // Beweging
  "Sta even op en rek je uit", "Schud je handen tien seconden los", "Loop even naar het raam en kijk naar buiten", "Zet je handen in je zij en draai je bovenlichaam zachtjes", "Ga op je tenen staan en laat je dan weer zakken", "Kantel je hoofd naar links, dan naar rechts", "Maak grote cirkels met je armen", "Schud je hele lichaam even los", "Loop een rondje door de kamer", "Zet je voeten stevig neer en voel je sterk", "Doe alsof je de zon van de hemel plukt — strek omhoog", "Strek je armen zo ver mogelijk naar voren", "Draai rondjes met je enkels", "Sta op en doe twee kniebuigingen", "Beweeg je vingers alsof je piano speelt",
  // Verbinding
  "Denk aan iemand die je dankbaar bent", "Stuur een berichtje naar iemand om te zeggen dat je aan hen denkt", "Wie zou je vandaag een knuffel willen geven?", "Denk aan je favoriete herinnering met iemand", "Wat zou je tegen je jongere zelf willen zeggen?", "Wie heeft je iets waardevols geleerd?", "Wie maakt je leven mooier zonder dat ze het weten?", "Aan wie denk je als je je veilig voelt?", "Wat waardeer je het meest aan je beste vriend?", "Wie zou je willen bedanken voor iets kleins?", "Denk aan een moment dat iemand je verraste met vriendelijkheid", "Wat zou je vandaag voor iemand anders kunnen doen?", "Wie is er altijd voor je — zelfs als het moeilijk is?", "Welk gesprek heeft je ooit geraakt?", "Denk aan iemand die je lang niet gesproken hebt",
  // Natuur
  "Kijk naar de lucht — welke kleur heeft ze nu?", "Zoek iets groens om je heen", "Luister of je vogels of wind hoort", "Voel je de zon of de regen op je huid?", "Kijk naar een boom en merk op hoe hij beweegt", "Adem buitenlucht in als je kan — hoe ruikt het?", "Zoek een wolk en volg haar met je ogen", "Merk het seizoen op — wat vertelt de natuur je?", "Luister naar water — regen, een kraan, een fontein", "Zoek iets in de natuur dat je mooi vindt", "Merk op hoe het licht valt — waar komt het vandaan?", "Voel de wind op je gezicht", "Kijk naar de grond — wat groeit er?", "Kijk naar de schaduw die je maakt", "Zoek een dier of insect en observeer het even",
  // Creatief
  "Beschrijf je dag in drie woorden", "Als je gevoel een weer-type was — wat zou het zijn?", "Verzin een wens voor vandaag", "Welk liedje past bij hoe je je voelt?", "Als je een superkracht had — welke zou je kiezen?", "Welke kleur heeft je energie vandaag?", "Als je een brief aan morgen kon schrijven — wat zou erin staan?", "Verzin een naam voor hoe je je nu voelt", "Welk dier ben je vandaag en waarom?", "Als je dag een smaak had — welke zou het zijn?", "Teken in je hoofd een plek waar je je veilig voelt", "Welk seizoen past het best bij je stemming?", "Als je je gevoel kon verpakken als cadeau — wat zou het zijn?", "Beschrijf je ideale dag in vijf woorden", "Beschrijf je stemming als een landschap"],
  child: ["Blaas alsof je een ballon opblaast — doe dit vijf keer", "Snuif als een hondje — dan blaas als een draak", "Adem in en maak jezelf zo groot mogelijk — blaas uit en word zo klein als een muis", "Blaas alsof je een paardenbloem wegblaast", "Doe alsof je een warme chocolademelk afkoelt", "Snuif alsof je aan de lekkerste bloem ruikt — blaas dan zachtjes uit", "Adem in als een beer — groot en sterk — blaas uit als een vlinder", "Blaas alsof je zeepbellen maakt", "Leg je handen op je buik — voel hem groter en kleiner worden", "Doe de slang: ssssssss bij het uitademen", "Blaas alle zorgen weg als wolkjes", "Adem in en houd vast — tel tot drie — en laat los!", "Doe de leeuw: adem in en blaas uit met je tong naar buiten", "Adem in door je neus, uit door je mond — doe het zo langzaam als je kan", "Adem in en tel tot drie in je hoofd — blaas dan alles uit", "Schud je hele lichaam als een natte hond", "Maak jezelf zo groot als een reus — dan zo klein als een kabouter", "Waar in je lichaam kriebelt het?", "Knijp je tenen samen en laat los — voel je het verschil?", "Trek je schouders op tot je oren en laat ze dan vallen — PLOF", "Maak je handen tot vuisten — knijp heel hard — en open ze als bloemen", "Doe alsof je een robot bent — alles stijf — en dan een slappe pop", "Stamp zachtjes met je voeten op de grond — voel je de grond?", "Beweeg alleen je vingers — zo snel als je kan", "Sta op één been als een flamingo — hoe lang lukt het?", "Maak je gezicht zo raar mogelijk — en laat dan los", "Kriebel je eigen armen van boven naar beneden", "Doe alsof je door pindakaas loopt — heel langzaam", "Span al je spieren aan — alles — en laat dan alles tegelijk los", "Draai rondjes met je hoofd alsof het een bal is", "Zoek vijf dingen die dezelfde kleur hebben", "Sluit je ogen — welke geluiden hoor je allemaal?", "Zoek iets dat zacht is en voel eraan", "Wat is het grappigste ding dat je nu kan zien?", "Luister heel goed — wat is het stilste geluid?", "Zoek iets dat koud is en raak het aan", "Hoeveel verschillende kleuren kan je tellen in de kamer?", "Voel aan je haar — hoe voelt het vandaag?", "Kijk uit het raam — wat beweegt er allemaal?", "Zoek iets rond en iets vierkant", "Welke kleur heeft de lucht nu?", "Raak drie verschillende dingen aan — welke voelt het raarst?", "Zoek het kleinste ding dat je kan vinden", "Zoek iets dat ruikt — wat ruik je?", "Luister of je een vogel of dier hoort", "Wat was het leukste van vandaag?", "Wie is je favoriete persoon en waarom?", "Wat is je lievelingseten — denk er even aan hoe lekker het is", "Welk speelgoed of ding maakt je het blij?", "Noem iets leuks dat iemand voor je gedaan heeft", "Wat vind je het leukst aan je huis?", "Wie maakt je altijd aan het lachen?", "Wat is het fijnste plekje waar je kan zitten?", "Welke dag was de leukste dag ooit?", "Wat vind je het leukst aan jezelf?", "Noem iets buiten dat je mooi vindt", "Welk verhaal of filmpje vind je het allerleukst?", "Welk dier vind je het coolste?", "Wat is het leukste spel dat je kent?", "Wat zou je morgen het liefst willen doen?", "Als je gevoel een diertje was — welk dier zou het zijn?", "Hoe voelt je buik nu — vlinders, knopen, of rustig?", "Wat zou je nu het liefst willen doen?", "Als je een toverkracht had — wat zou je veranderen?", "Hoe was je dag — vertel het in drie woorden", "Waar denk je nu aan?", "Wat maakte je vandaag blij en wat maakte je verdrietig?", "Als je dag een kleur had — welke kleur zou het zijn?", "Heb je vandaag gelachen? Wanneer?", "Wat vond je vandaag moeilijk?", "Hoe zou je je voelen als alles perfect was?", "Wat helpt jou als je je niet lekker voelt?", "Is er iets dat je dwars zit?", "Als je een wolk kon sturen naar iemand — naar wie?", "Teken een gezichtje dat laat zien hoe je je voelt", "Noem iets waar je goed in bent", "Wat heb je vandaag goed gedaan?", "Je bent dapper — wanneer was je dapper?", "Welke superkracht heb jij in het echt?", "Wat zou je beste vriend zeggen over jou?", "Waar ben je trots op?", "Noem drie dingen die jou speciaal maken", "Wat heb je geleerd dat je eerst niet kon?", "Wat is iets aardigs dat je voor iemand hebt gedaan?", "Als je een superheld was — welke zou je zijn?", "Jij maakt de wereld leuker — weet je waarom?", "Wat wil je later worden en waarom?", "Noem iets dat je hebt volgehouden ook al was het moeilijk", "Wat is je lievelingsding aan jezelf?", "Waar word je blij van?", "Spring vijf keer op en neer als een kangoeroe", "Doe de flamingo — sta op één been en tel tot tien", "Schud je armen als spaghetti", "Doe alsof je door de jungle sluipt", "Maak je zo lang mogelijk — rek tot aan het plafond", "Draai rondjes met je armen als een windmolen", "Doe de penguin-wandeling door de kamer", "Stamp als een olifant — drie grote stampen", "Wiebel je hele lichaam als een pudding", "Doe alsof je zwemt — welke slag doe je?", "Maak sprongetjes als een konijn", "Beweeg als een slak — zo langzaam mogelijk", "Doe alsof je een kat bent die net wakker wordt — rek en strek", "Klap in je handen boven je hoofd en raak dan je tenen aan", "Balanceer alsof je op een koord loopt", "Aan wie denk je nu? Stuur ze een knuffel in gedachten", "Teken een hartje voor iemand die je lief vindt", "Wat is het liefste dat iemand ooit voor je gedaan heeft?", "Wie zou je nu het liefst een knuffel geven?", "Als je een cadeau kon toveren voor iemand — wat zou het zijn?", "Wie maakt je het vaakst aan het lachen?", "Denk aan iemand die je mist — stuur ze een gedachte-knuffel", "Wie is de grappigste persoon die je kent?", "Welk compliment zou je aan je mama of papa willen geven?", "Denk aan je beste vriendje — wat vind je het leukst aan hen?", "Wie helpt jou als je verdrietig bent?", "Vertel in je hoofd aan je knuffel hoe je dag was", "Wat zou je juf of meester blij maken?", "Wat zou je doen als je de hele dag mocht besteden met je favoriete persoon?", "Als je een brief kon sturen naar iedereen — wat zou erin staan?", "Kijk naar buiten — zie je wolken? Welke vormen hebben ze?", "Zoek iets groens — het mag heel klein zijn", "Luister heel goed — hoor je een vogel?", "Hoe voelt de lucht vandaag — warm of koud?", "Als je een dier kon zijn voor één dag — welk dier kies je?", "Kijk naar de lucht — beschrijf de kleur", "Welk seizoen is het en hoe merk je dat?", "Als je een boom was — welke boom zou je zijn?", "Voel je de wind? Uit welke richting komt hij?", "Welk weer past bij hoe je je voelt?", "Als je een bloem was — welke kleur zou je zijn?", "Zoek de mooiste steen die je kan vinden", "Kijk naar een boom — hoeveel vogels zie je?", "Zoek een insect of beestje en kijk wat het doet", "Zoek een blaadje of bloem als je buiten bent", "Als je dag een kleur was — welke kleur?", "Welk dier ben je vandaag?", "Verzin een toverspreuk voor geluk", "Als je een liedje moest zingen over vandaag — hoe zou het gaan?", "Teken met je vinger in de lucht hoe je je voelt", "Welk weer is het in je hoofd vandaag?", "Als je een smaak was — welke smaak ben je nu?", "Verzin een naam voor je gevoel van vandaag", "Als je kon vliegen — waar zou je naartoe gaan?", "Welke superheld-naam zou je hebben?", "Als je gevoel een geluid was — welk geluid?", "Maak een grappig gezicht dat laat zien hoe je je voelt", "Als je een wolk kon vormen — welke vorm?", "Verzin een geheim wachtwoord voor als je je beter wil voelen", "Als je dag een film was — hoe zou hij heten?"],
  junior: ["Vijf diepe ademhalingen — focus alleen op het gevoel", "Adem in voor vier tellen, uit voor zes — op je eigen ritme", "Zucht het van je af — letterlijk — drie keer", "Blaas alle spanning uit alsof je rook uitblaast", "Leg je hand op je borst en voel je hartslag terwijl je ademt", "Dubbele inademing, lange uitademing — het reset je zenuwstelsel", "Adem in en hou even vast — laat dan langzaam los", "Concentreer je op alleen maar uitademen — de inademing komt vanzelf", "Doe je ogen dicht en neem een paar rustige ademhalingen", "Adem alsof je door een rietje uitblaast", "Voel hoe je buik beweegt — niet je borst", "Adem zo diep mogelijk in — vul jezelf helemaal", "Volg je adem met je aandacht van begin tot eind", "Neem één bewuste ademhaling — de rest volgt vanzelf", "Adem in door je neus, uit door je mond — merk het verschil", "Check je kaak — is hij gespannen? Laat los", "Waar zit de stress in je lichaam? Benoem het", "Rol je schouders naar achteren — ze kruipen altijd omhoog", "Ontspan je gezicht — je fronst waarschijnlijk zonder het te weten", "Voel je voeten in je schoenen — druk ze even in de grond", "Span al je spieren aan voor vijf seconden — laat dan alles los", "Check je houding — zit of sta je recht?", "Beweeg je nek langzaam van links naar rechts", "Knijp in je handen en laat los — voel het verschil", "Leg je hand op je buik en voel hoe hij meebeweegt", "Schud je handen los alsof er water aan hangt", "Voel waar je lichaam het meest ontspannen is", "Rek je uit alsof je net wakker wordt — het mag overdreven", "Trek je tenen op en laat ze weer los", "Draai je polsen een paar keer rond", "Noem vijf dingen die je nu ziet — snel", "Sluit je ogen en focus op wat je hoort", "Wat ruik je op dit moment?", "Raak iets aan en beschrijf het in je hoofd", "Kijk naar buiten — wat is het eerste dat opvalt?", "Luister naar het verste geluid dat je kan opvangen", "Zoek iets moois in de ruimte waar je bent", "Welke kleur overheerst om je heen?", "Voel de temperatuur op je huid — warm of koel?", "Zoek iets met een bijzondere textuur", "Let op de schaduwen in de ruimte", "Hoor je achtergrondgeluiden die je normaal negeert?", "Merk op wat er beweegt om je heen", "Kijk naar je handen — bekijk ze echt even", "Focus op één geluid en volg het", "Noem één ding waar je blij mee bent vandaag", "Wie is er voor je geweest deze week?", "Wat is iets dat vanzelfsprekend lijkt maar eigenlijk bijzonder is?", "Welk moment van vandaag was oké of zelfs goed?", "Noem iets aan jezelf waar je tevreden mee bent", "Welk nummer of serie maakt je blij?", "Wie zou je willen bedanken — en waarvoor?", "Wat is het beste dat je deze week gegeten hebt?", "Noem een plek waar je je fijn voelt", "Welke skill heb je die je vroeger niet had?", "Wie snapt jou het best?", "Noem een herinnering die je doet glimlachen", "Waar kijk je naar uit?", "Wat heb je dat niet iedereen heeft?", "Wat maakt je leven een beetje makkelijker?", "Hoe voel je je echt — niet het standaard antwoord?", "Als je gevoel een emoji was — welke?", "Wat houdt je bezig op dit moment?", "Hoe was vandaag op een schaal van 1-10?", "Wat heb je nodig maar vraag je niet snel?", "Als je één ding kon veranderen aan vandaag — wat?", "Ben je moe? Gestrest? Verveeld? Check het even echt", "Wat zou je tegen je beste vriend zeggen als die zich zo voelde?", "Hoe was je energie vandaag?", "Wat is iets dat je wil maar steeds uitstelt?", "Waar ben je het hardst mee bezig in je hoofd?", "Wat deed je goed vandaag dat niemand gezien heeft?", "Hoe wil je je morgen voelen?", "Als je je gevoel moest uitleggen aan een alien — hoe?", "Waar maak je je druk over dat misschien niet zo erg is?", "Wat is iets waar je stiekem best goed in bent?", "Noem een moment dat je trots was op jezelf", "Wat maakt jou anders dan de rest — op een goede manier?", "Welk compliment hoor je het liefst?", "Wat heb je overwonnen dat moeilijk was?", "Wat zou je tegen jezelf van een jaar geleden zeggen?", "Waar ben je sterker in geworden?", "Noem iets dat je hebt volgehouden", "Wat waardeer je aan jezelf dat anderen misschien niet zien?", "Wat is een risico dat je genomen hebt en dat goed uitpakte?", "Waar ga je voor — wat is je ding?", "Noem drie woorden die jou beschrijven", "Wat is het moedigste dat je ooit gedaan hebt?", "Waar wil je over vijf jaar staan?", "Als je een quote moest kiezen voor je leven — welke?", "Sta op en rek je uit — echt goed", "Schud je handen los", "Loop even naar het raam en kijk dertig seconden naar buiten", "Doe een paar kniebuigingen — het geeft energie", "Rol je nek langzaam rond", "Strek je armen boven je hoofd en reik zo hoog mogelijk", "Draai je bovenlichaam naar links en rechts", "Ga even staan als je zit — of zitten als je staat", "Wiebel met je tenen in je schoenen", "Wandel even door de kamer en terug", "Strek je benen als je zit", "Schud je hele lichaam los — alles tegelijk", "Zet je lievelingsnummer op en beweeg mee", "Doe tien jumping jacks — of vijf als dat genoeg is", "Doe een plank voor tien seconden — of probeer het", "Denk aan iemand die je blij maakt", "Stuur een berichtje naar iemand — gewoon omdat", "Wie zou je nu willen spreken?", "Denk aan het beste gesprek dat je recent gehad hebt", "Wat zou je tegen iemand zeggen die zich voelt zoals jij nu?", "Wie is iemand die je inspireert?", "Wat waardeer je het meest aan je vrienden?", "Wie ken je die het nu misschien moeilijk heeft?", "Als je één persoon kon bellen — wie zou het zijn?", "Wat is het leukste compliment dat je ooit gekregen hebt?", "Denk aan iemand die je lang niet gesproken hebt", "Wat zou je voor iemand willen doen vandaag?", "Wie geeft je het gevoel dat je jezelf kan zijn?", "Denk aan een leraar of coach die impact op je had", "Als je een boodschap kon sturen naar de hele wereld — wat?", "Kijk naar de lucht — hoe ziet ze eruit?", "Zoek iets natuurlijks om je heen", "Luister of je iets van natuur hoort — wind, vogels, regen", "Hoe voelt de buitenlucht als je diep inademt?", "Welk seizoen past bij je stemming?", "Kijk naar een boom of plant en merk de details op", "Als je ergens in de natuur kon zijn — waar?", "Merk het weer op — hoe beïnvloedt het je stemming?", "Zoek iets levends om je heen", "Kijk naar de wolken en zoek een vorm", "Welk natuurgeluid kalmeert jou het meest?", "Merk op hoeveel groen er om je heen is", "Kijk naar het licht — is het helder, zacht, warm?", "Hoe ruikt het buiten vandaag?", "Als je een plek in de natuur moest kiezen om te zitten — welke?", "Beschrijf je dag in drie woorden", "Als je stemming een nummer was — welk nummer?", "Welke film of serie past bij hoe je je voelt?", "Als je gevoel een meme was — welke?", "Beschrijf je energie als een percentage", "Welk seizoen is het in je hoofd?", "Als je dag een playlist was — welke vibe?", "Verzin een titel voor vandaag", "Welk karakter uit een serie ben je vandaag?", "Als je mood een kleur had — welke?", "Beschrijf vandaag alsof het een film-review is", "Welk weer is het in je hoofd?", "Als je een superpower had voor de rest van de dag — welke?", "Rate je dag met een emoji", "Als je je gevoel kon posten als story — wat zou erop staan?"]
};
const pickMicro = type => {
  const list = MICRO[type] || MICRO.adult;
  return list[Math.floor(Math.random() * list.length)];
};
const SC = {
  Lente: {
    lf: "#4CAF7A",
    la: "#6BC5A0",
    ll: "#7DD4A8",
    gd: "#4A7A5A",
    gl: "#6A9A72",
    s1: "#5BA3D9",
    s2: "#D4E8F5",
    fl: ["#E07850", "#E8A840", "#5BB8A0", "#4CAF7A"],
    trunk: "#4A5568"
  },
  Zomer: {
    lf: "#3D9E6A",
    la: "#5AB888",
    ll: "#7DCCA0",
    gd: "#3D7A4E",
    gl: "#5A9A62",
    s1: "#4A90C4",
    s2: "#C8DFF0",
    fl: ["#E8A020", "#E07040", "#5BB898", "#4CAF7A"],
    trunk: "#4A5568"
  },
  Herfst: {
    lf: "#D4842A",
    la: "#E6A832",
    ll: "#ECC06A",
    gd: "#6A5A3A",
    gl: "#8A7A50",
    s1: "#8A7D5B",
    s2: "#E8D8C0",
    fl: ["#C4553A", "#E8A840", "#D4842A", "#5BB8A0"],
    trunk: "#4A5060"
  },
  Winter: {
    lf: "#7A9A8A",
    la: "#95B0A0",
    ll: "#B0C8B8",
    gd: "#5A6A5A",
    gl: "#728A78",
    s1: "#6A7F98",
    s2: "#C8D4E0",
    fl: ["#90B0A0", "#A0C0B0", "#B8C8C0"],
    trunk: "#3D4A58"
  }
};
const TOVL = {
  Ochtend: "rgba(255,210,120,0.12)",
  Middag: "rgba(0,0,0,0)",
  Avond: "rgba(255,100,30,0.22)",
  Nacht: "rgba(8,8,50,0.58)"
};

const EX = [{
  id: "basic",
  name: "Basis Ademhaling",
  nameChild: "Rustig ademen",
  nameJunior: "Gewoon ademen",
  desc: "Langzaam in en uit",
  iS: 4,
  oS: 4,
  hI: 0,
  hO: 0,
  r: 22,
  lv: "b",
  en: "calm",
  pts: 15,
  sci: "Diepe buikademhaling activeert je parasympatisch zenuwstelsel en verlaagt je hartslag. Dit is de basis van elke ademhalingstechniek en wetenschappelijk bewezen als effectieve stressvermindering."
}, {
  id: "calm2",
  name: "Kalmerende Ademhaling",
  nameChild: "Rustig worden",
  nameJunior: "Even tot rust komen",
  desc: "4 in, 6 uit — langere uitademing",
  iS: 4,
  oS: 6,
  hI: 0,
  hO: 0,
  r: 18,
  lv: "b",
  en: "calm",
  pts: 18,
  sci: "Een langere uitademing dan inademing stimuleert de nervus vagus en activeert je parasympatisch zenuwstelsel. Klinisch bewezen effectief bij angst en overprikkeling."
}, {
  id: "diaphragm",
  name: "Diafragma Ademhaling",
  nameChild: "Buikademhaling",
  desc: "Diep in je buik ademen",
  iS: 5,
  oS: 5,
  hI: 0,
  hO: 0,
  r: 18,
  lv: "b",
  en: "calm",
  pts: 20,
  sci: "Diafragmatisch ademen verlaagt cortisol tot 50% en verbetert zuurstofopname. Meerdere klinische studies bevestigen effectiviteit bij chronische stress en angst."
}, {
  id: "pursed",
  name: "Pursed Lip Breathing",
  nameChild: "Kaarsje uitblazen",
  desc: "In door neus, uit door getuite lippen",
  iS: 4,
  oS: 6,
  hI: 0,
  hO: 0,
  r: 18,
  lv: "b",
  en: "calm",
  pts: 20,
  sci: "Vertraagt de ademhaling en verbetert gasuitwisseling in de longen. Klinisch bewezen bij COPD, ademhalingsproblemen en acute paniekaanvallen."
}, {
  id: "box",
  name: "Box Breathing",
  nameChild: "Vierkant ademen",
  nameJunior: "Box breathing",
  desc: "4 tellen in, 4 vast, 4 uit, 4 vast",
  iS: 4,
  oS: 4,
  hI: 4,
  hO: 4,
  r: 11,
  lv: "i",
  en: "neutral",
  pts: 35,
  sci: "Box breathing verlaagt cortisol en brengt het autonome zenuwstelsel in balans. Gebruikt door Navy SEALs, hulpdiensten en therapeuten wereldwijd. Peer-reviewed onderzoek bevestigt effectiviteit."
}, {
  id: "478",
  name: "4-7-8 Techniek",
  nameChild: "Tover-ademhaling",
  nameJunior: "Slaap-truc",
  desc: "4 in, 7 vasthouden, 8 uit",
  iS: 4,
  oS: 8,
  hI: 7,
  hO: 0,
  r: 10,
  lv: "i",
  en: "calm",
  pts: 40,
  sci: "Ontwikkeld door Dr. Andrew Weil (Harvard). De verlengde uitademing activeert de parasympatische rustzenuw. Wetenschappelijk bewezen bij slaapproblemen en acute angst."
}, {
  id: "coherence",
  name: "Coherentie Ademhaling",
  nameChild: "Hartje-ademhaling",
  desc: "5,5 sec in, 5,5 sec uit",
  iS: 5.5,
  oS: 5.5,
  hI: 0,
  hO: 0,
  r: 16,
  lv: "i",
  en: "neutral",
  pts: 35,
  sci: "Brengt je hart in coherentie met je ademhaling op ~6 ademhalingen per minuut. Het HeartMath Institute heeft uitgebreid onderzoek gepubliceerd over hartcoherentie en emotionele regulatie."
}, {
  id: "sigh",
  name: "Fysiologische Zucht",
  nameChild: "Grote zucht",
  nameJunior: "Alles eruit blazen",
  desc: "Dubbele inademing, lange uitademing",
  iS: 2,
  oS: 6,
  hI: 0,
  hO: 0,
  r: 22,
  lv: "i",
  en: "calm",
  pts: 25,
  sci: "Stanford University onderzoek (Huberman Lab) toont aan dat een dubbele inademing gevolgd door verlengde uitademing de snelste bekende methode is om het zenuwstelsel te kalmeren."
}, {
  id: "alternate",
  name: "Alternate Nostril",
  nameChild: "Links-rechts ademen",
  desc: "Rechterhand omhoog. Duim sluit rechts, ringvinger sluit links. Adem in door links → vasthouden → uit door rechts → in door rechts → vasthouden → uit door links. Herhaal.",
  iS: 4,
  oS: 4,
  hI: 2,
  hO: 2,
  r: 12,
  lv: "x",
  en: "neutral",
  pts: 55,
  sci: "Nadi Shodhana balanceert het sympathisch en parasympatisch zenuwstelsel. Peer-reviewed studies tonen significante vermindering van angst en verbetering van cardiovasculaire functie."
}, {
  id: "resonance",
  name: "Resonantie Ademhaling",
  nameChild: "Jouw ritme",
  desc: "Op je eigen optimale frequentie",
  iS: 5,
  oS: 5,
  hI: 0,
  hO: 0,
  r: 18,
  lv: "x",
  en: "neutral",
  pts: 60,
  sci: "Elke persoon heeft een eigen optimale ademfrequentie (4.5-6.5/min) die maximale hartritmevariabiliteit oplevert. Bewezen bij PTSD, depressie en chronische pijn."
}, {
  id: "wimhof",
  name: "Wim Hof (aangepast)",
  nameChild: "Superheld ademen",
  warn: "\u26A0\uFE0F LEES DIT VOOR JE BEGINT. Doe dit altijd zittend of liggend op een veilige plek. Nooit staand, in water, op hoogte of achter het stuur. Door snelle ademhaling daalt je CO\u2082 \u2014 je zal tintelingen voelen in handen, voeten of lippen en mogelijk licht duizelig worden. Dit is normaal maar STOP direct als je krampachtig wordt of het bewustzijn verliest. Niet doen bij epilepsie, zwangerschap, hoog- of laagbloeddruk, hart- of longaandoeningen, of wanneer je je emotioneel instabiel voelt. Deze oefening is enkel geschikt als je al regelmatig ademoefeningen doet en je stabiel voelt.",
  desc: "Krachtig inademen, passief uitademen",
  iS: 2,
  oS: 2,
  hI: 0,
  hO: 0,
  r: 30,
  lv: "x",
  en: "up",
  pts: 75,
  sci: "Wetenschappelijk bewezen effect op het immuunsysteem en stressrespons (Radboud UMC studie). Verhoogt energie en alertheid. Uitsluitend voor ervaren beoefenaars."
}, {
  id: "energize",
  name: "Energetiserende Ademhaling",
  nameChild: "Raket-ademhaling",
  warn: "\u26A0\uFE0F LEES DIT VOOR JE BEGINT. Doe dit zittend op een stabiele plek, nooit staand of achter het stuur. Door de snelle buikkrampen kan je duizelig worden of tintelingen voelen \u2014 dit is normaal. Stop direct als het oncomfortabel wordt. Niet geschikt bij epilepsie, zwangerschap, hoge bloeddruk, maag- of darmklachten of hyperventilatieklachten. Enkel geschikt als je al vertrouwd bent met ademoefeningen en je stabiel en uitgerust voelt.",
  desc: "Snelle ritmische neusademhaling",
  iS: 1.5,
  oS: 1.5,
  hI: 0,
  hO: 0,
  r: 40,
  lv: "x",
  en: "up",
  pts: 65,
  sci: "Kapalabhati-variant die het sympathisch zenuwstelsel activeert. Klinisch bewezen voor verhoogde alertheid en mentale helderheid. Niet geschikt bij angst of paniek."
}];
const GRND = ["Noem 5 dingen die je ZIET 👀", "Noem 4 dingen die je HOORT 👂", "Noem 3 dingen die je VOELT ✋", "Noem 2 dingen die je RUIKT 👃", "Noem 1 ding dat je PROEFT 👅"];
const BSCAN = ["Voel je voeten op de grond 🦶", "Merk je benen op", "Voel je buik — adem hier naartoe", "Let op je schouders — laat ze zakken", "Ontspan je gezicht en kaak"];
const VIS = ["Sluit je ogen 👁️", "Stel je een veilige plek voor", "Voel de warmte, hoor de geluiden", "Blijf hier rustig ademen", "Open langzaam je ogen"];
// ================================================================
// HUXI App — Data
// ACCS: account type definities (kind, junior, volwassene, therapeut)
// EX: alle ademhalingsoefeningen met parameters
// ================================================================

const ACCS = [{
  id: "child",
  label: "Kinderen",
  age: "6–11",
  emoji: "🌱",
  desc: "Speels en vriendelijk"
}, {
  id: "junior",
  label: "Junior",
  age: "12–17",
  emoji: "🌿",
  desc: "Ontdek en groei"
}, {
  id: "adult",
  label: "Volwassenen",
  age: "18+",
  emoji: "🌳",
  desc: "Rust en reflectie"
}, {
  id: "therapist",
  label: "Therapeut",
  age: "",
  emoji: "🔬",
  desc: "Begeleid je cliënten"
}];
const REASONS_A = [{
  id: "stress",
  l: "Stress en spanning",
  e: "😰"
}, {
  id: "burnout",
  l: "Burnout",
  e: "🔥"
}, {
  id: "panic",
  l: "Paniekaanvallen of angst",
  e: "💨"
}, {
  id: "sleep",
  l: "Beter slapen",
  e: "🌙"
}, {
  id: "calm",
  l: "Meer rust in mijn hoofd",
  e: "🧠"
}, {
  id: "overstim",
  l: "Overprikkeling",
  e: "⚡"
}, {
  id: "curious",
  l: "Gewoon nieuwsgierig",
  e: "🌿"
}];
const REASONS_C = [{
  id: "worried",
  l: "Ik maak me soms zorgen",
  e: "🌧️"
}, {
  id: "angry",
  l: "Ik word soms boos of verdrietig",
  e: "🌪️"
}, {
  id: "sleep",
  l: "Ik kan soms niet goed slapen",
  e: "🌙"
}, {
  id: "busy",
  l: "Alles gaat soms te snel",
  e: "🎢"
}, {
  id: "curious",
  l: "Ik wil gewoon leren ontspannen!",
  e: "🌈"
}];
const REASONS_J = [{
  id: "stress",
  l: "Stress (school, thuis, etc.)",
  e: "😰"
}, {
  id: "anxiety",
  l: "Onrustig of angstig gevoel",
  e: "💨"
}, {
  id: "sleep",
  l: "Moeite met slapen",
  e: "🌙"
}, {
  id: "overstim",
  l: "Te veel prikkels",
  e: "⚡"
}, {
  id: "calm",
  l: "Meer rust in mijn hoofd",
  e: "🧠"
}, {
  id: "curious",
  l: "Gewoon kijken wat het is",
  e: "🌿"
}];
const MA = [{
  id: "calm",
  l: "Rustig",
  c: "#4CAF7A"
}, {
  id: "ok",
  l: "Oké",
  c: "#6BC5A0"
}, {
  id: "restless",
  l: "Onrustig",
  c: "#E6A832"
}, {
  id: "tense",
  l: "Gespannen",
  c: "#D4842A"
}, {
  id: "overwhelmed",
  l: "Overweldigd",
  c: "#C4553A"
}];
const MJ = [{
  id: "calm",
  l: "Chill",
  c: "#4CAF7A"
}, {
  id: "ok",
  l: "Gaat wel",
  c: "#6BC5A0"
}, {
  id: "restless",
  l: "Beetje stress",
  c: "#E6A832"
}, {
  id: "tense",
  l: "Niet zo lekker",
  c: "#D4842A"
}, {
  id: "overwhelmed",
  l: "Echt niet oké",
  c: "#C4553A"
}];
const MCH = [{
  id: "calm",
  l: "Blij",
  c: "#4CAF7A",
  a: "🐰"
}, {
  id: "ok",
  l: "Gaat wel",
  c: "#6BC5A0",
  a: "🦊"
}, {
  id: "restless",
  l: "Beetje raar",
  c: "#E6A832",
  a: "🐿️"
}, {
  id: "tense",
  l: "Niet fijn",
  c: "#D4842A",
  a: "🦉"
}, {
  id: "overwhelmed",
  l: "Heel moeilijk",
  c: "#C4553A",
  a: "🐻"
}];
const EXPLVL = [{
  id: "none",
  l: "Nee, helemaal nieuw",
  e: "🌱"
}, {
  id: "some",
  l: "Een beetje",
  e: "🌿"
}, {
  id: "experienced",
  l: "Ja, ik heb ervaring",
  e: "🌳"
}];
const CQ = ["Hoe voel je je vandaag?", "Hoe is je dag tot nu toe?", "Hoe gaat het met je?", "Waar sta je vandaag?", "Hoe voel je je nu?"];
const OFFR = ["Zullen we samen ademen?", "Even een moment voor jezelf?", "Zullen we even stilstaan?"];
const MEMZ = ["Je bent dapper en sterk 💚", "Elke dag is een nieuw begin 🌅", "Jij maakt de wereld mooier 🌸", "Adem in… en laat los 🍃", "Je bent precies goed zoals je bent ✨", "Kleine stappen maken grote reizen 🦋", "Dit moment is van jou 🌼", "Je doet het geweldig 🌻"];
// 450 micro-opdrachten: 10 categorieën x 15 per cat x 3 leeftijdsgroepen
const MICRO = {
  adult: [
  // Ademhaling snel
  "Haal vijf keer diep adem door je neus", "Adem langzaam in voor vier tellen, uit voor zes — herhaal dit rustig", "Zucht drie keer alles van je af — echt luid", "Adem in door je neus, blaas uit door je mond — op je eigen tempo", "Leg je hand op je buik en voel hoe hij meebeweegt met je adem", "Doe een dubbele inademing en blaas dan héél langzaam uit", "Adem in alsof je aan een bloem ruikt, uit alsof je een kaarsje uitblaast", "Sluit je ogen en neem een paar bewuste ademhalingen", "Adem naar je schouders toe en laat ze zakken bij het uitademen", "Houd na het inademen even je adem vast en laat dan alles los", "Probeer zo langzaam mogelijk uit te ademen", "Voel de koele lucht bij je neus als je inademt", "Adem in terwijl je je handen opheft, uit terwijl je ze laat zakken", "Neem één hele diepe ademhaling — de diepste van de dag", "Adem in en tel rustig mee in je hoofd",
  // Lichaamsbewustzijn
  "Scan even je lichaam — waar voel je spanning?", "Rol je schouders langzaam naar achteren", "Ontspan je kaak — laat hem even hangen", "Voel je voeten op de grond — druk ze er even bewust in", "Laat je armen hangen en schud ze even los", "Trek je schouders op naar je oren en laat ze dan vallen", "Voel waar je lichaam de stoel raakt", "Ontspan je voorhoofd — laat alle frons los", "Leg je hand op je hart en voel het kloppen", "Draai langzaam je hoofd van links naar rechts", "Knijp je handen samen tot vuisten en laat dan los — voel het verschil", "Strek je armen boven je hoofd en maak jezelf zo lang mogelijk", "Voel de temperatuur van je handen — zijn ze warm of koud?", "Sta even op en voel hoe je gewicht op je voeten rust", "Leg je handen op je knieën en voel de warmte",
  // Zintuigen
  "Noem vijf dingen die je nu ziet", "Sluit je ogen en luister — wat hoor je allemaal?", "Voel de temperatuur op je huid — is het warm of koel?", "Kijk om je heen en zoek iets dat blauw is", "Luister naar het verste geluid dat je kan horen", "Raak iets aan en beschrijf hoe het voelt", "Wat ruik je op dit moment?", "Kijk naar je handen — bestudeer de lijntjes", "Luister naar je eigen ademhaling — hoe klinkt die?", "Kijk naar buiten en beschrijf de lucht in drie woorden", "Voel de stof van je kleding tussen je vingers", "Zoek het mooiste ding in de ruimte waar je nu bent", "Merk op welke kleuren er het meest om je heen zijn", "Voel de grond onder je voeten — is het hard of zacht?", "Beschrijf de geur van de ruimte waar je bent",
  // Dankbaarheid
  "Noem één ding waar je vandaag dankbaar voor bent", "Wie heeft je de afgelopen week blij gemaakt?", "Wat is iets kleins dat vandaag goed ging?", "Welk moment van vandaag wil je onthouden?", "Noem iets dat je elke dag hebt maar nooit bij stilstaat", "Wie zou je vandaag willen bedanken?", "Wat is iets in de natuur waar je van geniet?", "Welke simpele luxe heb je vandaag gehad?", "Noem een herinnering die je aan het lachen maakt", "Wat is iets dat je vandaag geleerd hebt?", "Welk eten of drinken heb je echt van genoten?", "Noem iemand die altijd voor je klaarstaat", "Wat kan je lichaam dat je bijzonder vindt?", "Waar voel je je het meest thuis?", "Wat is iets moois dat je vandaag gezien hebt?",
  // Reflectie
  "Hoe voel je je nu vergeleken met vanmorgen?", "Wat heb je vandaag nodig?", "Waar denk je het meest aan op dit moment?", "Als je je gevoel een kleur moest geven — welke?", "Wat zou je tegen jezelf van vanmorgen willen zeggen?", "Wat wil je vandaag nog loslaten?", "Wat heeft je vandaag energie gegeven?", "Wat heeft je vandaag energie gekost?", "Wat heb je vandaag voor iemand anders gedaan?", "Waar kijk je naar uit deze week?", "Wat accepteer je vandaag zoals het is?", "Welk woord past bij hoe je je nu voelt?", "Wat is iets dat je vandaag anders zou doen?", "Hoe vriendelijk ben je vandaag voor jezelf geweest?", "Hoe zou je dag er perfect uitzien vanaf nu?",
  // Positief denken
  "Noem één ding waar je goed in bent", "Wat maakt jou uniek?", "Waar ben je trots op — hoe klein ook?", "Wat is een uitdaging die je overwonnen hebt?", "Noem iets aardigs dat iemand ooit tegen je gezegd heeft", "Wat zou je beste vriend over je zeggen?", "Welke eigenschap van jezelf waardeer je het meest?", "Wat heb je de afgelopen maand bereikt?", "Noem een moment waarop je dapper was", "Welk compliment zou je jezelf willen geven?", "Wat is iets dat je goed hebt aangepakt?", "Waar mag je trots op zijn vandaag?", "Wat is een droom die je hebt — groot of klein?", "Wat zou je tegen iemand zeggen die zich voelt zoals jij?", "Noem drie dingen die je leuk vindt aan jezelf",
  // Beweging
  "Sta even op en rek je uit", "Schud je handen tien seconden los", "Loop even naar het raam en kijk naar buiten", "Zet je handen in je zij en draai je bovenlichaam zachtjes", "Ga op je tenen staan en laat je dan weer zakken", "Kantel je hoofd naar links, dan naar rechts", "Maak grote cirkels met je armen", "Schud je hele lichaam even los", "Loop een rondje door de kamer", "Zet je voeten stevig neer en voel je sterk", "Doe alsof je de zon van de hemel plukt — strek omhoog", "Strek je armen zo ver mogelijk naar voren", "Draai rondjes met je enkels", "Sta op en doe twee kniebuigingen", "Beweeg je vingers alsof je piano speelt",
  // Verbinding
  "Denk aan iemand die je dankbaar bent", "Stuur een berichtje naar iemand om te zeggen dat je aan hen denkt", "Wie zou je vandaag een knuffel willen geven?", "Denk aan je favoriete herinnering met iemand", "Wat zou je tegen je jongere zelf willen zeggen?", "Wie heeft je iets waardevols geleerd?", "Wie maakt je leven mooier zonder dat ze het weten?", "Aan wie denk je als je je veilig voelt?", "Wat waardeer je het meest aan je beste vriend?", "Wie zou je willen bedanken voor iets kleins?", "Denk aan een moment dat iemand je verraste met vriendelijkheid", "Wat zou je vandaag voor iemand anders kunnen doen?", "Wie is er altijd voor je — zelfs als het moeilijk is?", "Welk gesprek heeft je ooit geraakt?", "Denk aan iemand die je lang niet gesproken hebt",
  // Natuur
  "Kijk naar de lucht — welke kleur heeft ze nu?", "Zoek iets groens om je heen", "Luister of je vogels of wind hoort", "Voel je de zon of de regen op je huid?", "Kijk naar een boom en merk op hoe hij beweegt", "Adem buitenlucht in als je kan — hoe ruikt het?", "Zoek een wolk en volg haar met je ogen", "Merk het seizoen op — wat vertelt de natuur je?", "Luister naar water — regen, een kraan, een fontein", "Zoek iets in de natuur dat je mooi vindt", "Merk op hoe het licht valt — waar komt het vandaan?", "Voel de wind op je gezicht", "Kijk naar de grond — wat groeit er?", "Kijk naar de schaduw die je maakt", "Zoek een dier of insect en observeer het even",
  // Creatief
  "Beschrijf je dag in drie woorden", "Als je gevoel een weer-type was — wat zou het zijn?", "Verzin een wens voor vandaag", "Welk liedje past bij hoe je je voelt?", "Als je een superkracht had — welke zou je kiezen?", "Welke kleur heeft je energie vandaag?", "Als je een brief aan morgen kon schrijven — wat zou erin staan?", "Verzin een naam voor hoe je je nu voelt", "Welk dier ben je vandaag en waarom?", "Als je dag een smaak had — welke zou het zijn?", "Teken in je hoofd een plek waar je je veilig voelt", "Welk seizoen past het best bij je stemming?", "Als je je gevoel kon verpakken als cadeau — wat zou het zijn?", "Beschrijf je ideale dag in vijf woorden", "Beschrijf je stemming als een landschap"],
  child: ["Blaas alsof je een ballon opblaast — doe dit vijf keer", "Snuif als een hondje — dan blaas als een draak", "Adem in en maak jezelf zo groot mogelijk — blaas uit en word zo klein als een muis", "Blaas alsof je een paardenbloem wegblaast", "Doe alsof je een warme chocolademelk afkoelt", "Snuif alsof je aan de lekkerste bloem ruikt — blaas dan zachtjes uit", "Adem in als een beer — groot en sterk — blaas uit als een vlinder", "Blaas alsof je zeepbellen maakt", "Leg je handen op je buik — voel hem groter en kleiner worden", "Doe de slang: ssssssss bij het uitademen", "Blaas alle zorgen weg als wolkjes", "Adem in en houd vast — tel tot drie — en laat los!", "Doe de leeuw: adem in en blaas uit met je tong naar buiten", "Adem in door je neus, uit door je mond — doe het zo langzaam als je kan", "Adem in en tel tot drie in je hoofd — blaas dan alles uit", "Schud je hele lichaam als een natte hond", "Maak jezelf zo groot als een reus — dan zo klein als een kabouter", "Waar in je lichaam kriebelt het?", "Knijp je tenen samen en laat los — voel je het verschil?", "Trek je schouders op tot je oren en laat ze dan vallen — PLOF", "Maak je handen tot vuisten — knijp heel hard — en open ze als bloemen", "Doe alsof je een robot bent — alles stijf — en dan een slappe pop", "Stamp zachtjes met je voeten op de grond — voel je de grond?", "Beweeg alleen je vingers — zo snel als je kan", "Sta op één been als een flamingo — hoe lang lukt het?", "Maak je gezicht zo raar mogelijk — en laat dan los", "Kriebel je eigen armen van boven naar beneden", "Doe alsof je door pindakaas loopt — heel langzaam", "Span al je spieren aan — alles — en laat dan alles tegelijk los", "Draai rondjes met je hoofd alsof het een bal is", "Zoek vijf dingen die dezelfde kleur hebben", "Sluit je ogen — welke geluiden hoor je allemaal?", "Zoek iets dat zacht is en voel eraan", "Wat is het grappigste ding dat je nu kan zien?", "Luister heel goed — wat is het stilste geluid?", "Zoek iets dat koud is en raak het aan", "Hoeveel verschillende kleuren kan je tellen in de kamer?", "Voel aan je haar — hoe voelt het vandaag?", "Kijk uit het raam — wat beweegt er allemaal?", "Zoek iets rond en iets vierkant", "Welke kleur heeft de lucht nu?", "Raak drie verschillende dingen aan — welke voelt het raarst?", "Zoek het kleinste ding dat je kan vinden", "Zoek iets dat ruikt — wat ruik je?", "Luister of je een vogel of dier hoort", "Wat was het leukste van vandaag?", "Wie is je favoriete persoon en waarom?", "Wat is je lievelingseten — denk er even aan hoe lekker het is", "Welk speelgoed of ding maakt je het blij?", "Noem iets leuks dat iemand voor je gedaan heeft", "Wat vind je het leukst aan je huis?", "Wie maakt je altijd aan het lachen?", "Wat is het fijnste plekje waar je kan zitten?", "Welke dag was de leukste dag ooit?", "Wat vind je het leukst aan jezelf?", "Noem iets buiten dat je mooi vindt", "Welk verhaal of filmpje vind je het allerleukst?", "Welk dier vind je het coolste?", "Wat is het leukste spel dat je kent?", "Wat zou je morgen het liefst willen doen?", "Als je gevoel een diertje was — welk dier zou het zijn?", "Hoe voelt je buik nu — vlinders, knopen, of rustig?", "Wat zou je nu het liefst willen doen?", "Als je een toverkracht had — wat zou je veranderen?", "Hoe was je dag — vertel het in drie woorden", "Waar denk je nu aan?", "Wat maakte je vandaag blij en wat maakte je verdrietig?", "Als je dag een kleur had — welke kleur zou het zijn?", "Heb je vandaag gelachen? Wanneer?", "Wat vond je vandaag moeilijk?", "Hoe zou je je voelen als alles perfect was?", "Wat helpt jou als je je niet lekker voelt?", "Is er iets dat je dwars zit?", "Als je een wolk kon sturen naar iemand — naar wie?", "Teken een gezichtje dat laat zien hoe je je voelt", "Noem iets waar je goed in bent", "Wat heb je vandaag goed gedaan?", "Je bent dapper — wanneer was je dapper?", "Welke superkracht heb jij in het echt?", "Wat zou je beste vriend zeggen over jou?", "Waar ben je trots op?", "Noem drie dingen die jou speciaal maken", "Wat heb je geleerd dat je eerst niet kon?", "Wat is iets aardigs dat je voor iemand hebt gedaan?", "Als je een superheld was — welke zou je zijn?", "Jij maakt de wereld leuker — weet je waarom?", "Wat wil je later worden en waarom?", "Noem iets dat je hebt volgehouden ook al was het moeilijk", "Wat is je lievelingsding aan jezelf?", "Waar word je blij van?", "Spring vijf keer op en neer als een kangoeroe", "Doe de flamingo — sta op één been en tel tot tien", "Schud je armen als spaghetti", "Doe alsof je door de jungle sluipt", "Maak je zo lang mogelijk — rek tot aan het plafond", "Draai rondjes met je armen als een windmolen", "Doe de penguin-wandeling door de kamer", "Stamp als een olifant — drie grote stampen", "Wiebel je hele lichaam als een pudding", "Doe alsof je zwemt — welke slag doe je?", "Maak sprongetjes als een konijn", "Beweeg als een slak — zo langzaam mogelijk", "Doe alsof je een kat bent die net wakker wordt — rek en strek", "Klap in je handen boven je hoofd en raak dan je tenen aan", "Balanceer alsof je op een koord loopt", "Aan wie denk je nu? Stuur ze een knuffel in gedachten", "Teken een hartje voor iemand die je lief vindt", "Wat is het liefste dat iemand ooit voor je gedaan heeft?", "Wie zou je nu het liefst een knuffel geven?", "Als je een cadeau kon toveren voor iemand — wat zou het zijn?", "Wie maakt je het vaakst aan het lachen?", "Denk aan iemand die je mist — stuur ze een gedachte-knuffel", "Wie is de grappigste persoon die je kent?", "Welk compliment zou je aan je mama of papa willen geven?", "Denk aan je beste vriendje — wat vind je het leukst aan hen?", "Wie helpt jou als je verdrietig bent?", "Vertel in je hoofd aan je knuffel hoe je dag was", "Wat zou je juf of meester blij maken?", "Wat zou je doen als je de hele dag mocht besteden met je favoriete persoon?", "Als je een brief kon sturen naar iedereen — wat zou erin staan?", "Kijk naar buiten — zie je wolken? Welke vormen hebben ze?", "Zoek iets groens — het mag heel klein zijn", "Luister heel goed — hoor je een vogel?", "Hoe voelt de lucht vandaag — warm of koud?", "Als je een dier kon zijn voor één dag — welk dier kies je?", "Kijk naar de lucht — beschrijf de kleur", "Welk seizoen is het en hoe merk je dat?", "Als je een boom was — welke boom zou je zijn?", "Voel je de wind? Uit welke richting komt hij?", "Welk weer past bij hoe je je voelt?", "Als je een bloem was — welke kleur zou je zijn?", "Zoek de mooiste steen die je kan vinden", "Kijk naar een boom — hoeveel vogels zie je?", "Zoek een insect of beestje en kijk wat het doet", "Zoek een blaadje of bloem als je buiten bent", "Als je dag een kleur was — welke kleur?", "Welk dier ben je vandaag?", "Verzin een toverspreuk voor geluk", "Als je een liedje moest zingen over vandaag — hoe zou het gaan?", "Teken met je vinger in de lucht hoe je je voelt", "Welk weer is het in je hoofd vandaag?", "Als je een smaak was — welke smaak ben je nu?", "Verzin een naam voor je gevoel van vandaag", "Als je kon vliegen — waar zou je naartoe gaan?", "Welke superheld-naam zou je hebben?", "Als je gevoel een geluid was — welk geluid?", "Maak een grappig gezicht dat laat zien hoe je je voelt", "Als je een wolk kon vormen — welke vorm?", "Verzin een geheim wachtwoord voor als je je beter wil voelen", "Als je dag een film was — hoe zou hij heten?"],
  junior: ["Vijf diepe ademhalingen — focus alleen op het gevoel", "Adem in voor vier tellen, uit voor zes — op je eigen ritme", "Zucht het van je af — letterlijk — drie keer", "Blaas alle spanning uit alsof je rook uitblaast", "Leg je hand op je borst en voel je hartslag terwijl je ademt", "Dubbele inademing, lange uitademing — het reset je zenuwstelsel", "Adem in en hou even vast — laat dan langzaam los", "Concentreer je op alleen maar uitademen — de inademing komt vanzelf", "Doe je ogen dicht en neem een paar rustige ademhalingen", "Adem alsof je door een rietje uitblaast", "Voel hoe je buik beweegt — niet je borst", "Adem zo diep mogelijk in — vul jezelf helemaal", "Volg je adem met je aandacht van begin tot eind", "Neem één bewuste ademhaling — de rest volgt vanzelf", "Adem in door je neus, uit door je mond — merk het verschil", "Check je kaak — is hij gespannen? Laat los", "Waar zit de stress in je lichaam? Benoem het", "Rol je schouders naar achteren — ze kruipen altijd omhoog", "Ontspan je gezicht — je fronst waarschijnlijk zonder het te weten", "Voel je voeten in je schoenen — druk ze even in de grond", "Span al je spieren aan voor vijf seconden — laat dan alles los", "Check je houding — zit of sta je recht?", "Beweeg je nek langzaam van links naar rechts", "Knijp in je handen en laat los — voel het verschil", "Leg je hand op je buik en voel hoe hij meebeweegt", "Schud je handen los alsof er water aan hangt", "Voel waar je lichaam het meest ontspannen is", "Rek je uit alsof je net wakker wordt — het mag overdreven", "Trek je tenen op en laat ze weer los", "Draai je polsen een paar keer rond", "Noem vijf dingen die je nu ziet — snel", "Sluit je ogen en focus op wat je hoort", "Wat ruik je op dit moment?", "Raak iets aan en beschrijf het in je hoofd", "Kijk naar buiten — wat is het eerste dat opvalt?", "Luister naar het verste geluid dat je kan opvangen", "Zoek iets moois in de ruimte waar je bent", "Welke kleur overheerst om je heen?", "Voel de temperatuur op je huid — warm of koel?", "Zoek iets met een bijzondere textuur", "Let op de schaduwen in de ruimte", "Hoor je achtergrondgeluiden die je normaal negeert?", "Merk op wat er beweegt om je heen", "Kijk naar je handen — bekijk ze echt even", "Focus op één geluid en volg het", "Noem één ding waar je blij mee bent vandaag", "Wie is er voor je geweest deze week?", "Wat is iets dat vanzelfsprekend lijkt maar eigenlijk bijzonder is?", "Welk moment van vandaag was oké of zelfs goed?", "Noem iets aan jezelf waar je tevreden mee bent", "Welk nummer of serie maakt je blij?", "Wie zou je willen bedanken — en waarvoor?", "Wat is het beste dat je deze week gegeten hebt?", "Noem een plek waar je je fijn voelt", "Welke skill heb je die je vroeger niet had?", "Wie snapt jou het best?", "Noem een herinnering die je doet glimlachen", "Waar kijk je naar uit?", "Wat heb je dat niet iedereen heeft?", "Wat maakt je leven een beetje makkelijker?", "Hoe voel je je echt — niet het standaard antwoord?", "Als je gevoel een emoji was — welke?", "Wat houdt je bezig op dit moment?", "Hoe was vandaag op een schaal van 1-10?", "Wat heb je nodig maar vraag je niet snel?", "Als je één ding kon veranderen aan vandaag — wat?", "Ben je moe? Gestrest? Verveeld? Check het even echt", "Wat zou je tegen je beste vriend zeggen als die zich zo voelde?", "Hoe was je energie vandaag?", "Wat is iets dat je wil maar steeds uitstelt?", "Waar ben je het hardst mee bezig in je hoofd?", "Wat deed je goed vandaag dat niemand gezien heeft?", "Hoe wil je je morgen voelen?", "Als je je gevoel moest uitleggen aan een alien — hoe?", "Waar maak je je druk over dat misschien niet zo erg is?", "Wat is iets waar je stiekem best goed in bent?", "Noem een moment dat je trots was op jezelf", "Wat maakt jou anders dan de rest — op een goede manier?", "Welk compliment hoor je het liefst?", "Wat heb je overwonnen dat moeilijk was?", "Wat zou je tegen jezelf van een jaar geleden zeggen?", "Waar ben je sterker in geworden?", "Noem iets dat je hebt volgehouden", "Wat waardeer je aan jezelf dat anderen misschien niet zien?", "Wat is een risico dat je genomen hebt en dat goed uitpakte?", "Waar ga je voor — wat is je ding?", "Noem drie woorden die jou beschrijven", "Wat is het moedigste dat je ooit gedaan hebt?", "Waar wil je over vijf jaar staan?", "Als je een quote moest kiezen voor je leven — welke?", "Sta op en rek je uit — echt goed", "Schud je handen los", "Loop even naar het raam en kijk dertig seconden naar buiten", "Doe een paar kniebuigingen — het geeft energie", "Rol je nek langzaam rond", "Strek je armen boven je hoofd en reik zo hoog mogelijk", "Draai je bovenlichaam naar links en rechts", "Ga even staan als je zit — of zitten als je staat", "Wiebel met je tenen in je schoenen", "Wandel even door de kamer en terug", "Strek je benen als je zit", "Schud je hele lichaam los — alles tegelijk", "Zet je lievelingsnummer op en beweeg mee", "Doe tien jumping jacks — of vijf als dat genoeg is", "Doe een plank voor tien seconden — of probeer het", "Denk aan iemand die je blij maakt", "Stuur een berichtje naar iemand — gewoon omdat", "Wie zou je nu willen spreken?", "Denk aan het beste gesprek dat je recent gehad hebt", "Wat zou je tegen iemand zeggen die zich voelt zoals jij nu?", "Wie is iemand die je inspireert?", "Wat waardeer je het meest aan je vrienden?", "Wie ken je die het nu misschien moeilijk heeft?", "Als je één persoon kon bellen — wie zou het zijn?", "Wat is het leukste compliment dat je ooit gekregen hebt?", "Denk aan iemand die je lang niet gesproken hebt", "Wat zou je voor iemand willen doen vandaag?", "Wie geeft je het gevoel dat je jezelf kan zijn?", "Denk aan een leraar of coach die impact op je had", "Als je een boodschap kon sturen naar de hele wereld — wat?", "Kijk naar de lucht — hoe ziet ze eruit?", "Zoek iets natuurlijks om je heen", "Luister of je iets van natuur hoort — wind, vogels, regen", "Hoe voelt de buitenlucht als je diep inademt?", "Welk seizoen past bij je stemming?", "Kijk naar een boom of plant en merk de details op", "Als je ergens in de natuur kon zijn — waar?", "Merk het weer op — hoe beïnvloedt het je stemming?", "Zoek iets levends om je heen", "Kijk naar de wolken en zoek een vorm", "Welk natuurgeluid kalmeert jou het meest?", "Merk op hoeveel groen er om je heen is", "Kijk naar het licht — is het helder, zacht, warm?", "Hoe ruikt het buiten vandaag?", "Als je een plek in de natuur moest kiezen om te zitten — welke?", "Beschrijf je dag in drie woorden", "Als je stemming een nummer was — welk nummer?", "Welke film of serie past bij hoe je je voelt?", "Als je gevoel een meme was — welke?", "Beschrijf je energie als een percentage", "Welk seizoen is het in je hoofd?", "Als je dag een playlist was — welke vibe?", "Verzin een titel voor vandaag", "Welk karakter uit een serie ben je vandaag?", "Als je mood een kleur had — welke?", "Beschrijf vandaag alsof het een film-review is", "Welk weer is het in je hoofd?", "Als je een superpower had voor de rest van de dag — welke?", "Rate je dag met een emoji", "Als je je gevoel kon posten als story — wat zou erop staan?"]
};
const pickMicro = type => {
  const list = MICRO[type] || MICRO.adult;
  return list[Math.floor(Math.random() * list.length)];
};
const SC = {
  Lente: {
    lf: "#4CAF7A",
    la: "#6BC5A0",
    ll: "#7DD4A8",
    gd: "#4A7A5A",
    gl: "#6A9A72",
    s1: "#5BA3D9",
    s2: "#D4E8F5",
    fl: ["#E07850", "#E8A840", "#5BB8A0", "#4CAF7A"],
    trunk: "#4A5568"
  },
  Zomer: {
    lf: "#3D9E6A",
    la: "#5AB888",
    ll: "#7DCCA0",
    gd: "#3D7A4E",
    gl: "#5A9A62",
    s1: "#4A90C4",
    s2: "#C8DFF0",
    fl: ["#E8A020", "#E07040", "#5BB898", "#4CAF7A"],
    trunk: "#4A5568"
  },
  Herfst: {
    lf: "#D4842A",
    la: "#E6A832",
    ll: "#ECC06A",
    gd: "#6A5A3A",
    gl: "#8A7A50",
    s1: "#8A7D5B",
    s2: "#E8D8C0",
    fl: ["#C4553A", "#E8A840", "#D4842A", "#5BB8A0"],
    trunk: "#4A5060"
  },
  Winter: {
    lf: "#7A9A8A",
    la: "#95B0A0",
    ll: "#B0C8B8",
    gd: "#5A6A5A",
    gl: "#728A78",
    s1: "#6A7F98",
    s2: "#C8D4E0",
    fl: ["#90B0A0", "#A0C0B0", "#B8C8C0"],
    trunk: "#3D4A58"
  }
};
const TOVL = {
  Ochtend: "rgba(255,210,120,0.12)",
  Middag: "rgba(0,0,0,0)",
  Avond: "rgba(255,100,30,0.22)",
  Nacht: "rgba(8,8,50,0.58)"
};

const EX = [{
  id: "basic",
  name: "Basis Ademhaling",
  nameChild: "Rustig ademen",
  nameJunior: "Gewoon ademen",
  desc: "Langzaam in en uit",
  iS: 4,
  oS: 4,
  hI: 0,
  hO: 0,
  r: 22,
  lv: "b",
  en: "calm",
  pts: 15,
  sci: "Diepe buikademhaling activeert je parasympatisch zenuwstelsel en verlaagt je hartslag. Dit is de basis van elke ademhalingstechniek en wetenschappelijk bewezen als effectieve stressvermindering."
}, {
  id: "calm2",
  name: "Kalmerende Ademhaling",
  nameChild: "Rustig worden",
  nameJunior: "Even tot rust komen",
  desc: "4 in, 6 uit — langere uitademing",
  iS: 4,
  oS: 6,
  hI: 0,
  hO: 0,
  r: 18,
  lv: "b",
  en: "calm",
  pts: 18,
  sci: "Een langere uitademing dan inademing stimuleert de nervus vagus en activeert je parasympatisch zenuwstelsel. Klinisch bewezen effectief bij angst en overprikkeling."
}, {
  id: "diaphragm",
  name: "Diafragma Ademhaling",
  nameChild: "Buikademhaling",
  desc: "Diep in je buik ademen",
  iS: 5,
  oS: 5,
  hI: 0,
  hO: 0,
  r: 18,
  lv: "b",
  en: "calm",
  pts: 20,
  sci: "Diafragmatisch ademen verlaagt cortisol tot 50% en verbetert zuurstofopname. Meerdere klinische studies bevestigen effectiviteit bij chronische stress en angst."
}, {
  id: "pursed",
  name: "Pursed Lip Breathing",
  nameChild: "Kaarsje uitblazen",
  desc: "In door neus, uit door getuite lippen",
  iS: 4,
  oS: 6,
  hI: 0,
  hO: 0,
  r: 18,
  lv: "b",
  en: "calm",
  pts: 20,
  sci: "Vertraagt de ademhaling en verbetert gasuitwisseling in de longen. Klinisch bewezen bij COPD, ademhalingsproblemen en acute paniekaanvallen."
}, {
  id: "box",
  name: "Box Breathing",
  nameChild: "Vierkant ademen",
  nameJunior: "Box breathing",
  desc: "4 tellen in, 4 vast, 4 uit, 4 vast",
  iS: 4,
  oS: 4,
  hI: 4,
  hO: 4,
  r: 11,
  lv: "i",
  en: "neutral",
  pts: 35,
  sci: "Box breathing verlaagt cortisol en brengt het autonome zenuwstelsel in balans. Gebruikt door Navy SEALs, hulpdiensten en therapeuten wereldwijd. Peer-reviewed onderzoek bevestigt effectiviteit."
}, {
  id: "478",
  name: "4-7-8 Techniek",
  nameChild: "Tover-ademhaling",
  nameJunior: "Slaap-truc",
  desc: "4 in, 7 vasthouden, 8 uit",
  iS: 4,
  oS: 8,
  hI: 7,
  hO: 0,
  r: 10,
  lv: "i",
  en: "calm",
  pts: 40,
  sci: "Ontwikkeld door Dr. Andrew Weil (Harvard). De verlengde uitademing activeert de parasympatische rustzenuw. Wetenschappelijk bewezen bij slaapproblemen en acute angst."
}, {
  id: "coherence",
  name: "Coherentie Ademhaling",
  nameChild: "Hartje-ademhaling",
  desc: "5,5 sec in, 5,5 sec uit",
  iS: 5.5,
  oS: 5.5,
  hI: 0,
  hO: 0,
  r: 16,
  lv: "i",
  en: "neutral",
  pts: 35,
  sci: "Brengt je hart in coherentie met je ademhaling op ~6 ademhalingen per minuut. Het HeartMath Institute heeft uitgebreid onderzoek gepubliceerd over hartcoherentie en emotionele regulatie."
}, {
  id: "sigh",
  name: "Fysiologische Zucht",
  nameChild: "Grote zucht",
  nameJunior: "Alles eruit blazen",
  desc: "Dubbele inademing, lange uitademing",
  iS: 2,
  oS: 6,
  hI: 0,
  hO: 0,
  r: 22,
  lv: "i",
  en: "calm",
  pts: 25,
  sci: "Stanford University onderzoek (Huberman Lab) toont aan dat een dubbele inademing gevolgd door verlengde uitademing de snelste bekende methode is om het zenuwstelsel te kalmeren."
}, {
  id: "alternate",
  name: "Alternate Nostril",
  nameChild: "Links-rechts ademen",
  desc: "Rechterhand omhoog. Duim sluit rechts, ringvinger sluit links. Adem in door links → vasthouden → uit door rechts → in door rechts → vasthouden → uit door links. Herhaal.",
  iS: 4,
  oS: 4,
  hI: 2,
  hO: 2,
  r: 12,
  lv: "x",
  en: "neutral",
  pts: 55,
  sci: "Nadi Shodhana balanceert het sympathisch en parasympatisch zenuwstelsel. Peer-reviewed studies tonen significante vermindering van angst en verbetering van cardiovasculaire functie."
}, {
  id: "resonance",
  name: "Resonantie Ademhaling",
  nameChild: "Jouw ritme",
  desc: "Op je eigen optimale frequentie",
  iS: 5,
  oS: 5,
  hI: 0,
  hO: 0,
  r: 18,
  lv: "x",
  en: "neutral",
  pts: 60,
  sci: "Elke persoon heeft een eigen optimale ademfrequentie (4.5-6.5/min) die maximale hartritmevariabiliteit oplevert. Bewezen bij PTSD, depressie en chronische pijn."
}, {
  id: "wimhof",
  name: "Wim Hof (aangepast)",
  nameChild: "Superheld ademen",
  warn: "\u26A0\uFE0F LEES DIT VOOR JE BEGINT. Doe dit altijd zittend of liggend op een veilige plek. Nooit staand, in water, op hoogte of achter het stuur. Door snelle ademhaling daalt je CO\u2082 \u2014 je zal tintelingen voelen in handen, voeten of lippen en mogelijk licht duizelig worden. Dit is normaal maar STOP direct als je krampachtig wordt of het bewustzijn verliest. Niet doen bij epilepsie, zwangerschap, hoog- of laagbloeddruk, hart- of longaandoeningen, of wanneer je je emotioneel instabiel voelt. Deze oefening is enkel geschikt als je al regelmatig ademoefeningen doet en je stabiel voelt.",
  desc: "Krachtig inademen, passief uitademen",
  iS: 2,
  oS: 2,
  hI: 0,
  hO: 0,
  r: 30,
  lv: "x",
  en: "up",
  pts: 75,
  sci: "Wetenschappelijk bewezen effect op het immuunsysteem en stressrespons (Radboud UMC studie). Verhoogt energie en alertheid. Uitsluitend voor ervaren beoefenaars."
}, {
  id: "energize",
  name: "Energetiserende Ademhaling",
  nameChild: "Raket-ademhaling",
  warn: "\u26A0\uFE0F LEES DIT VOOR JE BEGINT. Doe dit zittend op een stabiele plek, nooit staand of achter het stuur. Door de snelle buikkrampen kan je duizelig worden of tintelingen voelen \u2014 dit is normaal. Stop direct als het oncomfortabel wordt. Niet geschikt bij epilepsie, zwangerschap, hoge bloeddruk, maag- of darmklachten of hyperventilatieklachten. Enkel geschikt als je al vertrouwd bent met ademoefeningen en je stabiel en uitgerust voelt.",
  desc: "Snelle ritmische neusademhaling",
  iS: 1.5,
  oS: 1.5,
  hI: 0,
  hO: 0,
  r: 40,
  lv: "x",
  en: "up",
  pts: 65,
  sci: "Kapalabhati-variant die het sympathisch zenuwstelsel activeert. Klinisch bewezen voor verhoogde alertheid en mentale helderheid. Niet geschikt bij angst of paniek."
}];
const GRND = ["Noem 5 dingen die je ZIET 👀", "Noem 4 dingen die je HOORT 👂", "Noem 3 dingen die je VOELT ✋", "Noem 2 dingen die je RUIKT 👃", "Noem 1 ding dat je PROEFT 👅"];
const BSCAN = ["Voel je voeten op de grond 🦶", "Merk je benen op", "Voel je buik — adem hier naartoe", "Let op je schouders — laat ze zakken", "Ontspan je gezicht en kaak"];
const VIS = ["Sluit je ogen 👁️", "Stel je een veilige plek voor", "Voel de warmte, hoor de geluiden", "Blijf hier rustig ademen", "Open langzaam je ogen"];
