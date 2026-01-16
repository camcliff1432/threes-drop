/**
 * AchievementScene - Display achievement badges and milestones with scrolling
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
      // Tile milestones
      { id: 'first_3', name: 'First Steps', description: 'Create your first 3 tile', icon: '3', category: 'tiles', unlocked: true },
      { id: 'first_6', name: 'Double Trouble', description: 'Create a 6 tile', icon: '6', category: 'tiles', unlocked: true },
      { id: 'first_12', name: 'Getting Warmer', description: 'Create a 12 tile', icon: '12', category: 'tiles', unlocked: false },
      { id: 'first_24', name: 'Two Dozen', description: 'Create a 24 tile', icon: '24', category: 'tiles', unlocked: false },
      { id: 'first_48', name: 'Power Player', description: 'Create a 48 tile', icon: '48', category: 'tiles', unlocked: false },
      { id: 'first_96', name: 'Nearly There', description: 'Create a 96 tile', icon: '96', category: 'tiles', unlocked: false },
      { id: 'first_192', name: 'Master Merger', description: 'Create a 192 tile', icon: '192', category: 'tiles', unlocked: false },
      { id: 'first_384', name: 'Elite Status', description: 'Create a 384 tile', icon: '384', category: 'tiles', unlocked: false },
      { id: 'first_768', name: 'Legendary', description: 'Create a 768 tile', icon: '768', category: 'tiles', unlocked: false },

      // Score milestones
      { id: 'score_100', name: 'Century', description: 'Score 100 points in one game', icon: '100', category: 'score', unlocked: true },
      { id: 'score_500', name: 'High Roller', description: 'Score 500 points in one game', icon: '500', category: 'score', unlocked: false },
      { id: 'score_1000', name: 'Thousand Club', description: 'Score 1,000 points in one game', icon: '1K', category: 'score', unlocked: false },
      { id: 'score_2500', name: 'Score Master', description: 'Score 2,500 points in one game', icon: '2.5K', category: 'score', unlocked: false },
      { id: 'score_5000', name: 'Point Perfectionist', description: 'Score 5,000 points in one game', icon: '5K', category: 'score', unlocked: false },
      { id: 'score_10000', name: 'Score Legend', description: 'Score 10,000 points in one game', icon: '10K', category: 'score', unlocked: false },

      // Frenzy achievements
      { id: 'frenzy_1', name: 'First Frenzy', description: 'Activate frenzy mode for the first time', icon: 'F', category: 'frenzy', unlocked: false },
      { id: 'frenzy_5', name: 'Frenzy Fan', description: 'Activate frenzy 5 times total', icon: 'F5', category: 'frenzy', unlocked: false },
      { id: 'frenzy_10', name: 'Frenzy Master', description: 'Activate frenzy 10 times total', icon: 'F10', category: 'frenzy', unlocked: false },
      { id: 'frenzy_25', name: 'Frenzy Fanatic', description: 'Activate frenzy 25 times total', icon: 'F25', category: 'frenzy', unlocked: false },

      // Combo achievements
      { id: 'combo_3', name: 'Combo Starter', description: 'Get a 3x combo', icon: 'x3', category: 'combo', unlocked: false },
      { id: 'combo_5', name: 'Combo King', description: 'Get a 5x combo', icon: 'x5', category: 'combo', unlocked: false },
      { id: 'combo_10', name: 'Combo Master', description: 'Get a 10x combo', icon: 'x10', category: 'combo', unlocked: false },
      { id: 'combo_15', name: 'Chain Reaction', description: 'Get a 15x combo', icon: 'x15', category: 'combo', unlocked: false },

      // Special tile achievements
      { id: 'glass_5', name: 'Glass Breaker', description: 'Break 5 glass tiles', icon: 'G5', category: 'special', unlocked: false },
      { id: 'glass_25', name: 'Glass Smasher', description: 'Break 25 glass tiles', icon: 'G25', category: 'special', unlocked: false },
      { id: 'glass_100', name: 'Glass Annihilator', description: 'Break 100 glass tiles', icon: 'G!', category: 'special', unlocked: false },
      { id: 'lead_5', name: 'Lead Survivor', description: 'Clear 5 lead tiles', icon: 'L5', category: 'special', unlocked: false },
      { id: 'lead_25', name: 'Lead Eliminator', description: 'Clear 25 lead tiles', icon: 'L25', category: 'special', unlocked: false },
      { id: 'steel_survive', name: 'Steel Patience', description: 'Wait out 10 steel plates', icon: 'S', category: 'special', unlocked: false },

      // Bomb achievements
      { id: 'bomb_1', name: 'First Boom', description: 'Detonate your first bomb', icon: 'B1', category: 'bomb', unlocked: false },
      { id: 'bomb_5', name: 'Bomb Squad', description: 'Detonate 5 bombs', icon: 'B5', category: 'bomb', unlocked: false },
      { id: 'bomb_25', name: 'Demolition Expert', description: 'Detonate 25 bombs', icon: 'B25', category: 'bomb', unlocked: false },
      { id: 'bomb_chain', name: 'Chain Explosion', description: 'Trigger a bomb chain reaction', icon: 'BB', category: 'bomb', unlocked: false },

      // Auto-swapper achievements
      { id: 'swap_survive', name: 'Roll With It', description: 'Let an auto-swapper expire naturally', icon: 'SW', category: 'special', unlocked: false },
      { id: 'swap_merge', name: 'Swap & Merge', description: 'Merge an auto-swapper tile', icon: 'SM', category: 'special', unlocked: false },

      // Power-up achievements
      { id: 'swipe_10', name: 'Swipe Beginner', description: 'Use swipe power-up 10 times', icon: 'S10', category: 'powerup', unlocked: false },
      { id: 'swipe_50', name: 'Swipe Expert', description: 'Use swipe power-up 50 times', icon: 'S50', category: 'powerup', unlocked: false },
      { id: 'swapper_10', name: 'Tile Shuffler', description: 'Use swapper power-up 10 times', icon: 'T10', category: 'powerup', unlocked: false },
      { id: 'merger_10', name: 'Force Merger', description: 'Use merger power-up 10 times', icon: 'M10', category: 'powerup', unlocked: false },
      { id: 'wildcard_5', name: 'Wild Child', description: 'Use wildcard power-up 5 times', icon: 'W5', category: 'powerup', unlocked: false },
      { id: 'wildcard_25', name: 'Wild Master', description: 'Use wildcard power-up 25 times', icon: 'W25', category: 'powerup', unlocked: false },

      // Game mode achievements
      { id: 'original_play', name: 'Classicist', description: 'Complete a game in Original mode', icon: 'O', category: 'mode', unlocked: false },
      { id: 'crazy_play', name: 'Going Crazy', description: 'Complete a game in Crazy mode', icon: 'C', category: 'mode', unlocked: false },
      { id: 'endless_play', name: 'Endless Journey', description: 'Play Endless mode', icon: 'E', category: 'mode', unlocked: false },
      { id: 'all_modes', name: 'Mode Master', description: 'Play all three game modes', icon: 'ALL', category: 'mode', unlocked: false },

      // Tutorial achievements
      { id: 'tutorial_1', name: 'Student', description: 'Complete your first tutorial', icon: 'T1', category: 'tutorial', unlocked: false },
      { id: 'tutorial_10', name: 'Quick Learner', description: 'Complete 10 tutorials', icon: 'T10', category: 'tutorial', unlocked: false },
      { id: 'tutorial_complete', name: 'Graduate', description: 'Complete all tutorials', icon: 'TG', category: 'tutorial', unlocked: false },

      // Misc achievements
      { id: 'games_10', name: 'Regular Player', description: 'Play 10 games', icon: '10', category: 'misc', unlocked: false },
      { id: 'games_50', name: 'Dedicated', description: 'Play 50 games', icon: '50', category: 'misc', unlocked: false },
      { id: 'games_100', name: 'Threes Addict', description: 'Play 100 games', icon: '!', category: 'misc', unlocked: false },
      { id: 'close_call', name: 'Close Call', description: 'Win with only one empty space left', icon: 'CC', category: 'misc', unlocked: false },
      { id: 'perfect_start', name: 'Perfect Start', description: 'Create a 12 in first 10 moves', icon: 'PS', category: 'misc', unlocked: false },
      { id: 'no_powerup', name: 'Purist', description: 'Reach 500 points without power-ups', icon: 'NP', category: 'misc', unlocked: false }
    ];

    // Count stats
    const unlockedCount = this.achievements.filter(a => a.unlocked).length;
    const totalCount = this.achievements.length;

    // Progress text
    this.add.text(width / 2, 85, `${unlockedCount} / ${totalCount} Unlocked`, {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#888888'
    }).setOrigin(0.5);

    // Create scrollable achievement list
    this.createScrollableList();
  }

  createScrollableList() {
    const { width, height } = this.cameras.main;
    const startY = 110;
    const itemHeight = 70;
    const itemWidth = width - 40;
    const visibleHeight = height - startY - 20;

    // Calculate total content height
    const totalHeight = this.achievements.length * itemHeight;

    // Create a container for all achievement items
    this.scrollContainer = this.add.container(0, 0);

    // Create achievement items inside container
    this.achievements.forEach((achievement, index) => {
      const y = startY + index * itemHeight;
      this.createAchievementItem(width / 2, y, achievement, itemWidth, this.scrollContainer);
    });

    // Set up scrolling bounds
    this.scrollY = 0;
    this.minScrollY = Math.min(0, visibleHeight - totalHeight - startY);
    this.maxScrollY = 0;
    this.scrollStartY = startY;
    this.visibleHeight = visibleHeight;

    // Create mask for scrolling area
    const maskGraphics = this.make.graphics();
    maskGraphics.fillStyle(0xffffff);
    maskGraphics.fillRect(0, startY, width, visibleHeight);
    const mask = maskGraphics.createGeometryMask();
    this.scrollContainer.setMask(mask);

    // Set up scroll input
    this.setupScrollInput();

    // Add scroll indicators if content overflows
    if (totalHeight > visibleHeight) {
      this.createScrollIndicators(width, startY, visibleHeight);
    }
  }

  setupScrollInput() {
    const { width, height } = this.cameras.main;

    // Create interactive zone for scrolling
    const scrollZone = this.add.rectangle(width / 2, height / 2 + 45, width, height - 110, 0x000000, 0);
    scrollZone.setInteractive();

    let isDragging = false;
    let dragStartY = 0;
    let scrollStartY = 0;

    scrollZone.on('pointerdown', (pointer) => {
      isDragging = true;
      dragStartY = pointer.y;
      scrollStartY = this.scrollY;
    });

    scrollZone.on('pointermove', (pointer) => {
      if (!isDragging) return;

      const deltaY = pointer.y - dragStartY;
      this.scrollY = Phaser.Math.Clamp(
        scrollStartY + deltaY,
        this.minScrollY,
        this.maxScrollY
      );
      this.scrollContainer.y = this.scrollY;
      this.updateScrollIndicators();
    });

    scrollZone.on('pointerup', () => {
      isDragging = false;
    });

    scrollZone.on('pointerout', () => {
      isDragging = false;
    });

    // Mouse wheel support
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      this.scrollY = Phaser.Math.Clamp(
        this.scrollY - deltaY * 0.5,
        this.minScrollY,
        this.maxScrollY
      );
      this.scrollContainer.y = this.scrollY;
      this.updateScrollIndicators();
    });
  }

  createScrollIndicators(width, startY, visibleHeight) {
    // Up arrow indicator
    this.upArrow = this.add.text(width / 2, startY + 10, '▲', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#4a90e2'
    }).setOrigin(0.5).setAlpha(0);

    // Down arrow indicator
    this.downArrow = this.add.text(width / 2, startY + visibleHeight - 10, '▼', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#4a90e2'
    }).setOrigin(0.5).setAlpha(1);

    // Scroll bar track
    const trackX = width - 12;
    const trackHeight = visibleHeight - 20;
    this.scrollTrack = this.add.graphics();
    this.scrollTrack.fillStyle(0x333333, 0.5);
    this.scrollTrack.fillRoundedRect(trackX - 3, startY + 10, 6, trackHeight, 3);

    // Scroll bar thumb
    const thumbHeight = Math.max(30, (visibleHeight / (this.achievements.length * 70)) * trackHeight);
    this.scrollThumb = this.add.graphics();
    this.scrollThumb.fillStyle(0x4a90e2, 0.8);
    this.scrollThumb.fillRoundedRect(trackX - 3, startY + 10, 6, thumbHeight, 3);
    this.thumbHeight = thumbHeight;
    this.trackHeight = trackHeight;
    this.trackStartY = startY + 10;
  }

  updateScrollIndicators() {
    if (!this.upArrow) return;

    // Update arrow visibility
    this.upArrow.setAlpha(this.scrollY < this.maxScrollY ? 1 : 0);
    this.downArrow.setAlpha(this.scrollY > this.minScrollY ? 1 : 0);

    // Update scroll thumb position
    if (this.scrollThumb && this.minScrollY < 0) {
      const scrollPercent = this.scrollY / this.minScrollY;
      const thumbY = this.trackStartY + scrollPercent * (this.trackHeight - this.thumbHeight);

      this.scrollThumb.clear();
      this.scrollThumb.fillStyle(0x4a90e2, 0.8);
      this.scrollThumb.fillRoundedRect(
        this.cameras.main.width - 15,
        thumbY,
        6,
        this.thumbHeight,
        3
      );
    }
  }

  createAchievementItem(x, y, achievement, itemWidth, container) {
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
    container.add(bg);

    // Icon background
    const iconX = x - itemWidth / 2 + 35;
    const iconBg = this.add.graphics();
    iconBg.fillStyle(achievement.unlocked ? 0xf5a623 : 0x444444, achievement.unlocked ? 0.8 : 0.5);
    iconBg.fillCircle(iconX, y, 22);
    container.add(iconBg);

    // Icon text
    const iconText = this.add.text(iconX, y, achievement.icon, {
      fontSize: achievement.icon.length > 2 ? '12px' : '16px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: achievement.unlocked ? '#ffffff' : '#888888'
    }).setOrigin(0.5);
    container.add(iconText);

    // Name
    const nameX = x - itemWidth / 2 + 75;
    const name = this.add.text(nameX, y - 10, achievement.name, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: achievement.unlocked ? '#ffffff' : '#888888'
    }).setOrigin(0, 0.5);
    container.add(name);

    // Description
    const desc = this.add.text(nameX, y + 10, achievement.description, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: achievement.unlocked ? '#aaaaaa' : '#666666'
    }).setOrigin(0, 0.5);
    container.add(desc);

    // Status icon (lock or check)
    if (!achievement.unlocked) {
      const lockIcon = this.add.text(x + itemWidth / 2 - 25, y, '🔒', {
        fontSize: '20px'
      }).setOrigin(0.5);
      container.add(lockIcon);
    } else {
      const checkIcon = this.add.text(x + itemWidth / 2 - 25, y, '✓', {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        color: '#7ed321'
      }).setOrigin(0.5);
      container.add(checkIcon);
    }
  }
}
