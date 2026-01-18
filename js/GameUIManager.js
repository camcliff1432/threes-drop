/**
 * GameUIManager - Manages UI elements for GameScene
 *
 * Extracted from GameScene.js to improve maintainability.
 * Handles creation and updates of score display, power-up buttons,
 * combo bars, frenzy UI, and other game UI elements.
 *
 * Uses UI_SIZES from GameConfig for consistent sizing.
 */
class GameUIManager {
  /**
   * @param {Phaser.Scene} scene - The game scene
   * @param {Object} layout - Layout configuration from GameConfig.getLayout()
   */
  constructor(scene, layout) {
    this.scene = scene;
    this.layout = layout;

    // UI element references
    this.scoreText = null;
    this.resourceText = null;
    this.progressText = null;
    this.movesText = null;

    // Combo bar elements (Original mode)
    this.comboBarBg = null;
    this.comboBarFill = null;
    this.comboText = null;
    this.comboBarX = 0;
    this.comboBarY = 0;
    this.comboBarWidth = GameConfig.UI_SIZES?.COMBO_BAR_WIDTH || 200;
    this.comboBarHeight = GameConfig.UI_SIZES?.COMBO_BAR_HEIGHT || 30;

    // Power-up button elements
    this.powerUpButtons = {};

    // Frenzy bar elements
    this.frenzyBarBg = null;
    this.frenzyBarFill = null;
    this.frenzyBarText = null;
    this.frenzyActivateBtn = null;
    this.frenzyBarX = 0;
    this.frenzyBarY = 0;
    this.frenzyBarWidth = GameConfig.UI_SIZES?.FRENZY_BAR_WIDTH || 180;

    // Swipe buttons
    this.swipeButtons = { leftButton: null, rightButton: null, leftText: null, rightText: null };

    // Next tile preview
    this.nextTilePreview = null;
  }

  /**
   * Create score display for standard modes
   * @param {number} startY - Y position for score text
   */
  createScoreDisplay(startY) {
    const { width } = this.scene.cameras.main;
    const fontSize = GameConfig.UI_SIZES?.SCORE || '18px';

    this.scoreText = this.scene.add.text(width / 2, startY, 'SCORE: 0', {
      fontSize: fontSize,
      fontFamily: GameConfig.FONTS.NUMBERS,
      fontStyle: '700',
      color: '#ffffff'
    }).setOrigin(0.5);

    return this.scoreText;
  }

  /**
   * Update score display
   * @param {number} score - Current score
   */
  updateScore(score) {
    if (this.scoreText) {
      this.scoreText.setText(`SCORE: ${score}`);
    }
  }

  /**
   * Create level mode UI (progress and moves)
   * @param {Object} levelConfig - Level configuration
   * @param {number} startY - Y position
   */
  createLevelUI(levelConfig, startY) {
    const { width } = this.scene.cameras.main;
    const fontSize = GameConfig.UI_SIZES?.LABEL || '14px';

    this.progressText = this.scene.add.text(width / 2, startY, '', {
      fontSize: fontSize,
      fontFamily: GameConfig.FONTS.UI,
      color: '#ffffff'
    }).setOrigin(0.5);

    this.movesText = this.scene.add.text(width / 2, startY + 20, '', {
      fontSize: fontSize,
      fontFamily: GameConfig.FONTS.UI,
      color: '#aaaaaa'
    }).setOrigin(0.5);

    return { progressText: this.progressText, movesText: this.movesText };
  }

  /**
   * Update level progress display
   * @param {string} progressText - Progress text
   * @param {number} movesUsed - Moves used
   * @param {number} maxMoves - Maximum moves allowed
   */
  updateLevelProgress(progressText, movesUsed, maxMoves) {
    if (this.progressText) {
      this.progressText.setText(progressText);
    }
    if (this.movesText) {
      this.movesText.setText(`Moves: ${movesUsed}/${maxMoves}`);
    }
  }

  /**
   * Create resource points display for crazy/endless modes
   * @param {number} startY - Y position
   */
  createResourceDisplay(startY) {
    const { width } = this.scene.cameras.main;
    const fontSize = GameConfig.UI_SIZES?.LABEL || '14px';

    this.resourceText = this.scene.add.text(width / 2, startY, 'POWER: 0', {
      fontSize: fontSize,
      fontFamily: GameConfig.FONTS.UI,
      fontStyle: '600',
      color: '#f5c26b'
    }).setOrigin(0.5);

    return this.resourceText;
  }

