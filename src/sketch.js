/*
 * ═══════════════════════════════════════════════════════════
 *   PLATFORM ADVENTURE — Multi-Level Platformer
 *   Built with p5.js | Enhanced Edition
 * ═══════════════════════════════════════════════════════════
 *
 *   SECTIONS:
 *   1. Configuration & Constants
 *   2. Game State Variables
 *   3. p5.js Lifecycle (preload, setup, draw)
 *   4. Level Generation
 *   5. Rendering — Background & Environment
 *   6. Rendering — Game Objects
 *   7. Rendering — Character
 *   8. Rendering — UI & Screens
 *   9. Physics & Movement
 *  10. Collision Detection
 *  11. Game Logic & State Management
 *  12. Visual Effects (Particles, Screenshake, Trails)
 *  13. Input Handling (Keyboard, Touch)
 *  14. Utility Functions
 */


// ═══════════════════════════════════════════════════════════
// 1. CONFIGURATION & CONSTANTS
// ═══════════════════════════════════════════════════════════

const CONFIG = {
    // Game settings
    MAX_LEVEL: 5,
    STARTING_LIVES: 3,
    MAX_LIVES: 5,
    MAX_CANVAS_W: 1024,
    MAX_CANVAS_H: 576,

    // Physics
    GRAVITY: 0.6,
    JUMP_FORCE: -12,
    MOVE_SPEED: 5,
    DASH_SPEED: 15,
    DASH_DURATION: 8,
    DASH_COOLDOWN: 45,
    WALL_JUMP_FORCE_X: 8,
    WALL_JUMP_FORCE_Y: -11,
    MAX_FALL_SPEED: 15,
    WALL_SLIDE_SPEED: 2,

    // Camera
    CAMERA_LERP: 0.08,
    CAMERA_LOOK_AHEAD: 80,
    CAMERA_VERTICAL_LERP: 0.05,

    // Combat / Scoring
    COIN_SCORE: 10,
    FLAGPOLE_SCORE: 100,
    ENEMY_STOMP_SCORE: 25,
    COMBO_WINDOW: 90,
    COMBO_MULTIPLIER: 0.5,
    POWERUP_SCORE_BOOST: 50,
    INVINCIBLE_DURATION: 300,
    RESPAWN_INVINCIBLE_DURATION: 180,

    // Particles
    MAX_PARTICLES: 200,

    // Visual
    STAR_COUNT: 60,
    CLOUD_COUNT: 14,
    MOUNTAIN_COUNT: 12,
    TREE_COUNT_BASE: 6,

    // Day/Night cycle (frames for full cycle)
    DAY_NIGHT_CYCLE: 3600,
};


// ═══════════════════════════════════════════════════════════
// 2. GAME STATE VARIABLES
// ═══════════════════════════════════════════════════════════

// --- Core state ---
let gameState = 'login'; // login | menu | playing | paused | gameOver | levelComplete | leaderboard
let currentLevel = 1;
let lives = 3;
let gameScore = 0;
let highScore = 0;
let levelStartTime = 0;
let frameCounter = 0;

// --- Player profile ---
let playerName = '';
let nameInput = null;
let leaderboard = []; // Array of { name, score, level, date }
const MAX_LEADERBOARD = 10;
const STORAGE_KEY_LB = 'platformAdventureLeaderboard';
const STORAGE_KEY_NAME = 'platformAdventurePlayerName';

// --- Character ---
let char = {
    x: 0, y: 0,
    vx: 0, vy: 0,
    facing: 1,       // 1 = right, -1 = left
    onGround: false,
    onPlatform: false,
    isPlummeting: false,
    isDashing: false,
    dashTimer: 0,
    dashCooldown: 0,
    dashDir: 1,
    wallSliding: false,
    wallDir: 0,
    canWallJump: false,
    invincible: false,
    invincibleTimer: 0,
    trailHistory: [],
};

// --- Input state ---
let keys = { left: false, right: false, jump: false, dash: false };
let touchControls = { left: false, right: false, jump: false };
let jumpBuffered = false;
let jumpBufferTimer = 0;
const JUMP_BUFFER_FRAMES = 8;

// --- Camera ---
let camera = { x: 0, y: 0, targetX: 0, targetY: 0, shake: 0 };

// --- Game objects ---
let collectables = [];
let canyons = [];
let mountains = [];
let clouds = [];
let trees = [];
let enemies = [];
let platforms = [];
let particles = [];
let powerUps = [];
let flagpole = null;
let movingPlatforms = [];
let backgroundDetails = [];

// --- Visual ---
let stars = [];
let floorPos_y;
let isMobile = false;
let dayNightPhase = 0;

// --- Combo system ---
let combo = { count: 0, timer: 0, lastText: '', textTimer: 0, textX: 0, textY: 0 };

// --- Sound ---
let jumpSound, collectSound, walkSound, backgroundMusic;
let gameOverSound, levelCompleteSound;

// --- Weather ---
let weather = {
    type: 'clear', // clear | rain | snow | wind
    raindrops: [],
    snowflakes: [],
    windStrength: 0,
    windDir: 1,
};


// ═══════════════════════════════════════════════════════════
// 3. P5.JS LIFECYCLE
// ═══════════════════════════════════════════════════════════

function preload() {
    soundFormats('mp3');
    collectSound = loadSound('sounds/collect-5930.mp3');
    jumpSound = loadSound('sounds/cartoon-jump-6462.mp3');
    walkSound = loadSound('sounds/running-in-grass-6237.mp3');
    backgroundMusic = loadSound('sounds/lifelike-126735.mp3');
    gameOverSound = loadSound('sounds/negative_beeps-6008.mp3');
    levelCompleteSound = loadSound('sounds/goodresult-82807.mp3');
}

function setup() {
    let cnv = createCanvas(
        min(windowWidth, CONFIG.MAX_CANVAS_W),
        min(windowHeight, CONFIG.MAX_CANVAS_H)
    );
    cnv.parent(document.body);

    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (backgroundMusic) {
        backgroundMusic.setVolume(0.3);
        backgroundMusic.loop();
    }

    floorPos_y = height * 3 / 4;

    // Load saved data
    loadLeaderboard();
    let savedName = localStorage.getItem(STORAGE_KEY_NAME);
    if (savedName) {
        playerName = savedName;
        gameState = 'menu'; // Skip login if we remember the name
    }
    let savedHS = localStorage.getItem('platformAdventureHighScore');
    if (savedHS) highScore = parseInt(savedHS);

    // Create the hidden HTML text input for name entry
    nameInput = createInput('');
    nameInput.attribute('maxlength', '12');
    nameInput.attribute('placeholder', 'Your name...');
    nameInput.style('position', 'absolute');
    nameInput.style('font-size', '22px');
    nameInput.style('text-align', 'center');
    nameInput.style('width', '220px');
    nameInput.style('padding', '8px 12px');
    nameInput.style('border', '2px solid rgba(255,215,0,0.6)');
    nameInput.style('border-radius', '8px');
    nameInput.style('background', 'rgba(20,20,50,0.9)');
    nameInput.style('color', '#FFD700');
    nameInput.style('outline', 'none');
    nameInput.style('font-family', 'inherit');
    nameInput.style('letter-spacing', '1px');
    repositionNameInput();
    if (gameState !== 'login') nameInput.hide();

    initStars();
    initializeLevel(currentLevel);
}

function repositionNameInput() {
    if (!nameInput) return;
    let cnv = document.querySelector('canvas');
    if (!cnv) return;
    let rect = cnv.getBoundingClientRect();
    nameInput.position(rect.left + rect.width / 2 - 110, rect.top + rect.height / 2 + 10);
}

function draw() {
    frameCounter++;
    dayNightPhase = (frameCounter % CONFIG.DAY_NIGHT_CYCLE) / CONFIG.DAY_NIGHT_CYCLE;

    // Apply screen shake
    push();
    if (camera.shake > 0) {
        translate(random(-camera.shake, camera.shake), random(-camera.shake, camera.shake));
        camera.shake *= 0.85;
        if (camera.shake < 0.5) camera.shake = 0;
    }

    // Background (always drawn)
    drawGradientBackground();
    drawStars();

    // State routing
    if (gameState === 'login') {
        drawLoginScreen();
        pop();
        return;
    }
    if (gameState === 'leaderboard') {
        drawLeaderboardScreen();
        pop();
        return;
    }
    if (gameState === 'menu') {
        drawMenu();
        pop();
        return;
    }
    if (gameState === 'paused') {
        drawPausedScreen();
        pop();
        return;
    }
    if (gameState === 'gameOver') {
        drawGameOverScreen();
        pop();
        return;
    }
    if (gameState === 'levelComplete') {
        drawLevelCompleteScreen();
        pop();
        return;
    }

    // === PLAYING STATE ===
    // Ground
    noStroke();
    drawGround();

    // World-space rendering
    push();
    translate(-camera.x, -camera.y + floorPos_y - height * 3 / 4);

    drawMountains();
    drawClouds();
    drawBackgroundDetails();
    drawTrees();
    drawCanyons();
    drawPlatforms();
    drawMovingPlatforms();
    drawCollectables();
    drawPowerUps();
    drawEnemies();
    drawFlagpole();
    drawCharacterTrail();
    drawCharacter();
    drawParticles();
    drawWeather();

    pop();

    // Update logic
    updatePhysics();
    updateCamera();
    updateInvincibility();
    updateDash();
    updateCombo();
    updateWeather();
    checkCollisions();

    // HUD (screen-space)
    drawUI();
    drawComboText();

    if (isMobile) {
        drawMobileControls();
    }

    pop(); // end screen shake
}


// ═══════════════════════════════════════════════════════════
// 4. LEVEL GENERATION
// ═══════════════════════════════════════════════════════════

function initStars() {
    stars = [];
    for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
        stars.push({
            x: random(3000),
            y: random(height * 0.65),
            size: random(1, 3.5),
            twinkleSpeed: random(0.02, 0.08),
            brightness: random(150, 255),
        });
    }
}

