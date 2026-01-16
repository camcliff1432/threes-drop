/**
 * TutorialSelectScene - Tutorial level selection grid
 * Contains all 20 tutorial levels to teach game mechanics
 */
class TutorialSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialSelectScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title
    this.add.text(width / 2, 50, 'TUTORIAL', {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, 80, 'Learn the basics', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5);

    // Back button
    this.add.text(20, 20, '< BACK', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setInteractive().on('pointerdown', () => this.scene.start('MenuScene'));

    // Level grid - 4 columns for 20 levels
    const cols = 4, startX = 45, startY = 110, spacingX = 85, spacingY = 85;
    const total = levelManager.getTotalLevels();

    for (let i = 0; i < total; i++) {
      const level = levelManager.getLevel(i + 1);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacingX + 35;
      const y = startY + row * spacingY + 20;

      this.createLevelButton(x, y, level);
    }
  }

  createLevelButton(x, y, level) {
    const size = 60;
    const bg = this.add.graphics();
    bg.fillStyle(GameConfig.UI.PRIMARY, 0.3);
    bg.lineStyle(2, GameConfig.UI.PRIMARY, 1);
    bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 8);
    bg.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 8);

    this.add.text(x, y - 6, level.id.toString(), {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(x, y + 16, level.name, {
      fontSize: '8px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(x, y, size, size, 0x000000, 0).setInteractive();
    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(GameConfig.UI.PRIMARY, 0.6);
      bg.lineStyle(2, GameConfig.UI.PRIMARY_LIGHT, 1);
      bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 8);
      bg.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 8);
    });
    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(GameConfig.UI.PRIMARY, 0.3);
      bg.lineStyle(2, GameConfig.UI.PRIMARY, 1);
      bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 8);
      bg.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 8);
    });
    hitArea.on('pointerdown', () => {
      this.scene.start('GameScene', { mode: 'level', levelId: level.id });
    });
  }
}
