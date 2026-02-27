// ── Tetromino shapes (each rotation is a 2D array of 0s and 1s) ──
export const SHAPES = {
    I: [[1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]],

    O: [[1, 1],
        [1, 1]],

    T: [[0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]],

    S: [[0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]],

    Z: [[1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]],

    L: [[1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]],

    J: [[0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]],
};

// ── Official Tetris Guideline colors ──
export const COLORS = {
    I: '#00f3ff', // Cyan
    O: '#ffe600', // Yellow
    T: '#ff00c8', // Purple
    S: '#00ff9f', // Green
    Z: '#ff3131', // Red
    L: '#ff9000', // Orange
    J: '#4d4dff', // Blue
};

// ── Spawn columns (center for I/O, left-center for rest) ──
export const SPAWN_COL = {
    I: 3, O: 4, T: 3, S: 3, Z: 3, L: 3, J: 3,
};

// ── 7-Bag Random Generator ──
export class Bag7 {
    constructor() {
        this.bag = [];
    }

    refill() {
        this.bag = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
        for (let i = this.bag.length - 1; i > 0; i--) {
            const rand = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[rand]] = [this.bag[rand], this.bag[i]];
        }
    }

    next() {
        if (this.bag.length === 0) this.refill();
        return this.bag.pop();
    }

    peek() {
        // Returns next N pieces without consuming them (for NEXT display)
        if (this.bag.length === 0) this.refill();
        return [...this.bag].reverse();
    }
}
