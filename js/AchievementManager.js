/**
 * AchievementManager - Tracks and persists achievement progress
 */
class AchievementManager {
  constructor() {
    this.STORAGE_KEY = 'threes_drop_achievements';
    this.stats = this.loadStats();
  }

  // Achievement definitions
  ACHIEVEMENTS = [
    // Tile milestones
    { id: 'first_3', name: 'First Steps', description: 'Create your first 3 tile', icon: '3', category: 'tiles', requirement: { type: 'tile', value: 3 } },
    { id: 'first_6', name: 'Double Trouble', description: 'Create a 6 tile', icon: '6', category: 'tiles', requirement: { type: 'tile', value: 6 } },
    { id: 'first_12', name: 'Getting Warmer', description: 'Create a 12 tile', icon: '12', category: 'tiles', requirement: { type: 'tile', value: 12 } },
    { id: 'first_24', name: 'Two Dozen', description: 'Create a 24 tile', icon: '24', category: 'tiles', requirement: { type: 'tile', value: 24 } },
    { id: 'first_48', name: 'Power Player', description: 'Create a 48 tile', icon: '48', category: 'tiles', requirement: { type: 'tile', value: 48 } },
    { id: 'first_96', name: 'Nearly There', description: 'Create a 96 tile', icon: '96', category: 'tiles', requirement: { type: 'tile', value: 96 } },
    { id: 'first_192', name: 'Master Merger', description: 'Create a 192 tile', icon: '192', category: 'tiles', requirement: { type: 'tile', value: 192 } },
    { id: 'first_384', name: 'Elite Status', description: 'Create a 384 tile', icon: '384', category: 'tiles', requirement: { type: 'tile', value: 384 } },
    { id: 'first_768', name: 'Legendary', description: 'Create a 768 tile', icon: '768', category: 'tiles', requirement: { type: 'tile', value: 768 } },

    // Score milestones
    { id: 'score_100', name: 'Century', description: 'Score 100 points in one game', icon: '100', category: 'score', requirement: { type: 'score', value: 100 } },
    { id: 'score_500', name: 'High Roller', description: 'Score 500 points in one game', icon: '500', category: 'score', requirement: { type: 'score', value: 500 } },
    { id: 'score_1000', name: 'Thousand Club', description: 'Score 1,000 points in one game', icon: '1K', category: 'score', requirement: { type: 'score', value: 1000 } },
    { id: 'score_2500', name: 'Score Master', description: 'Score 2,500 points in one game', icon: '2.5K', category: 'score', requirement: { type: 'score', value: 2500 } },
    { id: 'score_5000', name: 'Point Perfectionist', description: 'Score 5,000 points in one game', icon: '5K', category: 'score', requirement: { type: 'score', value: 5000 } },
    { id: 'score_10000', name: 'Score Legend', description: 'Score 10,000 points in one game', icon: '10K', category: 'score', requirement: { type: 'score', value: 10000 } },

    // Frenzy achievements
    { id: 'frenzy_1', name: 'First Frenzy', description: 'Activate frenzy mode for the first time', icon: 'F', category: 'frenzy', requirement: { type: 'frenzy_count', value: 1 } },
    { id: 'frenzy_5', name: 'Frenzy Fan', description: 'Activate frenzy 5 times total', icon: 'F5', category: 'frenzy', requirement: { type: 'frenzy_count', value: 5 } },
    { id: 'frenzy_10', name: 'Frenzy Master', description: 'Activate frenzy 10 times total', icon: 'F10', category: 'frenzy', requirement: { type: 'frenzy_count', value: 10 } },
    { id: 'frenzy_25', name: 'Frenzy Fanatic', description: 'Activate frenzy 25 times total', icon: 'F25', category: 'frenzy', requirement: { type: 'frenzy_count', value: 25 } },

    // Special tile achievements
    { id: 'glass_5', name: 'Glass Breaker', description: 'Break 5 glass tiles', icon: 'G5', category: 'special', requirement: { type: 'glass_broken', value: 5 } },
    { id: 'glass_25', name: 'Glass Smasher', description: 'Break 25 glass tiles', icon: 'G25', category: 'special', requirement: { type: 'glass_broken', value: 25 } },
    { id: 'glass_100', name: 'Glass Annihilator', description: 'Break 100 glass tiles', icon: 'G!', category: 'special', requirement: { type: 'glass_broken', value: 100 } },
    { id: 'lead_5', name: 'Lead Survivor', description: 'Clear 5 lead tiles', icon: 'L5', category: 'special', requirement: { type: 'lead_cleared', value: 5 } },
    { id: 'lead_25', name: 'Lead Eliminator', description: 'Clear 25 lead tiles', icon: 'L25', category: 'special', requirement: { type: 'lead_cleared', value: 25 } },

    // Bomb achievements
    { id: 'bomb_1', name: 'First Boom', description: 'Detonate your first bomb', icon: 'B1', category: 'bomb', requirement: { type: 'bombs_exploded', value: 1 } },
    { id: 'bomb_5', name: 'Bomb Squad', description: 'Detonate 5 bombs', icon: 'B5', category: 'bomb', requirement: { type: 'bombs_exploded', value: 5 } },
    { id: 'bomb_25', name: 'Demolition Expert', description: 'Detonate 25 bombs', icon: 'B25', category: 'bomb', requirement: { type: 'bombs_exploded', value: 25 } },

    // Game count achievements
    { id: 'games_10', name: 'Regular Player', description: 'Play 10 games', icon: '10', category: 'misc', requirement: { type: 'games_played', value: 10 } },
    { id: 'games_50', name: 'Dedicated', description: 'Play 50 games', icon: '50', category: 'misc', requirement: { type: 'games_played', value: 50 } },
    { id: 'games_100', name: 'Threes Addict', description: 'Play 100 games', icon: '!', category: 'misc', requirement: { type: 'games_played', value: 100 } },

    // Mode achievements
    { id: 'original_play', name: 'Classicist', description: 'Complete a game in Original mode', icon: 'O', category: 'mode', requirement: { type: 'mode_played', value: 'original' } },
    { id: 'crazy_play', name: 'Going Crazy', description: 'Complete a game in Crazy mode', icon: 'C', category: 'mode', requirement: { type: 'mode_played', value: 'crazy' } },
    { id: 'endless_play', name: 'Endless Journey', description: 'Play Endless mode', icon: 'E', category: 'mode', requirement: { type: 'mode_played', value: 'endless' } },

    // Tutorial achievements
    { id: 'tutorial_1', name: 'Student', description: 'Complete your first tutorial', icon: 'T1', category: 'tutorial', requirement: { type: 'levels_completed', value: 1 } },
    { id: 'tutorial_10', name: 'Quick Learner', description: 'Complete 10 tutorials', icon: 'T10', category: 'tutorial', requirement: { type: 'levels_completed', value: 10 } },
    { id: 'tutorial_complete', name: 'Graduate', description: 'Complete all tutorials', icon: 'TG', category: 'tutorial', requirement: { type: 'levels_completed', value: 20 } }
  ];

