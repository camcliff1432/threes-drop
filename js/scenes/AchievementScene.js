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

    // Header area - fixed at top with depth to stay above scroll content
    const headerY = 50;

    // Title
    this.add.text(width / 2, headerY, 'ACHIEVEMENTS', {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5).setDepth(100);

    // Back button
    this.add.text(20, 20, '< BACK', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setInteractive().on('pointerdown', () => this.scene.start('MenuScene')).setDepth(100);

    // Load achievements from AchievementManager
    this.achievements = achievementManager.getAllAchievements();

    // Count stats
    const unlockedCount = this.achievements.filter(a => a.unlocked).length;
    const totalCount = this.achievements.length;

    // Progress text
    this.add.text(width / 2, headerY + 35, `${unlockedCount} / ${totalCount} Unlocked`, {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#888888'
    }).setOrigin(0.5).setDepth(100);

    // Create scrollable achievement list
    this.createScrollableList();
  }

  createScrollableList() {
    const { width, height } = this.cameras.main;
    const startY = 120; // Start below header area
    const itemHeight = 70;
    const itemWidth = Math.min(width - 40, 460); // Cap width for very wide screens
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
    }).setOrigin(0.5).setAlpha(0).setDepth(101);

    // Down arrow indicator
    this.downArrow = this.add.text(width / 2, startY + visibleHeight - 10, '▼', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#4a90e2'
    }).setOrigin(0.5).setAlpha(1).setDepth(101);

    // Scroll bar track
    this.trackX = width - 12;
    const trackHeight = visibleHeight - 20;
    this.scrollTrack = this.add.graphics();
    this.scrollTrack.fillStyle(0x333333, 0.5);
    this.scrollTrack.fillRoundedRect(this.trackX - 3, startY + 10, 6, trackHeight, 3);
    this.scrollTrack.setDepth(100);

    // Scroll bar thumb
    const thumbHeight = Math.max(30, (visibleHeight / (this.achievements.length * 70)) * trackHeight);
    this.scrollThumb = this.add.graphics();
    this.scrollThumb.fillStyle(0x4a90e2, 0.8);
    this.scrollThumb.fillRoundedRect(this.trackX - 3, startY + 10, 6, thumbHeight, 3);
    this.scrollThumb.setDepth(100);
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
        this.trackX - 3,
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
