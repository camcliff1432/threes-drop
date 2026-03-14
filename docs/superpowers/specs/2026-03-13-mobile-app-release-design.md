# Threes Drop — Mobile App Store Release Design

## Overview

Release Threes Drop as a native mobile app on iOS App Store and Google Play Store, with ad monetization (interstitial + rewarded) and a "Remove Ads" in-app purchase. The app version lives in a separate repository (`threes-drop-app`) from the web PWA version.

## Project Structure

Separate repository: `threes-drop-app`

```
threes-drop-app/
├── android/                  # Capacitor Android project (generated)
├── ios/                      # Capacitor iOS project (generated)
├── www/                      # Web assets (game source copied here)
│   ├── js/                   # Game JS files (synced from threes-drop)
│   │   ├── AdManager.js      # NEW: Ad loading, display, frequency
│   │   ├── IAPManager.js     # NEW: In-app purchase, remove ads state
│   │   └── (all existing game JS)
│   ├── index.html            # Modified for Capacitor
│   ├── levels.json
│   ├── manifest.json
│   └── icons/
├── resources/                # App icons and splash screen source images
├── privacy-policy.html       # Hosted privacy policy
├── capacitor.config.ts       # Capacitor configuration
├── package.json              # Dependencies (Capacitor, AdMob, RevenueCat)
├── sync-game.sh              # Script to copy game files from threes-drop repo
└── tsconfig.json
```

### Relationship to Original Repo

- `threes-drop` (existing) remains the web PWA version, unchanged
- `threes-drop-app` (new) is the app store version
- Game source (`js/`, `levels.json`, `index.html`) is copied into `www/`
- A `sync-game.sh` script copies updated game files from the original repo
- App-specific files (`AdManager.js`, `IAPManager.js`) live only in the app repo

## Architecture & Tooling

### Native Wrapper: Capacitor

Capacitor wraps the existing Phaser web game in a native WebView. The game code runs as-is with minimal modifications.

- `@capacitor/core` and `@capacitor/cli`
- `@capacitor/ios` and `@capacitor/android`
- `@capacitor/status-bar` — control status bar appearance
- `@capacitor/splash-screen` — native splash screen

### Ad Network: Google AdMob

- Plugin: `@capacitor-community/admob`
- Two ad units per platform (4 total): interstitial + rewarded
- Test ad IDs during development, production IDs for release

### In-App Purchase: RevenueCat

- Plugin: `@revenuecat/purchases-capacitor`
- Handles receipt validation, cross-platform purchase state, restore purchases
- Single product: "Remove Ads" non-consumable at $2.99

## Ad Strategy

### Interstitial Ads

- Shown on game-over screen, every 3rd game over
- Counter persisted in localStorage via StorageBatcher
- Counter resets after ad is shown
- Never interrupts active gameplay
- Skipped if user purchased "Remove Ads"

### Rewarded Ads

- "Watch ad to continue" on game-over screen (once per game, uses existing `hasUsedAdContinue` flag)
- "Watch ad for 5 bonus power-up points" (optional, from power-up bar)
- Always available, even for "Remove Ads" purchasers (opt-in, player benefits)

### Ad Loading

- Pre-load interstitial and rewarded ads on app start
- Re-load after each ad is shown
- Graceful fallback if ad fails to load (skip silently)

### Flow

```
Game Over → Check adsRemoved?
  ├─ Yes → Show game-over screen (no interstitial, rewarded still offered)
  └─ No  → Increment gameOverCount. gameOverCount % 3 === 0?
       ├─ Yes → Show interstitial, then game-over screen
       └─ No  → Show game-over screen

Game-over screen:
  - "Continue (Watch Ad)" — rewarded ad, once per game
  - "New Game" / "Menu" buttons
```

## In-App Purchase: Remove Ads

### Product

- ID: `threes_drop_remove_ads`
- Type: Non-consumable
- Price: $2.99
- Registered in both App Store Connect and Google Play Console

### State Management

- `adsRemoved` boolean in StorageBatcher for instant local checks
- RevenueCat syncs on app launch to validate and restore state
- Handles reinstalls and new devices via restore

### UI

- "Remove Ads" button on MenuScene (below existing menu buttons)
- Shows "$2.99" price label (fetched from store)
- Changes to "Ads Removed" (disabled) after purchase
- "Restore Purchases" button adjacent (required by Apple)

### Purchase Flow

