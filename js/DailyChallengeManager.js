/**
 * DailyChallengeManager - Generates deterministic daily challenges
 *
 * Uses the current date as a seed to generate the same challenge for all players.
 * Easy to edit/improve by modifying the CHALLENGE_TEMPLATES and generation logic.
 */
class DailyChallengeManager {
  constructor() {
    this.STORAGE_KEY = 'threes_drop_daily';
    this.history = this.loadHistory();
  }

  // ============================================
  // SEEDED RANDOM NUMBER GENERATOR
  // ============================================

  /**
   * Simple seeded random number generator (mulberry32)
   * Same seed = same sequence of random numbers
   */
  createSeededRandom(seed) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /**
   * Convert date string to numeric seed
   */
  dateToSeed(dateStr) {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      const char = dateStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // ============================================
  // CHALLENGE TEMPLATES - EDIT THESE TO ADD NEW CHALLENGES
  // ============================================

  /**
   * Challenge types that can be generated
   */
  CHALLENGE_TYPES = [
    'score_target',      // Reach a target score
    'tile_target',       // Create a specific tile value
    'limited_moves',     // Reach target score within N moves
    'no_power_ups',      // Reach score without power-ups
    'survival',          // Survive N moves without filling the board
  ];

  /**
   * Difficulty configurations
   */
  DIFFICULTY_CONFIG = {
    easy: {
      scoreTargets: [500, 750, 1000, 1250],
      tileTargets: [24, 48],
      moveLimits: [50, 60, 70],
      limitedMoveScoreTargets: [300, 400, 500],
      survivalMoves: [30, 40, 50],
      multiplier: 1.0
    },
    medium: {
      scoreTargets: [1500, 2000, 2500, 3000],
      tileTargets: [48, 96],
      moveLimits: [40, 50, 60],
      limitedMoveScoreTargets: [600, 800, 1000],
      survivalMoves: [50, 60, 70],
      multiplier: 1.5
    },
    hard: {
      scoreTargets: [4000, 5000, 6000, 8000],
      tileTargets: [96, 192],
      moveLimits: [30, 40, 50],
      limitedMoveScoreTargets: [1000, 1500, 2000],
      survivalMoves: [70, 80, 100],
      multiplier: 2.0
    }
  };

  /**
   * Special modifiers that can be applied to challenges
   */
  MODIFIERS = [
    { id: 'none', name: 'Standard', description: 'No special rules' },
    { id: 'more_1s', name: 'Heavy 1s', description: '1s drop more often' },
    { id: 'more_2s', name: 'Heavy 2s', description: '2s drop more often' },
    { id: 'glass_chaos', name: 'Glass Chaos', description: 'More glass tiles spawn' },
    { id: 'steel_maze', name: 'Steel Maze', description: 'Start with steel tiles' },
    { id: 'frenzy_boost', name: 'Frenzy Boost', description: 'Frenzy charges faster' },
    { id: 'narrow_board', name: 'Narrow Board', description: 'Less columns available' },
  ];

  /**
   * Modifier compatibility rules.
   * Maps challenge type -> set of modifier IDs that are incompatible.
   */
  INCOMPATIBLE_MODIFIERS = {
    // no_power_ups disables frenzy, so frenzy_boost is wasted.
    // narrow_board with no power-ups is near-impossible.
    no_power_ups: ['frenzy_boost', 'narrow_board'],
    // tile_target requires balanced tile distribution; weighted drops make it much harder.
    tile_target: ['more_1s', 'more_2s'],
    // survival on a narrow board is too punishing.
    survival: ['narrow_board'],
  };

  // ============================================
  // CHALLENGE GENERATION
  // ============================================

  /**
   * Get today's date string (YYYY-MM-DD)
   */
  getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  /**
   * Generate a challenge for a specific date
   * @param {string} dateStr - Date in YYYY-MM-DD format (defaults to today)
   */
  generateChallenge(dateStr = null) {
    const date = dateStr || this.getTodayString();
    const seed = this.dateToSeed(date);
    const random = this.createSeededRandom(seed);

    // Determine difficulty based on day of week
    // Weekends are harder, mid-week is easier
    const dayOfWeek = new Date(date).getDay();
    let difficulty;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      difficulty = 'hard';
    } else if (dayOfWeek === 3) { // Wednesday
      difficulty = 'easy';
    } else {
      difficulty = 'medium';
    }

    const config = this.DIFFICULTY_CONFIG[difficulty];

    // Pick challenge type
    const typeIndex = Math.floor(random() * this.CHALLENGE_TYPES.length);
    const challengeType = this.CHALLENGE_TYPES[typeIndex];

    // Pick modifier (30% chance of having one), filtering incompatible combos
    let modifier = this.MODIFIERS[0]; // 'none' by default
    if (random() < 0.3) {
      const incompatible = this.INCOMPATIBLE_MODIFIERS[challengeType] || [];
      const compatible = this.MODIFIERS.filter(m => m.id !== 'none' && !incompatible.includes(m.id));
      if (compatible.length > 0) {
        modifier = compatible[Math.floor(random() * compatible.length)];
      }
    }

    // Generate challenge based on type
    const challenge = this.buildChallenge(challengeType, config, random, modifier);

    return {
      date,
      seed,
      difficulty,
      ...challenge,
      modifier,
      rewards: this.calculateRewards(difficulty, challengeType)
    };
  }

