/*
    Professional Platformer Game - Multi-Level Edition
    Enhanced with mobile support, multiple levels, and advanced features
*/

// Game state
let gameState = 'menu'; // menu, playing, paused, gameOver, levelComplete
let currentLevel = 1;
let maxLevel = 5;
let lives = 3;
let gameScore = 0;

// Character variables
let gameChar_x;
let gameChar_y;
let floorPos_y;
let isLeft = false;
let isRight = false;
let isFalling = false;
let isPlummeting = false;

// Game mechanics
let gravity = 4;
let gameCharSpeed = 5;
let jumpHeight = 160;
let cameraPos = 0;
let invincible = false;
let invincibleTimer = 0;

// Game objects
let collectables = [];
let canyons = [];
let mountains = [];
let clouds = [];
let trees_x = [];
let enemies = [];
let platforms = [];
let particles = [];
let powerUps = [];
let flagpole;

// Sound effects
let jumpSound;
let collectSound;
let walkSound;
let backgroundMusic;
let gameOverSound;
let levelCompleteSound;
let hurtSound;
let powerUpSound;

// Mobile support
let isMobile = false;
let touchControls = {
    left: false,
    right: false,
    jump: false
};

// Visual effects
let stars = [];

function preload() {
    soundFormats('mp3');
    collectSound = loadSound('collect-5930.mp3');
    jumpSound = loadSound('cartoon-jump-6462.mp3');
    walkSound = loadSound('running-in-grass-6237.mp3');
    backgroundMusic = loadSound('lifelike-126735.mp3');
    gameOverSound = loadSound('negative_beeps-6008.mp3');
    levelCompleteSound = loadSound('goodresult-82807.mp3');
}

function setup() {
    // Responsive canvas
    let canvas = createCanvas(min(windowWidth, 1024), min(windowHeight, 576));
    canvas.parent(document.body);

    // Detect mobile
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Setup background music
    if (backgroundMusic) {
        backgroundMusic.setVolume(0.3);
        backgroundMusic.loop();
    }

    // Initialize stars for background
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: random(width * 3),
            y: random(height * 0.7),
            size: random(1, 3),
            brightness: random(150, 255)
        });
    }

    floorPos_y = height * 3 / 4;
    initializeLevel(currentLevel);
}

function initializeLevel(level) {
    // Reset character position
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;
    cameraPos = 0;
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;
    invincible = false;

    // Clear arrays
    collectables = [];
    canyons = [];
    mountains = [];
    clouds = [];
    trees_x = [];
    enemies = [];
    platforms = [];
    powerUps = [];
    particles = [];

    // Generate level based on difficulty
    let levelLength = 2000 + (level * 500);
    let numCollectables = 10 + (level * 2);
    let numEnemies = 2 + level;
    let numCanyons = 3 + level;

    // Create collectables
    for (let i = 0; i < numCollectables; i++) {
        collectables.push({
            posX: random(200, levelLength),
            posY: floorPos_y,
            size: random(0.5, 0.7),
            isFound: false,
            float: random(TWO_PI)
        });
    }

    // Create canyons with safe spacing
    let lastCanyonEnd = 0;
    for (let i = 0; i < numCanyons; i++) {
        let canyonX = lastCanyonEnd + random(200, 400);
        let canyonWidth = random(100, 150 + level * 10);
        canyons.push({
            posX: canyonX,
            width: canyonWidth
        });
        lastCanyonEnd = canyonX + canyonWidth;
    }

    // Create mountains
    for (let i = 0; i < 15; i++) {
        mountains.push({
            posX: random(0, levelLength),
            posY: random(40, 80),
            size: random(0.5, 1.2)
        });
    }

    // Create clouds
    for (let i = 0; i < 12; i++) {
        clouds.push({
            posX: random(0, levelLength),
            posY: random(20, 100),
            size: random(0.8, 1.5),
            speed: random(0.2, 0.5)
        });
    }

    // Create trees
    for (let i = 0; i < 8 + level; i++) {
        trees_x.push(random(200, levelLength));
    }

    // Create enemies (moving balls)
    for (let i = 0; i < numEnemies; i++) {
        enemies.push({
            posX: random(400, levelLength - 200),
            posY: floorPos_y - 30,
            speed: random(1, 2 + level * 0.5),
            direction: random([1, -1]),
            range: 200,
            startX: 0
        });
        enemies[i].startX = enemies[i].posX;
    }

    // Create platforms (starting from level 2)
    if (level >= 2) {
        let numPlatforms = level;
        for (let i = 0; i < numPlatforms; i++) {
            platforms.push({
                posX: random(300, levelLength - 200),
                posY: floorPos_y - random(80, 150),
                width: random(80, 120),
                height: 15
            });
        }
    }

    // Create power-ups (starting from level 2)
    if (level >= 2) {
        for (let i = 0; i < 2; i++) {
            powerUps.push({
                posX: random(400, levelLength - 200),
                posY: floorPos_y - 50,
                type: random(['invincibility', 'extraLife', 'scoreBoost']),
                isCollected: false,
                float: random(TWO_PI)
            });
        }
    }

    // Create flagpole at end
    flagpole = {
        posX: levelLength,
        posY: floorPos_y - 25,
        isReached: false
    };
}