```
Tap "Remove Ads" → RevenueCat purchase flow
  ├─ Success → adsRemoved = true, update UI, suppress interstitials
  ├─ Cancelled → no change
  └─ Error → brief error message

App Launch → RevenueCat.syncPurchases()
  └─ Restores adsRemoved if previously purchased
```

## Changes to Existing Game Code

### Modified Files (in www/)

**index.html:**
- Add `<script src="capacitor.js">` (Capacitor runtime)
- Remove service worker registration
- Add AdManager.js and IAPManager.js script tags

**main.js:**
- Initialize AdManager and IAPManager after Phaser game boots
- Show ATT consent prompt on first launch (iOS, required for AdMob IDFA)

**GameScene.js — game-over handler:**
- Replace custom video ad system with AdManager calls
- Call `AdManager.shouldShowInterstitial()` before showing game-over screen
- "Continue" button calls `AdManager.showRewarded()` instead of local video

**MenuScene.js:**
- Add "Remove Ads" and "Restore Purchases" buttons
- Buttons check IAPManager state

**config.js:**
- Add `ADS` config section: `{ INTERSTITIAL_FREQUENCY: 3 }`
- Add `IAP` config section: `{ REMOVE_ADS_PRODUCT_ID: 'threes_drop_remove_ads' }`

### Removed Files (not included in app version)

- `ads/` directory (cat.mp4, custom video system)
- `sw.js` (Capacitor handles offline)
- `graphics-preview.html` (dev artifact)

### New Files

- `js/AdManager.js` — ad loading, showing, frequency tracking
- `js/IAPManager.js` — purchase flow, remove-ads state
- `capacitor.config.ts` — Capacitor project config
- `privacy-policy.html` — simple privacy policy
- `sync-game.sh` — copies game files from original repo
- `resources/icon.png` — 1024x1024 source icon for both platforms
- `resources/splash.png` — 2732x2732 source splash screen

### Unchanged

All game logic, tile rendering, animations, board logic, managers, scoring, achievements, daily challenges, levels, tests — everything that makes the game work stays as-is.

## App Store Requirements

### Accounts

- Apple Developer Program ($99/year) at developer.apple.com
- Google Play Developer ($25 one-time) at play.google.com/console

### Assets Required

| Asset | iOS | Android |
|-------|-----|---------|
| App Icon | 1024x1024 PNG (no alpha, no rounded corners) | 512x512 PNG |
| Screenshots | 6.7" (1290x2796), 6.5" (1284x2778), 5.5" (1242x2208) — min 3 per size | Phone + 7" tablet — min 2 |
| Feature Graphic | n/a | 1024x500 PNG |
| Splash Screen | Generated by Capacitor from 2732x2732 source | Same |

### App Store Metadata

- **Name:** Threes Drop (check availability)
- **Category:** Games > Puzzle
- **Age Rating:** 4+ / Everyone
- **Description:** Short description + full description
- **Keywords:** tile, merge, puzzle, threes, drop, number
- **Privacy Policy URL:** Required by both stores

### Apple-Specific Compliance

- **App Tracking Transparency (ATT):** Prompt required before AdMob can use IDFA. Show on first launch with explanation: "This allows us to show relevant ads."
- **Privacy Nutrition Labels:** Declare ad tracking, analytics identifiers in App Store Connect
- **Sign in with Apple:** Not required (no user accounts)

### Build Requirements

- **iOS:** Requires Mac with Xcode 15+. Can use cloud Mac (GitHub Actions, MacStadium) if no physical Mac available.
- **Android:** Can build on any OS with Android Studio or Gradle CLI.

## Custom Art Assets & Sprite-Based Rendering

### Overview

Replace the programmatic TileRenderer (canvas-drawn gradients/shadows) with designer-created PNG sprites. The user designs assets in Figma, exports as PNG, and the game loads them as Phaser textures via a spritesheet or individual images.

### Asset Pipeline

All assets designed in Figma, exported as 32-bit PNG with transparency. Tiles designed at 256x256px (scaled down at runtime for crisp rendering on all screen densities). Particles designed at 32x32px in white/light gray (tinted at runtime by Phaser).

### Tile Assets (21 PNGs, 256x256px each)

**Normal tiles (13) — include the number baked in:**

