/**
 * StatsScene - Display player statistics with scrollable sections
 * Follows AchievementScene pattern: back button, title, scrollable content with mask.
 */
class StatsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StatsScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Header - fixed at top
    this.add.text(width / 2, 50, 'STATISTICS', {
      fontSize: '32px', fontFamily: GameConfig.FONTS.DISPLAY, fontStyle: '800', color: '#ffffff'
    }).setOrigin(0.5).setDepth(100);

    // Back button
    this.add.text(20, 20, '< BACK', {
      fontSize: '18px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#5a9fd4'
    }).setInteractive().on('pointerdown', () => this.scene.start('MenuScene')).setDepth(100);

    this.createScrollableContent();
  }

  createScrollableContent() {
    const { width, height } = this.cameras.main;
    const startY = 90;
    const visibleHeight = height - startY - 10;
    const contentWidth = Math.min(width - 40, 440);
    const leftX = (width - contentWidth) / 2;

    // Scrollable container
    this.scrollContainer = this.add.container(0, 0);

    let y = startY + 10;

    // Gather all stats
    const stats = achievementManager.stats;
    const dailyStats = dailyChallengeManager.getStats();
    const achievements = achievementManager.getAllAchievements();
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    // ---- GAMEPLAY ----
    y = this.addSectionHeader(y, 'Gameplay', GameConfig.UI.PRIMARY);
    y = this.addStatRow(y, leftX, contentWidth, 'Games Played', stats.gamesPlayed);
    y = this.addStatRow(y, leftX, contentWidth, 'Highest Score', stats.highestScore);
    y = this.addStatRow(y, leftX, contentWidth, 'Highest Tile', stats.highestTile || '-');
    y = this.addStatRow(y, leftX, contentWidth, 'Levels Completed', stats.levelsCompleted);
    y = this.addStatRow(y, leftX, contentWidth, 'Modes Tried', stats.modesPlayed.length);
    y += 10;

    // ---- HIGH SCORES ----
    y = this.addSectionHeader(y, 'High Scores', GameConfig.UI.WARNING);
    y = this.addStatRow(y, leftX, contentWidth, 'Original', highScoreManager.getHighScore('original') || '-');
    y = this.addStatRow(y, leftX, contentWidth, 'Crazy', highScoreManager.getHighScore('crazy') || '-');
    y = this.addStatRow(y, leftX, contentWidth, 'Endless', highScoreManager.getHighScore('endless') || '-');
    y += 10;

    // ---- SPECIAL TILES ----
    y = this.addSectionHeader(y, 'Special Tiles', GameConfig.COLORS.AUTO_SWAPPER);
    y = this.addStatRow(y, leftX, contentWidth, 'Glass Broken', stats.glassBroken);
    y = this.addStatRow(y, leftX, contentWidth, 'Lead Cleared', stats.leadCleared);
    y = this.addStatRow(y, leftX, contentWidth, 'Bombs Exploded', stats.bombsExploded);
    y += 10;

    // ---- POWER-UPS ----
    y = this.addSectionHeader(y, 'Power-Ups', GameConfig.UI.FRENZY);
    y = this.addStatRow(y, leftX, contentWidth, 'Frenzy Activations', stats.frenzyCount);
    y += 10;

    // ---- DAILY CHALLENGES ----
    y = this.addSectionHeader(y, 'Daily Challenges', GameConfig.UI.SUCCESS);
    y = this.addStatRow(y, leftX, contentWidth, 'Completed', dailyStats.totalCompleted);
    y = this.addStatRow(y, leftX, contentWidth, 'Current Streak', dailyStats.currentStreak);
    y = this.addStatRow(y, leftX, contentWidth, 'Longest Streak', dailyStats.longestStreak);
    y = this.addStatRow(y, leftX, contentWidth, 'Total Points', dailyStats.totalPoints);
    y += 10;

    // ---- ACHIEVEMENTS ----
    y = this.addSectionHeader(y, 'Achievements', 0xf5a623);
    y = this.addStatRow(y, leftX, contentWidth, 'Unlocked', `${unlockedCount} / ${achievements.length}`);
    y += 20;

    const totalContentHeight = y - startY;

    // Mask for scroll area
    const maskGraphics = this.make.graphics();
    maskGraphics.fillStyle(0xffffff);
    maskGraphics.fillRect(0, startY, width, visibleHeight);
    this.scrollContainer.setMask(maskGraphics.createGeometryMask());

    // Scroll state
    this.scrollY = 0;
    this.minScrollY = Math.min(0, visibleHeight - totalContentHeight);
    this.maxScrollY = 0;

    // Scroll input
    this.setupScrollInput(width, height, startY, visibleHeight, totalContentHeight);
  }

  addSectionHeader(y, text, color) {
    const { width } = this.cameras.main;
    const colorValue = typeof color === 'number' ? color : color;

    const header = this.add.text(width / 2, y, text, {
      fontSize: '16px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#ffffff'
    }).setOrigin(0.5);
    this.scrollContainer.add(header);

    const lineWidth = header.width + 30;
    const line = this.add.graphics();
    line.lineStyle(2, colorValue, 0.5);
    line.lineBetween(width / 2 - lineWidth / 2, y + 14, width / 2 + lineWidth / 2, y + 14);
    this.scrollContainer.add(line);

    return y + 30;
  }

  addStatRow(y, leftX, contentWidth, label, value) {
    const labelText = this.add.text(leftX + 10, y, label, {
      fontSize: '14px', fontFamily: GameConfig.FONTS.UI, fontStyle: '600', color: '#bbbbbb'
    }).setOrigin(0, 0.5);
    this.scrollContainer.add(labelText);

    const valueText = this.add.text(leftX + contentWidth - 10, y, String(value), {
      fontSize: '14px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: '#ffffff'
    }).setOrigin(1, 0.5);
    this.scrollContainer.add(valueText);

    return y + 28;
  }

  setupScrollInput(width, height, startY, visibleHeight, totalContentHeight) {
    const scrollZone = this.add.rectangle(width / 2, startY + visibleHeight / 2, width, visibleHeight, 0x000000, 0);
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
      this.scrollY = Phaser.Math.Clamp(scrollStartY + deltaY, this.minScrollY, this.maxScrollY);
      this.scrollContainer.y = this.scrollY;
      this.updateScrollIndicators();
    });

    scrollZone.on('pointerup', () => { isDragging = false; });
    scrollZone.on('pointerout', () => { isDragging = false; });

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      this.scrollY = Phaser.Math.Clamp(this.scrollY - deltaY * 0.5, this.minScrollY, this.maxScrollY);
      this.scrollContainer.y = this.scrollY;
      this.updateScrollIndicators();
    });

    // Scroll indicators
    if (totalContentHeight > visibleHeight) {
      this.upArrow = this.add.text(width / 2, startY + 8, '▲', {
        fontSize: '18px', fontFamily: GameConfig.FONTS.UI, color: '#5a9fd4'
      }).setOrigin(0.5).setAlpha(0).setDepth(101);

      this.downArrow = this.add.text(width / 2, startY + visibleHeight - 8, '▼', {
        fontSize: '18px', fontFamily: GameConfig.FONTS.UI, color: '#5a9fd4'
      }).setOrigin(0.5).setAlpha(1).setDepth(101);

      // Scroll bar
      this.trackX = width - 10;
      this.trackHeight = visibleHeight - 20;
      this.trackStartY = startY + 10;
      const thumbHeight = Math.max(30, (visibleHeight / totalContentHeight) * this.trackHeight);
      this.thumbHeight = thumbHeight;

      const track = this.add.graphics();
      track.fillStyle(0x333333, 0.4);
      track.fillRoundedRect(this.trackX - 2, this.trackStartY, 4, this.trackHeight, 2);
      track.setDepth(100);

      this.scrollThumb = this.add.graphics();
      this.scrollThumb.fillStyle(0x5a9fd4, 0.7);
      this.scrollThumb.fillRoundedRect(this.trackX - 2, this.trackStartY, 4, thumbHeight, 2);
      this.scrollThumb.setDepth(100);
    }
  }

  updateScrollIndicators() {
    if (!this.upArrow) return;
    this.upArrow.setAlpha(this.scrollY < this.maxScrollY ? 1 : 0);
    this.downArrow.setAlpha(this.scrollY > this.minScrollY ? 1 : 0);

    if (this.scrollThumb && this.minScrollY < 0) {
      const pct = this.scrollY / this.minScrollY;
      const thumbY = this.trackStartY + pct * (this.trackHeight - this.thumbHeight);
      this.scrollThumb.clear();
      this.scrollThumb.fillStyle(0x5a9fd4, 0.7);
      this.scrollThumb.fillRoundedRect(this.trackX - 2, thumbY, 4, this.thumbHeight, 2);
    }
  }
}
