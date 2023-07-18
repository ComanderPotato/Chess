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
import getCoords, { getXAxis, getYAxis } from "./modules/Utils/Coordinates.js";
interface Coords {
  x: number;
  y: number;
}
// Will need if I want to replay the sound of the move
interface BoardState {
  board: (number | Piece)[][];
  boardStateFEN: string;
  moveSound: HTMLAudioElement;
  moveNotation: string;
  previousMove: string;
}
interface NotationBuilder {
  [index: string]: boolean | string;
  capture: boolean;
  checked: boolean;
  checkMate: boolean;
  castleKingSide: boolean;
  castleQueenSide: boolean;
  promotion: boolean;
  pieceCharID: string;
  pieceUnicodeID: string;
  origin: string;
  destination: string;
}
interface AudioInfo {
  moveType: string;
  sound: HTMLAudioElement;
  notation?: string;
  notationQueenSide?: string;
  notationKingSide?: string;
  isKingSide?: boolean;
}
class GameBoard {
  private whitePlayer: Player;
  private blackPlayer: Player;
  private board: (number | Piece)[][];
  private selectedPiece: Piece | null;
  private selectedElement: HTMLImageElement | null;
  private prevStateStack: (number | Piece)[][][];
  private nextStateStack: (number | Piece)[][][];
  private whitePlayersTurn: boolean;
  private totalPieces: Map<string, Piece>;
  private isBoardRotated: boolean;
  private currentEnPassantPosition: string;
  private currentEnPassantPawn: string;
  private readonly BOARD_COLS: number = 8;
  private readonly BOARD_ROWS: number = 8;
  private moveCount: number = 0;
  private isPromoting: boolean = false;
  private notationBuilder: NotationBuilder = {
    capture: false,
    checked: false,
    checkMate: false,
    castleKingSide: false,
    castleQueenSide: false,
    promotion: false,
    pieceCharID: "",
    pieceUnicodeID: "",
    origin: "",
    destination: "",
  };
  // Do i need audio objects??
  private readonly placeAudio: AudioInfo = {
    moveType: "place",
    sound: new Audio("./assets/audio/move-self.mp3"),
    notation: "",
  };
  private readonly captureAudio: AudioInfo = {
    moveType: "capture",
    sound: new Audio("./assets/audio/capture.mp3"),
    notation: "x",
  };
  private readonly checkedAudio: AudioInfo = {
    moveType: "checked",
    sound: new Audio("./assets/audio/move-check.mp3"),
    notation: "+",
  };
  private readonly castleAudio: AudioInfo = {
    moveType: "castle",
    sound: new Audio("./assets/audio/castle.mp3"),
    notationKingSide: "O-O",
    notationQueenSide: "O-O-O",
  };

  private readonly promoteAudio: AudioInfo = {
    moveType: "promote",
    sound: new Audio("./assets/audio/promote.mp3"),
    notation: "=",
  };
  private currentMoveSound: AudioInfo = this.placeAudio;
  private promotedPawnTo: string = "";
  // private readonly placeAudio: HTMLAudioElement = new Audio(
  //   "./assets/audio/move-self.mp3"
  // );
  // private readonly captureAudio: HTMLAudioElement = new Audio(
  //   "./assets/audio/capture.mp3"
  // );
  // private readonly checkedAudio: HTMLAudioElement = new Audio(
  //   "./assets/audio/move-check.mp3"
  // );
  // private readonly castleAudio: HTMLAudioElement = new Audio(
  //   "./assets/audio/castle.mp3"
  // );
  // private readonly promoteAudio: HTMLAudioElement = new Audio(
  //   "./assets/audio/promote.mp3"
  // );
  // private currentMoveSound: HTMLAudioElement | null;
  private resetBuilder(): void {
    for (let prop in this.notationBuilder) {
      if (typeof this.notationBuilder[prop] === "boolean")
        this.notationBuilder[prop] = false;
      if (typeof this.notationBuilder[prop] === "string")
        this.notationBuilder[prop] = "";
    }
  }

