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
    for (let row = this.ROWS - 1; row >= 0; row--) {
      if (this.board[col][row] === null) return row;
    }
    return -1;
  }

  canMerge(value1, value2) {
    if (value1 === null || value2 === null) return false;
    if ((value1 === 1 && value2 === 2) || (value1 === 2 && value2 === 1)) return true;
    if (value1 === value2 && value1 >= 3) return true;
    return false;
  }

  getMergedValue(value1, value2) {
    if ((value1 === 1 && value2 === 2) || (value1 === 2 && value2 === 1)) return 3;
    return value1 + value2;
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

    if (belowRow < this.ROWS && this.board[col][belowRow] !== null) {
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
    const threshold = GameConfig.GAMEPLAY.IMBALANCE_THRESHOLD;
    const countOnes = this.countTilesOnBoard(1);
    const countTwos = this.countTilesOnBoard(2);

    // Base weights
    let weight1 = 45;
    let weight2 = 45;

    // Balance adjustment when board is imbalanced
    if (countOnes > threshold && countOnes > countTwos) {
      const extra = countOnes - threshold;
      weight2 += extra * 15;
      weight1 = Math.max(10, weight1 - extra * 10);
    } else if (countTwos > threshold && countTwos > countOnes) {
      const extra = countTwos - threshold;
      weight1 += extra * 15;
      weight2 = Math.max(10, weight2 - extra * 10);
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
    return {
      score: this.score,
      tilesCreated: this.tilesCreated,
      tileCount: this.getTotalTileCount(),
      movesUsed: this.movesUsed
    };
  }

  shiftBoard(direction) {
    const operations = [];
    const newBoard = this.createEmptyBoard();

    if (direction === 'left') {
      for (let row = 0; row < this.ROWS; row++) {
        const tiles = [];
        for (let col = 0; col < this.COLS; col++) {
          if (this.board[col][row] !== null) {
            tiles.push({ value: this.board[col][row], originalCol: col });
          }
        }

        let writeCol = 0;
        for (const tile of tiles) {
          const targetCol = Math.max(0, tile.originalCol - 1);

          if (newBoard[targetCol][row] !== null && this.canMerge(tile.value, newBoard[targetCol][row])) {
            const mergedValue = this.getMergedValue(tile.value, newBoard[targetCol][row]);
            newBoard[targetCol][row] = mergedValue;
            this.mergeCount++;
            this.trackTileCreated(mergedValue);
            operations.push({ type: 'merge', fromCol: tile.originalCol, toCol: targetCol, row, value: mergedValue });
          } else {
            while (writeCol < this.COLS && newBoard[writeCol][row] !== null) writeCol++;
            if (writeCol < this.COLS) {
              const finalCol = Math.max(writeCol, Math.min(targetCol, this.COLS - 1));
              newBoard[finalCol][row] = tile.value;
              if (tile.originalCol !== finalCol) {
                operations.push({ type: 'move', fromCol: tile.originalCol, toCol: finalCol, row, value: tile.value });
              }
              writeCol = finalCol + 1;
            }
          }
        }
      }
    } else if (direction === 'right') {
      for (let row = 0; row < this.ROWS; row++) {
        const tiles = [];
        for (let col = this.COLS - 1; col >= 0; col--) {
          if (this.board[col][row] !== null) {
            tiles.push({ value: this.board[col][row], originalCol: col });
          }
        }

        let writeCol = this.COLS - 1;
        for (const tile of tiles) {
          const targetCol = Math.min(this.COLS - 1, tile.originalCol + 1);

          if (newBoard[targetCol][row] !== null && this.canMerge(tile.value, newBoard[targetCol][row])) {
            const mergedValue = this.getMergedValue(tile.value, newBoard[targetCol][row]);
            newBoard[targetCol][row] = mergedValue;
            this.mergeCount++;
            this.trackTileCreated(mergedValue);
            operations.push({ type: 'merge', fromCol: tile.originalCol, toCol: targetCol, row, value: mergedValue });
          } else {
            while (writeCol >= 0 && newBoard[writeCol][row] !== null) writeCol--;
            if (writeCol >= 0) {
              const finalCol = Math.min(writeCol, Math.max(targetCol, 0));
              newBoard[finalCol][row] = tile.value;
              if (tile.originalCol !== finalCol) {
                operations.push({ type: 'move', fromCol: tile.originalCol, toCol: finalCol, row, value: tile.value });
              }
              writeCol = finalCol - 1;
            }
          }
        }
      }
    }

    this.board = newBoard;
    return operations;
  }

  applyGravity() {
    const operations = [];
    let moved = true;

    while (moved) {
      moved = false;
      for (let col = 0; col < this.COLS; col++) {
        for (let row = this.ROWS - 2; row >= 0; row--) {
          const value = this.board[col][row];
          if (value === null) continue;

          let targetRow = row;
          for (let r = row + 1; r < this.ROWS; r++) {
            if (this.board[col][r] === null) targetRow = r;
            else break;
          }

          if (targetRow < this.ROWS - 1) {
            const below = this.board[col][targetRow + 1];
            if (below !== null && this.canMerge(value, below)) {
              const mergedValue = this.getMergedValue(value, below);
              this.board[col][targetRow + 1] = mergedValue;
              this.board[col][row] = null;
              this.mergeCount++;
              this.trackTileCreated(mergedValue);
              moved = true;
              operations.push({ type: 'fall-merge', col, fromRow: row, toRow: targetRow + 1, value: mergedValue });
              continue;
            }
          }

          if (targetRow !== row) {
            this.board[col][targetRow] = value;
            this.board[col][row] = null;
            moved = true;
            operations.push({ type: 'fall', col, fromRow: row, toRow: targetRow, value });
          }
        }
      }
    }

    return operations;
  }
}
