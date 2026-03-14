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

## Testing Plan

- Test on physical iPhone (user has one)
- Test on Android emulator (or borrow device)
- Verify ad loading, display, and frequency tracking
- Verify IAP purchase flow and restore
- Verify ATT prompt appears on iOS
- Test game-over flow with and without "Remove Ads"
- Verify all screen sizes render correctly (min 320x480 to max 500x900)
- Run existing unit tests (101 tests)