function draw() {
    // Draw background gradient
    drawGradientBackground();

    // Draw stars
    drawStars();

    // Game state management
    if (gameState === 'menu') {
        drawMenu();
        return;
    } else if (gameState === 'paused') {
        drawPausedScreen();
        return;
    } else if (gameState === 'gameOver') {
        drawGameOverScreen();
        return;
    } else if (gameState === 'levelComplete') {
        drawLevelCompleteScreen();
        return;
    }

    // Main game rendering
    noStroke();
    fill(58, 55, 82);
    rect(0, floorPos_y, width, height - floorPos_y);

    // Camera follows character
    push();
    translate(-cameraPos, 0);

    // Update and draw game objects
    drawMountains();
    drawClouds();
    drawCanyons();
    drawTrees();
    drawPlatforms();
    drawCollectables();
    drawPowerUps();
    drawEnemies();
    drawFlagpole();
    drawCharacter();
    drawParticles();

    pop();

    // Update game logic
    updatePhysics();
    updateCamera();
    updateEnemies();
    updateInvincibility();
    checkCollisions();

    // Draw UI
    drawUI();

    // Draw mobile controls
    if (isMobile) {
        drawMobileControls();
    }
}

function drawGradientBackground() {
    // Sky gradient
    for (let y = 0; y < floorPos_y; y++) {
        let inter = map(y, 0, floorPos_y, 0, 1);
        let c = lerpColor(color(25, 25, 60), color(67, 97, 145), inter);
        stroke(c);
        line(0, y, width, y);
    }
    noStroke();
}

function drawStars() {
    push();
    translate(-cameraPos * 0.1, 0);
    fill(255);
    noStroke();
    for (let star of stars) {
        let twinkle = sin(frameCount * 0.05 + star.x) * 50;
        fill(255, star.brightness + twinkle);
        ellipse(star.x, star.y, star.size);
    }
    pop();
}

function drawMountains() {
    push();
    translate(-cameraPos * 0.3, 0);
    for (let m of mountains) {
        fill(100, 100, 120);
        noStroke();
        triangle(
            m.posX, m.posY + 350,
            m.posX - 200 * m.size, floorPos_y,
            m.posX + 200 * m.size, floorPos_y
        );
        // Snow cap
        fill(240);
        triangle(
            m.posX, m.posY + 350,
            m.posX - 50 * m.size, m.posY + 400,
            m.posX + 50 * m.size, m.posY + 400
        );
    }
    pop();
}

function drawClouds() {
    for (let c of clouds) {
        c.posX += c.speed;
        if (c.posX > flagpole.posX + 500) c.posX = -100;

        fill(255, 255, 255, 200);
        noStroke();
        ellipse(c.posX, c.posY, 60 * c.size, 30 * c.size);
        ellipse(c.posX - 25 * c.size, c.posY, 50 * c.size, 25 * c.size);
        ellipse(c.posX + 25 * c.size, c.posY, 50 * c.size, 25 * c.size);
    }
}