function initializeLevel(level) {
    // Reset character
    char.x = 200;
    char.y = floorPos_y;
    char.vx = 0;
    char.vy = 0;
    char.facing = 1;
    char.onGround = true;
    char.onPlatform = false;
    char.isPlummeting = false;
    char.isDashing = false;
    char.dashTimer = 0;
    char.dashCooldown = 0;
    char.wallSliding = false;
    char.canWallJump = false;
    char.invincible = false;
    char.invincibleTimer = 0;
    char.trailHistory = [];

    camera.x = 0;
    camera.y = 0;
    camera.targetX = 0;
    camera.targetY = 0;
    camera.shake = 0;

    jumpBuffered = false;
    jumpBufferTimer = 0;
    combo.count = 0;
    combo.timer = 0;
    levelStartTime = frameCounter;

    // Clear all arrays
    collectables = [];
    canyons = [];
    mountains = [];
    clouds = [];
    trees = [];
    enemies = [];
    platforms = [];
    movingPlatforms = [];
    powerUps = [];
    particles = [];
    backgroundDetails = [];

    // Scaling parameters
    let levelLength = 2500 + (level * 600);
    let numCollectables = 12 + (level * 3);
    let numEnemies = 2 + level;
    let numCanyons = 3 + level;
    let numPlatforms = level >= 2 ? level + 1 : 0;
    let numMovingPlatforms = level >= 3 ? floor(level / 2) : 0;
    let numPowerUps = level >= 2 ? 2 + floor(level / 2) : 0;
    let numTrees = CONFIG.TREE_COUNT_BASE + level * 2;

    // --- Canyons (placed first for safe spacing) ---
    let lastCanyonEnd = 400;
    for (let i = 0; i < numCanyons; i++) {
        let canyonX = lastCanyonEnd + random(250, 450);
        let canyonW = random(80, 120 + level * 12);
        canyons.push({ posX: canyonX, width: canyonW });
        lastCanyonEnd = canyonX + canyonW;
    }

    // --- Collectables ---
    for (let i = 0; i < numCollectables; i++) {
        let cx = random(250, levelLength - 100);
        // Avoid spawning inside canyons
        let inCanyon = canyons.some(c => cx > c.posX - 20 && cx < c.posX + c.width + 20);
        if (inCanyon) { i--; continue; }
        collectables.push({
            posX: cx,
            posY: floorPos_y - 35,
            size: random(0.5, 0.7),
            isFound: false,
            floatPhase: random(TWO_PI),
        });
    }

    // --- Static platforms ---
    for (let i = 0; i < numPlatforms; i++) {
        let px = random(350, levelLength - 300);
        platforms.push({
            posX: px,
            posY: floorPos_y - random(70, 160),
            width: random(90, 140),
            height: 14,
        });
        // Place a coin on some platforms
        if (random() > 0.4) {
            collectables.push({
                posX: px + random(20, 60),
                posY: platforms[platforms.length - 1].posY - 30,
                size: random(0.5, 0.65),
                isFound: false,
                floatPhase: random(TWO_PI),
            });
        }
    }

    // --- Moving platforms (level 3+) ---
    for (let i = 0; i < numMovingPlatforms; i++) {
        let mx = random(500, levelLength - 400);
        let my = floorPos_y - random(90, 150);
        movingPlatforms.push({
            posX: mx, posY: my,
            startX: mx, startY: my,
            width: 100, height: 14,
            moveType: random(['horizontal', 'vertical']),
            range: random(60, 120),
            speed: random(0.5, 1.2),
            phase: random(TWO_PI),
        });
    }

    // --- Enemies ---
    for (let i = 0; i < numEnemies; i++) {
        let ex = random(500, levelLength - 300);
        let inCanyon = canyons.some(c => ex > c.posX - 30 && ex < c.posX + c.width + 30);
        if (inCanyon) { i--; continue; }
        enemies.push({
            posX: ex,
            posY: floorPos_y - 20,
            startX: ex,
            speed: random(1, 1.5 + level * 0.4),
            direction: random() > 0.5 ? 1 : -1,
            range: random(150, 250),
            alive: true,
            deathTimer: 0,
            spikeRotation: random(TWO_PI),
            eyeBlink: 0,
        });
    }

    // --- Power-ups ---
    for (let i = 0; i < numPowerUps; i++) {
        let types = ['invincibility', 'extraLife', 'scoreBoost'];
        if (level >= 4) types.push('timeSlow');
        powerUps.push({
            posX: random(400, levelLength - 200),
            posY: floorPos_y - 50,
            type: random(types),
            isCollected: false,
            floatPhase: random(TWO_PI),
            glowPhase: random(TWO_PI),
        });
    }

    // --- Mountains ---
    for (let i = 0; i < CONFIG.MOUNTAIN_COUNT; i++) {
        mountains.push({
            posX: random(-200, levelLength + 400),
            height: random(120, 280),
            width: random(180, 350),
            shade: random(70, 110),
        });
    }

    // --- Clouds ---
    for (let i = 0; i < CONFIG.CLOUD_COUNT; i++) {
        clouds.push({
            posX: random(-100, levelLength + 200),
            posY: random(20, floorPos_y * 0.4),
            size: random(0.7, 1.6),
            speed: random(0.15, 0.5),
            opacity: random(150, 220),
        });
    }

    // --- Trees ---
    for (let i = 0; i < numTrees; i++) {
        let tx = random(100, levelLength);
        let inCanyon = canyons.some(c => tx > c.posX - 15 && tx < c.posX + c.width + 15);
        if (inCanyon) { i--; continue; }
        trees.push({
            x: tx,
            height: random(60, 110),
            trunkWidth: random(14, 22),
            foliageSize: random(50, 85),
            foliageColor: [random(20, 50), random(100, 160), random(20, 50)],
            sway: random(TWO_PI),
        });
    }

    // --- Background details (flowers, grass tufts, rocks) ---
    for (let i = 0; i < 30 + level * 5; i++) {
        let dx = random(100, levelLength);
        let inCanyon = canyons.some(c => dx > c.posX && dx < c.posX + c.width);
        if (inCanyon) continue;
        backgroundDetails.push({
            x: dx,
            type: random(['flower', 'grass', 'rock', 'mushroom']),
            color: [random(150, 255), random(50, 200), random(50, 200)],
            size: random(0.5, 1.2),
            swayPhase: random(TWO_PI),
        });
    }

    // --- Flagpole ---
    flagpole = {
        posX: levelLength,
        isReached: false,
        flagY: floorPos_y - 25,
    };

    // --- Weather based on level ---
    setupWeather(level);
}

function setupWeather(level) {
    weather.raindrops = [];
    weather.snowflakes = [];
    weather.windStrength = 0;

    if (level === 1) {
        weather.type = 'clear';
    } else if (level === 2) {
        weather.type = 'wind';
        weather.windStrength = 0.3;
        weather.windDir = 1;
    } else if (level === 3) {
        weather.type = 'rain';
        for (let i = 0; i < 100; i++) {
            weather.raindrops.push({
                x: random(-200, CONFIG.MAX_CANVAS_W + 200),
                y: random(-50, CONFIG.MAX_CANVAS_H),
                speed: random(8, 15),
                length: random(10, 20),
            });
        }
    } else if (level === 4) {
        weather.type = 'snow';
        for (let i = 0; i < 80; i++) {
            weather.snowflakes.push({
                x: random(-200, CONFIG.MAX_CANVAS_W + 200),
                y: random(-50, CONFIG.MAX_CANVAS_H),
                speed: random(1, 3),
                size: random(2, 6),
                wobble: random(TWO_PI),
            });
        }
    } else {
        weather.type = 'storm';
        weather.windStrength = 0.6;
        for (let i = 0; i < 150; i++) {
            weather.raindrops.push({
                x: random(-200, CONFIG.MAX_CANVAS_W + 400),
                y: random(-50, CONFIG.MAX_CANVAS_H),
                speed: random(12, 20),
                length: random(15, 25),
            });
        }
    }
}


// ═══════════════════════════════════════════════════════════
// 5. RENDERING — BACKGROUND & ENVIRONMENT
// ═══════════════════════════════════════════════════════════

function drawGradientBackground() {
    // Day/night shifting sky colors
    let nightTop = color(10, 10, 35);
    let nightBot = color(25, 35, 70);
    let dayTop = color(40, 60, 130);
    let dayBot = color(100, 150, 200);

    // Use sin wave for smooth day/night
    let t = (sin(dayNightPhase * TWO_PI - HALF_PI) + 1) / 2;

    let topColor = lerpColor(nightTop, dayTop, t);
    let botColor = lerpColor(nightBot, dayBot, t);

    noStroke();
    for (let y = 0; y < floorPos_y; y++) {
        let inter = y / floorPos_y;
        stroke(lerpColor(topColor, botColor, inter));
        line(0, y, width, y);
    }
    noStroke();
}

function drawStars() {
    // Stars fade with day/night cycle
    let nightAmount = 1 - (sin(dayNightPhase * TWO_PI - HALF_PI) + 1) / 2;
    if (nightAmount < 0.15) return;

    push();
    translate(-camera.x * 0.05, 0);
    noStroke();
    for (let s of stars) {
        let twinkle = sin(frameCounter * s.twinkleSpeed + s.x) * 50;
        let alpha = (s.brightness + twinkle) * nightAmount;
        fill(255, 255, 240, alpha);
        ellipse(s.x, s.y, s.size);
    }
    pop();
}

function drawGround() {
    // Ground with subtle gradient
    let groundTop = color(55, 50, 75);
    let groundBot = color(35, 32, 50);
    for (let y = floorPos_y; y < height; y++) {
        let t = (y - floorPos_y) / (height - floorPos_y);
        stroke(lerpColor(groundTop, groundBot, t));
        line(0, y, width, y);
    }
    // Grass line
    stroke(50, 120, 50);
    strokeWeight(3);
    line(0, floorPos_y, width, floorPos_y);
    noStroke();
}

function drawMountains() {
    push();
    // Parallax: mountains move slower
    translate(-camera.x * 0.25, 0);
    noStroke();
    for (let m of mountains) {
        // Back mountain (darker, bigger)
        fill(m.shade - 20, m.shade - 15, m.shade + 10);
        triangle(
            m.posX, floorPos_y,
            m.posX - m.width * 0.6, floorPos_y,
            m.posX + m.width * 0.1, floorPos_y - m.height
        );
        // Front mountain
        fill(m.shade, m.shade + 5, m.shade + 20);
        triangle(
            m.posX - m.width * 0.3, floorPos_y,
            m.posX + m.width * 0.5, floorPos_y,
            m.posX + m.width * 0.15, floorPos_y - m.height * 0.85
        );
        // Snow cap
        fill(220, 225, 235, 200);
        let peakX = m.posX + m.width * 0.15;
        let peakY = floorPos_y - m.height * 0.85;
        triangle(
            peakX, peakY,
            peakX - m.width * 0.08, peakY + m.height * 0.15,
            peakX + m.width * 0.06, peakY + m.height * 0.12
        );
    }
    pop();
}

