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
    appendAvailableMoves(newMoves) {
        for (const move of newMoves) {
            this.availableMoves.push(move);
        }
    }
    getX() {
        return this.x;
    }
    setX(newX) {
        this.x = newX;
    }
    getY() {
        return this.y;
    }
    setY(newY) {
        this.y = newY;
    }
    getIsWhite() {
        return this.isWhite;
    }
    getlegalMoves() {
        return this.legalMoves;
    }
    getCoords() {
        return this.coords;
    }
    setCoords(newCoords) {
        this.coords = newCoords;
    }
    getID() {
        return this.id;
    }
    getImage() {
        return this.image;
    }
    getType() {
        return this.type;
    }
    setLegalMoves(newLegalMoves) {
        this.legalMoves = newLegalMoves;
    }
    getValidMoves(board) {
        const validMoves = [];
        if (this instanceof incrementalPiece) {
            if (this instanceof Pawn) {
                for (const move of this.getlegalMoves()) {
                    const newPositionX = this.getX() + move[0];
                    const newPositionY = this.getY() + move[1];
                    if (this.isValid(newPositionX, newPositionY)) {
                        const newPosition = board[newPositionX][newPositionY];
                        if (typeof newPosition === "number") {
                            validMoves.push([newPositionX, newPositionY]);
                        }
                        else {
                            break;
                        }
                    }
                }
                for (const move of this.getAttacks()) {
                    const newPositionX = this.getX() + move[0];
                    const newPositionY = this.getY() + move[1];
                    if (this.isValid(newPositionX, newPositionY)) {
                        const newPosition = board[newPositionX][newPositionY];
                        if (newPosition instanceof Piece &&
                            !this.isSameColor(newPosition)) {
                            validMoves.push([newPositionX, newPositionY]);
                        }
                        else {
                            const possiblePawn = board[this.getX()][newPositionY];
                            if (possiblePawn instanceof Pawn &&
                                possiblePawn.getCanEnPassant()) {
                                validMoves.push([newPositionX, newPositionY]);
                            }
                        }
                    }
                }
                return validMoves;
            }
            for (const moves of this.getlegalMoves()) {
                let newPositionX = this.getX() + moves[0];
                let newPositionY = this.getY() + moves[1];
                while (this.isValid(newPositionX, newPositionY)) {
                    const newPosition = board[newPositionX][newPositionY];
                    if (typeof newPosition === "number" ||
                        !this.isSameColor(newPosition)) {
                        validMoves.push([newPositionX, newPositionY]);
                    }
                    if (newPosition instanceof Piece) {
                        break;
                    }
                    newPositionX += moves[0];
                    newPositionY += moves[1];
                }
            }
        }
        else {
            for (const moves of this.getlegalMoves()) {
                const newPositionX = this.getX() + moves[0];
                const newPositionY = this.getY() + moves[1];
                if (this.isValid(newPositionX, newPositionY)) {
                    const newPosition = board[newPositionX][newPositionY];
                    if (typeof newPosition === "number" ||
                        !this.isSameColor(newPosition)) {
                        validMoves.push([newPositionX, newPositionY]);
                    }
                }
            }
        }
        return validMoves;
    }
    getLegalAttackMoves(board) {
        const validMoves = [];
        if (this instanceof incrementalPiece) {
            if (this instanceof Pawn) {
                for (const move of this.getAttacks()) {
                    const newPositionX = this.getX() + move[0];
                    const newPositionY = this.getY() + move[1];
                    if (this.isValid(newPositionX, newPositionY)) {
                        validMoves.push([newPositionX, newPositionY]);
                    }
                }
                return validMoves;
            }
            for (const moves of this.getlegalMoves()) {
                let newPositionX = this.getX() + moves[0];
                let newPositionY = this.getY() + moves[1];
                while (this.isValid(newPositionX, newPositionY)) {
                    const newPosition = board[newPositionX][newPositionY];
                    if (typeof newPosition === "number" ||
                        this.isSameColor(newPosition)) {
                        validMoves.push([newPositionX, newPositionY]);
                    }
                    if (newPosition instanceof Piece && !(newPosition instanceof King)) {
                        break;
                    }
                    newPositionX += moves[0];
                    newPositionY += moves[1];
                }
            }
        }
        else {
            for (const moves of this.getlegalMoves()) {
                const newPositionX = this.getX() + moves[0];
                const newPositionY = this.getY() + moves[1];
                if (this.isValid(newPositionX, newPositionY)) {
                    const newPosition = board[newPositionX][newPositionY];
                    if (typeof newPosition === "number" ||
                        this.isSameColor(newPosition)) {
                        validMoves.push([newPositionX, newPositionY]);
                    }
                }
            }
        }
        return validMoves;
    }
}
export class positionalPiece extends Piece {
    constructor(x, y, isWhite, id, legalMoves, image, coords) {
        super(x, y, isWhite, id, legalMoves, image, coords, "positional");
    }
}
export class incrementalPiece extends Piece {
    constructor(x, y, isWhite, id, legalMoves, image, coords) {
        super(x, y, isWhite, id, legalMoves, image, coords, "incremental");
    }
}
export class Pawn extends incrementalPiece {
    constructor(x, y, isWhite, id, coords) {
        const [image, legalMoves] = isWhite
            ? [
                "../assets/images/wp.png",
                [
                    [-1, 0],
                    [-2, 0],
                ],
            ]
            : [
                "../assets/images/bp.png",
                [
                    [1, 0],
                    [2, 0],
                ],
            ];
        super(x, y, isWhite, id, legalMoves, image, coords);
        this.legalAttackMoves = isWhite
            ? [
                [-1, 1],
                [-1, -1],
            ]
            : [
                [1, 1],
                [1, -1],
            ];
        this.hadFirstMove = false;
        this.availableAttackMoves = [];
        this.canEnPassant = false;
    }
    concatMoves() {
        this.setAvailableMoves(this.getAvailableMoves().concat(this.availableAttackMoves));
    }
    getAvailableAttackMoves() {
        return this.availableAttackMoves;
    }
    setAvailableAttackMoves(updatedAttackMoves) {
        this.availableAttackMoves = updatedAttackMoves;
    }
    getHadFirstMove() {
        return this.hadFirstMove;
    }
    getAttacks() {
        return this.legalAttackMoves;
    }
    setCanEnPassant(canEnPassant) {
        this.canEnPassant = canEnPassant;
    }
    getCanEnPassant() {
        return this.canEnPassant;
    }
    setHadFirstMove() {
        this.hadFirstMove = true;
        this.setLegalMoves(this.getlegalMoves().slice(0, 1));
    }
    isPromotable() {
        if (this.getX() === 0 || this.getX() === 7) {
            return true;
        }
        return false;
    }
}
export class Queen extends incrementalPiece {
    constructor(x, y, isWhite, id, coords) {
        const image = isWhite
            ? "../assets/images/wq.png"
            : "../assets/images/bq.png";
        const legalMoves = [
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
        const image = isWhite
            ? "../assets/images/wk.png"
            : "../assets/images/bk.png";
        const legalMoves = [
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
    getHadFirstMove() {
        return this.hadFirstMove;
    }
    setHadFirstMove() {
        // If had first move king cant castle
        this.hadFirstMove = true;
    }
    getCastlableMoves(board, player) {
        if (this.hadFirstMove)
            return [];
        const castableMoves = [];
        if (!this.getHadFirstMove()) {
            const availableRooks = [];
            for (const piece of player.getAvailablePieces().values()) {
                if (piece instanceof Rook && !piece.getHadFirstMove())
                    availableRooks.push(piece);
                else
                    continue;
            }
            for (const rook of availableRooks) {
                if (!rook.getHadFirstMove()) {
                    let isRookCastable = true;
                    const rooksX = rook.getX();
                    let rooksY = rook.getY();
                    const incrementer = rooksY < this.getY() ? 1 : -1;
                    do {
                        rooksY += incrementer;
                        if (player.getOpponentHeatMap()[rooksX][rooksY] === -1 ||
                            (board[rooksX][rooksY] instanceof Piece &&
                                !(board[rooksX][rooksY] instanceof King))) {
                            isRookCastable = false;
                            break;
                        }
                    } while (rooksY !== this.getY());
                    if (isRookCastable) {
                        castableMoves.push([rook.getX(), rook.getY()]);
                    }
                }
            }
        }
        this.appendAvailableMoves(castableMoves);
        return castableMoves;
    }
}
export class Rook extends incrementalPiece {
    constructor(x, y, isWhite, id, coords) {
        const image = isWhite
            ? "../assets/images/wr.png"
            : "../assets/images/br.png";
        const legalMoves = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
        ];
        super(x, y, isWhite, id, legalMoves, image, coords);
        this.hadFirstMove = false;
    }
    getHadFirstMove() {
        return this.hadFirstMove;
    }
    setHadFirstMove() {
        // If had first move rook cant castle
        this.hadFirstMove = true;
    }
}
export class Bishop extends incrementalPiece {
    constructor(x, y, isWhite, id, coords) {
        const image = isWhite
            ? "../assets/images/wb.png"
            : "../assets/images/bb.png";
        const legalMoves = [
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
        const image = isWhite
            ? "../assets/images/wn.png"
            : "../assets/images/bn.png";
        const legalMoves = [
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
