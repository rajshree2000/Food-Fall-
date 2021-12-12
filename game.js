/*
 *   game.js
 *   Main file for Meal Drop!
 */

// Speed of Game
var scoreCount = 0;

var childrenToDelete = [];
const foodFadeDuration = 90;
const displayNoFadeDuration = 100;
const pointFadeDuration = 80;
const MAX_OBSTACLE = 1;
const comboColors = ["#fff", "#ffb347", "#d9c846", "#40d97c ", "#12ff19"];
const foodScoreVal = 10;
var lastXPos = 0;
var lastYPos = 0;
var maxPossibleScore = 0;

//#d92c3f
// check the amount of food caught
// resets every 5 seconds in current implementation
var caughtFood = [];
// for combo function
var eggCount = 0;
var cowLevelHasBeenActivated = false;

var score = new PIXI.Text(scoreCount, {
    fontSize: 50,
    fontFamily: 'LemonMilk',
    fill: 'white'
});

function gameInit() {
    if (gameBuild) {
        BG_RATE = 50;
        obstacleCount = 0;
        countDownIndex = 0;
        foodCount = 0;
        scoreCount = 0;
        afterCountDown = false;
        var three = new Sprite(resources['assets/img/sprites/cd-3.png'].texture);
        var two = new Sprite(resources['assets/img/sprites/cd-2.png'].texture);
        var one = new Sprite(resources['assets/img/sprites/cd-1.png'].texture);
        var go = new Sprite(resources['assets/img/sprites/cd-go.png'].texture);
        countDownNumbers = [three, two, one, go];
        gameBuildTime = new Date().getTime();
        comboMultiplier = 1;
        isCombo = false;
        numOfFoodFallen = 0;
        maxPossibleScore = 0;
        isFirstRun = true;
        initCatcher();
        initComboDisplay();
        BASKET_HEIGHT = catcher.height;
        BASKET_WIDTH = catcher.width;
        X_OFFSET = BASKET_WIDTH / 2;
        Y_OFFSET = BASKET_HEIGHT / 2;
        score.style.fontSize = 50;
        score.style.fill = "#fff";
    }
    gameBuild = false;

}

/*
 For displaying and removing the numbers for the countdown.
 */
function displayNo() {
    if (countDownIndex >= 4) return;
    var curNum = countDownNumbers[countDownIndex];
    stage.addChild(curNum);
    curNum.x = 100;
    curNum.y = 50;
    fadeOut(curNum, displayNoFadeDuration);
    ++countDownIndex;
}

function makeFood() {
    const MAX_FOOD = 5;
    if (foodCount >= MAX_FOOD) return;
    ++foodCount;
    var newFoodIndex = weightedRand(fallingObjects);
    var newFood = PIXI.Sprite.fromImage('assets/img/sprites/' + fallingObjects[newFoodIndex].name + '.png');
    newFood.name = fallingObjects[newFoodIndex];
    newFood.x = getRandomInt(newFood.width, GAME_WIDTH - newFood.width);
    newFood.y = -newFood.height;
    newFood.anchor.x = 0.5;
    newFood.anchor.y = 0.5;
    newFood.isFood = true;
    newFood.velocityY = 0; //10 pixels per second
    newFood.velocityX = 0;
    newFood.accelerationY = 210; // was at 210
    var randomBoolean = Math.random() >= 0.5;
    if (randomBoolean) {
        newFood.rotateFactor = Math.random() * 0.1;
    }
    else
        newFood.rotateFactor = -Math.random() * 0.1;
    ++numOfFoodFallen;
    stage.addChild(newFood);
}

function removeItem(childToDelete) {
    stage.removeChild(childToDelete);
}

// Determine if basket and food are colliding
function isInBasket(basket, food) {

    var basketLeftX = basket.x - X_OFFSET;
    var basketRightX = basket.x + BASKET_WIDTH - X_OFFSET;
    var basketTopY = basket.y - Y_OFFSET;
    var basketBotY = basket.y + BASKET_HEIGHT - Y_OFFSET;

    var upperLeftBasket = { x: basketLeftX + 10, y: basketTopY };
    var lowerRightBasket = { x: basketRightX - 10, y: (basketTopY + 30) };
    var foodTopY = food.y - (food.height / 2) + 5;

    var inBasket = (food.x > upperLeftBasket.x) && (foodTopY > upperLeftBasket.y)
        && (food.x < lowerRightBasket.x) && (foodTopY < lowerRightBasket.y);
    return inBasket;
}

