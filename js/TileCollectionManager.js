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
