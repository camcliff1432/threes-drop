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
