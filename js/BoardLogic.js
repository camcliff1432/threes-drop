/**
 * BoardLogic - Core game logic (no rendering)
 * Handles tile placement, merging, gravity, and state
 */
class BoardLogic {
  constructor(config = {}) {
    this.COLS = config.cols || GameConfig.GRID.COLS;
    this.ROWS = config.rows || GameConfig.GRID.ROWS;
    this.allowedTiles = config.allowedTiles || [1, 2, 3];
    this.unlockThresholds = config.unlockThresholds || GameConfig.UNLOCK_THRESHOLDS;
    this.useScoreUnlocks = config.useScoreUnlocks !== false;

    // Custom tile weights for modifiers (e.g., { 1: 0.75, 2: 0.25 })
    this.customTileWeights = config.tileWeights || null;

    this.board = this.createEmptyBoard();
    this.mergeCount = config.startingCombo || 0;
    this.nextTileId = 1;
    this.score = 0;
    this.movesUsed = 0;
    this.tilesCreated = {}; // Track tiles created for objectives
  }

  createEmptyBoard() {
    const board = [];
    for (let col = 0; col < this.COLS; col++) {
      board[col] = [];
      for (let row = 0; row < this.ROWS; row++) {
        board[col][row] = null;
      }
    }
    return board;
  }

  /**
   * Set board from a predefined state (for levels)
   */
  setBoard(boardState) {
    if (!boardState) return;
    for (let col = 0; col < this.COLS; col++) {
      for (let row = 0; row < this.ROWS; row++) {
        this.board[col][row] = boardState[col]?.[row] || null;
      }
    }
  }

  getLowestEmptyRow(col) {
    // Find the lowest empty row that a falling tile can reach from the top
    // Tiles cannot pass through blocked cells (steel) or other tiles
    // Search from top to bottom, simulating the fall

    let lowestReachable = -1;

    for (let row = 0; row < this.ROWS; row++) {
      if (this.isCellBlocked(col, row)) {
        // Hit steel - can't go further, return last empty found
        break;
      }
      if (this.board[col][row] === null) {
        // Empty space - tile can reach here and continue falling
        lowestReachable = row;
      } else {
        // Hit another tile - can't go further, return last empty found
        break;
      }
    }

    return lowestReachable;
  }

  /**
   * Check if a column is completely blocked (steel at row 0)
   */
  isColumnBlocked(col) {
    // If there's a steel plate at row 0, or all rows above steel are full
    for (let row = 0; row < this.ROWS; row++) {
      if (this.isCellBlocked(col, row)) {
        // Check if there's any empty space above this steel
        for (let r = 0; r < row; r++) {
          if (this.board[col][r] === null && !this.isCellBlocked(col, r)) {
            return false; // There's space above the steel
          }
        }
        return true; // No space above steel
      }
      if (this.board[col][row] === null) {
        return false; // Found empty space before hitting steel
      }
    }
    return true; // Column is full
  }

  canMerge(value1, value2, debug = false) {
    if (value1 === null || value2 === null) {
      if (debug) console.log('canMerge: null value', { value1, value2 });
      return false;
    }

    // Handle special tile types (objects)
    const v1 = typeof value1 === 'object' ? value1.value : value1;
    const v2 = typeof value2 === 'object' ? value2.value : value2;

    if (debug) console.log('canMerge: extracted values', { value1, value2, v1, v2 });

    // Blocked tiles (steel) cannot merge
    if (typeof value1 === 'object' && value1.blocked) {
      if (debug) console.log('canMerge: value1 is blocked');
      return false;
    }
    if (typeof value2 === 'object' && value2.blocked) {
      if (debug) console.log('canMerge: value2 is blocked');
      return false;
    }

    // Lead tiles cannot merge (they have no value, just countdown)
    if (typeof value1 === 'object' && value1.type === 'lead') {
      if (debug) console.log('canMerge: value1 is lead');
      return false;
    }
    if (typeof value2 === 'object' && value2.type === 'lead') {
      if (debug) console.log('canMerge: value2 is lead');
      return false;
    }

    // If either value is undefined/null after extraction, can't merge
    if (v1 === undefined || v1 === null || v2 === undefined || v2 === null) {
      if (debug) console.log('canMerge: undefined/null after extraction');
      return false;
    }

    // Wildcard merges with any tile value >= 3
    if (v1 === 'wildcard' && typeof v2 === 'number' && v2 >= 3) return true;
    if (v2 === 'wildcard' && typeof v1 === 'number' && v1 >= 3) return true;

    // Standard merge rules - ensure numeric comparison
    const num1 = typeof v1 === 'number' ? v1 : parseInt(v1);
    const num2 = typeof v2 === 'number' ? v2 : parseInt(v2);

    if (debug) console.log('canMerge: numeric values', { num1, num2 });

    // 1 + 2 = 3
    if ((num1 === 1 && num2 === 2) || (num1 === 2 && num2 === 1)) return true;
    // Equal values >= 3 can merge (3+3, 6+6, 12+12, etc.)
    if (num1 === num2 && num1 >= 3 && !isNaN(num1)) return true;

    if (debug) console.log('canMerge: no match found, returning false');
    return false;
  }

