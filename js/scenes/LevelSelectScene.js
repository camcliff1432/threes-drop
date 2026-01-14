/**
 * LevelSelectScene - Level selection grid
 */
class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title
    this.add.text(width / 2, 50, 'SELECT LEVEL', {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Back button
    this.add.text(20, 20, '< BACK', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setInteractive().on('pointerdown', () => this.scene.start('MenuScene'));

    // Level grid
    const cols = 3, startX = 60, startY = 120, spacingX = 100, spacingY = 100;
    const total = levelManager.getTotalLevels();

    for (let i = 0; i < total; i++) {
      const level = levelManager.getLevel(i + 1);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacingX + 40;
      const y = startY + row * spacingY + 20;

      this.createLevelButton(x, y, level);
    }
  }

  createLevelButton(x, y, level) {
    const size = 70;
    const bg = this.add.graphics();
    bg.fillStyle(GameConfig.UI.PRIMARY, 0.3);
    bg.lineStyle(2, GameConfig.UI.PRIMARY, 1);
    bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 10);
    bg.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 10);

    this.add.text(x, y - 8, level.id.toString(), {
      fontSize: '28px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(x, y + 18, level.name, {
      fontSize: '9px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(x, y, size, size, 0x000000, 0).setInteractive();
    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(GameConfig.UI.PRIMARY, 0.6);
      bg.lineStyle(2, GameConfig.UI.PRIMARY_LIGHT, 1);
      bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 10);
      bg.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 10);
    });
    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(GameConfig.UI.PRIMARY, 0.3);
      bg.lineStyle(2, GameConfig.UI.PRIMARY, 1);
      bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 10);
      bg.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 10);
    });
    hitArea.on('pointerdown', () => {
      this.scene.start('GameScene', { mode: 'level', levelId: level.id });
    });
  }
}
