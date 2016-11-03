/* Gets relevant elements from HTML */
var caught = document.getElementsByClassName("caught")[0];
var boost = document.getElementsByClassName("boost")[0];

/* Adds Audio to the game */
var audio = document.createElement("AUDIO");
var muteBtn = document.getElementsByClassName("muteBtn")[0];
audio.setAttribute("src","PokemonTVThemeSongFull.mp3");
audio.loop = true;
audio.play();
var playing = true;


/*
 This function toggles between playing sound and pausing
 */
function toggleSound() {
    if (playing) {
        audio.pause();
        playing = false;
        muteBtn.innerHTML = "Un-Pause Sound";
    } else {
        audio.play();
        playing = true;
        muteBtn.innerHTML = "Pause Sound";
    }
}


// Create the canvas
var canvas = document.getElementsByClassName("game")[0];
var ctx = canvas.getContext("2d");
canvas.width = 747;
canvas.height = 583;

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
    bgReady = true;
};
bgImage.src = "images/map.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
    heroReady = true;
};
heroImage.src = "images/Pokeball1.png";

// Monster image
//monsterImages = ["images/poke1.png","images/poke2.png","images/poke3.png","images/poke4.png","images/poke5.png"];
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
    monsterReady = true;
};
monsterImage.src = "images/poke1.png";
var MAX_POKEMON_NUMBER = 151; // max number of pokemon images


/* Instantiating Game Objects */
var baseSpeed = 256;
var maxSpeed = 1024;
var hero = {
    speed: 20, // movement in pixels per second
    speedFlag: 0,
    boost: 0,
    level: 1,
    flash: 0
};
var monster = {
    moveFlag: 0,
    move: 0,
    tmpMonstserDirection: 0,
    index: 1
};
var monstersCaught = 0;


/* Handle keyboard controls */
var keysDown = {}; // list to store keyboard values
addEventListener("keydown", function (e) { // adds key to list
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) { // removes key from list
    delete keysDown[e.keyCode];
}, false);


/*
 This function resets the game. (i.e. moving objects
 to their original positions)
 INPUTS:
 pokeX - the x coordinate of the pokeball
 pokeY - the y coordinate of the pokeball
 */
var reset = function (pokeX,pokeY) {
    hero.x = pokeX;
    hero.y = pokeY;

    // Throw the monster somewhere on the screen randomly
    monster.x = 32 + (Math.random() * (canvas.width - 64));
    monster.y = 32 + (Math.random() * (canvas.height - 64));
};


/*
 This function updates the game
 INPUTS:
 modifier - value to move objects based on website speed
 */
var update = function (modifier) {
    // Update hero speed and image
    if (hero.boost < 2000) {
        heroImage.src = "images/Pokeball1.png";
        hero.level = 1;
    } else if (hero.boost < 4000) {
        heroImage.src = "images/Pokeball2.png";
        hero.level = 2;
    } else if (hero.boost < 6000) {
        heroImage.src = "images/Pokeball3.png";
        hero.level = 3;
    } else {
        heroImage.src = "images/Pokeball4.png";
        hero.level = 4;
    }
    hero.speed = hero.level*60+.25*maxSpeed;

    // if the hero is not trying to boost, give him some automatically
    if (!(16 in keysDown)) {
        hero.boost++;
    }

    // if the hero is trying to boost
    if (16 in keysDown) {
        if (hero.boost <= 0.1) { // if he is near 0
            hero.boost = 0;
            delete keysDown[16]; // prevents him from boosting.
        }
        else { // normally, just remove some of his boost.
            hero.boost = hero.boost - 10;
        }
    }

    if (16 in keysDown && hero.speedFlag == 0) { // if boosting
        maxSpeed = maxSpeed*2;
        hero.speedFlag = 1;
    }
    if (!(16 in keysDown) && hero.speedFlag == 1) { // if not boosting
        maxSpeed = maxSpeed/2;
        hero.speedFlag = 0;
    }

    if (38 in keysDown && hero.y > 0) { // Player holding up
        hero.y -= hero.speed * modifier;
    }
    if (40 in keysDown && hero.y+25 < canvas.height) { // Player holding down
        hero.y += hero.speed * modifier;
    }
    if (37 in keysDown && hero.x > 0) { // Player holding left
        hero.x -= hero.speed * modifier;
    }
    if (39 in keysDown && hero.x+25 < canvas.width) { // Player holding right
        hero.x += hero.speed * modifier;
    }

    if (monster.moveFlag == 0) {
        monster.moveFlag = (Math.round(Math.random()*3)+1)*5; // 5, 10, 15, or 20 game ticks
        monster.move = Math.round(Math.random()*3);
    }
    monster.moveFlag--;
    switch(monster.move) {
        case 0:
            monster.y -= baseSpeed * modifier;
            break;
        case 1:
            monster.y += baseSpeed * modifier;
            break;
        case 2:
            monster.x -= baseSpeed * modifier;
            break;
        case 3:
            monster.x += baseSpeed * modifier;
            break;
        default:
            break;
    }

    // Are they touching?
    if ( hero.x <= (monster.x + 32) && monster.x <= (hero.x + 32)
        && hero.y <= (monster.y + 32) && monster.y <= (hero.y + 32)) {
        ++monstersCaught;
        monster.index++;
        hero.boost = hero.boost + 100;
        reset(hero.x, hero.y);
        if (monster.index > MAX_POKEMON_NUMBER) { // loop around for now.
            monster.index = 1; // should eventually cause a game end condition
        }
        if (monster.index < 10) {
            monsterImage.src = "imagess/00"+monster.index+".png";
        }
        else if (monster.index < 100) {
            monsterImage.src = "imagess/0"+monster.index+".png";
        }
        else {
            monsterImage.src = "imagess/"+monster.index+".png";
        }
    }
    // Move monster
    if (monster.y < 0) {
        monster.y = canvas.height - 32;
    }
    if (monster.y > canvas.height - 32) {
        monster.y = 0;
    }
    if (monster.x < 0) {
        monster.x = canvas.width - 32;
    }
    if (monster.x > canvas.width - 32) {
        monster.x = 0;
    }
};

// Draw everything
var render = function () {
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
    }

    if (heroReady) {
        ctx.drawImage(heroImage, hero.x, hero.y);

        ctx.beginPath();
        /*if (hero.speedFlag == 0) {
         ctx.arc(hero.x+12,hero.y+12,25,0,2*Math.PI);
         }
         else {
         ctx.arc(hero.x+12,hero.y+12,75,0,2*Math.PI);
         }*/
        //http://stackoverflow.com/questions/6271419/how-to-fill-the-opposite-shape-on-canvas
        // for on/off light
        ctx.stroke();
    }

    if (monsterReady) {
        ctx.drawImage(monsterImage, monster.x, monster.y);
    }

    // Score
    ctx.fillStyle = "rgb(250, 250, 250)";
    ctx.font = "24px Helvetica";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    //ctx.fillText("Pokemon caught: " + monstersCaught, 32, 32);
    caught.innerHTML = "Pokemon caught: " + monstersCaught;
    //ctx.fillText("Boost remaining: " + Math.floor(hero.boost/100), 32, 64);
    boost.innerHTML = "Boost remaining: " + Math.floor(hero.boost/100);
};


// The main game loop
var main = function () {
    var now = Date.now();
    var delta = now - then;
    update(delta / 1000);
    render();
    then = now;
    // Request to do this again ASAP
    requestAnimationFrame(main);
};


// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;


// Let's play this game!
var then = Date.now();
reset(canvas.width / 2, canvas.height / 2);
main();