  /**
   * Update resource points display
   * @param {number} points - Current resource points
   */
  updateResourcePoints(points) {
    if (this.resourceText) {
      this.resourceText.setText(`POWER: ${points}`);
    }
  }

  /**
   * Create combo bar for Original mode
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Object} Combo bar elements
   */
  createComboBar(x, y) {
    this.comboBarX = x;
    this.comboBarY = y;

    // Background
    this.comboBarBg = this.scene.add.graphics();
    this.comboBarBg.fillStyle(0x333333, 0.5);
    this.comboBarBg.fillRoundedRect(x, y, this.comboBarWidth, this.comboBarHeight, 5);
    this.comboBarBg.lineStyle(2, GameConfig.UI.PRIMARY, 0.5);
    this.comboBarBg.strokeRoundedRect(x, y, this.comboBarWidth, this.comboBarHeight, 5);

    // Fill (progress)
    this.comboBarFill = this.scene.add.graphics();

    // Label
    const labelFontSize = GameConfig.UI_SIZES?.LABEL || '14px';
    this.scene.add.text(x + this.comboBarWidth / 2, y - 12, 'SWIPE CHARGE', {
      fontSize: '12px',
      fontFamily: GameConfig.FONTS.UI,
      color: '#888888'
    }).setOrigin(0.5);

    // Counter text
    this.comboText = this.scene.add.text(x + this.comboBarWidth / 2, y + this.comboBarHeight / 2, '0/6', {
      fontSize: labelFontSize,
      fontFamily: GameConfig.FONTS.NUMBERS,
      fontStyle: '700',
      color: '#ffffff'
    }).setOrigin(0.5);

    return {
      bg: this.comboBarBg,
      fill: this.comboBarFill,
      text: this.comboText
    };
  }

  /**
   * Update combo bar progress
   * @param {number} count - Current merge count
   * @param {number} max - Maximum for charge
   * @param {boolean} isReady - Whether swipe is ready
   */
  updateComboBar(count, max, isReady) {
    if (!this.comboBarFill) return;

    const ratio = Math.min(count / max, 1);

    this.comboBarFill.clear();
    if (ratio > 0) {
      const color = isReady ? GameConfig.UI.SUCCESS : GameConfig.UI.PRIMARY;
      this.comboBarFill.fillStyle(color, 1);
      this.comboBarFill.fillRoundedRect(
        this.comboBarX,
        this.comboBarY,
        this.comboBarWidth * ratio,
        this.comboBarHeight,
        5
      );
    }

    if (this.comboText) {
      this.comboText.setText(`${count}/${max}`);
      this.comboText.setColor(isReady ? '#7ed321' : '#ffffff');
    }
  }

