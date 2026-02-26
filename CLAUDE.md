# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Platform Adventure is a professional, multi-level 2D platformer game built with p5.js (v1.4.1). The game features 5 progressively difficult levels with smooth animations, particle effects, power-ups, enemies, and full mobile/desktop support with touch controls.

## Running the Game

**Open in browser:** Open `index.html` in a web browser. The game loads p5.js and p5.sound from CDN.

**Local server (recommended for mobile testing):**
```bash
python -m http.server 8000
# Navigate to http://localhost:8000
```

**Mobile testing:** Access via local network IP for testing on actual mobile devices.

## Game Features

### Multi-Level System
- 5 levels with progressive difficulty (sketch.js:9)
- Level length increases by 500px per level (sketch.js:124)
- More enemies, canyons, and collectables added each level (sketch.js:125-127)
- Platforms introduced from level 2 onwards (sketch.js:190-200)
- Power-ups available from level 2+ (sketch.js:203-213)

### Game States
The game uses a state machine with 5 states (sketch.js:7):
- `menu`: Main menu with instructions
- `playing`: Active gameplay
- `paused`: Pause overlay (press P)
- `gameOver`: Death screen with score display
- `levelComplete`: Victory screen with level progression

### Lives & Respawn System
- Players start with 3 lives (sketch.js:10)
- Losing a life respawns player with 3 seconds of invincibility (sketch.js:800-801)
- Game over occurs when all lives are lost (sketch.js:803)

### Power-Up System
Three types of power-ups (sketch.js:208):
- **Invincibility** (purple star): 5 seconds of invulnerability (sketch.js:762-764)
- **Extra Life** (pink heart): Adds one life, max 5 (sketch.js:765-766)
- **Score Boost** (blue plus): +50 points instantly (sketch.js:767-768)

### Particle Effects System
Dynamic particle system for visual feedback (sketch.js:616-649):
- Coin collection: Golden particles
- Power-up collection: Purple particles
- Enemy collision: Red particles
- Particles have physics (gravity, velocity, fade-out)

## Code Architecture

### Initialization & Setup

**preload()** (lines 63-71): Loads all sound effects before game starts
**setup()** (lines 73-99): Creates responsive canvas, detects mobile, starts background music, initializes stars
**initializeLevel()** (lines 101-221): Generates level content procedurally based on difficulty

### Main Game Loop

**draw()** (lines 223-283): Core game loop with state-based rendering
- Draws gradient background and parallax stars
- Routes to appropriate screen based on gameState
- Renders all game objects with camera translation
- Updates physics, collisions, and game logic
- Draws UI and mobile controls

### Camera System
Smooth camera following with lerp interpolation (sketch.js:698-703):
- Camera targets player position offset by 1/3 screen width
- Smooth following using `lerp()` for cinematic feel
- Constrained to level boundaries
- Parallax scrolling for mountains (0.3x speed) and stars (0.1x speed)

### Physics & Movement
**updatePhysics()** (lines 651-696):
- Horizontal movement at 5 pixels/frame
- Gravity at 4 pixels/frame
- Jump height of 160 pixels
- Platform collision detection with 10px tolerance
- Canyon plummeting with 1.5x gravity

**Platform Collision** (lines 665-676):
- Checks if character is within platform bounds
- 10px vertical tolerance for smooth landing
- Only activates when falling downward

### Collision Detection System
**checkCollisions()** (lines 718-786) handles all collision types:

1. **Canyon Collision** (lines 720-726): Falls into gaps
2. **Collectable Collision** (lines 729-739): +10 points, particles, sound
3. **Enemy Collision** (lines 742-751): Loses life if not invincible
4. **Power-up Collision** (lines 754-774): Activates power-up effect
5. **Flagpole Collision** (lines 777-785): Level completion with 30px radius

### Enemy AI
Moving spiky ball enemies (sketch.js:463-503):
- Patrol within 200px range from spawn point
- Speed increases with level difficulty (sketch.js:181)
- Bounce back when reaching range limits (sketch.js:469-471)
- Rotating spikes for visual appeal (sketch.js:485-490)

### Responsive Design

