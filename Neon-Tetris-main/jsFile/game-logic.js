import { WIDTH } from './constants.js';

export class TetrisEngine {
    static checkCollision(current, position, squares) {
        return current.some(index => 
            squares[position + index + WIDTH]?.classList.contains('taken')
        );
    }

    static isAtLeftEdge(current, position) {
        return current.some(index => (position + index) % WIDTH === 0);
    }

    static isAtRightEdge(current, position) {
        return current.some(index => (position + index) % WIDTH === WIDTH - 1);
    }

    // This handles the "wall kick" logic you had in checkRotatedPosition
    static getCorrectedRotation(current, position) {
        let p = position;
        if ((p + 1) % WIDTH < 4) {
            if (this.isAtRightEdge(current, p)) p += 1;
        } else if (p % WIDTH > 5) {
            if (this.isAtLeftEdge(current, p)) p -= 1;
        }
        return p;
    }
    static getGhostPosition(current, currentPosition, squares) {
    let ghostPosition = currentPosition;
    while (!current.some(index => 
        squares[ghostPosition + index + WIDTH]?.classList.contains('taken')
    )) {
        ghostPosition += WIDTH;
    }
    return ghostPosition;
}
}