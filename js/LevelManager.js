/**
 * LevelManager - Manages level definitions and progression
 */
class LevelManager {
  constructor() {
    this.levels = this.defineLevels();
    this.currentLevel = null;
  }

  defineLevels() {
    return [
      // Level 1: Tutorial - Create a 3
      {
        id: 1,
        name: 'First Steps',
        description: 'Combine 1 + 2 to make 3',
        objective: { type: 'create_tile', value: 3, count: 1 },
        allowedTiles: [1, 2],
        maxMoves: 10,
        startingBoard: null,
        swipeEnabled: false
      },
      // Level 2: Make two 3s
      {
        id: 2,
        name: 'Double Trouble',
        description: 'Create two 3 tiles',
        objective: { type: 'create_tile', value: 3, count: 2 },
        allowedTiles: [1, 2],
        maxMoves: 15,
        startingBoard: null,
        swipeEnabled: false
      },
      // Level 3: Create a 6
      {
        id: 3,
        name: 'Level Up',
        description: 'Combine two 3s to make 6',
        objective: { type: 'create_tile', value: 6, count: 1 },
        allowedTiles: [1, 2, 3],
        maxMoves: 20,
        startingBoard: null,
        swipeEnabled: false
      },
      // Level 4: Introduction to swipe
      {
        id: 4,
        name: 'Swipe Right',
        description: 'Use swipe to create a 6',
        objective: { type: 'create_tile', value: 6, count: 1 },
        allowedTiles: [1, 2, 3],
        maxMoves: 15,
        startingBoard: null,
        swipeEnabled: true,
        startingCombo: 5
      },
      // Level 5: Score challenge
      {
        id: 5,
        name: 'Score Hunter',
        description: 'Reach 50 points',
        objective: { type: 'score', target: 50 },
        allowedTiles: [1, 2, 3],
        maxMoves: 25,
        startingBoard: null,
        swipeEnabled: true
      },
      // Level 6: Create a 12
      {
        id: 6,
        name: 'Dozen',
        description: 'Create a 12 tile',
        objective: { type: 'create_tile', value: 12, count: 1 },
        allowedTiles: [1, 2, 3],
        maxMoves: 30,
        startingBoard: null,
        swipeEnabled: true
      },
      // Level 7: Clear the board
      {
        id: 7,
        name: 'Clean Sweep',
        description: 'Have 3 or fewer tiles remaining',
        objective: { type: 'max_tiles', count: 3 },
        allowedTiles: [1, 2, 3],
        maxMoves: 20,
        startingBoard: [
          [1, null, null, null, null, null],
          [2, 1, null, null, null, null],
          [1, 2, null, null, null, null],
          [2, null, null, null, null, null]
        ],
        swipeEnabled: true,
        startingCombo: 5
      },
      // Level 8: Big score
      {
        id: 8,
        name: 'High Roller',
        description: 'Reach 150 points',
        objective: { type: 'score', target: 150 },
        allowedTiles: [1, 2, 3, 6],
        maxMoves: 35,
        startingBoard: null,
        swipeEnabled: true
      },
      // Level 9: Create a 24
      {
        id: 9,
        name: 'Two Dozen',
        description: 'Create a 24 tile',
        objective: { type: 'create_tile', value: 24, count: 1 },
        allowedTiles: [1, 2, 3, 6],
        maxMoves: 40,
        startingBoard: null,
        swipeEnabled: true
      },
      // Level 10: Ultimate challenge
      {
        id: 10,
        name: 'Master',
        description: 'Create a 48 tile',
        objective: { type: 'create_tile', value: 48, count: 1 },
        allowedTiles: [1, 2, 3, 6, 12],
        maxMoves: 50,
        startingBoard: null,
        swipeEnabled: true
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
      default:
        return '';
    }
  }
}

// Global level manager instance
const levelManager = new LevelManager();