  getMergedValue(value1, value2) {
    // Handle special tile types (objects)
    const v1 = typeof value1 === 'object' ? value1.value : value1;
    const v2 = typeof value2 === 'object' ? value2.value : value2;

    // Wildcard takes on the other tile's value and doubles it
    if (v1 === 'wildcard') return v2 * 2;
    if (v2 === 'wildcard') return v1 * 2;

    if ((v1 === 1 && v2 === 2) || (v1 === 2 && v2 === 1)) return 3;
    return v1 + v2;
  }

  /**
   * Get the numeric value of a cell (handles special tile objects)
   */
  getCellValue(col, row) {
    const cell = this.board[col][row];
    if (cell === null) return null;
    if (typeof cell === 'object') return cell.value;
    return cell;
  }

  /**
   * Check if a cell is blocked (steel plate)
   */
  isCellBlocked(col, row) {
    // Bounds check
    if (col < 0 || col >= this.COLS || row < 0 || row >= this.ROWS) {
      return false;
    }
    const cell = this.board[col][row];
    // Note: typeof null === 'object' in JS, so we must check cell !== null first
    return cell !== null && typeof cell === 'object' && cell.blocked === true;
  }

  /**
   * Track that a tile was created (for level objectives)
   */
  trackTileCreated(value) {
    this.tilesCreated[value] = (this.tilesCreated[value] || 0) + 1;
  }

  dropTile(col, value) {
    if (col < 0 || col >= this.COLS) {
      return { success: false, reason: 'Invalid column' };
    }

    const targetRow = this.getLowestEmptyRow(col);
    if (targetRow === -1) {
      return { success: false, reason: 'Column is full' };
    }

    const belowRow = targetRow + 1;
    let merged = false;
    let finalValue = value;
    let finalRow = targetRow;
    let mergedRow = null;

    // Only try to merge if below is not blocked (steel) and is a valid row
    if (belowRow < this.ROWS && this.board[col][belowRow] !== null && !this.isCellBlocked(col, belowRow)) {
      const belowValue = this.board[col][belowRow];
      if (this.canMerge(value, belowValue)) {
        finalValue = this.getMergedValue(value, belowValue);
        finalRow = belowRow;
        mergedRow = belowRow;
        merged = true;
        this.board[col][belowRow] = null;
        this.mergeCount++;
        this.trackTileCreated(finalValue);
      }
    }

    this.board[col][finalRow] = finalValue;
    this.movesUsed++;

    return {
      success: true,
      row: targetRow,
      finalRow: finalRow,
      finalValue: finalValue,
      merged: merged,
      mergedRow: mergedRow,
      tileId: this.nextTileId++
    };
  }

  countTilesOnBoard(value) {
    let count = 0;
    for (let col = 0; col < this.COLS; col++) {
      for (let row = 0; row < this.ROWS; row++) {
        if (this.board[col][row] === value) {
          count++;
        }
      }
    }
    return count;
  }

  getTotalTileCount() {
    let count = 0;
    for (let col = 0; col < this.COLS; col++) {
      for (let row = 0; row < this.ROWS; row++) {
        if (this.board[col][row] !== null) {
          count++;
        }
      }
    }
    return count;
  }

