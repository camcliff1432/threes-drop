/**
 * TutorialSelectScene - Tutorial level selection grid with scrolling
 * Contains all tutorial levels to teach game mechanics
 */
class TutorialSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialSelectScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title (fixed at top)
    this.add.text(width / 2, 50, 'TUTORIAL', {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5).setDepth(100);

    this.add.text(width / 2, 80, 'Learn the basics', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(100);

    // Back button (fixed at top)
    this.add.text(20, 20, '< BACK', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setInteractive().on('pointerdown', () => this.scene.start('MenuScene')).setDepth(100);

    // Scrollable content container
    this.scrollContainer = this.add.container(0, 0);

    // Level grid settings - responsive to screen width
    const cols = 4;
    const total = levelManager.getTotalLevels();
    const rows = Math.ceil(total / cols);

    // Calculate button size and spacing based on screen width
    const margin = 30; // Margin on each side
    const availableWidth = width - margin * 2;
    const buttonSize = Math.min(70, (availableWidth - 30) / cols); // 30px total gap between buttons
    const spacingX = (availableWidth - buttonSize) / (cols - 1);
    const spacingY = buttonSize + 25; // Vertical spacing

    // Center the grid horizontally
    const gridWidth = buttonSize + (cols - 1) * spacingX;
    const startX = (width - gridWidth) / 2 + buttonSize / 2;
    const startY = 120;

    // Calculate content height
    this.contentHeight = startY + rows * spacingY + 40;
    this.scrollY = 0;
    this.minScrollY = Math.min(0, height - this.contentHeight);
    this.maxScrollY = 0;

    // Store button size for createLevelButton
    this.buttonSize = buttonSize;

    // Create level buttons in the container
    for (let i = 0; i < total; i++) {
      const level = levelManager.getLevel(i + 1);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      this.createLevelButton(x, y, level);
    }

    // Setup scrolling
    this.setupScrolling();

    // Scroll indicator (if content is scrollable)
    if (this.contentHeight > height) {
      this.createScrollIndicator();
    }
  }

  createLevelButton(x, y, level) {
    const size = this.buttonSize || 60;
    const fontSize = Math.max(16, Math.floor(size * 0.4));
    const nameFontSize = Math.max(7, Math.floor(size * 0.12));

    const bg = this.add.graphics();
    bg.fillStyle(GameConfig.UI.PRIMARY, 0.3);
    bg.lineStyle(2, GameConfig.UI.PRIMARY, 1);
    bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 8);
    bg.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 8);
    this.scrollContainer.add(bg);

    const numText = this.add.text(x, y - size * 0.1, level.id.toString(), {
      fontSize: `${fontSize}px`, fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);
    this.scrollContainer.add(numText);

    const nameText = this.add.text(x, y + size * 0.28, level.name, {
      fontSize: `${nameFontSize}px`, fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5);
    this.scrollContainer.add(nameText);

    const hitArea = this.add.rectangle(x, y, size, size, 0x000000, 0).setInteractive();
    this.scrollContainer.add(hitArea);

    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(GameConfig.UI.PRIMARY, 0.6);
      bg.lineStyle(2, GameConfig.UI.PRIMARY_LIGHT, 1);
      bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 8);
      bg.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 8);
    });

    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(GameConfig.UI.PRIMARY, 0.3);
      bg.lineStyle(2, GameConfig.UI.PRIMARY, 1);
      bg.fillRoundedRect(x - size / 2, y - size / 2, size, size, 8);
      bg.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 8);
    });

    hitArea.on('pointerdown', () => {
      this.scene.start('GameScene', { mode: 'level', levelId: level.id });
    });
  }

  setupScrolling() {
    const { height } = this.cameras.main;
    let isDragging = false;
    let startPointerY = 0;
    let startScrollY = 0;
    let velocity = 0;
    let lastPointerY = 0;
    let lastTime = 0;

    // Mouse wheel scrolling
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      this.scrollY -= deltaY * 0.5;
      this.scrollY = Phaser.Math.Clamp(this.scrollY, this.minScrollY, this.maxScrollY);
      this.scrollContainer.y = this.scrollY;
      this.updateScrollIndicator();
    });

    // Touch/drag scrolling
    this.input.on('pointerdown', (pointer) => {
      // Only start drag if in scrollable area (below header)
      if (pointer.y > 100) {
        isDragging = true;
        startPointerY = pointer.y;
        startScrollY = this.scrollY;
        lastPointerY = pointer.y;
        lastTime = Date.now();
        velocity = 0;
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (!isDragging) return;

      const deltaY = pointer.y - startPointerY;
      this.scrollY = startScrollY + deltaY;
      this.scrollY = Phaser.Math.Clamp(this.scrollY, this.minScrollY, this.maxScrollY);
      this.scrollContainer.y = this.scrollY;
      this.updateScrollIndicator();

      // Calculate velocity for momentum
      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocity = (pointer.y - lastPointerY) / dt * 16; // Normalize to ~60fps
      }
      lastPointerY = pointer.y;
      lastTime = now;
    });

    this.input.on('pointerup', () => {
      if (isDragging) {
        isDragging = false;
        // Apply momentum scrolling
        if (Math.abs(velocity) > 1) {
          this.applyMomentum(velocity);
        }
      }
    });

    this.input.on('pointerout', () => {
      isDragging = false;
    });
  }

  applyMomentum(initialVelocity) {
    let velocity = initialVelocity;
    const friction = 0.95;

    const updateMomentum = () => {
      if (Math.abs(velocity) < 0.5) return;

      this.scrollY += velocity;
      this.scrollY = Phaser.Math.Clamp(this.scrollY, this.minScrollY, this.maxScrollY);
      this.scrollContainer.y = this.scrollY;
      this.updateScrollIndicator();

      velocity *= friction;

      this.time.delayedCall(16, updateMomentum);
    };

    updateMomentum();
  }

  createScrollIndicator() {
    const { width, height } = this.cameras.main;

    // Scroll track
    this.scrollTrack = this.add.graphics();
    this.scrollTrack.fillStyle(0x333333, 0.5);
    this.scrollTrack.fillRoundedRect(width - 12, 110, 6, height - 130, 3);
    this.scrollTrack.setDepth(100);

    // Scroll thumb
    const thumbHeight = Math.max(30, (height - 130) * ((height - 110) / this.contentHeight));
    this.scrollThumb = this.add.graphics();
    this.scrollThumb.fillStyle(0x4a90e2, 0.8);
    this.scrollThumb.fillRoundedRect(width - 12, 110, 6, thumbHeight, 3);
    this.scrollThumb.setDepth(100);

    this.thumbHeight = thumbHeight;
  }

  updateScrollIndicator() {
    if (!this.scrollThumb) return;

    const { width, height } = this.cameras.main;
    const trackHeight = height - 130;
    const scrollRange = this.maxScrollY - this.minScrollY;
    const scrollProgress = (this.scrollY - this.maxScrollY) / scrollRange;
    const thumbY = 110 + scrollProgress * (trackHeight - this.thumbHeight);

    this.scrollThumb.clear();
    this.scrollThumb.fillStyle(0x4a90e2, 0.8);
    this.scrollThumb.fillRoundedRect(width - 12, thumbY, 6, this.thumbHeight, 3);
  }
}
