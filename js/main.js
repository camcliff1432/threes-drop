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
  scene: [MenuScene, TileCollectionScene, DailyChallengeScene, LevelSelectScene, TutorialSelectScene, LeaderboardScene, AchievementScene, GameScene]
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