function drawCanyons() {
    for (let canyon of canyons) {
        fill(30, 30, 50);
        rect(canyon.posX, floorPos_y, canyon.width, height - floorPos_y);

        // Canyon edge details
        stroke(20, 20, 30);
        strokeWeight(2);
        line(canyon.posX, floorPos_y, canyon.posX, height);
        line(canyon.posX + canyon.width, floorPos_y, canyon.posX + canyon.width, height);
        noStroke();
    }
}

function drawTrees() {
    for (let x of trees_x) {
        // Tree trunk
        fill(101, 67, 33);
        stroke(0);
        strokeWeight(2);
        rect(x - 10, floorPos_y - 60, 20, 60);

        // Tree foliage
        fill(34, 139, 34);
        noStroke();
        ellipse(x, floorPos_y - 80, 70, 70);
        ellipse(x - 20, floorPos_y - 65, 50, 50);
        ellipse(x + 20, floorPos_y - 65, 50, 50);

        // Apples on trees
        fill(200, 0, 0);
        ellipse(x + 15, floorPos_y - 90, 8);
        ellipse(x - 10, floorPos_y - 75, 8);
    }
}

function drawPlatforms() {
    fill(139, 90, 43);
    stroke(101, 67, 33);
    strokeWeight(2);
    for (let platform of platforms) {
        rect(platform.posX, platform.posY, platform.width, platform.height, 5);
        // Platform detail
        fill(160, 110, 60);
        rect(platform.posX + 5, platform.posY + 2, platform.width - 10, platform.height - 4, 3);
        fill(139, 90, 43);
    }
    noStroke();
}

function drawCollectables() {
    for (let item of collectables) {
        if (!item.isFound) {
            item.float += 0.1;
            let floatY = sin(item.float) * 5;

            push();
            translate(item.posX, item.posY - 40 + floatY);
            rotate(frameCount * 0.02);

            // Coin appearance
            fill(255, 215, 0);
            stroke(218, 165, 32);
            strokeWeight(2);
            ellipse(0, 0, 30 * item.size);
            fill(255, 223, 0);
            ellipse(0, 0, 20 * item.size);

            // Coin symbol
            textAlign(CENTER, CENTER);
            textSize(16 * item.size);
            fill(218, 165, 32);
            noStroke();
            text('$', 0, 0);

            pop();
        }
    }
}

function drawPowerUps() {
    for (let powerUp of powerUps) {
        if (!powerUp.isCollected) {
            powerUp.float += 0.08;
            let floatY = sin(powerUp.float) * 8;

            push();
            translate(powerUp.posX, powerUp.posY + floatY);

            // Different colors for different power-ups
            if (powerUp.type === 'invincibility') {
                fill(138, 43, 226, 200);
                stroke(75, 0, 130);
            } else if (powerUp.type === 'extraLife') {
                fill(255, 20, 147, 200);
                stroke(199, 21, 133);
            } else {
                fill(0, 191, 255, 200);
                stroke(0, 105, 148);
            }

            strokeWeight(3);
            rotate(frameCount * 0.03);
            rect(-15, -15, 30, 30, 5);

            // Icon
            fill(255);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(16);
            if (powerUp.type === 'invincibility') text('★', 0, 0);
            else if (powerUp.type === 'extraLife') text('♥', 0, 0);
            else text('+', 0, 0);

            pop();
        }
    }
}

function drawEnemies() {
    for (let enemy of enemies) {
        // Move enemy
        enemy.posX += enemy.speed * enemy.direction;

        // Bounce within range
        if (abs(enemy.posX - enemy.startX) > enemy.range) {
            enemy.direction *= -1;
        }

        // Draw enemy
        push();
        translate(enemy.posX, enemy.posY);

        // Spiky ball enemy
        fill(220, 20, 60);
        stroke(139, 0, 0);
        strokeWeight(2);
        ellipse(0, 0, 40);

        // Spikes
        fill(139, 0, 0);
        for (let i = 0; i < 8; i++) {
            let angle = (TWO_PI / 8) * i + frameCount * 0.05;
            let x = cos(angle) * 20;
            let y = sin(angle) * 20;
            triangle(x, y, x * 1.5, y * 1.5, x * 0.8 + 5, y * 0.8);
        }

        // Evil eye
        fill(255);
        noStroke();
        ellipse(-5, -5, 10);
        ellipse(5, -5, 10);
        fill(0);
        ellipse(-5, -5, 5);
        ellipse(5, -5, 5);

        pop();
    }
}

