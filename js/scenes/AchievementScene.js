/**
 * AchievementScene - Display achievement badges and milestones
 */
class AchievementScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AchievementScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title
    this.add.text(width / 2, 50, 'ACHIEVEMENTS', {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Back button
    this.add.text(20, 20, '< BACK', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setInteractive().on('pointerdown', () => this.scene.start('MenuScene'));

    // Achievement definitions (placeholder - will be managed by AchievementManager later)
    this.achievements = [
      { id: 'first_3', name: 'First Steps', description: 'Create your first 3 tile', icon: '3', unlocked: true },
      { id: 'first_12', name: 'Getting Warmer', description: 'Create a 12 tile', icon: '12', unlocked: false },
      { id: 'first_48', name: 'Power Player', description: 'Create a 48 tile', icon: '48', unlocked: false },
      { id: 'first_192', name: 'Master Merger', description: 'Create a 192 tile', icon: '192', unlocked: false },
      { id: 'score_100', name: 'Century', description: 'Score 100 points', icon: '💯', unlocked: true },
      { id: 'score_500', name: 'High Roller', description: 'Score 500 points', icon: '🎯', unlocked: false },
      { id: 'frenzy_1', name: 'First Frenzy', description: 'Activate frenzy mode', icon: '🔥', unlocked: false },
      { id: 'frenzy_10', name: 'Frenzy Master', description: 'Activate frenzy 10 times', icon: '⚡', unlocked: false },
      { id: 'combo_5', name: 'Combo King', description: 'Get a 5x combo', icon: '🌟', unlocked: false },
      { id: 'glass_10', name: 'Glass Smasher', description: 'Break 10 glass tiles', icon: '💎', unlocked: false },
      { id: 'bomb_5', name: 'Bomb Squad', description: 'Detonate 5 bombs', icon: '💣', unlocked: false },
      { id: 'tutorial_complete', name: 'Graduate', description: 'Complete all tutorials', icon: '🎓', unlocked: false }
    ];

    // Create scrollable achievement list
    this.createAchievementList();
  }

  createAchievementList() {
    const { width, height } = this.cameras.main;
    const startY = 100;
    const itemHeight = 70;
    const itemWidth = width - 40;

    this.achievements.forEach((achievement, index) => {
      const y = startY + index * itemHeight;
      this.createAchievementItem(width / 2, y, achievement, itemWidth);
    });
  }

  createAchievementItem(x, y, achievement, itemWidth) {
    const itemHeight = 60;

    // Background
    const bg = this.add.graphics();
    const bgColor = achievement.unlocked ? 0x4a90e2 : 0x333333;
    const bgAlpha = achievement.unlocked ? 0.3 : 0.2;
    const borderColor = achievement.unlocked ? 0x4a90e2 : 0x555555;

    bg.fillStyle(bgColor, bgAlpha);
    bg.lineStyle(2, borderColor, 0.6);
    bg.fillRoundedRect(x - itemWidth / 2, y - itemHeight / 2, itemWidth, itemHeight, 8);
    bg.strokeRoundedRect(x - itemWidth / 2, y - itemHeight / 2, itemWidth, itemHeight, 8);

    // Icon
    const iconX = x - itemWidth / 2 + 35;
    const iconBg = this.add.graphics();
    iconBg.fillStyle(achievement.unlocked ? 0xf5a623 : 0x444444, achievement.unlocked ? 0.8 : 0.5);
    iconBg.fillCircle(iconX, y, 22);

    const iconText = this.add.text(iconX, y, achievement.icon, {
      fontSize: achievement.icon.length > 2 ? '14px' : '18px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: achievement.unlocked ? '#ffffff' : '#888888'
    }).setOrigin(0.5);

    // Name
    const nameX = x - itemWidth / 2 + 75;
    this.add.text(nameX, y - 10, achievement.name, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: achievement.unlocked ? '#ffffff' : '#888888'
    }).setOrigin(0, 0.5);

    // Description
    this.add.text(nameX, y + 10, achievement.description, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: achievement.unlocked ? '#aaaaaa' : '#666666'
    }).setOrigin(0, 0.5);

    // Locked overlay
    if (!achievement.unlocked) {
      const lockIcon = this.add.text(x + itemWidth / 2 - 25, y, '🔒', {
        fontSize: '20px'
      }).setOrigin(0.5);
    } else {
      const checkIcon = this.add.text(x + itemWidth / 2 - 25, y, '✓', {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        color: '#7ed321'
      }).setOrigin(0.5);
    }
  }
}
