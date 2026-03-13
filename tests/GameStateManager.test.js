/**
 * GameStateManager unit tests — minimal Node.js test runner (no dependencies)
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

function assertDeepEqual(actual, expected, msg) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) {
    throw new Error(`Assertion failed: ${msg}\n  expected: ${b}\n  got:      ${a}`);
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
globalThis.GameConfig = {
  SAVE_VERSION: 1,
  GRID: { COLS: 4, ROWS: 6 }
};

// Load StorageBatcher first (GameStateManager depends on storageBatcher global)
const sbSrc = readFileSync(resolve(__dirname, '..', 'js', 'StorageBatcher.js'), 'utf-8');
vm.runInThisContext(sbSrc);

// Load GameStateManager
const gsSrc = readFileSync(resolve(__dirname, '..', 'js', 'GameStateManager.js'), 'utf-8');
vm.runInThisContext(gsSrc);

// Helper: reset storage state
function resetStorage() {
  globalThis.localStorage = createMockLocalStorage();
  storageBatcher.pending.clear();
}

// Helper: create a fresh GameStateManager
function makeManager() {
  resetStorage();
  return new GameStateManager();
}

// Helper: create a minimal saved state object
function makeSavedState(overrides = {}) {
  return {
    version: 1,
    gameMode: 'classic',
    levelId: null,
    board: [
      [null, null, null, null, null, 3],
      [null, null, null, null, null, null],
      [null, null, null, null, null, 6],
      [null, null, null, null, null, null]
    ],
    score: 150,
    movesUsed: 10,
    mergeCount: 5,
    tilesCreated: { 3: 4, 6: 1 },
    nextTileId: 15,
    nextTileValue: 2,
    nextTileType: 'normal',
    powerUpState: {
      resourcePoints: 50,
      frenzyMeter: 0.3,
      isFrenzyReady: false,
      isFrenzyActive: false,
      frenzyEndTime: 0
    },
    specialTilesState: null,
    glassCleared: 0,
    leadCleared: 0,
    savedAt: Date.now(),
    ...overrides
  };
}

// ==============================
// getStorageKey()
// ==============================
console.log('\n--- getStorageKey() ---');

test('getStorageKey() uses mode suffix', () => {
  const mgr = makeManager();
  assertEqual(mgr.getStorageKey('classic'), 'threes_drop_saved_game_classic', 'classic key');
  assertEqual(mgr.getStorageKey('daily'), 'threes_drop_saved_game_daily', 'daily key');
});

test('getStorageKey() uses default when mode is falsy', () => {
  const mgr = makeManager();
  assertEqual(mgr.getStorageKey(null), 'threes_drop_saved_game_default', 'null mode');
  assertEqual(mgr.getStorageKey(undefined), 'threes_drop_saved_game_default', 'undefined mode');
});

// ==============================
// hasSavedGame() / getSavedGame()
// ==============================
console.log('\n--- hasSavedGame() / getSavedGame() ---');

test('hasSavedGame() returns false when no saved data', () => {
  const mgr = makeManager();
  assertEqual(mgr.hasSavedGame('classic'), false, 'should be false');
});

test('getSavedGame() returns null when no saved data', () => {
  const mgr = makeManager();
  assertEqual(mgr.getSavedGame('classic'), null, 'should be null');
});

test('hasSavedGame() returns true after saving', () => {
  const mgr = makeManager();
  const state = makeSavedState();
  storageBatcher.set(mgr.getStorageKey('classic'), JSON.stringify(state));
  storageBatcher.flush();
  assertEqual(mgr.hasSavedGame('classic'), true, 'should be true');
});

test('getSavedGame() retrieves saved state', () => {
  const mgr = makeManager();
  const state = makeSavedState({ score: 999 });
  storageBatcher.set(mgr.getStorageKey('classic'), JSON.stringify(state));
  storageBatcher.flush();
  const loaded = mgr.getSavedGame('classic');
  assertEqual(loaded.score, 999, 'score should match');
  assertEqual(loaded.gameMode, 'classic', 'gameMode should match');
});

test('getSavedGame() returns null on invalid JSON', () => {
  const mgr = makeManager();
  storageBatcher.set(mgr.getStorageKey('classic'), 'not valid json{{{');
  storageBatcher.flush();
  const loaded = mgr.getSavedGame('classic');
  assertEqual(loaded, null, 'should return null on parse error');
});

// ==============================
// Different modes save/load independently
// ==============================
console.log('\n--- Mode Independence ---');

test('different modes store independently', () => {
  const mgr = makeManager();
  const classicState = makeSavedState({ score: 100, gameMode: 'classic' });
  const dailyState = makeSavedState({ score: 200, gameMode: 'daily' });

  storageBatcher.set(mgr.getStorageKey('classic'), JSON.stringify(classicState));
  storageBatcher.set(mgr.getStorageKey('daily'), JSON.stringify(dailyState));
  storageBatcher.flush();

  const loadedClassic = mgr.getSavedGame('classic');
  const loadedDaily = mgr.getSavedGame('daily');
  assertEqual(loadedClassic.score, 100, 'classic score');
  assertEqual(loadedDaily.score, 200, 'daily score');
});

test('clearing one mode does not affect another', () => {
  const mgr = makeManager();
  const classicState = makeSavedState({ score: 100, gameMode: 'classic' });
  const dailyState = makeSavedState({ score: 200, gameMode: 'daily' });

  storageBatcher.set(mgr.getStorageKey('classic'), JSON.stringify(classicState));
  storageBatcher.set(mgr.getStorageKey('daily'), JSON.stringify(dailyState));
  storageBatcher.flush();

  mgr.clearSavedGame('classic');
  storageBatcher.flush();

  assertEqual(mgr.hasSavedGame('classic'), false, 'classic should be cleared');
  assertEqual(mgr.hasSavedGame('daily'), true, 'daily should still exist');
});

// ==============================
// clearSavedGame()
// ==============================
console.log('\n--- clearSavedGame() ---');

test('clearSavedGame() removes saved state', () => {
  const mgr = makeManager();
  const state = makeSavedState();
  storageBatcher.set(mgr.getStorageKey('classic'), JSON.stringify(state));
  storageBatcher.flush();

  mgr.clearSavedGame('classic');
  storageBatcher.flush();

  assertEqual(mgr.hasSavedGame('classic'), false, 'should be false after clear');
  assertEqual(mgr.getSavedGame('classic'), null, 'should be null after clear');
});

// ==============================
// Version migration
// ==============================
console.log('\n--- Version Migration ---');

test('migrateState() adds version 1 to versionless state', () => {
  const mgr = makeManager();
  const oldState = { score: 100 }; // no version field
  const migrated = mgr.migrateState(oldState);
  assertEqual(migrated.version, 1, 'should be migrated to version 1');
  assertEqual(migrated.score, 100, 'data should be preserved');
});

test('migrateState() does not change current version state', () => {
  const mgr = makeManager();
  const state = { version: 1, score: 200 };
  const migrated = mgr.migrateState(state);
  assertEqual(migrated.version, 1, 'version should remain 1');
  assertEqual(migrated.score, 200, 'data should be preserved');
});

test('migrateState() does not downgrade future version', () => {
  const mgr = makeManager();
  const state = { version: 99, score: 300 };
  const migrated = mgr.migrateState(state);
  assertEqual(migrated.version, 99, 'version should remain 99');
});

test('getSavedGame() automatically migrates old saves', () => {
  const mgr = makeManager();
  const oldState = { score: 500, gameMode: 'classic' }; // no version
  storageBatcher.set(mgr.getStorageKey('classic'), JSON.stringify(oldState));
  storageBatcher.flush();

  const loaded = mgr.getSavedGame('classic');
  assertEqual(loaded.version, 1, 'should be migrated to v1');
  assertEqual(loaded.score, 500, 'data should be preserved');
});

test('getCurrentVersion() returns GameConfig.SAVE_VERSION', () => {
  const mgr = makeManager();
  assertEqual(mgr.getCurrentVersion(), 1, 'should match GameConfig.SAVE_VERSION');
});

test('getCurrentVersion() falls back to 1 if GameConfig missing', () => {
  const origConfig = globalThis.GameConfig;
  globalThis.GameConfig = undefined;
  const mgr = new GameStateManager();
  assertEqual(mgr.getCurrentVersion(), 1, 'should fall back to 1');
  globalThis.GameConfig = origConfig;
});

// ==============================
// serializeBoard()
// ==============================
console.log('\n--- serializeBoard() ---');

test('serializeBoard() preserves null cells', () => {
  const mgr = makeManager();
  const board = [[null, null], [null, null]];
  const result = mgr.serializeBoard(board);
  assertEqual(result[0][0], null, 'should be null');
  assertEqual(result[1][1], null, 'should be null');
});

test('serializeBoard() preserves number cells', () => {
  const mgr = makeManager();
  const board = [[3, 6], [12, null]];
  const result = mgr.serializeBoard(board);
  assertEqual(result[0][0], 3, 'should be 3');
  assertEqual(result[0][1], 6, 'should be 6');
  assertEqual(result[1][0], 12, 'should be 12');
});

test('serializeBoard() copies special tile objects', () => {
  const mgr = makeManager();
  const steel = { type: 'steel', blocked: true };
  const board = [[steel, null]];
  const result = mgr.serializeBoard(board);
  assertEqual(result[0][0].type, 'steel', 'type should be preserved');
  assertEqual(result[0][0].blocked, true, 'blocked should be preserved');
  // Ensure it is a copy, not same reference
  assert(result[0][0] !== steel, 'should be a copy, not same reference');
});

// ==============================
// Save/load round-trip (via storageBatcher)
// ==============================
console.log('\n--- Save/Load Round-Trip ---');

test('round-trip: save and load preserves all state fields', () => {
  const mgr = makeManager();
  const state = makeSavedState({
    score: 1234,
    movesUsed: 42,
    mergeCount: 15,
    nextTileValue: 1,
    nextTileType: 'glass',
    glassCleared: 3,
    leadCleared: 2
  });

  storageBatcher.set(mgr.getStorageKey('classic'), JSON.stringify(state));
  storageBatcher.flush();

  const loaded = mgr.getSavedGame('classic');
  assertEqual(loaded.score, 1234, 'score');
  assertEqual(loaded.movesUsed, 42, 'movesUsed');
  assertEqual(loaded.mergeCount, 15, 'mergeCount');
  assertEqual(loaded.nextTileValue, 1, 'nextTileValue');
  assertEqual(loaded.nextTileType, 'glass', 'nextTileType');
  assertEqual(loaded.glassCleared, 3, 'glassCleared');
  assertEqual(loaded.leadCleared, 2, 'leadCleared');
});

test('round-trip: board state preserved', () => {
  const mgr = makeManager();
  const board = [
    [null, null, null, null, null, 3],
    [null, null, null, null, 1, 2],
    [null, null, null, null, null, { type: 'steel', blocked: true }],
    [null, null, null, null, null, null]
  ];
  const state = makeSavedState({ board });

  storageBatcher.set(mgr.getStorageKey('classic'), JSON.stringify(state));
  storageBatcher.flush();

  const loaded = mgr.getSavedGame('classic');
  assertEqual(loaded.board[0][5], 3, 'board[0][5] should be 3');
  assertEqual(loaded.board[1][4], 1, 'board[1][4] should be 1');
  assertEqual(loaded.board[2][5].type, 'steel', 'steel tile preserved');
  assertEqual(loaded.board[3][5], null, 'empty cell preserved');
});

test('round-trip: powerUpState preserved', () => {
  const mgr = makeManager();
  const state = makeSavedState({
    powerUpState: {
      resourcePoints: 75,
      frenzyMeter: 0.8,
      isFrenzyReady: true,
      isFrenzyActive: false,
      frenzyEndTime: 0
    }
  });

  storageBatcher.set(mgr.getStorageKey('classic'), JSON.stringify(state));
  storageBatcher.flush();

  const loaded = mgr.getSavedGame('classic');
  assertEqual(loaded.powerUpState.resourcePoints, 75, 'resourcePoints');
  assertEqual(loaded.powerUpState.frenzyMeter, 0.8, 'frenzyMeter');
  assertEqual(loaded.powerUpState.isFrenzyReady, true, 'isFrenzyReady');
});

// ==============================
// loadGameState() into mock scene
// ==============================
console.log('\n--- loadGameState() ---');

test('loadGameState() restores state into a game scene object', () => {
  const mgr = makeManager();
  const savedState = makeSavedState({ score: 500, movesUsed: 20 });

  // Create a mock game scene with the structure loadGameState expects
  const scene = {
    boardLogic: {
      board: [[null, null, null, null, null, null],
              [null, null, null, null, null, null],
              [null, null, null, null, null, null],
              [null, null, null, null, null, null]],
      score: 0,
      movesUsed: 0,
      mergeCount: 0,
      tilesCreated: {},
      nextTileId: 1
    },
    nextTileValue: null,
    nextTileType: 'normal',
    powerUpManager: {
      resourcePoints: 0,
      frenzyMeter: 0,
      isFrenzyReady: false,
      isFrenzyActive: false,
      frenzyEndTime: 0
    },
    specialTileManager: null,
    glassCleared: 0,
    leadCleared: 0
  };

  const result = mgr.loadGameState(scene, savedState);
  assertEqual(result, true, 'should return true on success');
  assertEqual(scene.boardLogic.score, 500, 'score should be restored');
  assertEqual(scene.boardLogic.movesUsed, 20, 'movesUsed should be restored');
  assertEqual(scene.boardLogic.board[0][5], 3, 'board tile should be restored');
  assertEqual(scene.nextTileValue, 2, 'nextTileValue should be restored');
  assertEqual(scene.powerUpManager.resourcePoints, 50, 'resourcePoints should be restored');
});

test('loadGameState() returns false for null state', () => {
  const mgr = makeManager();
  const result = mgr.loadGameState({}, null);
  assertEqual(result, false, 'should return false');
});

test('loadGameState() restores special tile manager state', () => {
  const mgr = makeManager();
  const savedState = makeSavedState({
    specialTilesState: {
      steelPlates: [{ col: 0, row: 5 }],
      leadTiles: [],
      glassTiles: [{ col: 1, row: 3 }],
      autoSwapperTiles: [],
      bombTiles: []
    }
  });

  const scene = {
    boardLogic: {
      board: [[null, null, null, null, null, null],
              [null, null, null, null, null, null],
              [null, null, null, null, null, null],
              [null, null, null, null, null, null]],
      score: 0, movesUsed: 0, mergeCount: 0, tilesCreated: {}, nextTileId: 1
    },
    nextTileValue: null,
    nextTileType: 'normal',
    powerUpManager: {
      resourcePoints: 0, frenzyMeter: 0, isFrenzyReady: false,
      isFrenzyActive: false, frenzyEndTime: 0
    },
    specialTileManager: {
      steelPlates: [], leadTiles: [], glassTiles: [],
      autoSwapperTiles: [], bombTiles: []
    },
    glassCleared: 0,
    leadCleared: 0
  };

  mgr.loadGameState(scene, savedState);
  assertEqual(scene.specialTileManager.steelPlates.length, 1, 'steelPlates restored');
  assertEqual(scene.specialTileManager.glassTiles.length, 1, 'glassTiles restored');
  assertEqual(scene.specialTileManager.steelPlates[0].col, 0, 'steel col');
});

// ==============================
// Results
// ==============================
console.log(`\n${'='.repeat(30)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
