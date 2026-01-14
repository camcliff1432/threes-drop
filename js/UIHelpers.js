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
   * Show the How to Play modal
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

    // Modal
    const mw = 340, mh = 420;
    const mx = (width - mw) / 2, my = (height - mh) / 2;
    const modal = scene.add.graphics();
    modal.fillStyle(GameConfig.UI.BACKGROUND_DARK, 1);
    modal.fillRoundedRect(mx, my, mw, mh, 12);
    modal.lineStyle(2, GameConfig.UI.PRIMARY, 1);
    modal.strokeRoundedRect(mx, my, mw, mh, 12);
    overlay.add(modal);

    // Title
    overlay.add(scene.add.text(width / 2, my + 25, 'HOW TO PLAY', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5));

    // Merge example tiles
    const tiles = [
      { icon: '1', color: GameConfig.COLORS[1] },
      { icon: '+' },
      { icon: '2', color: GameConfig.COLORS[2] },
      { icon: '=' },
      { icon: '3', color: GameConfig.COLORS[3], textColor: '#000000' }
    ];
    const startX = mx + 40, exY = my + 70;
    tiles.forEach((t, i) => {
      if (t.icon === '+' || t.icon === '=') {
        overlay.add(scene.add.text(startX + i * 55, exY, t.icon, {
          fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5));
      } else {
        const box = scene.add.graphics();
        box.fillStyle(t.color, 1);
        box.fillRoundedRect(startX + i * 55 - 18, exY - 18, 36, 36, 6);
        overlay.add(box);
        overlay.add(scene.add.text(startX + i * 55, exY, t.icon, {
          fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: t.textColor || '#ffffff'
        }).setOrigin(0.5));
      }
    });

    // Instructions text
    const lines = [
      'Tap a column to drop a tile.', '',
      '1 + 2 = 3', 'Matching tiles (3+3, 6+6...) double.', '',
      'Fill the SWIPE bar with 5 merges', 'to unlock left/right shifting.', '',
      'Swipes allow horizontal merges', 'and trigger cascading combos!'
    ];
    let ty = my + 120;
    lines.forEach(line => {
      overlay.add(scene.add.text(width / 2, ty, line, {
        fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#cccccc'
      }).setOrigin(0.5));
      ty += 22;
    });

    // Close button
    const closeBtn = scene.add.text(width / 2, my + mh - 35, 'TAP TO CLOSE', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setInteractive();
    overlay.add(closeBtn);

    scene.tweens.add({ targets: closeBtn, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });

    const close = () => {
      overlay.destroy();
      if (onClose) onClose();
    };
    bg.on('pointerdown', close);
    closeBtn.on('pointerdown', close);

    return overlay;
  }
};
