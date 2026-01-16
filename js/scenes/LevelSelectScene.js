/**
 * LevelSelectScene - New levels (coming soon placeholder)
 * Future expansion for additional level packs
 */
class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title
    this.add.text(width / 2, 50, 'LEVELS', {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Back button
    this.add.text(20, 20, '< BACK', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setInteractive().on('pointerdown', () => this.scene.start('MenuScene'));

    // Coming soon message
    const centerY = height / 2 - 30;

    // Decorative lock icon
    const lockSize = 80;
    const lockGraphics = this.add.graphics();
    lockGraphics.lineStyle(4, 0x4a90e2, 0.6);
    // Lock body
    lockGraphics.fillStyle(0x4a90e2, 0.2);
    lockGraphics.fillRoundedRect(width / 2 - lockSize / 2, centerY - 10, lockSize, lockSize * 0.7, 8);
    lockGraphics.strokeRoundedRect(width / 2 - lockSize / 2, centerY - 10, lockSize, lockSize * 0.7, 8);
    // Lock shackle
    lockGraphics.beginPath();
    lockGraphics.arc(width / 2, centerY - 10, lockSize / 3, Math.PI, 0, false);
    lockGraphics.strokePath();

    this.add.text(width / 2, centerY + 80, 'More levels coming soon!', {
      fontSize: '22px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#f5a623'
    }).setOrigin(0.5);

    this.add.text(width / 2, centerY + 115, 'Complete the Tutorial to\nmaster the basics first.', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa',
      align: 'center', lineSpacing: 4
    }).setOrigin(0.5);

    // Tutorial button
    UIHelpers.createButton(this, width / 2, centerY + 180, 'GO TO TUTORIAL', () => {
      this.scene.start('TutorialSelectScene');
    }, { width: 200, height: 45, fontSize: '16px' });
  }
}