function drawClouds() {
    push();
    translate(-camera.x * 0.15, 0);
    noStroke();
    for (let c of clouds) {
        c.posX += c.speed + weather.windStrength * weather.windDir * 0.3;
        if (c.posX > flagpole.posX + 600) c.posX = -150;

        fill(255, 255, 255, c.opacity);
        ellipse(c.posX, c.posY, 70 * c.size, 30 * c.size);
        ellipse(c.posX - 28 * c.size, c.posY + 5, 50 * c.size, 22 * c.size);
        ellipse(c.posX + 28 * c.size, c.posY + 3, 55 * c.size, 24 * c.size);
        ellipse(c.posX + 10 * c.size, c.posY - 8 * c.size, 40 * c.size, 20 * c.size);
    }
    pop();
}

function drawBackgroundDetails() {
    for (let d of backgroundDetails) {
        push();
        translate(d.x, floorPos_y);

        if (d.type === 'flower') {
            let sway = sin(frameCounter * 0.03 + d.swayPhase) * 3;
            // Stem
            stroke(40, 130, 40);
            strokeWeight(2);
            line(0, 0, sway, -15 * d.size);
            noStroke();
            // Petals
            fill(d.color[0], d.color[1], d.color[2]);
            for (let p = 0; p < 5; p++) {
                let a = (TWO_PI / 5) * p;
                ellipse(sway + cos(a) * 4 * d.size, -15 * d.size + sin(a) * 4 * d.size, 5 * d.size);
            }
            fill(255, 220, 50);
            ellipse(sway, -15 * d.size, 4 * d.size);
        } else if (d.type === 'grass') {
            stroke(40 + d.color[1] * 0.2, 100 + d.color[1] * 0.3, 30);
            strokeWeight(1.5);
            let sway = sin(frameCounter * 0.04 + d.swayPhase) * 2;
            line(0, 0, sway - 3, -12 * d.size);
            line(0, 0, sway, -15 * d.size);
            line(0, 0, sway + 3, -10 * d.size);
            noStroke();
        } else if (d.type === 'rock') {
            fill(100, 95, 90);
            noStroke();
            ellipse(0, -3 * d.size, 12 * d.size, 8 * d.size);
            fill(120, 115, 110);
            ellipse(-2 * d.size, -4 * d.size, 8 * d.size, 6 * d.size);
        } else if (d.type === 'mushroom') {
            // Stem
            fill(230, 220, 200);
            noStroke();
            rect(-3 * d.size, -8 * d.size, 6 * d.size, 8 * d.size, 2);
            // Cap
            fill(200, 50, 50);
            ellipse(0, -10 * d.size, 14 * d.size, 10 * d.size);
            // Dots
            fill(255);
            ellipse(-2 * d.size, -12 * d.size, 3 * d.size);
            ellipse(3 * d.size, -10 * d.size, 2 * d.size);
        }
        pop();
    }
}

function drawTrees() {
    for (let t of trees) {
        push();
        translate(t.x, floorPos_y);
        let sway = sin(frameCounter * 0.015 + t.sway) * 2 * (weather.windStrength + 0.2);

        // Trunk
        fill(90, 60, 30);
        stroke(60, 40, 20);
        strokeWeight(1);
        beginShape();
        vertex(-t.trunkWidth / 2, 0);
        vertex(-t.trunkWidth / 3 + sway, -t.height);
        vertex(t.trunkWidth / 3 + sway, -t.height);
        vertex(t.trunkWidth / 2, 0);
        endShape(CLOSE);
        noStroke();

        // Foliage layers
        let fSize = t.foliageSize;
        let r = t.foliageColor[0], g = t.foliageColor[1], b = t.foliageColor[2];
        fill(r - 10, g - 20, b - 5);
        ellipse(sway - fSize * 0.15, -t.height - fSize * 0.1, fSize * 0.8, fSize * 0.7);
        ellipse(sway + fSize * 0.15, -t.height, fSize * 0.7, fSize * 0.6);
        fill(r, g, b);
        ellipse(sway, -t.height - fSize * 0.2, fSize * 0.9, fSize * 0.85);
        // Highlight
        fill(r + 20, g + 25, b + 15, 150);
        ellipse(sway + fSize * 0.1, -t.height - fSize * 0.3, fSize * 0.4, fSize * 0.35);

        pop();
    }
}

function drawCanyons() {
    for (let canyon of canyons) {
        // Deep canyon with gradient
        for (let y = floorPos_y; y < floorPos_y + (height - floorPos_y); y++) {
            let t = (y - floorPos_y) / (height - floorPos_y);
            fill(lerpColor(color(25, 20, 40), color(10, 5, 15), t));
            noStroke();
            rect(canyon.posX, y, canyon.width, 1);
        }

        // Edge details
        stroke(35, 30, 50);
        strokeWeight(3);
        line(canyon.posX, floorPos_y, canyon.posX, height);
        line(canyon.posX + canyon.width, floorPos_y, canyon.posX + canyon.width, height);

        // Crumbling edge effect
        noStroke();
        fill(55, 50, 75);
        for (let j = 0; j < 5; j++) {
            let ex = canyon.posX + random(-5, 5);
            rect(ex, floorPos_y + j * 8, random(3, 8), random(3, 8));
            ex = canyon.posX + canyon.width + random(-5, 5);
            rect(ex, floorPos_y + j * 8, random(3, 8), random(3, 8));
        }
        noStroke();
    }
}

function drawPlatforms() {
    for (let p of platforms) {
        push();
        // Shadow
        fill(0, 0, 0, 30);
        noStroke();
        rect(p.posX + 3, p.posY + 3, p.width, p.height, 4);
        // Main platform
        fill(110, 75, 35);
        stroke(80, 55, 25);
        strokeWeight(1.5);
        rect(p.posX, p.posY, p.width, p.height, 4);
        // Top highlight
        fill(145, 105, 55);
        noStroke();
        rect(p.posX + 3, p.posY + 1, p.width - 6, 5, 3);
        // Wood grain lines
        stroke(95, 65, 30, 80);
        strokeWeight(1);
        line(p.posX + 10, p.posY + 8, p.posX + p.width - 10, p.posY + 8);
        line(p.posX + 15, p.posY + 11, p.posX + p.width - 20, p.posY + 11);
        noStroke();
        pop();
    }
}

function drawMovingPlatforms() {
    for (let mp of movingPlatforms) {
        // Update position
        mp.phase += mp.speed * 0.02;
        if (mp.moveType === 'horizontal') {
            mp.posX = mp.startX + sin(mp.phase) * mp.range;
        } else {
            mp.posY = mp.startY + sin(mp.phase) * mp.range;
        }

        push();
        // Glow effect
        fill(80, 130, 200, 40);
        noStroke();
        rect(mp.posX - 3, mp.posY - 3, mp.width + 6, mp.height + 6, 6);
        // Platform
        fill(70, 110, 170);
        stroke(50, 80, 130);
        strokeWeight(1.5);
        rect(mp.posX, mp.posY, mp.width, mp.height, 4);
        // Highlight
        fill(100, 150, 210);
        noStroke();
        rect(mp.posX + 3, mp.posY + 1, mp.width - 6, 4, 3);
        // Animated dots
        fill(150, 200, 255, 150);
        let dotPhase = frameCounter * 0.1;
        for (let d = 0; d < 3; d++) {
            let dx = mp.posX + 20 + d * 30;
            let dy = mp.posY + mp.height / 2;
            let dotSize = 3 + sin(dotPhase + d) * 1;
            ellipse(dx, dy, dotSize);
        }
        pop();
    }
}


// ═══════════════════════════════════════════════════════════
// 6. RENDERING — GAME OBJECTS
// ═══════════════════════════════════════════════════════════

function drawCollectables() {
    for (let item of collectables) {
        if (item.isFound) continue;

        item.floatPhase += 0.06;
        let floatY = sin(item.floatPhase) * 5;

        push();
        translate(item.posX, item.posY + floatY);

        // Glow
        fill(255, 215, 0, 40 + sin(item.floatPhase * 2) * 20);
        noStroke();
        ellipse(0, 0, 40 * item.size);

        // Coin body
        let squeeze = abs(sin(frameCounter * 0.04 + item.floatPhase));
        scale(squeeze, 1);
        fill(255, 215, 0);
        stroke(200, 160, 0);
        strokeWeight(2);
        ellipse(0, 0, 28 * item.size, 28 * item.size);
        fill(255, 235, 60);
        noStroke();
        ellipse(0, 0, 18 * item.size, 18 * item.size);

        // Dollar sign
        fill(200, 160, 0);
        textAlign(CENTER, CENTER);
        textSize(14 * item.size);
        text('$', 0, 0);

        pop();
    }
}

function drawPowerUps() {
    for (let pu of powerUps) {
        if (pu.isCollected) continue;

        pu.floatPhase += 0.05;
        pu.glowPhase += 0.08;
        let floatY = sin(pu.floatPhase) * 8;
        let glowSize = 50 + sin(pu.glowPhase) * 10;

        push();
        translate(pu.posX, pu.posY + floatY);

        // Outer glow
        let glowColor;
        if (pu.type === 'invincibility') glowColor = color(138, 43, 226, 50);
        else if (pu.type === 'extraLife') glowColor = color(255, 20, 147, 50);
        else if (pu.type === 'timeSlow') glowColor = color(0, 255, 200, 50);
        else glowColor = color(0, 191, 255, 50);

        fill(glowColor);
        noStroke();
        ellipse(0, 0, glowSize);

        // Rotating container
        rotate(frameCounter * 0.02);
        if (pu.type === 'invincibility') {
            fill(138, 43, 226, 220);
            stroke(100, 20, 180);
        } else if (pu.type === 'extraLife') {
            fill(255, 20, 147, 220);
            stroke(200, 10, 120);
        } else if (pu.type === 'timeSlow') {
            fill(0, 220, 180, 220);
            stroke(0, 160, 130);
        } else {
            fill(0, 191, 255, 220);
            stroke(0, 130, 200);
        }
        strokeWeight(2);

        // Diamond shape
        beginShape();
        vertex(0, -18);
        vertex(18, 0);
        vertex(0, 18);
        vertex(-18, 0);
        endShape(CLOSE);

        // Icon
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(16);
        if (pu.type === 'invincibility') text('★', 0, 0);
        else if (pu.type === 'extraLife') text('♥', 0, 0);
        else if (pu.type === 'timeSlow') text('◷', 0, 0);
        else text('+', 0, 0);

        pop();
    }
}

