/**
 * BoardLogic unit tests — minimal Node.js test runner (no dependencies)
 */
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Provide a minimal GameConfig stub so BoardLogic can load
globalThis.GameConfig = {
  GRID: { COLS: 4, ROWS: 6 },
  UNLOCK_THRESHOLDS: {}
};

// Load BoardLogic source — eval in global scope so `class BoardLogic` is accessible
const src = readFileSync(resolve(__dirname, '..', 'js', 'BoardLogic.js'), 'utf-8');
const vm = require('vm');
vm.runInThisContext(src);

// ---- tiny test harness ----
let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (!cond) throw new Error('Assertion failed: ' + msg);
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

function makeBoard(config = {}) {
  return new BoardLogic({
    cols: 4,
    rows: 6,
    allowedTiles: [1, 2, 3],
    useScoreUnlocks: false,
    ...config
  });
}

// ==============================
// Merge rules
// ==============================
console.log('\n--- Merge Rules ---');

test('1 + 2 = 3', () => {
  const b = makeBoard();
  assert(b.canMerge(1, 2), '1+2 should merge');
  assert(b.getMergedValue(1, 2) === 3, 'result should be 3');
});

test('2 + 1 = 3', () => {
  const b = makeBoard();
  assert(b.canMerge(2, 1), '2+1 should merge');
  assert(b.getMergedValue(2, 1) === 3, 'result should be 3');
});

test('3 + 3 = 6', () => {
  const b = makeBoard();
  assert(b.canMerge(3, 3), '3+3 should merge');
  assert(b.getMergedValue(3, 3) === 6, 'result should be 6');
});

test('6 + 6 = 12', () => {
  const b = makeBoard();
  assert(b.canMerge(6, 6), '6+6 should merge');
  assert(b.getMergedValue(6, 6) === 12, 'result should be 12');
});

test('1 + 1 cannot merge', () => {
  const b = makeBoard();
  assert(!b.canMerge(1, 1), '1+1 should not merge');
});

test('2 + 2 cannot merge', () => {
  const b = makeBoard();
  assert(!b.canMerge(2, 2), '2+2 should not merge');
});

test('1 + 3 cannot merge', () => {
  const b = makeBoard();
  assert(!b.canMerge(1, 3), '1+3 should not merge');
});

test('3 + 6 cannot merge', () => {
  const b = makeBoard();
  assert(!b.canMerge(3, 6), '3+6 should not merge');
});

// ==============================
// Wildcard merges
// ==============================
console.log('\n--- Wildcard Merges ---');

test('wildcard + 3 merges', () => {
  const b = makeBoard();
  assert(b.canMerge('wildcard', 3), 'wildcard should merge with 3');
  assert(b.getMergedValue('wildcard', 3) === 6, 'result should be 6');
});

test('wildcard + 12 merges', () => {
  const b = makeBoard();
  assert(b.canMerge('wildcard', 12), 'wildcard should merge with 12');
  assert(b.getMergedValue('wildcard', 12) === 24, 'result should be 24');
});

test('wildcard + 1 does not merge', () => {
  const b = makeBoard();
  assert(!b.canMerge('wildcard', 1), 'wildcard should not merge with 1');
});

test('wildcard + 2 does not merge', () => {
  const b = makeBoard();
  assert(!b.canMerge('wildcard', 2), 'wildcard should not merge with 2');
});

test('wildcard blocked by bomb', () => {
  const b = makeBoard();
  const bomb = { type: 'bomb', value: 6, mergesRemaining: 2 };
  assert(!b.canMerge('wildcard', bomb), 'wildcard should not merge with bomb');
});

test('wildcard blocked by auto_swapper', () => {
  const b = makeBoard();
  const swapper = { type: 'auto_swapper', value: 3 };
  assert(!b.canMerge('wildcard', swapper), 'wildcard should not merge with auto_swapper');
});

test('wildcard with glass tile (numeric value) merges', () => {
  const b = makeBoard();
  const glass = { type: 'glass', value: 6, durability: 2 };
  assert(b.canMerge('wildcard', glass), 'wildcard should merge with glass (has numeric value)');
});

// ==============================
// Special tile blocking
// ==============================
console.log('\n--- Special Tile Blocking ---');

test('steel blocks merge', () => {
  const b = makeBoard();
  const steel = { type: 'steel', blocked: true };
  assert(!b.canMerge(3, steel), 'steel should block merge');
  assert(!b.canMerge(steel, 3), 'steel should block merge (reversed)');
});

test('lead blocks merge', () => {
  const b = makeBoard();
  const lead = { type: 'lead', countdown: 5 };
  assert(!b.canMerge(3, lead), 'lead should block merge');
  assert(!b.canMerge(lead, 3), 'lead should block merge (reversed)');
});

// ==============================
// Gravity
// ==============================
console.log('\n--- Gravity ---');

test('tile falls to bottom', () => {
  const b = makeBoard();
  b.board[0][0] = 3; // top row
  const ops = b.applyGravity();
  assert(b.board[0][5] === 3, 'tile should be at bottom');
  assert(b.board[0][0] === null, 'original position should be empty');
  assert(ops.length === 1 && ops[0].type === 'fall', 'should produce fall op');
});

