/**
 * Main entry point - Phaser game initialization
 */
const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 700,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: false
  },
  resolution: window.devicePixelRatio || 1,
  scene: [MenuScene, LevelSelectScene, GameScene]
};

const game = new Phaser.Game(config);