function drawEnemies() {
    for (let enemy of enemies) {
        if (!enemy.alive) {
            // Death animation
            if (enemy.deathTimer > 0) {
                enemy.deathTimer--;
                push();
                translate(enemy.posX, enemy.posY);
                let s = enemy.deathTimer / 20;
                scale(1 + (1 - s) * 0.5, s);
                fill(220, 20, 60, enemy.deathTimer * 12);
                noStroke();
                ellipse(0, 0, 40);
                pop();
            }
            continue;
        }

        // Movement
        enemy.posX += enemy.speed * enemy.direction;
        if (abs(enemy.posX - enemy.startX) > enemy.range) {
            enemy.direction *= -1;
        }
        enemy.spikeRotation += 0.05;

        // Occasional blink
        if (random() < 0.005) enemy.eyeBlink = 8;
        if (enemy.eyeBlink > 0) enemy.eyeBlink--;

        push();
        translate(enemy.posX, enemy.posY);

        // Shadow
        fill(0, 0, 0, 30);
        noStroke();
        ellipse(0, 18, 45, 10);

        // Body
        fill(200, 30, 60);
        stroke(140, 10, 30);
        strokeWeight(2);
        ellipse(0, 0, 38);

        // Inner highlight
        fill(230, 60, 90, 100);
        noStroke();
        ellipse(-4, -6, 15, 12);

        // Spikes
        fill(160, 10, 30);
        stroke(120, 5, 20);
        strokeWeight(1);
        for (let i = 0; i < 8; i++) {
            let angle = (TWO_PI / 8) * i + enemy.spikeRotation;
            let bx = cos(angle) * 19;
            let by = sin(angle) * 19;
            let tx = cos(angle) * 30;
            let ty = sin(angle) * 30;
            let px = cos(angle + 0.3) * 17;
            let py = sin(angle + 0.3) * 17;
            triangle(bx, by, tx, ty, px, py);
        }

        // Eyes
        noStroke();
        if (enemy.eyeBlink > 0) {
            // Blinking
            stroke(0);
            strokeWeight(2);
            line(-7, -4, -3, -4);
            line(3, -4, 7, -4);
            noStroke();
        } else {
            fill(255);
            ellipse(-5, -5, 11, 12);
            ellipse(5, -5, 11, 12);
            // Pupils track player
            let lookDir = char.x > enemy.posX ? 1 : -1;
            fill(20);
            ellipse(-5 + lookDir * 2, -5, 5, 6);
            ellipse(5 + lookDir * 2, -5, 5, 6);
            // Angry eyebrows
            stroke(80, 0, 0);
            strokeWeight(2);
            line(-9, -11, -2, -9);
            line(9, -11, 2, -9);
            noStroke();
        }

        pop();
    }
}

function drawFlagpole() {
    push();
    translate(flagpole.posX, floorPos_y);

    // Base
    fill(80, 80, 80);
    stroke(50);
    strokeWeight(1);
    ellipse(0, 0, 30, 10);

    // Pole
    stroke(200);
    strokeWeight(4);
    line(0, 0, 0, -200);

    // Gold ball on top
    fill(255, 215, 0);
    stroke(200, 165, 0);
    strokeWeight(2);
    ellipse(0, -200, 14);
    noStroke();

    // Flag
    if (flagpole.isReached) {
        flagpole.flagY = lerp(flagpole.flagY, -195, 0.08);
        fill(0, 220, 80);
    } else {
        fill(220, 30, 30);
    }

    // Waving flag
    let wave1 = sin(frameCounter * 0.08) * 5;
    let wave2 = sin(frameCounter * 0.08 + 1) * 3;
    beginShape();
    vertex(0, flagpole.flagY);
    curveVertex(0, flagpole.flagY);
    curveVertex(20 + wave1, flagpole.flagY + 5);
    curveVertex(45 + wave2, flagpole.flagY + 15);
    curveVertex(20 + wave1, flagpole.flagY + 25);
    vertex(0, flagpole.flagY + 30);
    endShape(CLOSE);

    // Flag emblem
    if (!flagpole.isReached) {
        fill(255, 255, 255, 200);
        textAlign(CENTER, CENTER);
        textSize(12);
        noStroke();
        text('★', 22 + wave1, flagpole.flagY + 15);
    }

    pop();
}


// ═══════════════════════════════════════════════════════════
// 7. RENDERING — CHARACTER
// ═══════════════════════════════════════════════════════════

function drawCharacterTrail() {
    if (char.isDashing || (abs(char.vx) > CONFIG.MOVE_SPEED * 0.8 && char.onGround)) {
        char.trailHistory.push({ x: char.x, y: char.y, alpha: 120 });
    }
    if (char.trailHistory.length > 8) char.trailHistory.shift();

    for (let i = char.trailHistory.length - 1; i >= 0; i--) {
        let t = char.trailHistory[i];
        t.alpha -= 12;
        if (t.alpha <= 0) {
            char.trailHistory.splice(i, 1);
            continue;
        }
        push();
        translate(t.x, t.y);
        scale(char.facing, 1);
        fill(100, 100, 200, t.alpha);
        noStroke();
        ellipse(0, -30, 16, 40);
        pop();
    }
}

function drawCharacter() {
    push();
    translate(char.x, char.y);

    // Invincibility aura
    if (char.invincible) {
        let pulse = sin(frameCounter * 0.15) * 0.3 + 0.7;
        if (frameCounter % 3 !== 0) {
            // Outer glow
            fill(138, 43, 226, 40 * pulse);
            noStroke();
            ellipse(0, -30, 70 * pulse, 80 * pulse);
            // Inner glow
            fill(180, 100, 255, 60 * pulse);
            ellipse(0, -30, 45 * pulse, 55 * pulse);
        }
    }

    // Dash effect
    if (char.isDashing) {
        fill(100, 150, 255, 100);
        noStroke();
        for (let i = 0; i < 3; i++) {
            ellipse(-char.dashDir * (i + 1) * 12, -30 + random(-3, 3), 10 - i * 2, 15 - i * 3);
        }
    }

    // Face direction
    scale(char.facing, 1);

    let bobY = 0;
    let isMoving = keys.left || keys.right || touchControls.left || touchControls.right;

    if (char.onGround && isMoving && !char.isDashing) {
        bobY = sin(frameCounter * 0.4) * 2;
    }

    // Wall slide visual
    if (char.wallSliding) {
        rotate(-0.15 * char.wallDir * char.facing);
    }

    // Shadow on ground
    if (!char.isPlummeting) {
        let shadowDist = abs(char.y - floorPos_y);
        let shadowScale = max(0.3, 1 - shadowDist / 200);
        fill(0, 0, 0, 25 * shadowScale);
        noStroke();
        ellipse(0, floorPos_y - char.y, 30 * shadowScale, 8 * shadowScale);
    }

    // === BODY ===
    noStroke();

    // Legs
    let legAngle = 0;
    if (char.onGround && isMoving) {
        legAngle = sin(frameCounter * 0.35) * 0.4;
    }
    if (!char.onGround) {
        legAngle = char.vy < 0 ? -0.2 : 0.15;
    }

    // Left leg
    push();
    translate(-4, -4 + bobY);
    rotate(legAngle);
    fill(60, 60, 90);
    rect(-3, 0, 6, 18, 2);
    // Boot
    fill(70, 50, 35);
    rect(-4, 15, 8, 5, 1);
    pop();

    // Right leg
    push();
    translate(4, -4 + bobY);
    rotate(-legAngle);
    fill(60, 60, 90);
    rect(-3, 0, 6, 18, 2);
    // Boot
    fill(70, 50, 35);
    rect(-4, 15, 8, 5, 1);
    pop();

    // Torso
    fill(80, 80, 140);
    stroke(60, 60, 110);
    strokeWeight(1);
    rect(-8, -35 + bobY, 16, 32, 4);

    // Belt
    fill(100, 70, 40);
    noStroke();
    rect(-8, -6 + bobY, 16, 4);
    fill(200, 180, 50);
    ellipse(0, -4 + bobY, 5, 4); // Belt buckle

    // Arms
    let armSwing = 0;
    if (char.onGround && isMoving) {
        armSwing = sin(frameCounter * 0.35) * 0.5;
    }
    if (!char.onGround) {
        armSwing = char.vy < 0 ? -0.6 : 0.3;
    }

    // Left arm
    push();
    translate(-9, -28 + bobY);
    rotate(-armSwing);
    fill(80, 80, 140);
    stroke(60, 60, 110);
    strokeWeight(1);
    rect(-3, 0, 6, 18, 3);
    // Hand
    fill(220, 180, 150);
    noStroke();
    ellipse(0, 18, 6, 6);
    pop();

    // Right arm
    push();
    translate(9, -28 + bobY);
    rotate(armSwing);
    fill(80, 80, 140);
    stroke(60, 60, 110);
    strokeWeight(1);
    rect(-3, 0, 6, 18, 3);
    // Hand
    fill(220, 180, 150);
    noStroke();
    ellipse(0, 18, 6, 6);
    pop();

    // Head
    fill(220, 185, 155);
    stroke(180, 150, 125);
    strokeWeight(1);
    ellipse(0, -42 + bobY, 20, 22);

    // Hair
    fill(60, 40, 25);
    noStroke();
    arc(0, -46 + bobY, 22, 16, PI, TWO_PI);
    ellipse(3, -52 + bobY, 8, 6); // Tuft

    // Eyes
    noStroke();
    fill(255);
    ellipse(3, -43 + bobY, 7, 8);
    fill(40, 60, 100);
    let eyeLookX = 0;
    if (isMoving || !char.onGround) eyeLookX = 1;
    ellipse(3 + eyeLookX, -43 + bobY, 4, 5);
    fill(255);
    ellipse(3.5 + eyeLookX, -44 + bobY, 1.5, 1.5); // Eye highlight

    // Mouth
    stroke(150, 100, 80);
    strokeWeight(1.5);
    noFill();
    if (char.isDashing) {
        // Excited
        arc(3, -37 + bobY, 6, 5, 0, PI);
    } else if (!char.onGround && char.vy < 0) {
        // Jumping — open mouth
        fill(100, 50, 50);
        ellipse(3, -37 + bobY, 4, 5);
    } else {
        // Normal smile
        arc(3, -38 + bobY, 5, 3, 0, PI);
    }
    noStroke();

    pop();
}


