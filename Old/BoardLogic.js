/**
 * BoardLogic.js
 * Manages the 4x6 grid state and game logic for Threes-Drop
 * No Phaser dependencies - pure vanilla JS
 */

class BoardLogic {
  constructor() {
    this.COLS = 4;
    this.ROWS = 6;
    this.board = this.createEmptyBoard();
    this.mergeCount = 0;
    this.nextTileId = 1;
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
   * Get the lowest empty row in a column
   * @param {number} col - Column index (0-3)
   * @returns {number} Row index, or -1 if column is full
   */
  getLowestEmptyRow(col) {
    for (let row = this.ROWS - 1; row >= 0; row--) {
      if (this.board[col][row] === null) {
        return row;
      }
    }
    return -1; // Column is full
  }

  /**
   * Check if two tiles can merge
   * Rules: 1+2=3, or matching values >= 3
   * @param {number} value1
   * @param {number} value2
   * @returns {boolean}
   */
  canMerge(value1, value2) {
    if (value1 === null || value2 === null) return false;

    // Special case: 1 + 2 = 3 (or 2 + 1 = 3)
    if ((value1 === 1 && value2 === 2) || (value1 === 2 && value2 === 1)) {
      return true;
    }

    // Matching values >= 3
    if (value1 === value2 && value1 >= 3) {
      return true;
    }

    return false;
  }

  /**
   * Get the merged value from two tiles
   * @param {number} value1
   * @param {number} value2
   * @returns {number}
   */
  getMergedValue(value1, value2) {
    if ((value1 === 1 && value2 === 2) || (value1 === 2 && value2 === 1)) {
      return 3;
    }
    // For matching values >= 3, double the value
    return value1 + value2;
  }

  /**
   * Drop a tile into a column (vertical only)
   * @param {number} col - Column index
   * @param {number} value - Tile value (1, 2, or 3+)
   * @returns {Object} Result with row, merged, finalValue, mergedRow
   */
  dropTile(col, value) {
    if (col < 0 || col >= this.COLS) {
      return { success: false, reason: 'Invalid column' };
    }

    const targetRow = this.getLowestEmptyRow(col);

    if (targetRow === -1) {
      return { success: false, reason: 'Column is full' };
    }

    // Check if we can merge with the tile directly below
    const belowRow = targetRow + 1;
    let merged = false;
    let finalValue = value;
    let finalRow = targetRow;
    let mergedRow = null;

    if (belowRow < this.ROWS && this.board[col][belowRow] !== null) {
      const belowValue = this.board[col][belowRow];

      if (this.canMerge(value, belowValue)) {
        // Merge with the tile below
        finalValue = this.getMergedValue(value, belowValue);
        finalRow = belowRow;
        mergedRow = belowRow;
        merged = true;

        // Remove the old tile (it will be replaced)
        this.board[col][belowRow] = null;

        // Increment merge counter
        this.mergeCount++;
      }
    }

    // Place the tile (or merged tile) in its final position
    this.board[col][finalRow] = finalValue;

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

  /**
   * Shift all tiles in a direction (for swipe power-up)
   * @param {string} direction - 'left' or 'right'
   * @returns {Array} Array of shift operations for animation
   */
  shiftBoard(direction) {
    const operations = [];

    if (direction === 'left') {
      // Process each row from left to right
      for (let row = 0; row < this.ROWS; row++) {
        const rowOperations = this.shiftRowLeft(row);
        operations.push(...rowOperations);
      }
    } else if (direction === 'right') {
      // Process each row from right to left
      for (let row = 0; row < this.ROWS; row++) {
        const rowOperations = this.shiftRowRight(row);
        operations.push(...rowOperations);
      }
    }

    return operations;
  }

  /**
   * Shift a single row to the left with merging
   * @param {number} row
   * @returns {Array} Operations for this row
   */
  shiftRowLeft(row) {
    const operations = [];
    const newRow = [];
    let skipNext = false;

    // First pass: collect tiles and merge
    for (let col = 0; col < this.COLS; col++) {
      if (skipNext) {
        skipNext = false;
        continue;
      }

      const currentValue = this.board[col][row];
      if (currentValue === null) continue;

      // Look ahead for merge opportunity
      let merged = false;
      for (let nextCol = col + 1; nextCol < this.COLS; nextCol++) {
        const nextValue = this.board[nextCol][row];
        if (nextValue === null) continue;

        if (this.canMerge(currentValue, nextValue)) {
          const mergedValue = this.getMergedValue(currentValue, nextValue);
          newRow.push(mergedValue);

          operations.push({
            type: 'merge',
            fromCol: col,
            toCol: newRow.length - 1,
            row: row,
            value: mergedValue,
            mergedWithCol: nextCol
          });

          this.mergeCount++;
          merged = true;

          // Mark next column to skip
          col = nextCol;
          skipNext = true;
          break;
        } else {
          // Can't merge, stop looking
          break;
        }
      }

      if (!merged) {
        newRow.push(currentValue);
        if (col !== newRow.length - 1) {
          operations.push({
            type: 'move',
            fromCol: col,
            toCol: newRow.length - 1,
            row: row,
            value: currentValue
          });
        }
      }
    }

    // Update the board row
    for (let col = 0; col < this.COLS; col++) {
      this.board[col][row] = newRow[col] || null;
    }

    return operations;
  }

  /**
   * Shift a single row to the right with merging
   * @param {number} row
   * @returns {Array} Operations for this row
   */
  shiftRowRight(row) {
    const operations = [];
    const newRow = [];
    let skipNext = false;

    // First pass: collect tiles from right to left and merge
    for (let col = this.COLS - 1; col >= 0; col--) {
      if (skipNext) {
        skipNext = false;
        continue;
      }

      const currentValue = this.board[col][row];
      if (currentValue === null) continue;

      // Look ahead (leftward) for merge opportunity
      let merged = false;
      for (let nextCol = col - 1; nextCol >= 0; nextCol--) {
        const nextValue = this.board[nextCol][row];
        if (nextValue === null) continue;

        if (this.canMerge(currentValue, nextValue)) {
          const mergedValue = this.getMergedValue(currentValue, nextValue);
          newRow.unshift(mergedValue);

          operations.push({
            type: 'merge',
            fromCol: col,
            toCol: this.COLS - newRow.length,
            row: row,
            value: mergedValue,
            mergedWithCol: nextCol
          });

          this.mergeCount++;
          merged = true;

          col = nextCol;
          skipNext = true;
          break;
        } else {
          break;
        }
      }

      if (!merged) {
        newRow.unshift(currentValue);
        const targetCol = this.COLS - newRow.length;
        if (col !== targetCol) {
          operations.push({
            type: 'move',
            fromCol: col,
            toCol: targetCol,
            row: row,
            value: currentValue
          });
        }
      }
    }

    // Update the board row
    for (let col = 0; col < this.COLS; col++) {
      this.board[col][row] = newRow[this.COLS - 1 - col] || null;
    }

    return operations;
  }

  /**
   * Get a random starting tile value (1, 2, or 3)
   * Distribution: 1 and 2 more common, occasional 3
   */
  getRandomTileValue() {
    const rand = Math.random();
    if (rand < 0.45) return 1;
    if (rand < 0.90) return 2;
    return 3;
  }

  /**
   * Check if the board is full (game over)
   */
  isBoardFull() {
    for (let col = 0; col < this.COLS; col++) {
      if (this.board[col][0] === null) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get merge count
   */
  getMergeCount() {
    return this.mergeCount;
  }

  /**
   * Reset merge count (after using power-up)
   */
  resetMergeCount() {
    this.mergeCount = 0;
  }

  /**
   * Get the current board state
   */
  getBoard() {
    return this.board;
  }

  /**
   * Get tile at position
   */
  getTileAt(col, row) {
    if (col < 0 || col >= this.COLS || row < 0 || row >= this.ROWS) {
      return null;
    }
    return this.board[col][row];
  }
}
