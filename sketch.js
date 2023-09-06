/*
	The Game Project Part 4 - Character Interaction
*/
var gameChar_x;
var gameChar_y;
var floorPos_y;
var collectables;
var falgpoleDist
var flagpole;
var tree;
var collectableDist;
var mountains;
var clouds;
var cameraPosx;
var canyon;
var canyons;
//interaction
var isPlummeting
var isLeft;
var isRight;
var isFalling;
// control movement:
var gravity;
var gameCharSpeed;
var jumpHeight
var trees_x;
// Controling game stat vars ;
var gameOver;
var levelComplete;
var gameScore;
var ball;
var ballDist;

//sound effect
var jumpSound;
var collectSound;
var walkSound;

function setup() {
    createCanvas(1024, 576);

    //    insilizing All vars here
    gameScore = 0;
    cameraPosx = 0;
    floorPos_y = height * 3 / 4;
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;

    collectables = [{}];
    for (var i = 0; i < 10; i++) {
        collectables.push({
            posX: random(800, 1500),
            posY: floorPos_y,
            size: 1,
            isFound: false
        })
    }




    isLeft = false;
    isRight = false;
    isFalling = false;

    gravity = 4;
    gameCharSpeed = 5;
    jumpHeight = 160;

    flagpole = {
        posX: 3000,
        posY: floorPos_y - 25,
        isReached: false,
    };

    trees_x = [1000, 800, 400, 2000]
    tree = {
        posX: 0,
        posY: floorPos_y
    }

    mountains = [{}];
    for (var i = 0; i < 20; i++) {
        mountains.push({
            posX: random(700, 3000),
            posY: 60,
            size: random(0.5, 1)
        })
    }



    clouds = [{}];
    for (var i = 0; i < 10; i++) {
        clouds.push({
            posX: random(100, 1600) + i * 150,
            posY: random(-50, -100),
            size: random(1, 2)
        })
    }

    canyons = [
        {
            posX: 0,
            width: 300
        },
        {
            posX: 650,
            width: 150
        },
        {
            posX: 1500,
            width: 150
        },
        {
            posX: 1800,
            width: 100
        },
        {
            posX: 2700,
            width: 150
        }

    ]
    ball = [{}]
    for (var i = 0; i < 3; i++) {
        ball.push({
            posX: 300,
            posY: floorPos_y - 30,
            speed: random(1, 5)
        })
    }

    //    loading sound effects
    soundFormats('mp3');
    collectSound = loadSound('collect-5930.mp3');
    jumpSound = loadSound('cartoon-jump-6462.mp3');
    walkSound = loadSound('running-in-grass-6237.mp3')

}

