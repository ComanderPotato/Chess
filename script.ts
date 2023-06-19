import {
  Piece,
  incrementalPiece,
  positionalPiece,
  Pawn,
  King,
  Knight,
  Rook,
  Bishop,
  Queen,
} from "./modules/pieces.js";
import Player from "./modules/Player.js";
import getCoords from "./modules/Utils/Coordinates.js";
class GameBoard {
  private whitePlayer: Player = new Player(true, [7, 4]);
  private blackPlayer: Player = new Player(false, [0, 4]);
  private board: (number | Piece)[][];
  private beingDragged: HTMLImageElement | undefined = undefined;
  private draggedElement: Piece | undefined = undefined;
  private clickedElement: Piece | undefined = undefined;
  private placeAudio: HTMLAudioElement;
  private captureAudio: HTMLAudioElement;
  private checkedAudio: HTMLAudioElement;
  private prevStack: (number | Piece)[][][];
  private nextStack: (number | Piece)[][][];
  private whitePlayersTurn: boolean;
  private BOARD_COLS: number = 8;
  private BOARD_ROWS: number = 8;
  private totalPieces: Map<string, Piece>;
  constructor() {
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
    this.totalPieces = new Map<string, Piece>();
  }

  createBoard(htmlElement: HTMLDivElement) {
    for (let i = 0; i < this.BOARD_COLS; i++) {
      const row = document.createElement("div");
      row.classList.add("row");
      for (let j = 0; j < this.BOARD_ROWS; j++) {
        const square = document.createElement("div");
        const hintSquare = document.createElement("div");
        hintSquare.classList.add("hint");
        square.classList.add("square");
        if ((i + j) % 2 !== 0) square.classList.add("square--off-color");
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
      } else if (char === "8") {
        y = 7;
      } else {
        let isWhite = isLowerCase(c.charCodeAt(0));
        let square = document.querySelector(
          `[data-x="${x}"][data-y="${y}"]`
        ) as HTMLDListElement;
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
  private getLegalMoves(
    currentPiece: Piece,
    pawnsAttackMoves: boolean = false,
    board: Array<Array<Piece | number>> = this.board
  ): [number, number][] {
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
  private checkVictory() {
    const whiteArmy = this.whitePlayer.getAvailablePieces().size;
    const blackArmy = this.blackPlayer.getAvailablePieces().size;
    console.log(blackArmy);
    console.log(this.blackPlayer.getAvailableMoves());
    if (this.whitePlayer.getAvailableMoves() === 0) {
      if (this.whitePlayer.getIsChecked()) {
        console.log("Black Win");
      } else {
        console.log("Stale mate");
      }
    } else if (this.blackPlayer.getAvailableMoves() === 0) {
      if (this.blackPlayer.getIsChecked()) {
        console.log("White Win");
      } else {
        console.log("Stale mate");
      }
    } else if (whiteArmy === 2 || blackArmy === 2) {
      if (
        (whiteArmy === 1 && blackArmy === 1) ||
        (whiteArmy === 20 && blackArmy === 1) ||
        (whiteArmy === 1 && blackArmy === 20)
      ) {
        console.log("Insufficient material");
      } else {
      }
      /*
      King vs king
      King + minor (bishop or knight) piece vs king
      Lone king vs all the pieces
      King + two knights vs king
      King + minor piece vs king + minor piece
      */
    }
  }
  public makeMoves() {
    // this.generateHeatMaps();
    for (const piece of this.totalPieces.values()) {
      const viableMoves: [number, number][] = [];
      for (const move of piece.getAvailableMoves()) {
        const clonedMap = structuredClone(
          piece.getIsWhite()
            ? this.whitePlayer.getOpponentHeatMap()
            : this.blackPlayer.getOpponentHeatMap()
        );
        if (piece instanceof King) {
          if (clonedMap[move[0]][move[1]] === 0) viableMoves.push(move);
        } else {
          const kingsPosition = structuredClone(
            piece.getIsWhite()
              ? this.whitePlayer.getKingsPosition()
              : this.blackPlayer.getKingsPosition()
          );
          const clonedBoard = this.duplicateBoard();
          clonedBoard[piece.getX()][piece.getY()] = 0;
          clonedBoard[move[0]][move[1]] = piece;

          for (let i = 0; i < clonedBoard.length; i++) {
            for (const square of clonedBoard[i]) {
              if (!(square instanceof Piece) || piece.isSameColor(square))
                continue;
              this.getGeneratedMoves(
                square,
                clonedBoard,
                clonedMap,
                kingsPosition
              ).forEach((move) => {
                clonedMap[move[0]][move[1]] = -1;
              });
            }
          }
          if (clonedMap[kingsPosition[0]][kingsPosition[1]] !== -1) {
            viableMoves.push(move);
          }
        }
      }
      this.updatePiecesMoves(piece, viableMoves);
    }
  }
  private getGeneratedMoves(
    currentPiece: Piece,
    clonedBoard: (Piece | number)[][],
    clonedHeatMap: number[][],
    kingsPosition: [number, number]
  ): [number, number][] {
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
  private generateEmptyHeatMap(): number[][] {
    const tempHeatMap: number[][] = new Array(this.BOARD_COLS);
    for (let i = 0; i < this.BOARD_COLS; i++) {
      tempHeatMap[i] = new Array(this.BOARD_ROWS).fill(0);
    }
    return tempHeatMap;
  }

  private generateHeatMaps() {
    const tempWhiteHeatMap: number[][] = this.generateEmptyHeatMap();
    const tempBlackHeatMap: number[][] = this.generateEmptyHeatMap();
    const whiteKingsPosition = this.whitePlayer.getKingsPosition();
    const blackKingsPosition = this.blackPlayer.getKingsPosition();
    tempBlackHeatMap[whiteKingsPosition[0]][whiteKingsPosition[1]] =
      tempWhiteHeatMap[blackKingsPosition[0]][blackKingsPosition[1]] = 1;
    this.totalPieces.forEach((piece) => {
      if (piece.getIsWhite()) {
        if (piece instanceof incrementalPiece) {
          piece.getLegalAttackMoves(this.board).forEach((move) => {
            tempWhiteHeatMap[move[0]][move[1]] = -1;
          });
        } else if (piece instanceof positionalPiece) {
          piece.getLegalAttackMoves(this.board).forEach((move) => {
            tempWhiteHeatMap[move[0]][move[1]] = -1;
          });
        } else if (piece instanceof Pawn) {
          piece.getLegalAttackMoves(this.board).forEach((move) => {
            tempWhiteHeatMap[move[0]][move[1]] = -1;
          });
        }
      } else {
        if (piece instanceof incrementalPiece) {
          piece.getLegalAttackMoves(this.board).forEach((move) => {
            tempBlackHeatMap[move[0]][move[1]] = -1;
          });
        } else if (piece instanceof positionalPiece) {
          piece.getLegalAttackMoves(this.board).forEach((move) => {
            tempBlackHeatMap[move[0]][move[1]] = -1;
          });
        } else if (piece instanceof Pawn) {
          piece.getLegalAttackMoves(this.board).forEach((move) => {
            tempBlackHeatMap[move[0]][move[1]] = -1;
          });
        }
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
  showMoves(e: Event) {
    if (!e.target || !(e.target instanceof HTMLImageElement)) return;
    this.clearSquare();
    const currentX = Number(e.target.dataset.x);
    const currentY = Number(e.target.dataset.y);
    const coords = getCoords(currentX, currentY);
    const availableMoves = this.getPieces().get(coords)!.getAvailableMoves();

    for (const move of availableMoves) {
      (
        document.querySelector(
          `[data-hint="true"][data-x="${move[0]}"][data-y="${move[1]}"]`
        ) as HTMLDivElement
      ).classList.add("visible");
    }
  }
  public dragDrop(e: Event): void {
    this.clearSquare();
    this.dragLeave(e);
    if (
      !e.target ||
      !(
        e.target instanceof HTMLDivElement ||
        e.target instanceof HTMLImageElement
      ) ||
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

    const newBoardElement = document.querySelector(
      `[data-x="${newPositionX}"][data-y="${newPositionY}"]`
    ) as HTMLDivElement;
    const availabeMoves = this.totalPieces
      .get(this.draggedElement.getCoords())!
      .getAvailableMoves();
    if (typeof availabeMoves === "undefined") return;
    for (const moves of availabeMoves) {
      if (moves[0] === newPositionX && moves[1] === newPositionY) {
        if (
          this.whitePlayer.getIsChecked() ||
          this.blackPlayer.getIsChecked()
        ) {
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
        } else {
          const enemyElement = document.querySelector(
            `.chess-piece[data-x="${newPositionX}"][data-y="${newPositionY}"]`
          ) as HTMLImageElement;
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
        newBoardElement.insertAdjacentElement("beforeend", this.beingDragged!);
        if (this.draggedElement instanceof Pawn) {
          (this.draggedElement as Pawn).setHadFirstMove();
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
  private updateKingPosition(piece: Piece) {
    piece.getIsWhite()
      ? this.whitePlayer.setKingsPosition(piece.getX(), piece.getY())
      : this.blackPlayer.setKingsPosition(piece.getX(), piece.getY());
  }

  private isChecked(): boolean {
    for (let i = 0; i < this.board.length; i++) {
      for (let currentPiece of this.board[i]) {
        if (typeof currentPiece === "number") continue;
        const legalMoves = currentPiece.getValidMoves(this.board);
        for (const possibleMove of legalMoves) {
          const newSquare = this.board[possibleMove[0]][possibleMove[1]];
          if (typeof newSquare === "number") continue;
          if (
            !currentPiece.isSameColor(newSquare) &&
            newSquare.getID() === "king"
          ) {
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
  private addPiece(piece: Piece): void {
    this.totalPieces.set(piece.getCoords(), piece);
  }
  private getPieces() {
    return this.totalPieces;
  }
  private removePiece(piece: Piece): void {
    // this.getPieces().delete(piece.getCoords())
    piece.getIsWhite()
      ? this.whitePlayer.removePiece(piece)
      : this.blackPlayer.removePiece(piece);
  }
  private updatePiece(piece: Piece): void {
    const oldCoords = piece.getCoords();
    this.totalPieces.delete(piece.getCoords());
    const newCoords: string = getCoords(piece.getX(), piece.getY());
    this.totalPieces.set(newCoords, piece);
    piece.getIsWhite()
      ? this.whitePlayer.updatePiece(piece, oldCoords)
      : this.blackPlayer.updatePiece(piece, oldCoords);
  }
  private updatePiecesMoves(piece: Piece, updatedMoves: [number, number][]) {
    this.totalPieces.get(piece.getCoords())!.setAvailableMoves(updatedMoves);
    // piece.getIsWhite()
    //   ? this.whitePlayer.updatePiece(piece)
    //   : this.blackPlayer.updatePiece(piece);
  }
  private updateAvailableMoves(): void {
    this.generateHeatMaps();
    this.totalPieces.forEach((piece) => {
      let availableMoves = piece.getValidMoves(this.board);
      if (piece instanceof King) {
        const playersMap = piece.getIsWhite()
          ? this.whitePlayer.getOpponentHeatMap()
          : this.blackPlayer.getOpponentHeatMap();
        availableMoves = availableMoves.filter(
          (move) => playersMap[move[0]][move[1]] === 0
        );
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
    this.checkVictory();
  }
  public dragEnter(e: any) {
    e.target.classList.add("highlight-border");
  }
  public dragLeave(e: any) {
    e.target.classList.remove("highlight-border");
  }
  public dragOver(e: any) {
    e.preventDefault();
  }
  private clearSquare() {
    document
      .querySelectorAll(`[data-hint="true"], .chess-piece`)
      .forEach((s) => {
        s.classList.remove("visible");
        s.classList.remove("highlight-box");
      });
  }
  public dragStart(e: any) {
    this.showMoves(e);
    this.beingDragged = e.target;
    this.draggedElement = this.board[e.target.dataset.x][
      e.target.dataset.y
    ] as Piece;
  }
  private updateState() {
    const newState = this.duplicateBoard();
    this.prevStack.push(newState);
  }
  public previousState() {
    console.log(this.prevStack.length);
    if (!Array.isArray(this.prevStack) || !this.prevStack.length) {
      if (this.prevStack.length > 0) {
        console.log(this.prevStack);
        const prevBoard = this.prevStack.pop()!;
        this.nextStack.push(prevBoard);
        console.log(prevBoard);
      }
    }
  }
  public nextState() {
    // if (!Array.isArray(this.nextStack) || !this.nextStack.length) {
    // console.log(this.nextStack);
    // const nextBoard = this.nextStack.pop() as (number | Piece)[][];
    // this.prevStack.push(nextBoard);
    // console.log(nextBoard);
    // }
  }
  public duplicateBoard(): (number | Piece)[][] {
    const duplicateBoard = this.board.map((row) => [...row]);
    return duplicateBoard;
  }
}

(function () {
  const gameBoard = document.querySelector(".gameBoard") as HTMLDivElement;
  const board: GameBoard = new GameBoard();
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
  const next = document
    .querySelector(".next")!
    .addEventListener("click", board.nextState);
  const prev = document
    .querySelector(".prev")!
    .addEventListener("click", board.previousState);
})();

function isLowerCase(charCode: number) {
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
