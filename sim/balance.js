/**
 * Balance report for Threes Drop.
 *
 *   node sim/balance.js                 - 100 runs per level, 200 endless games
 *   node sim/balance.js --runs 50       - fewer runs, faster
 *   node sim/balance.js --seed 7        - different deterministic seed
 *   node sim/balance.js --markdown      - emit docs/BALANCE.md body
 *
 * Re-run after changing levels.json, the unlock thresholds, or the spawn
 * weights in BoardLogic.
 */
const { loadGame, seedRandom, playEndless, playLevel, needsSpecialTiles } = require('./bot');

const args = process.argv.slice(2);
function flag(name, fallback) {
  const i = args.indexOf('--' + name);
  if (i === -1) return fallback;
  const v = args[i + 1];
  return v === undefined || v.startsWith('--') ? true : Number(v);
}

const RUNS = flag('runs', 100);
const ENDLESS_RUNS = flag('endless', 200);
const SEED = flag('seed', 1);
const MARKDOWN = args.includes('--markdown');

const started = Date.now();
const { BoardLogic, GameConfig, levelManager } = loadGame();
seedRandom(SEED);

function median(values) {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

/**
 * Median that returns a value that actually occurred. Tile values are
 * categorical (1, 2, 3, 6, 12, 24...), so averaging the two middle samples
 * invents tiles like 36 that the game cannot produce.
 */
function medianObserved(values) {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor((s.length - 1) / 2)];
}

function pct(n, total) {
  return total === 0 ? '0%' : Math.round((n / total) * 100) + '%';
}

const out = [];
const say = (line = '') => out.push(line);

// ---------------------------------------------------------------- endless
const endless = [];
for (let i = 0; i < ENDLESS_RUNS; i++) endless.push(playEndless({ BoardLogic }));

const scores = endless.map((r) => r.score);
const highest = endless.map((r) => r.highestTile);
const merges = endless.map((r) => r.merges);

say('## Original mode');
say();
say('`' + ENDLESS_RUNS + ' games, played to board-full. Swipe used when affordable; no other power-ups.`');
say();
say('| metric | median | p10 | p90 | max |');
say('| --- | --- | --- | --- | --- |');
const sorted = (a) => [...a].sort((x, y) => x - y);
function row(label, values, mid = median) {
  const s = sorted(values);
  const p = (q) => s[Math.min(s.length - 1, Math.floor(s.length * q))];
  say(`| ${label} | ${mid(values)} | ${p(0.1)} | ${p(0.9)} | ${s[s.length - 1]} |`);
}
row('score', scores);
row('moves', endless.map((r) => r.moves));
row('highest tile', highest, medianObserved);
row('merges earned', merges);
row('swipes used', endless.map((r) => r.swipes));
say();

// Are the score-gated unlocks ever reached?
say('### Tile unlocks reached');
say();
say('`UNLOCK_THRESHOLDS` gates higher spawns behind score. Share of games that got there:');
say();
say('| tile | needs score | games reaching it |');
say('| --- | --- | --- |');
for (const [tile, threshold] of Object.entries(GameConfig.UNLOCK_THRESHOLDS)) {
  const reached = scores.filter((s) => s >= threshold).length;
  say(`| ${tile} | ${threshold} | ${pct(reached, scores.length)} |`);
}
say();

// Can the economy actually be used?
say('### Power-up affordability');
say();
say('Merges are the currency. Measured against gross merges earned across a');
say('game, so these are ceilings - a player spending on swipes has less.');
say();
say('| power-up | cost | games that could ever afford it |');
say('| --- | --- | --- |');
const costs = [
  ['Swipe', GameConfig.POWERUPS.SWIPE_COST],
  ['Swapper', GameConfig.POWERUPS.SWAPPER_COST],
  ['Merger', GameConfig.POWERUPS.MERGER_COST],
  ['Wildcard', GameConfig.POWERUPS.WILDCARD_COST],
  ['Frenzy', GameConfig.POWERUPS.FRENZY_THRESHOLD]
];
for (const [name, cost] of costs) {
  const afford = merges.filter((m) => m >= cost).length;
  say(`| ${name} | ${cost} | ${pct(afford, merges.length)} |`);
}
say();

