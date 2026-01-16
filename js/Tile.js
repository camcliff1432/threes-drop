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
      case 'auto_swapper':
        color = GameConfig.COLORS.AUTO_SWAPPER;
        strokeColor = 0xb366e0;
        strokeAlpha = 0.8;
        break;
      case 'bomb':
        color = GameConfig.COLORS.BOMB;
        strokeColor = 0xcc0000;
        strokeAlpha = 0.9;
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
    } else if (this.tileType === 'lead') {
      this.addLeadKettlebellPattern();
    } else if (this.tileType === 'glass' && this.specialData.durability === 1) {
      this.addCrackOverlay();
    } else if (this.tileType === 'auto_swapper') {
      this.addAutoSwapperPattern();
    } else if (this.tileType === 'bomb') {
      this.addBombPattern();
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
        displayText = 'W';
        textColor = '#ffffff';
        fontSize = '40px';
        break;
      case 'auto_swapper':
        // Show value for auto-swapper
        displayText = this.value?.toString() || '';
        textColor = '#ffffff';
        fontSize = '28px';
        break;
      case 'bomb':
        // Show value for bomb
        displayText = this.value?.toString() || '';
        textColor = '#ffffff';
        fontSize = '28px';
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
   * Add metallic crosshatch pattern for steel plates
   */
  addSteelPattern() {
    const size = this.TILE_SIZE - 8;
    const pattern = this.scene.add.graphics();

    // Crosshatch lines - diagonal pattern
    pattern.lineStyle(1, 0x9090a0, 0.4);

    // Lines going one direction (top-left to bottom-right)
    const spacing = 8;
    for (let i = -size; i < size; i += spacing) {
      const x1 = Math.max(-size / 2, i - size / 2);
      const y1 = Math.max(-size / 2, -i - size / 2);
      const x2 = Math.min(size / 2, i + size / 2);
      const y2 = Math.min(size / 2, -i + size / 2);
      pattern.lineBetween(x1, y1, x2, y2);
    }

    // Lines going other direction (top-right to bottom-left)
    for (let i = -size; i < size; i += spacing) {
      const x1 = Math.max(-size / 2, -i - size / 2);
      const y1 = Math.max(-size / 2, -i - size / 2);
      const x2 = Math.min(size / 2, -i + size / 2);
      const y2 = Math.min(size / 2, -i + size / 2);
      pattern.lineBetween(x1, y1, x2, y2);
    }

    // Add subtle metallic highlight on top edge
    pattern.lineStyle(2, 0xc0c0d0, 0.5);
    pattern.lineBetween(-size / 2 + 4, -size / 2 + 4, size / 2 - 4, -size / 2 + 4);

    // Add subtle shadow on bottom edge
    pattern.lineStyle(2, 0x505060, 0.5);
    pattern.lineBetween(-size / 2 + 4, size / 2 - 4, size / 2 - 4, size / 2 - 4);

    this.add(pattern);
    this.steelPattern = pattern;
  }

  /**
   * Add kettlebell shape for lead tiles
   */
  addLeadKettlebellPattern() {
    const pattern = this.scene.add.graphics();

    // Kettlebell body (main ball) - dark gray with metallic sheen
    const bodyRadius = 16;
    const bodyY = 6;

    // Body shadow/depth
    pattern.fillStyle(0x0a0a0a, 1);
    pattern.fillCircle(2, bodyY + 2, bodyRadius);

    // Main body
    pattern.fillStyle(0x2a2a2a, 1);
    pattern.fillCircle(0, bodyY, bodyRadius);

    // Body highlight (top-left shine)
    pattern.fillStyle(0x4a4a4a, 0.6);
    pattern.fillCircle(-5, bodyY - 5, 6);

    // Handle - curved arc at top
    pattern.lineStyle(5, 0x2a2a2a, 1);
    pattern.beginPath();
    pattern.arc(0, -6, 12, Math.PI * 0.15, Math.PI * 0.85, false);
    pattern.strokePath();

    // Handle highlight
    pattern.lineStyle(2, 0x4a4a4a, 0.5);
    pattern.beginPath();
    pattern.arc(0, -6, 12, Math.PI * 0.2, Math.PI * 0.5, false);
    pattern.strokePath();

    // Handle inner shadow
    pattern.lineStyle(2, 0x1a1a1a, 0.8);
    pattern.beginPath();
    pattern.arc(0, -6, 9, Math.PI * 0.2, Math.PI * 0.8, false);
    pattern.strokePath();

    this.add(pattern);
    this.leadPattern = pattern;
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

  /**
   * Add swirl pattern for auto-swapper tiles
   */
  addAutoSwapperPattern() {
    const pattern = this.scene.add.graphics();

    // Circular arrows / swirl to indicate swap behavior
    pattern.lineStyle(2, 0xffffff, 0.4);

    // Draw curved arrow (left arc)
    pattern.beginPath();
    pattern.arc(-8, 0, 8, Math.PI * 0.3, Math.PI * 1.2, false);
    pattern.strokePath();

    // Draw curved arrow (right arc)
    pattern.beginPath();
    pattern.arc(8, 0, 8, Math.PI * 1.3, Math.PI * 2.2, false);
    pattern.strokePath();

    // Arrowheads
    pattern.fillStyle(0xffffff, 0.4);
    pattern.fillTriangle(-12, -6, -8, -10, -6, -4);
    pattern.fillTriangle(12, 6, 8, 10, 6, 4);

    // Swaps remaining indicator in bottom corner
    if (this.specialData.swapsRemaining !== undefined) {
      const lifeText = this.scene.add.text(18, 18, this.specialData.swapsRemaining.toString(), {
        fontSize: '10px',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);
      this.add(lifeText);
      this.lifeText = lifeText;
    }

    this.add(pattern);
    this.swapperPattern = pattern;
  }

  /**
   * Add bomb icon pattern for bomb tiles
   */
  addBombPattern() {
    const pattern = this.scene.add.graphics();

    // Bomb body (circle) - behind the value
    pattern.fillStyle(0x000000, 0.3);
    pattern.fillCircle(0, 3, 14);

    // Fuse
    pattern.lineStyle(3, 0x444444, 1);
    pattern.beginPath();
    pattern.moveTo(0, -11);
    pattern.lineTo(4, -18);
    pattern.lineTo(8, -16);
    pattern.strokePath();

    // Fuse spark
    pattern.fillStyle(0xff8800, 0.9);
    pattern.fillCircle(8, -16, 4);
    pattern.fillStyle(0xffff00, 1);
    pattern.fillCircle(8, -16, 2);

    // Merges remaining indicator in corner
    if (this.specialData.mergesRemaining !== undefined) {
      const mergesText = this.scene.add.text(18, 18, this.specialData.mergesRemaining.toString(), {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        color: '#ffff00'
      }).setOrigin(0.5);
      this.add(mergesText);
      this.mergesText = mergesText;
    }

    this.add(pattern);
    this.bombPattern = pattern;
  }

  /**
   * Explosion animation for bomb tiles
   */
  explodeAnimation(callback) {
    // Create explosion particles
    const particles = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particle = this.scene.add.circle(this.x, this.y, 5, 0xff8800, 1);
      particles.push(particle);

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 60,
        y: this.y + Math.sin(angle) * 60,
        alpha: 0,
        scale: 0.5,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }

    // Screen shake effect
    this.scene.cameras.main.shake(200, 0.01);

    // Expand and fade the tile
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        if (callback) callback();
        this.destroy();
      }
    });
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
      case 'auto_swapper':
        color = GameConfig.COLORS.AUTO_SWAPPER;
        strokeColor = 0xb366e0;
        strokeAlpha = 0.8;
        break;
      case 'bomb':
        color = GameConfig.COLORS.BOMB;
        strokeColor = 0xcc0000;
        strokeAlpha = 0.9;
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

    // Update auto-swapper swaps remaining indicator
    if (this.tileType === 'auto_swapper' && this.lifeText) {
      this.lifeText.setText(this.specialData.swapsRemaining?.toString() || '');
    }

    // Update bomb merges remaining indicator
    if (this.tileType === 'bomb' && this.mergesText) {
      this.mergesText.setText(this.specialData.mergesRemaining?.toString() || '');
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
    // Get layout - prefer scene's cached layout, compute dynamically if needed
    const layout = this.getLayout();
    return layout.offsetX + (gx * layout.tileSize) + (layout.tileSize / 2);
  }

  gridToWorldY(gy) {
    // Get layout - prefer scene's cached layout, compute dynamically if needed
    const layout = this.getLayout();
    return layout.offsetY + (gy * layout.tileSize) + (layout.tileSize / 2);
  }

  /**
   * Get the current layout, computing it if necessary
   */
  getLayout() {
    // Try scene's cached layout first
    if (this.scene && this.scene.layout) {
      return this.scene.layout;
    }
    // Compute layout dynamically from scene camera dimensions
    if (this.scene && this.scene.cameras && this.scene.cameras.main) {
      const { width, height } = this.scene.cameras.main;
      return GameConfig.getLayout(width, height);
    }
    // Fallback to static config values
    return {
      tileSize: this.TILE_SIZE || GameConfig.GRID.TILE_SIZE,
      offsetX: GameConfig.GRID.OFFSET_X,
      offsetY: GameConfig.GRID.OFFSET_Y
    };
  }

  /**
   * Update tile position when layout changes (responsive resize)
   */
  updateLayoutPosition(tileSize, offsetX, offsetY) {
    this.TILE_SIZE = tileSize;
    const worldX = offsetX + (this.gridX * tileSize) + (tileSize / 2);
    const worldY = offsetY + (this.gridY * tileSize) + (tileSize / 2);
    this.x = worldX;
    this.y = worldY;
    // Redraw graphics at new size
    this.recreateGraphics();
  }

  /**
   * Recreate graphics at current tile size (for resize)
   */
  recreateGraphics() {
    // Remove existing graphics
    this.removeAll(true);
    // Recreate at new size
    this.createGraphics();
  }

  updatePosition(gridX, gridY, animate = true, duration = GameConfig.ANIM.SHIFT) {
    this.gridX = gridX;
    this.gridY = gridY;
    const worldX = this.gridToWorldX(gridX);
    const worldY = this.gridToWorldY(gridY);

    if (animate && this.scene && this.scene.tweens) {
      this.scene.tweens.add({ targets: this, x: worldX, y: worldY, duration, ease: 'Power2' });
    } else {
      this.x = worldX;
      this.y = worldY;
    }
  }

  updateValue(newValue, animate = true) {
    this.value = newValue;
    this.updateGraphics();
    if (animate && this.scene && this.scene.tweens) {
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
