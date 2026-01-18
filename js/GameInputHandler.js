/**
 * GameInputHandler - Handles all input processing for GameScene
 *
 * Extracted from GameScene.js to improve maintainability.
 * Handles touch, mouse, keyboard, and swipe gesture input.
 *
 * @typedef {Object} SwipeData
 * @property {number} startX - Starting X position
 * @property {number} startY - Starting Y position
 * @property {number} time - Start timestamp
 */
class GameInputHandler {
  /**
   * @param {Phaser.Scene} scene - The game scene
   * @param {Object} layout - Layout configuration from GameConfig.getLayout()
   */
  constructor(scene, layout) {
    this.scene = scene;
    this.layout = layout;

    /** @type {SwipeData|null} */
    this.swipeData = null;

    // Swipe detection thresholds
    this.SWIPE_MIN_DISTANCE = 50;
    this.SWIPE_MAX_TIME = 500; // ms
    this.SWIPE_MIN_VELOCITY = 0.3;

    // Double-tap detection for Ultra mode easter egg
    this.lastTapTime = 0;
    this.DOUBLE_TAP_THRESHOLD = 300; // ms
  }

  /**
   * Set up all input handlers
   * @param {Function} onColumnTap - Callback for column tap (col: number)
   * @param {Function} onSwipe - Callback for swipe (direction: 'left'|'right')
   * @param {Function} onDoubleTap - Callback for double-tap easter egg
   */
  setupInputHandlers(onColumnTap, onSwipe, onDoubleTap) {
    this.onColumnTap = onColumnTap;
    this.onSwipe = onSwipe;
    this.onDoubleTap = onDoubleTap;

    // Touch/mouse input on game area
    this.scene.input.on('pointerdown', this.handlePointerDown.bind(this));
    this.scene.input.on('pointerup', this.handlePointerUp.bind(this));

    // Keyboard input
    this.setupKeyboardInput();
  }

  /**
   * Handle pointer down (start of tap or swipe)
   * @param {Phaser.Input.Pointer} pointer
   */
  handlePointerDown(pointer) {
    // Ignore if in UI area (top portion of screen)
    if (pointer.y < this.layout.gridStartY - 20) return;

    // Record swipe start data
    this.swipeData = {
      startX: pointer.x,
      startY: pointer.y,
      time: Date.now()
    };
  }

  /**
   * Handle pointer up (end of tap or swipe)
   * @param {Phaser.Input.Pointer} pointer
   */
  handlePointerUp(pointer) {
    if (!this.swipeData) return;

    const dx = pointer.x - this.swipeData.startX;
    const dy = pointer.y - this.swipeData.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const elapsed = Date.now() - this.swipeData.time;

    // Check for swipe gesture
    if (this.isSwipeGesture(dx, dy, distance, elapsed)) {
      const direction = dx > 0 ? 'right' : 'left';
      if (this.onSwipe) this.onSwipe(direction);
    } else if (distance < 10) {
      // Check for double-tap
      const now = Date.now();
      if (now - this.lastTapTime < this.DOUBLE_TAP_THRESHOLD) {
        if (this.onDoubleTap) this.onDoubleTap();
        this.lastTapTime = 0; // Reset to prevent triple-tap
      } else {
        // Single tap - determine column
        const col = this.getColumnFromX(pointer.x);
        if (col !== null && this.onColumnTap) {
          this.onColumnTap(col);
        }
        this.lastTapTime = now;
      }
    }

    this.swipeData = null;
  }

  /**
   * Check if the pointer movement qualifies as a swipe
   * @param {number} dx - Horizontal distance
   * @param {number} dy - Vertical distance
   * @param {number} distance - Total distance
   * @param {number} elapsed - Time elapsed in ms
   * @returns {boolean}
   */
  isSwipeGesture(dx, dy, distance, elapsed) {
    // Must be primarily horizontal
    if (Math.abs(dx) < Math.abs(dy)) return false;

    // Check minimum distance and time constraints
    if (Math.abs(dx) < this.SWIPE_MIN_DISTANCE) return false;
    if (elapsed > this.SWIPE_MAX_TIME) return false;

    // Check velocity
    const velocity = distance / elapsed;
    if (velocity < this.SWIPE_MIN_VELOCITY) return false;

    return true;
  }

  /**
   * Get column index from X coordinate
   * @param {number} x - X coordinate
   * @returns {number|null} Column index (0-3) or null if outside grid
   */
  getColumnFromX(x) {
    const { gridStartX, cellSize, cellGap } = this.layout;

    for (let col = 0; col < 4; col++) {
      const colX = gridStartX + col * (cellSize + cellGap);
      if (x >= colX && x < colX + cellSize) {
        return col;
      }
    }
    return null;
  }

  /**
   * Set up keyboard input handlers
   */
  setupKeyboardInput() {
    this.scene.input.keyboard.on('keydown-LEFT', () => {
      if (this.onSwipe) this.onSwipe('left');
    });

    this.scene.input.keyboard.on('keydown-RIGHT', () => {
      if (this.onSwipe) this.onSwipe('right');
    });

    // Number keys 1-4 for column selection
    for (let i = 1; i <= 4; i++) {
      this.scene.input.keyboard.on(`keydown-${i}`, () => {
        if (this.onColumnTap) this.onColumnTap(i - 1);
      });
    }
  }

  /**
   * Update layout reference (called on resize)
   * @param {Object} layout - New layout configuration
   */
  updateLayout(layout) {
    this.layout = layout;
  }

  /**
   * Clean up input handlers
   */
  destroy() {
    this.scene.input.off('pointerdown');
    this.scene.input.off('pointerup');
    this.scene.input.keyboard.off('keydown-LEFT');
    this.scene.input.keyboard.off('keydown-RIGHT');
    for (let i = 1; i <= 4; i++) {
      this.scene.input.keyboard.off(`keydown-${i}`);
    }
  }
}
