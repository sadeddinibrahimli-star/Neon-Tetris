import { WIDTH, COLORS, TETROMINOS } from './jsFile/constants.js';
import { sounds, stopAllMusic } from './jsFile/audio.js';
import { TetrisEngine } from './jsFile/game-logic.js';

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    const levelDisplay = document.getElementById('levelCounter');
    const startBtnContainer = document.getElementById('startButton');
    const restartBtn = document.getElementById('restartBtn');
    const startBtn = document.getElementById('startBtn');
    const explosion = document.getElementById('explotion');
    const continueBtn = document.getElementById('continueBtn');
    const comboanimation = document.getElementById('combo');
    const displaySquares = document.querySelectorAll('.miniGrid div');
    const holdSquares = document.querySelectorAll('.holdBlock .miniGrid div');
    let heldPiece = null; // Stores the index (random) of the held tetromino
    let canSwap = true;
    let squares = [];
    const blocks = TETROMINOS(WIDTH);
    let currentPosition = 4;
    let currentRotation = 0;
    let nextRandom = Math.floor(Math.random() * blocks.length);
    let random = Math.floor(Math.random() * blocks.length);
    let current = blocks[random][currentRotation];
    let timerId = null;
    let score = 0;
    let level = 0;
    let speed = 1000;
    let isPaused = false;
    let highScore = localStorage.getItem('tetris-hi-score') || 0;
    highScoreDisplay.innerHTML = highScore;
    sounds.startScreen.play();
    function createGrid() {
        grid.innerHTML = '';
        for (let i = 0; i < 410; i++) {
            const square = document.createElement('div');
            if (i >= 400) square.classList.add('taken');
            grid.appendChild(square);
        }
        squares = Array.from(document.querySelectorAll('.grid div'));
    }
    createGrid();
    function draw() {
    const ghostPos = TetrisEngine.getGhostPosition(current, currentPosition, squares);
    current.forEach(index => {
        squares[ghostPos + index].classList.add('ghost');
    });
    current.forEach(index => {
        squares[currentPosition + index].classList.add('blocks');
        squares[currentPosition + index].style.backgroundColor = COLORS[random];
    });
}
   function undraw() {
    current.forEach(index => {
        squares[currentPosition + index].classList.remove('blocks');
        squares[currentPosition + index].style.backgroundColor = '';
    });
    squares.forEach(square => square.classList.remove('ghost'));
}
    function moveDown() {
        if (!timerId || isPaused) return;
        
        sounds.step.volume = 0.19;
        sounds.step.play();
        
        if (!TetrisEngine.checkCollision(current, currentPosition, squares)) {
            undraw();
            currentPosition += WIDTH;
            draw();
            freeze();
        }
    }
    function freeze() {
    if (current.some(index => squares[currentPosition + index + WIDTH].classList.contains('taken'))) {
        current.forEach(index => squares[currentPosition + index].classList.add('taken'));
        addScore();
        canSwap = true; 
        random = nextRandom;
        nextRandom = Math.floor(Math.random() * blocks.length);
        current = blocks[random][0];
        currentRotation = 0;
        currentPosition = 4;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            gameOver();
        } else {
            draw();
            displayShape();
        }
    }
}
    function moveLeft() {
        undraw();
        const isAtLeftEdge = TetrisEngine.isAtLeftEdge(current, currentPosition);
        if (!isAtLeftEdge) currentPosition -= 1;
        else { sounds.border.volume = 0.3; sounds.border.play(); }
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        draw();
    }
    function moveRight() {
        undraw();
        const isAtRightEdge = TetrisEngine.isAtRightEdge(current, currentPosition);
        if (!isAtRightEdge) currentPosition += 1;
        else { sounds.border.volume = 0.3; sounds.border.play(); }
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
        draw();
    }
    function rotate() {
        undraw();
        currentRotation++;
        if (currentRotation === blocks[random].length) currentRotation = 0;
        current = blocks[random][currentRotation];
        currentPosition = TetrisEngine.getCorrectedRotation(current, currentPosition);
        draw();
    }
    function skip() {
        while (!current.some(index => squares[currentPosition + index + WIDTH].classList.contains('taken'))) {
            undraw();
            currentPosition += WIDTH;
            draw();
            sounds.skip.playbackRate = 3.0;
            sounds.skip.play();
        }
        freeze();
    }
    let currentStreak = 0;
    function addScore() {
        let clearedAnyRowsThisTurn = false; // To check if THIS piece did anything
        for (let i = 0; i < 399; i += WIDTH) {
        const row = Array.from({length: WIDTH}, (_, index) => i + index);
        if (row.every(index => squares[index].classList.contains('taken'))) {
        clearedAnyRowsThisTurn = true; 
        score += 10;
        sounds.score.volume = 0.6;
        sounds.score.play();
        scoreDisplay.innerHTML = score;
        if (score % 100 === 0) {
            level++;
            levelDisplay.innerHTML = level;
            clearInterval(timerId);
            sounds.levelUp.play();
            if (speed > 200) speed -= 50;
            timerId = setInterval(moveDown, speed);
        }
                if (score % 1000 === 0) sounds.score1000.play();
                row.forEach(index => {
                squares[index].classList.remove('taken', 'blocks');
                squares[index].style.backgroundColor = '';
            });
            const squaresRemoved = squares.splice(i, WIDTH);
            squares = squaresRemoved.concat(squares);
            squares.forEach(cell => grid.appendChild(cell));
            }
        }
        if (clearedAnyRowsThisTurn) {
        currentStreak++;
        if (currentStreak >= 2) {
            console.log("STREAK! 2 pieces in a row cleared lines!");
            score += 50; 
            scoreDisplay.innerHTML = score;
            sounds.combo.play(); 
            comboanimation.style.opacity = "1";
        }
    } else {
        currentStreak = 0;
        comboanimation.style.opacity = "0";
        sounds.combo.pause(); 
    }
}
    function displayShape() {
        const miniWidth = 4;
        const upNextBlocks = [
            [1, miniWidth + 1, miniWidth * 2 + 1, miniWidth * 3 + 1],
            [0, 1, miniWidth, miniWidth + 1],
            [1, miniWidth, miniWidth + 1, miniWidth + 2],
            [miniWidth + 1, miniWidth + 2, miniWidth * 2, miniWidth * 2 + 1], 
            [miniWidth, miniWidth + 1, miniWidth * 2 + 1, miniWidth * 2 + 2], 
            [1, miniWidth + 1, miniWidth * 2 + 1, miniWidth * 2],  
            [1, miniWidth + 1, miniWidth * 2 + 1, 2]
        ];
        displaySquares.forEach(square => {
            square.classList.remove('blocks');
            square.style.backgroundColor = '';
        });
        upNextBlocks[nextRandom].forEach(index => {
            displaySquares[index].classList.add('blocks');
            displaySquares[index].style.backgroundColor = COLORS[nextRandom];
        });
    }
    function pause() {
        if (timerId) {
            explosion.style.opacity = "0";
            clearInterval(timerId);
            timerId = null;
            isPaused = true;
            startBtnContainer.classList.remove('hidden');
            startBtn.classList.add('hidden');
            continueBtn.classList.add('show');
        }
    }
    function gameOver() {
        explosion.style.opacity = "0";
        startBtn.style.opacity = "1";
        scoreDisplay.innerHTML = "END";
        stopAllMusic();
        sounds.gameOver.play();
        clearInterval(timerId);
        timerId = null;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('tetris-hi-score', highScore);
            highScoreDisplay.innerHTML = highScore;
        }
        restartBtn.classList.remove('hidden');
        startBtnContainer.classList.remove('hidden');
        startBtn.classList.add('hidden');
    }
    function randomSongPlayer() {
    stopAllMusic();
    const currentRandom = Math.floor(Math.random() * sounds.songs.length); 
    const song = sounds.songs[currentRandom];
    song.volume = 0.3;
    song.loop = true;
    song.play();
}
    function startGame() {
        if (timerId) return;
        
        sounds.boom.play();
        sounds.startScreen.pause();
        
        setTimeout(() => {
            explosion.style.opacity = "1";
            explosion.play();
            startBtn.style.opacity = "0";
            
            setTimeout(() => {
                randomSongPlayer();
                startBtnContainer.classList.add('hidden');
                draw();
                timerId = setInterval(moveDown, speed);
                displayShape();
            }, 1000);
        }, 200);
    }
    function restartGame() {
        location.reload();
    }
    function control(e) {
        if (!timerId && !isPaused) return;
        if (e.keyCode === 37) moveLeft();
        else if (e.keyCode === 38) rotate();
        else if (e.keyCode === 39) moveRight();
        else if (e.keyCode === 40) moveDown();
        else if (e.keyCode === 32) skip();
        else if (e.keyCode === 80) holdPiece();
    }
    document.addEventListener('keydown', control);
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    continueBtn.addEventListener('click', () => {
        if (isPaused) {
            timerId = setInterval(moveDown, speed);
            isPaused = false;
            startBtnContainer.classList.add('hidden');
            continueBtn.classList.remove('show');
        }
    });
