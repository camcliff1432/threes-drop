/**
 * GameScene.js
 * Main Phaser Scene for Threes-Drop game
 * Handles rendering, input, and game flow
 */

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Grid configuration
    this.GRID_COLS = 4;
    this.GRID_ROWS = 6;
    this.TILE_SIZE = 80;
    this.GRID_OFFSET_X = 50;
    this.GRID_OFFSET_Y = 120;

    // Combo bar configuration
    this.COMBO_MAX = 5;
    this.SWIPE_THRESHOLD = 50; // Minimum swipe distance in pixels

    // Initialize game state
    this.boardLogic = new BoardLogic();
    this.tiles = {}; // Map of "col,row" -> Tile object
    this.isAnimating = false;
    this.nextTileValue = null;
    this.swipeEnabled = false;

    // Input state for swipe detection
    this.pointerStartX = 0;
    this.pointerStartY = 0;
    this.isPointerDown = false;

    this.setupBackground();
    this.setupGrid();
    this.setupComboBar();
    this.setupNextTilePreview();
    this.setupInput();

    // Generate first tile
    this.generateNextTile();
  }

  setupBackground() {
    const { width, height } = this.cameras.main;

    // Gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    graphics.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 40, 'THREES-DROP', {
      fontSize: '36px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  setupGrid() {
    const gridWidth = this.GRID_COLS * this.TILE_SIZE;
    const gridHeight = this.GRID_ROWS * this.TILE_SIZE;

    // Draw grid background
    const gridBg = this.add.graphics();
    gridBg.fillStyle(0x0f3460, 0.5);
    gridBg.fillRoundedRect(
      this.GRID_OFFSET_X - 10,
      this.GRID_OFFSET_Y - 10,
      gridWidth + 20,
      gridHeight + 20,
      10
    );

    // Draw grid cells
    for (let col = 0; col < this.GRID_COLS; col++) {
      for (let row = 0; row < this.GRID_ROWS; row++) {
        const x = this.GRID_OFFSET_X + col * this.TILE_SIZE;
        const y = this.GRID_OFFSET_Y + row * this.TILE_SIZE;

        const cell = this.add.graphics();
        cell.fillStyle(0x16213e, 0.8);
        cell.fillRoundedRect(x + 5, y + 5, this.TILE_SIZE - 10, this.TILE_SIZE - 10, 8);
        cell.lineStyle(1, 0x533483, 0.5);
        cell.strokeRoundedRect(x + 5, y + 5, this.TILE_SIZE - 10, this.TILE_SIZE - 10, 8);
      }
    }

    // Column tap zones (invisible rectangles)
    this.columnZones = [];
    for (let col = 0; col < this.GRID_COLS; col++) {
      const x = this.GRID_OFFSET_X + col * this.TILE_SIZE;
      const zone = this.add.rectangle(
        x,
        this.GRID_OFFSET_Y,
        this.TILE_SIZE,
        gridHeight,
        0x000000,
        0
      );
      zone.setOrigin(0, 0);
      zone.setInteractive();
      zone.setData('column', col);
      this.columnZones.push(zone);
    }
  }

  setupComboBar() {
    const barWidth = 200;
    const barHeight = 30;
    const barX = this.cameras.main.width / 2 - barWidth / 2;
    const barY = this.GRID_OFFSET_Y + this.GRID_ROWS * this.TILE_SIZE + 40;

    // Label
    this.add.text(barX, barY - 25, 'COMBO POWER-UP', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff'
    });

    // Background
    this.comboBarBg = this.add.graphics();
    this.comboBarBg.fillStyle(0x0f3460, 1);
    this.comboBarBg.fillRoundedRect(barX, barY, barWidth, barHeight, 5);

    // Fill bar
    this.comboBarFill = this.add.graphics();
    this.updateComboBar();

    // Counter text
    this.comboText = this.add.text(barX + barWidth / 2, barY + barHeight / 2, '0/5', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Store bar properties
    this.comboBarX = barX;
    this.comboBarY = barY;
    this.comboBarWidth = barWidth;
    this.comboBarHeight = barHeight;
  }

  setupNextTilePreview() {
    const previewX = this.cameras.main.width / 2;
    const previewY = 80;

    this.add.text(previewX, previewY - 20, 'NEXT', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888'
    }).setOrigin(0.5);

    // Preview tile container
    this.nextTilePreview = this.add.container(previewX, previewY);
  }

  setupInput() {
    // Pointer down - start swipe detection
    this.input.on('pointerdown', (pointer) => {
      if (this.isAnimating) return;

      this.isPointerDown = true;
      this.pointerStartX = pointer.x;
      this.pointerStartY = pointer.y;
    });

    // Pointer up - handle column tap or swipe
    this.input.on('pointerup', (pointer) => {
      if (this.isAnimating || !this.isPointerDown) return;

      this.isPointerDown = false;

      const deltaX = pointer.x - this.pointerStartX;
      const deltaY = pointer.y - this.pointerStartY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Check if this is a swipe
      if (distance > this.SWIPE_THRESHOLD && this.swipeEnabled) {
        // Determine swipe direction (horizontal only)
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          const direction = deltaX > 0 ? 'right' : 'left';
          this.handleSwipe(direction);
          return;
        }
      }

      // Otherwise, check for column tap
      for (let zone of this.columnZones) {
        if (zone.getBounds().contains(pointer.x, pointer.y)) {
          const col = zone.getData('column');
          this.handleColumnTap(col);
          return;
        }
      }
    });
  }

  generateNextTile() {
    this.nextTileValue = this.boardLogic.getRandomTileValue();
    this.updateNextTilePreview();
  }

  updateNextTilePreview() {
    // Clear previous preview
    this.nextTilePreview.removeAll(true);

    // Create preview tile (smaller version)
    const previewSize = 50;
    const bg = this.add.graphics();
    const color = this.getTileColorForValue(this.nextTileValue);

    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-previewSize / 2, -previewSize / 2, previewSize, previewSize, 6);
    bg.lineStyle(2, 0xffffff, 0.3);
    bg.strokeRoundedRect(-previewSize / 2, -previewSize / 2, previewSize, previewSize, 6);

    const text = this.add.text(0, 0, this.nextTileValue.toString(), {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.nextTilePreview.add([bg, text]);
  }

  getTileColorForValue(value) {
    const colors = {
      1: 0x4a90e2,
      2: 0xe24a4a,
      3: 0xffffff,
      6: 0xf5a623,
      12: 0xf8e71c,
      24: 0x7ed321,
      48: 0x50e3c2,
      96: 0xb8e986,
      192: 0xbd10e0,
      384: 0xff6b6b,
      768: 0x4ecdc4,
    };
    return colors[value] || 0x999999;
  }

  /**
   * Handle column tap - drop a tile
   */
  handleColumnTap(col) {
    if (this.isAnimating) return;

    const result = this.boardLogic.dropTile(col, this.nextTileValue);

    if (!result.success) {
      console.log('Cannot drop tile:', result.reason);
      // Could add visual feedback here (shake animation, etc.)
      return;
    }

    this.isAnimating = true;

    // Create the new tile
    const tile = new Tile(this, col, result.row, this.nextTileValue, result.tileId);
    const tileKey = `${col},${result.row}`;
    this.tiles[tileKey] = tile;

    // Animate the drop
    if (result.merged) {
      // Tile will merge - animate to merge position
      tile.dropFromTop(result.finalRow, 300);

      // Wait for drop, then handle merge
      this.time.delayedCall(300, () => {
        this.handleMerge(col, result.finalRow, result.finalValue, tile);
      });
    } else {
      // Simple drop to final position
      tile.dropFromTop(result.finalRow, 300);

      this.time.delayedCall(350, () => {
        this.isAnimating = false;
        this.checkGameOver();
      });
    }

    // Generate next tile
    this.generateNextTile();
  }

  /**
   * Handle merging of tiles
   */
  handleMerge(col, row, newValue, droppingTile) {
    const tileKey = `${col},${row}`;
    const existingTile = this.tiles[tileKey];

    if (existingTile) {
      // Remove existing tile with animation
      delete this.tiles[tileKey];
      existingTile.mergeAnimation();
    }

    // Remove the dropping tile and create merged tile
    droppingTile.mergeAnimation(() => {
      // Create new merged tile
      const mergedTile = new Tile(this, col, row, newValue, this.boardLogic.nextTileId++);
      mergedTile.updatePosition(col, row, false);
      mergedTile.setScale(0.5);
      mergedTile.setAlpha(0.5);

      // Pop in animation
      this.tweens.add({
        targets: mergedTile,
        scaleX: 1,
        scaleY: 1,
        alpha: 1,
        duration: 200,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.tiles[tileKey] = mergedTile;
          this.updateComboBar();
          this.isAnimating = false;
          this.checkGameOver();
        }
      });
    });
  }

  /**
   * Handle swipe gesture
   */
  handleSwipe(direction) {
    if (this.isAnimating || !this.swipeEnabled) return;

    console.log('Swipe detected:', direction);
    this.isAnimating = true;

    const operations = this.boardLogic.shiftBoard(direction);

    if (operations.length === 0) {
      this.isAnimating = false;
      return;
    }

    // Animate all operations
    let completedAnimations = 0;
    const totalAnimations = operations.length;

    operations.forEach(op => {
      const fromKey = `${op.fromCol},${op.row}`;
      const toKey = `${op.toCol},${op.row}`;
      const tile = this.tiles[fromKey];

      if (!tile) {
        completedAnimations++;
        return;
      }

      delete this.tiles[fromKey];

      if (op.type === 'move') {
        // Simple move
        tile.updatePosition(op.toCol, op.row, true, 250);
        this.tiles[toKey] = tile;

        this.time.delayedCall(250, () => {
          completedAnimations++;
          if (completedAnimations === totalAnimations) {
            this.onSwipeComplete();
          }
        });
      } else if (op.type === 'merge') {
        // Find the tile being merged with
        const mergeWithKey = `${op.mergedWithCol},${op.row}`;
        const mergeWithTile = this.tiles[mergeWithKey];

        if (mergeWithTile) {
          delete this.tiles[mergeWithKey];
          mergeWithTile.mergeAnimation();
        }

        // Move and merge
        tile.updatePosition(op.toCol, op.row, true, 250);

        this.time.delayedCall(250, () => {
          tile.updateValue(op.value, true);
          this.tiles[toKey] = tile;

          completedAnimations++;
          if (completedAnimations === totalAnimations) {
            this.onSwipeComplete();
          }
        });
      }
    });

    // Reset combo bar
    this.boardLogic.resetMergeCount();
    this.updateComboBar();
  }

  onSwipeComplete() {
    this.isAnimating = false;
    this.checkGameOver();
  }

  updateComboBar() {
    const mergeCount = this.boardLogic.getMergeCount();
    const fillRatio = Math.min(mergeCount / this.COMBO_MAX, 1);

    // Update fill bar
    this.comboBarFill.clear();

    if (fillRatio > 0) {
      const fillColor = fillRatio >= 1 ? 0x7ed321 : 0x4a90e2;
      this.comboBarFill.fillStyle(fillColor, 1);
      this.comboBarFill.fillRoundedRect(
        this.comboBarX,
        this.comboBarY,
        this.comboBarWidth * fillRatio,
        this.comboBarHeight,
        5
      );
    }

    // Update text
    this.comboText.setText(`${mergeCount}/${this.COMBO_MAX}`);

    // Enable/disable swipe
    this.swipeEnabled = mergeCount >= this.COMBO_MAX;

    // Visual feedback when ready
    if (this.swipeEnabled) {
      this.comboBarFill.clear();
      this.comboBarFill.fillStyle(0x7ed321, 1);
      this.comboBarFill.fillRoundedRect(
        this.comboBarX,
        this.comboBarY,
        this.comboBarWidth,
        this.comboBarHeight,
        5
      );

      // Pulse animation
      this.tweens.add({
        targets: this.comboBarFill,
        alpha: 0.5,
        duration: 500,
        yoyo: true,
        repeat: -1
      });

      this.comboText.setColor('#7ed321');
    } else {
      this.comboBarFill.setAlpha(1);
      this.tweens.killTweensOf(this.comboBarFill);
      this.comboText.setColor('#ffffff');
    }
  }

  checkGameOver() {
    if (this.boardLogic.isBoardFull()) {
      this.showGameOver();
    }
  }

  showGameOver() {
    const { width, height } = this.cameras.main;

    // Overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1000);

    // Game Over text
    this.add.text(width / 2, height / 2 - 50, 'GAME OVER', {
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(1001);

    // Restart button
    const restartButton = this.add.text(width / 2, height / 2 + 30, 'TAP TO RESTART', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#4a90e2'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    restartButton.on('pointerup', () => {
      this.scene.restart();
    });

    // Pulse animation
    this.tweens.add({
      targets: restartButton,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }
}
