# Threes-Drop

A mobile-first puzzle game built with Phaser 3, inspired by the classic Threes! game with a vertical drop mechanic.

## How to Play

### Basic Mechanics
- **Tap a column** to drop the next tile into that column
- Tiles fall to the lowest available position
- **Merge tiles** to create higher values:
  - 1 + 2 = 3
  - Matching tiles (3+3, 6+6, etc.) combine to double their value

### Swipe Power-Up
- Every merge fills the **Swipe Power-Up** bar
- Once you reach 5 merges, you can use a horizontal swipe (or tap the arrow buttons)
- Swiping shifts all tiles one space left or right
- Horizontal merges only happen during swipes
- After swiping, gravity applies and cascading merges can occur
- Using the power-up subtracts 5 from the bar (doesn't fully reset)

### Scoring
- Points are added for each new tile that appears (drops and merges)
- Higher value tiles unlock as your score increases:
  - Score 50: Unlock 6
  - Score 150: Unlock 12
  - Score 400: Unlock 24
  - Score 1000: Unlock 48
  - Score 2500: Unlock 96

### Game Over
The game ends when the board is full and no more tiles can be dropped.

## Running the Game

Simply open `index.html` in a web browser. The game loads Phaser 3 from CDN, so an internet connection is required.

## Technical Details

- **Framework**: Phaser 3.80.1
- **Grid**: 4 columns x 6 rows
- **Self-contained**: All game logic is embedded in a single HTML file

## Files

- `index.html` - Main game file (self-contained)
- `index-debug.html` - Debug version with loading diagnostics
- `test.html` - Simple Phaser test page
