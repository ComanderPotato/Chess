import { Piece, Pawn, King, Knight, Rook, Bishop, Queen, } from "./modules/pieces.js";
import Player from "./modules/Player.js";
import getCoords from "./modules/Utils/Coordinates.js";
class GameBoard {
    constructor() {
        this.BOARD_COLS = 8;
        this.BOARD_ROWS = 8;
        this.placeAudio = new Audio("./assets/move-self.mp3");
        this.captureAudio = new Audio("./assets/capture.mp3");
        this.checkedAudio = new Audio("./assets/move-check.mp3");
        this.initializeVariables();
        this.createGame();
    }
    initializeVariables() {
        this.board = this.createEmptyBoard();
        this.whitePlayer = new Player(true, [7, 4]);
        this.blackPlayer = new Player(false, [0, 4]);
        this.isBoardRotated = false;
        this.unselectPiece();
        this.prevStateStack = [];
        this.nextStateStack = [];
        this.whitePlayersTurn = true;
        this.totalPieces = new Map();
    }
    createBoard(htmlElement) {
        for (let i = 0; i < this.BOARD_COLS; i++) {
            const row = document.createElement("div");
            row.classList.add("row");
            for (let j = 0; j < this.BOARD_ROWS; j++) {
                const square = document.createElement("div");
                const hintSquare = document.createElement("div");
                hintSquare.classList.add("hint");
                square.classList.add("square");
                if ((i + j) % 2 !== 0)
                    square.classList.add("square--off-color");
                square.dataset.x = hintSquare.dataset.x = String(i);
                square.dataset.y = hintSquare.dataset.y = String(j);
                square.dataset.isMoveableTo = "false";
                hintSquare.dataset.hint = "true";
                row.insertAdjacentElement("beforeend", square);
                square.insertAdjacentElement("beforeend", hintSquare);
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
                const coords = getCoords(x, y);
                switch (char) {
                    case "r":
                        piece = new Rook(x, y, isWhite, "rook", coords);
                        break;
                    case "n":
                        piece = new Knight(x, y, isWhite, "knight", coords);
                        break;
                    case "b":
                        piece = new Bishop(x, y, isWhite, "bishop", coords);
                        break;
                    case "q":
                        piece = new Queen(x, y, isWhite, "queen", coords);
                        break;
                    case "k":
                        piece = new King(x, y, isWhite, "king", coords);
                        break;
                    case "p":
                        piece = new Pawn(x, y, isWhite, "pawn", coords);
                        break;
                    default:
                        return;
                }
                // isWhite
                //   ? this.whitePlayer.addPiece(piece)
                //   : this.blackPlayer.addPiece(piece);
                this.addPiece(piece);
                const pieceElement = document.createElement("img");
                pieceElement.dataset.x = String(x);
                pieceElement.dataset.y = String(y);
                pieceElement.setAttribute("name", "chess-piece");
                this.board[x][y] = piece;
                pieceElement.src = piece.getImage();
                pieceElement.classList.add("chess-piece");
                pieceElement.draggable = true;
                square.insertAdjacentElement("beforeend", pieceElement);
                y++;
            }
        }
        this.updateState();
        // this.generateHeatMaps();
        this.updateAvailableMoves();
    }
    getLegalMoves(currentPiece, pawnsAttackMoves = false, board = this.board) {
        // if (currentPiece instanceof Pawn) {
        //   if (pawnsAttackMoves) {
        //     return currentPiece.getValidAttackMoves(board);
        //   } else {
        //     return currentPiece.getValidMoves(board);
        //   }
        // } else {
        //   let validMoves = (currentPiece as incrementalPiece).getValidMoves(board);
        //   if (currentPiece.getID() === "king") {
        //     const playersMap = currentPiece.getIsWhite()
        //       ? this.whitePlayer.getOpponentHeatMap()
        //       : this.blackPlayer.getOpponentHeatMap();
        //     validMoves = validMoves.filter(
        //       (move) => playersMap[move[0]][move[1]] === 0
        //     );
        //   }
        //   return validMoves;
        // }
        return currentPiece.getLegalAttackMoves(board);
    }
    promotePawn(e, pawnX, pawnY) {
        console.log(e.target);
        if (!e.target || !(e.target instanceof HTMLImageElement))
            return;
        const pawnToPromote = this.board[pawnX][pawnY];
        let piece;
        switch (e.target.dataset.piece) {
            case "queen":
                piece = new Queen(pawnX, pawnY, pawnToPromote.getIsWhite(), "queen", getCoords(pawnX, pawnY));
                break;
            case "knight":
                piece = new Knight(pawnX, pawnY, pawnToPromote.getIsWhite(), "knight", getCoords(pawnX, pawnY));
                break;
            case "rook":
                piece = new Rook(pawnX, pawnY, pawnToPromote.getIsWhite(), "rook", getCoords(pawnX, pawnY));
                break;
            case "bishop":
                piece = new Bishop(pawnX, pawnY, pawnToPromote.getIsWhite(), "bishop", getCoords(pawnX, pawnY));
                break;
            default:
                return;
        }
        const pieceElement = document.createElement("img");
        pieceElement.dataset.x = String(pawnX);
        pieceElement.dataset.y = String(pawnY);
        pieceElement.setAttribute("name", "chess-piece");
        this.board[pawnX][pawnY] = piece;
        pieceElement.src = piece.getImage();
        pieceElement.classList.add("chess-piece");
        pieceElement.draggable = true;
        const pawnElement = document.querySelector(`.chess-piece[data-x="${pawnX}"][data-y="${pawnY}"]`);
        pawnElement.remove();
        this.removePiece(pawnToPromote);
        document.querySelector(`.square[data-x="${pawnX}"][data-y="${pawnY}"]`).insertAdjacentElement("beforeend", pieceElement);
        this.addPiece(piece);
        pieceElement.addEventListener("click", this.selectPiece.bind(this));
        pieceElement.addEventListener("dragstart", this.dragStart.bind(this));
        this.closeModal();
    }
    checkVictory() {
        const whiteArmy = this.whitePlayer.getAvailablePieces().size;
        const blackArmy = this.blackPlayer.getAvailablePieces().size;
        const winner = document.querySelector(".winner");
        if (this.whitePlayer.getAvailableMoves() === 0) {
            if (this.whitePlayer.getIsChecked()) {
                winner.textContent = "Black Win";
            }
            else {
                winner.textContent = "Stale mate";
            }
        }
        else if (this.blackPlayer.getAvailableMoves() === 0) {
            winner.textContent = "Hello";
            if (this.blackPlayer.getIsChecked()) {
                winner.textContent = "White Win";
            }
            else {
                winner.textContent = "Stale mate";
            }
        }
        // else {
        //   if (
        //     (whiteArmy === 1 && blackArmy === 1) ||
        //     (whiteArmy === 16 && blackArmy === 1) ||
        //     (whiteArmy === 1 && blackArmy === 16)
        //   ) {
        //     winner!.textContent = "Insufficient material";
        //   }
        //   else {
        //     const whiteMap = new Map<string, number>();
        //     const blackMap = new Map<string, number>();
        //     for (const piece of this.whitePlayer.getAvailablePieces()) {
        //       whiteMap.set(piece[1].getID(), (whiteMap.get("a") ?? 0) + 1);
        //     }
        //     for (const piece of this.blackPlayer.getAvailablePieces()) {
        //       blackMap.set(piece[1].getID(), (blackMap.get("a") ?? 0) + 1);
        //     }
        //     const whiteKing =
        //       typeof whiteMap.get("king") === "undefined"
        //         ? 0
        //         : whiteMap.get("king");
        //     const blackKing =
        //       typeof blackMap.get("king") === "undefined"
        //         ? 0
        //         : blackMap.get("king");
        //     const whiteBishop =
        //       typeof whiteMap.get("bishop") === "undefined"
        //         ? 0
        //         : whiteMap.get("bishop");
        //     const blackBishop =
        //       typeof blackMap.get("bishop") === "undefined"
        //         ? 0
        //         : blackMap.get("bishop");
        //     const whiteKnight =
        //       typeof whiteMap.get("knight") === "undefined"
        //         ? 0
        //         : whiteMap.get("knight");
        //     const blackKnight =
        //       typeof blackMap.get("knight") === "undefined"
        //         ? 0
        //         : blackMap.get("knight");
        //     const blackMinor = blackKnight! + blackBishop!;
        //     const whiteMinor = whiteKnight! + whiteBishop!;
        //     console.log(blackMap);
        //     if (
        //       (whiteKing === 1 && whiteMinor === 1 && blackKing === 1) ||
        //       (blackKing === 1 && blackMinor === 1 && whiteKing === 1)
        //     ) {
        //       winner!.textContent = "Insufficient material";
        //     } else if (
        //       (whiteKing === 1 && whiteKnight === 2 && blackKing === 1) ||
        //       (blackKing === 1 && blackKnight === 2 && whiteKing === 1)
        //     ) {
        //       winner!.textContent = "Insufficient material";
        //     } else if (
        //       whiteKing === 1 &&
        //       whiteMinor === 1 &&
        //       blackKing === 1 &&
        //       blackMinor === 1
        //     ) {
        //       winner!.textContent = "Insufficient material";
        //     }
        //   }
        //   /*
        //   King vs king
        //   King + minor (bishop or knight) piece vs king
        //   Lone king vs all the pieces
        //   King + two knights vs king
        //   King + minor piece vs king + minor piece
        //   */
        // }
    }
    getGeneratedMoves(currentPiece, clonedBoard, clonedHeatMap, kingsPosition) {
        // const viableMoves: [number, number][] = [];
        // if (currentPiece instanceof Pawn) {
        //   const availableMoves = currentPiece
        //     .getValidMoves(clonedBoard)
        //     .concat(currentPiece.getValidAttackMoves(clonedBoard));
        //   // const availableAttackMoves = currentPiece.getValidAttackMoves(
        //   //   currentPiece.getX(),
        //   //   currentPiece.getY(),
        //   //   clonedBoard
        //   // );
        //   for (const moves of availableMoves) {
        //     clonedHeatMap[moves[0]][moves[1]] = -1;
        //     if (clonedHeatMap[kingsPosition[0]][kingsPosition[1]] !== -1) {
        //       viableMoves.push(moves);
        //     }
        //   }
        //   return viableMoves;
        // } else {
        //   const availableMoves = (currentPiece as incrementalPiece).getValidMoves(
        //     clonedBoard
        //   );
        //   // if (currentPiece instanceof King) {
        //   //   availableMoves = availableMoves.filter(
        //   //     (move) => clonedHeatMap[move[0]][move[1]] === 0
        //   //   );
        //   //   if (availableMoves.length !== 0) {
        //   //     console.log(clonedBoard);
        //   //     console.log(availableMoves);
        //   //   }
        //   // }
        //   // return availableMoves;
        //   for (const moves of availableMoves) {
        //     clonedHeatMap[moves[0]][moves[1]] = -1;
        //     if (clonedHeatMap[kingsPosition[0]][kingsPosition[1]] !== -1) {
        //       viableMoves.push(moves);
        //     }
        //   }
        //   return viableMoves;
        return currentPiece.getValidMoves(clonedBoard);
        // }
    }
    generateEmptyHeatMap() {
        const tempHeatMap = new Array(this.BOARD_COLS);
        for (let i = 0; i < this.BOARD_COLS; i++) {
            tempHeatMap[i] = new Array(this.BOARD_ROWS).fill(0);
        }
        return tempHeatMap;
    }
    generateHeatMaps() {
        const tempWhiteHeatMap = this.generateEmptyHeatMap();
        const tempBlackHeatMap = this.generateEmptyHeatMap();
        const whiteKingsPosition = this.whitePlayer.getKingsPosition();
        const blackKingsPosition = this.blackPlayer.getKingsPosition();
        tempBlackHeatMap[whiteKingsPosition[0]][whiteKingsPosition[1]] =
            tempWhiteHeatMap[blackKingsPosition[0]][blackKingsPosition[1]] = 1;
        this.totalPieces.forEach((piece) => {
            if (piece.getIsWhite()) {
                piece.getLegalAttackMoves(this.board).forEach((move) => {
                    tempWhiteHeatMap[move[0]][move[1]] = -1;
                });
                // if (piece instanceof incrementalPiece) {
                //   piece.getLegalAttackMoves(this.board).forEach((move) => {
                //     tempWhiteHeatMap[move[0]][move[1]] = -1;
                //   });
                // } else if (piece instanceof positionalPiece) {
                //   piece.getLegalAttackMoves(this.board).forEach((move) => {
                //     tempWhiteHeatMap[move[0]][move[1]] = -1;
                //   });
                // } else if (piece instanceof Pawn) {
                //   piece.getLegalAttackMoves(this.board).forEach((move) => {
                //     tempWhiteHeatMap[move[0]][move[1]] = -1;
                //   });
                // }
            }
            else {
                piece.getLegalAttackMoves(this.board).forEach((move) => {
                    tempBlackHeatMap[move[0]][move[1]] = -1;
                });
                // if (piece instanceof incrementalPiece) {
                //   piece.getLegalAttackMoves(this.board).forEach((move) => {
                //     tempBlackHeatMap[move[0]][move[1]] = -1;
                //   });
                // } else if (piece instanceof positionalPiece) {
                //   piece.getLegalAttackMoves(this.board).forEach((move) => {
                //     tempBlackHeatMap[move[0]][move[1]] = -1;
                //   });
                // } else if (piece instanceof Pawn) {
                //   piece.getLegalAttackMoves(this.board).forEach((move) => {
                //     tempBlackHeatMap[move[0]][move[1]] = -1;
                //   });
                // }
            }
        });
        tempWhiteHeatMap[blackKingsPosition[0]][blackKingsPosition[1]] = 1;
        tempBlackHeatMap[whiteKingsPosition[0]][whiteKingsPosition[1]] = 1;
        this.whitePlayer.setOpponentHeatMap(tempBlackHeatMap);
        this.blackPlayer.setOpponentHeatMap(tempWhiteHeatMap);
    }
    // public generateCheckedMoves(
    //   tempBoard: Array<Piece[] | number[]>,
    //   isWhite: boolean
    // ): boolean {
    //   let tempMap: Array<Piece[] | number[]> = new Array(this.BOARD_COLS);
    //   for (let i = 0; i < this.BOARD_ROWS; i++) {
    //     tempMap[i] = new Array(this.BOARD_ROWS).fill(0);
    //   }
    //   const tempKingPosition = isWhite
    //     ? [this.whiteKingPosition[0], this.whiteKingPosition[1]]
    //     : [this.blackKingPosition[0], this.blackKingPosition[1]];
    //   isWhite
    //     ? (tempMap[this.whiteKingPosition[0]][this.whiteKingPosition[1]] = 1)
    //     : (tempMap[this.blackKingPosition[0]][this.blackKingPosition[1]] = 1);
    //   for (let currentX = 0; currentX < this.BOARD_COLS; currentX++) {
    //     for (let currentY = 0; currentY < this.BOARD_ROWS; currentY++) {
    //       const currentSquare = tempBoard[currentX][currentY];
    //       if (currentSquare instanceof Piece) {
    //         const isPawn = currentSquare instanceof Pawn ? true : false;
    //         const legalMoves = this.getLegalMoves(
    //           currentSquare,
    //           isPawn,
    //           tempBoard
    //         );
    //         if (currentSquare.isWhite !== isWhite) {
    //           for (let i = 0; i < legalMoves.length; i++) {
    //             tempMap[legalMoves[i][0]][legalMoves[i][1]] = -1;
    //           }
    //         }
    //       }
    //     }
    //   }
    //   return isWhite
    //     ? tempMap[this.whiteKingPosition[0]][this.whiteKingPosition[1]] === 1
    //     : tempMap[this.blackKingPosition[0]][this.blackKingPosition[1]] === 1;
    // }
    viewBoard() {
        console.log(this.board);
    }
    selectPiece(e) {
        if (!e.target || !(e.target instanceof HTMLImageElement))
            return;
        const currentX = Number(e.target.dataset.x);
        const currentY = Number(e.target.dataset.y);
        const newPiece = this.board[currentX][currentY];
        console.log(this.board);
        if ((this.selectedPiece instanceof Piece &&
            newPiece instanceof Piece &&
            this.selectedPiece.getIsWhite() !== newPiece.getIsWhite() &&
            ((this.whitePlayersTurn && !newPiece.getIsWhite()) ||
                (!this.whitePlayersTurn && newPiece.getIsWhite()))) ||
            (this.selectedPiece instanceof King && newPiece instanceof Rook)) {
            this.movePiece(e);
        }
        else {
            this.showAvailableMoves(e);
            this.selectedPiece = this.board[currentX][currentY];
            this.selectedElement = document.querySelector(`.chess-piece[data-x="${currentX}"][data-y="${currentY}"]`);
        }
    }
    // private capturePiece(oldCoords: Coords, newCoords: Coords) {
    //   const newPositionX = Number(newCoords.x);
    //   const newPositionY = Number(newCoords.y);
    // }
    highlightLastMove(posX, posY) {
        var _a;
        (_a = document
            .querySelector(`.square[data-x="${posX}"][data-y="${posY}"]`)) === null || _a === void 0 ? void 0 : _a.classList.add("highlight-box");
    }
    showAvailableMoves(e) {
        var _a;
        this.clearSquare();
        if (!e.target || !(e.target instanceof HTMLImageElement))
            return;
        const currentX = Number(e.target.dataset.x);
        const currentY = Number(e.target.dataset.y);
        const coords = getCoords(currentX, currentY);
        const availableMoves = this.getPieces().get(coords).getAvailableMoves();
        (_a = document
            .querySelector(`.chess-piece[data-x="${currentX}"][data-y="${currentY}"]`)) === null || _a === void 0 ? void 0 : _a.classList.add("highlight-box");
        for (const move of availableMoves) {
            const className = this.board[move[0]][move[1]] instanceof Piece
                ? "hint--large"
                : "hint--small";
            document.querySelector(`[data-hint="true"][data-x="${move[0]}"][data-y="${move[1]}"]`).classList.add(className);
            document.querySelector(`.square[data-x="${move[0]}"][data-y="${move[1]}"]`).dataset.isMoveableTo = "true";
        }
    }
    movePiece(e) {
        this.dragLeave(e);
        if (!(e.target instanceof HTMLDivElement ||
            e.target instanceof HTMLImageElement) ||
            !this.selectedPiece ||
            !this.selectedElement ||
            !e.target ||
            !((this.whitePlayersTurn && this.selectedPiece.getIsWhite()) ||
                (!this.whitePlayersTurn && !this.selectedPiece.getIsWhite()))) {
            return;
        }
        const newPositionX = Number(e.target.dataset.x);
        const newPositionY = Number(e.target.dataset.y);
        const oldPositionX = this.selectedPiece.getX();
        const oldPositionY = this.selectedPiece.getY();
        if (this.selectedPiece instanceof King &&
            this.board[newPositionX][newPositionY] instanceof Rook) {
            this.castleKing(this.board[newPositionX][newPositionY]);
        }
        else {
            if (newPositionX === oldPositionX && newPositionY === oldPositionY)
                return;
            const newBoardElement = document.querySelector(`[data-x="${newPositionX}"][data-y="${newPositionY}"]`);
            if (JSON.parse(newBoardElement.dataset.isMoveableTo)) {
                this.whitePlayer.setIsChecked(false);
                this.blackPlayer.setIsChecked(false);
                const newBoardPosition = this.board[newPositionX][newPositionY];
                this.board[newPositionX][newPositionY] = this.selectedPiece;
                this.board[oldPositionX][oldPositionY] = 0;
                this.selectedPiece.setX(newPositionX);
                this.selectedPiece.setY(newPositionY);
                this.updatePiece(this.selectedPiece);
                this.selectedPiece.setCoords(getCoords(newPositionX, newPositionY));
                if (typeof newBoardPosition === "number") {
                    this.isChecked() ? this.checkedAudio.play() : this.placeAudio.play();
                }
                else {
                    const enemyElement = document.querySelector(`.chess-piece[data-x="${newPositionX}"][data-y="${newPositionY}"]`);
                    this.removePiece(newBoardPosition);
                    enemyElement.remove();
                    this.isChecked()
                        ? this.checkedAudio.play()
                        : this.captureAudio.play();
                }
                [this.selectedElement.dataset.x, this.selectedElement.dataset.y] = [
                    String(newPositionX),
                    String(newPositionY),
                ];
                newBoardElement.insertAdjacentElement("beforeend", this.selectedElement);
                if (this.selectedPiece instanceof Pawn) {
                    this.selectedPiece.setHadFirstMove();
                    if (this.selectedPiece.isPromotable()) {
                        this.openModal(newPositionX, newPositionY);
                    }
                }
                else if (this.selectedPiece instanceof King) {
                    this.updateKingPosition(this.selectedPiece);
                }
            }
        }
        if (this.selectedPiece instanceof Rook ||
            this.selectedPiece instanceof King) {
            this.selectedPiece.setHadFirstMove();
        }
        this.updateAvailableMoves();
        this.whitePlayersTurn = !this.whitePlayersTurn;
        this.updateState();
        this.clearSquare();
        this.unselectPiece();
        this.highlightLastMove(oldPositionX, oldPositionY);
    }
    castleKing(rookPiece) {
        if (!this.selectedPiece)
            return;
        const rookX = rookPiece.getX();
        const rookY = rookPiece.getY();
        const newBoardElement = document.querySelector(`[data-x="${rookX}"][data-y="${rookY}"]`);
        if (JSON.parse(newBoardElement.dataset.isMoveableTo)) {
            console.log(this.selectedPiece);
            const newKingsPositionY = (rookY > this.selectedPiece.getY() ? 2 : -2) +
                this.selectedPiece.getY();
            const kingsCurrentX = this.selectedPiece.getX();
            const newBoardPosition = this.board[kingsCurrentX][newKingsPositionY];
            this.movePieceOnBoard(kingsCurrentX, this.selectedPiece.getY(), kingsCurrentX, newKingsPositionY);
            const newRooksPositionX = (rookY > this.selectedPiece.getY() ? -1 : 1) + newKingsPositionY;
            this.movePieceOnBoard(rookX, rookY, rookX, newRooksPositionX);
            rookPiece.setHadFirstMove();
            this.selectedPiece.setHadFirstMove();
        }
        this.unselectPiece();
    }
    movePieceOnBoard(oldPositionX, oldPositionY, newPositionX, newPositionY) {
        const boardSquare = this.getPieces().get(getCoords(oldPositionX, oldPositionY));
        if (boardSquare instanceof Piece) {
            this.board[newPositionX][newPositionY] = boardSquare;
            this.board[oldPositionX][oldPositionY] = 0;
            boardSquare.setX(newPositionX);
            boardSquare.setY(newPositionY);
            this.updatePiece(boardSquare);
            boardSquare.setCoords(getCoords(newPositionX, newPositionY));
            const pieceElement = document.querySelector(`.chess-piece[data-x="${oldPositionX}"][data-y="${oldPositionY}"]`);
            pieceElement.remove();
            const newSquare = document.querySelector(`.square[data-x="${newPositionX}"][data-y="${newPositionY}"]`);
            console.log(newSquare);
            newSquare === null || newSquare === void 0 ? void 0 : newSquare.insertAdjacentElement("beforeend", pieceElement);
        }
    }
    closeModal() {
        document
            .querySelectorAll(".modal-image")
            .forEach((modalImage) => modalImage.removeEventListener("click", this.promotePawn.bind, true));
        document.querySelector(".modal").classList.remove("visible-modal");
    }
    openModal(modalPosX, modalPosY) {
        const isWhite = this.board[modalPosX][modalPosY].getIsWhite();
        isWhite ? ".modal--white" : ".modal--white";
        const modal = document.querySelector(`${isWhite ? ".modal--white" : ".modal--black"}`);
        modal.style.left = `${modalPosY}00px`;
        modal.classList.add("visible-modal");
        document
            .querySelectorAll(".modal-image")
            .forEach((modalImage) => modalImage.addEventListener("click", (e) => this.promotePawn(e, modalPosX, modalPosY)));
    }
    unselectPiece() {
        this.selectedElement = null;
        this.selectedPiece = null;
    }
    updateKingPosition(piece) {
        piece.getIsWhite()
            ? this.whitePlayer.setKingsPosition(piece.getX(), piece.getY())
            : this.blackPlayer.setKingsPosition(piece.getX(), piece.getY());
    }
    isChecked() {
        for (let i = 0; i < this.board.length; i++) {
            for (let currentPiece of this.board[i]) {
                if (typeof currentPiece === "number")
                    continue;
                const legalMoves = currentPiece.getValidMoves(this.board);
                for (const possibleMove of legalMoves) {
                    const newSquare = this.board[possibleMove[0]][possibleMove[1]];
                    if (typeof newSquare === "number")
                        continue;
                    if (!currentPiece.isSameColor(newSquare) &&
                        newSquare.getID() === "king") {
                        // this.updateAvailableMoves();
                        // this.makeMoves();
                        this.whitePlayersTurn
                            ? this.blackPlayer.setIsChecked(true)
                            : this.whitePlayer.setIsChecked(true);
                        return true;
                    }
                }
            }
        }
        return false;
    }
    // private updatePieceMoves(piece: Piece): void {
    //   piece.isWhite
    //     ? this.whitePlayer.updatePiece(piece)
    //     : this.blackPlayer.updatePiece(piece);
    //   this.updatePieces(piece);
    // }
    addPiece(piece) {
        this.totalPieces.set(piece.getCoords(), piece);
    }
    getPieces() {
        return this.totalPieces;
    }
    removePiece(piece) {
        // this.getPieces().delete(piece.getCoords())
        piece.getIsWhite()
            ? this.whitePlayer.removePiece(piece)
            : this.blackPlayer.removePiece(piece);
    }
    updatePiece(piece) {
        const oldCoords = piece.getCoords();
        this.totalPieces.delete(piece.getCoords());
        const newCoords = getCoords(piece.getX(), piece.getY());
        this.totalPieces.set(newCoords, piece);
        piece.getIsWhite()
            ? this.whitePlayer.updatePiece(piece, oldCoords)
            : this.blackPlayer.updatePiece(piece, oldCoords);
    }
    updatePiecesMoves(piece, updatedMoves) {
        this.totalPieces.get(piece.getCoords()).setAvailableMoves(updatedMoves);
        // piece.getIsWhite()
        //   ? this.whitePlayer.updatePiece(piece)
        //   : this.blackPlayer.updatePiece(piece);
    }
    makeMoves() {
        // this.generateHeatMaps();
        for (const piece of this.totalPieces.values()) {
            const viableMoves = [];
            for (const move of piece.getAvailableMoves()) {
                const clonedMap = structuredClone(piece.getIsWhite()
                    ? this.whitePlayer.getOpponentHeatMap()
                    : this.blackPlayer.getOpponentHeatMap());
                if (piece instanceof King) {
                    if (clonedMap[move[0]][move[1]] === 0)
                        viableMoves.push(move);
                }
                else {
                    const kingsPosition = structuredClone(piece.getIsWhite()
                        ? this.whitePlayer.getKingsPosition()
                        : this.blackPlayer.getKingsPosition());
                    const clonedBoard = this.duplicateBoard();
                    clonedBoard[piece.getX()][piece.getY()] = 0;
                    clonedBoard[move[0]][move[1]] = piece;
                    for (const row of clonedBoard) {
                        for (const square of row) {
                            if (!(square instanceof Piece) || piece.isSameColor(square))
                                continue;
                            this.getGeneratedMoves(square, clonedBoard, clonedMap, kingsPosition).forEach((move) => {
                                clonedMap[move[0]][move[1]] = -1;
                            });
                        }
                    }
                    if (clonedMap[kingsPosition[0]][kingsPosition[1]] !== -1) {
                        viableMoves.push(move);
                    }
                }
                this.updatePiecesMoves(piece, viableMoves);
            }
        }
    }
    updateAvailableMoves() {
        this.generateHeatMaps();
        this.totalPieces.forEach((piece) => {
            let availableMoves = piece.getValidMoves(this.board);
            if (piece instanceof King) {
                const opponentsHeatMap = piece.getIsWhite()
                    ? this.whitePlayer.getOpponentHeatMap()
                    : this.blackPlayer.getOpponentHeatMap();
                availableMoves = availableMoves.filter((move) => opponentsHeatMap[move[0]][move[1]] === 0);
            }
            piece.setAvailableMoves(availableMoves);
            if (piece instanceof Pawn) {
                const availableAttackMoves = piece.getLegalAttackMoves(this.board);
                piece.setAvailableAttackMoves(availableAttackMoves);
            }
            piece.getIsWhite()
                ? this.whitePlayer.addPiece(piece)
                : this.blackPlayer.addPiece(piece);
        });
        // this.whitePlayer.updateMoves();
        // this.blackPlayer.updateMoves();
        this.makeMoves();
        this.whitePlayer.updateMoves();
        this.blackPlayer.updateMoves();
        this.getCastableMoves();
        this.checkVictory();
    }
    getCastableMoves() {
        this.whitePlayer.canCastle(this.board);
        this.blackPlayer.canCastle(this.board);
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
    clearSquare() {
        document
            .querySelectorAll(`.hint--large, .hint--small, .highlight-box, .highlight-border, [data-is-moveable-to="true"]`)
            .forEach((s) => {
            s.classList.remove("hint--large");
            s.classList.remove("hint--small");
            s.classList.remove("highlight-box");
            s.classList.remove("highlight-border");
            if (s.classList.contains("square")) {
                s.dataset.isMoveableTo = "false";
            }
        });
    }
    dragStart(e) {
        if (!e.target || !(e.target instanceof HTMLImageElement))
            return;
        const currentX = Number(e.target.dataset.x);
        const currentY = Number(e.target.dataset.y);
        this.showAvailableMoves(e);
        this.selectedPiece = this.board[currentX][currentY];
        this.selectedElement = document.querySelector(`.chess-piece[data-x="${currentX}"][data-y="${currentY}"]`);
    }
    print(e) {
        e.stopPropagation();
        e.preventDefault();
        console.log(e.clientX, e.clientY);
    }
    updateState() {
        document.removeEventListener("mouseover", this.print.bind(this), true);
        const newState = this.duplicateBoard();
        this.prevStateStack.push(newState);
    }
    previousState() {
        if (!Array.isArray(this.prevStateStack) ||
            !this.prevStateStack.length ||
            this.prevStateStack.length >= 0) {
            const prevBoard = this.prevStateStack.pop();
            if (typeof prevBoard !== "undefined") {
                const dupeBoard = prevBoard.map((row) => [...row]);
                this.nextStateStack.push(dupeBoard);
                this.updateSavedState("prev");
            }
        }
    }
    nextState() {
        if (!Array.isArray(this.nextStateStack) ||
            !this.nextStateStack.length ||
            this.nextStateStack.length >= 0) {
            const nextBoard = this.nextStateStack.pop();
            if (typeof nextBoard !== "undefined") {
                const dupeBoard = nextBoard.map((row) => [...row]);
                this.prevStateStack.push(dupeBoard);
                this.updateSavedState("next");
            }
        }
    }
    updateSavedState(direction) {
        const savedState = direction === "prev"
            ? [...this.prevStateStack[this.prevStateStack.length - 1]]
            : [...this.nextStateStack[this.nextStateStack.length - 1]];
        console.log(savedState);
        for (let x = 0; x < this.BOARD_COLS; x++) {
            for (let y = 0; y < this.BOARD_ROWS; y++) {
                const currentElement = this.board[x][y];
                const savedStateElement = savedState[x][y];
                if (currentElement === savedStateElement)
                    continue;
                const square = document.querySelector(`.square[data-x="${x}"][data-y="${y}"]`);
                if (!!square.children.namedItem("chess-piece")) {
                    document.querySelector(`.chess-piece[data-x="${x}"][data-y="${y}"]`).remove();
                }
                if (savedStateElement instanceof Piece) {
                    const pieceElement = document.createElement("img");
                    pieceElement.dataset.x = String(x);
                    pieceElement.dataset.y = String(y);
                    pieceElement.setAttribute("name", "chess-piece");
                    this.board[x][y] = savedState[x][y];
                    pieceElement.src = savedState[x][y].getImage();
                    pieceElement.classList.add("chess-piece");
                    pieceElement.draggable = true;
                    square.insertAdjacentElement("beforeend", pieceElement);
                }
            }
        }
    }
    // const square = document.querySelector(
    //   `.square[data-x="${x}"][data-y="${y}"]`
    // ) as HTMLDivElement;
    // if (!!square.children.namedItem("chess-piece")) {
    //   (
    //     document.querySelector(
    //       `.chess-piece[data-x="${x}"][data-y="${y}"]`
    //     ) as HTMLImageElement
    //   ).remove();
    // }
    // if (savedStateElement instanceof Piece) {
    // const pieceElement = document.createElement("img");
    // pieceElement.dataset.x = String(x);
    // pieceElement.dataset.y = String(y);
    // pieceElement.setAttribute("name", "chess-piece");
    // this.board[x][y] = savedState[x][y];
    // pieceElement.src = (savedState[x][y] as Piece).getImage();
    // pieceElement.classList.add("chess-piece");
    // pieceElement.draggable = true;
    // square.insertAdjacentElement("beforeend", pieceElement);
    // }
    duplicateBoard() {
        const duplicatedBoard = this.board.map((row) => [...row]);
        return duplicatedBoard;
    }
    createEmptyBoard() {
        const emptyBoard = new Array(this.BOARD_COLS);
        for (let i = 0; i < this.BOARD_ROWS; i++) {
            emptyBoard[i] = new Array(this.BOARD_ROWS).fill(0);
        }
        return emptyBoard;
    }
    rotate() {
        this.isBoardRotated = !this.isBoardRotated;
        document.querySelector(".gameBoard").classList.toggle("rotate");
        document
            .querySelectorAll(".chess-piece")
            .forEach((piece) => piece.classList.toggle("rotate"));
    }
    restartGame() {
        if (this.isBoardRotated)
            this.rotate();
        this.initializeVariables();
        document
            .querySelectorAll(".chess-piece")
            .forEach((piece) => piece.remove());
        // this.createGame();
        this.createPieces();
        this.addHandlers();
    }
    addHandlers() {
        document.querySelectorAll(".chess-piece").forEach((piece) => {
            piece.addEventListener("click", this.selectPiece.bind(this));
            piece.addEventListener("dragstart", this.dragStart.bind(this));
        });
        document.querySelectorAll(".square").forEach((square) => {
            square.addEventListener("click", this.movePiece.bind(this));
            square.addEventListener("dragover", this.dragOver.bind(this));
            square.addEventListener("drop", this.movePiece.bind(this));
            square.addEventListener("dragleave", this.dragLeave.bind(this));
            square.addEventListener("dragenter", this.dragEnter.bind(this));
        });
        document
            .querySelector(".rot")
            .addEventListener("click", this.rotate.bind(this));
        document
            .querySelector(".restart")
            .addEventListener("click", this.restartGame.bind(this));
        document
            .querySelector(".prev")
            .addEventListener("click", this.previousState.bind(this));
        document
            .querySelector(".next")
            .addEventListener("click", this.nextState.bind(this));
    }
    createGame() {
        const gameBoard = document.querySelector(".gameBoard");
        this.createBoard(gameBoard);
        this.createPieces();
        this.addHandlers();
    }
}
(function () {
    const board = new GameBoard();
    // new GameBoard();
    // const gameBoard = document.querySelector(".gameBoard") as HTMLDivElement;
    // board.createBoard(gameBoard);
    // board.createPieces();
    // document.querySelectorAll(".chess-piece").forEach((piece) => {
    //   piece.addEventListener("click", (e) => board.showAvailableMoves(e));
    //   piece.addEventListener("dragstart", (e) => board.dragStart(e));
    // });
    // document.querySelectorAll(".square").forEach((square) => {
    //   square.addEventListener("click", (e) => board.movePiece(e));
    //   square.addEventListener("dragover", (e) => board.dragOver(e));
    //   square.addEventListener("drop", (e) => board.dropPiece(e));
    //   square.addEventListener("dragleave", (e) => board.dragLeave(e));
    //   square.addEventListener("dragenter", (e) => board.dragEnter(e));
    // });
})();
function isLowerCase(charCode) {
    return charCode >= 97 && charCode <= 122;
}
// private movePiece(e: Event) {
//   if (
//     e.target instanceof HTMLImageElement ||
//     typeof this.selectedPiece === "undefined" ||
//     !this.selectedPiece ||
//     typeof this.selectedElement === "undefined" ||
//     !this.selectedElement ||
//     !e.target ||
//     typeof e.target === "undefined" ||
//     !(e.target instanceof HTMLDivElement)
//   ) {
//     return;
//   }
//   this.clearSquare();
//   const newPositionX = Number(e.target.dataset.x);
//   const newPositionY = Number(e.target.dataset.y);
//   const oldPositionX = Number(this.selectedElement.dataset.x);
//   const oldPositionY = Number(this.selectedElement.dataset.y);
//   const newBoardElement = document.querySelector(
//     `[data-x="${newPositionX}"][data-y="${newPositionY}"]`
//   ) as HTMLDivElement;
//   const availabeMoves = this.totalPieces
//     .get(this.selectedPiece.getCoords())!
//     .getAvailableMoves();
//   if (typeof availabeMoves === "undefined") return;
//   for (const moves of availabeMoves) {
//     if (moves[0] === newPositionX && moves[1] === newPositionY) {
//       if (
//         this.whitePlayer.getIsChecked() ||
//         this.blackPlayer.getIsChecked()
//       ) {
//         this.whitePlayer.setIsChecked(false);
//         this.blackPlayer.setIsChecked(false);
//       }
//       const newBoardPosition = this.board[newPositionX][newPositionY];
//       this.board[newPositionX][newPositionY] = this.selectedPiece;
//       this.board[oldPositionX][oldPositionY] = 0;
//       this.selectedPiece.setX(newPositionX);
//       this.selectedPiece.setY(newPositionY);
//       this.updatePiece(this.selectedPiece);
//       this.selectedPiece.setCoords(getCoords(newPositionX, newPositionY));
//       if (typeof newBoardPosition === "number") {
//         this.isChecked() ? this.checkedAudio.play() : this.placeAudio.play();
//       } else {
//         const enemyElement = document.querySelector(
//           `.chess-piece[data-x="${newPositionX}"][data-y="${newPositionY}"]`
//         ) as HTMLImageElement;
//         this.removePiece(newBoardPosition);
//         enemyElement.remove();
//         this.isChecked()
//           ? this.checkedAudio.play()
//           : this.captureAudio.play();
//       }
//       [this.selectedElement.dataset.x, this.selectedElement.dataset.y] = [
//         String(newPositionX),
//         String(newPositionY),
//       ];
//       newBoardElement.insertAdjacentElement(
//         "beforeend",
//         this.selectedElement!
//       );
//       if (this.selectedPiece instanceof Pawn) {
//         (this.selectedPiece as Pawn).setHadFirstMove();
//       }
//       if (this.selectedPiece instanceof King) {
//         this.updateKingPosition(this.selectedPiece);
//       }
//       this.updateAvailableMoves();
//       this.whitePlayersTurn = !this.whitePlayersTurn;
//       this.updateState();
//     }
//   }
// }
// private dropPiece(e: Event): void {
//   this.clearSquare();
//   this.dragLeave(e);
//   if (
//     !e.target ||
//     !(
//       e.target instanceof HTMLDivElement ||
//       e.target instanceof HTMLImageElement
//     ) ||
//     !this.draggedElement ||
//     !this.beingDragged ||
//     !(
//       (this.whitePlayersTurn && this.draggedElement.getIsWhite()) ||
//       (!this.whitePlayersTurn && !this.draggedElement.getIsWhite())
//     )
//   ) {
//     return;
//   }
//   const newPositionX = Number(e.target.dataset.x);
//   const newPositionY = Number(e.target.dataset.y);
//   const oldPositionX = Number(this.beingDragged.dataset.x);
//   const oldPositionY = Number(this.beingDragged.dataset.y);
//   const newBoardElement = document.querySelector(
//     `[data-x="${newPositionX}"][data-y="${newPositionY}"]`
//   ) as HTMLDivElement;
//   const availabeMoves = this.totalPieces
//     .get(this.draggedElement.getCoords())!
//     .getAvailableMoves();
//   if (typeof availabeMoves === "undefined") return;
//   for (const moves of availabeMoves) {
//     if (moves[0] === newPositionX && moves[1] === newPositionY) {
//       if (
//         this.whitePlayer.getIsChecked() ||
//         this.blackPlayer.getIsChecked()
//       ) {
//         this.whitePlayer.setIsChecked(false);
//         this.blackPlayer.setIsChecked(false);
//       }
//       const newBoardPosition = this.board[newPositionX][newPositionY];
//       this.board[newPositionX][newPositionY] = this.draggedElement;
//       this.board[oldPositionX][oldPositionY] = 0;
//       this.draggedElement.setX(newPositionX);
//       this.draggedElement.setY(newPositionY);
//       this.updatePiece(this.draggedElement);
//       this.draggedElement.setCoords(getCoords(newPositionX, newPositionY));
//       if (typeof newBoardPosition === "number") {
//         this.isChecked() ? this.checkedAudio.play() : this.placeAudio.play();
//       } else {
//         const enemyElement = document.querySelector(
//           `.chess-piece[data-x="${newPositionX}"][data-y="${newPositionY}"]`
//         ) as HTMLImageElement;
//         this.removePiece(newBoardPosition);
//         enemyElement.remove();
//         this.isChecked()
//           ? this.checkedAudio.play()
//           : this.captureAudio.play();
//       }
//       [this.beingDragged.dataset.x, this.beingDragged.dataset.y] = [
//         String(newPositionX),
//         String(newPositionY),
//       ];
//       newBoardElement.insertAdjacentElement("beforeend", this.beingDragged!);
//       if (this.draggedElement instanceof Pawn) {
//         (this.draggedElement as Pawn).setHadFirstMove();
//       }
//       if (this.draggedElement instanceof King) {
//         this.updateKingPosition(this.draggedElement);
//       }
//       this.updateAvailableMoves();
//       this.whitePlayersTurn = !this.whitePlayersTurn;
//       this.updateState();
//     }
//   }
// }