  /**
   * Build specific challenge parameters
   */
  buildChallenge(type, config, random, modifier) {
    const pick = (arr) => arr[Math.floor(random() * arr.length)];

    switch (type) {
      case 'score_target':
        return {
          type: 'score_target',
          name: 'Score Challenge',
          description: 'Reach the target score',
          target: pick(config.scoreTargets),
          icon: '🎯'
        };

      case 'tile_target':
        const tileTarget = pick(config.tileTargets);
        return {
          type: 'tile_target',
          name: `Create a ${tileTarget}`,
          description: `Merge tiles to create a ${tileTarget} tile`,
          target: tileTarget,
          icon: '🔢'
        };

      case 'limited_moves':
        const moveLimit = pick(config.moveLimits);
        const moveTarget = pick(config.limitedMoveScoreTargets);
        return {
          type: 'limited_moves',
          name: 'Limited Moves',
          description: `Score ${moveTarget} in ${moveLimit} moves`,
          moveLimit,
          target: moveTarget,
          icon: '👆'
        };

      case 'no_power_ups':
        return {
          type: 'no_power_ups',
          name: 'Purist',
          description: 'Reach the score without using power-ups',
          target: pick(config.scoreTargets) * 0.7 | 0,
          icon: '🚫'
        };

      case 'survival':
        return {
          type: 'survival',
          name: 'Survival',
          description: 'Survive without filling the board',
          survivalMoves: pick(config.survivalMoves),
          icon: '💪'
        };

      default:
        return {
          type: 'score_target',
          name: 'Daily Challenge',
          description: 'Reach the target score',
          target: 1000,
          icon: '🎯'
        };
    }
  }

  /**
   * Calculate rewards for completing challenge
   */
  calculateRewards(difficulty, type) {
    const basePoints = {
      easy: 100,
      medium: 200,
      hard: 350
    };

    const typeBonus = {
      score_target: 1.0,
      tile_target: 1.2,
      limited_moves: 1.3,
      no_power_ups: 1.4,
      survival: 1.1
    };

    return {
      points: Math.floor(basePoints[difficulty] * (typeBonus[type] || 1.0)),
      streak_bonus: 50 // Extra points per day of streak
    };
  }

  // ============================================
  // PROGRESS TRACKING
  // ============================================

  loadHistory() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load daily challenge history:', e);
    }
    return {
      completedDates: [],
      currentStreak: 0,
      longestStreak: 0,
      totalCompleted: 0,
      totalPoints: 0
    };
  }

  saveHistory() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
    } catch (e) {
      console.warn('Failed to save daily challenge history:', e);
    }
  }

  /**
   * Check if today's challenge is completed
   */
  isTodayCompleted() {
    return this.history.completedDates.includes(this.getTodayString());
  }

  /**
   * Mark today's challenge as completed
   * @param {number} score - The score achieved
   */
  completeChallenge(score) {
    const today = this.getTodayString();

    if (this.history.completedDates.includes(today)) {
      return false; // Already completed
    }

    this.history.completedDates.push(today);
    this.history.totalCompleted++;

    // Calculate streak
    const yesterday = this.getYesterdayString();
    if (this.history.completedDates.includes(yesterday)) {
      this.history.currentStreak++;
    } else {
      this.history.currentStreak = 1;
    }

    if (this.history.currentStreak > this.history.longestStreak) {
      this.history.longestStreak = this.history.currentStreak;
    }

    // Add points
    const challenge = this.generateChallenge();
    const points = challenge.rewards.points + (this.history.currentStreak - 1) * challenge.rewards.streak_bonus;
    this.history.totalPoints += points;

    this.saveHistory();
    return { points, streak: this.history.currentStreak };
  }

  getYesterdayString() {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  /**
   * Get player's challenge stats
   */
  getStats() {
    return {
      currentStreak: this.history.currentStreak,
      longestStreak: this.history.longestStreak,
      totalCompleted: this.history.totalCompleted,
      totalPoints: this.history.totalPoints,
      todayCompleted: this.isTodayCompleted()
    };
  }

  /**
   * Reset history (for testing)
   */
  resetHistory() {
    this.history = {
      completedDates: [],
      currentStreak: 0,
      longestStreak: 0,
      totalCompleted: 0,
      totalPoints: 0
    };
    this.saveHistory();
  }
}

// Global instance
const dailyChallengeManager = new DailyChallengeManager();
