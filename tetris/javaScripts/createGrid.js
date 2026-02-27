export function createGrid(containerId, rows, cols) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    for (let c = 0; c < rows * cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-item';
        container.appendChild(cell);
    }
}