  private disambiguateNotation(piece: Piece, destination: string): string {
    const playersPieces = piece.getIsWhite()
      ? this.whitePlayer.getAvailablePieces()
      : this.blackPlayer.getAvailablePieces();

    let sameRank = false;
    let sameFile = false;
    for (const pieces of playersPieces) {
      if (piece.getCoords() === pieces[1].getCoords()) continue;
      if (piece.getCharID() === pieces[1].getCharID()) {
        for (const moves of pieces[1].getAvailableMoves()) {
          if (destination === getCoords(moves[0], moves[1])) {
            if (piece.getRank() === pieces[1].getRank()) {
              sameRank = true;
            }
            if (piece.getFile() === pieces[1].getFile()) {
              sameFile = true;
            }
          }
        }
      }
    }
    if (sameRank && sameFile) {
      return piece.getCoords();
    } else if (sameRank) {
      return getYAxis(piece.getFile());
    } else if (sameFile) {
      return getXAxis(piece.getRank());
    } else {
      return "";
    }
  }
  constructor() {
    // this.placeAudio.dataset.notation = "";
    // this.captureAudio.dataset.notation = "x";
    // this.checkedAudio.dataset.notation = "+";
    // this.castleAudio.dataset.notationKingSide = "0-0";
    // this.castleAudio.dataset.notationQueenSide = "0-0-0";
    // this.promoteAudio.dataset.notation = "=";
    this.initializeVariables();
    this.createGame();
  }
  private initializeVariables(): void {
    this.board = this.createEmptyBoard();
    this.whitePlayer = new Player(true, [7, 4]);
    this.blackPlayer = new Player(false, [0, 4]);
    this.isBoardRotated = false;
    this.unselectPiece();
    this.prevStateStack = [];
    this.nextStateStack = [];
    this.whitePlayersTurn = true;
    this.totalPieces = new Map<string, Piece>();
    this.currentEnPassantPosition = "-";
    this.currentEnPassantPawn = "";
    this.clearSquare();
    this.updateTimer();
  }
  private getPlayersMoveCount(): [string, string] {
    const whitePlayerMoveCount = String(Math.ceil(this.moveCount / 2));
    const blackPlayerMoveCount = String(Math.floor(this.moveCount / 2));
    return [whitePlayerMoveCount, blackPlayerMoveCount];
  }
  private createBoard(htmlElement: HTMLDivElement) {
    for (let x = 0; x < this.BOARD_COLS; x++) {
      const row = document.createElement("div");
      row.classList.add("row");
      for (let y = 0; y < this.BOARD_ROWS; y++) {
        const square = document.createElement("div");
        const hintSquare = document.createElement("div");
        hintSquare.classList.add("hint");
        square.classList.add("square");
        if ((x + y) % 2 !== 0) square.classList.add("square--off-color");
        square.dataset.x = hintSquare.dataset.x = String(x);
        square.dataset.y = hintSquare.dataset.y = String(y);
        square.dataset.isMoveableTo = "false";
        hintSquare.dataset.hint = "true";
        if (y === 0 || y === this.BOARD_COLS - 1) {
          const coords = document.createElement("span");
          coords.classList.add("square--coords");
          coords.classList.add("square--coords-x");
          if (y === this.BOARD_COLS - 1) {
            coords.classList.add("square--coords-secondary");
            coords.classList.add("square--coords-secondary-x");
            coords.classList.add("square--coords-hidden");
          }
          coords.textContent = getXAxis(x);
          if ((x + y) % 2 == 0) {
            coords.classList.add("square--coords--off-color");
          }
          square.insertAdjacentElement("beforeend", coords);
        }
        if (x === this.BOARD_COLS - 1 || x === 0) {
          const coords = document.createElement("span");
          coords.classList.add("square--coords");
          coords.classList.add("square--coords-y");
          if (x === 0) {
            coords.classList.add("square--coords-secondary");
            coords.classList.add("square--coords-secondary-y");

            coords.classList.add("square--coords-hidden");
          }
          coords.textContent = getYAxis(y);
          if ((x + y) % 2 == 0) {
            coords.classList.add("square--coords--off-color");
          }
          square.insertAdjacentElement("beforeend", coords);
        }
        row.insertAdjacentElement("beforeend", square);
        square.insertAdjacentElement("beforeend", hintSquare);
      }
      htmlElement.insertAdjacentElement("beforeend", row);
    }
  }
  private generateFEN(): string {
    let fenString = "";
    let whiteCastlable = "";
    let blackCastlable = "";
    const playersTurn = this.whitePlayersTurn ? "w" : "b";
    for (const row of this.board) {
      for (const piece of row) {
        if (piece instanceof Piece) {
          fenString += piece.getCharID();
          if (piece instanceof King) {
            if (piece.getCanCastleKingSide()) {
              piece.getIsWhite()
                ? (whiteCastlable += "K")
                : (blackCastlable += "k");
            }
            if (piece.getCanCastleQueenSide()) {
              piece.getIsWhite()
                ? (whiteCastlable += "Q")
                : (blackCastlable += "q");
            }
          }
        } else {
          let a = fenString.charCodeAt(fenString.length - 1);
          if (isDigit(a)) {
            const digit = fenString.charAt(fenString.length - 1);
            let tempString = fenString.slice(0, -1);
            tempString += Number(digit) + Number(1);
            fenString = tempString;
          } else {
            fenString += "1";
          }
        }
      }
      fenString += "/";
    }
    fenString = `${fenString.slice(
      0,
      -1
    )} ${playersTurn} ${whiteCastlable}${blackCastlable} ${
      this.currentEnPassantPosition
    }`;
    return fenString;
  }
  private createChessPieces(): void {
    const pattern = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
    let x = 0;
    let y = 0;
    for (let c of pattern) {
      const char = c.toLowerCase();
      if (char === "/") {
        x++;
        y = 0;
      } else if (isDigit(char.charCodeAt(0))) {
        for (let i = 0; i < Number(char); i++) {
          y++;
        }
      } else {
        const isWhite = isUpperCase(c.charCodeAt(0));
        const square = document.querySelector(
          `[data-x="${x}"][data-y="${y}"]`
        ) as HTMLDivElement;
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
        this.addPiece(piece);
        this.createChessElement(square, piece);
        y++;
      }
    }
    // this.generateHeatMaps();
    this.updateAvailableMoves();
  }
  // private readFEN(fenStr: string): void {}
  private pieceFactory(
    char: "r" | "n" | "b" | "q" | "k" | "p",
    x: number,
    y: number,
    isWhite: boolean,
    coords: string
  ): Piece {
    switch (char) {
      case "r":
        return new Rook(x, y, isWhite, "rook", coords);
      case "n":
        return new Knight(x, y, isWhite, "knight", coords);
      case "b":
        return new Bishop(x, y, isWhite, "bishop", coords);
      case "q":
        return new Queen(x, y, isWhite, "queen", coords);
      case "k":
        return new King(x, y, isWhite, "king", coords);
      case "p":
        return new Pawn(x, y, isWhite, "pawn", coords);
    }
  }
  private createChessElement(
    boardSquare: HTMLDivElement,
    piece: Piece,
    isPromotedPawn?: boolean
  ): void {
    const pieceElement = document.createElement("img");
    this.isBoardRotated && pieceElement.classList.add("rotate");
    pieceElement.dataset.x = String(piece.getRank());
    pieceElement.dataset.y = String(piece.getFile());
    pieceElement.setAttribute("name", "chess-piece");
    this.board[piece.getRank()][piece.getFile()] = piece;
    pieceElement.src = piece.getImage();
    pieceElement.classList.add("chess-piece");
    pieceElement.draggable = true;
    boardSquare.insertAdjacentElement("beforeend", pieceElement);

    if (isPromotedPawn) {
      pieceElement.addEventListener("click", this.selectPiece.bind(this));
      pieceElement.addEventListener("dragstart", this.dragStart.bind(this));
    }
  }
  private promotePawn(e: Event, pawnX: number, pawnY: number): void {
    if (!e.target || !(e.target instanceof HTMLImageElement)) return;
    const pawnToPromote = this.board[pawnX][pawnY] as Piece;
    let piece;
    switch (e.target.dataset.piece) {
      case "queen":
        piece = new Queen(
          pawnX,
          pawnY,
          pawnToPromote.getIsWhite(),
          "queen",
          getCoords(pawnX, pawnY)
        );
        break;
      case "knight":
        piece = new Knight(
          pawnX,
          pawnY,
          pawnToPromote.getIsWhite(),
          "knight",
          getCoords(pawnX, pawnY)
        );
        break;
      case "rook":
        piece = new Rook(
          pawnX,
          pawnY,
          pawnToPromote.getIsWhite(),
          "rook",
          getCoords(pawnX, pawnY)
        );
        break;
      case "bishop":
        piece = new Bishop(
          pawnX,
          pawnY,
          pawnToPromote.getIsWhite(),
          "bishop",
          getCoords(pawnX, pawnY)
        );
        break;
      default:
        return;
    }
    const boardSquare = document.querySelector(
      `.square[data-x="${pawnX}"][data-y="${pawnY}"]`
    ) as HTMLDivElement;
    this.updateCardValue(piece, this.isPromoting);
    this.closePromotePawnModal();
    this.promotedPawnTo = piece.getCharID().toUpperCase();
    this.promoteAudio.sound.play();
    this.removePiece(pawnToPromote);
    this.createChessElement(boardSquare, piece, true);
    this.addPiece(piece);
    this.updateAvailableMoves();
    this.updateTimer();
    if (this.isChecked()) {
      this.checkedAudio.sound.play();
    }
  }
  private updateTimer() {
    if (this.whitePlayersTurn) {
      this.whitePlayer.getPlayersTimer().startTimer();
      this.blackPlayer.getPlayersTimer().stopTimer();
    } else {
      this.whitePlayer.getPlayersTimer().stopTimer();
      this.blackPlayer.getPlayersTimer().startTimer();
    }
  }
  private removePiece(piece: Piece): void {
    this.changeCount(piece);
    (
      document.querySelector(
        `.chess-piece[data-x="${piece.getRank()}"][data-y="${piece.getFile()}"]`
      ) as HTMLImageElement
    ).remove();
    this.board[piece.getRank()][piece.getFile()] = 0;
    piece.getIsWhite()
      ? this.whitePlayer.removePiece(piece)
      : this.blackPlayer.removePiece(piece);
  }

