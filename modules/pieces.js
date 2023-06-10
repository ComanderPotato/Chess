export class Piece {
    constructor(x, y, isWhite, id, legalMoves, image) {
        this.x = x;
        this.y = y;
        this.isWhite = isWhite;
        this.id = id;
        this.legalMoves = legalMoves;
        this.image = image;
    }
    // isValidMove(
    //   oldX: number,
    //   oldY: number,
    //   newX: number,
    //   newY: number,
    //   board: (Piece | number)[][]
    // ) {
    //   let isWhite: boolean = (board[oldX][oldY] as Piece).isWhite;
    //   let queue: [x: number, y: number][] = [];
    //   queue.push([oldX, oldY]);
    //   while (queue.length !== 0) {
    //     let current = queue.pop();
    //   }
    //   for (let i = 0; i < this.legalMoves.length; i++) {
    //     if (
    //       Number(oldX) + this.legalMoves[i][0] == newX &&
    //       Number(oldY) + this.legalMoves[i][1] == newY
    //     ) {
    //       return true;
    //     }
    //   }
    //   return false;
    // }
    // check(x, y) {
    // }
    isValidMove(oldX, oldY, newX, newY, board) {
        const rows = board.length;
        const cols = board[0].length;
        const visited = Array(rows)
            .fill(false)
            .map(() => Array(cols).fill(false));
        const queue = [[oldX, oldY]];
        visited[oldX][oldY] = true;
        const isValid = (row, col) => {
            return (row >= 0 &&
                row < rows &&
                col >= 0 &&
                col < cols &&
                board[row][col] !== 0 &&
                !visited[row][col]);
        };
        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1], // Right
        ];
        while (queue.length > 0) {
            const current = queue.shift();
            let [row, col] = current;
            row = Number(row);
            col = Number(col);
            if (row == Number(newY) && col == Number(newX)) {
                console.log("Hello");
                return true;
            }
            for (const [dx, dy] of directions) {
                const newRow = row + dx;
                const newCol = col + dy;
                console.log(newRow);
                console.log(newCol);
                if (isValid(newRow, newCol)) {
                    visited[newRow][newCol] = true;
                    queue.push([newRow, newCol]);
                }
            }
        }
        return false; // No valid path found
    }
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    getlegalMoves() {
        return this.legalMoves;
    }
}
export class Pawn extends Piece {
    constructor(x, y, isWhite, id) {
        let image;
        let legalMoves;
        if (isWhite) {
            image = "https://www.chess.com/chess-themes/pieces/neo/150/wp.png";
            legalMoves = [
                [-1, 0],
                [-2, 0],
            ];
            super(x, y, isWhite, id, legalMoves, image);
            this.specialMoves = [
                [-1, 1],
                [-1, -1],
            ];
        }
        else {
            image = "https://www.chess.com/chess-themes/pieces/neo/150/bp.png";
            legalMoves = [
                [1, 0],
                [2, 0],
            ];
            super(x, y, isWhite, id, legalMoves, image);
            this.specialMoves = [
                [1, 1],
                [1, -1],
            ];
        }
        this.hadFirstMove = false;
    }
    getSpecialMoves() {
        return this.specialMoves;
    }
    getlegalMoves() {
        if (this.hadFirstMove) {
            this.legalMoves = this.legalMoves.slice(0, 1);
        }
        return this.legalMoves;
    }
}
export class Queen extends Piece {
    constructor(x, y, isWhite, id) {
        let image;
        if (isWhite) {
            image = "https://www.chess.com/chess-themes/pieces/neo/150/wq.png";
        }
        else {
            image = "https://www.chess.com/chess-themes/pieces/neo/150/bq.png";
        }
        let legalMoves = [
            [0, 1],
            [0, 2],
            [0, 3],
            [0, 4],
            [0, 5],
            [0, 6],
            [0, 7],
            [0, 8],
            [-1, 0],
            [-2, 0],
            [-3, 0],
            [-4, 0],
            [-5, 0],
            [-6, 0],
            [-7, 0],
            [-8, 0],
            [0, -1],
            [0, -2],
            [0, -3],
            [0, -4],
            [0, -5],
            [0, -6],
            [0, -7],
            [0, -8],
            [1, 0],
            [2, 0],
            [3, 0],
            [4, 0],
            [5, 0],
            [6, 0],
            [7, 0],
            [8, 0],
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
            [5, 5],
            [6, 6],
            [7, 7],
            [8, 8],
            [-1, 1],
            [-2, 2],
            [-3, 3],
            [-4, 4],
            [-5, 5],
            [-6, 6],
            [-7, 7],
            [-8, 8],
            [1, -1],
            [2, -2],
            [3, -3],
            [4, -4],
            [5, -5],
            [6, -6],
            [7, -7],
            [8, -8],
            [-1, -1],
            [-2, -2],
            [-3, -3],
            [-4, -4],
            [-5, -5],
            [-6, -6],
            [-7, -7],
            [-8, -8],
        ];
        super(x, y, isWhite, id, legalMoves, image);
    }
}
export class King extends Piece {
    constructor(x, y, isWhite, id) {
        let image;
        if (isWhite) {
            image = "https://www.chess.com/chess-themes/pieces/neo/150/wk.png";
        }
        else {
            image = "https://www.chess.com/chess-themes/pieces/neo/150/bk.png";
        }
        let legalMoves = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
            [1, 1],
            [1, -1],
            [-1, -1],
            [-1, 1],
        ];
        super(x, y, isWhite, id, legalMoves, image);
    }
}
export class Rook extends Piece {
    constructor(x, y, isWhite, id) {
        let image;
        if (isWhite) {
            image = "https://www.chess.com/chess-themes/pieces/neo/150/wr.png";
        }
        else {
            image = "https://www.chess.com/chess-themes/pieces/neo/150/br.png";
        }
        let legalMoves = [
            [0, 1],
            [0, 2],
            [0, 3],
            [0, 4],
            [0, 5],
            [0, 6],
            [0, 7],
            [0, 8],
            [-1, 0],
            [-2, 0],
            [-3, 0],
            [-4, 0],
            [-5, 0],
            [-6, 0],
            [-7, 0],
            [-8, 0],
            [0, -1],
            [0, -2],
            [0, -3],
            [0, -4],
            [0, -5],
            [0, -6],
            [0, -7],
            [0, -8],
            [1, 0],
            [2, 0],
            [3, 0],
            [4, 0],
            [5, 0],
            [6, 0],
            [7, 0],
            [8, 0],
        ];
        super(x, y, isWhite, id, legalMoves, image);
    }
}
export class Bishop extends Piece {
    constructor(x, y, isWhite, id) {
        let image;
        if (isWhite) {
            image = "https://www.chess.com/chess-themes/pieces/neo/150/wb.png";
        }
        else {
            image = "https://www.chess.com/chess-themes/pieces/neo/150/bb.png";
        }
        let legalMoves = [
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
            [5, 5],
            [6, 6],
            [7, 7],
            [8, 8],
            [-1, 1],
            [-2, 2],
            [-3, 3],
            [-4, 4],
            [-5, 5],
            [-6, 6],
            [-7, 7],
            [-8, 8],
            [1, -1],
            [2, -2],
            [3, -3],
            [4, -4],
            [5, -5],
            [6, -6],
            [7, -7],
            [8, -8],
            [-1, -1],
            [-2, -2],
            [-3, -3],
            [-4, -4],
            [-5, -5],
            [-6, -6],
            [-7, -7],
            [-8, -8],
        ];
        super(x, y, isWhite, id, legalMoves, image);
    }
}
export class Knight extends Piece {
    constructor(x, y, isWhite, id) {
        let image;
        if (isWhite) {
            image = "https://www.chess.com/chess-themes/pieces/neo/150/wn.png";
        }
        else {
            image = "https://www.chess.com/chess-themes/pieces/neo/150/bn.png";
        }
        let legalMoves = [
            [2, 1],
            [2, -1],
            [-2, 1],
            [-2, -1],
            [1, 2],
            [1, -2],
            [-1, 2],
            [-1, -2],
        ];
        super(x, y, isWhite, id, legalMoves, image);
    }
}
