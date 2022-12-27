// jshint browser:true, eqeqeq:true, undef:true, devel:true, esversion: 6

(function () {

    //snake
    var snake;
    var head; //la tête du serpent
    var neck; //la deuxième case à partir de la tête du serpent (permet de trouver direction)
    var dir;

    var interval;
    var score = 0;

    //world
    var tailleCote = window.innerWidth / 40;
    var ctx;
    const EMPTY = 0;
    const SNAKE = 1;
    const FOOD = 2;
    const SNAKEH = 3;
    const WALL = 4;
    var world;

    //initialisation du jeu
    buildHomeScreen();


    //redéfinit la taille en fonction de la taille de la page
    window.addEventListener("resize", () => {
        tailleCote = window.innerWidth / 40;
    });

    function buildHomeScreen() {

        var buttonEasy = document.getElementById('buttonEasy');
        var buttonMedium = document.getElementById('buttonMedium');
        var buttonHard = document.getElementById('buttonHard');
        var buttonHome = document.getElementById('buttonHome');

        //listeners des boutons
        buttonEasy.addEventListener('click', function () {
            initLevel(1);
        });
        buttonMedium.addEventListener('click', function () {
            initLevel(2);
        });
        buttonHard.addEventListener('click', function () {
            initLevel(3);
        });
        buttonHome.addEventListener('click', function () {
            clearInterval(interval);
            changeHomeScreenState();
            clearGame();
        });

    }

    function changeHomeScreenState() {
        var buttonEasy = document.getElementById('buttonEasy');
        var buttonMedium = document.getElementById('buttonMedium');
        var buttonHard = document.getElementById('buttonHard');
        var buttonHome = document.getElementById('buttonHome');
        var textHome = document.getElementById('presentation');
        var scoreDiv = document.getElementById('scoreDiv');
        var gameEnd = document.getElementById('gameEnd');

        if (!gameEnd.classList.contains('hidden')) {
            gameEnd.classList.toggle('hidden');
        }

        if (!scoreDiv.classList.contains('hidden')) {
            scoreDiv.classList.toggle('hidden');
        }

        buttonEasy.classList.toggle('hidden');
        buttonMedium.classList.toggle('hidden');
        buttonHard.classList.toggle('hidden');
        buttonHome.classList.toggle('hidden');
        buttonHome.classList.toggle('button');
        textHome.classList.toggle('hidden');
        scoreDiv.classList.toggle('hidden');
    }

    function clearGame() {
        var x = document.getElementById('backgroundCanvas').width * tailleCote;
        var y = document.getElementById('backgroundCanvas').height * tailleCote;
        ctx.clearRect(0, 0, x, y);
    }

    function initWorld(data) {

        //reset score
        score = 0;
        document.getElementById('score').innerHTML=0;

        //info grille
        var dimensions = data.dimensions;
        world = arrayFilledEmpty(dimensions);

        document.getElementById('backgroundCanvas').width = dimensions[0] * tailleCote;
        document.getElementById('backgroundCanvas').height = dimensions[1] * tailleCote;


        //init snake and food
        snake = data.snake;

        for (let element of snake) {
            if (element !== snake[snake.length - 1]) {
                world[element[0]][element[1]] = SNAKE;
            } else {
                world[element[0]][element[1]] = SNAKEH;
            }

        }

        for (let element of data.food) {
            world[element[0]][element[1]] = FOOD;
        }

        //init walls

        for (let element of data.walls) {
            world[element[0]][element[1]] = WALL;
        }

        initSnakeDir();

        //dessin du canvas background
        let bgCanvas = document.getElementById('backgroundCanvas');
        ctx = bgCanvas.getContext('2d');

        ctx.strokeStyle = "black";


        for (let i = 0; i < dimensions[0]; i++) {
            for (let j = 0; j < dimensions[1]; j++) {
                if (world[i][j] === SNAKEH) {
                    let img = new Image();
                    img.src = 'lib/head.png';
                    img.onload = function () {
                        ctx.drawImage(img, i * tailleCote, j * tailleCote, tailleCote, tailleCote);
                    };
                } else {
                    if (world[i][j] === EMPTY) {
                        ctx.fillStyle = "grey";
                    } else if (world[i][j] === SNAKE) {
                        ctx.fillStyle = "#22b14c";
                    } else if (world[i][j] === FOOD) {
                        ctx.fillStyle = "red";
                    } else if (world[i][j] === WALL) {
                        ctx.fillStyle = "black";
                    }
                    ctx.fillRect(i * tailleCote, j * tailleCote, tailleCote, tailleCote);   
                }


                
                ctx.strokeRect(i * tailleCote, j * tailleCote, tailleCote, tailleCote);

            }
        }

        //fonction asynchrone qui fait avancer le snake
        interval = setInterval(step, data.delay);

    }

    function initLevel(levelId) {

        //suppression du menu d'accueil
        changeHomeScreenState();

        fetch("json/level" + levelId + ".json").then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw ("Erreur " + response.status);
            }
        }).then(function (data) {
            //création du monde
            initWorld(data);

        }).catch(function (err) {
            console.log(err);
        });

    }



    function isNewDirValid(userDir) {
        switch (userDir) {

            //si la nouvelle direction est la même que la direction actuelle ou est son opposée, on ne change rien
            case 'ArrowLeft':
            case 'ArrowRight':
                if (dir !== 'ArrowLeft' && dir !== 'ArrowRight') {
                    return true;
                } else {
                    return false;
                }
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                if (dir !== 'ArrowDown' && dir !== 'ArrowUp') {
                    return true;
                } else {
                    return false;
                }
                break;

        }
    }


    //possible car le serpent mesurera toujours au moins 3 cases
    function initSnakeDir() {
        head = snake[snake.length - 1];
        neck = snake[snake.length - 2];

        //trouver direction actuelle

        //axe commun
        //alignés sur x
        if (head[1] === neck[1]) {
            //si pos y de la tête < neck -> vers la gauche
            if (head[0] < neck[0]) {
                dir = 'ArrowLeft';

            } else {
                //sinon vers la droite
                dir = 'ArrowRight';
            }
        } else { // alignés sur y
            //si pos  x de la tête < neck -> vers le haut
            if (head[1] < neck[1]) {
                dir = 'ArrowUp';
            } else {
                //sinon vers le bas
                dir = 'ArrowDown';
            }
        }


    }

    function arrayFilledEmpty(dimensions) {
        var array = [];

        for (let i = 0; i < dimensions[0]; i++) {
            array.push(dimensions.length === 1 ? EMPTY : arrayFilledEmpty(dimensions.slice(1)));
        }

        return array;
    }

    function redrawWorld() {
        clearGame();

        let bgCanvas = document.getElementById('backgroundCanvas');
        ctx = bgCanvas.getContext('2d');

        ctx.strokeStyle = "black";

        for (let i = 0; i < world.length; i++) {
            for (let j = 0; j < world[0].length; j++) {
                if (world[i][j] === SNAKEH) {
                    let img = new Image();
                    img.src = 'lib/head.png';
                    img.onload = function () {
                        ctx.drawImage(img, i * tailleCote, j * tailleCote, tailleCote, tailleCote);
                    };
                } else {
                    if (world[i][j] === EMPTY) {
                        ctx.fillStyle = "grey";
                    } else if (world[i][j] === SNAKE) {
                        ctx.fillStyle = "#22b14c";
                    } else if (world[i][j] === FOOD) {
                        ctx.fillStyle = "red";
                    }  else if (world[i][j] === WALL) {
                        ctx.fillStyle = "black";
                    } 
                    ctx.fillRect(i * tailleCote, j * tailleCote, tailleCote, tailleCote);
                }

                ctx.strokeRect(i * tailleCote, j * tailleCote, tailleCote, tailleCote);

            }
        }
    }

    function step() {
        //événement utilisateur 
        document.addEventListener('keydown', (event) => {
            var userDir = event.key;

            //seulement touches directionnelles
            if (userDir.startsWith("Arrow")) {
                //si la position est valide, on fait bouger le snake
                if (isNewDirValid(userDir)) {
                    dir = userDir;
                }

            }
        });

        //calculer nouvelle pos

        var newHead = [0, 0];
        newHead[0] = head[0];
        newHead[1] = head[1];
        switch (dir) {

            case 'ArrowLeft':
                newHead[0] = newHead[0] - 1;
                break;
            case 'ArrowRight':
                newHead[0] = newHead[0] + 1;
                break;
            case 'ArrowUp':
                newHead[1] = newHead[1] - 1;
                break;
            case 'ArrowDown':
                newHead[1] = newHead[1] + 1;
                break;

        }

        //on vérifie s'il sort du jeu avant
        if (newHead[0] > world.length - 1 || newHead[0] < 0 || newHead[1] > world[0].length - 1 || newHead[1] < 0) {
            endGame();
            return;
        }

        let headOnWorld = world[newHead[0]][newHead[1]];

        //case correspondante à la tête sur grille
        switch (headOnWorld) {
            case WALL:
            case SNAKE:
                endGame();
                return;
            case FOOD:
                spawnFood();
                increaseScore();
                break;
        }

        //maj snake

        if (headOnWorld !== FOOD) {
            //on enlève la queue 
            var lastCase = snake.shift();
            world[lastCase[0]][lastCase[1]] = EMPTY;

        }

        var newSnake = snake;
        newSnake.push(newHead);
        snake = newSnake;
        head = snake[snake.length - 1];

        //maj world
        for (let element of snake) {
            if (element !== snake[snake.length - 1]) {
                world[element[0]][element[1]] = SNAKE;
            } else {
                world[element[0]][element[1]] = SNAKEH;
            }

        }

        redrawWorld();
    }

    function increaseScore() {
        score += 1;

        document.getElementById('score').innerHTML = score;
    }

    function spawnFood() {
        let x = Math.floor(Math.random() * (world[0].length - 1));
        let y = Math.floor(Math.random() * (world.length - 1));
        while (world[y][x]) // Empty = 0; équivalent de tant que world[y][x] n'est pas EMPTY
        {
            x = Math.floor(Math.random() * (world[0].length - 1));
            y = Math.floor(Math.random() * (world.length - 1));
        }
        world[y][x] = FOOD;
    }

    function endGame() {
        clearInterval(interval);

        clearGame();


        document.getElementById("scoreFinal").innerHTML = score;

        document.getElementById("gameEnd").classList.toggle("hidden");
        score = 0;
        document.getElementById("scoreDiv").classList.toggle("hidden");

    }

    


})();