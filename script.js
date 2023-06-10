import { Pawn, King, Knight, Rook, Bishop, Queen, } from "./modules/pieces.js";
class GameBoard {
    constructor() {
        this.beingDragged = undefined;
        this.draggedElement = undefined;
        this.board = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ];
        this.placeAudio = new Audio("./assets/move-self.mp3");
        this.captureAudio = new Audio("./assets/capture.mp3");
        this.checkedAudio = new Audio("./assets/move-check.mp3");
        this.prevState = [];
        this.nextState = [];
        this.whitePlayersTurn = true;
        this.isWhiteInCheck = false;
        this.isBlackInCheck = false;
    }
    createBoard(htmlElement) {
        for (let i = 0; i < this.board.length; i++) {
            let row = document.createElement("div");
            row.classList.add("row");
            for (let j = 0; j < this.board[0].length; j++) {
                let square = document.createElement("div");
                square.classList.add("square");
                if ((i + j) % 2 !== 0)
                    square.classList.add("square--off-color");
                square.dataset.x = String(i);
                square.dataset.y = String(j);
                row.insertAdjacentElement("beforeend", square);
            }
            htmlElement.insertAdjacentElement("beforeend", row);
        }
    }
    createPieces() {
        const expr = "RNBQKBNR/PPPPPPPP/8/8/8/8/pppppppp/rnbqkbnr";
        let x = 0;
        let y = 0;
        for (let c of expr) {
            let char = c.toLowerCase();
            if (char === "/") {
                x++;
                y = 0;
            }
            else if (char === "8") {
                y = 7;
            }
            else {
                let isWhite = isLowerCase(c.charCodeAt(0));
                let square = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                let piece;
                switch (char) {
                    case "r":
                        piece = new Rook(x, y, isWhite, "rook");
                        break;
                    case "n":
                        piece = new Knight(x, y, isWhite, "knight");
                        break;
                    case "b":
                        piece = new Bishop(x, y, isWhite, "bishop");
                        break;
                    case "q":
                        piece = new Queen(x, y, isWhite, "queen");
                        break;
                    case "k":
                        piece = new King(x, y, isWhite, "king");
                        break;
                    case "p":
                        piece = new Pawn(x, y, isWhite, "pawn");
                        break;
                    default:
                        return;
                }
                let pieceElement = document.createElement("img");
                pieceElement.dataset.x = String(x);
                pieceElement.dataset.y = String(y);
                this.board[x][y] = piece;
                pieceElement.src = piece.image;
                pieceElement.classList.add("chess-piece");
                pieceElement.draggable = true;
                square.insertAdjacentElement("beforeend", pieceElement);
                y++;
            }
        }
        // this.prevState.push(this.board);
    }
    viewBoard() {
        console.log(this.board);
    }
    showMoves(e) {
        // if (e.target === null) return;
        this.clearSquare();
        e.target.classList.add("highlight-box");
        let x = Number(e.target.dataset.x);
        let y = Number(e.target.dataset.y);
        // if (typeof this.board[x][y] === "number") return;
        let piece = this.board[x][y];
        let validMoves = piece.getValidMoves();
        let isWhite = piece.isWhite;
        if (piece.id === "pawn") {
            let specialMoves = piece.getSpecialMoves();
            for (let i = 0; i < specialMoves.length; i++) {
                let specialX = specialMoves[i][0];
                let specialY = specialMoves[i][1];
                let square = this.board[x + specialX][y + specialY];
                if (typeof square === "number" || typeof square === "undefined")
                    continue;
                if (isWhite !== square.isWhite) {
                    validMoves.push([specialX, specialY]);
                }
            }
        }
        for (let i = 0; i < validMoves.length; i++) {
            let square = document.querySelector(`[data-x="${x + Number(validMoves[i][0])}"][data-y="${y + Number(validMoves[i][1])}"]`);
            if (square !== null) {
                let boardSquare = this.board[x + Number(validMoves[i][0])][y + Number(validMoves[i][1])];
                // console.log(boardSquare);
                // if (
                //   typeof boardSquare === "undefined" ||
                //   square === null ||
                //   (boardSquare as Piece).isWhite === isWhite
                // )
                //   continue;
                square.classList.add("availableMoves");
            }
        }
    }
    clearSquare() {
        document.querySelectorAll(".square, .chess-piece").forEach((s) => {
            s.classList.remove("availableMoves");
            s.classList.remove("highlight-box");
        });
    }
    dragStart(e) {
        this.showMoves(e);
        this.beingDragged = e.target;
        this.draggedElement = this.board[e.target.dataset.x][e.target.dataset.y];
    }
    dragDrop(e) {
        if (typeof this.beingDragged === "undefined" ||
            typeof this.draggedElement === "undefined")
            return;
        let newX = e.target.dataset.x;
        let newY = e.target.dataset.y;
        let oldX = Number(this.beingDragged.dataset.x);
        let oldY = Number(this.beingDragged.dataset.y);
        let newPosition = this.board[newX][newY];
        if (this.draggedElement.isWhite === newPosition.isWhite)
            return;
        if ((this.whitePlayersTurn && this.draggedElement.isWhite) ||
            (!this.whitePlayersTurn && !this.draggedElement.isWhite)) {
            if (this.draggedElement.isWhite !== newPosition.isWhite &&
                this.draggedElement.isValidMove(oldX, oldY, newX, newY)) {
                this.whitePlayersTurn = !this.whitePlayersTurn;
                let newPosition = document.querySelector(`[data-x="${newX}"][data-y="${newY}"]`);
                if (newPosition.childElementCount === 1) {
                    let positionsPiece = this.board[newX][newY];
                    if (positionsPiece.isWhite !== this.draggedElement.isWhite) {
                        newPosition.firstChild.remove();
                        this.board[newX][newY] = 0;
                        this.captureAudio.play();
                    }
                }
                else {
                    this.placeAudio.play();
                }
                this.beingDragged.dataset.x = newX;
                this.beingDragged.dataset.y = newY;
                this.draggedElement.x = newX;
                this.draggedElement.y = newY;
                this.board[newX][newY] = this.draggedElement;
                this.board[oldX][oldY] = 0;
                newPosition.insertAdjacentElement("beforeend", this.beingDragged);
                this.isChecked();
                document
                    .querySelectorAll(".square")
                    .forEach((s) => s.classList.remove("availableMoves"));
                if (this.draggedElement.id === "pawn") {
                    this.draggedElement.hadFirstMove = true;
                }
            }
        }
        // this.viewBoard();
        this.dragLeave(e);
        this.clearSquare();
    }
    dragEnter(e) {
        e.target.classList.add("highlight-border");
    }
    dragLeave(e) {
        e.target.classList.remove("highlight-border");
    }
    dragOver(e) {
        e.preventDefault();
    }
    isChecked() {
        for (let i = 0; i < this.board.length; i++) {
            for (let currentPiece of this.board[i]) {
                if (typeof currentPiece === "number" ||
                    typeof currentPiece === "undefined")
                    continue;
                let xPosition = Number(currentPiece.x);
                let yPosition = Number(currentPiece.y);
                let isCurrentWhite = currentPiece.isWhite;
                let validMoves = currentPiece.getValidMoves();
                for (let possibleMove of validMoves) {
                    let possibleXPosition = possibleMove[0] + xPosition;
                    let possibleYPosition = possibleMove[1] + yPosition;
                    let square = document.querySelector(`[data-x="${possibleXPosition}"][data-y="${possibleYPosition}"]`);
                    if (square !== null) {
                        let newPosition = this.board[possibleXPosition][possibleYPosition];
                        if (newPosition.id === "king" &&
                            newPosition.isWhite !== isCurrentWhite) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
}
(function () {
    const gameBoard = document.querySelector(".gameBoard");
    let board = new GameBoard();
    board.createBoard(gameBoard);
    board.createPieces();
    document.querySelectorAll(".chess-piece").forEach((piece) => {
        piece.addEventListener("click", (e) => board.showMoves(e));
        piece.addEventListener("dragstart", (e) => board.dragStart(e));
    });
    document.querySelectorAll(".square").forEach((square) => {
        square.addEventListener("dragover", (e) => board.dragOver(e));
        square.addEventListener("drop", (e) => board.dragDrop(e));
        square.addEventListener("dragleave", (e) => board.dragLeave(e));
        square.addEventListener("dragenter", (e) => board.dragEnter(e));
    });
    board.viewBoard();
})();
function isLowerCase(charCode) {
    return charCode >= 97 && charCode <= 122;
}
