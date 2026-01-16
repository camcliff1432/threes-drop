/**
 * SpecialTileManager - Handles special tile logic (Steel, Lead, Glass, AutoSwapper, Bomb)
 */
class SpecialTileManager {
  constructor(boardLogic) {
    this.boardLogic = boardLogic;
    this.steelPlates = [];     // {col, row, turnsRemaining}
    this.leadTiles = [];       // {col, row, countdown}
    this.glassTiles = [];      // {col, row, durability, value}
    this.autoSwapperTiles = []; // {col, row, movesRemaining, nextSwapIn, value}
    this.bombTiles = [];       // {col, row, mergesRemaining, value}
  }

  /**
   * Spawn a steel plate in a random empty cell
   * @returns {Object|null} The spawned plate info or null if no space
   */
  spawnSteelPlate() {
    const emptyCell = this.findRandomEmptyCell();
    if (!emptyCell) return null;

    const duration = Math.floor(Math.random() *
      (GameConfig.SPECIAL_TILES.STEEL_MAX_DURATION - GameConfig.SPECIAL_TILES.STEEL_MIN_DURATION + 1)) +
      GameConfig.SPECIAL_TILES.STEEL_MIN_DURATION;

    const plate = {
      col: emptyCell.col,
      row: emptyCell.row,
      turnsRemaining: duration,
      type: 'steel'
    };
    this.steelPlates.push(plate);

    // Mark cell as blocked in board
    this.boardLogic.board[emptyCell.col][emptyCell.row] = { type: 'steel', blocked: true };

    return plate;
  }

  /**
   * Spawn a lead tile at a specific position
   * @returns {Object} The spawned lead tile info
   */
  spawnLeadTile(col, row) {
    const countdown = Math.floor(Math.random() *
      (GameConfig.SPECIAL_TILES.LEAD_MAX_COUNTDOWN - GameConfig.SPECIAL_TILES.LEAD_MIN_COUNTDOWN + 1)) +
      GameConfig.SPECIAL_TILES.LEAD_MIN_COUNTDOWN;

    const tile = {
      col: col,
      row: row,
      countdown: countdown,
      type: 'lead'
    };
    this.leadTiles.push(tile);

    // Mark in board
    this.boardLogic.board[col][row] = { type: 'lead', countdown: countdown };

    return tile;
  }

  /**
   * Spawn a glass tile at a specific position with a value
   * @returns {Object} The spawned glass tile info
   */
  spawnGlassTile(col, row, value) {
    const tile = {
      col: col,
      row: row,
      durability: GameConfig.SPECIAL_TILES.GLASS_INITIAL_DURABILITY,
      value: value,
      type: 'glass'
    };
    this.glassTiles.push(tile);

    // Mark in board
    this.boardLogic.board[col][row] = { type: 'glass', value: value, durability: tile.durability };

    return tile;
  }

  /**
   * Spawn an auto-swapper tile at a specific position with a value
   * @returns {Object} The spawned auto-swapper tile info
   */
  spawnAutoSwapper(col, row, value) {
    const nextSwapIn = Math.floor(Math.random() *
      (GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SWAP_MAX - GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SWAP_MIN + 1)) +
      GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SWAP_MIN;

    const tile = {
      col: col,
      row: row,
      swapsRemaining: GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SWAPS,
      nextSwapIn: nextSwapIn,
      value: value,
      type: 'auto_swapper'
    };
    this.autoSwapperTiles.push(tile);

    // Mark in board
    this.boardLogic.board[col][row] = {
      type: 'auto_swapper',
      value: value,
      swapsRemaining: tile.swapsRemaining,
      nextSwapIn: tile.nextSwapIn
    };

    return tile;
  }

  /**
   * Spawn a bomb tile at a specific position with a value
   * @returns {Object} The spawned bomb tile info
   */
  spawnBomb(col, row, value) {
    const tile = {
      col: col,
      row: row,
      mergesRemaining: GameConfig.SPECIAL_TILES.BOMB_MERGE_TRIGGER,
      value: value,
      type: 'bomb'
    };
    this.bombTiles.push(tile);

    // Mark in board
    this.boardLogic.board[col][row] = {
      type: 'bomb',
      value: value,
      mergesRemaining: tile.mergesRemaining
    };

    return tile;
  }

