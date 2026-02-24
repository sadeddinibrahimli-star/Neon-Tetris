document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid')

    // 200 oyun xanası + 10 alt sərhəd (taken) dinamik yaradılır
    for (let i = 0; i < 410; i++) {
        const square = document.createElement('div')
        if (i >= 400) square.classList.add('taken')
        grid.appendChild(square)
    }

    let squares = Array.from(document.querySelectorAll('.grid div'))
    const scoreDisplay = document.getElementById('score')
    const highScoreDisplay = document.getElementById('high-score')
    const levelDisplay = document.getElementById('levelCounter')
    const startBtnContainer = document.getElementById('startButton')
    const restartBtn = document.getElementById('restartBtn')
    const startBtn = document.getElementById('startBtn')
    const explosion = document.getElementById('explotion')
    const continueBtn = document.getElementById('continueBtn')
    const width = 10
    const boom = new Audio('start.mp3')
    const startScreenSong = new Audio('Song1KorobeinikiStartScreen.mp3')
    const gameOverSong = new Audio('gameOver.mp3')
    const border = new Audio('border.mp3')
    const levelUp = new Audio('levelUP.mp3')
    const scoreSound = new Audio('score.mp3')
    const score1000 = new Audio('1000score.mp3')
    const stepSound = new Audio('step.mp3')
    const skipSound = new Audio('skip.mp3')
    const songs = [
        new Audio('song2.mp3'),
        new Audio('song3.mp3'),
        new Audio('song5.mp3'),
        new Audio('song6.mp3'),
        new Audio('song4.mp3')
    ]
    let nextRandom = 0
    let timerId = null
    let score = 0
    let level = 0
    let speed = 1000
    let highScore = localStorage.getItem('tetris-hi-score') || 0
    highScoreDisplay.innerHTML = highScore
    const colors = [
        '#FF3131',
        '#0FFF50',
        '#BC13FE',
        '#FFEA00',
        '#FF44CC',
        '#00D4FF',
        '#FFAC1C'
    ]
    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ]
    const jTetromino = [
        [1, width + 1, width * 2 + 1, 0],
        [width, width + 1, width + 2, 2],
        [1, width + 1, width * 2 + 1, width * 2 + 2],
        [width, width + 1, width + 2, width * 2]
    ]
    const zTetromino = [
        [0, 1, width + 1, width + 2],
        [1, width, width + 1, width * 2],
        [0, 1, width + 1, width + 2],
        [1, width, width + 1, width * 2]
    ]
    const sTetromino = [
        [1, 2, width, width + 1],
        [0, width, width + 1, width * 2 + 1],
        [1, 2, width, width + 1],
        [0, width, width + 1, width * 2 + 1]
    ]
    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ]
    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ]
    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ]

    const blocks = [iTetromino, oTetromino, tTetromino, sTetromino, zTetromino, jTetromino, lTetromino]

    let currentPosition = 4
    let currentRotation = 0
    let random = Math.floor(Math.random() * blocks.length)
    let current = blocks[random][currentRotation]
    let isPaused = false;
    startScreenSong.play();
    startScreenSong.loop = true


    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('blocks')
            squares[currentPosition + index].style.color = colors[random]
        })
    }

    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('blocks')
            squares[currentPosition + index].style.backgroundColor = ''
        })
    }

    function control(e) {
        if (!timerId) return
        if (e.keyCode === 37) moveLeft()
        else if (e.keyCode === 38) rotate()
        else if (e.keyCode === 39) moveRight()
        else if (e.keyCode === 40) moveDown()
        else if (e.keyCode === 32) skip()
        else if (e.keyCode === 80) pause()

    }
    document.addEventListener('keydown', control)

    function moveDown() {
        if (!timerId) return
        stepSound.volume = '0.19'
        stepSound.play();
        undraw()
        currentPosition += width
        draw()
        freeze()
    }

    function skip() {
        while (!current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            undraw()
            currentPosition += width
            draw()
            skipSound.playbackRate = 3.0
            skipSound.play();
        }
        freeze()
    }

    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'))
            addScore()
            random = nextRandom
            nextRandom = Math.floor(Math.random() * blocks.length)
            current = blocks[random][currentRotation]
            currentPosition = 4
            if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
                gameOver()
            } else {
                draw()
                displayShape()
            }
        }
    }

    function moveLeft() {
        undraw()
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
        if (!isAtLeftEdge) currentPosition -= 1
        else {
            border.volume = '0.3'
            border.play();
        }
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1
        }
        draw()
    }

    function moveRight() {
        undraw()
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
        if (!isAtRightEdge) currentPosition += 1
        else {
            border.volume = '0.3'
            border.play();
        }
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1
            border.play();
        }
        draw()
    }

    function rotate() {
        undraw()
        currentRotation++
        if (currentRotation === current.length) currentRotation = 0
        current = blocks[random][currentRotation]
        checkRotatedPosition()
        draw()
    }

    function pause() {
        if (timerId) {
            explosion.style.opacity = "0"
            clearInterval(timerId);
            timerId = null;
            isPaused = true;
            startBtnContainer.classList.remove('hidden');
            startBtn.classList.add('hidden');
            continueBtn.classList.add('show');
        }
    }

    continueBtn.addEventListener('click', () => {
        if (isPaused) {
            timerId = setInterval(moveDown, speed);
            isPaused = false;
            startBtnContainer.classList.add('hidden');
            continueBtn.classList.remove('show');
        }
    });

    function checkRotatedPosition(P) {
        P = P || currentPosition
        if ((P + 1) % width < 4) {
            if (isAtRightEdge()) {
                currentPosition += 1
                checkRotatedPosition(P)
            }
        } else if (P % width > 5) {
            if (isAtLeftEdge()) {
                currentPosition -= 1
                checkRotatedPosition(P)
            }
        }
    }

    function isAtLeftEdge() {
        return current.some(index => (currentPosition + index) % width === 0)
    }

    function isAtRightEdge() {
        return current.some(index => (currentPosition + index) % width === width - 1)
    }

    const displaySquares = document.querySelectorAll('.miniGrid div')
    const displayWidth = 4
    const displayIndex = 0
    const upNextBlocks = [
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1],
        [0, 1, displayWidth, displayWidth + 1],
        [1, displayWidth, displayWidth + 1, displayWidth + 2],
        [displayWidth + 1, displayWidth + 2, displayWidth * 2, displayWidth * 2 + 1],
        [displayWidth, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 2 + 2],
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 2],
        [1, displayWidth + 1, displayWidth * 2 + 1, 2]
    ]

    function displayShape() {
        displaySquares.forEach(square => {
            square.classList.remove('blocks')
            square.style.backgroundColor = ''
        })
        upNextBlocks[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('blocks')
            displaySquares[displayIndex + index].style.color = colors[nextRandom]
        })
    }

    function addScore() {
        for (let i = 0; i < 399; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]

            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10
                scoreSound.volume = '0.6'
                scoreSound.play();
                scoreDisplay.innerHTML = score
                if (score % 100 === 0) {
                    level += 1
                    levelDisplay.innerHTML = level;
                    clearInterval(timerId)
                    levelUp.play();
                    speed -= 100
                    timerId = setInterval(moveDown, speed)
                }
                if (score % 1000 === 0) score1000.play();

                row.forEach(index => {
                    squares[index].classList.remove('taken')
                    squares[index].classList.remove('blocks')
                    squares[index].style.backgroundColor = ''
                })
                const squaresRemoved = squares.splice(i, width)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    function gameOver() {
        explosion.style.opacity = "0"
        startBtn.style.opacity = "1"
        scoreDisplay.innerHTML = "END"
        levelDisplay.innerHTML = "0"
        speed = 1000
        songs.forEach(song => {
            song.pause();
            song.currentTime = 0;
        });
        gameOverSong.play();
        clearInterval(timerId)
        timerId = null
        if (score > highScore) {
            highScore = score
            localStorage.setItem('tetris-hi-score', highScore)
            highScoreDisplay.innerHTML = highScore
        }
        restartBtn.classList.remove('hidden')
        startBtnContainer.classList.remove('hidden')
        startBtn.classList.add('hidden')
        pause();
    }

    function randomSongPlayer() {
        const randomizer = Math.floor(Math.random() * songs.length);
        songs.forEach(song => {
            song.pause();
            song.currentTime = 0;
        });
        songs[randomizer].volume = 0.3;
        songs[randomizer].loop = true;
        songs[randomizer].play();
    }

    startBtn.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId)
            timerId = null
        } else {
            boom.play();
            startScreenSong.pause();
            setTimeout(() => {
                explosion.style.opacity = "1"
                explosion.play();
                startBtn.style.opacity = "0"
                setTimeout(() => {
                    randomSongPlayer();
                    startBtnContainer.classList.add('hidden');
                    draw();
                    timerId = setInterval(moveDown, speed);
                    nextRandom = Math.floor(Math.random() * blocks.length);
                    displayShape();
                }, 1000);
            }, 200)
        }
    })

    restartBtn.addEventListener('click', () => {
        clearInterval(timerId);
        timerId = null;
        squares.forEach((square, index) => {
            if (index < 400) { // 200-ü 400 etdik
                square.classList.remove('taken', 'blocks')
                square.style.backgroundColor = ''
            }
        })
        score = 0;
        level = 0;
        speed = 1000;
        scoreDisplay.innerHTML = score;
        levelDisplay.innerHTML = level;
        currentPosition = 4;
        currentRotation = 0;
        random = Math.floor(Math.random() * blocks.length);
        nextRandom = Math.floor(Math.random() * blocks.length);
        current = blocks[random][currentRotation];
        gameOverSong.pause();
        restartBtn.classList.add('hidden');
        startBtnContainer.classList.add('hidden');
        startBtn.classList.remove('hidden');
        draw();
        displayShape();
        randomSongPlayer();
        timerId = setInterval(moveDown, speed);
    });
})