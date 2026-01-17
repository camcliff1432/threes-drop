/**
 * GameStateManager - Handles saving and loading game state for resume functionality
 */
class GameStateManager {
  constructor() {
    this.STORAGE_KEY = 'threes_drop_saved_game';
  }

  /**
   * Save the current game state
   */
  saveGameState(gameScene) {
    try {
      const state = {
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

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
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
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return false;

      const state = JSON.parse(stored);

      // Check if saved game matches the requested mode
      if (state.gameMode !== mode) return false;

      // Optional: expire saved games after 24 hours
      // const dayMs = 24 * 60 * 60 * 1000;
      // if (Date.now() - state.savedAt > dayMs) {
      //   this.clearSavedGame();
      //   return false;
      // }

      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get saved game state
   */
  getSavedGame() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load saved game:', e);
      return null;
    }
  }

  /**
   * Clear saved game
   */
  clearSavedGame() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
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
