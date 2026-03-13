/**
 * DailyChallengeManager unit tests — minimal Node.js test runner (no dependencies)
 */
const { readFileSync } = require('fs');
const { resolve } = require('path');
const vm = require('vm');

// ---- tiny test harness ----
let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (!cond) throw new Error('Assertion failed: ' + msg);
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${msg} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
  }
}

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL  ${name}`);
    console.log(`        ${e.message}`);
  }
}

// ---- Mock browser globals ----
function createMockLocalStorage() {
  const store = {};
  return {
    _store: store,
    getItem(key) { return key in store ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { for (const k of Object.keys(store)) delete store[k]; }
  };
}

globalThis.localStorage = createMockLocalStorage();
globalThis.window = { addEventListener() {} };
globalThis.document = { visibilityState: 'visible' };

// Load StorageBatcher first (DailyChallengeManager depends on storageBatcher global)
const sbSrc = readFileSync(resolve(__dirname, '..', 'js', 'StorageBatcher.js'), 'utf-8');
vm.runInThisContext(sbSrc);

// Load DailyChallengeManager
const dcSrc = readFileSync(resolve(__dirname, '..', 'js', 'DailyChallengeManager.js'), 'utf-8');
vm.runInThisContext(dcSrc);

// Helper: create a fresh manager
function makeManager() {
  globalThis.localStorage = createMockLocalStorage();
  // Reset the global storageBatcher's pending
  storageBatcher.pending.clear();
  const mgr = new DailyChallengeManager();
  return mgr;
}

// ==============================
// dateToSeed()
// ==============================
console.log('\n--- dateToSeed() ---');

test('dateToSeed() produces consistent seed for same date', () => {
  const mgr = makeManager();
  const seed1 = mgr.dateToSeed('2025-01-15');
  const seed2 = mgr.dateToSeed('2025-01-15');
  assertEqual(seed1, seed2, 'same date should produce same seed');
});

test('dateToSeed() produces different seeds for different dates', () => {
  const mgr = makeManager();
  const seed1 = mgr.dateToSeed('2025-01-15');
  const seed2 = mgr.dateToSeed('2025-01-16');
  assert(seed1 !== seed2, 'different dates should produce different seeds');
});

test('dateToSeed() returns a non-negative number', () => {
  const mgr = makeManager();
  const dates = ['2025-01-01', '2025-06-15', '2025-12-31', '2000-01-01'];
  for (const d of dates) {
    const seed = mgr.dateToSeed(d);
    assert(typeof seed === 'number', `seed for ${d} should be a number`);
    assert(seed >= 0, `seed for ${d} should be non-negative`);
  }
});

test('dateToSeed() produces different seeds for adjacent dates', () => {
  const mgr = makeManager();
  const seeds = new Set();
  for (let day = 1; day <= 31; day++) {
    const dateStr = `2025-01-${String(day).padStart(2, '0')}`;
    seeds.add(mgr.dateToSeed(dateStr));
  }
  assertEqual(seeds.size, 31, 'all 31 days should have unique seeds');
});

// ==============================
// createSeededRandom()
// ==============================
console.log('\n--- createSeededRandom() ---');

test('createSeededRandom() produces deterministic sequence', () => {
  const mgr = makeManager();
  const rng1 = mgr.createSeededRandom(12345);
  const rng2 = mgr.createSeededRandom(12345);
  const seq1 = [rng1(), rng1(), rng1(), rng1(), rng1()];
  const seq2 = [rng2(), rng2(), rng2(), rng2(), rng2()];
  for (let i = 0; i < 5; i++) {
    assertEqual(seq1[i], seq2[i], `element ${i} should match`);
  }
});

test('createSeededRandom() different seeds produce different sequences', () => {
  const mgr = makeManager();
  const rng1 = mgr.createSeededRandom(12345);
  const rng2 = mgr.createSeededRandom(54321);
  const v1 = rng1();
  const v2 = rng2();
  assert(v1 !== v2, 'different seeds should produce different first values');
});

test('createSeededRandom() produces values in [0, 1)', () => {
  const mgr = makeManager();
  const rng = mgr.createSeededRandom(42);
  for (let i = 0; i < 100; i++) {
    const v = rng();
    assert(v >= 0 && v < 1, `value ${v} should be in [0, 1)`);
  }
});

test('createSeededRandom() produces varied output (not all same)', () => {
  const mgr = makeManager();
  const rng = mgr.createSeededRandom(99);
  const values = new Set();
  for (let i = 0; i < 20; i++) values.add(rng());
  assert(values.size > 10, 'should produce varied output');
});

// ==============================
// generateChallenge()
// ==============================
console.log('\n--- generateChallenge() ---');

test('generateChallenge() returns same challenge for same date', () => {
  const mgr = makeManager();
  const c1 = mgr.generateChallenge('2025-03-10');
  const c2 = mgr.generateChallenge('2025-03-10');
  assertEqual(c1.type, c2.type, 'type should match');
  assertEqual(c1.difficulty, c2.difficulty, 'difficulty should match');
  assertEqual(c1.seed, c2.seed, 'seed should match');
  assertEqual(c1.date, c2.date, 'date should match');
  assertEqual(c1.modifier.id, c2.modifier.id, 'modifier should match');
});

test('generateChallenge() returns different challenges for different dates', () => {
  const mgr = makeManager();
  // Test enough dates to find at least one difference
  const types = new Set();
  for (let day = 1; day <= 14; day++) {
    const dateStr = `2025-03-${String(day).padStart(2, '0')}`;
    const c = mgr.generateChallenge(dateStr);
    types.add(c.type);
  }
  assert(types.size > 1, 'different dates should produce varied challenge types');
});

test('generateChallenge() has required fields', () => {
  const mgr = makeManager();
  const c = mgr.generateChallenge('2025-06-01');
  assert(c.date !== undefined, 'should have date');
  assert(c.seed !== undefined, 'should have seed');
  assert(c.difficulty !== undefined, 'should have difficulty');
  assert(c.type !== undefined, 'should have type');
  assert(c.name !== undefined, 'should have name');
  assert(c.modifier !== undefined, 'should have modifier');
  assert(c.rewards !== undefined, 'should have rewards');
});

test('generateChallenge() uses the date parameter', () => {
  const mgr = makeManager();
  const c = mgr.generateChallenge('2025-07-04');
  assertEqual(c.date, '2025-07-04', 'date should match input');
});

test('generateChallenge() weekend = hard difficulty', () => {
  const mgr = makeManager();
  // Find a Saturday and Sunday dynamically to avoid timezone issues
  // new Date(dateStr).getDay() is what the code uses
  const satDate = '2025-03-02'; // verify dynamically
  const sunDate = '2025-03-03';
  const satDay = new Date(satDate).getDay();
  const sunDay = new Date(sunDate).getDay();
  // If these aren't Sat/Sun in local TZ, skip gracefully
  if (satDay === 6) {
    const c = mgr.generateChallenge(satDate);
    assertEqual(c.difficulty, 'hard', 'Saturday should be hard');
  }
  if (sunDay === 0) {
    const c2 = mgr.generateChallenge(sunDate);
    assertEqual(c2.difficulty, 'hard', 'Sunday should be hard');
  }
  // At least verify the logic: find any weekend date
  for (let d = 1; d <= 28; d++) {
    const ds = `2025-04-${String(d).padStart(2, '0')}`;
    const day = new Date(ds).getDay();
    if (day === 0 || day === 6) {
      const c = mgr.generateChallenge(ds);
      assertEqual(c.difficulty, 'hard', `weekend date ${ds} (day=${day}) should be hard`);
      break;
    }
  }
});

test('generateChallenge() Wednesday = easy difficulty', () => {
  const mgr = makeManager();
  // Find a Wednesday dynamically
  for (let d = 1; d <= 28; d++) {
    const ds = `2025-04-${String(d).padStart(2, '0')}`;
    if (new Date(ds).getDay() === 3) {
      const c = mgr.generateChallenge(ds);
      assertEqual(c.difficulty, 'easy', `Wednesday ${ds} should be easy`);
      break;
    }
  }
});

test('generateChallenge() weekday (non-Wed) = medium difficulty', () => {
  const mgr = makeManager();
  // Find a Monday dynamically
  for (let d = 1; d <= 28; d++) {
    const ds = `2025-04-${String(d).padStart(2, '0')}`;
    if (new Date(ds).getDay() === 1) {
      const c = mgr.generateChallenge(ds);
      assertEqual(c.difficulty, 'medium', `Monday ${ds} should be medium`);
      break;
    }
  }
});

test('generateChallenge() challenge type is valid', () => {
  const mgr = makeManager();
  const validTypes = ['score_target', 'tile_target', 'limited_moves', 'no_power_ups', 'survival'];
  for (let day = 1; day <= 28; day++) {
    const dateStr = `2025-04-${String(day).padStart(2, '0')}`;
    const c = mgr.generateChallenge(dateStr);
    assert(validTypes.includes(c.type), `type ${c.type} should be valid for date ${dateStr}`);
  }
});

// ==============================
// Modifier compatibility
// ==============================
console.log('\n--- Modifier Compatibility ---');

test('no_power_ups challenge never gets frenzy_boost modifier', () => {
  const mgr = makeManager();
  // Generate many challenges and check no_power_ups ones
  for (let day = 1; day <= 28; day++) {
    for (let month = 1; month <= 12; month++) {
      const dateStr = `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const c = mgr.generateChallenge(dateStr);
      if (c.type === 'no_power_ups') {
        assert(c.modifier.id !== 'frenzy_boost',
          `no_power_ups on ${dateStr} should not get frenzy_boost`);
        assert(c.modifier.id !== 'narrow_board',
          `no_power_ups on ${dateStr} should not get narrow_board`);
      }
    }
  }
});

