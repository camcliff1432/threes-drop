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

    // Title
    this.add.text(width / 2, 60, 'THREES', {
      fontSize: '48px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);
    this.add.text(width / 2, 105, 'DROP', {
      fontSize: '48px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5);

    // Game mode cards data
    // tiles can be numbers for regular tiles, or special types: 'steel', 'glass', 'lead', 'bomb', 'auto_swapper'
    this.gameModes = [
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
        mode: 'ultra',
        title: 'ULTRA',
        subtitle: '??? MODE ???',
        description: 'Only for the brave\nAre you ready?',
        color: 0xff00ff,
        tiles: ['ultra', 'ultra', 'ultra']
      }
    ];

    // Carousel state
    this.currentIndex = 0;
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

    // Card background - darker fill for better contrast
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, this.cardHeight, 15);
    bg.lineStyle(3, modeData.color, 1);
    bg.strokeRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, this.cardHeight, 15);
    container.add(bg);

    // Colored header band
    const headerBand = this.add.graphics();
    headerBand.fillStyle(modeData.color, 0.25);
    headerBand.fillRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, 70, { tl: 15, tr: 15, bl: 0, br: 0 });
    container.add(headerBand);

    // Mode title - larger, bolder
    const title = this.add.text(0, -this.cardHeight / 2 + 28, modeData.title, {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5);
    container.add(title);

    // Subtitle - brighter color
    const subtitle = this.add.text(0, -this.cardHeight / 2 + 56, modeData.subtitle, {
      fontSize: '15px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#cccccc'
    }).setOrigin(0.5);
    container.add(subtitle);

    // Decorative tiles - supports both regular values and special tile types
    const tileY = -this.cardHeight / 2 + 115;
    modeData.tiles.forEach((val, i) => {
      const tileX = (i - 1) * 58;
      const tileBg = this.add.graphics();
      const tileSize = 48;
      const halfSize = tileSize / 2;

      if (typeof val === 'string') {
        // Special tile types
        switch (val) {
          case 'steel':
            // Steel plate - gray with metallic stripes
            tileBg.fillStyle(GameConfig.COLORS.STEEL, 1);
            tileBg.fillRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, 8);
            // Metallic stripes
            tileBg.lineStyle(2, 0x555555, 0.6);
            tileBg.lineBetween(tileX - halfSize + 8, tileY - halfSize + 12, tileX + halfSize - 8, tileY - halfSize + 12);
            tileBg.lineBetween(tileX - halfSize + 8, tileY, tileX + halfSize - 8, tileY);
            tileBg.lineBetween(tileX - halfSize + 8, tileY + halfSize - 12, tileX + halfSize - 8, tileY + halfSize - 12);
            tileBg.lineStyle(2, 0xaaaaaa, 0.4);
            tileBg.strokeRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, 8);
            container.add(tileBg);
            break;

          case 'glass':
            // Glass tile - light blue with crack pattern and value
            tileBg.fillStyle(GameConfig.COLORS.GLASS, 1);
            tileBg.fillRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, 8);
            // Crack lines
            tileBg.lineStyle(1, 0xffffff, 0.5);
            tileBg.lineBetween(tileX - 6, tileY - halfSize + 8, tileX + 4, tileY + 4);
            tileBg.lineBetween(tileX + 4, tileY + 4, tileX - 2, tileY + halfSize - 8);
            tileBg.lineStyle(2, 0xffffff, 0.4);
            tileBg.strokeRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, 8);
            container.add(tileBg);
            // Glass value
            const glassText = this.add.text(tileX, tileY, '6', {
              fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#000000'
            }).setOrigin(0.5);
            container.add(glassText);
            break;

          case 'lead':
            // Lead tile - dark with countdown number
            tileBg.fillStyle(GameConfig.COLORS.LEAD, 1);
            tileBg.fillRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, 8);
            tileBg.lineStyle(2, 0x444444, 0.6);
            tileBg.strokeRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, 8);
            container.add(tileBg);
            // Countdown number
            const leadText = this.add.text(tileX, tileY, '5', {
              fontSize: '22px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#666666'
            }).setOrigin(0.5);
            container.add(leadText);
            break;

          case 'bomb':
            // Bomb tile - red with bomb icon
            tileBg.fillStyle(GameConfig.COLORS.BOMB, 1);
            tileBg.fillRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, 8);
            tileBg.lineStyle(2, 0xff8888, 0.6);
            tileBg.strokeRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, 8);
            // Bomb circle
            tileBg.fillStyle(0x222222, 1);
            tileBg.fillCircle(tileX, tileY + 2, 12);
            // Fuse
            tileBg.lineStyle(2, 0x8B4513, 1);
            tileBg.lineBetween(tileX, tileY - 10, tileX + 4, tileY - 16);
            // Spark
            tileBg.fillStyle(0xffff00, 1);
            tileBg.fillCircle(tileX + 5, tileY - 18, 3);
            container.add(tileBg);
            // Merge count
            const bombText = this.add.text(tileX, tileY + 2, '3', {
              fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(0.5);
            container.add(bombText);
            break;

          case 'auto_swapper':
            // Auto-swapper - purple with swap arrows
            tileBg.fillStyle(GameConfig.COLORS.AUTO_SWAPPER, 1);
            tileBg.fillRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, 8);
            tileBg.lineStyle(2, 0xbb66ee, 0.6);
            tileBg.strokeRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, 8);
            container.add(tileBg);
            // Swap arrows symbol
            const swapText = this.add.text(tileX, tileY, '⇄', {
              fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(0.5);
            container.add(swapText);
            break;

          case 'ultra':
            // Ultra tile - rainbow/magenta with skull
            tileBg.fillStyle(0xff00ff, 1);
            tileBg.fillRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, 8);
            tileBg.lineStyle(2, 0xffff00, 0.8);
            tileBg.strokeRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, 8);
            container.add(tileBg);
            // Skull/danger symbol
            const ultraText = this.add.text(tileX, tileY, '☠', {
              fontSize: '28px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(0.5);
            container.add(ultraText);
            break;
        }
      } else {
        // Regular numeric tile
        tileBg.fillStyle(getTileColor(val), 1);
        tileBg.fillRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, 8);
        tileBg.lineStyle(2, 0xffffff, 0.4);
        tileBg.strokeRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, 8);
        container.add(tileBg);

        const tileText = this.add.text(tileX, tileY, val.toString(), {
          fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
          color: getTileTextColor(val)
        }).setOrigin(0.5);
        container.add(tileText);
      }
    });

    // Description - larger, better spacing, brighter
    const desc = this.add.text(0, 25, modeData.description, {
      fontSize: '15px', fontFamily: 'Arial, sans-serif', color: '#ffffff',
      align: 'center', lineSpacing: 6
    }).setOrigin(0.5);
    container.add(desc);

    // Goal highlight - emphasize the goal line
    const goalY = 85;
    const goalBg = this.add.graphics();
    goalBg.fillStyle(modeData.color, 0.2);
    goalBg.fillRoundedRect(-100, goalY - 14, 200, 28, 6);
    container.add(goalBg);

    let goalLabel, goalColor;
    if (modeData.mode === 'ultra') {
      goalLabel = 'GOAL: SURVIVE';
      goalColor = '#ff00ff';
    } else if (modeData.mode === 'endless') {
      goalLabel = 'GOAL: HIGHEST SCORE';
      goalColor = '#ff6b6b';
    } else {
      goalLabel = 'GOAL: HIGHEST TILE';
      goalColor = '#7ed321';
    }

    const goalText = this.add.text(0, goalY, goalLabel, {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: goalColor
    }).setOrigin(0.5);
    container.add(goalText);

    // High score - more prominent (skip for ultra mode)
    if (modeData.mode !== 'ultra') {
      const highScore = highScoreManager.getHighScore(modeData.mode);
      const scoreText = highScore > 0 ? `BEST: ${highScore}` : 'NO SCORE YET';
      const scoreColor = highScore > 0 ? '#f5a623' : '#888888';
      const score = this.add.text(0, this.cardHeight / 2 - 28, scoreText, {
        fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: scoreColor
      }).setOrigin(0.5);
      container.add(score);
    } else {
      // Ultra mode - show warning instead
      const warning = this.add.text(0, this.cardHeight / 2 - 28, '⚠ DANGER ⚠', {
        fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ff00ff'
      }).setOrigin(0.5);
      container.add(warning);
    }

    return { container, bg, modeData };
  }

  createArrows() {
    const { width } = this.cameras.main;
    const arrowY = this.carouselY;

    // Left arrow
    this.leftArrow = this.add.text(15, arrowY, '<', {
      fontSize: '40px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setInteractive();

    this.leftArrow.on('pointerdown', () => this.navigateCarousel(-1));
    this.leftArrow.on('pointerover', () => this.leftArrow.setColor('#7ab8ff'));
    this.leftArrow.on('pointerout', () => this.leftArrow.setColor('#4a90e2'));

    // Collection hint (shows when on first card)
    this.collectionHint = this.add.text(15, arrowY + 35, 'TILES', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setAlpha(0.7);

    // Right arrow
    this.rightArrow = this.add.text(width - 15, arrowY, '>', {
      fontSize: '40px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setInteractive();

    this.rightArrow.on('pointerdown', () => this.navigateCarousel(1));
    this.rightArrow.on('pointerover', () => this.rightArrow.setColor('#7ab8ff'));
    this.rightArrow.on('pointerout', () => this.rightArrow.setColor('#4a90e2'));
  }

  createDots() {
    const { width } = this.cameras.main;
    const dotY = this.carouselY + this.cardHeight / 2 + 25;
    const dotSpacing = 20;
    const startX = width / 2 - ((this.gameModes.length - 1) * dotSpacing) / 2;

    this.dots = [];
    this.gameModes.forEach((_, i) => {
      const dot = this.add.circle(startX + i * dotSpacing, dotY, 6, 0x4a90e2, i === 0 ? 1 : 0.3);
      this.dots.push(dot);
    });
  }

  createPlayButton() {
    const { width } = this.cameras.main;
    const buttonY = this.carouselY + this.cardHeight / 2 + 60;

    this.playButton = UIHelpers.createButton(this, width / 2, buttonY, 'PLAY', () => {
      const mode = this.gameModes[this.currentIndex].mode;
      if (mode === 'ultra') {
        this.showUltraVideo();
      } else {
        this.scene.start('GameScene', { mode });
      }
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

    // Overlay click zone (HTML)
    const clickZone = document.createElement('div');
    clickZone.style.position = 'absolute';
    clickZone.style.zIndex = '999';
    clickZone.style.top = '0';
    clickZone.style.left = '0';
    clickZone.style.width = '100%';
    clickZone.style.height = '100%';
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
    const startY = this.carouselY + this.cardHeight / 2 + 130;
    const spacing = 50;
    const buttonWidth = 140;
    const buttonGap = 15;

    // Row 1: Tutorial and Levels
    UIHelpers.createButton(this, width / 2 - buttonWidth / 2 - buttonGap / 2, startY, 'TUTORIAL', () => {
      this.scene.start('TutorialSelectScene');
    }, { width: buttonWidth, height: 40, fontSize: '14px' });

    UIHelpers.createButton(this, width / 2 + buttonWidth / 2 + buttonGap / 2, startY, 'LEVELS', () => {
      this.scene.start('LevelSelectScene');
    }, { width: buttonWidth, height: 40, fontSize: '14px' });

    // Row 2: Leaderboards and Achievements
    UIHelpers.createButton(this, width / 2 - buttonWidth / 2 - buttonGap / 2, startY + spacing, 'LEADERBOARD', () => {
      this.scene.start('LeaderboardScene');
    }, { width: buttonWidth, height: 40, fontSize: '12px' });

    UIHelpers.createButton(this, width / 2 + buttonWidth / 2 + buttonGap / 2, startY + spacing, 'ACHIEVEMENTS', () => {
      this.scene.start('AchievementScene');
    }, { width: buttonWidth, height: 40, fontSize: '12px' });

    // Row 3: How to Play
    UIHelpers.createButton(this, width / 2, startY + spacing * 2, 'HOW TO PLAY', () => {
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

    // Create invisible drag zone over carousel area
    const dragZone = this.add.rectangle(
      width / 2,
      this.carouselY,
      width,
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
    } else {
      this.scene.start('GameScene', { mode });
    }
  }
}