function holdPiece() {
    if (!canSwap || !timerId || isPaused) return;
    undraw();
    if (heldPiece === null) {
        heldPiece = random; 
        random = nextRandom;
        nextRandom = Math.floor(Math.random() * blocks.length);
        displayShape();
    } else {
        const temp = random;
        random = heldPiece;
        heldPiece = temp;
    }
    currentPosition = 4;
    currentRotation = 0;
    current = blocks[random][currentRotation];
    canSwap = false; 
    displayHold(); 
    draw();
}
function displayHold() {
    const miniWidth = 4;
    const holdBlocks = [
        [1, miniWidth + 1, miniWidth * 2 + 1, miniWidth * 3 + 1], // i
        [0, 1, miniWidth, miniWidth + 1],                         // o
        [1, miniWidth, miniWidth + 1, miniWidth + 2],             // t
        [miniWidth + 1, miniWidth + 2, miniWidth * 2, miniWidth * 2 + 1], // s
        [miniWidth, miniWidth + 1, miniWidth * 2 + 1, miniWidth * 2 + 2], // z
        [1, miniWidth + 1, miniWidth * 2 + 1, miniWidth * 2],     // j
        [1, miniWidth + 1, miniWidth * 2 + 1, 2]                  // l
    ];
   holdSquares.forEach(square => {
        square.classList.remove('blocks');
        square.style.backgroundColor = '';
        square.style.boxShadow = ''; // Clear the specific inline glow
    });

    if (heldPiece !== null) {
        holdBlocks[heldPiece].forEach(index => {
            holdSquares[index].classList.add('blocks');
            holdSquares[index].style.backgroundColor = COLORS[heldPiece];
            holdSquares[index].style.color = COLORS[heldPiece]; // Helps box-shadow currentColor
        });
    }
}
    sounds.startScreen.loop = true;
});