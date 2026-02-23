document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid')
    let squares = Array.from(document.querySelectorAll('.grid div'))
    const scoreDisplay = document.getElementById('score')
    const highScoreDisplay = document.getElementById('high-score')
    const startBtnContainer = document.getElementById('startButton')
    const restartBtn = document.getElementById('restartBtn')
    const startBtn = document.getElementById('startBtn')
    const width = 10
    let nextRandom = 0
    let timerId = null
    let score = 0
    let highScore = localStorage.getItem('tetris-hi-score') || 0
    highScoreDisplay.innerHTML = highScore

    const colors = [
        'orange',
        'red',
        'purple',
        'yellow',
        'green',
        'blue',
        'pink'
    ]

    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ]
    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
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
    const sTetromino = [
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1]
    ]
    const jTetromino = [
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2],
        [1, 2, width + 1, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 2]
    ]

    const blocks = [iTetromino, oTetromino, tTetromino, sTetromino, zTetromino, jTetromino, lTetromino]

    let currentPosition = 4
    let currentRotation = 0
    let random = Math.floor(Math.random() * blocks.length)
    let current = blocks[random][currentRotation]

    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('blocks')
            squares[currentPosition + index].style.backgroundColor = colors[random]
        })
    }

    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('blocks')
            squares[currentPosition + index].style.backgroundColor = ''
        })
    }

    function control(e) {
        if (timerId) {
            if (e.keyCode === 37) moveLeft()
            else if (e.keyCode === 38) rotate()
            else if (e.keyCode === 39) moveRight()
            else if (e.keyCode === 40) moveDown()
        }
    }
    document.addEventListener('keydown', control)

    function moveDown() {
        if (!timerId) return
        undraw()
        currentPosition += width
        draw()
        freeze()
    }

    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'))
            random = nextRandom
            nextRandom = Math.floor(Math.random() * blocks.length)
            current = blocks[random][currentRotation]
            currentPosition = 4
            draw()
            displayShape()
            addScore()
            gameOver()
        }
    }

    function moveLeft() {
        undraw()
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
        if (!isAtLeftEdge) currentPosition -= 1
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1
        }
        draw()
    }

    function moveRight() {
        undraw()
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
        if (!isAtRightEdge) currentPosition += 1
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1
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
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
        })
    }

    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]
            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10
                scoreDisplay.innerHTML = score
                row.forEach(index => {
                    squares[index].classList.remove('taken', 'blocks')
                    squares[index].style.backgroundColor = ''
                })
                const squaresRemoved = squares.splice(i, width)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = "END"
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
        }
    }

    startBtn.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId)
            timerId = null
        } else {
            startBtnContainer.classList.add('hidden')
            draw()
            timerId = setInterval(moveDown, 1000)
            nextRandom = Math.floor(Math.random() * blocks.length)
            displayShape()
        }
    })

    restartBtn.addEventListener('click', () => {
        squares.forEach((square, index) => {
            if (index < 200) {
                square.classList.remove('taken', 'blocks')
                square.style.backgroundColor = ''
            }
        })
        score = 0
        scoreDisplay.innerHTML = score
        currentPosition = 4
        currentRotation = 0
        random = Math.floor(Math.random() * blocks.length)
        nextRandom = Math.floor(Math.random() * blocks.length)
        current = blocks[random][currentRotation]
        restartBtn.classList.add('hidden')
        startBtnContainer.classList.add('hidden')
        draw()
        displayShape()
        timerId = setInterval(moveDown, 1000)
    })
})