// ═══════════════════════════════════════════════════════════
// 8. RENDERING — UI & SCREENS
// ═══════════════════════════════════════════════════════════

function drawUI() {
    push();

    // HUD panel
    fill(0, 0, 0, 160);
    noStroke();
    rect(10, 10, 210, 85, 10);

    // Score with coin icon
    fill(255, 215, 0);
    ellipse(28, 30, 14);
    fill(200, 160, 0);
    textAlign(CENTER, CENTER);
    textSize(9);
    text('$', 28, 30);

    fill(255);
    textAlign(LEFT, CENTER);
    textSize(18);
    text(gameScore, 42, 30);

    // Level
    fill(180, 200, 255);
    textSize(14);
    text('Level ' + currentLevel + ' / ' + CONFIG.MAX_LEVEL, 20, 52);

    // Lives as hearts
    for (let i = 0; i < lives; i++) {
        fill(255, 50, 80);
        textSize(16);
        text('♥', 20 + i * 22, 75);
    }
    for (let i = lives; i < CONFIG.MAX_LIVES; i++) {
        fill(80, 80, 80);
        textSize(16);
        text('♥', 20 + i * 22, 75);
    }

    // Invincibility bar
    if (char.invincible && char.invincibleTimer > 0) {
        let barW = 150;
        let fillW = barW * (char.invincibleTimer / CONFIG.INVINCIBLE_DURATION);
        fill(0, 0, 0, 120);
        rect(width / 2 - barW / 2, 10, barW, 12, 6);
        fill(160, 80, 255);
        rect(width / 2 - barW / 2, 10, fillW, 12, 6);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(10);
        text('INVINCIBLE', width / 2, 16);
    }

    // Dash cooldown indicator
    if (char.dashCooldown > 0) {
        fill(0, 0, 0, 100);
        rect(width - 55, 10, 45, 16, 8);
        fill(100, 150, 255, 150);
        textAlign(CENTER, CENTER);
        textSize(10);
        text('DASH', width - 32, 18);
    } else {
        fill(0, 0, 0, 100);
        rect(width - 55, 10, 45, 16, 8);
        fill(100, 200, 255);
        textAlign(CENTER, CENTER);
        textSize(10);
        text('DASH', width - 32, 18);
    }

    // High score
    if (highScore > 0) {
        fill(255, 215, 0, 150);
        textAlign(RIGHT, CENTER);
        textSize(12);
        text('Best: ' + highScore, width - 15, 36);
    }

    // Weather indicator
    let weatherIcon = '';
    if (weather.type === 'rain') weatherIcon = '🌧';
    else if (weather.type === 'snow') weatherIcon = '❄';
    else if (weather.type === 'wind') weatherIcon = '💨';
    else if (weather.type === 'storm') weatherIcon = '⛈';
    if (weatherIcon) {
        fill(255, 255, 255, 150);
        textAlign(RIGHT, CENTER);
        textSize(14);
        text(weatherIcon, width - 15, 55);
    }

    pop();
}

function drawComboText() {
    if (combo.textTimer > 0) {
        combo.textTimer--;
        let alpha = min(255, combo.textTimer * 8);
        let rise = (30 - combo.textTimer) * 1.5;

        push();
        textAlign(CENTER, CENTER);
        textSize(20 + combo.count * 2);
        fill(255, 215, 0, alpha);
        stroke(0, 0, 0, alpha * 0.5);
        strokeWeight(3);
        text(combo.lastText, combo.textX - camera.x, combo.textY - rise - camera.y + floorPos_y - height * 3 / 4);
        pop();
    }
}

function drawMenu() {
    push();

    // Animated background particles
    for (let i = 0; i < 20; i++) {
        let px = (frameCounter * 0.5 + i * 80) % (width + 100) - 50;
        let py = height / 2 + sin(frameCounter * 0.02 + i) * 150;
        fill(255, 215, 0, 20 + sin(frameCounter * 0.05 + i) * 15);
        noStroke();
        ellipse(px, py, 4 + sin(i) * 2);
    }

    // Title with shadow
    textAlign(CENTER, CENTER);

    // Shadow
    fill(0, 0, 0, 100);
    textSize(58);
    text('PLATFORM', width / 2 + 3, height / 4 + 3);
    textSize(44);
    text('ADVENTURE', width / 2 + 3, height / 4 + 55 + 3);

    // Main title
    fill(255, 215, 0);
    textSize(58);
    text('PLATFORM', width / 2, height / 4);

    // Subtitle with gradient effect
    let subtitlePulse = sin(frameCounter * 0.04) * 20 + 235;
    fill(subtitlePulse, subtitlePulse * 0.85, 50);
    textSize(44);
    text('ADVENTURE', width / 2, height / 4 + 55);

    // Version tag
    fill(150, 150, 180);
    textSize(12);
    text('Enhanced Edition', width / 2, height / 4 + 85);

    // Instructions
    fill(255);
    textSize(22);
    let blink = sin(frameCounter * 0.06) * 0.3 + 0.7;
    fill(255, 255, 255, 255 * blink);
    text(isMobile ? 'TAP TO START' : 'PRESS SPACE TO START', width / 2, height / 2 + 60);

    fill(200, 200, 220);
    textSize(15);
    if (isMobile) {
        text('Use on-screen controls to move & jump', width / 2, height / 2 + 100);
    } else {
        text('A / D — Move    W — Jump    SHIFT — Dash    P — Pause', width / 2, height / 2 + 100);
    }

    // Features
    fill(150, 180, 220);
    textSize(13);
    text('5 Levels • Weather Effects • Dash & Wall-Jump • Combos', width / 2, height / 2 + 130);

    // High score
    if (highScore > 0) {
        fill(255, 215, 0);
        textSize(18);
        text('High Score: ' + highScore, width / 2, height - 50);
    }

    // Animated character
    push();
    translate(width / 2, height / 2 - 15);
    scale(1.8);
    let menuBob = sin(frameCounter * 0.06) * 3;

    // Simple standing character preview
    noStroke();
    // Legs
    fill(60, 60, 90);
    rect(-4, 0, 6, 14, 2);
    rect(2, 0, 6, 14, 2);
    // Boots
    fill(70, 50, 35);
    rect(-5, 12, 7, 4, 1);
    rect(2, 12, 7, 4, 1);
    // Body
    fill(80, 80, 140);
    stroke(60, 60, 110);
    strokeWeight(0.5);
    rect(-7, -25 + menuBob, 14, 26, 3);
    noStroke();
    // Belt
    fill(100, 70, 40);
    rect(-7, -2 + menuBob, 14, 3);
    // Head
    fill(220, 185, 155);
    ellipse(0, -32 + menuBob, 16, 18);
    // Hair
    fill(60, 40, 25);
    arc(0, -36 + menuBob, 18, 12, PI, TWO_PI);
    // Eyes
    fill(255);
    ellipse(2, -33 + menuBob, 5, 6);
    fill(40, 60, 100);
    ellipse(2.5, -33 + menuBob, 3, 4);
    fill(255);
    ellipse(3, -34 + menuBob, 1.2, 1.2);
    // Smile
    stroke(150, 100, 80);
    strokeWeight(1);
    noFill();
    arc(2, -28 + menuBob, 4, 3, 0, PI);
    noStroke();
    pop();

    pop();
}

function drawPausedScreen() {
    // Render game behind pause overlay
    drawGameWorld();

    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    // Pause box
    fill(30, 30, 60, 220);
    stroke(100, 100, 200);
    strokeWeight(2);
    rect(width / 2 - 150, height / 2 - 80, 300, 160, 15);
    noStroke();

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(42);
    text('PAUSED', width / 2, height / 2 - 30);

    fill(200, 200, 230);
    textSize(18);
    text('Press P to resume', width / 2, height / 2 + 30);

    fill(150, 150, 180);
    textSize(14);
    text('Score: ' + gameScore + '  •  Level: ' + currentLevel, width / 2, height / 2 + 60);
}

function drawGameWorld() {
    noStroke();
    drawGround();
    push();
    translate(-camera.x, -camera.y + floorPos_y - height * 3 / 4);
    drawMountains();
    drawClouds();
    drawTrees();
    drawCanyons();
    drawPlatforms();
    drawCollectables();
    drawPowerUps();
    drawEnemies();
    drawFlagpole();
    drawCharacter();
    pop();
}

function drawGameOverScreen() {
    // Red-tinted background
    background(30, 10, 15);

    // Falling particles effect
    for (let i = 0; i < 15; i++) {
        let px = (i * 73 + frameCounter * 0.3) % width;
        let py = (frameCounter * (1 + i * 0.1) + i * 40) % height;
        fill(200, 30, 30, 40);
        noStroke();
        ellipse(px, py, 3 + i % 3);
    }

    textAlign(CENTER, CENTER);

    // Game Over text with pulsing
    let pulse = sin(frameCounter * 0.05) * 5;
    fill(255, 40, 40);
    textSize(58 + pulse);
    text('GAME OVER', width / 2, height / 4);

    // Stats box
    fill(0, 0, 0, 100);
    noStroke();
    rect(width / 2 - 140, height / 2 - 50, 280, 120, 12);

    fill(255);
    textSize(26);
    text('Score: ' + gameScore, width / 2, height / 2 - 15);

    fill(200, 200, 230);
    textSize(20);
    text('Level Reached: ' + currentLevel + ' / ' + CONFIG.MAX_LEVEL, width / 2, height / 2 + 20);

    if (gameScore >= highScore && gameScore > 0) {
        fill(255, 215, 0);
        textSize(22);
        text('NEW HIGH SCORE!', width / 2, height / 2 + 55);
    }

    // Restart prompt
    let blink = sin(frameCounter * 0.06) * 0.3 + 0.7;
    fill(255, 255, 255, 255 * blink);
    textSize(20);
    text(isMobile ? 'TAP TO RETRY' : 'PRESS SPACE TO RETRY', width / 2, height / 2 + 120);
}

