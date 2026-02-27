// ── Game Logic — collision detection, rotation, scoring ──

const COLS = 10;
const TOTAL_ROWS = 50;
const VISIBLE_START = 20; // rows 0-19 hidden, 20-39 visible, 40-49 hidden bottom

// ── Collision ──────────────────────────────────────────────

export function canMove(cells, shape, row, col) {
    return shape.every((r, rowIndex) =>
        r.every((value, colIndex) => {
            if (value === 0) return true;
            const newRow = row + rowIndex;
            const newCol = col + colIndex;
            if (newRow < 0 || newRow >= TOTAL_ROWS) return false;
            if (newCol < 0 || newCol >= COLS) return false;
            if (cells[newRow * COLS + newCol].classList.contains('taken')) return false;
            return true;
        })
    );
}

// ── Rotation (clockwise matrix transpose) ──────────────────

export function rotateCW(shape) {
    return shape[0].map((_, i) => shape.map(row => row[i]).reverse());
}

export function rotateCCW(shape) {
    return shape[0].map((_, i) => shape.map(row => row[row.length - 1 - i]));
}

// ── Ghost piece position ───────────────────────────────────

export function getGhostRow(cells, shape, row, col) {
    let ghostRow = row;
    while (canMove(cells, shape, ghostRow + 1, col)) {
        ghostRow++;
    }
    return ghostRow;
}

// ── Lock piece ─────────────────────────────────────────────

export function lockPiece(cells, shape, row, col, color) {
    shape.forEach((r, rowIndex) => {
        r.forEach((value, colIndex) => {
            if (value === 1) {
                const index = (row + rowIndex) * COLS + (col + colIndex);
                cells[index].classList.add('taken');
                cells[index].style.background = color;
                cells[index].style.boxShadow = `0 0 6px ${color}, inset 0 0 4px rgba(255,255,255,0.2)`;
            }
        });
    });
}

// ── Line clear ─────────────────────────────────────────────

export function clearLines(cells) {
    let linesCleared = 0;
    // Only check visible rows (20-39)
    for (let row = 39; row >= VISIBLE_START; row--) {
        const rowCells = [];
        for (let col = 0; col < COLS; col++) {
            rowCells.push(cells[row * COLS + col]);
        }
        const full = rowCells.every(c => c.classList.contains('taken'));
        if (full) {
            linesCleared++;
            // Clear this row
            rowCells.forEach(c => {
                c.classList.remove('taken');
                c.style.background = '';
                c.style.boxShadow = '';
                c.style.border = '';
            });
            // Drop all rows above down by 1
            for (let r = row; r > VISIBLE_START; r--) {
                for (let col = 0; col < COLS; col++) {
                    const above = cells[(r - 1) * COLS + col];
                    const current = cells[r * COLS + col];
                    current.style.background = above.style.background;
                    current.style.boxShadow = above.style.boxShadow;
                    current.style.border = above.style.border;
                    if (above.classList.contains('taken')) {
                        current.classList.add('taken');
                    } else {
                        current.classList.remove('taken');
                    }
                }
            }
            row++; // recheck same row index after shift
        }
    }
    return linesCleared;
}

// ── Scoring ────────────────────────────────────────────────

const LINE_SCORES = [0, 100, 300, 500, 800]; // 0,1,2,3,4 lines

export function calcScore(linesCleared, level, combo, isBackToBack) {
    let score = (LINE_SCORES[linesCleared] || 0) * (level + 1);
    if (combo > 1) score += 50 * combo * (level + 1);
    if (isBackToBack && linesCleared === 4) score = Math.floor(score * 1.5);
    return score;
}

// ── Level / speed ──────────────────────────────────────────

export function getSpeed(level) {
    // Tetris Worlds speed curve (ms per row)
    const speeds = [1000, 793, 618, 473, 355, 262, 190, 135, 94, 64, 43, 28, 18, 11, 7];
    return speeds[Math.min(level, speeds.length - 1)];
}

// ── Top out check ──────────────────────────────────────────

export function isTopOut(cells, shape, row, col) {
    // Block out: spawn position already has taken cells
    return !canMove(cells, shape, row, col);
}
