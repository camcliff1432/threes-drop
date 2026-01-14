/**
 * Tile.js
 * Phaser Container for a game tile with value display and smooth animations
 */

class Tile extends Phaser.GameObjects.Container {
  constructor(scene, gridX, gridY, value, tileId) {
    super(scene, 0, 0);

    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.value = value;
    this.tileId = tileId;

    this.TILE_SIZE = 80;
    this.TILE_PADDING = 10;

    this.createTileGraphics();
    this.updatePosition(gridX, gridY, false);

    scene.add.existing(this);
  }

  createTileGraphics() {
    // Background square
    this.bg = this.scene.add.graphics();
    this.updateTileAppearance();
    this.add(this.bg);

    // Value text
    this.text = this.scene.add.text(0, 0, this.value.toString(), {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    });
    this.text.setOrigin(0.5);
    this.add(this.text);
  }

  updateTileAppearance() {
    this.bg.clear();

    const color = this.getTileColor(this.value);
    const size = this.TILE_SIZE - this.TILE_PADDING;

    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);

    // Add subtle border
    this.bg.lineStyle(2, 0xffffff, 0.3);
    this.bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
  }

  getTileColor(value) {
    const colors = {
      1: 0x4a90e2,  // Blue
      2: 0xe24a4a,  // Red
      3: 0xffffff,  // White
      6: 0xf5a623,  // Orange
      12: 0xf8e71c, // Yellow
      24: 0x7ed321, // Green
      48: 0x50e3c2, // Cyan
      96: 0xb8e986, // Light green
      192: 0xbd10e0, // Purple
      384: 0xff6b6b, // Coral
      768: 0x4ecdc4, // Teal
    };

    return colors[value] || 0x999999; // Default gray for higher values
  }

  /**
   * Update the tile's grid position (with optional animation)
   * @param {number} gridX - Grid column
   * @param {number} gridY - Grid row
   * @param {boolean} animate - Whether to tween or snap
   * @param {number} duration - Animation duration in ms
   */
  updatePosition(gridX, gridY, animate = true, duration = 200) {
    this.gridX = gridX;
    this.gridY = gridY;

    const worldX = this.gridToWorldX(gridX);
    const worldY = this.gridToWorldY(gridY);

    if (animate) {
      this.scene.tweens.add({
        targets: this,
        x: worldX,
        y: worldY,
        duration: duration,
        ease: 'Power2'
      });
    } else {
      this.x = worldX;
      this.y = worldY;
    }
  }

  /**
   * Convert grid column to world X coordinate
   */
  gridToWorldX(gridX) {
    return this.scene.GRID_OFFSET_X + (gridX * this.TILE_SIZE) + (this.TILE_SIZE / 2);
  }

  /**
   * Convert grid row to world Y coordinate
   */
  gridToWorldY(gridY) {
    return this.scene.GRID_OFFSET_Y + (gridY * this.TILE_SIZE) + (this.TILE_SIZE / 2);
  }

  /**
   * Update the tile's value and appearance
   */
  updateValue(newValue, animate = true) {
    this.value = newValue;
    this.text.setText(newValue.toString());
    this.updateTileAppearance();

    if (animate) {
      // Pop animation
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
    }
  }

  /**
   * Animate tile drop from spawn position
   */
  dropFromTop(targetGridY, duration = 300) {
    const startY = this.gridToWorldY(-1); // Start above the grid
    const endY = this.gridToWorldY(targetGridY);

    this.y = startY;
    this.alpha = 0;

    // Fade in and drop
    this.scene.tweens.add({
      targets: this,
      y: endY,
      alpha: 1,
      duration: duration,
      ease: 'Bounce.easeOut'
    });

    this.gridY = targetGridY;
  }

  /**
   * Merge animation - scale up and fade out
   */
  mergeAnimation(callback) {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        if (callback) callback();
        this.destroy();
      }
    });
  }

  /**
   * Remove the tile with animation
   */
  removeWithAnimation(callback) {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        if (callback) callback();
        this.destroy();
      }
    });
  }
}
