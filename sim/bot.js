/**
 * Headless harness + bot for Threes Drop.
 *
 * BoardLogic is pure (no Phaser), so the whole core loop can be replayed in
 * Node. This file provides:
 *
 *   loadGame()             - evaluates js/config.js, js/BoardLogic.js and
 *                            js/LevelManager.js into this context
 *   seedRandom(seed)       - deterministic Math.random, so runs reproduce
 *   playEndless(opts)      - one Original-style game, played to board-full
 *   playLevel(level, opts) - one attempt at a level
 *
 * WHAT IS MODELLED: dropping, merging, gravity chains, scoring, score-gated
 * tile unlocks, level objectives, move limits and the board-full loss.
 *
 * WHAT IS NOT: special tiles (steel / lead / glass / auto-swapper / bomb),
 * power-ups and frenzy. SpecialTileManager is itself headless, so wiring it
 * in is the natural next increment, but its orchestration lives in GameScene
 * and replicating that by hand would risk a sim that quietly disagrees with
 * the real game. Levels depending on special tiles are reported separately.
 */
const { readFileSync } = require('fs');
const { resolve } = require('path');
const vm = require('vm');

const ROOT = resolve(__dirname, '..');

function loadGame() {
  // These files declare top-level consts/classes; running them in this
  // context puts them in the shared global lexical scope.
  for (const file of ['js/config.js', 'js/BoardLogic.js', 'js/PowerUpManager.js', 'js/LevelManager.js']) {
    vm.runInThisContext(readFileSync(resolve(ROOT, file), 'utf-8'), { filename: file });
  }

  // Use the levels players actually get: levels.json overrides the inline
  // definitions by id, exactly as LevelManager.loadLevelsFromJSON does.
  const json = JSON.parse(readFileSync(resolve(ROOT, 'levels.json'), 'utf-8'));
  if (json.levels) {
    for (const jsonLevel of json.levels) {
      const idx = levelManager.levels.findIndex((l) => l.id === jsonLevel.id);
      if (idx >= 0) levelManager.levels[idx] = jsonLevel;
      else levelManager.levels.push(jsonLevel);
    }
  }

  return { BoardLogic, GameConfig, levelManager, PowerUpManager };
}

