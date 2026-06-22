#!/usr/bin/env node
// One-time puzzle generator — run with: node gen.js
// Outputs: paths4.json, puzzles5.json, allwords5.txt

const fs = require('fs');

// ── Shared BFS ───────────────────────────────────────────────────────────────

function makeNeighborFn(wordSet, len) {
  return function(word) {
    const out = [];
    for (let i = 0; i < len; i++) {
      for (let c = 65; c <= 90; c++) {
        if (word.charCodeAt(i) === c) continue;
        const candidate = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);
        if (wordSet.has(candidate)) out.push(candidate);
      }
    }
    return out;
  };
}

function bfs(start, target, neighborFn, maxLen) {
  if (start === target) return [start];
  const queue = [[start]], visited = new Set([start]);
  while (queue.length) {
    const path = queue.shift();
    if (maxLen && path.length >= maxLen) continue;
    for (const w of neighborFn(path[path.length - 1])) {
      if (visited.has(w)) continue;
      const next = [...path, w];
      if (w === target) return next;
      visited.add(w);
      queue.push(next);
    }
  }
  return null;
}

// ── 4-letter: pre-compute paths for existing puzzles ────────────────────────

const WORDS4 = new Set(
  'ABLE ACID AGED ALSO ALTO ARCH AREA ARMY AWAY BABY BACK BAKE BALE BALL BAND BANK BARE BARK BARN BASE BATH BEAD BEAK BEAM BEAN BEAR BEAT BEEN BEEF BEER BEES BEET BELL BELT BIAS BIKE BILE BIRD BITE BLED BLOT BLUE BOAT BODY BOLD BOLT BONE BOOK BOOM BOOT BORE BORN BOTH BRAN BRAT BRIM BUMP BURN BUSH BUSY CAKE CALL CALM CAME CAMP CAPE CARD CARE CART CASE CASH CAST CAVE CHIN CHIP CITY CLAM CLAN CLAP CLAY CLIP CLOG CLUB COAL COAT COIL COLD COME COOL CORD CORE CORK CORN COST COUP COVE CREW CROP CROW CUBE CURD CURE DARE DARK DASH DATA DATE DAWN DEAD DEAL DEAR DECK DEED DEEP DEER DELL DENY DESK DIAL DICE DIET DILL DIME DINE DISH DISK DOCK DONE DOOM DOOR DOSE DOVE DOWN DRAG DRAW DREW DRIP DROP DRUM DUAL DUCK DULL DUMB DUMP DUNE DUPE DUST DUTY EACH EARL EARN EASE EAST EASY EDGE ELSE EMIT EPIC EVEN EVER EVIL FACE FACT FADE FAIL FAIR FAKE FALL FAME FARE FARM FAST FATE FEAR FEAT FEED FEEL FEET FELT FERN FILE FILL FILM FIND FINE FIRE FIRM FISH FIST FLAG FLAT FLAW FLEA FLED FLEW FLIP FLOG FLOW FOAM FOLD FOND FONT FOOD FOOL FORD FORE FORK FORM FORT FOUL FOUR FOWL FREE FROM FUEL FULL FUND FUSE FUSS GALE GAME GANG GASP GATE GAVE GEAR GENE GERM GIFT GIRL GIVE GLAD GLOW GLUE GOLD GOLF GONE GONG GOOD GORE GRAB GRAM GRAY GREY GRIM GRIN GRIP GRIT GROW GULF GUST HACK HALF HALL HALT HANG HARD HARE HARM HASH HATE HAVE HAZE HEAD HEAL HEAP HEAR HEAT HEEL HELP HERE HERB HERO HIGH HILL HINT HIRE HOLD HOLE HOLY HOME HOOD HOOK HOPE HORN HOUR HUMP HUNG HUNT HURT ICED IDEA IDLE INCH INTO IRON ITEM JACK JADE JAIL JOLT JUMP JUST KALE KEEN KEEP KICK KIND KING KNIT KNOT KNOW LACE LACK LAID LAKE LAME LAMP LANE LARD LARK LAST LATE LAUD LEAD LEAF LEAN LEAP LEFT LEEK LEND LENT LESS LIAR LICK LIFE LIFT LIKE LIME LIMP LINE LINK LION LISP LIST LIVE LOBE LOCK LOFT LONG LOOK LOOM LOOT LORE LOSE LOSS LUMP LURE LURK LUSH MADE MAIL MAIN MAKE MALE MALL MALT MANE MARE MARK MARS MAST MATE MAZE MEAL MEAN MEAT MEET MELT MEND MENU MERE MESH MICE MILD MILE MILK MILL MIND MINE MINK MINT MISS MIST MISO MODE MOCK MOLE MOLT MOOD MOON MOOT MORE MOST MOVE MUCK MULE MUSE MUST NAAN NAIL NAME NAVY NEAR NECK NEED NEWS NEXT NODE NONE NOON NORM NOSE NOTE NOUN NUDE NUMB OATH OATS OBOE ONLY OPEN OVAL OVER OVEN PACK PAGE PAID PAIN PAIR PALE PALM PANE PARE PARK PART PAST PATH PAVE PAWN PEAL PEAK PEAR PEAS PEAT PEEL PEER PEST PICK PIER PILE PINE PINK PINT PIPE PITH PLAN PLAY PLEA PLED PLOD PLOP PLOT PLOW PLUM PLUS POEM POKE POLE POND POOR PORK PORT POSE POST POUR PREY PRIM PROD PROM PROP PULL PULP PUMP PUNT PURE PUSH RACE RACK RAGE RAID RAIL RAIN RAKE RAMP RANG RANK RANT RASH RASP RATE READ REAL REAP REAR REEF REEL REIN RELY REND RENT RICE RICH RIDE RIFE RIFT RIND RING RINK RIOT RISE RISK ROAD ROAM ROAR ROBE ROCK RODE ROLE ROLL ROOF ROOM ROOT ROPE ROSE ROUX RUIN RULE RUMP RUSE RUSH RUST SACK SAFE SAGE SAIL SALE SALT SAME SAND SANE SANG SASH SATE SAVE SCAN SCAT SEAM SEAL SEAT SEED SEEK SEEM SEAR SHED SHOP SHOT SHOW SHUT SICK SIDE SIFT SIGH SILK SILL SILO SILT SINK SIRE SITE SIZE SKIM SKIN SKIP SLAG SLAP SLAT SLED SLIM SLIP SLOG SLOW SLUG SLUM SNOW SOAK SOAP SOAR SOCK SOFT SOIL SOLE SOME SONG SOON SORE SORT SOUL SOUR SPAN SPAR SPAT SPIN SPIT SPOT SPUR STAR STAY STEM STEP STEW STUB STUN SUCH SUIT SULK SUMP SUNG SUNK SURF SWAN SWAT SWIM SYNC TACK TAKE TALE TALL TAME TANK TAPE TASK TAUT TEAK TEAL TEAM TEAR TEEM TELL TEND TENT TERM THAN THAT THEM THEN THEY THIN THIS THUS TICK TIDE TILE TILL TILT TIME TOAD TOIL TOLD TOLL TOMB TONE TOOL TORE TORN TOSS TOUR TOWN TRAP TREK TRIM TRIO TRIP TROD TROT TRUE TUCK TUNA TUNE TURF TURN TUSK TWIN TYPE UGLY UNDO UNIT UPON URGE VAIN VALE VANE VARY VASE VAST VEAL VEIL VEIN VERY VEST VILE VINE VOID VOLT VOTE WADE WAGE WAKE WALK WALL WANE WARD WARM WARN WARP WARY WAVE WEAK WEAL WEED WELD WELL WENT WEPT WERE WEST WHIM WHIP WIFE WILD WILL WILT WINE WING WINK WIPE WIRE WISE WISH WOKE WOMB WORD WORE WORK WORM WORN WRAP WREN YARN YELL YOLK YORE YOUR ZEAL ZEST ZONE ZOOM'
  .split(' ')
);