  /**
   * Called after each drop/turn to update special tiles
   * @returns {Array} Events that occurred (for animation)
   */
  updateSpecialTiles() {
    const events = [];

    // Update steel plates - decrement turns remaining
    this.steelPlates = this.steelPlates.filter(plate => {
      plate.turnsRemaining--;
      if (plate.turnsRemaining <= 0) {
        this.boardLogic.board[plate.col][plate.row] = null;
        events.push({ type: 'steel_removed', col: plate.col, row: plate.row });
        return false;
      }
      events.push({ type: 'steel_tick', col: plate.col, row: plate.row, turnsRemaining: plate.turnsRemaining });
      return true;
    });

    // Update lead tiles - decrement countdown
    this.leadTiles = this.leadTiles.filter(tile => {
      tile.countdown--;
      if (tile.countdown <= 0) {
        this.boardLogic.board[tile.col][tile.row] = null;
        events.push({ type: 'lead_removed', col: tile.col, row: tile.row });
        return false;
      }
      // Update board state
      if (this.boardLogic.board[tile.col][tile.row]?.type === 'lead') {
        this.boardLogic.board[tile.col][tile.row].countdown = tile.countdown;
      }
      events.push({ type: 'lead_decremented', col: tile.col, row: tile.row, countdown: tile.countdown });
      return true;
    });

    // Update auto-swapper tiles
    this.autoSwapperTiles = this.autoSwapperTiles.filter(tile => {
      tile.nextSwapIn--;

      // Check if it's time to swap
      if (tile.nextSwapIn <= 0) {
        const swapResult = this.performAutoSwap(tile);
        if (swapResult) {
          tile.swapsRemaining--;
          events.push({
            type: 'auto_swap',
            fromCol: swapResult.fromCol,
            fromRow: swapResult.fromRow,
            toCol: swapResult.toCol,
            toRow: swapResult.toRow,
            swapsRemaining: tile.swapsRemaining
          });

          // Check if tile has expired after this swap
          if (tile.swapsRemaining <= 0) {
            // Convert to normal tile
            this.boardLogic.board[tile.col][tile.row] = tile.value;
            events.push({ type: 'swapper_expired', col: tile.col, row: tile.row, value: tile.value });
            return false;
          }
        }
        // Reset swap timer
        tile.nextSwapIn = Math.floor(Math.random() *
          (GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SWAP_MAX - GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SWAP_MIN + 1)) +
          GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SWAP_MIN;
      }

      // Update board state
      if (this.boardLogic.board[tile.col][tile.row]?.type === 'auto_swapper') {
        this.boardLogic.board[tile.col][tile.row].swapsRemaining = tile.swapsRemaining;
        this.boardLogic.board[tile.col][tile.row].nextSwapIn = tile.nextSwapIn;
      }
      events.push({
        type: 'swapper_tick',
        col: tile.col,
        row: tile.row,
        swapsRemaining: tile.swapsRemaining
      });
      return true;
    });

    return events;
  }

  /**
   * Perform auto-swap for an auto-swapper tile
   * Valid neighbors: Left, Right, Down only (NEVER up or diagonals)
   */
  performAutoSwap(swapperTile) {
    const { col, row } = swapperTile;
    const validNeighbors = [
      { col: col - 1, row: row },     // Left
      { col: col + 1, row: row },     // Right
      { col: col, row: row + 1 }      // Down
    ].filter(n =>
      n.col >= 0 && n.col < this.boardLogic.COLS &&
      n.row >= 0 && n.row < this.boardLogic.ROWS &&
      !this.isBlockedCell(n.col, n.row)  // Can't swap with steel
    );

    if (validNeighbors.length === 0) return null;

    // Pick a random valid neighbor
    const target = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];

    // Save old position before any updates
    const oldCol = swapperTile.col;
    const oldRow = swapperTile.row;

    // Update any other special tile at the target position BEFORE updating the swapper
    // This moves any special tile at target to the swapper's old position
    this.updateTilePosition(target.col, target.row, oldCol, oldRow);

    // Swap board positions
    const temp = this.boardLogic.board[target.col][target.row];
    this.boardLogic.board[target.col][target.row] = this.boardLogic.board[col][row];
    this.boardLogic.board[col][row] = temp;

    // Update swapper tile position
    swapperTile.col = target.col;
    swapperTile.row = target.row;

