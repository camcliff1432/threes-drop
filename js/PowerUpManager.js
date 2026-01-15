/**
 * PowerUpManager - Handles power-up resource economy and frenzy state
 */
class PowerUpManager {
  constructor(config = {}) {
    this.resourcePoints = config.startingPoints || 0;
    this.frenzyMeter = 0;
    this.isFrenzyReady = false;
    this.isFrenzyActive = false;
    this.frenzyEndTime = 0;

    // Power-up availability (configurable per mode/level)
    this.enabledPowerUps = config.enabledPowerUps || ['swipe', 'swapper', 'merger', 'wildcard'];
    this.frenzyEnabled = config.frenzyEnabled !== false;
  }

  /**
   * Called after each merge to add resource points
   */
  addMergePoint() {
    this.resourcePoints++;
    if (this.frenzyEnabled && !this.isFrenzyActive) {
      this.frenzyMeter++;
      if (this.frenzyMeter >= GameConfig.POWERUPS.FRENZY_THRESHOLD) {
        this.isFrenzyReady = true;
      }
    }
  }

  /**
   * Check if a power-up is enabled and affordable
   */
  canAfford(powerUpType) {
    if (!this.enabledPowerUps.includes(powerUpType)) {
      return false;
    }
    return this.resourcePoints >= this.getCost(powerUpType);
  }

  /**
   * Check if a power-up is enabled (regardless of cost)
   */
  isEnabled(powerUpType) {
    return this.enabledPowerUps.includes(powerUpType);
  }

  /**
   * Get cost of a power-up
   */
  getCost(powerUpType) {
    const costs = {
      swipe: GameConfig.POWERUPS.SWIPE_COST,
      swapper: GameConfig.POWERUPS.SWAPPER_COST,
      merger: GameConfig.POWERUPS.MERGER_COST,
      wildcard: GameConfig.POWERUPS.WILDCARD_COST
    };
    return costs[powerUpType] || 0;
  }

  /**
   * Spend points on a power-up
   */
  spend(powerUpType) {
    const cost = this.getCost(powerUpType);
    if (this.canAfford(powerUpType)) {
      this.resourcePoints -= cost;
      return true;
    }
    return false;
  }

  /**
   * Activate frenzy mode
   */
  activateFrenzy() {
    if (this.isFrenzyReady && !this.isFrenzyActive) {
      this.isFrenzyActive = true;
      this.isFrenzyReady = false;
      this.frenzyMeter = 0;
      this.frenzyEndTime = Date.now() + GameConfig.POWERUPS.FRENZY_DURATION;
      return true;
    }
    return false;
  }

  /**
   * Update frenzy timer - returns true if frenzy just ended
   */
  updateFrenzy() {
    if (this.isFrenzyActive && Date.now() >= this.frenzyEndTime) {
      this.isFrenzyActive = false;
      return true; // Frenzy ended
    }
    return false;
  }

  /**
   * Get remaining frenzy time in ms
   */
  getFrenzyTimeRemaining() {
    if (!this.isFrenzyActive) return 0;
    return Math.max(0, this.frenzyEndTime - Date.now());
  }

  /**
   * Get current state for UI updates
   */
  getState() {
    return {
      resourcePoints: this.resourcePoints,
      frenzyMeter: this.frenzyMeter,
      frenzyThreshold: GameConfig.POWERUPS.FRENZY_THRESHOLD,
      isFrenzyReady: this.isFrenzyReady,
      isFrenzyActive: this.isFrenzyActive,
      frenzyTimeRemaining: this.getFrenzyTimeRemaining()
    };
  }

  /**
   * Reset manager state (for new game)
   */
  reset() {
    this.resourcePoints = 0;
    this.frenzyMeter = 0;
    this.isFrenzyReady = false;
    this.isFrenzyActive = false;
    this.frenzyEndTime = 0;
  }
}
