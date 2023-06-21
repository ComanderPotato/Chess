import { Piece, Pawn, King, Knight, Rook, Bishop, Queen, } from "./modules/pieces.js";
import Player from "./modules/Player.js";
import getCoords from "./modules/Utils/Coordinates.js";
class GameBoard {
    constructor() {
        this.whitePlayer = new Player(true, [7, 4]);
        this.blackPlayer = new Player(false, [0, 4]);
        this.beingDragged = undefined;
        this.draggedElement = undefined;
        this.clickedElement = undefined;
        this.selectedElement = undefined;
        this.selectedPiece = undefined;
        this.BOARD_COLS = 8;
        this.BOARD_ROWS = 8;
        this.board = new Array(this.BOARD_COLS);
        for (let i = 0; i < this.BOARD_ROWS; i++) {
            this.board[i] = new Array(this.BOARD_ROWS).fill(0);
        }
        this.placeAudio = new Audio("./assets/move-self.mp3");
        this.captureAudio = new Audio("./assets/capture.mp3");
        this.checkedAudio = new Audio("./assets/move-check.mp3");
        this.prevStack = new Array();
        this.nextStack = new Array();
        this.whitePlayersTurn = true;
        this.totalPieces = new Map();
        this.createGame();
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
    showMoves(e) {
        var _a, _b, _c;
        this.clearSquare();
        if (!e.target || !(e.target instanceof HTMLImageElement))
            return;
        const currentX = Number(e.target.dataset.x);
        const currentY = Number(e.target.dataset.y);
        const coords = getCoords(currentX, currentY);
        if (this.selectedPiece) {
            if ((this.selectedPiece.getIsWhite() &&
                !((_a = this.getPieces().get(coords)) === null || _a === void 0 ? void 0 : _a.getIsWhite())) ||
                (!this.selectedPiece.getIsWhite() &&
                    ((_b = this.getPieces().get(coords)) === null || _b === void 0 ? void 0 : _b.getIsWhite()))) {
                this.movePiece(e);
                return;
            }
        }
        this.selectedPiece = this.getPieces().get(coords);
        this.selectedElement = document.querySelector(`.chess-piece[data-x="${currentX}"][data-y="${currentY}"]`);
        // this.draggedElement = this.getPieces().get(coords) as Piece;
        // this.beingDragged = e.target;
        const availableMoves = this.getPieces().get(coords).getAvailableMoves();
        (_c = document
            .querySelector(`.chess-piece[data-x="${currentX}"][data-y="${currentY}"]`)) === null || _c === void 0 ? void 0 : _c.classList.add("highlight-box");
        for (const move of availableMoves) {
            const className = this.board[move[0]][move[1]] instanceof Piece
                ? "hint--large"
                : "hint--small";
            document.querySelector(`[data-hint="true"][data-x="${move[0]}"][data-y="${move[1]}"]`).classList.add(className);
        }
    }
    movePiece(e) {
        console.log(e.target instanceof HTMLImageElement);
        if (e.target instanceof HTMLImageElement ||
            typeof this.selectedPiece === "undefined" ||
            !this.selectedPiece ||
            typeof this.selectedElement === "undefined" ||
            !this.selectedElement ||
            !e.target ||
            typeof e.target === "undefined" ||
            !(e.target instanceof HTMLDivElement)) {
            return;
        }
        this.clearSquare();
        const newPositionX = Number(e.target.dataset.x);
        const newPositionY = Number(e.target.dataset.y);
        const oldPositionX = Number(this.selectedElement.dataset.x);
        const oldPositionY = Number(this.selectedElement.dataset.y);
        const newBoardElement = document.querySelector(`[data-x="${newPositionX}"][data-y="${newPositionY}"]`);
        const availabeMoves = this.totalPieces
            .get(this.selectedPiece.getCoords())
            .getAvailableMoves();
        if (typeof availabeMoves === "undefined")
            return;
        for (const moves of availabeMoves) {
            if (moves[0] === newPositionX && moves[1] === newPositionY) {
                if (this.whitePlayer.getIsChecked() ||
                    this.blackPlayer.getIsChecked()) {
                    this.whitePlayer.setIsChecked(false);
                    this.blackPlayer.setIsChecked(false);
                }
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
                }
                if (this.selectedPiece instanceof King) {
                    this.updateKingPosition(this.selectedPiece);
                }
                this.updateAvailableMoves();
                this.whitePlayersTurn = !this.whitePlayersTurn;
                this.updateState();
                this.selectedElement = undefined;
                this.selectedPiece = undefined;
            }
        }
    }
    dropPiece(e) {
        this.clearSquare();
        this.dragLeave(e);
        if (!e.target ||
            !(e.target instanceof HTMLDivElement ||
                e.target instanceof HTMLImageElement) ||
            !this.draggedElement ||
            !this.beingDragged
        // ||
        // !(
        //   (this.whitePlayersTurn && this.draggedElement.getIsWhite()) ||
        //   (!this.whitePlayersTurn && !this.draggedElement.getIsWhite())
        // )
        ) {
            return;
        }
        const newPositionX = Number(e.target.dataset.x);
        const newPositionY = Number(e.target.dataset.y);
        const oldPositionX = Number(this.beingDragged.dataset.x);
        const oldPositionY = Number(this.beingDragged.dataset.y);
        const newBoardElement = document.querySelector(`[data-x="${newPositionX}"][data-y="${newPositionY}"]`);
        const availabeMoves = this.totalPieces
            .get(this.draggedElement.getCoords())
            .getAvailableMoves();
        if (typeof availabeMoves === "undefined")
            return;
        for (const moves of availabeMoves) {
            if (moves[0] === newPositionX && moves[1] === newPositionY) {
                if (this.whitePlayer.getIsChecked() ||
                    this.blackPlayer.getIsChecked()) {
                    this.whitePlayer.setIsChecked(false);
                    this.blackPlayer.setIsChecked(false);
                }
                const newBoardPosition = this.board[newPositionX][newPositionY];
                this.board[newPositionX][newPositionY] = this.draggedElement;
                this.board[oldPositionX][oldPositionY] = 0;
                this.draggedElement.setX(newPositionX);
                this.draggedElement.setY(newPositionY);
                this.updatePiece(this.draggedElement);
                this.draggedElement.setCoords(getCoords(newPositionX, newPositionY));
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
                [this.beingDragged.dataset.x, this.beingDragged.dataset.y] = [
                    String(newPositionX),
                    String(newPositionY),
                ];
                newBoardElement.insertAdjacentElement("beforeend", this.beingDragged);
                if (this.draggedElement instanceof Pawn) {
                    this.draggedElement.setHadFirstMove();
                }
                if (this.draggedElement instanceof King) {
                    this.updateKingPosition(this.draggedElement);
                }
                this.updateAvailableMoves();
                this.whitePlayersTurn = !this.whitePlayersTurn;
                this.updateState();
            }
        }
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
                    for (let i = 0; i < clonedBoard.length; i++) {
                        for (const square of clonedBoard[i]) {
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
        // this.totalPieces.forEach((piece) => {
        //   if (piece instanceof Pawn) {
        //     const availableMoves = piece.getValidMoves(this.board);
        //     const availableAttackMoves = piece.getValidAttackMoves(this.board);
        //     piece.setAvailableMoves(availableMoves);
        //     piece.setAvailableAttackMoves(availableAttackMoves);
        //     piece.concatMoves();
        //   } else if (
        //     piece instanceof incrementalPiece ||
        //     piece instanceof positionalPiece
        //   ) {
        //     let availableMoves = piece.getValidMoves(this.board);
        //     //  Might not need this
        // if (piece instanceof King) {
        //   const playersMap = piece.getIsWhite()
        //     ? this.whitePlayer.getOpponentHeatMap()
        //     : this.blackPlayer.getOpponentHeatMap();
        //   availableMoves = availableMoves.filter(
        //     (move) => playersMap[move[0]][move[1]] === 0
        //   );
        // }
        //     piece.setAvailableMoves(availableMoves);
        //   }
        //   piece.getIsWhite()
        //     ? this.whitePlayer.addPiece(piece)
        //     : this.blackPlayer.addPiece(piece);
        // });
        this.whitePlayer.updateMoves();
        this.blackPlayer.updateMoves();
        this.makeMoves();
        this.whitePlayer.updateMoves();
        this.blackPlayer.updateMoves();
        this.checkVictory();
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
            .querySelectorAll(`[data-hint="true"], .chess-piece`)
            .forEach((s) => {
            s.classList.remove("hint--large");
            s.classList.remove("hint--small");
            s.classList.remove("highlight-box");
        });
    }
    dragStart(e) {
        this.showMoves(e);
        this.beingDragged = e.target;
        this.draggedElement = this.board[e.target.dataset.x][e.target.dataset.y];
    }
    updateState() {
        const newState = this.duplicateBoard();
        this.prevStack.push(newState);
    }
    previousState() {
        console.log(this.prevStack.length);
        if (!Array.isArray(this.prevStack) || !this.prevStack.length) {
            if (this.prevStack.length > 0) {
                console.log(this.prevStack);
                const prevBoard = this.prevStack.pop();
                this.nextStack.push(prevBoard);
                console.log(prevBoard);
            }
        }
    }
    nextState() {
        // if (!Array.isArray(this.nextStack) || !this.nextStack.length) {
        // console.log(this.nextStack);
        // const nextBoard = this.nextStack.pop() as (number | Piece)[][];
        // this.prevStack.push(nextBoard);
        // console.log(nextBoard);
        // }
    }
    duplicateBoard() {
        const duplicateBoard = this.board.map((row) => [...row]);
        return duplicateBoard;
    }
    createGame() {
        const gameBoard = document.querySelector(".gameBoard");
        this.createBoard(gameBoard);
        this.createPieces();
        document.querySelectorAll(".chess-piece").forEach((piece) => {
            piece.addEventListener("click", this.showMoves.bind(this));
            piece.addEventListener("dragstart", this.dragStart.bind(this));
        });
        document.querySelectorAll(".square").forEach((square) => {
            square.addEventListener("click", this.movePiece.bind(this));
            square.addEventListener("dragover", this.dragOver.bind(this));
            square.addEventListener("drop", this.dropPiece.bind(this));
            square.addEventListener("dragleave", this.dragLeave.bind(this));
            square.addEventListener("dragenter", this.dragEnter.bind(this));
        });
        // document.querySelectorAll(".chess-piece").forEach((piece) => {
        //   piece.addEventListener("click", (e) => this.showMoves(e));
        //   piece.addEventListener("dragstart", (e) => this.dragStart(e));
        // });
        // document.querySelectorAll(".square").forEach((square) => {
        //   square.addEventListener("click", (e) => this.movePiece(e));
        //   square.addEventListener("dragover", (e) => this.dragOver(e));
        //   square.addEventListener("drop", (e) => this.dropPiece(e));
        //   square.addEventListener("dragleave", (e) => this.dragLeave(e));
        //   square.addEventListener("dragenter", (e) => this.dragEnter(e));
        // });
    }
}
(function () {
    const board = new GameBoard();
    // const gameBoard = document.querySelector(".gameBoard") as HTMLDivElement;
    // board.createBoard(gameBoard);
    // board.createPieces();
    // document.querySelectorAll(".chess-piece").forEach((piece) => {
    //   piece.addEventListener("click", (e) => board.showMoves(e));
    //   piece.addEventListener("dragstart", (e) => board.dragStart(e));
    // });
    // document.querySelectorAll(".square").forEach((square) => {
    //   square.addEventListener("click", (e) => board.movePiece(e));
    //   square.addEventListener("dragover", (e) => board.dragOver(e));
    //   square.addEventListener("drop", (e) => board.dropPiece(e));
    //   square.addEventListener("dragleave", (e) => board.dragLeave(e));
    //   square.addEventListener("dragenter", (e) => board.dragEnter(e));
    // });
    const next = document
        .querySelector(".next")
        .addEventListener("click", board.nextState);
    const prev = document
        .querySelector(".prev")
        .addEventListener("click", board.previousState);
})();
function isLowerCase(charCode) {
    return charCode >= 97 && charCode <= 122;
}
// daragDrop(e: Event) {
//   this.clearSquare();
//   this.dragLeave(e);
//   if (
//     !e.target ||
//     !(
//       e.target instanceof HTMLDivElement ||
//       e.target instanceof HTMLImageElement
//     ) ||
//     !this.beingDragged ||
//     !this.draggedElement ||
// !(
//   (this.whitePlayersTurn && this.draggedElement.getIsWhite()) ||
//   (!this.whitePlayersTurn && !this.draggedElement.getIsWhite())
// )
//   ) {
//     return;
//   }
//   const newPositionX = Number(e.target.dataset.x);
//   const newPositionY = Number(e.target.dataset.y);
//   const oldPositionX = Number(this.beingDragged!.dataset.x);
//   const oldPositionY = Number(this.beingDragged!.dataset.y);
//   let legalMoves = this.getLegalMoves(this.draggedElement);
//   let newPosition = document.querySelector(
//     `[data-x="${newPositionX}"][data-y="${newPositionY}"]`
//   ) as HTMLDivElement;
//   for (let i = 0; i < legalMoves.length; i++) {
//     let tempBoard = new Array(this.BOARD_COLS);
//     for (let j = 0; j < this.BOARD_COLS; j++)
//       tempBoard[j] = this.board[j].slice();
//     tempBoard[legalMoves[i][0]][legalMoves[i][1]] = this.draggedElement;
//     tempBoard[oldPositionX][oldPositionY] = 0;
//     const availableMoves =
//       this.draggedElement.getID() === "king" &&
//       (this.isWhiteInCheck || this.isBlackInCheck)
//         ? !this.generateCheckedMoves(tempBoard, this.whitePlayersTurn)
//         : this.generateCheckedMoves(tempBoard, this.whitePlayersTurn);
//     if (
//       legalMoves[i][0] === newPositionX &&
//       legalMoves[i][1] === newPositionY &&
//       availableMoves
//     ) {
// this.isBlackInCheck = this.isWhiteInCheck = false;
// this.whitePlayersTurn = !this.whitePlayersTurn;
//       const temp = this.board[newPositionX][newPositionY];
//       this.beingDragged.dataset.x = String(newPositionX);
//       this.beingDragged.dataset.y = String(newPositionY);
//       this.draggedElement.setX(newPositionX);
//       this.draggedElement.setY(newPositionY);
//       this.board[newPositionX][newPositionY] = this.draggedElement;
//       this.board[oldPositionX][oldPositionY] = 0;
//       const newCoords = getCoords(newPositionX, newPositionY);
//       this.draggedElement.setCoords(newCoords);
//       if (this.draggedElement.getID() === "king") {
//         this.whitePlayersTurn
//           ? (this.blackKingPosition = [newPositionX, newPositionY])
//           : (this.whiteKingPosition = [newPositionX, newPositionY]);
//       }
//       if (typeof temp !== "number") {
//         newPosition.lastChild?.remove();
//         this.isChecked()
//           ? this.checkedAudio.play()
//           : this.captureAudio.play();
//       } else if (newPosition.childElementCount === 1) {
//         this.isChecked() ? this.checkedAudio.play() : this.placeAudio.play();
//       }
//       newPosition.insertAdjacentElement("beforeend", this.beingDragged!);
//       document
//         .querySelectorAll(".square")
//         .forEach((s) => s.classList.remove("availableMoves"));
//       if (this.draggedElement.getID() === "pawn") {
//         (this.draggedElement as Pawn).setHadFirstMove();
//       }
//       this.updateAvailableMoves();
//       this.updateState();
//       this.updatePiece(this.draggedElement);
//       // this.generateHeatMaps();
//     }
//   }
// }
// private isChecked(): boolean {
//   this.getPieces().forEach((piece) => {
//     for (const move of this.getLegalMoves(piece)) {
//       const newSquare = this.board[move[0]][move[1]];
//       if (typeof newSquare === "number") continue;
//       console.log(newSquare);
//       if (!piece.isSameColor(newSquare) && newSquare.getID() === "king") {
//         this.whitePlayersTurn
//           ? this.whitePlayer.setIsChecked()
//           : this.blackPlayer.setIsChecked();
//         return true;
//       }
//     }
//   });
//   return false;
// }
