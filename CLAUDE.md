# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Platform Adventure is a professional, multi-level 2D platformer game built with p5.js (v1.4.1). The game features 5 progressively difficult levels with smooth animations, particle effects, power-ups, enemies, weather systems, dash/wall-jump mechanics, combo scoring, and full mobile/desktop support with touch controls.

## Running the Game

**Open in browser:** Open `index.html` in a web browser. The game loads p5.js and p5.sound from CDN.

**Local server (recommended for mobile testing):**
```bash
python -m http.server 8000
# Navigate to http://localhost:8000
```

## File Structure

```
gameProject/
├── index.html              — Entry point, loading screen, fullscreen, mobile optimizations
├── CLAUDE.md               — This file (project docs for Claude Code)
├── src/
│   └── sketch.js           — All game logic (14 well-organized sections, ~1200 lines)
├── sounds/
│   ├── lifelike-126735.mp3         — Background music
│   ├── cartoon-jump-6462.mp3      — Jump sound
│   ├── collect-5930.mp3           — Coin/power-up collection
│   ├── goodresult-82807.mp3       — Level complete
│   ├── negative_beeps-6008.mp3    — Lose life / game over
│   └── running-in-grass-6237.mp3  — Walk sound
└── libs/
    └── p5.min.js           — p5.js local fallback
```

## Code Architecture (sketch.js — 14 Sections)

1. **Configuration & Constants** — `CONFIG` object with all tunable game parameters
2. **Game State Variables** — Character (`char` object), camera, input, weather, combo system
3. **p5.js Lifecycle** — `preload()`, `setup()`, `draw()` with state routing
4. **Level Generation** — `initializeLevel()` procedurally generates all objects per level
5. **Rendering — Background** — Gradient sky, day/night cycle, stars, mountains (parallax), clouds
6. **Rendering — Game Objects** — Collectables, power-ups, enemies (with AI), flagpole
7. **Rendering — Character** — Full articulated character with arms, legs, hair, expressions
8. **Rendering — UI & Screens** — HUD, menu, pause, game over, level complete screens
9. **Physics & Movement** — Gravity, jumping, dashing, wall-sliding, platform riding, wind
10. **Collision Detection** — Canyon, collectable, enemy (stomp or damage), power-up, flagpole
11. **Game Logic** — Lives, scoring, combos, high score (localStorage), state transitions
12. **Visual Effects** — Particles (burst/dust/spark), screen shake, weather (rain/snow/storm/wind)
13. **Input Handling** — Keyboard (A/D/W/Shift/P/Arrows), touch controls with multi-button
14. **Utility Functions** — Window resize handler

## Key Design Patterns

- **All coordinates are world-space.** `char.x` and all object positions share the same coordinate system. The camera translates in `draw()` only for rendering. Collision checks use raw positions directly — never add/subtract camera offsets.
- **Character state** is stored in the `char` object (position, velocity, flags).
- **CONFIG object** centralizes all magic numbers for easy tuning.
- **Velocity-based physics** — character has `vx`/`vy` with gravity each frame, capped by `MAX_FALL_SPEED`.

## Game Features

### Controls
- **Desktop:** A/D or Arrow Keys = move, W or Up = jump, Shift = dash, P = pause, Space = menu actions
- **Mobile:** On-screen buttons for left/right/jump/dash, tap for menu actions

### Movement Mechanics
- **Dash** (Shift): Short burst of speed with cooldown. Cancels vertical momentum. Screen shake on use.
- **Wall Jump**: Slide down platform walls and jump off them for advanced movement.
- **Jump Buffering**: Jump inputs within 8 frames of landing are remembered and executed on touchdown.

### Combat
- **Enemy Stomping**: Land on enemies from above to destroy them (+25 pts, bounce up).
- **Invincible Kill**: While invincible, touching enemies destroys them.

### Combo System
- Collecting coins/stomping enemies in quick succession builds a combo multiplier.
- 90-frame window between actions to maintain combo. Each combo level adds +0.5x multiplier.

### Weather System (per level)
- Level 1: Clear
- Level 2: Wind (affects airborne movement, sways trees)
- Level 3: Rain (visual rain particles)
- Level 4: Snow (drifting snowflakes)
- Level 5: Storm (heavy rain + wind + lightning flashes)

### Visual Effects
- **Day/Night Cycle**: Sky color shifts smoothly, stars fade in/out
- **Parallax Scrolling**: Mountains (0.25x), clouds (0.15x), stars (0.05x)
- **Screen Shake**: On enemy stomp, dash, taking damage, flagpole reach
- **Particle System**: Burst (coins/enemies), dust (landing), spark (dash/wall-jump)
- **Character Trail**: Motion blur effect when dashing or running fast
- **Enemy AI**: Eyes track player, occasional blinking, death squash animation

### Level Progression
- 5 levels with increasing length, enemies, canyons, platforms, and power-ups
- Moving platforms introduced at level 3+
- Background details (flowers, grass, rocks, mushrooms) increase per level
- High score persisted to localStorage

## Sound Files
- `lifelike-126735.mp3` — Background music (loops at 30% volume)
- `cartoon-jump-6462.mp3` — Jump sound
- `collect-5930.mp3` — Coin/power-up collection
- `goodresult-82807.mp3` — Level complete
- `negative_beeps-6008.mp3` — Lose life / game over
- `running-in-grass-6237.mp3` — Walk sound (loaded but available for future use)
