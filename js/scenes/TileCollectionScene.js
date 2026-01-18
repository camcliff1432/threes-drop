/**
 * TileCollectionScene - Interactive sandbox showing discovered tiles
 * Players can swipe to shift all tiles around on a board with no gravity or merging
 */
class TileCollectionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TileCollectionScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    UIHelpers.drawBackground(this);

    // Title
    this.add.text(width / 2, 40, 'TILE COLLECTION', {
      fontSize: '28px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    // Grid settings - larger grid to use more space
    this.gridCols = 4;
    this.gridRows = 6;

    // Calculate tile size to fit nicely in available space
    const availableHeight = height - 120; // Leave room for title and padding
    const availableWidth = width - 40;
    this.tileSize = Math.min(
      Math.floor(availableWidth / this.gridCols),
      Math.floor(availableHeight / this.gridRows),
      90 // Max tile size
    );

    this.gridOffsetX = (width - this.gridCols * this.tileSize) / 2;
    this.gridOffsetY = 80;

    // Board state - null means empty
    this.board = [];
    for (let col = 0; col < this.gridCols; col++) {
      this.board[col] = [];
      for (let row = 0; row < this.gridRows; row++) {
        this.board[col][row] = null;
      }
    }

    // Tile sprites
    this.tileSprites = {};

    // Draw grid background
    this.drawGrid();

    // Place discovered tiles on the board
    this.placeDiscoveredTiles();

    // Setup swipe controls to move tiles
    this.setupSwipeControls();

    // Keyboard controls
    this.input.keyboard.on('keydown-LEFT', () => this.shiftAllTiles('left'));
    this.input.keyboard.on('keydown-RIGHT', () => this.shiftAllTiles('right'));
    this.input.keyboard.on('keydown-UP', () => this.shiftAllTiles('up'));
    this.input.keyboard.on('keydown-DOWN', () => this.shiftAllTiles('down'));
  }

  drawGrid() {
    const gridBg = this.add.graphics();

    // Grid background
    gridBg.fillStyle(GameConfig.UI.GRID_BG, 0.8);
    gridBg.fillRoundedRect(
      this.gridOffsetX - 5,
      this.gridOffsetY - 5,
      this.gridCols * this.tileSize + 10,
      this.gridRows * this.tileSize + 10,
      10
    );

    // Cell backgrounds
    for (let col = 0; col < this.gridCols; col++) {
      for (let row = 0; row < this.gridRows; row++) {
        const x = this.gridOffsetX + col * this.tileSize;
        const y = this.gridOffsetY + row * this.tileSize;

        gridBg.fillStyle(GameConfig.UI.CELL_BG, 0.8);
        gridBg.fillRoundedRect(x + 3, y + 3, this.tileSize - 6, this.tileSize - 6, 8);
      }
    }
  }

  placeDiscoveredTiles() {
    const discovered = tileCollectionManager.getDiscoveredTiles();

    // Place only discovered tiles in order, filling rows
    let col = 0;
    let row = 0;

    discovered.forEach(value => {
      if (col >= this.gridCols) {
        col = 0;
        row++;
      }
      if (row >= this.gridRows) return; // Board full

      // Place the tile
      this.board[col][row] = value;
      this.createTileSprite(col, row, value);

      col++;
    });
  }

  createTileSprite(col, row, value) {
    const x = this.gridOffsetX + col * this.tileSize + this.tileSize / 2;
    const y = this.gridOffsetY + row * this.tileSize + this.tileSize / 2;

    const container = this.add.container(x, y);

    // Tile background
    const bg = this.add.graphics();
    const size = this.tileSize - 10;
    bg.fillStyle(getTileColor(value), 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 10);
    bg.lineStyle(2, 0xffffff, 0.4);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 10);
    container.add(bg);

    // Value text
    const fontSize = value >= 1000 ? '20px' : value >= 100 ? '26px' : '32px';
    const text = this.add.text(0, 0, value.toString(), {
      fontSize, fontFamily: 'Arial, sans-serif', fontStyle: 'bold',
      color: getTileTextColor(value)
    }).setOrigin(0.5);
    container.add(text);

    // Store reference
    this.tileSprites[`${col},${row}`] = { container, value, col, row };

    return container;
  }

  setupSwipeControls() {
    const { width, height } = this.cameras.main;

    let startX = -1;
    let startY = -1;
    let swipeStarted = false;

    this.input.on('pointerdown', (pointer) => {
      startX = pointer.x;
      startY = pointer.y;
      swipeStarted = true;
    });

    this.input.on('pointerup', (pointer) => {
      // Ignore if swipe didn't start in this scene
      if (!swipeStarted) return;
      swipeStarted = false;

      const deltaX = pointer.x - startX;
      const deltaY = pointer.y - startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Need a minimum swipe distance
      if (absDeltaX < 40 && absDeltaY < 40) return;

      // Determine swipe direction
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          // Swipe right - check if should go back to menu or shift tiles
          if (startX > width * 0.7) {
            this.scene.start('MenuScene');
          } else {
            this.shiftAllTiles('right');
          }
        } else {
          this.shiftAllTiles('left');
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          this.shiftAllTiles('down');
        } else {
          this.shiftAllTiles('up');
        }
      }
    });

    // Right arrow hint for going back
    this.add.text(width - 15, height / 2, '>', {
      fontSize: '40px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setAlpha(0.5).setInteractive().on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // Hint text
    this.add.text(width - 15, height / 2 + 35, 'GAMES', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#4a90e2'
    }).setOrigin(0.5).setAlpha(0.7);
  }

  shiftAllTiles(direction) {
    // Shift each tile ONE space in the direction (like the game)
    // Process in correct order: tiles closer to target edge move first
    // This way, when we update board state immediately, subsequent tiles see the updated state

    if (direction === 'left') {
      for (let row = 0; row < this.gridRows; row++) {
        // Process left to right (tiles closer to left edge first)
        for (let col = 1; col < this.gridCols; col++) {
          this.shiftTileOneSpace(col, row, col - 1, row);
        }
      }
    } else if (direction === 'right') {
      for (let row = 0; row < this.gridRows; row++) {
        // Process right to left (tiles closer to right edge first)
        for (let col = this.gridCols - 2; col >= 0; col--) {
          this.shiftTileOneSpace(col, row, col + 1, row);
        }
      }
    } else if (direction === 'up') {
      for (let col = 0; col < this.gridCols; col++) {
        // Process top to bottom (tiles closer to top edge first)
        for (let row = 1; row < this.gridRows; row++) {
          this.shiftTileOneSpace(col, row, col, row - 1);
        }
      }
    } else if (direction === 'down') {
      for (let col = 0; col < this.gridCols; col++) {
        // Process bottom to top (tiles closer to bottom edge first)
        for (let row = this.gridRows - 2; row >= 0; row--) {
          this.shiftTileOneSpace(col, row, col, row + 1);
        }
      }
    }
  }

  shiftTileOneSpace(fromCol, fromRow, toCol, toRow) {
    // Only move if source has a tile and destination is empty
    if (this.board[fromCol][fromRow] === null) return;
    if (this.board[toCol][toRow] !== null) return;

    // Update board state immediately
    this.board[toCol][toRow] = this.board[fromCol][fromRow];
    this.board[fromCol][fromRow] = null;

    // Update sprite tracking and animate
    const key = `${fromCol},${fromRow}`;
    const sprite = this.tileSprites[key];
    if (!sprite) return;

    delete this.tileSprites[key];
    sprite.col = toCol;
    sprite.row = toRow;
    this.tileSprites[`${toCol},${toRow}`] = sprite;

    // Animate to new position
    const newX = this.gridOffsetX + toCol * this.tileSize + this.tileSize / 2;
    const newY = this.gridOffsetY + toRow * this.tileSize + this.tileSize / 2;

    this.tweens.add({
      targets: sprite.container,
      x: newX,
      y: newY,
      duration: 120,
      ease: 'Power2'
    });
  }
}
