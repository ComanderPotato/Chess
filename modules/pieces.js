export class Piece {
    constructor(rank, file, isWhite, id, legalMoves, image, coords, pieceValue, figurineCode, charID, type) {
        this.isValid = (rank, file) => {
            return rank >= 0 && rank < 8 && file >= 0 && file < 8;
        };
        this.rank = rank;
        this.file = file;
        this.isWhite = isWhite;
        this.id = id;
        this.legalMoves = legalMoves;
        this.image = image;
        this.coords = coords;
        this.pieceValue = pieceValue;
        this.type = type;
        this.figuirineCode = figurineCode;
        this.charID = charID;
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
    getRank() {
        return this.rank;
    }
    setRank(newRank) {
        this.rank = newRank;
    }
    getFile() {
        return this.file;
    }
    setFile(newFile) {
        this.file = newFile;
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
    getPieceValue() {
        return this.pieceValue;
    }
    getFigurine() {
        return this.figuirineCode;
    }
    getCharID() {
        return this.charID;
    }
    setLegalMoves(newLegalMoves) {
        this.legalMoves = newLegalMoves;
    }
    getValidMoves(board) {
        const validMoves = [];
        if (this instanceof incrementalPiece) {
            if (this instanceof Pawn) {
                for (const move of this.getlegalMoves()) {
                    const newPositionX = this.getRank() + move[0];
                    const newPositionY = this.getFile() + move[1];
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
                    const newPositionX = this.getRank() + move[0];
                    const newPositionY = this.getFile() + move[1];
                    if (this.isValid(newPositionX, newPositionY)) {
                        const newPosition = board[newPositionX][newPositionY];
                        if (newPosition instanceof Piece &&
                            !this.isSameColor(newPosition)) {
                            validMoves.push([newPositionX, newPositionY]);
                        }
                        else {
                            const possiblePawn = board[this.getRank()][newPositionY];
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
                let newPositionX = this.getRank() + moves[0];
                let newPositionY = this.getFile() + moves[1];
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
                const newPositionX = this.getRank() + moves[0];
                const newPositionY = this.getFile() + moves[1];
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
                    const newPositionX = this.getRank() + move[0];
                    const newPositionY = this.getFile() + move[1];
                    if (this.isValid(newPositionX, newPositionY)) {
                        validMoves.push([newPositionX, newPositionY]);
                    }
                }
                return validMoves;
            }
            for (const moves of this.getlegalMoves()) {
                let newPositionX = this.getRank() + moves[0];
                let newPositionY = this.getFile() + moves[1];
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
                const newPositionX = this.getRank() + moves[0];
                const newPositionY = this.getFile() + moves[1];
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
    constructor(rank, file, isWhite, id, legalMoves, image, coords, value, figurineCode, charID) {
        super(rank, file, isWhite, id, legalMoves, image, coords, value, figurineCode, charID, "positional");
    }
}
export class incrementalPiece extends Piece {
    constructor(rank, file, isWhite, id, legalMoves, image, coords, value, figurineCode, charID) {
        super(rank, file, isWhite, id, legalMoves, image, coords, value, figurineCode, charID, "incremental");
    }
}
export class Pawn extends incrementalPiece {
    constructor(rank, file, isWhite, id, coords) {
        const pieceValue = 1;
        const charID = isWhite ? "P" : "p";
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
        const figurineCode = isWhite ? "&#9817" : "&#9823";
        super(rank, file, isWhite, id, legalMoves, image, coords, pieceValue, figurineCode, charID);
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
        if (this.getRank() === 0 || this.getRank() === 7) {
            return true;
        }
        return false;
    }
}
export class Queen extends incrementalPiece {
    constructor(rank, file, isWhite, id, coords) {
        const pieceValue = 9;
        const charID = isWhite ? "Q" : "q";
        const image = isWhite
            ? "../assets/images/wq.png"
            : "../assets/images/bq.png";
        const figurineCode = isWhite ? "&#9813" : "&#9819";
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
        super(rank, file, isWhite, id, legalMoves, image, coords, pieceValue, figurineCode, charID);
    }
}
export class King extends positionalPiece {
    constructor(rank, file, isWhite, id, coords) {
        const pieceValue = 4;
        const charID = isWhite ? "K" : "k";
        const image = isWhite
            ? "../assets/images/wk.png"
            : "../assets/images/bk.png";
        const figurineCode = isWhite ? "&#9812" : "&#9818";
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
        super(rank, file, isWhite, id, legalMoves, image, coords, pieceValue, figurineCode, charID);
        this.hadFirstMove = false;
        this.canCastleKingSide = true;
        this.canCastleQueenSide = true;
    }
    getHadFirstMove() {
        return this.hadFirstMove;
    }
    setHadFirstMove() {
        // If had first move king cant castle
        this.hadFirstMove = true;
    }
    getCanCastleKingSide() {
        return this.canCastleKingSide;
    }
    getCanCastleQueenSide() {
        return this.canCastleQueenSide;
    }
    getCastlableMoves(board, player) {
        if (this.hadFirstMove || player.getIsChecked())
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
                    const rooksX = rook.getRank();
                    let rooksY = rook.getFile();
                    const incrementer = rooksY < this.getFile() ? 1 : -1;
                    do {
                        rooksY += incrementer;
                        if (player.getOpponentHeatMap()[rooksX][rooksY] === -1 ||
                            (board[rooksX][rooksY] instanceof Piece &&
                                !(board[rooksX][rooksY] instanceof King))) {
                            isRookCastable = false;
                            // if (rook.getFile() === 0) {
                            //   this.canCastleQueenSide = false;
                            // } else {
                            //   this.canCastleKingSide = false;
                            // }
                            break;
                        }
                    } while (rooksY !== this.getFile());
                    if (isRookCastable) {
                        // if (rook.getFile() === 0) {
                        //   this.canCastleQueenSide = true;
                        // } else {
                        //   this.canCastleKingSide = true;
                        // }
                        castableMoves.push([rook.getRank(), rook.getFile()]);
                    }
                }
            }
        }
        this.appendAvailableMoves(castableMoves);
        return castableMoves;
    }
}
export class Rook extends incrementalPiece {
    constructor(rank, file, isWhite, id, coords) {
        const pieceValue = 5;
        const charID = isWhite ? "R" : "r";
        const image = isWhite
            ? "../assets/images/wr.png"
            : "../assets/images/br.png";
        const figurineCode = isWhite ? "&#9814" : "&#9820";
        const legalMoves = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
        ];
        super(rank, file, isWhite, id, legalMoves, image, coords, pieceValue, figurineCode, charID);
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
    constructor(rank, file, isWhite, id, coords) {
        const pieceValue = 3;
        const charID = isWhite ? "B" : "b";
        const image = isWhite
            ? "../assets/images/wb.png"
            : "../assets/images/bb.png";
        const figurineCode = isWhite ? "&#9815" : "&#9821";
        const legalMoves = [
            [1, 1],
            [1, -1],
            [-1, -1],
            [-1, 1],
        ];
        super(rank, file, isWhite, id, legalMoves, image, coords, pieceValue, figurineCode, charID);
    }
}
export class Knight extends positionalPiece {
    constructor(rank, file, isWhite, id, coords) {
        const pieceValue = 3;
        const image = isWhite
            ? "../assets/images/wn.png"
            : "../assets/images/bn.png";
        const charID = isWhite ? "N" : "n";
        const figurineCode = isWhite ? "&#9816" : "&#9822";
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
        super(rank, file, isWhite, id, legalMoves, image, coords, pieceValue, figurineCode, charID);
    }
}