function drawLevelCompleteScreen() {
    // Green-tinted background
    background(10, 30, 15);

    // Celebration particles
    for (let i = 0; i < 25; i++) {
        let px = (i * 43 + frameCounter * 0.8) % (width + 100) - 50;
        let py = (frameCounter * (0.5 + i * 0.08) + i * 30) % (height + 50) - 25;
        let hueShift = (i * 50 + frameCounter) % 360;
        colorMode(HSB, 360, 100, 100, 100);
        fill(hueShift, 80, 90, 40);
        noStroke();
        let sparkSize = 3 + sin(frameCounter * 0.1 + i) * 2;
        ellipse(px, py, sparkSize);
    }
    colorMode(RGB, 255);

    textAlign(CENTER, CENTER);

    if (currentLevel < CONFIG.MAX_LEVEL) {
        fill(50, 255, 100);
        textSize(52);
        text('LEVEL COMPLETE!', width / 2, height / 4);

        fill(255);
        textSize(28);
        text('Score: ' + gameScore, width / 2, height / 2 - 10);

        // Time bonus display
        let timeTaken = floor((frameCounter - levelStartTime) / 60);
        fill(200, 200, 230);
        textSize(18);
        text('Time: ' + timeTaken + 's', width / 2, height / 2 + 25);

        let blink = sin(frameCounter * 0.06) * 0.3 + 0.7;
        fill(255, 255, 255, 255 * blink);
        textSize(22);
        text('PRESS SPACE FOR LEVEL ' + (currentLevel + 1), width / 2, height / 2 + 90);
    } else {
        // Game won!
        fill(255, 215, 0);
        textSize(56);
        text('YOU WIN!', width / 2, height / 4);

        fill(255);
        textSize(24);
        text('All ' + CONFIG.MAX_LEVEL + ' levels completed!', width / 2, height / 2 - 20);

        textSize(30);
        text('Final Score: ' + gameScore, width / 2, height / 2 + 20);

        if (gameScore >= highScore && gameScore > 0) {
            fill(255, 215, 0);
            textSize(20);
            text('NEW HIGH SCORE!', width / 2, height / 2 + 55);
        }

        let blink = sin(frameCounter * 0.06) * 0.3 + 0.7;
        fill(255, 255, 255, 255 * blink);
        textSize(20);
        text(isMobile ? 'TAP TO PLAY AGAIN' : 'PRESS SPACE TO PLAY AGAIN', width / 2, height / 2 + 110);
    }
}


function drawLoginScreen() {
    push();
    background(15, 15, 40);

    // Floating background particles
    for (let i = 0; i < 30; i++) {
        let px = (frameCounter * 0.3 + i * 60) % (width + 80) - 40;
        let py = height / 2 + sin(frameCounter * 0.015 + i * 0.8) * 200;
        fill(255, 215, 0, 15 + sin(frameCounter * 0.04 + i) * 10);
        noStroke();
        ellipse(px, py, 3 + sin(i) * 1.5);
    }

    textAlign(CENTER, CENTER);

    // Title
    fill(255, 215, 0);
    textSize(48);
    text('PLATFORM', width / 2, height / 5);
    textSize(36);
    text('ADVENTURE', width / 2, height / 5 + 48);

    // Welcome prompt
    fill(220, 220, 240);
    textSize(20);
    text('Enter your name to begin', width / 2, height / 2 - 40);

    // The HTML input is positioned over the canvas (handled in setup)

    // Submit hint
    fill(180, 180, 200);
    textSize(15);
    let blink = sin(frameCounter * 0.06) * 0.3 + 0.7;
    fill(255, 255, 255, 200 * blink);
    text('Press ENTER to continue', width / 2, height / 2 + 70);

    // Character avatar
    push();
    translate(width / 2, height / 2 + 150);
    scale(1.5);
    noStroke();
    fill(60, 60, 90);
    rect(-4, 0, 6, 12, 2);
    rect(2, 0, 6, 12, 2);
    fill(80, 80, 140);
    rect(-6, -22, 12, 23, 3);
    fill(220, 185, 155);
    ellipse(0, -28, 14, 16);
    fill(60, 40, 25);
    arc(0, -32, 16, 10, PI, TWO_PI);
    fill(255);
    ellipse(2, -29, 4, 5);
    fill(40, 60, 100);
    ellipse(2.5, -29, 2, 3);
    pop();

    pop();
}

function drawLeaderboardScreen() {
    push();
    background(15, 15, 40);

    textAlign(CENTER, CENTER);

    // Title
    fill(255, 215, 0);
    textSize(40);
    text('LEADERBOARD', width / 2, 50);

    // Trophy icon
    textSize(30);
    text('🏆', width / 2, 90);

    // Table header
    let tableX = width / 2;
    let startY = 130;
    let rowH = 32;

    fill(100, 100, 150);
    textSize(13);
    text('RANK', tableX - 160, startY);
    text('PLAYER', tableX - 60, startY);
    text('SCORE', tableX + 50, startY);
    text('LEVEL', tableX + 130, startY);

    // Divider
    stroke(100, 100, 150, 80);
    strokeWeight(1);
    line(tableX - 200, startY + 14, tableX + 200, startY + 14);
    noStroke();

    // Rows
    if (leaderboard.length === 0) {
        fill(150, 150, 170);
        textSize(16);
        text('No scores yet. Be the first!', width / 2, startY + 60);
    } else {
        for (let i = 0; i < min(leaderboard.length, MAX_LEADERBOARD); i++) {
            let entry = leaderboard[i];
            let y = startY + 20 + (i + 1) * rowH;

            // Highlight current player
            let isMe = entry.name === playerName;
            if (isMe) {
                fill(255, 215, 0, 20);
                noStroke();
                rect(tableX - 200, y - 12, 400, rowH - 2, 6);
            }

            textSize(15);

            // Rank with medal
            if (i === 0) fill(255, 215, 0);
            else if (i === 1) fill(192, 192, 200);
            else if (i === 2) fill(205, 127, 50);
            else fill(200, 200, 220);

            let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1);
            text(medal, tableX - 160, y);

            // Name
            fill(isMe ? color(255, 215, 0) : color(230, 230, 245));
            text(entry.name, tableX - 60, y);

            // Score
            fill(200, 220, 255);
            text(entry.score, tableX + 50, y);

            // Level
            fill(180, 200, 180);
            text(entry.level + '/' + CONFIG.MAX_LEVEL, tableX + 130, y);
        }
    }

    // Navigation
    let blink = sin(frameCounter * 0.06) * 0.3 + 0.7;
    fill(255, 255, 255, 200 * blink);
    textSize(16);
    text(isMobile ? 'TAP to go back' : 'Press SPACE or ESC to go back', width / 2, height - 40);

    // Current player tag
    fill(150, 150, 180);
    textSize(12);
    text('Playing as: ' + playerName, width / 2, height - 65);

    pop();
}

// ═══════════════════════════════════════════════════════════
// 9. PHYSICS & MOVEMENT
// ═══════════════════════════════════════════════════════════

function updatePhysics() {
    if (char.isPlummeting) {
        char.vy += CONFIG.GRAVITY * 1.8;
        char.y += char.vy;
        if (char.y > height + 150) {
            loseLife();
        }
        return;
    }

    // --- Horizontal movement ---
    let moveInput = 0;
    if (keys.left || touchControls.left) moveInput = -1;
    if (keys.right || touchControls.right) moveInput = 1;

    if (char.isDashing) {
        char.vx = CONFIG.DASH_SPEED * char.dashDir;
    } else if (char.wallSliding) {
        // Reduced horizontal control on wall
        char.vx = moveInput * CONFIG.MOVE_SPEED * 0.3;
    } else {
        char.vx = moveInput * CONFIG.MOVE_SPEED;
    }

    // Wind effect
    if (weather.windStrength > 0 && !char.onGround) {
        char.vx += weather.windStrength * weather.windDir;
    }

    if (moveInput !== 0 && !char.isDashing) {
        char.facing = moveInput;
    }

    char.x += char.vx;

    // Keep character in bounds
    char.x = max(20, char.x);

    // --- Vertical movement ---
    let wasOnGround = char.onGround;
    char.onGround = false;
    char.onPlatform = false;
    char.wallSliding = false;
    char.canWallJump = false;

    // Apply gravity
    char.vy += CONFIG.GRAVITY;
    char.vy = min(char.vy, CONFIG.MAX_FALL_SPEED);

    // Wall sliding detection (check platforms for wall contact)
    if (!char.onGround && char.vy > 0 && moveInput !== 0) {
        for (let p of platforms) {
            let nearLeft = abs(char.x - p.posX) < 8 && char.y > p.posY && char.y < p.posY + p.height + 40;
            let nearRight = abs(char.x - (p.posX + p.width)) < 8 && char.y > p.posY && char.y < p.posY + p.height + 40;
            if (nearLeft || nearRight) {
                char.wallSliding = true;
                char.wallDir = nearLeft ? -1 : 1;
                char.vy = min(char.vy, CONFIG.WALL_SLIDE_SPEED);
                char.canWallJump = true;
                break;
            }
        }
    }

    char.y += char.vy;

    // Floor collision
    if (char.y >= floorPos_y) {
        char.y = floorPos_y;
        char.vy = 0;
        char.onGround = true;
    }

    // Static platform collision
    for (let p of platforms) {
        if (char.x > p.posX && char.x < p.posX + p.width) {
            // Landing on top
            if (char.vy >= 0 && char.y >= p.posY && char.y <= p.posY + p.height + 8) {
                char.y = p.posY;
                char.vy = 0;
                char.onGround = true;
                char.onPlatform = true;
            }
        }
    }

    // Moving platform collision
    for (let mp of movingPlatforms) {
        if (char.x > mp.posX && char.x < mp.posX + mp.width) {
            if (char.vy >= 0 && char.y >= mp.posY && char.y <= mp.posY + mp.height + 8) {
                char.y = mp.posY;
                char.vy = 0;
                char.onGround = true;
                char.onPlatform = true;
                // Move with platform
                if (mp.moveType === 'horizontal') {
                    char.x += sin(mp.phase) * mp.range * mp.speed * 0.02;
                }
            }
        }
    }

    // --- Jump buffering ---
    if (jumpBuffered) {
        jumpBufferTimer--;
        if (jumpBufferTimer <= 0) jumpBuffered = false;
        if (char.onGround) {
            performJump();
            jumpBuffered = false;
        }
    }

    // Landing effects
    if (char.onGround && !wasOnGround && char.vy >= 0) {
        // Dust particles on landing
        createParticles(char.x, char.y, 150, 140, 130, 5, 'dust');
    }
}

