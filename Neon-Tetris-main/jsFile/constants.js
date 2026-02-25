export const WIDTH = 10;
export const COLORS = [
    '#FF3131', '#0FFF50', '#BC13FE', '#FFEA00', '#FF44CC', '#00D4FF', '#FFAC1C'
];

export const TETROMINOS = (width) => {
    return [
        // iTetromino
        [[1, width + 1, width * 2 + 1, width * 3 + 1], [width, width + 1, width + 2, width + 3], [1, width + 1, width * 2 + 1, width * 3 + 1], [width, width + 1, width + 2, width + 3]],
        // oTetromino
        [[0, 1, width, width + 1], [0, 1, width, width + 1], [0, 1, width, width + 1], [0, 1, width, width + 1]],
        // tTetromino
        [[1, width, width + 1, width + 2], [1, width + 1, width + 2, width * 2 + 1], [width, width + 1, width + 2, width * 2 + 1], [1, width, width + 1, width * 2 + 1]],
        // sTetromino
        [[1, 2, width, width + 1], [0, width, width + 1, width * 2 + 1], [1, 2, width, width + 1], [0, width, width + 1, width * 2 + 1]],
        // zTetromino
        [[0, 1, width + 1, width + 2], [1, width, width + 1, width * 2], [0, 1, width + 1, width + 2], [1, width, width + 1, width * 2]],
        // jTetromino
        [[1, width + 1, width * 2 + 1, 0], [width, width + 1, width + 2, 2], [1, width + 1, width * 2 + 1, width * 2 + 2], [width, width + 1, width + 2, width * 2]],
        // lTetromino
        [[1, width + 1, width * 2 + 1, 2], [width, width + 1, width + 2, width * 2 + 2], [1, width + 1, width * 2 + 1, width * 2], [width, width * 2, width * 2 + 1, width * 2 + 2]]
    ];
};