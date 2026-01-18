/**
 * MenuScene - Main menu with horizontal carousel for game modes
 */
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {
    // Video is loaded directly via HTML element in showUltraVideo
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title - clean, simple
    this.add.text(width / 2, 55, 'THREES', {
      fontSize: '56px', fontFamily: GameConfig.FONTS.DISPLAY, fontStyle: '800', color: '#ffffff'
    }).setOrigin(0.5);
    this.add.text(width / 2, 100, 'DROP', {
      fontSize: '56px', fontFamily: GameConfig.FONTS.DISPLAY, fontStyle: '800', color: '#66c3d5'
    }).setOrigin(0.5);

    // Game mode cards data
    // tiles can be numbers for regular tiles, or special types: 'steel', 'glass', 'lead', 'bomb', 'auto_swapper'
    const dailyStats = dailyChallengeManager.getStats();
    const dailyChallenge = dailyChallengeManager.generateChallenge();

    this.gameModes = [
      // === BIRTHDAY MODE START ===
      {
        mode: 'birthday',
        title: "DAD'S 65TH",
        subtitle: 'Birthday Special',
        description: 'Create a 65 tile!\n5+5=10, 20+40=60, 60+5=65',
        color: 0xFFD700,
        tiles: ['birthday_5', 'birthday_60', 'birthday_65']
      },
      // === BIRTHDAY MODE END ===
      {
        mode: 'daily',
        title: 'DAILY',
        subtitle: dailyStats.todayCompleted ? 'Completed!' : dailyChallenge.name,
        description: dailyStats.todayCompleted
          ? `Streak: ${dailyStats.currentStreak} days\nCome back tomorrow!`
          : `${dailyChallenge.description}\n${dailyChallenge.difficulty.toUpperCase()}`,
        color: dailyStats.todayCompleted ? 0x22c55e : 0xfbbf24,
        tiles: ['daily', 'daily', 'daily'],
        dailyStats: dailyStats
      },
      {
        mode: 'original',
        title: 'ORIGINAL',
        subtitle: 'Classic Mode',
        description: 'Swipe power-up only\nNo special tiles',
        color: 0x4a90e2,
        tiles: [1, 2, 3]
      },
      {
        mode: 'crazy',
        title: 'CRAZY',
        subtitle: 'Full Power',
        description: 'All power-ups unlocked\nSpecial tiles & Frenzy',
        color: 0xe24a4a,
        tiles: ['steel', 'glass', 'lead']
      },
      {
        mode: 'endless',
        title: 'ENDLESS',
        subtitle: 'Score Attack',
        description: 'Bombs explode for points\nAll features enabled',
        color: 0xff4444,
        tiles: ['bomb', 'auto_swapper', 'bomb']
      },
      {
        mode: 'levels',
        title: 'LEVELS',
        subtitle: 'Tutorial & Puzzles',
        description: 'Learn the mechanics\nProgress through challenges',
        color: 0x7ed321,
        tiles: [6, 12, 24]
      },
      {
        mode: 'ultra',
        title: 'ULTRA',
        subtitle: '??? MODE ???',
        description: 'Only for the brave\nAre you ready?',
        color: 0xff00ff,
        tiles: ['ultra', 'ultra', 'ultra']
      }
    ];

    // === BIRTHDAY MODE START ===
    // Carousel state - start on birthday mode (index 0)
    // Original: this.currentIndex = 1; // 'original' mode
    this.currentIndex = 0;
    // === BIRTHDAY MODE END ===
    this.cardWidth = 260;
    this.cardHeight = 280;
    this.cardGap = 20;
    this.carouselY = height * 0.42;

    // Create carousel container
    this.carouselContainer = this.add.container(0, 0);
    this.cards = [];

    // Create cards
    this.gameModes.forEach((mode, index) => {
      const card = this.createModeCard(mode, index);
      this.cards.push(card);
      this.carouselContainer.add(card.container);
    });

    // Navigation arrows
    this.createArrows();

    // Dot indicators
    this.createDots();

    // Play button
    this.createPlayButton();

    // Menu buttons below carousel
    this.createMenuButtons();

    // Initial positioning
    this.updateCarousel(false);

    // Enable drag on cards
    this.setupDragNavigation();
  }

  createModeCard(modeData, index) {
    const { width } = this.cameras.main;
    const container = this.add.container(0, this.carouselY);

    // Card background - clean white/light style
    const bg = this.add.graphics();
    bg.fillStyle(0xf8f8f8, 1);
    bg.fillRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, this.cardHeight, 12);
    container.add(bg);

    // Colored header band
    const headerBand = this.add.graphics();
    headerBand.fillStyle(modeData.color, 1);
    headerBand.fillRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, 65, { tl: 12, tr: 12, bl: 0, br: 0 });
    container.add(headerBand);

    // Mode title
    const title = this.add.text(0, -this.cardHeight / 2 + 26, modeData.title, {
      fontSize: '32px', fontFamily: GameConfig.FONTS.DISPLAY, fontStyle: '800', color: '#ffffff'
    }).setOrigin(0.5);
    container.add(title);

    // Subtitle
    const subtitle = this.add.text(0, -this.cardHeight / 2 + 52, modeData.subtitle, {
      fontSize: '12px', fontFamily: GameConfig.FONTS.UI, fontStyle: '600', color: '#ffffff'
    }).setOrigin(0.5).setAlpha(0.9);
    container.add(subtitle);

    // Decorative tiles - clean, flat style
    const tileY = -this.cardHeight / 2 + 115;
    modeData.tiles.forEach((val, i) => {
      const tileX = (i - 1) * 55;
      const tileBg = this.add.graphics();
      const tileSize = 44;
      const halfSize = tileSize / 2;
      const radius = 6;

      // Helper to draw clean flat tile
      const drawTileBase = (color) => {
        tileBg.fillStyle(color, 1);
        tileBg.fillRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, radius);
      };

      if (typeof val === 'string') {
        // Special tile types
        switch (val) {
          case 'steel':
            drawTileBase(GameConfig.COLORS.STEEL);
            container.add(tileBg);
            break;

          case 'glass':
            drawTileBase(GameConfig.COLORS.GLASS);
            container.add(tileBg);
            container.add(this.add.text(tileX, tileY, '6', {
              fontSize: '18px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: '#2a5080'
            }).setOrigin(0.5));
            break;

          case 'lead':
            drawTileBase(GameConfig.COLORS.LEAD);
            container.add(tileBg);
            container.add(this.add.text(tileX, tileY, '5', {
              fontSize: '18px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: '#888888'
            }).setOrigin(0.5));
            break;

          case 'bomb':
            drawTileBase(GameConfig.COLORS.BOMB);
            container.add(tileBg);
            container.add(this.add.text(tileX, tileY, '3', {
              fontSize: '18px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: '#ffffff'
            }).setOrigin(0.5));
            break;

          case 'auto_swapper':
            drawTileBase(GameConfig.COLORS.AUTO_SWAPPER);
            container.add(tileBg);
            container.add(this.add.text(tileX, tileY, '⇄', {
              fontSize: '20px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#ffffff'
            }).setOrigin(0.5));
            break;

          case 'ultra':
            drawTileBase(GameConfig.COLORS.WILDCARD);
            container.add(tileBg);
            container.add(this.add.text(tileX, tileY, '☠', {
              fontSize: '22px', color: '#ffffff'
            }).setOrigin(0.5));
            break;

          case 'daily':
            const dailyColor = modeData.dailyStats?.todayCompleted ? GameConfig.UI.SUCCESS : GameConfig.UI.WARNING;
            drawTileBase(dailyColor);
            container.add(tileBg);
            const dailyIcon = modeData.dailyStats?.todayCompleted ? '✓' : '📅';
            container.add(this.add.text(tileX, tileY, dailyIcon, {
              fontSize: '20px', color: '#ffffff'
            }).setOrigin(0.5));
            break;

          // === BIRTHDAY MODE START ===
          case 'birthday_5':
            drawTileBase(GameConfig.BIRTHDAY_COLORS[5]);
            container.add(tileBg);
            container.add(this.add.text(tileX, tileY, '5', {
              fontSize: '18px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: '#ffffff'
            }).setOrigin(0.5));
            break;

          case 'birthday_60':
            drawTileBase(GameConfig.BIRTHDAY_COLORS[60]);
            container.add(tileBg);
            container.add(this.add.text(tileX, tileY, '60', {
              fontSize: '16px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: '#ffffff'
            }).setOrigin(0.5));
            break;

          case 'birthday_65':
            drawTileBase(GameConfig.BIRTHDAY_COLORS[65]);
            container.add(tileBg);
            container.add(this.add.text(tileX, tileY, '65', {
              fontSize: '16px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: '#ffffff'
            }).setOrigin(0.5));
            break;
          // === BIRTHDAY MODE END ===
        }
      } else {
        // Regular numeric tile - clean flat style
        const color = getTileColor(val);
        drawTileBase(color);
        container.add(tileBg);
        container.add(this.add.text(tileX, tileY, val.toString(), {
          fontSize: '18px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '800',
          color: getTileTextColor(val)
        }).setOrigin(0.5));
      }
    });

    // Description
    const desc = this.add.text(0, 25, modeData.description, {
      fontSize: '11px', fontFamily: GameConfig.FONTS.UI, color: '#666666',
      align: 'center', lineSpacing: 6
    }).setOrigin(0.5);
    container.add(desc);

    // Goal highlight
    const goalY = 80;
    let goalLabel;
    if (modeData.mode === 'ultra') {
      goalLabel = 'Goal: Survive';
    } else if (modeData.mode === 'endless') {
      goalLabel = 'Goal: Highest Score';
    } else if (modeData.mode === 'daily') {
      goalLabel = modeData.dailyStats?.todayCompleted ? 'Completed Today' : 'Goal: Complete Challenge';
    } else if (modeData.mode === 'levels') {
      goalLabel = 'Goal: Complete All Levels';
    // === BIRTHDAY MODE START ===
    } else if (modeData.mode === 'birthday') {
      goalLabel = 'Goal: Create 65 Tile';
    // === BIRTHDAY MODE END ===
    } else {
      goalLabel = 'Goal: Highest Tile';
    }

    const goalText = this.add.text(0, goalY, goalLabel, {
      fontSize: '11px', fontFamily: GameConfig.FONTS.UI, fontStyle: '600', color: '#888888'
    }).setOrigin(0.5);
    container.add(goalText);

    // High score / stats - mode-specific
    if (modeData.mode === 'ultra') {
      container.add(this.add.text(0, this.cardHeight / 2 - 28, '⚠ Danger Zone', {
        fontSize: '14px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#c49cde'
      }).setOrigin(0.5));
    } else if (modeData.mode === 'daily') {
      const streak = modeData.dailyStats?.currentStreak || 0;
      const total = modeData.dailyStats?.totalCompleted || 0;
      const statsText = streak > 0 ? `🔥 ${streak} day streak` : `${total} completed`;
      container.add(this.add.text(0, this.cardHeight / 2 - 28, statsText, {
        fontSize: '12px', fontFamily: GameConfig.FONTS.UI, fontStyle: '600', color: '#888888'
      }).setOrigin(0.5));
    } else if (modeData.mode === 'levels') {
      const totalLevels = levelManager.getTotalLevels();
      container.add(this.add.text(0, this.cardHeight / 2 - 28, `${totalLevels} levels available`, {
        fontSize: '12px', fontFamily: GameConfig.FONTS.UI, fontStyle: '600', color: '#7cc576'
      }).setOrigin(0.5));
    } else {
      const highScore = highScoreManager.getHighScore(modeData.mode);
      const scoreText = highScore > 0 ? `Best: ${highScore}` : 'No score yet';
      container.add(this.add.text(0, this.cardHeight / 2 - 28, scoreText, {
        fontSize: '13px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: highScore > 0 ? '#f5c26b' : '#999999'
      }).setOrigin(0.5));
    }

    return { container, bg, modeData };
  }

  createArrows() {
    const { width } = this.cameras.main;
    const arrowY = this.carouselY;

    // Left arrow - clean style
    this.leftArrow = this.add.text(20, arrowY, '◀', {
      fontSize: '28px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#ffffff'
    }).setOrigin(0.5).setInteractive();

    this.leftArrow.on('pointerdown', () => this.navigateCarousel(-1));
    this.leftArrow.on('pointerover', () => this.leftArrow.setColor('#66c3d5'));
    this.leftArrow.on('pointerout', () => this.leftArrow.setColor('#ffffff'));

    // Collection hint (shows when on first card)
    this.collectionHint = this.add.text(20, arrowY + 30, 'Tiles', {
      fontSize: '9px', fontFamily: GameConfig.FONTS.UI, fontStyle: '600', color: '#aaaaaa'
    }).setOrigin(0.5);

    // Right arrow
    this.rightArrow = this.add.text(width - 20, arrowY, '▶', {
      fontSize: '28px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#ffffff'
    }).setOrigin(0.5).setInteractive();

    this.rightArrow.on('pointerdown', () => this.navigateCarousel(1));
    this.rightArrow.on('pointerover', () => this.rightArrow.setColor('#66c3d5'));
    this.rightArrow.on('pointerout', () => this.rightArrow.setColor('#ffffff'));
  }

  createDots() {
    const { width } = this.cameras.main;
    const dotY = this.carouselY + this.cardHeight / 2 + 25;
    const dotSpacing = 18;
    const startX = width / 2 - ((this.gameModes.length - 1) * dotSpacing) / 2;

    this.dots = [];
    this.gameModes.forEach((_, i) => {
      const dot = this.add.circle(startX + i * dotSpacing, dotY, 5, GameConfig.UI.PRIMARY, i === this.currentIndex ? 1 : 0.3);
      this.dots.push(dot);
    });
  }

  createPlayButton() {
    const { width } = this.cameras.main;
    const buttonY = this.carouselY + this.cardHeight / 2 + 60;

    this.playButton = UIHelpers.createButton(this, width / 2, buttonY, 'PLAY', () => {
      this.playCurrentMode();
    }, { width: 180, height: 50, fontSize: '24px' });
  }

  showUltraVideo() {
    const { width, height } = this.cameras.main;

    // Create dark overlay in Phaser
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.95);
    overlay.setDepth(1000);

    // Create HTML video element directly to avoid CORS issues
    const video = document.createElement('video');
    video.src = 'cat.mp4';
    video.loop = true;
    video.muted = false;
    video.playsInline = true;
    video.style.position = 'absolute';
    video.style.zIndex = '1000';
    video.style.maxWidth = '90%';
    video.style.maxHeight = '80%';
    video.style.top = '50%';
    video.style.left = '50%';
    video.style.transform = 'translate(-50%, -50%)';
    video.style.borderRadius = '10px';
    video.style.boxShadow = '0 0 30px rgba(255, 0, 255, 0.5)';
    video.style.pointerEvents = 'none'; // Let clicks pass through to the click zone

    // Add to game container
    const container = document.getElementById('game-container');
    container.appendChild(video);
    video.play();

    // Close button (HTML)
    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '✕';
    closeBtn.style.position = 'absolute';
    closeBtn.style.zIndex = '1001';
    closeBtn.style.top = '20px';
    closeBtn.style.right = '20px';
    closeBtn.style.fontSize = '32px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.color = '#ffffff';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.textShadow = '0 0 10px #ff00ff';
    container.appendChild(closeBtn);

    // Tap hint
    const tapHint = document.createElement('div');
    tapHint.innerHTML = 'Tap anywhere to close';
    tapHint.style.position = 'absolute';
    tapHint.style.zIndex = '1001';
    tapHint.style.bottom = '30px';
    tapHint.style.left = '50%';
    tapHint.style.transform = 'translateX(-50%)';
    tapHint.style.fontSize = '14px';
    tapHint.style.color = '#888888';
    container.appendChild(tapHint);

    // Overlay click zone (HTML) - z-index above video so clicks register
    const clickZone = document.createElement('div');
    clickZone.style.position = 'absolute';
    clickZone.style.zIndex = '1002';
    clickZone.style.top = '0';
    clickZone.style.left = '0';
    clickZone.style.width = '100%';
    clickZone.style.height = '100%';
    clickZone.style.cursor = 'pointer';
    container.appendChild(clickZone);

    const cleanup = () => {
      video.pause();
      video.remove();
      closeBtn.remove();
      tapHint.remove();
      clickZone.remove();
      overlay.destroy();
    };

    closeBtn.onclick = cleanup;
    clickZone.onclick = cleanup;
  }

  createMenuButtons() {
    const { width, height } = this.cameras.main;
    // Start below the PLAY button (which is at carouselY + cardHeight/2 + 60)
    const startY = this.carouselY + this.cardHeight / 2 + 130;
    const spacing = 45;
    const buttonWidth = 140;
    const buttonGap = 15;

    // Row 1: Leaderboards and Achievements
    UIHelpers.createButton(this, width / 2 - buttonWidth / 2 - buttonGap / 2, startY, 'LEADERBOARD', () => {
      this.scene.start('LeaderboardScene');
    }, { width: buttonWidth, height: 40, fontSize: '12px' });

    UIHelpers.createButton(this, width / 2 + buttonWidth / 2 + buttonGap / 2, startY, 'ACHIEVEMENTS', () => {
      this.scene.start('AchievementScene');
    }, { width: buttonWidth, height: 40, fontSize: '12px' });

    // Row 2: How to Play
    UIHelpers.createButton(this, width / 2, startY + spacing, 'HOW TO PLAY', () => {
      UIHelpers.showHowToPlay(this);
    }, { width: buttonWidth + 60, height: 40, fontSize: '14px' });
  }

  navigateCarousel(direction) {
    const newIndex = this.currentIndex + direction;

    // If swiping left past the first card, go to Tile Collection
    if (newIndex < 0 && this.currentIndex === 0) {
      this.scene.start('TileCollectionScene');
      return;
    }

    if (newIndex >= 0 && newIndex < this.gameModes.length) {
      this.currentIndex = newIndex;
      this.updateCarousel(true);
    }
  }

  updateCarousel(animate = true) {
    const { width } = this.cameras.main;
    const duration = animate ? 200 : 0;

    this.cards.forEach((card, index) => {
      const offset = index - this.currentIndex;
      const targetX = width / 2 + offset * (this.cardWidth + this.cardGap);
      const targetScale = index === this.currentIndex ? 1 : 0.85;
      const targetAlpha = index === this.currentIndex ? 1 : 0.5;

      if (animate) {
        this.tweens.add({
          targets: card.container,
          x: targetX,
          scaleX: targetScale,
          scaleY: targetScale,
          alpha: targetAlpha,
          duration,
          ease: 'Power2'
        });
      } else {
        card.container.x = targetX;
        card.container.setScale(targetScale);
        card.container.alpha = targetAlpha;
      }
    });

    // Update dots
    this.dots.forEach((dot, i) => {
      dot.setAlpha(i === this.currentIndex ? 1 : 0.3);
    });

    // Update arrow visibility
    // Left arrow is always active (goes to Collection when at index 0)
    this.leftArrow.setAlpha(1);
    this.rightArrow.setAlpha(this.currentIndex < this.gameModes.length - 1 ? 1 : 0.3);

    // Show collection hint when on first card
    if (this.collectionHint) {
      this.collectionHint.setVisible(this.currentIndex === 0);
    }
  }

  setupDragNavigation() {
    const { width } = this.cameras.main;

    // Create invisible drag zone over carousel area (narrower to not block arrows)
    const arrowMargin = 50; // Leave space for arrows on each side
    const dragZone = this.add.rectangle(
      width / 2,
      this.carouselY,
      width - arrowMargin * 2,
      this.cardHeight + 60,
      0x000000, 0
    ).setInteractive();

    let startX = 0;
    let isDragging = false;
    let lastTapTime = 0;

    dragZone.on('pointerdown', (pointer) => {
      startX = pointer.x;
      isDragging = true;
    });

    dragZone.on('pointermove', (pointer) => {
      if (!isDragging) return;
      // Visual feedback while dragging could be added here
    });

    dragZone.on('pointerup', (pointer) => {
      if (!isDragging) return;
      isDragging = false;

      const deltaX = pointer.x - startX;
      if (Math.abs(deltaX) > 50) {
        if (deltaX < 0) {
          this.navigateCarousel(1);  // Swipe left = go right
        } else {
          this.navigateCarousel(-1); // Swipe right = go left
        }
      } else {
        // It was a tap, not a swipe - check for double tap
        const now = Date.now();
        if (now - lastTapTime < 300) {
          // Double tap detected - play the current mode
          this.playCurrentMode();
        }
        lastTapTime = now;
      }
    });

    dragZone.on('pointerout', () => {
      isDragging = false;
    });
  }

  playCurrentMode() {
    const mode = this.gameModes[this.currentIndex].mode;
    if (mode === 'ultra') {
      this.showUltraVideo();
    } else if (mode === 'daily') {
      this.scene.start('DailyChallengeScene');
    } else if (mode === 'levels') {
      this.scene.start('TutorialSelectScene');
    // === BIRTHDAY MODE START ===
    } else if (mode === 'birthday') {
      // Birthday mode - no save/resume, just start fresh
      this.scene.start('GameScene', { mode: 'birthday' });
    // === BIRTHDAY MODE END ===
    } else {
      // Check for saved game
      if (gameStateManager.hasSavedGame(mode)) {
        this.showResumePrompt(mode);
      } else {
        this.scene.start('GameScene', { mode });
      }
    }
  }

  showResumePrompt(mode) {
    const { width, height } = this.cameras.main;

    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(900);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    // Popup box - larger to fit bigger buttons
    const boxWidth = 300;
    const boxHeight = 220;
    const boxX = width / 2 - boxWidth / 2;
    const boxY = height / 2 - boxHeight / 2;

    const box = this.add.graphics();
    box.fillStyle(0x1a1a2e, 1);
    box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    box.lineStyle(2, 0x4a90e2, 1);
    box.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    box.setDepth(901);

    // Title
    const title = this.add.text(width / 2, boxY + 30, 'CONTINUE GAME?', {
      fontSize: '22px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5).setDepth(902);

    // Message
    const message = this.add.text(width / 2, boxY + 60, 'You have a saved game in progress.', {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(902);

    // Button dimensions for consistent sizing
    const btnWidth = 240;
    const btnHeight = 44;
    const btnSpacing = 54;

    // Resume button
    const resumeBtnY = boxY + 105;
    const resumeBtnBg = this.add.graphics();
    resumeBtnBg.fillStyle(0x2d5a1e, 1);
    resumeBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, resumeBtnY - btnHeight / 2, btnWidth, btnHeight, 8);
    resumeBtnBg.setDepth(902);

    const resumeBtn = this.add.text(width / 2, resumeBtnY, 'RESUME GAME', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#7ed321'
    }).setOrigin(0.5).setDepth(903);

    const resumeBtnZone = this.add.rectangle(width / 2, resumeBtnY, btnWidth, btnHeight, 0x000000, 0)
      .setDepth(904).setInteractive();

    // New game button
    const newBtnY = resumeBtnY + btnSpacing;
    const newBtnBg = this.add.graphics();
    newBtnBg.fillStyle(0x5a1e1e, 1);
    newBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, newBtnY - btnHeight / 2, btnWidth, btnHeight, 8);
    newBtnBg.setDepth(902);

    const newBtn = this.add.text(width / 2, newBtnY, 'START NEW GAME', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#e24a4a'
    }).setOrigin(0.5).setDepth(903);

    const newBtnZone = this.add.rectangle(width / 2, newBtnY, btnWidth, btnHeight, 0x000000, 0)
      .setDepth(904).setInteractive();

    // Cleanup function
    const cleanup = () => {
      overlay.destroy();
      box.destroy();
      title.destroy();
      message.destroy();
      resumeBtnBg.destroy();
      resumeBtn.destroy();
      resumeBtnZone.destroy();
      newBtnBg.destroy();
      newBtn.destroy();
      newBtnZone.destroy();
    };

    resumeBtnZone.on('pointerdown', () => {
      cleanup();
      this.scene.start('GameScene', { mode, resumeFromSave: true });
    });

    newBtnZone.on('pointerdown', () => {
      cleanup();
      gameStateManager.clearSavedGame();
      this.scene.start('GameScene', { mode });
    });

    overlay.on('pointerdown', () => {
      cleanup();
    });
  }
}
