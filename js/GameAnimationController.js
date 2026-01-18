/**
 * GameAnimationController - Manages animations for GameScene
 *
 * Extracted from GameScene.js to improve maintainability.
 * Handles tile drop animations, merge animations, gravity animations,
 * and special effects like bomb explosions and frenzy mode.
 *
 * Uses ANIM settings from GameConfig for consistent timing.
 */
class GameAnimationController {
  /**
   * @param {Phaser.Scene} scene - The game scene
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Animate a tile dropping from the top
   * @param {Tile} tile - The tile to animate
   * @param {number} targetRow - Target row position
   * @param {number} duration - Animation duration in ms
   * @param {Function} onComplete - Callback when complete
   */
  animateDrop(tile, targetRow, duration, onComplete) {
    tile.dropFromTop(targetRow, duration);
    if (onComplete) {
      this.scene.time.delayedCall(duration, onComplete);
    }
  }

  /**
   * Animate a merge effect (scale pop)
   * @param {Tile} tile - The tile being consumed
   * @param {Function} onComplete - Callback when complete
   */
  animateMergeOut(tile, onComplete) {
    tile.mergeAnimation(onComplete);
  }

  /**
   * Animate a new merged tile appearing
   * @param {Tile} tile - The new merged tile
   * @param {number} duration - Animation duration
   * @param {Function} onComplete - Callback when complete
   */
  animateMergeIn(tile, duration, onComplete) {
    tile.setScale(0.5).setAlpha(0.5);

    this.scene.tweens.add({
      targets: tile,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: duration,
      ease: 'Back.easeOut',
      onComplete: onComplete
    });
  }

  /**
   * Animate tile position change (horizontal shift or fall)
   * @param {Tile} tile - The tile to move
   * @param {number} toCol - Target column
   * @param {number} toRow - Target row
   * @param {number} duration - Animation duration
   * @param {Function} onComplete - Callback when complete
   */
  animateMove(tile, toCol, toRow, duration, onComplete) {
    tile.updatePosition(toCol, toRow, true, duration);
    if (onComplete) {
      this.scene.time.delayedCall(duration, onComplete);
    }
  }

  /**
   * Animate a pulsing glow effect (for ready states)
   * @param {Phaser.GameObjects.GameObject} target - Object to pulse
   * @param {number} minAlpha - Minimum alpha
   * @param {number} duration - Pulse duration
   * @returns {Phaser.Tweens.Tween} The tween object (for stopping)
   */
  animatePulse(target, minAlpha = 0.5, duration = 500) {
    return this.scene.tweens.add({
      targets: target,
      alpha: minAlpha,
      duration: duration,
      yoyo: true,
      repeat: -1
    });
  }

  /**
   * Stop a pulse animation
   * @param {Phaser.GameObjects.GameObject|Phaser.GameObjects.GameObject[]} targets - Objects to stop pulsing
   */
  stopPulse(targets) {
    this.scene.tweens.killTweensOf(targets);
    const targetArray = Array.isArray(targets) ? targets : [targets];
    targetArray.forEach(t => t.setAlpha(1));
  }

  /**
   * Create bomb warning flash animation
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} size - Size of the flash
   * @param {Function} onComplete - Callback when warning complete
   */
  animateBombWarning(x, y, size, onComplete) {
    const flashDuration = 150;
    const flashCount = 2;

    // Create yellow overlay for flashing
    const flash = this.scene.add.graphics();
    flash.fillStyle(0xffff00, 0.7);
    flash.fillRoundedRect(x - size / 2, y - size / 2, size, size, 8);
    flash.setAlpha(0);

    // Flash sequence
    let flashes = 0;
    const doFlash = () => {
      this.scene.tweens.add({
        targets: flash,
        alpha: 1,
        duration: flashDuration / 2,
        yoyo: true,
        onComplete: () => {
          flashes++;
          if (flashes < flashCount) {
            this.scene.time.delayedCall(100, doFlash);
          } else {
            flash.destroy();
            if (onComplete) onComplete();
          }
        }
      });
    };

    doFlash();
  }

  /**
   * Create bomb explosion animation
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} radius - Explosion radius
   * @param {Function} onComplete - Callback when explosion complete
   */
  animateBombExplosion(x, y, radius, onComplete) {
    // Expanding circle
    const circle = this.scene.add.graphics();
    circle.fillStyle(0xff6600, 0.8);
    circle.fillCircle(x, y, 10);

    this.scene.tweens.add({
      targets: circle,
      scaleX: radius / 10,
      scaleY: radius / 10,
      alpha: 0,
      duration: 300,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        circle.destroy();
        if (onComplete) onComplete();
      }
    });

    // Particle effect (simple circles)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.scene.add.graphics();
      particle.fillStyle(0xff9900, 1);
      particle.fillCircle(0, 0, 5);
      particle.setPosition(x, y);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        alpha: 0,
        duration: 250,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }

  /**
   * Create frenzy mode activation effect
   * @param {number} width - Screen width
   * @param {number} height - Screen height
   * @returns {Phaser.GameObjects.Graphics} The overlay (for cleanup)
   */
  animateFrenzyActivation(width, height) {
    // Flash overlay
    const flash = this.scene.add.graphics();
    flash.fillStyle(GameConfig.UI.FRENZY, 0.5);
    flash.fillRect(0, 0, width, height);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy()
    });

    return flash;
  }

  /**
   * Create screen shake effect
   * @param {number} intensity - Shake intensity in pixels
   * @param {number} duration - Shake duration in ms
   */
  shakeScreen(intensity = 5, duration = 100) {
    this.scene.cameras.main.shake(duration, intensity / 100);
  }

  /**
   * Create a floating score popup
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} text - Text to display
   * @param {string} color - Text color
   */
  showFloatingText(x, y, text, color = '#ffffff') {
    const floatText = this.scene.add.text(x, y, text, {
      fontSize: '20px',
      fontFamily: GameConfig.FONTS.NUMBERS,
      fontStyle: '700',
      color: color
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: floatText,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => floatText.destroy()
    });
  }
}
