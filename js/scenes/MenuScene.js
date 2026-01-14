/**
 * MenuScene - Main menu / landing page
 */
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title
    this.add.text(width / 2, 120, 'THREES', {
      fontSize: '64px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);
    this.add.text(width / 2, 180, 'DROP', {
      fontSize: '64px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5);

    // Decorative tiles
    this.createDecorativeTiles(width);

    // Menu buttons
    const buttonY = 380, spacing = 70;
    UIHelpers.createButton(this, width / 2, buttonY, 'CLASSIC MODE', () => {
      this.scene.start('GameScene', { mode: 'classic' });
    });
    UIHelpers.createButton(this, width / 2, buttonY + spacing, 'LEVELS', () => {
      this.scene.start('LevelSelectScene');
    });
    UIHelpers.createButton(this, width / 2, buttonY + spacing * 2, 'HOW TO PLAY', () => {
      UIHelpers.showHowToPlay(this);
    });
  }

  createDecorativeTiles(width) {
    const tiles = [
      { x: width / 2 - 90, value: 1 },
      { x: width / 2 - 30, value: 2 },
      { x: width / 2 + 30, value: 3 },
      { x: width / 2 + 90, value: 6 }
    ];
    const y = 280;
    tiles.forEach(t => {
      const bg = this.add.graphics();
      bg.fillStyle(getTileColor(t.value), 1);
      bg.fillRoundedRect(t.x - 25, y - 25, 50, 50, 8);
      bg.lineStyle(2, 0xffffff, 0.3);
      bg.strokeRoundedRect(t.x - 25, y - 25, 50, 50, 8);
      this.add.text(t.x, y, t.value.toString(), {
        fontSize: '28px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
        color: getTileTextColor(t.value)
      }).setOrigin(0.5);
    });
  }
}