// ==============================
// calculateRewards()
// ==============================
console.log('\n--- calculateRewards() ---');

test('calculateRewards() returns points and streak_bonus', () => {
  const mgr = makeManager();
  const r = mgr.calculateRewards('easy', 'score_target');
  assert(typeof r.points === 'number', 'should have points');
  assert(typeof r.streak_bonus === 'number', 'should have streak_bonus');
});

test('harder difficulty gives more points', () => {
  const mgr = makeManager();
  const easy = mgr.calculateRewards('easy', 'score_target');
  const medium = mgr.calculateRewards('medium', 'score_target');
  const hard = mgr.calculateRewards('hard', 'score_target');
  assert(easy.points < medium.points, 'medium should give more than easy');
  assert(medium.points < hard.points, 'hard should give more than medium');
});

test('type bonus varies reward points', () => {
  const mgr = makeManager();
  const base = mgr.calculateRewards('medium', 'score_target');
  const harder = mgr.calculateRewards('medium', 'no_power_ups');
  assert(harder.points > base.points, 'no_power_ups should give more than score_target');
});

// ==============================
// Streak / completion logic
// ==============================
console.log('\n--- Streak Logic ---');

test('new manager has zero streak and no completions', () => {
  const mgr = makeManager();
  const stats = mgr.getStats();
  assertEqual(stats.currentStreak, 0, 'currentStreak should be 0');
  assertEqual(stats.longestStreak, 0, 'longestStreak should be 0');
  assertEqual(stats.totalCompleted, 0, 'totalCompleted should be 0');
});

