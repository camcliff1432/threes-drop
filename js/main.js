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
