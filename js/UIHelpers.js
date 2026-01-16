/**
 * UIHelpers - Shared UI components and utilities
 */
const UIHelpers = {
  /**
   * Draw gradient background
   */
  drawBackground(scene) {
    const { width, height } = scene.cameras.main;
    const g = scene.add.graphics();
    g.fillGradientStyle(GameConfig.UI.BACKGROUND_DARK, GameConfig.UI.BACKGROUND_DARK,
                        GameConfig.UI.BACKGROUND_LIGHT, GameConfig.UI.BACKGROUND_LIGHT, 1);
    g.fillRect(0, 0, width, height);
    return g;
  },

  /**
   * Create a styled button
   */
  createButton(scene, x, y, text, callback, options = {}) {
    const width = options.width || 220;
    const height = options.height || 50;
    const disabled = options.disabled || false;
    const fontSize = options.fontSize || '20px';

    const bg = scene.add.graphics();
    const fillColor = disabled ? GameConfig.UI.DISABLED : GameConfig.UI.PRIMARY;
    const fillAlpha = disabled ? 0.8 : 0.3;
    const strokeColor = disabled ? 0x555555 : GameConfig.UI.PRIMARY;

    bg.fillStyle(fillColor, fillAlpha);
    bg.lineStyle(2, strokeColor, 1);
    bg.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
    bg.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);

    const label = scene.add.text(x, y, text, {
      fontSize, fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: disabled ? '#666666' : '#ffffff'
    }).setOrigin(0.5);

    const hitArea = scene.add.rectangle(x, y, width, height, 0x000000, 0).setInteractive();

    if (!disabled) {
      hitArea.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(GameConfig.UI.PRIMARY, 0.6);
        bg.lineStyle(2, GameConfig.UI.PRIMARY_LIGHT, 1);
        bg.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
        bg.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);
      });
      hitArea.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(GameConfig.UI.PRIMARY, 0.3);
        bg.lineStyle(2, GameConfig.UI.PRIMARY, 1);
        bg.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
        bg.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);
      });
      hitArea.on('pointerdown', callback);
    }

    return { bg, label, hitArea };
  },

  /**
   * Show the How to Play modal with scrollable content
   */
  showHowToPlay(scene, onClose) {
    const { width, height } = scene.cameras.main;
    const overlay = scene.add.container(0, 0).setDepth(2000);

    // Background
    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.9);
    bg.fillRect(0, 0, width, height);
    bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    overlay.add(bg);

    // Modal dimensions - larger for better readability
    const mw = Math.min(400, width - 20);
    const mh = Math.min(650, height - 40);
    const mx = (width - mw) / 2, my = (height - mh) / 2;
    const modal = scene.add.graphics();
    modal.fillStyle(0x1a1a2e, 1);
    modal.fillRoundedRect(mx, my, mw, mh, 16);
    modal.lineStyle(3, GameConfig.UI.PRIMARY, 1);
    modal.strokeRoundedRect(mx, my, mw, mh, 16);
    overlay.add(modal);

    // Title (fixed, not scrollable)
    overlay.add(scene.add.text(width / 2, my + 30, 'HOW TO PLAY', {
      fontSize: '28px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5));

    // Scroll hint
    overlay.add(scene.add.text(width / 2, my + 55, 'Swipe or scroll to see more', {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#888888'
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
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'BASIC RULES', '#4a90e2');
    ty += 35;

    // Merge example tiles - larger and clearer
    const tiles = [
      { icon: '1', color: GameConfig.COLORS[1] },
      { icon: '+', isSymbol: true },
      { icon: '2', color: GameConfig.COLORS[2] },
      { icon: '=', isSymbol: true },
      { icon: '3', color: GameConfig.COLORS[3], textColor: '#000000' }
    ];
    const tileSize = 40;
    const tileGap = 50;
    const tilesStartX = (scrollW - (tiles.length * tileGap - 10)) / 2;

    tiles.forEach((t, i) => {
      const tx = tilesStartX + i * tileGap;
      if (t.isSymbol) {
        scrollContent.add(scene.add.text(tx, ty, t.icon, {
          fontSize: '28px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5));
      } else {
        const box = scene.add.graphics();
        box.fillStyle(t.color, 1);
        box.lineStyle(2, 0xffffff, 0.3);
        box.fillRoundedRect(tx - tileSize/2, ty - tileSize/2, tileSize, tileSize, 8);
        box.strokeRoundedRect(tx - tileSize/2, ty - tileSize/2, tileSize, tileSize, 8);
        scrollContent.add(box);
        scrollContent.add(scene.add.text(tx, ty, t.icon, {
          fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: t.textColor || '#ffffff'
        }).setOrigin(0.5));
      }
    });
    ty += 50;

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
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'GAME MODES', '#7ed321');
    ty += 35;

    const modes = [
      { name: 'ORIGINAL', color: '#4a90e2', desc: 'Classic mode - swipe power-up only', goal: 'Goal: Highest tile' },
      { name: 'CRAZY', color: '#e24a4a', desc: 'All power-ups, special tiles, frenzy', goal: 'Goal: Highest tile' },
      { name: 'ENDLESS', color: '#ff4444', desc: 'Bombs explode for big points!', goal: 'Goal: Highest score' }
    ];
    modes.forEach(mode => {
      // Mode name with colored badge
      const badge = scene.add.graphics();
      badge.fillStyle(Phaser.Display.Color.HexStringToColor(mode.color).color, 0.3);
      badge.fillRoundedRect(leftX, ty - 12, 80, 24, 4);
      scrollContent.add(badge);
      scrollContent.add(scene.add.text(leftX + 40, ty, mode.name, {
        fontSize: '13px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: mode.color
      }).setOrigin(0.5));
      scrollContent.add(scene.add.text(leftX + 95, ty - 6, mode.desc, {
        fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#cccccc'
      }).setOrigin(0, 0.5));
      scrollContent.add(scene.add.text(leftX + 95, ty + 8, mode.goal, {
        fontSize: '11px', fontFamily: 'Arial, sans-serif', fontStyle: 'italic', color: '#888888'
      }).setOrigin(0, 0.5));
      ty += 40;
    });

    // ========== POWER-UPS ==========
    ty += 10;
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'POWER-UPS', '#f5a623');
    ty += 30;
    scrollContent.add(scene.add.text(contentX, ty, 'Earn 1 point per merge!', {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', fontStyle: 'italic', color: '#f5a623'
    }).setOrigin(0.5));
    ty += 28;

    const powerUps = [
      { name: 'SWIPE', cost: '5', desc: 'Shift all tiles left/right', color: '#4a90e2' },
      { name: 'SWAP', cost: '10', desc: 'Exchange any two tiles', color: '#50e3c2' },
      { name: 'MERGE', cost: '10', desc: 'Force merge two tiles', color: '#bd10e0' },
      { name: 'WILDCARD', cost: '20', desc: 'Next tile matches any 3+', color: '#ff00ff' }
    ];
    powerUps.forEach(pu => {
      // Cost badge
      const costBadge = scene.add.graphics();
      costBadge.fillStyle(0x333333, 0.8);
      costBadge.fillRoundedRect(leftX, ty - 10, 30, 20, 4);
      scrollContent.add(costBadge);
      scrollContent.add(scene.add.text(leftX + 15, ty, pu.cost, {
        fontSize: '12px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#f5a623'
      }).setOrigin(0.5));
      // Name
      scrollContent.add(scene.add.text(leftX + 42, ty, pu.name, {
        fontSize: '13px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: pu.color
      }).setOrigin(0, 0.5));
      // Description
      scrollContent.add(scene.add.text(leftX + 120, ty, pu.desc, {
        fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
      }).setOrigin(0, 0.5));
      ty += 28;
    });

    // ========== FRENZY MODE ==========
    ty += 15;
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'FRENZY MODE', '#ff6b6b');
    ty += 35;

    // Frenzy meter visual
    const meterWidth = scrollW - 40;
    const meterBg = scene.add.graphics();
    meterBg.fillStyle(0x333333, 0.8);
    meterBg.fillRoundedRect(leftX + 10, ty - 10, meterWidth, 20, 4);
    meterBg.fillStyle(0xff6b6b, 0.8);
    meterBg.fillRoundedRect(leftX + 10, ty - 10, meterWidth * 0.7, 20, 4);
    scrollContent.add(meterBg);
    scrollContent.add(scene.add.text(leftX + 10 + meterWidth/2, ty, '50 MERGES TO FILL', {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5));
    ty += 28;

    const frenzyRules = [
      '10 seconds of no gravity!',
      'Swipe in ALL 4 directions',
      'Set up massive combos!'
    ];
    frenzyRules.forEach(rule => {
      this.addBulletPoint(scene, scrollContent, leftX, ty, rule, '#ff6b6b');
      ty += 22;
    });

    // ========== SPECIAL TILES ==========
    ty += 15;
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'SPECIAL TILES', '#9b59b6');
    ty += 35;

    const specialTiles = [
      { type: 'steel', name: 'STEEL', desc: 'Blocks cell for N turns', color: GameConfig.COLORS.STEEL, label: '3', labelColor: '#333333' },
      { type: 'lead', name: 'LEAD', desc: 'Countdown timer, gone at 0', color: GameConfig.COLORS.LEAD, label: '5', labelColor: '#666666' },
      { type: 'glass', name: 'GLASS', desc: 'Cracks on nearby merges', color: GameConfig.COLORS.GLASS, label: '6', labelColor: '#000000' },
      { type: 'swapper', name: 'SWAPPER', desc: 'Auto-swaps with neighbors', color: GameConfig.COLORS.AUTO_SWAPPER, label: '⇄', labelColor: '#ffffff' },
      { type: 'bomb', name: 'BOMB', desc: 'Explodes after 3 merges!', color: GameConfig.COLORS.BOMB, label: '3', labelColor: '#ffffff' }
    ];

    specialTiles.forEach(tile => {
      // Tile preview
      const tileBox = scene.add.graphics();
      tileBox.fillStyle(tile.color, 1);
      tileBox.lineStyle(2, 0xffffff, 0.3);
      tileBox.fillRoundedRect(leftX, ty - 16, 32, 32, 6);
      tileBox.strokeRoundedRect(leftX, ty - 16, 32, 32, 6);

      // Add special decorations
      if (tile.type === 'steel') {
        tileBox.lineStyle(1, 0x555555, 0.5);
        tileBox.lineBetween(leftX + 6, ty - 8, leftX + 26, ty - 8);
        tileBox.lineBetween(leftX + 6, ty, leftX + 26, ty);
        tileBox.lineBetween(leftX + 6, ty + 8, leftX + 26, ty + 8);
      } else if (tile.type === 'bomb') {
        tileBox.lineStyle(2, 0x444444, 1);
        tileBox.lineBetween(leftX + 16, ty - 14, leftX + 20, ty - 18);
        tileBox.fillStyle(0xffff00, 1);
        tileBox.fillCircle(leftX + 21, ty - 19, 3);
      }
      scrollContent.add(tileBox);

      scrollContent.add(scene.add.text(leftX + 16, ty, tile.label, {
        fontSize: tile.label.length > 1 ? '14px' : '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: tile.labelColor
      }).setOrigin(0.5));

      // Name and description
      scrollContent.add(scene.add.text(leftX + 45, ty - 6, tile.name, {
        fontSize: '13px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
      }).setOrigin(0, 0.5));
      scrollContent.add(scene.add.text(leftX + 45, ty + 8, tile.desc, {
        fontSize: '11px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
      }).setOrigin(0, 0.5));
      ty += 42;
    });

    // ========== TIPS ==========
    ty += 10;
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'PRO TIPS', '#2ecc71');
    ty += 35;

    const tips = [
      'Keep high tiles in corners',
      'Save wildcards for big merges',
      'Use frenzy to clear the board',
      'Watch bomb merge counters!',
      'Plan swaps before swiping'
    ];
    tips.forEach(tip => {
      this.addBulletPoint(scene, scrollContent, leftX, ty, tip, '#2ecc71');
      ty += 22;
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

    // Close button (fixed at bottom)
    const closeBtnBg = scene.add.graphics();
    closeBtnBg.fillStyle(GameConfig.UI.PRIMARY, 0.3);
    closeBtnBg.fillRoundedRect(width/2 - 70, my + mh - 45, 140, 36, 8);
    overlay.add(closeBtnBg);

    const closeBtn = scene.add.text(width / 2, my + mh - 27, 'CLOSE', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
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
   * Helper: Add section header
   */
  addSectionHeader(scene, container, x, y, text, color) {
    // Background bar
    const barWidth = 200;
    const bar = scene.add.graphics();
    bar.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 0.2);
    bar.fillRoundedRect(x - barWidth/2, y - 12, barWidth, 24, 6);
    container.add(bar);

    container.add(scene.add.text(x, y, text, {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: color
    }).setOrigin(0.5));
  },

  /**
   * Helper: Add bullet point
   */
  addBulletPoint(scene, container, x, y, text, color) {
    container.add(scene.add.text(x, y, '•', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: color
    }).setOrigin(0, 0.5));
    container.add(scene.add.text(x + 18, y, text, {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color: '#cccccc'
    }).setOrigin(0, 0.5));
  }
};
