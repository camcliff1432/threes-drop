/**
 * GameScene - Main gameplay scene (original, crazy, and level modes)
 */
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.gameMode = data.mode || 'original';  // 'original', 'crazy', 'level'
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
      useScoreUnlocks: this.gameMode === 'original' || this.gameMode === 'crazy'
    };

    if (this.levelConfig) {
      boardConfig.allowedTiles = this.levelConfig.allowedTiles;
      boardConfig.startingCombo = this.levelConfig.startingCombo || 0;
    }

    this.boardLogic = new BoardLogic(boardConfig);

    // Initialize PowerUpManager based on mode
    this.powerUpManager = new PowerUpManager(this.getPowerUpConfig());

    // Initialize SpecialTileManager for crazy mode
    if (this.gameMode === 'crazy' || this.levelConfig?.specialTiles) {
      this.specialTileManager = new SpecialTileManager(this.boardLogic);
    }

    // Set starting board if defined
    if (this.levelConfig?.startingBoard) {
      this.boardLogic.setBoard(this.levelConfig.startingBoard);
    }

    // Initialize starting special tiles from level config
    if (this.specialTileManager && this.levelConfig?.startingSpecialTiles) {
      this.initializeStartingSpecialTiles(this.levelConfig.startingSpecialTiles);
    }

    // Game state
    this.tiles = {};
    this.isAnimating = false;
    this.nextTileValue = null;
    this.nextTileType = 'normal';
    this.swipeEnabled = false;
    this.pointerStartX = 0;
    this.pointerStartY = 0;
    this.isPointerDown = false;

    // Selection mode state (for swapper/merger)
    this.selectionMode = null;  // null, 'swap', 'merger'
    this.selectedTile1 = null;

    // Frenzy state
    this.isFrenzyMode = false;
    this.frenzyTimerEvent = null;

    // Objective tracking for special tile clears
    this.glassCleared = 0;
    this.leadCleared = 0;

    // Setup UI
    this.setupBackground();
    this.setupGrid();

    // Setup power-up UI based on mode
    if (this.gameMode === 'original') {
      this.setupOriginalComboBar();
    } else {
      this.setupPowerUpBar();
    }

    this.setupNextTilePreview();
    this.setupInput();

    // Render starting tiles if any
    if (this.levelConfig?.startingBoard) {
      this.renderBoardState();
    }

    this.generateNextTile();
  }

  /**
   * Get power-up configuration based on game mode
   */
  getPowerUpConfig() {
    switch (this.gameMode) {
      case 'original':
        return {
          enabledPowerUps: ['swipe'],
          frenzyEnabled: false,
          startingPoints: 0
        };
      case 'crazy':
        return {
          enabledPowerUps: ['swipe', 'swapper', 'merger', 'wildcard'],
          frenzyEnabled: true,
          startingPoints: 0
        };
      case 'level':
        const levelPowerUps = this.levelConfig?.powerUps || {};
        return {
          enabledPowerUps: Object.keys(levelPowerUps).filter(k => levelPowerUps[k]),
          frenzyEnabled: this.levelConfig?.frenzyEnabled || false,
          startingPoints: this.levelConfig?.startingPoints || 0
        };
      default:
        return { enabledPowerUps: ['swipe'], frenzyEnabled: false };
    }
  }

  setupBackground() {
    const { width } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title based on mode
    let titleText = 'THREES-DROP';
    if (this.gameMode === 'crazy') {
      titleText = 'CRAZY MODE';
    } else if (this.gameMode === 'level' && this.levelConfig) {
      titleText = `LEVEL ${this.levelConfig.id}`;
    }

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

      // Moves remaining - positioned on the right side
      this.movesText = this.add.text(width - 15, 55, `Moves: 0/${this.levelConfig.maxMoves}`, {
        fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
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

    // Back button
    if (this.gameMode === 'level') {
      this.add.text(15, 15, '< BACK', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
      }).setInteractive().on('pointerdown', () => this.scene.start('LevelSelectScene'));
    } else {
      this.add.text(15, 15, '< MENU', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
      }).setInteractive().on('pointerdown', () => this.scene.start('MenuScene'));
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
        const cell = this.boardLogic.board[col][row];
        if (cell !== null) {
          // Check if it's a special tile (object) or normal tile (number)
          if (typeof cell === 'object' && cell.type) {
            // Special tile - already rendered by initializeStartingSpecialTiles
            continue;
          } else {
            // Normal tile (number value)
            const tile = new Tile(this, col, row, cell, this.boardLogic.nextTileId++);
            this.tiles[`${col},${row}`] = tile;
          }
        }
      }
    }
  }

  /**
   * Initialize starting special tiles from level config
   */
  initializeStartingSpecialTiles(specialTiles) {
    specialTiles.forEach(spec => {
      const { type, col, row } = spec;
      let specialData = {};

      switch (type) {
        case 'steel':
          this.specialTileManager.steelPlates.push({
            col, row,
            turnsRemaining: spec.duration || spec.turnsRemaining || 5,
            type: 'steel'
          });
          this.boardLogic.board[col][row] = { type: 'steel', blocked: true };
          specialData = { turnsRemaining: spec.duration || spec.turnsRemaining || 5 };
          break;
        case 'lead':
          this.specialTileManager.leadTiles.push({
            col, row,
            countdown: spec.countdown || 5,
            type: 'lead'
          });
          this.boardLogic.board[col][row] = { type: 'lead', countdown: spec.countdown || 5 };
          specialData = { countdown: spec.countdown || 5 };
          break;
        case 'glass':
          this.specialTileManager.glassTiles.push({
            col, row,
            durability: spec.durability || 2,
            value: spec.value || 3,
            type: 'glass'
          });
          this.boardLogic.board[col][row] = {
            type: 'glass',
            value: spec.value || 3,
            durability: spec.durability || 2
          };
          specialData = { durability: spec.durability || 2 };
          break;
      }

      // Create the visual tile
      const tile = new Tile(this, col, row, spec.value || null, this.boardLogic.nextTileId++, type, specialData);
      this.tiles[`${col},${row}`] = tile;
    });
  }

  /**
   * Setup original mode combo bar (swipe only)
   */
  setupOriginalComboBar() {
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
    this.updateOriginalComboBar();
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

  /**
   * Setup full power-up bar for crazy/level modes
   */
  setupPowerUpBar() {
    const { width } = this.cameras.main;
    const barY = this.GRID_OFFSET_Y + this.GRID_ROWS * this.TILE_SIZE + 10;

    // Resource points display
    this.resourceText = this.add.text(width / 2, barY, 'POWER: 0', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#f5a623'
    }).setOrigin(0.5);

    // Power-up buttons
    const buttonY = barY + 28;
    const buttons = [
      { type: 'swipe', icon: '↔', cost: GameConfig.POWERUPS.SWIPE_COST },
      { type: 'swapper', icon: 'S', cost: GameConfig.POWERUPS.SWAPPER_COST },
      { type: 'merger', icon: 'M', cost: GameConfig.POWERUPS.MERGER_COST },
      { type: 'wildcard', icon: '?', cost: GameConfig.POWERUPS.WILDCARD_COST }
    ];

    const buttonWidth = 60;
    const buttonGap = 6;
    const totalWidth = buttons.length * buttonWidth + (buttons.length - 1) * buttonGap;
    let startX = width / 2 - totalWidth / 2 + buttonWidth / 2;

    this.powerUpButtons = {};

    buttons.forEach((btn, i) => {
      if (this.powerUpManager.isEnabled(btn.type)) {
        const x = startX + i * (buttonWidth + buttonGap);
        this.powerUpButtons[btn.type] = this.createPowerUpButton(x, buttonY, btn.type, btn.icon, btn.cost);
      }
    });

    // Swipe direction buttons (hidden until swipe is enabled)
    this.setupCrazySwipeButtons(barY + 60);

    // Frenzy bar (if enabled)
    if (this.powerUpManager.frenzyEnabled) {
      this.setupFrenzyBar(barY + 90);
    }

    this.updatePowerUpUI();
  }

  /**
   * Setup swipe direction buttons for crazy/level modes
   */
  setupCrazySwipeButtons(y) {
    const { width } = this.cameras.main;
    const bw = 55, bh = 28;

    // Left swipe button
    this.crazyLeftButton = this.add.rectangle(width / 2 - 60, y, bw, bh, GameConfig.UI.SUCCESS, 0.8);
    this.crazyLeftButton.setStrokeStyle(2, GameConfig.UI.SUCCESS).setInteractive();
    this.crazyLeftText = this.add.text(width / 2 - 60, y, '← SWIPE', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Right swipe button
    this.crazyRightButton = this.add.rectangle(width / 2 + 60, y, bw, bh, GameConfig.UI.SUCCESS, 0.8);
    this.crazyRightButton.setStrokeStyle(2, GameConfig.UI.SUCCESS).setInteractive();
    this.crazyRightText = this.add.text(width / 2 + 60, y, 'SWIPE →', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    this.crazyLeftButton.on('pointerdown', () => {
      if (this.swipeEnabled && !this.isAnimating && !this.isFrenzyMode) {
        this.handleSwipe('left');
      }
    });

    this.crazyRightButton.on('pointerdown', () => {
      if (this.swipeEnabled && !this.isAnimating && !this.isFrenzyMode) {
        this.handleSwipe('right');
      }
    });

    // Initially hidden
    this.setCrazySwipeButtonsVisible(false);
  }

  setCrazySwipeButtonsVisible(visible) {
    if (this.crazyLeftButton) {
      this.crazyLeftButton.setVisible(visible);
      this.crazyLeftText.setVisible(visible);
      this.crazyRightButton.setVisible(visible);
      this.crazyRightText.setVisible(visible);
    }
  }

  createPowerUpButton(x, y, type, icon, cost) {
    const bg = this.add.graphics();
    bg.fillStyle(GameConfig.UI.PRIMARY, 0.3);
    bg.lineStyle(2, GameConfig.UI.PRIMARY, 1);
    bg.fillRoundedRect(x - 28, y - 18, 56, 36, 6);
    bg.strokeRoundedRect(x - 28, y - 18, 56, 36, 6);

    const label = this.add.text(x, y - 4, icon, {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    const costText = this.add.text(x, y + 10, cost.toString(), {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', color: '#888888'
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(x, y, 56, 36, 0x000000, 0).setInteractive();
    hitArea.on('pointerdown', (pointer) => {
      // Mark that this click was handled by a button
      pointer.powerUpButtonClicked = true;
      this.activatePowerUp(type);
    });

    return { bg, label, costText, hitArea, x, y, type };
  }

  setupFrenzyBar(y) {
    const { width } = this.cameras.main;
    const barWidth = 180;

    this.add.text(width / 2 - barWidth / 2 - 5, y + 8, 'FRENZY', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ff6b6b'
    }).setOrigin(1, 0.5);

    this.frenzyBarBg = this.add.graphics();
    this.frenzyBarBg.fillStyle(GameConfig.UI.GRID_BG, 1);
    this.frenzyBarBg.fillRoundedRect(width / 2 - barWidth / 2, y, barWidth, 16, 4);

    this.frenzyBarFill = this.add.graphics();

    this.frenzyBarText = this.add.text(width / 2, y + 8, '0/50', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', color: '#ffffff'
    }).setOrigin(0.5);

    this.frenzyBarX = width / 2 - barWidth / 2;
    this.frenzyBarY = y;
    this.frenzyBarWidth = barWidth;

    // Frenzy activate button (hidden until ready)
    this.frenzyActivateBtn = this.add.text(width / 2, y + 28, 'ACTIVATE FRENZY!', {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: '#ffffff', backgroundColor: '#ff6b6b', padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setInteractive().setVisible(false);

    this.frenzyActivateBtn.on('pointerdown', () => this.activateFrenzy());
  }

  setupNextTilePreview() {
    const previewX = this.cameras.main.width / 2;
    const previewY = this.GRID_OFFSET_Y - 40;

    // NEXT label on the left side of the tile preview
    this.add.text(previewX - 45, previewY, 'NEXT', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#888888'
    }).setOrigin(1, 0.5);

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

      // Skip if a power-up button was clicked
      if (pointer.powerUpButtonClicked) {
        pointer.powerUpButtonClicked = false;
        return;
      }

      // Check for selection mode first
      if (this.selectionMode) {
        this.handleSelectionClick(pointer);
        return;
      }

      const dx = pointer.x - this.pointerStartX;
      const dy = pointer.y - this.pointerStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check for swipe gestures
      if (dist > GameConfig.GAMEPLAY.SWIPE_THRESHOLD) {
        if (this.isFrenzyMode) {
          // Frenzy: allow all 4 directions
          if (Math.abs(dx) > Math.abs(dy)) {
            this.handleFrenzySwipe(dx > 0 ? 'right' : 'left');
          } else {
            this.handleFrenzySwipe(dy > 0 ? 'down' : 'up');
          }
          return;
        } else if (this.swipeEnabled && Math.abs(dx) > Math.abs(dy)) {
          this.handleSwipe(dx > 0 ? 'right' : 'left');
          return;
        }
      }

      // Check for column tap
      for (const zone of this.columnZones) {
        if (zone.getBounds().contains(pointer.x, pointer.y)) {
          this.handleColumnTap(zone.getData('column'));
          return;
        }
      }
    });

    // Keyboard input for arrow keys
    this.input.keyboard.on('keydown-LEFT', () => {
      if (this.isAnimating || this.selectionMode) return;
      if (this.isFrenzyMode) {
        this.handleFrenzySwipe('left');
      } else if (this.swipeEnabled) {
        this.handleSwipe('left');
      }
    });

    this.input.keyboard.on('keydown-RIGHT', () => {
      if (this.isAnimating || this.selectionMode) return;
      if (this.isFrenzyMode) {
        this.handleFrenzySwipe('right');
      } else if (this.swipeEnabled) {
        this.handleSwipe('right');
      }
    });

    this.input.keyboard.on('keydown-UP', () => {
      if (this.isAnimating || this.selectionMode) return;
      if (this.isFrenzyMode) {
        this.handleFrenzySwipe('up');
      }
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      if (this.isAnimating || this.selectionMode) return;
      if (this.isFrenzyMode) {
        this.handleFrenzySwipe('down');
      }
    });
  }

  /**
   * Handle clicks during selection mode (swap/merger)
   */
  handleSelectionClick(pointer) {
    // Find which tile was clicked
    const gridX = Math.floor((pointer.x - this.GRID_OFFSET_X) / this.TILE_SIZE);
    const gridY = Math.floor((pointer.y - this.GRID_OFFSET_Y) / this.TILE_SIZE);

    if (gridX < 0 || gridX >= this.GRID_COLS || gridY < 0 || gridY >= this.GRID_ROWS) {
      this.exitSelectionMode();
      return;
    }

    const key = `${gridX},${gridY}`;
    const tile = this.tiles[key];

    if (!tile) {
      if (this.selectedTile1) {
        this.exitSelectionMode();
      }
      return;
    }

    if (this.selectionMode === 'swap') {
      this.handleSwapSelection(gridX, gridY, tile);
    } else if (this.selectionMode === 'merger') {
      this.handleMergerSelection(gridX, gridY, tile);
    }
  }

  handleSwapSelection(col, row, tile) {
    // Check if tile is a lead or steel tile (cannot be swapped)
    const boardValue = this.boardLogic.board[col][row];
    if (typeof boardValue === 'object' && (boardValue?.type === 'lead' || boardValue?.type === 'steel' || boardValue?.blocked)) {
      this.showMessage('Cannot swap special tiles!');
      tile.shakeAnimation();
      return;
    }

    if (!this.selectedTile1) {
      this.selectedTile1 = { col, row, tile };
      tile.setSelected(true);
      this.showMessage('Select second tile to swap');
    } else {
      // Perform swap
      const result = this.boardLogic.swapTiles(
        this.selectedTile1.col, this.selectedTile1.row, col, row
      );

      if (result.success) {
        this.powerUpManager.spend('swapper');
        // Clear selection BEFORE animating so killTweensOf doesn't cancel the move tween
        const tile1Data = this.selectedTile1;
        this.selectedTile1.tile.setSelected(false);
        this.animateSwap(tile1Data, { col, row, tile });
      }
      this.exitSelectionMode();
    }
  }

  handleMergerSelection(col, row, tile) {
    // Check if tile is a lead or steel tile (cannot be merged)
    const boardValue = this.boardLogic.board[col][row];
    if (typeof boardValue === 'object' && (boardValue?.type === 'lead' || boardValue?.type === 'steel' || boardValue?.blocked)) {
      this.showMessage('Cannot merge special tiles!');
      tile.shakeAnimation();
      return;
    }

    if (!this.selectedTile1) {
      this.selectedTile1 = { col, row, tile };
      tile.setSelected(true);
      this.showMessage('Select second tile to merge');
    } else {
      // Try to merge
      const result = this.boardLogic.forceMerge(
        this.selectedTile1.col, this.selectedTile1.row, col, row
      );

      if (result.success) {
        this.powerUpManager.spend('merger');
        // Clear selection BEFORE animating so killTweensOf doesn't cancel the move tween
        const tile1Data = this.selectedTile1;
        this.selectedTile1.tile.setSelected(false);
        this.animateForceMerge(result, tile1Data, { col, row, tile });
      } else if (result.reason === 'incompatible') {
        // Shake both tiles
        this.selectedTile1.tile.shakeAnimation();
        tile.shakeAnimation();
        this.showMessage('Not compatible!');
      }
      this.exitSelectionMode();
    }
  }

  animateSwap(tile1Data, tile2Data) {
    const { col: col1, row: row1, tile: tile1 } = tile1Data;
    const { col: col2, row: row2, tile: tile2 } = tile2Data;

    // Safety check - both tiles must exist
    if (!tile1 || !tile2) {
      console.error('animateSwap called with missing tile', { tile1, tile2 });
      this.isAnimating = false;
      return;
    }

    // Update visual tiles
    tile1.updatePosition(col2, row2, true, GameConfig.ANIM.SHIFT);
    tile2.updatePosition(col1, row1, true, GameConfig.ANIM.SHIFT);

    // Update tiles map
    delete this.tiles[`${col1},${row1}`];
    delete this.tiles[`${col2},${row2}`];
    this.tiles[`${col2},${row2}`] = tile1;
    this.tiles[`${col1},${row1}`] = tile2;

    // Update special tile position tracking for both tiles
    if (this.specialTileManager) {
      this.specialTileManager.updateTilePosition(col1, row1, col2, row2);
      this.specialTileManager.updateTilePosition(col2, row2, col1, row1);
    }

    this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
      this.applyGravityAfterDrop();
      this.updatePowerUpUI();
    });
  }

  animateForceMerge(result, tile1Data, tile2Data) {
    const { mergedValue, mergedCol, mergedRow } = result;
    const { col: col1, row: row1, tile: tile1 } = tile1Data;
    const { col: col2, row: row2, tile: tile2 } = tile2Data;

    this.isAnimating = true;

    // Remove both tiles from the map immediately
    delete this.tiles[`${col1},${row1}`];
    delete this.tiles[`${col2},${row2}`];

    // Remove any special tiles (like glass) at both positions - merged tile becomes normal
    if (this.specialTileManager) {
      this.specialTileManager.removeTileAt(col1, row1);
      this.specialTileManager.removeTileAt(col2, row2);
    }

    // Animate first tile moving toward second tile's position, then fade out
    tile1.updatePosition(col2, row2, true, GameConfig.ANIM.SHIFT);

    this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
      // Notify special tile manager of merge (for glass damage to adjacent tiles)
      if (this.specialTileManager) {
        const events = this.specialTileManager.onMerge(mergedCol, mergedRow);
        this.handleSpecialTileEvents(events);
      }

      // Now destroy both tiles and create merged tile (always normal tile)
      tile1.mergeAnimation();
      tile2.mergeAnimation(() => {
        const merged = new Tile(this, mergedCol, mergedRow, mergedValue, this.boardLogic.nextTileId++);
        merged.updatePosition(mergedCol, mergedRow, false);
        merged.setScale(0.5).setAlpha(0.5);

        this.boardLogic.addScore(mergedValue);
        this.powerUpManager.addMergePoint();
        this.updateUI();

        this.tweens.add({
          targets: merged, scaleX: 1, scaleY: 1, alpha: 1,
          duration: GameConfig.ANIM.DROP, ease: 'Back.easeOut',
          onComplete: () => {
            this.tiles[`${mergedCol},${mergedRow}`] = merged;
            this.applyGravityAfterDrop();
            this.updatePowerUpUI();
          }
        });
      });
    });
  }

  exitSelectionMode() {
    if (this.selectedTile1?.tile) {
      this.selectedTile1.tile.setSelected(false);
    }
    this.selectionMode = null;
    this.selectedTile1 = null;
    this.hideMessage();
    this.hideCancelButton();
  }

  showCancelButton() {
    if (this.cancelButton) return;

    const { width } = this.cameras.main;
    this.cancelButton = this.add.text(width / 2, this.GRID_OFFSET_Y - 45, 'CANCEL', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: '#ffffff', backgroundColor: '#e24a4a', padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setDepth(200).setInteractive();

    this.cancelButton.on('pointerdown', (pointer) => {
      pointer.powerUpButtonClicked = true;
      this.exitSelectionMode();
    });
  }

  hideCancelButton() {
    if (this.cancelButton) {
      this.cancelButton.destroy();
      this.cancelButton = null;
    }
  }

  /**
   * Activate a power-up
   */
  activatePowerUp(type) {
    if (this.isAnimating || this.selectionMode) return;
    if (!this.powerUpManager.canAfford(type)) {
      this.showMessage('Not enough power!');
      return;
    }

    switch (type) {
      case 'swipe':
        if (this.powerUpManager.spend('swipe')) {
          this.swipeEnabled = true;
          this.showMessage('Swipe enabled! Use buttons or gesture');
          this.setCrazySwipeButtonsVisible(true);
          this.updatePowerUpUI();
        }
        break;

      case 'swapper':
        this.selectionMode = 'swap';
        this.showMessage('Tap first tile to swap');
        this.showCancelButton();
        break;

      case 'merger':
        this.selectionMode = 'merger';
        this.showMessage('Tap first tile to merge');
        this.showCancelButton();
        break;

      case 'wildcard':
        if (this.powerUpManager.spend('wildcard')) {
          this.nextTileValue = 'wildcard';
          this.nextTileType = 'wildcard';
          this.updateNextTilePreview();
          this.showMessage('Next tile is WILDCARD!');
          this.updatePowerUpUI();
        }
        break;
    }
  }

  /**
   * Activate frenzy mode
   */
  activateFrenzy() {
    if (this.powerUpManager.activateFrenzy()) {
      this.isFrenzyMode = true;
      this.showFrenzyOverlay();
      this.updatePowerUpUI();
    }
  }

  showFrenzyOverlay() {
    const { width, height } = this.cameras.main;

    // Red tint overlay
    this.frenzyOverlay = this.add.graphics();
    this.frenzyOverlay.fillStyle(0xff0000, 0.1);
    this.frenzyOverlay.fillRect(0, 0, width, height);
    this.frenzyOverlay.setDepth(50);

    // Pulsing effect
    this.tweens.add({
      targets: this.frenzyOverlay,
      alpha: 0.2,
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    // Timer display
    this.frenzyTimerText = this.add.text(width / 2, 95, '10.0s', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ff6b6b'
    }).setOrigin(0.5).setDepth(100);

    // Direction hints
    this.frenzyHintText = this.add.text(width / 2, 120, 'SWIPE ANY DIRECTION!', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#ffffff'
    }).setOrigin(0.5).setDepth(100);

    // Start timer
    this.frenzyTimerEvent = this.time.addEvent({
      delay: 100,
      callback: () => {
        const remaining = this.powerUpManager.getFrenzyTimeRemaining();
        if (this.frenzyTimerText) {
          this.frenzyTimerText.setText((remaining / 1000).toFixed(1) + 's');
        }

        if (this.powerUpManager.updateFrenzy()) {
          this.endFrenzy();
        }
      },
      loop: true
    });
  }

  endFrenzy() {
    this.isFrenzyMode = false;

    if (this.frenzyTimerEvent) {
      this.frenzyTimerEvent.remove();
      this.frenzyTimerEvent = null;
    }

    if (this.frenzyOverlay) {
      this.frenzyOverlay.destroy();
      this.frenzyOverlay = null;
    }

    if (this.frenzyTimerText) {
      this.frenzyTimerText.destroy();
      this.frenzyTimerText = null;
    }

    if (this.frenzyHintText) {
      this.frenzyHintText.destroy();
      this.frenzyHintText = null;
    }

    // Apply gravity after frenzy ends
    this.applyGravityAfterDrop();
    this.updatePowerUpUI();
  }

  handleFrenzySwipe(direction) {
    if (this.isAnimating || !this.isFrenzyMode) return;
    this.isAnimating = true;

    const ops = this.boardLogic.frenzyShift(direction);
    if (ops.length === 0) {
      this.isAnimating = false;
      return;
    }

    this.animateFrenzyOperations(ops, () => {
      // No gravity during frenzy
      ops.forEach(op => {
        if (op.type === 'frenzy-merge') {
          this.powerUpManager.addMergePoint();
        }
      });
      this.isAnimating = false;
      this.updatePowerUpUI();
    });
  }

  animateFrenzyOperations(operations, onComplete) {
    let completed = 0;
    const total = operations.length;
    if (total === 0) { onComplete(); return; }

    operations.forEach(op => {
      const fromKey = `${op.fromCol},${op.fromRow}`;
      const toKey = `${op.toCol},${op.toRow}`;
      const tile = this.tiles[fromKey];

      if (!tile) { completed++; if (completed === total) onComplete(); return; }
      delete this.tiles[fromKey];

      if (op.type === 'frenzy-move') {
        tile.updatePosition(op.toCol, op.toRow, true, GameConfig.ANIM.SHIFT);
        this.tiles[toKey] = tile;

        // Update special tile position tracking
        if (this.specialTileManager) {
          this.specialTileManager.updateTilePosition(op.fromCol, op.fromRow, op.toCol, op.toRow);
        }

        this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
          completed++;
          if (completed === total) onComplete();
        });
      } else if (op.type === 'frenzy-merge') {
        const mergeWith = this.tiles[toKey];
        tile.updatePosition(op.toCol, op.toRow, true, GameConfig.ANIM.SHIFT);

        // Remove any special tiles (like glass) at both positions - merged tile becomes normal
        if (this.specialTileManager) {
          this.specialTileManager.removeTileAt(op.fromCol, op.fromRow);
          this.specialTileManager.removeTileAt(op.toCol, op.toRow);
        }

        this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
          if (mergeWith) { delete this.tiles[toKey]; mergeWith.mergeAnimation(); }

          // Notify special tile manager of merge (for glass damage to adjacent tiles)
          if (this.specialTileManager) {
            const events = this.specialTileManager.onMerge(op.toCol, op.toRow);
            this.handleSpecialTileEvents(events);
          }

          tile.mergeAnimation(() => {
            const merged = new Tile(this, op.toCol, op.toRow, op.value, this.boardLogic.nextTileId++);
            merged.updatePosition(op.toCol, op.toRow, false);
            merged.setScale(0.5).setAlpha(0.5);
            this.boardLogic.addScore(op.value);
            this.updateUI();

            this.tweens.add({
              targets: merged, scaleX: 1, scaleY: 1, alpha: 1,
              duration: GameConfig.ANIM.MERGE, ease: 'Back.easeOut',
              onComplete: () => {
                this.tiles[toKey] = merged;
                completed++;
                if (completed === total) onComplete();
              }
            });
          });
        });
      }
    });
  }

  generateNextTile() {
    // Don't override if wildcard is set
    if (this.nextTileType === 'wildcard') return;

    this.nextTileValue = this.boardLogic.getRandomTileValue();
    this.nextTileType = 'normal';
    this.updateNextTilePreview();
  }

  updateNextTilePreview() {
    this.nextTilePreview.removeAll(true);
    const size = 50;
    const bg = this.add.graphics();

    let color, displayText, textColor;

    if (this.nextTileType === 'wildcard') {
      color = GameConfig.COLORS.WILDCARD;
      displayText = '?';
      textColor = '#ffffff';
    } else {
      color = getTileColor(this.nextTileValue);
      displayText = this.nextTileValue.toString();
      textColor = getTileTextColor(this.nextTileValue);
    }

    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 6);
    bg.lineStyle(2, 0xffffff, 0.3);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 6);

    const text = this.add.text(0, 0, displayText, {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: textColor
    }).setOrigin(0.5);

    this.nextTilePreview.add([bg, text]);
  }

  handleColumnTap(col) {
    if (this.isAnimating || this.selectionMode) return;

    // Check move limit for levels
    if (this.levelConfig && this.boardLogic.getMovesUsed() >= this.levelConfig.maxMoves) {
      return;
    }

    const result = this.boardLogic.dropTile(col, this.nextTileValue);
    if (!result.success) return;

    this.isAnimating = true;

    const tileType = this.nextTileType;
    const tile = new Tile(this, col, result.row, this.nextTileValue, result.tileId, tileType);
    this.tiles[`${col},${result.row}`] = tile;

    if (result.merged) {
      tile.dropFromTop(result.finalRow, GameConfig.ANIM.DROP);
      this.time.delayedCall(GameConfig.ANIM.DROP, () => {
        this.handleMerge(col, result.finalRow, result.finalValue, tile);
      });
    } else {
      tile.dropFromTop(result.finalRow, GameConfig.ANIM.DROP);
      this.time.delayedCall(GameConfig.ANIM.DROP + 20, () => {
        this.onDropComplete();
      });
    }

    // Reset wildcard state
    this.nextTileType = 'normal';
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

    // Remove any special tile (like glass) at the merge position - merged tile becomes normal
    if (this.specialTileManager) {
      this.specialTileManager.removeTileAt(col, row);
    }

    // Notify special tile manager of merge (for glass damage to adjacent tiles)
    if (this.specialTileManager) {
      const events = this.specialTileManager.onMerge(col, row);
      this.handleSpecialTileEvents(events);
    }

    droppingTile.mergeAnimation(() => {
      const merged = new Tile(this, col, row, newValue, this.boardLogic.nextTileId++);
      merged.updatePosition(col, row, false);
      merged.setScale(0.5).setAlpha(0.5);

      this.boardLogic.addScore(newValue);
      this.powerUpManager.addMergePoint();
      this.updateUI();

      this.tweens.add({
        targets: merged, scaleX: 1, scaleY: 1, alpha: 1,
        duration: GameConfig.ANIM.DROP, ease: 'Back.easeOut',
        onComplete: () => {
          this.tiles[key] = merged;
          this.updatePowerUpUI();
          // Call onDropComplete to update special tiles (steel countdown, etc.)
          this.onDropComplete();
        }
      });
    });
  }

  onDropComplete() {
    // Update special tiles
    if (this.specialTileManager) {
      const events = this.specialTileManager.updateSpecialTiles();
      this.handleSpecialTileEvents(events);

      // Spawn special tiles based on mode and level config
      if (this.gameMode === 'crazy') {
        // Crazy mode: random spawns
        // Steel plate (5% chance)
        if (Math.random() < GameConfig.SPECIAL_TILES.STEEL_SPAWN_CHANCE) {
          const plate = this.specialTileManager.spawnSteelPlate();
          if (plate) {
            this.createSpecialTile(plate.col, plate.row, 'steel', { turnsRemaining: plate.turnsRemaining });
          }
        }
        // Glass tile (3% chance)
        if (Math.random() < 0.03) {
          const emptyCell = this.specialTileManager.findRandomEmptyCell();
          if (emptyCell) {
            const glassValue = [3, 6, 12][Math.floor(Math.random() * 3)];
            const glassTile = this.specialTileManager.spawnGlassTile(emptyCell.col, emptyCell.row, glassValue);
            this.createSpecialTile(emptyCell.col, emptyCell.row, 'glass', { durability: glassTile.durability, value: glassValue });
          }
        }
        // Lead tile (2% chance)
        if (Math.random() < 0.02) {
          const emptyCell = this.specialTileManager.findRandomEmptyCell();
          if (emptyCell) {
            const leadTile = this.specialTileManager.spawnLeadTile(emptyCell.col, emptyCell.row);
            this.createSpecialTile(emptyCell.col, emptyCell.row, 'lead', { countdown: leadTile.countdown });
          }
        }
      } else if (this.gameMode === 'level' && this.levelConfig) {
        // Level mode: use level-specific spawn rates for objectives
        // Glass tiles for glass-clearing objectives
        const glassSpawnRate = this.levelConfig.glassSpawnRate || 0;
        if (glassSpawnRate > 0 && Math.random() < glassSpawnRate) {
          const emptyCell = this.specialTileManager.findRandomEmptyCell();
          if (emptyCell) {
            const allowedValues = this.levelConfig.allowedTiles.filter(v => v >= 3);
            const glassValue = allowedValues.length > 0
              ? allowedValues[Math.floor(Math.random() * allowedValues.length)]
              : 3;
            const glassTile = this.specialTileManager.spawnGlassTile(emptyCell.col, emptyCell.row, glassValue);
            this.createSpecialTile(emptyCell.col, emptyCell.row, 'glass', { durability: glassTile.durability, value: glassValue });
          }
        }
        // Lead tiles for lead-clearing objectives
        const leadSpawnRate = this.levelConfig.leadSpawnRate || 0;
        if (leadSpawnRate > 0 && Math.random() < leadSpawnRate) {
          const emptyCell = this.specialTileManager.findRandomEmptyCell();
          if (emptyCell) {
            const leadTile = this.specialTileManager.spawnLeadTile(emptyCell.col, emptyCell.row);
            this.createSpecialTile(emptyCell.col, emptyCell.row, 'lead', { countdown: leadTile.countdown });
          }
        }
      }
    }

    this.applyGravityAfterDrop();
  }

  handleSpecialTileEvents(events) {
    events.forEach(event => {
      const key = `${event.col},${event.row}`;
      const tile = this.tiles[key];

      switch (event.type) {
        case 'steel_removed':
          if (tile) {
            delete this.tiles[key];
            tile.fadeOutAnimation();
          }
          break;
        case 'lead_removed':
          if (tile) {
            delete this.tiles[key];
            tile.fadeOutAnimation();
          }
          this.leadCleared++;
          break;
        case 'lead_decremented':
          if (tile) {
            tile.updateSpecialData({ countdown: event.countdown });
          }
          break;
        case 'glass_broken':
          if (tile) {
            delete this.tiles[key];
            tile.breakAnimation();
          }
          this.glassCleared++;
          break;
        case 'glass_cracked':
          if (tile) {
            tile.updateSpecialData({ durability: event.durability });
          }
          break;
        case 'steel_tick':
          if (tile) {
            tile.updateSpecialData({ turnsRemaining: event.turnsRemaining });
          }
          break;
      }
    });
  }

  createSpecialTile(col, row, type, specialData) {
    // Glass tiles have a value, others don't
    const value = specialData.value || null;
    const tile = new Tile(this, col, row, value, this.boardLogic.nextTileId++, type, specialData);
    this.tiles[`${col},${row}`] = tile;
    return tile;
  }

  applyGravityAfterDrop() {
    if (this.isFrenzyMode) {
      // No gravity during frenzy
      this.isAnimating = false;
      this.checkEndConditions();
      return;
    }

    const ops = this.boardLogic.applyGravity();
    if (ops.length > 0) {
      this.animateGravity(ops, () => {
        this.updatePowerUpUI();
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

        // Update special tile position tracking
        if (this.specialTileManager) {
          this.specialTileManager.updateTilePosition(op.fromCol, op.row, op.toCol, op.row);
        }

        this.time.delayedCall(GameConfig.ANIM.SHIFT, () => { completed++; if (completed === total) onComplete(); });
      } else if (op.type === 'merge') {
        const mergeWith = this.tiles[toKey];
        tile.updatePosition(op.toCol, op.row, true, GameConfig.ANIM.SHIFT);

        // Remove any special tiles (like glass) at both positions - merged tile becomes normal
        if (this.specialTileManager) {
          this.specialTileManager.removeTileAt(op.fromCol, op.row);
          this.specialTileManager.removeTileAt(op.toCol, op.row);
        }

        this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
          if (mergeWith) { delete this.tiles[toKey]; mergeWith.mergeAnimation(); }

          // Notify special tile manager of merge (for glass damage to adjacent tiles)
          if (this.specialTileManager) {
            const events = this.specialTileManager.onMerge(op.toCol, op.row);
            this.handleSpecialTileEvents(events);
          }

          tile.mergeAnimation(() => {
            const merged = new Tile(this, op.toCol, op.row, op.value, this.boardLogic.nextTileId++);
            merged.updatePosition(op.toCol, op.row, false);
            merged.setScale(0.5).setAlpha(0.5);
            this.boardLogic.addScore(op.value);
            this.powerUpManager.addMergePoint();
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

          // Update special tile position tracking
          if (this.specialTileManager) {
            this.specialTileManager.updateTilePosition(op.col, op.fromRow, op.col, op.toRow);
          }

          this.time.delayedCall(GameConfig.ANIM.FALL, processNext);
        } else if (op.type === 'fall-merge') {
          const mergeWith = this.tiles[toKey];
          tile.updatePosition(op.col, op.toRow, true, GameConfig.ANIM.FALL);

          // Remove any special tiles (like glass) at both positions - merged tile becomes normal
          if (this.specialTileManager) {
            this.specialTileManager.removeTileAt(op.col, op.fromRow);
            this.specialTileManager.removeTileAt(op.col, op.toRow);
          }

          this.time.delayedCall(GameConfig.ANIM.FALL, () => {
            if (mergeWith) { delete this.tiles[toKey]; mergeWith.mergeAnimation(); }

            // Notify special tile manager of merge (for glass damage to adjacent tiles)
            if (this.specialTileManager) {
              const events = this.specialTileManager.onMerge(op.col, op.toRow);
              this.handleSpecialTileEvents(events);
            }

            tile.mergeAnimation(() => {
              const merged = new Tile(this, op.col, op.toRow, op.value, this.boardLogic.nextTileId++);
              merged.updatePosition(op.col, op.toRow, false);
              merged.setScale(0.5).setAlpha(0.5);
              this.boardLogic.addScore(op.value);
              this.powerUpManager.addMergePoint();
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
    // Deduct cost based on mode
    if (this.gameMode === 'original') {
      this.boardLogic.subtractMergeCount(GameConfig.GAMEPLAY.COMBO_COST);
      this.updateOriginalComboBar();
    } else {
      // In crazy/level modes, swipe already spent when enabled
      this.swipeEnabled = false;
      this.setCrazySwipeButtonsVisible(false);
    }
    this.updatePowerUpUI();
    this.isAnimating = false;
    this.checkEndConditions();
  }

  updateUI() {
    if (this.gameMode === 'level' && this.levelConfig) {
      const state = this.boardLogic.getGameState();
      // Add special tile tracking to state for progress display
      state.glassCleared = this.glassCleared;
      state.leadCleared = this.leadCleared;
      this.progressText.setText(levelManager.getProgressText(this.levelConfig.objective, state));
      this.movesText.setText(`Moves: ${state.movesUsed}/${this.levelConfig.maxMoves}`);
    } else if (this.scoreText) {
      this.scoreText.setText(`SCORE: ${this.boardLogic.getScore()}`);
    }
  }

  updateOriginalComboBar() {
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

  updatePowerUpUI() {
    if (this.gameMode === 'original') {
      this.updateOriginalComboBar();
      return;
    }

    const state = this.powerUpManager.getState();

    // Update resource text
    if (this.resourceText) {
      this.resourceText.setText(`POWER: ${state.resourcePoints}`);
    }

    // Update button states
    Object.values(this.powerUpButtons).forEach(btn => {
      const canAfford = this.powerUpManager.canAfford(btn.type);

      btn.bg.clear();
      if (canAfford) {
        btn.bg.fillStyle(GameConfig.UI.SUCCESS, 0.4);
        btn.bg.lineStyle(2, GameConfig.UI.SUCCESS, 1);
      } else {
        btn.bg.fillStyle(GameConfig.UI.PRIMARY, 0.2);
        btn.bg.lineStyle(2, GameConfig.UI.DISABLED, 0.5);
      }
      btn.bg.fillRoundedRect(btn.x - 28, btn.y - 18, 56, 36, 6);
      btn.bg.strokeRoundedRect(btn.x - 28, btn.y - 18, 56, 36, 6);

      btn.label.setColor(canAfford ? '#ffffff' : '#666666');
      btn.costText.setColor(canAfford ? '#7ed321' : '#666666');
    });

    // Update frenzy bar
    if (this.frenzyBarFill) {
      const ratio = state.frenzyMeter / state.frenzyThreshold;
      this.frenzyBarFill.clear();
      if (ratio > 0) {
        this.frenzyBarFill.fillStyle(GameConfig.UI.FRENZY, 1);
        this.frenzyBarFill.fillRoundedRect(this.frenzyBarX, this.frenzyBarY, this.frenzyBarWidth * ratio, 16, 4);
      }
      this.frenzyBarText.setText(`${state.frenzyMeter}/${state.frenzyThreshold}`);

      // Show/hide activate button
      if (this.frenzyActivateBtn) {
        this.frenzyActivateBtn.setVisible(state.isFrenzyReady && !state.isFrenzyActive);
      }
    }
  }

  showMessage(text) {
    if (this.messageText) {
      this.messageText.destroy();
    }

    const { width } = this.cameras.main;
    this.messageText = this.add.text(width / 2, this.GRID_OFFSET_Y - 70, text, {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: '#ffffff', backgroundColor: '#333333', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(200);

    // Auto-hide after 2 seconds
    this.time.delayedCall(2000, () => {
      if (this.messageText) {
        this.messageText.destroy();
        this.messageText = null;
      }
    });
  }

  hideMessage() {
    if (this.messageText) {
      this.messageText.destroy();
      this.messageText = null;
    }
  }

  checkEndConditions() {
    if (this.gameMode === 'level' && this.levelConfig) {
      const state = this.boardLogic.getGameState();
      // Add special tile tracking to state
      state.glassCleared = this.glassCleared;
      state.leadCleared = this.leadCleared;

      if (levelManager.checkObjective(this.levelConfig.objective, state)) {
        this.showLevelComplete();
        return;
      }

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
    const finalScore = this.boardLogic.getScore();

    // Save high score for original and crazy modes
    const isNewHighScore = highScoreManager.submitScore(this.gameMode, finalScore);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1000);

    this.add.text(width / 2, height / 2 - 70, 'GAME OVER', {
      fontSize: '48px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5).setDepth(1001);

    this.add.text(width / 2, height / 2 - 20, `Final Score: ${finalScore}`, {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#f5a623'
    }).setOrigin(0.5).setDepth(1001);

    // Show new high score message if achieved
    if (isNewHighScore) {
      const newRecordText = this.add.text(width / 2, height / 2 + 15, 'NEW HIGH SCORE!', {
        fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#7ed321'
      }).setOrigin(0.5).setDepth(1001);
      this.tweens.add({ targets: newRecordText, scale: 1.1, duration: 500, yoyo: true, repeat: -1 });
    } else {
      const highScore = highScoreManager.getHighScore(this.gameMode);
      this.add.text(width / 2, height / 2 + 15, `Best: ${highScore}`, {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#888888'
      }).setOrigin(0.5).setDepth(1001);
    }

    const restartBtn = this.add.text(width / 2, height / 2 + 60, 'TAP TO RESTART', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#4a90e2'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    restartBtn.on('pointerdown', () => this.scene.restart());
    this.tweens.add({ targets: restartBtn, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });

    // Menu button
    const menuBtn = this.add.text(width / 2, height / 2 + 100, 'MAIN MENU', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