test('completeChallenge() increments totalCompleted', () => {
  const mgr = makeManager();
  mgr.completeChallenge(1000);
  assertEqual(mgr.history.totalCompleted, 1, 'totalCompleted should be 1');
});

test('completeChallenge() returns false when already completed today', () => {
  const mgr = makeManager();
  mgr.completeChallenge(1000);
  const result = mgr.completeChallenge(2000);
  assertEqual(result, false, 'second completion should return false');
  assertEqual(mgr.history.totalCompleted, 1, 'totalCompleted should still be 1');
});

test('completeChallenge() sets streak to 1 on first completion', () => {
  const mgr = makeManager();
  const result = mgr.completeChallenge(1000);
  assertEqual(mgr.history.currentStreak, 1, 'streak should be 1');
});

test('resetHistory() clears all stats', () => {
  const mgr = makeManager();
  mgr.completeChallenge(1000);
  mgr.resetHistory();
  assertEqual(mgr.history.currentStreak, 0, 'streak should be 0');
  assertEqual(mgr.history.totalCompleted, 0, 'totalCompleted should be 0');
  assertEqual(mgr.history.totalPoints, 0, 'totalPoints should be 0');
  assertEqual(mgr.history.completedDates.length, 0, 'completedDates should be empty');
});

// ==============================
// Results
// ==============================
console.log(`\n${'='.repeat(30)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
