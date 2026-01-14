/**
 * GameScene - Main gameplay scene (classic and level modes)
 */
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.gameMode = data.mode || 'classic';
    this.levelId = data.levelId || null;
    this.levelConfig = this.levelId ? levelManager.getLevel(this.levelId) : null;
  }

  create() {
    // Grid settings
    this.GRID_COLS = GameConfig.GRID.COLS;
    this.GRID_ROWS = GameConfig.GRID.ROWS;
    this.TILE_SIZE = GameConfig.GRID.TILE_SIZE;
    this.GRID_OFFSET_X = GameConfig.GRID.OFFSET_X;
    this.GRID_OFFSET_Y = GameConfig.GRID.OFFSET_Y;

    // Initialize board logic with appropriate config
    const boardConfig = {
      cols: this.GRID_COLS,
      rows: this.GRID_ROWS,
      useScoreUnlocks: this.gameMode === 'classic'
    };

    if (this.levelConfig) {
      boardConfig.allowedTiles = this.levelConfig.allowedTiles;
      boardConfig.startingCombo = this.levelConfig.startingCombo || 0;
    }

    this.boardLogic = new BoardLogic(boardConfig);

    // Set starting board if defined
    if (this.levelConfig?.startingBoard) {
      this.boardLogic.setBoard(this.levelConfig.startingBoard);
    }

    // Game state
    this.tiles = {};
    this.isAnimating = false;
    this.nextTileValue = null;
    this.swipeEnabled = false;
    this.pointerStartX = 0;
    this.pointerStartY = 0;
    this.isPointerDown = false;

    // Setup UI
    this.setupBackground();
    this.setupGrid();
    this.setupComboBar();
    this.setupNextTilePreview();
    this.setupInput();

    // Render starting tiles if any
    if (this.levelConfig?.startingBoard) {
      this.renderBoardState();
    }

    this.generateNextTile();
  }

  setupBackground() {
    const { width } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title
    const titleText = this.gameMode === 'level' && this.levelConfig
      ? `LEVEL ${this.levelConfig.id}`
      : 'THREES-DROP';
    this.add.text(width / 2, 30, titleText, {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Score or objective
    if (this.gameMode === 'level' && this.levelConfig) {
      this.objectiveText = this.add.text(width / 2, 55, this.levelConfig.description, {
        fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#f5a623'
      }).setOrigin(0.5);

      this.progressText = this.add.text(width / 2, 75, '', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#7ed321'
      }).setOrigin(0.5);

      // Moves counter
      this.movesText = this.add.text(width - 20, 30, `Moves: 0/${this.levelConfig.maxMoves}`, {
        fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
      }).setOrigin(1, 0);
    } else {
      this.scoreText = this.add.text(width / 2, 60, 'SCORE: 0', {
        fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#f5a623'
      }).setOrigin(0.5);
    }

    // Help button
    const helpBtn = this.add.text(width - 15, 15, '?', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: '#ffffff', backgroundColor: '#4a90e2', padding: { x: 12, y: 6 }
    }).setOrigin(1, 0).setInteractive();
    helpBtn.on('pointerdown', () => UIHelpers.showHowToPlay(this));

    // Back button for levels
    if (this.gameMode === 'level') {
      this.add.text(15, 15, '< BACK', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
      }).setInteractive().on('pointerdown', () => this.scene.start('LevelSelectScene'));
    }
  }

  setupGrid() {
    const gridWidth = this.GRID_COLS * this.TILE_SIZE;
    const gridHeight = this.GRID_ROWS * this.TILE_SIZE;

    const gridBg = this.add.graphics();
    gridBg.fillStyle(GameConfig.UI.GRID_BG, 0.5);
    gridBg.fillRoundedRect(this.GRID_OFFSET_X - 10, this.GRID_OFFSET_Y - 10, gridWidth + 20, gridHeight + 20, 10);

    for (let col = 0; col < this.GRID_COLS; col++) {
      for (let row = 0; row < this.GRID_ROWS; row++) {
        const x = this.GRID_OFFSET_X + col * this.TILE_SIZE;
        const y = this.GRID_OFFSET_Y + row * this.TILE_SIZE;
        const cell = this.add.graphics();
        cell.fillStyle(GameConfig.UI.CELL_BG, 0.8);
        cell.fillRoundedRect(x + 5, y + 5, this.TILE_SIZE - 10, this.TILE_SIZE - 10, 8);
        cell.lineStyle(1, 0x533483, 0.5);
        cell.strokeRoundedRect(x + 5, y + 5, this.TILE_SIZE - 10, this.TILE_SIZE - 10, 8);
      }
    }

    this.columnZones = [];
    for (let col = 0; col < this.GRID_COLS; col++) {
      const x = this.GRID_OFFSET_X + col * this.TILE_SIZE;
      const zone = this.add.rectangle(x, this.GRID_OFFSET_Y, this.TILE_SIZE, gridHeight, 0x000000, 0);
      zone.setOrigin(0, 0).setInteractive().setData('column', col);
      this.columnZones.push(zone);
    }
  }

  renderBoardState() {
    for (let col = 0; col < this.GRID_COLS; col++) {
      for (let row = 0; row < this.GRID_ROWS; row++) {
        const value = this.boardLogic.board[col][row];
        if (value !== null) {
          const tile = new Tile(this, col, row, value, this.boardLogic.nextTileId++);
          this.tiles[`${col},${row}`] = tile;
        }
      }
    }
  }

  setupComboBar() {
    // Check if swipe is disabled for this level
    if (this.levelConfig && !this.levelConfig.swipeEnabled) {
      return;
    }

    const barWidth = 200, barHeight = 30;
    const barX = this.cameras.main.width / 2 - barWidth / 2;
    const barY = this.GRID_OFFSET_Y + this.GRID_ROWS * this.TILE_SIZE + 40;

    this.add.text(barX, barY - 25, 'SWIPE POWER-UP', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#ffffff'
    });

    this.comboBarBg = this.add.graphics();
    this.comboBarBg.fillStyle(GameConfig.UI.GRID_BG, 1);
    this.comboBarBg.fillRoundedRect(barX, barY, barWidth, barHeight, 5);

    this.comboBarFill = this.add.graphics();
    this.comboText = this.add.text(barX + barWidth / 2, barY + barHeight / 2, '0/5', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    this.comboBarX = barX;
    this.comboBarY = barY;
    this.comboBarWidth = barWidth;
    this.comboBarHeight = barHeight;

    this.setupSwipeButtons(barY);
    this.updateComboBar();
  }

  setupSwipeButtons(barY) {
    const buttonY = barY + this.comboBarHeight / 2;
    const centerX = this.cameras.main.width / 2;
    const barHalf = this.comboBarWidth / 2;
    const bw = 50, bh = 30, gap = 10;

    this.leftButton = this.add.rectangle(centerX - barHalf - gap - bw / 2, buttonY, bw, bh, GameConfig.UI.PRIMARY, 0.3);
    this.leftButton.setStrokeStyle(2, GameConfig.UI.PRIMARY).setInteractive();
    this.leftButtonText = this.add.text(centerX - barHalf - gap - bw / 2, buttonY, '←', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5);

    this.rightButton = this.add.rectangle(centerX + barHalf + gap + bw / 2, buttonY, bw, bh, GameConfig.UI.PRIMARY, 0.3);
    this.rightButton.setStrokeStyle(2, GameConfig.UI.PRIMARY).setInteractive();
    this.rightButtonText = this.add.text(centerX + barHalf + gap + bw / 2, buttonY, '→', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5);

    this.leftButton.on('pointerdown', () => {
      if (this.swipeEnabled && !this.isAnimating) this.handleSwipe('left');
    });
    this.rightButton.on('pointerdown', () => {
      if (this.swipeEnabled && !this.isAnimating) this.handleSwipe('right');
    });

    this.swipeButtons = {
      leftButton: this.leftButton, rightButton: this.rightButton,
      leftText: this.leftButtonText, rightText: this.rightButtonText
    };
  }

  setupNextTilePreview() {
    const previewX = this.cameras.main.width / 2;
    const previewY = this.GRID_OFFSET_Y - 40;

    this.add.text(previewX, previewY - 25, 'NEXT', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#888888'
    }).setOrigin(0.5);

    this.nextTilePreview = this.add.container(previewX, previewY);
  }

  setupInput() {
    this.input.on('pointerdown', (pointer) => {
      if (this.isAnimating) return;
      this.isPointerDown = true;
      this.pointerStartX = pointer.x;
      this.pointerStartY = pointer.y;
    });

    this.input.on('pointerup', (pointer) => {
      if (this.isAnimating || !this.isPointerDown) return;
      this.isPointerDown = false;

      const dx = pointer.x - this.pointerStartX;
      const dy = pointer.y - this.pointerStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > GameConfig.GAMEPLAY.SWIPE_THRESHOLD && this.swipeEnabled) {
        if (Math.abs(dx) > Math.abs(dy)) {
          this.handleSwipe(dx > 0 ? 'right' : 'left');
          return;
        }
      }

      for (const zone of this.columnZones) {
        if (zone.getBounds().contains(pointer.x, pointer.y)) {
          this.handleColumnTap(zone.getData('column'));
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
    this.nextTilePreview.removeAll(true);
    const size = 50;
    const bg = this.add.graphics();
    bg.fillStyle(getTileColor(this.nextTileValue), 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 6);
    bg.lineStyle(2, 0xffffff, 0.3);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 6);

    const text = this.add.text(0, 0, this.nextTileValue.toString(), {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: getTileTextColor(this.nextTileValue)
    }).setOrigin(0.5);

    this.nextTilePreview.add([bg, text]);
  }

  handleColumnTap(col) {
    if (this.isAnimating) return;

    // Check move limit for levels
    if (this.levelConfig && this.boardLogic.getMovesUsed() >= this.levelConfig.maxMoves) {
      return;
    }

    const result = this.boardLogic.dropTile(col, this.nextTileValue);
    if (!result.success) return;

    this.isAnimating = true;

    const tile = new Tile(this, col, result.row, this.nextTileValue, result.tileId);
    this.tiles[`${col},${result.row}`] = tile;

    if (result.merged) {
      tile.dropFromTop(result.finalRow, GameConfig.ANIM.DROP);
      this.time.delayedCall(GameConfig.ANIM.DROP, () => {
        this.handleMerge(col, result.finalRow, result.finalValue, tile);
      });
    } else {
      tile.dropFromTop(result.finalRow, GameConfig.ANIM.DROP);
      this.time.delayedCall(GameConfig.ANIM.DROP + 20, () => {
        this.applyGravityAfterDrop();
      });
    }

    this.generateNextTile();
    this.updateUI();
  }

  handleMerge(col, row, newValue, droppingTile) {
    const key = `${col},${row}`;
    const existing = this.tiles[key];

    if (existing) {
      delete this.tiles[key];
      existing.mergeAnimation();
    }

    droppingTile.mergeAnimation(() => {
      const merged = new Tile(this, col, row, newValue, this.boardLogic.nextTileId++);
      merged.updatePosition(col, row, false);
      merged.setScale(0.5).setAlpha(0.5);

      this.boardLogic.addScore(newValue);
      this.updateUI();

      this.tweens.add({
        targets: merged, scaleX: 1, scaleY: 1, alpha: 1,
        duration: GameConfig.ANIM.DROP, ease: 'Back.easeOut',
        onComplete: () => {
          this.tiles[key] = merged;
          this.updateComboBar();
          this.applyGravityAfterDrop();
        }
      });
    });
  }

  applyGravityAfterDrop() {
    const ops = this.boardLogic.applyGravity();
    if (ops.length > 0) {
      this.animateGravity(ops, () => {
        this.updateComboBar();
        this.isAnimating = false;
        this.checkEndConditions();
      });
    } else {
      this.isAnimating = false;
      this.checkEndConditions();
    }
  }

  handleSwipe(direction) {
    if (this.isAnimating || !this.swipeEnabled) return;
    this.isAnimating = true;

    const ops = this.boardLogic.shiftBoard(direction);
    if (ops.length === 0) {
      this.isAnimating = false;
      return;
    }

    this.animateOperations(ops, () => {
      const gravOps = this.boardLogic.applyGravity();
      if (gravOps.length > 0) {
        this.animateGravity(gravOps, () => this.onSwipeComplete());
      } else {
        this.onSwipeComplete();
      }
    });
  }

  animateOperations(operations, onComplete) {
    let completed = 0;
    const total = operations.length;
    if (total === 0) { onComplete(); return; }

    operations.forEach(op => {
      const fromKey = `${op.fromCol},${op.row}`;
      const toKey = `${op.toCol},${op.row}`;
      const tile = this.tiles[fromKey];

      if (!tile) { completed++; if (completed === total) onComplete(); return; }
      delete this.tiles[fromKey];

      if (op.type === 'move') {
        tile.updatePosition(op.toCol, op.row, true, GameConfig.ANIM.SHIFT);
        this.tiles[toKey] = tile;
        this.time.delayedCall(GameConfig.ANIM.SHIFT, () => { completed++; if (completed === total) onComplete(); });
      } else if (op.type === 'merge') {
        const mergeWith = this.tiles[toKey];
        tile.updatePosition(op.toCol, op.row, true, GameConfig.ANIM.SHIFT);

        this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
          if (mergeWith) { delete this.tiles[toKey]; mergeWith.mergeAnimation(); }
          tile.mergeAnimation(() => {
            const merged = new Tile(this, op.toCol, op.row, op.value, this.boardLogic.nextTileId++);
            merged.updatePosition(op.toCol, op.row, false);
            merged.setScale(0.5).setAlpha(0.5);
            this.boardLogic.addScore(op.value);
            this.updateUI();

            this.tweens.add({
              targets: merged, scaleX: 1, scaleY: 1, alpha: 1,
              duration: GameConfig.ANIM.MERGE, ease: 'Back.easeOut',
              onComplete: () => { this.tiles[toKey] = merged; completed++; if (completed === total) onComplete(); }
            });
          });
        });
      }
    });
  }

  animateGravity(operations, onComplete) {
    if (operations.length === 0) { onComplete(); return; }

    const groups = {};
    operations.forEach(op => {
      if (!groups[op.col]) groups[op.col] = [];
      groups[op.col].push(op);
    });

    const cols = Object.keys(groups);
    let completedCols = 0;

    cols.forEach(col => {
      const colOps = groups[col];
      let idx = 0;

      const processNext = () => {
        if (idx >= colOps.length) { completedCols++; if (completedCols === cols.length) onComplete(); return; }

        const op = colOps[idx++];
        const fromKey = `${op.col},${op.fromRow}`;
        const toKey = `${op.col},${op.toRow}`;
        const tile = this.tiles[fromKey];

        if (!tile) { processNext(); return; }
        delete this.tiles[fromKey];

        if (op.type === 'fall') {
          tile.updatePosition(op.col, op.toRow, true, GameConfig.ANIM.FALL);
          this.tiles[toKey] = tile;
          this.time.delayedCall(GameConfig.ANIM.FALL, processNext);
        } else if (op.type === 'fall-merge') {
          const mergeWith = this.tiles[toKey];
          tile.updatePosition(op.col, op.toRow, true, GameConfig.ANIM.FALL);

          this.time.delayedCall(GameConfig.ANIM.FALL, () => {
            if (mergeWith) { delete this.tiles[toKey]; mergeWith.mergeAnimation(); }
            tile.mergeAnimation(() => {
              const merged = new Tile(this, op.col, op.toRow, op.value, this.boardLogic.nextTileId++);
              merged.updatePosition(op.col, op.toRow, false);
              merged.setScale(0.5).setAlpha(0.5);
              this.boardLogic.addScore(op.value);
              this.updateUI();

              this.tweens.add({
                targets: merged, scaleX: 1, scaleY: 1, alpha: 1,
                duration: GameConfig.ANIM.FALL, ease: 'Back.easeOut',
                onComplete: () => { this.tiles[toKey] = merged; processNext(); }
              });
            });
          });
        }
      };
      processNext();
    });
  }

  onSwipeComplete() {
    this.boardLogic.subtractMergeCount(GameConfig.GAMEPLAY.COMBO_COST);
    this.updateComboBar();
    this.isAnimating = false;
    this.checkEndConditions();
  }

  updateUI() {
    if (this.gameMode === 'level' && this.levelConfig) {
      const state = this.boardLogic.getGameState();
      this.progressText.setText(levelManager.getProgressText(this.levelConfig.objective, state));
      this.movesText.setText(`Moves: ${state.movesUsed}/${this.levelConfig.maxMoves}`);
    } else if (this.scoreText) {
      this.scoreText.setText(`SCORE: ${this.boardLogic.getScore()}`);
    }
  }

  updateComboBar() {
    if (!this.comboBarFill) return;

    const count = this.boardLogic.getMergeCount();
    const max = GameConfig.GAMEPLAY.COMBO_MAX;
    const ratio = Math.min(count / max, 1);

    this.comboBarFill.clear();
    if (ratio > 0) {
      const color = ratio >= 1 ? GameConfig.UI.SUCCESS : GameConfig.UI.PRIMARY;
      this.comboBarFill.fillStyle(color, 1);
      this.comboBarFill.fillRoundedRect(this.comboBarX, this.comboBarY, this.comboBarWidth * ratio, this.comboBarHeight, 5);
    }

    this.comboText.setText(`${count}/${max}`);
    this.swipeEnabled = count >= max;

    if (this.swipeEnabled) {
      this.comboBarFill.clear();
      this.comboBarFill.fillStyle(GameConfig.UI.SUCCESS, 1);
      this.comboBarFill.fillRoundedRect(this.comboBarX, this.comboBarY, this.comboBarWidth, this.comboBarHeight, 5);
      this.tweens.add({ targets: this.comboBarFill, alpha: 0.5, duration: 500, yoyo: true, repeat: -1 });
      this.comboText.setColor('#7ed321');
      this.swipeButtons.leftButton.setFillStyle(GameConfig.UI.SUCCESS, 0.8).setStrokeStyle(3, GameConfig.UI.SUCCESS);
      this.swipeButtons.rightButton.setFillStyle(GameConfig.UI.SUCCESS, 0.8).setStrokeStyle(3, GameConfig.UI.SUCCESS);
      this.swipeButtons.leftText.setColor('#ffffff');
      this.swipeButtons.rightText.setColor('#ffffff');
      this.tweens.add({ targets: [this.swipeButtons.leftButton, this.swipeButtons.rightButton], alpha: 0.6, duration: 500, yoyo: true, repeat: -1 });
    } else {
      this.comboBarFill.setAlpha(1);
      this.tweens.killTweensOf(this.comboBarFill);
      this.comboText.setColor('#ffffff');
      this.tweens.killTweensOf([this.swipeButtons.leftButton, this.swipeButtons.rightButton]);
      this.swipeButtons.leftButton.setFillStyle(GameConfig.UI.PRIMARY, 0.3).setStrokeStyle(2, GameConfig.UI.PRIMARY).setAlpha(1);
      this.swipeButtons.rightButton.setFillStyle(GameConfig.UI.PRIMARY, 0.3).setStrokeStyle(2, GameConfig.UI.PRIMARY).setAlpha(1);
      this.swipeButtons.leftText.setColor('#4a90e2');
      this.swipeButtons.rightText.setColor('#4a90e2');
    }
  }

  checkEndConditions() {
    if (this.gameMode === 'level' && this.levelConfig) {
      const state = this.boardLogic.getGameState();

      // Check win
      if (levelManager.checkObjective(this.levelConfig.objective, state)) {
        this.showLevelComplete();
        return;
      }

      // Check lose (out of moves or board full)
      if (state.movesUsed >= this.levelConfig.maxMoves || this.boardLogic.isBoardFull()) {
        this.showLevelFailed();
        return;
      }
    } else {
      if (this.boardLogic.isBoardFull()) {
        this.showGameOver();
      }
    }
  }

  showLevelComplete() {
    const { width, height } = this.cameras.main;
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1000);

    this.add.text(width / 2, height / 2 - 80, 'LEVEL COMPLETE!', {
      fontSize: '36px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#7ed321'
    }).setOrigin(0.5).setDepth(1001);

    this.add.text(width / 2, height / 2 - 30, `Score: ${this.boardLogic.getScore()}`, {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#ffffff'
    }).setOrigin(0.5).setDepth(1001);

    const nextBtn = this.add.text(width / 2, height / 2 + 30, 'NEXT LEVEL', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    nextBtn.on('pointerdown', () => {
      const nextId = this.levelId + 1;
      if (nextId <= levelManager.getTotalLevels()) {
        this.scene.start('GameScene', { mode: 'level', levelId: nextId });
      } else {
        this.scene.start('LevelSelectScene');
      }
    });

    const menuBtn = this.add.text(width / 2, height / 2 + 80, 'LEVEL SELECT', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    menuBtn.on('pointerdown', () => this.scene.start('LevelSelectScene'));
  }

  showLevelFailed() {
    const { width, height } = this.cameras.main;
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1000);

    this.add.text(width / 2, height / 2 - 50, 'LEVEL FAILED', {
      fontSize: '36px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#e24a4a'
    }).setOrigin(0.5).setDepth(1001);

    const retryBtn = this.add.text(width / 2, height / 2 + 20, 'RETRY', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    retryBtn.on('pointerdown', () => this.scene.restart());

    const menuBtn = this.add.text(width / 2, height / 2 + 70, 'LEVEL SELECT', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    menuBtn.on('pointerdown', () => this.scene.start('LevelSelectScene'));
  }

  showGameOver() {
    const { width, height } = this.cameras.main;
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1000);

    this.add.text(width / 2, height / 2 - 50, 'GAME OVER', {
      fontSize: '48px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5).setDepth(1001);

    this.add.text(width / 2, height / 2, `Final Score: ${this.boardLogic.getScore()}`, {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#f5a623'
    }).setOrigin(0.5).setDepth(1001);

    const restartBtn = this.add.text(width / 2, height / 2 + 50, 'TAP TO RESTART', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#4a90e2'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    restartBtn.on('pointerdown', () => this.scene.restart());
    this.tweens.add({ targets: restartBtn, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });
  }
}
