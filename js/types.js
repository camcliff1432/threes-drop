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