    return {
      fromCol: oldCol,
      fromRow: oldRow,
      toCol: target.col,
      toRow: target.row
    };
  }

  /**
   * Called when a merge happens - damages adjacent glass tiles
   * @param {number} col - Column where merge occurred
   * @param {number} row - Row where merge occurred
   * @returns {Array} Events that occurred
   */
  onMerge(col, row) {
    const events = [];
    const adjacent = [
      { col: col - 1, row: row },
      { col: col + 1, row: row },
      { col: col, row: row - 1 },
      { col: col, row: row + 1 }
    ];

    this.glassTiles = this.glassTiles.filter(tile => {
      const isAdjacent = adjacent.some(a => a.col === tile.col && a.row === tile.row);
      if (isAdjacent) {
        tile.durability--;
        if (tile.durability <= 0) {
          this.boardLogic.board[tile.col][tile.row] = null;
          events.push({ type: 'glass_broken', col: tile.col, row: tile.row });
          return false;
        }
        // Update board state
        if (this.boardLogic.board[tile.col][tile.row]?.type === 'glass') {
          this.boardLogic.board[tile.col][tile.row].durability = tile.durability;
        }
        events.push({ type: 'glass_cracked', col: tile.col, row: tile.row, durability: tile.durability });
      }
      return true;
    });

    return events;
  }

  /**
   * Called when two bombs merge together - immediate explosion
   * @param {number} col1 - Column of first bomb
   * @param {number} row1 - Row of first bomb
   * @param {number} col2 - Column of second bomb (where explosion occurs)
   * @param {number} row2 - Row of second bomb (where explosion occurs)
   * @returns {Object} Explosion data
   */
  onBombBombMerge(col1, row1, col2, row2) {
    // Remove the first bomb (it's merging into the second)
    this.bombTiles = this.bombTiles.filter(b => !(b.col === col1 && b.row === row1));
    this.boardLogic.board[col1][row1] = null;

    // Detonate the second bomb (where the merge happens)
    return this.detonateBomb(col2, row2);
  }

  /**
   * Called when a bomb tile participates in a merge
   * @param {number} col - Column of the bomb
   * @param {number} row - Row of the bomb
   * @param {number} newValue - The new merged value
   * @returns {Object|null} Explosion data if bomb explodes, null otherwise
   */
  onBombMerge(col, row, newValue) {
    const bomb = this.bombTiles.find(b => b.col === col && b.row === row);
    if (!bomb) return null;

    bomb.mergesRemaining--;
    bomb.value = newValue;

    if (bomb.mergesRemaining <= 0) {
      // BOOM! Trigger explosion
      return this.detonateBomb(col, row);
    }

    // Update board state
    if (this.boardLogic.board[col][row]?.type === 'bomb') {
      this.boardLogic.board[col][row].mergesRemaining = bomb.mergesRemaining;
      this.boardLogic.board[col][row].value = newValue;
    }

    return { exploded: false, mergesRemaining: bomb.mergesRemaining };
  }

  /**
   * Detonate a bomb - destroys 3x3 area
   * @param {number} centerCol - Center column of explosion
   * @param {number} centerRow - Center row of explosion
   * @returns {Object} Explosion data with affected tiles
   */
  detonateBomb(centerCol, centerRow) {
    const affectedTiles = [];
    let totalPoints = 0;

    // 3x3 area centered on bomb
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        const col = centerCol + dc;
        const row = centerRow + dr;

        if (col < 0 || col >= this.boardLogic.COLS ||
            row < 0 || row >= this.boardLogic.ROWS) {
          continue;
        }

        // Skip the center cell (where the bomb is) - it's handled separately
        if (col === centerCol && row === centerRow) {
          continue;
        }

        const cell = this.boardLogic.board[col][row];
        if (cell === null) continue;

        // Steel and Lead survive explosions
        if (typeof cell === 'object') {
          if (cell.type === 'steel' || cell.type === 'lead') {
            continue;
          }
          // Glass shatters
          if (cell.type === 'glass') {
            affectedTiles.push({ col, row, type: 'glass', value: cell.value });
            totalPoints += cell.value || 0;
            this.boardLogic.board[col][row] = null;
            this.glassTiles = this.glassTiles.filter(g => !(g.col === col && g.row === row));
            continue;
          }
          // Other bombs trigger chain reaction (handled by caller)
          if (cell.type === 'bomb') {
            affectedTiles.push({ col, row, type: 'bomb', value: cell.value, chainReaction: true });
            continue;
          }
          // Auto-swapper destroyed
          if (cell.type === 'auto_swapper') {
            affectedTiles.push({ col, row, type: 'auto_swapper', value: cell.value });
            totalPoints += cell.value || 0;
            this.boardLogic.board[col][row] = null;
            this.autoSwapperTiles = this.autoSwapperTiles.filter(s => !(s.col === col && s.row === row));
            continue;
          }
        }

        // Normal numeric tile
        if (typeof cell === 'number') {
          affectedTiles.push({ col, row, type: 'normal', value: cell });
          totalPoints += cell;
          this.boardLogic.board[col][row] = null;
        }
      }
    }

    // Remove the bomb itself
    this.bombTiles = this.bombTiles.filter(b => !(b.col === centerCol && b.row === centerRow));
    this.boardLogic.board[centerCol][centerRow] = null;

    return {
      exploded: true,
      centerCol,
      centerRow,
      affectedTiles,
      totalPoints
    };
  }

  /**
   * Find a random empty cell on the board
   * @returns {Object|null} {col, row} or null if no empty cells
   */
  findRandomEmptyCell() {
    const emptyCells = [];
    for (let col = 0; col < this.boardLogic.COLS; col++) {
      for (let row = 0; row < this.boardLogic.ROWS; row++) {
        if (this.boardLogic.board[col][row] === null) {
          emptyCells.push({ col, row });
        }
      }
    }
    if (emptyCells.length === 0) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  /**
   * Check if a cell is blocked (by steel plate)
   */
  isBlockedCell(col, row) {
    return this.steelPlates.some(p => p.col === col && p.row === row);
  }

  /**
   * Get special tile at position
   */
  getSpecialTileAt(col, row) {
    const steel = this.steelPlates.find(p => p.col === col && p.row === row);
    if (steel) return steel;

    const lead = this.leadTiles.find(t => t.col === col && t.row === row);
    if (lead) return lead;

    const glass = this.glassTiles.find(t => t.col === col && t.row === row);
    if (glass) return glass;

    const swapper = this.autoSwapperTiles.find(t => t.col === col && t.row === row);
    if (swapper) return swapper;

    const bomb = this.bombTiles.find(t => t.col === col && t.row === row);
    if (bomb) return bomb;

    return null;
  }

  /**
   * Update position of a special tile (after gravity)
   */
  updateTilePosition(oldCol, oldRow, newCol, newRow) {
    // Update lead tiles
    const lead = this.leadTiles.find(t => t.col === oldCol && t.row === oldRow);
    if (lead) {
      lead.col = newCol;
      lead.row = newRow;
    }

    // Update glass tiles
    const glass = this.glassTiles.find(t => t.col === oldCol && t.row === oldRow);
    if (glass) {
      glass.col = newCol;
      glass.row = newRow;
    }

    // Update auto-swapper tiles
    const swapper = this.autoSwapperTiles.find(t => t.col === oldCol && t.row === oldRow);
    if (swapper) {
      swapper.col = newCol;
      swapper.row = newRow;
    }

    // Update bomb tiles
    const bomb = this.bombTiles.find(t => t.col === oldCol && t.row === oldRow);
    if (bomb) {
      bomb.col = newCol;
      bomb.row = newRow;
    }
  }

  /**
   * Remove a special tile at position
   */
  removeTileAt(col, row) {
    this.steelPlates = this.steelPlates.filter(p => !(p.col === col && p.row === row));
    this.leadTiles = this.leadTiles.filter(t => !(t.col === col && t.row === row));
    this.glassTiles = this.glassTiles.filter(t => !(t.col === col && t.row === row));
    this.autoSwapperTiles = this.autoSwapperTiles.filter(t => !(t.col === col && t.row === row));
    this.bombTiles = this.bombTiles.filter(t => !(t.col === col && t.row === row));
  }

  /**
   * Get count of cleared lead tiles (for objectives)
   */
  getClearedLeadCount() {
    // This could be tracked separately if needed for objectives
    return 0;
  }

  /**
   * Reset manager state
   */
  reset() {
    this.steelPlates = [];
    this.leadTiles = [];
    this.glassTiles = [];
    this.autoSwapperTiles = [];
    this.bombTiles = [];
  }
}