test('gravity fall-merge', () => {
  const b = makeBoard();
  b.board[0][0] = 3;
  b.board[0][5] = 3;
  const ops = b.applyGravity();
  assert(b.board[0][5] === 6, 'tiles should merge to 6');
  assert(b.board[0][0] === null, 'top should be empty');
  assert(ops.some(o => o.type === 'fall-merge'), 'should produce fall-merge op');
});

test('gravity stops above steel', () => {
  const b = makeBoard();
  b.board[0][3] = { type: 'steel', blocked: true };
  b.board[0][0] = 3;
  const ops = b.applyGravity();
  assert(b.board[0][2] === 3, 'tile should stop above steel');
  assert(b.board[0][0] === null, 'original position should be empty');
});

// ==============================
// Board full detection
// ==============================
console.log('\n--- Board Full ---');

test('empty board is not full', () => {
  const b = makeBoard();
  assert(!b.isBoardFull(), 'empty board should not be full');
});

test('board with all top row filled is full', () => {
  const b = makeBoard();
  for (let col = 0; col < 4; col++) {
    b.board[col][0] = 1;
  }
  assert(b.isBoardFull(), 'board should be full when top row is filled');
});

test('board with one open top cell is not full', () => {
  const b = makeBoard();
  for (let col = 0; col < 3; col++) {
    b.board[col][0] = 1;
  }
  assert(!b.isBoardFull(), 'board should not be full with one open');
});

// ==============================
// Drop tile
// ==============================
console.log('\n--- Drop Tile ---');

test('drop into empty column', () => {
  const b = makeBoard();
  const result = b.dropTile(0, 3);
  assert(result.success, 'drop should succeed');
  assert(result.finalRow === 5, 'should land at bottom');
  assert(b.board[0][5] === 3, 'tile should be on board');
});

test('drop merges with tile below', () => {
  const b = makeBoard();
  b.board[1][5] = 1;
  const result = b.dropTile(1, 2);
  assert(result.success, 'drop should succeed');
  assert(result.merged, 'should merge');
  assert(result.finalValue === 3, 'merged value should be 3');
  assert(b.board[1][5] === 3, 'board should have merged value');
});

test('drop into full column fails', () => {
  const b = makeBoard();
  for (let row = 0; row < 6; row++) {
    b.board[2][row] = 1;
  }
  const result = b.dropTile(2, 3);
  assert(!result.success, 'drop into full column should fail');
});

test('drop invalid column fails', () => {
  const b = makeBoard();
  assert(!b.dropTile(-1, 1).success, 'negative col should fail');
  assert(!b.dropTile(4, 1).success, 'out-of-range col should fail');
});

// ==============================
// Shift board
// ==============================
console.log('\n--- Shift Board ---');

test('shift left moves tiles', () => {
  const b = makeBoard();
  b.board[2][5] = 3;
  const ops = b.shiftBoard('left');
  assert(b.board[1][5] === 3, 'tile should move left');
  assert(b.board[2][5] === null, 'old position should be empty');
  assert(ops.length === 1 && ops[0].type === 'move', 'should produce move op');
});

test('shift right moves tiles', () => {
  const b = makeBoard();
  b.board[1][5] = 3;
  const ops = b.shiftBoard('right');
  assert(b.board[2][5] === 3, 'tile should move right');
  assert(b.board[1][5] === null, 'old position should be empty');
});

test('shift left merges', () => {
  const b = makeBoard();
  b.board[0][5] = 3;
  b.board[1][5] = 3;
  const ops = b.shiftBoard('left');
  assert(b.board[0][5] === 6, 'should merge to 6');
  assert(b.board[1][5] === null, 'merged source should be empty');
  assert(ops.some(o => o.type === 'merge'), 'should produce merge op');
});

// ==============================
// Force merge
// ==============================
console.log('\n--- Force Merge ---');

test('forceMerge two compatible tiles', () => {
  const b = makeBoard();
  b.board[0][5] = 3;
  b.board[1][5] = 3;
  const result = b.forceMerge(0, 5, 1, 5);
  assert(result.success, 'should succeed');
  assert(result.mergedValue === 6, 'merged value should be 6');
  assert(b.board[0][5] === null, 'source should be cleared');
  assert(b.board[1][5] === 6, 'target should have merged value');
});

test('forceMerge incompatible tiles fails', () => {
  const b = makeBoard();
  b.board[0][5] = 1;
  b.board[1][5] = 3;
  const result = b.forceMerge(0, 5, 1, 5);
  assert(!result.success, 'should fail');
  assert(result.reason === 'incompatible', 'reason should be incompatible');
});

test('forceMerge with empty cell fails', () => {
  const b = makeBoard();
  b.board[0][5] = 3;
  const result = b.forceMerge(0, 5, 1, 5);
  assert(!result.success, 'should fail');
  assert(result.reason === 'empty_cell', 'reason should be empty_cell');
});

// ==============================
// Results
// ==============================
console.log(`\n${'='.repeat(30)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
