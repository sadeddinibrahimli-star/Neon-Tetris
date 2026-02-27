// ── Controller — keyboard input ──

export class Controller {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.handler = this.handleKey.bind(this);
        document.addEventListener('keydown', this.handler);
    }

    handleKey(e) {
        const { moveLeft, moveRight, moveDown, rotateCW, rotateCCW, hardDrop, hold, pause } = this.callbacks;
        switch (e.keyCode) {
            case 37: e.preventDefault(); moveLeft();    break; // Left arrow
            case 39: e.preventDefault(); moveRight();   break; // Right arrow
            case 40: e.preventDefault(); moveDown();    break; // Down arrow (soft drop)
            case 38: e.preventDefault(); rotateCW();    break; // Up arrow
            case 88: e.preventDefault(); rotateCW();    break; // X
            case 90: e.preventDefault(); rotateCCW();   break; // Z
            case 32: e.preventDefault(); hardDrop();    break; // Space
            case 67: e.preventDefault(); hold();        break; // C
            case 16: e.preventDefault(); hold();        break; // Shift
            case 80: e.preventDefault(); pause();       break; // P
            case 27: e.preventDefault(); pause();       break; // Esc
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.handler);
    }
}