function performJump() {
    if (char.canWallJump && char.wallSliding) {
        // Wall jump
        char.vy = CONFIG.WALL_JUMP_FORCE_Y;
        char.vx = CONFIG.WALL_JUMP_FORCE_X * (-char.wallDir);
        char.facing = -char.wallDir;
        char.wallSliding = false;
        char.onGround = false;
        createParticles(char.x + char.wallDir * 10, char.y - 20, 180, 180, 200, 6, 'spark');
    } else if (char.onGround) {
        char.vy = CONFIG.JUMP_FORCE;
        char.onGround = false;
    } else {
        return;
    }
    if (jumpSound) jumpSound.play();
}

function updateCamera() {
    let lookAhead = char.facing * CONFIG.CAMERA_LOOK_AHEAD;
    camera.targetX = char.x - width / 3 + lookAhead;
    camera.targetY = 0;

    // Vertical camera for platforms
    if (char.y < floorPos_y - 50) {
        camera.targetY = (char.y - (floorPos_y - 50)) * 0.5;
    }

    camera.x = lerp(camera.x, camera.targetX, CONFIG.CAMERA_LERP);
    camera.y = lerp(camera.y, camera.targetY, CONFIG.CAMERA_VERTICAL_LERP);

    camera.x = constrain(camera.x, 0, flagpole.posX - width + 200);
}

function updateDash() {
    if (char.dashCooldown > 0) char.dashCooldown--;

    if (char.isDashing) {
        char.dashTimer--;
        if (char.dashTimer <= 0) {
            char.isDashing = false;
            char.vx = char.dashDir * CONFIG.MOVE_SPEED;
        }
    }
}

function startDash() {
    if (char.dashCooldown > 0 || char.isDashing || char.isPlummeting) return;
    char.isDashing = true;
    char.dashTimer = CONFIG.DASH_DURATION;
    char.dashCooldown = CONFIG.DASH_COOLDOWN;
    char.dashDir = char.facing;
    char.vy = 0; // Cancel vertical momentum during dash
    camera.shake = 3;
    createParticles(char.x, char.y - 20, 100, 150, 255, 8, 'spark');
}


// ═══════════════════════════════════════════════════════════
// 10. COLLISION DETECTION
// ═══════════════════════════════════════════════════════════

function checkCollisions() {
    // --- Canyon collision ---
    for (let canyon of canyons) {
        if (char.x > canyon.posX + 10 &&
            char.x < canyon.posX + canyon.width - 10 &&
            char.y >= floorPos_y && !char.onPlatform) {
            char.isPlummeting = true;
            char.vy = 2;
        }
    }

    // --- Collectable collision ---
    for (let item of collectables) {
        if (item.isFound) continue;
        let d = dist(char.x, char.y - 20, item.posX, item.posY);
        if (d < 28) {
            item.isFound = true;
            addScore(CONFIG.COIN_SCORE, item.posX, item.posY);
            if (collectSound) collectSound.play();
            createParticles(item.posX, item.posY, 255, 215, 0, 12, 'burst');
        }
    }

    // --- Enemy collision ---
    for (let enemy of enemies) {
        if (!enemy.alive) continue;
        let d = dist(char.x, char.y - 15, enemy.posX, enemy.posY);
        if (d < 32) {
            // Check if stomping from above
            if (char.vy > 0 && char.y - 15 < enemy.posY - 8) {
                // Stomp the enemy!
                enemy.alive = false;
                enemy.deathTimer = 20;
                char.vy = CONFIG.JUMP_FORCE * 0.7; // Bounce up
                addScore(CONFIG.ENEMY_STOMP_SCORE, enemy.posX, enemy.posY);
                camera.shake = 4;
                createParticles(enemy.posX, enemy.posY, 255, 60, 60, 15, 'burst');
                if (collectSound) collectSound.play();
            } else if (!char.invincible) {
                // Hit by enemy
                loseLife();
                createParticles(char.x, char.y - 20, 255, 0, 0, 18, 'burst');
                camera.shake = 8;
                break;
            } else {
                // Invincible — destroy enemy
                enemy.alive = false;
                enemy.deathTimer = 20;
                addScore(CONFIG.ENEMY_STOMP_SCORE, enemy.posX, enemy.posY);
                createParticles(enemy.posX, enemy.posY, 180, 60, 255, 15, 'burst');
            }
        }
    }

    // --- Power-up collision ---
    for (let pu of powerUps) {
        if (pu.isCollected) continue;
        let d = dist(char.x, char.y - 20, pu.posX, pu.posY);
        if (d < 35) {
            pu.isCollected = true;
            if (collectSound) collectSound.play();
            applyPowerUp(pu.type);
            createParticles(pu.posX, pu.posY, 138, 43, 226, 18, 'burst');
        }
    }

    // --- Flagpole collision ---
    let flagDist = dist(char.x, char.y, flagpole.posX, floorPos_y);
    if (flagDist < 40 && !flagpole.isReached) {
        flagpole.isReached = true;
        if (levelCompleteSound) levelCompleteSound.play();
        gameScore += CONFIG.FLAGPOLE_SCORE;
        camera.shake = 5;
        createParticles(flagpole.posX, floorPos_y - 100, 255, 215, 0, 25, 'burst');
        createParticles(flagpole.posX, floorPos_y - 50, 0, 255, 100, 20, 'burst');
        setTimeout(() => {
            gameState = 'levelComplete';
        }, 1200);
    }
}

function applyPowerUp(type) {
    if (type === 'invincibility') {
        char.invincible = true;
        char.invincibleTimer = CONFIG.INVINCIBLE_DURATION;
        showComboText('INVINCIBLE!', char.x, char.y - 50);
    } else if (type === 'extraLife') {
        lives = min(lives + 1, CONFIG.MAX_LIVES);
        showComboText('+1 LIFE', char.x, char.y - 50);
    } else if (type === 'scoreBoost') {
        gameScore += CONFIG.POWERUP_SCORE_BOOST;
        showComboText('+50 POINTS', char.x, char.y - 50);
    } else if (type === 'timeSlow') {
        // Visual flair — doesn't actually slow time but gives bonus
        gameScore += 30;
        char.invincible = true;
        char.invincibleTimer = 120;
        showComboText('TIME WARP!', char.x, char.y - 50);
    }
}


// ═══════════════════════════════════════════════════════════
// 11. GAME LOGIC & STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════

function loseLife() {
    if (char.invincible) return;

    lives--;
    if (gameOverSound) gameOverSound.play();
    camera.shake = 10;

    if (lives > 0) {
        // Respawn
        char.x = 200;
        char.y = floorPos_y;
        char.vx = 0;
        char.vy = 0;
        char.isPlummeting = false;
        char.wallSliding = false;
        char.isDashing = false;
        camera.x = 0;
        camera.y = 0;
        char.invincible = true;
        char.invincibleTimer = CONFIG.RESPAWN_INVINCIBLE_DURATION;
    } else {
        gameState = 'gameOver';
        updateHighScore();
        saveToLeaderboard();
    }
}

function updateHighScore() {
    if (gameScore > highScore) {
        highScore = gameScore;
        localStorage.setItem('platformAdventureHighScore', highScore.toString());
    }
}

function addScore(points, x, y) {
    // Combo system
    combo.count++;
    combo.timer = CONFIG.COMBO_WINDOW;

    let multiplier = 1 + (combo.count - 1) * CONFIG.COMBO_MULTIPLIER;
    let finalPoints = floor(points * multiplier);
    gameScore += finalPoints;

    if (combo.count > 1) {
        showComboText('+' + finalPoints + ' x' + combo.count, x, y);
    } else {
        showComboText('+' + finalPoints, x, y);
    }
}

function showComboText(text, x, y) {
    combo.lastText = text;
    combo.textTimer = 30;
    combo.textX = x;
    combo.textY = y;
}

function updateCombo() {
    if (combo.timer > 0) {
        combo.timer--;
        if (combo.timer <= 0) {
            combo.count = 0;
        }
    }
}

function updateInvincibility() {
    if (char.invincible) {
        char.invincibleTimer--;
        if (char.invincibleTimer <= 0) {
            char.invincible = false;
        }
    }
}

function startGame() {
    gameState = 'playing';
    lives = CONFIG.STARTING_LIVES;
    gameScore = 0;
    currentLevel = 1;
    initializeLevel(currentLevel);
}

function advanceLevel() {
    if (currentLevel < CONFIG.MAX_LEVEL) {
        currentLevel++;
        initializeLevel(currentLevel);
        gameState = 'playing';
    } else {
        updateHighScore();
        saveToLeaderboard();
        currentLevel = 1;
        gameState = 'menu';
    }
}

// --- Login / Player name ---
function submitLogin() {
    let name = nameInput.value().trim();
    if (name.length === 0) return;
    // Sanitize: alphanumeric, spaces, underscores, hyphens only
    name = name.replace(/[^a-zA-Z0-9 _-]/g, '').substring(0, 12);
    if (name.length === 0) return;

    playerName = name;
    localStorage.setItem(STORAGE_KEY_NAME, playerName);
    nameInput.hide();
    gameState = 'menu';
}

// --- Leaderboard persistence ---
function loadLeaderboard() {
    let data = localStorage.getItem(STORAGE_KEY_LB);
    if (data) {
        try {
            leaderboard = JSON.parse(data);
        } catch (e) {
            leaderboard = [];
        }
    }
}