  getRandomTileValue() {
    const countOnes = this.countTilesOnBoard(1);
    const countTwos = this.countTilesOnBoard(2);
    const difference = countOnes - countTwos;

    // Base weights - check for custom weights from modifiers
    let weight1 = 45;
    let weight2 = 45;

    if (this.customTileWeights) {
      // Use custom weights (values are ratios, e.g., 0.75 for 75%)
      weight1 = (this.customTileWeights[1] || 0.5) * 90;
      weight2 = (this.customTileWeights[2] || 0.5) * 90;
    } else {
      // Gentle balance adjustment - only kicks in when difference is 3+
      // This allows natural randomness while preventing extreme imbalance
      const balanceThreshold = 4;
      if (Math.abs(difference) >= balanceThreshold) {
        const excess = Math.abs(difference) - balanceThreshold + 1;
        const adjustment = Math.min(excess * 8, 25); // Gentler: 8 per tile, cap at 25

        if (difference > 0) {
          // More 1s than 2s - slightly favor spawning 2s
          weight2 += adjustment;
          weight1 = Math.max(20, weight1 - adjustment);
        } else {
          // More 2s than 1s - slightly favor spawning 1s
          weight1 += adjustment;
          weight2 = Math.max(20, weight2 - adjustment);
        }
      }
    }

    // Build available tiles
    const availableTiles = [];

    // Add tiles based on allowed list
    if (this.allowedTiles.includes(1)) {
      availableTiles.push({ value: 1, weight: weight1 });
    }
    if (this.allowedTiles.includes(2)) {
      availableTiles.push({ value: 2, weight: weight2 });
    }
    if (this.allowedTiles.includes(3)) {
      availableTiles.push({ value: 3, weight: 8 });
    }

    // Add higher tiles based on score unlocks (classic mode) or allowed list (level mode)
    if (this.useScoreUnlocks) {
      let totalHigherWeight = 0;
      for (const [value, scoreThreshold] of Object.entries(this.unlockThresholds)) {
        if (this.score >= scoreThreshold) {
          const scoreOver = this.score - scoreThreshold;
          const weight = Math.min(0.5 + (scoreOver / 1000), 2);
          availableTiles.push({ value: parseInt(value), weight: weight });
          totalHigherWeight += weight;
        }
      }
      // Reduce base tile weights as higher tiles unlock
      const reduction = Math.max(0.7, 1 - (totalHigherWeight / 100));
      if (availableTiles[0]) availableTiles[0].weight *= reduction;
      if (availableTiles[1]) availableTiles[1].weight *= reduction;
    } else {
      // Level mode: add higher allowed tiles with fixed small weights
      for (const value of this.allowedTiles) {
        if (value > 3 && !availableTiles.find(t => t.value === value)) {
          availableTiles.push({ value: value, weight: 3 });
        }
      }
    }

    // Weighted random selection
    const totalWeight = availableTiles.reduce((sum, t) => sum + t.weight, 0);
    const rand = Math.random() * totalWeight;
    let cumulative = 0;

    for (const tile of availableTiles) {
      cumulative += tile.weight;
      if (rand < cumulative) {
        return tile.value;
      }
    }

    return this.allowedTiles[0] || 1;
  }

  isBoardFull() {
    for (let col = 0; col < this.COLS; col++) {
      if (this.board[col][0] === null) return false;
    }
    return true;
  }

  getMergeCount() { return this.mergeCount; }
  resetMergeCount() { this.mergeCount = 0; }
  subtractMergeCount(amount) { this.mergeCount = Math.max(0, this.mergeCount - amount); }
  addScore(value) { this.score += value; }
  getScore() { return this.score; }
  getMovesUsed() { return this.movesUsed; }

  /**
   * Get current game state for objective checking
   */
  getGameState() {
    // Find highest tile value on the board
    let highestTile = 0;
    for (let col = 0; col < this.COLS; col++) {
      for (let row = 0; row < this.ROWS; row++) {
        const val = this.board[col][row];
        if (typeof val === 'number' && val > highestTile) {
          highestTile = val;
        }
      }
    }

    return {
      score: this.score,
      tilesCreated: this.tilesCreated,
      tileCount: this.getTotalTileCount(),
      movesUsed: this.movesUsed,
      highestTile
    };
  }

