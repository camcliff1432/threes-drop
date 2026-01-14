/**
 * Tile - Visual representation of a game tile
 */
class Tile extends Phaser.GameObjects.Container {
  constructor(scene, gridX, gridY, value, tileId) {
    super(scene, 0, 0);
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.value = value;
    this.tileId = tileId;
    this.TILE_SIZE = GameConfig.GRID.TILE_SIZE;

    this.createGraphics();
    this.updatePosition(gridX, gridY, false);
    scene.add.existing(this);
  }

  createGraphics() {
    const size = this.TILE_SIZE - 8;
    this.bg = this.scene.add.graphics();
    this.bg.fillStyle(getTileColor(this.value), 1);
    this.bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    this.bg.lineStyle(2, 0xffffff, 0.3);
    this.bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
    this.add(this.bg);

    this.text = this.scene.add.text(0, 0, this.value.toString(), {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: getTileTextColor(this.value)
    }).setOrigin(0.5);
    this.add(this.text);
  }

  updateGraphics() {
    const size = this.TILE_SIZE - 8;
    this.bg.clear();
    this.bg.fillStyle(getTileColor(this.value), 1);
    this.bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    this.bg.lineStyle(2, 0xffffff, 0.3);
    this.bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
    this.text.setText(this.value.toString());
    this.text.setColor(getTileTextColor(this.value));
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
}
