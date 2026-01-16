/**
 * LeaderboardScene - Display high scores for each game mode
 */
class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title
    this.add.text(width / 2, 50, 'LEADERBOARD', {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Back button
    this.add.text(20, 20, '< BACK', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setInteractive().on('pointerdown', () => this.scene.start('MenuScene'));

    // Tab buttons
    this.modes = ['original', 'crazy', 'endless'];
    this.modeLabels = ['ORIGINAL', 'CRAZY', 'ENDLESS'];
    this.currentTab = 0;
    this.tabButtons = [];

    const tabY = 100;
    const tabWidth = (width - 40) / 3;

    this.modes.forEach((mode, i) => {
      const x = 20 + tabWidth / 2 + i * tabWidth;
      const tab = this.createTab(x, tabY, this.modeLabels[i], i);
      this.tabButtons.push(tab);
    });

    // Score display area
    this.scoreContainer = this.add.container(0, 0);
    this.updateScoreDisplay();
  }

  createTab(x, y, label, index) {
    const tabWidth = 100;
    const tabHeight = 35;

    const bg = this.add.graphics();
    const text = this.add.text(x, y, label, {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(x, y, tabWidth, tabHeight, 0x000000, 0).setInteractive();

    hitArea.on('pointerdown', () => {
      this.currentTab = index;
      this.updateTabs();
      this.updateScoreDisplay();
    });

    const tab = { bg, text, hitArea, index };
    this.drawTab(tab, index === this.currentTab);
    return tab;
  }

  drawTab(tab, active) {
    const x = tab.text.x;
    const y = tab.text.y;
    const tabWidth = 100;
    const tabHeight = 35;

    tab.bg.clear();
    if (active) {
      tab.bg.fillStyle(GameConfig.UI.PRIMARY, 0.6);
      tab.bg.lineStyle(2, GameConfig.UI.PRIMARY, 1);
    } else {
      tab.bg.fillStyle(0x333333, 0.3);
      tab.bg.lineStyle(1, 0x555555, 0.5);
    }
    tab.bg.fillRoundedRect(x - tabWidth / 2, y - tabHeight / 2, tabWidth, tabHeight, 6);
    tab.bg.strokeRoundedRect(x - tabWidth / 2, y - tabHeight / 2, tabWidth, tabHeight, 6);
  }

  updateTabs() {
    this.tabButtons.forEach((tab, i) => {
      this.drawTab(tab, i === this.currentTab);
    });
  }

  updateScoreDisplay() {
    const { width, height } = this.cameras.main;

    // Clear previous content
    this.scoreContainer.removeAll(true);

    const mode = this.modes[this.currentTab];
    const highScore = highScoreManager.getHighScore(mode);

    const startY = 160;

    // Trophy icon
    const trophy = this.add.text(width / 2, startY + 30, '🏆', {
      fontSize: '48px'
    }).setOrigin(0.5);
    this.scoreContainer.add(trophy);

    // High score
    if (highScore > 0) {
      const scoreText = this.add.text(width / 2, startY + 100, highScore.toString(), {
        fontSize: '64px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#f5a623'
      }).setOrigin(0.5);
      this.scoreContainer.add(scoreText);

      const label = this.add.text(width / 2, startY + 150, 'PERSONAL BEST', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
      }).setOrigin(0.5);
      this.scoreContainer.add(label);
    } else {
      const noScore = this.add.text(width / 2, startY + 100, 'No score yet', {
        fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#666666'
      }).setOrigin(0.5);
      this.scoreContainer.add(noScore);

      const hint = this.add.text(width / 2, startY + 140, `Play ${this.modeLabels[this.currentTab]} mode\nto set a high score!`, {
        fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa',
        align: 'center', lineSpacing: 4
      }).setOrigin(0.5);
      this.scoreContainer.add(hint);
    }

    // Play button
    const playBtn = UIHelpers.createButton(this, width / 2, startY + 230, 'PLAY NOW', () => {
      this.scene.start('GameScene', { mode });
    }, { width: 160, height: 45, fontSize: '18px' });
    // Note: button is added to scene, not container - that's fine for this use case
  }
}