| File | Value | Base Color |
|------|-------|------------|
| `tile_1.png` | 1 | `#66c3d5` sky blue |
| `tile_2.png` | 2 | `#e88a8a` coral pink |
| `tile_3.png` | 3 | `#f5f5f5` off-white (dark text) |
| `tile_6.png` | 6 | `#f5c26b` honey |
| `tile_12.png` | 12 | `#7cc576` sage green |
| `tile_24.png` | 24 | `#5fb3d4` ocean blue |
| `tile_48.png` | 48 | `#c49cde` lavender |
| `tile_96.png` | 96 | `#f2a477` peach |
| `tile_192.png` | 192 | `#7dd3c0` mint |
| `tile_384.png` | 384 | `#e8b4cb` rose |
| `tile_768.png` | 768 | `#a8c5e2` periwinkle |
| `tile_1536.png` | 1536 | `#f0d264` gold |
| `tile_3072.png` | 3072 | `#d4a5a5` dusty rose |

**Special tiles (7) — no numbers (added dynamically), except wildcard star:**

| File | Type | Base Color | Design Notes |
|------|------|------------|--------------|
| `tile_steel.png` | Steel | `#8899a6` | Metallic, crosshatch/rivets |
| `tile_lead.png` | Lead | `#4a4a4a` | Heavy/dense feel |
| `tile_glass_2.png` | Glass (full) | `#b8d4e8` | Translucent/shiny |
| `tile_glass_1.png` | Glass (cracked) | `#b8d4e8` | Cracked version |
| `tile_wildcard.png` | Wildcard | `#dba4eb` | Star/sparkle, include star symbol |
| `tile_auto_swapper.png` | Auto-swapper | `#a78dc2` | Swap arrows in top portion |
| `tile_bomb.png` | Bomb | `#e07676` | Bomb with fuse/spark |

**Default tile (1):**

| File | Notes |
|------|-------|
| `tile_default.png` | Gray `#9e9e9e` fallback |

### Grid Assets

Use the single-cell approach (more flexible for responsive sizing):

| File | Size | Notes |
|------|------|-------|
| `cell_empty.png` | 256x256 | Empty cell slot, dark inset look. Tiled across grid. |
| `badge_circle.png` | 64x64 | Badge for durability/merges counters on special tiles |

### Particle & Effect Assets (32x32px, white/light gray, tinted at runtime)

| File | Use |
|------|-----|
| `particle_star.png` | Merge celebrations — spray 6-10 outward from merge point |
| `particle_glow.png` | Soft circular glow — frenzy activation rain effect |
| `particle_shard.png` | Glass break fragments — scatter with rotation and gravity |
| `particle_spark.png` | Bomb explosion — radial burst with orange-to-red tint |

### Effect Overlays (256x256px)

| File | Use |
|------|-----|
| `overlay_glow.png` | Placed behind wildcards/bombs, slow pulse animation |
| `overlay_shimmer.png` | Diagonal light streak, animated across glass tiles |

### UI Assets (optional, 9-slice stretched in code)

| File | Size | Notes |
|------|------|-------|
| `btn_primary.png` | 256x64 | Main button |
| `btn_success.png` | 256x64 | Green action button |
| `bar_bg.png` | 256x32 | Progress bar background |
| `bar_fill.png` | 256x32 | Progress bar fill |

### Implementation Changes

TileRenderer.js will be replaced with a sprite-based loader:
- Load all tile PNGs on scene preload
- Tile.js creates `Phaser.GameObjects.Image` from loaded texture (same as current approach, but textures come from files instead of canvas)
- For normal tiles: no text overlay needed (number baked into PNG)
- For special tiles with dynamic text (steel countdown, lead countdown, glass value, auto-swapper value, bomb value): text overlay remains as Phaser text object
- Particle effects use `Phaser.GameObjects.Particles.ParticleEmitter` with the sprite assets instead of code-drawn circles
- Effect overlays are sprites layered behind/on top of tiles with tween animations

### Effect Enhancements

With sprite-based particles, effects become richer:
- **Merges**: spray `particle_star` outward with randomized scale, rotation, and fade
- **Glass breaks**: scatter `particle_shard` with gravity and spin
- **Bomb explosions**: radial `particle_spark` burst, screen shake, flash overlay
- **Frenzy activation**: rain `particle_glow` down the screen
- **High-value merges (48+)**: larger burst, more particles, stronger screen shake
- **Wildcard/bomb ambient**: `overlay_glow` pulsing behind the tile
- **Glass ambient**: `overlay_shimmer` slowly drifting diagonally across the tile

## Testing Plan

- Test on physical iPhone (user has one)
- Test on Android emulator (or borrow device)
- Verify ad loading, display, and frequency tracking
- Verify IAP purchase flow and restore
- Verify ATT prompt appears on iOS
- Test game-over flow with and without "Remove Ads"
- Verify all screen sizes render correctly (min 320x480 to max 500x900)
- Run existing unit tests (101 tests)
