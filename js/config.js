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
    DEFAULT: 0x999999
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
    BACKGROUND_DARK: 0x1a1a2e,
    BACKGROUND_LIGHT: 0x16213e,
    GRID_BG: 0x0f3460,
    CELL_BG: 0x16213e,
    DISABLED: 0x333333
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
