/**
 * SpecialTileManager - Handles special tile logic (Steel, Lead, Glass)
 */
class SpecialTileManager {
  constructor(boardLogic) {
    this.boardLogic = boardLogic;
    this.steelPlates = [];  // {col, row, turnsRemaining}
    this.leadTiles = [];    // {col, row, countdown}
    this.glassTiles = [];   // {col, row, durability, value}
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

    return events;
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
  }

  /**
   * Remove a special tile at position
   */
  removeTileAt(col, row) {
    this.steelPlates = this.steelPlates.filter(p => !(p.col === col && p.row === row));
    this.leadTiles = this.leadTiles.filter(t => !(t.col === col && t.row === row));
    this.glassTiles = this.glassTiles.filter(t => !(t.col === col && t.row === row));
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
  }
}