const nb4 = makeNeighborFn(WORDS4, 4);

const PUZZLES4_RAW = [
  {start:'BEEF',target:'MALT'},{start:'BEEF',target:'DILL'},{start:'BEEF',target:'KALE'},
  {start:'BEEF',target:'MEAL'},{start:'BEEF',target:'SALT'},{start:'BEEF',target:'LEEK'},
  {start:'BEEF',target:'PEAS'},{start:'BEEF',target:'ZEST'},{start:'BEER',target:'KALE'},
  {start:'BEEF',target:'VEAL'},{start:'BEER',target:'DILL'},{start:'BEET',target:'CAKE'},
  {start:'BEER',target:'MALT'},{start:'BEER',target:'LEEK'},{start:'BEET',target:'CORN'},
  {start:'BEER',target:'MEAL'},{start:'BEER',target:'SALT'},{start:'BEET',target:'CURD'},
  {start:'BEER',target:'VEAL'},{start:'BEER',target:'ZEST'},{start:'BEET',target:'MILK'},
  {start:'BEET',target:'DILL'},{start:'BEET',target:'KALE'},{start:'BEET',target:'MINT'},
  {start:'BEET',target:'SALT'},{start:'BEET',target:'LEEK'},{start:'BEET',target:'MISO'},
  {start:'BEET',target:'VEAL'},{start:'BEAN',target:'DILL'},{start:'BEET',target:'PORK'},
  {start:'BEET',target:'ZEST'},{start:'BEAN',target:'LEEK'},{start:'BEET',target:'SAGE'},
  {start:'BEAN',target:'MALT'},{start:'BEAN',target:'SALT'},{start:'BEAN',target:'KALE'},
  {start:'BEAN',target:'ZEST'},{start:'BRAN',target:'MALT'},{start:'BEAN',target:'MINT'},
  {start:'BRAN',target:'PEAS'},{start:'BRAN',target:'ZEST'},{start:'BEAN',target:'PORK'},
  {start:'BRAN',target:'VEAL'},{start:'CAKE',target:'DILL'},{start:'BRAN',target:'DILL'},
  {start:'CAKE',target:'HERB'},{start:'CAKE',target:'FISH'},{start:'BRAN',target:'LEEK'},
  {start:'CAKE',target:'MILK'},{start:'CAKE',target:'MISO'},{start:'BRAN',target:'SALT'},
  {start:'CAKE',target:'MINT'},{start:'CAKE',target:'ZEST'},{start:'CAKE',target:'DUCK'},
  {start:'CAKE',target:'PORK'},{start:'CORN',target:'HERB'},{start:'CAKE',target:'MEAL'},
  {start:'CAKE',target:'SALT'},{start:'CORN',target:'KALE'},{start:'CAKE',target:'PEAR'},
  {start:'CAKE',target:'VINE'},{start:'CORN',target:'LIME'},{start:'CAKE',target:'PEAS'},
  {start:'CORN',target:'WINE'},{start:'CORN',target:'MALT'},{start:'CAKE',target:'TUNA'},
  {start:'DILL',target:'KALE'},{start:'CORN',target:'MILK'},{start:'CAKE',target:'VEAL'},
  {start:'DILL',target:'LIME'},{start:'CORN',target:'SAGE'},{start:'CORN',target:'DILL'},
  {start:'DILL',target:'MINT'},{start:'CORN',target:'SALT'},{start:'CORN',target:'FISH'},
  {start:'DILL',target:'PEAR'},{start:'CORN',target:'TUNA'},{start:'CORN',target:'MINT'},
  {start:'DILL',target:'PEAS'},{start:'CORN',target:'VINE'},{start:'CORN',target:'RICE'},
  {start:'DILL',target:'RICE'},{start:'CURD',target:'HERB'},{start:'CORN',target:'ZEST'},
  {start:'DILL',target:'VINE'},{start:'CURD',target:'KALE'},{start:'CURD',target:'DILL'},
  {start:'DILL',target:'WINE'},{start:'CURD',target:'LIME'},{start:'CURD',target:'FISH'},
  {start:'FISH',target:'MALT'},{start:'CURD',target:'MALT'},{start:'CURD',target:'MILK'},
  {start:'FISH',target:'RICE'},{start:'CURD',target:'SAGE'},{start:'CURD',target:'MINT'},
  {start:'FISH',target:'VINE'},{start:'CURD',target:'WINE'},{start:'CURD',target:'MISO'},
  {start:'HERB',target:'LARD'},{start:'DILL',target:'SAGE'},{start:'CURD',target:'RICE'},
  {start:'HERB',target:'WINE'},{start:'DUCK',target:'FISH'},{start:'CURD',target:'SALT'},
  {start:'KALE',target:'LIME'},{start:'DUCK',target:'LARD'},{start:'CURD',target:'TUNA'},
  {start:'KALE',target:'MINT'},{start:'DUCK',target:'MILK'},{start:'CURD',target:'VINE'},
  {start:'KALE',target:'PORK'},{start:'DUCK',target:'PORK'},{start:'CURD',target:'ZEST'},
  {start:'KALE',target:'RICE'},{start:'DUCK',target:'RICE'},{start:'DILL',target:'DUCK'},
  {start:'KALE',target:'WINE'},{start:'FISH',target:'LIME'},{start:'DILL',target:'HERB'},
  {start:'LIME',target:'MILK'},{start:'FISH',target:'MILK'},{start:'DILL',target:'MISO'},
  {start:'LIME',target:'SALT'},{start:'FISH',target:'SALT'},{start:'DILL',target:'PORK'},
  {start:'MALT',target:'PEAR'},{start:'FISH',target:'ZEST'},{start:'DILL',target:'ZEST'},
  {start:'MALT',target:'PEAS'},{start:'HERB',target:'KALE'},{start:'DUCK',target:'LIME'},
  {start:'MALT',target:'RICE'},{start:'HERB',target:'MALT'},{start:'DUCK',target:'MINT'},
  {start:'MALT',target:'VEAL'},{start:'HERB',target:'PORK'},{start:'DUCK',target:'PEAR'},
  {start:'MALT',target:'VINE'},{start:'HERB',target:'SAGE'},{start:'DUCK',target:'SAGE'},
  {start:'MALT',target:'WINE'},{start:'HERB',target:'VINE'},{start:'DUCK',target:'SALT'},
  {start:'MALT',target:'ZEST'},{start:'KALE',target:'LARD'},{start:'DUCK',target:'VINE'},
  {start:'MEAL',target:'SALT'},{start:'KALE',target:'MEAL'},{start:'DUCK',target:'WINE'},
  {start:'MEAL',target:'ZEST'},{start:'KALE',target:'MISO'},{start:'FISH',target:'HERB'},
  {start:'MILK',target:'MISO'},{start:'KALE',target:'VEAL'},{start:'FISH',target:'KALE'},
  {start:'MILK',target:'SAGE'},{start:'KALE',target:'ZEST'},{start:'FISH',target:'LARD'},
  {start:'MINT',target:'SAGE'},{start:'LARD',target:'LIME'},{start:'FISH',target:'PEAR'},
  {start:'MINT',target:'SALT'},{start:'LARD',target:'MALT'},{start:'FISH',target:'PEAS'},
  {start:'MISO',target:'SALT'},{start:'LARD',target:'RICE'},{start:'FISH',target:'PORK'},
  {start:'MISO',target:'VINE'},{start:'LARD',target:'SAGE'},{start:'FISH',target:'SAGE'},
  {start:'MISO',target:'WINE'},{start:'LARD',target:'WINE'},{start:'HERB',target:'LIME'},
  {start:'PORK',target:'SAGE'},{start:'LEEK',target:'MEAL'},{start:'HERB',target:'MILK'},
  {start:'PORK',target:'WINE'},{start:'LEEK',target:'PEAR'},{start:'HERB',target:'MINT'},
  {start:'PORK',target:'ZEST'},{start:'LEEK',target:'VEAL'},{start:'HERB',target:'RICE'},
  {start:'SALT',target:'VINE'},{start:'LIME',target:'MALT'},{start:'HERB',target:'SALT'},
  {start:'SALT',target:'WINE'},{start:'LIME',target:'MISO'},{start:'KALE',target:'PEAR'},
  {start:'TUNA',target:'VINE'},{start:'LIME',target:'TUNA'},{start:'KALE',target:'PEAS'},
  {start:'TUNA',target:'WINE'},{start:'MALT',target:'PORK'},{start:'LARD',target:'MILK'},
  {start:'VEAL',target:'ZEST'},{start:'MEAL',target:'MILK'},{start:'LARD',target:'MINT'},
  {start:'MILK',target:'VEAL'},{start:'LARD',target:'MISO'},{start:'MINT',target:'PORK'},
  {start:'LARD',target:'SALT'},{start:'MINT',target:'TUNA'},{start:'LARD',target:'VINE'},
  {start:'MINT',target:'ZEST'},{start:'LARD',target:'ZEST'},{start:'MISO',target:'PORK'},
  {start:'LEEK',target:'PEAS'},{start:'MISO',target:'RICE'},{start:'LIME',target:'MEAL'},
  {start:'MISO',target:'ZEST'},{start:'LIME',target:'PORK'},{start:'PEAR',target:'PORK'},
  {start:'LIME',target:'VEAL'},{start:'PEAR',target:'SALT'},{start:'MEAL',target:'MINT'},
  {start:'PEAS',target:'PORK'},{start:'MEAL',target:'MISO'},{start:'PEAS',target:'SALT'},
  {start:'MEAL',target:'PORK'},{start:'PORK',target:'RICE'},{start:'MEAL',target:'SAGE'},
  {start:'PORK',target:'SALT'},{start:'MEAL',target:'VINE'},{start:'PORK',target:'VINE'},
  {start:'MILK',target:'PEAR'},{start:'RICE',target:'SALT'},{start:'MILK',target:'PEAS'},
  {start:'RICE',target:'TUNA'},{start:'MILK',target:'PORK'},{start:'SALT',target:'VEAL'},
  {start:'MILK',target:'TUNA'},{start:'SALT',target:'ZEST'},{start:'MINT',target:'PEAR'},
  {start:'VINE',target:'ZEST'},{start:'MINT',target:'PEAS'},{start:'MINT',target:'VEAL'},
  {start:'MISO',target:'PEAR'},{start:'MISO',target:'PEAS'},{start:'MISO',target:'SAGE'},
  {start:'PORK',target:'TUNA'},{start:'PORK',target:'VEAL'},{start:'RICE',target:'ZEST'},
  {start:'SAGE',target:'VEAL'},{start:'SAGE',target:'ZEST'},{start:'VEAL',target:'VINE'},
  {start:'WINE',target:'ZEST'},
  {start:'BEEF',target:'BRAN'},{start:'BEEF',target:'PEAR'},{start:'BEER',target:'BRAN'},
  {start:'BEER',target:'PEAS'},{start:'BEET',target:'BRAN'},{start:'BEET',target:'MALT'},
  {start:'BEET',target:'MEAL'},{start:'BEET',target:'PEAR'},{start:'BEET',target:'PEAS'},
  {start:'BEAN',target:'PEAS'},{start:'BEAN',target:'VEAL'},{start:'BRAN',target:'MEAL'},
  {start:'BRAN',target:'PEAR'},{start:'CAKE',target:'CORN'},{start:'CAKE',target:'CURD'},
  {start:'CAKE',target:'KALE'},{start:'CAKE',target:'LARD'},{start:'CAKE',target:'LIME'},
  {start:'CAKE',target:'MALT'},{start:'CAKE',target:'RICE'},{start:'CAKE',target:'SAGE'},
  {start:'CAKE',target:'WINE'},{start:'CORN',target:'LARD'},{start:'CURD',target:'PORK'},
  {start:'DILL',target:'MALT'},{start:'DILL',target:'MEAL'},{start:'DILL',target:'SALT'},
  {start:'DILL',target:'VEAL'},{start:'FISH',target:'MINT'},{start:'FISH',target:'MISO'},
  {start:'FISH',target:'WINE'},{start:'KALE',target:'MILK'},{start:'KALE',target:'VINE'},
  {start:'LARD',target:'PORK'},{start:'LIME',target:'MINT'},{start:'LIME',target:'RICE'},
  {start:'LIME',target:'SAGE'},{start:'MALT',target:'MEAL'},{start:'MALT',target:'MILK'},
  {start:'MALT',target:'MINT'},{start:'MALT',target:'MISO'},{start:'MALT',target:'SAGE'},
  {start:'MILK',target:'RICE'},{start:'MILK',target:'SALT'},{start:'MILK',target:'VINE'},
  {start:'MILK',target:'WINE'},{start:'MINT',target:'RICE'},{start:'PEAR',target:'ZEST'},
  {start:'PEAS',target:'ZEST'},{start:'RICE',target:'SAGE'},{start:'RICE',target:'VINE'},
  {start:'RICE',target:'WINE'},{start:'SAGE',target:'VINE'},{start:'SAGE',target:'WINE'},
];

