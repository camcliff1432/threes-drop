/**
 * LevelManager - Manages level definitions and progression
 *
 * Levels are loaded from levels.json for easier editing and maintenance.
 * Falls back to inline definitions if JSON loading fails.
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
 * - 'survival': Survive N moves without board filling
 */
class LevelManager {
  constructor() {
    this.levels = this.defineLevels();
    this.currentLevel = null;
    this.levelsLoaded = false;

    // Try to load levels from JSON (async, will update when ready)
    this.loadLevelsFromJSON();
  }

  /**
   * Load levels from external JSON file
   * Falls back to inline definitions if loading fails
   * Note: Will silently fail on file:// protocol due to CORS
   */
  async loadLevelsFromJSON() {
    try {
      // Skip fetch attempt on file:// protocol (will fail due to CORS)
      if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
        this.levelsLoaded = true; // Using inline definitions
        return;
      }

      const response = await fetch('levels.json');
      if (!response.ok) {
        console.warn('Could not load levels.json, using inline definitions');
        this.levelsLoaded = true;
        return;
      }

      const data = await response.json();
      if (data.levels && Array.isArray(data.levels)) {
        this.levels = data.levels;
        this.levelsLoaded = true;
        console.log(`Loaded ${this.levels.length} levels from JSON`);
      }
    } catch (e) {
      // Silently fall back to inline definitions (already loaded in constructor)
      this.levelsLoaded = true;
    }
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
      },

      // ===========================================
      // TEST CHAPTER: DAILY CHALLENGE TYPES (Levels 21-26)
      // Test each challenge type
      // ===========================================

      // Level 21: Score Target Test
      {
        id: 21,
        name: 'TEST: Score Target',
        description: 'Reach 50 points (score_target test)',
        objective: { type: 'score', target: 50 },
        allowedTiles: [1, 2, 3],
        maxMoves: 20,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: true,
        startingPoints: 10,
        specialTiles: { steel: false, lead: false, glass: false }
      },

      // Level 22: Tile Target Test
      {
        id: 22,
        name: 'TEST: Tile Target',
        description: 'Create a 24 tile (tile_target test)',
        objective: { type: 'create_tile', value: 24, count: 1 },
        allowedTiles: [1, 2, 3, 6],
        maxMoves: 25,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: true,
        startingPoints: 10,
        specialTiles: { steel: false, lead: false, glass: false }
      },

      // Level 23: Limited Moves Test
      {
        id: 23,
        name: 'TEST: Limited Moves',
        description: 'Score high in only 10 moves',
        objective: { type: 'score', target: 30 },
        allowedTiles: [1, 2, 3],
        maxMoves: 10,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: false,
        startingPoints: 5,
        specialTiles: { steel: false, lead: false, glass: false }
      },

      // Level 24: No Power-Ups Test
      {
        id: 24,
        name: 'TEST: No Power-Ups',
        description: 'Reach 40 points without power-ups',
        objective: { type: 'score', target: 40 },
        allowedTiles: [1, 2, 3],
        maxMoves: 25,
        startingBoard: null,
        powerUps: { swipe: false, swapper: false, merger: false, wildcard: false },
        frenzyEnabled: false,
        startingPoints: 0,
        specialTiles: { steel: false, lead: false, glass: false }
      },

      // Level 25: Survival Test (max_tiles objective)
      {
        id: 25,
        name: 'TEST: Survival',
        description: 'Survive 15 moves without filling board',
        objective: { type: 'survival', moves: 15 },
        allowedTiles: [1, 2, 3],
        maxMoves: 15,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: true,
        startingPoints: 10,
        specialTiles: { steel: false, lead: false, glass: false }
      },

      // ===========================================
      // TEST CHAPTER: MODIFIERS (Levels 26-32)
      // Test each modifier type
      // ===========================================

      // Level 26: Heavy 1s Modifier
      {
        id: 26,
        name: 'TEST: Heavy 1s',
        description: '1s drop more often',
        objective: { type: 'score', target: 50 },
        allowedTiles: [1, 2, 3],
        maxMoves: 25,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: true,
        startingPoints: 10,
        specialTiles: { steel: false, lead: false, glass: false },
        modifier: { id: 'more_1s', tileWeights: { 1: 0.75, 2: 0.25 } }
      },

      // Level 27: Heavy 2s Modifier
      {
        id: 27,
        name: 'TEST: Heavy 2s',
        description: '2s drop more often',
        objective: { type: 'score', target: 50 },
        allowedTiles: [1, 2, 3],
        maxMoves: 25,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: true,
        startingPoints: 10,
        specialTiles: { steel: false, lead: false, glass: false },
        modifier: { id: 'more_2s', tileWeights: { 1: 0.25, 2: 0.75 } }
      },

      // Level 28: Glass Chaos Modifier
      {
        id: 28,
        name: 'TEST: Glass Chaos',
        description: 'Many glass tiles spawn',
        objective: { type: 'score', target: 75 },
        allowedTiles: [1, 2, 3, 6],
        maxMoves: 30,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: true,
        startingPoints: 10,
        specialTiles: { steel: false, lead: false, glass: true },
        modifier: { id: 'glass_chaos', glassSpawnRate: 0.4 }
      },

      // Level 29: Steel Maze Modifier
      {
        id: 29,
        name: 'TEST: Steel Maze',
        description: 'Start with steel blockers',
        objective: { type: 'score', target: 60 },
        allowedTiles: [1, 2, 3, 6],
        maxMoves: 30,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: true,
        startingPoints: 15,
        specialTiles: { steel: true, lead: false, glass: false },
        modifier: { id: 'steel_maze' },
        startingSpecialTiles: [
          { type: 'steel', col: 0, row: 4, duration: 15 },
          { type: 'steel', col: 1, row: 3, duration: 15 },
          { type: 'steel', col: 2, row: 3, duration: 15 },
          { type: 'steel', col: 3, row: 4, duration: 15 }
        ]
      },

      // Level 30: Frenzy Boost Modifier
      {
        id: 30,
        name: 'TEST: Frenzy Boost',
        description: 'Frenzy charges 2x faster',
        objective: { type: 'create_tile', value: 48, count: 1 },
        allowedTiles: [1, 2, 3, 6, 12],
        maxMoves: 35,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: true,
        startingPoints: 10,
        specialTiles: { steel: false, lead: false, glass: false },
        modifier: { id: 'frenzy_boost', frenzyChargeMultiplier: 2.0 }
      },

      // Level 31: Narrow Board Modifier
      {
        id: 31,
        name: 'TEST: Narrow Board',
        description: 'Only 3 columns available',
        objective: { type: 'score', target: 40 },
        allowedTiles: [1, 2, 3],
        maxMoves: 25,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: true,
        startingPoints: 10,
        specialTiles: { steel: true, lead: false, glass: false },
        modifier: { id: 'narrow_board' },
        startingSpecialTiles: [
          { type: 'steel', col: 3, row: 0, duration: 999 },
          { type: 'steel', col: 3, row: 1, duration: 999 },
          { type: 'steel', col: 3, row: 2, duration: 999 },
          { type: 'steel', col: 3, row: 3, duration: 999 },
          { type: 'steel', col: 3, row: 4, duration: 999 },
          { type: 'steel', col: 3, row: 5, duration: 999 }
        ]
      },

      // Level 32: Combined Modifiers Test
      {
        id: 32,
        name: 'TEST: Combined',
        description: 'Glass Chaos + Steel Maze',
        objective: { type: 'score', target: 100 },
        allowedTiles: [1, 2, 3, 6],
        maxMoves: 40,
        startingBoard: null,
        powerUps: { swipe: true, swapper: true, merger: true, wildcard: true },
        frenzyEnabled: true,
        startingPoints: 20,
        specialTiles: { steel: true, lead: false, glass: true },
        modifier: { id: 'combined', glassSpawnRate: 0.3 },
        startingSpecialTiles: [
          { type: 'steel', col: 0, row: 5, duration: 20 },
          { type: 'steel', col: 3, row: 5, duration: 20 }
        ]
      }
    ];
  }

  getLevel(id) {
    return this.levels.find(l => l.id === id) || null;
  }

  getAllLevels() {
    return this.levels;
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
      case 'survival':
        // Survival: complete if player reaches the move target without board filling
        return gameState.movesUsed >= objective.moves;
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
      case 'survival':
        return `${gameState.movesUsed}/${objective.moves} moves`;
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