  loadStats() {
    try {
      const stored = storageBatcher.get(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load achievement stats:', e);
    }
    return {
      unlockedAchievements: [],
      // Cumulative stats
      highestTile: 0,
      highestScore: 0,
      frenzyCount: 0,
      glassBroken: 0,
      leadCleared: 0,
      bombsExploded: 0,
      gamesPlayed: 0,
      levelsCompleted: 0,
      modesPlayed: []
    };
  }

  saveStats() {
    try {
      storageBatcher.set(this.STORAGE_KEY, JSON.stringify(this.stats));
    } catch (e) {
      console.warn('Failed to save achievement stats:', e);
    }
  }

  /**
   * Check if an achievement is unlocked
   */
  isUnlocked(achievementId) {
    return this.stats.unlockedAchievements.includes(achievementId);
  }

  /**
   * Unlock an achievement if not already unlocked
   * @returns {boolean} True if newly unlocked
   */
  unlock(achievementId) {
    if (this.isUnlocked(achievementId)) return false;
    this.stats.unlockedAchievements.push(achievementId);
    this.saveStats();
    return true;
  }

  /**
   * Get all achievements with their unlock status
   */
  getAllAchievements() {
    return this.ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: this.isUnlocked(a.id)
    }));
  }

  /**
   * Get unlocked count
   */
  getUnlockedCount() {
    return this.stats.unlockedAchievements.length;
  }

  /**
   * Get total count
   */
  getTotalCount() {
    return this.ACHIEVEMENTS.length;
  }

  /**
   * Record a tile being created and check achievements
   */
  recordTile(value) {
    if (value > this.stats.highestTile) {
      this.stats.highestTile = value;
      this.saveStats();
    }
    this.checkTileAchievements(value);
  }

  /**
   * Record a game score and check achievements
   */
  recordScore(score) {
    if (score > this.stats.highestScore) {
      this.stats.highestScore = score;
      this.saveStats();
    }
    this.checkScoreAchievements(score);
  }

  /**
   * Record frenzy activation
   */
  recordFrenzy() {
    this.stats.frenzyCount++;
    this.saveStats();
    this.checkFrenzyAchievements();
  }

  /**
   * Record glass tile broken
   */
  recordGlassBroken() {
    this.stats.glassBroken++;
    this.saveStats();
    this.checkSpecialTileAchievements();
  }

  /**
   * Record lead tile cleared
   */
  recordLeadCleared() {
    this.stats.leadCleared++;
    this.saveStats();
    this.checkSpecialTileAchievements();
  }

  /**
   * Record bomb exploded
   */
  recordBombExploded() {
    this.stats.bombsExploded++;
    this.saveStats();
    this.checkBombAchievements();
  }

  /**
   * Record game played
   */
  recordGamePlayed(mode) {
    this.stats.gamesPlayed++;
    if (!this.stats.modesPlayed.includes(mode)) {
      this.stats.modesPlayed.push(mode);
    }
    this.saveStats();
    this.checkGameAchievements(mode);
  }

  /**
   * Record level completed
   */
  recordLevelCompleted() {
    this.stats.levelsCompleted++;
    this.saveStats();
    this.checkLevelAchievements();
  }

  /**
   * Get the current stat value for a given requirement type
   * @param {string} type - The requirement type from the ACHIEVEMENTS definition
   * @param {*} currentValue - Optional context value (e.g. tile value, score, mode)
   * @returns {number|string|null} The current stat value
   */
  getStatForRequirement(type, currentValue) {
    switch (type) {
      case 'tile': return currentValue;
      case 'score': return currentValue;
      case 'frenzy_count': return this.stats.frenzyCount;
      case 'glass_broken': return this.stats.glassBroken;
      case 'lead_cleared': return this.stats.leadCleared;
      case 'bombs_exploded': return this.stats.bombsExploded;
      case 'games_played': return this.stats.gamesPlayed;
      case 'levels_completed': return this.stats.levelsCompleted;
      case 'mode_played': return currentValue;
      default: return null;
    }
  }

  /**
   * Generic achievement checker - evaluates requirement from ACHIEVEMENTS data
   * @param {Object} achievement - Achievement definition from ACHIEVEMENTS array
   * @param {*} currentValue - Optional context value (e.g. tile value, score, mode)
   */
  checkAchievement(achievement, currentValue) {
    if (this.isUnlocked(achievement.id)) return;
    const req = achievement.requirement;
    const stat = this.getStatForRequirement(req.type, currentValue);
    if (stat === null) return;

    if (req.type === 'mode_played') {
      // Mode achievements: unlock if the current mode matches the required value
      if (stat === req.value) {
        this.unlock(achievement.id);
      }
    } else {
      // Numeric threshold achievements: unlock if stat >= required value
      if (stat >= req.value) {
        this.unlock(achievement.id);
      }
    }
  }

  /**
   * Check all achievements matching the given requirement types
   * @param {string|string[]} types - Requirement type(s) to check
   * @param {*} currentValue - Optional context value
   */
  checkAchievementsByType(types, currentValue) {
    const typeArr = Array.isArray(types) ? types : [types];
    this.ACHIEVEMENTS
      .filter(a => typeArr.includes(a.requirement.type))
      .forEach(a => this.checkAchievement(a, currentValue));
  }

  // Achievement checking methods - delegate to generic checker
  checkTileAchievements(value) {
    this.checkAchievementsByType('tile', value);
  }

  checkScoreAchievements(score) {
    this.checkAchievementsByType('score', score);
  }

  checkFrenzyAchievements() {
    this.checkAchievementsByType('frenzy_count');
  }

  checkSpecialTileAchievements() {
    this.checkAchievementsByType(['glass_broken', 'lead_cleared']);
  }

  checkBombAchievements() {
    this.checkAchievementsByType('bombs_exploded');
  }

  checkGameAchievements(mode) {
    this.checkAchievementsByType('games_played');
    this.checkAchievementsByType('mode_played', mode);
  }

  checkLevelAchievements() {
    this.checkAchievementsByType('levels_completed');
  }

  /**
   * Reset all achievement data (for testing)
   */
  reset() {
    this.stats = {
      unlockedAchievements: [],
      highestTile: 0,
      highestScore: 0,
      frenzyCount: 0,
      glassBroken: 0,
      leadCleared: 0,
      bombsExploded: 0,
      gamesPlayed: 0,
      levelsCompleted: 0,
      modesPlayed: []
    };
    this.saveStats();
  }
}

// Global instance
const achievementManager = new AchievementManager();
