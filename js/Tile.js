/**
 * Tile - Visual representation of a game tile
 * Supports normal tiles, special tiles (steel, lead, glass), and wildcard
 * Uses pre-rendered canvas textures from TileRenderer for polished graphics
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
    // Use pre-rendered texture from TileRenderer
    const textureKey = tileRenderer.getKey(this.value, this.tileType, this.specialData);
    this.bg = this.scene.add.image(0, 0, textureKey).setOrigin(0.5);
    this.add(this.bg);

    // Text content - clean styling (displayed on top of texture)
    let displayText = this.value?.toString() || '';
    let textColor = getTileTextColor(this.value);
    let fontSize = Math.round(this.TILE_SIZE * 0.37) + 'px';
    let fontFamily = GameConfig.FONTS.NUMBERS;
    let fontWeight = '800';

    switch (this.tileType) {
      case 'steel':
        displayText = this.specialData.turnsRemaining?.toString() || '';
        textColor = '#3d4d5d';
        fontSize = Math.round(this.TILE_SIZE * 0.31) + 'px';
        break;
      case 'lead':
        displayText = this.specialData.countdown?.toString() || '';
        textColor = '#999999';
        fontSize = Math.round(this.TILE_SIZE * 0.37) + 'px';
        break;
      case 'glass':
        displayText = this.value?.toString() || '';
        textColor = '#1a4a70';
        fontSize = Math.round(this.TILE_SIZE * 0.37) + 'px';
        break;
      case 'wildcard':
        displayText = ''; // Star is baked into texture
        break;
      case 'auto_swapper':
        displayText = this.value?.toString() || '';
        textColor = '#ffffff';
        fontSize = Math.round(this.TILE_SIZE * 0.31) + 'px';
        break;
      case 'bomb':
        displayText = this.value?.toString() || '';
        textColor = '#ffffff';
        fontSize = Math.round(this.TILE_SIZE * 0.31) + 'px';
        break;
      default:
        break;
    }

    // Only add text if there's something to display
    const textY = this.tileType === 'auto_swapper' ? Math.round(this.TILE_SIZE * 0.18) : 0;
    if (displayText || this.tileType === 'normal') {
      this.text = this.scene.add.text(0, textY, displayText, {
        fontSize: fontSize,
        fontFamily: fontFamily,
        fontStyle: fontWeight,
        color: textColor,
        shadow: { offsetX: 0, offsetY: 1, color: 'rgba(0,0,0,0.3)', blur: 2, fill: true }
      }).setOrigin(0.5);
      this.add(this.text);
    }

    // Dynamic badges for special tiles
    if (this.tileType === 'glass') {
      this.addDurabilityIndicator();
    }
    if (this.tileType === 'auto_swapper' && this.specialData.swapsRemaining !== undefined) {
      this.addSwapsBadge();
    }
    if (this.tileType === 'bomb' && this.specialData.mergesRemaining !== undefined) {
      this.addMergesBadge();
    }
  }

  /**
   * Add durability indicator (badge) for glass tiles
   */
  addDurabilityIndicator() {
    const durability = this.specialData.durability || 2;
    const size = this.TILE_SIZE - 8;

    if (this.durabilityBadge) {
      this.durabilityBadge.destroy();
    }
    if (this.durabilityText) {
      this.durabilityText.destroy();
    }

    // Show durability as small badge in corner
    const badge = this.scene.add.graphics();
    badge.fillStyle(durability === 1 ? 0xff3838 : 0x0066cc, 0.9);
    badge.fillCircle(size / 2 - 8, -size / 2 + 8, 10);
    this.add(badge);
    this.durabilityBadge = badge;

    this.durabilityText = this.scene.add.text(size / 2 - 8, -size / 2 + 8, durability.toString(), {
      fontSize: '12px',
      fontFamily: GameConfig.FONTS.NUMBERS,
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.add(this.durabilityText);
  }

  /**
   * Add swaps remaining badge for auto-swapper tiles
   */
  addSwapsBadge() {
    const lifeBadge = this.scene.add.graphics();
    lifeBadge.fillStyle(0x000000, 0.5);
    lifeBadge.fillCircle(18, 18, 9);
    this.add(lifeBadge);
    this.swapsBadge = lifeBadge;

    const lifeText = this.scene.add.text(18, 18, this.specialData.swapsRemaining.toString(), {
      fontSize: '11px',
      fontFamily: GameConfig.FONTS.NUMBERS,
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.add(lifeText);
    this.lifeText = lifeText;
  }

  /**
   * Add merges remaining badge for bomb tiles
   */
  addMergesBadge() {
    const mergesBadge = this.scene.add.graphics();
    mergesBadge.fillStyle(0x000000, 0.6);
    mergesBadge.fillCircle(18, 18, 10);
    mergesBadge.lineStyle(2, 0xffe600, 0.8);
    mergesBadge.strokeCircle(18, 18, 10);
    this.add(mergesBadge);
    this.mergesBadgeGraphic = mergesBadge;

    const mergesText = this.scene.add.text(18, 18, this.specialData.mergesRemaining.toString(), {
      fontSize: '12px',
      fontFamily: GameConfig.FONTS.NUMBERS,
      fontStyle: 'bold',
      color: '#ffe600'
    }).setOrigin(0.5);
    this.add(mergesText);
    this.mergesText = mergesText;
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
    // Swap the texture on the background image
    const textureKey = tileRenderer.getKey(this.value, this.tileType, this.specialData);
    if (this.bg && this.bg.texture) {
      this.bg.setTexture(textureKey);
    }

    // Update text based on tile type
    if (this.tileType === 'lead') {
      if (this.text) this.text.setText(this.specialData.countdown?.toString() || '');
    } else if (this.tileType === 'steel') {
      if (this.text) this.text.setText(this.specialData.turnsRemaining?.toString() || '');
    } else if (this.tileType === 'glass') {
      if (this.text) this.text.setText(this.value?.toString() || '');
      // Update durability indicator
      if (this.durabilityText) {
        const durability = this.specialData.durability || 2;
        this.durabilityText.setText(durability.toString());
        this.durabilityText.setColor(durability === 1 ? '#ff0000' : '#0066cc');
      }
    } else if (this.tileType !== 'wildcard') {
      if (this.text) {
        this.text.setText(this.value?.toString() || '');
        if (this.tileType === 'normal') {
          this.text.setColor(getTileTextColor(this.value));
        }
      }
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