function isBounce(basket, food, catcherVelocityX) {

    var isBounce = false;
    var foodLeftX = food.x - food.width / 2;
    var foodRightX = food.x + food.width / 2;

    var foodTopY = food.y - food.height / 2;
    var foodBotY = food.y + food.height / 2;

    var basketLeftX = basket.x - X_OFFSET;
    var basketRightX = basket.x + BASKET_WIDTH - X_OFFSET;
    var basketTopY = basket.y - Y_OFFSET;
    var basketBotY = basket.y + BASKET_HEIGHT - Y_OFFSET;

    var basketMidLeftX = basketLeftX + 10;
    var basketMidLeftY = basket.height / 2;

    var basketMidRightX = basketRightX - 10;
    var basketMidRightY = basket.height / 2;

    var foodIsLeftOfBasket = (foodLeftX < basketLeftX);
    var foodIsRightOfBasket = (foodRightX > basketRightX);

    var foodJustAboveBasket = (foodTopY < basketTopY) && (foodBotY > basketTopY);
    var foodWithinHeightBasket = (foodTopY > basketTopY) && (foodBotY < basketBotY);
    var foodJustBelowBasket = (foodTopY < basketBotY) && (foodBotY > basketBotY);

    if (foodJustAboveBasket) {
        if (foodIsLeftOfBasket) {
            var upperLeftBasket = { x: basketLeftX, y: basketTopY + 20 };
            isBounce = (catcherVelocityX > 0) && (foodLeftX > upperLeftBasket.x);
        }
        else if (foodIsRightOfBasket) {
            var upperRightBasket = { x: basketRightX, y: basketTopY + 20 };
            isBounce = (catcherVelocityX < 0) && (foodRightX < upperRightBasket.x);
        }
    } else if (foodWithinHeightBasket) {
        if (foodIsLeftOfBasket) {
            var midLeftBasket = { x: basketMidLeftX, y: basketMidLeftY };
            isBounce = (catcherVelocityX > 0) && (foodRightX > midLeftBasket.x);
        }
        else if (foodIsRightOfBasket) {
            var midRightBasket = { x: basketMidRightX, y: basketMidRightY };
            isBounce = (catcherVelocityX < 0) && (foodLeftX < midRightBasket.x);
        }
    } else if (foodJustBelowBasket) {
        if (foodIsLeftOfBasket) {
            var lowerLeftBasket = { x: basketLeftX, y: basketBotY };
            isBounce = (catcherVelocityX > 0) && (foodRightX > lowerLeftBasket.x);
        } else if (foodIsRightOfBasket) {
            var lowRightBasket = { x: basketRightX, y: basketBotY };
            isBounce = (catcherVelocityX < 0) && (foodLeftX < lowRightBasket.x);
        }
    }
    return isBounce;
}

function isBounceOffBottom(basket, food) {

    var foodTopY = food.y - (food.height / 2);
    var basketBotY = basket.y + BASKET_HEIGHT - Y_OFFSET;
    var foodIsBelowBasket = (foodTopY > basketBotY);
    if (!foodIsBelowBasket) return false;
    else {
        var basketBotLeftX = basket.x - X_OFFSET + 10;
        var basketBotRightX = basket.x - X_OFFSET + BASKET_WIDTH - 10;
        var foodX = food.x;
        var foodIsInLineBasket = (foodX > basketBotLeftX) && (foodX < basketBotRightX);
        if (!foodIsInLineBasket) return false;
        else {
            var upperBoundY = basketBotY + 20;
            var isBounceOffBottom = foodTopY > basketBotY && foodTopY < upperBoundY;
            food.isBounceOffBottom = isBounceOffBottom;
            return isBounceOffBottom;
        }
    }
}

function velocityOfRotatingFruits() {

    for (var i = 1; i <= numOfFoodFallen; i++) {
        if (i >= 5) {
            maxPossibleScore += 5 * foodScoreVal;
        } else {
            maxPossibleScore += foodScoreVal * i;
        }
    }
    return maxPossibleScore < scoreCount;
}

