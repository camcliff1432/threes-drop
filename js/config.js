/**
 * GameConfig - Centralized game configuration
 * All magic numbers and settings live here for easy tuning
 */
const GameConfig = {
  // Typography - Clean, friendly fonts
  FONTS: {
    DISPLAY: '"Nunito", "Helvetica Neue", sans-serif',  // Titles, headers
    NUMBERS: '"Nunito", "Helvetica Neue", sans-serif',  // Tile numbers, scores
    UI: '"Nunito", "Helvetica Neue", sans-serif'        // UI text, buttons
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