  /**
   * Create power-up button
   * @param {string} type - Power-up type (swipe, swapper, merger, wildcard)
   * @param {string} label - Display label
   * @param {number} cost - Resource cost
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Function} onClick - Click callback
   * @returns {Object} Button elements
   */
  createPowerUpButton(type, label, cost, x, y, onClick) {
    const btnWidth = GameConfig.UI_SIZES?.POWER_UP_BUTTON_WIDTH || 56;
    const btnHeight = GameConfig.UI_SIZES?.POWER_UP_BUTTON_HEIGHT || 36;

    const bg = this.scene.add.graphics();
    bg.fillStyle(GameConfig.UI.PRIMARY, 0.2);
    bg.lineStyle(2, GameConfig.UI.DISABLED, 0.5);
    bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 6);
    bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 6);

    const labelText = this.scene.add.text(x, y - 6, label, {
      fontSize: '11px',
      fontFamily: GameConfig.FONTS.UI,
      fontStyle: '700',
      color: '#666666'
    }).setOrigin(0.5);

    const costText = this.scene.add.text(x, y + 8, `${cost}`, {
      fontSize: '10px',
      fontFamily: GameConfig.FONTS.NUMBERS,
      color: '#666666'
    }).setOrigin(0.5);

    // Make interactive
    const hitArea = this.scene.add.rectangle(x, y, btnWidth, btnHeight, 0x000000, 0);
    hitArea.setInteractive();
    hitArea.on('pointerdown', onClick);

    const button = { type, bg, label: labelText, costText, hitArea, x, y, cost };
    this.powerUpButtons[type] = button;

    return button;
  }

  /**
   * Update power-up button state
   * @param {string} type - Power-up type
   * @param {boolean} canAfford - Whether player can afford this power-up
   */
  updatePowerUpButton(type, canAfford) {
    const btn = this.powerUpButtons[type];
    if (!btn) return;

    const btnWidth = GameConfig.UI_SIZES?.POWER_UP_BUTTON_WIDTH || 56;
    const btnHeight = GameConfig.UI_SIZES?.POWER_UP_BUTTON_HEIGHT || 36;

    btn.bg.clear();
    if (canAfford) {
      btn.bg.fillStyle(GameConfig.UI.SUCCESS, 0.4);
      btn.bg.lineStyle(2, GameConfig.UI.SUCCESS, 1);
    } else {
      btn.bg.fillStyle(GameConfig.UI.PRIMARY, 0.2);
      btn.bg.lineStyle(2, GameConfig.UI.DISABLED, 0.5);
    }
    btn.bg.fillRoundedRect(btn.x - btnWidth / 2, btn.y - btnHeight / 2, btnWidth, btnHeight, 6);
    btn.bg.strokeRoundedRect(btn.x - btnWidth / 2, btn.y - btnHeight / 2, btnWidth, btnHeight, 6);

    btn.label.setColor(canAfford ? '#ffffff' : '#666666');
    btn.costText.setColor(canAfford ? '#7ed321' : '#666666');
  }

  /**
   * Create frenzy meter bar
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Object} Frenzy bar elements
   */
  createFrenzyBar(x, y) {
    this.frenzyBarX = x;
    this.frenzyBarY = y;
    const height = GameConfig.UI_SIZES?.FRENZY_BAR_HEIGHT || 16;

    // Background
    this.frenzyBarBg = this.scene.add.graphics();
    this.frenzyBarBg.fillStyle(0x333333, 0.5);
    this.frenzyBarBg.fillRoundedRect(x, y, this.frenzyBarWidth, height, 4);
    this.frenzyBarBg.lineStyle(2, GameConfig.UI.FRENZY, 0.3);
    this.frenzyBarBg.strokeRoundedRect(x, y, this.frenzyBarWidth, height, 4);

    // Fill
    this.frenzyBarFill = this.scene.add.graphics();

    // Label
    this.scene.add.text(x + this.frenzyBarWidth / 2, y - 10, 'FRENZY', {
      fontSize: '10px',
      fontFamily: GameConfig.FONTS.UI,
      color: '#e24a4a'
    }).setOrigin(0.5);

    // Counter text
    this.frenzyBarText = this.scene.add.text(x + this.frenzyBarWidth / 2, y + height / 2, '0/50', {
      fontSize: '10px',
      fontFamily: GameConfig.FONTS.NUMBERS,
      fontStyle: '700',
      color: '#ffffff'
    }).setOrigin(0.5);

    return {
      bg: this.frenzyBarBg,
      fill: this.frenzyBarFill,
      text: this.frenzyBarText
    };
  }

  /**
   * Update frenzy bar
   * @param {number} meter - Current frenzy meter value
   * @param {number} threshold - Frenzy activation threshold
   * @param {boolean} isReady - Whether frenzy is ready to activate
   */
  updateFrenzyBar(meter, threshold, isReady) {
    if (!this.frenzyBarFill) return;

    const ratio = Math.min(meter / threshold, 1);
    const height = GameConfig.UI_SIZES?.FRENZY_BAR_HEIGHT || 16;

    this.frenzyBarFill.clear();
    if (ratio > 0) {
      this.frenzyBarFill.fillStyle(GameConfig.UI.FRENZY, 1);
      this.frenzyBarFill.fillRoundedRect(
        this.frenzyBarX,
        this.frenzyBarY,
        this.frenzyBarWidth * ratio,
        height,
        4
      );
    }

    const displayMeter = Math.min(meter, threshold);
    if (this.frenzyBarText) {
      this.frenzyBarText.setText(`${displayMeter}/${threshold}`);
    }
  }

  /**
   * Create next tile preview container
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Phaser.GameObjects.Container} Preview container
   */
  createNextTilePreview(x, y) {
    this.nextTilePreview = this.scene.add.container(x, y);

    this.scene.add.text(x, y - 35, 'NEXT', {
      fontSize: '12px',
      fontFamily: GameConfig.FONTS.UI,
      color: '#888888'
    }).setOrigin(0.5);

    return this.nextTilePreview;
  }

  /**
   * Update layout reference (called on resize)
   * @param {Object} layout - New layout configuration
   */
  updateLayout(layout) {
    this.layout = layout;
  }

  /**
   * Clean up UI elements
   */
  destroy() {
    // Graphics objects are cleaned up by Phaser when scene is destroyed
    this.powerUpButtons = {};
  }
}
