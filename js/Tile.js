/**
 * Tile - Visual representation of a game tile
 * Supports normal tiles, special tiles (steel, lead, glass), and wildcard
 */
class Tile extends Phaser.GameObjects.Container {
  constructor(scene, gridX, gridY, value, tileId, tileType = 'normal', specialData = {}) {
    super(scene, 0, 0);
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.value = value;
    this.tileId = tileId;
    this.tileType = tileType;  // 'normal', 'steel', 'lead', 'glass', 'wildcard'
    this.specialData = specialData;  // countdown, durability, etc.
    this.TILE_SIZE = GameConfig.GRID.TILE_SIZE;
    this.isSelected = false;
    this.createGraphics();
    this.updatePosition(gridX, gridY, false);
    scene.add.existing(this);
  }

  createGraphics() {
    const size = this.TILE_SIZE - 8;
    this.bg = this.scene.add.graphics();

    let color = getTileColor(this.value);
    let strokeColor = 0xffffff;
    let strokeAlpha = 0.3;

    switch (this.tileType) {
      case 'steel':
        color = GameConfig.COLORS.STEEL;
        strokeColor = 0x4a4a4a;
        strokeAlpha = 0.8;
        break;
      case 'lead':
        color = GameConfig.COLORS.LEAD;
        strokeColor = 0x444444;
        strokeAlpha = 0.3;
        break;
      case 'glass':
        color = GameConfig.COLORS.GLASS;
        strokeColor = 0x87ceeb;
        strokeAlpha = 0.6;
        break;
      case 'wildcard':
        color = GameConfig.COLORS.WILDCARD;
        strokeColor = 0xff66ff;
        strokeAlpha = 0.8;
        break;
      default:
        break;
    }

    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    this.bg.lineStyle(2, strokeColor, strokeAlpha);
    this.bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
    this.add(this.bg);

    // Add special visual effects based on type
    if (this.tileType === 'steel') {
      this.addSteelPattern();
    } else if (this.tileType === 'glass' && this.specialData.durability === 1) {
      this.addCrackOverlay();
    }

    // Text content based on type
    let displayText = this.value?.toString() || '';
    let textColor = getTileTextColor(this.value);
    let fontSize = '32px';

    switch (this.tileType) {
      case 'steel':
        // Show turns remaining for steel
        displayText = this.specialData.turnsRemaining?.toString() || '';
        textColor = '#333333';
        fontSize = '24px';
        break;
      case 'lead':
        displayText = this.specialData.countdown?.toString() || '';
        textColor = '#888888';
        fontSize = '32px';
        break;
      case 'glass':
        // Show value with durability indicator
        displayText = this.value?.toString() || '';
        textColor = '#000000';
        fontSize = '32px';
        break;
      case 'wildcard':
        displayText = '?';
        textColor = '#ffffff';
        fontSize = '40px';
        break;
      default:
        break;
    }

    this.text = this.scene.add.text(0, 0, displayText, {
      fontSize: fontSize,
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: textColor
    }).setOrigin(0.5);
    this.add(this.text);

    // Add durability indicator for glass tiles
    if (this.tileType === 'glass') {
      this.addDurabilityIndicator();
    }
  }

  /**
   * Add durability indicator (hearts/dots) for glass tiles
   */
  addDurabilityIndicator() {
    const durability = this.specialData.durability || 2;
    const size = this.TILE_SIZE - 8;

    if (this.durabilityText) {
      this.durabilityText.destroy();
    }

    // Show durability as small number in corner
    this.durabilityText = this.scene.add.text(size / 2 - 8, -size / 2 + 8, durability.toString(), {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: durability === 1 ? '#ff0000' : '#0066cc'
    }).setOrigin(0.5);
    this.add(this.durabilityText);
  }

  /**
   * Add metallic pattern for steel plates
   */
  addSteelPattern() {
    // Pattern disabled - just using solid color
  }

  /**
   * Add crack overlay for damaged glass tiles
   */
  addCrackOverlay() {
    if (this.crackOverlay) {
      this.crackOverlay.destroy();
    }

    this.crackOverlay = this.scene.add.graphics();
    this.crackOverlay.lineStyle(2, 0x000000, 0.6);

    // Draw crack lines
    this.crackOverlay.lineBetween(-15, -15, 0, 0);
    this.crackOverlay.lineBetween(0, 0, 10, -5);
    this.crackOverlay.lineBetween(0, 0, 5, 12);
    this.crackOverlay.lineBetween(-8, 10, 0, 0);

    this.add(this.crackOverlay);
  }