  shiftBoard(direction) {
    const operations = [];
    const newBoard = this.createEmptyBoard();

    // Copy current board to newBoard first
    for (let col = 0; col < this.COLS; col++) {
      for (let row = 0; row < this.ROWS; row++) {
        newBoard[col][row] = this.board[col][row];
      }
    }

    if (direction === 'left') {
      // Process from left to right so tiles don't overlap
      for (let row = 0; row < this.ROWS; row++) {
        for (let col = 1; col < this.COLS; col++) {
          // Skip blocked tiles and empty cells
          if (this.isCellBlocked(col, row) || newBoard[col][row] === null) continue;

          const targetCol = col - 1;

          // Can't move into blocked cell
          if (this.isCellBlocked(targetCol, row)) continue;

          const tileValue = newBoard[col][row];

          if (newBoard[targetCol][row] === null) {
            // Move one space left into empty cell
            newBoard[targetCol][row] = tileValue;
            newBoard[col][row] = null;
            operations.push({ type: 'move', fromCol: col, toCol: targetCol, row, value: tileValue });
          } else if (this.canMerge(tileValue, newBoard[targetCol][row])) {
            // Merge with tile to the left
            const mergedValue = this.getMergedValue(tileValue, newBoard[targetCol][row]);
            newBoard[targetCol][row] = mergedValue;
            newBoard[col][row] = null;
            this.mergeCount++;
            this.trackTileCreated(mergedValue);
            operations.push({ type: 'merge', fromCol: col, toCol: targetCol, row, value: mergedValue });
          }
          // If target is occupied and can't merge, tile stays in place
        }
      }
    } else if (direction === 'right') {
      // Process from right to left so tiles don't overlap
      for (let row = 0; row < this.ROWS; row++) {
        for (let col = this.COLS - 2; col >= 0; col--) {
          // Skip blocked tiles and empty cells
          if (this.isCellBlocked(col, row) || newBoard[col][row] === null) continue;

          const targetCol = col + 1;

          // Can't move into blocked cell
          if (this.isCellBlocked(targetCol, row)) continue;

          const tileValue = newBoard[col][row];

          if (newBoard[targetCol][row] === null) {
            // Move one space right into empty cell
            newBoard[targetCol][row] = tileValue;
            newBoard[col][row] = null;
            operations.push({ type: 'move', fromCol: col, toCol: targetCol, row, value: tileValue });
          } else if (this.canMerge(tileValue, newBoard[targetCol][row])) {
            // Merge with tile to the right
            const mergedValue = this.getMergedValue(tileValue, newBoard[targetCol][row]);
            newBoard[targetCol][row] = mergedValue;
            newBoard[col][row] = null;
            this.mergeCount++;
            this.trackTileCreated(mergedValue);
            operations.push({ type: 'merge', fromCol: col, toCol: targetCol, row, value: mergedValue });
          }
          // If target is occupied and can't merge, tile stays in place
        }
      }
    }

    this.board = newBoard;
    return operations;
  }

  applyGravity() {
    const operations = [];

    // Single pass - finds falls and merges for current state
    // Chain reactions are handled by calling this repeatedly from animation
    for (let col = 0; col < this.COLS; col++) {
      for (let row = this.ROWS - 2; row >= 0; row--) {
        const value = this.board[col][row];
        if (value === null) continue;

        // Steel tiles don't fall - they're fixed in place
        if (this.isCellBlocked(col, row)) continue;

        let targetRow = row;
        for (let r = row + 1; r < this.ROWS; r++) {
          // Can't fall through blocked cells (steel)
          if (this.isCellBlocked(col, r)) break;
          if (this.board[col][r] === null) targetRow = r;
          else break;
        }

        if (targetRow < this.ROWS - 1) {
          const below = this.board[col][targetRow + 1];
          // Can't merge with blocked tiles
          if (below !== null && !this.isCellBlocked(col, targetRow + 1) && this.canMerge(value, below)) {
            const mergedValue = this.getMergedValue(value, below);
            this.board[col][targetRow + 1] = mergedValue;
            this.board[col][row] = null;
            this.mergeCount++;
            this.trackTileCreated(mergedValue);
            operations.push({ type: 'fall-merge', col, fromRow: row, toRow: targetRow + 1, value: mergedValue });
            continue;
          }
        }

        if (targetRow !== row) {
          this.board[col][targetRow] = value;
          this.board[col][row] = null;
          operations.push({ type: 'fall', col, fromRow: row, toRow: targetRow, value });
        }
      }
    }

    return operations;
  }

