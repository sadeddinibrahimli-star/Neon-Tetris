import { createGrid }                              from './javaScripts/createGrid.js';
import { SHAPES, COLORS, SPAWN_COL, Bag7 }         from './javaScripts/tetremonies.js';
import { drawPiece, erasePiece, drawGhost,
         eraseGhost, drawMiniPiece }               from './javaScripts/renderer.js';
import { canMove, rotateCW, rotateCCW, getGhostRow,
         lockPiece, clearLines, calcScore,
         getSpeed, isTopOut }                      from './javaScripts/game-logic.js';
import { Controller }                              from './javaScripts/controller.js';

// ── Build grids ────────────────────────────────────────────
createGrid('grid-container', 50, 10);
createGrid('gridNext', 4, 5);
createGrid('gridHold', 4, 5);

// ── Cell references ────────────────────────────────────────
const cells     = document.querySelectorAll('#grid-container .grid-item');
const nextCells = document.querySelectorAll('#gridNext .grid-item');
const holdCells = document.querySelectorAll('#gridHold .grid-item');

// ── UI refs ────────────────────────────────────────────────
const scoreEl     = document.querySelector('.score');
const highScoreEl = document.querySelector('.highScore');
const levelEl     = document.querySelector('.level');
const comboEl     = document.querySelector('.combo');

const overlayStart     = document.querySelector('.start');
const overlayRestart   = document.querySelector('.restart');
const overlayContunie  = document.querySelector('.contunie');
const overlayCountdown = document.querySelector('.countdown');
const overlayBoom      = document.querySelector('.boom');

// ── Helper: show/hide overlay panels ──────────────────────
function showOnly(el) {
    [overlayStart, overlayRestart, overlayContunie, overlayCountdown, overlayBoom].forEach(o => {
        o.style.opacity = '0';
        o.style.pointerEvents = 'none';
    });
    if (el) {
        el.style.opacity = '1';
        el.style.pointerEvents = el === overlayCountdown || el === overlayBoom ? 'none' : 'auto';
    }
}

// ── Game state ─────────────────────────────────────────────
const bag         = new Bag7();
let current       = null;   // { shape, color, row, col, name }
let holdPiece     = null;   // { shape, color, name }
let canHold       = true;
let ghostRow      = 0;
let timerId       = null;
let isPaused      = false;
let isGameOver    = false;
let score         = 0;
let highScore     = 0;
let level         = 0;
let lines         = 0;
let combo         = 0;
let backToBack    = false;
let controller    = null;

// ── Spawn ──────────────────────────────────────────────────
function spawnPiece() {
    const name  = bag.next();
    const shape = SHAPES[name];
    const color = COLORS[name];
    const col   = SPAWN_COL[name];
    const row   = name === 'I' ? 19 : 18; // spawn just above visible area

    if (isTopOut(cells, shape, row, col)) {
        gameOver();
        return;
    }

    current = { shape, color, row, col, name };
    canHold = true;

    updateGhost();
    drawGhost(cells, current.shape, ghostRow, current.col);
    drawPiece(cells, current.shape, current.row, current.col, current.color);
    drawMiniPiece(nextCells, SHAPES[bag.peek()[0]], COLORS[bag.peek()[0]]);
}

// ── Ghost ──────────────────────────────────────────────────
function updateGhost() {
    if (!current) return;
    eraseGhost(cells, current.shape, ghostRow, current.col);
    ghostRow = getGhostRow(cells, current.shape, current.row, current.col);
    drawGhost(cells, current.shape, ghostRow, current.col);
}

// ── Movement ───────────────────────────────────────────────
function moveLeft() {
    if (!current || isPaused) return;
    if (canMove(cells, current.shape, current.row, current.col - 1)) {
        eraseGhost(cells, current.shape, ghostRow, current.col);
        erasePiece(cells, current.shape, current.row, current.col);
        current.col--;
        updateGhost();
        drawPiece(cells, current.shape, current.row, current.col, current.color);
    }
}

function moveRight() {
    if (!current || isPaused) return;
    if (canMove(cells, current.shape, current.row, current.col + 1)) {
        eraseGhost(cells, current.shape, ghostRow, current.col);
        erasePiece(cells, current.shape, current.row, current.col);
        current.col++;
        updateGhost();
        drawPiece(cells, current.shape, current.row, current.col, current.color);
    }
}

function moveDown() {
    if (!current || isPaused) return;
    if (canMove(cells, current.shape, current.row + 1, current.col)) {
        erasePiece(cells, current.shape, current.row, current.col);
        current.row++;
        drawPiece(cells, current.shape, current.row, current.col, current.color);
    } else {
        freeze();
    }
}

function hardDrop() {
    if (!current || isPaused) return;
    eraseGhost(cells, current.shape, ghostRow, current.col);
    erasePiece(cells, current.shape, current.row, current.col);
    current.row = ghostRow;
    drawPiece(cells, current.shape, current.row, current.col, current.color);
    freeze();
}

