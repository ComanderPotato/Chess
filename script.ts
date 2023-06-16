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
class GameBoard {
  whitePlayer: Player = new Player(true, [7, 4]);
  blackPlayer: Player = new Player(false, [0, 4]);
  board: (number | Piece)[][];
  beingDragged: HTMLImageElement | undefined = undefined;
  draggedElement: Piece | undefined = undefined;
  clickedElement: Piece | undefined = undefined;
  placeAudio: HTMLAudioElement;
  captureAudio: HTMLAudioElement;
  checkedAudio: HTMLAudioElement;
  prevStack: (number | Piece)[][][];
  nextStack: (number | Piece)[][][];
  whitePlayersTurn: boolean;
  isWhiteInCheck: boolean;
  isBlackInCheck: boolean;
  whiteKingPosition: [number, number];
  blackKingPosition: [number, number];
  whiteHeatMap: number[][];
  blackHeatMap: number[][];
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
    this.isWhiteInCheck = false;
    this.isBlackInCheck = false;
    this.whiteKingPosition = [7, 4];
    this.blackKingPosition = [0, 4];
    this.totalPieces = new Map<string, Piece>();
    this.blackHeatMap = new Array(this.BOARD_COLS);
    for (let i = 0; i < this.BOARD_ROWS; i++) {
      this.blackHeatMap[i] = new Array(this.BOARD_ROWS).fill(0);
    }
    this.whiteHeatMap = new Array(this.BOARD_COLS);
    for (let i = 0; i < this.BOARD_ROWS; i++) {
      this.whiteHeatMap[i] = new Array(this.BOARD_ROWS).fill(0);
    }
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
        const coords = this.getCoords(x, y);
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
        isWhite
          ? this.whitePlayer.addPiece(piece)
          : this.blackPlayer.addPiece(piece);

