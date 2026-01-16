/**
 * DailyChallengeScene - Shows today's daily challenge and player stats
 */
class DailyChallengeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DailyChallengeScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title
    this.add.text(width / 2, 40, 'DAILY CHALLENGE', {
      fontSize: '28px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Get today's challenge
    const challenge = dailyChallengeManager.generateChallenge();
    const stats = dailyChallengeManager.getStats();

    // Challenge card
    this.drawChallengeCard(width / 2, 180, challenge, stats.todayCompleted);

    // Stats section
    this.drawStatsSection(width / 2, height - 200, stats);

    // Play button (if not completed)
    if (!stats.todayCompleted) {
      this.createPlayButton(width / 2, height - 80, challenge);
    } else {
      this.add.text(width / 2, height - 80, 'COMPLETED TODAY!', {
        fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4ade80'
      }).setOrigin(0.5);
    }

    // Back button
    this.createBackButton(40, 40);

    // Navigation hint
    this.add.text(width / 2, height - 20, 'Swipe right to go back', {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#888888'
    }).setOrigin(0.5);

    this.setupSwipeNavigation();
  }

  drawChallengeCard(x, y, challenge, completed) {
    const cardWidth = 320;
    const cardHeight = 220;

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(completed ? 0x22c55e : 0x3b82f6, 0.2);
    bg.fillRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 15);
    bg.lineStyle(2, completed ? 0x22c55e : 0x3b82f6, 0.8);
    bg.strokeRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 15);

    // Difficulty badge
    const diffColors = { easy: '#4ade80', medium: '#fbbf24', hard: '#ef4444' };
    this.add.text(x, y - 85, challenge.difficulty.toUpperCase(), {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: diffColors[challenge.difficulty]
    }).setOrigin(0.5);

    // Icon
    this.add.text(x, y - 50, challenge.icon || '🎯', {
      fontSize: '36px'
    }).setOrigin(0.5);

    // Challenge name
    this.add.text(x, y - 5, challenge.name, {
      fontSize: '22px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Description
    this.add.text(x, y + 25, challenge.description, {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#cccccc',
      align: 'center', wordWrap: { width: cardWidth - 40 }
    }).setOrigin(0.5);

    // Target/details
    let detailText = '';
    if (challenge.target) {
      detailText = `Target: ${challenge.target}`;
    } else if (challenge.moveLimit) {
      detailText = `Moves: ${challenge.moveLimit}`;
    } else if (challenge.timeLimit) {
      detailText = `Time: ${Math.floor(challenge.timeLimit / 60)}:${String(challenge.timeLimit % 60).padStart(2, '0')}`;
    } else if (challenge.survivalMoves) {
      detailText = `Survive: ${challenge.survivalMoves} moves`;
    }

    this.add.text(x, y + 55, detailText, {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#60a5fa'
    }).setOrigin(0.5);

    // Modifier (if any)
    if (challenge.modifier && challenge.modifier.id !== 'none') {
      this.add.text(x, y + 80, `${challenge.modifier.name}: ${challenge.modifier.description}`, {
        fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#f59e0b'
      }).setOrigin(0.5);
    }

    // Rewards
    this.add.text(x, y + 100, `+${challenge.rewards.points} points`, {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#a78bfa'
    }).setOrigin(0.5);
  }

  drawStatsSection(x, y, stats) {
    const statWidth = 80;
    const spacing = 90;
    const startX = x - spacing * 1.5;

    const statItems = [
      { label: 'STREAK', value: stats.currentStreak, color: '#fbbf24' },
      { label: 'BEST', value: stats.longestStreak, color: '#f472b6' },
      { label: 'TOTAL', value: stats.totalCompleted, color: '#60a5fa' },
      { label: 'POINTS', value: stats.totalPoints, color: '#a78bfa' }
    ];

    statItems.forEach((stat, i) => {
      const sx = startX + i * spacing;

      // Stat value
      this.add.text(sx, y, stat.value.toString(), {
        fontSize: '28px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: stat.color
      }).setOrigin(0.5);

      // Stat label
      this.add.text(sx, y + 25, stat.label, {
        fontSize: '10px', fontFamily: 'Arial, sans-serif', color: '#888888'
      }).setOrigin(0.5);
    });
  }

  createPlayButton(x, y, challenge) {
    const btn = this.add.graphics();
    btn.fillStyle(0x22c55e, 1);
    btn.fillRoundedRect(x - 100, y - 25, 200, 50, 25);

    const text = this.add.text(x, y, 'PLAY CHALLENGE', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Make interactive
    const hitArea = this.add.rectangle(x, y, 200, 50, 0x000000, 0).setInteractive();

    hitArea.on('pointerover', () => {
      btn.clear();
      btn.fillStyle(0x16a34a, 1);
      btn.fillRoundedRect(x - 100, y - 25, 200, 50, 25);
    });

    hitArea.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(0x22c55e, 1);
      btn.fillRoundedRect(x - 100, y - 25, 200, 50, 25);
    });

    hitArea.on('pointerdown', () => {
      this.startChallenge(challenge);
    });
  }

  createBackButton(x, y) {
    const btn = this.add.text(x, y, '< BACK', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#60a5fa'
    }).setOrigin(0, 0.5).setInteractive();

    btn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  setupSwipeNavigation() {
    let startX = 0;

    this.input.on('pointerdown', (pointer) => {
      startX = pointer.x;
    });

    this.input.on('pointerup', (pointer) => {
      const deltaX = pointer.x - startX;
      if (deltaX > 80) {
        this.scene.start('MenuScene');
      }
    });
  }

  startChallenge(challenge) {
    // Pass challenge config to GameScene
    this.scene.start('GameScene', {
      mode: 'daily',
      dailyChallenge: challenge
    });
  }
}