process.stderr.write(`Computing ${PUZZLES4_RAW.length} four-letter paths...\n`);
const PUZZLES4 = PUZZLES4_RAW.map(p => ({
  start: p.start, target: p.target,
  path: bfs(p.start, p.target, nb4) || [p.start, p.target]
}));
process.stderr.write(`Done.\n`);

fs.writeFileSync('/Users/arti/dev/spice-mix/paths4.json', JSON.stringify(PUZZLES4));
process.stderr.write(`Wrote paths4.json\n`);

// ── 5-letter: generate puzzle pairs ─────────────────────────────────────────

const raw5 = fs.readFileSync('/usr/share/dict/words', 'utf8')
  .split('\n')
  .filter(w => /^[a-z]{5}$/.test(w))
  .map(w => w.toUpperCase());

const DICT5 = new Set(raw5);
const nb5 = makeNeighborFn(DICT5, 5);

process.stderr.write(`5-letter dictionary: ${DICT5.size} words\n`);

// Food / kitchen seed words — candidates for puzzle starts and targets
const FOOD_SEEDS = [
  'BREAD','CREAM','GRAIN','TOAST','ROAST','FEAST','YEAST','BASIL','THYME',
  'OLIVE','LEMON','ONION','BACON','BROTH','CRUST','CHIVE','CLOVE','CUMIN',
  'CURRY','FUDGE','GRAVY','HONEY','MAPLE','MELON','MINCE','PEACH','PECAN',
  'PESTO','PRAWN','PRUNE','RAMEN','SCONE','STEAK','WHEAT','FLOUR','SUGAR',
  'PASTA','SAUCE','SPICE','BRINE','GUAVA','JELLY','CHILI','CHARD','MOCHA',
  'PILAF','TROUT','QUAIL','TRIPE','TORTE','SNACK','SMOKE','GLAZE','POACH',
  'CAPON','CAPER','CHILE','FLANK','JERKY','MOCHI','SPELT','TATER','TUBER',
  'WAFER','GRUEL','DATES','LEEKS','YOLKS','PLUMS','POPPY','RINDS','SAVOY',
  'SPRAT','SQUID','WHELK','COCOA','HERBS','TAFFY','NAANS','CREPE','CRUMB',
  'CRISP','BASTE','BLAND','BLEND','BRINY','BROIL','CAFFE','CANDY','CAULI',
  'CHAMP','CHOPS','CIDER','CLAMS','CUTTY','DOUGH','DRAFT','DRIED','DRUPE',
  'DUMPL','EMBER','FILED','FILET','FLAKY','FROND','FROTH','FROZE','FRUIT',
  'GRILL','GRIND','GRITS','GROAT','HALVA','HAZEL','LEACH','LOAVE','MANGO',
  'MAQUE','MARZI','MIXED','MORTAR','NACHO','NOODLE','NUTTY','OKRAS','OATEN',
  'PARCH','PEARL','PEASE','PEELS','PEPPY','PERCH','PILAU','PIZZA','PLUCK',
  'POULT','POUTY','PROSO','PUDGY','PUNCH','QUARK','RANCH','RASHE','RELISH',
  'RINSE','RISEN','ROAST','ROCKY','ROSIE','ROSTI','ROUGH','ROUND','RUMEN',
  'SAUTE','SAVVY','SEEDY','SHRED','SKIMP','SLICE','SLOSH','SMOKE','SMOKY',
  'SNIPE','SOUSE','SPEAR','SPILL','SPINY','STALE','STEAM','STEEP','STEEP',
  'STIFF','STILT','STIRR','STOCK','STONE','STOUT','STRAW','STREW','STRIP',
  'STROP','STUFF','SUGAR','SWAMP','SWEET','SWIRL','SYRUP','TAINT','TANGY',
  'TAPAS','TAUPE','TAWNY','TENCH','TERSE','TOAST','TODDY','TONIC','TORSO',
  'TOUGH','TRAIL','TRIPE','TRUSS','TUILE','TULIP','TUTTI','TWICE','UMAMI',
  'VAPID','VAPOR','VEGAN','VEINY','VIAND','VODKA','WADES','WHIRL','WHOLE',
  'WITTY','WOODY','WORMY','WORST','WURST',
].filter(w => w.length === 5 && DICT5.has(w));