function drawFlagpole() {
    // Pole
    stroke(255);
    strokeWeight(5);
    line(flagpole.posX, floorPos_y, flagpole.posX, floorPos_y - 200);

    // Flag
    noStroke();
    if (flagpole.isReached) {
        fill(0, 255, 0);
        flagpole.posY = lerp(flagpole.posY, floorPos_y - 190, 0.1);
    } else {
        fill(220, 0, 0);
    }

    beginShape();
    vertex(flagpole.posX, flagpole.posY);
    vertex(flagpole.posX + 50, flagpole.posY + 15);
    vertex(flagpole.posX, flagpole.posY + 30);
    endShape(CLOSE);

    // Flag pole ball
    fill(255, 215, 0);
    stroke(218, 165, 32);
    strokeWeight(2);
    ellipse(flagpole.posX, floorPos_y - 200, 15);
    noStroke();
}

function drawCharacter() {
    push();
    translate(gameChar_x, gameChar_y);

    // Invincibility effect
    if (invincible && frameCount % 10 < 5) {
        tint(255, 150);
        fill(138, 43, 226, 100);
        noStroke();
        ellipse(0, -35, 80, 90);
    }

    // Character body
    fill(100);
    stroke(0);
    strokeWeight(2);

    if (isLeft && isFalling) {
        // Jumping left
        ellipse(0, -38, 12, 15); // head
        ellipse(0, -15, 8, 30); // body
        fill(255);
        ellipse(-3, -40, 3); // eye
        fill(100);
    } else if (isRight && isFalling) {
        // Jumping right
        ellipse(0, -38, 12, 15);
        ellipse(0, -15, 8, 30);
        fill(255);
        ellipse(3, -40, 3);
        fill(100);
    } else if (isLeft) {
        // Walking left
        ellipse(0, -50, 12, 15);
        ellipse(0, -27, 8, 30);
        fill(255);
        ellipse(-3, -52, 3);
        fill(100);
        // Legs
        let legOffset = sin(frameCount * 0.3) * 5;
        rect(-3 + legOffset, -15, 3, 15);
        rect(-3 - legOffset, -15, 3, 15);
    } else if (isRight) {
        // Walking right
        ellipse(0, -50, 12, 15);
        ellipse(0, -27, 8, 30);
        fill(255);
        ellipse(3, -52, 3);
        fill(100);
        // Legs
        let legOffset = sin(frameCount * 0.3) * 5;
        rect(3 + legOffset, -15, 3, 15);
        rect(3 - legOffset, -15, 3, 15);
    } else if (isFalling) {
        // Jumping forward
        ellipse(0, -37.5, 12, 15);
        ellipse(0, -14.5, 12, 30);
        fill(255);
        ellipse(-2, -39.5, 3);
        ellipse(2, -39.5, 3);
        fill(100);
    } else {
        // Standing
        ellipse(0, -56.5, 12, 15);
        ellipse(0, -33.5, 12, 30);
        fill(255);
        ellipse(-2, -58.5, 3);
        ellipse(2, -58.5, 3);
        fill(100);
        // Legs
        rect(-3, -18.5, 4, 20);
        rect(2, -18.5, 4, 20);
    }

    // Shoes
    fill(220);
    rect(-6, 0, 6, 2);
    rect(1, 0, 6, 2);

    pop();
}

function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.life--;

        fill(p.r, p.g, p.b, map(p.life, 0, p.maxLife, 0, 255));
        noStroke();
        ellipse(p.x - cameraPos, p.y, p.size);

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function createParticles(x, y, r, g, b, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: random(-3, 3),
            vy: random(-5, -1),
            size: random(3, 8),
            r: r,
            g: g,
            b: b,
            life: 30,
            maxLife: 30
        });
    }
}

