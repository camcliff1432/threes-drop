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
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(0, 0, width, height);
    bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    overlay.add(bg);

    // Modal dimensions - larger for better readability
    const mw = 380, mh = 620;
    const mx = (width - mw) / 2, my = (height - mh) / 2;
    const modal = scene.add.graphics();
    modal.fillStyle(GameConfig.UI.BACKGROUND_DARK, 1);
    modal.fillRoundedRect(mx, my, mw, mh, 12);
    modal.lineStyle(2, GameConfig.UI.PRIMARY, 1);
    modal.strokeRoundedRect(mx, my, mw, mh, 12);
    overlay.add(modal);

    // Title (fixed, not scrollable)
    overlay.add(scene.add.text(width / 2, my + 25, 'HOW TO PLAY', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5));

    // Scroll hint
    overlay.add(scene.add.text(width / 2, my + 48, '↓ Scroll for more ↓', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', color: '#666666'
    }).setOrigin(0.5));

    // Scrollable content area dimensions
    const scrollX = mx + 10;
    const scrollY = my + 60;
    const scrollW = mw - 20;
    const scrollH = mh - 110; // Leave room for title and close button

    // Create scrollable content container
    const scrollContent = scene.add.container(scrollX, scrollY);
    overlay.add(scrollContent);

    // Create mask for scroll area
    const maskShape = scene.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(scrollX, scrollY, scrollW, scrollH);
    const mask = maskShape.createGeometryMask();
    scrollContent.setMask(mask);

    // Build content inside scrollContent (positions relative to container)
    let ty = 10; // Start position within scroll container
    const contentX = scrollW / 2; // Center X relative to container

    // Merge example tiles
    const tiles = [
      { icon: '1', color: GameConfig.COLORS[1] },
      { icon: '+' },
      { icon: '2', color: GameConfig.COLORS[2] },
      { icon: '=' },
      { icon: '3', color: GameConfig.COLORS[3], textColor: '#000000' }
    ];
    const tileStartX = 55;
    tiles.forEach((t, i) => {
      if (t.icon === '+' || t.icon === '=') {
        scrollContent.add(scene.add.text(tileStartX + i * 55, ty, t.icon, {
          fontSize: '22px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5));
      } else {
        const box = scene.add.graphics();
        box.fillStyle(t.color, 1);
        box.fillRoundedRect(tileStartX + i * 55 - 18, ty - 18, 36, 36, 6);
        scrollContent.add(box);
        scrollContent.add(scene.add.text(tileStartX + i * 55, ty, t.icon, {
          fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: t.textColor || '#ffffff'
        }).setOrigin(0.5));
      }
    });
    ty += 45;

    // Basic instructions
    const basicLines = [
      'Tap a column to drop a tile.',
      '1 + 2 = 3  |  Matching tiles double (3+3=6)',
      'Use arrow keys or swipe gestures to shift tiles.'
    ];
    basicLines.forEach(line => {
      scrollContent.add(scene.add.text(contentX, ty, line, {
        fontSize: '13px', fontFamily: 'Arial, sans-serif', color: '#cccccc'
      }).setOrigin(0.5));
      ty += 20;
    });

    // Game modes section
    ty += 15;
    scrollContent.add(scene.add.text(contentX, ty, 'GAME MODES', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4CAF50'
    }).setOrigin(0.5));
    ty += 22;

    const modeInfo = [
      { name: 'ORIGINAL', desc: 'Classic gameplay - swipe to shift tiles' },
      { name: 'CRAZY', desc: 'All power-ups, frenzy mode, special tiles' },
      { name: 'LEVELS', desc: '20 levels with objectives and challenges' },
    ];
    modeInfo.forEach(mode => {
      scrollContent.add(scene.add.text(15, ty, mode.name, {
        fontSize: '12px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4CAF50'
      }).setOrigin(0, 0.5));
      scrollContent.add(scene.add.text(100, ty, mode.desc, {
        fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
      }).setOrigin(0, 0.5));
      ty += 20;
    });

    // Power-ups section
    ty += 15;
    scrollContent.add(scene.add.text(contentX, ty, 'POWER-UPS', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#f5a623'
    }).setOrigin(0.5));
    ty += 8;
    scrollContent.add(scene.add.text(contentX, ty, '(Crazy & Level Modes)', {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', color: '#888888'
    }).setOrigin(0.5));
    ty += 22;

    const powerUpInfo = [
      { name: 'SWIPE (5pts)', desc: 'Shift all tiles left or right one space' },
      { name: 'SWAP (10pts)', desc: 'Exchange any two tiles on the board' },
      { name: 'MERGE (10pts)', desc: 'Force merge two compatible tiles' },
      { name: 'WILDCARD (20pts)', desc: 'Next tile becomes a wildcard' },
    ];
    powerUpInfo.forEach(pu => {
      scrollContent.add(scene.add.text(15, ty, pu.name, {
        fontSize: '12px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
      }).setOrigin(0, 0.5));
      scrollContent.add(scene.add.text(130, ty, pu.desc, {
        fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
      }).setOrigin(0, 0.5));
      ty += 20;
    });

    // How to earn points
    ty += 8;
    scrollContent.add(scene.add.text(contentX, ty, 'Earn 1 power point for each merge!', {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', fontStyle: 'italic', color: '#f5a623'
    }).setOrigin(0.5));

    // Frenzy mode
    ty += 25;
    scrollContent.add(scene.add.text(contentX, ty, 'FRENZY MODE', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ff6b6b'
    }).setOrigin(0.5));
    ty += 22;
    scrollContent.add(scene.add.text(contentX, ty, '50 merges fills the frenzy meter!', {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#cccccc'
    }).setOrigin(0.5));
    ty += 18;
    scrollContent.add(scene.add.text(contentX, ty, 'When activated:', {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', color: '#888888'
    }).setOrigin(0.5));
    ty += 16;
    scrollContent.add(scene.add.text(contentX, ty, '• 10 seconds of no gravity', {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#ff6b6b'
    }).setOrigin(0.5));
    ty += 16;
    scrollContent.add(scene.add.text(contentX, ty, '• Swipe in all 4 directions (↑↓←→)', {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#ff6b6b'
    }).setOrigin(0.5));

    // Special tiles section
    ty += 30;
    scrollContent.add(scene.add.text(contentX, ty, 'SPECIAL TILES', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#9b59b6'
    }).setOrigin(0.5));
    ty += 28;

    // Helper to create basic tile example
    const createBasicTileExample = (y, color, strokeColor, label, labelColor, description) => {
      const box = scene.add.graphics();
      box.fillStyle(color, 1);
      box.lineStyle(2, strokeColor, 0.8);
      box.fillRoundedRect(15, y - 15, 32, 32, 5);
      box.strokeRoundedRect(15, y - 15, 32, 32, 5);
      scrollContent.add(box);
      scrollContent.add(scene.add.text(31, y, label, {
        fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: labelColor
      }).setOrigin(0.5));
      scrollContent.add(scene.add.text(60, y, description, {
        fontSize: '11px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
      }).setOrigin(0, 0.5));
    };

    // Steel tile with crosshatch pattern
    const steelX = 31, steelY = ty;
    const steelBox = scene.add.graphics();
    steelBox.fillStyle(GameConfig.COLORS.STEEL, 1);
    steelBox.lineStyle(2, 0x4a4a4a, 0.8);
    steelBox.fillRoundedRect(15, ty - 15, 32, 32, 5);
    steelBox.strokeRoundedRect(15, ty - 15, 32, 32, 5);
    // Crosshatch pattern
    steelBox.lineStyle(1, 0x9090a0, 0.4);
    for (let i = -32; i < 32; i += 6) {
      steelBox.lineBetween(Math.max(15, steelX + i - 16), Math.max(ty - 15, steelY - i - 16),
                           Math.min(47, steelX + i + 16), Math.min(ty + 17, steelY - i + 16));
    }
    scrollContent.add(steelBox);
    scrollContent.add(scene.add.text(steelX, steelY, '3', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#333333'
    }).setOrigin(0.5));
    scrollContent.add(scene.add.text(60, ty, 'STEEL - Blocks cell for N turns', {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0, 0.5));
    ty += 40;

    // Lead tile with kettlebell shape
    const leadX = 31, leadY = ty;
    const leadBox = scene.add.graphics();
    leadBox.fillStyle(GameConfig.COLORS.LEAD, 1);
    leadBox.lineStyle(2, 0x444444, 0.8);
    leadBox.fillRoundedRect(15, ty - 15, 32, 32, 5);
    leadBox.strokeRoundedRect(15, ty - 15, 32, 32, 5);
    // Kettlebell body
    leadBox.fillStyle(0x2a2a2a, 1);
    leadBox.fillCircle(leadX, leadY + 4, 10);
    leadBox.fillStyle(0x4a4a4a, 0.6);
    leadBox.fillCircle(leadX - 3, leadY + 1, 4);
    // Kettlebell handle
    leadBox.lineStyle(3, 0x2a2a2a, 1);
    leadBox.beginPath();
    leadBox.arc(leadX, leadY - 4, 8, Math.PI * 0.15, Math.PI * 0.85, false);
    leadBox.strokePath();
    scrollContent.add(leadBox);
    scrollContent.add(scene.add.text(leadX, leadY + 2, '5', {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#888888'
    }).setOrigin(0.5));
    scrollContent.add(scene.add.text(60, ty, 'LEAD - Countdown timer, clears at 0', {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0, 0.5));
    ty += 40;

    // Glass tile
    createBasicTileExample(ty, GameConfig.COLORS.GLASS, 0x87ceeb, '3', '#000000',
      'GLASS - Cracks on adjacent merges');
    ty += 40;

    // Wildcard tile
    createBasicTileExample(ty, GameConfig.COLORS.WILDCARD, 0xff66ff, 'W', '#ffffff',
      'WILDCARD - Matches any tile 3+');
    ty += 45;

    // Tips section
    scrollContent.add(scene.add.text(contentX, ty, 'TIPS', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#2ecc71'
    }).setOrigin(0.5));
    ty += 22;

    const tips = [
      '• Build up high-value tiles in corners',
      '• Save wildcards for high-value merges',
      '• Use frenzy mode strategically',
      '• In levels, focus on objectives first'
    ];
    tips.forEach(tip => {
      scrollContent.add(scene.add.text(contentX, ty, tip, {
        fontSize: '11px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
      }).setOrigin(0.5));
      ty += 18;
    });

    // Total content height
    const totalContentHeight = ty + 20;

    // Scroll variables
    let scrollOffset = 0;
    const maxScroll = Math.max(0, totalContentHeight - scrollH);

    // Scroll bar (only show if content exceeds view)
    let scrollBar = null;
    let scrollBarBg = null;
    const scrollBarWidth = 6;
    const scrollBarX = mx + mw - 15;

    if (maxScroll > 0) {
      // Scroll bar background
      scrollBarBg = scene.add.graphics();
      scrollBarBg.fillStyle(0x333333, 0.5);
      scrollBarBg.fillRoundedRect(scrollBarX, scrollY, scrollBarWidth, scrollH, 3);
      overlay.add(scrollBarBg);

      // Scroll bar handle
      const handleHeight = Math.max(30, (scrollH / totalContentHeight) * scrollH);
      scrollBar = scene.add.graphics();
      scrollBar.fillStyle(GameConfig.UI.PRIMARY, 0.8);
      scrollBar.fillRoundedRect(scrollBarX, scrollY, scrollBarWidth, handleHeight, 3);
      overlay.add(scrollBar);

      // Update scroll bar position
      const updateScrollBar = () => {
        if (scrollBar) {
          const handleHeight = Math.max(30, (scrollH / totalContentHeight) * scrollH);
          const handleY = scrollY + (scrollOffset / maxScroll) * (scrollH - handleHeight);
          scrollBar.clear();
          scrollBar.fillStyle(GameConfig.UI.PRIMARY, 0.8);
          scrollBar.fillRoundedRect(scrollBarX, handleY, scrollBarWidth, handleHeight, 3);
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
        // Check if pointer is within modal bounds
        if (pointer.x >= mx && pointer.x <= mx + mw &&
            pointer.y >= my && pointer.y <= my + mh) {
          scrollOffset = Phaser.Math.Clamp(scrollOffset + deltaY * 0.5, 0, maxScroll);
          scrollContent.y = scrollY - scrollOffset;
          updateScrollBar();
        }
      });
    }

    // Close button (fixed at bottom)
    const closeBtn = scene.add.text(width / 2, my + mh - 30, 'TAP TO CLOSE', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setInteractive();
    overlay.add(closeBtn);

    scene.tweens.add({ targets: closeBtn, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });

    const close = () => {
      // Clean up scroll listeners
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
  }
};
