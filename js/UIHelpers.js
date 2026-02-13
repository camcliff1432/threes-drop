/**
 * UIHelpers - Shared UI components and utilities
 */
const UIHelpers = {
  /**
   * Draw clean background
   */
  drawBackground(scene) {
    const { width, height } = scene.cameras.main;
    const g = scene.add.graphics();

    // Solid slate background
    g.fillStyle(GameConfig.UI.BACKGROUND_DARK, 1);
    g.fillRect(0, 0, width, height);

    return g;
  },

  /**
   * Create a styled button - clean and minimal
   */
  createButton(scene, x, y, text, callback, options = {}) {
    const width = options.width || 220;
    const height = options.height || 50;
    const disabled = options.disabled || false;
    const fontSize = options.fontSize || '18px';

    const bg = scene.add.graphics();
    const fillColor = disabled ? GameConfig.UI.DISABLED : GameConfig.UI.PRIMARY;

    // Clean button fill
    bg.fillStyle(fillColor, disabled ? 0.5 : 1);
    bg.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);

    const label = scene.add.text(x, y, text, {
      fontSize,
      fontFamily: GameConfig.FONTS.UI,
      fontStyle: '700',
      color: disabled ? '#888888' : '#ffffff'
    }).setOrigin(0.5);

    const hitArea = scene.add.rectangle(x, y, width, height, 0x000000, 0).setInteractive();

    if (!disabled) {
      hitArea.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(GameConfig.UI.PRIMARY_LIGHT, 1);
        bg.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      });
      hitArea.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(fillColor, 1);
        bg.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      });
      hitArea.on('pointerdown', () => {
        if (typeof soundManager !== 'undefined') soundManager.play('click');
        callback();
      });
    }

    return { bg, label, hitArea };
  },

  /**
   * Show the How to Play modal with scrollable content
   */
  showHowToPlay(scene, onClose) {
    const { width, height } = scene.cameras.main;
    const overlay = scene.add.container(0, 0).setDepth(2000);

    // Semi-transparent background
    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRect(0, 0, width, height);
    bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    overlay.add(bg);

    // Modal dimensions
    const mw = Math.min(380, width - 30);
    const mh = Math.min(620, height - 50);
    const mx = (width - mw) / 2, my = (height - mh) / 2;
    const modal = scene.add.graphics();

    // Clean modal background
    modal.fillStyle(0xf5f5f5, 1);
    modal.fillRoundedRect(mx, my, mw, mh, 12);
    overlay.add(modal);

    // Title
    overlay.add(scene.add.text(width / 2, my + 28, 'How to Play', {
      fontSize: '24px', fontFamily: GameConfig.FONTS.DISPLAY, fontStyle: '800', color: '#2c3e50'
    }).setOrigin(0.5));

    // Scroll hint
    overlay.add(scene.add.text(width / 2, my + 52, 'Swipe or scroll to see more', {
      fontSize: '11px', fontFamily: GameConfig.FONTS.UI, color: '#888888'
    }).setOrigin(0.5));

    // Scrollable content area dimensions
    const scrollX = mx + 15;
    const scrollY = my + 75;
    const scrollW = mw - 30;
    const scrollH = mh - 130;

    // Create scrollable content container
    const scrollContent = scene.add.container(scrollX, scrollY);
    overlay.add(scrollContent);

    // Create mask for scroll area
    const maskShape = scene.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(scrollX, scrollY, scrollW, scrollH);
    const mask = maskShape.createGeometryMask();
    scrollContent.setMask(mask);

    // Build content inside scrollContent
    let ty = 15;
    const contentX = scrollW / 2;
    const leftX = 10;

    // ========== BASIC RULES ==========
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'Basic Rules', GameConfig.UI.PRIMARY);
    ty += 35;

    // Merge example tiles - clean, flat style
    const tiles = [
      { icon: '1', color: GameConfig.COLORS[1] },
      { icon: '+', isSymbol: true },
      { icon: '2', color: GameConfig.COLORS[2] },
      { icon: '=', isSymbol: true },
      { icon: '3', color: GameConfig.COLORS[3], textColor: '#2c3e50' }
    ];
    const tileSize = 38;
    const tileGap = 48;
    const tilesStartX = (scrollW - (tiles.length * tileGap - 10)) / 2;
    const radius = 6;

    tiles.forEach((t, i) => {
      const tx = tilesStartX + i * tileGap;
      if (t.isSymbol) {
        scrollContent.add(scene.add.text(tx, ty, t.icon, {
          fontSize: '24px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: '#5a9fd4'
        }).setOrigin(0.5));
      } else {
        const box = scene.add.graphics();
        const halfSize = tileSize / 2;
        // Clean flat fill
        box.fillStyle(t.color, 1);
        box.fillRoundedRect(tx - halfSize, ty - halfSize, tileSize, tileSize, radius);
        scrollContent.add(box);
        scrollContent.add(scene.add.text(tx, ty, t.icon, {
          fontSize: '20px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '800', color: t.textColor || '#ffffff'
        }).setOrigin(0.5));
      }
    });
    ty += 45;

    // Basic rules as bullet points
    const basicRules = [
      'Tap a column to drop a tile',
      '1 + 2 = 3 (only way to make 3)',
      'Matching tiles double: 3+3=6, 6+6=12...',
      'Swipe or use arrows to shift tiles'
    ];
    basicRules.forEach(rule => {
      this.addBulletPoint(scene, scrollContent, leftX, ty, rule, '#cccccc');
      ty += 24;
    });

    // ========== GAME MODES ==========
    ty += 15;
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'Game Modes', GameConfig.UI.SUCCESS);
    ty += 32;

    const modes = [
      { name: 'Original', color: GameConfig.COLORS[1], desc: 'Classic mode - swipe power-up only', goal: 'Goal: Highest tile' },
      { name: 'Crazy', color: GameConfig.COLORS[2], desc: 'All power-ups, special tiles, frenzy', goal: 'Goal: Highest tile' },
      { name: 'Endless', color: GameConfig.COLORS.WILDCARD, desc: 'Bombs explode for big points!', goal: 'Goal: Highest score' }
    ];
    modes.forEach(mode => {
      // Mode name with colored badge
      const badge = scene.add.graphics();
      badge.fillStyle(mode.color, 1);
      badge.fillRoundedRect(leftX, ty - 10, 70, 20, 4);
      scrollContent.add(badge);
      scrollContent.add(scene.add.text(leftX + 35, ty, mode.name, {
        fontSize: '12px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#ffffff'
      }).setOrigin(0.5));
      scrollContent.add(scene.add.text(leftX + 82, ty - 5, mode.desc, {
        fontSize: '11px', fontFamily: GameConfig.FONTS.UI, color: '#555555'
      }).setOrigin(0, 0.5));
      scrollContent.add(scene.add.text(leftX + 82, ty + 8, mode.goal, {
        fontSize: '10px', fontFamily: GameConfig.FONTS.UI, fontStyle: 'italic', color: '#888888'
      }).setOrigin(0, 0.5));
      ty += 38;
    });

    // ========== POWER-UPS ==========
    ty += 10;
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'Power-Ups', GameConfig.UI.WARNING);
    ty += 28;
    scrollContent.add(scene.add.text(contentX, ty, 'Earn 1 point per merge!', {
      fontSize: '11px', fontFamily: GameConfig.FONTS.UI, fontStyle: 'italic', color: '#888888'
    }).setOrigin(0.5));
    ty += 24;

    const powerUps = [
      { name: 'Swipe', cost: '5', desc: 'Shift all tiles left/right' },
      { name: 'Swap', cost: '10', desc: 'Exchange any two tiles' },
      { name: 'Merge', cost: '10', desc: 'Force merge two tiles' },
      { name: 'Wildcard', cost: '20', desc: 'Next tile matches any 3+' }
    ];
    powerUps.forEach(pu => {
      // Cost badge
      const costBadge = scene.add.graphics();
      costBadge.fillStyle(GameConfig.UI.WARNING, 1);
      costBadge.fillRoundedRect(leftX, ty - 9, 28, 18, 4);
      scrollContent.add(costBadge);
      scrollContent.add(scene.add.text(leftX + 14, ty, pu.cost, {
        fontSize: '11px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: '#ffffff'
      }).setOrigin(0.5));
      // Name
      scrollContent.add(scene.add.text(leftX + 38, ty, pu.name, {
        fontSize: '12px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#2c3e50'
      }).setOrigin(0, 0.5));
      // Description
      scrollContent.add(scene.add.text(leftX + 105, ty, pu.desc, {
        fontSize: '11px', fontFamily: GameConfig.FONTS.UI, color: '#666666'
      }).setOrigin(0, 0.5));
      ty += 26;
    });

    // ========== FRENZY MODE ==========
    ty += 15;
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'Frenzy Mode', GameConfig.UI.FRENZY);
    ty += 32;

    // Frenzy meter visual - clean style
    const meterWidth = scrollW - 40;
    const meterBg = scene.add.graphics();
    // Background
    meterBg.fillStyle(0xdddddd, 1);
    meterBg.fillRoundedRect(leftX + 10, ty - 8, meterWidth, 16, 4);
    // Fill
    meterBg.fillStyle(GameConfig.UI.FRENZY, 1);
    meterBg.fillRoundedRect(leftX + 10, ty - 8, meterWidth * 0.7, 16, 4);
    scrollContent.add(meterBg);
    scrollContent.add(scene.add.text(leftX + 10 + meterWidth/2, ty, '50 merges to fill', {
      fontSize: '10px', fontFamily: GameConfig.FONTS.UI, fontStyle: '600', color: '#ffffff'
    }).setOrigin(0.5));
    ty += 24;

    const frenzyRules = [
      '10 seconds of no gravity!',
      'Swipe in ALL 4 directions',
      'Set up massive combos!'
    ];
    frenzyRules.forEach(rule => {
      this.addBulletPoint(scene, scrollContent, leftX, ty, rule, GameConfig.UI.FRENZY);
      ty += 20;
    });

    // ========== SPECIAL TILES ==========
    ty += 15;
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'Special Tiles', GameConfig.COLORS.AUTO_SWAPPER);
    ty += 32;

    const specialTiles = [
      { name: 'Steel', desc: 'Blocks cell for N turns', color: GameConfig.COLORS.STEEL, label: '3', labelColor: '#4a5a6a' },
      { name: 'Lead', desc: 'Countdown timer, gone at 0', color: GameConfig.COLORS.LEAD, label: '5', labelColor: '#888888' },
      { name: 'Glass', desc: 'Cracks on nearby merges', color: GameConfig.COLORS.GLASS, label: '6', labelColor: '#2a5080' },
      { name: 'Swapper', desc: 'Auto-swaps with neighbors', color: GameConfig.COLORS.AUTO_SWAPPER, label: '⇄', labelColor: '#ffffff' },
      { name: 'Bomb', desc: 'Explodes after 3 merges!', color: GameConfig.COLORS.BOMB, label: '3', labelColor: '#ffffff' }
    ];

    const specialTileSize = 30;
    const specialRadius = 5;

    specialTiles.forEach(tile => {
      // Clean tile preview
      const tileBox = scene.add.graphics();
      const halfSize = specialTileSize / 2;
      const tileX = leftX + halfSize;

      // Main fill
      tileBox.fillStyle(tile.color, 1);
      tileBox.fillRoundedRect(leftX, ty - halfSize, specialTileSize, specialTileSize, specialRadius);
      scrollContent.add(tileBox);

      scrollContent.add(scene.add.text(tileX, ty, tile.label, {
        fontSize: tile.label.length > 1 ? '12px' : '14px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: tile.labelColor
      }).setOrigin(0.5));

      // Name and description
      scrollContent.add(scene.add.text(leftX + 42, ty - 5, tile.name, {
        fontSize: '12px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#2c3e50'
      }).setOrigin(0, 0.5));
      scrollContent.add(scene.add.text(leftX + 42, ty + 8, tile.desc, {
        fontSize: '10px', fontFamily: GameConfig.FONTS.UI, color: '#666666'
      }).setOrigin(0, 0.5));
      ty += 38;
    });

    // ========== TIPS ==========
    ty += 10;
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'Tips', GameConfig.UI.SUCCESS);
    ty += 30;

    const tips = [
      'Keep high tiles in corners',
      'Save wildcards for big merges',
      'Use frenzy to clear the board',
      'Watch bomb merge counters!',
      'Plan swaps before swiping'
    ];
    tips.forEach(tip => {
      this.addBulletPoint(scene, scrollContent, leftX, ty, tip, GameConfig.UI.SUCCESS);
      ty += 20;
    });

    // Total content height
    const totalContentHeight = ty + 30;

    // Scroll variables
    let scrollOffset = 0;
    const maxScroll = Math.max(0, totalContentHeight - scrollH);

    // Scroll bar
    let scrollBar = null;
    const scrollBarWidth = 6;
    const scrollBarX = mx + mw - 12;

    if (maxScroll > 0) {
      // Scroll bar background
      const scrollBarBg = scene.add.graphics();
      scrollBarBg.fillStyle(0x333333, 0.5);
      scrollBarBg.fillRoundedRect(scrollBarX, scrollY, scrollBarWidth, scrollH, 3);
      overlay.add(scrollBarBg);

      // Scroll bar handle
      const handleHeight = Math.max(40, (scrollH / totalContentHeight) * scrollH);
      scrollBar = scene.add.graphics();
      scrollBar.fillStyle(GameConfig.UI.PRIMARY, 0.8);
      scrollBar.fillRoundedRect(scrollBarX, scrollY, scrollBarWidth, handleHeight, 3);
      overlay.add(scrollBar);

      const updateScrollBar = () => {
        if (scrollBar) {
          const hh = Math.max(40, (scrollH / totalContentHeight) * scrollH);
          const hy = scrollY + (scrollOffset / maxScroll) * (scrollH - hh);
          scrollBar.clear();
          scrollBar.fillStyle(GameConfig.UI.PRIMARY, 0.8);
          scrollBar.fillRoundedRect(scrollBarX, hy, scrollBarWidth, hh, 3);
        }
      };

      // Drag to scroll
      const scrollZone = scene.add.rectangle(
        scrollX + scrollW / 2, scrollY + scrollH / 2,
        scrollW, scrollH, 0x000000, 0
      ).setInteractive();
      overlay.add(scrollZone);

      let isDragging = false;
      let lastY = 0;

      scrollZone.on('pointerdown', (pointer) => {
        isDragging = true;
        lastY = pointer.y;
      });

      scene.input.on('pointermove', (pointer) => {
        if (isDragging) {
          const deltaY = lastY - pointer.y;
          scrollOffset = Phaser.Math.Clamp(scrollOffset + deltaY, 0, maxScroll);
          scrollContent.y = scrollY - scrollOffset;
          lastY = pointer.y;
          updateScrollBar();
        }
      });

      scene.input.on('pointerup', () => {
        isDragging = false;
      });

      // Mouse wheel support
      scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
        if (pointer.x >= mx && pointer.x <= mx + mw &&
            pointer.y >= my && pointer.y <= my + mh) {
          scrollOffset = Phaser.Math.Clamp(scrollOffset + deltaY * 0.5, 0, maxScroll);
          scrollContent.y = scrollY - scrollOffset;
          updateScrollBar();
        }
      });
    }

    // Close button (fixed at bottom) - clean style
    const closeBtnBg = scene.add.graphics();
    const btnWidth = 120;
    const btnHeight = 36;
    const btnX = width / 2 - btnWidth / 2;
    const btnY = my + mh - 45;

    // Clean button fill
    closeBtnBg.fillStyle(GameConfig.UI.PRIMARY, 1);
    closeBtnBg.fillRoundedRect(btnX, btnY, btnWidth, btnHeight, 6);
    overlay.add(closeBtnBg);

    const closeBtn = scene.add.text(width / 2, btnY + btnHeight / 2, 'Close', {
      fontSize: '15px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#ffffff'
    }).setOrigin(0.5).setInteractive();
    overlay.add(closeBtn);

    const close = () => {
      scene.input.off('pointermove');
      scene.input.off('pointerup');
      scene.input.off('wheel');
      maskShape.destroy();
      overlay.destroy();
      if (onClose) onClose();
    };
    bg.on('pointerdown', close);
    closeBtn.on('pointerdown', close);

    return overlay;
  },

  /**
   * Helper: Add section header - clean style
   */
  addSectionHeader(scene, container, x, y, text, color) {
    // Parse color
    const colorValue = typeof color === 'number' ? color : Phaser.Display.Color.HexStringToColor(color).color;
    const colorStr = typeof color === 'string' ? color : '#' + colorValue.toString(16).padStart(6, '0');

    // Simple underlined header
    const headerText = scene.add.text(x, y, text, {
      fontSize: '14px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#2c3e50'
    }).setOrigin(0.5);
    container.add(headerText);

    // Subtle underline
    const lineWidth = headerText.width + 20;
    const line = scene.add.graphics();
    line.lineStyle(2, colorValue, 0.6);
    line.lineBetween(x - lineWidth/2, y + 12, x + lineWidth/2, y + 12);
    container.add(line);
  },

  /**
   * Helper: Add bullet point - clean style
   */
  addBulletPoint(scene, container, x, y, text, color) {
    const colorValue = typeof color === 'number' ? color : Phaser.Display.Color.HexStringToColor(color).color;
    const colorStr = typeof color === 'string' ? color : '#' + colorValue.toString(16).padStart(6, '0');

    container.add(scene.add.text(x, y, '•', {
      fontSize: '14px', fontFamily: GameConfig.FONTS.UI, color: colorStr
    }).setOrigin(0, 0.5));
    container.add(scene.add.text(x + 14, y, text, {
      fontSize: '12px', fontFamily: GameConfig.FONTS.UI, color: '#555555'
    }).setOrigin(0, 0.5));
  }
};