function updatePhysics() {
    // Horizontal movement
    if ((isLeft || touchControls.left) && !isPlummeting) {
        gameChar_x -= gameCharSpeed;
    }
    if ((isRight || touchControls.right) && !isPlummeting) {
        gameChar_x += gameCharSpeed;
    }

    // Gravity and jumping
    if (gameChar_y < floorPos_y) {
        let onPlatform = false;

        // Check platform collisions
        for (let platform of platforms) {
            if (gameChar_x > platform.posX - cameraPos &&
                gameChar_x < platform.posX - cameraPos + platform.width &&
                gameChar_y >= platform.posY - 10 &&
                gameChar_y <= platform.posY + 10 &&
                !isFalling) {
                gameChar_y = platform.posY;
                onPlatform = true;
                isFalling = false;
                break;
            }
        }

        if (!onPlatform) {
            gameChar_y += gravity;
            isFalling = true;
        }
    } else {
        gameChar_y = floorPos_y;
        if (!isPlummeting) {
            isFalling = false;
        }
    }

    // Plummeting in canyon
    if (isPlummeting) {
        gameChar_y += gravity * 1.5;
        if (gameChar_y > height + 100) {
            loseLife();
        }
    }
}

function updateCamera() {
    // Smooth camera follow
    let targetCamera = gameChar_x - width / 3;
    cameraPos = lerp(cameraPos, targetCamera, 0.1);
    cameraPos = constrain(cameraPos, 0, flagpole.posX - width + 100);
}

function updateEnemies() {
    // Already handled in drawEnemies
}

function updateInvincibility() {
    if (invincible) {
        invincibleTimer--;
        if (invincibleTimer <= 0) {
            invincible = false;
        }
    }
}

function checkCollisions() {
    // Canyon collision
    for (let canyon of canyons) {
        if (gameChar_x + cameraPos > canyon.posX &&
            gameChar_x + cameraPos < canyon.posX + canyon.width &&
            gameChar_y >= floorPos_y) {
            isPlummeting = true;
        }
    }

    // Collectable collision
    for (let item of collectables) {
        if (!item.isFound) {
            let d = dist(gameChar_x + cameraPos, gameChar_y, item.posX, item.posY);
            if (d < 30) {
                item.isFound = true;
                gameScore += 10;
                if (collectSound) collectSound.play();
                createParticles(item.posX, item.posY - 40, 255, 215, 0, 15);
            }
        }
    }

    // Enemy collision
    if (!invincible) {
        for (let enemy of enemies) {
            let d = dist(gameChar_x + cameraPos, gameChar_y, enemy.posX, enemy.posY);
            if (d < 35) {
                loseLife();
                createParticles(gameChar_x + cameraPos, gameChar_y - 30, 255, 0, 0, 20);
                break;
            }
        }
    }

    // Power-up collision
    for (let powerUp of powerUps) {
        if (!powerUp.isCollected) {
            let d = dist(gameChar_x + cameraPos, gameChar_y, powerUp.posX, powerUp.posY);
            if (d < 40) {
                powerUp.isCollected = true;
                if (powerUpSound) powerUpSound.play();
                else if (collectSound) collectSound.play();

                if (powerUp.type === 'invincibility') {
                    invincible = true;
                    invincibleTimer = 300; // 5 seconds at 60fps
                } else if (powerUp.type === 'extraLife') {
                    lives = min(lives + 1, 5);
                } else if (powerUp.type === 'scoreBoost') {
                    gameScore += 50;
                }

                createParticles(powerUp.posX, powerUp.posY, 138, 43, 226, 20);
            }
        }
    }

    // Flagpole collision
    let flagDist = dist(gameChar_x + cameraPos, gameChar_y, flagpole.posX, floorPos_y);
    if (flagDist < 30 && !flagpole.isReached) {
        flagpole.isReached = true;
        if (levelCompleteSound) levelCompleteSound.play();
        gameScore += 100;
        setTimeout(() => {
            gameState = 'levelComplete';
        }, 1000);
    }
}