function rotate(dir = 'cw') {
    if (!current || isPaused) return;
    const rotated = dir === 'cw' ? rotateCW(current.shape) : rotateCCW(current.shape);

    // Try normal, then wall kicks (+1, -1, +2, -2)
    const kicks = [0, 1, -1, 2, -2];
    for (const kick of kicks) {
        if (canMove(cells, rotated, current.row, current.col + kick)) {
            eraseGhost(cells, current.shape, ghostRow, current.col);
            erasePiece(cells, current.shape, current.row, current.col);
            current.shape = rotated;
            current.col += kick;
            updateGhost();
            drawPiece(cells, current.shape, current.row, current.col, current.color);
            return;
        }
    }
}

// ── Hold ───────────────────────────────────────────────────
function hold() {
    if (!current || !canHold || isPaused) return;
    canHold = false;

    eraseGhost(cells, current.shape, ghostRow, current.col);
    erasePiece(cells, current.shape, current.row, current.col);

    if (holdPiece) {
        const temp = holdPiece;
        holdPiece = { name: current.name, shape: SHAPES[current.name], color: current.color };
        current = { shape: temp.shape, color: temp.color, row: 18, col: SPAWN_COL[temp.name], name: temp.name };
        updateGhost();
        drawGhost(cells, current.shape, ghostRow, current.col);
        drawPiece(cells, current.shape, current.row, current.col, current.color);
    } else {
        holdPiece = { name: current.name, shape: SHAPES[current.name], color: current.color };
        current = null;
        spawnPiece();
    }

    drawMiniPiece(holdCells, holdPiece.shape, holdPiece.color);
}

// ── Freeze / lock ──────────────────────────────────────────
function freeze() {
    if (!current) return;
    eraseGhost(cells, current.shape, ghostRow, current.col);
    lockPiece(cells, current.shape, current.row, current.col, current.color);

    const cleared = clearLines(cells);

    if (cleared > 0) {
        const isTetris = cleared === 4;
        const isB2B = backToBack && isTetris;
        const gained = calcScore(cleared, level, combo, isB2B);
        score += gained;
        combo++;
        backToBack = isTetris;
        lines += cleared;
        level = Math.floor(lines / 10);
    } else {
        combo = 0;
    }

    updateUI();
    restartTimer();
    spawnPiece();
}

// ── UI update ──────────────────────────────────────────────
function updateUI() {
    scoreEl.textContent     = score;
    levelEl.textContent     = level;
    comboEl.textContent     = combo > 1 ? `x${combo}` : '0';
    if (score > highScore) {
        highScore = score;
        highScoreEl.textContent = highScore;
    }
}

// ── Timer ──────────────────────────────────────────────────
function restartTimer() {
    clearInterval(timerId);
    timerId = setInterval(moveDown, getSpeed(level));
}

// ── Pause ──────────────────────────────────────────────────
function pause() {
    if (isGameOver) return;
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(timerId);
        showOnly(overlayContunie);
    } else {
        startCountdown(() => {
            showOnly(null);
            restartTimer();
        });
    }
}

// ── Countdown 3-2-1 ───────────────────────────────────────
function startCountdown(callback) {
    let count = 3;
    showOnly(overlayCountdown);
    overlayCountdown.textContent = count;
    const id = setInterval(() => {
        count--;
        if (count <= 0) {
            clearInterval(id);
            showOnly(null);
            callback();
        } else {
            overlayCountdown.textContent = count;
        }
    }, 1000);
}

// ── Game over ──────────────────────────────────────────────
function gameOver() {
    isGameOver = true;
    clearInterval(timerId);
    timerId = null;
    showOnly(overlayBoom);
    setTimeout(() => showOnly(overlayRestart), 1500);
}

// ── Reset ──────────────────────────────────────────────────
function resetGame() {
    clearInterval(timerId);
    timerId    = null;
    current    = null;
    holdPiece  = null;
    canHold    = true;
    ghostRow   = 0;
    isPaused   = false;
    isGameOver = false;
    score      = 0;
    level      = 0;
    lines      = 0;
    combo      = 0;
    backToBack = false;

    // Clear all cells
    cells.forEach(c => {
        c.classList.remove('taken');
        c.style.background = '';
        c.style.boxShadow  = '';
        c.style.border     = '';
        delete c.dataset.ghost;
    });
    nextCells.forEach(c => c.style.background = '');
    holdCells.forEach(c => c.style.background = '');

    updateUI();
}

// ── Start game ─────────────────────────────────────────────
function startGame() {
    resetGame();
    startCountdown(() => {
        spawnPiece();
        restartTimer();
    });
}

// ── Button listeners ───────────────────────────────────────
document.querySelector('.start button').addEventListener('click', () => {
    controller = new Controller({ moveLeft, moveRight, moveDown, rotateCW: () => rotate('cw'), rotateCCW: () => rotate('ccw'), hardDrop, hold, pause });
    startGame();
});

document.querySelector('.restart button').addEventListener('click', () => {
    startGame();
});

document.querySelector('.contunie button').addEventListener('click', () => {
    pause(); // resume
});

// ── Initial overlay ────────────────────────────────────────
showOnly(overlayStart);