/** mulberry32 - small deterministic PRNG so a run is reproducible. */
function seedRandom(seed) {
  let a = seed >>> 0;
  Math.random = function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cloneBoard(board) {
  return board.map((col) => col.map((cell) => (cell && typeof cell === 'object' ? { ...cell } : cell)));
}

/**
 * Board heuristic. Deliberately simple and explainable - this plays like a
 * focused casual player, not like a solver.
 *
 *   + reward the merge that just happened (bigger tiles are worth more)
 *   + reward vertically adjacent pairs that could merge next
 *   - punish carrying lots of tiles
 *   - punish tall stacks, which are what actually ends the game
 */
function evaluate(board, logic, mergeGain) {
  let tiles = 0;
  let potential = 0;
  let highestStack = 0;

  for (let col = 0; col < logic.COLS; col++) {
    let colHeight = 0;
    for (let row = 0; row < logic.ROWS; row++) {
      if (board[col][row] !== null) {
        tiles++;
        colHeight = logic.ROWS - row;
      }
      if (row + 1 < logic.ROWS) {
        const a = board[col][row];
        const b = board[col][row + 1];
        if (a !== null && b !== null && logic.canMerge(a, b)) potential++;
      }
    }
    if (colHeight > highestStack) highestStack = colHeight;
  }

  return (mergeGain * 4) + (potential * 6) - (tiles * 2) - (highestStack * 3);
}

/**
 * Resolve gravity chains the way GameScene does: repeat until nothing moves,
 * scoring each cascade step one multiple higher (see awardChainMerge).
 */
function settle(logic) {
  let gained = 0;
  let step = 0;
  for (;;) {
    const ops = logic.applyGravity();
    if (ops.length === 0) break;
    for (const op of ops) {
      if (op.type === 'fall-merge') {
        step += 1;
        const multiplier = Math.min(step, GameConfig.GAMEPLAY.CHAIN_MAX);
        logic.addScore(op.value * multiplier);
        gained += op.value * multiplier;
      }
    }
  }
  return gained;
}

/** Pick a column for `value` by trying every legal drop on a scratch board. */
function chooseColumn(logic, value, BoardLogic) {
  let best = null;
  let bestScore = -Infinity;

  for (let col = 0; col < logic.COLS; col++) {
    if (logic.getLowestEmptyRow(col) === -1) continue;

    const scratch = new BoardLogic({
      cols: logic.COLS,
      rows: logic.ROWS,
      allowedTiles: logic.allowedTiles,
      useScoreUnlocks: false
    });
    scratch.board = cloneBoard(logic.board);

    const result = scratch.dropTile(col, value);
    if (!result.success) continue;

    let gain = result.merged ? result.finalValue : 0;
    for (;;) {
      const ops = scratch.applyGravity();
      if (ops.length === 0) break;
      for (const op of ops) if (op.type === 'fall-merge') gain += op.value;
    }

    const score = evaluate(scratch.board, scratch, gain);
    if (score > bestScore) {
      bestScore = score;
      best = col;
    }
  }

  return best;
}

/**
 * Spend the swipe power-up when it is both affordable and useful.
 *
 * Mirrors the real game: the bar fills to COMBO_MAX merges, a swipe shifts
 * the whole board one column, and COMBO_COST is deducted afterwards.
 * Returns true when a swipe was used.
 */
function bestShift(logic, BoardLogic) {
  const current = evaluate(logic.board, logic, 0);
  let bestDir = null;
  let bestScore = current;

  for (const dir of ['left', 'right']) {
    const scratch = new BoardLogic({
      cols: logic.COLS,
      rows: logic.ROWS,
      allowedTiles: logic.allowedTiles,
      useScoreUnlocks: false
    });
    scratch.board = cloneBoard(logic.board);

    const ops = scratch.shiftBoard(dir);
    if (ops.length === 0) continue;

    let gain = 0;
    for (const op of ops) if (op.type === 'merge') gain += op.value;
    for (;;) {
      const g = scratch.applyGravity();
      if (g.length === 0) break;
      for (const op of g) if (op.type === 'fall-merge') gain += op.value;
    }

    const score = evaluate(scratch.board, scratch, gain);
    if (score > bestScore) {
      bestScore = score;
      bestDir = dir;
    }
  }

  return bestDir;
}

/** Apply the best shift if one helps. Returns true when a shift happened. */
function maybeShift(logic, BoardLogic) {
  const dir = bestShift(logic, BoardLogic);
  if (dir === null) return false;
  for (const op of logic.shiftBoard(dir)) {
    if (op.type === 'merge') logic.addScore(op.value);
  }
  settle(logic);
  return true;
}

/**
 * Original mode's swipe: the bar fills to COMBO_MAX merges, a swipe shifts
 * the whole board one column, and COMBO_COST is deducted afterwards.
 */
function maybeSwipe(logic, BoardLogic) {
  if (logic.getMergeCount() < GameConfig.GAMEPLAY.COMBO_MAX) return false;
  if (!maybeShift(logic, BoardLogic)) return false;
  logic.subtractMergeCount(GameConfig.GAMEPLAY.COMBO_COST);
  return true;
}

/** One Original-style game, played until the board fills. */
function playEndless({ BoardLogic, useSwipe = true, maxMoves = 2000 } = {}) {
  const logic = new BoardLogic({});
  let next = logic.getRandomTileValue();
  let swipes = 0;
  let earned = 0;
  let lastMergeCount = 0;

  while (!logic.isBoardFull() && logic.getMovesUsed() < maxMoves) {
    const col = chooseColumn(logic, next, BoardLogic);
    if (col === null) break;

    const result = logic.dropTile(col, next);
    if (!result.success) break;
    if (result.merged) logic.addScore(result.finalValue);

    settle(logic);

    // Track gross merges earned, since swiping spends the counter.
    const now = logic.getMergeCount();
    if (now > lastMergeCount) earned += now - lastMergeCount;
    if (useSwipe && maybeSwipe(logic, BoardLogic)) swipes++;
    lastMergeCount = logic.getMergeCount();

    next = logic.getRandomTileValue();
  }

  const state = logic.getGameState();
  return {
    score: state.score,
    moves: state.movesUsed,
    highestTile: state.highestTile,
    // Gross power-up points earned across the game, before anything is spent.
    merges: earned,
    swipes
  };
}

/**
 * Settle a level's starting board, matching GameScene.applyStartingBoardGravity:
 * tiles stack downwards but deliberately do NOT merge or score on the way.
 * Level definitions place tiles at row 0, so without this every power-up
 * tutorial looks like an instantly-full board.
 */
function settleStartingBoard(logic) {
  for (let col = 0; col < logic.COLS; col++) {
    for (let row = logic.ROWS - 2; row >= 0; row--) {
      const cell = logic.board[col][row];
      if (cell === null || typeof cell !== 'number') continue;

      let targetRow = row;
      for (let r = row + 1; r < logic.ROWS; r++) {
        if (logic.board[col][r] === null) targetRow = r;
        else break;
      }
      if (targetRow !== row) {
        logic.board[col][targetRow] = cell;
        logic.board[col][row] = null;
      }
    }
  }
}

/** Every adjacent pair on the board that could be force-merged. */
function mergeablePairs(logic) {
  const pairs = [];
  for (let col = 0; col < logic.COLS; col++) {
    for (let row = 0; row < logic.ROWS; row++) {
      const a = logic.board[col][row];
      if (a === null) continue;
      for (const [dc, dr] of [[1, 0], [0, 1]]) {
        const c2 = col + dc;
        const r2 = row + dr;
        if (c2 >= logic.COLS || r2 >= logic.ROWS) continue;
        const b = logic.board[c2][r2];
        if (b === null) continue;
        if (logic.canMerge(a, b)) {
          pairs.push({ col, row, col2: c2, row2: r2, value: logic.getMergedValue(a, b) });
        }
      }
    }
  }
  return pairs;
}

/** Highest numeric tile currently on the board. */
function highestOnBoard(logic) {
  let best = 0;
  for (let col = 0; col < logic.COLS; col++) {
    for (let row = 0; row < logic.ROWS; row++) {
      const v = logic.getCellValue(col, row);
      if (typeof v === 'number' && v > best) best = v;
    }
  }
  return best;
}

/**
 * Spend power-ups the way an engaged player would: take a free merge when
 * one is on offer, reach for the wildcard when the objective is a big tile,
 * and swipe to buy space. Greedy and one-ply, like the drop policy.
 *
 * Returns the tile value to drop next (the wildcard replaces it when used).
 */
function spendPowerUps(logic, pum, level, next, BoardLogic) {
  const objective = level.objective || {};

  // Wildcard doubles whatever it lands on, so it is the cheapest route to a
  // big-tile objective once something half the target is on the board.
  if (objective.type === 'create_tile' && pum.canAfford('wildcard')) {
    if (highestOnBoard(logic) >= objective.value / 2 && next !== 'wildcard') {
      pum.spend('wildcard');
      return 'wildcard';
    }
  }

  // Merger turns an adjacent pair into one tile without spending a move.
  if (pum.canAfford('merger')) {
    const pairs = mergeablePairs(logic);
    if (pairs.length) {
      pairs.sort((a, b) => b.value - a.value);
      const best = pairs[0];
      const result = logic.forceMerge(best.col, best.row, best.col2, best.row2);
      if (result.success) {
        pum.spend('merger');
        logic.addScore(result.mergedValue);
        pum.addMergePoint();
        settle(logic);
      }
    }
  }

  // Swipe buys space when the board is getting tall.
  if (pum.canAfford('swipe')) {
    const before = logic.getMergeCount();
    if (maybeShift(logic, BoardLogic)) {
      pum.spend('swipe');
      const gained = logic.getMergeCount() - before;
      for (let i = 0; i < gained; i++) pum.addMergePoint();
    }
  }

  return next;
}

/** One attempt at a level. */
function playLevel(level, { BoardLogic, levelManager, PowerUpManager } = {}) {
  const logic = new BoardLogic({
    allowedTiles: level.allowedTiles || [1, 2, 3],
    useScoreUnlocks: false
  });
  if (level.startingBoard) {
    logic.setBoard(level.startingBoard);
    settleStartingBoard(logic);
  }

  // Levels use the PowerUpManager economy (points per merge), not the
  // Original-mode combo bar.
  const enabled = Object.entries(level.powerUps || {})
    .filter(([, on]) => on)
    .map(([name]) => name);
  const pum = new PowerUpManager({
    startingPoints: level.startingPoints || 0,
    enabledPowerUps: enabled,
    frenzyEnabled: !!level.frenzyEnabled
  });

  const maxMoves = level.maxMoves || 100;
  let next = logic.getRandomTileValue();

  for (;;) {
    const state = logic.getGameState();
    if (levelManager.checkObjective(level.objective, state)) {
      return { won: true, moves: state.movesUsed, score: state.score, reason: 'objective' };
    }
    if (state.movesUsed >= maxMoves) {
      return { won: false, moves: state.movesUsed, score: state.score, reason: 'out of moves' };
    }

    next = spendPowerUps(logic, pum, level, next, BoardLogic);

    if (logic.isBoardFull()) {
      return { won: false, moves: state.movesUsed, score: state.score, reason: 'board full' };
    }

    const dropValue = next === 'wildcard' ? 'wildcard' : next;
    const col = chooseColumn(logic, dropValue, BoardLogic);
    if (col === null) {
      return { won: false, moves: state.movesUsed, score: state.score, reason: 'board full' };
    }

    const before = logic.getMergeCount();
    const result = logic.dropTile(col, dropValue);
    if (!result.success) {
      return { won: false, moves: state.movesUsed, score: state.score, reason: 'blocked' };
    }
    if (result.merged) logic.addScore(result.finalValue);
    settle(logic);

    const gained = logic.getMergeCount() - before;
    for (let i = 0; i < gained; i++) pum.addMergePoint();

    next = logic.getRandomTileValue();
  }
}

/** True when a level's outcome depends on special tiles the sim ignores. */
function needsSpecialTiles(level) {
  const obj = level.objective || {};
  if (obj.type === 'clear_glass' || obj.type === 'clear_lead') return true;
  if (level.startingSpecialTiles && level.startingSpecialTiles.length) return true;
  const st = level.specialTiles || {};
  return Object.values(st).some(Boolean);
}

module.exports = { loadGame, seedRandom, playEndless, playLevel, needsSpecialTiles };
