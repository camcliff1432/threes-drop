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

    // Menu buttons with high scores for game modes
    const buttonY = 350, spacing = 70;

    // Original mode button with high score
    this.createModeButton(width / 2, buttonY, 'ORIGINAL', 'original');

    // Crazy mode button with high score
    this.createModeButton(width / 2, buttonY + spacing, 'CRAZY MODE', 'crazy');

    // Levels and How to Play buttons
    UIHelpers.createButton(this, width / 2, buttonY + spacing * 2, 'LEVELS', () => {
      this.scene.start('LevelSelectScene');
    });
    UIHelpers.createButton(this, width / 2, buttonY + spacing * 3, 'HOW TO PLAY', () => {
      UIHelpers.showHowToPlay(this);
    });
  }

  createModeButton(x, y, text, mode) {
    const bw = 220, bh = 60;
    const highScore = highScoreManager.getHighScore(mode);

    const bg = this.add.graphics();
    bg.fillStyle(GameConfig.UI.PRIMARY, 0.3);
    bg.lineStyle(2, GameConfig.UI.PRIMARY, 1);
    bg.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 10);
    bg.strokeRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 10);

    // Main label
    const label = this.add.text(x, y - 8, text, {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // High score text
    const scoreText = highScore > 0 ? `Best: ${highScore}` : 'No score yet';
    const scoreLabel = this.add.text(x, y + 14, scoreText, {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', color: highScore > 0 ? '#f5a623' : '#666666'
    }).setOrigin(0.5);

    // Hit area
    const hitArea = this.add.rectangle(x, y, bw, bh, 0x000000, 0).setInteractive();

    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(GameConfig.UI.PRIMARY, 0.6);
      bg.lineStyle(2, GameConfig.UI.PRIMARY_LIGHT, 1);
      bg.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 10);
      bg.strokeRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 10);
    });

    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(GameConfig.UI.PRIMARY, 0.3);
      bg.lineStyle(2, GameConfig.UI.PRIMARY, 1);
      bg.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 10);
      bg.strokeRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 10);
    });

    hitArea.on('pointerdown', () => {
      this.scene.start('GameScene', { mode });
    });

    return { bg, label, scoreLabel, hitArea };
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