function loseLife() {
    if (lives > 0 && !invincible) {
        lives--;
        if (hurtSound) hurtSound.play();
        else if (gameOverSound) gameOverSound.play();

        if (lives > 0) {
            // Respawn
            gameChar_x = width / 2;
            gameChar_y = floorPos_y;
            cameraPos = 0;
            isPlummeting = false;
            invincible = true;
            invincibleTimer = 180; // 3 seconds of invincibility
        } else {
            gameState = 'gameOver';
        }
    }
}

function drawUI() {
    push();

    // Semi-transparent background for UI
    fill(0, 0, 0, 150);
    rect(10, 10, 200, 80, 10);

    // Score
    fill(255);
    noStroke();
    textSize(20);
    textAlign(LEFT);
    text(`Score: ${gameScore}`, 20, 35);

    // Level
    text(`Level: ${currentLevel}/${maxLevel}`, 20, 60);

    // Lives
    text('Lives: ', 20, 85);
    fill(255, 20, 147);
    for (let i = 0; i < lives; i++) {
        text('♥', 80 + i * 20, 85);
    }

    // Invincibility indicator
    if (invincible) {
        fill(138, 43, 226);
        textAlign(CENTER);
        text('★ INVINCIBLE ★', width / 2, 30);
    }

    pop();
}

function drawMenu() {
    background(25, 25, 60);

    // Title
    fill(255, 215, 0);
    textAlign(CENTER);
    textSize(64);
    text('PLATFORM', width / 2, height / 3);
    textSize(48);
    text('ADVENTURE', width / 2, height / 3 + 60);

    // Instructions
    fill(255);
    textSize(24);
    text('Press SPACE or TAP to Start', width / 2, height / 2 + 40);

    textSize(18);
    if (isMobile) {
        text('Use on-screen controls to move', width / 2, height / 2 + 90);
    } else {
        text('Use A/D to move, W to jump', width / 2, height / 2 + 90);
        text('Press P to pause', width / 2, height / 2 + 115);
    }

    textSize(16);
    fill(255, 215, 0);
    text(`Current High Score: ${gameScore}`, width / 2, height - 50);

    // Animated character preview
    push();
    translate(width / 2, height / 2 - 50);
    scale(2);
    fill(100);
    stroke(0);
    strokeWeight(2);
    ellipse(0, -56.5, 12, 15);
    ellipse(0, -33.5, 12, 30);
    fill(255);
    ellipse(-2, -58.5, 3);
    ellipse(2, -58.5, 3);
    fill(100);
    rect(-3, -18.5, 4, 20);
    rect(2, -18.5, 4, 20);
    fill(220);
    rect(-6, 0, 6, 2);
    rect(1, 0, 6, 2);
    pop();
}

function drawPausedScreen() {
    // Draw semi-transparent overlay
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);

    fill(255);
    textAlign(CENTER);
    textSize(48);
    text('PAUSED', width / 2, height / 2);

    textSize(24);
    text('Press P to resume', width / 2, height / 2 + 50);
}

function drawGameOverScreen() {
    background(20, 20, 40);

    fill(255, 0, 0);
    textAlign(CENTER);
    textSize(64);
    text('GAME OVER', width / 2, height / 3);

    fill(255);
    textSize(32);
    text(`Final Score: ${gameScore}`, width / 2, height / 2);
    text(`Level Reached: ${currentLevel}`, width / 2, height / 2 + 50);

    textSize(24);
    text('Press SPACE to try again', width / 2, height / 2 + 120);

    if (gameScore > 0) {
        fill(255, 215, 0);
        textSize(20);
        text('Great effort!', width / 2, height - 50);
    }
}

function drawLevelCompleteScreen() {
    background(20, 40, 20);

    fill(0, 255, 0);
    textAlign(CENTER);
    textSize(56);
    text('LEVEL COMPLETE!', width / 2, height / 3);

    fill(255);
    textSize(32);
    text(`Score: ${gameScore}`, width / 2, height / 2);

    if (currentLevel < maxLevel) {
        textSize(24);
        text('Press SPACE for next level', width / 2, height / 2 + 80);
    } else {
        fill(255, 215, 0);
        textSize(48);
        text('YOU WIN!', width / 2, height / 2 + 80);
        fill(255);
        textSize(24);
        text('You completed all levels!', width / 2, height / 2 + 130);
        text('Press SPACE to play again', width / 2, height / 2 + 160);
    }
}

