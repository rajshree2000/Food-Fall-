    /* DATABASE ----------------------------------------------------------------------------------------------------------*/

    var database = firebase.database();
    var userData = [];
    var i = 0;

    var scoresRef = firebase.database().ref("users").orderByKey();
    scoresRef.once("value")
        .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var user = {};
                var key = childSnapshot.key;
                var childData = childSnapshot.val();
                user.name = childData.userName;
                user.score = childData.score;
                userData[i] = user;
                i++;
            });
        });

    /* MENU---------------------------------------------------------------------------------------------------------------*/

    /* TODO: Menu button listeners */

    var btnLeaderBoardExit = document.getElementById("btn-leader-board-exit");
    var btnMainMenuLeaderBoard = document.getElementById("btn-main-menu-leader-board");
    var btnMainMenuVolumeOn = document.getElementById("btn-main-menu-volume-on");
    var btnMainMenuVolumeOff = document.getElementById("btn-main-menu-volume-off");
    var btnPlay = document.getElementById("btn-main-menu-play");
    var leaderBoard = document.getElementById("leader-board");
    var instructions = document.getElementById("instructions");
    var randomFactBox = document.getElementById("random-fact");
    var logo = document.getElementById("game-header");
    var btnShare = document.getElementById("btn-main-menu-share");
    var welcomeUserInfo = document.getElementById('welcomeUserInfo');

    // Main-menu share button
    btnShare.addEventListener("click", shareBtn);
    btnShare.addEventListener("touchend", shareBtn);
    function shareBtn() {
        FB.ui({
            method: 'share',
            href: 'http://www.foodfall.ca',
        }, function(response){});
    }

    // Main-menu play button
    btnPlay.addEventListener("click", playBtn);
    btnPlay.addEventListener("touchend", playBtn);
    function playBtn() {
        playGameFromMenu();
        menuSound.play('menu');
    }

    // Listeners for exiting the leader-board
    btnLeaderBoardExit.addEventListener("click", btnExitLeaderBoard);
    btnLeaderBoardExit.addEventListener("touchend", btnExitLeaderBoard);
    function btnExitLeaderBoard() {
        showMenu();
        displayLogOutMainMenu();
        logOutPanel.style.display = "block";
        leaderBoard.style.display = "none";
        btnMainMenuLeaderBoard.style.display = "block";
    }

    // Listeners for entering the leader-board
    btnMainMenuLeaderBoard.addEventListener("click", btnLeaderBoard);
    btnMainMenuLeaderBoard.addEventListener("touchend", btnLeaderBoard);
    function btnLeaderBoard() {
        document.getElementById("table-body").innerHTML = "";
        updateLeader().done(function(){
            popLeaderboard();
        });
        hideMenu();
        logOutPanel.style.display = "none";
        leaderBoard.style.display = "block";
        btnMainMenuLeaderBoard.style.display = "none";
    }

    function updateLeader() {
        var def = $.Deferred();
        def.resolve(dumpScores());
        return def.promise();
    }

    // Sound on and off buttons
    btnMainMenuVolumeOn.addEventListener("click", btnVolumeOff);
    btnMainMenuVolumeOn.addEventListener("touchend", btnVolumeOff);
    function btnVolumeOn() {
        unmuteSound();
        btnMainMenuVolumeOn.style.display = "inline-block";
        btnMainMenuVolumeOff.style.display = "none";
    }
    btnMainMenuVolumeOff.addEventListener("click", btnVolumeOn);
    btnMainMenuVolumeOff.addEventListener("touchend", btnVolumeOn);
    function btnVolumeOff() {
        muteSound();
        btnMainMenuVolumeOn.style.display = "none";
        btnMainMenuVolumeOff.style.display = "inline-block";
    }

    /* GAME --------------------------------------------------------------------------------------------------------------*/

    // Stage-size parameterss
    var GAME_WIDTH = 800;
    var GAME_HEIGHT = 500;
    var slowDown = 0.2;

    // Background elements relative speeds
    var backgroundScrollSpeed = {
        mtnFar: -0.7,
        mtnMid: -0.45,
        clouds: -0.45,
        trees: -0.2,
        grass: 0.5,
        obstacle: 1.3
    };

    // Overall background rate
    var BG_RATE = 50;

    // Background textures
    var sky,
        mtnFar,
        mtnMid,
        ground,
        clouds,
        trees,
        grass;

    // Time comparison (currentTime - lastTime)
    var lastTime;

    //Aliases.
    var Container = PIXI.Container,
        autoDetectRenderer = PIXI.autoDetectRenderer,
        loader = PIXI.loader,
        resources = PIXI.loader.resources,
        Sprite = PIXI.Sprite;

    // Rendering Options.
    var myView = document.getElementById('myCanvas');

    var rendererOptions = {
        antiAliasing: false,
        transparent: false,
        resolution: window.devicePixelRatio,
        autoResize: true
    };

    // Create renderer.
    var renderer = autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT, myView, rendererOptions);

    // Create new Container for stage.
    var stage = new Container();

    // Renderer position on screen.
    renderer.view.style.position = "absolute";
    renderer.view.style.top = "0px";
    renderer.view.style.left = "0px"; // Centers window.

    // Add renderer to page.
    document.getElementById("game-window").appendChild(renderer.view);

    //Globals -------------------------------------------------------------------------------Globals
    var font = new Font();
    font.fontFamily = "LemonMilk";
    font.src = font.fontFamily;

    var catcher;
    var tk;
    var scale = scaleToWindow(renderer.view);
    var setupDone = false;
    var pointer;
    var gameBuild = true;
    var menuBuild;
    var catcherBuild;

    // Sound options
    var soundOptions = {
        soundEnabled: false,
        soundButtonOnDisplayed: true,
        soundButtonOffDisplayed: false,
    };
    var soundButtonOn;
    var soundButtonOff;

    // Game-over menu
    var gameOverBuild;
    var menuButton;
    var retryButton;
    var gameOverBanner;

    // Secret cow level
    var renderTexture;
    var renderTexture2;
    var currentTexture;
    var outputSprite;
    var stuffContainer = new PIXI.Container();
    var spinningItems = [];
    var profs = [
        "albert",
        "bruce",
        "carly",
        "chris",
        "keith",
        "medhat",
        "paul",
        "peter",
        "sam",
        "trevor"
    ];
    var cowLevelElapsedTime;
    var portal;

    // Food items in game
    var numberOfFood = 6;
    apple = {name: "apple", weight: 1 / numberOfFood, scoreValue: 10, isCaught: false, isHitBasket: false};
    banana = {name: "banana", weight: 1 / numberOfFood, scoreValue: 10, isCaught: false, isHitBasket: false};
    bread = {name: "bread", weight: 1 / numberOfFood, scoreValue: 10, isCaught: false, isHitBasket: false};
    orange = {name: "orange", weight: 1 / numberOfFood, scoreValue: 10, isCaught: false, isHitBasket: false};
    broccoli = {name: "broccoli", weight: 1 / numberOfFood, scoreValue: 10, isCaught: false, isHitBasket: false};
    egg = {name: "egg", weight: 1 / numberOfFood, scoreValue: 10, isCaught: false, isHitBasket: false};
    fallingObjects = [apple, banana, bread, orange, broccoli, egg];

    //Set the game's starting state.
    var state;

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if (firebaseUser) {
            state = menu;
        } else {
            state = login;
        }
    });

    menuBuild = true;
    catcherBuild = false;
    cowLevelBuild = true;

    loader
        .add([
            "assets/img/sprites/basket.png",
            "assets/img/sprites/apple.png",
            "assets/img/sprites/banana.png",
            "assets/img/sprites/bread.png",
            "assets/img/sprites/broccoli.png",
            "assets/img/sprites/egg.png",
            "assets/img/sprites/cd-1.png",
            "assets/img/sprites/cd-2.png",
            "assets/img/sprites/cd-3.png",
            "assets/img/sprites/cd-go.png",
            "assets/img/sprites/orange.png",
            "assets/img/sprites/play.png",
            "assets/img/web/site-logo-white-long-shadow.png",
            "assets/img/sprites/obstacle.png",
            "assets/img/tiling-sprites/sky.png",
            "assets/img/tiling-sprites/mtn-far.png",
            "assets/img/tiling-sprites/mtn-mid.png",
            "assets/img/tiling-sprites/ground.png",
            "assets/img/tiling-sprites/clouds.png",
            "assets/img/tiling-sprites/trees.png",
            "assets/img/tiling-sprites/grass.png",
            "assets/img/sprites/sound-on.png",
            "assets/img/sprites/sound-off.png",
            "assets/img/sprites/game-over.png",
            "assets/img/sprites/retry.png",
            "assets/img/sprites/menu.png",
            "assets/img/sprites/portal.json",
            "assets/img/sprites/profs.json",
            "assets/img/sprites/cow-level-banner.png",
            "assets/img/sprites/text-box.png"
        ])
        .load(setup);


    function initBackground() {

        // Load sprites from loader resources
        sky = new PIXI.extras.TilingSprite(resources['assets/img/tiling-sprites/sky.png'].texture, GAME_WIDTH, GAME_HEIGHT);
        mtnFar = new PIXI.extras.TilingSprite(resources['assets/img/tiling-sprites/mtn-far.png'].texture, GAME_WIDTH, GAME_HEIGHT);
        mtnMid = new PIXI.extras.TilingSprite(resources['assets/img/tiling-sprites/mtn-mid.png'].texture, GAME_WIDTH, GAME_HEIGHT);
        ground = new PIXI.extras.TilingSprite(resources['assets/img/tiling-sprites/ground.png'].texture, GAME_WIDTH, GAME_HEIGHT);
        clouds = new PIXI.extras.TilingSprite(resources['assets/img/tiling-sprites/clouds.png'].texture, GAME_WIDTH, GAME_HEIGHT);
        trees = new PIXI.extras.TilingSprite(resources['assets/img/tiling-sprites/trees.png'].texture, GAME_WIDTH, GAME_HEIGHT);
        grass = new PIXI.extras.TilingSprite(resources['assets/img/tiling-sprites/grass.png'].texture, GAME_WIDTH, GAME_HEIGHT);

        // Add background sprites to stage
        stage.addChild(sky);
        stage.addChild(mtnFar);
        stage.addChild(mtnMid);
        stage.addChild(ground);
        stage.addChild(clouds);
        stage.addChild(trees);
        stage.addChild(grass);

        // Prepare for first frame of game loop/animation
        lastTime = new Date().getTime();
    }

    function animateBackground() {
        // Determine seconds elapsed since last frame
        var currtime = new Date().getTime();
        var delta = (currtime - lastTime) / 1000;
        // Scroll the terrain
        mtnFar.tilePosition.x -= BG_RATE * delta + backgroundScrollSpeed.mtnFar;
        mtnMid.tilePosition.x -= BG_RATE * delta + backgroundScrollSpeed.mtnMid;
        clouds.tilePosition.x -= BG_RATE * delta + backgroundScrollSpeed.clouds;
        trees.tilePosition.x -= BG_RATE * delta + backgroundScrollSpeed.trees;
        grass.tilePosition.x -= BG_RATE * delta + backgroundScrollSpeed.grass;
        // Draw the stage and prepare for the next frame
        lastTime = currtime;
    }

    /*
     Main game driver.
     */
    function setup() {

        tk = new Tink(PIXI, renderer.view, scale);

        // Initialize the the tiling-sprites background
        initBackground();

        //Touch and Mouse Controls
        pointer = tk.makePointer();
        //Pointer Definition
        pointer.press = function () {
        };
        pointer.release = function () {
        };

        setupDone = true;

        // Resize screen when window size is adjusted.
        window.addEventListener("resize", function () {
            tk.scale = scaleToWindow(renderer.view);
        });

        // If device changes orientation
        $(window).on("orientationchange",function(){
            tk.scale = scaleToWindow(renderer.view);
        });

        // Tell the 'renderer' to 'render' the 'stage'.
        renderer.render(stage);

        //Start the game loop
        gameLoop();

        scores = [];
        dumpScores();
    }

    //Animation loop
    function gameLoop() {
        requestAnimationFrame(gameLoop);
        state();
        lastTime = new Date().getTime();
        tk.update();
        renderer.render(stage);
    }

    function login() {
        animateBackground();
        loginDisplay();
        hideMenu();
    }

    function loginDisplay() {
        loginPanel.style.display = "block";
    }

    function loginHide() {
        try {
            loginPanel.style.display = "none";
            signUpPanel.style.display = "none";
        } catch(exception) {
        }
    }

    //State definition for "playing" the game
    function play() {
        gameInit();
        foodFall();
        soundButtonDisplay();
        animateBackground();
        addScore();
    }

    function showMenu() {
        // Add button and logo
        btnShare.style.display = "block";
        btnPlay.style.display = "block";
        btnMainMenuVolumeOn.style.display = "inline-block";
        btnMainMenuLeaderBoard.style.display = "block";
        logo.style.display = "block";
        instructions.style.display = "inline-block";
        randomFactBox.style.display = "inline-block";
        welcomeUserInfo.style.display = "inline-block";
    }

    function hideMenu() {
        btnPlay.style.display = "none";
        btnMainMenuVolumeOn.style.display = "none";
        btnMainMenuVolumeOff.style.display = "none";
        btnMainMenuLeaderBoard.style.display = "none";
        leaderBoard.style.display = "none";
        instructions.style.display = "none";
        randomFactBox.style.display = "none";
        logo.style.display = "none";
        btnShare.style.display = "none";
        welcomeUserInfo.style.display ="none";
    }

    function gameMenuDisplay() {
        if (menuBuild) {
            showMenu();
            // Add a fact to the stage
            initFacts();
            // Set game state indicators (e.i. has menu been built / has catcher been built)
            menuBuild = false;
            catcherBuild = true;
        }
    }

    function displayLogOutMainMenu() {
        if (loggedIn) {
            logOutPanel.style.display = "block";
        }
    }

    function hideLogOutMainMenu() {
        logOutPanel.style.display = "none";
    }

    function soundButtonDisplay() {
        if (soundOptions.soundButtonOnDisplayed && !soundOptions.soundButtonOffDisplayed) {
            if (!soundOptions.soundEnabled) {
                soundButtonOn = new Sprite(resources['assets/img/sprites/sound-on.png'].texture);
                soundButtonOn.interactive = true;
                soundButtonOn.width /= 3;
                soundButtonOn.height /= 3;
                soundButtonOn.x = GAME_WIDTH - soundButtonOn.width;
                soundOptions.soundEnabled = true;
                soundOptions.soundButtonOnDisplayed = false;
                soundOptions.soundButtonOffDisplayed = false;
                soundButtonOn.on('pointerdown', (event) => {
                    muteSound();
                    soundOptions.soundEnabled = false;
                    soundOptions.soundButtonOnDisplayed = false;
                    soundOptions.soundButtonOffDisplayed = true;
                    stage.removeChild(soundButtonOn);
                });
                stage.addChild(soundButtonOn);
                btnMainMenuVolumeOn.style.display = "none";
            }
        } else if (!soundOptions.soundButtonOnDisplayed && soundOptions.soundButtonOffDisplayed) {
            if (!soundOptions.soundEnabled) {
                soundButtonOff = new Sprite(resources['assets/img/sprites/sound-off.png'].texture);
                soundButtonOff.interactive = true;
                soundButtonOff.width /= 3;
                soundButtonOff.height /= 3;
                soundButtonOff.x = GAME_WIDTH - soundButtonOff.width;
                soundOptions.soundEnabled = true;
                soundOptions.soundButtonOnDisplayed = false;
                soundOptions.soundButtonOffDisplayed = false;
                soundButtonOff.on('pointerdown', (event) => {
                    unmuteSound();
                    soundOptions.soundEnabled = false;
                    soundOptions.soundButtonOnDisplayed = true;
                    soundOptions.soundButtonOffDisplayed = false;
                    stage.removeChild(soundButtonOff);
                });
                stage.addChild(soundButtonOff);
            }
        }
    }

    function playGameFromMenu() {
        state = play;
        loginHide();
        hideMenu();
        hideLogOutMainMenu();
    }

    function menu() {
        animateBackground();
        gameMenuDisplay();
    }

    function initCatcher() {
        if (catcherBuild) {
            catcher = new Sprite(resources['assets/img/sprites/basket.png'].texture);
            catcher.y = GAME_HEIGHT / 2;
            catcher.x = GAME_WIDTH / 2;
            catcher.vx = 0;
            catcher.vy = 0;
            catcher.accelerationX = 0;
            catcher.accelerationY = 0;
            catcher.frictionX = 0.5;
            catcher.frictionY = 0.5;
            catcher.speed = 0.2;
            catcher.drag = 0.98;
            catcher.anchor.x = 0.5;
            catcher.anchor.y = 0.5;
            catcher.interactive = true;
            catcher.rotation = 0;

            tk.makeDraggable(catcher);

            stage.addChild(catcher);
            catcherBuild = false;

            //Callback to bring catcher back to screen if moved off
            catcher.on('pointermove', onOutOfBounds);
            catcher.on('pointerover', onOutOfBounds);
        }
    }

    //Brings back catcher if moved too far offscreen
    function onOutOfBounds() {
        if (catcher.x < 0) {
            catcher.x = 0;
        }
        if (catcher.x > GAME_WIDTH) {
            catcher.x = GAME_WIDTH;
        }
        if (catcher.y < 0) {
            catcher.y = 0;
        }
        if (catcher.y > GAME_HEIGHT) {
            catcher.y = GAME_HEIGHT;
        }
    }


    /**
     * Adds a random zero food waste tip to the screen.
     */
    function initFacts() {
        var factIndex = getRandomInt(0, 13);
        randomFactBox
            .innerHTML = '<h2 class="text-box-header">Food Fact</h2><hr /><p>' + foodFacts[factIndex] + '</p>';
    }

    function gameOver() {
        animateBackground();
        gameOverDisplay();
    }

    function gameOverDisplay() {
        if (gameOverBuild) {

            // Add logo to menu
            gameOverBanner = new Sprite(resources['assets/img/sprites/game-over.png'].texture);
            gameOverBanner.x = (GAME_WIDTH / 2) - (gameOverBanner.width / 2);
            gameOverBanner.y = GAME_HEIGHT - (gameOverBanner.height * 4);

            retryButton = new Sprite(resources['assets/img/sprites/retry.png'].texture);
            retryButton.interactive = true;
            retryButton.width /= 2;
            retryButton.height /= 2;
            retryButton.anchor.x = 0.5;
            retryButton.x = GAME_WIDTH - (retryButton.width);
            retryButton.y = GAME_HEIGHT - (retryButton.height * 2);

            menuButton = new Sprite(resources['assets/img/sprites/menu.png'].texture);
            menuButton.interactive = true;
            menuButton.width /= 2;
            menuButton.height /= 2;
            menuButton.anchor.x = 0.5;
            menuButton.x = (GAME_WIDTH / 3) - (menuButton.width / 2);
            menuButton.y = GAME_HEIGHT - (menuButton.height * 2);

            // Change score position
            score.x = (GAME_WIDTH / 2);
            score.y = GAME_HEIGHT / 2 - 40;
            score.text = scoreCount;
            score.style.fontSize = 100;
            score.style.fill = "#12ff19";

            stage.addChild(retryButton);
            stage.addChild(gameOverBanner);
            stage.addChild(menuButton);
            stage.addChild(score);

            // Add listener for play button
            retryButton.on('pointerdown', (event) => {
                playGameFromMenu();
                stage.removeChild(retryButton);
                stage.removeChild(gameOverBanner);
                stage.removeChild(menuButton);
                stage.removeChild(score);
            });
            retryButton.mouseover = function (mouseData) {
                this.width *= 1.25;
                this.height *= 1.25;
            };
            retryButton.mouseout = function (mouseData) {
                this.width /= 1.25;
                this.height /= 1.25;
            };

            // Add listener for play button
            menuButton.on('pointerdown', (event) => {
                state = menu;
                menuBuild = true;
                gameMenuDisplay();
                logOutPanel.style.display = "block";
                stage.removeChild(retryButton);
                stage.removeChild(gameOverBanner);
                stage.removeChild(menuButton);
                stage.removeChild(score);
                BG_RATE = 50;
                scores = [];
                dumpScores();
            });
            menuButton.mouseover = function (mouseData) {
                this.width *= 1.25;
                this.height *= 1.25;
            };
            menuButton.mouseout = function (mouseData) {
                this.width /= 1.25;
                this.height /= 1.25;
            };

            // Set game state indicators (e.i. has menu been built / has catcher been built)
            menuBuild = false;
            catcherBuild = true;

            gameOverBuild = false;
        }
    }

    function fuckUpBackground() {
        // Determine seconds elapsed since last frame
        var currtime = new Date().getTime();
        var delta = (currtime - lastTime) / 1000;
        // Scroll the terrain
        mtnFar.tilePosition.x -= BG_RATE * delta - 5;
        mtnMid.tilePosition.x -= BG_RATE * delta + 3;
        clouds.tilePosition.x -= BG_RATE * delta + 4;
        trees.tilePosition.x -= BG_RATE * delta + 2;
        grass.tilePosition.x -= BG_RATE * delta - 6;
        // Draw the stage and prepare for the next frame
        lastTime = currtime;
    }

    function cowLevel() {

        fuckUpBackground();
        soundButtonDisplay();
        addScore();

        // create two render textures... these dynamic textures will be used to draw the scene into itself
        renderTexture = PIXI.RenderTexture.create(
            renderer.width,
            renderer.height
        );
        renderTexture2 = PIXI.RenderTexture.create(
            renderer.width,
            renderer.height
        );
        currentTexture = renderTexture;

        outputSprite = new PIXI.Sprite(currentTexture);

        if (cowLevelBuild) {

            addScore();

            destroyOldObjects();

            catcher.alpha = 0;

            outputSprite.x = 400;
            outputSprite.y = 300;
            outputSprite.anchor.set(0.5);

            stage.addChild(outputSprite);

            stuffContainer.x = 400;
            stuffContainer.y = 300;

            stage.addChild(stuffContainer);

            for (let i = 0; i < profs.length; i++) {
                var item = new Sprite(resources['assets/img/sprites/profs.json'].textures['' + profs[i % profs.length] + '.png']);
                item.interactive = true;
                item.on('pointerdown', (event) => {
                    scoreCount += 100;
                    gameSFX.play('point');
                });
                item.x = Math.random() * 400 - 200;
                item.y = Math.random() * 400 - 200;
                item.anchor.set(0.5);
                stuffContainer.addChild(item);
                spinningItems.push(item);
            }

            var count = 0;

            // Easter egg level state
            var frames = [];
            for (let i = 0; i < 7; i++) {
                frames.push(PIXI.Texture.fromFrame('portal_0000_Layer-7' + i + '.png'));
            }
            portal = new PIXI.extras.AnimatedSprite(frames);
            portal.x = renderer.width / 2;
            portal.y = renderer.height / 2;
            portal.width *= 2;
            portal.height *= 2;
            portal.anchor.set(0.5);
            portal.animationSpeed = 0.5;
            portal.play();

            stage.addChild(portal);

            // secret cow level image
            secretCowLevelBanner = new Sprite(resources['assets/img/sprites/cow-level-banner.png'].texture);
            secretCowLevelBanner.width /= 2;
            secretCowLevelBanner.height /= 2;
            secretCowLevelBanner.x = (GAME_WIDTH / 2) - (secretCowLevelBanner.width / 2);
            secretCowLevelBanner.y = GAME_HEIGHT - (secretCowLevelBanner.height * 1.5);

            stage.addChild(secretCowLevelBanner);

            portalSFX.play('portal');

            cowLevelBuild = false;

            cowLevelElapsedTime = 0;
        }

        for (let i = 0; i < spinningItems.length; i++) {
            // rotate each item
            var item = spinningItems[i];
            item.rotation += 0.1;
        }

        count += 0.02;

        // swap the buffers ...
        var temp = renderTexture;
        renderTexture = renderTexture2;
        renderTexture2 = temp;

        // set the new texture
        outputSprite.texture = renderTexture;

        // twist this up!
        stuffContainer.rotation -= 0.01;
        outputSprite.scale.set(1 + Math.sin(count) * 0.1);

        var currtime = new Date().getTime();
        var delta = (currtime - lastTime) / 10;
        cowLevelElapsedTime += delta;

        if (cowLevelElapsedTime >= 20) {
            for (let item in spinningItems) {
                stuffContainer.removeChild(item);
            }
            portalSFX.volume(0);
            stage.removeChild(stuffContainer);
            portal.destroy();
            stage.removeChild(secretCowLevelBanner);
            state = play;
            renderer.render(stage);
            cowLevelEnd();
        }

    }

    function cowLevelEnd() {
        catcher.alpha = 1;
        catcher.x = (GAME_WIDTH / 2) - (catcher.width / 2);
        catcher.y = (GAME_HEIGHT / 2) - (catcher.height / 2);
        obstacleCount = 0;
        countDownIndex = 0;
        foodCount = 0;
        afterCountDown = true;
        catcher.alpha = 1;
        score.alpha = 1;
    }

    function speedUpGame(deltaTime) {
        BG_RATE += deltaTime * 15;
    }

    var scoreRef = firebase.database().ref("users").orderByKey();
    var scores = [];
    function dumpScores() {
        scoreRef.once("value")
            .then(function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var key = childSnapshot.key;
                    var childName = childSnapshot.child("userName").val();
                    var childScore = childSnapshot.child("score").val();
                    scores.push({childName, childScore});
                });
            });

        for (var i = 0; i < 8; i++) {
            if (scores[i] === undefined ){
                var childName = "---";
                var childScore = "0";
                scores[i] = {childName, childScore};
            }
        }
        scores.sort(sortFunction);

        function sortFunction(a, b) {
            if (a.childScore === b.childScore) {
                return 0;
            } else {
                return (a.childScore > b.childScore) ? -1 : 1;
            }
        }

    }
    function popLeaderboard() {

        try {
            var myTable = "";
            for (var i = 0; i < 8; i++) {
                myTable += "<tr><td>" + (i + 1) + "</td>"
                myTable += "<td>" + scores[i].childName + "</td>";
                myTable += "<td>" + scores[i].childScore + "</td></tr>";
            }
            myTable += "";

            document.getElementById('table-body').innerHTML = myTable;
            scores = [];
        } catch (error) {

        }

    }