**Mobile Detection** (line 79): Uses user agent string to detect mobile devices

**Touch Controls** (lines 1032-1069):
- Left/Right buttons for movement
- Large jump button (1.2x size)
- Visual feedback when buttons pressed
- Multi-touch support for simultaneous actions

**Window Resizing** (lines 1071-1074):
- Canvas resizes to fit screen (max 1024x576)
- Floor position recalculated on resize
- Orientation change handling in index.html

## Sound System

All sounds loaded in preload() to prevent playback issues:
- `backgroundMusic`: Loops at 30% volume throughout game
- `jumpSound`: Plays on jump
- `collectSound`: Plays when collecting coins
- `levelCompleteSound`: Plays on flagpole reach
- `gameOverSound`: Plays when losing life
- `walkSound`: Available but not currently used

Sound files required:
- lifelike-126735.mp3 (background music)
- cartoon-jump-6462.mp3
- collect-5930.mp3
- goodresult-82807.mp3
- negative_beeps-6008.mp3
- running-in-grass-6237.mp3

## Visual Enhancements

**Gradient Sky** (lines 285-294): Smooth color transition from dark to light blue
**Twinkling Stars** (lines 296-307): Animated background with sin-wave brightness
**Parallax Scrolling**: Mountains (0.3x), Stars (0.1x) for depth perception
**Floating Animations**: Coins and power-ups bob up and down (sketch.js:397-398, 427-428)
**Character Animation**: Different sprites for standing, walking, jumping in all directions
**Invincibility Effect**: Purple aura that flashes (sketch.js:539-544)

## Controls

**Keyboard (Desktop):**
- A/D: Move left/right
- W: Jump
- P: Pause/Resume
- SPACE: Start game, advance levels

**Touch (Mobile):**
- Left/Right arrow buttons: Movement
- Jump button: Jump
- Tap screen: Start/advance in menus
- Fullscreen button (top-right): Toggle fullscreen mode

## Level Design

Levels are procedurally generated with these parameters:
- **Level 1**: 2500px long, 10 collectables, 3 enemies, 3 canyons
- **Level 2**: 3000px long, 12 collectables, 4 enemies, 4 canyons, 2 platforms, 2 power-ups
- **Level 3**: 3500px long, 14 collectables, 5 enemies, 5 canyons, 3 platforms, 2 power-ups
- **Level 4**: 4000px long, 16 collectables, 6 enemies, 6 canyons, 4 platforms, 2 power-ups
- **Level 5**: 4500px long, 18 collectables, 7 enemies, 7 canyons, 5 platforms, 2 power-ups

Safe spacing ensures canyons don't spawn too close together (200-400px gaps).

## HTML Features

**Mobile Optimizations:**
- Viewport meta tag prevents zooming
- Touch callout prevention
- Text selection disabled for game-like feel
- Context menu disabled on long press
- Scroll prevention for touch events

**Loading Screen:** Animated spinner shows while assets load (index.html:136-139)
**Fullscreen Support:** Button for mobile users to enter fullscreen (index.html:141)
**Responsive Styling:** Canvas scales to fit screen with professional shadows

## Performance Considerations

- Particles automatically removed when life reaches 0 (sketch.js:628-630)
- Drawing optimized with push/pop for transformations
- Collision detection uses distance-based checks (efficient)
- Enemy movement calculated in draw loop (no separate update needed)
- Maximum particle count naturally limited by lifetime

## Known Improvements from Original

**Fixed bugs:**
- Camera logic corrected (now smoothly follows player)
- Flagpole detection improved (30px radius instead of exact 17px)
- Typos fixed (falgpoleDist → flagpoleDist)
- Canyon collision simplified and more reliable

**Added features:**
- Multi-level progression system
- Lives and respawn mechanics
- Power-ups with multiple types
- Particle effects system
- Mobile touch controls
- Pause functionality
- Menu and game state system
- Platform jumping mechanics
- Improved enemy visuals (spiky balls)
- Better coin appearance (rotating gold coins)
- Smooth camera following
- Parallax backgrounds
- Invincibility frames
- Professional UI
- Loading screen
- Responsive design