function drawMobileControls() {
    let buttonSize = 60;
    let margin = 20;

    // Left button
    fill(touchControls.left ? color(100, 100, 200, 150) : color(255, 255, 255, 100));
    ellipse(margin + buttonSize / 2, height - margin - buttonSize / 2, buttonSize);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(24);
    text('◄', margin + buttonSize / 2, height - margin - buttonSize / 2);

    // Right button
    fill(touchControls.right ? color(100, 100, 200, 150) : color(255, 255, 255, 100));
    ellipse(margin * 2 + buttonSize * 1.5, height - margin - buttonSize / 2, buttonSize);
    fill(0);
    text('►', margin * 2 + buttonSize * 1.5, height - margin - buttonSize / 2);

    // Jump button
    fill(touchControls.jump ? color(200, 100, 100, 150) : color(255, 255, 255, 100));
    ellipse(width - margin - buttonSize / 2, height - margin - buttonSize / 2, buttonSize * 1.2);
    fill(0);
    textSize(20);
    text('JUMP', width - margin - buttonSize / 2, height - margin - buttonSize / 2);
}

function keyPressed() {
    if (key === ' ') {
        if (gameState === 'menu') {
            gameState = 'playing';
            lives = 3;
            gameScore = 0;
            currentLevel = 1;
            initializeLevel(currentLevel);
        } else if (gameState === 'gameOver') {
            gameState = 'menu';
        } else if (gameState === 'levelComplete') {
            if (currentLevel < maxLevel) {
                currentLevel++;
                initializeLevel(currentLevel);
                gameState = 'playing';
            } else {
                // Game completed, restart
                currentLevel = 1;
                gameState = 'menu';
            }
        }
    }

    if (gameState === 'playing') {
        if (key === 'a' || key === 'A') {
            isLeft = true;
        } else if (key === 'd' || key === 'D') {
            isRight = true;
        } else if (key === 'w' || key === 'W') {
            if (!isFalling && gameChar_y === floorPos_y) {
                gameChar_y -= jumpHeight;
                if (jumpSound) jumpSound.play();
            }
        } else if (key === 'p' || key === 'P') {
            gameState = 'paused';
        }
    } else if (gameState === 'paused') {
        if (key === 'p' || key === 'P') {
            gameState = 'playing';
        }
    }
}

function keyReleased() {
    if (key === 'a' || key === 'A') {
        isLeft = false;
    } else if (key === 'd' || key === 'D') {
        isRight = false;
    }
}

// Touch controls for mobile
function touchStarted() {
    if (gameState === 'menu' || gameState === 'gameOver' || gameState === 'levelComplete') {
        keyPressed(); // Trigger space bar action
        return false;
    }

    if (!isMobile || gameState !== 'playing') return;

    let buttonSize = 60;
    let margin = 20;

    for (let touch of touches) {
        // Left button
        if (dist(touch.x, touch.y, margin + buttonSize / 2, height - margin - buttonSize / 2) < buttonSize / 2) {
            touchControls.left = true;
        }
        // Right button
        if (dist(touch.x, touch.y, margin * 2 + buttonSize * 1.5, height - margin - buttonSize / 2) < buttonSize / 2) {
            touchControls.right = true;
        }
        // Jump button
        if (dist(touch.x, touch.y, width - margin - buttonSize / 2, height - margin - buttonSize / 2) < buttonSize * 0.6) {
            if (!isFalling && gameChar_y === floorPos_y) {
                gameChar_y -= jumpHeight;
                if (jumpSound) jumpSound.play();
            }
        }
    }

    return false;
}

function touchEnded() {
    touchControls.left = false;
    touchControls.right = false;
    touchControls.jump = false;
    return false;
}

function windowResized() {
    resizeCanvas(min(windowWidth, 1024), min(windowHeight, 576));
    floorPos_y = height * 3 / 4;
}