  /**
   * Swap two tiles on the board (Swapper power-up)
   */
  swapTiles(col1, row1, col2, row2) {
    // Validate positions
    if (col1 < 0 || col1 >= this.COLS || row1 < 0 || row1 >= this.ROWS) {
      return { success: false, reason: 'Invalid position 1' };
    }
    if (col2 < 0 || col2 >= this.COLS || row2 < 0 || row2 >= this.ROWS) {
      return { success: false, reason: 'Invalid position 2' };
    }

    // Can't swap blocked cells
    if (this.isCellBlocked(col1, row1) || this.isCellBlocked(col2, row2)) {
      return { success: false, reason: 'Cannot swap blocked tiles' };
    }

    // Both cells must have tiles
    if (this.board[col1][row1] === null || this.board[col2][row2] === null) {
      return { success: false, reason: 'Cannot swap with empty cell' };
    }

    // Perform swap
    const temp = this.board[col1][row1];
    this.board[col1][row1] = this.board[col2][row2];
    this.board[col2][row2] = temp;

    return { success: true };
  }

  /**
   * Force merge two adjacent tiles (Merger power-up)
   * Merges at the second tile's position
   */
  forceMerge(col1, row1, col2, row2) {
    const value1 = this.board[col1][row1];
    const value2 = this.board[col2][row2];

    // Check both tiles exist
    if (value1 === null || value2 === null) {
      return { success: false, reason: 'empty_cell' };
    }

    // Check compatibility (with debug logging on failure)
    if (!this.canMerge(value1, value2)) {
      console.log('forceMerge failed - incompatible tiles:', { value1, value2, col1, row1, col2, row2 });
      this.canMerge(value1, value2, true); // Re-run with debug to see why
      return { success: false, reason: 'incompatible' };
    }

    // Perform merge at second tile's position
    const mergedValue = this.getMergedValue(value1, value2);
    this.board[col1][row1] = null;
    this.board[col2][row2] = mergedValue;
    this.mergeCount++;
    this.trackTileCreated(mergedValue);

    return {
      success: true,
      mergedValue: mergedValue,
      mergedCol: col2,
      mergedRow: row2,
      clearedCol: col1,
      clearedRow: row1
    };
  }

  /**
   * Frenzy mode shift - omni-directional 1-space movement, no gravity
   */
  frenzyShift(direction) {
    const operations = [];
    const newBoard = this.createEmptyBoard();

    const deltas = {
      'left': { dc: -1, dr: 0 },
      'right': { dc: 1, dr: 0 },
      'up': { dc: 0, dr: -1 },
      'down': { dc: 0, dr: 1 }
    };

    const { dc, dr } = deltas[direction] || { dc: 0, dr: 0 };
    if (dc === 0 && dr === 0) return operations;

    // Process in correct order based on direction
    const colStart = dc > 0 ? this.COLS - 1 : 0;
    const colEnd = dc > 0 ? -1 : this.COLS;
    const colStep = dc > 0 ? -1 : 1;
    const rowStart = dr > 0 ? this.ROWS - 1 : 0;
    const rowEnd = dr > 0 ? -1 : this.ROWS;
    const rowStep = dr > 0 ? -1 : 1;

    for (let col = colStart; col !== colEnd; col += colStep) {
      for (let row = rowStart; row !== rowEnd; row += rowStep) {
        const value = this.board[col][row];
        if (value === null) continue;

        // Skip blocked tiles
        if (this.isCellBlocked(col, row)) {
          newBoard[col][row] = value;
          continue;
        }

        const newCol = Math.max(0, Math.min(this.COLS - 1, col + dc));
        const newRow = Math.max(0, Math.min(this.ROWS - 1, row + dr));

        // Check if target is blocked
        if (this.isCellBlocked(newCol, newRow)) {
          newBoard[col][row] = value;
          continue;
        }

        // Check for merge
        if (newBoard[newCol][newRow] !== null && this.canMerge(value, newBoard[newCol][newRow])) {
          const mergedValue = this.getMergedValue(value, newBoard[newCol][newRow]);
          newBoard[newCol][newRow] = mergedValue;
          this.mergeCount++;
          this.trackTileCreated(mergedValue);
          operations.push({
            type: 'frenzy-merge',
            fromCol: col,
            fromRow: row,
            toCol: newCol,
            toRow: newRow,
            value: mergedValue
          });
        } else if (newBoard[newCol][newRow] === null) {
          // Move to empty cell
          newBoard[newCol][newRow] = value;
          if (col !== newCol || row !== newRow) {
            operations.push({
              type: 'frenzy-move',
              fromCol: col,
              fromRow: row,
              toCol: newCol,
              toRow: newRow,
              value: value
            });
          }
        } else {
          // Can't move, stay in place
          newBoard[col][row] = value;
        }
      }
    }

    this.board = newBoard;
    return operations;
  }
}
