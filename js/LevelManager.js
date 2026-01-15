/**
 * LevelManager - Manages level definitions and progression
 *
 * Level Config Schema:
 * {
 *   id: number,
 *   name: string,
 *   description: string,
 *   objective: { type: string, value?: number, count?: number, target?: number },
 *   allowedTiles: number[],
 *   maxMoves: number,
 *   startingBoard: array|null,
 *
 *   // Power-up configuration
 *   powerUps: { swipe: boolean, swapper: boolean, merger: boolean, wildcard: boolean },
 *   frenzyEnabled: boolean,
 *   startingPoints: number,  // Starting resource points
 *
 *   // Special tile configuration
 *   specialTiles: { steel: boolean, lead: boolean, glass: boolean },
 *   startingSpecialTiles: array|null  // Pre-placed special tiles
 * }
 *
 * Objective Types:
 * - 'create_tile': Create N tiles of value V
 * - 'score': Reach target score
 * - 'max_tiles': Have at most N tiles on board
 * - 'clear_lead': Clear N lead tiles (let countdown reach 0)
 * - 'clear_glass': Break N glass tiles
 */
class LevelManager {
  constructor() {
    this.levels = this.defineLevels();
    this.currentLevel = null;
  }

  defineLevels() {
    return [
      // ===========================================
      // CHAPTER 1: BASICS (Levels 1-5)
      // Learn core mechanics - no power-ups
      // ===========================================

      // Level 1: Tutorial - Create a 3
      {
        id: 1,
        name: 'First Steps',
        description: 'Combine 1 + 2 to make 3',
        objective: { type: 'create_tile', value: 3, count: 1 },
        allowedTiles: [1, 2],
        maxMoves: 10,
        startingBoard: null,
        powerUps: { swipe: false, swapper: false, merger: false, wildcard: false },
        frenzyEnabled: false,
        startingPoints: 0,
        specialTiles: { steel: false, lead: false, glass: false }
      },
      // Level 2: Make two 3s
      {
        id: 2,
        name: 'Double Trouble',
        description: 'Create two 3 tiles',
        objective: { type: 'create_tile', value: 3, count: 2 },
        allowedTiles: [1, 2],
        maxMoves: 12,
        startingBoard: null,
        powerUps: { swipe: false, swapper: false, merger: false, wildcard: false },
        frenzyEnabled: false,
        startingPoints: 0,
        specialTiles: { steel: false, lead: false, glass: false }
      },
      // Level 3: Create a 6
      {
        id: 3,
        name: 'Level Up',
        description: 'Combine two 3s to make 6',
        objective: { type: 'create_tile', value: 6, count: 1 },
        allowedTiles: [1, 2, 3],
        maxMoves: 15,
        startingBoard: null,
        powerUps: { swipe: false, swapper: false, merger: false, wildcard: false },
        frenzyEnabled: false,
        startingPoints: 0,
        specialTiles: { steel: false, lead: false, glass: false }
      },
      // Level 4: Score challenge
      {
        id: 4,
        name: 'Score Hunter',
        description: 'Reach 30 points',
        objective: { type: 'score', target: 30 },
        allowedTiles: [1, 2, 3],
        maxMoves: 15,
        startingBoard: null,
        powerUps: { swipe: false, swapper: false, merger: false, wildcard: false },
        frenzyEnabled: false,
        startingPoints: 0,
        specialTiles: { steel: false, lead: false, glass: false }
      },
      // Level 5: Create a 12
      {
        id: 5,
        name: 'Dozen',
        description: 'Create a 12 tile',
        objective: { type: 'create_tile', value: 12, count: 1 },
        allowedTiles: [1, 2, 3],
        maxMoves: 20,
        startingBoard: null,
        powerUps: { swipe: false, swapper: false, merger: false, wildcard: false },
        frenzyEnabled: false,
        startingPoints: 0,
        specialTiles: { steel: false, lead: false, glass: false }
      },

      // ===========================================
      // CHAPTER 2: POWER-UPS (Levels 6-10)
      // Introduces each power-up one at a time
      // ===========================================

      // Level 6: Introduction to Swipe
      {
        id: 6,
        name: 'Swipe Right',
        description: 'Use SWIPE to create a 12',
        objective: { type: 'create_tile', value: 12, count: 1 },
        allowedTiles: [1, 2, 3],
        maxMoves: 15,
        startingBoard: [
          [3, null, null, null, null, null],
          [1, 2, null, null, null, null],
          [2, 1, null, null, null, null],
          [3, null, null, null, null, null]
        ],
        powerUps: { swipe: true, swapper: false, merger: false, wildcard: false },
        frenzyEnabled: false,
        startingPoints: 10,
        specialTiles: { steel: false, lead: false, glass: false }
      },
      // Level 7: Introduction to Swap
      {
        id: 7,
        name: 'Swap Meet',
        description: 'Use SWAP to create a 6',
        objective: { type: 'create_tile', value: 6, count: 1 },
        allowedTiles: [1, 2, 3],
        maxMoves: 10,
        startingBoard: [
          [3, null, null, null, null, null],
          [1, null, null, null, null, null],
          [2, null, null, null, null, null],
          [3, null, null, null, null, null]
        ],
        powerUps: { swipe: false, swapper: true, merger: false, wildcard: false },
        frenzyEnabled: false,
        startingPoints: 10,
        specialTiles: { steel: false, lead: false, glass: false }
      },
      // Level 8: Introduction to Merger
      {
        id: 8,
        name: 'Force Merge',
        description: 'Use MERGE to create a 12',
        objective: { type: 'create_tile', value: 12, count: 1 },
        allowedTiles: [1, 2, 3, 6],
        maxMoves: 12,
        startingBoard: [
          [6, null, null, null, null, null],
          [3, null, null, null, null, null],
          [3, null, null, null, null, null],
          [6, null, null, null, null, null]
        ],
        powerUps: { swipe: false, swapper: false, merger: true, wildcard: false },
        frenzyEnabled: false,
        startingPoints: 10,
        specialTiles: { steel: false, lead: false, glass: false }
      },
      // Level 9: Introduction to Wildcard
      {
        id: 9,
        name: 'Wild Thing',
        description: 'Use WILDCARD to create a 24',
        objective: { type: 'create_tile', value: 24, count: 1 },
        allowedTiles: [1, 2, 3, 6],
        maxMoves: 15,
        startingBoard: [
          [12, null, null, null, null, null],
          [6, 3, null, null, null, null],
          [3, 6, null, null, null, null],
          [12, null, null, null, null, null]
        ],
        powerUps: { swipe: false, swapper: false, merger: false, wildcard: true },
        frenzyEnabled: false,
        startingPoints: 20,
        specialTiles: { steel: false, lead: false, glass: false }
      },
      // Level 10: All power-ups combined
      {
        id: 10,
        name: 'Power Play',
        description: 'Reach 100 points',
        objective: { type: 'score', target: 100 },
        allowedTiles: [1, 2, 3, 6],
        maxMoves: 20,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: false,
        startingPoints: 15,
        specialTiles: { steel: false, lead: false, glass: false }
      },

      // ===========================================
      // CHAPTER 3: SPECIAL TILES (Levels 11-15)
      // Introduces special tile types
      // ===========================================

      // Level 11: Introduction to Glass
      {
        id: 11,
        name: 'Glass House',
        description: 'Break 2 glass tiles',
        objective: { type: 'clear_glass', count: 2 },
        allowedTiles: [1, 2, 3],
        maxMoves: 20,
        startingBoard: null,
        powerUps: { swipe: true, swapper: false, merger: false, wildcard: false },
        frenzyEnabled: false,
        startingPoints: 5,
        specialTiles: { steel: false, lead: false, glass: true },
        glassSpawnRate: 0.25,  // Force spawn glass tiles
        startingSpecialTiles: [
          { type: 'glass', col: 1, row: 0, value: 3, durability: 2 },
          { type: 'glass', col: 2, row: 0, value: 3, durability: 2 }
        ]
      },
      // Level 12: Introduction to Lead
      {
        id: 12,
        name: 'Lead Weight',
        description: 'Let 2 lead tiles expire',
        objective: { type: 'clear_lead', count: 2 },
        allowedTiles: [1, 2, 3],
        maxMoves: 25,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: false, wildcard: false },
        frenzyEnabled: false,
        startingPoints: 10,
        specialTiles: { steel: false, lead: true, glass: false },
        leadSpawnRate: 0.20,  // Force spawn lead tiles
        startingSpecialTiles: [
          { type: 'lead', col: 1, row: 0, countdown: 6 },
          { type: 'lead', col: 2, row: 0, countdown: 8 }
        ]
      },
      // Level 13: Introduction to Steel
      {
        id: 13,
        name: 'Steel Nerves',
        description: 'Reach 75 points with blockers',
        objective: { type: 'score', target: 75 },
        allowedTiles: [1, 2, 3, 6],
        maxMoves: 25,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: false },
        frenzyEnabled: false,
        startingPoints: 15,
        specialTiles: { steel: true, lead: false, glass: false },
        startingSpecialTiles: [
          { type: 'steel', col: 1, row: 3, duration: 8 },
          { type: 'steel', col: 2, row: 3, duration: 8 }
        ]
      },
      // Level 14: Glass challenge
      {
        id: 14,
        name: 'Shattered',
        description: 'Break 4 glass tiles',
        objective: { type: 'clear_glass', count: 4 },
        allowedTiles: [1, 2, 3, 6],
        maxMoves: 30,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: false },
        frenzyEnabled: false,
        startingPoints: 15,
        specialTiles: { steel: false, lead: false, glass: true },
        glassSpawnRate: 0.30,
        startingSpecialTiles: [
          { type: 'glass', col: 0, row: 0, value: 3, durability: 2 },
          { type: 'glass', col: 1, row: 0, value: 6, durability: 2 },
          { type: 'glass', col: 2, row: 0, value: 6, durability: 2 },
          { type: 'glass', col: 3, row: 0, value: 3, durability: 2 }
        ]
      },
      // Level 15: Mixed special tiles
      {
        id: 15,
        name: 'Mixed Bag',
        description: 'Create a 24 tile',
        objective: { type: 'create_tile', value: 24, count: 1 },
        allowedTiles: [1, 2, 3, 6],
        maxMoves: 30,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: false },
        frenzyEnabled: false,
        startingPoints: 15,
        specialTiles: { steel: true, lead: true, glass: true }
      },

      // ===========================================
      // CHAPTER 4: FRENZY (Levels 16-18)
      // Introduces Frenzy mode
      // ===========================================

      // Level 16: Frenzy introduction
      {
        id: 16,
        name: 'Frenzy Time',
        description: 'Create a 48 tile',
        objective: { type: 'create_tile', value: 48, count: 1 },
        allowedTiles: [1, 2, 3, 6, 12],
        maxMoves: 40,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: true,
        startingPoints: 10,
        specialTiles: { steel: false, lead: false, glass: false }
      },
      // Level 17: Frenzy score challenge
      {
        id: 17,
        name: 'Frenzy Score',
        description: 'Reach 250 points',
        objective: { type: 'score', target: 250 },
        allowedTiles: [1, 2, 3, 6, 12],
        maxMoves: 45,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: true,
        startingPoints: 10,
        specialTiles: { steel: false, lead: false, glass: false }
      },
      // Level 18: Frenzy + special tiles
      {
        id: 18,
        name: 'Chaos Mode',
        description: 'Create a 48 tile',
        objective: { type: 'create_tile', value: 48, count: 1 },
        allowedTiles: [1, 2, 3, 6, 12],
        maxMoves: 50,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: true,
        startingPoints: 20,
        specialTiles: { steel: true, lead: true, glass: true }
      },

      // ===========================================
      // CHAPTER 5: MASTER (Levels 19-20)
      // Ultimate challenges
      // ===========================================

      // Level 19: Big tile challenge
      {
        id: 19,
        name: 'Grand Master',
        description: 'Create a 96 tile',
        objective: { type: 'create_tile', value: 96, count: 1 },
        allowedTiles: [1, 2, 3, 6, 12, 24],
        maxMoves: 60,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: true,
        startingPoints: 25,
        specialTiles: { steel: true, lead: true, glass: true }
      },
      // Level 20: Ultimate challenge
      {
        id: 20,
        name: 'Ultimate',
        description: 'Create a 192 tile',
        objective: { type: 'create_tile', value: 192, count: 1 },
        allowedTiles: [1, 2, 3, 6, 12, 24, 48],
        maxMoves: 80,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: true,
        startingPoints: 30,
        specialTiles: { steel: true, lead: true, glass: true }
      }
    ];
  }

  getLevel(id) {
    return this.levels.find(l => l.id === id) || null;
  }

  getTotalLevels() {
    return this.levels.length;
  }

  /**
   * Check if objective is complete
   */
  checkObjective(objective, gameState) {
    switch (objective.type) {
      case 'create_tile':
        return (gameState.tilesCreated[objective.value] || 0) >= objective.count;
      case 'score':
        return gameState.score >= objective.target;
      case 'max_tiles':
        return gameState.tileCount <= objective.count;
      case 'clear_lead':
        return (gameState.leadCleared || 0) >= objective.count;
      case 'clear_glass':
        return (gameState.glassCleared || 0) >= objective.count;
      default:
        return false;
    }
  }

  /**
   * Get objective progress as a string
   */
  getProgressText(objective, gameState) {
    switch (objective.type) {
      case 'create_tile':
        const created = gameState.tilesCreated[objective.value] || 0;
        return `${created}/${objective.count}`;
      case 'score':
        return `${gameState.score}/${objective.target}`;
      case 'max_tiles':
        return `${gameState.tileCount} tiles`;
      case 'clear_lead':
        const leadCleared = gameState.leadCleared || 0;
        return `${leadCleared}/${objective.count}`;
      case 'clear_glass':
        const glassCleared = gameState.glassCleared || 0;
        return `${glassCleared}/${objective.count}`;
      default:
        return '';
    }
  }

  /**
   * Get power-up config for a level
   */
  getLevelPowerUpConfig(levelId) {
    const level = this.getLevel(levelId);
    if (!level) return null;

    const enabledPowerUps = [];
    if (level.powerUps) {
      if (level.powerUps.swipe) enabledPowerUps.push('swipe');
      if (level.powerUps.swapper) enabledPowerUps.push('swapper');
      if (level.powerUps.merger) enabledPowerUps.push('merger');
      if (level.powerUps.wildcard) enabledPowerUps.push('wildcard');
    }

    return {
      enabledPowerUps,
      frenzyEnabled: level.frenzyEnabled || false,
      startingPoints: level.startingPoints || 0
    };
  }

  /**
   * Get special tile config for a level
   */
  getLevelSpecialTileConfig(levelId) {
    const level = this.getLevel(levelId);
    if (!level) return null;

    return {
      steelEnabled: level.specialTiles?.steel || false,
      leadEnabled: level.specialTiles?.lead || false,
      glassEnabled: level.specialTiles?.glass || false,
      startingSpecialTiles: level.startingSpecialTiles || []
    };
  }
}

// Global level manager instance
const levelManager = new LevelManager();
