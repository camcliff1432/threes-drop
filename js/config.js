/**
 * GameConfig - Centralized game configuration
 * All magic numbers and settings live here for easy tuning
 */
const GameConfig = {
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
    // Auto-Swapper settings
    AUTO_SWAPPER_SPAWN_CHANCE: 0.04,  // 4% per drop
    AUTO_SWAPPER_SWAPS: 3,            // Expires after 3 swaps
    AUTO_SWAPPER_SWAP_MIN: 4,         // Swaps every 4-10 moves
    AUTO_SWAPPER_SWAP_MAX: 10,
    // Bomb settings
    BOMB_SPAWN_CHANCE: 0.03,   // 3% per drop (endless mode only)
    BOMB_MERGE_TRIGGER: 3      // Explodes after 3 merges
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

  // Tile colors by value
  COLORS: {
    1: 0x4a90e2,
    2: 0xe24a4a,
    3: 0xffffff,
    6: 0xf5a623,
    12: 0xf8e71c,
    24: 0x7ed321,
    48: 0x50e3c2,
    96: 0xb8e986,
    192: 0xbd10e0,
    384: 0xff6b6b,
    768: 0x4ecdc4,
    DEFAULT: 0x999999,
    // Special tile colors
    STEEL: 0x708090,
    LEAD: 0x1a1a1a,
    GLASS: 0xadd8e6,
    WILDCARD: 0xff00ff,
    AUTO_SWAPPER: 0x9932CC,  // Purple
    BOMB: 0xff4444           // Red
  },

  // Score thresholds for unlocking higher tiles (classic mode)
  UNLOCK_THRESHOLDS: {
    6: 50,
    12: 150,
    24: 400,
    48: 1000,
    96: 2500
  },

  // UI Colors
  UI: {
    PRIMARY: 0x4a90e2,
    PRIMARY_LIGHT: 0x5aa0f2,
    SUCCESS: 0x7ed321,
    DANGER: 0xe24a4a,
    WARNING: 0xf5a623,
    FRENZY: 0xff6b6b,
    BACKGROUND_DARK: 0x1a1a2e,
    BACKGROUND_LIGHT: 0x16213e,
    GRID_BG: 0x0f3460,
    CELL_BG: 0x16213e,
    DISABLED: 0x333333
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
