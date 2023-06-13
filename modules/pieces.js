export class Piece {
    constructor(x, y, isWhite, id, legalMoves, image, type) {
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
    }
    isSameColor(targetPiece) {
        return this.isWhite === targetPiece.isWhite;
    }
    isValidMove1(oldX, oldY, newX, newY) {
        for (let i = 0; i < this.legalMoves.length; i++) {
            if (Number(oldX) + this.legalMoves[i][0] == newX &&
                Number(oldY) + this.legalMoves[i][1] == newY) {
                return true;
            }
        }
        return false;
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
export class positionalPiece extends Piece {
    constructor(x, y, isWhite, id, legalMoves, image) {
        super(x, y, isWhite, id, legalMoves, image, "positional");
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
    constructor(x, y, isWhite, id, legalMoves, image) {
        super(x, y, isWhite, id, legalMoves, image, "incremental");
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
            super(x, y, isWhite, id, legalMoves, image);
            this.attackMoves = [
                [1, 1],
                [1, -1],
            ];
        }
        this.hadFirstMove = false;
    }
    getAttackMoves(posX, posY, board) {
        const attackMoves = [];
        for (let i = 0; i < this.attackMoves.length; i++) {
            if (this.isValid(Number(posX + this.attackMoves[i][0]), Number(posY + this.attackMoves[i][1]))) {
                let newPositionX = Number(posX + this.attackMoves[i][0]);
                let newPositionY = Number(posY + this.attackMoves[i][1]);
                let newPosition = board[newPositionX][newPositionY];
                if (typeof newPosition !== "number" && !this.isSameColor(newPosition)) {
                    attackMoves.push([newPositionX, newPositionY]);
                }
            }
        }
        return attackMoves;
    }
    getValidMoves(posX, posY, board) {
        const validMoves = [];
        let cutOff;
        if (this.hadFirstMove) {
            cutOff = 1;
        }
        else {
            cutOff = 2;
        }
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
    constructor(x, y, isWhite, id) {
        let image;
        if (isWhite) {
            image = "https://www.chess.com/chess-themes/pieces/neo/150/wq.png";
        }
        else {
            image = "https://www.chess.com/chess-themes/pieces/neo/150/bq.png";
        }
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
        super(x, y, isWhite, id, legalMoves, image);
    }
}
export class King extends positionalPiece {
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
        this.hadFirstMove = false;
    }
}
export class Rook extends incrementalPiece {
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
            [0, -1],
            [1, 0],
            [-1, 0],
        ];
        super(x, y, isWhite, id, legalMoves, image);
        this.hadFirstMove = false;
    }
}
export class Bishop extends incrementalPiece {
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
            [1, -1],
            [-1, -1],
            [-1, 1],
        ];
        super(x, y, isWhite, id, legalMoves, image);
    }
}
export class Knight extends positionalPiece {
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
