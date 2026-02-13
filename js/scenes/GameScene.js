/**
 * GameScene - Main gameplay scene (original, crazy, and level modes)
 */
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.gameMode = data.mode || 'original';  // 'original', 'crazy', 'level', 'daily', 'endless'
    this.levelId = data.levelId || null;
    this.levelConfig = this.levelId ? levelManager.getLevel(this.levelId) : null;

    // Daily challenge data
    this.dailyChallenge = data.dailyChallenge || null;
    this.dailyMoveCount = 0;
    this.dailyChallengeCompleted = false;

    // Check if resuming from saved state
    this.resumeFromSave = data.resumeFromSave || false;
  }

  create() {
    // Get responsive layout based on current screen size
    const { width, height } = this.cameras.main;
    this.layout = GameConfig.getLayout(width, height);

    // Grid settings from dynamic layout
    this.GRID_COLS = GameConfig.GRID.COLS;
    this.GRID_ROWS = GameConfig.GRID.ROWS;
    this.TILE_SIZE = this.layout.tileSize;
    this.GRID_OFFSET_X = this.layout.offsetX;
    this.GRID_OFFSET_Y = this.layout.offsetY;

    // Listen for resize events
    this.scale.on('resize', this.onResize, this);

    // Initialize board logic with appropriate config
    const boardConfig = {
      cols: this.GRID_COLS,
      rows: this.GRID_ROWS,
      useScoreUnlocks: this.gameMode === 'original' || this.gameMode === 'crazy'
    };

    if (this.levelConfig) {
      boardConfig.allowedTiles = this.levelConfig.allowedTiles;
      boardConfig.startingCombo = this.levelConfig.startingCombo || 0;

      // Apply modifier tile weights if present
      if (this.levelConfig.modifier?.tileWeights) {
        boardConfig.tileWeights = this.levelConfig.modifier.tileWeights;
      }
    }

    // Apply daily challenge modifier tile weights
    if (this.dailyChallenge?.modifier?.id === 'more_1s') {
      boardConfig.tileWeights = { 1: 0.75, 2: 0.25 };
    } else if (this.dailyChallenge?.modifier?.id === 'more_2s') {
      boardConfig.tileWeights = { 1: 0.25, 2: 0.75 };
    }

    // Store modifier for other effects (frenzy boost, glass spawn rate, etc.)
    this.modifier = this.levelConfig?.modifier || this.dailyChallenge?.modifier || null;

    // Track if player has used ad continue (only allowed once per game)
    this.hasUsedAdContinue = false;

    this.boardLogic = new BoardLogic(boardConfig);

    // Initialize PowerUpManager based on mode
    this.powerUpManager = new PowerUpManager(this.getPowerUpConfig());

    // Initialize SpecialTileManager for crazy, endless, daily modes, or levels with special tiles
    const needsSpecialTiles = this.gameMode === 'crazy' ||
      this.gameMode === 'endless' ||
      this.gameMode === 'daily' ||
      this.levelConfig?.specialTiles ||
      this.modifier?.id === 'glass_chaos' ||
      this.modifier?.id === 'steel_maze';

    if (needsSpecialTiles) {
      this.specialTileManager = new SpecialTileManager(this.boardLogic);
    }

    // Set starting board if defined
    if (this.levelConfig?.startingBoard) {
      this.boardLogic.setBoard(this.levelConfig.startingBoard);
    }

    // Game state - initialize tiles before special tiles
    this.tiles = {};

    // Initialize starting special tiles from level config
    // Note: we create the tiles here, but they get synced visually later in create()
    if (this.specialTileManager && this.levelConfig?.startingSpecialTiles) {
      this.initializeStartingSpecialTilesData(this.levelConfig.startingSpecialTiles);
    }

    // Initialize starting special tiles for daily challenge modifiers
    if (this.specialTileManager && this.gameMode === 'daily' && this.dailyChallenge?.modifier) {
      const modifier = this.dailyChallenge.modifier;
      if (modifier.id === 'steel_maze') {
        // Create a maze pattern with steel tiles
        const steelTiles = [
          { type: 'steel', col: 0, row: 4, duration: 20 },
          { type: 'steel', col: 1, row: 3, duration: 20 },
          { type: 'steel', col: 2, row: 3, duration: 20 },
          { type: 'steel', col: 3, row: 4, duration: 20 }
        ];
        this.initializeStartingSpecialTilesData(steelTiles);
        this.dailyStartingSpecialTiles = steelTiles;
      } else if (modifier.id === 'narrow_board') {
        // Block the rightmost column with permanent steel
        const steelTiles = [
          { type: 'steel', col: 3, row: 0, duration: 999 },
          { type: 'steel', col: 3, row: 1, duration: 999 },
          { type: 'steel', col: 3, row: 2, duration: 999 },
          { type: 'steel', col: 3, row: 3, duration: 999 },
          { type: 'steel', col: 3, row: 4, duration: 999 },
          { type: 'steel', col: 3, row: 5, duration: 999 }
        ];
        this.initializeStartingSpecialTilesData(steelTiles);
        this.dailyStartingSpecialTiles = steelTiles;
      }
    }
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

    // Animation controller
    this.animationController = new GameAnimationController(this);

    // Cascade merge counter for combo tracking
    this.cascadeMergeCount = 0;

    // Modal state - blocks game input when help menu is open
    this.modalOpen = false;

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

    // Render starting tiles if any (apply gravity first so tiles fall to bottom)
    if (this.levelConfig?.startingBoard) {
      this.applyStartingBoardGravity();
      this.renderBoardState();
    }

    // Apply gravity to starting special tiles and render them
    if (this.specialTileManager && this.levelConfig?.startingSpecialTiles) {
      this.applyStartingSpecialTilesGravity();
      this.renderSpecialTiles();
    }

    // Render daily challenge starting special tiles
    if (this.specialTileManager && this.dailyStartingSpecialTiles) {
      this.applyStartingSpecialTilesGravity();
      this.renderSpecialTiles();
    }

    // Check if resuming from saved state
    if (this.resumeFromSave) {
      const savedState = gameStateManager.getSavedGame(this.gameMode);
      if (savedState) {
        this.loadSavedState(savedState);
        return; // Don't generate new next tile, use saved one
      }
    }

    this.generateNextTile();
  }

  /**
   * Load saved game state and render it
   */
  loadSavedState(savedState) {
    // Load state into managers
    gameStateManager.loadGameState(this, savedState);

    // Render the board state
    this.renderBoardState();

    // Render special tiles if present
    if (this.specialTileManager) {
      this.renderSpecialTiles();
    }

    // Update UI to reflect loaded state
    this.updatePowerUpUI();
    this.updateUI();

    // Update original combo bar if in original mode
    if (this.gameMode === 'original') {
      this.updateOriginalComboBar();
    }

    // Update next tile preview with saved value
    this.updateNextTilePreview();

    // Don't clear the saved game here - keep it as backup
    // It will be cleared on game over or when user starts a new game
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
      case 'endless':
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
          startingPoints: this.levelConfig?.startingPoints || 0,
          frenzyChargeMultiplier: this.levelConfig?.modifier?.frenzyChargeMultiplier || 1.0
        };
      case 'daily':
        // Daily challenges use configurable power-ups based on challenge type
        const dailyPowerUps = this.dailyChallenge?.type === 'no_power_ups'
          ? []
          : ['swipe', 'swapper', 'merger', 'wildcard'];
        // Apply frenzy boost modifier if present
        const dailyFrenzyMultiplier = this.dailyChallenge?.modifier?.id === 'frenzy_boost' ? 2.0 : 1.0;
        return {
          enabledPowerUps: dailyPowerUps,
          frenzyEnabled: this.dailyChallenge?.type !== 'no_power_ups',
          startingPoints: 0,
          frenzyChargeMultiplier: dailyFrenzyMultiplier
        };
      default:
        return { enabledPowerUps: ['swipe'], frenzyEnabled: false };
    }
  }

  /**
   * Handle window resize - recalculate layout
   */
  onResize(gameSize) {
    const { width, height } = gameSize;
    this.layout = GameConfig.getLayout(width, height);

    // Update grid settings
    this.TILE_SIZE = this.layout.tileSize;
    this.GRID_OFFSET_X = this.layout.offsetX;
    this.GRID_OFFSET_Y = this.layout.offsetY;

    // Update tile positions
    Object.values(this.tiles).forEach(tile => {
      if (tile && tile.updateLayoutPosition) {
        tile.updateLayoutPosition(this.TILE_SIZE, this.GRID_OFFSET_X, this.GRID_OFFSET_Y);
      }
    });

    // Rebuild UI - this is expensive but reliable for resize
    // For production, individual element repositioning would be more efficient
  }

  setupBackground() {
    const { width } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title based on mode
    let titleText = 'THREES-DROP';
    if (this.gameMode === 'crazy') {
      titleText = 'CRAZY MODE';
    } else if (this.gameMode === 'endless') {
      titleText = 'POINTS MAX';
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

    // Mute button
    this.muteBtn = this.add.text(width - 60, 15, soundManager.muted ? '🔇' : '🔊', {
      fontSize: '22px', padding: { x: 6, y: 6 }
    }).setOrigin(1, 0).setInteractive();
    this.muteBtn.on('pointerdown', () => {
      soundManager.init();
      const muted = soundManager.toggleMute();
      this.muteBtn.setText(muted ? '🔇' : '🔊');
    });

    // Help button
    const helpBtn = this.add.text(width - 15, 15, '?', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: '#ffffff', backgroundColor: '#4a90e2', padding: { x: 12, y: 6 }
    }).setOrigin(1, 0).setInteractive();
    helpBtn.on('pointerdown', () => {
      this.modalOpen = true;
      UIHelpers.showHowToPlay(this, () => {
        this.modalOpen = false;
      });
    });

    // Back button
    if (this.gameMode === 'level') {
      // For test levels, show option to close tab; otherwise go to level select
      if (window.isTestLevelSession) {
        this.add.text(15, 15, '< EDITOR', {
          fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#f5c26b'
        }).setInteractive().on('pointerdown', () => {
          window.isTestLevelSession = false;
          window.close();
        });
      } else {
        this.add.text(15, 15, '< BACK', {
          fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
        }).setInteractive().on('pointerdown', () => this.showExitConfirmation('TutorialSelectScene'));
      }
    } else if (this.gameMode === 'daily') {
      this.add.text(15, 15, '< MENU', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
      }).setInteractive().on('pointerdown', () => this.showExitConfirmation('MenuScene'));
    } else {
      this.add.text(15, 15, '< MENU', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
      }).setInteractive().on('pointerdown', () => this.showExitConfirmation('MenuScene'));
    }
  }

  /**
   * Show exit confirmation popup
   */
  showExitConfirmation(targetScene) {
    // Check if game has started (tiles placed or score > 0)
    const hasProgress = this.boardLogic.getScore() > 0 || this.boardLogic.getMovesUsed() > 0;

    if (!hasProgress) {
      // No progress, just exit
      this.scene.start(targetScene);
      return;
    }

    this.modalOpen = true;
    const { width, height } = this.cameras.main;

    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(900);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    // Check if this mode supports saving (not levels or daily)
    const canSave = this.gameMode !== 'level' && this.gameMode !== 'daily';

    // Popup box - larger to fit bigger buttons
    const boxWidth = 300;
    const boxHeight = canSave ? 260 : 200;
    const boxX = width / 2 - boxWidth / 2;
    const boxY = height / 2 - boxHeight / 2;

    const box = this.add.graphics();
    box.fillStyle(0x1a1a2e, 1);
    box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    box.lineStyle(2, 0x4a90e2, 1);
    box.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    box.setDepth(901);

    // Title
    const title = this.add.text(width / 2, boxY + 30, 'EXIT GAME?', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5).setDepth(902);

    // Message
    const message = this.add.text(width / 2, boxY + 60, canSave ? 'Your progress will be saved.' : 'Your progress will be lost.', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: canSave ? '#7ed321' : '#aaaaaa'
    }).setOrigin(0.5).setDepth(902);

    // Button dimensions for consistent sizing
    const btnWidth = 240;
    const btnHeight = 44;
    const btnSpacing = 54;

    // Continue playing button
    const continueBtnY = boxY + 105;
    const continueBtnBg = this.add.graphics();
    continueBtnBg.fillStyle(0x4a90e2, 1);
    continueBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, continueBtnY - btnHeight / 2, btnWidth, btnHeight, 8);
    continueBtnBg.setDepth(902);

    const continueBtn = this.add.text(width / 2, continueBtnY, 'CONTINUE PLAYING', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5).setDepth(903);

    const continueBtnZone = this.add.rectangle(width / 2, continueBtnY, btnWidth, btnHeight, 0x000000, 0)
      .setDepth(904).setInteractive();

    // Save & Exit button (or just Exit for non-saveable modes)
    const exitBtnY = continueBtnY + btnSpacing;
    const exitBtnBg = this.add.graphics();
    exitBtnBg.fillStyle(canSave ? 0x2d5a1e : 0x5a1e1e, 1);
    exitBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, exitBtnY - btnHeight / 2, btnWidth, btnHeight, 8);
    exitBtnBg.setDepth(902);

    const exitBtn = this.add.text(width / 2, exitBtnY, canSave ? 'SAVE & EXIT' : 'EXIT TO MENU', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: canSave ? '#7ed321' : '#e24a4a'
    }).setOrigin(0.5).setDepth(903);

    const exitBtnZone = this.add.rectangle(width / 2, exitBtnY, btnWidth, btnHeight, 0x000000, 0)
      .setDepth(904).setInteractive();

    // Quit without saving button (only for modes that can save)
    let quitBtn = null;
    let quitBtnBg = null;
    let quitBtnZone = null;
    if (canSave) {
      const quitBtnY = exitBtnY + btnSpacing;
      quitBtnBg = this.add.graphics();
      quitBtnBg.fillStyle(0x333333, 1);
      quitBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, quitBtnY - btnHeight / 2, btnWidth, btnHeight, 8);
      quitBtnBg.setDepth(902);

      quitBtn = this.add.text(width / 2, quitBtnY, 'QUIT WITHOUT SAVING', {
        fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#888888'
      }).setOrigin(0.5).setDepth(903);

      quitBtnZone = this.add.rectangle(width / 2, quitBtnY, btnWidth, btnHeight, 0x000000, 0)
        .setDepth(904).setInteractive();
    }

    // Cleanup function
    const cleanup = () => {
      this.modalOpen = false;
      overlay.destroy();
      box.destroy();
      title.destroy();
      message.destroy();
      continueBtnBg.destroy();
      continueBtn.destroy();
      continueBtnZone.destroy();
      exitBtnBg.destroy();
      exitBtn.destroy();
      exitBtnZone.destroy();
      if (quitBtn) {
        quitBtnBg.destroy();
        quitBtn.destroy();
        quitBtnZone.destroy();
      }
    };

    continueBtnZone.on('pointerdown', () => {
      cleanup();
    });

    exitBtnZone.on('pointerdown', () => {
      cleanup();
      if (canSave) {
        // Save game state before exiting
        gameStateManager.saveGameState(this);
      }
      this.scene.start(targetScene);
    });

    if (quitBtnZone) {
      quitBtnZone.on('pointerdown', () => {
        cleanup();
        // Clear any saved game for this mode
        gameStateManager.clearSavedGame(this.gameMode);
        this.scene.start(targetScene);
      });
    }

    overlay.on('pointerdown', () => {
      cleanup();
    });
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
   * Apply gravity to starting board tiles (instant, no animation)
   * This ensures tiles fall to the bottom before the game starts
   */
  applyStartingBoardGravity() {
    // For each column, move tiles down to their final positions
    for (let col = 0; col < this.GRID_COLS; col++) {
      // Process from bottom to top
      for (let row = this.GRID_ROWS - 2; row >= 0; row--) {
        const cell = this.boardLogic.board[col][row];
        if (cell === null) continue;

        // Only process numeric values (normal tiles), not special tile objects
        if (typeof cell === 'number') {
          // Find lowest empty row
          let targetRow = row;
          for (let r = row + 1; r < this.GRID_ROWS; r++) {
            if (this.boardLogic.board[col][r] === null) {
              targetRow = r;
            } else {
              break;
            }
          }

          if (targetRow !== row) {
            // Move the board state
            this.boardLogic.board[col][targetRow] = cell;
            this.boardLogic.board[col][row] = null;
          }
        }
      }
    }
  }

  /**
   * Initialize starting special tiles data (board logic only, no visuals yet)
   */
  initializeStartingSpecialTilesData(specialTiles) {
    specialTiles.forEach(spec => {
      const { type, col, row } = spec;

      switch (type) {
        case 'steel':
          this.specialTileManager.steelPlates.push({
            col, row,
            turnsRemaining: spec.duration || spec.turnsRemaining || 5,
            type: 'steel'
          });
          this.boardLogic.board[col][row] = { type: 'steel', blocked: true };
          break;
        case 'lead':
          this.specialTileManager.leadTiles.push({
            col, row,
            countdown: spec.countdown || 5,
            type: 'lead'
          });
          this.boardLogic.board[col][row] = { type: 'lead', countdown: spec.countdown || 5 };
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
          break;
      }
    });
  }

  /**
   * Render special tiles from board state (called after gravity is applied)
   */
  renderSpecialTiles() {
    // Render steel plates
    this.specialTileManager.steelPlates.forEach(plate => {
      const key = `${plate.col},${plate.row}`;
      if (!this.tiles[key]) {
        const tile = new Tile(this, plate.col, plate.row, null, this.boardLogic.nextTileId++, 'steel', {
          turnsRemaining: plate.turnsRemaining
        });
        this.tiles[key] = tile;
      }
    });

    // Render lead tiles
    this.specialTileManager.leadTiles.forEach(lead => {
      const key = `${lead.col},${lead.row}`;
      if (!this.tiles[key]) {
        const tile = new Tile(this, lead.col, lead.row, null, this.boardLogic.nextTileId++, 'lead', {
          countdown: lead.countdown
        });
        this.tiles[key] = tile;
      }
    });

    // Render glass tiles
    this.specialTileManager.glassTiles.forEach(glass => {
      const key = `${glass.col},${glass.row}`;
      if (!this.tiles[key]) {
        const tile = new Tile(this, glass.col, glass.row, glass.value, this.boardLogic.nextTileId++, 'glass', {
          durability: glass.durability
        });
        this.tiles[key] = tile;
      }
    });

    // Render auto-swapper tiles
    this.specialTileManager.autoSwapperTiles.forEach(swapper => {
      const key = `${swapper.col},${swapper.row}`;
      if (!this.tiles[key]) {
        const tile = new Tile(this, swapper.col, swapper.row, swapper.value, this.boardLogic.nextTileId++, 'auto_swapper', {
          swapsRemaining: swapper.swapsRemaining,
          nextSwapIn: swapper.nextSwapIn
        });
        this.tiles[key] = tile;
      }
    });

    // Render bomb tiles
    this.specialTileManager.bombTiles.forEach(bomb => {
      const key = `${bomb.col},${bomb.row}`;
      if (!this.tiles[key]) {
        const tile = new Tile(this, bomb.col, bomb.row, bomb.value, this.boardLogic.nextTileId++, 'bomb', {
          mergesRemaining: bomb.mergesRemaining
        });
        this.tiles[key] = tile;
      }
    });
  }

  /**
   * Apply gravity to starting special tiles (instant, no animation)
   */
  applyStartingSpecialTilesGravity() {
    // For each column, move special tiles down to their final positions
    for (let col = 0; col < this.GRID_COLS; col++) {
      // Process from bottom to top
      for (let row = this.GRID_ROWS - 2; row >= 0; row--) {
        const cell = this.boardLogic.board[col][row];
        if (cell === null) continue;

        // Check if this is a special tile that can fall (not steel - steel is fixed)
        if (typeof cell === 'object' && cell.type !== 'steel') {
          // Find lowest empty row
          let targetRow = row;
          for (let r = row + 1; r < this.GRID_ROWS; r++) {
            if (this.boardLogic.board[col][r] === null) {
              targetRow = r;
            } else {
              break;
            }
          }

          if (targetRow !== row) {
            // Move the board state
            this.boardLogic.board[col][targetRow] = cell;
            this.boardLogic.board[col][row] = null;

            // Update the special tile manager tracking
            if (cell.type === 'lead') {
              const lead = this.specialTileManager.leadTiles.find(t => t.col === col && t.row === row);
              if (lead) {
                lead.row = targetRow;
              }
            } else if (cell.type === 'glass') {
              const glass = this.specialTileManager.glassTiles.find(t => t.col === col && t.row === row);
              if (glass) {
                glass.row = targetRow;
              }
            }
          }
        }
      }
    }
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
      { type: 'wildcard', icon: 'W', cost: GameConfig.POWERUPS.WILDCARD_COST }
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
    this.add.text(previewX - 50, previewY, 'NEXT', {
      fontSize: '12px', fontFamily: GameConfig.FONTS.UI, fontStyle: 'bold', color: '#00fff5'
    }).setOrigin(1, 0.5);

    this.nextTilePreview = this.add.container(previewX, previewY);
  }

  setupInput() {
    this.input.on('pointerdown', (pointer) => {
      if (this.isAnimating || this.modalOpen) return;
      this.isPointerDown = true;
      this.pointerStartX = pointer.x;
      this.pointerStartY = pointer.y;
    });

    this.input.on('pointerup', (pointer) => {
      if (this.isAnimating || !this.isPointerDown || this.modalOpen) return;
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
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      if (this.isFrenzyMode) {
        this.handleFrenzySwipe('left');
      } else if (this.swipeEnabled) {
        this.handleSwipe('left');
      }
    });

    this.input.keyboard.on('keydown-RIGHT', () => {
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      if (this.isFrenzyMode) {
        this.handleFrenzySwipe('right');
      } else if (this.swipeEnabled) {
        this.handleSwipe('right');
      }
    });

    this.input.keyboard.on('keydown-UP', () => {
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      if (this.isFrenzyMode) {
        this.handleFrenzySwipe('up');
      }
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      if (this.isFrenzyMode) {
        this.handleFrenzySwipe('down');
      }
    });

    // Number keys 1-4 to drop tiles in columns
    this.input.keyboard.on('keydown-ONE', () => {
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      this.handleColumnTap(0);
    });
    this.input.keyboard.on('keydown-TWO', () => {
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      this.handleColumnTap(1);
    });
    this.input.keyboard.on('keydown-THREE', () => {
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      this.handleColumnTap(2);
    });
    this.input.keyboard.on('keydown-FOUR', () => {
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      this.handleColumnTap(3);
    });

    // Q, W, E, R for power-ups, T for frenzy
    this.input.keyboard.on('keydown-Q', () => {
      if (this.isAnimating || this.modalOpen) return;
      this.activatePowerUp('swipe');
    });
    this.input.keyboard.on('keydown-W', () => {
      if (this.isAnimating || this.modalOpen) return;
      this.activatePowerUp('swapper');
    });
    this.input.keyboard.on('keydown-E', () => {
      if (this.isAnimating || this.modalOpen) return;
      this.activatePowerUp('merger');
    });
    this.input.keyboard.on('keydown-R', () => {
      if (this.isAnimating || this.modalOpen) return;
      this.activatePowerUp('wildcard');
    });
    this.input.keyboard.on('keydown-T', () => {
      if (this.isAnimating || this.modalOpen) return;
      if (this.powerUpManager && this.powerUpManager.isFrenzyReady()) {
        this.activateFrenzy();
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
        soundManager.play('swap');
        // Clear selection and null out selectedTile1 BEFORE animating
        // so exitSelectionMode doesn't call setSelected(false) again and kill the tween
        const tile1Data = this.selectedTile1;
        this.selectedTile1.tile.setSelected(false);
        this.selectedTile1 = null;  // Prevent exitSelectionMode from killing tween
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
        soundManager.play('merger');
        // Clear selection and null out selectedTile1 BEFORE animating
        // so exitSelectionMode doesn't call setSelected(false) again and kill the tween
        const tile1Data = this.selectedTile1;
        this.selectedTile1.tile.setSelected(false);
        this.selectedTile1 = null;  // Prevent exitSelectionMode from killing tween
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

    // Check if either tile is a bomb BEFORE removing them
    let bombMergeResult = null;
    if (this.specialTileManager) {
      const specialTile1 = this.specialTileManager.getSpecialTileAt(col1, row1);
      const specialTile2 = this.specialTileManager.getSpecialTileAt(col2, row2);

      // Two bombs merging = immediate explosion
      if (specialTile1 && specialTile1.type === 'bomb' && specialTile2 && specialTile2.type === 'bomb') {
        bombMergeResult = this.specialTileManager.onBombBombMerge(col1, row1, col2, row2);
      } else if (specialTile1 && specialTile1.type === 'bomb') {
        // First tile is bomb - move it to merge position and check explosion
        this.specialTileManager.updateTilePosition(col1, row1, mergedCol, mergedRow);
        bombMergeResult = this.specialTileManager.onBombMerge(mergedCol, mergedRow, mergedValue);
      } else if (specialTile2 && specialTile2.type === 'bomb') {
        // Second tile is bomb - it's already at merge position
        bombMergeResult = this.specialTileManager.onBombMerge(col2, row2, mergedValue);
      }
    }

    // Remove both tiles from the map immediately
    delete this.tiles[`${col1},${row1}`];
    delete this.tiles[`${col2},${row2}`];

    // Remove non-bomb special tiles at both positions
    if (this.specialTileManager) {
      const specialTile1 = this.specialTileManager.getSpecialTileAt(col1, row1);
      if (!specialTile1 || specialTile1.type !== 'bomb') {
        this.specialTileManager.removeTileAt(col1, row1);
      }
      const specialTile2 = this.specialTileManager.getSpecialTileAt(col2, row2);
      if (!specialTile2 || specialTile2.type !== 'bomb') {
        this.specialTileManager.removeTileAt(col2, row2);
      }
      // If bomb exploded, remove it too
      if (bombMergeResult && bombMergeResult.exploded) {
        this.specialTileManager.removeTileAt(mergedCol, mergedRow);
      }
    }

    // Animate first tile moving toward second tile's position, then fade out
    tile1.updatePosition(col2, row2, true, GameConfig.ANIM.SHIFT);

    this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
      // Notify special tile manager of merge (for glass damage to adjacent tiles)
      if (this.specialTileManager) {
        const events = this.specialTileManager.onMerge(mergedCol, mergedRow);
        this.handleSpecialTileEvents(events);
      }

      // Handle bomb explosion
      if (bombMergeResult && bombMergeResult.exploded) {
        tile1.mergeAnimation();
        tile2.mergeAnimation(() => {
          this.handleBombExplosion(mergedCol, mergedRow, bombMergeResult);
        });
        return;
      }

      // Now destroy both tiles and create merged tile
      tile1.mergeAnimation();
      tile2.mergeAnimation(() => {
        let merged;
        if (bombMergeResult && !bombMergeResult.exploded) {
          // Bomb didn't explode yet - create new bomb tile with updated merge count
          merged = new Tile(this, mergedCol, mergedRow, mergedValue, this.boardLogic.nextTileId++, 'bomb', { mergesRemaining: bombMergeResult.mergesRemaining, value: mergedValue });
        } else {
          merged = new Tile(this, mergedCol, mergedRow, mergedValue, this.boardLogic.nextTileId++);
        }
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
          soundManager.play('wildcard');
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
      soundManager.play('frenzy');
      this.showFrenzyOverlay();
      this.updatePowerUpUI();
      achievementManager.recordFrenzy();
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

    // Pulsing border
    this.frenzyBorder = this.animationController.createFrenzyBorder(width, height);

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

    if (this.frenzyBorder) {
      this.frenzyBorder.destroy();
      this.frenzyBorder = null;
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
      this.syncTilesWithBoard(); // Clean up any ghost tiles
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

        // Check if the destination tile still exists and can merge
        // (it may have been broken by a previous merge in this frenzy pass)
        const destBoardValue = this.boardLogic.board[op.toCol][op.toRow];
        const destStillMergeable = destBoardValue !== null && mergeWith;

        if (!destStillMergeable) {
          // Glass was broken or tile no longer exists - convert to simple move
          const movingValue = this.boardLogic.board[op.fromCol][op.fromRow];
          this.boardLogic.board[op.fromCol][op.fromRow] = null;
          this.boardLogic.board[op.toCol][op.toRow] = movingValue;

          tile.updatePosition(op.toCol, op.toRow, true, GameConfig.ANIM.SHIFT);
          this.tiles[toKey] = tile;

          if (this.specialTileManager) {
            this.specialTileManager.updateTilePosition(op.fromCol, op.fromRow, op.toCol, op.toRow);
          }

          this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
            completed++;
            if (completed === total) onComplete();
          });
          return;
        }

        tile.updatePosition(op.toCol, op.toRow, true, GameConfig.ANIM.SHIFT);

        // Check if either tile is a bomb BEFORE removing
        let bombMergeResult = null;
        if (this.specialTileManager) {
          const specialTileFrom = this.specialTileManager.getSpecialTileAt(op.fromCol, op.fromRow);
          const specialTileTo = this.specialTileManager.getSpecialTileAt(op.toCol, op.toRow);
          // Two bombs merging = immediate explosion
          if (specialTileFrom && specialTileFrom.type === 'bomb' && specialTileTo && specialTileTo.type === 'bomb') {
            bombMergeResult = this.specialTileManager.onBombBombMerge(op.fromCol, op.fromRow, op.toCol, op.toRow);
          } else if (specialTileTo && specialTileTo.type === 'bomb') {
            bombMergeResult = this.specialTileManager.onBombMerge(op.toCol, op.toRow, op.value);
          } else if (specialTileFrom && specialTileFrom.type === 'bomb') {
            this.specialTileManager.updateTilePosition(op.fromCol, op.fromRow, op.toCol, op.toRow);
            bombMergeResult = this.specialTileManager.onBombMerge(op.toCol, op.toRow, op.value);
          }
        }

        // Remove non-bomb special tiles at both positions
        if (this.specialTileManager) {
          const specialTileFrom = this.specialTileManager.getSpecialTileAt(op.fromCol, op.fromRow);
          if (!specialTileFrom || specialTileFrom.type !== 'bomb') {
            this.specialTileManager.removeTileAt(op.fromCol, op.fromRow);
          }
          if (!bombMergeResult || bombMergeResult.exploded) {
            this.specialTileManager.removeTileAt(op.toCol, op.toRow);
          }
        }

        this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
          if (mergeWith) { delete this.tiles[toKey]; mergeWith.mergeAnimation(); }

          // Notify special tile manager of merge (for glass damage to adjacent tiles)
          if (this.specialTileManager) {
            const events = this.specialTileManager.onMerge(op.toCol, op.toRow);
            this.handleSpecialTileEvents(events);
          }

          // Handle bomb explosion
          if (bombMergeResult && bombMergeResult.exploded) {
            tile.mergeAnimation(() => {
              this.handleBombExplosion(op.toCol, op.toRow, bombMergeResult);
              completed++;
              if (completed === total) onComplete();
            });
            return;
          }

          tile.mergeAnimation(() => {
            let merged;
            if (bombMergeResult && !bombMergeResult.exploded) {
              merged = new Tile(this, op.toCol, op.toRow, op.value, this.boardLogic.nextTileId++, 'bomb', { mergesRemaining: bombMergeResult.mergesRemaining, value: op.value });
            } else {
              merged = new Tile(this, op.toCol, op.toRow, op.value, this.boardLogic.nextTileId++);
            }
            merged.updatePosition(op.toCol, op.toRow, false);
            merged.setScale(0.5).setAlpha(0.5);
            this.boardLogic.addScore(op.value);
            tileCollectionManager.recordTile(op.value);
            achievementManager.recordTile(op.value);
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
    const size = 48;
    const halfSize = size / 2;
    const radius = 6;

    let color, displayText, textColor;

    if (this.nextTileType === 'wildcard') {
      color = GameConfig.COLORS.WILDCARD;
      displayText = '★';
      textColor = '#ffffff';
    } else {
      color = getTileColor(this.nextTileValue);
      displayText = this.nextTileValue.toString();
      textColor = getTileTextColor(this.nextTileValue);
    }

    const bg = this.add.graphics();

    // Clean flat fill
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-halfSize, -halfSize, size, size, radius);

    const text = this.add.text(0, 0, displayText, {
      fontSize: '20px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '800',
      color: textColor
    }).setOrigin(0.5);

    this.nextTilePreview.add([bg, text]);
  }

  handleColumnTap(col) {
    if (this.isAnimating || this.selectionMode || this.isFrenzyMode) return;

    // Check move limit for levels
    if (this.levelConfig && this.boardLogic.getMovesUsed() >= this.levelConfig.maxMoves) {
      return;
    }

    const result = this.boardLogic.dropTile(col, this.nextTileValue);
    if (!result.success) return;

    this.isAnimating = true;

    const tileType = this.nextTileType;

    // Reset cascade merge counter for combo tracking
    this.cascadeMergeCount = 0;

    if (result.merged) {
      // For merges: create tile but DON'T add to tiles dict yet
      // handleMerge will handle both the existing tile and create the merged result
      const tile = new Tile(this, col, result.row, this.nextTileValue, result.tileId, tileType);
      tile.dropFromTop(result.finalRow, GameConfig.ANIM.DROP);
      soundManager.play('drop');
      this.time.delayedCall(GameConfig.ANIM.DROP, () => {
        this.handleMerge(col, result.finalRow, result.finalValue, tile);
      });
    } else {
      // For non-merges: tile lands at finalRow, track it there
      const tile = new Tile(this, col, result.finalRow, this.nextTileValue, result.tileId, tileType);
      this.tiles[`${col},${result.finalRow}`] = tile;
      tile.dropFromTop(result.finalRow, GameConfig.ANIM.DROP);
      soundManager.play('drop');
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

    // Check if either tile is a bomb BEFORE removing
    let bombMergeResult = null;
    if (this.specialTileManager) {
      const specialTile = this.specialTileManager.getSpecialTileAt(col, row);
      if (specialTile && specialTile.type === 'bomb') {
        // Bomb is involved in the merge
        bombMergeResult = this.specialTileManager.onBombMerge(col, row, newValue);
      }
    }

    if (existing) {
      delete this.tiles[key];
      existing.mergeAnimation();
    }

    // Only remove non-bomb special tiles - bombs are handled specially by onBombMerge/detonateBomb
    if (this.specialTileManager && !bombMergeResult) {
      this.specialTileManager.removeTileAt(col, row);
    }
    // Note: When bomb explodes, detonateBomb already removes it from bombTiles array

    // Notify special tile manager of merge (for glass damage to adjacent tiles)
    if (this.specialTileManager) {
      const events = this.specialTileManager.onMerge(col, row);
      this.handleSpecialTileEvents(events);
    }

    // Handle bomb explosion
    if (bombMergeResult && bombMergeResult.exploded) {
      droppingTile.mergeAnimation(() => {
        // Trigger explosion animation
        this.handleBombExplosion(col, row, bombMergeResult);
      });
      return;
    }

    droppingTile.mergeAnimation(() => {
      // Create bomb tile if bomb didn't explode, otherwise normal tile
      let merged;
      if (bombMergeResult && !bombMergeResult.exploded) {
        merged = new Tile(this, col, row, newValue, this.boardLogic.nextTileId++, 'bomb', { mergesRemaining: bombMergeResult.mergesRemaining, value: newValue });
      } else {
        merged = new Tile(this, col, row, newValue, this.boardLogic.nextTileId++);
      }
      merged.updatePosition(col, row, false);
      merged.setScale(0.3).setAlpha(0.5);

      soundManager.play('merge', newValue);

      // Merge particles
      const layout = GameConfig.getLayout(this.cameras.main.width, this.cameras.main.height);
      const px = layout.offsetX + col * layout.tileSize + layout.tileSize / 2;
      const py = layout.offsetY + row * layout.tileSize + layout.tileSize / 2;
      this.animationController.animateMergeParticles(px, py, getTileColor(newValue), GameConfig.JUICE.MERGE_PARTICLE_COUNT);

      // Screen shake for high-value merges
      if (newValue >= GameConfig.JUICE.SHAKE_MIN_VALUE) {
        const intensity = Math.min(newValue / 96, 1.5);
        this.cameras.main.shake(150, 0.005 * intensity);
      }

      this.boardLogic.addScore(newValue);
      this.powerUpManager.addMergePoint();
      tileCollectionManager.recordTile(newValue);
      achievementManager.recordTile(newValue);
      this.updateUI();

      this.tweens.add({
        targets: merged, scaleX: 1, scaleY: 1, alpha: 1,
        duration: GameConfig.ANIM.DROP, ease: 'Back.easeOut',
        onComplete: () => {
          this.tiles[key] = merged;
          // Secondary pulse for high-value tiles
          if (newValue >= GameConfig.JUICE.SHAKE_MIN_VALUE) {
            this.tweens.add({
              targets: merged, scaleX: 1.08, scaleY: 1.08,
              duration: 120, yoyo: true, ease: 'Sine.easeInOut'
            });
          }
          this.updatePowerUpUI();
          // Call onDropComplete to update special tiles (steel countdown, etc.)
          this.onDropComplete();
        }
      });
    });
  }

  onDropComplete() {
    // Update special tiles
    let hasSwapEvents = false;
    if (this.specialTileManager) {
      const events = this.specialTileManager.updateSpecialTiles();
      hasSwapEvents = this.handleSpecialTileEvents(events);

      // Spawn special tiles based on mode and level config
      // Only ONE special tile can spawn per drop
      if (this.gameMode === 'crazy' || this.gameMode === 'endless') {
        // Crazy and Points Max mode: random spawns (only one per drop)
        // Build weighted spawn table based on mode
        const spawnOptions = [
          { type: 'steel', chance: GameConfig.SPECIAL_TILES.STEEL_SPAWN_CHANCE },
          { type: 'glass', chance: 0.03 },
          { type: 'lead', chance: 0.02 },
          { type: 'auto_swapper', chance: GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SPAWN_CHANCE }
        ];
        // Add bomb only in endless mode
        if (this.gameMode === 'endless') {
          spawnOptions.push({ type: 'bomb', chance: GameConfig.SPECIAL_TILES.BOMB_SPAWN_CHANCE });
        }

        // Check each spawn type in order, stop after first successful spawn
        const roll = Math.random();
        let cumulativeChance = 0;
        for (const option of spawnOptions) {
          cumulativeChance += option.chance;
          if (roll < cumulativeChance) {
            // This type should spawn
            this.trySpawnSpecialTile(option.type);
            break;
          }
        }
      } else if (this.gameMode === 'level' && this.levelConfig) {
        // Level mode: use level-specific spawn rates for objectives (only one per drop)
        // Check both direct level config and modifier config for spawn rates
        const glassSpawnRate = this.levelConfig.modifier?.glassSpawnRate || this.levelConfig.glassSpawnRate || 0;
        const leadSpawnRate = this.levelConfig.modifier?.leadSpawnRate || this.levelConfig.leadSpawnRate || 0;

        const roll = Math.random();
        if (roll < glassSpawnRate) {
          const emptyCell = this.specialTileManager.findRandomEmptyCell();
          if (emptyCell) {
            const allowedValues = this.levelConfig.allowedTiles.filter(v => v >= 3);
            const glassValue = allowedValues.length > 0
              ? allowedValues[Math.floor(Math.random() * allowedValues.length)]
              : 3;
            const glassTile = this.specialTileManager.spawnGlassTile(emptyCell.col, emptyCell.row, glassValue);
            this.createSpecialTile(emptyCell.col, emptyCell.row, 'glass', { durability: glassTile.durability, value: glassValue });
          }
        } else if (roll < glassSpawnRate + leadSpawnRate) {
          const emptyCell = this.specialTileManager.findRandomEmptyCell();
          if (emptyCell) {
            const leadTile = this.specialTileManager.spawnLeadTile(emptyCell.col, emptyCell.row);
            this.createSpecialTile(emptyCell.col, emptyCell.row, 'lead', { countdown: leadTile.countdown });
          }
        }
      } else if (this.gameMode === 'daily' && this.specialTileManager) {
        // Daily challenge mode: apply modifier-based special tile spawning
        const modifier = this.dailyChallenge?.modifier;

        if (modifier?.id === 'glass_chaos') {
          const glassSpawnRate = 0.35; // 35% chance per drop
          if (Math.random() < glassSpawnRate) {
            const emptyCell = this.specialTileManager.findRandomEmptyCell();
            if (emptyCell) {
              const glassValues = [3, 6, 12];
              const glassValue = glassValues[Math.floor(Math.random() * glassValues.length)];
              const glassTile = this.specialTileManager.spawnGlassTile(emptyCell.col, emptyCell.row, glassValue);
              this.createSpecialTile(emptyCell.col, emptyCell.row, 'glass', { durability: glassTile.durability, value: glassValue });
            }
          }
        }
      }
    }

    // If there were swap events, delay gravity to let swap animation complete first
    if (hasSwapEvents) {
      this.time.delayedCall(GameConfig.ANIM.SHIFT + 50, () => {
        this.applyGravityAfterDrop();
      });
    } else {
      this.applyGravityAfterDrop();
    }
  }

  /**
   * Handle special tile events and return if any swaps occurred
   * @returns {boolean} True if auto-swap events occurred (need to delay gravity)
   */
  handleSpecialTileEvents(events) {
    let hasSwapEvents = false;

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
          achievementManager.recordLeadCleared();
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
          achievementManager.recordGlassBroken();
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
        case 'auto_swap':
          // Handle auto-swapper swapping with another tile
          this.handleAutoSwap(event);
          hasSwapEvents = true;
          break;
        case 'swapper_expired':
          // Auto-swapper became a normal tile
          if (tile) {
            delete this.tiles[key];
            // Create a new normal tile with the value
            const normalTile = new Tile(this, event.col, event.row, event.value, this.boardLogic.nextTileId++);
            this.tiles[key] = normalTile;
          }
          break;
        case 'swapper_tick':
          if (tile) {
            tile.updateSpecialData({ swapsRemaining: event.swapsRemaining });
          }
          break;
      }
    });

    return hasSwapEvents;
  }

  /**
   * Handle auto-swapper swap animation
   */
  handleAutoSwap(event) {
    const fromKey = `${event.fromCol},${event.fromRow}`;
    const toKey = `${event.toCol},${event.toRow}`;
    const fromTile = this.tiles[fromKey];
    const toTile = this.tiles[toKey];

    // Remove both tiles from the dictionary first to avoid overwrites
    delete this.tiles[fromKey];
    delete this.tiles[toKey];

    // Swap the visual tiles
    if (fromTile) {
      fromTile.updatePosition(event.toCol, event.toRow, true);
      this.tiles[toKey] = fromTile;
      // Update the swaps remaining display
      if (fromTile.tileType === 'auto_swapper') {
        fromTile.updateSpecialData({ swapsRemaining: event.swapsRemaining });
      }
    }
    if (toTile) {
      toTile.updatePosition(event.fromCol, event.fromRow, true);
      this.tiles[fromKey] = toTile;
    } else {
      // If there was no tile at the target position, check if the board has a value there now
      // (can happen when swapper swaps with an empty cell that has a normal tile value)
      const boardValue = this.boardLogic.board[event.fromCol][event.fromRow];
      if (boardValue !== null && typeof boardValue === 'number') {
        // Create a new tile for the value that moved to the swapper's old position
        const newTile = new Tile(this, event.fromCol, event.fromRow, boardValue, this.boardLogic.nextTileId++);
        this.tiles[fromKey] = newTile;
      }
    }
  }

  /**
   * Start bomb warning animation before explosion
   * Shows yellow flashing on the bomb tile, waits for tiles to settle, then explodes
   */
  handleBombExplosion(col, row, explosionData) {
    const bombKey = `${col},${row}`;
    const bombTile = this.tiles[bombKey];

    if (bombTile) {
      // Flash yellow twice to warn player
      const flashDuration = 150;
      const flashCount = 2;

      // Create yellow overlay for flashing
      const layout = GameConfig.getLayout(this.cameras.main.width, this.cameras.main.height);
      const x = layout.offsetX + col * layout.tileSize + layout.tileSize / 2;
      const y = layout.offsetY + row * layout.tileSize + layout.tileSize / 2;
      const size = layout.tileSize - 8;

      const warningFlash = this.add.graphics();
      warningFlash.fillStyle(0xffff00, 0.8);
      warningFlash.fillRoundedRect(x - size/2, y - size/2, size, size, 8);
      warningFlash.setAlpha(0);

      // Flash animation sequence
      this.tweens.add({
        targets: warningFlash,
        alpha: { from: 0, to: 1 },
        duration: flashDuration,
        yoyo: true,
        repeat: flashCount - 1,
        ease: 'Power2',
        onComplete: () => {
          warningFlash.destroy();
          // Wait a moment for tiles to settle, then explode
          this.time.delayedCall(200, () => {
            this.executeBombExplosion(col, row, explosionData);
          });
        }
      });
    } else {
      // No tile to flash (already removed), just explode
      this.executeBombExplosion(col, row, explosionData);
    }
  }

  /**
   * Execute the actual bomb explosion after warning animation
   */
  executeBombExplosion(col, row, explosionData) {
    const { affectedTiles, totalPoints } = explosionData;
    soundManager.play('explosion');

    // Track bomb explosion for achievements
    achievementManager.recordBombExploded();

    // Extract chain reaction bombs from affected tiles
    const chainReactions = affectedTiles ? affectedTiles.filter(t => t.chainReaction) : [];

    // Remove the bomb tile itself (center of explosion)
    const bombKey = `${col},${row}`;
    const bombTile = this.tiles[bombKey];
    if (bombTile) {
      delete this.tiles[bombKey];
      bombTile.fadeOutAnimation();
    }

    // Add explosion visual at bomb location
    const layout = GameConfig.getLayout(this.cameras.main.width, this.cameras.main.height);
    const x = layout.offsetX + col * layout.tileSize + layout.tileSize / 2;
    const y = layout.offsetY + row * layout.tileSize + layout.tileSize / 2;

    // Explosion effect - expanding ring that covers 3x3 area
    const blastRadius = layout.tileSize * 1.5; // Covers 3x3 tiles

    // Inner bright flash
    const flash = this.add.circle(x, y, 5, 0xffff00, 1);
    this.tweens.add({
      targets: flash,
      scaleX: 8,
      scaleY: 8,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });

    // Expanding ring (outline)
    const ring = this.add.graphics();
    ring.lineStyle(4, 0xff4444, 1);
    ring.strokeCircle(x, y, 10);
    this.tweens.add({
      targets: ring,
      scaleX: blastRadius / 10,
      scaleY: blastRadius / 10,
      alpha: 0,
      duration: 350,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    });

    // Outer glow
    const glow = this.add.circle(x, y, 15, 0xff6600, 0.6);
    this.tweens.add({
      targets: glow,
      scaleX: blastRadius / 15,
      scaleY: blastRadius / 15,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => glow.destroy()
    });

    // Screen shake
    this.cameras.main.shake(200, 0.01);

    // Remove affected tiles (except chain reaction bombs which will be handled separately)
    if (affectedTiles) {
      affectedTiles.forEach(affected => {
        if (affected.chainReaction) return; // Don't remove chain reaction bombs yet
        const key = `${affected.col},${affected.row}`;
        const tile = this.tiles[key];
        if (tile) {
          delete this.tiles[key];
          tile.fadeOutAnimation();
        }
      });
    }

    // Award points
    if (totalPoints > 0) {
      this.boardLogic.addScore(totalPoints);
      this.updateUI();
    }

    // Handle chain reactions (other bombs that were hit)
    if (chainReactions.length > 0) {
      this.time.delayedCall(200, () => {
        chainReactions.forEach(chainBomb => {
          const chainResult = this.specialTileManager.detonateBomb(chainBomb.col, chainBomb.row);
          if (chainResult) {
            this.handleBombExplosion(chainBomb.col, chainBomb.row, chainResult);
          }
        });
      });
    }

    // Apply gravity after explosion, then spawn new tiles
    this.time.delayedCall(chainReactions && chainReactions.length > 0 ? 500 : 200, () => {
      this.applyGravityWithCallback(() => {
        // Only spawn new tiles and update special tiles AFTER gravity completes
        this.onDropComplete();
      });
    });
  }

  /**
   * Apply gravity with a callback when complete (used after bomb explosions)
   */
  applyGravityWithCallback(callback) {
    if (this.isFrenzyMode) {
      this.isAnimating = false;
      this.checkEndConditions();
      if (callback) callback();
      return;
    }

    const ops = this.boardLogic.applyGravity();
    if (ops.length > 0) {
      this.animateGravity(ops, () => {
        this.updatePowerUpUI();
        this.syncTilesWithBoard(); // Clean up any ghost tiles
        this.isAnimating = false;
        this.checkEndConditions();
        if (callback) callback();
      });
    } else {
      this.syncTilesWithBoard(); // Clean up any ghost tiles
      this.isAnimating = false;
      this.checkEndConditions();
      if (callback) callback();
    }
  }

  /**
   * Sync visual tiles with board state - removes ghost tiles and fixes scale
   * Called after explosions and gravity to ensure consistency
   */
  syncTilesWithBoard() {
    const keysToRemove = [];

    // Find tiles that exist visually but not in board logic
    for (const key of Object.keys(this.tiles)) {
      const [col, row] = key.split(',').map(Number);
      const boardValue = this.boardLogic.board[col]?.[row];

      if (boardValue === null || boardValue === undefined) {
        keysToRemove.push(key);
      } else {
        // Ensure tile has correct scale (fix interrupted animations)
        const tile = this.tiles[key];
        if (tile && (tile.scaleX !== 1 || tile.scaleY !== 1)) {
          tile.setScale(1);
        }
      }
    }

    // Remove ghost tiles
    for (const key of keysToRemove) {
      const tile = this.tiles[key];
      if (tile) {
        delete this.tiles[key];
        tile.fadeOutAnimation();
      }
    }
  }

  /**
   * Try to spawn a specific type of special tile
   * @param {string} type - 'steel', 'glass', 'lead', 'auto_swapper', or 'bomb'
   * @returns {boolean} True if spawn was successful
   */
  trySpawnSpecialTile(type) {
    switch (type) {
      case 'steel': {
        const plate = this.specialTileManager.spawnSteelPlate();
        if (plate) {
          this.createSpecialTile(plate.col, plate.row, 'steel', { turnsRemaining: plate.turnsRemaining });
          return true;
        }
        return false;
      }
      case 'glass': {
        const emptyCell = this.specialTileManager.findRandomEmptyCell();
        if (emptyCell) {
          const glassValue = [3, 6, 12][Math.floor(Math.random() * 3)];
          const glassTile = this.specialTileManager.spawnGlassTile(emptyCell.col, emptyCell.row, glassValue);
          this.createSpecialTile(emptyCell.col, emptyCell.row, 'glass', { durability: glassTile.durability, value: glassValue });
          return true;
        }
        return false;
      }
      case 'lead': {
        const emptyCell = this.specialTileManager.findRandomEmptyCell();
        if (emptyCell) {
          const leadTile = this.specialTileManager.spawnLeadTile(emptyCell.col, emptyCell.row);
          this.createSpecialTile(emptyCell.col, emptyCell.row, 'lead', { countdown: leadTile.countdown });
          return true;
        }
        return false;
      }
      case 'auto_swapper': {
        const emptyCell = this.specialTileManager.findRandomEmptyCell();
        if (emptyCell) {
          const swapperValue = [3, 6, 12][Math.floor(Math.random() * 3)];
          const swapperTile = this.specialTileManager.spawnAutoSwapper(emptyCell.col, emptyCell.row, swapperValue);
          this.createSpecialTile(emptyCell.col, emptyCell.row, 'auto_swapper', {
            swapsRemaining: swapperTile.swapsRemaining,
            nextSwapIn: swapperTile.nextSwapIn,
            value: swapperValue
          });
          return true;
        }
        return false;
      }
      case 'bomb': {
        const emptyCell = this.specialTileManager.findRandomEmptyCell();
        if (emptyCell) {
          const bombValue = [3, 6, 12][Math.floor(Math.random() * 3)];
          const bombTile = this.specialTileManager.spawnBomb(emptyCell.col, emptyCell.row, bombValue);
          this.createSpecialTile(emptyCell.col, emptyCell.row, 'bomb', {
            mergesRemaining: bombTile.mergesRemaining,
            value: bombValue
          });
          return true;
        }
        return false;
      }
      default:
        return false;
    }
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
        this.syncTilesWithBoard(); // Clean up any ghost tiles
        this.isAnimating = false;
        this.checkEndConditions();
      });
    } else {
      this.syncTilesWithBoard(); // Clean up any ghost tiles
      this.isAnimating = false;
      this.checkEndConditions();
    }
  }

  handleSwipe(direction) {
    if (this.isAnimating || !this.swipeEnabled) return;
    this.isAnimating = true;
    this.cascadeMergeCount = 0;

    const ops = this.boardLogic.shiftBoard(direction);
    if (ops.length === 0) {
      this.isAnimating = false;
      return;
    }

    soundManager.play('swipe');

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

        // Check if the destination tile still exists and can merge
        // (it may have been broken by a previous merge in this shift pass)
        const destBoardValue = this.boardLogic.board[op.toCol][op.row];
        const destStillMergeable = destBoardValue !== null && mergeWith;

        if (!destStillMergeable) {
          // Glass was broken or tile no longer exists - convert to simple move
          const movingValue = this.boardLogic.board[op.fromCol][op.row];
          this.boardLogic.board[op.fromCol][op.row] = null;
          this.boardLogic.board[op.toCol][op.row] = movingValue;

          tile.updatePosition(op.toCol, op.row, true, GameConfig.ANIM.SHIFT);
          this.tiles[toKey] = tile;

          if (this.specialTileManager) {
            this.specialTileManager.updateTilePosition(op.fromCol, op.row, op.toCol, op.row);
          }

          this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
            completed++;
            if (completed === total) onComplete();
          });
          return;
        }

        tile.updatePosition(op.toCol, op.row, true, GameConfig.ANIM.SHIFT);

        // Check if either tile is a bomb BEFORE removing
        let bombMergeResult = null;
        if (this.specialTileManager) {
          const specialTileFrom = this.specialTileManager.getSpecialTileAt(op.fromCol, op.row);
          const specialTileTo = this.specialTileManager.getSpecialTileAt(op.toCol, op.row);
          // Two bombs merging = immediate explosion
          if (specialTileFrom && specialTileFrom.type === 'bomb' && specialTileTo && specialTileTo.type === 'bomb') {
            bombMergeResult = this.specialTileManager.onBombBombMerge(op.fromCol, op.row, op.toCol, op.row);
          } else if (specialTileTo && specialTileTo.type === 'bomb') {
            bombMergeResult = this.specialTileManager.onBombMerge(op.toCol, op.row, op.value);
          } else if (specialTileFrom && specialTileFrom.type === 'bomb') {
            // Moving bomb merges with target - update bomb position first
            this.specialTileManager.updateTilePosition(op.fromCol, op.row, op.toCol, op.row);
            bombMergeResult = this.specialTileManager.onBombMerge(op.toCol, op.row, op.value);
          }
        }

        // Remove non-bomb special tiles at both positions
        if (this.specialTileManager) {
          const specialTileFrom = this.specialTileManager.getSpecialTileAt(op.fromCol, op.row);
          if (!specialTileFrom || specialTileFrom.type !== 'bomb') {
            this.specialTileManager.removeTileAt(op.fromCol, op.row);
          }
          if (!bombMergeResult || bombMergeResult.exploded) {
            this.specialTileManager.removeTileAt(op.toCol, op.row);
          }
        }

        this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
          if (mergeWith) { delete this.tiles[toKey]; mergeWith.mergeAnimation(); }

          // Notify special tile manager of merge (for glass damage to adjacent tiles)
          if (this.specialTileManager) {
            const events = this.specialTileManager.onMerge(op.toCol, op.row);
            this.handleSpecialTileEvents(events);
          }

          // Handle bomb explosion
          if (bombMergeResult && bombMergeResult.exploded) {
            tile.mergeAnimation(() => {
              this.handleBombExplosion(op.toCol, op.row, bombMergeResult);
              completed++;
              if (completed === total) onComplete();
            });
            return;
          }

          tile.mergeAnimation(() => {
            let merged;
            if (bombMergeResult && !bombMergeResult.exploded) {
              merged = new Tile(this, op.toCol, op.row, op.value, this.boardLogic.nextTileId++, 'bomb', { mergesRemaining: bombMergeResult.mergesRemaining, value: op.value });
            } else {
              merged = new Tile(this, op.toCol, op.row, op.value, this.boardLogic.nextTileId++);
            }
            merged.updatePosition(op.toCol, op.row, false);
            merged.setScale(0.5).setAlpha(0.5);
            this.boardLogic.addScore(op.value);
            this.powerUpManager.addMergePoint();
            tileCollectionManager.recordTile(op.value);
            achievementManager.recordTile(op.value);
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

    // When all columns complete, check for chain reactions
    const onAllColumnsComplete = () => {
      // Check if there are more gravity operations (chain reactions from merges)
      const moreOps = this.boardLogic.applyGravity();
      if (moreOps.length > 0) {
        this.animateGravity(moreOps, onComplete);
      } else {
        onComplete();
      }
    };

    cols.forEach(col => {
      const colOps = groups[col];
      let idx = 0;

      const processNext = () => {
        if (idx >= colOps.length) { completedCols++; if (completedCols === cols.length) onAllColumnsComplete(); return; }

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

          // Check if the destination tile still exists and can merge
          // (it may have been broken by a previous merge in this gravity pass)
          const destBoardValue = this.boardLogic.board[op.col][op.toRow];
          const destStillMergeable = destBoardValue !== null && mergeWith;

          if (!destStillMergeable) {
            // Glass was broken or tile no longer exists - convert to simple fall
            // Update the board state: the falling tile just lands at toRow
            const fallingValue = this.boardLogic.board[op.col][op.fromRow];
            this.boardLogic.board[op.col][op.fromRow] = null;
            this.boardLogic.board[op.col][op.toRow] = fallingValue;

            tile.updatePosition(op.col, op.toRow, true, GameConfig.ANIM.FALL);
            this.tiles[toKey] = tile;

            // Update special tile position tracking if it's a special tile
            if (this.specialTileManager) {
              this.specialTileManager.updateTilePosition(op.col, op.fromRow, op.col, op.toRow);
            }

            this.time.delayedCall(GameConfig.ANIM.FALL, processNext);
            return;
          }

          tile.updatePosition(op.col, op.toRow, true, GameConfig.ANIM.FALL);

          // Check if either tile is a bomb BEFORE removing
          let bombMergeResult = null;
          if (this.specialTileManager) {
            const specialTileFrom = this.specialTileManager.getSpecialTileAt(op.col, op.fromRow);
            const specialTileTo = this.specialTileManager.getSpecialTileAt(op.col, op.toRow);
            // Two bombs merging = immediate explosion
            if (specialTileFrom && specialTileFrom.type === 'bomb' && specialTileTo && specialTileTo.type === 'bomb') {
              bombMergeResult = this.specialTileManager.onBombBombMerge(op.col, op.fromRow, op.col, op.toRow);
            } else if (specialTileTo && specialTileTo.type === 'bomb') {
              bombMergeResult = this.specialTileManager.onBombMerge(op.col, op.toRow, op.value);
            } else if (specialTileFrom && specialTileFrom.type === 'bomb') {
              // Falling bomb merges with target - update bomb position first
              this.specialTileManager.updateTilePosition(op.col, op.fromRow, op.col, op.toRow);
              bombMergeResult = this.specialTileManager.onBombMerge(op.col, op.toRow, op.value);
            }
          }

          // Remove non-bomb special tiles at both positions
          if (this.specialTileManager) {
            const specialTileFrom = this.specialTileManager.getSpecialTileAt(op.col, op.fromRow);
            if (!specialTileFrom || specialTileFrom.type !== 'bomb') {
              this.specialTileManager.removeTileAt(op.col, op.fromRow);
            }
            if (!bombMergeResult || bombMergeResult.exploded) {
              this.specialTileManager.removeTileAt(op.col, op.toRow);
            }
          }

          this.time.delayedCall(GameConfig.ANIM.FALL, () => {
            if (mergeWith) { delete this.tiles[toKey]; mergeWith.mergeAnimation(); }

            // Notify special tile manager of merge (for glass damage to adjacent tiles)
            if (this.specialTileManager) {
              const events = this.specialTileManager.onMerge(op.col, op.toRow);
              this.handleSpecialTileEvents(events);
            }

            // Handle bomb explosion
            if (bombMergeResult && bombMergeResult.exploded) {
              tile.mergeAnimation(() => {
                this.handleBombExplosion(op.col, op.toRow, bombMergeResult);
                processNext();
              });
              return;
            }

            tile.mergeAnimation(() => {
              let merged;
              if (bombMergeResult && !bombMergeResult.exploded) {
                merged = new Tile(this, op.col, op.toRow, op.value, this.boardLogic.nextTileId++, 'bomb', { mergesRemaining: bombMergeResult.mergesRemaining, value: op.value });
              } else {
                merged = new Tile(this, op.col, op.toRow, op.value, this.boardLogic.nextTileId++);
              }
              merged.updatePosition(op.col, op.toRow, false);
              merged.setScale(0.3).setAlpha(0.5);

              soundManager.play('merge', op.value);

              // Cascade merge tracking for combos
              if (typeof this.cascadeMergeCount === 'number') {
                this.cascadeMergeCount++;
                if (this.cascadeMergeCount >= GameConfig.JUICE.COMBO_MIN_COUNT) {
                  const comboLayout = GameConfig.getLayout(this.cameras.main.width, this.cameras.main.height);
                  const cx = comboLayout.offsetX + op.col * comboLayout.tileSize + comboLayout.tileSize / 2;
                  const cy = comboLayout.offsetY + op.toRow * comboLayout.tileSize - 10;
                  this.animationController.showFloatingText(cx, cy, `${this.cascadeMergeCount}x COMBO!`, '#ffdd44');
                  soundManager.play('combo', this.cascadeMergeCount);
                }
              }

              // Merge particles
              const gLayout = GameConfig.getLayout(this.cameras.main.width, this.cameras.main.height);
              const gpx = gLayout.offsetX + op.col * gLayout.tileSize + gLayout.tileSize / 2;
              const gpy = gLayout.offsetY + op.toRow * gLayout.tileSize + gLayout.tileSize / 2;
              this.animationController.animateMergeParticles(gpx, gpy, getTileColor(op.value), GameConfig.JUICE.MERGE_PARTICLE_COUNT);

              // Screen shake for high-value merges
              if (op.value >= GameConfig.JUICE.SHAKE_MIN_VALUE) {
                const intensity = Math.min(op.value / 96, 1.5);
                this.cameras.main.shake(150, 0.005 * intensity);
              }

              this.boardLogic.addScore(op.value);
              this.powerUpManager.addMergePoint();
              tileCollectionManager.recordTile(op.value);
              achievementManager.recordTile(op.value);
              this.updateUI();

              this.tweens.add({
                targets: merged, scaleX: 1, scaleY: 1, alpha: 1,
                duration: GameConfig.ANIM.FALL, ease: 'Back.easeOut',
                onComplete: () => {
                  this.tiles[toKey] = merged;
                  // Secondary pulse for high-value tiles
                  if (op.value >= GameConfig.JUICE.SHAKE_MIN_VALUE) {
                    this.tweens.add({
                      targets: merged, scaleX: 1.08, scaleY: 1.08,
                      duration: 120, yoyo: true, ease: 'Sine.easeInOut'
                    });
                  }
                  processNext();
                }
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
    this.syncTilesWithBoard(); // Clean up any ghost tiles
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
    if (this.frenzyBarFill && this.frenzyBarText) {
      // Cap ratio at 1 to prevent bar overflow
      const ratio = Math.min(state.frenzyMeter / state.frenzyThreshold, 1);
      this.frenzyBarFill.clear();
      if (ratio > 0) {
        this.frenzyBarFill.fillStyle(GameConfig.UI.FRENZY, 1);
        this.frenzyBarFill.fillRoundedRect(this.frenzyBarX, this.frenzyBarY, this.frenzyBarWidth * ratio, 16, 4);
      }
      // Display actual meter value but capped display at threshold
      const displayMeter = Math.min(state.frenzyMeter, state.frenzyThreshold);
      this.frenzyBarText.setText(`${displayMeter}/${state.frenzyThreshold}`);

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
    } else if (this.gameMode === 'daily' && this.dailyChallenge) {
      // Check daily challenge conditions
      if (this.checkDailyChallengeComplete()) {
        this.showDailyChallengeComplete();
        return;
      }

      // Check fail conditions
      if (this.checkDailyChallengeFailed()) {
        this.showDailyChallengeFailed();
        return;
      }
    } else {
      if (this.boardLogic.isBoardFull()) {
        this.showGameOver();
        return;
      }
    }

    // Auto-save for modes that support it (after each move)
    if (this.gameMode === 'original' || this.gameMode === 'crazy' || this.gameMode === 'endless') {
      gameStateManager.saveGameState(this);
    }
  }

  checkDailyChallengeComplete() {
    if (!this.dailyChallenge || this.dailyChallengeCompleted) return false;

    const state = this.boardLogic.getGameState();
    const challenge = this.dailyChallenge;

    switch (challenge.type) {
      case 'score_target':
      case 'no_power_ups':
        return state.score >= challenge.target;

      case 'tile_target':
        return state.highestTile >= challenge.target;

      case 'limited_moves':
        // Limited moves: game ends when moves run out, success is based on score
        return false; // Check is handled in fail condition

      case 'survival':
        return state.movesUsed >= challenge.survivalMoves;

      default:
        return false;
    }
  }

  checkDailyChallengeFailed() {
    if (!this.dailyChallenge) return false;

    const challenge = this.dailyChallenge;
    const state = this.boardLogic.getGameState();

    // Board full = fail for most challenges
    if (this.boardLogic.isBoardFull()) {
      return true;
    }

    // Limited moves: out of moves
    if (challenge.type === 'limited_moves' && state.movesUsed >= challenge.moveLimit) {
      return true;
    }

    return false;
  }

  showDailyChallengeComplete() {
    this.dailyChallengeCompleted = true;
    const { width, height } = this.cameras.main;
    const finalScore = this.boardLogic.getScore();

    // Mark challenge complete and get rewards
    const result = dailyChallengeManager.completeChallenge(finalScore);

    // Track achievements
    achievementManager.recordScore(finalScore);
    achievementManager.recordGamePlayed('daily');

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1000);

    this.add.text(width / 2, height / 2 - 100, 'CHALLENGE COMPLETE!', {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#22c55e'
    }).setOrigin(0.5).setDepth(1001);

    this.add.text(width / 2, height / 2 - 50, `Score: ${finalScore}`, {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#ffffff'
    }).setOrigin(0.5).setDepth(1001);

    if (result) {
      this.add.text(width / 2, height / 2 - 10, `+${result.points} points`, {
        fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#a78bfa'
      }).setOrigin(0.5).setDepth(1001);

      if (result.streak > 1) {
        this.add.text(width / 2, height / 2 + 20, `${result.streak} day streak!`, {
          fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#fbbf24'
        }).setOrigin(0.5).setDepth(1001);
      }
    }

    const menuBtn = this.add.text(width / 2, height / 2 + 70, 'BACK TO MENU', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    this.tweens.add({ targets: menuBtn, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });
  }

  showDailyChallengeFailed() {
    const { width, height } = this.cameras.main;
    const finalScore = this.boardLogic.getScore();
    const challenge = this.dailyChallenge;

    // Track achievements even on failure
    achievementManager.recordScore(finalScore);
    achievementManager.recordGamePlayed('daily');

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1000);

    this.add.text(width / 2, height / 2 - 80, 'CHALLENGE FAILED', {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ef4444'
    }).setOrigin(0.5).setDepth(1001);

    this.add.text(width / 2, height / 2 - 30, `Score: ${finalScore}`, {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#ffffff'
    }).setOrigin(0.5).setDepth(1001);

    // Show target for context
    let targetText = '';
    if (challenge.target) targetText = `Target: ${challenge.target}`;
    else if (challenge.survivalMoves) targetText = `Survive: ${challenge.survivalMoves} moves`;

    if (targetText) {
      this.add.text(width / 2, height / 2, targetText, {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#888888'
      }).setOrigin(0.5).setDepth(1001);
    }

    const retryBtn = this.add.text(width / 2, height / 2 + 50, 'TRY AGAIN', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    retryBtn.on('pointerdown', () => this.scene.start('DailyChallengeScene'));
    this.tweens.add({ targets: retryBtn, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });

    const menuBtn = this.add.text(width / 2, height / 2 + 90, 'MAIN MENU', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  showLevelComplete() {
    const { width, height } = this.cameras.main;

    // Track level completion for achievements
    achievementManager.recordLevelCompleted();
    achievementManager.recordScore(this.boardLogic.getScore());
    achievementManager.recordGamePlayed('level');

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
        this.scene.start('TutorialSelectScene');
      }
    });

    const menuBtn = this.add.text(width / 2, height / 2 + 80, 'LEVEL SELECT', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    menuBtn.on('pointerdown', () => this.scene.start('TutorialSelectScene'));

    // Add "Back to Editor" button if this is a test level session
    if (window.isTestLevelSession) {
      const editorBtn = this.add.text(width / 2, height / 2 + 115, 'BACK TO EDITOR', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#f5c26b'
      }).setOrigin(0.5).setDepth(1001).setInteractive();

      editorBtn.on('pointerdown', () => {
        window.isTestLevelSession = false;
        window.close(); // Close the test tab and return to editor
      });
    }
  }

  showLevelFailed() {
    const { width, height } = this.cameras.main;

    // Track achievements even on failure
    achievementManager.recordScore(this.boardLogic.getScore());
    achievementManager.recordGamePlayed('level');

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

    menuBtn.on('pointerdown', () => this.scene.start('TutorialSelectScene'));

    // Add "Back to Editor" button if this is a test level session
    if (window.isTestLevelSession) {
      const editorBtn = this.add.text(width / 2, height / 2 + 105, 'BACK TO EDITOR', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#f5c26b'
      }).setOrigin(0.5).setDepth(1001).setInteractive();

      editorBtn.on('pointerdown', () => {
        window.isTestLevelSession = false;
        window.close(); // Close the test tab and return to editor
      });
    }
  }

  showGameOver() {
    const { width, height } = this.cameras.main;
    const finalScore = this.boardLogic.getScore();
    soundManager.play('gameOver');

    // Track if we can offer continue (endless mode only, once per game)
    const canContinue = this.gameMode === 'endless' && !this.hasUsedAdContinue;

    // Clear any saved game state since game is over
    gameStateManager.clearSavedGame(this.gameMode);

    // Track achievements
    achievementManager.recordScore(finalScore);
    achievementManager.recordGamePlayed(this.gameMode);

    // Save high score for original and crazy modes
    const isNewHighScore = highScoreManager.submitScore(this.gameMode, finalScore);

    // Store game over UI elements so we can remove them if continuing
    this.gameOverElements = [];

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1000);
    this.gameOverElements.push(overlay);

    const gameOverText = this.add.text(width / 2, height / 2 - 90, 'GAME OVER', {
      fontSize: '48px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5).setDepth(1001);
    this.gameOverElements.push(gameOverText);

    const scoreText = this.add.text(width / 2, height / 2 - 40, `Final Score: ${finalScore}`, {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#f5a623'
    }).setOrigin(0.5).setDepth(1001);
    this.gameOverElements.push(scoreText);

    // Show new high score message if achieved
    if (isNewHighScore) {
      const newRecordText = this.add.text(width / 2, height / 2 - 5, 'NEW HIGH SCORE!', {
        fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#7ed321'
      }).setOrigin(0.5).setDepth(1001);
      this.tweens.add({ targets: newRecordText, scale: 1.1, duration: 500, yoyo: true, repeat: -1 });
      this.gameOverElements.push(newRecordText);
    } else {
      const highScore = highScoreManager.getHighScore(this.gameMode);
      const bestText = this.add.text(width / 2, height / 2 - 5, `Best: ${highScore}`, {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#888888'
      }).setOrigin(0.5).setDepth(1001);
      this.gameOverElements.push(bestText);
    }

    let buttonY = height / 2 + 35;

    // Watch Ad to Continue button (endless mode only)
    if (canContinue) {
      const adBtn = this.add.text(width / 2, buttonY, 'WATCH AD TO CONTINUE', {
        fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#7ed321'
      }).setOrigin(0.5).setDepth(1001).setInteractive();
      this.gameOverElements.push(adBtn);

      adBtn.on('pointerdown', () => this.showAdAndContinue());
      this.tweens.add({ targets: adBtn, alpha: 0.6, duration: 600, yoyo: true, repeat: -1 });

      buttonY += 45;
    }

    const restartBtn = this.add.text(width / 2, buttonY, 'TAP TO RESTART', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#4a90e2'
    }).setOrigin(0.5).setDepth(1001).setInteractive();
    this.gameOverElements.push(restartBtn);

    restartBtn.on('pointerdown', () => this.scene.restart());
    this.tweens.add({ targets: restartBtn, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });

    // Menu button
    const menuBtn = this.add.text(width / 2, buttonY + 40, 'MAIN MENU', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(1001).setInteractive();
    this.gameOverElements.push(menuBtn);

    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  /**
   * Show an ad video and continue the game after watching
   */
  showAdAndContinue() {
    const { width, height } = this.cameras.main;

    // Mark that we've used the continue option
    this.hasUsedAdContinue = true;

    // Create full-screen ad container
    const adOverlay = this.add.graphics();
    adOverlay.fillStyle(0x000000, 1);
    adOverlay.fillRect(0, 0, width, height);
    adOverlay.setDepth(2000);

    // Create HTML video element for the ad
    const videoContainer = document.createElement('div');
    videoContainer.id = 'ad-container';
    videoContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #000;
      z-index: 10000;
    `;

    const video = document.createElement('video');
    video.style.cssText = 'max-width: 100%; max-height: 100%;';
    video.autoplay = true;
    video.playsInline = true;

    // Get ad URL
    const adUrl = this.loadRandomAd();

    if (adUrl) {
      // Play the video ad
      video.src = adUrl;
      videoContainer.appendChild(video);
      document.body.appendChild(videoContainer);

      // Skip button (appears after 3 seconds)
      const skipBtn = document.createElement('button');
      skipBtn.textContent = 'Skip';
      skipBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        font-size: 16px;
        background: rgba(255,255,255,0.2);
        color: white;
        border: 2px solid white;
        border-radius: 5px;
        cursor: pointer;
        z-index: 10001;
        display: none;
      `;

      skipBtn.onclick = () => {
        this.finishAdAndContinue(videoContainer, adOverlay);
      };

      videoContainer.appendChild(skipBtn);

      // Show skip button after 3 seconds
      setTimeout(() => {
        skipBtn.style.display = 'block';
      }, 3000);

      // Auto-continue when video ends
      video.onended = () => {
        this.finishAdAndContinue(videoContainer, adOverlay);
      };

      // Handle video errors
      video.onerror = () => {
        this.finishAdAndContinue(videoContainer, adOverlay);
      };
    } else {
      // No ads available - show placeholder for 3 seconds
      const placeholderText = this.add.text(width / 2, height / 2, 'Ad Placeholder\n(Add .mp4 files to /ads folder)', {
        fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#888888', align: 'center'
      }).setOrigin(0.5).setDepth(2001);

      const countdownText = this.add.text(width / 2, height / 2 + 60, '3', {
        fontSize: '48px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
      }).setOrigin(0.5).setDepth(2001);

      let countdown = 3;
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          countdown--;
          if (countdown > 0) {
            countdownText.setText(countdown.toString());
          } else {
            placeholderText.destroy();
            countdownText.destroy();
            adOverlay.destroy();
            this.continueAfterAd();
          }
        },
        repeat: 2
      });
    }
  }

  /**
   * Load a random ad video from the ads folder
   * Add your .mp4 filenames to the array below
   */
  loadRandomAd() {
    // List your ad video filenames here
    const adVideos = [
      'cat.mp4'
      // Add more: 'ad2.mp4', 'ad3.mp4', etc.
    ];

    if (adVideos.length === 0) return null;

    const randomAd = adVideos[Math.floor(Math.random() * adVideos.length)];
    return 'ads/' + randomAd;
  }

  /**
   * Clean up video container and continue the game
   */
  finishAdAndContinue(videoContainer, adOverlay) {
    if (videoContainer && videoContainer.parentNode) {
      videoContainer.parentNode.removeChild(videoContainer);
    }
    if (adOverlay) {
      adOverlay.destroy();
    }
    this.continueAfterAd();
  }

  /**
   * Continue the game after watching an ad
   * Clears a tile in the second-to-bottom row with a bomb explosion
   */
  continueAfterAd() {
    // Remove game over UI
    if (this.gameOverElements) {
      this.gameOverElements.forEach(el => {
        if (el && el.destroy) el.destroy();
      });
      this.gameOverElements = [];
    }

    // Find a tile in the second-to-bottom row (row 4, since rows are 0-5)
    const targetRow = 4;
    let targetCol = -1;

    // First, look for a tile in the second-to-bottom row
    for (let col = 0; col < 4; col++) {
      if (this.boardLogic.board[col][targetRow] !== null) {
        targetCol = col;
        break;
      }
    }

    // If no tile in row 4, try row 5 (bottom row)
    if (targetCol === -1) {
      for (let col = 0; col < 4; col++) {
        if (this.boardLogic.board[col][5] !== null) {
          targetCol = col;
          break;
        }
      }
    }

    // If still no tile found, just pick the center
    if (targetCol === -1) {
      targetCol = 1;
    }

    const finalRow = this.boardLogic.board[targetCol][targetRow] !== null ? targetRow : 5;

    // Create explosion data for a 3x3 area
    const affectedTiles = [];
    let totalPoints = 0;

    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        const col = targetCol + dc;
        const row = finalRow + dr;

        if (col < 0 || col >= 4 || row < 0 || row >= 6) continue;

        const value = this.boardLogic.board[col][row];
        if (value !== null && typeof value === 'number') {
          affectedTiles.push({ col, row, value });
          totalPoints += value;
          this.boardLogic.board[col][row] = null;
        } else if (value !== null && typeof value === 'object') {
          affectedTiles.push({ col, row, value: value.value || 0 });
          totalPoints += value.value || 0;
          this.boardLogic.board[col][row] = null;
        }
      }
    }

    // Remove special tiles in the explosion area
    if (this.specialTileManager) {
      affectedTiles.forEach(t => {
        this.specialTileManager.removeTileAt(t.col, t.row);
      });
    }

    // Execute the explosion visually
    this.executeBombExplosion(targetCol, finalRow, { affectedTiles, totalPoints });

    // Resume game after explosion settles
    this.time.delayedCall(800, () => {
      this.isAnimating = false;
    });
  }

  /**
   * Clean up event listeners and resources when scene is destroyed
   * Prevents memory leaks from lingering event handlers
   */
  shutdown() {
    // Remove resize listener
    this.scale.off('resize', this.onResize, this);

    // Clean up frenzy timer if active
    if (this.frenzyTimerEvent) {
      this.frenzyTimerEvent.remove();
      this.frenzyTimerEvent = null;
    }

    // Kill all tweens to prevent callbacks on destroyed objects
    this.tweens.killAll();
  }

  /**
   * Handle bomb merge logic - extracted to reduce code duplication
   * Called from animateFrenzyOperations, animateOperations, and animateGravity
   * @param {number} fromCol - Source column
   * @param {number} fromRow - Source row
   * @param {number} toCol - Target column
   * @param {number} toRow - Target row
   * @param {number} newValue - The merged tile value
   * @returns {Object|null} Bomb merge result or null if no bomb involved
   */
  handleBombMergeCheck(fromCol, fromRow, toCol, toRow, newValue) {
    if (!this.specialTileManager) return null;

    const specialTileFrom = this.specialTileManager.getSpecialTileAt(fromCol, fromRow);
    const specialTileTo = this.specialTileManager.getSpecialTileAt(toCol, toRow);

    // Two bombs merging = immediate explosion
    if (specialTileFrom?.type === 'bomb' && specialTileTo?.type === 'bomb') {
      return this.specialTileManager.onBombBombMerge(fromCol, fromRow, toCol, toRow);
    }

    // Target is a bomb
    if (specialTileTo?.type === 'bomb') {
      return this.specialTileManager.onBombMerge(toCol, toRow, newValue);
    }

    // Source is a bomb - update position first then merge
    if (specialTileFrom?.type === 'bomb') {
      this.specialTileManager.updateTilePosition(fromCol, fromRow, toCol, toRow);
      return this.specialTileManager.onBombMerge(toCol, toRow, newValue);
    }

    return null;
  }

  /**
   * Clean up special tiles after bomb merge check
   * @param {number} fromCol - Source column
   * @param {number} fromRow - Source row
   * @param {number} toCol - Target column
   * @param {number} toRow - Target row
   * @param {Object|null} bombMergeResult - Result from handleBombMergeCheck
   */
  cleanupSpecialTilesAfterMerge(fromCol, fromRow, toCol, toRow, bombMergeResult) {
    if (!this.specialTileManager) return;

    const specialTileFrom = this.specialTileManager.getSpecialTileAt(fromCol, fromRow);

    // Remove non-bomb special tiles at source position
    if (!specialTileFrom || specialTileFrom.type !== 'bomb') {
      this.specialTileManager.removeTileAt(fromCol, fromRow);
    }

    // Remove special tile at target if bomb exploded
    if (!bombMergeResult || bombMergeResult.exploded) {
      this.specialTileManager.removeTileAt(toCol, toRow);
    }
  }

  /**
   * Create merged tile after animation - handles both bomb and normal tiles
   * @param {number} col - Column position
   * @param {number} row - Row position
   * @param {number} value - Tile value
   * @param {Object|null} bombMergeResult - Result from handleBombMergeCheck
   * @returns {Tile} The newly created tile
   */
  createMergedTile(col, row, value, bombMergeResult) {
    if (bombMergeResult && !bombMergeResult.exploded) {
      return new Tile(this, col, row, value, this.boardLogic.nextTileId++, 'bomb', {
        mergesRemaining: bombMergeResult.mergesRemaining,
        value: value
      });
    }
    return new Tile(this, col, row, value, this.boardLogic.nextTileId++);
  }
}
