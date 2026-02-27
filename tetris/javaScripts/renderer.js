// ── Renderer — handles all visual drawing on the grid ──

const COLS = 10;

export function drawPiece(cells, shape, startRow, startCol, color) {
    shape.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            if (value === 1) {
                const index = (startRow + rowIndex) * COLS + (startCol + colIndex);
                if (cells[index]) {
                    cells[index].style.background = color;
                    cells[index].style.boxShadow = `0 0 6px ${color}, inset 0 0 4px rgba(255,255,255,0.2)`;
                    cells[index].style.border = `1px solid rgba(255,255,255,0.3)`;
                }
            }
        });
    });
}

export function erasePiece(cells, shape, startRow, startCol) {
    shape.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            if (value === 1) {
                const index = (startRow + rowIndex) * COLS + (startCol + colIndex);
                if (cells[index] && !cells[index].classList.contains('taken')) {
                    cells[index].style.background = '';
                    cells[index].style.boxShadow = '';
                    cells[index].style.border = '';
                }
            }
        });
    });
}

export function drawGhost(cells, shape, ghostRow, startCol) {
    shape.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            if (value === 1) {
                const index = (ghostRow + rowIndex) * COLS + (startCol + colIndex);
                if (cells[index] && !cells[index].classList.contains('taken')) {
                    cells[index].style.background = 'rgba(255,255,255,0.08)';
                    cells[index].style.boxShadow = '';
                    cells[index].style.border = '1px solid rgba(255,255,255,0.25)';
                    cells[index].dataset.ghost = 'true';
                }
            }
        });
    });
}

export function eraseGhost(cells, shape, ghostRow, startCol) {
    shape.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            if (value === 1) {
                const index = (ghostRow + rowIndex) * COLS + (startCol + colIndex);
                if (cells[index] && cells[index].dataset.ghost === 'true') {
                    cells[index].style.background = '';
                    cells[index].style.boxShadow = '';
                    cells[index].style.border = '';
                    delete cells[index].dataset.ghost;
                }
            }
        });
    });
}

export function drawMiniPiece(miniCells, shape, color) {
    // Clear mini grid first
    miniCells.forEach(c => {
        c.style.background = '';
        c.style.boxShadow = '';
    });

    // Center the piece in the 4x5 mini grid
    const MINI_COLS = 5;
    const offsetCol = Math.floor((MINI_COLS - shape[0].length) / 2);
    const offsetRow = Math.floor((4 - shape.length) / 2);

    shape.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            if (value === 1) {
                const index = (offsetRow + rowIndex) * MINI_COLS + (offsetCol + colIndex);
                if (miniCells[index]) {
                    miniCells[index].style.background = color;
                    miniCells[index].style.boxShadow = `0 0 6px ${color}`;
                }
            }
        });
    });
}