function foodFall() {
    var currtime = new Date().getTime();
    var deltaTime = parseFloat((currtime - lastTime) / 1000);
    var currentElapsedGameTime = parseInt((currtime - gameBuildTime) / 1000);
    var currXPos = catcher.x;
    var currYPos = catcher.y;

    if (!afterCountDown && currentElapsedGameTime == countDownIndex) {
        displayNo();
        if (currentElapsedGameTime == 4) {
            afterCountDown = true;
        }
    }
    if (afterCountDown) {
        if (isFirstRun) {
            var catcherVelocityX = 0;
        } else {
            var catcherVelocityX = (lastXPos - currXPos) / deltaTime;
        }
        var catcherVelocityY = (lastYPos - currYPos) / deltaTime;

        lastXPos = catcher.x;
        lastYPos = catcher.y;
        makeFood();
        if (currentElapsedGameTime < 25) {
            makeObstacle();
        } else {
            makeTwoObstacles();
        }

        for (var i in stage.children) {
            var fallingItem = stage.children[i];
            if (fallingItem.isObstacle) {
                var curObstacle = fallingItem;
                if (curObstacle.x < (-curObstacle.width)) {
                    childrenToDelete.push(curObstacle);
                    curObstacle.destroy();
                    --obstacleCount;
                } else {
                    curObstacle.x -= BG_RATE * deltaTime + backgroundScrollSpeed.grass;
                    obstacleCollision(catcher, curObstacle);
                }
            }
            if (fallingItem.isFood) {

                var deltaY = fallingItem.velocityY * deltaTime;
                var deltaVy = fallingItem.accelerationY * deltaTime;

                fallingItem.y += deltaY;
                fallingItem.x += fallingItem.velocityX;

                if (!fallingItem.isBounceOffBottom) {
                    fallingItem.velocityY += deltaVy;
                } else {
                    fallingItem.velocityY += fallingItem.newVelocityY;
                }
                fallingItem.rotation += fallingItem.rotateFactor;
                var isFoodOffScreen = fallingItem.y > GAME_HEIGHT ||
                    fallingItem.x > GAME_WIDTH ||
                    fallingItem.x < 0;

                if (!fallingItem.isHitBasket && isFoodOffScreen) {
                    decreaseScore();
                    makePointDecrementer(fallingItem);
                    breakCombo();
                    childrenToDelete.push(fallingItem);
                    fallingItem.destroy();
                    resetComboMulitplier();
                    updateComboDisplay();
                    --foodCount;
                } else if (!fallingItem.isHitBasket && isInBasket(catcher, fallingItem)) {
                    let type = getFoodType(fallingItem);
                    caughtFood.push(fallingItem.name);
                    makePointIncrementer(catcher, fallingItem)
                    modScore(fallingItem);
                    increaseComboMultiplier();
                    updateComboDisplay();
                    fadeOutFood(fallingItem);
                    isCowLevelCombo();
                    gameSFX.play('point');
                    stage.removeChild(score);
                    fallingItem.isHitBasket = true;
                } else if (!fallingItem.isHitBasket && isBounce(catcher, fallingItem, catcherVelocityX)) {
                    var newItemVelocityX = 1000 / catcherVelocityX;
                    if (newItemVelocityX > 6) {
                        newItemVelocityX = 6;
                    } else if (newItemVelocityX < -6) {
                        newItemVelocityX = -6;
                    }
                    fallingItem.velocityX = -newItemVelocityX;
                } else if (!fallingItem.isHitBasket && isBounceOffBottom(catcher, fallingItem)) {
                    var newItemVelocityY = 1000 / catcherVelocityY;
                    if (newItemVelocityY > 6) {
                        newItemVelocityY = 6;
                    } else if (newItemVelocityY < -6) {
                        newItemVelocityY = -6;
                    }
                    fallingItem.newVelocityY = (fallingItem.velocityY / 10) + -newItemVelocityY;
                }
            }
            if (fallingItem.isPointCounter || fallingItem.isPointDecrementer) {
                fallingItem.y -= 3;
            }
        }
        if (currentElapsedGameTime % 2 === 0) {
            speedUpGame(deltaTime);
        }

        if (currentElapsedGameTime % 5 === 0) {
            clearCaughtFood();
        }
        for (var i = 0; i < childrenToDelete.length; i++) {
            removeItem(childrenToDelete[i]);
        }
        clearTimer();
        tiltBasket(catcherVelocityX);
        isFirstRun = false;
    }
}