  private getGeneratedMoves(
    currentPiece: Piece,
    clonedBoard: (Piece | number)[][]
  ): [number, number][] {
    return currentPiece.getValidMoves(clonedBoard);
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
    this.getPieces().forEach((piece) => {
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
      } else {
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
  // private generateCheckedMoves(
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
  private selectPiece(e: Event) {
    if (!e.target || !(e.target instanceof HTMLImageElement)) return;
    console.log("Hello");
    console.log(this);
    const currentX = Number(e.target.dataset.x);
    const currentY = Number(e.target.dataset.y);
    const newPiece = this.board[currentX][currentY];
    if (
      this.selectedPiece instanceof Piece &&
      newPiece instanceof Piece &&
      this.selectedPiece.getIsWhite() !== newPiece.getIsWhite() &&
      ((this.whitePlayersTurn && !newPiece.getIsWhite()) ||
        (!this.whitePlayersTurn && newPiece.getIsWhite()))
    ) {
      this.movePiece(e);
    } else {
      const newBoardElement = document.querySelector(
        `.square[data-x="${currentX}"][data-y="${currentY}"]`
      ) as HTMLDivElement;
      if (
        this.selectedPiece instanceof King &&
        newPiece instanceof Rook &&
        JSON.parse(newBoardElement.dataset.isMoveableTo as string)
      ) {
        this.movePiece(e);
      } else {
        this.showAvailableMoves(e);
        this.selectedPiece = this.board[currentX][currentY] as Piece;
        this.selectedElement = document.querySelector(
          `.chess-piece[data-x="${currentX}"][data-y="${currentY}"]`
        ) as HTMLImageElement;
      }
    }
  }
  // private capturePiece(oldCoords: Coords, newCoords: Coords) {
  //   const newPositionX = Number(newCoords.x);
  //   const newPositionY = Number(newCoords.y);
  // }
  private addLastMoveHighlight(posX: number, posY: number): void {
    (
      document.querySelector(
        `.square[data-x="${posX}"][data-y="${posY}"]`
      ) as HTMLDivElement
    ).classList.add("previous-move-highlight");
  }
  private removeLastMoveHighlight(): void {
    document
      .querySelector(`.previous-move-highlight`)
      ?.classList.remove("previous-move-highlight");
  }
  private showAvailableMoves(e: Event) {
    this.clearSquare();
    if (!e.target || !(e.target instanceof HTMLImageElement)) return;
    const currentX = Number(e.target.dataset.x);
    const currentY = Number(e.target.dataset.y);
    const coords = getCoords(currentX, currentY);
    const availableMoves = this.getPieces().get(coords)!.getAvailableMoves();
    document
      .querySelector(`.chess-piece[data-x="${currentX}"][data-y="${currentY}"]`)
      ?.classList.add("highlight-box");
    for (const move of availableMoves) {
      const className =
        this.board[move[0]][move[1]] instanceof Piece
          ? "hint--large"
          : "hint--small";
      (
        document.querySelector(
          `[data-hint="true"][data-x="${move[0]}"][data-y="${move[1]}"]`
        ) as HTMLDivElement
      ).classList.add(className);

      (
        document.querySelector(
          `.square[data-x="${move[0]}"][data-y="${move[1]}"]`
        ) as HTMLDivElement
      ).dataset.isMoveableTo = "true";
    }
  }

  private movePiece(e: Event) {
    this.dragLeave(e);
    if (
      !(
        e.target instanceof HTMLDivElement ||
        e.target instanceof HTMLImageElement
      ) ||
      !this.selectedPiece ||
      !this.selectedElement ||
      !e.target ||
      // !(
      //   (this.whitePlayersTurn && this.selectedPiece.getIsWhite()) ||
      //   (!this.whitePlayersTurn && !this.selectedPiece.getIsWhite())
      // ) ||
      this.isPromoting
    ) {
      return;
    }
    const newPositionX = Number(e.target.dataset.x);
    const newPositionY = Number(e.target.dataset.y);
    const oldPositionX = this.selectedPiece.getRank();
    const oldPositionY = this.selectedPiece.getFile();
    if (newPositionX === oldPositionX && newPositionY === oldPositionY) return;

    const newBoardElement = document.querySelector(
      `[data-x="${newPositionX}"][data-y="${newPositionY}"]`
    ) as HTMLDivElement;
    if (JSON.parse(newBoardElement.dataset.isMoveableTo as string)) {
      this.moveCount++;
      this.removeLastMoveHighlight();
      this.unsetEnPassant();
      this.updateState();
      this.whitePlayersTurn = !this.whitePlayersTurn;
      if (
        this.selectedPiece instanceof King &&
        this.board[newPositionX][newPositionY] instanceof Rook &&
        this.selectedPiece.getIsWhite() ===
          (this.board[newPositionX][newPositionY] as Piece).getIsWhite()
      ) {
        this.castleKing(this.board[newPositionX][newPositionY] as Rook);
      } else {
        this.whitePlayer.setIsChecked(false);
        this.blackPlayer.setIsChecked(false);
        console.log(
          this.disambiguateNotation(
            this.board[oldPositionX][oldPositionY] as Piece,
            getCoords(newPositionX, newPositionY)
          )
        );
        this.currentMoveSound = this.movePieceOnBoard(
          oldPositionX,
          oldPositionY,
          newPositionX,
          newPositionY
        );
        this.currentMoveSound.sound.play();
      }
      this.addLastMoveHighlight(oldPositionX, oldPositionY);
      this.clearSquare();
      // Updates timer even when player hasnt promoted
      if (!this.isPromoting) this.updateTimer();
      this.updateAvailableMoves();
    }
  }
  private castleKing(rookPiece: Rook): void {
    if (!this.selectedPiece) return;
    const rookX = rookPiece.getRank();
    const rookY = rookPiece.getFile();
    const newBoardElement = document.querySelector(
      `[data-x="${rookX}"][data-y="${rookY}"]`
    ) as HTMLDivElement;
    if (JSON.parse(newBoardElement.dataset.isMoveableTo as string)) {
      const newKingsPositionY =
        (rookY > this.selectedPiece.getFile() ? 2 : -2) +
        this.selectedPiece.getFile();
      const kingsCurrentX = this.selectedPiece.getRank();

      this.movePieceOnBoard(
        kingsCurrentX,
        this.selectedPiece.getFile(),
        kingsCurrentX,
        newKingsPositionY
      );
      const newRooksPositionX =
        (rookY > this.selectedPiece.getFile() ? -1 : 1) + newKingsPositionY;
      this.movePieceOnBoard(rookX, rookY, rookX, newRooksPositionX);

      rookPiece.setHadFirstMove();
      (this.selectedPiece as King).setHadFirstMove();

      this.castleAudio.sound.play();
    }
    this.unselectPiece();
  }
  private movePieceOnBoard(
    oldPositionX: number,
    oldPositionY: number,
    newPositionX: number,
    newPositionY: number
  ): AudioInfo {
    let moveSound = this.placeAudio;
    const boardSquare = this.getPieces().get(
      getCoords(oldPositionX, oldPositionY)
    ) as Piece;
    const currentPiece = this.board[newPositionX][newPositionY];
    if (currentPiece instanceof Piece) {
      this.removePiece(currentPiece);
      moveSound = this.captureAudio;
    }
    this.board[newPositionX][newPositionY] = boardSquare;
    this.board[oldPositionX][oldPositionY] = 0;
    boardSquare.setRank(newPositionX);
    boardSquare.setFile(newPositionY);
    this.updatePiece(boardSquare);
    boardSquare.setCoords(getCoords(newPositionX, newPositionY));
    const pieceElement = document.querySelector(
      `.chess-piece[data-x="${oldPositionX}"][data-y="${oldPositionY}"]`
    ) as HTMLImageElement;
    [pieceElement.dataset.x, pieceElement.dataset.y] = [
      String(newPositionX),
      String(newPositionY),
    ];
    const newSquare = document.querySelector(
      `.square[data-x="${newPositionX}"][data-y="${newPositionY}"]`
    ) as HTMLDivElement;
    newSquare.insertAdjacentElement("beforeend", pieceElement);
    if (
      boardSquare instanceof King ||
      boardSquare instanceof Rook ||
      boardSquare instanceof Pawn
    ) {
      if (boardSquare instanceof Pawn) {
        if (boardSquare.isPromotable()) {
          this.openPromotePawnModal(newPositionX, newPositionY);
        } else if (!boardSquare.getHadFirstMove()) {
          if (Math.abs(oldPositionX - newPositionX) === 2) {
            boardSquare.setCanEnPassant(true);
            this.currentEnPassantPosition = `${getYAxis(
              boardSquare.getFile()
            )}${getXAxis(
              boardSquare.getIsWhite()
                ? boardSquare.getRank() + 1
                : boardSquare.getRank() - 1
            )}`;
            this.currentEnPassantPawn = boardSquare.getCoords();
          }
        } else if (
          oldPositionY !== newPositionY &&
          !(currentPiece instanceof Piece)
        ) {
          const pawn = this.board[oldPositionX][newPositionY] as Piece;
          this.removePiece(pawn);
          moveSound = this.captureAudio;
        }
      } else if (boardSquare instanceof King) {
        this.updateKingPosition(boardSquare);
      }
      boardSquare.setHadFirstMove();
    }
    return this.isChecked() ? this.checkedAudio : moveSound;
  }
  private unsetEnPassant(): void {
    if (this.currentEnPassantPosition !== "-") {
      (this.getPieces().get(this.currentEnPassantPawn) as Pawn).setCanEnPassant(
        false
      );
      this.currentEnPassantPosition = "-";
      this.currentEnPassantPawn = "";
    }
  }
  private closePromotePawnModal(): void {
    document
      .querySelectorAll(".modal--image")
      .forEach((modalImage) =>
        modalImage.removeEventListener("click", this.promotePawn.bind, true)
      );
    (document.querySelectorAll(".modal") as NodeListOf<Element>).forEach(
      (modal) => modal.classList.remove("visible-modal")
    );
    this.isPromoting = false;
  }
  private openPromotePawnModal(modalPosX: number, modalPosY: number): void {
    this.isPromoting = true;
    const isWhite = (this.board[modalPosX][modalPosY] as Piece).getIsWhite();
    isWhite ? ".modal--white" : ".modal--white";
    const modal = document.querySelector(
      `${isWhite ? ".modal--white" : ".modal--black"}`
    ) as HTMLDivElement;

    modal.style.left = `${modalPosY}00px`;
    modal.classList.add("visible-modal");
    document
      .querySelectorAll(".modal--image")
      .forEach((modalImage) =>
        modalImage.addEventListener("click", (e) =>
          this.promotePawn(e, modalPosX, modalPosY)
        )
      );
  }
  private unselectPiece(): void {
    this.selectedElement = null;
    this.selectedPiece = null;
  }
  private updateKingPosition(piece: Piece) {
    piece.getIsWhite()
      ? this.whitePlayer.setKingsPosition(piece.getRank(), piece.getFile())
      : this.blackPlayer.setKingsPosition(piece.getRank(), piece.getFile());
  }

  private isChecked(): boolean {
    // for(const row of this.board) {
    //   for(const piece of row) {
    //     if(typeof piece === "number") continue;
    //     const legalMoves = piece.getValidMoves(this.board);
    //     for(const possibleMove of legalMoves) {
    //       const newSquare = this.board[possibleMove[0]][possibleMove[1]];
    //       if (typeof newSquare === "number") continue;
    //       if (
    //         !piece.isSameColor(newSquare) &&
    //         newSquare instanceof King
    //       ) {
    //         this.whitePlayersTurn
    //           ? this.whitePlayer.setIsChecked(true)
    //           : this.blackPlayer.setIsChecked(true);
    //         return true;
    //       }
    //     }
    //   }
    // }
    for (let i = 0; i < this.board.length; i++) {
      for (let currentPiece of this.board[i]) {
        if (typeof currentPiece === "number") continue;
        const legalMoves = currentPiece.getValidMoves(this.board);
        for (const possibleMove of legalMoves) {
          const newSquare = this.board[possibleMove[0]][possibleMove[1]];
          if (typeof newSquare === "number") continue;
          if (
            !currentPiece.isSameColor(newSquare) &&
            newSquare instanceof King
          ) {
            this.whitePlayersTurn
              ? this.whitePlayer.setIsChecked(true)
              : this.blackPlayer.setIsChecked(true);
            return true;
          }
        }
      }
    }
    return false;
  }
  private addPiece(piece: Piece): void {
    this.getPieces().set(piece.getCoords(), piece);
  }
  private getPieces() {
    return this.totalPieces;
  }

  private updatePiece(piece: Piece): void {
    const oldCoords = piece.getCoords();
    this.getPieces().delete(piece.getCoords());
    const newCoords: string = getCoords(piece.getRank(), piece.getFile());
    this.getPieces().set(newCoords, piece);
    piece.getIsWhite()
      ? this.whitePlayer.updatePiece(piece, oldCoords)
      : this.blackPlayer.updatePiece(piece, oldCoords);
  }
  private updatePiecesMoves(piece: Piece, updatedMoves: [number, number][]) {
    this.getPieces().get(piece.getCoords())!.setAvailableMoves(updatedMoves);
    // piece.getIsWhite()
    //   ? this.whitePlayer.updatePiece(piece)
    //   : this.blackPlayer.updatePiece(piece);
  }
  private generateValidNextMoves() {
    for (const piece of this.getPieces().values()) {
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
          const clonedBoard = this.duplicateCurrentBoard();
          clonedBoard[piece.getRank()][piece.getFile()] = 0;
          clonedBoard[move[0]][move[1]] = piece;
          for (const row of clonedBoard) {
            for (const square of row) {
              if (!(square instanceof Piece) || piece.isSameColor(square))
                continue;
              this.getGeneratedMoves(square, clonedBoard).forEach((move) => {
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
  private resetPlayerTimers(): void {
    this.whitePlayer.createNewTimer();
    this.blackPlayer.createNewTimer();
  }
  private generateNotation(): string {
    if (!this.selectedPiece) return "";
    switch (this.currentMoveSound.moveType) {
      case "place": {
        return `${this.selectedPiece!.getCharID().toUpperCase()}${getCoords(
          this.selectedPiece!.getRank(),
          this.selectedPiece!.getFile()
        )}`;
      }
      case "capture": {
        return `${this.selectedPiece!.getCharID().toUpperCase()}${
          this.currentMoveSound.notation
        }${getCoords(
          this.selectedPiece!.getRank(),
          this.selectedPiece!.getFile()
        )}`;
      }
      case "checked": {
        return `${this.selectedPiece!.getCharID().toUpperCase()}${getCoords(
          this.selectedPiece!.getRank(),
          this.selectedPiece!.getFile()
        )}${this.currentMoveSound.notation}`;
      }
      case "castle": {
      }
      case "promote": {
        return `${getCoords(
          this.selectedPiece!.getRank(),
          this.selectedPiece!.getFile()
        )}${this.currentMoveSound.notation}${this.promotedPawnTo}`;
      }
    }
    return "";
  }
  private updateAvailableMoves(): void {
    if (this.isPromoting) return;
    this.generateHeatMaps();
    this.getPieces().forEach((piece) => {
      let availableMoves = piece.getValidMoves(this.board);
      if (piece instanceof King) {
        const opponentsHeatMap = piece.getIsWhite()
          ? this.whitePlayer.getOpponentHeatMap()
          : this.blackPlayer.getOpponentHeatMap();
        availableMoves = availableMoves.filter(
          (move) => opponentsHeatMap[move[0]][move[1]] === 0
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
    this.generateValidNextMoves();
    this.whitePlayer.updateMoves();
    this.blackPlayer.updateMoves();
    // this.unsetEnPassant();
    this.getCastlableMoves();
    this.checkVictory();
    this.unselectPiece();
    console.log(this.generateFEN());
    // console.log(this.generateNotation());
  }
  private getCastlableMoves(): void {
    this.whitePlayer.canCastle(this.board);
    this.blackPlayer.canCastle(this.board);
  }
  private dragEnter(e: any) {
    e.target.classList.add("highlight-border");
  }
  private dragLeave(e: any) {
    e.target.classList.remove("highlight-border");
  }
  private dragOver(e: any) {
    e.preventDefault();
  }
  private clearSquare() {
    document
      .querySelectorAll(
        `.hint--large, .hint--small, .highlight-box, .highlight-border, [data-is-moveable-to="true"]`
      )
      .forEach((s) => {
        s.classList.remove("hint--large");
        s.classList.remove("hint--small");
        s.classList.remove("highlight-box");
        s.classList.remove("highlight-border");
        if (s.classList.contains("square")) {
          (s as HTMLDivElement).dataset.isMoveableTo = "false";
        }
      });
  }
  private dragStart(e: Event) {
    if (!e.target || !(e.target instanceof HTMLImageElement)) return;
    const currentX = Number(e.target.dataset.x);
    const currentY = Number(e.target.dataset.y);
    this.showAvailableMoves(e);
    this.selectedPiece = this.board[currentX][currentY] as Piece;
    this.selectedElement = document.querySelector(
      `.chess-piece[data-x="${currentX}"][data-y="${currentY}"]`
    ) as HTMLImageElement;
    // this.selectedElement.style.visibility = "hidden";
  }

  private print(e: any) {
    e.stopPropagation();
    e.preventDefault();
    console.log(e.clientX, e.clientY);
  }
  private updateState() {
    // document.removeEventListener("mouseover", this.print.bind(this), true);
    const newState = this.duplicateCurrentBoard();
    this.prevStateStack.push(newState);
  }
  private previousState() {
    if (
      !Array.isArray(this.prevStateStack) ||
      !this.prevStateStack.length ||
      this.prevStateStack.length >= 0
    ) {
      if (this.nextStateStack.length === 0) {
        this.nextStateStack.push(this.duplicateCurrentBoard());
      }
      const prevBoard = this.prevStateStack.pop();
      if (typeof prevBoard !== "undefined") {
        const dupeBoard = prevBoard.map((row) => [...row]);
        this.nextStateStack.push(dupeBoard);
        this.updateBoardState(dupeBoard);
      }
    }
  }
  private nextState() {
    if (
      !Array.isArray(this.nextStateStack) ||
      !this.nextStateStack.length ||
      this.nextStateStack.length >= 0
    ) {
      const nextBoard = this.nextStateStack.pop();
      if (typeof nextBoard !== "undefined") {
        const dupeBoard = nextBoard.map((row) => [...row]);
        this.prevStateStack.push(dupeBoard);
        this.updateBoardState(dupeBoard);
      }
    }
  }
  private updateBoardState(savedState: (number | Piece)[][]): void {
    console.log(this.nextStateStack);
    for (let x = 0; x < this.BOARD_COLS; x++) {
      for (let y = 0; y < this.BOARD_ROWS; y++) {
        const currentPiece = document.querySelector(
          `.chess-piece[data-x="${x}"][data-y="${y}"]`
        );
        if (currentPiece instanceof HTMLImageElement) currentPiece.remove();
        const square = document.querySelector(
          `.square[data-x="${x}"][data-y="${y}"]`
        ) as HTMLDivElement;
        const savedStateEl = savedState[x][y];
        this.board[x][y] = savedState[x][y];
        if (savedStateEl instanceof Piece) {
          const pieceElement = document.createElement("img");
          pieceElement.dataset.x = String(x);
          pieceElement.dataset.y = String(y);
          pieceElement.setAttribute("name", "chess-piece");
          pieceElement.src = savedStateEl.getImage();
          pieceElement.classList.add("chess-piece");
          pieceElement.draggable = true;
          square.insertAdjacentElement("beforeend", pieceElement);
        }
      }
    }
    if (this.nextStateStack.length === 0) {
      this.addChessHandlers();
    }
  }

  private updateSavedState(direction: string) {
    const savedState =
      direction === "prev"
        ? [...this.prevStateStack[this.prevStateStack.length - 1]]
        : [...this.nextStateStack[this.nextStateStack.length - 1]];
    for (let x = 0; x < this.BOARD_COLS; x++) {
      for (let y = 0; y < this.BOARD_ROWS; y++) {
        const currentElement = this.board[x][y];
        const savedStateElement = savedState[x][y];
        if (currentElement === savedStateElement) continue;

        const square = document.querySelector(
          `.square[data-x="${x}"][data-y="${y}"]`
        ) as HTMLDivElement;
        if (!!square.children.namedItem("chess-piece")) {
          (
            document.querySelector(
              `.chess-piece[data-x="${x}"][data-y="${y}"]`
            ) as HTMLImageElement
          ).remove();
        }
        if (savedStateElement instanceof Piece) {
          const pieceElement = document.createElement("img");
          pieceElement.dataset.x = String(x);
          pieceElement.dataset.y = String(y);
          pieceElement.setAttribute("name", "chess-piece");
          this.board[x][y] = savedState[x][y];
          pieceElement.src = (savedState[x][y] as Piece).getImage();
          pieceElement.classList.add("chess-piece");
          pieceElement.draggable = true;
          square.insertAdjacentElement("beforeend", pieceElement);
        }
      }
    }
  }
  private resetCapturedPieces() {
    document.querySelectorAll(".captured--pieces").forEach((el) => {
      el.childNodes.forEach((child) => {
        if (child instanceof HTMLSpanElement && child.classList.length > 1) {
          const oldClassName = child.classList[child.classList.length - 1];
          const newClassName = oldClassName.replace(
            oldClassName.charAt(19),
            "0"
          );
          child.classList.remove(oldClassName);
          child.classList.add(newClassName);
        } else if (child instanceof HTMLSpanElement) {
          child.dataset.value = "";
          child.textContent = "";
        }
      });
    });
  }
  private changeCount(piece: Piece) {
    const capturedPiecesEl = document.getElementById(
      `captured--${piece.getID()}-${piece.getIsWhite() ? "w" : "b"}`
    ) as HTMLSpanElement;
    const oldClassName =
      capturedPiecesEl.classList[capturedPiecesEl.classList.length - 1];
    let capturedPieceCount = Number(oldClassName.charAt(19));
    if (
      (piece instanceof Pawn && capturedPieceCount < 8) ||
      (piece instanceof Queen && capturedPieceCount < 1) ||
      ((piece instanceof Rook ||
        piece instanceof Bishop ||
        piece instanceof Knight) &&
        capturedPieceCount < 2)
    ) {
      capturedPiecesEl.classList.remove(oldClassName);
      const newClassName = oldClassName.replace(
        oldClassName.charAt(19),
        String(capturedPieceCount + 1)
      );
      capturedPiecesEl.classList.add(newClassName);
    }
    this.updateCardValue(piece, this.isPromoting);
  }
  private updateCardValue(piece: Piece, isPromoting: boolean): void {
    const playerColor = piece.getIsWhite() ? "w" : "b";
    const enemyColor = !piece.getIsWhite() ? "w" : "b";
    const playerValueEl = document.querySelector(
      `.player--card-points-${isPromoting ? enemyColor : playerColor}`
    ) as HTMLSpanElement;
    const enemyPlayerValueEl = document.querySelector(
      `.player--card-points-${isPromoting ? playerColor : enemyColor}`
    ) as HTMLSpanElement;
    // const playerValueEl = document.querySelector(
    //   `.player--card-points-${piece.getIsWhite() ? "w" : "b"}`
    // ) as HTMLSpanElement;
    // const enemyPlayerValueEl = document.querySelector(
    //   `.player--card-points-${!piece.getIsWhite() ? "w" : "b"}`
    // ) as HTMLSpanElement;
    playerValueEl.dataset.value = String(
      Number(playerValueEl.dataset.value!) + Number(piece.getPieceValue())
    );
    if (
      Number(playerValueEl.dataset.value!) >
      Number(enemyPlayerValueEl.dataset.value!)
    ) {
      playerValueEl.textContent = `${
        Number(playerValueEl.dataset.value!) -
        Number(enemyPlayerValueEl.dataset.value!)
      }+`;

      enemyPlayerValueEl.textContent = "";
    } else if (
      Number(playerValueEl.dataset.value!) <
      Number(enemyPlayerValueEl.dataset.value!)
    ) {
      enemyPlayerValueEl.textContent = `${
        Number(enemyPlayerValueEl.dataset.value!) -
        Number(playerValueEl.dataset.value!)
      }+`;
      playerValueEl.textContent = "";
    } else {
      playerValueEl.textContent = "";
      enemyPlayerValueEl.textContent = "";
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
  private duplicateCurrentBoard(): (number | Piece)[][] {
    const duplicatedBoard = this.board.map((row) => [...row]);
    return duplicatedBoard;
  }
  private createEmptyBoard(): (number | Piece)[][] {
    const emptyBoard = new Array(this.BOARD_COLS);
    for (let i = 0; i < this.BOARD_ROWS; i++) {
      emptyBoard[i] = new Array(this.BOARD_ROWS).fill(0);
    }
    return emptyBoard;
  }
  private rotateBoard() {
    this.isBoardRotated = !this.isBoardRotated;
    (document.querySelector(".gameBoard") as HTMLDivElement).classList.toggle(
      "rotate"
    );
    document
      .querySelectorAll(".chess-piece")
      .forEach((piece) => piece.classList.toggle("rotate"));
    document
      .querySelectorAll(".square--coords")
      .forEach((square) => square.classList.toggle("square--coords-hidden"));
    document.querySelectorAll(".player--card").forEach((card) => {
      card.classList.toggle("player--card-top");
      card.classList.toggle("player--card-bottom");
    });
    document
      .querySelectorAll(".modal--image")
      .forEach((image) => image.classList.toggle("modal--image-rotate"));
  }
  private restartGame() {
    if (this.isBoardRotated) this.rotateBoard();
    if (this.isPromoting) this.closePromotePawnModal();
    this.resetPlayerTimers();
    this.initializeVariables();
    document
      .querySelectorAll(".chess-piece")
      .forEach((piece) => piece.remove());
    this.createChessPieces();
    this.addChessHandlers();
    this.removeLastMoveHighlight();
    this.resetCapturedPieces();
  }
  private addChessHandlers(): void {
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
  }
  private addPageHandlers(): void {
    document
      .querySelector(".rot")!
      .addEventListener("click", this.rotateBoard.bind(this));
    document
      .querySelector(".restart")!
      .addEventListener("click", this.restartGame.bind(this));
    document
      .querySelector(".prev")!
      .addEventListener("click", this.previousState.bind(this));
    document
      .querySelector(".next")!
      .addEventListener("click", this.nextState.bind(this));
  }
  private createGame() {
    const gameBoard = document.querySelector(".gameBoard") as HTMLDivElement;
    this.createBoard(gameBoard);
    this.createChessPieces();
    this.addChessHandlers();
    this.addPageHandlers();
  }
  private checkVictory() {
    const whiteArmySize = this.whitePlayer.getAvailablePieces().size;
    const blackArmySize = this.blackPlayer.getAvailablePieces().size;
    const winner = document.querySelector(".winner") as HTMLHeadingElement;

    if (this.whitePlayer.getAvailableMoves() === 0) {
      if (this.whitePlayer.getIsChecked()) {
        winner!.textContent = "Black Win";
      } else {
        winner!.textContent = "Stale mate";
      }
    } else if (this.blackPlayer.getAvailableMoves() === 0) {
      if (this.blackPlayer.getIsChecked()) {
        winner!.textContent = "White Win";
      } else {
        winner!.textContent = "Stale mate";
      }
    } else {
      if (
        (whiteArmySize === 1 && blackArmySize === 1) ||
        (whiteArmySize === 16 && blackArmySize === 1) ||
        (whiteArmySize === 1 && blackArmySize === 16)
      ) {
        winner!.textContent = "Insufficient material";
      } else {
        // else if (whiteArmySize <= 3 || blackArmySize <= 3) {
        /*
      King vs king
      King + minor (bishop or knight) piece vs king
      Lone king vs all the pieces
      King + two knights vs king
      King + minor piece vs king + minor piece
      */

        let whiteBishopCount = 0;
        let blackBishopCount = 0;
        let whiteKnightCount = 0;
        let blackKnightCount = 0;
        for (const piece of this.whitePlayer.getAvailablePieces()) {
          if (piece[1] instanceof King) continue;
          if (piece[1] instanceof Knight) whiteKnightCount++;
          else if (piece[1] instanceof Bishop) whiteBishopCount++;
          else return;
        }
        for (const piece of this.blackPlayer.getAvailablePieces()) {
          if (piece[1] instanceof King) continue;
          if (piece[1] instanceof Knight) blackKnightCount++;
          else if (piece[1] instanceof Bishop) blackBishopCount++;
          else return;
        }
        const whiteMinorCount = whiteBishopCount + whiteKnightCount;
        const blackMinorCount = blackBishopCount + blackKnightCount;
        const kingPlusMinorVsKing: boolean =
          (whiteMinorCount === 1 && blackMinorCount === 0) ||
          (whiteMinorCount === 0 && blackMinorCount === 1);
        const kingPlusTwoKnightsVsKing: boolean =
          (whiteKnightCount === 2 &&
            whiteBishopCount === 0 &&
            blackMinorCount === 0) ||
          (blackKnightCount === 2 &&
            blackBishopCount === 0 &&
            whiteMinorCount === 0);
        const oneMinorPieceEach: boolean =
          whiteMinorCount === 1 && blackMinorCount === 1;
        if (
          kingPlusMinorVsKing ||
          kingPlusTwoKnightsVsKing ||
          oneMinorPieceEach
        ) {
          winner!.textContent = "Insufficient material";
        }
        //   if (
        //     (whiteMinorCount === 1 && blackMinorCount === 0) ||
        //     (whiteMinorCount === 0 && blackMinorCount === 1)
        //   ) {
        //     winner!.textContent = "Insufficient material";
        //   } else if (
        //     (whiteKnightCount === 2 &&
        //       whiteBishopCount === 0 &&
        //       blackMinorCount === 0) ||
        //     (blackKnightCount === 2 &&
        //       blackBishopCount === 0 &&
        //       whiteMinorCount === 0)
        //   ) {
        //     winner!.textContent = "Insufficient material";
        //   } else if (whiteMinorCount === 1 && blackMinorCount === 1) {
        //     winner!.textContent = "Insufficient material";
        //   }
      }
    }
  }
}

const game = new GameBoard();
function isUpperCase(charCode: number) {
  return charCode >= 65 && charCode <= 90;
}
function isDigit(charCode: number) {
  return charCode >= 48 && charCode <= 57;
}