        this.addPiece(piece);
        const pieceElement = document.createElement("img");
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
    this.updateState();
    this.generateHeatMap();
    this.generateAvailableMoves();
  }
  private addPiece(piece: Piece): void {
    this.totalPieces.set(piece.coords, piece);
  }
  private getPieces() {
    return this.totalPieces;
  }
  private updateState() {
    const newState = new Array(this.BOARD_COLS);
    for (let j = 0; j < this.BOARD_COLS; j++)
      newState[j] = this.board[j].slice();
    this.prevStack.push(newState);
  }
  private previousState() {
    const newBoard = this.prevStack.pop();

    this.nextStack.push(this.prevStack.pop()!);
  }
  private nextState() {
    this.prevStack.push(this.nextStack.pop()!);
  }
  public generateHeatMap() {
    let tempBlack: number[][] = new Array(this.BOARD_COLS);
    for (let i = 0; i < this.BOARD_ROWS; i++) {
      tempBlack[i] = new Array(this.BOARD_ROWS).fill(0);
    }
    let tempWhite: number[][] = new Array(this.BOARD_COLS);
    for (let i = 0; i < this.BOARD_ROWS; i++) {
      tempWhite[i] = new Array(this.BOARD_ROWS).fill(0);
    }
    for (let currentX = 0; currentX < this.BOARD_COLS; currentX++) {
      for (let currentY = 0; currentY < this.BOARD_ROWS; currentY++) {
        const currentSquare = this.board[currentX][currentY];
        // let legalMoves;
        if (currentSquare instanceof Piece) {
          // this.blackHeatMap[currentX][currentY] = 0;
          // this.whiteHeatMap[currentX][currentY] = 0;
          const isPawn = currentSquare.id === "pawn" ? true : false;
          const legalMoves = this.getLegalMoves(currentSquare, isPawn);
          if (currentSquare.isWhite) {
            if (currentSquare.id === "king") {
              tempBlack[currentX][currentY] = 1;
            }
            for (let i = 0; i < legalMoves.length; i++) {
              tempBlack[legalMoves[i][0]][legalMoves[i][1]] = -1;
            }
          } else {
            if (currentSquare.id === "king") {
              tempWhite[currentX][currentY] = 1;
            }
            for (let i = 0; i < legalMoves.length; i++) {
              tempWhite[legalMoves[i][0]][legalMoves[i][1]] = -1;
            }
          }
        }
      }
    }
    this.whitePlayer.setHeatMap(tempWhite);
    this.blackPlayer.setHeatMap(tempBlack);
    this.whiteHeatMap = tempWhite;
    this.blackHeatMap = tempBlack;
  }
  public generateCheckedMoves(
    tempBoard: Array<Piece[] | number[]>,
    isWhite: boolean
  ): boolean {
    let tempMap: Array<Piece[] | number[]> = new Array(this.BOARD_COLS);
    for (let i = 0; i < this.BOARD_ROWS; i++) {
      tempMap[i] = new Array(this.BOARD_ROWS).fill(0);
    }
    let tempKingPosition = isWhite
      ? [this.whiteKingPosition[0], this.whiteKingPosition[1]]
      : [this.blackKingPosition[0], this.blackKingPosition[1]];
    isWhite
      ? (tempMap[this.whiteKingPosition[0]][this.whiteKingPosition[1]] = 1)
      : (tempMap[this.blackKingPosition[0]][this.blackKingPosition[1]] = 1);

    for (let currentX = 0; currentX < this.BOARD_COLS; currentX++) {
      for (let currentY = 0; currentY < this.BOARD_ROWS; currentY++) {
        const currentSquare = tempBoard[currentX][currentY];
        if (currentSquare instanceof Piece) {
          const isPawn = currentSquare instanceof Pawn ? true : false;
          const legalMoves = this.getLegalMoves(
            currentSquare,
            isPawn,
            tempBoard
          );
          if (currentSquare.isWhite !== isWhite) {
            for (let i = 0; i < legalMoves.length; i++) {
              tempMap[legalMoves[i][0]][legalMoves[i][1]] = -1;
            }
          }
        }
      }
    }
    // console.log(tempMap[1][6]);
    return tempMap[tempKingPosition[0]][tempKingPosition[1]] === 1;
    // return isWhite
    //   ? tempMap[this.whiteKingPosition[0]][this.whiteKingPosition[1]] === 1
    //   : tempMap[this.blackKingPosition[0]][this.blackKingPosition[1]] === 1;
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
  // showMoves(e: Event) {
  //   if (!e.target || !(e.target instanceof HTMLImageElement)) return;
  //   this.clearSquare();
  // e.target.classList.add("highlight-box");
  // const currentX = Number(e.target.dataset.x);
  // const currentY = Number(e.target.dataset.y);
  //   const currentPiece = (this.clickedElement = this.board[currentX][
  //     currentY
  //   ] as Piece);
  //   const legalMoves = this.getLegalMoves(currentPiece);
  //   for (let i = 0; i < legalMoves.length; i++) {
  //     const tempBoard = new Array(this.BOARD_COLS);
  //     for (let j = 0; j < this.BOARD_COLS; j++)
  //       tempBoard[j] = this.board[j].slice();
  //     tempBoard[legalMoves[i][0]][legalMoves[i][1]] = currentPiece;
  //     tempBoard[currentPiece.x][currentPiece.y] = 0;

  //     const availableMoves =
  //       currentPiece.id === "king" &&
  //       (this.isWhiteInCheck || this.isBlackInCheck)
  //         ? !this.generateCheckedMoves(tempBoard, this.whitePlayersTurn)
  //         : this.generateCheckedMoves(tempBoard, this.whitePlayersTurn);
  //     if (availableMoves) {
  // let square = document.querySelector(
  //   `[data-hint="true"][data-x="${legalMoves[i][0]}"][data-y="${legalMoves[i][1]}"]`
  // ) as HTMLDivElement;
  // square.classList.add("visible");
  //     }
  //   }
  // }
  showMoves(e: Event) {
    if (!e.target || !(e.target instanceof HTMLImageElement)) return;
    this.clearSquare();
    const currentX = Number(e.target.dataset.x);
    const currentY = Number(e.target.dataset.y);
    const coords = this.getCoords(currentX, currentY);
    const piece = this.getPieces().get(coords);
    piece?.getAvailableMoves().forEach((move) => {
      let square = document.querySelector(
        `[data-hint="true"][data-x="${move[0]}"][data-y="${move[1]}"]`
      ) as HTMLDivElement;
      square.classList.add("visible");
    });
  }
  clearSquare() {
    document
      .querySelectorAll(`[data-hint="true"], .chess-piece`)
      .forEach((s) => {
        s.classList.remove("visible");
        s.classList.remove("highlight-box");
      });
  }
  dragStart(e: any) {
    this.showMoves(e);
    this.beingDragged = e.target;
    this.draggedElement = this.board[e.target.dataset.x][
      e.target.dataset.y
    ] as Piece;
  }
  dragDrop(e: Event) {
    this.clearSquare();
    this.dragLeave(e);

    if (
      !e.target ||
      !(
        e.target instanceof HTMLDivElement ||
        e.target instanceof HTMLImageElement
      ) ||
      !this.beingDragged ||
      !this.draggedElement ||
      !(
        (this.whitePlayersTurn && this.draggedElement.isWhite) ||
        (!this.whitePlayersTurn && !this.draggedElement.isWhite)
      )
    ) {
      return;
    }
    const newPositionX = Number(e.target.dataset.x);
    const newPositionY = Number(e.target.dataset.y);
    const oldPositionX = Number(this.beingDragged!.dataset.x);
    const oldPositionY = Number(this.beingDragged!.dataset.y);

    let legalMoves = this.getLegalMoves(this.draggedElement);

    let newPosition = document.querySelector(
      `[data-x="${newPositionX}"][data-y="${newPositionY}"]`
    ) as HTMLDivElement;

    for (let i = 0; i < legalMoves.length; i++) {
      let tempBoard = new Array(this.BOARD_COLS);
      for (let j = 0; j < this.BOARD_COLS; j++)
        tempBoard[j] = this.board[j].slice();
      tempBoard[legalMoves[i][0]][legalMoves[i][1]] = this.draggedElement;
      tempBoard[oldPositionX][oldPositionY] = 0;
      const availableMoves =
        this.draggedElement.id === "king" &&
        (this.isWhiteInCheck || this.isBlackInCheck)
          ? !this.generateCheckedMoves(tempBoard, this.whitePlayersTurn)
          : this.generateCheckedMoves(tempBoard, this.whitePlayersTurn);
      if (
        legalMoves[i][0] === newPositionX &&
        legalMoves[i][1] === newPositionY &&
        availableMoves
      ) {
        this.isBlackInCheck = this.isWhiteInCheck = false;
        this.whitePlayersTurn = !this.whitePlayersTurn;
        const temp = this.board[newPositionX][newPositionY];
        this.beingDragged.dataset.x = String(newPositionX);
        this.beingDragged.dataset.y = String(newPositionY);
        this.draggedElement.x = newPositionX;
        this.draggedElement.y = newPositionY;
        this.board[newPositionX][newPositionY] = this.draggedElement;
        this.board[oldPositionX][oldPositionY] = 0;
        if (this.draggedElement.id === "king") {
          this.whitePlayersTurn
            ? (this.blackKingPosition = [newPositionX, newPositionY])
            : (this.whiteKingPosition = [newPositionX, newPositionY]);
        }
        if (typeof temp !== "number") {
          newPosition.lastChild?.remove();
          this.isChecked()
            ? this.checkedAudio.play()
            : this.captureAudio.play();
        } else if (newPosition.childElementCount === 1) {
          this.isChecked() ? this.checkedAudio.play() : this.placeAudio.play();
        }
        newPosition.insertAdjacentElement("beforeend", this.beingDragged!);
        document
          .querySelectorAll(".square")
          .forEach((s) => s.classList.remove("availableMoves"));
        if (this.draggedElement.id === "pawn") {
          (this.draggedElement as Pawn).hadFirstMove = true;
        }
        this.updateState();
        this.updatePieceMoves(this.draggedElement);
      }
    }
    this.generateHeatMap();
    this.generateAvailableMoves();
  }
  dragEnter(e: any) {
    e.target.classList.add("highlight-border");
  }
  dragLeave(e: any) {
    e.target.classList.remove("highlight-border");
  }
  dragOver(e: any) {
    e.preventDefault();
  }
  private isChecked(): boolean {
    for (let i = 0; i < this.board.length; i++) {
      for (let currentPiece of this.board[i]) {
        if (typeof currentPiece === "number") continue;
        let legalMoves = this.getLegalMoves(currentPiece);
        for (let possibleMove of legalMoves) {
          const newSquare = this.board[possibleMove[0]][possibleMove[1]];
          if (typeof newSquare === "number") continue;
          if (!currentPiece.isSameColor(newSquare) && newSquare.id === "king") {
            this.whitePlayersTurn
              ? (this.isWhiteInCheck = true)
              : (this.isBlackInCheck = true);
            return true;
          }
        }
      }
    }
    return false;
  }
  private getLegalMoves(
    currentPiece: Piece,
    isPawn: boolean = false,
    board: Array<Array<Piece | number>> = this.board
  ): [number, number][] {
    let legalMoves;
    // if (isPawn) {
    //   legalMoves = (currentPiece as Pawn).getAttackMoves(
    //     currentPiece.x,
    //     currentPiece.y,
    //     board
    //   );
    // } else
    if (currentPiece.id === "king") {
      legalMoves = (currentPiece as incrementalPiece).getValidMoves(
        currentPiece.x,
        currentPiece.y,
        board
      );
      const playersMap = currentPiece.isWhite
        ? this.whiteHeatMap
        : this.blackHeatMap;

      legalMoves = legalMoves.filter(
        (move) => playersMap[move[0]][move[1]] === 0
      );
    } else {
      legalMoves = (currentPiece as incrementalPiece).getValidMoves(
        currentPiece.x,
        currentPiece.y,
        board
      );
    }
    return legalMoves;
  }
  private updatePieceMoves(piece: Piece): void {
    piece.isWhite
      ? this.whitePlayer.updatePiece(piece)
      : this.blackPlayer.updatePiece(piece);
    this.updatePieces(piece);
  }
  private updatePieces(piece: Piece): void {
    this.totalPieces.delete(piece.coords);
    const newCoords: string = this.getCoords(piece.x, piece.y);
    this.totalPieces.set(newCoords, piece);
  }
  private generateAvailableMoves() {
    this.totalPieces.forEach((piece) => {
      const isPawn = piece.id === "pawn" ? true : false;
      const availableMoves = this.getLegalMoves(piece, isPawn);
      piece.setAvailableMoves(availableMoves);
      piece.isWhite
        ? this.whitePlayer.updatePiece(piece)
        : this.blackPlayer.updatePiece(piece);
    });
    // this.whitePlayer.getAvailablePieces().forEach((piece) => {
    //   const isPawn = piece.id === "pawn" ? true : false;
    //   const availableMoves = this.getLegalMoves(piece, isPawn);
    //   piece.setAvailableMoves(availableMoves);
    //   this.whitePlayer.incrementAvailableMoves(availableMoves.length);
    // });
    // this.blackPlayer.getAvailablePieces().forEach((piece) => {
    //   const isPawn = piece.id === "pawn" ? true : false;
    //   const availableMoves = this.getLegalMoves(piece, isPawn);
    //   piece.setAvailableMoves(availableMoves);
    //   this.blackPlayer.incrementAvailableMoves(availableMoves.length);
    // });
  }
  // private updateBoardPieces() {

  // }
  private getXAxis(num: number) {
    return String(8 - num);
  }
  private getYAxis(num: number) {
    return String.fromCharCode(97 + num);
  }
  private getCoords(x: number, y: number): string {
    return this.getYAxis(y) + this.getXAxis(x);
  }
}

(function () {
  const gameBoard = document.querySelector(".gameBoard") as HTMLDivElement;
  let board: GameBoard = new GameBoard();
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

function isLowerCase(charCode: number) {
  return charCode >= 97 && charCode <= 122;
}
