// === js/types.js ===
/**
 * Threes-Drop Type Definitions
 *
 * This file contains JSDoc type definitions for the game's core data structures.
 * These types improve IDE autocomplete and documentation without requiring TypeScript.
 *
 * @fileoverview Type definitions for Threes-Drop game
 */

// ===========================================
// TILE TYPES
// ===========================================

/**
 * @typedef {'normal'|'steel'|'lead'|'glass'|'wildcard'|'auto_swapper'|'bomb'} TileType
 * The type of a tile, determining its behavior and appearance
 */

/**
 * @typedef {Object} SpecialTileData
 * @property {number} [turnsRemaining] - Turns until steel plate expires
 * @property {number} [countdown] - Countdown for lead tiles
 * @property {number} [durability] - Durability for glass tiles (1-3)
 * @property {number} [value] - Tile value (for glass, auto_swapper, bomb)
 * @property {number} [swapsRemaining] - Swaps until auto_swapper expires
 * @property {number} [nextSwapIn] - Moves until next auto-swap
 * @property {number} [mergesRemaining] - Merges until bomb explodes
 */

/**
 * @typedef {Object} TileTypeConfig
 * @property {string} colorKey - Key in GameConfig.COLORS for this tile type
 * @property {number} strokeColor - Stroke color as hex number
 * @property {number} strokeAlpha - Stroke alpha (0-1)
 * @property {string} textColor - CSS color for tile text
 * @property {string} fontSize - CSS font size
 * @property {string} [displayText] - Override text (e.g., '★' for wildcard)
 */

// ===========================================
// BOARD & GAME STATE
// ===========================================

/**
 * @typedef {(number|null)[][]} GameBoard
 * 4x6 grid where each cell is null (empty) or a number (tile value)
 * Indexed as board[col][row]
 */

/**
 * @typedef {Object} BoardOperation
 * @property {'move'|'merge'|'fall'|'fall-merge'|'frenzy-move'|'frenzy-merge'} type
 * @property {number} fromCol - Source column
 * @property {number} fromRow - Source row (for gravity operations)
 * @property {number} toCol - Target column
 * @property {number} toRow - Target row (for gravity operations)
 * @property {number} [row] - Row (for horizontal operations)
 * @property {number} [col] - Column (for vertical operations)
 * @property {number} [value] - Resulting value after merge
 */

/**
 * @typedef {Object} DropResult
 * @property {boolean} success - Whether the drop was successful
 * @property {string} [reason] - Reason for failure
 * @property {number} [row] - Row where tile landed
 * @property {number} [finalRow] - Final row after merges
 * @property {number} [finalValue] - Final value after merges
 * @property {boolean} [merged] - Whether a merge occurred
 * @property {number} [tileId] - ID assigned to the tile
 */

/**
 * @typedef {Object} GameState
 * @property {number} score - Current score
 * @property {number} movesUsed - Number of moves made
 * @property {number} mergeCount - Merge count for combo meter
 * @property {Object.<number, number>} tilesCreated - Map of tile values to creation count
 * @property {number} highestTile - Highest tile value created
 */

// ===========================================
// LEVEL CONFIGURATION
// ===========================================

/**
 * @typedef {Object} LevelObjective
 * @property {'create_tile'|'score'|'clear_glass'|'clear_lead'|'survival'} type
 * @property {number} [value] - Target tile value (for create_tile)
 * @property {number} [count] - Number needed (for create_tile, clear_*)
 * @property {number} [target] - Target score (for score)
 * @property {number} [moves] - Moves to survive (for survival)
 */

/**
 * @typedef {Object} LevelPowerUps
 * @property {boolean} swipe - Whether swipe is available
 * @property {boolean} swapper - Whether swapper is available
 * @property {boolean} merger - Whether merger is available
 * @property {boolean} wildcard - Whether wildcard is available
 */

/**
 * @typedef {Object} LevelSpecialTiles
 * @property {boolean} steel - Whether steel tiles can spawn
 * @property {boolean} lead - Whether lead tiles can spawn
 * @property {boolean} glass - Whether glass tiles can spawn
 */

/**
 * @typedef {Object} LevelModifier
 * @property {string} id - Modifier identifier
 * @property {Object.<string, number>} [tileWeights] - Override tile spawn weights
 * @property {number} [glassSpawnRate] - Override glass spawn rate
 * @property {number} [frenzyChargeMultiplier] - Multiplier for frenzy charging
 */

/**
 * @typedef {Object} StartingSpecialTile
 * @property {TileType} type - The special tile type
 * @property {number} col - Column position
 * @property {number} row - Row position
 * @property {number} [duration] - Duration for steel tiles
 * @property {number} [countdown] - Countdown for lead tiles
 * @property {number} [value] - Value for glass tiles
 * @property {number} [durability] - Durability for glass tiles
 */

/**
 * @typedef {Object} LevelConfig
 * @property {number} id - Unique level ID
 * @property {string} name - Display name
 * @property {string} description - Level description
 * @property {LevelObjective} objective - Win condition
 * @property {number[]} allowedTiles - Tile values that can spawn
 * @property {number} maxMoves - Maximum moves allowed
 * @property {GameBoard|null} startingBoard - Initial board state
 * @property {LevelPowerUps} powerUps - Available power-ups
 * @property {boolean} frenzyEnabled - Whether frenzy mode is available
 * @property {number} startingPoints - Starting resource points
 * @property {LevelSpecialTiles} specialTiles - Special tile spawning config
 * @property {StartingSpecialTile[]} [startingSpecialTiles] - Pre-placed special tiles
 * @property {number} [glassSpawnRate] - Glass spawn rate (0-1)
 * @property {number} [leadSpawnRate] - Lead spawn rate (0-1)
 * @property {Object.<string, number>} [tileWeights] - Override tile spawn weights
 * @property {LevelModifier} [modifier] - Level modifier
 */

// ===========================================
// SAVE STATE
// ===========================================

/**
 * @typedef {Object} PowerUpState
 * @property {number} resourcePoints - Current resource points
 * @property {number} frenzyMeter - Current frenzy meter value
 * @property {boolean} isFrenzyReady - Whether frenzy can be activated
 * @property {boolean} isFrenzyActive - Whether frenzy is currently active
 * @property {number|null} frenzyEndTime - Timestamp when frenzy ends
 */

/**
 * @typedef {Object} SpecialTilesState
 * @property {Array} steelPlates - Steel plate data
 * @property {Array} leadTiles - Lead tile data
 * @property {Array} glassTiles - Glass tile data
 * @property {Array} autoSwapperTiles - Auto-swapper tile data
 * @property {Array} bombTiles - Bomb tile data
 */

/**
 * @typedef {Object} SavedGameState
 * @property {number} version - Save state version for migrations
 * @property {string} gameMode - Game mode ('original'|'crazy'|'endless'|'level'|'daily')
 * @property {number} [levelId] - Level ID (for level mode)
 * @property {GameBoard} board - Current board state
 * @property {number} score - Current score
 * @property {number} movesUsed - Moves used
 * @property {number} mergeCount - Merge count
 * @property {Object.<number, number>} tilesCreated - Tiles created map
 * @property {number} nextTileId - Next tile ID
 * @property {number} nextTileValue - Next tile value
 * @property {TileType} nextTileType - Next tile type
 * @property {PowerUpState} powerUpState - Power-up state
 * @property {SpecialTilesState|null} specialTilesState - Special tiles state
 * @property {number} glassCleared - Glass tiles cleared
 * @property {number} leadCleared - Lead tiles cleared
 * @property {number} savedAt - Timestamp
 */

// ===========================================
// SPECIAL TILE EVENTS
// ===========================================

/**
 * @typedef {Object} SpecialTileEvent
 * @property {string} type - Event type
 * @property {number} col - Column position
 * @property {number} row - Row position
 * @property {number} [countdown] - Countdown value (for lead_decremented)
 * @property {number} [durability] - Durability value (for glass_cracked)
 * @property {number} [turnsRemaining] - Turns remaining (for steel_tick)
 * @property {number} [swapsRemaining] - Swaps remaining (for swapper events)
 * @property {number} [value] - Tile value (for swapper_expired)
 * @property {number} [fromCol] - Source column (for auto_swap)
 * @property {number} [fromRow] - Source row (for auto_swap)
 * @property {number} [toCol] - Target column (for auto_swap)
 * @property {number} [toRow] - Target row (for auto_swap)
 */

/**
 * Event types:
 * - 'steel_removed': Steel plate expired
 * - 'steel_tick': Steel plate countdown decreased
 * - 'lead_removed': Lead tile expired
 * - 'lead_decremented': Lead tile countdown decreased
 * - 'glass_broken': Glass tile destroyed
 * - 'glass_cracked': Glass tile durability decreased
 * - 'auto_swap': Auto-swapper swapped positions
 * - 'swapper_expired': Auto-swapper became normal tile
 * - 'swapper_tick': Auto-swapper swap counter decreased
 */

// ===========================================
// BOMB MERGE RESULT
// ===========================================

/**
 * @typedef {Object} BombMergeResult
 * @property {boolean} exploded - Whether the bomb exploded
 * @property {number} [mergesRemaining] - Merges remaining if not exploded
 * @property {Array<{col: number, row: number, value: number}>} [affectedTiles] - Tiles affected by explosion
 * @property {number} [totalPoints] - Points earned from explosion
 */

// ===========================================
// UI LAYOUT
// ===========================================

/**
 * @typedef {Object} LayoutConfig
 * @property {number} tileSize - Tile size in pixels
 * @property {number} cellSize - Cell size including gap
 * @property {number} cellGap - Gap between cells
 * @property {number} offsetX - Grid X offset
 * @property {number} offsetY - Grid Y offset
 * @property {number} gridStartX - Grid starting X position
 * @property {number} gridStartY - Grid starting Y position
 * @property {number} gridWidth - Total grid width
 * @property {number} gridHeight - Total grid height
 */

// ===========================================
// DAILY CHALLENGE
// ===========================================

/**
 * @typedef {Object} DailyChallenge
 * @property {string} date - Date string (YYYY-MM-DD)
 * @property {number} seed - Random seed for the day
 * @property {LevelObjective} objective - Challenge objective
 * @property {LevelModifier} [modifier] - Challenge modifier
 * @property {number[]} allowedTiles - Allowed tile values
 * @property {number} maxMoves - Maximum moves
 * @property {LevelSpecialTiles} specialTiles - Special tile config
 */

/**
 * @typedef {Object} DailyChallengeResult
 * @property {string} date - Date of the challenge
 * @property {boolean} completed - Whether challenge was completed
 * @property {number} score - Final score
 * @property {number} movesUsed - Moves used
 */

// Export nothing - this file is just for JSDoc definitions


// === js/config.js ===
/**
 * GameConfig - Centralized game configuration
 * All magic numbers and settings live here for easy tuning
 */
const GameConfig = {
  // Save state version - increment when save format changes
  SAVE_VERSION: 1,

  // Sound settings
  SOUND: {
    MASTER_VOLUME: 0.3
  },

  // Visual juice settings
  JUICE: {
    MERGE_PARTICLE_COUNT: 6,
    SHAKE_MIN_VALUE: 48,
    COMBO_MIN_COUNT: 2
  },

  // Typography - Clean, friendly fonts
  FONTS: {
    DISPLAY: '"Nunito", "Helvetica Neue", sans-serif',  // Titles, headers
    NUMBERS: '"Nunito", "Helvetica Neue", sans-serif',  // Tile numbers, scores
    UI: '"Nunito", "Helvetica Neue", sans-serif'        // UI text, buttons
  },

  // UI text sizes for consistent styling
  UI_SIZES: {
    TITLE: '32px',
    LABEL: '14px',
    BUTTON: '16px',
    HELP_BUTTON: '24px',
    SCORE: '18px',
    PREVIEW_TILE: 48,
    COMBO_BAR_WIDTH: 200,
    COMBO_BAR_HEIGHT: 30,
    POWER_UP_BUTTON_WIDTH: 56,
    POWER_UP_BUTTON_HEIGHT: 36,
    FRENZY_BAR_WIDTH: 180,
    FRENZY_BAR_HEIGHT: 16,
    SWIPE_BUTTON_WIDTH: 55,
    SWIPE_BUTTON_HEIGHT: 28
  },

  // Grid settings
  GRID: {
    COLS: 4,
    ROWS: 6,
    TILE_SIZE: 70,
    OFFSET_X: 60,
    OFFSET_Y: 150
  },

  // Animation durations (ms)
  ANIM: {
    DROP: 200,
    MERGE: 150,
    FALL: 120,
    SHIFT: 150
  },

  // Gameplay settings
  GAMEPLAY: {
    COMBO_MAX: 5,
    COMBO_COST: 5,
    SWIPE_THRESHOLD: 50,
    IMBALANCE_THRESHOLD: 6
  },

  // Power-up costs and settings
  POWERUPS: {
    SWIPE_COST: 5,
    SWAPPER_COST: 10,
    MERGER_COST: 10,
    WILDCARD_COST: 20,
    FRENZY_THRESHOLD: 50,
    FRENZY_DURATION: 10000  // 10 seconds in ms
  },

  // Special tile settings
  SPECIAL_TILES: {
    STEEL_SPAWN_CHANCE: 0.05,  // 5% per drop
    STEEL_MIN_DURATION: 3,
    STEEL_MAX_DURATION: 6,
    LEAD_MIN_COUNTDOWN: 3,
    LEAD_MAX_COUNTDOWN: 7,
    GLASS_INITIAL_DURABILITY: 2,
    GLASS_SPAWN_CHANCE: 0.03,  // 3% per drop
    LEAD_SPAWN_CHANCE: 0.02,   // 2% per drop
    // Auto-Swapper settings
    AUTO_SWAPPER_SPAWN_CHANCE: 0.04,  // 4% per drop
    AUTO_SWAPPER_SWAPS: 3,            // Expires after 3 swaps
    AUTO_SWAPPER_SWAP_MIN: 4,         // Swaps every 4-10 moves
    AUTO_SWAPPER_SWAP_MAX: 10,
    // Bomb settings
    BOMB_SPAWN_CHANCE: 0.03,   // 3% per drop (endless mode only)
    BOMB_MERGE_TRIGGER: 3      // Explodes after 3 merges
  },

  // Daily challenge settings
  DAILY_CHALLENGE: {
    MODIFIER_CHANCE: 0.3,      // 30% chance of modifier
    GLASS_CHAOS_SPAWN_RATE: 0.35,
    DEFAULT_GLASS_VALUES: [3, 6, 12]
  },

  /**
   * Tile type visual configuration - eliminates switch statements in Tile.js
   * Each type defines colors, stroke styles, and text styling
   */
  TILE_TYPES: {
    steel: {
      colorKey: 'STEEL',
      strokeColor: 0x6a7a8a,
      strokeAlpha: 0.4,
      textColor: '#4a5a6a',
      fontSize: '22px'
    },
    lead: {
      colorKey: 'LEAD',
      strokeColor: 0x333333,
      strokeAlpha: 0.3,
      textColor: '#888888',
      fontSize: '26px'
    },
    glass: {
      colorKey: 'GLASS',
      strokeColor: 0x8ab4d4,
      strokeAlpha: 0.5,
      textColor: '#2a5080',
      fontSize: '26px'
    },
    wildcard: {
      colorKey: 'WILDCARD',
      strokeColor: 0xc090d0,
      strokeAlpha: 0.5,
      textColor: '#ffffff',
      fontSize: '32px',
      displayText: '★'
    },
    auto_swapper: {
      colorKey: 'AUTO_SWAPPER',
      strokeColor: 0x8a6ca2,
      strokeAlpha: 0.5,
      textColor: '#ffffff',
      fontSize: '22px'
    },
    bomb: {
      colorKey: 'BOMB',
      strokeColor: 0xc05050,
      strokeAlpha: 0.5,
      textColor: '#ffffff',
      fontSize: '22px'
    }
  },

  // Game mode configurations
  GAME_MODES: {
    original: {
      powerUps: ['swipe'],
      frenzy: false,
      specialTiles: false,
      autoSwapper: false,
      bomb: false
    },
    crazy: {
      powerUps: ['swipe', 'swapper', 'merger', 'wildcard'],
      frenzy: true,
      specialTiles: true,
      autoSwapper: true,
      bomb: false
    },
    endless: {
      powerUps: ['swipe', 'swapper', 'merger', 'wildcard'],
      frenzy: true,
      specialTiles: true,
      autoSwapper: true,
      bomb: true
    }
  },

  // Tile colors by value - Soft, friendly palette inspired by Threes
  COLORS: {
    1: 0x66c3d5,    // Soft sky blue
    2: 0xe88a8a,    // Soft coral pink
    3: 0xf5f5f5,    // Off-white / cream
    6: 0xf5c26b,    // Warm honey
    12: 0x7cc576,   // Soft sage green
    24: 0x5fb3d4,   // Ocean blue
    48: 0xc49cde,   // Lavender
    96: 0xf2a477,   // Peach
    192: 0x7dd3c0,  // Mint
    384: 0xe8b4cb,  // Rose
    768: 0xa8c5e2,  // Periwinkle
    1536: 0xf0d264, // Soft gold
    3072: 0xd4a5a5, // Dusty rose
    DEFAULT: 0x9e9e9e,
    // Special tile colors
    STEEL: 0x8899a6,
    LEAD: 0x4a4a4a,
    GLASS: 0xb8d4e8,
    WILDCARD: 0xdba4eb,
    AUTO_SWAPPER: 0xa78dc2,
    BOMB: 0xe07676
  },

  // Score thresholds for unlocking higher tiles (classic mode)
  UNLOCK_THRESHOLDS: {
    6: 50,
    12: 150,
    24: 400,
    48: 1000,
    96: 2500
  },

  // UI Colors - Clean, warm aesthetic
  UI: {
    PRIMARY: 0x5a9fd4,       // Calm blue accent
    PRIMARY_LIGHT: 0x7eb8e5,
    SUCCESS: 0x7cc576,       // Soft green
    DANGER: 0xe07676,        // Soft red
    WARNING: 0xf5c26b,       // Warm honey
    FRENZY: 0xc49cde,        // Lavender
    BACKGROUND_DARK: 0x3d4f5f,   // Slate blue-gray
    BACKGROUND_LIGHT: 0x4a5d6e,  // Lighter slate
    GRID_BG: 0x2d3d4d,       // Dark slate for grid
    CELL_BG: 0x3a4a5a,       // Cell background
    DISABLED: 0x6b7b8b,
    TEXT_DARK: 0x2c3e50,     // Dark text
    TEXT_LIGHT: 0xffffff     // Light text
  },

  /**
   * Dynamic layout calculator for responsive UI
   * Call with current screen dimensions to get proper sizing
   */
  getLayout(width, height) {
    // Reserve space for header (title, score, buttons) and footer (power-ups, controls)
    const headerHeight = 140;
    const footerHeight = 140;
    const horizontalMargin = 30;

    // Calculate available space for the grid
    const availableWidth = width - (horizontalMargin * 2);
    const availableHeight = height - headerHeight - footerHeight;

    // Calculate tile size to fit grid in available space
    // Grid is 4 columns x 6 rows
    const tileSizeByWidth = availableWidth / 4;
    const tileSizeByHeight = availableHeight / 6;
    const tileSize = Math.min(tileSizeByWidth, tileSizeByHeight, 90);

    // Calculate grid dimensions
    const gridWidth = tileSize * 4;
    const gridHeight = tileSize * 6;

    // Center the grid horizontally
    const offsetX = (width - gridWidth) / 2;
    // Position grid below header
    const offsetY = headerHeight;

    return {
      tileSize: Math.floor(tileSize),
      gridWidth: Math.floor(gridWidth),
      gridHeight: Math.floor(gridHeight),
      offsetX: Math.floor(offsetX),
      offsetY: Math.floor(offsetY),
      headerHeight,
      footerHeight,
      // Footer starts after grid
      footerY: offsetY + gridHeight + 10,
      // Screen dimensions for reference
      screenWidth: width,
      screenHeight: height
    };
  }
};

/**
 * Get tile color for a value
 */
function getTileColor(value) {
  return GameConfig.COLORS[value] || GameConfig.COLORS.DEFAULT;
}

/**
 * Get text color for a tile (black for white tiles, white otherwise)
 */
function getTileTextColor(value) {
  return value === 3 ? '#000000' : '#ffffff';
}


// === js/SoundManager.js ===
/**
 * SoundManager - Procedural sound effects using Web Audio API
 * No audio files needed - all sounds synthesized from oscillators and noise.
 * AudioContext created lazily on first user interaction (browser autoplay policy).
 */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.muted = localStorage.getItem('threes_sound_muted') === 'true';
    this.masterVolume = GameConfig.SOUND ? GameConfig.SOUND.MASTER_VOLUME : 0.3;
  }

  /**
   * Initialize AudioContext on first user interaction
   */
  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('threes_sound_muted', this.muted);
    return this.muted;
  }

  /**
   * Play a named sound effect
   * @param {string} name - Sound name
   * @param {number} [param] - Optional parameter (e.g. tile value for merge pitch)
   */
  play(name, param) {
    if (this.muted || !this.ctx) return;
    // Resume context if suspended (autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    try {
      switch (name) {
        case 'drop': this._playDrop(); break;
        case 'merge': this._playMerge(param); break;
        case 'combo': this._playCombo(param); break;
        case 'frenzy': this._playFrenzy(); break;
        case 'gameOver': this._playGameOver(); break;
        case 'click': this._playClick(); break;
        case 'swipe': this._playSwipe(); break;
        case 'swap': this._playSwap(); break;
        case 'merger': this._playMerger(); break;
        case 'wildcard': this._playWildcard(); break;
        case 'explosion': this._playExplosion(); break;
      }
    } catch (e) {
      // Silently fail - audio is non-critical
    }
  }

  /**
   * Trigger haptic feedback if available
   * @param {number|number[]} pattern - Vibration pattern in ms
   */
  haptic(pattern) {
    if (this.muted) return;
    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      // Haptics not supported
    }
  }

  // ---- Sound implementations ----

  /**
   * Drop sound - sine sweep 200Hz -> 100Hz, 80ms
   */
  _playDrop() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);
    gain.gain.setValueAtTime(this.masterVolume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Merge sound - sine tone pitched by tile value, 150ms
   * @param {number} value - Tile value (higher = higher pitch)
   */
  _playMerge(value) {
    const t = this.ctx.currentTime;
    // Map tile value to frequency: 3->330, 6->370, 12->415, 24->466, 48->523, 96->587, 192->659
    const baseFreq = 330;
    const semitones = value ? Math.log2(value / 3) * 2 : 0;
    const freq = baseFreq * Math.pow(2, semitones / 12);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.2, t + 0.05);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.15);
    gain.gain.setValueAtTime(this.masterVolume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);

    this.haptic(15);
  }

  /**
   * Combo sound - ascending tones, pitch offset by combo count
   * @param {number} count - Combo count (2, 3, 4, ...)
   */
  _playCombo(count) {
    const t = this.ctx.currentTime;
    const baseFreq = 440 + (count || 2) * 60;
    const notes = Math.min(count || 2, 5);

    for (let i = 0; i < notes; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const noteFreq = baseFreq * Math.pow(2, i * 3 / 12);
      const noteTime = t + i * 0.06;
      osc.frequency.setValueAtTime(noteFreq, noteTime);
      gain.gain.setValueAtTime(this.masterVolume * 0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.1);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.1);
    }
  }

  /**
   * Frenzy sound - sawtooth sweep 200Hz -> 800Hz, 400ms
   */
  _playFrenzy() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.4);
    gain.gain.setValueAtTime(this.masterVolume * 0.25, t);
    gain.gain.linearRampToValueAtTime(this.masterVolume * 0.3, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);

    this.haptic([20, 10, 20, 10, 40]);
  }

  /**
   * Game over sound - triangle 400Hz -> 100Hz, 500ms
   */
  _playGameOver() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.5);
    gain.gain.setValueAtTime(this.masterVolume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  /**
   * Click sound - white noise burst, 30ms
   */
  _playClick() {
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.03;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.masterVolume * 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, t);
    source.connect(filter).connect(gain).connect(this.ctx.destination);
    source.start(t);
  }

  /**
   * Swipe sound - bandpass-filtered noise whoosh, 200ms
   */
  _playSwipe() {
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.exponentialRampToValueAtTime(3000, t + 0.2);
    filter.Q.setValueAtTime(5, t);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.masterVolume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    source.connect(filter).connect(gain).connect(this.ctx.destination);
    source.start(t);
  }

  /**
   * Swap sound - two quick alternating tones (tile exchange), 180ms
   */
  _playSwap() {
    const t = this.ctx.currentTime;
    // First tone (descending)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(520, t);
    osc1.frequency.exponentialRampToValueAtTime(340, t + 0.08);
    gain1.gain.setValueAtTime(this.masterVolume * 0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc1.connect(gain1).connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.08);

    // Second tone (ascending) - offset by 90ms
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(340, t + 0.09);
    osc2.frequency.exponentialRampToValueAtTime(520, t + 0.18);
    gain2.gain.setValueAtTime(0.01, t);
    gain2.gain.setValueAtTime(this.masterVolume * 0.3, t + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    osc2.connect(gain2).connect(this.ctx.destination);
    osc2.start(t + 0.09);
    osc2.stop(t + 0.18);
  }

  /**
   * Merger sound - rising chord (two simultaneous tones converging), 200ms
   */
  _playMerger() {
    const t = this.ctx.currentTime;
    // Low tone rising
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(280, t);
    osc1.frequency.exponentialRampToValueAtTime(440, t + 0.2);
    gain1.gain.setValueAtTime(this.masterVolume * 0.25, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc1.connect(gain1).connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.2);

    // High tone falling to meet it
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(600, t);
    osc2.frequency.exponentialRampToValueAtTime(440, t + 0.2);
    gain2.gain.setValueAtTime(this.masterVolume * 0.25, t);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc2.connect(gain2).connect(this.ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.2);
  }

  /**
   * Wildcard sound - sparkly descending arpeggio, 250ms
   */
  _playWildcard() {
    const t = this.ctx.currentTime;
    const notes = [880, 660, 550, 440];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const noteTime = t + i * 0.06;
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(this.masterVolume * 0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.1);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.1);
    });
  }

  /**
   * Explosion sound - noise burst + low sine thud 60Hz
   */
  _playExplosion() {
    const t = this.ctx.currentTime;
    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(this.masterVolume * 0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    noiseSource.connect(noiseGain).connect(this.ctx.destination);
    noiseSource.start(t);

    // Low thud
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);
    oscGain.gain.setValueAtTime(this.masterVolume * 0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(oscGain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);

    this.haptic([30, 20, 50]);
  }
}

// Global singleton
const soundManager = new SoundManager();


// === js/HighScoreManager.js ===
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
      crazy: 0,
      endless: 0
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
   * @param {string} mode - 'original', 'crazy', or 'endless'
   * @param {number} score - The score to submit
   * @returns {boolean} True if it's a new high score
   */
  submitScore(mode, score) {
    if (mode !== 'original' && mode !== 'crazy' && mode !== 'endless') {
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
      crazy: 0,
      endless: 0
    };
    this.saveScores();
  }
}

// Global high score manager instance
const highScoreManager = new HighScoreManager();


// === js/LevelManager.js ===
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


// === js/CustomLevelLoader.js ===
/**
 * CustomLevelLoader - Load and manage custom levels from JSON
 *
 * This module allows loading levels created with the Level Editor
 * into the game without modifying LevelManager.js directly.
 *
 * Usage:
 * 1. Create a level with level-editor.html
 * 2. Save the JSON to custom-levels.json or paste directly
 * 3. Call customLevelLoader.loadFromJSON(levelData)
 * 4. Play via level select or directly with customLevelLoader.getLevel(id)
 */
class CustomLevelLoader {
  constructor() {
    this.customLevels = [];
    this.storageKey = 'threes_custom_levels';
    this.loadFromStorage();
  }

  /**
   * Load custom levels from localStorage
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.customLevels = JSON.parse(saved);
        console.log(`Loaded ${this.customLevels.length} custom levels from storage`);
      }
    } catch (e) {
      console.error('Failed to load custom levels:', e);
      this.customLevels = [];
    }
  }

  /**
   * Save custom levels to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.customLevels));
    } catch (e) {
      console.error('Failed to save custom levels:', e);
    }
  }

  /**
   * Add a new custom level from JSON
   * @param {Object|string} levelData - Level object or JSON string
   * @returns {Object} The added level
   */
  addLevel(levelData) {
    const level = typeof levelData === 'string' ? JSON.parse(levelData) : levelData;

    // Validate required fields
    if (!level.id || !level.name || !level.objective) {
      throw new Error('Level must have id, name, and objective');
    }

    // Check for duplicate ID
    const existingIndex = this.customLevels.findIndex(l => l.id === level.id);
    if (existingIndex >= 0) {
      // Replace existing
      this.customLevels[existingIndex] = level;
      console.log(`Updated custom level ${level.id}: ${level.name}`);
    } else {
      // Add new
      this.customLevels.push(level);
      console.log(`Added custom level ${level.id}: ${level.name}`);
    }

    // Sort by ID
    this.customLevels.sort((a, b) => a.id - b.id);

    this.saveToStorage();
    return level;
  }

  /**
   * Add multiple levels at once
   * @param {Array} levels - Array of level objects
   */
  addLevels(levels) {
    levels.forEach(level => this.addLevel(level));
  }

  /**
   * Load levels from a JSON file
   * @param {string} url - URL to JSON file
   * @returns {Promise<Array>} Loaded levels
   */
  async loadFromFile(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();

      // Handle both single level and array
      const levels = Array.isArray(data) ? data : [data];
      this.addLevels(levels);

      return levels;
    } catch (e) {
      console.error('Failed to load levels from file:', e);
      throw e;
    }
  }

  /**
   * Get a custom level by ID
   * @param {number} id - Level ID
   * @returns {Object|null} Level or null if not found
   */
  getLevel(id) {
    return this.customLevels.find(l => l.id === id) || null;
  }

  /**
   * Get all custom levels
   * @returns {Array} All custom levels
   */
  getAllLevels() {
    return [...this.customLevels];
  }

  /**
   * Get custom level count
   * @returns {number} Number of custom levels
   */
  getCount() {
    return this.customLevels.length;
  }

  /**
   * Remove a custom level
   * @param {number} id - Level ID to remove
   * @returns {boolean} True if removed
   */
  removeLevel(id) {
    const index = this.customLevels.findIndex(l => l.id === id);
    if (index >= 0) {
      this.customLevels.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Clear all custom levels
   */
  clearAll() {
    this.customLevels = [];
    this.saveToStorage();
  }

  /**
   * Export all custom levels as JSON string
   * @returns {string} JSON string of all levels
   */
  exportAll() {
    return JSON.stringify(this.customLevels, null, 2);
  }

  /**
   * Import levels from JSON string (replaces all)
   * @param {string} json - JSON string of levels array
   */
  importAll(json) {
    const levels = JSON.parse(json);
    this.customLevels = Array.isArray(levels) ? levels : [levels];
    this.customLevels.sort((a, b) => a.id - b.id);
    this.saveToStorage();
  }

  /**
   * Check if a level ID exists in custom levels
   * @param {number} id - Level ID
   * @returns {boolean} True if exists
   */
  hasLevel(id) {
    return this.customLevels.some(l => l.id === id);
  }

  /**
   * Get the next available custom level ID
   * @param {number} startFrom - Minimum ID to start from (default 1000)
   * @returns {number} Next available ID
   */
  getNextId(startFrom = 1000) {
    if (this.customLevels.length === 0) return startFrom;
    const maxId = Math.max(...this.customLevels.map(l => l.id));
    return Math.max(maxId + 1, startFrom);
  }
}

// Global instance
const customLevelLoader = new CustomLevelLoader();

/**
 * Integration with LevelManager
 * Patches the levelManager to include custom levels
 */
function integrateCustomLevels() {
  if (typeof levelManager === 'undefined') {
    console.warn('LevelManager not found, custom level integration skipped');
    return;
  }

  // Store original methods
  const originalGetLevel = levelManager.getLevel.bind(levelManager);
  const originalGetTotalLevels = levelManager.getTotalLevels.bind(levelManager);

  // Override getLevel to check custom levels first
  levelManager.getLevel = function(id) {
    // Check custom levels first (allows overriding built-in levels)
    const customLevel = customLevelLoader.getLevel(id);
    if (customLevel) {
      return customLevel;
    }
    // Fall back to built-in levels
    return originalGetLevel(id);
  };

  // Override getTotalLevels to include custom levels
  levelManager.getTotalLevels = function() {
    const builtIn = originalGetTotalLevels();
    const custom = customLevelLoader.getCount();
    return builtIn + custom;
  };

  // Add method to get all levels including custom
  levelManager.getAllLevelsIncludingCustom = function() {
    const builtIn = this.levels || [];
    const custom = customLevelLoader.getAllLevels();
    return [...builtIn, ...custom];
  };

  // Add method to get only custom levels
  levelManager.getCustomLevels = function() {
    return customLevelLoader.getAllLevels();
  };

  console.log('Custom level integration complete');
}

// Auto-integrate when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', integrateCustomLevels);
} else {
  // DOM already loaded, integrate after a short delay to ensure levelManager exists
  setTimeout(integrateCustomLevels, 100);
}


// === js/PowerUpManager.js ===
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

    // Frenzy charge multiplier (for modifiers like frenzy_boost)
    this.frenzyChargeMultiplier = config.frenzyChargeMultiplier || 1.0;
  }

  /**
   * Called after each merge to add resource points
   */
  addMergePoint() {
    this.resourcePoints++;
    if (this.frenzyEnabled && !this.isFrenzyActive) {
      // Apply frenzy charge multiplier (e.g., 2.0 for double charge speed)
      this.frenzyMeter += this.frenzyChargeMultiplier;
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


// === js/SpecialTileManager.js ===
/**
 * SpecialTileManager - Handles special tile logic (Steel, Lead, Glass, AutoSwapper, Bomb)
 */
class SpecialTileManager {
  constructor(boardLogic) {
    this.boardLogic = boardLogic;
    this.steelPlates = [];     // {col, row, turnsRemaining}
    this.leadTiles = [];       // {col, row, countdown}
    this.glassTiles = [];      // {col, row, durability, value}
    this.autoSwapperTiles = []; // {col, row, movesRemaining, nextSwapIn, value}
    this.bombTiles = [];       // {col, row, mergesRemaining, value}
  }

  /**
   * Get all tile arrays for iteration
   * @returns {Array} Array of all special tile arrays
   */
  _getAllTileArrays() {
    return [
      this.steelPlates,
      this.leadTiles,
      this.glassTiles,
      this.autoSwapperTiles,
      this.bombTiles
    ];
  }

  /**
   * Get tile arrays that can move (excludes steel which is fixed)
   * @returns {Array} Array of movable tile arrays
   */
  _getMovableTileArrays() {
    return [
      this.leadTiles,
      this.glassTiles,
      this.autoSwapperTiles,
      this.bombTiles
    ];
  }

  /**
   * Generate position key for lookups
   */
  _posKey(col, row) {
    return `${col},${row}`;
  }

  /**
   * Spawn a steel plate in a random empty cell
   * @returns {Object|null} The spawned plate info or null if no space
   */
  spawnSteelPlate() {
    const emptyCell = this.findRandomEmptyCell();
    if (!emptyCell) return null;

    const duration = Math.floor(Math.random() *
      (GameConfig.SPECIAL_TILES.STEEL_MAX_DURATION - GameConfig.SPECIAL_TILES.STEEL_MIN_DURATION + 1)) +
      GameConfig.SPECIAL_TILES.STEEL_MIN_DURATION;

    const plate = {
      col: emptyCell.col,
      row: emptyCell.row,
      turnsRemaining: duration,
      type: 'steel'
    };
    this.steelPlates.push(plate);

    // Mark cell as blocked in board
    this.boardLogic.board[emptyCell.col][emptyCell.row] = { type: 'steel', blocked: true };

    return plate;
  }

  /**
   * Spawn a lead tile at a specific position
   * @returns {Object} The spawned lead tile info
   */
  spawnLeadTile(col, row) {
    const countdown = Math.floor(Math.random() *
      (GameConfig.SPECIAL_TILES.LEAD_MAX_COUNTDOWN - GameConfig.SPECIAL_TILES.LEAD_MIN_COUNTDOWN + 1)) +
      GameConfig.SPECIAL_TILES.LEAD_MIN_COUNTDOWN;

    const tile = {
      col: col,
      row: row,
      countdown: countdown,
      type: 'lead'
    };
    this.leadTiles.push(tile);

    // Mark in board
    this.boardLogic.board[col][row] = { type: 'lead', countdown: countdown };

    return tile;
  }

  /**
   * Spawn a glass tile at a specific position with a value
   * @returns {Object} The spawned glass tile info
   */
  spawnGlassTile(col, row, value) {
    const tile = {
      col: col,
      row: row,
      durability: GameConfig.SPECIAL_TILES.GLASS_INITIAL_DURABILITY,
      value: value,
      type: 'glass'
    };
    this.glassTiles.push(tile);

    // Mark in board
    this.boardLogic.board[col][row] = { type: 'glass', value: value, durability: tile.durability };

    return tile;
  }

  /**
   * Spawn an auto-swapper tile at a specific position with a value
   * @returns {Object} The spawned auto-swapper tile info
   */
  spawnAutoSwapper(col, row, value) {
    const nextSwapIn = Math.floor(Math.random() *
      (GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SWAP_MAX - GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SWAP_MIN + 1)) +
      GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SWAP_MIN;

    const tile = {
      col: col,
      row: row,
      swapsRemaining: GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SWAPS,
      nextSwapIn: nextSwapIn,
      value: value,
      type: 'auto_swapper'
    };
    this.autoSwapperTiles.push(tile);

    // Mark in board
    this.boardLogic.board[col][row] = {
      type: 'auto_swapper',
      value: value,
      swapsRemaining: tile.swapsRemaining,
      nextSwapIn: tile.nextSwapIn
    };

    return tile;
  }

  /**
   * Spawn a bomb tile at a specific position with a value
   * @returns {Object} The spawned bomb tile info
   */
  spawnBomb(col, row, value) {
    const tile = {
      col: col,
      row: row,
      mergesRemaining: GameConfig.SPECIAL_TILES.BOMB_MERGE_TRIGGER,
      value: value,
      type: 'bomb'
    };
    this.bombTiles.push(tile);

    // Mark in board
    this.boardLogic.board[col][row] = {
      type: 'bomb',
      value: value,
      mergesRemaining: tile.mergesRemaining
    };

    return tile;
  }

  /**
   * Called after each drop/turn to update special tiles
   * @returns {Array} Events that occurred (for animation)
   */
  updateSpecialTiles() {
    const events = [];

    // Update steel plates - decrement turns remaining
    this.steelPlates = this.steelPlates.filter(plate => {
      plate.turnsRemaining--;
      if (plate.turnsRemaining <= 0) {
        this.boardLogic.board[plate.col][plate.row] = null;
        events.push({ type: 'steel_removed', col: plate.col, row: plate.row });
        return false;
      }
      events.push({ type: 'steel_tick', col: plate.col, row: plate.row, turnsRemaining: plate.turnsRemaining });
      return true;
    });

    // Update lead tiles - decrement countdown
    this.leadTiles = this.leadTiles.filter(tile => {
      tile.countdown--;
      if (tile.countdown <= 0) {
        this.boardLogic.board[tile.col][tile.row] = null;
        events.push({ type: 'lead_removed', col: tile.col, row: tile.row });
        return false;
      }
      // Update board state
      if (this.boardLogic.board[tile.col][tile.row]?.type === 'lead') {
        this.boardLogic.board[tile.col][tile.row].countdown = tile.countdown;
      }
      events.push({ type: 'lead_decremented', col: tile.col, row: tile.row, countdown: tile.countdown });
      return true;
    });

    // Update auto-swapper tiles
    this.autoSwapperTiles = this.autoSwapperTiles.filter(tile => {
      tile.nextSwapIn--;

      // Check if it's time to swap
      if (tile.nextSwapIn <= 0) {
        const swapResult = this.performAutoSwap(tile);
        if (swapResult) {
          tile.swapsRemaining--;
          events.push({
            type: 'auto_swap',
            fromCol: swapResult.fromCol,
            fromRow: swapResult.fromRow,
            toCol: swapResult.toCol,
            toRow: swapResult.toRow,
            swapsRemaining: tile.swapsRemaining
          });

          // Check if tile has expired after this swap
          if (tile.swapsRemaining <= 0) {
            // Convert to normal tile
            this.boardLogic.board[tile.col][tile.row] = tile.value;
            events.push({ type: 'swapper_expired', col: tile.col, row: tile.row, value: tile.value });
            return false;
          }
        }
        // Reset swap timer
        tile.nextSwapIn = Math.floor(Math.random() *
          (GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SWAP_MAX - GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SWAP_MIN + 1)) +
          GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SWAP_MIN;
      }

      // Update board state
      if (this.boardLogic.board[tile.col][tile.row]?.type === 'auto_swapper') {
        this.boardLogic.board[tile.col][tile.row].swapsRemaining = tile.swapsRemaining;
        this.boardLogic.board[tile.col][tile.row].nextSwapIn = tile.nextSwapIn;
      }
      events.push({
        type: 'swapper_tick',
        col: tile.col,
        row: tile.row,
        swapsRemaining: tile.swapsRemaining
      });
      return true;
    });

    return events;
  }

  /**
   * Perform auto-swap for an auto-swapper tile
   * Valid neighbors: Left, Right, Down only (NEVER up or diagonals)
   */
  performAutoSwap(swapperTile) {
    const { col, row } = swapperTile;
    const validNeighbors = [
      { col: col - 1, row: row },     // Left
      { col: col + 1, row: row },     // Right
      { col: col, row: row + 1 }      // Down
    ].filter(n =>
      n.col >= 0 && n.col < this.boardLogic.COLS &&
      n.row >= 0 && n.row < this.boardLogic.ROWS &&
      !this.isBlockedCell(n.col, n.row)  // Can't swap with steel
    );

    if (validNeighbors.length === 0) return null;

    // Pick a random valid neighbor
    const target = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];

    // Save old position before any updates
    const oldCol = swapperTile.col;
    const oldRow = swapperTile.row;

    // Update any other special tile at the target position BEFORE updating the swapper
    // This moves any special tile at target to the swapper's old position
    this.updateTilePosition(target.col, target.row, oldCol, oldRow);

    // Swap board positions
    const temp = this.boardLogic.board[target.col][target.row];
    this.boardLogic.board[target.col][target.row] = this.boardLogic.board[col][row];
    this.boardLogic.board[col][row] = temp;

    // Update swapper tile position
    swapperTile.col = target.col;
    swapperTile.row = target.row;

    return {
      fromCol: oldCol,
      fromRow: oldRow,
      toCol: target.col,
      toRow: target.row
    };
  }

  /**
   * Called when a merge happens - damages adjacent glass tiles
   * @param {number} col - Column where merge occurred
   * @param {number} row - Row where merge occurred
   * @returns {Array} Events that occurred
   */
  onMerge(col, row) {
    const events = [];
    const adjacent = [
      { col: col - 1, row: row },
      { col: col + 1, row: row },
      { col: col, row: row - 1 },
      { col: col, row: row + 1 }
    ];

    this.glassTiles = this.glassTiles.filter(tile => {
      const isAdjacent = adjacent.some(a => a.col === tile.col && a.row === tile.row);
      if (isAdjacent) {
        tile.durability--;
        if (tile.durability <= 0) {
          this.boardLogic.board[tile.col][tile.row] = null;
          events.push({ type: 'glass_broken', col: tile.col, row: tile.row });
          return false;
        }
        // Update board state
        if (this.boardLogic.board[tile.col][tile.row]?.type === 'glass') {
          this.boardLogic.board[tile.col][tile.row].durability = tile.durability;
        }
        events.push({ type: 'glass_cracked', col: tile.col, row: tile.row, durability: tile.durability });
      }
      return true;
    });

    return events;
  }

  /**
   * Called when two bombs merge together - immediate explosion
   * @param {number} col1 - Column of first bomb
   * @param {number} row1 - Row of first bomb
   * @param {number} col2 - Column of second bomb (where explosion occurs)
   * @param {number} row2 - Row of second bomb (where explosion occurs)
   * @returns {Object} Explosion data
   */
  onBombBombMerge(col1, row1, col2, row2) {
    // Remove the first bomb (it's merging into the second)
    this.bombTiles = this.bombTiles.filter(b => !(b.col === col1 && b.row === row1));
    this.boardLogic.board[col1][row1] = null;

    // Detonate the second bomb (where the merge happens)
    return this.detonateBomb(col2, row2);
  }

  /**
   * Called when a bomb tile participates in a merge
   * @param {number} col - Column of the bomb
   * @param {number} row - Row of the bomb
   * @param {number} newValue - The new merged value
   * @returns {Object|null} Explosion data if bomb explodes, null otherwise
   */
  onBombMerge(col, row, newValue) {
    const bomb = this.bombTiles.find(b => b.col === col && b.row === row);
    if (!bomb) return null;

    bomb.mergesRemaining--;
    bomb.value = newValue;

    if (bomb.mergesRemaining <= 0) {
      // BOOM! Trigger explosion
      return this.detonateBomb(col, row);
    }

    // Update board state
    if (this.boardLogic.board[col][row]?.type === 'bomb') {
      this.boardLogic.board[col][row].mergesRemaining = bomb.mergesRemaining;
      this.boardLogic.board[col][row].value = newValue;
    }

    return { exploded: false, mergesRemaining: bomb.mergesRemaining };
  }

  /**
   * Detonate a bomb - destroys 3x3 area
   * @param {number} centerCol - Center column of explosion
   * @param {number} centerRow - Center row of explosion
   * @returns {Object} Explosion data with affected tiles
   */
  detonateBomb(centerCol, centerRow) {
    const affectedTiles = [];
    let totalPoints = 0;

    // 3x3 area centered on bomb
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        const col = centerCol + dc;
        const row = centerRow + dr;

        if (col < 0 || col >= this.boardLogic.COLS ||
            row < 0 || row >= this.boardLogic.ROWS) {
          continue;
        }

        // Skip the center cell (where the bomb is) - it's handled separately
        if (col === centerCol && row === centerRow) {
          continue;
        }

        const cell = this.boardLogic.board[col][row];
        if (cell === null) continue;

        // Steel and Lead survive explosions
        if (typeof cell === 'object') {
          if (cell.type === 'steel' || cell.type === 'lead') {
            continue;
          }
          // Glass shatters
          if (cell.type === 'glass') {
            affectedTiles.push({ col, row, type: 'glass', value: cell.value });
            totalPoints += cell.value || 0;
            this.boardLogic.board[col][row] = null;
            this.glassTiles = this.glassTiles.filter(g => !(g.col === col && g.row === row));
            continue;
          }
          // Other bombs trigger chain reaction (handled by caller)
          if (cell.type === 'bomb') {
            affectedTiles.push({ col, row, type: 'bomb', value: cell.value, chainReaction: true });
            continue;
          }
          // Auto-swapper destroyed
          if (cell.type === 'auto_swapper') {
            affectedTiles.push({ col, row, type: 'auto_swapper', value: cell.value });
            totalPoints += cell.value || 0;
            this.boardLogic.board[col][row] = null;
            this.autoSwapperTiles = this.autoSwapperTiles.filter(s => !(s.col === col && s.row === row));
            continue;
          }
        }

        // Normal numeric tile
        if (typeof cell === 'number') {
          affectedTiles.push({ col, row, type: 'normal', value: cell });
          totalPoints += cell;
          this.boardLogic.board[col][row] = null;
        }
      }
    }

    // Remove the bomb itself
    this.bombTiles = this.bombTiles.filter(b => !(b.col === centerCol && b.row === centerRow));
    this.boardLogic.board[centerCol][centerRow] = null;

    return {
      exploded: true,
      centerCol,
      centerRow,
      affectedTiles,
      totalPoints
    };
  }

  /**
   * Find a random empty cell on the board
   * @returns {Object|null} {col, row} or null if no empty cells
   */
  findRandomEmptyCell() {
    const emptyCells = [];
    for (let col = 0; col < this.boardLogic.COLS; col++) {
      for (let row = 0; row < this.boardLogic.ROWS; row++) {
        if (this.boardLogic.board[col][row] === null) {
          emptyCells.push({ col, row });
        }
      }
    }
    if (emptyCells.length === 0) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  /**
   * Check if a cell is blocked (by steel plate)
   */
  isBlockedCell(col, row) {
    return this.steelPlates.some(p => p.col === col && p.row === row);
  }

  /**
   * Get special tile at position
   */
  getSpecialTileAt(col, row) {
    for (const arr of this._getAllTileArrays()) {
      const tile = arr.find(t => t.col === col && t.row === row);
      if (tile) return tile;
    }
    return null;
  }

  /**
   * Update position of a special tile (after gravity)
   */
  updateTilePosition(oldCol, oldRow, newCol, newRow) {
    // Only movable tiles (not steel) can change position
    for (const arr of this._getMovableTileArrays()) {
      const tile = arr.find(t => t.col === oldCol && t.row === oldRow);
      if (tile) {
        tile.col = newCol;
        tile.row = newRow;
        return; // Only one tile can be at a position
      }
    }
  }

  /**
   * Remove a special tile at position (in-place removal for performance)
   */
  removeTileAt(col, row) {
    const arrays = [
      { arr: this.steelPlates, name: 'steelPlates' },
      { arr: this.leadTiles, name: 'leadTiles' },
      { arr: this.glassTiles, name: 'glassTiles' },
      { arr: this.autoSwapperTiles, name: 'autoSwapperTiles' },
      { arr: this.bombTiles, name: 'bombTiles' }
    ];

    for (const { arr, name } of arrays) {
      const idx = arr.findIndex(t => t.col === col && t.row === row);
      if (idx !== -1) {
        arr.splice(idx, 1);
        return; // Only one tile can be at a position
      }
    }
  }

  /**
   * Get count of cleared lead tiles (for objectives)
   */
  getClearedLeadCount() {
    // This could be tracked separately if needed for objectives
    return 0;
  }

  /**
   * Reset manager state
   */
  reset() {
    this.steelPlates.length = 0;
    this.leadTiles.length = 0;
    this.glassTiles.length = 0;
    this.autoSwapperTiles.length = 0;
    this.bombTiles.length = 0;
  }
}


// === js/BoardLogic.js ===
/**
 * BoardLogic - Core game logic (no rendering)
 * Handles tile placement, merging, gravity, and state
 */
class BoardLogic {
  constructor(config = {}) {
    this.COLS = config.cols || GameConfig.GRID.COLS;
    this.ROWS = config.rows || GameConfig.GRID.ROWS;
    this.allowedTiles = config.allowedTiles || [1, 2, 3];
    this.unlockThresholds = config.unlockThresholds || GameConfig.UNLOCK_THRESHOLDS;
    this.useScoreUnlocks = config.useScoreUnlocks !== false;

    // Custom tile weights for modifiers (e.g., { 1: 0.75, 2: 0.25 })
    this.customTileWeights = config.tileWeights || null;

    this.board = this.createEmptyBoard();
    this.mergeCount = config.startingCombo || 0;
    this.nextTileId = 1;
    this.score = 0;
    this.movesUsed = 0;
    this.tilesCreated = {}; // Track tiles created for objectives
  }

  createEmptyBoard() {
    const board = [];
    for (let col = 0; col < this.COLS; col++) {
      board[col] = [];
      for (let row = 0; row < this.ROWS; row++) {
        board[col][row] = null;
      }
    }
    return board;
  }

  /**
   * Set board from a predefined state (for levels)
   */
  setBoard(boardState) {
    if (!boardState) return;
    for (let col = 0; col < this.COLS; col++) {
      for (let row = 0; row < this.ROWS; row++) {
        this.board[col][row] = boardState[col]?.[row] || null;
      }
    }
  }

  getLowestEmptyRow(col) {
    // Find the lowest empty row that a falling tile can reach from the top
    // Tiles cannot pass through blocked cells (steel) or other tiles
    // Search from top to bottom, simulating the fall

    let lowestReachable = -1;

    for (let row = 0; row < this.ROWS; row++) {
      if (this.isCellBlocked(col, row)) {
        // Hit steel - can't go further, return last empty found
        break;
      }
      if (this.board[col][row] === null) {
        // Empty space - tile can reach here and continue falling
        lowestReachable = row;
      } else {
        // Hit another tile - can't go further, return last empty found
        break;
      }
    }

    return lowestReachable;
  }

  /**
   * Check if a column is completely blocked (steel at row 0)
   */
  isColumnBlocked(col) {
    // If there's a steel plate at row 0, or all rows above steel are full
    for (let row = 0; row < this.ROWS; row++) {
      if (this.isCellBlocked(col, row)) {
        // Check if there's any empty space above this steel
        for (let r = 0; r < row; r++) {
          if (this.board[col][r] === null && !this.isCellBlocked(col, r)) {
            return false; // There's space above the steel
          }
        }
        return true; // No space above steel
      }
      if (this.board[col][row] === null) {
        return false; // Found empty space before hitting steel
      }
    }
    return true; // Column is full
  }

  canMerge(value1, value2, debug = false) {
    if (value1 === null || value2 === null) {
      if (debug) console.log('canMerge: null value', { value1, value2 });
      return false;
    }

    // Handle special tile types (objects)
    const v1 = typeof value1 === 'object' ? value1.value : value1;
    const v2 = typeof value2 === 'object' ? value2.value : value2;

    if (debug) console.log('canMerge: extracted values', { value1, value2, v1, v2 });

    // Blocked tiles (steel) cannot merge
    if (typeof value1 === 'object' && value1.blocked) {
      if (debug) console.log('canMerge: value1 is blocked');
      return false;
    }
    if (typeof value2 === 'object' && value2.blocked) {
      if (debug) console.log('canMerge: value2 is blocked');
      return false;
    }

    // Lead tiles cannot merge (they have no value, just countdown)
    if (typeof value1 === 'object' && value1.type === 'lead') {
      if (debug) console.log('canMerge: value1 is lead');
      return false;
    }
    if (typeof value2 === 'object' && value2.type === 'lead') {
      if (debug) console.log('canMerge: value2 is lead');
      return false;
    }

    // If either value is undefined/null after extraction, can't merge
    if (v1 === undefined || v1 === null || v2 === undefined || v2 === null) {
      if (debug) console.log('canMerge: undefined/null after extraction');
      return false;
    }

    // Wildcard merges with any tile value >= 3
    if (v1 === 'wildcard' && typeof v2 === 'number' && v2 >= 3) return true;
    if (v2 === 'wildcard' && typeof v1 === 'number' && v1 >= 3) return true;

    // Standard merge rules - ensure numeric comparison
    const num1 = typeof v1 === 'number' ? v1 : parseInt(v1);
    const num2 = typeof v2 === 'number' ? v2 : parseInt(v2);

    if (debug) console.log('canMerge: numeric values', { num1, num2 });

    // 1 + 2 = 3
    if ((num1 === 1 && num2 === 2) || (num1 === 2 && num2 === 1)) return true;
    // Equal values >= 3 can merge (3+3, 6+6, 12+12, etc.)
    if (num1 === num2 && num1 >= 3 && !isNaN(num1)) return true;

    if (debug) console.log('canMerge: no match found, returning false');
    return false;
  }

  getMergedValue(value1, value2) {
    // Handle special tile types (objects)
    const v1 = typeof value1 === 'object' ? value1.value : value1;
    const v2 = typeof value2 === 'object' ? value2.value : value2;

    // Wildcard takes on the other tile's value and doubles it
    if (v1 === 'wildcard') return v2 * 2;
    if (v2 === 'wildcard') return v1 * 2;

    if ((v1 === 1 && v2 === 2) || (v1 === 2 && v2 === 1)) return 3;
    return v1 + v2;
  }

  /**
   * Get the numeric value of a cell (handles special tile objects)
   */
  getCellValue(col, row) {
    const cell = this.board[col][row];
    if (cell === null) return null;
    if (typeof cell === 'object') return cell.value;
    return cell;
  }

  /**
   * Check if a cell is blocked (steel plate)
   */
  isCellBlocked(col, row) {
    // Bounds check
    if (col < 0 || col >= this.COLS || row < 0 || row >= this.ROWS) {
      return false;
    }
    const cell = this.board[col][row];
    // Note: typeof null === 'object' in JS, so we must check cell !== null first
    return cell !== null && typeof cell === 'object' && cell.blocked === true;
  }

  /**
   * Track that a tile was created (for level objectives)
   */
  trackTileCreated(value) {
    this.tilesCreated[value] = (this.tilesCreated[value] || 0) + 1;
  }

  dropTile(col, value) {
    if (col < 0 || col >= this.COLS) {
      return { success: false, reason: 'Invalid column' };
    }

    const targetRow = this.getLowestEmptyRow(col);
    if (targetRow === -1) {
      return { success: false, reason: 'Column is full' };
    }

    const belowRow = targetRow + 1;
    let merged = false;
    let finalValue = value;
    let finalRow = targetRow;
    let mergedRow = null;

    // Only try to merge if below is not blocked (steel) and is a valid row
    if (belowRow < this.ROWS && this.board[col][belowRow] !== null && !this.isCellBlocked(col, belowRow)) {
      const belowValue = this.board[col][belowRow];
      if (this.canMerge(value, belowValue)) {
        finalValue = this.getMergedValue(value, belowValue);
        finalRow = belowRow;
        mergedRow = belowRow;
        merged = true;
        this.board[col][belowRow] = null;
        this.mergeCount++;
        this.trackTileCreated(finalValue);
      }
    }

    this.board[col][finalRow] = finalValue;
    this.movesUsed++;

    return {
      success: true,
      row: targetRow,
      finalRow: finalRow,
      finalValue: finalValue,
      merged: merged,
      mergedRow: mergedRow,
      tileId: this.nextTileId++
    };
  }

  countTilesOnBoard(value) {
    let count = 0;
    for (let col = 0; col < this.COLS; col++) {
      for (let row = 0; row < this.ROWS; row++) {
        if (this.board[col][row] === value) {
          count++;
        }
      }
    }
    return count;
  }

  getTotalTileCount() {
    let count = 0;
    for (let col = 0; col < this.COLS; col++) {
      for (let row = 0; row < this.ROWS; row++) {
        if (this.board[col][row] !== null) {
          count++;
        }
      }
    }
    return count;
  }

  getRandomTileValue() {
    const countOnes = this.countTilesOnBoard(1);
    const countTwos = this.countTilesOnBoard(2);
    const difference = countOnes - countTwos;

    // Base weights - check for custom weights from modifiers
    let weight1 = 45;
    let weight2 = 45;

    if (this.customTileWeights) {
      // Use custom weights (values are ratios, e.g., 0.75 for 75%)
      weight1 = (this.customTileWeights[1] || 0.5) * 90;
      weight2 = (this.customTileWeights[2] || 0.5) * 90;
    } else {
      // Gentle balance adjustment - only kicks in when difference is 3+
      // This allows natural randomness while preventing extreme imbalance
      const balanceThreshold = 4;
      if (Math.abs(difference) >= balanceThreshold) {
        const excess = Math.abs(difference) - balanceThreshold + 1;
        const adjustment = Math.min(excess * 8, 25); // Gentler: 8 per tile, cap at 25

        if (difference > 0) {
          // More 1s than 2s - slightly favor spawning 2s
          weight2 += adjustment;
          weight1 = Math.max(20, weight1 - adjustment);
        } else {
          // More 2s than 1s - slightly favor spawning 1s
          weight1 += adjustment;
          weight2 = Math.max(20, weight2 - adjustment);
        }
      }
    }

    // Build available tiles
    const availableTiles = [];

    // Add tiles based on allowed list
    if (this.allowedTiles.includes(1)) {
      availableTiles.push({ value: 1, weight: weight1 });
    }
    if (this.allowedTiles.includes(2)) {
      availableTiles.push({ value: 2, weight: weight2 });
    }
    if (this.allowedTiles.includes(3)) {
      availableTiles.push({ value: 3, weight: 8 });
    }

    // Add higher tiles based on score unlocks (classic mode) or allowed list (level mode)
    if (this.useScoreUnlocks) {
      let totalHigherWeight = 0;
      for (const [value, scoreThreshold] of Object.entries(this.unlockThresholds)) {
        if (this.score >= scoreThreshold) {
          const scoreOver = this.score - scoreThreshold;
          const weight = Math.min(0.5 + (scoreOver / 1000), 2);
          availableTiles.push({ value: parseInt(value), weight: weight });
          totalHigherWeight += weight;
        }
      }
      // Reduce base tile weights as higher tiles unlock
      const reduction = Math.max(0.7, 1 - (totalHigherWeight / 100));
      if (availableTiles[0]) availableTiles[0].weight *= reduction;
      if (availableTiles[1]) availableTiles[1].weight *= reduction;
    } else {
      // Level mode: add higher allowed tiles with fixed small weights
      for (const value of this.allowedTiles) {
        if (value > 3 && !availableTiles.find(t => t.value === value)) {
          availableTiles.push({ value: value, weight: 3 });
        }
      }
    }

    // Weighted random selection
    const totalWeight = availableTiles.reduce((sum, t) => sum + t.weight, 0);
    const rand = Math.random() * totalWeight;
    let cumulative = 0;

    for (const tile of availableTiles) {
      cumulative += tile.weight;
      if (rand < cumulative) {
        return tile.value;
      }
    }

    return this.allowedTiles[0] || 1;
  }

  isBoardFull() {
    for (let col = 0; col < this.COLS; col++) {
      if (this.board[col][0] === null) return false;
    }
    return true;
  }

  getMergeCount() { return this.mergeCount; }
  resetMergeCount() { this.mergeCount = 0; }
  subtractMergeCount(amount) { this.mergeCount = Math.max(0, this.mergeCount - amount); }
  addScore(value) { this.score += value; }
  getScore() { return this.score; }
  getMovesUsed() { return this.movesUsed; }

  /**
   * Get current game state for objective checking
   */
  getGameState() {
    // Find highest tile value on the board
    let highestTile = 0;
    for (let col = 0; col < this.COLS; col++) {
      for (let row = 0; row < this.ROWS; row++) {
        const val = this.board[col][row];
        if (typeof val === 'number' && val > highestTile) {
          highestTile = val;
        }
      }
    }

    return {
      score: this.score,
      tilesCreated: this.tilesCreated,
      tileCount: this.getTotalTileCount(),
      movesUsed: this.movesUsed,
      highestTile
    };
  }

  shiftBoard(direction) {
    const operations = [];
    const newBoard = this.createEmptyBoard();

    // Copy current board to newBoard first
    for (let col = 0; col < this.COLS; col++) {
      for (let row = 0; row < this.ROWS; row++) {
        newBoard[col][row] = this.board[col][row];
      }
    }

    if (direction === 'left') {
      // Process from left to right so tiles don't overlap
      for (let row = 0; row < this.ROWS; row++) {
        for (let col = 1; col < this.COLS; col++) {
          // Skip blocked tiles and empty cells
          if (this.isCellBlocked(col, row) || newBoard[col][row] === null) continue;

          const targetCol = col - 1;

          // Can't move into blocked cell
          if (this.isCellBlocked(targetCol, row)) continue;

          const tileValue = newBoard[col][row];

          if (newBoard[targetCol][row] === null) {
            // Move one space left into empty cell
            newBoard[targetCol][row] = tileValue;
            newBoard[col][row] = null;
            operations.push({ type: 'move', fromCol: col, toCol: targetCol, row, value: tileValue });
          } else if (this.canMerge(tileValue, newBoard[targetCol][row])) {
            // Merge with tile to the left
            const mergedValue = this.getMergedValue(tileValue, newBoard[targetCol][row]);
            newBoard[targetCol][row] = mergedValue;
            newBoard[col][row] = null;
            this.mergeCount++;
            this.trackTileCreated(mergedValue);
            operations.push({ type: 'merge', fromCol: col, toCol: targetCol, row, value: mergedValue });
          }
          // If target is occupied and can't merge, tile stays in place
        }
      }
    } else if (direction === 'right') {
      // Process from right to left so tiles don't overlap
      for (let row = 0; row < this.ROWS; row++) {
        for (let col = this.COLS - 2; col >= 0; col--) {
          // Skip blocked tiles and empty cells
          if (this.isCellBlocked(col, row) || newBoard[col][row] === null) continue;

          const targetCol = col + 1;

          // Can't move into blocked cell
          if (this.isCellBlocked(targetCol, row)) continue;

          const tileValue = newBoard[col][row];

          if (newBoard[targetCol][row] === null) {
            // Move one space right into empty cell
            newBoard[targetCol][row] = tileValue;
            newBoard[col][row] = null;
            operations.push({ type: 'move', fromCol: col, toCol: targetCol, row, value: tileValue });
          } else if (this.canMerge(tileValue, newBoard[targetCol][row])) {
            // Merge with tile to the right
            const mergedValue = this.getMergedValue(tileValue, newBoard[targetCol][row]);
            newBoard[targetCol][row] = mergedValue;
            newBoard[col][row] = null;
            this.mergeCount++;
            this.trackTileCreated(mergedValue);
            operations.push({ type: 'merge', fromCol: col, toCol: targetCol, row, value: mergedValue });
          }
          // If target is occupied and can't merge, tile stays in place
        }
      }
    }

    this.board = newBoard;
    return operations;
  }

  applyGravity() {
    const operations = [];

    // Single pass - finds falls and merges for current state
    // Chain reactions are handled by calling this repeatedly from animation
    for (let col = 0; col < this.COLS; col++) {
      for (let row = this.ROWS - 2; row >= 0; row--) {
        const value = this.board[col][row];
        if (value === null) continue;

        // Steel tiles don't fall - they're fixed in place
        if (this.isCellBlocked(col, row)) continue;

        let targetRow = row;
        for (let r = row + 1; r < this.ROWS; r++) {
          // Can't fall through blocked cells (steel)
          if (this.isCellBlocked(col, r)) break;
          if (this.board[col][r] === null) targetRow = r;
          else break;
        }

        if (targetRow < this.ROWS - 1) {
          const below = this.board[col][targetRow + 1];
          // Can't merge with blocked tiles
          if (below !== null && !this.isCellBlocked(col, targetRow + 1) && this.canMerge(value, below)) {
            const mergedValue = this.getMergedValue(value, below);
            this.board[col][targetRow + 1] = mergedValue;
            this.board[col][row] = null;
            this.mergeCount++;
            this.trackTileCreated(mergedValue);
            operations.push({ type: 'fall-merge', col, fromRow: row, toRow: targetRow + 1, value: mergedValue });
            continue;
          }
        }

        if (targetRow !== row) {
          this.board[col][targetRow] = value;
          this.board[col][row] = null;
          operations.push({ type: 'fall', col, fromRow: row, toRow: targetRow, value });
        }
      }
    }

    return operations;
  }

  /**
   * Swap two tiles on the board (Swapper power-up)
   */
  swapTiles(col1, row1, col2, row2) {
    // Validate positions
    if (col1 < 0 || col1 >= this.COLS || row1 < 0 || row1 >= this.ROWS) {
      return { success: false, reason: 'Invalid position 1' };
    }
    if (col2 < 0 || col2 >= this.COLS || row2 < 0 || row2 >= this.ROWS) {
      return { success: false, reason: 'Invalid position 2' };
    }

    // Can't swap blocked cells
    if (this.isCellBlocked(col1, row1) || this.isCellBlocked(col2, row2)) {
      return { success: false, reason: 'Cannot swap blocked tiles' };
    }

    // Both cells must have tiles
    if (this.board[col1][row1] === null || this.board[col2][row2] === null) {
      return { success: false, reason: 'Cannot swap with empty cell' };
    }

    // Perform swap
    const temp = this.board[col1][row1];
    this.board[col1][row1] = this.board[col2][row2];
    this.board[col2][row2] = temp;

    return { success: true };
  }

  /**
   * Force merge two adjacent tiles (Merger power-up)
   * Merges at the second tile's position
   */
  forceMerge(col1, row1, col2, row2) {
    const value1 = this.board[col1][row1];
    const value2 = this.board[col2][row2];

    // Check both tiles exist
    if (value1 === null || value2 === null) {
      return { success: false, reason: 'empty_cell' };
    }

    // Check compatibility (with debug logging on failure)
    if (!this.canMerge(value1, value2)) {
      console.log('forceMerge failed - incompatible tiles:', { value1, value2, col1, row1, col2, row2 });
      this.canMerge(value1, value2, true); // Re-run with debug to see why
      return { success: false, reason: 'incompatible' };
    }

    // Perform merge at second tile's position
    const mergedValue = this.getMergedValue(value1, value2);
    this.board[col1][row1] = null;
    this.board[col2][row2] = mergedValue;
    this.mergeCount++;
    this.trackTileCreated(mergedValue);

    return {
      success: true,
      mergedValue: mergedValue,
      mergedCol: col2,
      mergedRow: row2,
      clearedCol: col1,
      clearedRow: row1
    };
  }

  /**
   * Frenzy mode shift - omni-directional 1-space movement, no gravity
   */
  frenzyShift(direction) {
    const operations = [];
    const newBoard = this.createEmptyBoard();

    const deltas = {
      'left': { dc: -1, dr: 0 },
      'right': { dc: 1, dr: 0 },
      'up': { dc: 0, dr: -1 },
      'down': { dc: 0, dr: 1 }
    };

    const { dc, dr } = deltas[direction] || { dc: 0, dr: 0 };
    if (dc === 0 && dr === 0) return operations;

    // Process in correct order based on direction
    const colStart = dc > 0 ? this.COLS - 1 : 0;
    const colEnd = dc > 0 ? -1 : this.COLS;
    const colStep = dc > 0 ? -1 : 1;
    const rowStart = dr > 0 ? this.ROWS - 1 : 0;
    const rowEnd = dr > 0 ? -1 : this.ROWS;
    const rowStep = dr > 0 ? -1 : 1;

    for (let col = colStart; col !== colEnd; col += colStep) {
      for (let row = rowStart; row !== rowEnd; row += rowStep) {
        const value = this.board[col][row];
        if (value === null) continue;

        // Skip blocked tiles
        if (this.isCellBlocked(col, row)) {
          newBoard[col][row] = value;
          continue;
        }

        const newCol = Math.max(0, Math.min(this.COLS - 1, col + dc));
        const newRow = Math.max(0, Math.min(this.ROWS - 1, row + dr));

        // Check if target is blocked
        if (this.isCellBlocked(newCol, newRow)) {
          newBoard[col][row] = value;
          continue;
        }

        // Check for merge
        if (newBoard[newCol][newRow] !== null && this.canMerge(value, newBoard[newCol][newRow])) {
          const mergedValue = this.getMergedValue(value, newBoard[newCol][newRow]);
          newBoard[newCol][newRow] = mergedValue;
          this.mergeCount++;
          this.trackTileCreated(mergedValue);
          operations.push({
            type: 'frenzy-merge',
            fromCol: col,
            fromRow: row,
            toCol: newCol,
            toRow: newRow,
            value: mergedValue
          });
        } else if (newBoard[newCol][newRow] === null) {
          // Move to empty cell
          newBoard[newCol][newRow] = value;
          if (col !== newCol || row !== newRow) {
            operations.push({
              type: 'frenzy-move',
              fromCol: col,
              fromRow: row,
              toCol: newCol,
              toRow: newRow,
              value: value
            });
          }
        } else {
          // Can't move, stay in place
          newBoard[col][row] = value;
        }
      }
    }

    this.board = newBoard;
    return operations;
  }
}


// === js/Tile.js ===
/**
 * Tile - Visual representation of a game tile
 * Supports normal tiles, special tiles (steel, lead, glass), and wildcard
 */
class Tile extends Phaser.GameObjects.Container {
  constructor(scene, gridX, gridY, value, tileId, tileType = 'normal', specialData = {}) {
    super(scene, 0, 0);
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.value = value;
    this.tileId = tileId;
    this.tileType = tileType;  // 'normal', 'steel', 'lead', 'glass', 'wildcard'
    this.specialData = specialData;  // countdown, durability, etc.
    this.TILE_SIZE = GameConfig.GRID.TILE_SIZE;
    this.isSelected = false;
    this.createGraphics();
    this.updatePosition(gridX, gridY, false);
    scene.add.existing(this);
  }

  createGraphics() {
    const size = this.TILE_SIZE - 6;
    const halfSize = size / 2;
    const radius = 8;

    // Main tile background
    this.bg = this.scene.add.graphics();

    let color = getTileColor(this.value);
    let strokeColor = 0x000000;
    let strokeAlpha = 0.15;

    switch (this.tileType) {
      case 'steel':
        color = GameConfig.COLORS.STEEL;
        strokeColor = 0x6a7a8a;
        strokeAlpha = 0.4;
        break;
      case 'lead':
        color = GameConfig.COLORS.LEAD;
        strokeColor = 0x333333;
        strokeAlpha = 0.3;
        break;
      case 'glass':
        color = GameConfig.COLORS.GLASS;
        strokeColor = 0x8ab4d4;
        strokeAlpha = 0.5;
        break;
      case 'wildcard':
        color = GameConfig.COLORS.WILDCARD;
        strokeColor = 0xc090d0;
        strokeAlpha = 0.5;
        break;
      case 'auto_swapper':
        color = GameConfig.COLORS.AUTO_SWAPPER;
        strokeColor = 0x8a6ca2;
        strokeAlpha = 0.5;
        break;
      case 'bomb':
        color = GameConfig.COLORS.BOMB;
        strokeColor = 0xc05050;
        strokeAlpha = 0.5;
        break;
      default:
        break;
    }

    // Main fill - clean, flat color
    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(-halfSize, -halfSize, size, size, radius);

    // Subtle border
    this.bg.lineStyle(1, strokeColor, strokeAlpha);
    this.bg.strokeRoundedRect(-halfSize, -halfSize, size, size, radius);

    this.add(this.bg);

    // Add special visual effects based on type
    if (this.tileType === 'steel') {
      this.addSteelPattern();
    } else if (this.tileType === 'lead') {
      this.addLeadKettlebellPattern();
    } else if (this.tileType === 'glass' && this.specialData.durability === 1) {
      this.addCrackOverlay();
    } else if (this.tileType === 'auto_swapper') {
      this.addAutoSwapperPattern();
    } else if (this.tileType === 'bomb') {
      this.addBombPattern();
    }

    // Text content - clean styling
    let displayText = this.value?.toString() || '';
    let textColor = getTileTextColor(this.value);
    let fontSize = '26px';
    let fontFamily = GameConfig.FONTS.NUMBERS;
    let fontWeight = '800';

    switch (this.tileType) {
      case 'steel':
        displayText = this.specialData.turnsRemaining?.toString() || '';
        textColor = '#4a5a6a';
        fontSize = '22px';
        break;
      case 'lead':
        displayText = this.specialData.countdown?.toString() || '';
        textColor = '#888888';
        fontSize = '26px';
        break;
      case 'glass':
        displayText = this.value?.toString() || '';
        textColor = '#2a5080';
        fontSize = '26px';
        break;
      case 'wildcard':
        displayText = '★';
        textColor = '#ffffff';
        fontSize = '32px';
        break;
      case 'auto_swapper':
        displayText = this.value?.toString() || '';
        textColor = '#ffffff';
        fontSize = '22px';
        break;
      case 'bomb':
        displayText = this.value?.toString() || '';
        textColor = '#ffffff';
        fontSize = '22px';
        break;
      default:
        break;
    }

    this.text = this.scene.add.text(0, 0, displayText, {
      fontSize: fontSize,
      fontFamily: fontFamily,
      fontStyle: fontWeight,
      color: textColor
    }).setOrigin(0.5);
    this.add(this.text);

    // Add durability indicator for glass tiles
    if (this.tileType === 'glass') {
      this.addDurabilityIndicator();
    }
  }

  /**
   * Add durability indicator (hearts/dots) for glass tiles
   */
  addDurabilityIndicator() {
    const durability = this.specialData.durability || 2;
    const size = this.TILE_SIZE - 8;

    if (this.durabilityText) {
      this.durabilityText.destroy();
    }

    // Show durability as small badge in corner
    const badge = this.scene.add.graphics();
    badge.fillStyle(durability === 1 ? 0xff3838 : 0x0066cc, 0.9);
    badge.fillCircle(size / 2 - 8, -size / 2 + 8, 10);
    this.add(badge);
    this.durabilityBadge = badge;

    this.durabilityText = this.scene.add.text(size / 2 - 8, -size / 2 + 8, durability.toString(), {
      fontSize: '12px',
      fontFamily: GameConfig.FONTS.NUMBERS,
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.add(this.durabilityText);
  }

  /**
   * Add metallic crosshatch pattern for steel plates
   */
  addSteelPattern() {
    const size = this.TILE_SIZE - 8;
    const pattern = this.scene.add.graphics();

    // Crosshatch lines - diagonal pattern
    pattern.lineStyle(1, 0x9090a0, 0.4);

    // Lines going one direction (top-left to bottom-right)
    const spacing = 8;
    for (let i = -size; i < size; i += spacing) {
      const x1 = Math.max(-size / 2, i - size / 2);
      const y1 = Math.max(-size / 2, -i - size / 2);
      const x2 = Math.min(size / 2, i + size / 2);
      const y2 = Math.min(size / 2, -i + size / 2);
      pattern.lineBetween(x1, y1, x2, y2);
    }

    // Lines going other direction (top-right to bottom-left)
    for (let i = -size; i < size; i += spacing) {
      const x1 = Math.max(-size / 2, -i - size / 2);
      const y1 = Math.max(-size / 2, -i - size / 2);
      const x2 = Math.min(size / 2, -i + size / 2);
      const y2 = Math.min(size / 2, -i + size / 2);
      pattern.lineBetween(x1, y1, x2, y2);
    }

    // Add subtle metallic highlight on top edge
    pattern.lineStyle(2, 0xc0c0d0, 0.5);
    pattern.lineBetween(-size / 2 + 4, -size / 2 + 4, size / 2 - 4, -size / 2 + 4);

    // Add subtle shadow on bottom edge
    pattern.lineStyle(2, 0x505060, 0.5);
    pattern.lineBetween(-size / 2 + 4, size / 2 - 4, size / 2 - 4, size / 2 - 4);

    this.add(pattern);
    this.steelPattern = pattern;
  }

  /**
   * Add kettlebell shape for lead tiles
   */
  addLeadKettlebellPattern() {
    const pattern = this.scene.add.graphics();

    // Kettlebell body (main ball) - dark gray with metallic sheen
    const bodyRadius = 16;
    const bodyY = 6;

    // Body shadow/depth
    pattern.fillStyle(0x0a0a0a, 1);
    pattern.fillCircle(2, bodyY + 2, bodyRadius);

    // Main body
    pattern.fillStyle(0x2a2a2a, 1);
    pattern.fillCircle(0, bodyY, bodyRadius);

    // Body highlight (top-left shine)
    pattern.fillStyle(0x4a4a4a, 0.6);
    pattern.fillCircle(-5, bodyY - 5, 6);

    // Handle - curved arc at top
    pattern.lineStyle(5, 0x2a2a2a, 1);
    pattern.beginPath();
    pattern.arc(0, -6, 12, Math.PI * 0.15, Math.PI * 0.85, false);
    pattern.strokePath();

    // Handle highlight
    pattern.lineStyle(2, 0x4a4a4a, 0.5);
    pattern.beginPath();
    pattern.arc(0, -6, 12, Math.PI * 0.2, Math.PI * 0.5, false);
    pattern.strokePath();

    // Handle inner shadow
    pattern.lineStyle(2, 0x1a1a1a, 0.8);
    pattern.beginPath();
    pattern.arc(0, -6, 9, Math.PI * 0.2, Math.PI * 0.8, false);
    pattern.strokePath();

    this.add(pattern);
    this.leadPattern = pattern;
  }

  /**
   * Add crack overlay for damaged glass tiles
   */
  addCrackOverlay() {
    if (this.crackOverlay) {
      this.crackOverlay.destroy();
    }

    this.crackOverlay = this.scene.add.graphics();
    this.crackOverlay.lineStyle(2, 0x000000, 0.6);

    // Draw crack lines
    this.crackOverlay.lineBetween(-15, -15, 0, 0);
    this.crackOverlay.lineBetween(0, 0, 10, -5);
    this.crackOverlay.lineBetween(0, 0, 5, 12);
    this.crackOverlay.lineBetween(-8, 10, 0, 0);

    this.add(this.crackOverlay);
  }

  /**
   * Add swirl pattern for auto-swapper tiles
   */
  addAutoSwapperPattern() {
    const pattern = this.scene.add.graphics();

    // Circular arrows / swirl to indicate swap behavior
    pattern.lineStyle(2, 0xffffff, 0.4);

    // Draw curved arrow (left arc)
    pattern.beginPath();
    pattern.arc(-8, 0, 8, Math.PI * 0.3, Math.PI * 1.2, false);
    pattern.strokePath();

    // Draw curved arrow (right arc)
    pattern.beginPath();
    pattern.arc(8, 0, 8, Math.PI * 1.3, Math.PI * 2.2, false);
    pattern.strokePath();

    // Arrowheads
    pattern.fillStyle(0xffffff, 0.4);
    pattern.fillTriangle(-12, -6, -8, -10, -6, -4);
    pattern.fillTriangle(12, 6, 8, 10, 6, 4);

    // Swaps remaining indicator in bottom corner
    if (this.specialData.swapsRemaining !== undefined) {
      const lifeBadge = this.scene.add.graphics();
      lifeBadge.fillStyle(0x000000, 0.5);
      lifeBadge.fillCircle(18, 18, 9);
      this.add(lifeBadge);

      const lifeText = this.scene.add.text(18, 18, this.specialData.swapsRemaining.toString(), {
        fontSize: '11px',
        fontFamily: GameConfig.FONTS.NUMBERS,
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);
      this.add(lifeText);
      this.lifeText = lifeText;
    }

    this.add(pattern);
    this.swapperPattern = pattern;
  }

  /**
   * Add bomb icon pattern for bomb tiles
   */
  addBombPattern() {
    const pattern = this.scene.add.graphics();

    // Bomb body (circle) - behind the value
    pattern.fillStyle(0x000000, 0.3);
    pattern.fillCircle(0, 3, 14);

    // Fuse
    pattern.lineStyle(3, 0x444444, 1);
    pattern.beginPath();
    pattern.moveTo(0, -11);
    pattern.lineTo(4, -18);
    pattern.lineTo(8, -16);
    pattern.strokePath();

    // Fuse spark
    pattern.fillStyle(0xff8800, 0.9);
    pattern.fillCircle(8, -16, 4);
    pattern.fillStyle(0xffff00, 1);
    pattern.fillCircle(8, -16, 2);

    // Merges remaining indicator in corner
    if (this.specialData.mergesRemaining !== undefined) {
      const mergesBadge = this.scene.add.graphics();
      mergesBadge.fillStyle(0x000000, 0.6);
      mergesBadge.fillCircle(18, 18, 10);
      mergesBadge.lineStyle(2, 0xffe600, 0.8);
      mergesBadge.strokeCircle(18, 18, 10);
      this.add(mergesBadge);

      const mergesText = this.scene.add.text(18, 18, this.specialData.mergesRemaining.toString(), {
        fontSize: '12px',
        fontFamily: GameConfig.FONTS.NUMBERS,
        fontStyle: 'bold',
        color: '#ffe600'
      }).setOrigin(0.5);
      this.add(mergesText);
      this.mergesText = mergesText;
    }

    this.add(pattern);
    this.bombPattern = pattern;
  }

  /**
   * Explosion animation for bomb tiles
   */
  explodeAnimation(callback) {
    // Create explosion particles
    const particles = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particle = this.scene.add.circle(this.x, this.y, 5, 0xff8800, 1);
      particles.push(particle);

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 60,
        y: this.y + Math.sin(angle) * 60,
        alpha: 0,
        scale: 0.5,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }

    // Screen shake effect
    this.scene.cameras.main.shake(200, 0.01);

    // Expand and fade the tile
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        if (callback) callback();
        this.destroy();
      }
    });
  }

  updateGraphics() {
    const size = this.TILE_SIZE - 8;
    this.bg.clear();

    let color = getTileColor(this.value);
    let strokeColor = 0xffffff;
    let strokeAlpha = 0.3;

    switch (this.tileType) {
      case 'steel':
        color = GameConfig.COLORS.STEEL;
        strokeColor = 0x4a4a4a;
        strokeAlpha = 0.8;
        break;
      case 'lead':
        color = GameConfig.COLORS.LEAD;
        strokeColor = 0x444444;
        strokeAlpha = 0.3;
        break;
      case 'glass':
        color = GameConfig.COLORS.GLASS;
        strokeColor = 0x87ceeb;
        strokeAlpha = 0.6;
        break;
      case 'wildcard':
        color = GameConfig.COLORS.WILDCARD;
        strokeColor = 0xff66ff;
        strokeAlpha = 0.8;
        break;
      case 'auto_swapper':
        color = GameConfig.COLORS.AUTO_SWAPPER;
        strokeColor = 0xb366e0;
        strokeAlpha = 0.8;
        break;
      case 'bomb':
        color = GameConfig.COLORS.BOMB;
        strokeColor = 0xcc0000;
        strokeAlpha = 0.9;
        break;
      default:
        break;
    }

    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    this.bg.lineStyle(2, strokeColor, strokeAlpha);
    this.bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);

    // Update text based on tile type
    if (this.tileType === 'lead') {
      this.text.setText(this.specialData.countdown?.toString() || '');
    } else if (this.tileType === 'steel') {
      this.text.setText(this.specialData.turnsRemaining?.toString() || '');
    } else if (this.tileType === 'glass') {
      this.text.setText(this.value?.toString() || '');
      // Update durability indicator
      if (this.durabilityText) {
        const durability = this.specialData.durability || 2;
        this.durabilityText.setText(durability.toString());
        this.durabilityText.setColor(durability === 1 ? '#ff0000' : '#0066cc');
      }
    } else if (this.tileType !== 'wildcard') {
      this.text.setText(this.value?.toString() || '');
      if (this.tileType === 'normal') {
        this.text.setColor(getTileTextColor(this.value));
      }
    }

    // Update crack overlay for glass
    if (this.tileType === 'glass' && this.specialData.durability === 1) {
      this.addCrackOverlay();
    }

    // Update auto-swapper swaps remaining indicator
    if (this.tileType === 'auto_swapper' && this.lifeText) {
      this.lifeText.setText(this.specialData.swapsRemaining?.toString() || '');
    }

    // Update bomb merges remaining indicator
    if (this.tileType === 'bomb' && this.mergesText) {
      this.mergesText.setText(this.specialData.mergesRemaining?.toString() || '');
    }
  }

  /**
   * Update special data (countdown, durability, etc.)
   */
  updateSpecialData(newData) {
    this.specialData = { ...this.specialData, ...newData };
    this.updateGraphics();
  }

  gridToWorldX(gx) {
    // Get layout - prefer scene's cached layout, compute dynamically if needed
    const layout = this.getLayout();
    return layout.offsetX + (gx * layout.tileSize) + (layout.tileSize / 2);
  }

  gridToWorldY(gy) {
    // Get layout - prefer scene's cached layout, compute dynamically if needed
    const layout = this.getLayout();
    return layout.offsetY + (gy * layout.tileSize) + (layout.tileSize / 2);
  }

  /**
   * Get the current layout, computing it if necessary
   */
  getLayout() {
    // Try scene's cached layout first
    if (this.scene && this.scene.layout) {
      return this.scene.layout;
    }
    // Compute layout dynamically from scene camera dimensions
    if (this.scene && this.scene.cameras && this.scene.cameras.main) {
      const { width, height } = this.scene.cameras.main;
      return GameConfig.getLayout(width, height);
    }
    // Fallback to static config values
    return {
      tileSize: this.TILE_SIZE || GameConfig.GRID.TILE_SIZE,
      offsetX: GameConfig.GRID.OFFSET_X,
      offsetY: GameConfig.GRID.OFFSET_Y
    };
  }

  /**
   * Update tile position when layout changes (responsive resize)
   */
  updateLayoutPosition(tileSize, offsetX, offsetY) {
    this.TILE_SIZE = tileSize;
    const worldX = offsetX + (this.gridX * tileSize) + (tileSize / 2);
    const worldY = offsetY + (this.gridY * tileSize) + (tileSize / 2);
    this.x = worldX;
    this.y = worldY;
    // Redraw graphics at new size
    this.recreateGraphics();
  }

  /**
   * Recreate graphics at current tile size (for resize)
   */
  recreateGraphics() {
    // Remove existing graphics
    this.removeAll(true);
    // Recreate at new size
    this.createGraphics();
  }

  updatePosition(gridX, gridY, animate = true, duration = GameConfig.ANIM.SHIFT) {
    this.gridX = gridX;
    this.gridY = gridY;
    const worldX = this.gridToWorldX(gridX);
    const worldY = this.gridToWorldY(gridY);

    if (animate && this.scene && this.scene.tweens) {
      this.scene.tweens.add({ targets: this, x: worldX, y: worldY, duration, ease: 'Power2' });
    } else {
      this.x = worldX;
      this.y = worldY;
    }
  }

  updateValue(newValue, animate = true) {
    this.value = newValue;
    this.updateGraphics();
    if (animate && this.scene && this.scene.tweens) {
      this.scene.tweens.add({ targets: this, scaleX: 1.2, scaleY: 1.2, duration: 100, yoyo: true, ease: 'Power2' });
    }
  }

  dropFromTop(targetGridY, duration = GameConfig.ANIM.DROP) {
    this.y = this.gridToWorldY(-1);
    this.alpha = 0;
    this.scene.tweens.add({
      targets: this,
      y: this.gridToWorldY(targetGridY),
      alpha: 1,
      duration,
      ease: 'Bounce.easeOut'
    });
    this.gridY = targetGridY;
  }

  mergeAnimation(callback) {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3, scaleY: 1.3, alpha: 0,
      duration: GameConfig.ANIM.MERGE,
      ease: 'Power2',
      onComplete: () => {
        if (callback) callback();
        this.destroy();
      }
    });
  }

  /**
   * Shake animation for incompatible merge attempts
   */
  shakeAnimation(callback) {
    const originalX = this.x;
    this.scene.tweens.add({
      targets: this,
      x: originalX - 5,
      duration: 50,
      yoyo: true,
      repeat: 3,
      ease: 'Power2',
      onComplete: () => {
        this.x = originalX;
        if (callback) callback();
      }
    });
  }

  /**
   * Highlight tile for selection
   */
  setSelected(selected) {
    this.isSelected = selected;
    const size = this.TILE_SIZE - 8;

    if (selected) {
      // Add selection highlight
      if (!this.selectionHighlight) {
        this.selectionHighlight = this.scene.add.graphics();
        this.selectionHighlight.lineStyle(4, 0xffff00, 1);
        this.selectionHighlight.strokeRoundedRect(-size / 2 - 2, -size / 2 - 2, size + 4, size + 4, 10);
        this.add(this.selectionHighlight);
      }

      // Pulse animation
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      // Remove selection highlight
      if (this.selectionHighlight) {
        this.selectionHighlight.destroy();
        this.selectionHighlight = null;
      }
      this.scene.tweens.killTweensOf(this);
      this.setScale(1);
    }
  }

  /**
   * Glass break animation
   */
  breakAnimation(callback) {
    // Shatter effect
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0,
      angle: 15,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        if (callback) callback();
        this.destroy();
      }
    });
  }

  /**
   * Steel plate fade out animation
   */
  fadeOutAnimation(callback) {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        if (callback) callback();
        this.destroy();
      }
    });
  }
}


// === js/UIHelpers.js ===
/**
 * UIHelpers - Shared UI components and utilities
 */
const UIHelpers = {
  /**
   * Draw clean background
   */
  drawBackground(scene) {
    const { width, height } = scene.cameras.main;
    const g = scene.add.graphics();

    // Solid slate background
    g.fillStyle(GameConfig.UI.BACKGROUND_DARK, 1);
    g.fillRect(0, 0, width, height);

    return g;
  },

  /**
   * Create a styled button - clean and minimal
   */
  createButton(scene, x, y, text, callback, options = {}) {
    const width = options.width || 220;
    const height = options.height || 50;
    const disabled = options.disabled || false;
    const fontSize = options.fontSize || '18px';

    const bg = scene.add.graphics();
    const fillColor = disabled ? GameConfig.UI.DISABLED : GameConfig.UI.PRIMARY;

    // Clean button fill
    bg.fillStyle(fillColor, disabled ? 0.5 : 1);
    bg.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);

    const label = scene.add.text(x, y, text, {
      fontSize,
      fontFamily: GameConfig.FONTS.UI,
      fontStyle: '700',
      color: disabled ? '#888888' : '#ffffff'
    }).setOrigin(0.5);

    const hitArea = scene.add.rectangle(x, y, width, height, 0x000000, 0).setInteractive();

    if (!disabled) {
      hitArea.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(GameConfig.UI.PRIMARY_LIGHT, 1);
        bg.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      });
      hitArea.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(fillColor, 1);
        bg.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      });
      hitArea.on('pointerdown', () => {
        if (typeof soundManager !== 'undefined') soundManager.play('click');
        callback();
      });
    }

    return { bg, label, hitArea };
  },

  /**
   * Show the How to Play modal with scrollable content
   */
  showHowToPlay(scene, onClose) {
    const { width, height } = scene.cameras.main;
    const overlay = scene.add.container(0, 0).setDepth(2000);

    // Semi-transparent background
    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRect(0, 0, width, height);
    bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    overlay.add(bg);

    // Modal dimensions
    const mw = Math.min(380, width - 30);
    const mh = Math.min(620, height - 50);
    const mx = (width - mw) / 2, my = (height - mh) / 2;
    const modal = scene.add.graphics();

    // Clean modal background
    modal.fillStyle(0xf5f5f5, 1);
    modal.fillRoundedRect(mx, my, mw, mh, 12);
    overlay.add(modal);

    // Title
    overlay.add(scene.add.text(width / 2, my + 28, 'How to Play', {
      fontSize: '24px', fontFamily: GameConfig.FONTS.DISPLAY, fontStyle: '800', color: '#2c3e50'
    }).setOrigin(0.5));

    // Scroll hint
    overlay.add(scene.add.text(width / 2, my + 52, 'Swipe or scroll to see more', {
      fontSize: '11px', fontFamily: GameConfig.FONTS.UI, color: '#888888'
    }).setOrigin(0.5));

    // Scrollable content area dimensions
    const scrollX = mx + 15;
    const scrollY = my + 75;
    const scrollW = mw - 30;
    const scrollH = mh - 130;

    // Create scrollable content container
    const scrollContent = scene.add.container(scrollX, scrollY);
    overlay.add(scrollContent);

    // Create mask for scroll area
    const maskShape = scene.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(scrollX, scrollY, scrollW, scrollH);
    const mask = maskShape.createGeometryMask();
    scrollContent.setMask(mask);

    // Build content inside scrollContent
    let ty = 15;
    const contentX = scrollW / 2;
    const leftX = 10;

    // ========== BASIC RULES ==========
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'Basic Rules', GameConfig.UI.PRIMARY);
    ty += 35;

    // Merge example tiles - clean, flat style
    const tiles = [
      { icon: '1', color: GameConfig.COLORS[1] },
      { icon: '+', isSymbol: true },
      { icon: '2', color: GameConfig.COLORS[2] },
      { icon: '=', isSymbol: true },
      { icon: '3', color: GameConfig.COLORS[3], textColor: '#2c3e50' }
    ];
    const tileSize = 38;
    const tileGap = 48;
    const tilesStartX = (scrollW - (tiles.length * tileGap - 10)) / 2;
    const radius = 6;

    tiles.forEach((t, i) => {
      const tx = tilesStartX + i * tileGap;
      if (t.isSymbol) {
        scrollContent.add(scene.add.text(tx, ty, t.icon, {
          fontSize: '24px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: '#5a9fd4'
        }).setOrigin(0.5));
      } else {
        const box = scene.add.graphics();
        const halfSize = tileSize / 2;
        // Clean flat fill
        box.fillStyle(t.color, 1);
        box.fillRoundedRect(tx - halfSize, ty - halfSize, tileSize, tileSize, radius);
        scrollContent.add(box);
        scrollContent.add(scene.add.text(tx, ty, t.icon, {
          fontSize: '20px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '800', color: t.textColor || '#ffffff'
        }).setOrigin(0.5));
      }
    });
    ty += 45;

    // Basic rules as bullet points
    const basicRules = [
      'Tap a column to drop a tile',
      '1 + 2 = 3 (only way to make 3)',
      'Matching tiles double: 3+3=6, 6+6=12...',
      'Swipe or use arrows to shift tiles'
    ];
    basicRules.forEach(rule => {
      this.addBulletPoint(scene, scrollContent, leftX, ty, rule, '#cccccc');
      ty += 24;
    });

    // ========== GAME MODES ==========
    ty += 15;
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'Game Modes', GameConfig.UI.SUCCESS);
    ty += 32;

    const modes = [
      { name: 'Original', color: GameConfig.COLORS[1], desc: 'Classic mode - swipe power-up only', goal: 'Goal: Highest tile' },
      { name: 'Crazy', color: GameConfig.COLORS[2], desc: 'All power-ups, special tiles, frenzy', goal: 'Goal: Highest tile' },
      { name: 'Endless', color: GameConfig.COLORS.WILDCARD, desc: 'Bombs explode for big points!', goal: 'Goal: Highest score' }
    ];
    modes.forEach(mode => {
      // Mode name with colored badge
      const badge = scene.add.graphics();
      badge.fillStyle(mode.color, 1);
      badge.fillRoundedRect(leftX, ty - 10, 70, 20, 4);
      scrollContent.add(badge);
      scrollContent.add(scene.add.text(leftX + 35, ty, mode.name, {
        fontSize: '12px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#ffffff'
      }).setOrigin(0.5));
      scrollContent.add(scene.add.text(leftX + 82, ty - 5, mode.desc, {
        fontSize: '11px', fontFamily: GameConfig.FONTS.UI, color: '#555555'
      }).setOrigin(0, 0.5));
      scrollContent.add(scene.add.text(leftX + 82, ty + 8, mode.goal, {
        fontSize: '10px', fontFamily: GameConfig.FONTS.UI, fontStyle: 'italic', color: '#888888'
      }).setOrigin(0, 0.5));
      ty += 38;
    });

    // ========== POWER-UPS ==========
    ty += 10;
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'Power-Ups', GameConfig.UI.WARNING);
    ty += 28;
    scrollContent.add(scene.add.text(contentX, ty, 'Earn 1 point per merge!', {
      fontSize: '11px', fontFamily: GameConfig.FONTS.UI, fontStyle: 'italic', color: '#888888'
    }).setOrigin(0.5));
    ty += 24;

    const powerUps = [
      { name: 'Swipe', cost: '5', desc: 'Shift all tiles left/right' },
      { name: 'Swap', cost: '10', desc: 'Exchange any two tiles' },
      { name: 'Merge', cost: '10', desc: 'Force merge two tiles' },
      { name: 'Wildcard', cost: '20', desc: 'Next tile matches any 3+' }
    ];
    powerUps.forEach(pu => {
      // Cost badge
      const costBadge = scene.add.graphics();
      costBadge.fillStyle(GameConfig.UI.WARNING, 1);
      costBadge.fillRoundedRect(leftX, ty - 9, 28, 18, 4);
      scrollContent.add(costBadge);
      scrollContent.add(scene.add.text(leftX + 14, ty, pu.cost, {
        fontSize: '11px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: '#ffffff'
      }).setOrigin(0.5));
      // Name
      scrollContent.add(scene.add.text(leftX + 38, ty, pu.name, {
        fontSize: '12px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#2c3e50'
      }).setOrigin(0, 0.5));
      // Description
      scrollContent.add(scene.add.text(leftX + 105, ty, pu.desc, {
        fontSize: '11px', fontFamily: GameConfig.FONTS.UI, color: '#666666'
      }).setOrigin(0, 0.5));
      ty += 26;
    });

    // ========== FRENZY MODE ==========
    ty += 15;
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'Frenzy Mode', GameConfig.UI.FRENZY);
    ty += 32;

    // Frenzy meter visual - clean style
    const meterWidth = scrollW - 40;
    const meterBg = scene.add.graphics();
    // Background
    meterBg.fillStyle(0xdddddd, 1);
    meterBg.fillRoundedRect(leftX + 10, ty - 8, meterWidth, 16, 4);
    // Fill
    meterBg.fillStyle(GameConfig.UI.FRENZY, 1);
    meterBg.fillRoundedRect(leftX + 10, ty - 8, meterWidth * 0.7, 16, 4);
    scrollContent.add(meterBg);
    scrollContent.add(scene.add.text(leftX + 10 + meterWidth/2, ty, '50 merges to fill', {
      fontSize: '10px', fontFamily: GameConfig.FONTS.UI, fontStyle: '600', color: '#ffffff'
    }).setOrigin(0.5));
    ty += 24;

    const frenzyRules = [
      '10 seconds of no gravity!',
      'Swipe in ALL 4 directions',
      'Set up massive combos!'
    ];
    frenzyRules.forEach(rule => {
      this.addBulletPoint(scene, scrollContent, leftX, ty, rule, GameConfig.UI.FRENZY);
      ty += 20;
    });

    // ========== SPECIAL TILES ==========
    ty += 15;
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'Special Tiles', GameConfig.COLORS.AUTO_SWAPPER);
    ty += 32;

    const specialTiles = [
      { name: 'Steel', desc: 'Blocks cell for N turns', color: GameConfig.COLORS.STEEL, label: '3', labelColor: '#4a5a6a' },
      { name: 'Lead', desc: 'Countdown timer, gone at 0', color: GameConfig.COLORS.LEAD, label: '5', labelColor: '#888888' },
      { name: 'Glass', desc: 'Cracks on nearby merges', color: GameConfig.COLORS.GLASS, label: '6', labelColor: '#2a5080' },
      { name: 'Swapper', desc: 'Auto-swaps with neighbors', color: GameConfig.COLORS.AUTO_SWAPPER, label: '⇄', labelColor: '#ffffff' },
      { name: 'Bomb', desc: 'Explodes after 3 merges!', color: GameConfig.COLORS.BOMB, label: '3', labelColor: '#ffffff' }
    ];

    const specialTileSize = 30;
    const specialRadius = 5;

    specialTiles.forEach(tile => {
      // Clean tile preview
      const tileBox = scene.add.graphics();
      const halfSize = specialTileSize / 2;
      const tileX = leftX + halfSize;

      // Main fill
      tileBox.fillStyle(tile.color, 1);
      tileBox.fillRoundedRect(leftX, ty - halfSize, specialTileSize, specialTileSize, specialRadius);
      scrollContent.add(tileBox);

      scrollContent.add(scene.add.text(tileX, ty, tile.label, {
        fontSize: tile.label.length > 1 ? '12px' : '14px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: tile.labelColor
      }).setOrigin(0.5));

      // Name and description
      scrollContent.add(scene.add.text(leftX + 42, ty - 5, tile.name, {
        fontSize: '12px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#2c3e50'
      }).setOrigin(0, 0.5));
      scrollContent.add(scene.add.text(leftX + 42, ty + 8, tile.desc, {
        fontSize: '10px', fontFamily: GameConfig.FONTS.UI, color: '#666666'
      }).setOrigin(0, 0.5));
      ty += 38;
    });

    // ========== TIPS ==========
    ty += 10;
    this.addSectionHeader(scene, scrollContent, contentX, ty, 'Tips', GameConfig.UI.SUCCESS);
    ty += 30;

    const tips = [
      'Keep high tiles in corners',
      'Save wildcards for big merges',
      'Use frenzy to clear the board',
      'Watch bomb merge counters!',
      'Plan swaps before swiping'
    ];
    tips.forEach(tip => {
      this.addBulletPoint(scene, scrollContent, leftX, ty, tip, GameConfig.UI.SUCCESS);
      ty += 20;
    });

    // Total content height
    const totalContentHeight = ty + 30;

    // Scroll variables
    let scrollOffset = 0;
    const maxScroll = Math.max(0, totalContentHeight - scrollH);

    // Scroll bar
    let scrollBar = null;
    const scrollBarWidth = 6;
    const scrollBarX = mx + mw - 12;

    if (maxScroll > 0) {
      // Scroll bar background
      const scrollBarBg = scene.add.graphics();
      scrollBarBg.fillStyle(0x333333, 0.5);
      scrollBarBg.fillRoundedRect(scrollBarX, scrollY, scrollBarWidth, scrollH, 3);
      overlay.add(scrollBarBg);

      // Scroll bar handle
      const handleHeight = Math.max(40, (scrollH / totalContentHeight) * scrollH);
      scrollBar = scene.add.graphics();
      scrollBar.fillStyle(GameConfig.UI.PRIMARY, 0.8);
      scrollBar.fillRoundedRect(scrollBarX, scrollY, scrollBarWidth, handleHeight, 3);
      overlay.add(scrollBar);

      const updateScrollBar = () => {
        if (scrollBar) {
          const hh = Math.max(40, (scrollH / totalContentHeight) * scrollH);
          const hy = scrollY + (scrollOffset / maxScroll) * (scrollH - hh);
          scrollBar.clear();
          scrollBar.fillStyle(GameConfig.UI.PRIMARY, 0.8);
          scrollBar.fillRoundedRect(scrollBarX, hy, scrollBarWidth, hh, 3);
        }
      };

      // Drag to scroll
      const scrollZone = scene.add.rectangle(
        scrollX + scrollW / 2, scrollY + scrollH / 2,
        scrollW, scrollH, 0x000000, 0
      ).setInteractive();
      overlay.add(scrollZone);

      let isDragging = false;
      let lastY = 0;

      scrollZone.on('pointerdown', (pointer) => {
        isDragging = true;
        lastY = pointer.y;
      });

      scene.input.on('pointermove', (pointer) => {
        if (isDragging) {
          const deltaY = lastY - pointer.y;
          scrollOffset = Phaser.Math.Clamp(scrollOffset + deltaY, 0, maxScroll);
          scrollContent.y = scrollY - scrollOffset;
          lastY = pointer.y;
          updateScrollBar();
        }
      });

      scene.input.on('pointerup', () => {
        isDragging = false;
      });

      // Mouse wheel support
      scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
        if (pointer.x >= mx && pointer.x <= mx + mw &&
            pointer.y >= my && pointer.y <= my + mh) {
          scrollOffset = Phaser.Math.Clamp(scrollOffset + deltaY * 0.5, 0, maxScroll);
          scrollContent.y = scrollY - scrollOffset;
          updateScrollBar();
        }
      });
    }

    // Close button (fixed at bottom) - clean style
    const closeBtnBg = scene.add.graphics();
    const btnWidth = 120;
    const btnHeight = 36;
    const btnX = width / 2 - btnWidth / 2;
    const btnY = my + mh - 45;

    // Clean button fill
    closeBtnBg.fillStyle(GameConfig.UI.PRIMARY, 1);
    closeBtnBg.fillRoundedRect(btnX, btnY, btnWidth, btnHeight, 6);
    overlay.add(closeBtnBg);

    const closeBtn = scene.add.text(width / 2, btnY + btnHeight / 2, 'Close', {
      fontSize: '15px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#ffffff'
    }).setOrigin(0.5).setInteractive();
    overlay.add(closeBtn);

    const close = () => {
      scene.input.off('pointermove');
      scene.input.off('pointerup');
      scene.input.off('wheel');
      maskShape.destroy();
      overlay.destroy();
      if (onClose) onClose();
    };
    bg.on('pointerdown', close);
    closeBtn.on('pointerdown', close);

    return overlay;
  },

  /**
   * Helper: Add section header - clean style
   */
  addSectionHeader(scene, container, x, y, text, color) {
    // Parse color
    const colorValue = typeof color === 'number' ? color : Phaser.Display.Color.HexStringToColor(color).color;
    const colorStr = typeof color === 'string' ? color : '#' + colorValue.toString(16).padStart(6, '0');

    // Simple underlined header
    const headerText = scene.add.text(x, y, text, {
      fontSize: '14px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#2c3e50'
    }).setOrigin(0.5);
    container.add(headerText);

    // Subtle underline
    const lineWidth = headerText.width + 20;
    const line = scene.add.graphics();
    line.lineStyle(2, colorValue, 0.6);
    line.lineBetween(x - lineWidth/2, y + 12, x + lineWidth/2, y + 12);
    container.add(line);
  },

  /**
   * Helper: Add bullet point - clean style
   */
  addBulletPoint(scene, container, x, y, text, color) {
    const colorValue = typeof color === 'number' ? color : Phaser.Display.Color.HexStringToColor(color).color;
    const colorStr = typeof color === 'string' ? color : '#' + colorValue.toString(16).padStart(6, '0');

    container.add(scene.add.text(x, y, '•', {
      fontSize: '14px', fontFamily: GameConfig.FONTS.UI, color: colorStr
    }).setOrigin(0, 0.5));
    container.add(scene.add.text(x + 14, y, text, {
      fontSize: '12px', fontFamily: GameConfig.FONTS.UI, color: '#555555'
    }).setOrigin(0, 0.5));
  }
};


// === js/GameInputHandler.js ===
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


// === js/GameUIManager.js ===
/**
 * GameUIManager - Manages UI elements for GameScene
 *
 * Extracted from GameScene.js to improve maintainability.
 * Handles creation and updates of score display, power-up buttons,
 * combo bars, frenzy UI, and other game UI elements.
 *
 * Uses UI_SIZES from GameConfig for consistent sizing.
 */
class GameUIManager {
  /**
   * @param {Phaser.Scene} scene - The game scene
   * @param {Object} layout - Layout configuration from GameConfig.getLayout()
   */
  constructor(scene, layout) {
    this.scene = scene;
    this.layout = layout;

    // UI element references
    this.scoreText = null;
    this.resourceText = null;
    this.progressText = null;
    this.movesText = null;

    // Combo bar elements (Original mode)
    this.comboBarBg = null;
    this.comboBarFill = null;
    this.comboText = null;
    this.comboBarX = 0;
    this.comboBarY = 0;
    this.comboBarWidth = GameConfig.UI_SIZES?.COMBO_BAR_WIDTH || 200;
    this.comboBarHeight = GameConfig.UI_SIZES?.COMBO_BAR_HEIGHT || 30;

    // Power-up button elements
    this.powerUpButtons = {};

    // Frenzy bar elements
    this.frenzyBarBg = null;
    this.frenzyBarFill = null;
    this.frenzyBarText = null;
    this.frenzyActivateBtn = null;
    this.frenzyBarX = 0;
    this.frenzyBarY = 0;
    this.frenzyBarWidth = GameConfig.UI_SIZES?.FRENZY_BAR_WIDTH || 180;

    // Swipe buttons
    this.swipeButtons = { leftButton: null, rightButton: null, leftText: null, rightText: null };

    // Next tile preview
    this.nextTilePreview = null;
  }

  /**
   * Create score display for standard modes
   * @param {number} startY - Y position for score text
   */
  createScoreDisplay(startY) {
    const { width } = this.scene.cameras.main;
    const fontSize = GameConfig.UI_SIZES?.SCORE || '18px';

    this.scoreText = this.scene.add.text(width / 2, startY, 'SCORE: 0', {
      fontSize: fontSize,
      fontFamily: GameConfig.FONTS.NUMBERS,
      fontStyle: '700',
      color: '#ffffff'
    }).setOrigin(0.5);

    return this.scoreText;
  }

  /**
   * Update score display
   * @param {number} score - Current score
   */
  updateScore(score) {
    if (this.scoreText) {
      this.scoreText.setText(`SCORE: ${score}`);
    }
  }

  /**
   * Create level mode UI (progress and moves)
   * @param {Object} levelConfig - Level configuration
   * @param {number} startY - Y position
   */
  createLevelUI(levelConfig, startY) {
    const { width } = this.scene.cameras.main;
    const fontSize = GameConfig.UI_SIZES?.LABEL || '14px';

    this.progressText = this.scene.add.text(width / 2, startY, '', {
      fontSize: fontSize,
      fontFamily: GameConfig.FONTS.UI,
      color: '#ffffff'
    }).setOrigin(0.5);

    this.movesText = this.scene.add.text(width / 2, startY + 20, '', {
      fontSize: fontSize,
      fontFamily: GameConfig.FONTS.UI,
      color: '#aaaaaa'
    }).setOrigin(0.5);

    return { progressText: this.progressText, movesText: this.movesText };
  }

  /**
   * Update level progress display
   * @param {string} progressText - Progress text
   * @param {number} movesUsed - Moves used
   * @param {number} maxMoves - Maximum moves allowed
   */
  updateLevelProgress(progressText, movesUsed, maxMoves) {
    if (this.progressText) {
      this.progressText.setText(progressText);
    }
    if (this.movesText) {
      this.movesText.setText(`Moves: ${movesUsed}/${maxMoves}`);
    }
  }

  /**
   * Create resource points display for crazy/endless modes
   * @param {number} startY - Y position
   */
  createResourceDisplay(startY) {
    const { width } = this.scene.cameras.main;
    const fontSize = GameConfig.UI_SIZES?.LABEL || '14px';

    this.resourceText = this.scene.add.text(width / 2, startY, 'POWER: 0', {
      fontSize: fontSize,
      fontFamily: GameConfig.FONTS.UI,
      fontStyle: '600',
      color: '#f5c26b'
    }).setOrigin(0.5);

    return this.resourceText;
  }

  /**
   * Update resource points display
   * @param {number} points - Current resource points
   */
  updateResourcePoints(points) {
    if (this.resourceText) {
      this.resourceText.setText(`POWER: ${points}`);
    }
  }

  /**
   * Create combo bar for Original mode
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Object} Combo bar elements
   */
  createComboBar(x, y) {
    this.comboBarX = x;
    this.comboBarY = y;

    // Background
    this.comboBarBg = this.scene.add.graphics();
    this.comboBarBg.fillStyle(0x333333, 0.5);
    this.comboBarBg.fillRoundedRect(x, y, this.comboBarWidth, this.comboBarHeight, 5);
    this.comboBarBg.lineStyle(2, GameConfig.UI.PRIMARY, 0.5);
    this.comboBarBg.strokeRoundedRect(x, y, this.comboBarWidth, this.comboBarHeight, 5);

    // Fill (progress)
    this.comboBarFill = this.scene.add.graphics();

    // Label
    const labelFontSize = GameConfig.UI_SIZES?.LABEL || '14px';
    this.scene.add.text(x + this.comboBarWidth / 2, y - 12, 'SWIPE CHARGE', {
      fontSize: '12px',
      fontFamily: GameConfig.FONTS.UI,
      color: '#888888'
    }).setOrigin(0.5);

    // Counter text
    this.comboText = this.scene.add.text(x + this.comboBarWidth / 2, y + this.comboBarHeight / 2, '0/6', {
      fontSize: labelFontSize,
      fontFamily: GameConfig.FONTS.NUMBERS,
      fontStyle: '700',
      color: '#ffffff'
    }).setOrigin(0.5);

    return {
      bg: this.comboBarBg,
      fill: this.comboBarFill,
      text: this.comboText
    };
  }

  /**
   * Update combo bar progress
   * @param {number} count - Current merge count
   * @param {number} max - Maximum for charge
   * @param {boolean} isReady - Whether swipe is ready
   */
  updateComboBar(count, max, isReady) {
    if (!this.comboBarFill) return;

    const ratio = Math.min(count / max, 1);

    this.comboBarFill.clear();
    if (ratio > 0) {
      const color = isReady ? GameConfig.UI.SUCCESS : GameConfig.UI.PRIMARY;
      this.comboBarFill.fillStyle(color, 1);
      this.comboBarFill.fillRoundedRect(
        this.comboBarX,
        this.comboBarY,
        this.comboBarWidth * ratio,
        this.comboBarHeight,
        5
      );
    }

    if (this.comboText) {
      this.comboText.setText(`${count}/${max}`);
      this.comboText.setColor(isReady ? '#7ed321' : '#ffffff');
    }
  }

  /**
   * Create power-up button
   * @param {string} type - Power-up type (swipe, swapper, merger, wildcard)
   * @param {string} label - Display label
   * @param {number} cost - Resource cost
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Function} onClick - Click callback
   * @returns {Object} Button elements
   */
  createPowerUpButton(type, label, cost, x, y, onClick) {
    const btnWidth = GameConfig.UI_SIZES?.POWER_UP_BUTTON_WIDTH || 56;
    const btnHeight = GameConfig.UI_SIZES?.POWER_UP_BUTTON_HEIGHT || 36;

    const bg = this.scene.add.graphics();
    bg.fillStyle(GameConfig.UI.PRIMARY, 0.2);
    bg.lineStyle(2, GameConfig.UI.DISABLED, 0.5);
    bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 6);
    bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 6);

    const labelText = this.scene.add.text(x, y - 6, label, {
      fontSize: '11px',
      fontFamily: GameConfig.FONTS.UI,
      fontStyle: '700',
      color: '#666666'
    }).setOrigin(0.5);

    const costText = this.scene.add.text(x, y + 8, `${cost}`, {
      fontSize: '10px',
      fontFamily: GameConfig.FONTS.NUMBERS,
      color: '#666666'
    }).setOrigin(0.5);

    // Make interactive
    const hitArea = this.scene.add.rectangle(x, y, btnWidth, btnHeight, 0x000000, 0);
    hitArea.setInteractive();
    hitArea.on('pointerdown', onClick);

    const button = { type, bg, label: labelText, costText, hitArea, x, y, cost };
    this.powerUpButtons[type] = button;

    return button;
  }

  /**
   * Update power-up button state
   * @param {string} type - Power-up type
   * @param {boolean} canAfford - Whether player can afford this power-up
   */
  updatePowerUpButton(type, canAfford) {
    const btn = this.powerUpButtons[type];
    if (!btn) return;

    const btnWidth = GameConfig.UI_SIZES?.POWER_UP_BUTTON_WIDTH || 56;
    const btnHeight = GameConfig.UI_SIZES?.POWER_UP_BUTTON_HEIGHT || 36;

    btn.bg.clear();
    if (canAfford) {
      btn.bg.fillStyle(GameConfig.UI.SUCCESS, 0.4);
      btn.bg.lineStyle(2, GameConfig.UI.SUCCESS, 1);
    } else {
      btn.bg.fillStyle(GameConfig.UI.PRIMARY, 0.2);
      btn.bg.lineStyle(2, GameConfig.UI.DISABLED, 0.5);
    }
    btn.bg.fillRoundedRect(btn.x - btnWidth / 2, btn.y - btnHeight / 2, btnWidth, btnHeight, 6);
    btn.bg.strokeRoundedRect(btn.x - btnWidth / 2, btn.y - btnHeight / 2, btnWidth, btnHeight, 6);

    btn.label.setColor(canAfford ? '#ffffff' : '#666666');
    btn.costText.setColor(canAfford ? '#7ed321' : '#666666');
  }

  /**
   * Create frenzy meter bar
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Object} Frenzy bar elements
   */
  createFrenzyBar(x, y) {
    this.frenzyBarX = x;
    this.frenzyBarY = y;
    const height = GameConfig.UI_SIZES?.FRENZY_BAR_HEIGHT || 16;

    // Background
    this.frenzyBarBg = this.scene.add.graphics();
    this.frenzyBarBg.fillStyle(0x333333, 0.5);
    this.frenzyBarBg.fillRoundedRect(x, y, this.frenzyBarWidth, height, 4);
    this.frenzyBarBg.lineStyle(2, GameConfig.UI.FRENZY, 0.3);
    this.frenzyBarBg.strokeRoundedRect(x, y, this.frenzyBarWidth, height, 4);

    // Fill
    this.frenzyBarFill = this.scene.add.graphics();

    // Label
    this.scene.add.text(x + this.frenzyBarWidth / 2, y - 10, 'FRENZY', {
      fontSize: '10px',
      fontFamily: GameConfig.FONTS.UI,
      color: '#e24a4a'
    }).setOrigin(0.5);

    // Counter text
    this.frenzyBarText = this.scene.add.text(x + this.frenzyBarWidth / 2, y + height / 2, '0/50', {
      fontSize: '10px',
      fontFamily: GameConfig.FONTS.NUMBERS,
      fontStyle: '700',
      color: '#ffffff'
    }).setOrigin(0.5);

    return {
      bg: this.frenzyBarBg,
      fill: this.frenzyBarFill,
      text: this.frenzyBarText
    };
  }

  /**
   * Update frenzy bar
   * @param {number} meter - Current frenzy meter value
   * @param {number} threshold - Frenzy activation threshold
   * @param {boolean} isReady - Whether frenzy is ready to activate
   */
  updateFrenzyBar(meter, threshold, isReady) {
    if (!this.frenzyBarFill) return;

    const ratio = Math.min(meter / threshold, 1);
    const height = GameConfig.UI_SIZES?.FRENZY_BAR_HEIGHT || 16;

    this.frenzyBarFill.clear();
    if (ratio > 0) {
      this.frenzyBarFill.fillStyle(GameConfig.UI.FRENZY, 1);
      this.frenzyBarFill.fillRoundedRect(
        this.frenzyBarX,
        this.frenzyBarY,
        this.frenzyBarWidth * ratio,
        height,
        4
      );
    }

    const displayMeter = Math.min(meter, threshold);
    if (this.frenzyBarText) {
      this.frenzyBarText.setText(`${displayMeter}/${threshold}`);
    }
  }

  /**
   * Create next tile preview container
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Phaser.GameObjects.Container} Preview container
   */
  createNextTilePreview(x, y) {
    this.nextTilePreview = this.scene.add.container(x, y);

    this.scene.add.text(x, y - 35, 'NEXT', {
      fontSize: '12px',
      fontFamily: GameConfig.FONTS.UI,
      color: '#888888'
    }).setOrigin(0.5);

    return this.nextTilePreview;
  }

  /**
   * Update layout reference (called on resize)
   * @param {Object} layout - New layout configuration
   */
  updateLayout(layout) {
    this.layout = layout;
  }

  /**
   * Clean up UI elements
   */
  destroy() {
    // Graphics objects are cleaned up by Phaser when scene is destroyed
    this.powerUpButtons = {};
  }
}


// === js/GameAnimationController.js ===
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

  /**
   * Create particle burst on merge
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} color - Hex color of the tile
   * @param {number} count - Number of particles
   */
  animateMergeParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.5);
      const dist = 30 + Math.random() * 25;
      const size = 2 + Math.random() * 3;

      const particle = this.scene.add.graphics();
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, size);
      particle.setPosition(x, y);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 300 + Math.random() * 150,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }

  /**
   * Create pulsing frenzy border
   * @param {number} width - Screen width
   * @param {number} height - Screen height
   * @returns {Phaser.GameObjects.Graphics} The border graphics (for cleanup)
   */
  createFrenzyBorder(width, height) {
    const border = this.scene.add.graphics();
    border.lineStyle(4, 0xff4444, 0.6);
    border.strokeRect(2, 2, width - 4, height - 4);
    border.setDepth(51);

    this.scene.tweens.add({
      targets: border,
      alpha: 0.15,
      duration: 400,
      yoyo: true,
      repeat: -1
    });

    return border;
  }
}


// === js/TileCollectionManager.js ===
/**
 * TileCollectionManager - Tracks which tiles the player has discovered
 * Stores the highest tile value achieved across all games
 */
class TileCollectionManager {
  constructor() {
    this.STORAGE_KEY = 'threes_drop_collection';
    this.collection = this.loadCollection();
  }

  /**
   * Load collection from localStorage
   */
  loadCollection() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load tile collection:', e);
    }
    // Default: player has discovered 3 (everyone makes a 3 eventually)
    return {
      highestTile: 3,
      discoveredTiles: [3]
    };
  }

  /**
   * Save collection to localStorage
   */
  saveCollection() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.collection));
    } catch (e) {
      console.warn('Failed to save tile collection:', e);
    }
  }

  /**
   * Record a tile being created - updates if it's a new discovery
   * @param {number} value - The tile value created
   * @returns {boolean} True if this is a new discovery
   */
  recordTile(value) {
    // Only track tiles 3 and above (the mergeable ones)
    if (value < 3) return false;

    const isNewDiscovery = !this.collection.discoveredTiles.includes(value);

    if (isNewDiscovery) {
      this.collection.discoveredTiles.push(value);
      this.collection.discoveredTiles.sort((a, b) => a - b);
    }

    if (value > this.collection.highestTile) {
      this.collection.highestTile = value;
    }

    if (isNewDiscovery || value > this.collection.highestTile) {
      this.saveCollection();
    }

    return isNewDiscovery;
  }

  /**
   * Get all discovered tile values
   * @returns {number[]} Array of discovered tile values
   */
  getDiscoveredTiles() {
    return [...this.collection.discoveredTiles];
  }

  /**
   * Get the highest tile ever created
   * @returns {number} Highest tile value
   */
  getHighestTile() {
    return this.collection.highestTile;
  }

  /**
   * Check if a tile value has been discovered
   * @param {number} value - Tile value to check
   * @returns {boolean} True if discovered
   */
  hasDiscovered(value) {
    return this.collection.discoveredTiles.includes(value);
  }

  /**
   * Get all possible tile values (for showing locked tiles)
   * @returns {number[]} Array of all possible tile values
   */
  getAllPossibleTiles() {
    return [3, 6, 12, 24, 48, 96, 192, 384, 768, 1536, 3072, 6144];
  }

  /**
   * Reset collection (for testing)
   */
  resetCollection() {
    this.collection = {
      highestTile: 3,
      discoveredTiles: [3]
    };
    this.saveCollection();
  }
}

// Global instance
const tileCollectionManager = new TileCollectionManager();


// === js/DailyChallengeManager.js ===
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


// === js/AchievementManager.js ===
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
      const stored = localStorage.getItem(this.STORAGE_KEY);
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
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats));
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

  // Achievement checking methods
  checkTileAchievements(value) {
    const tileAchievements = [
      { id: 'first_3', value: 3 },
      { id: 'first_6', value: 6 },
      { id: 'first_12', value: 12 },
      { id: 'first_24', value: 24 },
      { id: 'first_48', value: 48 },
      { id: 'first_96', value: 96 },
      { id: 'first_192', value: 192 },
      { id: 'first_384', value: 384 },
      { id: 'first_768', value: 768 }
    ];

    tileAchievements.forEach(a => {
      if (value >= a.value) {
        this.unlock(a.id);
      }
    });
  }

  checkScoreAchievements(score) {
    const scoreAchievements = [
      { id: 'score_100', value: 100 },
      { id: 'score_500', value: 500 },
      { id: 'score_1000', value: 1000 },
      { id: 'score_2500', value: 2500 },
      { id: 'score_5000', value: 5000 },
      { id: 'score_10000', value: 10000 }
    ];

    scoreAchievements.forEach(a => {
      if (score >= a.value) {
        this.unlock(a.id);
      }
    });
  }

  checkFrenzyAchievements() {
    const frenzyAchievements = [
      { id: 'frenzy_1', value: 1 },
      { id: 'frenzy_5', value: 5 },
      { id: 'frenzy_10', value: 10 },
      { id: 'frenzy_25', value: 25 }
    ];

    frenzyAchievements.forEach(a => {
      if (this.stats.frenzyCount >= a.value) {
        this.unlock(a.id);
      }
    });
  }

  checkSpecialTileAchievements() {
    // Glass achievements
    if (this.stats.glassBroken >= 5) this.unlock('glass_5');
    if (this.stats.glassBroken >= 25) this.unlock('glass_25');
    if (this.stats.glassBroken >= 100) this.unlock('glass_100');

    // Lead achievements
    if (this.stats.leadCleared >= 5) this.unlock('lead_5');
    if (this.stats.leadCleared >= 25) this.unlock('lead_25');
  }

  checkBombAchievements() {
    if (this.stats.bombsExploded >= 1) this.unlock('bomb_1');
    if (this.stats.bombsExploded >= 5) this.unlock('bomb_5');
    if (this.stats.bombsExploded >= 25) this.unlock('bomb_25');
  }

  checkGameAchievements(mode) {
    // Game count achievements
    if (this.stats.gamesPlayed >= 10) this.unlock('games_10');
    if (this.stats.gamesPlayed >= 50) this.unlock('games_50');
    if (this.stats.gamesPlayed >= 100) this.unlock('games_100');

    // Mode achievements
    if (mode === 'original') this.unlock('original_play');
    if (mode === 'crazy') this.unlock('crazy_play');
    if (mode === 'endless') this.unlock('endless_play');
  }

  checkLevelAchievements() {
    if (this.stats.levelsCompleted >= 1) this.unlock('tutorial_1');
    if (this.stats.levelsCompleted >= 10) this.unlock('tutorial_10');
    if (this.stats.levelsCompleted >= 20) this.unlock('tutorial_complete');
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


// === js/GameStateManager.js ===
/**
 * GameStateManager - Handles saving and loading game state for resume functionality
 *
 * Save state versioning (via GameConfig.SAVE_VERSION) allows for future migrations
 * when the save format changes. Old saves are automatically migrated on load.
 */
class GameStateManager {
  constructor() {
    this.STORAGE_KEY_PREFIX = 'threes_drop_saved_game_';
  }

  /**
   * Get storage key for a specific mode
   */
  getStorageKey(mode) {
    return this.STORAGE_KEY_PREFIX + (mode || 'default');
  }

  /**
   * Get current save version from config (with fallback)
   * @returns {number} Current save version
   */
  getCurrentVersion() {
    return (typeof GameConfig !== 'undefined' && GameConfig.SAVE_VERSION) || 1;
  }

  /**
   * Migrate old save states to current format
   * Each migration is a step from one version to the next.
   * @param {Object} state - Saved state object
   * @returns {Object} Migrated state object
   */
  migrateState(state) {
    const currentVersion = this.getCurrentVersion();
    let stateVersion = state.version || 0;

    // Already current version
    if (stateVersion >= currentVersion) {
      return state;
    }

    // Migration from version 0 (no version field) to version 1
    if (stateVersion < 1) {
      console.log('Migrating save state from v0 to v1');
      state.version = 1;
      // v1 added version field - no structural changes needed
      stateVersion = 1;
    }

    // Future migrations go here:
    // if (stateVersion < 2) {
    //   console.log('Migrating save state from v1 to v2');
    //   // Apply v2 migrations...
    //   state.version = 2;
    //   stateVersion = 2;
    // }

    return state;
  }

  /**
   * Save the current game state
   */
  saveGameState(gameScene) {
    try {
      const state = {
        // Version for future migrations
        version: this.getCurrentVersion(),

        // Game mode info
        gameMode: gameScene.gameMode,
        levelId: gameScene.levelId,

        // Board state - convert to simple format
        board: this.serializeBoard(gameScene.boardLogic.board),

        // Board logic state
        score: gameScene.boardLogic.getScore(),
        movesUsed: gameScene.boardLogic.getMovesUsed(),
        mergeCount: gameScene.boardLogic.mergeCount,
        tilesCreated: gameScene.boardLogic.tilesCreated,
        nextTileId: gameScene.boardLogic.nextTileId,

        // Next tile preview
        nextTileValue: gameScene.nextTileValue,
        nextTileType: gameScene.nextTileType,

        // Power-up state
        powerUpState: {
          resourcePoints: gameScene.powerUpManager.resourcePoints,
          frenzyMeter: gameScene.powerUpManager.frenzyMeter,
          isFrenzyReady: gameScene.powerUpManager.isFrenzyReady,
          isFrenzyActive: gameScene.powerUpManager.isFrenzyActive,
          frenzyEndTime: gameScene.powerUpManager.frenzyEndTime
        },

        // Special tiles state (if exists)
        specialTilesState: gameScene.specialTileManager ? {
          steelPlates: [...gameScene.specialTileManager.steelPlates],
          leadTiles: [...gameScene.specialTileManager.leadTiles],
          glassTiles: [...gameScene.specialTileManager.glassTiles],
          autoSwapperTiles: [...gameScene.specialTileManager.autoSwapperTiles],
          bombTiles: [...gameScene.specialTileManager.bombTiles]
        } : null,

        // Objective tracking
        glassCleared: gameScene.glassCleared || 0,
        leadCleared: gameScene.leadCleared || 0,

        // Timestamp for potential expiry
        savedAt: Date.now()
      };

      localStorage.setItem(this.getStorageKey(gameScene.gameMode), JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('Failed to save game state:', e);
      return false;
    }
  }

  /**
   * Serialize board to simple format (handles special tile objects)
   */
  serializeBoard(board) {
    const serialized = [];
    for (let col = 0; col < board.length; col++) {
      serialized[col] = [];
      for (let row = 0; row < board[col].length; row++) {
        const cell = board[col][row];
        if (cell === null) {
          serialized[col][row] = null;
        } else if (typeof cell === 'object') {
          // Special tile - keep the object structure
          serialized[col][row] = { ...cell };
        } else {
          // Regular number tile
          serialized[col][row] = cell;
        }
      }
    }
    return serialized;
  }

  /**
   * Check if there's a saved game for a specific mode
   */
  hasSavedGame(mode) {
    try {
      const stored = localStorage.getItem(this.getStorageKey(mode));
      if (!stored) return false;

      // Optional: expire saved games after 24 hours
      // const state = JSON.parse(stored);
      // const dayMs = 24 * 60 * 60 * 1000;
      // if (Date.now() - state.savedAt > dayMs) {
      //   this.clearSavedGame(mode);
      //   return false;
      // }

      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get saved game state (with automatic migration)
   * @param {string} mode - Game mode to get saved game for
   * @returns {Object|null} Migrated saved game state or null
   */
  getSavedGame(mode) {
    try {
      const stored = localStorage.getItem(this.getStorageKey(mode));
      if (!stored) return null;

      let state = JSON.parse(stored);

      // Migrate old save states to current version
      state = this.migrateState(state);

      return state;
    } catch (e) {
      console.warn('Failed to load saved game:', e);
      return null;
    }
  }

  /**
   * Clear saved game for a specific mode
   * @param {string} mode - Game mode to clear saved game for
   */
  clearSavedGame(mode) {
    try {
      localStorage.removeItem(this.getStorageKey(mode));
    } catch (e) {
      console.warn('Failed to clear saved game:', e);
    }
  }

  /**
   * Load saved state into a game scene
   * This should be called from GameScene after basic initialization
   */
  loadGameState(gameScene, savedState) {
    if (!savedState) return false;

    try {
      // Restore board state
      for (let col = 0; col < savedState.board.length; col++) {
        for (let row = 0; row < savedState.board[col].length; row++) {
          gameScene.boardLogic.board[col][row] = savedState.board[col][row];
        }
      }

      // Restore board logic state
      gameScene.boardLogic.score = savedState.score;
      gameScene.boardLogic.movesUsed = savedState.movesUsed;
      gameScene.boardLogic.mergeCount = savedState.mergeCount;
      gameScene.boardLogic.tilesCreated = savedState.tilesCreated || {};
      gameScene.boardLogic.nextTileId = savedState.nextTileId || 1;

      // Restore next tile
      gameScene.nextTileValue = savedState.nextTileValue;
      gameScene.nextTileType = savedState.nextTileType || 'normal';

      // Restore power-up state
      const pState = savedState.powerUpState;
      gameScene.powerUpManager.resourcePoints = pState.resourcePoints;
      gameScene.powerUpManager.frenzyMeter = pState.frenzyMeter;
      gameScene.powerUpManager.isFrenzyReady = pState.isFrenzyReady;
      gameScene.powerUpManager.isFrenzyActive = pState.isFrenzyActive;
      gameScene.powerUpManager.frenzyEndTime = pState.frenzyEndTime;

      // Restore special tiles state
      if (savedState.specialTilesState && gameScene.specialTileManager) {
        gameScene.specialTileManager.steelPlates = savedState.specialTilesState.steelPlates || [];
        gameScene.specialTileManager.leadTiles = savedState.specialTilesState.leadTiles || [];
        gameScene.specialTileManager.glassTiles = savedState.specialTilesState.glassTiles || [];
        gameScene.specialTileManager.autoSwapperTiles = savedState.specialTilesState.autoSwapperTiles || [];
        gameScene.specialTileManager.bombTiles = savedState.specialTilesState.bombTiles || [];
      }

      // Restore objective tracking
      gameScene.glassCleared = savedState.glassCleared || 0;
      gameScene.leadCleared = savedState.leadCleared || 0;

      return true;
    } catch (e) {
      console.warn('Failed to load game state:', e);
      return false;
    }
  }
}

// Global instance
const gameStateManager = new GameStateManager();


// === js/scenes/MenuScene.js ===
/**
 * MenuScene - Main menu with horizontal carousel for game modes
 */
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {
    // Video is loaded directly via HTML element in showUltraVideo
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title - clean, simple
    this.add.text(width / 2, 55, 'THREES', {
      fontSize: '56px', fontFamily: GameConfig.FONTS.DISPLAY, fontStyle: '800', color: '#ffffff'
    }).setOrigin(0.5);
    this.add.text(width / 2, 100, 'DROP', {
      fontSize: '56px', fontFamily: GameConfig.FONTS.DISPLAY, fontStyle: '800', color: '#66c3d5'
    }).setOrigin(0.5);

    // Game mode cards data
    // tiles can be numbers for regular tiles, or special types: 'steel', 'glass', 'lead', 'bomb', 'auto_swapper'
    const dailyStats = dailyChallengeManager.getStats();
    const dailyChallenge = dailyChallengeManager.generateChallenge();

    this.gameModes = [
      {
        mode: 'daily',
        title: 'DAILY',
        subtitle: dailyStats.todayCompleted ? 'Completed!' : dailyChallenge.name,
        description: dailyStats.todayCompleted
          ? `Streak: ${dailyStats.currentStreak} days\nCome back tomorrow!`
          : `${dailyChallenge.description}\n${dailyChallenge.difficulty.toUpperCase()}`,
        color: dailyStats.todayCompleted ? 0x22c55e : 0xfbbf24,
        tiles: ['daily', 'daily', 'daily'],
        dailyStats: dailyStats
      },
      {
        mode: 'original',
        title: 'ORIGINAL',
        subtitle: 'Classic Mode',
        description: 'Swipe power-up only\nNo special tiles',
        color: 0x4a90e2,
        tiles: [1, 2, 3]
      },
      {
        mode: 'crazy',
        title: 'CRAZY',
        subtitle: 'Full Power',
        description: 'All power-ups unlocked\nSpecial tiles & Frenzy',
        color: 0xe24a4a,
        tiles: ['steel', 'glass', 'lead']
      },
      {
        mode: 'endless',
        title: 'ENDLESS',
        subtitle: 'Score Attack',
        description: 'Bombs explode for points\nAll features enabled',
        color: 0xff4444,
        tiles: ['bomb', 'auto_swapper', 'bomb']
      },
      {
        mode: 'levels',
        title: 'LEVELS',
        subtitle: 'Tutorial & Puzzles',
        description: 'Learn the mechanics\nProgress through challenges',
        color: 0x7ed321,
        tiles: [6, 12, 24]
      },
      {
        mode: 'ultra',
        title: 'ULTRA',
        subtitle: '??? MODE ???',
        description: 'Only for the brave\nAre you ready?',
        color: 0xff00ff,
        tiles: ['ultra', 'ultra', 'ultra']
      }
    ];

    // Carousel state - start on 'original' mode (index 1)
    this.currentIndex = 1;
    this.cardWidth = 260;
    this.cardHeight = 280;
    this.cardGap = 20;
    this.carouselY = height * 0.42;

    // Create carousel container
    this.carouselContainer = this.add.container(0, 0);
    this.cards = [];

    // Create cards
    this.gameModes.forEach((mode, index) => {
      const card = this.createModeCard(mode, index);
      this.cards.push(card);
      this.carouselContainer.add(card.container);
    });

    // Navigation arrows
    this.createArrows();

    // Dot indicators
    this.createDots();

    // Play button
    this.createPlayButton();

    // Menu buttons below carousel
    this.createMenuButtons();

    // Initial positioning
    this.updateCarousel(false);

    // Initialize sound on first interaction
    this.input.once('pointerdown', () => {
      if (typeof soundManager !== 'undefined') soundManager.init();
    });

    // Enable drag on cards
    this.setupDragNavigation();
  }

  createModeCard(modeData, index) {
    const { width } = this.cameras.main;
    const container = this.add.container(0, this.carouselY);

    // Card background - clean white/light style
    const bg = this.add.graphics();
    bg.fillStyle(0xf8f8f8, 1);
    bg.fillRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, this.cardHeight, 12);
    container.add(bg);

    // Colored header band
    const headerBand = this.add.graphics();
    headerBand.fillStyle(modeData.color, 1);
    headerBand.fillRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, 65, { tl: 12, tr: 12, bl: 0, br: 0 });
    container.add(headerBand);

    // Mode title
    const title = this.add.text(0, -this.cardHeight / 2 + 26, modeData.title, {
      fontSize: '32px', fontFamily: GameConfig.FONTS.DISPLAY, fontStyle: '800', color: '#ffffff'
    }).setOrigin(0.5);
    container.add(title);

    // Subtitle
    const subtitle = this.add.text(0, -this.cardHeight / 2 + 52, modeData.subtitle, {
      fontSize: '12px', fontFamily: GameConfig.FONTS.UI, fontStyle: '600', color: '#ffffff'
    }).setOrigin(0.5).setAlpha(0.9);
    container.add(subtitle);

    // Decorative tiles - clean, flat style
    const tileY = -this.cardHeight / 2 + 115;
    modeData.tiles.forEach((val, i) => {
      const tileX = (i - 1) * 55;
      const tileBg = this.add.graphics();
      const tileSize = 44;
      const halfSize = tileSize / 2;
      const radius = 6;

      // Helper to draw clean flat tile
      const drawTileBase = (color) => {
        tileBg.fillStyle(color, 1);
        tileBg.fillRoundedRect(tileX - halfSize, tileY - halfSize, tileSize, tileSize, radius);
      };

      if (typeof val === 'string') {
        // Special tile types
        switch (val) {
          case 'steel':
            drawTileBase(GameConfig.COLORS.STEEL);
            container.add(tileBg);
            break;

          case 'glass':
            drawTileBase(GameConfig.COLORS.GLASS);
            container.add(tileBg);
            container.add(this.add.text(tileX, tileY, '6', {
              fontSize: '18px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: '#2a5080'
            }).setOrigin(0.5));
            break;

          case 'lead':
            drawTileBase(GameConfig.COLORS.LEAD);
            container.add(tileBg);
            container.add(this.add.text(tileX, tileY, '5', {
              fontSize: '18px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: '#888888'
            }).setOrigin(0.5));
            break;

          case 'bomb':
            drawTileBase(GameConfig.COLORS.BOMB);
            container.add(tileBg);
            container.add(this.add.text(tileX, tileY, '3', {
              fontSize: '18px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: '#ffffff'
            }).setOrigin(0.5));
            break;

          case 'auto_swapper':
            drawTileBase(GameConfig.COLORS.AUTO_SWAPPER);
            container.add(tileBg);
            container.add(this.add.text(tileX, tileY, '⇄', {
              fontSize: '20px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#ffffff'
            }).setOrigin(0.5));
            break;

          case 'ultra':
            drawTileBase(GameConfig.COLORS.WILDCARD);
            container.add(tileBg);
            container.add(this.add.text(tileX, tileY, '☠', {
              fontSize: '22px', color: '#ffffff'
            }).setOrigin(0.5));
            break;

          case 'daily':
            const dailyColor = modeData.dailyStats?.todayCompleted ? GameConfig.UI.SUCCESS : GameConfig.UI.WARNING;
            drawTileBase(dailyColor);
            container.add(tileBg);
            const dailyIcon = modeData.dailyStats?.todayCompleted ? '✓' : '📅';
            container.add(this.add.text(tileX, tileY, dailyIcon, {
              fontSize: '20px', color: '#ffffff'
            }).setOrigin(0.5));
            break;
        }
      } else {
        // Regular numeric tile - clean flat style
        const color = getTileColor(val);
        drawTileBase(color);
        container.add(tileBg);
        container.add(this.add.text(tileX, tileY, val.toString(), {
          fontSize: '18px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '800',
          color: getTileTextColor(val)
        }).setOrigin(0.5));
      }
    });

    // Description
    const desc = this.add.text(0, 25, modeData.description, {
      fontSize: '11px', fontFamily: GameConfig.FONTS.UI, color: '#666666',
      align: 'center', lineSpacing: 6
    }).setOrigin(0.5);
    container.add(desc);

    // Goal highlight
    const goalY = 80;
    let goalLabel;
    if (modeData.mode === 'ultra') {
      goalLabel = 'Goal: Survive';
    } else if (modeData.mode === 'endless') {
      goalLabel = 'Goal: Highest Score';
    } else if (modeData.mode === 'daily') {
      goalLabel = modeData.dailyStats?.todayCompleted ? 'Completed Today' : 'Goal: Complete Challenge';
    } else if (modeData.mode === 'levels') {
      goalLabel = 'Goal: Complete All Levels';
    } else {
      goalLabel = 'Goal: Highest Tile';
    }

    const goalText = this.add.text(0, goalY, goalLabel, {
      fontSize: '11px', fontFamily: GameConfig.FONTS.UI, fontStyle: '600', color: '#888888'
    }).setOrigin(0.5);
    container.add(goalText);

    // High score / stats - mode-specific
    if (modeData.mode === 'ultra') {
      container.add(this.add.text(0, this.cardHeight / 2 - 28, '⚠ Danger Zone', {
        fontSize: '14px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#c49cde'
      }).setOrigin(0.5));
    } else if (modeData.mode === 'daily') {
      const streak = modeData.dailyStats?.currentStreak || 0;
      const total = modeData.dailyStats?.totalCompleted || 0;
      const statsText = streak > 0 ? `🔥 ${streak} day streak` : `${total} completed`;
      container.add(this.add.text(0, this.cardHeight / 2 - 28, statsText, {
        fontSize: '12px', fontFamily: GameConfig.FONTS.UI, fontStyle: '600', color: '#888888'
      }).setOrigin(0.5));
    } else if (modeData.mode === 'levels') {
      const totalLevels = levelManager.getTotalLevels();
      container.add(this.add.text(0, this.cardHeight / 2 - 28, `${totalLevels} levels available`, {
        fontSize: '12px', fontFamily: GameConfig.FONTS.UI, fontStyle: '600', color: '#7cc576'
      }).setOrigin(0.5));
    } else {
      const highScore = highScoreManager.getHighScore(modeData.mode);
      const scoreText = highScore > 0 ? `Best: ${highScore}` : 'No score yet';
      container.add(this.add.text(0, this.cardHeight / 2 - 28, scoreText, {
        fontSize: '13px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: highScore > 0 ? '#f5c26b' : '#999999'
      }).setOrigin(0.5));
    }

    return { container, bg, modeData };
  }

  createArrows() {
    const { width } = this.cameras.main;
    const arrowY = this.carouselY;

    // Left arrow - clean style
    this.leftArrow = this.add.text(20, arrowY, '◀', {
      fontSize: '28px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#ffffff'
    }).setOrigin(0.5).setInteractive();

    this.leftArrow.on('pointerdown', () => this.navigateCarousel(-1));
    this.leftArrow.on('pointerover', () => this.leftArrow.setColor('#66c3d5'));
    this.leftArrow.on('pointerout', () => this.leftArrow.setColor('#ffffff'));

    // Collection hint (shows when on first card)
    this.collectionHint = this.add.text(20, arrowY + 30, 'Tiles', {
      fontSize: '9px', fontFamily: GameConfig.FONTS.UI, fontStyle: '600', color: '#aaaaaa'
    }).setOrigin(0.5);

    // Right arrow
    this.rightArrow = this.add.text(width - 20, arrowY, '▶', {
      fontSize: '28px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#ffffff'
    }).setOrigin(0.5).setInteractive();

    this.rightArrow.on('pointerdown', () => this.navigateCarousel(1));
    this.rightArrow.on('pointerover', () => this.rightArrow.setColor('#66c3d5'));
    this.rightArrow.on('pointerout', () => this.rightArrow.setColor('#ffffff'));
  }

  createDots() {
    const { width } = this.cameras.main;
    const dotY = this.carouselY + this.cardHeight / 2 + 25;
    const dotSpacing = 18;
    const startX = width / 2 - ((this.gameModes.length - 1) * dotSpacing) / 2;

    this.dots = [];
    this.gameModes.forEach((_, i) => {
      const dot = this.add.circle(startX + i * dotSpacing, dotY, 5, GameConfig.UI.PRIMARY, i === this.currentIndex ? 1 : 0.3);
      this.dots.push(dot);
    });
  }

  createPlayButton() {
    const { width } = this.cameras.main;
    const buttonY = this.carouselY + this.cardHeight / 2 + 60;

    this.playButton = UIHelpers.createButton(this, width / 2, buttonY, 'PLAY', () => {
      this.playCurrentMode();
    }, { width: 180, height: 50, fontSize: '24px' });
  }

  showUltraVideo() {
    const { width, height } = this.cameras.main;

    // Create dark overlay in Phaser
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.95);
    overlay.setDepth(1000);

    // Create HTML video element directly to avoid CORS issues
    const video = document.createElement('video');
    video.src = 'cat.mp4';
    video.loop = true;
    video.muted = false;
    video.playsInline = true;
    video.style.position = 'absolute';
    video.style.zIndex = '1000';
    video.style.maxWidth = '90%';
    video.style.maxHeight = '80%';
    video.style.top = '50%';
    video.style.left = '50%';
    video.style.transform = 'translate(-50%, -50%)';
    video.style.borderRadius = '10px';
    video.style.boxShadow = '0 0 30px rgba(255, 0, 255, 0.5)';
    video.style.pointerEvents = 'none'; // Let clicks pass through to the click zone

    // Add to game container
    const container = document.getElementById('game-container');
    container.appendChild(video);
    video.play();

    // Close button (HTML)
    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '✕';
    closeBtn.style.position = 'absolute';
    closeBtn.style.zIndex = '1001';
    closeBtn.style.top = '20px';
    closeBtn.style.right = '20px';
    closeBtn.style.fontSize = '32px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.color = '#ffffff';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.textShadow = '0 0 10px #ff00ff';
    container.appendChild(closeBtn);

    // Tap hint
    const tapHint = document.createElement('div');
    tapHint.innerHTML = 'Tap anywhere to close';
    tapHint.style.position = 'absolute';
    tapHint.style.zIndex = '1001';
    tapHint.style.bottom = '30px';
    tapHint.style.left = '50%';
    tapHint.style.transform = 'translateX(-50%)';
    tapHint.style.fontSize = '14px';
    tapHint.style.color = '#888888';
    container.appendChild(tapHint);

    // Overlay click zone (HTML) - z-index above video so clicks register
    const clickZone = document.createElement('div');
    clickZone.style.position = 'absolute';
    clickZone.style.zIndex = '1002';
    clickZone.style.top = '0';
    clickZone.style.left = '0';
    clickZone.style.width = '100%';
    clickZone.style.height = '100%';
    clickZone.style.cursor = 'pointer';
    container.appendChild(clickZone);

    const cleanup = () => {
      video.pause();
      video.remove();
      closeBtn.remove();
      tapHint.remove();
      clickZone.remove();
      overlay.destroy();
    };

    closeBtn.onclick = cleanup;
    clickZone.onclick = cleanup;
  }

  createMenuButtons() {
    const { width, height } = this.cameras.main;
    // Start below the PLAY button (which is at carouselY + cardHeight/2 + 60)
    const startY = this.carouselY + this.cardHeight / 2 + 130;
    const spacing = 45;
    const buttonWidth = 140;
    const buttonGap = 15;

    // Row 1: Leaderboards and Achievements
    UIHelpers.createButton(this, width / 2 - buttonWidth / 2 - buttonGap / 2, startY, 'LEADERBOARD', () => {
      this.scene.start('LeaderboardScene');
    }, { width: buttonWidth, height: 40, fontSize: '12px' });

    UIHelpers.createButton(this, width / 2 + buttonWidth / 2 + buttonGap / 2, startY, 'ACHIEVEMENTS', () => {
      this.scene.start('AchievementScene');
    }, { width: buttonWidth, height: 40, fontSize: '12px' });

    // Row 2: Stats and How to Play
    UIHelpers.createButton(this, width / 2 - buttonWidth / 2 - buttonGap / 2, startY + spacing, 'STATS', () => {
      this.scene.start('StatsScene');
    }, { width: buttonWidth, height: 40, fontSize: '12px' });

    UIHelpers.createButton(this, width / 2 + buttonWidth / 2 + buttonGap / 2, startY + spacing, 'HOW TO PLAY', () => {
      UIHelpers.showHowToPlay(this);
    }, { width: buttonWidth, height: 40, fontSize: '12px' });
  }

  navigateCarousel(direction) {
    const newIndex = this.currentIndex + direction;

    // If swiping left past the first card, go to Tile Collection
    if (newIndex < 0 && this.currentIndex === 0) {
      this.scene.start('TileCollectionScene');
      return;
    }

    if (newIndex >= 0 && newIndex < this.gameModes.length) {
      this.currentIndex = newIndex;
      this.updateCarousel(true);
    }
  }

  updateCarousel(animate = true) {
    const { width } = this.cameras.main;
    const duration = animate ? 200 : 0;

    this.cards.forEach((card, index) => {
      const offset = index - this.currentIndex;
      const targetX = width / 2 + offset * (this.cardWidth + this.cardGap);
      const targetScale = index === this.currentIndex ? 1 : 0.85;
      const targetAlpha = index === this.currentIndex ? 1 : 0.5;

      if (animate) {
        this.tweens.add({
          targets: card.container,
          x: targetX,
          scaleX: targetScale,
          scaleY: targetScale,
          alpha: targetAlpha,
          duration,
          ease: 'Power2'
        });
      } else {
        card.container.x = targetX;
        card.container.setScale(targetScale);
        card.container.alpha = targetAlpha;
      }
    });

    // Update dots
    this.dots.forEach((dot, i) => {
      dot.setAlpha(i === this.currentIndex ? 1 : 0.3);
    });

    // Update arrow visibility
    // Left arrow is always active (goes to Collection when at index 0)
    this.leftArrow.setAlpha(1);
    this.rightArrow.setAlpha(this.currentIndex < this.gameModes.length - 1 ? 1 : 0.3);

    // Show collection hint when on first card
    if (this.collectionHint) {
      this.collectionHint.setVisible(this.currentIndex === 0);
    }
  }

  setupDragNavigation() {
    const { width } = this.cameras.main;

    // Create invisible drag zone over carousel area (narrower to not block arrows)
    const arrowMargin = 50; // Leave space for arrows on each side
    const dragZone = this.add.rectangle(
      width / 2,
      this.carouselY,
      width - arrowMargin * 2,
      this.cardHeight + 60,
      0x000000, 0
    ).setInteractive();

    let startX = 0;
    let isDragging = false;
    let lastTapTime = 0;

    dragZone.on('pointerdown', (pointer) => {
      startX = pointer.x;
      isDragging = true;
    });

    dragZone.on('pointermove', (pointer) => {
      if (!isDragging) return;
      // Visual feedback while dragging could be added here
    });

    dragZone.on('pointerup', (pointer) => {
      if (!isDragging) return;
      isDragging = false;

      const deltaX = pointer.x - startX;
      if (Math.abs(deltaX) > 50) {
        if (deltaX < 0) {
          this.navigateCarousel(1);  // Swipe left = go right
        } else {
          this.navigateCarousel(-1); // Swipe right = go left
        }
      } else {
        // It was a tap, not a swipe - check for double tap
        const now = Date.now();
        if (now - lastTapTime < 300) {
          // Double tap detected - play the current mode
          this.playCurrentMode();
        }
        lastTapTime = now;
      }
    });

    dragZone.on('pointerout', () => {
      isDragging = false;
    });
  }

  playCurrentMode() {
    const mode = this.gameModes[this.currentIndex].mode;
    if (mode === 'ultra') {
      this.showUltraVideo();
    } else if (mode === 'daily') {
      this.scene.start('DailyChallengeScene');
    } else if (mode === 'levels') {
      this.scene.start('TutorialSelectScene');
    } else {
      // Check for saved game
      if (gameStateManager.hasSavedGame(mode)) {
        this.showResumePrompt(mode);
      } else {
        this.scene.start('GameScene', { mode });
      }
    }
  }

  showResumePrompt(mode) {
    const { width, height } = this.cameras.main;

    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(900);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    // Popup box - larger to fit bigger buttons
    const boxWidth = 300;
    const boxHeight = 220;
    const boxX = width / 2 - boxWidth / 2;
    const boxY = height / 2 - boxHeight / 2;

    const box = this.add.graphics();
    box.fillStyle(0x1a1a2e, 1);
    box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    box.lineStyle(2, 0x4a90e2, 1);
    box.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    box.setDepth(901);

    // Title
    const title = this.add.text(width / 2, boxY + 30, 'CONTINUE GAME?', {
      fontSize: '22px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5).setDepth(902);

    // Message
    const message = this.add.text(width / 2, boxY + 60, 'You have a saved game in progress.', {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(902);

    // Button dimensions for consistent sizing
    const btnWidth = 240;
    const btnHeight = 44;
    const btnSpacing = 54;

    // Resume button
    const resumeBtnY = boxY + 105;
    const resumeBtnBg = this.add.graphics();
    resumeBtnBg.fillStyle(0x2d5a1e, 1);
    resumeBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, resumeBtnY - btnHeight / 2, btnWidth, btnHeight, 8);
    resumeBtnBg.setDepth(902);

    const resumeBtn = this.add.text(width / 2, resumeBtnY, 'RESUME GAME', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#7ed321'
    }).setOrigin(0.5).setDepth(903);

    const resumeBtnZone = this.add.rectangle(width / 2, resumeBtnY, btnWidth, btnHeight, 0x000000, 0)
      .setDepth(904).setInteractive();

    // New game button
    const newBtnY = resumeBtnY + btnSpacing;
    const newBtnBg = this.add.graphics();
    newBtnBg.fillStyle(0x5a1e1e, 1);
    newBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, newBtnY - btnHeight / 2, btnWidth, btnHeight, 8);
    newBtnBg.setDepth(902);

    const newBtn = this.add.text(width / 2, newBtnY, 'START NEW GAME', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#e24a4a'
    }).setOrigin(0.5).setDepth(903);

    const newBtnZone = this.add.rectangle(width / 2, newBtnY, btnWidth, btnHeight, 0x000000, 0)
      .setDepth(904).setInteractive();

    // Cleanup function
    const cleanup = () => {
      overlay.destroy();
      box.destroy();
      title.destroy();
      message.destroy();
      resumeBtnBg.destroy();
      resumeBtn.destroy();
      resumeBtnZone.destroy();
      newBtnBg.destroy();
      newBtn.destroy();
      newBtnZone.destroy();
    };

    resumeBtnZone.on('pointerdown', () => {
      cleanup();
      this.scene.start('GameScene', { mode, resumeFromSave: true });
    });

    newBtnZone.on('pointerdown', () => {
      cleanup();
      gameStateManager.clearSavedGame(mode);
      this.scene.start('GameScene', { mode });
    });

    overlay.on('pointerdown', () => {
      cleanup();
    });
  }
}


// === js/scenes/DailyChallengeScene.js ===
/**
 * DailyChallengeScene - Shows today's daily challenge and player stats
 */
class DailyChallengeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DailyChallengeScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title
    this.add.text(width / 2, 40, 'DAILY CHALLENGE', {
      fontSize: '28px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Get today's challenge
    const challenge = dailyChallengeManager.generateChallenge();
    const stats = dailyChallengeManager.getStats();

    // Challenge card
    this.drawChallengeCard(width / 2, 180, challenge, stats.todayCompleted);

    // Stats section
    this.drawStatsSection(width / 2, height - 200, stats);

    // Play button (if not completed)
    if (!stats.todayCompleted) {
      this.createPlayButton(width / 2, height - 80, challenge);
    } else {
      this.add.text(width / 2, height - 80, 'COMPLETED TODAY!', {
        fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4ade80'
      }).setOrigin(0.5);
    }

    // Back button
    this.createBackButton(40, 40);

    // Navigation hint
    this.add.text(width / 2, height - 20, 'Swipe right to go back', {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#888888'
    }).setOrigin(0.5);

    this.setupSwipeNavigation();
  }

  drawChallengeCard(x, y, challenge, completed) {
    const cardWidth = 320;
    const cardHeight = 220;

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(completed ? 0x22c55e : 0x3b82f6, 0.2);
    bg.fillRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 15);
    bg.lineStyle(2, completed ? 0x22c55e : 0x3b82f6, 0.8);
    bg.strokeRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 15);

    // Difficulty badge
    const diffColors = { easy: '#4ade80', medium: '#fbbf24', hard: '#ef4444' };
    this.add.text(x, y - 85, challenge.difficulty.toUpperCase(), {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: diffColors[challenge.difficulty]
    }).setOrigin(0.5);

    // Icon
    this.add.text(x, y - 50, challenge.icon || '🎯', {
      fontSize: '36px'
    }).setOrigin(0.5);

    // Challenge name
    this.add.text(x, y - 5, challenge.name, {
      fontSize: '22px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Description
    this.add.text(x, y + 25, challenge.description, {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#cccccc',
      align: 'center', wordWrap: { width: cardWidth - 40 }
    }).setOrigin(0.5);

    // Target/details
    let detailText = '';
    if (challenge.type === 'limited_moves') {
      detailText = `Score ${challenge.target} in ${challenge.moveLimit} moves`;
    } else if (challenge.target) {
      detailText = `Target: ${challenge.target}`;
    } else if (challenge.survivalMoves) {
      detailText = `Survive: ${challenge.survivalMoves} moves`;
    }

    this.add.text(x, y + 55, detailText, {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#60a5fa'
    }).setOrigin(0.5);

    // Modifier (if any)
    if (challenge.modifier && challenge.modifier.id !== 'none') {
      this.add.text(x, y + 80, `${challenge.modifier.name}: ${challenge.modifier.description}`, {
        fontSize: '12px', fontFamily: 'Arial, sans-serif', color: '#f59e0b'
      }).setOrigin(0.5);
    }

    // Rewards
    this.add.text(x, y + 100, `+${challenge.rewards.points} points`, {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#a78bfa'
    }).setOrigin(0.5);
  }

  drawStatsSection(x, y, stats) {
    const statWidth = 80;
    const spacing = 90;
    const startX = x - spacing * 1.5;

    const statItems = [
      { label: 'STREAK', value: stats.currentStreak, color: '#fbbf24' },
      { label: 'BEST', value: stats.longestStreak, color: '#f472b6' },
      { label: 'TOTAL', value: stats.totalCompleted, color: '#60a5fa' },
      { label: 'POINTS', value: stats.totalPoints, color: '#a78bfa' }
    ];

    statItems.forEach((stat, i) => {
      const sx = startX + i * spacing;

      // Stat value
      this.add.text(sx, y, stat.value.toString(), {
        fontSize: '28px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: stat.color
      }).setOrigin(0.5);

      // Stat label
      this.add.text(sx, y + 25, stat.label, {
        fontSize: '10px', fontFamily: 'Arial, sans-serif', color: '#888888'
      }).setOrigin(0.5);
    });
  }

  createPlayButton(x, y, challenge) {
    const btn = this.add.graphics();
    btn.fillStyle(0x22c55e, 1);
    btn.fillRoundedRect(x - 100, y - 25, 200, 50, 25);

    const text = this.add.text(x, y, 'PLAY CHALLENGE', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Make interactive
    const hitArea = this.add.rectangle(x, y, 200, 50, 0x000000, 0).setInteractive();

    hitArea.on('pointerover', () => {
      btn.clear();
      btn.fillStyle(0x16a34a, 1);
      btn.fillRoundedRect(x - 100, y - 25, 200, 50, 25);
    });

    hitArea.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(0x22c55e, 1);
      btn.fillRoundedRect(x - 100, y - 25, 200, 50, 25);
    });

    hitArea.on('pointerdown', () => {
      this.startChallenge(challenge);
    });
  }

  createBackButton(x, y) {
    const btn = this.add.text(x, y, '< BACK', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#60a5fa'
    }).setOrigin(0, 0.5).setInteractive();

    btn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  setupSwipeNavigation() {
    let startX = 0;

    this.input.on('pointerdown', (pointer) => {
      startX = pointer.x;
    });

    this.input.on('pointerup', (pointer) => {
      const deltaX = pointer.x - startX;
      if (deltaX > 80) {
        this.scene.start('MenuScene');
      }
    });
  }

  startChallenge(challenge) {
    // Pass challenge config to GameScene
    this.scene.start('GameScene', {
      mode: 'daily',
      dailyChallenge: challenge
    });
  }
}


// === js/scenes/TileCollectionScene.js ===
/**
 * TileCollectionScene - Interactive sandbox showing discovered tiles
 * Players can swipe to shift all tiles around on a board with no gravity or merging
 */
class TileCollectionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TileCollectionScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title
    this.add.text(width / 2, 40, 'TILE COLLECTION', {
      fontSize: '28px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Grid settings - larger grid to use more space
    this.gridCols = 4;
    this.gridRows = 6;

    // Calculate tile size to fit nicely in available space
    const availableHeight = height - 120; // Leave room for title and padding
    const availableWidth = width - 40;
    this.tileSize = Math.min(
      Math.floor(availableWidth / this.gridCols),
      Math.floor(availableHeight / this.gridRows),
      90 // Max tile size
    );

    this.gridOffsetX = (width - this.gridCols * this.tileSize) / 2;
    this.gridOffsetY = 80;

    // Board state - null means empty
    this.board = [];
    for (let col = 0; col < this.gridCols; col++) {
      this.board[col] = [];
      for (let row = 0; row < this.gridRows; row++) {
        this.board[col][row] = null;
      }
    }

    // Tile sprites
    this.tileSprites = {};

    // Draw grid background
    this.drawGrid();

    // Place discovered tiles on the board
    this.placeDiscoveredTiles();

    // Setup swipe controls to move tiles
    this.setupSwipeControls();

    // Keyboard controls
    this.input.keyboard.on('keydown-LEFT', () => this.shiftAllTiles('left'));
    this.input.keyboard.on('keydown-RIGHT', () => this.shiftAllTiles('right'));
    this.input.keyboard.on('keydown-UP', () => this.shiftAllTiles('up'));
    this.input.keyboard.on('keydown-DOWN', () => this.shiftAllTiles('down'));
  }

  drawGrid() {
    const gridBg = this.add.graphics();

    // Grid background
    gridBg.fillStyle(GameConfig.UI.GRID_BG, 0.8);
    gridBg.fillRoundedRect(
      this.gridOffsetX - 5,
      this.gridOffsetY - 5,
      this.gridCols * this.tileSize + 10,
      this.gridRows * this.tileSize + 10,
      10
    );

    // Cell backgrounds
    for (let col = 0; col < this.gridCols; col++) {
      for (let row = 0; row < this.gridRows; row++) {
        const x = this.gridOffsetX + col * this.tileSize;
        const y = this.gridOffsetY + row * this.tileSize;

        gridBg.fillStyle(GameConfig.UI.CELL_BG, 0.8);
        gridBg.fillRoundedRect(x + 3, y + 3, this.tileSize - 6, this.tileSize - 6, 8);
      }
    }
  }

  placeDiscoveredTiles() {
    const discovered = tileCollectionManager.getDiscoveredTiles();

    // Place only discovered tiles in order, filling rows
    let col = 0;
    let row = 0;

    discovered.forEach(value => {
      if (col >= this.gridCols) {
        col = 0;
        row++;
      }
      if (row >= this.gridRows) return; // Board full

      // Place the tile
      this.board[col][row] = value;
      this.createTileSprite(col, row, value);

      col++;
    });
  }

  createTileSprite(col, row, value) {
    const x = this.gridOffsetX + col * this.tileSize + this.tileSize / 2;
    const y = this.gridOffsetY + row * this.tileSize + this.tileSize / 2;

    const container = this.add.container(x, y);

    // Tile background
    const bg = this.add.graphics();
    const size = this.tileSize - 10;
    bg.fillStyle(getTileColor(value), 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 10);
    bg.lineStyle(2, 0xffffff, 0.4);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 10);
    container.add(bg);

    // Value text
    const fontSize = value >= 1000 ? '20px' : value >= 100 ? '26px' : '32px';
    const text = this.add.text(0, 0, value.toString(), {
      fontSize, fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: getTileTextColor(value)
    }).setOrigin(0.5);
    container.add(text);

    // Store reference
    this.tileSprites[`${col},${row}`] = { container, value, col, row };

    return container;
  }

  setupSwipeControls() {
    const { width, height } = this.cameras.main;

    let startX = -1;
    let startY = -1;
    let swipeStarted = false;

    this.input.on('pointerdown', (pointer) => {
      startX = pointer.x;
      startY = pointer.y;
      swipeStarted = true;
    });

    this.input.on('pointerup', (pointer) => {
      // Ignore if swipe didn't start in this scene
      if (!swipeStarted) return;
      swipeStarted = false;

      const deltaX = pointer.x - startX;
      const deltaY = pointer.y - startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Need a minimum swipe distance
      if (absDeltaX < 40 && absDeltaY < 40) return;

      // Determine swipe direction
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          // Swipe right - check if should go back to menu or shift tiles
          if (startX > width * 0.7) {
            this.scene.start('MenuScene');
          } else {
            this.shiftAllTiles('right');
          }
        } else {
          this.shiftAllTiles('left');
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          this.shiftAllTiles('down');
        } else {
          this.shiftAllTiles('up');
        }
      }
    });

    // Right arrow hint for going back
    this.add.text(width - 15, height / 2, '>', {
      fontSize: '40px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setAlpha(0.5).setInteractive().on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // Hint text
    this.add.text(width - 15, height / 2 + 35, 'GAMES', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setAlpha(0.7);
  }

  shiftAllTiles(direction) {
    // Shift each tile ONE space in the direction (like the game)
    // Process in correct order: tiles closer to target edge move first
    // This way, when we update board state immediately, subsequent tiles see the updated state

    if (direction === 'left') {
      for (let row = 0; row < this.gridRows; row++) {
        // Process left to right (tiles closer to left edge first)
        for (let col = 1; col < this.gridCols; col++) {
          this.shiftTileOneSpace(col, row, col - 1, row);
        }
      }
    } else if (direction === 'right') {
      for (let row = 0; row < this.gridRows; row++) {
        // Process right to left (tiles closer to right edge first)
        for (let col = this.gridCols - 2; col >= 0; col--) {
          this.shiftTileOneSpace(col, row, col + 1, row);
        }
      }
    } else if (direction === 'up') {
      for (let col = 0; col < this.gridCols; col++) {
        // Process top to bottom (tiles closer to top edge first)
        for (let row = 1; row < this.gridRows; row++) {
          this.shiftTileOneSpace(col, row, col, row - 1);
        }
      }
    } else if (direction === 'down') {
      for (let col = 0; col < this.gridCols; col++) {
        // Process bottom to top (tiles closer to bottom edge first)
        for (let row = this.gridRows - 2; row >= 0; row--) {
          this.shiftTileOneSpace(col, row, col, row + 1);
        }
      }
    }
  }

  shiftTileOneSpace(fromCol, fromRow, toCol, toRow) {
    // Only move if source has a tile and destination is empty
    if (this.board[fromCol][fromRow] === null) return;
    if (this.board[toCol][toRow] !== null) return;

    // Update board state immediately
    this.board[toCol][toRow] = this.board[fromCol][fromRow];
    this.board[fromCol][fromRow] = null;

    // Update sprite tracking and animate
    const key = `${fromCol},${fromRow}`;
    const sprite = this.tileSprites[key];
    if (!sprite) return;

    delete this.tileSprites[key];
    sprite.col = toCol;
    sprite.row = toRow;
    this.tileSprites[`${toCol},${toRow}`] = sprite;

    // Animate to new position
    const newX = this.gridOffsetX + toCol * this.tileSize + this.tileSize / 2;
    const newY = this.gridOffsetY + toRow * this.tileSize + this.tileSize / 2;

    this.tweens.add({
      targets: sprite.container,
      x: newX,
      y: newY,
      duration: 120,
      ease: 'Power2'
    });
  }
}


// === js/scenes/TutorialSelectScene.js ===
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

    // Get all levels and sort by ID
    const levels = levelManager.getAllLevels().slice().sort((a, b) => a.id - b.id);
    const total = levels.length;

    // Level grid settings - responsive to screen width
    const cols = 4;
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
    levels.forEach((level, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      this.createLevelButton(x, y, level);
    });

    // Setup scrolling
    this.setupScrolling();

    // Scroll indicator (if content is scrollable)
    if (this.contentHeight > height) {
      this.createScrollIndicator();
    }
  }

  createLevelButton(x, y, level) {
    // Guard against null level (can happen if level IDs don't match indices)
    if (!level) {
      console.warn('Attempted to create button for null level');
      return;
    }

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
    const trackHeight = height - 130;

    // Scroll track
    this.scrollTrack = this.add.graphics();
    this.scrollTrack.fillStyle(0x333333, 0.5);
    this.scrollTrack.fillRoundedRect(width - 12, 110, 6, trackHeight, 3);
    this.scrollTrack.setDepth(100);

    // Scroll thumb
    const thumbHeight = Math.max(30, trackHeight * ((height - 110) / this.contentHeight));
    this.scrollThumb = this.add.graphics();
    this.scrollThumb.fillStyle(0x4a90e2, 0.8);
    this.scrollThumb.fillRoundedRect(width - 12, 110, 6, thumbHeight, 3);
    this.scrollThumb.setDepth(100);

    this.thumbHeight = thumbHeight;
    this.trackHeight = trackHeight;

    // Make scroll bar area interactive
    const scrollBarHitArea = this.add.rectangle(width - 9, 110 + trackHeight / 2, 18, trackHeight, 0x000000, 0);
    scrollBarHitArea.setInteractive();
    scrollBarHitArea.setDepth(101);

    let isDraggingThumb = false;

    scrollBarHitArea.on('pointerdown', (pointer) => {
      isDraggingThumb = true;
      this.scrollToPointerY(pointer.y);
    });

    this.input.on('pointermove', (pointer) => {
      if (isDraggingThumb) {
        this.scrollToPointerY(pointer.y);
      }
    });

    this.input.on('pointerup', () => {
      isDraggingThumb = false;
    });
  }

  scrollToPointerY(pointerY) {
    const { height } = this.cameras.main;
    const trackTop = 110;
    const trackHeight = this.trackHeight;

    // Calculate scroll position from pointer Y
    const relativeY = Phaser.Math.Clamp(pointerY - trackTop, 0, trackHeight);
    const scrollProgress = relativeY / trackHeight;
    const scrollRange = this.maxScrollY - this.minScrollY;

    this.scrollY = this.maxScrollY - scrollProgress * scrollRange;
    this.scrollY = Phaser.Math.Clamp(this.scrollY, this.minScrollY, this.maxScrollY);
    this.scrollContainer.y = this.scrollY;
    this.updateScrollIndicator();
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


// === js/scenes/LeaderboardScene.js ===
/**
 * LeaderboardScene - Display high scores for each game mode
 */
class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title
    this.add.text(width / 2, 50, 'LEADERBOARD', {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Back button
    this.add.text(20, 20, '< BACK', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setInteractive().on('pointerdown', () => this.scene.start('MenuScene'));

    // Tab buttons
    this.modes = ['original', 'crazy', 'endless'];
    this.modeLabels = ['ORIGINAL', 'CRAZY', 'ENDLESS'];
    this.currentTab = 0;
    this.tabButtons = [];

    const tabY = 100;
    const tabWidth = (width - 40) / 3;

    this.modes.forEach((mode, i) => {
      const x = 20 + tabWidth / 2 + i * tabWidth;
      const tab = this.createTab(x, tabY, this.modeLabels[i], i);
      this.tabButtons.push(tab);
    });

    // Score display area
    this.scoreContainer = this.add.container(0, 0);
    this.updateScoreDisplay();
  }

  createTab(x, y, label, index) {
    const tabWidth = 100;
    const tabHeight = 35;

    const bg = this.add.graphics();
    const text = this.add.text(x, y, label, {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(x, y, tabWidth, tabHeight, 0x000000, 0).setInteractive();

    hitArea.on('pointerdown', () => {
      this.currentTab = index;
      this.updateTabs();
      this.updateScoreDisplay();
    });

    const tab = { bg, text, hitArea, index };
    this.drawTab(tab, index === this.currentTab);
    return tab;
  }

  drawTab(tab, active) {
    const x = tab.text.x;
    const y = tab.text.y;
    const tabWidth = 100;
    const tabHeight = 35;

    tab.bg.clear();
    if (active) {
      tab.bg.fillStyle(GameConfig.UI.PRIMARY, 0.6);
      tab.bg.lineStyle(2, GameConfig.UI.PRIMARY, 1);
    } else {
      tab.bg.fillStyle(0x333333, 0.3);
      tab.bg.lineStyle(1, 0x555555, 0.5);
    }
    tab.bg.fillRoundedRect(x - tabWidth / 2, y - tabHeight / 2, tabWidth, tabHeight, 6);
    tab.bg.strokeRoundedRect(x - tabWidth / 2, y - tabHeight / 2, tabWidth, tabHeight, 6);
  }

  updateTabs() {
    this.tabButtons.forEach((tab, i) => {
      this.drawTab(tab, i === this.currentTab);
    });
  }

  updateScoreDisplay() {
    const { width, height } = this.cameras.main;

    // Clear previous content
    this.scoreContainer.removeAll(true);

    const mode = this.modes[this.currentTab];
    const highScore = highScoreManager.getHighScore(mode);

    const startY = 160;

    // Trophy icon
    const trophy = this.add.text(width / 2, startY + 30, '🏆', {
      fontSize: '48px'
    }).setOrigin(0.5);
    this.scoreContainer.add(trophy);

    // High score
    if (highScore > 0) {
      const scoreText = this.add.text(width / 2, startY + 100, highScore.toString(), {
        fontSize: '64px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#f5a623'
      }).setOrigin(0.5);
      this.scoreContainer.add(scoreText);

      const label = this.add.text(width / 2, startY + 150, 'PERSONAL BEST', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
      }).setOrigin(0.5);
      this.scoreContainer.add(label);
    } else {
      const noScore = this.add.text(width / 2, startY + 100, 'No score yet', {
        fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#666666'
      }).setOrigin(0.5);
      this.scoreContainer.add(noScore);

      const hint = this.add.text(width / 2, startY + 140, `Play ${this.modeLabels[this.currentTab]} mode\nto set a high score!`, {
        fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa',
        align: 'center', lineSpacing: 4
      }).setOrigin(0.5);
      this.scoreContainer.add(hint);
    }

    // Play button
    const playBtn = UIHelpers.createButton(this, width / 2, startY + 230, 'PLAY NOW', () => {
      this.scene.start('GameScene', { mode });
    }, { width: 160, height: 45, fontSize: '18px' });
    // Note: button is added to scene, not container - that's fine for this use case
  }
}


// === js/scenes/AchievementScene.js ===
/**
 * AchievementScene - Display achievement badges and milestones with scrolling
 */
class AchievementScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AchievementScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Header area - fixed at top with depth to stay above scroll content
    const headerY = 50;

    // Title
    this.add.text(width / 2, headerY, 'ACHIEVEMENTS', {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5).setDepth(100);

    // Back button
    this.add.text(20, 20, '< BACK', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setInteractive().on('pointerdown', () => this.scene.start('MenuScene')).setDepth(100);

    // Load achievements from AchievementManager
    this.achievements = achievementManager.getAllAchievements();

    // Count stats
    const unlockedCount = this.achievements.filter(a => a.unlocked).length;
    const totalCount = this.achievements.length;

    // Progress text
    this.add.text(width / 2, headerY + 35, `${unlockedCount} / ${totalCount} Unlocked`, {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#888888'
    }).setOrigin(0.5).setDepth(100);

    // Create scrollable achievement list
    this.createScrollableList();
  }

  createScrollableList() {
    const { width, height } = this.cameras.main;
    const startY = 120; // Start below header area
    const itemHeight = 70;
    const itemWidth = Math.min(width - 40, 460); // Cap width for very wide screens
    const visibleHeight = height - startY - 20;

    // Calculate total content height
    const totalHeight = this.achievements.length * itemHeight;

    // Create a container for all achievement items
    this.scrollContainer = this.add.container(0, 0);

    // Create achievement items inside container
    this.achievements.forEach((achievement, index) => {
      const y = startY + index * itemHeight;
      this.createAchievementItem(width / 2, y, achievement, itemWidth, this.scrollContainer);
    });

    // Set up scrolling bounds
    this.scrollY = 0;
    this.minScrollY = Math.min(0, visibleHeight - totalHeight - startY);
    this.maxScrollY = 0;
    this.scrollStartY = startY;
    this.visibleHeight = visibleHeight;

    // Create mask for scrolling area
    const maskGraphics = this.make.graphics();
    maskGraphics.fillStyle(0xffffff);
    maskGraphics.fillRect(0, startY, width, visibleHeight);
    const mask = maskGraphics.createGeometryMask();
    this.scrollContainer.setMask(mask);

    // Set up scroll input
    this.setupScrollInput();

    // Add scroll indicators if content overflows
    if (totalHeight > visibleHeight) {
      this.createScrollIndicators(width, startY, visibleHeight);
    }
  }

  setupScrollInput() {
    const { width, height } = this.cameras.main;

    // Create interactive zone for scrolling
    const scrollZone = this.add.rectangle(width / 2, height / 2 + 45, width, height - 110, 0x000000, 0);
    scrollZone.setInteractive();

    let isDragging = false;
    let dragStartY = 0;
    let scrollStartY = 0;

    scrollZone.on('pointerdown', (pointer) => {
      isDragging = true;
      dragStartY = pointer.y;
      scrollStartY = this.scrollY;
    });

    scrollZone.on('pointermove', (pointer) => {
      if (!isDragging) return;

      const deltaY = pointer.y - dragStartY;
      this.scrollY = Phaser.Math.Clamp(
        scrollStartY + deltaY,
        this.minScrollY,
        this.maxScrollY
      );
      this.scrollContainer.y = this.scrollY;
      this.updateScrollIndicators();
    });

    scrollZone.on('pointerup', () => {
      isDragging = false;
    });

    scrollZone.on('pointerout', () => {
      isDragging = false;
    });

    // Mouse wheel support
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      this.scrollY = Phaser.Math.Clamp(
        this.scrollY - deltaY * 0.5,
        this.minScrollY,
        this.maxScrollY
      );
      this.scrollContainer.y = this.scrollY;
      this.updateScrollIndicators();
    });
  }

  createScrollIndicators(width, startY, visibleHeight) {
    // Up arrow indicator
    this.upArrow = this.add.text(width / 2, startY + 10, '▲', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#4a90e2'
    }).setOrigin(0.5).setAlpha(0).setDepth(101);

    // Down arrow indicator
    this.downArrow = this.add.text(width / 2, startY + visibleHeight - 10, '▼', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#4a90e2'
    }).setOrigin(0.5).setAlpha(1).setDepth(101);

    // Scroll bar track
    this.trackX = width - 12;
    const trackHeight = visibleHeight - 20;
    this.scrollTrack = this.add.graphics();
    this.scrollTrack.fillStyle(0x333333, 0.5);
    this.scrollTrack.fillRoundedRect(this.trackX - 3, startY + 10, 6, trackHeight, 3);
    this.scrollTrack.setDepth(100);

    // Scroll bar thumb
    const thumbHeight = Math.max(30, (visibleHeight / (this.achievements.length * 70)) * trackHeight);
    this.scrollThumb = this.add.graphics();
    this.scrollThumb.fillStyle(0x4a90e2, 0.8);
    this.scrollThumb.fillRoundedRect(this.trackX - 3, startY + 10, 6, thumbHeight, 3);
    this.scrollThumb.setDepth(100);
    this.thumbHeight = thumbHeight;
    this.trackHeight = trackHeight;
    this.trackStartY = startY + 10;
  }

  updateScrollIndicators() {
    if (!this.upArrow) return;

    // Update arrow visibility
    this.upArrow.setAlpha(this.scrollY < this.maxScrollY ? 1 : 0);
    this.downArrow.setAlpha(this.scrollY > this.minScrollY ? 1 : 0);

    // Update scroll thumb position
    if (this.scrollThumb && this.minScrollY < 0) {
      const scrollPercent = this.scrollY / this.minScrollY;
      const thumbY = this.trackStartY + scrollPercent * (this.trackHeight - this.thumbHeight);

      this.scrollThumb.clear();
      this.scrollThumb.fillStyle(0x4a90e2, 0.8);
      this.scrollThumb.fillRoundedRect(
        this.trackX - 3,
        thumbY,
        6,
        this.thumbHeight,
        3
      );
    }
  }

  createAchievementItem(x, y, achievement, itemWidth, container) {
    const itemHeight = 60;

    // Background
    const bg = this.add.graphics();
    const bgColor = achievement.unlocked ? 0x4a90e2 : 0x333333;
    const bgAlpha = achievement.unlocked ? 0.3 : 0.2;
    const borderColor = achievement.unlocked ? 0x4a90e2 : 0x555555;

    bg.fillStyle(bgColor, bgAlpha);
    bg.lineStyle(2, borderColor, 0.6);
    bg.fillRoundedRect(x - itemWidth / 2, y - itemHeight / 2, itemWidth, itemHeight, 8);
    bg.strokeRoundedRect(x - itemWidth / 2, y - itemHeight / 2, itemWidth, itemHeight, 8);
    container.add(bg);

    // Icon background
    const iconX = x - itemWidth / 2 + 35;
    const iconBg = this.add.graphics();
    iconBg.fillStyle(achievement.unlocked ? 0xf5a623 : 0x444444, achievement.unlocked ? 0.8 : 0.5);
    iconBg.fillCircle(iconX, y, 22);
    container.add(iconBg);

    // Icon text
    const iconText = this.add.text(iconX, y, achievement.icon, {
      fontSize: achievement.icon.length > 2 ? '12px' : '16px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: achievement.unlocked ? '#ffffff' : '#888888'
    }).setOrigin(0.5);
    container.add(iconText);

    // Name
    const nameX = x - itemWidth / 2 + 75;
    const name = this.add.text(nameX, y - 10, achievement.name, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: achievement.unlocked ? '#ffffff' : '#888888'
    }).setOrigin(0, 0.5);
    container.add(name);

    // Description
    const desc = this.add.text(nameX, y + 10, achievement.description, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: achievement.unlocked ? '#aaaaaa' : '#666666'
    }).setOrigin(0, 0.5);
    container.add(desc);

    // Status icon (lock or check)
    if (!achievement.unlocked) {
      const lockIcon = this.add.text(x + itemWidth / 2 - 25, y, '🔒', {
        fontSize: '20px'
      }).setOrigin(0.5);
      container.add(lockIcon);
    } else {
      const checkIcon = this.add.text(x + itemWidth / 2 - 25, y, '✓', {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        color: '#7ed321'
      }).setOrigin(0.5);
      container.add(checkIcon);
    }
  }
}


// === js/scenes/StatsScene.js ===
/**
 * StatsScene - Display player statistics with scrollable sections
 * Follows AchievementScene pattern: back button, title, scrollable content with mask.
 */
class StatsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StatsScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Header - fixed at top
    this.add.text(width / 2, 50, 'STATISTICS', {
      fontSize: '32px', fontFamily: GameConfig.FONTS.DISPLAY, fontStyle: '800', color: '#ffffff'
    }).setOrigin(0.5).setDepth(100);

    // Back button
    this.add.text(20, 20, '< BACK', {
      fontSize: '18px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#5a9fd4'
    }).setInteractive().on('pointerdown', () => this.scene.start('MenuScene')).setDepth(100);

    this.createScrollableContent();
  }

  createScrollableContent() {
    const { width, height } = this.cameras.main;
    const startY = 90;
    const visibleHeight = height - startY - 10;
    const contentWidth = Math.min(width - 40, 440);
    const leftX = (width - contentWidth) / 2;

    // Scrollable container
    this.scrollContainer = this.add.container(0, 0);

    let y = startY + 10;

    // Gather all stats
    const stats = achievementManager.stats;
    const dailyStats = dailyChallengeManager.getStats();
    const achievements = achievementManager.getAllAchievements();
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    // ---- GAMEPLAY ----
    y = this.addSectionHeader(y, 'Gameplay', GameConfig.UI.PRIMARY);
    y = this.addStatRow(y, leftX, contentWidth, 'Games Played', stats.gamesPlayed);
    y = this.addStatRow(y, leftX, contentWidth, 'Highest Score', stats.highestScore);
    y = this.addStatRow(y, leftX, contentWidth, 'Highest Tile', stats.highestTile || '-');
    y = this.addStatRow(y, leftX, contentWidth, 'Levels Completed', stats.levelsCompleted);
    y = this.addStatRow(y, leftX, contentWidth, 'Modes Tried', stats.modesPlayed.length);
    y += 10;

    // ---- HIGH SCORES ----
    y = this.addSectionHeader(y, 'High Scores', GameConfig.UI.WARNING);
    y = this.addStatRow(y, leftX, contentWidth, 'Original', highScoreManager.getHighScore('original') || '-');
    y = this.addStatRow(y, leftX, contentWidth, 'Crazy', highScoreManager.getHighScore('crazy') || '-');
    y = this.addStatRow(y, leftX, contentWidth, 'Endless', highScoreManager.getHighScore('endless') || '-');
    y += 10;

    // ---- SPECIAL TILES ----
    y = this.addSectionHeader(y, 'Special Tiles', GameConfig.COLORS.AUTO_SWAPPER);
    y = this.addStatRow(y, leftX, contentWidth, 'Glass Broken', stats.glassBroken);
    y = this.addStatRow(y, leftX, contentWidth, 'Lead Cleared', stats.leadCleared);
    y = this.addStatRow(y, leftX, contentWidth, 'Bombs Exploded', stats.bombsExploded);
    y += 10;

    // ---- POWER-UPS ----
    y = this.addSectionHeader(y, 'Power-Ups', GameConfig.UI.FRENZY);
    y = this.addStatRow(y, leftX, contentWidth, 'Frenzy Activations', stats.frenzyCount);
    y += 10;

    // ---- DAILY CHALLENGES ----
    y = this.addSectionHeader(y, 'Daily Challenges', GameConfig.UI.SUCCESS);
    y = this.addStatRow(y, leftX, contentWidth, 'Completed', dailyStats.totalCompleted);
    y = this.addStatRow(y, leftX, contentWidth, 'Current Streak', dailyStats.currentStreak);
    y = this.addStatRow(y, leftX, contentWidth, 'Longest Streak', dailyStats.longestStreak);
    y = this.addStatRow(y, leftX, contentWidth, 'Total Points', dailyStats.totalPoints);
    y += 10;

    // ---- ACHIEVEMENTS ----
    y = this.addSectionHeader(y, 'Achievements', 0xf5a623);
    y = this.addStatRow(y, leftX, contentWidth, 'Unlocked', `${unlockedCount} / ${achievements.length}`);
    y += 20;

    const totalContentHeight = y - startY;

    // Mask for scroll area
    const maskGraphics = this.make.graphics();
    maskGraphics.fillStyle(0xffffff);
    maskGraphics.fillRect(0, startY, width, visibleHeight);
    this.scrollContainer.setMask(maskGraphics.createGeometryMask());

    // Scroll state
    this.scrollY = 0;
    this.minScrollY = Math.min(0, visibleHeight - totalContentHeight);
    this.maxScrollY = 0;

    // Scroll input
    this.setupScrollInput(width, height, startY, visibleHeight, totalContentHeight);
  }

  addSectionHeader(y, text, color) {
    const { width } = this.cameras.main;
    const colorValue = typeof color === 'number' ? color : color;

    const header = this.add.text(width / 2, y, text, {
      fontSize: '16px', fontFamily: GameConfig.FONTS.UI, fontStyle: '700', color: '#ffffff'
    }).setOrigin(0.5);
    this.scrollContainer.add(header);

    const lineWidth = header.width + 30;
    const line = this.add.graphics();
    line.lineStyle(2, colorValue, 0.5);
    line.lineBetween(width / 2 - lineWidth / 2, y + 14, width / 2 + lineWidth / 2, y + 14);
    this.scrollContainer.add(line);

    return y + 30;
  }

  addStatRow(y, leftX, contentWidth, label, value) {
    const labelText = this.add.text(leftX + 10, y, label, {
      fontSize: '14px', fontFamily: GameConfig.FONTS.UI, fontStyle: '600', color: '#bbbbbb'
    }).setOrigin(0, 0.5);
    this.scrollContainer.add(labelText);

    const valueText = this.add.text(leftX + contentWidth - 10, y, String(value), {
      fontSize: '14px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '700', color: '#ffffff'
    }).setOrigin(1, 0.5);
    this.scrollContainer.add(valueText);

    return y + 28;
  }

  setupScrollInput(width, height, startY, visibleHeight, totalContentHeight) {
    const scrollZone = this.add.rectangle(width / 2, startY + visibleHeight / 2, width, visibleHeight, 0x000000, 0);
    scrollZone.setInteractive();

    let isDragging = false;
    let dragStartY = 0;
    let scrollStartY = 0;

    scrollZone.on('pointerdown', (pointer) => {
      isDragging = true;
      dragStartY = pointer.y;
      scrollStartY = this.scrollY;
    });

    scrollZone.on('pointermove', (pointer) => {
      if (!isDragging) return;
      const deltaY = pointer.y - dragStartY;
      this.scrollY = Phaser.Math.Clamp(scrollStartY + deltaY, this.minScrollY, this.maxScrollY);
      this.scrollContainer.y = this.scrollY;
      this.updateScrollIndicators();
    });

    scrollZone.on('pointerup', () => { isDragging = false; });
    scrollZone.on('pointerout', () => { isDragging = false; });

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      this.scrollY = Phaser.Math.Clamp(this.scrollY - deltaY * 0.5, this.minScrollY, this.maxScrollY);
      this.scrollContainer.y = this.scrollY;
      this.updateScrollIndicators();
    });

    // Scroll indicators
    if (totalContentHeight > visibleHeight) {
      this.upArrow = this.add.text(width / 2, startY + 8, '▲', {
        fontSize: '18px', fontFamily: GameConfig.FONTS.UI, color: '#5a9fd4'
      }).setOrigin(0.5).setAlpha(0).setDepth(101);

      this.downArrow = this.add.text(width / 2, startY + visibleHeight - 8, '▼', {
        fontSize: '18px', fontFamily: GameConfig.FONTS.UI, color: '#5a9fd4'
      }).setOrigin(0.5).setAlpha(1).setDepth(101);

      // Scroll bar
      this.trackX = width - 10;
      this.trackHeight = visibleHeight - 20;
      this.trackStartY = startY + 10;
      const thumbHeight = Math.max(30, (visibleHeight / totalContentHeight) * this.trackHeight);
      this.thumbHeight = thumbHeight;

      const track = this.add.graphics();
      track.fillStyle(0x333333, 0.4);
      track.fillRoundedRect(this.trackX - 2, this.trackStartY, 4, this.trackHeight, 2);
      track.setDepth(100);

      this.scrollThumb = this.add.graphics();
      this.scrollThumb.fillStyle(0x5a9fd4, 0.7);
      this.scrollThumb.fillRoundedRect(this.trackX - 2, this.trackStartY, 4, thumbHeight, 2);
      this.scrollThumb.setDepth(100);
    }
  }

  updateScrollIndicators() {
    if (!this.upArrow) return;
    this.upArrow.setAlpha(this.scrollY < this.maxScrollY ? 1 : 0);
    this.downArrow.setAlpha(this.scrollY > this.minScrollY ? 1 : 0);

    if (this.scrollThumb && this.minScrollY < 0) {
      const pct = this.scrollY / this.minScrollY;
      const thumbY = this.trackStartY + pct * (this.trackHeight - this.thumbHeight);
      this.scrollThumb.clear();
      this.scrollThumb.fillStyle(0x5a9fd4, 0.7);
      this.scrollThumb.fillRoundedRect(this.trackX - 2, thumbY, 4, this.thumbHeight, 2);
    }
  }
}


// === js/scenes/GameScene.js ===
/**
 * GameScene - Main gameplay scene (original, crazy, and level modes)
 */
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.gameMode = data.mode || 'original';  // 'original', 'crazy', 'level', 'daily', 'endless'
    this.levelId = data.levelId || null;
    this.levelConfig = this.levelId ? levelManager.getLevel(this.levelId) : null;

    // Daily challenge data
    this.dailyChallenge = data.dailyChallenge || null;
    this.dailyMoveCount = 0;
    this.dailyChallengeCompleted = false;

    // Check if resuming from saved state
    this.resumeFromSave = data.resumeFromSave || false;
  }

  create() {
    // Get responsive layout based on current screen size
    const { width, height } = this.cameras.main;
    this.layout = GameConfig.getLayout(width, height);

    // Grid settings from dynamic layout
    this.GRID_COLS = GameConfig.GRID.COLS;
    this.GRID_ROWS = GameConfig.GRID.ROWS;
    this.TILE_SIZE = this.layout.tileSize;
    this.GRID_OFFSET_X = this.layout.offsetX;
    this.GRID_OFFSET_Y = this.layout.offsetY;

    // Listen for resize events
    this.scale.on('resize', this.onResize, this);

    // Initialize board logic with appropriate config
    const boardConfig = {
      cols: this.GRID_COLS,
      rows: this.GRID_ROWS,
      useScoreUnlocks: this.gameMode === 'original' || this.gameMode === 'crazy'
    };

    if (this.levelConfig) {
      boardConfig.allowedTiles = this.levelConfig.allowedTiles;
      boardConfig.startingCombo = this.levelConfig.startingCombo || 0;

      // Apply modifier tile weights if present
      if (this.levelConfig.modifier?.tileWeights) {
        boardConfig.tileWeights = this.levelConfig.modifier.tileWeights;
      }
    }

    // Apply daily challenge modifier tile weights
    if (this.dailyChallenge?.modifier?.id === 'more_1s') {
      boardConfig.tileWeights = { 1: 0.75, 2: 0.25 };
    } else if (this.dailyChallenge?.modifier?.id === 'more_2s') {
      boardConfig.tileWeights = { 1: 0.25, 2: 0.75 };
    }

    // Store modifier for other effects (frenzy boost, glass spawn rate, etc.)
    this.modifier = this.levelConfig?.modifier || this.dailyChallenge?.modifier || null;

    // Track if player has used ad continue (only allowed once per game)
    this.hasUsedAdContinue = false;

    this.boardLogic = new BoardLogic(boardConfig);

    // Initialize PowerUpManager based on mode
    this.powerUpManager = new PowerUpManager(this.getPowerUpConfig());

    // Initialize SpecialTileManager for crazy, endless, daily modes, or levels with special tiles
    const needsSpecialTiles = this.gameMode === 'crazy' ||
      this.gameMode === 'endless' ||
      this.gameMode === 'daily' ||
      this.levelConfig?.specialTiles ||
      this.modifier?.id === 'glass_chaos' ||
      this.modifier?.id === 'steel_maze';

    if (needsSpecialTiles) {
      this.specialTileManager = new SpecialTileManager(this.boardLogic);
    }

    // Set starting board if defined
    if (this.levelConfig?.startingBoard) {
      this.boardLogic.setBoard(this.levelConfig.startingBoard);
    }

    // Game state - initialize tiles before special tiles
    this.tiles = {};

    // Initialize starting special tiles from level config
    // Note: we create the tiles here, but they get synced visually later in create()
    if (this.specialTileManager && this.levelConfig?.startingSpecialTiles) {
      this.initializeStartingSpecialTilesData(this.levelConfig.startingSpecialTiles);
    }

    // Initialize starting special tiles for daily challenge modifiers
    if (this.specialTileManager && this.gameMode === 'daily' && this.dailyChallenge?.modifier) {
      const modifier = this.dailyChallenge.modifier;
      if (modifier.id === 'steel_maze') {
        // Create a maze pattern with steel tiles
        const steelTiles = [
          { type: 'steel', col: 0, row: 4, duration: 20 },
          { type: 'steel', col: 1, row: 3, duration: 20 },
          { type: 'steel', col: 2, row: 3, duration: 20 },
          { type: 'steel', col: 3, row: 4, duration: 20 }
        ];
        this.initializeStartingSpecialTilesData(steelTiles);
        this.dailyStartingSpecialTiles = steelTiles;
      } else if (modifier.id === 'narrow_board') {
        // Block the rightmost column with permanent steel
        const steelTiles = [
          { type: 'steel', col: 3, row: 0, duration: 999 },
          { type: 'steel', col: 3, row: 1, duration: 999 },
          { type: 'steel', col: 3, row: 2, duration: 999 },
          { type: 'steel', col: 3, row: 3, duration: 999 },
          { type: 'steel', col: 3, row: 4, duration: 999 },
          { type: 'steel', col: 3, row: 5, duration: 999 }
        ];
        this.initializeStartingSpecialTilesData(steelTiles);
        this.dailyStartingSpecialTiles = steelTiles;
      }
    }
    this.isAnimating = false;
    this.nextTileValue = null;
    this.nextTileType = 'normal';
    this.swipeEnabled = false;
    this.pointerStartX = 0;
    this.pointerStartY = 0;
    this.isPointerDown = false;

    // Selection mode state (for swapper/merger)
    this.selectionMode = null;  // null, 'swap', 'merger'
    this.selectedTile1 = null;

    // Frenzy state
    this.isFrenzyMode = false;
    this.frenzyTimerEvent = null;

    // Animation controller
    this.animationController = new GameAnimationController(this);

    // Cascade merge counter for combo tracking
    this.cascadeMergeCount = 0;

    // Modal state - blocks game input when help menu is open
    this.modalOpen = false;

    // Objective tracking for special tile clears
    this.glassCleared = 0;
    this.leadCleared = 0;

    // Setup UI
    this.setupBackground();
    this.setupGrid();

    // Setup power-up UI based on mode
    if (this.gameMode === 'original') {
      this.setupOriginalComboBar();
    } else {
      this.setupPowerUpBar();
    }

    this.setupNextTilePreview();
    this.setupInput();

    // Render starting tiles if any (apply gravity first so tiles fall to bottom)
    if (this.levelConfig?.startingBoard) {
      this.applyStartingBoardGravity();
      this.renderBoardState();
    }

    // Apply gravity to starting special tiles and render them
    if (this.specialTileManager && this.levelConfig?.startingSpecialTiles) {
      this.applyStartingSpecialTilesGravity();
      this.renderSpecialTiles();
    }

    // Render daily challenge starting special tiles
    if (this.specialTileManager && this.dailyStartingSpecialTiles) {
      this.applyStartingSpecialTilesGravity();
      this.renderSpecialTiles();
    }

    // Check if resuming from saved state
    if (this.resumeFromSave) {
      const savedState = gameStateManager.getSavedGame(this.gameMode);
      if (savedState) {
        this.loadSavedState(savedState);
        return; // Don't generate new next tile, use saved one
      }
    }

    this.generateNextTile();
  }

  /**
   * Load saved game state and render it
   */
  loadSavedState(savedState) {
    // Load state into managers
    gameStateManager.loadGameState(this, savedState);

    // Render the board state
    this.renderBoardState();

    // Render special tiles if present
    if (this.specialTileManager) {
      this.renderSpecialTiles();
    }

    // Update UI to reflect loaded state
    this.updatePowerUpUI();
    this.updateUI();

    // Update original combo bar if in original mode
    if (this.gameMode === 'original') {
      this.updateOriginalComboBar();
    }

    // Update next tile preview with saved value
    this.updateNextTilePreview();

    // Don't clear the saved game here - keep it as backup
    // It will be cleared on game over or when user starts a new game
  }

  /**
   * Get power-up configuration based on game mode
   */
  getPowerUpConfig() {
    switch (this.gameMode) {
      case 'original':
        return {
          enabledPowerUps: ['swipe'],
          frenzyEnabled: false,
          startingPoints: 0
        };
      case 'crazy':
        return {
          enabledPowerUps: ['swipe', 'swapper', 'merger', 'wildcard'],
          frenzyEnabled: true,
          startingPoints: 0
        };
      case 'endless':
        return {
          enabledPowerUps: ['swipe', 'swapper', 'merger', 'wildcard'],
          frenzyEnabled: true,
          startingPoints: 0
        };
      case 'level':
        const levelPowerUps = this.levelConfig?.powerUps || {};
        return {
          enabledPowerUps: Object.keys(levelPowerUps).filter(k => levelPowerUps[k]),
          frenzyEnabled: this.levelConfig?.frenzyEnabled || false,
          startingPoints: this.levelConfig?.startingPoints || 0,
          frenzyChargeMultiplier: this.levelConfig?.modifier?.frenzyChargeMultiplier || 1.0
        };
      case 'daily':
        // Daily challenges use configurable power-ups based on challenge type
        const dailyPowerUps = this.dailyChallenge?.type === 'no_power_ups'
          ? []
          : ['swipe', 'swapper', 'merger', 'wildcard'];
        // Apply frenzy boost modifier if present
        const dailyFrenzyMultiplier = this.dailyChallenge?.modifier?.id === 'frenzy_boost' ? 2.0 : 1.0;
        return {
          enabledPowerUps: dailyPowerUps,
          frenzyEnabled: this.dailyChallenge?.type !== 'no_power_ups',
          startingPoints: 0,
          frenzyChargeMultiplier: dailyFrenzyMultiplier
        };
      default:
        return { enabledPowerUps: ['swipe'], frenzyEnabled: false };
    }
  }

  /**
   * Handle window resize - recalculate layout
   */
  onResize(gameSize) {
    const { width, height } = gameSize;
    this.layout = GameConfig.getLayout(width, height);

    // Update grid settings
    this.TILE_SIZE = this.layout.tileSize;
    this.GRID_OFFSET_X = this.layout.offsetX;
    this.GRID_OFFSET_Y = this.layout.offsetY;

    // Update tile positions
    Object.values(this.tiles).forEach(tile => {
      if (tile && tile.updateLayoutPosition) {
        tile.updateLayoutPosition(this.TILE_SIZE, this.GRID_OFFSET_X, this.GRID_OFFSET_Y);
      }
    });

    // Rebuild UI - this is expensive but reliable for resize
    // For production, individual element repositioning would be more efficient
  }

  setupBackground() {
    const { width } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title based on mode
    let titleText = 'THREES-DROP';
    if (this.gameMode === 'crazy') {
      titleText = 'CRAZY MODE';
    } else if (this.gameMode === 'endless') {
      titleText = 'POINTS MAX';
    } else if (this.gameMode === 'level' && this.levelConfig) {
      titleText = `LEVEL ${this.levelConfig.id}`;
    }

    this.add.text(width / 2, 30, titleText, {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Score or objective
    if (this.gameMode === 'level' && this.levelConfig) {
      this.objectiveText = this.add.text(width / 2, 55, this.levelConfig.description, {
        fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#f5a623'
      }).setOrigin(0.5);

      this.progressText = this.add.text(width / 2, 75, '', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#7ed321'
      }).setOrigin(0.5);

      // Moves remaining - positioned on the right side
      this.movesText = this.add.text(width - 15, 55, `Moves: 0/${this.levelConfig.maxMoves}`, {
        fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
      }).setOrigin(1, 0);
    } else {
      this.scoreText = this.add.text(width / 2, 60, 'SCORE: 0', {
        fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#f5a623'
      }).setOrigin(0.5);
    }

    // Mute button
    this.muteBtn = this.add.text(width - 60, 15, soundManager.muted ? '🔇' : '🔊', {
      fontSize: '22px', padding: { x: 6, y: 6 }
    }).setOrigin(1, 0).setInteractive();
    this.muteBtn.on('pointerdown', () => {
      soundManager.init();
      const muted = soundManager.toggleMute();
      this.muteBtn.setText(muted ? '🔇' : '🔊');
    });

    // Help button
    const helpBtn = this.add.text(width - 15, 15, '?', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: '#ffffff', backgroundColor: '#4a90e2', padding: { x: 12, y: 6 }
    }).setOrigin(1, 0).setInteractive();
    helpBtn.on('pointerdown', () => {
      this.modalOpen = true;
      UIHelpers.showHowToPlay(this, () => {
        this.modalOpen = false;
      });
    });

    // Back button
    if (this.gameMode === 'level') {
      // For test levels, show option to close tab; otherwise go to level select
      if (window.isTestLevelSession) {
        this.add.text(15, 15, '< EDITOR', {
          fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#f5c26b'
        }).setInteractive().on('pointerdown', () => {
          window.isTestLevelSession = false;
          window.close();
        });
      } else {
        this.add.text(15, 15, '< BACK', {
          fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
        }).setInteractive().on('pointerdown', () => this.showExitConfirmation('TutorialSelectScene'));
      }
    } else if (this.gameMode === 'daily') {
      this.add.text(15, 15, '< MENU', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
      }).setInteractive().on('pointerdown', () => this.showExitConfirmation('MenuScene'));
    } else {
      this.add.text(15, 15, '< MENU', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
      }).setInteractive().on('pointerdown', () => this.showExitConfirmation('MenuScene'));
    }
  }

  /**
   * Show exit confirmation popup
   */
  showExitConfirmation(targetScene) {
    // Check if game has started (tiles placed or score > 0)
    const hasProgress = this.boardLogic.getScore() > 0 || this.boardLogic.getMovesUsed() > 0;

    if (!hasProgress) {
      // No progress, just exit
      this.scene.start(targetScene);
      return;
    }

    this.modalOpen = true;
    const { width, height } = this.cameras.main;

    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(900);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    // Check if this mode supports saving (not levels or daily)
    const canSave = this.gameMode !== 'level' && this.gameMode !== 'daily';

    // Popup box - larger to fit bigger buttons
    const boxWidth = 300;
    const boxHeight = canSave ? 260 : 200;
    const boxX = width / 2 - boxWidth / 2;
    const boxY = height / 2 - boxHeight / 2;

    const box = this.add.graphics();
    box.fillStyle(0x1a1a2e, 1);
    box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    box.lineStyle(2, 0x4a90e2, 1);
    box.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 12);
    box.setDepth(901);

    // Title
    const title = this.add.text(width / 2, boxY + 30, 'EXIT GAME?', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5).setDepth(902);

    // Message
    const message = this.add.text(width / 2, boxY + 60, canSave ? 'Your progress will be saved.' : 'Your progress will be lost.', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: canSave ? '#7ed321' : '#aaaaaa'
    }).setOrigin(0.5).setDepth(902);

    // Button dimensions for consistent sizing
    const btnWidth = 240;
    const btnHeight = 44;
    const btnSpacing = 54;

    // Continue playing button
    const continueBtnY = boxY + 105;
    const continueBtnBg = this.add.graphics();
    continueBtnBg.fillStyle(0x4a90e2, 1);
    continueBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, continueBtnY - btnHeight / 2, btnWidth, btnHeight, 8);
    continueBtnBg.setDepth(902);

    const continueBtn = this.add.text(width / 2, continueBtnY, 'CONTINUE PLAYING', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5).setDepth(903);

    const continueBtnZone = this.add.rectangle(width / 2, continueBtnY, btnWidth, btnHeight, 0x000000, 0)
      .setDepth(904).setInteractive();

    // Save & Exit button (or just Exit for non-saveable modes)
    const exitBtnY = continueBtnY + btnSpacing;
    const exitBtnBg = this.add.graphics();
    exitBtnBg.fillStyle(canSave ? 0x2d5a1e : 0x5a1e1e, 1);
    exitBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, exitBtnY - btnHeight / 2, btnWidth, btnHeight, 8);
    exitBtnBg.setDepth(902);

    const exitBtn = this.add.text(width / 2, exitBtnY, canSave ? 'SAVE & EXIT' : 'EXIT TO MENU', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: canSave ? '#7ed321' : '#e24a4a'
    }).setOrigin(0.5).setDepth(903);

    const exitBtnZone = this.add.rectangle(width / 2, exitBtnY, btnWidth, btnHeight, 0x000000, 0)
      .setDepth(904).setInteractive();

    // Quit without saving button (only for modes that can save)
    let quitBtn = null;
    let quitBtnBg = null;
    let quitBtnZone = null;
    if (canSave) {
      const quitBtnY = exitBtnY + btnSpacing;
      quitBtnBg = this.add.graphics();
      quitBtnBg.fillStyle(0x333333, 1);
      quitBtnBg.fillRoundedRect(width / 2 - btnWidth / 2, quitBtnY - btnHeight / 2, btnWidth, btnHeight, 8);
      quitBtnBg.setDepth(902);

      quitBtn = this.add.text(width / 2, quitBtnY, 'QUIT WITHOUT SAVING', {
        fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#888888'
      }).setOrigin(0.5).setDepth(903);

      quitBtnZone = this.add.rectangle(width / 2, quitBtnY, btnWidth, btnHeight, 0x000000, 0)
        .setDepth(904).setInteractive();
    }

    // Cleanup function
    const cleanup = () => {
      this.modalOpen = false;
      overlay.destroy();
      box.destroy();
      title.destroy();
      message.destroy();
      continueBtnBg.destroy();
      continueBtn.destroy();
      continueBtnZone.destroy();
      exitBtnBg.destroy();
      exitBtn.destroy();
      exitBtnZone.destroy();
      if (quitBtn) {
        quitBtnBg.destroy();
        quitBtn.destroy();
        quitBtnZone.destroy();
      }
    };

    continueBtnZone.on('pointerdown', () => {
      cleanup();
    });

    exitBtnZone.on('pointerdown', () => {
      cleanup();
      if (canSave) {
        // Save game state before exiting
        gameStateManager.saveGameState(this);
      }
      this.scene.start(targetScene);
    });

    if (quitBtnZone) {
      quitBtnZone.on('pointerdown', () => {
        cleanup();
        // Clear any saved game for this mode
        gameStateManager.clearSavedGame(this.gameMode);
        this.scene.start(targetScene);
      });
    }

    overlay.on('pointerdown', () => {
      cleanup();
    });
  }

  setupGrid() {
    const gridWidth = this.GRID_COLS * this.TILE_SIZE;
    const gridHeight = this.GRID_ROWS * this.TILE_SIZE;

    const gridBg = this.add.graphics();
    gridBg.fillStyle(GameConfig.UI.GRID_BG, 0.5);
    gridBg.fillRoundedRect(this.GRID_OFFSET_X - 10, this.GRID_OFFSET_Y - 10, gridWidth + 20, gridHeight + 20, 10);

    for (let col = 0; col < this.GRID_COLS; col++) {
      for (let row = 0; row < this.GRID_ROWS; row++) {
        const x = this.GRID_OFFSET_X + col * this.TILE_SIZE;
        const y = this.GRID_OFFSET_Y + row * this.TILE_SIZE;
        const cell = this.add.graphics();
        cell.fillStyle(GameConfig.UI.CELL_BG, 0.8);
        cell.fillRoundedRect(x + 5, y + 5, this.TILE_SIZE - 10, this.TILE_SIZE - 10, 8);
        cell.lineStyle(1, 0x533483, 0.5);
        cell.strokeRoundedRect(x + 5, y + 5, this.TILE_SIZE - 10, this.TILE_SIZE - 10, 8);
      }
    }

    this.columnZones = [];
    for (let col = 0; col < this.GRID_COLS; col++) {
      const x = this.GRID_OFFSET_X + col * this.TILE_SIZE;
      const zone = this.add.rectangle(x, this.GRID_OFFSET_Y, this.TILE_SIZE, gridHeight, 0x000000, 0);
      zone.setOrigin(0, 0).setInteractive().setData('column', col);
      this.columnZones.push(zone);
    }
  }

  renderBoardState() {
    for (let col = 0; col < this.GRID_COLS; col++) {
      for (let row = 0; row < this.GRID_ROWS; row++) {
        const cell = this.boardLogic.board[col][row];
        if (cell !== null) {
          // Check if it's a special tile (object) or normal tile (number)
          if (typeof cell === 'object' && cell.type) {
            // Special tile - already rendered by initializeStartingSpecialTiles
            continue;
          } else {
            // Normal tile (number value)
            const tile = new Tile(this, col, row, cell, this.boardLogic.nextTileId++);
            this.tiles[`${col},${row}`] = tile;
          }
        }
      }
    }
  }

  /**
   * Apply gravity to starting board tiles (instant, no animation)
   * This ensures tiles fall to the bottom before the game starts
   */
  applyStartingBoardGravity() {
    // For each column, move tiles down to their final positions
    for (let col = 0; col < this.GRID_COLS; col++) {
      // Process from bottom to top
      for (let row = this.GRID_ROWS - 2; row >= 0; row--) {
        const cell = this.boardLogic.board[col][row];
        if (cell === null) continue;

        // Only process numeric values (normal tiles), not special tile objects
        if (typeof cell === 'number') {
          // Find lowest empty row
          let targetRow = row;
          for (let r = row + 1; r < this.GRID_ROWS; r++) {
            if (this.boardLogic.board[col][r] === null) {
              targetRow = r;
            } else {
              break;
            }
          }

          if (targetRow !== row) {
            // Move the board state
            this.boardLogic.board[col][targetRow] = cell;
            this.boardLogic.board[col][row] = null;
          }
        }
      }
    }
  }

  /**
   * Initialize starting special tiles data (board logic only, no visuals yet)
   */
  initializeStartingSpecialTilesData(specialTiles) {
    specialTiles.forEach(spec => {
      const { type, col, row } = spec;

      switch (type) {
        case 'steel':
          this.specialTileManager.steelPlates.push({
            col, row,
            turnsRemaining: spec.duration || spec.turnsRemaining || 5,
            type: 'steel'
          });
          this.boardLogic.board[col][row] = { type: 'steel', blocked: true };
          break;
        case 'lead':
          this.specialTileManager.leadTiles.push({
            col, row,
            countdown: spec.countdown || 5,
            type: 'lead'
          });
          this.boardLogic.board[col][row] = { type: 'lead', countdown: spec.countdown || 5 };
          break;
        case 'glass':
          this.specialTileManager.glassTiles.push({
            col, row,
            durability: spec.durability || 2,
            value: spec.value || 3,
            type: 'glass'
          });
          this.boardLogic.board[col][row] = {
            type: 'glass',
            value: spec.value || 3,
            durability: spec.durability || 2
          };
          break;
      }
    });
  }

  /**
   * Render special tiles from board state (called after gravity is applied)
   */
  renderSpecialTiles() {
    // Render steel plates
    this.specialTileManager.steelPlates.forEach(plate => {
      const key = `${plate.col},${plate.row}`;
      if (!this.tiles[key]) {
        const tile = new Tile(this, plate.col, plate.row, null, this.boardLogic.nextTileId++, 'steel', {
          turnsRemaining: plate.turnsRemaining
        });
        this.tiles[key] = tile;
      }
    });

    // Render lead tiles
    this.specialTileManager.leadTiles.forEach(lead => {
      const key = `${lead.col},${lead.row}`;
      if (!this.tiles[key]) {
        const tile = new Tile(this, lead.col, lead.row, null, this.boardLogic.nextTileId++, 'lead', {
          countdown: lead.countdown
        });
        this.tiles[key] = tile;
      }
    });

    // Render glass tiles
    this.specialTileManager.glassTiles.forEach(glass => {
      const key = `${glass.col},${glass.row}`;
      if (!this.tiles[key]) {
        const tile = new Tile(this, glass.col, glass.row, glass.value, this.boardLogic.nextTileId++, 'glass', {
          durability: glass.durability
        });
        this.tiles[key] = tile;
      }
    });

    // Render auto-swapper tiles
    this.specialTileManager.autoSwapperTiles.forEach(swapper => {
      const key = `${swapper.col},${swapper.row}`;
      if (!this.tiles[key]) {
        const tile = new Tile(this, swapper.col, swapper.row, swapper.value, this.boardLogic.nextTileId++, 'auto_swapper', {
          swapsRemaining: swapper.swapsRemaining,
          nextSwapIn: swapper.nextSwapIn
        });
        this.tiles[key] = tile;
      }
    });

    // Render bomb tiles
    this.specialTileManager.bombTiles.forEach(bomb => {
      const key = `${bomb.col},${bomb.row}`;
      if (!this.tiles[key]) {
        const tile = new Tile(this, bomb.col, bomb.row, bomb.value, this.boardLogic.nextTileId++, 'bomb', {
          mergesRemaining: bomb.mergesRemaining
        });
        this.tiles[key] = tile;
      }
    });
  }

  /**
   * Apply gravity to starting special tiles (instant, no animation)
   */
  applyStartingSpecialTilesGravity() {
    // For each column, move special tiles down to their final positions
    for (let col = 0; col < this.GRID_COLS; col++) {
      // Process from bottom to top
      for (let row = this.GRID_ROWS - 2; row >= 0; row--) {
        const cell = this.boardLogic.board[col][row];
        if (cell === null) continue;

        // Check if this is a special tile that can fall (not steel - steel is fixed)
        if (typeof cell === 'object' && cell.type !== 'steel') {
          // Find lowest empty row
          let targetRow = row;
          for (let r = row + 1; r < this.GRID_ROWS; r++) {
            if (this.boardLogic.board[col][r] === null) {
              targetRow = r;
            } else {
              break;
            }
          }

          if (targetRow !== row) {
            // Move the board state
            this.boardLogic.board[col][targetRow] = cell;
            this.boardLogic.board[col][row] = null;

            // Update the special tile manager tracking
            if (cell.type === 'lead') {
              const lead = this.specialTileManager.leadTiles.find(t => t.col === col && t.row === row);
              if (lead) {
                lead.row = targetRow;
              }
            } else if (cell.type === 'glass') {
              const glass = this.specialTileManager.glassTiles.find(t => t.col === col && t.row === row);
              if (glass) {
                glass.row = targetRow;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Setup original mode combo bar (swipe only)
   */
  setupOriginalComboBar() {
    const barWidth = 200, barHeight = 30;
    const barX = this.cameras.main.width / 2 - barWidth / 2;
    const barY = this.GRID_OFFSET_Y + this.GRID_ROWS * this.TILE_SIZE + 40;

    this.add.text(barX, barY - 25, 'SWIPE POWER-UP', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#ffffff'
    });

    this.comboBarBg = this.add.graphics();
    this.comboBarBg.fillStyle(GameConfig.UI.GRID_BG, 1);
    this.comboBarBg.fillRoundedRect(barX, barY, barWidth, barHeight, 5);

    this.comboBarFill = this.add.graphics();
    this.comboText = this.add.text(barX + barWidth / 2, barY + barHeight / 2, '0/5', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    this.comboBarX = barX;
    this.comboBarY = barY;
    this.comboBarWidth = barWidth;
    this.comboBarHeight = barHeight;

    this.setupSwipeButtons(barY);
    this.updateOriginalComboBar();
  }

  setupSwipeButtons(barY) {
    const buttonY = barY + this.comboBarHeight / 2;
    const centerX = this.cameras.main.width / 2;
    const barHalf = this.comboBarWidth / 2;
    const bw = 50, bh = 30, gap = 10;

    this.leftButton = this.add.rectangle(centerX - barHalf - gap - bw / 2, buttonY, bw, bh, GameConfig.UI.PRIMARY, 0.3);
    this.leftButton.setStrokeStyle(2, GameConfig.UI.PRIMARY).setInteractive();
    this.leftButtonText = this.add.text(centerX - barHalf - gap - bw / 2, buttonY, '←', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5);

    this.rightButton = this.add.rectangle(centerX + barHalf + gap + bw / 2, buttonY, bw, bh, GameConfig.UI.PRIMARY, 0.3);
    this.rightButton.setStrokeStyle(2, GameConfig.UI.PRIMARY).setInteractive();
    this.rightButtonText = this.add.text(centerX + barHalf + gap + bw / 2, buttonY, '→', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5);

    this.leftButton.on('pointerdown', () => {
      if (this.swipeEnabled && !this.isAnimating) this.handleSwipe('left');
    });
    this.rightButton.on('pointerdown', () => {
      if (this.swipeEnabled && !this.isAnimating) this.handleSwipe('right');
    });

    this.swipeButtons = {
      leftButton: this.leftButton, rightButton: this.rightButton,
      leftText: this.leftButtonText, rightText: this.rightButtonText
    };
  }

  /**
   * Setup full power-up bar for crazy/level modes
   */
  setupPowerUpBar() {
    const { width } = this.cameras.main;
    const barY = this.GRID_OFFSET_Y + this.GRID_ROWS * this.TILE_SIZE + 10;

    // Resource points display
    this.resourceText = this.add.text(width / 2, barY, 'POWER: 0', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#f5a623'
    }).setOrigin(0.5);

    // Power-up buttons
    const buttonY = barY + 28;
    const buttons = [
      { type: 'swipe', icon: '↔', cost: GameConfig.POWERUPS.SWIPE_COST },
      { type: 'swapper', icon: 'S', cost: GameConfig.POWERUPS.SWAPPER_COST },
      { type: 'merger', icon: 'M', cost: GameConfig.POWERUPS.MERGER_COST },
      { type: 'wildcard', icon: 'W', cost: GameConfig.POWERUPS.WILDCARD_COST }
    ];

    const buttonWidth = 60;
    const buttonGap = 6;
    const totalWidth = buttons.length * buttonWidth + (buttons.length - 1) * buttonGap;
    let startX = width / 2 - totalWidth / 2 + buttonWidth / 2;

    this.powerUpButtons = {};

    buttons.forEach((btn, i) => {
      if (this.powerUpManager.isEnabled(btn.type)) {
        const x = startX + i * (buttonWidth + buttonGap);
        this.powerUpButtons[btn.type] = this.createPowerUpButton(x, buttonY, btn.type, btn.icon, btn.cost);
      }
    });

    // Swipe direction buttons (hidden until swipe is enabled)
    this.setupCrazySwipeButtons(barY + 60);

    // Frenzy bar (if enabled)
    if (this.powerUpManager.frenzyEnabled) {
      this.setupFrenzyBar(barY + 90);
    }

    this.updatePowerUpUI();
  }

  /**
   * Setup swipe direction buttons for crazy/level modes
   */
  setupCrazySwipeButtons(y) {
    const { width } = this.cameras.main;
    const bw = 55, bh = 28;

    // Left swipe button
    this.crazyLeftButton = this.add.rectangle(width / 2 - 60, y, bw, bh, GameConfig.UI.SUCCESS, 0.8);
    this.crazyLeftButton.setStrokeStyle(2, GameConfig.UI.SUCCESS).setInteractive();
    this.crazyLeftText = this.add.text(width / 2 - 60, y, '← SWIPE', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Right swipe button
    this.crazyRightButton = this.add.rectangle(width / 2 + 60, y, bw, bh, GameConfig.UI.SUCCESS, 0.8);
    this.crazyRightButton.setStrokeStyle(2, GameConfig.UI.SUCCESS).setInteractive();
    this.crazyRightText = this.add.text(width / 2 + 60, y, 'SWIPE →', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    this.crazyLeftButton.on('pointerdown', () => {
      if (this.swipeEnabled && !this.isAnimating && !this.isFrenzyMode) {
        this.handleSwipe('left');
      }
    });

    this.crazyRightButton.on('pointerdown', () => {
      if (this.swipeEnabled && !this.isAnimating && !this.isFrenzyMode) {
        this.handleSwipe('right');
      }
    });

    // Initially hidden
    this.setCrazySwipeButtonsVisible(false);
  }

  setCrazySwipeButtonsVisible(visible) {
    if (this.crazyLeftButton) {
      this.crazyLeftButton.setVisible(visible);
      this.crazyLeftText.setVisible(visible);
      this.crazyRightButton.setVisible(visible);
      this.crazyRightText.setVisible(visible);
    }
  }

  createPowerUpButton(x, y, type, icon, cost) {
    const bg = this.add.graphics();
    bg.fillStyle(GameConfig.UI.PRIMARY, 0.3);
    bg.lineStyle(2, GameConfig.UI.PRIMARY, 1);
    bg.fillRoundedRect(x - 28, y - 18, 56, 36, 6);
    bg.strokeRoundedRect(x - 28, y - 18, 56, 36, 6);

    const label = this.add.text(x, y - 4, icon, {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    const costText = this.add.text(x, y + 10, cost.toString(), {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', color: '#888888'
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(x, y, 56, 36, 0x000000, 0).setInteractive();
    hitArea.on('pointerdown', (pointer) => {
      // Mark that this click was handled by a button
      pointer.powerUpButtonClicked = true;
      this.activatePowerUp(type);
    });

    return { bg, label, costText, hitArea, x, y, type };
  }

  setupFrenzyBar(y) {
    const { width } = this.cameras.main;
    const barWidth = 180;

    this.add.text(width / 2 - barWidth / 2 - 5, y + 8, 'FRENZY', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ff6b6b'
    }).setOrigin(1, 0.5);

    this.frenzyBarBg = this.add.graphics();
    this.frenzyBarBg.fillStyle(GameConfig.UI.GRID_BG, 1);
    this.frenzyBarBg.fillRoundedRect(width / 2 - barWidth / 2, y, barWidth, 16, 4);

    this.frenzyBarFill = this.add.graphics();

    this.frenzyBarText = this.add.text(width / 2, y + 8, '0/50', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', color: '#ffffff'
    }).setOrigin(0.5);

    this.frenzyBarX = width / 2 - barWidth / 2;
    this.frenzyBarY = y;
    this.frenzyBarWidth = barWidth;

    // Frenzy activate button (hidden until ready)
    this.frenzyActivateBtn = this.add.text(width / 2, y + 28, 'ACTIVATE FRENZY!', {
      fontSize: '12px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: '#ffffff', backgroundColor: '#ff6b6b', padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setInteractive().setVisible(false);

    this.frenzyActivateBtn.on('pointerdown', () => this.activateFrenzy());
  }

  setupNextTilePreview() {
    const previewX = this.cameras.main.width / 2;
    const previewY = this.GRID_OFFSET_Y - 40;

    // NEXT label on the left side of the tile preview
    this.add.text(previewX - 50, previewY, 'NEXT', {
      fontSize: '12px', fontFamily: GameConfig.FONTS.UI, fontStyle: 'bold', color: '#00fff5'
    }).setOrigin(1, 0.5);

    this.nextTilePreview = this.add.container(previewX, previewY);
  }

  setupInput() {
    this.input.on('pointerdown', (pointer) => {
      if (this.isAnimating || this.modalOpen) return;
      this.isPointerDown = true;
      this.pointerStartX = pointer.x;
      this.pointerStartY = pointer.y;
    });

    this.input.on('pointerup', (pointer) => {
      if (this.isAnimating || !this.isPointerDown || this.modalOpen) return;
      this.isPointerDown = false;

      // Skip if a power-up button was clicked
      if (pointer.powerUpButtonClicked) {
        pointer.powerUpButtonClicked = false;
        return;
      }

      // Check for selection mode first
      if (this.selectionMode) {
        this.handleSelectionClick(pointer);
        return;
      }

      const dx = pointer.x - this.pointerStartX;
      const dy = pointer.y - this.pointerStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check for swipe gestures
      if (dist > GameConfig.GAMEPLAY.SWIPE_THRESHOLD) {
        if (this.isFrenzyMode) {
          // Frenzy: allow all 4 directions
          if (Math.abs(dx) > Math.abs(dy)) {
            this.handleFrenzySwipe(dx > 0 ? 'right' : 'left');
          } else {
            this.handleFrenzySwipe(dy > 0 ? 'down' : 'up');
          }
          return;
        } else if (this.swipeEnabled && Math.abs(dx) > Math.abs(dy)) {
          this.handleSwipe(dx > 0 ? 'right' : 'left');
          return;
        }
      }

      // Check for column tap
      for (const zone of this.columnZones) {
        if (zone.getBounds().contains(pointer.x, pointer.y)) {
          this.handleColumnTap(zone.getData('column'));
          return;
        }
      }
    });

    // Keyboard input for arrow keys
    this.input.keyboard.on('keydown-LEFT', () => {
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      if (this.isFrenzyMode) {
        this.handleFrenzySwipe('left');
      } else if (this.swipeEnabled) {
        this.handleSwipe('left');
      }
    });

    this.input.keyboard.on('keydown-RIGHT', () => {
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      if (this.isFrenzyMode) {
        this.handleFrenzySwipe('right');
      } else if (this.swipeEnabled) {
        this.handleSwipe('right');
      }
    });

    this.input.keyboard.on('keydown-UP', () => {
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      if (this.isFrenzyMode) {
        this.handleFrenzySwipe('up');
      }
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      if (this.isFrenzyMode) {
        this.handleFrenzySwipe('down');
      }
    });

    // Number keys 1-4 to drop tiles in columns
    this.input.keyboard.on('keydown-ONE', () => {
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      this.handleColumnTap(0);
    });
    this.input.keyboard.on('keydown-TWO', () => {
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      this.handleColumnTap(1);
    });
    this.input.keyboard.on('keydown-THREE', () => {
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      this.handleColumnTap(2);
    });
    this.input.keyboard.on('keydown-FOUR', () => {
      if (this.isAnimating || this.selectionMode || this.modalOpen) return;
      this.handleColumnTap(3);
    });

    // Q, W, E, R for power-ups, T for frenzy
    this.input.keyboard.on('keydown-Q', () => {
      if (this.isAnimating || this.modalOpen) return;
      this.activatePowerUp('swipe');
    });
    this.input.keyboard.on('keydown-W', () => {
      if (this.isAnimating || this.modalOpen) return;
      this.activatePowerUp('swapper');
    });
    this.input.keyboard.on('keydown-E', () => {
      if (this.isAnimating || this.modalOpen) return;
      this.activatePowerUp('merger');
    });
    this.input.keyboard.on('keydown-R', () => {
      if (this.isAnimating || this.modalOpen) return;
      this.activatePowerUp('wildcard');
    });
    this.input.keyboard.on('keydown-T', () => {
      if (this.isAnimating || this.modalOpen) return;
      if (this.powerUpManager && this.powerUpManager.isFrenzyReady()) {
        this.activateFrenzy();
      }
    });
  }

  /**
   * Handle clicks during selection mode (swap/merger)
   */
  handleSelectionClick(pointer) {
    // Find which tile was clicked
    const gridX = Math.floor((pointer.x - this.GRID_OFFSET_X) / this.TILE_SIZE);
    const gridY = Math.floor((pointer.y - this.GRID_OFFSET_Y) / this.TILE_SIZE);

    if (gridX < 0 || gridX >= this.GRID_COLS || gridY < 0 || gridY >= this.GRID_ROWS) {
      this.exitSelectionMode();
      return;
    }

    const key = `${gridX},${gridY}`;
    const tile = this.tiles[key];

    if (!tile) {
      if (this.selectedTile1) {
        this.exitSelectionMode();
      }
      return;
    }

    if (this.selectionMode === 'swap') {
      this.handleSwapSelection(gridX, gridY, tile);
    } else if (this.selectionMode === 'merger') {
      this.handleMergerSelection(gridX, gridY, tile);
    }
  }

  handleSwapSelection(col, row, tile) {
    // Check if tile is a lead or steel tile (cannot be swapped)
    const boardValue = this.boardLogic.board[col][row];
    if (typeof boardValue === 'object' && (boardValue?.type === 'lead' || boardValue?.type === 'steel' || boardValue?.blocked)) {
      this.showMessage('Cannot swap special tiles!');
      tile.shakeAnimation();
      return;
    }

    if (!this.selectedTile1) {
      this.selectedTile1 = { col, row, tile };
      tile.setSelected(true);
      this.showMessage('Select second tile to swap');
    } else {
      // Perform swap
      const result = this.boardLogic.swapTiles(
        this.selectedTile1.col, this.selectedTile1.row, col, row
      );

      if (result.success) {
        this.powerUpManager.spend('swapper');
        soundManager.play('swap');
        // Clear selection and null out selectedTile1 BEFORE animating
        // so exitSelectionMode doesn't call setSelected(false) again and kill the tween
        const tile1Data = this.selectedTile1;
        this.selectedTile1.tile.setSelected(false);
        this.selectedTile1 = null;  // Prevent exitSelectionMode from killing tween
        this.animateSwap(tile1Data, { col, row, tile });
      }
      this.exitSelectionMode();
    }
  }

  handleMergerSelection(col, row, tile) {
    // Check if tile is a lead or steel tile (cannot be merged)
    const boardValue = this.boardLogic.board[col][row];
    if (typeof boardValue === 'object' && (boardValue?.type === 'lead' || boardValue?.type === 'steel' || boardValue?.blocked)) {
      this.showMessage('Cannot merge special tiles!');
      tile.shakeAnimation();
      return;
    }

    if (!this.selectedTile1) {
      this.selectedTile1 = { col, row, tile };
      tile.setSelected(true);
      this.showMessage('Select second tile to merge');
    } else {
      // Try to merge
      const result = this.boardLogic.forceMerge(
        this.selectedTile1.col, this.selectedTile1.row, col, row
      );

      if (result.success) {
        this.powerUpManager.spend('merger');
        soundManager.play('merger');
        // Clear selection and null out selectedTile1 BEFORE animating
        // so exitSelectionMode doesn't call setSelected(false) again and kill the tween
        const tile1Data = this.selectedTile1;
        this.selectedTile1.tile.setSelected(false);
        this.selectedTile1 = null;  // Prevent exitSelectionMode from killing tween
        this.animateForceMerge(result, tile1Data, { col, row, tile });
      } else if (result.reason === 'incompatible') {
        // Shake both tiles
        this.selectedTile1.tile.shakeAnimation();
        tile.shakeAnimation();
        this.showMessage('Not compatible!');
      }
      this.exitSelectionMode();
    }
  }

  animateSwap(tile1Data, tile2Data) {
    const { col: col1, row: row1, tile: tile1 } = tile1Data;
    const { col: col2, row: row2, tile: tile2 } = tile2Data;

    // Safety check - both tiles must exist
    if (!tile1 || !tile2) {
      console.error('animateSwap called with missing tile', { tile1, tile2 });
      this.isAnimating = false;
      return;
    }

    // Update visual tiles
    tile1.updatePosition(col2, row2, true, GameConfig.ANIM.SHIFT);
    tile2.updatePosition(col1, row1, true, GameConfig.ANIM.SHIFT);

    // Update tiles map
    delete this.tiles[`${col1},${row1}`];
    delete this.tiles[`${col2},${row2}`];
    this.tiles[`${col2},${row2}`] = tile1;
    this.tiles[`${col1},${row1}`] = tile2;

    // Update special tile position tracking for both tiles
    if (this.specialTileManager) {
      this.specialTileManager.updateTilePosition(col1, row1, col2, row2);
      this.specialTileManager.updateTilePosition(col2, row2, col1, row1);
    }

    this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
      this.applyGravityAfterDrop();
      this.updatePowerUpUI();
    });
  }

  animateForceMerge(result, tile1Data, tile2Data) {
    const { mergedValue, mergedCol, mergedRow } = result;
    const { col: col1, row: row1, tile: tile1 } = tile1Data;
    const { col: col2, row: row2, tile: tile2 } = tile2Data;

    this.isAnimating = true;

    // Check if either tile is a bomb BEFORE removing them
    let bombMergeResult = null;
    if (this.specialTileManager) {
      const specialTile1 = this.specialTileManager.getSpecialTileAt(col1, row1);
      const specialTile2 = this.specialTileManager.getSpecialTileAt(col2, row2);

      // Two bombs merging = immediate explosion
      if (specialTile1 && specialTile1.type === 'bomb' && specialTile2 && specialTile2.type === 'bomb') {
        bombMergeResult = this.specialTileManager.onBombBombMerge(col1, row1, col2, row2);
      } else if (specialTile1 && specialTile1.type === 'bomb') {
        // First tile is bomb - move it to merge position and check explosion
        this.specialTileManager.updateTilePosition(col1, row1, mergedCol, mergedRow);
        bombMergeResult = this.specialTileManager.onBombMerge(mergedCol, mergedRow, mergedValue);
      } else if (specialTile2 && specialTile2.type === 'bomb') {
        // Second tile is bomb - it's already at merge position
        bombMergeResult = this.specialTileManager.onBombMerge(col2, row2, mergedValue);
      }
    }

    // Remove both tiles from the map immediately
    delete this.tiles[`${col1},${row1}`];
    delete this.tiles[`${col2},${row2}`];

    // Remove non-bomb special tiles at both positions
    if (this.specialTileManager) {
      const specialTile1 = this.specialTileManager.getSpecialTileAt(col1, row1);
      if (!specialTile1 || specialTile1.type !== 'bomb') {
        this.specialTileManager.removeTileAt(col1, row1);
      }
      const specialTile2 = this.specialTileManager.getSpecialTileAt(col2, row2);
      if (!specialTile2 || specialTile2.type !== 'bomb') {
        this.specialTileManager.removeTileAt(col2, row2);
      }
      // If bomb exploded, remove it too
      if (bombMergeResult && bombMergeResult.exploded) {
        this.specialTileManager.removeTileAt(mergedCol, mergedRow);
      }
    }

    // Animate first tile moving toward second tile's position, then fade out
    tile1.updatePosition(col2, row2, true, GameConfig.ANIM.SHIFT);

    this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
      // Notify special tile manager of merge (for glass damage to adjacent tiles)
      if (this.specialTileManager) {
        const events = this.specialTileManager.onMerge(mergedCol, mergedRow);
        this.handleSpecialTileEvents(events);
      }

      // Handle bomb explosion
      if (bombMergeResult && bombMergeResult.exploded) {
        tile1.mergeAnimation();
        tile2.mergeAnimation(() => {
          this.handleBombExplosion(mergedCol, mergedRow, bombMergeResult);
        });
        return;
      }

      // Now destroy both tiles and create merged tile
      tile1.mergeAnimation();
      tile2.mergeAnimation(() => {
        let merged;
        if (bombMergeResult && !bombMergeResult.exploded) {
          // Bomb didn't explode yet - create new bomb tile with updated merge count
          merged = new Tile(this, mergedCol, mergedRow, mergedValue, this.boardLogic.nextTileId++, 'bomb', { mergesRemaining: bombMergeResult.mergesRemaining, value: mergedValue });
        } else {
          merged = new Tile(this, mergedCol, mergedRow, mergedValue, this.boardLogic.nextTileId++);
        }
        merged.updatePosition(mergedCol, mergedRow, false);
        merged.setScale(0.5).setAlpha(0.5);

        this.boardLogic.addScore(mergedValue);
        this.powerUpManager.addMergePoint();
        this.updateUI();

        this.tweens.add({
          targets: merged, scaleX: 1, scaleY: 1, alpha: 1,
          duration: GameConfig.ANIM.DROP, ease: 'Back.easeOut',
          onComplete: () => {
            this.tiles[`${mergedCol},${mergedRow}`] = merged;
            this.applyGravityAfterDrop();
            this.updatePowerUpUI();
          }
        });
      });
    });
  }

  exitSelectionMode() {
    if (this.selectedTile1?.tile) {
      this.selectedTile1.tile.setSelected(false);
    }
    this.selectionMode = null;
    this.selectedTile1 = null;
    this.hideMessage();
    this.hideCancelButton();
  }

  showCancelButton() {
    if (this.cancelButton) return;

    const { width } = this.cameras.main;
    this.cancelButton = this.add.text(width / 2, this.GRID_OFFSET_Y - 45, 'CANCEL', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: '#ffffff', backgroundColor: '#e24a4a', padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setDepth(200).setInteractive();

    this.cancelButton.on('pointerdown', (pointer) => {
      pointer.powerUpButtonClicked = true;
      this.exitSelectionMode();
    });
  }

  hideCancelButton() {
    if (this.cancelButton) {
      this.cancelButton.destroy();
      this.cancelButton = null;
    }
  }

  /**
   * Activate a power-up
   */
  activatePowerUp(type) {
    if (this.isAnimating || this.selectionMode) return;
    if (!this.powerUpManager.canAfford(type)) {
      this.showMessage('Not enough power!');
      return;
    }

    switch (type) {
      case 'swipe':
        if (this.powerUpManager.spend('swipe')) {
          this.swipeEnabled = true;
          this.showMessage('Swipe enabled! Use buttons or gesture');
          this.setCrazySwipeButtonsVisible(true);
          this.updatePowerUpUI();
        }
        break;

      case 'swapper':
        this.selectionMode = 'swap';
        this.showMessage('Tap first tile to swap');
        this.showCancelButton();
        break;

      case 'merger':
        this.selectionMode = 'merger';
        this.showMessage('Tap first tile to merge');
        this.showCancelButton();
        break;

      case 'wildcard':
        if (this.powerUpManager.spend('wildcard')) {
          soundManager.play('wildcard');
          this.nextTileValue = 'wildcard';
          this.nextTileType = 'wildcard';
          this.updateNextTilePreview();
          this.showMessage('Next tile is WILDCARD!');
          this.updatePowerUpUI();
        }
        break;
    }
  }

  /**
   * Activate frenzy mode
   */
  activateFrenzy() {
    if (this.powerUpManager.activateFrenzy()) {
      this.isFrenzyMode = true;
      soundManager.play('frenzy');
      this.showFrenzyOverlay();
      this.updatePowerUpUI();
      achievementManager.recordFrenzy();
    }
  }

  showFrenzyOverlay() {
    const { width, height } = this.cameras.main;

    // Red tint overlay
    this.frenzyOverlay = this.add.graphics();
    this.frenzyOverlay.fillStyle(0xff0000, 0.1);
    this.frenzyOverlay.fillRect(0, 0, width, height);
    this.frenzyOverlay.setDepth(50);

    // Pulsing effect
    this.tweens.add({
      targets: this.frenzyOverlay,
      alpha: 0.2,
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    // Pulsing border
    this.frenzyBorder = this.animationController.createFrenzyBorder(width, height);

    // Timer display
    this.frenzyTimerText = this.add.text(width / 2, 95, '10.0s', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ff6b6b'
    }).setOrigin(0.5).setDepth(100);

    // Direction hints
    this.frenzyHintText = this.add.text(width / 2, 120, 'SWIPE ANY DIRECTION!', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#ffffff'
    }).setOrigin(0.5).setDepth(100);

    // Start timer
    this.frenzyTimerEvent = this.time.addEvent({
      delay: 100,
      callback: () => {
        const remaining = this.powerUpManager.getFrenzyTimeRemaining();
        if (this.frenzyTimerText) {
          this.frenzyTimerText.setText((remaining / 1000).toFixed(1) + 's');
        }

        if (this.powerUpManager.updateFrenzy()) {
          this.endFrenzy();
        }
      },
      loop: true
    });
  }

  endFrenzy() {
    this.isFrenzyMode = false;

    if (this.frenzyTimerEvent) {
      this.frenzyTimerEvent.remove();
      this.frenzyTimerEvent = null;
    }

    if (this.frenzyOverlay) {
      this.frenzyOverlay.destroy();
      this.frenzyOverlay = null;
    }

    if (this.frenzyBorder) {
      this.frenzyBorder.destroy();
      this.frenzyBorder = null;
    }

    if (this.frenzyTimerText) {
      this.frenzyTimerText.destroy();
      this.frenzyTimerText = null;
    }

    if (this.frenzyHintText) {
      this.frenzyHintText.destroy();
      this.frenzyHintText = null;
    }

    // Apply gravity after frenzy ends
    this.applyGravityAfterDrop();
    this.updatePowerUpUI();
  }

  handleFrenzySwipe(direction) {
    if (this.isAnimating || !this.isFrenzyMode) return;
    this.isAnimating = true;

    const ops = this.boardLogic.frenzyShift(direction);
    if (ops.length === 0) {
      this.isAnimating = false;
      return;
    }

    this.animateFrenzyOperations(ops, () => {
      // No gravity during frenzy
      ops.forEach(op => {
        if (op.type === 'frenzy-merge') {
          this.powerUpManager.addMergePoint();
        }
      });
      this.syncTilesWithBoard(); // Clean up any ghost tiles
      this.isAnimating = false;
      this.updatePowerUpUI();
    });
  }

  animateFrenzyOperations(operations, onComplete) {
    let completed = 0;
    const total = operations.length;
    if (total === 0) { onComplete(); return; }

    operations.forEach(op => {
      const fromKey = `${op.fromCol},${op.fromRow}`;
      const toKey = `${op.toCol},${op.toRow}`;
      const tile = this.tiles[fromKey];

      if (!tile) { completed++; if (completed === total) onComplete(); return; }
      delete this.tiles[fromKey];

      if (op.type === 'frenzy-move') {
        tile.updatePosition(op.toCol, op.toRow, true, GameConfig.ANIM.SHIFT);
        this.tiles[toKey] = tile;

        // Update special tile position tracking
        if (this.specialTileManager) {
          this.specialTileManager.updateTilePosition(op.fromCol, op.fromRow, op.toCol, op.toRow);
        }

        this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
          completed++;
          if (completed === total) onComplete();
        });
      } else if (op.type === 'frenzy-merge') {
        const mergeWith = this.tiles[toKey];

        // Check if the destination tile still exists and can merge
        // (it may have been broken by a previous merge in this frenzy pass)
        const destBoardValue = this.boardLogic.board[op.toCol][op.toRow];
        const destStillMergeable = destBoardValue !== null && mergeWith;

        if (!destStillMergeable) {
          // Glass was broken or tile no longer exists - convert to simple move
          const movingValue = this.boardLogic.board[op.fromCol][op.fromRow];
          this.boardLogic.board[op.fromCol][op.fromRow] = null;
          this.boardLogic.board[op.toCol][op.toRow] = movingValue;

          tile.updatePosition(op.toCol, op.toRow, true, GameConfig.ANIM.SHIFT);
          this.tiles[toKey] = tile;

          if (this.specialTileManager) {
            this.specialTileManager.updateTilePosition(op.fromCol, op.fromRow, op.toCol, op.toRow);
          }

          this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
            completed++;
            if (completed === total) onComplete();
          });
          return;
        }

        tile.updatePosition(op.toCol, op.toRow, true, GameConfig.ANIM.SHIFT);

        // Check if either tile is a bomb BEFORE removing
        let bombMergeResult = null;
        if (this.specialTileManager) {
          const specialTileFrom = this.specialTileManager.getSpecialTileAt(op.fromCol, op.fromRow);
          const specialTileTo = this.specialTileManager.getSpecialTileAt(op.toCol, op.toRow);
          // Two bombs merging = immediate explosion
          if (specialTileFrom && specialTileFrom.type === 'bomb' && specialTileTo && specialTileTo.type === 'bomb') {
            bombMergeResult = this.specialTileManager.onBombBombMerge(op.fromCol, op.fromRow, op.toCol, op.toRow);
          } else if (specialTileTo && specialTileTo.type === 'bomb') {
            bombMergeResult = this.specialTileManager.onBombMerge(op.toCol, op.toRow, op.value);
          } else if (specialTileFrom && specialTileFrom.type === 'bomb') {
            this.specialTileManager.updateTilePosition(op.fromCol, op.fromRow, op.toCol, op.toRow);
            bombMergeResult = this.specialTileManager.onBombMerge(op.toCol, op.toRow, op.value);
          }
        }

        // Remove non-bomb special tiles at both positions
        if (this.specialTileManager) {
          const specialTileFrom = this.specialTileManager.getSpecialTileAt(op.fromCol, op.fromRow);
          if (!specialTileFrom || specialTileFrom.type !== 'bomb') {
            this.specialTileManager.removeTileAt(op.fromCol, op.fromRow);
          }
          if (!bombMergeResult || bombMergeResult.exploded) {
            this.specialTileManager.removeTileAt(op.toCol, op.toRow);
          }
        }

        this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
          if (mergeWith) { delete this.tiles[toKey]; mergeWith.mergeAnimation(); }

          // Notify special tile manager of merge (for glass damage to adjacent tiles)
          if (this.specialTileManager) {
            const events = this.specialTileManager.onMerge(op.toCol, op.toRow);
            this.handleSpecialTileEvents(events);
          }

          // Handle bomb explosion
          if (bombMergeResult && bombMergeResult.exploded) {
            tile.mergeAnimation(() => {
              this.handleBombExplosion(op.toCol, op.toRow, bombMergeResult);
              completed++;
              if (completed === total) onComplete();
            });
            return;
          }

          tile.mergeAnimation(() => {
            let merged;
            if (bombMergeResult && !bombMergeResult.exploded) {
              merged = new Tile(this, op.toCol, op.toRow, op.value, this.boardLogic.nextTileId++, 'bomb', { mergesRemaining: bombMergeResult.mergesRemaining, value: op.value });
            } else {
              merged = new Tile(this, op.toCol, op.toRow, op.value, this.boardLogic.nextTileId++);
            }
            merged.updatePosition(op.toCol, op.toRow, false);
            merged.setScale(0.5).setAlpha(0.5);
            this.boardLogic.addScore(op.value);
            tileCollectionManager.recordTile(op.value);
            achievementManager.recordTile(op.value);
            this.updateUI();

            this.tweens.add({
              targets: merged, scaleX: 1, scaleY: 1, alpha: 1,
              duration: GameConfig.ANIM.MERGE, ease: 'Back.easeOut',
              onComplete: () => {
                this.tiles[toKey] = merged;
                completed++;
                if (completed === total) onComplete();
              }
            });
          });
        });
      }
    });
  }

  generateNextTile() {
    // Don't override if wildcard is set
    if (this.nextTileType === 'wildcard') return;

    this.nextTileValue = this.boardLogic.getRandomTileValue();
    this.nextTileType = 'normal';
    this.updateNextTilePreview();
  }

  updateNextTilePreview() {
    this.nextTilePreview.removeAll(true);
    const size = 48;
    const halfSize = size / 2;
    const radius = 6;

    let color, displayText, textColor;

    if (this.nextTileType === 'wildcard') {
      color = GameConfig.COLORS.WILDCARD;
      displayText = '★';
      textColor = '#ffffff';
    } else {
      color = getTileColor(this.nextTileValue);
      displayText = this.nextTileValue.toString();
      textColor = getTileTextColor(this.nextTileValue);
    }

    const bg = this.add.graphics();

    // Clean flat fill
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-halfSize, -halfSize, size, size, radius);

    const text = this.add.text(0, 0, displayText, {
      fontSize: '20px', fontFamily: GameConfig.FONTS.NUMBERS, fontStyle: '800',
      color: textColor
    }).setOrigin(0.5);

    this.nextTilePreview.add([bg, text]);
  }

  handleColumnTap(col) {
    if (this.isAnimating || this.selectionMode || this.isFrenzyMode) return;

    // Check move limit for levels
    if (this.levelConfig && this.boardLogic.getMovesUsed() >= this.levelConfig.maxMoves) {
      return;
    }

    const result = this.boardLogic.dropTile(col, this.nextTileValue);
    if (!result.success) return;

    this.isAnimating = true;

    const tileType = this.nextTileType;

    // Reset cascade merge counter for combo tracking
    this.cascadeMergeCount = 0;

    if (result.merged) {
      // For merges: create tile but DON'T add to tiles dict yet
      // handleMerge will handle both the existing tile and create the merged result
      const tile = new Tile(this, col, result.row, this.nextTileValue, result.tileId, tileType);
      tile.dropFromTop(result.finalRow, GameConfig.ANIM.DROP);
      soundManager.play('drop');
      this.time.delayedCall(GameConfig.ANIM.DROP, () => {
        this.handleMerge(col, result.finalRow, result.finalValue, tile);
      });
    } else {
      // For non-merges: tile lands at finalRow, track it there
      const tile = new Tile(this, col, result.finalRow, this.nextTileValue, result.tileId, tileType);
      this.tiles[`${col},${result.finalRow}`] = tile;
      tile.dropFromTop(result.finalRow, GameConfig.ANIM.DROP);
      soundManager.play('drop');
      this.time.delayedCall(GameConfig.ANIM.DROP + 20, () => {
        this.onDropComplete();
      });
    }

    // Reset wildcard state
    this.nextTileType = 'normal';
    this.generateNextTile();
    this.updateUI();
  }

  handleMerge(col, row, newValue, droppingTile) {
    const key = `${col},${row}`;
    const existing = this.tiles[key];

    // Check if either tile is a bomb BEFORE removing
    let bombMergeResult = null;
    if (this.specialTileManager) {
      const specialTile = this.specialTileManager.getSpecialTileAt(col, row);
      if (specialTile && specialTile.type === 'bomb') {
        // Bomb is involved in the merge
        bombMergeResult = this.specialTileManager.onBombMerge(col, row, newValue);
      }
    }

    if (existing) {
      delete this.tiles[key];
      existing.mergeAnimation();
    }

    // Only remove non-bomb special tiles - bombs are handled specially by onBombMerge/detonateBomb
    if (this.specialTileManager && !bombMergeResult) {
      this.specialTileManager.removeTileAt(col, row);
    }
    // Note: When bomb explodes, detonateBomb already removes it from bombTiles array

    // Notify special tile manager of merge (for glass damage to adjacent tiles)
    if (this.specialTileManager) {
      const events = this.specialTileManager.onMerge(col, row);
      this.handleSpecialTileEvents(events);
    }

    // Handle bomb explosion
    if (bombMergeResult && bombMergeResult.exploded) {
      droppingTile.mergeAnimation(() => {
        // Trigger explosion animation
        this.handleBombExplosion(col, row, bombMergeResult);
      });
      return;
    }

    droppingTile.mergeAnimation(() => {
      // Create bomb tile if bomb didn't explode, otherwise normal tile
      let merged;
      if (bombMergeResult && !bombMergeResult.exploded) {
        merged = new Tile(this, col, row, newValue, this.boardLogic.nextTileId++, 'bomb', { mergesRemaining: bombMergeResult.mergesRemaining, value: newValue });
      } else {
        merged = new Tile(this, col, row, newValue, this.boardLogic.nextTileId++);
      }
      merged.updatePosition(col, row, false);
      merged.setScale(0.3).setAlpha(0.5);

      soundManager.play('merge', newValue);

      // Merge particles
      const layout = GameConfig.getLayout(this.cameras.main.width, this.cameras.main.height);
      const px = layout.offsetX + col * layout.tileSize + layout.tileSize / 2;
      const py = layout.offsetY + row * layout.tileSize + layout.tileSize / 2;
      this.animationController.animateMergeParticles(px, py, getTileColor(newValue), GameConfig.JUICE.MERGE_PARTICLE_COUNT);

      // Screen shake for high-value merges
      if (newValue >= GameConfig.JUICE.SHAKE_MIN_VALUE) {
        const intensity = Math.min(newValue / 96, 1.5);
        this.cameras.main.shake(150, 0.005 * intensity);
      }

      this.boardLogic.addScore(newValue);
      this.powerUpManager.addMergePoint();
      tileCollectionManager.recordTile(newValue);
      achievementManager.recordTile(newValue);
      this.updateUI();

      this.tweens.add({
        targets: merged, scaleX: 1, scaleY: 1, alpha: 1,
        duration: GameConfig.ANIM.DROP, ease: 'Back.easeOut',
        onComplete: () => {
          this.tiles[key] = merged;
          // Secondary pulse for high-value tiles
          if (newValue >= GameConfig.JUICE.SHAKE_MIN_VALUE) {
            this.tweens.add({
              targets: merged, scaleX: 1.08, scaleY: 1.08,
              duration: 120, yoyo: true, ease: 'Sine.easeInOut'
            });
          }
          this.updatePowerUpUI();
          // Call onDropComplete to update special tiles (steel countdown, etc.)
          this.onDropComplete();
        }
      });
    });
  }

  onDropComplete() {
    // Update special tiles
    let hasSwapEvents = false;
    if (this.specialTileManager) {
      const events = this.specialTileManager.updateSpecialTiles();
      hasSwapEvents = this.handleSpecialTileEvents(events);

      // Spawn special tiles based on mode and level config
      // Only ONE special tile can spawn per drop
      if (this.gameMode === 'crazy' || this.gameMode === 'endless') {
        // Crazy and Points Max mode: random spawns (only one per drop)
        // Build weighted spawn table based on mode
        const spawnOptions = [
          { type: 'steel', chance: GameConfig.SPECIAL_TILES.STEEL_SPAWN_CHANCE },
          { type: 'glass', chance: 0.03 },
          { type: 'lead', chance: 0.02 },
          { type: 'auto_swapper', chance: GameConfig.SPECIAL_TILES.AUTO_SWAPPER_SPAWN_CHANCE }
        ];
        // Add bomb only in endless mode
        if (this.gameMode === 'endless') {
          spawnOptions.push({ type: 'bomb', chance: GameConfig.SPECIAL_TILES.BOMB_SPAWN_CHANCE });
        }

        // Check each spawn type in order, stop after first successful spawn
        const roll = Math.random();
        let cumulativeChance = 0;
        for (const option of spawnOptions) {
          cumulativeChance += option.chance;
          if (roll < cumulativeChance) {
            // This type should spawn
            this.trySpawnSpecialTile(option.type);
            break;
          }
        }
      } else if (this.gameMode === 'level' && this.levelConfig) {
        // Level mode: use level-specific spawn rates for objectives (only one per drop)
        // Check both direct level config and modifier config for spawn rates
        const glassSpawnRate = this.levelConfig.modifier?.glassSpawnRate || this.levelConfig.glassSpawnRate || 0;
        const leadSpawnRate = this.levelConfig.modifier?.leadSpawnRate || this.levelConfig.leadSpawnRate || 0;

        const roll = Math.random();
        if (roll < glassSpawnRate) {
          const emptyCell = this.specialTileManager.findRandomEmptyCell();
          if (emptyCell) {
            const allowedValues = this.levelConfig.allowedTiles.filter(v => v >= 3);
            const glassValue = allowedValues.length > 0
              ? allowedValues[Math.floor(Math.random() * allowedValues.length)]
              : 3;
            const glassTile = this.specialTileManager.spawnGlassTile(emptyCell.col, emptyCell.row, glassValue);
            this.createSpecialTile(emptyCell.col, emptyCell.row, 'glass', { durability: glassTile.durability, value: glassValue });
          }
        } else if (roll < glassSpawnRate + leadSpawnRate) {
          const emptyCell = this.specialTileManager.findRandomEmptyCell();
          if (emptyCell) {
            const leadTile = this.specialTileManager.spawnLeadTile(emptyCell.col, emptyCell.row);
            this.createSpecialTile(emptyCell.col, emptyCell.row, 'lead', { countdown: leadTile.countdown });
          }
        }
      } else if (this.gameMode === 'daily' && this.specialTileManager) {
        // Daily challenge mode: apply modifier-based special tile spawning
        const modifier = this.dailyChallenge?.modifier;

        if (modifier?.id === 'glass_chaos') {
          // Use move count for deterministic spawning (every ~3 moves)
          const moves = this.boardLogic.getGameState().movesUsed;
          if (moves % 3 === 1) {
            const emptyCell = this.specialTileManager.findRandomEmptyCell();
            if (emptyCell) {
              const glassValues = [3, 6, 12];
              const glassValue = glassValues[moves % glassValues.length];
              const glassTile = this.specialTileManager.spawnGlassTile(emptyCell.col, emptyCell.row, glassValue);
              this.createSpecialTile(emptyCell.col, emptyCell.row, 'glass', { durability: glassTile.durability, value: glassValue });
            }
          }
        }
      }
    }

    // If there were swap events, delay gravity to let swap animation complete first
    if (hasSwapEvents) {
      this.time.delayedCall(GameConfig.ANIM.SHIFT + 50, () => {
        this.applyGravityAfterDrop();
      });
    } else {
      this.applyGravityAfterDrop();
    }
  }

  /**
   * Handle special tile events and return if any swaps occurred
   * @returns {boolean} True if auto-swap events occurred (need to delay gravity)
   */
  handleSpecialTileEvents(events) {
    let hasSwapEvents = false;

    events.forEach(event => {
      const key = `${event.col},${event.row}`;
      const tile = this.tiles[key];

      switch (event.type) {
        case 'steel_removed':
          if (tile) {
            delete this.tiles[key];
            tile.fadeOutAnimation();
          }
          break;
        case 'lead_removed':
          if (tile) {
            delete this.tiles[key];
            tile.fadeOutAnimation();
          }
          this.leadCleared++;
          achievementManager.recordLeadCleared();
          break;
        case 'lead_decremented':
          if (tile) {
            tile.updateSpecialData({ countdown: event.countdown });
          }
          break;
        case 'glass_broken':
          if (tile) {
            delete this.tiles[key];
            tile.breakAnimation();
          }
          this.glassCleared++;
          achievementManager.recordGlassBroken();
          break;
        case 'glass_cracked':
          if (tile) {
            tile.updateSpecialData({ durability: event.durability });
          }
          break;
        case 'steel_tick':
          if (tile) {
            tile.updateSpecialData({ turnsRemaining: event.turnsRemaining });
          }
          break;
        case 'auto_swap':
          // Handle auto-swapper swapping with another tile
          this.handleAutoSwap(event);
          hasSwapEvents = true;
          break;
        case 'swapper_expired':
          // Auto-swapper became a normal tile
          if (tile) {
            delete this.tiles[key];
            // Create a new normal tile with the value
            const normalTile = new Tile(this, event.col, event.row, event.value, this.boardLogic.nextTileId++);
            this.tiles[key] = normalTile;
          }
          break;
        case 'swapper_tick':
          if (tile) {
            tile.updateSpecialData({ swapsRemaining: event.swapsRemaining });
          }
          break;
      }
    });

    return hasSwapEvents;
  }

  /**
   * Handle auto-swapper swap animation
   */
  handleAutoSwap(event) {
    const fromKey = `${event.fromCol},${event.fromRow}`;
    const toKey = `${event.toCol},${event.toRow}`;
    const fromTile = this.tiles[fromKey];
    const toTile = this.tiles[toKey];

    // Remove both tiles from the dictionary first to avoid overwrites
    delete this.tiles[fromKey];
    delete this.tiles[toKey];

    // Swap the visual tiles
    if (fromTile) {
      fromTile.updatePosition(event.toCol, event.toRow, true);
      this.tiles[toKey] = fromTile;
      // Update the swaps remaining display
      if (fromTile.tileType === 'auto_swapper') {
        fromTile.updateSpecialData({ swapsRemaining: event.swapsRemaining });
      }
    }
    if (toTile) {
      toTile.updatePosition(event.fromCol, event.fromRow, true);
      this.tiles[fromKey] = toTile;
    } else {
      // If there was no tile at the target position, check if the board has a value there now
      // (can happen when swapper swaps with an empty cell that has a normal tile value)
      const boardValue = this.boardLogic.board[event.fromCol][event.fromRow];
      if (boardValue !== null && typeof boardValue === 'number') {
        // Create a new tile for the value that moved to the swapper's old position
        const newTile = new Tile(this, event.fromCol, event.fromRow, boardValue, this.boardLogic.nextTileId++);
        this.tiles[fromKey] = newTile;
      }
    }
  }

  /**
   * Start bomb warning animation before explosion
   * Shows yellow flashing on the bomb tile, waits for tiles to settle, then explodes
   */
  handleBombExplosion(col, row, explosionData) {
    const bombKey = `${col},${row}`;
    const bombTile = this.tiles[bombKey];

    if (bombTile) {
      // Flash yellow twice to warn player
      const flashDuration = 150;
      const flashCount = 2;

      // Create yellow overlay for flashing
      const layout = GameConfig.getLayout(this.cameras.main.width, this.cameras.main.height);
      const x = layout.offsetX + col * layout.tileSize + layout.tileSize / 2;
      const y = layout.offsetY + row * layout.tileSize + layout.tileSize / 2;
      const size = layout.tileSize - 8;

      const warningFlash = this.add.graphics();
      warningFlash.fillStyle(0xffff00, 0.8);
      warningFlash.fillRoundedRect(x - size/2, y - size/2, size, size, 8);
      warningFlash.setAlpha(0);

      // Flash animation sequence
      this.tweens.add({
        targets: warningFlash,
        alpha: { from: 0, to: 1 },
        duration: flashDuration,
        yoyo: true,
        repeat: flashCount - 1,
        ease: 'Power2',
        onComplete: () => {
          warningFlash.destroy();
          // Wait a moment for tiles to settle, then explode
          this.time.delayedCall(200, () => {
            this.executeBombExplosion(col, row, explosionData);
          });
        }
      });
    } else {
      // No tile to flash (already removed), just explode
      this.executeBombExplosion(col, row, explosionData);
    }
  }

  /**
   * Execute the actual bomb explosion after warning animation
   */
  executeBombExplosion(col, row, explosionData) {
    const { affectedTiles, totalPoints } = explosionData;
    soundManager.play('explosion');

    // Track bomb explosion for achievements
    achievementManager.recordBombExploded();

    // Extract chain reaction bombs from affected tiles
    const chainReactions = affectedTiles ? affectedTiles.filter(t => t.chainReaction) : [];

    // Remove the bomb tile itself (center of explosion)
    const bombKey = `${col},${row}`;
    const bombTile = this.tiles[bombKey];
    if (bombTile) {
      delete this.tiles[bombKey];
      bombTile.fadeOutAnimation();
    }

    // Add explosion visual at bomb location
    const layout = GameConfig.getLayout(this.cameras.main.width, this.cameras.main.height);
    const x = layout.offsetX + col * layout.tileSize + layout.tileSize / 2;
    const y = layout.offsetY + row * layout.tileSize + layout.tileSize / 2;

    // Explosion effect - expanding ring that covers 3x3 area
    const blastRadius = layout.tileSize * 1.5; // Covers 3x3 tiles

    // Inner bright flash
    const flash = this.add.circle(x, y, 5, 0xffff00, 1);
    this.tweens.add({
      targets: flash,
      scaleX: 8,
      scaleY: 8,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });

    // Expanding ring (outline)
    const ring = this.add.graphics();
    ring.lineStyle(4, 0xff4444, 1);
    ring.strokeCircle(x, y, 10);
    this.tweens.add({
      targets: ring,
      scaleX: blastRadius / 10,
      scaleY: blastRadius / 10,
      alpha: 0,
      duration: 350,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    });

    // Outer glow
    const glow = this.add.circle(x, y, 15, 0xff6600, 0.6);
    this.tweens.add({
      targets: glow,
      scaleX: blastRadius / 15,
      scaleY: blastRadius / 15,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => glow.destroy()
    });

    // Screen shake
    this.cameras.main.shake(200, 0.01);

    // Remove affected tiles (except chain reaction bombs which will be handled separately)
    if (affectedTiles) {
      affectedTiles.forEach(affected => {
        if (affected.chainReaction) return; // Don't remove chain reaction bombs yet
        const key = `${affected.col},${affected.row}`;
        const tile = this.tiles[key];
        if (tile) {
          delete this.tiles[key];
          tile.fadeOutAnimation();
        }
      });
    }

    // Award points
    if (totalPoints > 0) {
      this.boardLogic.addScore(totalPoints);
      this.updateUI();
    }

    // Handle chain reactions (other bombs that were hit)
    if (chainReactions.length > 0) {
      this.time.delayedCall(200, () => {
        chainReactions.forEach(chainBomb => {
          const chainResult = this.specialTileManager.detonateBomb(chainBomb.col, chainBomb.row);
          if (chainResult) {
            this.handleBombExplosion(chainBomb.col, chainBomb.row, chainResult);
          }
        });
      });
    }

    // Apply gravity after explosion, then spawn new tiles
    this.time.delayedCall(chainReactions && chainReactions.length > 0 ? 500 : 200, () => {
      this.applyGravityWithCallback(() => {
        // Only spawn new tiles and update special tiles AFTER gravity completes
        this.onDropComplete();
      });
    });
  }

  /**
   * Apply gravity with a callback when complete (used after bomb explosions)
   */
  applyGravityWithCallback(callback) {
    if (this.isFrenzyMode) {
      this.isAnimating = false;
      this.checkEndConditions();
      if (callback) callback();
      return;
    }

    const ops = this.boardLogic.applyGravity();
    if (ops.length > 0) {
      this.animateGravity(ops, () => {
        this.updatePowerUpUI();
        this.syncTilesWithBoard(); // Clean up any ghost tiles
        this.isAnimating = false;
        this.checkEndConditions();
        if (callback) callback();
      });
    } else {
      this.syncTilesWithBoard(); // Clean up any ghost tiles
      this.isAnimating = false;
      this.checkEndConditions();
      if (callback) callback();
    }
  }

  /**
   * Sync visual tiles with board state - removes ghost tiles and fixes scale
   * Called after explosions and gravity to ensure consistency
   */
  syncTilesWithBoard() {
    const keysToRemove = [];

    // Find tiles that exist visually but not in board logic
    for (const key of Object.keys(this.tiles)) {
      const [col, row] = key.split(',').map(Number);
      const boardValue = this.boardLogic.board[col]?.[row];

      if (boardValue === null || boardValue === undefined) {
        keysToRemove.push(key);
      } else {
        // Ensure tile has correct scale (fix interrupted animations)
        const tile = this.tiles[key];
        if (tile && (tile.scaleX !== 1 || tile.scaleY !== 1)) {
          tile.setScale(1);
        }
      }
    }

    // Remove ghost tiles
    for (const key of keysToRemove) {
      const tile = this.tiles[key];
      if (tile) {
        delete this.tiles[key];
        tile.fadeOutAnimation();
      }
    }
  }

  /**
   * Try to spawn a specific type of special tile
   * @param {string} type - 'steel', 'glass', 'lead', 'auto_swapper', or 'bomb'
   * @returns {boolean} True if spawn was successful
   */
  trySpawnSpecialTile(type) {
    switch (type) {
      case 'steel': {
        const plate = this.specialTileManager.spawnSteelPlate();
        if (plate) {
          this.createSpecialTile(plate.col, plate.row, 'steel', { turnsRemaining: plate.turnsRemaining });
          return true;
        }
        return false;
      }
      case 'glass': {
        const emptyCell = this.specialTileManager.findRandomEmptyCell();
        if (emptyCell) {
          const glassValue = [3, 6, 12][Math.floor(Math.random() * 3)];
          const glassTile = this.specialTileManager.spawnGlassTile(emptyCell.col, emptyCell.row, glassValue);
          this.createSpecialTile(emptyCell.col, emptyCell.row, 'glass', { durability: glassTile.durability, value: glassValue });
          return true;
        }
        return false;
      }
      case 'lead': {
        const emptyCell = this.specialTileManager.findRandomEmptyCell();
        if (emptyCell) {
          const leadTile = this.specialTileManager.spawnLeadTile(emptyCell.col, emptyCell.row);
          this.createSpecialTile(emptyCell.col, emptyCell.row, 'lead', { countdown: leadTile.countdown });
          return true;
        }
        return false;
      }
      case 'auto_swapper': {
        const emptyCell = this.specialTileManager.findRandomEmptyCell();
        if (emptyCell) {
          const swapperValue = [3, 6, 12][Math.floor(Math.random() * 3)];
          const swapperTile = this.specialTileManager.spawnAutoSwapper(emptyCell.col, emptyCell.row, swapperValue);
          this.createSpecialTile(emptyCell.col, emptyCell.row, 'auto_swapper', {
            swapsRemaining: swapperTile.swapsRemaining,
            nextSwapIn: swapperTile.nextSwapIn,
            value: swapperValue
          });
          return true;
        }
        return false;
      }
      case 'bomb': {
        const emptyCell = this.specialTileManager.findRandomEmptyCell();
        if (emptyCell) {
          const bombValue = [3, 6, 12][Math.floor(Math.random() * 3)];
          const bombTile = this.specialTileManager.spawnBomb(emptyCell.col, emptyCell.row, bombValue);
          this.createSpecialTile(emptyCell.col, emptyCell.row, 'bomb', {
            mergesRemaining: bombTile.mergesRemaining,
            value: bombValue
          });
          return true;
        }
        return false;
      }
      default:
        return false;
    }
  }

  createSpecialTile(col, row, type, specialData) {
    // Glass tiles have a value, others don't
    const value = specialData.value || null;
    const tile = new Tile(this, col, row, value, this.boardLogic.nextTileId++, type, specialData);
    this.tiles[`${col},${row}`] = tile;
    return tile;
  }

  applyGravityAfterDrop() {
    if (this.isFrenzyMode) {
      // No gravity during frenzy
      this.isAnimating = false;
      this.checkEndConditions();
      return;
    }

    const ops = this.boardLogic.applyGravity();
    if (ops.length > 0) {
      this.animateGravity(ops, () => {
        this.updatePowerUpUI();
        this.syncTilesWithBoard(); // Clean up any ghost tiles
        this.isAnimating = false;
        this.checkEndConditions();
      });
    } else {
      this.syncTilesWithBoard(); // Clean up any ghost tiles
      this.isAnimating = false;
      this.checkEndConditions();
    }
  }

  handleSwipe(direction) {
    if (this.isAnimating || !this.swipeEnabled) return;
    this.isAnimating = true;
    this.cascadeMergeCount = 0;

    const ops = this.boardLogic.shiftBoard(direction);
    if (ops.length === 0) {
      this.isAnimating = false;
      return;
    }

    soundManager.play('swipe');

    this.animateOperations(ops, () => {
      const gravOps = this.boardLogic.applyGravity();
      if (gravOps.length > 0) {
        this.animateGravity(gravOps, () => this.onSwipeComplete());
      } else {
        this.onSwipeComplete();
      }
    });
  }

  animateOperations(operations, onComplete) {
    let completed = 0;
    const total = operations.length;
    if (total === 0) { onComplete(); return; }

    operations.forEach(op => {
      const fromKey = `${op.fromCol},${op.row}`;
      const toKey = `${op.toCol},${op.row}`;
      const tile = this.tiles[fromKey];

      if (!tile) { completed++; if (completed === total) onComplete(); return; }
      delete this.tiles[fromKey];

      if (op.type === 'move') {
        tile.updatePosition(op.toCol, op.row, true, GameConfig.ANIM.SHIFT);
        this.tiles[toKey] = tile;

        // Update special tile position tracking
        if (this.specialTileManager) {
          this.specialTileManager.updateTilePosition(op.fromCol, op.row, op.toCol, op.row);
        }

        this.time.delayedCall(GameConfig.ANIM.SHIFT, () => { completed++; if (completed === total) onComplete(); });
      } else if (op.type === 'merge') {
        const mergeWith = this.tiles[toKey];

        // Check if the destination tile still exists and can merge
        // (it may have been broken by a previous merge in this shift pass)
        const destBoardValue = this.boardLogic.board[op.toCol][op.row];
        const destStillMergeable = destBoardValue !== null && mergeWith;

        if (!destStillMergeable) {
          // Glass was broken or tile no longer exists - convert to simple move
          const movingValue = this.boardLogic.board[op.fromCol][op.row];
          this.boardLogic.board[op.fromCol][op.row] = null;
          this.boardLogic.board[op.toCol][op.row] = movingValue;

          tile.updatePosition(op.toCol, op.row, true, GameConfig.ANIM.SHIFT);
          this.tiles[toKey] = tile;

          if (this.specialTileManager) {
            this.specialTileManager.updateTilePosition(op.fromCol, op.row, op.toCol, op.row);
          }

          this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
            completed++;
            if (completed === total) onComplete();
          });
          return;
        }

        tile.updatePosition(op.toCol, op.row, true, GameConfig.ANIM.SHIFT);

        // Check if either tile is a bomb BEFORE removing
        let bombMergeResult = null;
        if (this.specialTileManager) {
          const specialTileFrom = this.specialTileManager.getSpecialTileAt(op.fromCol, op.row);
          const specialTileTo = this.specialTileManager.getSpecialTileAt(op.toCol, op.row);
          // Two bombs merging = immediate explosion
          if (specialTileFrom && specialTileFrom.type === 'bomb' && specialTileTo && specialTileTo.type === 'bomb') {
            bombMergeResult = this.specialTileManager.onBombBombMerge(op.fromCol, op.row, op.toCol, op.row);
          } else if (specialTileTo && specialTileTo.type === 'bomb') {
            bombMergeResult = this.specialTileManager.onBombMerge(op.toCol, op.row, op.value);
          } else if (specialTileFrom && specialTileFrom.type === 'bomb') {
            // Moving bomb merges with target - update bomb position first
            this.specialTileManager.updateTilePosition(op.fromCol, op.row, op.toCol, op.row);
            bombMergeResult = this.specialTileManager.onBombMerge(op.toCol, op.row, op.value);
          }
        }

        // Remove non-bomb special tiles at both positions
        if (this.specialTileManager) {
          const specialTileFrom = this.specialTileManager.getSpecialTileAt(op.fromCol, op.row);
          if (!specialTileFrom || specialTileFrom.type !== 'bomb') {
            this.specialTileManager.removeTileAt(op.fromCol, op.row);
          }
          if (!bombMergeResult || bombMergeResult.exploded) {
            this.specialTileManager.removeTileAt(op.toCol, op.row);
          }
        }

        this.time.delayedCall(GameConfig.ANIM.SHIFT, () => {
          if (mergeWith) { delete this.tiles[toKey]; mergeWith.mergeAnimation(); }

          // Notify special tile manager of merge (for glass damage to adjacent tiles)
          if (this.specialTileManager) {
            const events = this.specialTileManager.onMerge(op.toCol, op.row);
            this.handleSpecialTileEvents(events);
          }

          // Handle bomb explosion
          if (bombMergeResult && bombMergeResult.exploded) {
            tile.mergeAnimation(() => {
              this.handleBombExplosion(op.toCol, op.row, bombMergeResult);
              completed++;
              if (completed === total) onComplete();
            });
            return;
          }

          tile.mergeAnimation(() => {
            let merged;
            if (bombMergeResult && !bombMergeResult.exploded) {
              merged = new Tile(this, op.toCol, op.row, op.value, this.boardLogic.nextTileId++, 'bomb', { mergesRemaining: bombMergeResult.mergesRemaining, value: op.value });
            } else {
              merged = new Tile(this, op.toCol, op.row, op.value, this.boardLogic.nextTileId++);
            }
            merged.updatePosition(op.toCol, op.row, false);
            merged.setScale(0.5).setAlpha(0.5);
            this.boardLogic.addScore(op.value);
            this.powerUpManager.addMergePoint();
            tileCollectionManager.recordTile(op.value);
            achievementManager.recordTile(op.value);
            this.updateUI();

            this.tweens.add({
              targets: merged, scaleX: 1, scaleY: 1, alpha: 1,
              duration: GameConfig.ANIM.MERGE, ease: 'Back.easeOut',
              onComplete: () => { this.tiles[toKey] = merged; completed++; if (completed === total) onComplete(); }
            });
          });
        });
      }
    });
  }

  animateGravity(operations, onComplete) {
    if (operations.length === 0) { onComplete(); return; }

    const groups = {};
    operations.forEach(op => {
      if (!groups[op.col]) groups[op.col] = [];
      groups[op.col].push(op);
    });

    const cols = Object.keys(groups);
    let completedCols = 0;

    // When all columns complete, check for chain reactions
    const onAllColumnsComplete = () => {
      // Check if there are more gravity operations (chain reactions from merges)
      const moreOps = this.boardLogic.applyGravity();
      if (moreOps.length > 0) {
        this.animateGravity(moreOps, onComplete);
      } else {
        onComplete();
      }
    };

    cols.forEach(col => {
      const colOps = groups[col];
      let idx = 0;

      const processNext = () => {
        if (idx >= colOps.length) { completedCols++; if (completedCols === cols.length) onAllColumnsComplete(); return; }

        const op = colOps[idx++];
        const fromKey = `${op.col},${op.fromRow}`;
        const toKey = `${op.col},${op.toRow}`;
        const tile = this.tiles[fromKey];

        if (!tile) { processNext(); return; }
        delete this.tiles[fromKey];

        if (op.type === 'fall') {
          tile.updatePosition(op.col, op.toRow, true, GameConfig.ANIM.FALL);
          this.tiles[toKey] = tile;

          // Update special tile position tracking
          if (this.specialTileManager) {
            this.specialTileManager.updateTilePosition(op.col, op.fromRow, op.col, op.toRow);
          }

          this.time.delayedCall(GameConfig.ANIM.FALL, processNext);
        } else if (op.type === 'fall-merge') {
          const mergeWith = this.tiles[toKey];

          // Check if the destination tile still exists and can merge
          // (it may have been broken by a previous merge in this gravity pass)
          const destBoardValue = this.boardLogic.board[op.col][op.toRow];
          const destStillMergeable = destBoardValue !== null && mergeWith;

          if (!destStillMergeable) {
            // Glass was broken or tile no longer exists - convert to simple fall
            // Update the board state: the falling tile just lands at toRow
            const fallingValue = this.boardLogic.board[op.col][op.fromRow];
            this.boardLogic.board[op.col][op.fromRow] = null;
            this.boardLogic.board[op.col][op.toRow] = fallingValue;

            tile.updatePosition(op.col, op.toRow, true, GameConfig.ANIM.FALL);
            this.tiles[toKey] = tile;

            // Update special tile position tracking if it's a special tile
            if (this.specialTileManager) {
              this.specialTileManager.updateTilePosition(op.col, op.fromRow, op.col, op.toRow);
            }

            this.time.delayedCall(GameConfig.ANIM.FALL, processNext);
            return;
          }

          tile.updatePosition(op.col, op.toRow, true, GameConfig.ANIM.FALL);

          // Check if either tile is a bomb BEFORE removing
          let bombMergeResult = null;
          if (this.specialTileManager) {
            const specialTileFrom = this.specialTileManager.getSpecialTileAt(op.col, op.fromRow);
            const specialTileTo = this.specialTileManager.getSpecialTileAt(op.col, op.toRow);
            // Two bombs merging = immediate explosion
            if (specialTileFrom && specialTileFrom.type === 'bomb' && specialTileTo && specialTileTo.type === 'bomb') {
              bombMergeResult = this.specialTileManager.onBombBombMerge(op.col, op.fromRow, op.col, op.toRow);
            } else if (specialTileTo && specialTileTo.type === 'bomb') {
              bombMergeResult = this.specialTileManager.onBombMerge(op.col, op.toRow, op.value);
            } else if (specialTileFrom && specialTileFrom.type === 'bomb') {
              // Falling bomb merges with target - update bomb position first
              this.specialTileManager.updateTilePosition(op.col, op.fromRow, op.col, op.toRow);
              bombMergeResult = this.specialTileManager.onBombMerge(op.col, op.toRow, op.value);
            }
          }

          // Remove non-bomb special tiles at both positions
          if (this.specialTileManager) {
            const specialTileFrom = this.specialTileManager.getSpecialTileAt(op.col, op.fromRow);
            if (!specialTileFrom || specialTileFrom.type !== 'bomb') {
              this.specialTileManager.removeTileAt(op.col, op.fromRow);
            }
            if (!bombMergeResult || bombMergeResult.exploded) {
              this.specialTileManager.removeTileAt(op.col, op.toRow);
            }
          }

          this.time.delayedCall(GameConfig.ANIM.FALL, () => {
            if (mergeWith) { delete this.tiles[toKey]; mergeWith.mergeAnimation(); }

            // Notify special tile manager of merge (for glass damage to adjacent tiles)
            if (this.specialTileManager) {
              const events = this.specialTileManager.onMerge(op.col, op.toRow);
              this.handleSpecialTileEvents(events);
            }

            // Handle bomb explosion
            if (bombMergeResult && bombMergeResult.exploded) {
              tile.mergeAnimation(() => {
                this.handleBombExplosion(op.col, op.toRow, bombMergeResult);
                processNext();
              });
              return;
            }

            tile.mergeAnimation(() => {
              let merged;
              if (bombMergeResult && !bombMergeResult.exploded) {
                merged = new Tile(this, op.col, op.toRow, op.value, this.boardLogic.nextTileId++, 'bomb', { mergesRemaining: bombMergeResult.mergesRemaining, value: op.value });
              } else {
                merged = new Tile(this, op.col, op.toRow, op.value, this.boardLogic.nextTileId++);
              }
              merged.updatePosition(op.col, op.toRow, false);
              merged.setScale(0.3).setAlpha(0.5);

              soundManager.play('merge', op.value);

              // Cascade merge tracking for combos
              if (typeof this.cascadeMergeCount === 'number') {
                this.cascadeMergeCount++;
                if (this.cascadeMergeCount >= GameConfig.JUICE.COMBO_MIN_COUNT) {
                  const comboLayout = GameConfig.getLayout(this.cameras.main.width, this.cameras.main.height);
                  const cx = comboLayout.offsetX + op.col * comboLayout.tileSize + comboLayout.tileSize / 2;
                  const cy = comboLayout.offsetY + op.toRow * comboLayout.tileSize - 10;
                  this.animationController.showFloatingText(cx, cy, `${this.cascadeMergeCount}x COMBO!`, '#ffdd44');
                  soundManager.play('combo', this.cascadeMergeCount);
                }
              }

              // Merge particles
              const gLayout = GameConfig.getLayout(this.cameras.main.width, this.cameras.main.height);
              const gpx = gLayout.offsetX + op.col * gLayout.tileSize + gLayout.tileSize / 2;
              const gpy = gLayout.offsetY + op.toRow * gLayout.tileSize + gLayout.tileSize / 2;
              this.animationController.animateMergeParticles(gpx, gpy, getTileColor(op.value), GameConfig.JUICE.MERGE_PARTICLE_COUNT);

              // Screen shake for high-value merges
              if (op.value >= GameConfig.JUICE.SHAKE_MIN_VALUE) {
                const intensity = Math.min(op.value / 96, 1.5);
                this.cameras.main.shake(150, 0.005 * intensity);
              }

              this.boardLogic.addScore(op.value);
              this.powerUpManager.addMergePoint();
              tileCollectionManager.recordTile(op.value);
              achievementManager.recordTile(op.value);
              this.updateUI();

              this.tweens.add({
                targets: merged, scaleX: 1, scaleY: 1, alpha: 1,
                duration: GameConfig.ANIM.FALL, ease: 'Back.easeOut',
                onComplete: () => {
                  this.tiles[toKey] = merged;
                  // Secondary pulse for high-value tiles
                  if (op.value >= GameConfig.JUICE.SHAKE_MIN_VALUE) {
                    this.tweens.add({
                      targets: merged, scaleX: 1.08, scaleY: 1.08,
                      duration: 120, yoyo: true, ease: 'Sine.easeInOut'
                    });
                  }
                  processNext();
                }
              });
            });
          });
        }
      };
      processNext();
    });
  }

  onSwipeComplete() {
    // Deduct cost based on mode
    if (this.gameMode === 'original') {
      this.boardLogic.subtractMergeCount(GameConfig.GAMEPLAY.COMBO_COST);
      this.updateOriginalComboBar();
    } else {
      // In crazy/level modes, swipe already spent when enabled
      this.swipeEnabled = false;
      this.setCrazySwipeButtonsVisible(false);
    }
    this.syncTilesWithBoard(); // Clean up any ghost tiles
    this.updatePowerUpUI();
    this.isAnimating = false;
    this.checkEndConditions();
  }

  updateUI() {
    if (this.gameMode === 'level' && this.levelConfig) {
      const state = this.boardLogic.getGameState();
      // Add special tile tracking to state for progress display
      state.glassCleared = this.glassCleared;
      state.leadCleared = this.leadCleared;
      this.progressText.setText(levelManager.getProgressText(this.levelConfig.objective, state));
      this.movesText.setText(`Moves: ${state.movesUsed}/${this.levelConfig.maxMoves}`);
    } else if (this.scoreText) {
      this.scoreText.setText(`SCORE: ${this.boardLogic.getScore()}`);
    }
  }

  updateOriginalComboBar() {
    if (!this.comboBarFill) return;

    const count = this.boardLogic.getMergeCount();
    const max = GameConfig.GAMEPLAY.COMBO_MAX;
    const ratio = Math.min(count / max, 1);

    this.comboBarFill.clear();
    if (ratio > 0) {
      const color = ratio >= 1 ? GameConfig.UI.SUCCESS : GameConfig.UI.PRIMARY;
      this.comboBarFill.fillStyle(color, 1);
      this.comboBarFill.fillRoundedRect(this.comboBarX, this.comboBarY, this.comboBarWidth * ratio, this.comboBarHeight, 5);
    }

    this.comboText.setText(`${count}/${max}`);
    this.swipeEnabled = count >= max;

    if (this.swipeEnabled) {
      this.comboBarFill.clear();
      this.comboBarFill.fillStyle(GameConfig.UI.SUCCESS, 1);
      this.comboBarFill.fillRoundedRect(this.comboBarX, this.comboBarY, this.comboBarWidth, this.comboBarHeight, 5);
      this.tweens.add({ targets: this.comboBarFill, alpha: 0.5, duration: 500, yoyo: true, repeat: -1 });
      this.comboText.setColor('#7ed321');
      this.swipeButtons.leftButton.setFillStyle(GameConfig.UI.SUCCESS, 0.8).setStrokeStyle(3, GameConfig.UI.SUCCESS);
      this.swipeButtons.rightButton.setFillStyle(GameConfig.UI.SUCCESS, 0.8).setStrokeStyle(3, GameConfig.UI.SUCCESS);
      this.swipeButtons.leftText.setColor('#ffffff');
      this.swipeButtons.rightText.setColor('#ffffff');
      this.tweens.add({ targets: [this.swipeButtons.leftButton, this.swipeButtons.rightButton], alpha: 0.6, duration: 500, yoyo: true, repeat: -1 });
    } else {
      this.comboBarFill.setAlpha(1);
      this.tweens.killTweensOf(this.comboBarFill);
      this.comboText.setColor('#ffffff');
      this.tweens.killTweensOf([this.swipeButtons.leftButton, this.swipeButtons.rightButton]);
      this.swipeButtons.leftButton.setFillStyle(GameConfig.UI.PRIMARY, 0.3).setStrokeStyle(2, GameConfig.UI.PRIMARY).setAlpha(1);
      this.swipeButtons.rightButton.setFillStyle(GameConfig.UI.PRIMARY, 0.3).setStrokeStyle(2, GameConfig.UI.PRIMARY).setAlpha(1);
      this.swipeButtons.leftText.setColor('#4a90e2');
      this.swipeButtons.rightText.setColor('#4a90e2');
    }
  }

  updatePowerUpUI() {
    if (this.gameMode === 'original') {
      this.updateOriginalComboBar();
      return;
    }

    const state = this.powerUpManager.getState();

    // Update resource text
    if (this.resourceText) {
      this.resourceText.setText(`POWER: ${state.resourcePoints}`);
    }

    // Update button states
    Object.values(this.powerUpButtons).forEach(btn => {
      const canAfford = this.powerUpManager.canAfford(btn.type);

      btn.bg.clear();
      if (canAfford) {
        btn.bg.fillStyle(GameConfig.UI.SUCCESS, 0.4);
        btn.bg.lineStyle(2, GameConfig.UI.SUCCESS, 1);
      } else {
        btn.bg.fillStyle(GameConfig.UI.PRIMARY, 0.2);
        btn.bg.lineStyle(2, GameConfig.UI.DISABLED, 0.5);
      }
      btn.bg.fillRoundedRect(btn.x - 28, btn.y - 18, 56, 36, 6);
      btn.bg.strokeRoundedRect(btn.x - 28, btn.y - 18, 56, 36, 6);

      btn.label.setColor(canAfford ? '#ffffff' : '#666666');
      btn.costText.setColor(canAfford ? '#7ed321' : '#666666');
    });

    // Update frenzy bar
    if (this.frenzyBarFill && this.frenzyBarText) {
      // Cap ratio at 1 to prevent bar overflow
      const ratio = Math.min(state.frenzyMeter / state.frenzyThreshold, 1);
      this.frenzyBarFill.clear();
      if (ratio > 0) {
        this.frenzyBarFill.fillStyle(GameConfig.UI.FRENZY, 1);
        this.frenzyBarFill.fillRoundedRect(this.frenzyBarX, this.frenzyBarY, this.frenzyBarWidth * ratio, 16, 4);
      }
      // Display actual meter value but capped display at threshold
      const displayMeter = Math.min(state.frenzyMeter, state.frenzyThreshold);
      this.frenzyBarText.setText(`${displayMeter}/${state.frenzyThreshold}`);

      // Show/hide activate button
      if (this.frenzyActivateBtn) {
        this.frenzyActivateBtn.setVisible(state.isFrenzyReady && !state.isFrenzyActive);
      }
    }
  }

  showMessage(text) {
    if (this.messageText) {
      this.messageText.destroy();
    }

    const { width } = this.cameras.main;
    this.messageText = this.add.text(width / 2, this.GRID_OFFSET_Y - 70, text, {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: '#ffffff', backgroundColor: '#333333', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(200);

    // Auto-hide after 2 seconds
    this.time.delayedCall(2000, () => {
      if (this.messageText) {
        this.messageText.destroy();
        this.messageText = null;
      }
    });
  }

  hideMessage() {
    if (this.messageText) {
      this.messageText.destroy();
      this.messageText = null;
    }
  }

  checkEndConditions() {
    if (this.gameMode === 'level' && this.levelConfig) {
      const state = this.boardLogic.getGameState();
      // Add special tile tracking to state
      state.glassCleared = this.glassCleared;
      state.leadCleared = this.leadCleared;

      if (levelManager.checkObjective(this.levelConfig.objective, state)) {
        this.showLevelComplete();
        return;
      }

      if (state.movesUsed >= this.levelConfig.maxMoves || this.boardLogic.isBoardFull()) {
        this.showLevelFailed();
        return;
      }
    } else if (this.gameMode === 'daily' && this.dailyChallenge) {
      // Check daily challenge conditions
      if (this.checkDailyChallengeComplete()) {
        this.showDailyChallengeComplete();
        return;
      }

      // Check fail conditions
      if (this.checkDailyChallengeFailed()) {
        this.showDailyChallengeFailed();
        return;
      }
    } else {
      if (this.boardLogic.isBoardFull()) {
        this.showGameOver();
        return;
      }
    }

    // Auto-save for modes that support it (after each move)
    if (this.gameMode === 'original' || this.gameMode === 'crazy' || this.gameMode === 'endless') {
      gameStateManager.saveGameState(this);
    }
  }

  checkDailyChallengeComplete() {
    if (!this.dailyChallenge || this.dailyChallengeCompleted) return false;

    const state = this.boardLogic.getGameState();
    const challenge = this.dailyChallenge;

    switch (challenge.type) {
      case 'score_target':
      case 'no_power_ups':
        return state.score >= challenge.target;

      case 'tile_target':
        return state.highestTile >= challenge.target;

      case 'limited_moves':
        return state.score >= challenge.target;

      case 'survival':
        return state.movesUsed >= challenge.survivalMoves;

      default:
        return false;
    }
  }

  checkDailyChallengeFailed() {
    if (!this.dailyChallenge) return false;

    const challenge = this.dailyChallenge;
    const state = this.boardLogic.getGameState();

    // Board full = fail for most challenges
    if (this.boardLogic.isBoardFull()) {
      return true;
    }

    // Limited moves: out of moves AND didn't reach target score
    if (challenge.type === 'limited_moves' && state.movesUsed >= challenge.moveLimit && state.score < challenge.target) {
      return true;
    }

    return false;
  }

  showDailyChallengeComplete() {
    this.dailyChallengeCompleted = true;
    const { width, height } = this.cameras.main;
    const finalScore = this.boardLogic.getScore();

    // Mark challenge complete and get rewards
    const result = dailyChallengeManager.completeChallenge(finalScore);

    // Track achievements
    achievementManager.recordScore(finalScore);
    achievementManager.recordGamePlayed('daily');

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1000);

    this.add.text(width / 2, height / 2 - 100, 'CHALLENGE COMPLETE!', {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#22c55e'
    }).setOrigin(0.5).setDepth(1001);

    this.add.text(width / 2, height / 2 - 50, `Score: ${finalScore}`, {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#ffffff'
    }).setOrigin(0.5).setDepth(1001);

    if (result) {
      this.add.text(width / 2, height / 2 - 10, `+${result.points} points`, {
        fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#a78bfa'
      }).setOrigin(0.5).setDepth(1001);

      if (result.streak > 1) {
        this.add.text(width / 2, height / 2 + 20, `${result.streak} day streak!`, {
          fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#fbbf24'
        }).setOrigin(0.5).setDepth(1001);
      }
    }

    const menuBtn = this.add.text(width / 2, height / 2 + 70, 'BACK TO MENU', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    this.tweens.add({ targets: menuBtn, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });
  }

  showDailyChallengeFailed() {
    const { width, height } = this.cameras.main;
    const finalScore = this.boardLogic.getScore();
    const challenge = this.dailyChallenge;

    // Track achievements even on failure
    achievementManager.recordScore(finalScore);
    achievementManager.recordGamePlayed('daily');

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1000);

    this.add.text(width / 2, height / 2 - 80, 'CHALLENGE FAILED', {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ef4444'
    }).setOrigin(0.5).setDepth(1001);

    this.add.text(width / 2, height / 2 - 30, `Score: ${finalScore}`, {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#ffffff'
    }).setOrigin(0.5).setDepth(1001);

    // Show target for context
    let targetText = '';
    if (challenge.target) targetText = `Target: ${challenge.target}`;
    else if (challenge.survivalMoves) targetText = `Survive: ${challenge.survivalMoves} moves`;

    if (targetText) {
      this.add.text(width / 2, height / 2, targetText, {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#888888'
      }).setOrigin(0.5).setDepth(1001);
    }

    const retryBtn = this.add.text(width / 2, height / 2 + 50, 'TRY AGAIN', {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    retryBtn.on('pointerdown', () => this.scene.start('DailyChallengeScene'));
    this.tweens.add({ targets: retryBtn, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });

    const menuBtn = this.add.text(width / 2, height / 2 + 90, 'MAIN MENU', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  showLevelComplete() {
    const { width, height } = this.cameras.main;

    // Track level completion for achievements
    achievementManager.recordLevelCompleted();
    achievementManager.recordScore(this.boardLogic.getScore());
    achievementManager.recordGamePlayed('level');

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1000);

    this.add.text(width / 2, height / 2 - 80, 'LEVEL COMPLETE!', {
      fontSize: '36px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#7ed321'
    }).setOrigin(0.5).setDepth(1001);

    this.add.text(width / 2, height / 2 - 30, `Score: ${this.boardLogic.getScore()}`, {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#ffffff'
    }).setOrigin(0.5).setDepth(1001);

    const nextBtn = this.add.text(width / 2, height / 2 + 30, 'NEXT LEVEL', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    nextBtn.on('pointerdown', () => {
      const nextId = this.levelId + 1;
      if (nextId <= levelManager.getTotalLevels()) {
        this.scene.start('GameScene', { mode: 'level', levelId: nextId });
      } else {
        this.scene.start('TutorialSelectScene');
      }
    });

    const menuBtn = this.add.text(width / 2, height / 2 + 80, 'LEVEL SELECT', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    menuBtn.on('pointerdown', () => this.scene.start('TutorialSelectScene'));

    // Add "Back to Editor" button if this is a test level session
    if (window.isTestLevelSession) {
      const editorBtn = this.add.text(width / 2, height / 2 + 115, 'BACK TO EDITOR', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#f5c26b'
      }).setOrigin(0.5).setDepth(1001).setInteractive();

      editorBtn.on('pointerdown', () => {
        window.isTestLevelSession = false;
        window.close(); // Close the test tab and return to editor
      });
    }
  }

  showLevelFailed() {
    const { width, height } = this.cameras.main;

    // Track achievements even on failure
    achievementManager.recordScore(this.boardLogic.getScore());
    achievementManager.recordGamePlayed('level');

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1000);

    this.add.text(width / 2, height / 2 - 50, 'LEVEL FAILED', {
      fontSize: '36px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#e24a4a'
    }).setOrigin(0.5).setDepth(1001);

    const retryBtn = this.add.text(width / 2, height / 2 + 20, 'RETRY', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    retryBtn.on('pointerdown', () => this.scene.restart());

    const menuBtn = this.add.text(width / 2, height / 2 + 70, 'LEVEL SELECT', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(1001).setInteractive();

    menuBtn.on('pointerdown', () => this.scene.start('TutorialSelectScene'));

    // Add "Back to Editor" button if this is a test level session
    if (window.isTestLevelSession) {
      const editorBtn = this.add.text(width / 2, height / 2 + 105, 'BACK TO EDITOR', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#f5c26b'
      }).setOrigin(0.5).setDepth(1001).setInteractive();

      editorBtn.on('pointerdown', () => {
        window.isTestLevelSession = false;
        window.close(); // Close the test tab and return to editor
      });
    }
  }

  showGameOver() {
    const { width, height } = this.cameras.main;
    const finalScore = this.boardLogic.getScore();
    soundManager.play('gameOver');

    // Track if we can offer continue (endless mode only, once per game)
    const canContinue = this.gameMode === 'endless' && !this.hasUsedAdContinue;

    // Clear any saved game state since game is over
    gameStateManager.clearSavedGame(this.gameMode);

    // Track achievements
    achievementManager.recordScore(finalScore);
    achievementManager.recordGamePlayed(this.gameMode);

    // Save high score for original and crazy modes
    const isNewHighScore = highScoreManager.submitScore(this.gameMode, finalScore);

    // Store game over UI elements so we can remove them if continuing
    this.gameOverElements = [];

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(1000);
    this.gameOverElements.push(overlay);

    const gameOverText = this.add.text(width / 2, height / 2 - 90, 'GAME OVER', {
      fontSize: '48px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5).setDepth(1001);
    this.gameOverElements.push(gameOverText);

    const scoreText = this.add.text(width / 2, height / 2 - 40, `Final Score: ${finalScore}`, {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#f5a623'
    }).setOrigin(0.5).setDepth(1001);
    this.gameOverElements.push(scoreText);

    // Show new high score message if achieved
    if (isNewHighScore) {
      const newRecordText = this.add.text(width / 2, height / 2 - 5, 'NEW HIGH SCORE!', {
        fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#7ed321'
      }).setOrigin(0.5).setDepth(1001);
      this.tweens.add({ targets: newRecordText, scale: 1.1, duration: 500, yoyo: true, repeat: -1 });
      this.gameOverElements.push(newRecordText);
    } else {
      const highScore = highScoreManager.getHighScore(this.gameMode);
      const bestText = this.add.text(width / 2, height / 2 - 5, `Best: ${highScore}`, {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#888888'
      }).setOrigin(0.5).setDepth(1001);
      this.gameOverElements.push(bestText);
    }

    let buttonY = height / 2 + 35;

    // Watch Ad to Continue button (endless mode only)
    if (canContinue) {
      const adBtn = this.add.text(width / 2, buttonY, 'WATCH AD TO CONTINUE', {
        fontSize: '20px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#7ed321'
      }).setOrigin(0.5).setDepth(1001).setInteractive();
      this.gameOverElements.push(adBtn);

      adBtn.on('pointerdown', () => this.showAdAndContinue());
      this.tweens.add({ targets: adBtn, alpha: 0.6, duration: 600, yoyo: true, repeat: -1 });

      buttonY += 45;
    }

    const restartBtn = this.add.text(width / 2, buttonY, 'TAP TO RESTART', {
      fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#4a90e2'
    }).setOrigin(0.5).setDepth(1001).setInteractive();
    this.gameOverElements.push(restartBtn);

    restartBtn.on('pointerdown', () => this.scene.restart());
    this.tweens.add({ targets: restartBtn, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });

    // Menu button
    const menuBtn = this.add.text(width / 2, buttonY + 40, 'MAIN MENU', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(1001).setInteractive();
    this.gameOverElements.push(menuBtn);

    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  /**
   * Show an ad video and continue the game after watching
   */
  showAdAndContinue() {
    const { width, height } = this.cameras.main;

    // Mark that we've used the continue option
    this.hasUsedAdContinue = true;

    // Create full-screen ad container
    const adOverlay = this.add.graphics();
    adOverlay.fillStyle(0x000000, 1);
    adOverlay.fillRect(0, 0, width, height);
    adOverlay.setDepth(2000);

    // Create HTML video element for the ad
    const videoContainer = document.createElement('div');
    videoContainer.id = 'ad-container';
    videoContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #000;
      z-index: 10000;
    `;

    const video = document.createElement('video');
    video.style.cssText = 'max-width: 100%; max-height: 100%;';
    video.autoplay = true;
    video.playsInline = true;

    // Get ad URL
    const adUrl = this.loadRandomAd();

    if (adUrl) {
      // Play the video ad
      video.src = adUrl;
      videoContainer.appendChild(video);
      document.body.appendChild(videoContainer);

      // Skip button (appears after 3 seconds)
      const skipBtn = document.createElement('button');
      skipBtn.textContent = 'Skip';
      skipBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        font-size: 16px;
        background: rgba(255,255,255,0.2);
        color: white;
        border: 2px solid white;
        border-radius: 5px;
        cursor: pointer;
        z-index: 10001;
        display: none;
      `;

      skipBtn.onclick = () => {
        this.finishAdAndContinue(videoContainer, adOverlay);
      };

      videoContainer.appendChild(skipBtn);

      // Show skip button after 3 seconds
      setTimeout(() => {
        skipBtn.style.display = 'block';
      }, 3000);

      // Auto-continue when video ends
      video.onended = () => {
        this.finishAdAndContinue(videoContainer, adOverlay);
      };

      // Handle video errors
      video.onerror = () => {
        this.finishAdAndContinue(videoContainer, adOverlay);
      };
    } else {
      // No ads available - show placeholder for 3 seconds
      const placeholderText = this.add.text(width / 2, height / 2, 'Ad Placeholder\n(Add .mp4 files to /ads folder)', {
        fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#888888', align: 'center'
      }).setOrigin(0.5).setDepth(2001);

      const countdownText = this.add.text(width / 2, height / 2 + 60, '3', {
        fontSize: '48px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
      }).setOrigin(0.5).setDepth(2001);

      let countdown = 3;
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          countdown--;
          if (countdown > 0) {
            countdownText.setText(countdown.toString());
          } else {
            placeholderText.destroy();
            countdownText.destroy();
            adOverlay.destroy();
            this.continueAfterAd();
          }
        },
        repeat: 2
      });
    }
  }

  /**
   * Load a random ad video from the ads folder
   * Add your .mp4 filenames to the array below
   */
  loadRandomAd() {
    // List your ad video filenames here
    const adVideos = [
      'cat.mp4'
      // Add more: 'ad2.mp4', 'ad3.mp4', etc.
    ];

    if (adVideos.length === 0) return null;

    const randomAd = adVideos[Math.floor(Math.random() * adVideos.length)];
    return 'ads/' + randomAd;
  }

  /**
   * Clean up video container and continue the game
   */
  finishAdAndContinue(videoContainer, adOverlay) {
    if (videoContainer && videoContainer.parentNode) {
      videoContainer.parentNode.removeChild(videoContainer);
    }
    if (adOverlay) {
      adOverlay.destroy();
    }
    this.continueAfterAd();
  }

  /**
   * Continue the game after watching an ad
   * Clears a tile in the second-to-bottom row with a bomb explosion
   */
  continueAfterAd() {
    // Remove game over UI
    if (this.gameOverElements) {
      this.gameOverElements.forEach(el => {
        if (el && el.destroy) el.destroy();
      });
      this.gameOverElements = [];
    }

    // Find a tile in the second-to-bottom row (row 4, since rows are 0-5)
    const targetRow = 4;
    let targetCol = -1;

    // First, look for a tile in the second-to-bottom row
    for (let col = 0; col < 4; col++) {
      if (this.boardLogic.board[col][targetRow] !== null) {
        targetCol = col;
        break;
      }
    }

    // If no tile in row 4, try row 5 (bottom row)
    if (targetCol === -1) {
      for (let col = 0; col < 4; col++) {
        if (this.boardLogic.board[col][5] !== null) {
          targetCol = col;
          break;
        }
      }
    }

    // If still no tile found, just pick the center
    if (targetCol === -1) {
      targetCol = 1;
    }

    const finalRow = this.boardLogic.board[targetCol][targetRow] !== null ? targetRow : 5;

    // Create explosion data for a 3x3 area
    const affectedTiles = [];
    let totalPoints = 0;

    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        const col = targetCol + dc;
        const row = finalRow + dr;

        if (col < 0 || col >= 4 || row < 0 || row >= 6) continue;

        const value = this.boardLogic.board[col][row];
        if (value !== null && typeof value === 'number') {
          affectedTiles.push({ col, row, value });
          totalPoints += value;
          this.boardLogic.board[col][row] = null;
        } else if (value !== null && typeof value === 'object') {
          affectedTiles.push({ col, row, value: value.value || 0 });
          totalPoints += value.value || 0;
          this.boardLogic.board[col][row] = null;
        }
      }
    }

    // Remove special tiles in the explosion area
    if (this.specialTileManager) {
      affectedTiles.forEach(t => {
        this.specialTileManager.removeTileAt(t.col, t.row);
      });
    }

    // Execute the explosion visually
    this.executeBombExplosion(targetCol, finalRow, { affectedTiles, totalPoints });

    // Resume game after explosion settles
    this.time.delayedCall(800, () => {
      this.isAnimating = false;
    });
  }

  /**
   * Clean up event listeners and resources when scene is destroyed
   * Prevents memory leaks from lingering event handlers
   */
  shutdown() {
    // Remove resize listener
    this.scale.off('resize', this.onResize, this);

    // Clean up frenzy timer if active
    if (this.frenzyTimerEvent) {
      this.frenzyTimerEvent.remove();
      this.frenzyTimerEvent = null;
    }

    // Kill all tweens to prevent callbacks on destroyed objects
    this.tweens.killAll();
  }

  /**
   * Handle bomb merge logic - extracted to reduce code duplication
   * Called from animateFrenzyOperations, animateOperations, and animateGravity
   * @param {number} fromCol - Source column
   * @param {number} fromRow - Source row
   * @param {number} toCol - Target column
   * @param {number} toRow - Target row
   * @param {number} newValue - The merged tile value
   * @returns {Object|null} Bomb merge result or null if no bomb involved
   */
  handleBombMergeCheck(fromCol, fromRow, toCol, toRow, newValue) {
    if (!this.specialTileManager) return null;

    const specialTileFrom = this.specialTileManager.getSpecialTileAt(fromCol, fromRow);
    const specialTileTo = this.specialTileManager.getSpecialTileAt(toCol, toRow);

    // Two bombs merging = immediate explosion
    if (specialTileFrom?.type === 'bomb' && specialTileTo?.type === 'bomb') {
      return this.specialTileManager.onBombBombMerge(fromCol, fromRow, toCol, toRow);
    }

    // Target is a bomb
    if (specialTileTo?.type === 'bomb') {
      return this.specialTileManager.onBombMerge(toCol, toRow, newValue);
    }

    // Source is a bomb - update position first then merge
    if (specialTileFrom?.type === 'bomb') {
      this.specialTileManager.updateTilePosition(fromCol, fromRow, toCol, toRow);
      return this.specialTileManager.onBombMerge(toCol, toRow, newValue);
    }

    return null;
  }

  /**
   * Clean up special tiles after bomb merge check
   * @param {number} fromCol - Source column
   * @param {number} fromRow - Source row
   * @param {number} toCol - Target column
   * @param {number} toRow - Target row
   * @param {Object|null} bombMergeResult - Result from handleBombMergeCheck
   */
  cleanupSpecialTilesAfterMerge(fromCol, fromRow, toCol, toRow, bombMergeResult) {
    if (!this.specialTileManager) return;

    const specialTileFrom = this.specialTileManager.getSpecialTileAt(fromCol, fromRow);

    // Remove non-bomb special tiles at source position
    if (!specialTileFrom || specialTileFrom.type !== 'bomb') {
      this.specialTileManager.removeTileAt(fromCol, fromRow);
    }

    // Remove special tile at target if bomb exploded
    if (!bombMergeResult || bombMergeResult.exploded) {
      this.specialTileManager.removeTileAt(toCol, toRow);
    }
  }

  /**
   * Create merged tile after animation - handles both bomb and normal tiles
   * @param {number} col - Column position
   * @param {number} row - Row position
   * @param {number} value - Tile value
   * @param {Object|null} bombMergeResult - Result from handleBombMergeCheck
   * @returns {Tile} The newly created tile
   */
  createMergedTile(col, row, value, bombMergeResult) {
    if (bombMergeResult && !bombMergeResult.exploded) {
      return new Tile(this, col, row, value, this.boardLogic.nextTileId++, 'bomb', {
        mergesRemaining: bombMergeResult.mergesRemaining,
        value: value
      });
    }
    return new Tile(this, col, row, value, this.boardLogic.nextTileId++);
  }
}


// === js/main.js ===
/**
 * Main entry point - Phaser game initialization
 */
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
    min: {
      width: 320,
      height: 480
    },
    max: {
      width: 500,
      height: 900
    }
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: false
  },
  resolution: window.devicePixelRatio || 1,
  scene: [MenuScene, TileCollectionScene, DailyChallengeScene, TutorialSelectScene, LeaderboardScene, AchievementScene, StatsScene, GameScene]
};

const game = new Phaser.Game(config);

/**
 * Handle test level from Level Editor
 * Check URL for ?testLevel=ID parameter
 */
function checkForTestLevel() {
  const urlParams = new URLSearchParams(window.location.search);
  const testLevelId = urlParams.get('testLevel');

  if (testLevelId) {
    // Load test level from localStorage
    try {
      const testLevelData = localStorage.getItem('threes_test_level');
      if (testLevelData) {
        const level = JSON.parse(testLevelData);

        // Add to custom levels temporarily
        if (typeof customLevelLoader !== 'undefined') {
          customLevelLoader.addLevel(level);
        }

        // Store flag so we know this is a test session
        window.isTestLevelSession = true;
        window.testLevelId = parseInt(testLevelId);

        // Wait for MenuScene to be ready, then switch to GameScene
        setTimeout(() => {
          const menuScene = game.scene.getScene('MenuScene');
          if (menuScene && game.scene.isActive('MenuScene')) {
            // Use the scene's own method to switch - this ensures proper cleanup
            menuScene.scene.start('GameScene', {
              mode: 'level',
              levelId: parseInt(testLevelId)
            });
          }
        }, 500);
      }
    } catch (e) {
      console.error('Failed to load test level:', e);
    }

    // Clear URL parameter to prevent re-loading on refresh
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Check for test level after a short delay to ensure everything is loaded
setTimeout(checkForTestLevel, 100);