// ----------------------------------------------------------------- levels
const levels = levelManager.getAllLevels().slice().sort((a, b) => a.id - b.id);
const plain = levels.filter((l) => !needsSpecialTiles(l));
const special = levels.filter((l) => needsSpecialTiles(l));

say('## Levels');
say();
say('`' + RUNS + ' attempts each. A tutorial level 1 should sit near 95%.`');
say();
say('| # | name | objective | moves | win | med moves | median score |');
say('| --- | --- | --- | --- | --- | --- | --- |');

// The bot only knows the swipe power-up. Levels built around the others are
// marked, because their win rate is a floor rather than a measurement.
const unmodelled = (l) => {
  const p = l.powerUps || {};
  return !!(p.swapper || p.merger || p.wildcard);
};

const levelRows = [];
for (const level of plain) {
  const results = [];
  for (let i = 0; i < RUNS; i++) results.push(playLevel(level, { BoardLogic, levelManager }));
  const wins = results.filter((r) => r.won);
  const winRate = Math.round((wins.length / results.length) * 100);
  levelRows.push({ level, winRate });
  const obj = level.objective;
  const objText = obj.type === 'create_tile' ? `make ${obj.count}x ${obj.value}`
    : obj.type === 'score' ? `score ${obj.target}`
    : obj.type === 'max_tiles' ? `at most ${obj.count} tiles`
    : obj.type === 'survival' ? `survive ${obj.moves}`
    : obj.type;
  const mark = unmodelled(level) ? ' +' : '';
  say(`| ${level.id} | ${level.name}${mark} | ${objText} | ${level.maxMoves} | ${winRate}% | ${median(results.map((r) => r.moves))} | ${median(results.map((r) => r.score))} |`);
}
say();
if (plain.some(unmodelled)) {
  say('`+ offers swapper / merger / wildcard, which the bot never uses, so its win rate is a floor.`');
  say();
}

if (special.length) {
  say('### Not simulated');
  say();
  say('These depend on special tiles, which the bot does not model:');
  say();
  for (const l of special) say(`- **${l.id}. ${l.name}** - ${l.objective.type}`);
  say();
}

// ----------------------------------------------------------------- flags
say('## Flags');
say();
const notes = [];
const first = levelRows.find((r) => r.level.id === 1);
if (first && first.winRate < 90) {
  notes.push(`Level 1 wins ${first.winRate}% of the time; a first level should be near 95%.`);
}
const unwinnable = levelRows.filter((r) => r.winRate === 0);
if (unwinnable.length) {
  notes.push(`Never won: ${unwinnable.map((r) => r.level.id + '. ' + r.level.name).join(', ')}.`);
}
const trivial = levelRows.filter((r) => r.winRate === 100 && r.level.id > 3);
if (trivial.length > 3) {
  notes.push(`${trivial.length} levels past the tutorial win 100% of the time.`);
}
// Is the curve monotonic-ish, or does difficulty jump around?
let inversions = 0;
for (let i = 1; i < levelRows.length; i++) {
  if (levelRows[i].winRate > levelRows[i - 1].winRate + 20) inversions++;
}
if (inversions) {
  notes.push(`${inversions} places where a level is much easier than the one before it.`);
}
const deadUnlocks = Object.entries(GameConfig.UNLOCK_THRESHOLDS)
  .filter(([, t]) => scores.filter((s) => s >= t).length / scores.length < 0.05)
  .map(([tile]) => tile);
if (deadUnlocks.length) {
  notes.push(`Tiles ${deadUnlocks.join(', ')} unlock at a score under 5% of games reach.`);
}
const testLevels = levels.filter((l) => l.name.startsWith('TEST:'));
if (testLevels.length) {
  notes.push(`${testLevels.length} levels named "TEST:" ship in levels.json and are playable.`);
}
if (notes.length === 0) notes.push('Nothing stood out.');
for (const n of notes) say('- ' + n);
say();
say(`\`seed ${SEED} · ${((Date.now() - started) / 1000).toFixed(1)}s\``);

const body = out.join('\n');
if (MARKDOWN) {
  process.stdout.write(body + '\n');
} else {
  console.log(body);
}
