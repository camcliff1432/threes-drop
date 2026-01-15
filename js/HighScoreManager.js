/**
 * HighScoreManager - Handles high score persistence using localStorage
 */
class HighScoreManager {
  constructor() {
    this.STORAGE_KEY = 'threes_drop_scores';
    this.scores = this.loadScores();
  }

  /**
   * Load scores from localStorage
   */
  loadScores() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load high scores:', e);
    }
    return {
      original: 0,
      crazy: 0
    };
  }

  /**
   * Save scores to localStorage
   */
  saveScores() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.scores));
    } catch (e) {
      console.warn('Failed to save high scores:', e);
    }
  }

  /**
   * Get high score for a mode
   * @param {string} mode - 'original' or 'crazy'
   */
  getHighScore(mode) {
    return this.scores[mode] || 0;
  }

  /**
   * Submit a score and update if it's a new high score
   * @param {string} mode - 'original' or 'crazy'
   * @param {number} score - The score to submit
   * @returns {boolean} True if it's a new high score
   */
  submitScore(mode, score) {
    if (mode !== 'original' && mode !== 'crazy') {
      return false;
    }

    const currentHigh = this.scores[mode] || 0;
    if (score > currentHigh) {
      this.scores[mode] = score;
      this.saveScores();
      return true;
    }
    return false;
  }

  /**
   * Reset all high scores
   */
  resetScores() {
    this.scores = {
      original: 0,
      crazy: 0
    };
    this.saveScores();
  }
}

// Global high score manager instance
const highScoreManager = new HighScoreManager();