function tiltBasket(catcherVelocityX) {
    var newCatcherRotation = -catcherVelocityX / 30000;
    var currCatcherOrientation = catcher.rotation;
    var decelerationRate;
    if (currCatcherOrientation > 0.2) {
        catcher.rotation = 0.2;
    } else if (currCatcherOrientation < -0.2) {
        catcher.rotation = -0.2;
    } else if (Math.floor(catcherVelocityX == 0)) {

        if (currCatcherOrientation < 0.01 && currCatcherOrientation > -0.01) {
            catcher.rotation = 0;
        } else if (currCatcherOrientation > 0) {
            decelerationRate = -0.04;
            catcher.rotation += decelerationRate;
        } else if (currCatcherOrientation < 0) {
            decelerationRate = 0.04;
            catcher.rotation += decelerationRate;
        }
    } else {
        catcher.rotation += newCatcherRotation;
    }
}
function makeTwoObstacles() {
    if (obstacleCount >= MAX_OBSTACLE) return;
    var newTopObstacle = new Sprite(resources['assets/img/sprites/obstacle.png'].texture);
    newTopObstacle.x = GAME_WIDTH;
    newTopObstacle.height = getRandomInt(30, (2 * (GAME_HEIGHT / 3))); //
    newTopObstacle.y = 0;
    newTopObstacle.width = 50;
    newTopObstacle.isObstacle = true;
    stage.addChild(newTopObstacle);

    var newBotObstacle = new Sprite(resources['assets/img/sprites/obstacle.png'].texture);
    newBotObstacle.x = newTopObstacle.x;
    newBotObstacle.y = newTopObstacle.height + (2 * catcher.height);//newBotObstacle.height ;
    newBotObstacle.height = GAME_HEIGHT - newBotObstacle.y;
    newBotObstacle.width = newTopObstacle.width;
    newBotObstacle.isObstacle = true;
    stage.addChild(newBotObstacle);
    obstacleCount += 2;
}

function makeObstacle() {
    if (obstacleCount >= MAX_OBSTACLE) return;
    var randomBoolean = Math.random() >= 0.5;

    if (randomBoolean) {
        var newTopObstacle = new Sprite(resources['assets/img/sprites/obstacle.png'].texture);
        newTopObstacle.x = GAME_WIDTH;
        newTopObstacle.height = getRandomInt(30, (2 * (GAME_HEIGHT / 3))); //
        newTopObstacle.y = 0;
        newTopObstacle.width = 50;
        newTopObstacle.isObstacle = true;
        stage.addChild(newTopObstacle);
    }
    else {
        var newBotObstacle = new Sprite(resources['assets/img/sprites/obstacle.png'].texture);
        newBotObstacle.x = GAME_WIDTH;
        newBotObstacle.y = 60 + (2 * catcher.height);
        newBotObstacle.height = GAME_HEIGHT - newBotObstacle.y;
        newBotObstacle.width = 50;
        newBotObstacle.isObstacle = true;
        stage.addChild(newBotObstacle);
    }
    ++obstacleCount;

}
/*
 need xspeed
 */
function fadeOutFood(fallingItem) {
    fallingItem.velocityY = 10;
    fallingItem.rotateFactor = 0;
    fallingItem.isHitBasket = true;
    fadeOut(fallingItem, foodFadeDuration);
}

function obstacleCollision(catcher, obstacle) {
    if (isCollideObstacle(catcher, obstacle)) {
        endGame();
        gameSFX.play('gameOver');
        state = gameOver;
        gameOverBuild = true;
        catcher.alpha = 0;
    }
}

function isCollideObstacle(basket, obstacle) {

    return !(((basket.y + BASKET_HEIGHT - Y_OFFSET - 15) < (obstacle.y)) ||
        ((basket.y - Y_OFFSET + 15) > (obstacle.y + obstacle.height)) ||
        ((basket.x + BASKET_WIDTH - X_OFFSET - 15) < obstacle.x) ||
        ((basket.x - X_OFFSET + 15) > (obstacle.x + obstacle.width)));
}

function addScore() {

    score.x = GAME_WIDTH - (score.width);
    score.y = GAME_HEIGHT - (score.height + 50);
    score.anchor.x = 0.5;
    score.text = scoreCount;

    stage.addChild(score);
}

function addHighScore(scoreCount) {
    firebase.auth().onAuthStateChanged((user) => {
        //If there is a user signed in
        if (user) {
            var scoreInDatabase = firebase.database().ref("users/" + user.uid + "/score");
            scoreInDatabase.on('value', function (scoreSnapshot) {
                if (scoreCount > scoreSnapshot.val()) {
                    //update database with new highscore.
                    var updateScore = firebase.database().ref("users/" + user.uid);
                    updateScore.update({
                        score: scoreCount
                    });
                }
            });
        }
    });
}