// Deduplicate seeds
const seedSet = [...new Set(FOOD_SEEDS)];
process.stderr.write(`Valid food seeds: ${seedSet.length} — ${seedSet.join(', ')}\n`);

// BFS between all pairs, collect those with path length 3–7 (2–6 steps)
process.stderr.write(`Generating 5-letter pairs (${seedSet.length} seeds, ${seedSet.length*(seedSet.length-1)/2} pairs to check)...\n`);

const pairs5 = [];
const seen5 = new Set();
for (let i = 0; i < seedSet.length; i++) {
  for (let j = i + 1; j < seedSet.length; j++) {
    const path = bfs(seedSet[i], seedSet[j], nb5, 8); // max path length 8 = 7 steps
    if (path && path.length >= 5 && path.length <= 7) {
      pairs5.push({ start: seedSet[i], target: seedSet[j], path });
    }
  }
  if (i % 10 === 0) process.stderr.write(`  seed ${i+1}/${seedSet.length}, pairs so far: ${pairs5.length}\n`);
}

process.stderr.write(`Total 5-letter pairs: ${pairs5.length}\n`);

// Sort: interleave path lengths for variety (same approach as 4-letter game)
// Group by path length, then interleave
const byLen = {};
for (const p of pairs5) {
  const l = p.path.length;
  if (!byLen[l]) byLen[l] = [];
  byLen[l].push(p);
}
const lengths = Object.keys(byLen).map(Number).sort();
const interleaved = [];
const maxGroup = Math.max(...lengths.map(l => byLen[l].length));
for (let i = 0; i < maxGroup; i++) {
  for (const l of lengths) {
    if (byLen[l][i]) interleaved.push(byLen[l][i]);
  }
}

const final5 = interleaved.slice(0, 300);
process.stderr.write(`Final 5-letter puzzles: ${final5.length}\n`);

fs.writeFileSync('/Users/arti/dev/spice-mix/puzzles5.json', JSON.stringify(final5));
process.stderr.write(`Wrote puzzles5.json\n`);

// ALL_WORDS5: full 5-letter dictionary as space-separated uppercase string
const allWords5str = Array.from(DICT5).sort().join(' ');
fs.writeFileSync('/Users/arti/dev/spice-mix/allwords5.txt', allWords5str);
process.stderr.write(`Wrote allwords5.txt (${allWords5str.length} chars, ${DICT5.size} words)\n`);

process.stderr.write(`\nDone! Files written:\n  paths4.json\n  puzzles5.json\n  allwords5.txt\n`);
