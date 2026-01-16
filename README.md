# Threes Drop

A mobile-first puzzle game built with Phaser 3, inspired by the classic Threes! game with a vertical drop mechanic.

## Game Modes

### Original
Classic gameplay with the swipe power-up only. No special tiles or frenzy mode.
- **Goal:** Create the highest tile possible

### Crazy
Full-featured mode with all power-ups, special tiles, and frenzy mode.
- **Goal:** Create the highest tile possible

### Endless
Score attack mode with bomb tiles that explode for massive points!
- **Goal:** Achieve the highest score

## How to Play

### Basic Mechanics
- **Tap a column** to drop the next tile into that column
- Tiles fall to the lowest available position
- **Merge tiles** to create higher values:
  - 1 + 2 = 3 (the only way to create a 3)
  - Matching tiles (3+3, 6+6, etc.) combine to double their value
- Use **arrow keys** or **swipe gestures** to shift all tiles horizontally

### Power-Ups
Earn 1 power point for each merge!

| Power-Up | Cost | Description |
|----------|------|-------------|
| **Swipe** | 5 | Shift all tiles left or right one space |
| **Swap** | 10 | Exchange any two tiles on the board |
| **Merge** | 10 | Force merge two compatible tiles |
| **Wildcard** | 20 | Next tile becomes a wildcard (matches any 3+) |

### Frenzy Mode
Available in Crazy and Endless modes:
- Fill the frenzy meter with 50 merges
- When activated: **10 seconds of no gravity!**
- Swipe in all 4 directions (up, down, left, right)
- Perfect for setting up massive combos

### Special Tiles

| Tile | Description |
|------|-------------|
| **Steel** | Blocks a cell for N turns, then disappears |
| **Lead** | Countdown timer - clears when it reaches 0 |
| **Glass** | Has a value - cracks and breaks when adjacent merges occur |
| **Auto-Swapper** | Automatically swaps with neighbors periodically |
| **Bomb** | Has a value - explodes in a 3x3 area after 3 merges! |

### Scoring
- Points are added for each tile that appears (drops and merges)
- Higher value tiles unlock as your score increases:
  - Score 50: Unlock 6
  - Score 150: Unlock 12
  - Score 400: Unlock 24
  - Score 1000: Unlock 48
  - Score 2500: Unlock 96

### Game Over
The game ends when the board is full and no more tiles can be dropped.

## Features

- **3 Game Modes** - Original, Crazy, and Endless
- **20 Tutorial Levels** - Learn the game mechanics step by step
- **48 Achievements** - Track your progress and milestones
- **Leaderboards** - High scores for each game mode
- **Responsive Design** - Plays great on mobile, tablet, and desktop
- **Power-Up System** - 4 unique power-ups to master
- **Frenzy Mode** - Gravity-free chaos for combo building
- **Special Tiles** - Steel, Lead, Glass, Auto-Swapper, and Bombs

## Running the Game

Simply open `index.html` in a web browser. The game loads Phaser 3 from CDN, so an internet connection is required.

## Technical Details

- **Framework:** Phaser 3.80.1
- **Grid:** 4 columns x 6 rows
- **Responsive:** Scales to fit any screen size
- **Storage:** High scores and progress saved to localStorage

## Project Structure

```
Threes-Drop/
├── index.html          # Main entry point
├── js/
│   ├── main.js         # Phaser game initialization
│   ├── config.js       # Game configuration and constants
│   ├── BoardLogic.js   # Core game logic
│   ├── Tile.js         # Tile rendering and animations
│   ├── SpecialTileManager.js  # Special tile logic
│   ├── HighScoreManager.js    # Score persistence
│   ├── LevelManager.js        # Tutorial level definitions
│   ├── UIHelpers.js           # Shared UI components
│   └── scenes/
│       ├── MenuScene.js           # Main menu with mode carousel
│       ├── GameScene.js           # Core gameplay
│       ├── LevelSelectScene.js    # Level selection (coming soon)
│       ├── TutorialSelectScene.js # Tutorial level selection
│       ├── LeaderboardScene.js    # High score display
│       └── AchievementScene.js    # Achievement tracking
└── images/             # Game assets
```

## Controls

- **Mouse/Touch:** Tap columns to drop tiles, drag to scroll menus
- **Arrow Keys:** Shift tiles left/right (or up/down during frenzy)
- **Swipe Gestures:** Alternative to arrow keys on touch devices

## Tips

- Keep high-value tiles in corners
- Save wildcards for big merges
- Use frenzy mode strategically to clear the board
- Watch bomb merge counters - they explode after 3!
- Plan your swaps before swiping