function draw() {


    ///////////DRAWING CODE//////////

    background(67, 97, 145); //fill the sky blue


    noStroke();
    fill(58, 55, 82);
    rect(0, floorPos_y, width,
        height - floorPos_y); //draw some green ground
    //The camera code
    push();
    translate(-cameraPosx, 0);

    // Test for moving the flag(Distance) :
    falgpoleDist = dist(
        flagpole.posX,
        floorPos_y,
        gameChar_x,
        gameChar_y);


    //draw the canyon
    for (var i = 0; i < canyons.length; i++) {
        noStroke();
        fill(67, 97, 145);
        rect(canyons[i].posX,
            floorPos_y, canyons[i].width,
            height - floorPos_y);
        if (gameChar_x > canyons[i].posX &&
            gameChar_x < canyons[i].posX + canyons[i].width &&
            gameChar_y >= floorPos_y) {

            isPlummeting = true;

        }
        if (isPlummeting == true) {
            isFalling = true;
            isLeft = false;
            isRight = false;
            gameChar_y += gravity;
            gameOver = true;
        }
        if (i == 3) {
            canyons[i].posX += random(10, 20)
            if (canyons[i].posX > 2000) {
                canyons[i].posX -= random(10, 20)
            } // to make the canyone moving .
        }
        if (i == 4) {
            if (canyons[i].width >= 150) {
                canyons[i].width -= random(10, 20)
            } else {
                canyons[i].width += random(10, 20)
            } // to make the canyon width get random size.
        }

    }
    //Drawing the mountain
    for (var i = 0; i < mountains.length; i++) {
        fill(220);
        noStroke();
        beginShape();
        vertex(mountains[i].posX,
            mountains[i].posY + (mountains[i].posY / mountains[i].size)); //top
        vertex(mountains[i].posX - (2 * mountains[i].size),
            mountains[i].posY + 372); //left
        vertex(mountains[i].posX + (400 * mountains[i].size),
            mountains[i].posY + 372); //right
        endShape();

        beginShape();
        vertex(mountains[i].posX, mountains[i].posY + (mountains[i].posY / mountains[i].size)); //top
        vertex(mountains[i].posX - (2 * mountains[i].size),
            mountains[i].posY + 372); //left
        vertex(mountains[i].posX - (400 * mountains[i].size),
            mountains[i].posY + 372); //right
        endShape();

        beginShape();
        vertex(mountains[i].posX - 40,
            mountains[i].posY + (mountains[i].posY / mountains[i].size)); //top
        vertex(mountains[i].posX - (2 * mountains[i].size),
            mountains[i].posY + 372); //left
        vertex(mountains[i].posX - (400 * mountains[i].size),
            mountains[i].posY + 372); //right
        endShape();

        beginShape();
        vertex(mountains[i].posX + 40,
            mountains[i].posY + (mountains[i].posY / mountains[i].size)); //top
        vertex(mountains[i].posX - (2 * mountains[i].size),
            mountains[i].posY + 372); //left
        vertex(mountains[i].posX + (400 * mountains[i].size),
            mountains[i].posY + 372); //right
        endShape();
    }
    //    drawing the cloud;
    for (var i = 0; i < clouds.length; i++) {
        clouds[i].posX += random(1, 1.5) * 4 // make the cloudes not close to each other.
        noFill()
        stroke(0);
        fill(255);
        ellipse(
            clouds[i].posX + (1 * clouds[i].size),
            clouds[i].posY + 118,
            50 * clouds[i].size, 30 * clouds[i].size
        );
        ellipse(
            clouds[i].posX - 20 * clouds[i].size,
            clouds[i].posY + 125,
            70 * clouds[i].size,
            20 * clouds[i].size
        );

        ellipse(
            clouds[i].posX + 20 * clouds[i].size,
            clouds[i].posY + 122,
            50 * clouds[i].size,
            30 * clouds[i].size
        );
        ellipse(
            clouds[i].posX + 30 * clouds[i].size,
            clouds[i].posY + 118,
            70 * clouds[i].size,
            20 * clouds[i].size
        );
        //cloud filling
        noStroke();
        fill(255);
        ellipse(
            clouds[i].posX + (1 * clouds[i].size),
            clouds[i].posY + 118,
            50 * clouds[i].size, 30 * clouds[i].size
        );
        ellipse(
            clouds[i].posX - 20 * clouds[i].size,
            clouds[i].posY + 125,
            70 * clouds[i].size,
            20 * clouds[i].size
        );

        ellipse(
            clouds[i].posX + 20 * clouds[i].size,
            clouds[i].posY + 122,
            50 * clouds[i].size,
            30 * clouds[i].size
        );
        ellipse(
            clouds[i].posX + 30 * clouds[i].size,
            clouds[i].posY + 118,
            70 * clouds[i].size,
            20 * clouds[i].size
        );


        if (clouds[i].posX >= 3000) {
            clouds[i].posX = 0
        } // tp make the clouds looping in the width game.

    }

    for (var i = 0; i < trees_x.length; i++) {
        //    Dreawing the tree top bit and down bit:
        push();
        translate(-175, 0);
        noFill();
        strokeWeight(2);
        stroke(0);
        ellipse(
            trees_x[i] + 200,
            tree.posY,
            25, 10);
        ellipse(
            trees_x[i] + 200,
            tree.posY - 32,
            25, 10);
        rect(
            trees_x[i] + 190,
            tree.posY - 50,
            20, 50)
        noStroke();
        fill(168, 47, 47)
        ellipse(
            trees_x[i] + 200,
            tree.posY,
            25, 10);
        ellipse(
            trees_x[i] + 200,
            tree.posY - 32,
            25, 10);
        rect(
            trees_x[i] + 190,
            tree.posY - 50,
            20, 50);

        //tree leaves

        strokeWeight(4);
        noFill();
        stroke(20, 101, 142);
        ellipse(
            trees_x[i] + 200,
            tree.posY - 97,
            100, 100);
        ellipse(
            trees_x[i] + 225,
            tree.posY - 117,
            50, 50);
        ellipse(
            trees_x[i] + 225,
            tree.posY - 77,
            50, 50);
        ellipse(
            trees_x[i] + 175,
            tree.posY - 117,
            50, 50);
        ellipse(
            trees_x[i] + 175,
            tree.posY - 77,
            50, 50);
        fill(215, 211, 242);
        noStroke();
        ellipse(
            trees_x[i] + 200,
            tree.posY - 97,
            100, 100);
        ellipse(
            trees_x[i] + 225,
            tree.posY - 117,
            50, 50);
        ellipse(
            trees_x[i] + 225,
            tree.posY - 77,
            50, 50);
        ellipse(
            trees_x[i] + 175,
            tree.posY - 117,
            50, 50);
        ellipse(
            trees_x[i] + 175,
            tree.posY - 77,
            50, 50);
        pop();
    }
    //    draw ball and make distanse with gamechar
 
    for (var i = 0; i < ball.length; i++) {
        push();
        fill(random(250, 10), 50, 0);
        stroke(0);
        ellipse(ball[i].posX, ball[i].posY, 40)
        ball[i].posX -= ball[i].speed;

        // make ball catch gameChar and game over:
        ballDist = dist(gameChar_x, gameChar_y, ball[i].posX, ball[i].posY);
        if (ballDist < 34) {
            gameOver = true;
            isLeft = false;
            isRight = false;
            ball[i].speed = 0;
        }
        // make the ball moving in one way:
        if (ball[i].posX < 800) {
            ball[i].posX = 3000;
        }
        pop();
    }

    //    for loop for drow trees

    // flagpole with flag goes up and down with posY 

    if (flagpole.isReached) {
        push();
        stroke(1);
        strokeWeight(5);
        fill(255);
        beginShape(LINES);
        vertex(flagpole.posX, floorPos_y);
        vertex(flagpole.posX, floorPos_y - 200)
        endShape();
        fill(0, 255, 0);
        strokeWeight(1);
        beginShape();
        strokeWeight(1);
        curveVertex(
            flagpole.posX,
            flagpole.posY);
        curveVertex(
            flagpole.posX + 40,
            flagpole.posY + 25);
        curveVertex(
            flagpole.posX,
            flagpole.posY + 25);
        curveVertex(
            flagpole.posX,
            flagpole.posY);
        curveVertex(
            flagpole.posX + 40,
            flagpole.posY);
        curveVertex(
            flagpole.posX,
            flagpole.posY + 25);
        endShape(CLOSE);
        noStroke();
        fill(220, 0, 0)
        beginShape();
        curveVertex(
            flagpole.posX,
            flagpole.posY);
        curveVertex(
            flagpole.posX + 40,
            flagpole.posY + 25);
        curveVertex(
            flagpole.posX,
            flagpole.posY + 25);
        curveVertex(
            flagpole.posX,
            flagpole.posY);
        curveVertex(
            flagpole.posX + 40,
            flagpole.posY);
        curveVertex(
            flagpole.posX,
            flagpole.posY + 25);
        endShape(CLOSE);
        strokeWeight(5);
        stroke(200, 200, 0);
        point(
            flagpole.posX,
            flagpole.posY);
        point(
            flagpole.posX,
            flagpole.posY + 25);
        pop();

    } else {
        push();
        stroke(1);
        strokeWeight(5);
        fill(255);
        beginShape(LINES);
        vertex(flagpole.posX, floorPos_y);
        vertex(flagpole.posX, floorPos_y - 200)
        endShape();
        noStroke();
        fill(220, 0, 0)
        beginShape();
        curveVertex(
            flagpole.posX,
            flagpole.posY);
        curveVertex(
            flagpole.posX + 40,
            flagpole.posY + 25);
        curveVertex(
            flagpole.posX,
            flagpole.posY + 25);
        curveVertex(
            flagpole.posX,
            flagpole.posY);
        curveVertex(
            flagpole.posX + 40,
            flagpole.posY);
        curveVertex(
            flagpole.posX,
            flagpole.posY + 25);
        endShape(CLOSE);
        strokeWeight(5);
        stroke(200, 200, 0);
        point(
            flagpole.posX,
            flagpole.posY);
        point(
            flagpole.posX,
            flagpole.posY + 25);
        pop()
    }
    //the game character
    if ((isLeft) && (isFalling)) {
        // add your jumping-left code
        stroke(0);
        fill(255);
        ellipse(gameChar_x,
            gameChar_y - 38,
            12, 15);
        //    bully
        noFill();
        ellipse(gameChar_x,
            gameChar_y - 15,
            8, 30);
        //Jumping leggs
        strokeWeight(1);
        stroke(0);
        beginShape();
        curveVertex(gameChar_x + 2,
            gameChar_y - 3);
        curveVertex(gameChar_x + 14,
            gameChar_y);
        curveVertex(gameChar_x + 14,
            gameChar_y + 2);
        curveVertex(gameChar_x + 2,
            gameChar_y);
        curveVertex(gameChar_x - 14,
            gameChar_y + 2);
        curveVertex(gameChar_x - 14,
            gameChar_y);
        endShape(CLOSE);
        // filling body
        //    leggs
        noStroke();
        fill(100);
        ellipse(gameChar_x,
            gameChar_y - 15,
            8, 30);
        beginShape();
        curveVertex(gameChar_x + 2,
            gameChar_y - 3);
        curveVertex(gameChar_x + 14,
            gameChar_y);
        curveVertex(gameChar_x + 14,
            gameChar_y + 2);
        curveVertex(gameChar_x + 2,
            gameChar_y);
        curveVertex(gameChar_x - 14,
            gameChar_y + 2);
        curveVertex(gameChar_x - 14,
            gameChar_y);
        endShape(CLOSE);
        //hands
        strokeWeight(0.5);
        fill(255);
        stroke(0);
        beginShape();
        curveVertex(gameChar_x,
            gameChar_y - 23);
        curveVertex(gameChar_x + 10,
            gameChar_y - 23);
        curveVertex(gameChar_x + 10,
            gameChar_y - 21);
        curveVertex(gameChar_x,
            gameChar_y - 21);
        endShape(CLOSE);
        //    shoes;
        fill(220);
        stroke(0);
        rect(gameChar_x + 14.50,
            gameChar_y,
            2, 8, 0, 5, 5, 5);
        rect(gameChar_x - 17.5,
            gameChar_y - 5,
            2, 8, 5, 5, 0, 5);
        //    eyes and mouth
        noFill();
        strokeWeight(0.5);
        ellipse(gameChar_x - 3,
            gameChar_y - 40,
            3);
        rect(gameChar_x - 5,
            gameChar_y - 35, 4, 2, 0, 5, 0, 5)
        strokeWeight(1);
        point(gameChar_x - 3,
            gameChar_y - 40);
    } else if ((isRight) && (isFalling)) {
        // add your jumping-right code   
        fill(255);
        stroke(0);
        ellipse(gameChar_x,
            gameChar_y - 38,
            12, 15);
        //    bully
        noFill();
        ellipse(gameChar_x,
            gameChar_y - 15,
            8, 30);
        //Jumping leggs
        strokeWeight(1);
        stroke(0);
        beginShape();
        curveVertex(gameChar_x + 2,
            gameChar_y - 3);
        curveVertex(gameChar_x + 14,
            gameChar_y);
        curveVertex(gameChar_x + 14,
            gameChar_y + 2);
        curveVertex(gameChar_x + 2,
            gameChar_y);
        curveVertex(gameChar_x - 14,
            gameChar_y + 2);
        curveVertex(gameChar_x - 14,
            gameChar_y);
        endShape(CLOSE);
        // filling body
        //leggs
        noStroke();
        fill(100);
        ellipse(gameChar_x,
            gameChar_y - 15, 8, 30);
        beginShape();
        curveVertex(gameChar_x + 2,
            gameChar_y - 3);
        curveVertex(gameChar_x + 14,
            gameChar_y);
        curveVertex(gameChar_x + 14,
            gameChar_y + 2);
        curveVertex(gameChar_x + 2,
            gameChar_y);
        curveVertex(gameChar_x - 14,
            gameChar_y + 2);
        curveVertex(gameChar_x - 14,
            gameChar_y);
        endShape(CLOSE);
        //hands
        strokeWeight(0.5);
        fill(255);
        stroke(0);
        beginShape();
        curveVertex(gameChar_x,
            gameChar_y - 23);
        curveVertex(gameChar_x - 10,
            gameChar_y - 23);
        curveVertex(gameChar_x - 10,
            gameChar_y - 21);
        curveVertex(gameChar_x,
            gameChar_y - 21);
        endShape(CLOSE);
        //    shoes;
        fill(220);
        stroke(0);
        rect(gameChar_x + 14.50,
            gameChar_y - 5,
            2, 8, 5, 5, 5, 0);
        rect(gameChar_x - 17.5,
            gameChar_y,
            2, 8, 5, 0, 5, 5);
        //    eyes amd mouth
        noFill();
        strokeWeight(0.5);
        ellipse(gameChar_x + 3,
            gameChar_y - 40,
            3);
        rect(gameChar_x + 1,
            gameChar_y - 35,
            4, 2, 5, 0, 5, 5)
        strokeWeight(1);
        point(gameChar_x + 3,
            gameChar_y - 40);
    } else if (isLeft) {
        // add your walking left code
        //Add your code here ...
        strokeWeight(1);
        fill(255);
        stroke(0);
        ellipse(gameChar_x,
            gameChar_y - 50,
            12, 15);
        //    bully
        noFill();
        ellipse(gameChar_x,
            gameChar_y - 27,
            8, 30);
        //  hands;
        strokeWeight(1);
        stroke(0);
        beginShape();
        curveVertex(gameChar_x + 2,
            gameChar_y - 15);
        curveVertex(gameChar_x + 5,
            gameChar_y);
        curveVertex(gameChar_x + 2,
            gameChar_y);
        curveVertex(gameChar_x,
            gameChar_y - 12);
        curveVertex(gameChar_x - 5,
            gameChar_y);
        curveVertex(gameChar_x - 8,
            gameChar_y);
        curveVertex(gameChar_x - 2,
            gameChar_y - 15);
        endShape(CLOSE);
        //    belly filling
        noStroke();
        fill(100);
        ellipse(gameChar_x,
            gameChar_y - 27,
            8, 30);
        //    leggs filling
        beginShape();
        curveVertex(gameChar_x + 2,
            gameChar_y - 15);
        curveVertex(gameChar_x + 5,
            gameChar_y);
        curveVertex(gameChar_x + 2,
            gameChar_y);
        curveVertex(gameChar_x,
            gameChar_y - 12);
        curveVertex(gameChar_x - 5,
            gameChar_y);
        curveVertex(gameChar_x - 8,
            gameChar_y);
        curveVertex(gameChar_x - 2,
            gameChar_y - 15);
        endShape(CLOSE);
        stroke(0);
        strokeWeight(0.5);
        fill(255);
        beginShape();
        curveVertex(gameChar_x,
            gameChar_y - 35);
        curveVertex(gameChar_x - 5,
            gameChar_y - 25);
        curveVertex(gameChar_x - 5,
            gameChar_y - 22);
        curveVertex(gameChar_x,
            gameChar_y - 30);
        endShape(CLOSE);
        //    shoes;
        fill(220);
        stroke(0);
        rect(gameChar_x - 2.5,
            gameChar_y,
            8, 2, 5, 0, 5, 5);
        rect(gameChar_x - 12,
            gameChar_y,
            8, 2, 5, 0, 5, 5);
        //    eyes and mouth
        noFill();
        strokeWeight(0.5);
        ellipse(gameChar_x - 3,
            gameChar_y - 52,
            3);
        rect(gameChar_x - 5,
            gameChar_y - 47,
            4, 2, 0, 5, 0, 5)
        strokeWeight(1);
        point(gameChar_x - 3,
            gameChar_y - 52);

    } else if (isRight) {
        // add your walking right code
        stroke(0);
        fill(255);
        ellipse(gameChar_x,
            gameChar_y - 50,
            12, 15);
        //    bully
        noFill();
        ellipse(gameChar_x,
            gameChar_y - 27,
            8, 30);
        strokeWeight(1);
        stroke(0);
        beginShape();
        curveVertex(gameChar_x + 2,
            gameChar_y - 15);
        curveVertex(gameChar_x + 5,
            gameChar_y);
        curveVertex(gameChar_x + 2,
            gameChar_y);
        curveVertex(gameChar_x,
            gameChar_y - 12);
        curveVertex(gameChar_x - 5,
            gameChar_y);
        curveVertex(gameChar_x - 8,
            gameChar_y);
        curveVertex(gameChar_x - 2,
            gameChar_y - 15);
        endShape(CLOSE);
        noStroke();
        fill(100);
        //    belly filling
        ellipse(gameChar_x,
            gameChar_y - 27,
            8, 30);
        //    leggs filling
        beginShape();
        curveVertex(gameChar_x + 2,
            gameChar_y - 15);
        curveVertex(gameChar_x + 5,
            gameChar_y);
        curveVertex(gameChar_x + 2,
            gameChar_y);
        curveVertex(gameChar_x,
            gameChar_y - 12);
        curveVertex(gameChar_x - 5,
            gameChar_y);
        curveVertex(gameChar_x - 8,
            gameChar_y);
        curveVertex(gameChar_x - 2,
            gameChar_y - 15);
        endShape(CLOSE);
        //    hand
        stroke(0);
        strokeWeight(0.5);
        fill(255);
        beginShape();
        curveVertex(gameChar_x,
            gameChar_y - 35);
        curveVertex(gameChar_x + 5,
            gameChar_y - 25);
        curveVertex(gameChar_x + 5,
            gameChar_y - 22);
        curveVertex(gameChar_x,
            gameChar_y - 30);
        endShape(CLOSE);
        //    shoes;
        fill(220);
        stroke(0);
        rect(gameChar_x + 1.50,
            gameChar_y, 8, 2, 0, 5, 5, 5);
        rect(gameChar_x - 9,
            gameChar_y, 8, 2, 0, 5, 5, 5);
        //mouth and eyes
        noFill();
        strokeWeight(0.5);
        ellipse(gameChar_x + 3,
            gameChar_y - 52, 3);
        rect(gameChar_x + 1,
            gameChar_y - 47, 4, 2, 5, 0, 5, 5);
        strokeWeight(1);
        point(gameChar_x + 3,
            gameChar_y - 52);


    } else if (isFalling) {
        // add your jumping facing forwards code
        //Add your code here ...
        strokeWeight(1);
        fill(255);
        stroke(0);
        ellipse(gameChar_x,
            gameChar_y - 37.5,
            12, 15);
        //  bully
        noFill();
        ellipse(gameChar_x,
            gameChar_y - 14.5,
            12, 30);
        // left hand
        rect(gameChar_x - 10,
            gameChar_y - 22.5,
            3, 10, 0, 0, 5, 5);
        // right hand
        rect(gameChar_x + 7,
            gameChar_y - 37.5,
            3, 10, 5, 5, 0, 0);
        //    sholder
        rect(gameChar_x - 10,
            gameChar_y - 27.5,
            20, 5, 5, 0, 5, 0);
        // bout
        rect(gameChar_x - 6,
            gameChar_y - 4.5,
            12, 5, 5, 5, 0, 0);
        //    legs
        rect(gameChar_x + 2,
            gameChar_y + 0.4,
            4, 7, 0, 0, 5, 5);
        rect(gameChar_x - 6,
            gameChar_y + 0.4,
            4, 7, 0, 0, 5, 5);
        //face;
        strokeWeight(1);
        //eyes
        point(gameChar_x - 2,
            gameChar_y - 39.5);
        point(gameChar_x + 2,
            gameChar_y - 39.5);
        strokeWeight(0.5);
        ellipse(gameChar_x - 2,
            gameChar_y - 39.5,
            3);
        ellipse(gameChar_x + 2,
            gameChar_y - 39.5,
            3);
        //the mouth;
        rect(gameChar_x - 2,
            gameChar_y - 34.5,
            4, 2, 5, 5, 5, 5);
        //shoes;
        fill(0);
        stroke(0);
        rect(gameChar_x - 7,
            gameChar_y,
            4, 8, 5, 5, 1, 1);
        noStroke();
        fill(255, 95, 31);
        //body filling:
        noStroke();
        fill(100);
        // bully
        ellipse(gameChar_x,
            gameChar_y - 14.5,
            12, 30);
        //    sholder
        rect(gameChar_x - 10,
            gameChar_y - 27.5,
            20, 5, 5, 0, 5, 0);
        // bout
        rect(gameChar_x - 6,
            gameChar_y - 4.5,
            12, 5, 5, 5, 0, 0);
        // legs
        rect(gameChar_x + 2,
            gameChar_y + 0.4,
            4, 7, 0, 0, 5, 5);
        rect(gameChar_x - 6,
            gameChar_y + 0.4,
            4, 7, 0, 0, 5, 5);
        //shoes;
        fill(0);
        stroke(0);
        rect(gameChar_x + 3,
            gameChar_y,
            4, 8, 5, 5, 1, 1);


    } else {
        // add your standing front facing code
        strokeWeight(1);
        fill(255);
        stroke(0);
        ellipse(gameChar_x,
            gameChar_y - 56.5,
            12, 15);
        noFill();
        // bully
        ellipse(gameChar_x,
            gameChar_y - 33.5,
            12, 30);
        //left hand
        fill(255);
        rect(gameChar_x - 10,
            gameChar_y - 41.5,
            3, 15, 0, 0, 5, 5);
        // right hand
        rect(gameChar_x + 7,
            gameChar_y - 41.5,
            3, 15, 0, 0, 5, 5);
        noFill();
        //sholder
        rect(gameChar_x - 10,
            gameChar_y - 46.5,
            20, 5, 5, 5, 0, 0);
        //bout
        rect(gameChar_x - 6,
            gameChar_y - 23.5,
            12, 5, 5, 5, 0, 0);
        //legs
        rect(gameChar_x + 1,
            gameChar_y - 19,
            5, 20, 0, 0, 5, 5);
        rect(gameChar_x - 6,
            gameChar_y - 19,
            5, 20, 0, 0, 5, 5);
        //face;
        strokeWeight(1)
        //eyes
        point(gameChar_x - 2,
            gameChar_y - 58.5);
        point(gameChar_x + 2,
            gameChar_y - 58.5);
        strokeWeight(0.5);
        ellipse(gameChar_x - 2,
            gameChar_y - 58.5,
            3);
        ellipse(gameChar_x + 2,
            gameChar_y - 58.5,
            3);
        //the mouth;
        rect(gameChar_x - 2,
            gameChar_y - 53.5,
            4, 2, 5, 5, 5, 5);
        noStroke();
        fill(100);
        //charactor filling:
        ellipse(gameChar_x,
            gameChar_y - 33.5,
            12, 30);
        //bout
        rect(gameChar_x - 6,
            gameChar_y - 23.5,
            12, 5, 5, 5, 0, 0);
        //legs
        rect(gameChar_x + 1,
            gameChar_y - 18.5,
            5, 20, 0, 0, 5, 5);
        rect(gameChar_x - 6,
            gameChar_y - 18.5,
            5, 20, 0, 0, 5, 5);
        rect(gameChar_x - 10,
            gameChar_y - 46.5,
            20, 5, 5, 5, 0, 0);
        //shoes;
        fill(220);
        stroke(0);
        rect(gameChar_x + 0.5,
            gameChar_y,
            6, 2, 5, 5, 0);
        rect(gameChar_x - 6.5,
            gameChar_y,
            6, 2, 5, 5, 0);

    }
    //drawing the collectable item with size start from 1
    for (var i = 0; i < collectables.length; i++) {
        collectables[i].size = random(0.5, .6)

        if (!collectables[i].isFound) {
            noStroke(0);
            fill(220, 0, 0)
            strokeWeight(1);
            stroke(0);
            fill(0)
            ellipse(
                collectables[i].posX - (10 * collectables[i].size),
                collectables[i].posY - (32 * collectables[i].size),
                21 * collectables[i].size);
            ellipse(
                collectables[i].posX + (10 * collectables[i].size),
                collectables[i].posY - (32 * collectables[i].size),
                21 * collectables[i].size);
            beginShape();
            curveVertex(
                collectables[i].posX + (1 * collectables[i].size),
                collectables[i].posY + (1 * collectables[i].size));
            curveVertex(
                collectables[i].posX + (1 * collectables[i].size),
                collectables[i].posY + (1 * collectables[i].size));
            vertex(
                collectables[i].posX + (20 * collectables[i].size),
                collectables[i].posY + (-32 * collectables[i].size));
            vertex(
                collectables[i].posX + (-20 * collectables[i].size),
                collectables[i].posY + (-32 * collectables[i].size));
            endShape(CLOSE);
            //    //test for coolectable (distance):
            collectableDist = dist(
                collectables[i].posX,
                collectables[i].posY,
                gameChar_x,
                gameChar_y)
            //Make the gameChar grab the item
            if (collectableDist > 13 && collectableDist < 32) {
                collectables[i].isFound = true;
                gameScore += 1;
                collectSound.play();
            }


        }
    }

    //callclating game char endpoint and make the flag changed:
    if (falgpoleDist == 17) {
        flagpole.posY = floorPos_y - 190;
        flagpole.isReached = true;
        levelComplete = true;
        gameOver = true;

    }

    pop();

    push();
    textSize(20);
    strokeWeight(3);
    text("Game Score :" + gameScore, 50, 50);
    pop();

    ///////////INTERACTION CODE//////////
    //Put conditional statements to move the game character below here
    //If and else statment to move the camra other side of the gameChar

    if (isLeft) {
        gameChar_x -= gameCharSpeed;

    } else {
        cameraPosx += gameCharSpeed;
    }
    if (isRight) {
        gameChar_x += gameCharSpeed;

    } else {
        cameraPosx -= gameCharSpeed;
    }
    // jumping and back to the floor
    if (gameChar_y < floorPos_y) {
        gameChar_y += gravity;
        isFalling = true;
    } else {
        isFalling = false;
    }
    if (gameOver && !levelComplete) {
        fill(0);
        rect(288, 220, 600, 100);
        textSize(75);
        textFont('Georgia');
        fill(250, 0, 0);
        text('GameOver Kidoo', 300, 300);

    }

    if (levelComplete) {
        fill(255);
        rect(288, 220, 700, 100);
        textSize(75);
        textFont('Georgia');
        fill(0, 250, 0)
        text('Level complet Kidoo', 300, 300);
        isLeft = false;
        isRight = false;
    }


}

function keyPressed() {
    // if statements to control the animation of the character when
    // keys are pressed.
    if (key == "a" && !gameOver) {
        isLeft = true;
        walkSound.play(); //walking sound
    } else if (key == "d" && !gameOver) {
        isRight = true;
        walkSound.play(); //walking sound
    } else if (key == "w" && !gameOver) {
        jumpSound.play(); //jumping sound
        if (isFalling == false && gameChar_y == floorPos_y) {
            gameChar_y -= jumpHeight;

        }
    }
}

function keyReleased() {
    // if statements to control the animation of the character when
    // keys are released.
    if (key == "a") {
        isLeft = false;
    } else if (key == "d") {
        isRight = false;

    } else if (key == "w") {
        isFalling = false;
    }
}