  updateGraphics() {
    const size = this.TILE_SIZE - 8;
    this.bg.clear();

    let color = getTileColor(this.value);
    let strokeColor = 0xffffff;
    let strokeAlpha = 0.3;

    switch (this.tileType) {
      case 'steel':
        color = GameConfig.COLORS.STEEL;
        strokeColor = 0x4a4a4a;
        strokeAlpha = 0.8;
        break;
      case 'lead':
        color = GameConfig.COLORS.LEAD;
        strokeColor = 0x444444;
        strokeAlpha = 0.3;
        break;
      case 'glass':
        color = GameConfig.COLORS.GLASS;
        strokeColor = 0x87ceeb;
        strokeAlpha = 0.6;
        break;
      case 'wildcard':
        color = GameConfig.COLORS.WILDCARD;
        strokeColor = 0xff66ff;
        strokeAlpha = 0.8;
        break;
      default:
        break;
    }

    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    this.bg.lineStyle(2, strokeColor, strokeAlpha);
    this.bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);

    // Update text based on tile type
    if (this.tileType === 'lead') {
      this.text.setText(this.specialData.countdown?.toString() || '');
    } else if (this.tileType === 'steel') {
      this.text.setText(this.specialData.turnsRemaining?.toString() || '');
    } else if (this.tileType === 'glass') {
      this.text.setText(this.value?.toString() || '');
      // Update durability indicator
      if (this.durabilityText) {
        const durability = this.specialData.durability || 2;
        this.durabilityText.setText(durability.toString());
        this.durabilityText.setColor(durability === 1 ? '#ff0000' : '#0066cc');
      }
    } else if (this.tileType !== 'wildcard') {
      this.text.setText(this.value?.toString() || '');
      if (this.tileType === 'normal') {
        this.text.setColor(getTileTextColor(this.value));
      }
    }

    // Update crack overlay for glass
    if (this.tileType === 'glass' && this.specialData.durability === 1) {
      this.addCrackOverlay();
    }
  }

  /**
   * Update special data (countdown, durability, etc.)
   */
  updateSpecialData(newData) {
    this.specialData = { ...this.specialData, ...newData };
    this.updateGraphics();
  }

  gridToWorldX(gx) {
    return this.scene.GRID_OFFSET_X + (gx * this.TILE_SIZE) + (this.TILE_SIZE / 2);
  }

  gridToWorldY(gy) {
    return this.scene.GRID_OFFSET_Y + (gy * this.TILE_SIZE) + (this.TILE_SIZE / 2);
  }

  updatePosition(gridX, gridY, animate = true, duration = GameConfig.ANIM.SHIFT) {
    this.gridX = gridX;
    this.gridY = gridY;
    const worldX = this.gridToWorldX(gridX);
    const worldY = this.gridToWorldY(gridY);

    if (animate) {
      this.scene.tweens.add({ targets: this, x: worldX, y: worldY, duration, ease: 'Power2' });
    } else {
      this.x = worldX;
      this.y = worldY;
    }
  }

  updateValue(newValue, animate = true) {
    this.value = newValue;
    this.updateGraphics();
    if (animate) {
      this.scene.tweens.add({ targets: this, scaleX: 1.2, scaleY: 1.2, duration: 100, yoyo: true, ease: 'Power2' });
    }
  }

  dropFromTop(targetGridY, duration = GameConfig.ANIM.DROP) {
    this.y = this.gridToWorldY(-1);
    this.alpha = 0;
    this.scene.tweens.add({
      targets: this,
      y: this.gridToWorldY(targetGridY),
      alpha: 1,
      duration,
      ease: 'Bounce.easeOut'
    });
    this.gridY = targetGridY;
  }

  mergeAnimation(callback) {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3, scaleY: 1.3, alpha: 0,
      duration: GameConfig.ANIM.MERGE,
      ease: 'Power2',
      onComplete: () => {
        if (callback) callback();
        this.destroy();
      }
    });
  }

  /**
   * Shake animation for incompatible merge attempts
   */
  shakeAnimation(callback) {
    const originalX = this.x;
    this.scene.tweens.add({
      targets: this,
      x: originalX - 5,
      duration: 50,
      yoyo: true,
      repeat: 3,
      ease: 'Power2',
      onComplete: () => {
        this.x = originalX;
        if (callback) callback();
      }
    });
  }

  /**
   * Highlight tile for selection
   */
  setSelected(selected) {
    this.isSelected = selected;
    const size = this.TILE_SIZE - 8;

    if (selected) {
      // Add selection highlight
      if (!this.selectionHighlight) {
        this.selectionHighlight = this.scene.add.graphics();
        this.selectionHighlight.lineStyle(4, 0xffff00, 1);
        this.selectionHighlight.strokeRoundedRect(-size / 2 - 2, -size / 2 - 2, size + 4, size + 4, 10);
        this.add(this.selectionHighlight);
      }

      // Pulse animation
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      // Remove selection highlight
      if (this.selectionHighlight) {
        this.selectionHighlight.destroy();
        this.selectionHighlight = null;
      }
      this.scene.tweens.killTweensOf(this);
      this.setScale(1);
    }
  }

  /**
   * Glass break animation
   */
  breakAnimation(callback) {
    // Shatter effect
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0,
      angle: 15,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        if (callback) callback();
        this.destroy();
      }
    });
  }

  /**
   * Steel plate fade out animation
   */
  fadeOutAnimation(callback) {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        if (callback) callback();
        this.destroy();
      }
    });
  }
}