function endGame() {
    if (velocityOfRotatingFruits()) {
        scoreCount = 0;
    }
    menuBuild = true;
    gameBuild = true;
    addHighScore(scoreCount);
    destroyOldObjects();
    stage.removeChild(comboDisplay);
}

function makePointDecrementer(item) {
    var pointDecrementer = new PIXI.Text("-10", {
        fontSize: 50,
        fontFamily: 'LemonMilk',
        fill: '#ff0005'
    });
    pointDecrementer.isPointDecrementer = true;
    if (item.x > GAME_WIDTH) {
        pointDecrementer.x = GAME_WIDTH - pointDecrementer.width;
        pointDecrementer.y = item.y;
    } else if (item.x < 0) {
        pointDecrementer.x = 10;
        pointDecrementer.y = item.y;
    } else {
        pointDecrementer.y = GAME_HEIGHT - 10;
        pointDecrementer.x = item.x;

    }
    stage.addChild(pointDecrementer);
    fadeOut(pointDecrementer, pointFadeDuration);
}

function makePointIncrementer(catcher, item) {
    var pointCounter = new PIXI.Text("+" + comboMultiplier * item.name.scoreValue, {
        fontSize: 50,
        fontFamily: 'LemonMilk',
        fill: '#12ff19'
    });
    pointCounter.isPointCounter = true;
    pointCounter.x = item.x;
    pointCounter.y = catcher.y - catcher.height;
    stage.addChild(pointCounter);
    fadeOut(pointCounter, pointFadeDuration);
}
/**
 * Adds all food and obstacles to list and destroys them.
 */
function destroyOldObjects() {
    for (var i in stage.children) {
        var item = stage.children[i];
        var isRemoved = item.isFood || item.isObstacle
            || item.name == 'score';
        if (isRemoved) {
            childrenToDelete.push(stage.children[i]);
        }
    }
    for (var i = 0; i < childrenToDelete.length; i++) {
        removeItem(childrenToDelete[i]);
        childrenToDelete[i].destroy()
    }
}
/**
 * Returns the name of the given food.
 * @param food the food to decipher.
 */
function getFoodType(food) {
    return food.name;
}

/**
 * Sets the amount of food caught to zero when needed.
 */
function clearCaughtFood() {
    caughtFood.length = 0;
}

/**
 * Modifies the score based on the type of food given.
 * @param food
 */
function modScore(food) {
    var type = getFoodType(food);
    scoreCount += comboMultiplier * type.scoreValue;
}

/**
 * Decrements the score.
 */
function decreaseScore() {
    if (scoreCount > 0) {
        scoreCount -= 10;
    }
    if (scoreCount < 0) {
        scoreCount = 0;
    }
}

function increaseComboMultiplier() {
    if (comboMultiplier == 5) return;
    comboMultiplier += 1;
}

function resetComboMulitplier() {
    comboMultiplier = 1;
}

function breakCombo() {
    isCombo = false;
    comboMultiplier = 1;
}

function initComboDisplay() {
    var color = comboColors[comboMultiplier - 1];
    comboDisplay = new PIXI.Text(comboMultiplier + "x", {
        fontSize: 50,
        fontFamily: 'LemonMilk',
        fill: color
    });
    comboDisplay.name = "comboDisplay";
    comboDisplay.x = GAME_WIDTH - 70;
    comboDisplay.y = GAME_HEIGHT - 200;
    stage.addChild(comboDisplay);
}

function updateComboDisplay() {
    comboDisplay.text = comboMultiplier + "x";
    comboDisplay.style.fill = comboColors[comboMultiplier - 1];
}
/**
 * Shows in logs how much food has been caught for a certain period
 * @returns {boolean} : whether x (3 right now) eggs have been caught.
 */
function isCowLevelCombo() {
    for (i = 0; i < caughtFood.length; i++) {
        if (caughtFood[i] === "egg") {
            eggCount++;
        } else {
            eggCount = 0;
        }
        if (eggCount >= 10) {
            eggCount = 0;
            if (!cowLevelHasBeenActivated) {
                cowLevelBuild = true;
                state = cowLevel;
                cowLevelHasBeenActivated = !cowLevelHasBeenActivated;
            }
            return true;
        }
    }
    return false;
}
