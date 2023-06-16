export class Piece {
    constructor(x, y, isWhite, id, legalMoves, image, coords, type) {
        this.isValid = (posX, posY) => {
            return posX >= 0 && posX < 8 && posY >= 0 && posY < 8;
        };
        this.x = x;
        this.y = y;
        this.isWhite = isWhite;
        this.id = id;
        this.legalMoves = legalMoves;
        this.image = image;
        this.type = type;
        this.coords = coords;
        this.availableMoves = [];
    }
    isSameColor(targetPiece) {
        return this.isWhite === targetPiece.isWhite;
    }
    getAvailableMoves() {
        return this.availableMoves;
    }
    setAvailableMoves(updatedMoves) {
        this.availableMoves = updatedMoves;
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
    getCoords() {
        return "";
    }
}
export class positionalPiece extends Piece {
    constructor(x, y, isWhite, id, legalMoves, image, coords) {
        super(x, y, isWhite, id, legalMoves, image, coords, "positional");
    }
    getValidMoves(posX, posY, board) {
        const validMoves = [];
        for (let i = 0; i < this.legalMoves.length; i++) {
            let newPositionX = Number(posX + this.legalMoves[i][0]);
            let newPositionY = Number(posY + this.legalMoves[i][1]);
            if (this.isValid(newPositionX, newPositionY)) {
                let newPosition = board[newPositionX][newPositionY];
                if (typeof newPosition === "number" || !this.isSameColor(newPosition)) {
                    validMoves.push([newPositionX, newPositionY]);
                }
            }
        }
        return validMoves;
    }
}
export class incrementalPiece extends Piece {
    constructor(x, y, isWhite, id, legalMoves, image, coords) {
        super(x, y, isWhite, id, legalMoves, image, coords, "incremental");
    }
    getValidMoves(posX, posY, board) {
        const validMoves = [];
        for (let i = 0; i < this.legalMoves.length; i++) {
            let initalPosX = posX;
            let initalPosY = posY;
            while (this.isValid(Number(initalPosX + this.legalMoves[i][0]), Number(initalPosY + this.legalMoves[i][1]))) {
                let newPositionX = Number(initalPosX + this.legalMoves[i][0]);
                let newPositionY = Number(initalPosY + this.legalMoves[i][1]);
                let newPosition = board[newPositionX][newPositionY];
                if (typeof newPosition === "number") {
                    validMoves.push([newPositionX, newPositionY]);
                    initalPosX = newPositionX;
                    initalPosY = newPositionY;
                }
                else if (this.isSameColor(newPosition)) {
                    break;
                }
                else {
                    validMoves.push([newPositionX, newPositionY]);
                    break;
                }
            }
        }
        return validMoves;
    }
}
export class Pawn extends incrementalPiece {
    constructor(x, y, isWhite, id, coords) {
        let image;
        let legalMoves;
        if (isWhite) {
            image = "https://www.chess.com/chess-themes/pieces/neo/150/wp.png";
            legalMoves = [
                [-1, 0],
                [-2, 0],
            ];
            super(x, y, isWhite, id, legalMoves, image, coords);
            this.attackMoves = [
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
            super(x, y, isWhite, id, legalMoves, image, coords);
            this.attackMoves = [
                [1, 1],
                [1, -1],
            ];
        }
        this.hadFirstMove = false;
    }
    // public getMoves(posX: number, posY: number, board: (number | Piece)[][]) {
    //   const attackMoves: [number, number][] = [];
    // }
    getAttackMoves(posX, posY, board) {
        const attackMoves = [];
        for (let i = 0; i < this.attackMoves.length; i++) {
            if (this.isValid(Number(posX + this.attackMoves[i][0]), Number(posY + this.attackMoves[i][1]))) {
                let newPositionX = Number(posX + this.attackMoves[i][0]);
                let newPositionY = Number(posY + this.attackMoves[i][1]);
                attackMoves.push([newPositionX, newPositionY]);
            }
        }
        return attackMoves;
    }
    getValidMoves(posX, posY, board) {
        const validMoves = [];
        const cutOff = this.hadFirstMove ? 1 : 2;
        for (let i = 0; i < cutOff; i++) {
            if (this.isValid(Number(posX + this.legalMoves[i][0]), Number(posY + this.legalMoves[i][1]))) {
                let newPositionX = Number(posX + this.legalMoves[i][0]);
                let newPositionY = Number(posY + this.legalMoves[i][1]);
                let newPosition = board[newPositionX][newPositionY];
                if (typeof newPosition === "number") {
                    validMoves.push([newPositionX, newPositionY]);
                }
                else {
                    break;
                }
            }
        }
        for (let i = 0; i < this.attackMoves.length; i++) {
            if (this.isValid(Number(posX + this.attackMoves[i][0]), Number(posY + this.attackMoves[i][1]))) {
                let newPositionX = Number(posX + this.attackMoves[i][0]);
                let newPositionY = Number(posY + this.attackMoves[i][1]);
                let newPosition = board[newPositionX][newPositionY];
                if (typeof newPosition !== "number" && !this.isSameColor(newPosition)) {
                    validMoves.push([newPositionX, newPositionY]);
                }
            }
        }
        return validMoves;
    }
}
export class Queen extends incrementalPiece {
    constructor(x, y, isWhite, id, coords) {
        let image = isWhite
            ? "https://www.chess.com/chess-themes/pieces/neo/150/wq.png"
            : "https://www.chess.com/chess-themes/pieces/neo/150/bq.png";
        let legalMoves = [
            [1, 1],
            [1, 0],
            [1, -1],
            [0, -1],
            [0, 1],
            [-1, -1],
            [-1, 0],
            [-1, 1],
        ];
        super(x, y, isWhite, id, legalMoves, image, coords);
    }
}
export class King extends positionalPiece {
    constructor(x, y, isWhite, id, coords) {
        let image = isWhite
            ? "https://www.chess.com/chess-themes/pieces/neo/150/wk.png"
            : "https://www.chess.com/chess-themes/pieces/neo/150/bk.png";
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
        super(x, y, isWhite, id, legalMoves, image, coords);
        this.hadFirstMove = false;
    }
}
export class Rook extends incrementalPiece {
    constructor(x, y, isWhite, id, coords) {
        let image = isWhite
            ? "https://www.chess.com/chess-themes/pieces/neo/150/wr.png"
            : "https://www.chess.com/chess-themes/pieces/neo/150/br.png";
        let legalMoves = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
        ];
        super(x, y, isWhite, id, legalMoves, image, coords);
        this.hadFirstMove = false;
    }
}
export class Bishop extends incrementalPiece {
    constructor(x, y, isWhite, id, coords) {
        let image = isWhite
            ? "https://www.chess.com/chess-themes/pieces/neo/150/wb.png"
            : "https://www.chess.com/chess-themes/pieces/neo/150/bb.png";
        let legalMoves = [
            [1, 1],
            [1, -1],
            [-1, -1],
            [-1, 1],
        ];
        super(x, y, isWhite, id, legalMoves, image, coords);
    }
}
export class Knight extends positionalPiece {
    constructor(x, y, isWhite, id, coords) {
        let image = isWhite
            ? "https://www.chess.com/chess-themes/pieces/neo/150/wn.png"
            : "https://www.chess.com/chess-themes/pieces/neo/150/bn.png";
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
        super(x, y, isWhite, id, legalMoves, image, coords);
    }
}