function saveLeaderboard() {
    localStorage.setItem(STORAGE_KEY_LB, JSON.stringify(leaderboard));
}

function saveToLeaderboard() {
    if (!playerName || gameScore <= 0) return;

    leaderboard.push({
        name: playerName,
        score: gameScore,
        level: currentLevel,
        date: new Date().toISOString().split('T')[0],
    });

    // Sort by score descending
    leaderboard.sort((a, b) => b.score - a.score);

    // Keep only top entries
    if (leaderboard.length > MAX_LEADERBOARD) {
        leaderboard = leaderboard.slice(0, MAX_LEADERBOARD);
    }

    saveLeaderboard();
}


// ═══════════════════════════════════════════════════════════
// 12. VISUAL EFFECTS
// ═══════════════════════════════════════════════════════════

function createParticles(x, y, r, g, b, count, style) {
    if (particles.length > CONFIG.MAX_PARTICLES) return;
    for (let i = 0; i < count; i++) {
        let p = {
            x: x, y: y,
            vx: random(-3, 3),
            vy: random(-6, -1),
            size: random(2, 7),
            r: r + random(-20, 20),
            g: g + random(-20, 20),
            b: b + random(-20, 20),
            life: random(20, 40),
            maxLife: 40,
            style: style || 'burst',
        };
        if (style === 'dust') {
            p.vy = random(-2, -0.5);
            p.vx = random(-1.5, 1.5);
            p.size = random(2, 5);
            p.life = random(10, 20);
            p.maxLife = 20;
        } else if (style === 'spark') {
            p.vy = random(-4, -1);
            p.vx = random(-5, 5);
            p.size = random(1, 4);
            p.life = random(10, 25);
            p.maxLife = 25;
        }
        particles.push(p);
    }
}

function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.vx *= 0.98;
        p.life--;

        let alpha = map(p.life, 0, p.maxLife, 0, 255);
        noStroke();

        if (p.style === 'spark') {
            // Sparkle shape
            fill(p.r, p.g, p.b, alpha);
            push();
            translate(p.x, p.y);
            rotate(frameCounter * 0.2 + i);
            rect(-p.size / 2, -1, p.size, 2);
            rect(-1, -p.size / 2, 2, p.size);
            pop();
        } else {
            fill(p.r, p.g, p.b, alpha);
            ellipse(p.x, p.y, p.size * (p.life / p.maxLife));
        }

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawWeather() {
    if (weather.type === 'rain' || weather.type === 'storm') {
        stroke(180, 200, 255, 80);
        strokeWeight(1.5);
        for (let drop of weather.raindrops) {
            let windOffset = weather.windStrength * weather.windDir * 5;
            line(drop.x + camera.x * 0.1, drop.y, drop.x + windOffset + camera.x * 0.1, drop.y + drop.length);
            drop.y += drop.speed;
            drop.x += weather.windDir * weather.windStrength * 2;
            if (drop.y > height + 20) {
                drop.y = random(-50, -10);
                drop.x = random(-200, width + 200);
            }
        }
        noStroke();

        // Lightning flash for storms
        if (weather.type === 'storm' && random() < 0.003) {
            camera.shake = 3;
            // Will flash on next frame via background brightness
        }
    }

    if (weather.type === 'snow') {
        noStroke();
        for (let flake of weather.snowflakes) {
            flake.wobble += 0.02;
            fill(255, 255, 255, 180);
            ellipse(
                flake.x + sin(flake.wobble) * 15 + camera.x * 0.05,
                flake.y,
                flake.size
            );
            flake.y += flake.speed;
            flake.x += weather.windDir * 0.3;
            if (flake.y > height + 20) {
                flake.y = random(-30, -5);
                flake.x = random(-100, width + 100);
            }
        }
    }
}

function updateWeather() {
    // Wind direction can shift slowly
    if (weather.type === 'wind' || weather.type === 'storm') {
        weather.windDir = sin(frameCounter * 0.005) > 0 ? 1 : -1;
    }
}


// ═══════════════════════════════════════════════════════════
// 13. INPUT HANDLING
// ═══════════════════════════════════════════════════════════

function keyPressed() {
    // --- Login screen ---
    if (gameState === 'login') {
        if (keyCode === ENTER) {
            submitLogin();
        }
        return; // Don't process other keys during login (HTML input handles them)
    }

    // --- Leaderboard screen ---
    if (gameState === 'leaderboard') {
        if (key === ' ' || keyCode === 32 || keyCode === ESCAPE) {
            gameState = 'menu';
        }
        return;
    }

    // --- Menu / Screen state transitions ---
    if (key === ' ' || keyCode === 32) {
        if (gameState === 'menu') {
            startGame();
            return;
        } else if (gameState === 'gameOver') {
            gameState = 'menu';
            return;
        } else if (gameState === 'levelComplete') {
            advanceLevel();
            return;
        }
    }

    // Menu-only shortcuts
    if (gameState === 'menu') {
        if (key === 'l' || key === 'L') {
            gameState = 'leaderboard';
            return;
        }
        if (key === 'n' || key === 'N') {
            // Change name
            gameState = 'login';
            nameInput.value(playerName);
            nameInput.show();
            repositionNameInput();
            nameInput.elt.focus();
            return;
        }
    }

    if (gameState !== 'playing') {
        if ((key === 'p' || key === 'P') && gameState === 'paused') {
            gameState = 'playing';
        }
        return;
    }

    // --- Playing state inputs ---
    if (key === 'a' || key === 'A' || keyCode === LEFT_ARROW) {
        keys.left = true;
    }
    if (key === 'd' || key === 'D' || keyCode === RIGHT_ARROW) {
        keys.right = true;
    }
    if (key === 'w' || key === 'W' || keyCode === UP_ARROW) {
        keys.jump = true;
        if (char.onGround || char.canWallJump) {
            performJump();
        } else {
            // Buffer the jump
            jumpBuffered = true;
            jumpBufferTimer = JUMP_BUFFER_FRAMES;
        }
    }
    if (keyCode === SHIFT) {
        startDash();
    }
    if (key === 'p' || key === 'P') {
        gameState = 'paused';
    }
}

function keyReleased() {
    if (key === 'a' || key === 'A' || keyCode === LEFT_ARROW) {
        keys.left = false;
    }
    if (key === 'd' || key === 'D' || keyCode === RIGHT_ARROW) {
        keys.right = false;
    }
    if (key === 'w' || key === 'W' || keyCode === UP_ARROW) {
        keys.jump = false;
    }
}

// --- Touch controls ---
function touchStarted() {
    // Login — let the HTML input handle touches
    if (gameState === 'login') return true;
    // Leaderboard — tap to go back
    if (gameState === 'leaderboard') { gameState = 'menu'; return false; }
    // Menu/screen taps
    if (gameState === 'menu') { startGame(); return false; }
    if (gameState === 'gameOver') { gameState = 'menu'; return false; }
    if (gameState === 'levelComplete') { advanceLevel(); return false; }
    if (gameState === 'paused') { gameState = 'playing'; return false; }
    if (gameState !== 'playing') return false;

    let btnSize = 65;
    let margin = 20;

    for (let t of touches) {
        // Left button
        if (dist(t.x, t.y, margin + btnSize / 2, height - margin - btnSize / 2) < btnSize / 2) {
            touchControls.left = true;
        }
        // Right button
        if (dist(t.x, t.y, margin * 2 + btnSize * 1.5, height - margin - btnSize / 2) < btnSize / 2) {
            touchControls.right = true;
        }
        // Jump button
        if (dist(t.x, t.y, width - margin - btnSize * 0.7, height - margin - btnSize / 2) < btnSize * 0.7) {
            if (char.onGround || char.canWallJump) {
                performJump();
            } else {
                jumpBuffered = true;
                jumpBufferTimer = JUMP_BUFFER_FRAMES;
            }
        }
        // Dash button
        if (dist(t.x, t.y, width - margin - btnSize * 0.7, height - margin - btnSize * 1.8) < btnSize * 0.5) {
            startDash();
        }
    }
    return false;
}

function touchEnded() {
    touchControls.left = false;
    touchControls.right = false;
    return false;
}

function drawMobileControls() {
    let btnSize = 65;
    let margin = 20;
    let leftX = margin + btnSize / 2;
    let rightX = margin * 2 + btnSize * 1.5;
    let btnY = height - margin - btnSize / 2;
    let jumpX = width - margin - btnSize * 0.7;
    let dashY = height - margin - btnSize * 1.8;

    push();
    textAlign(CENTER, CENTER);

    // Left
    fill(touchControls.left ? color(120, 120, 220, 180) : color(255, 255, 255, 80));
    stroke(255, 255, 255, 40);
    strokeWeight(2);
    ellipse(leftX, btnY, btnSize);
    fill(255, 255, 255, 200);
    noStroke();
    textSize(26);
    text('◄', leftX, btnY);

    // Right
    fill(touchControls.right ? color(120, 120, 220, 180) : color(255, 255, 255, 80));
    stroke(255, 255, 255, 40);
    strokeWeight(2);
    ellipse(rightX, btnY, btnSize);
    fill(255, 255, 255, 200);
    noStroke();
    textSize(26);
    text('►', rightX, btnY);

    // Jump
    fill(color(255, 255, 255, 90));
    stroke(255, 255, 255, 40);
    strokeWeight(2);
    ellipse(jumpX, btnY, btnSize * 1.2);
    fill(255, 255, 255, 200);
    noStroke();
    textSize(16);
    text('JUMP', jumpX, btnY);

    // Dash
    fill(char.dashCooldown > 0 ? color(100, 100, 100, 60) : color(100, 180, 255, 90));
    stroke(255, 255, 255, 40);
    strokeWeight(2);
    ellipse(jumpX, dashY, btnSize * 0.8);
    fill(255, 255, 255, 180);
    noStroke();
    textSize(12);
    text('DASH', jumpX, dashY);

    pop();
}


// ═══════════════════════════════════════════════════════════
// 14. UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

function windowResized() {
    resizeCanvas(min(windowWidth, CONFIG.MAX_CANVAS_W), min(windowHeight, CONFIG.MAX_CANVAS_H));
    floorPos_y = height * 3 / 4;
    repositionNameInput();
}
