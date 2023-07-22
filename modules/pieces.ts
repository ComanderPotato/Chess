import Player from "./Player.js";
type id = "king" | "rook" | "pawn" | "queen" | "knight" | "bishop";
type unicodeFigurine =
  | "&#9812"
  | "&#9813"
  | "&#9814"
  | "&#9815"
  | "&#9816"
  | "&#9817"
  | "&#9818"
  | "&#9819"
  | "&#9820"
  | "&#9821"
  | "&#9822"
  | "&#9823";
type Type = "incremental" | "positional";
export class Piece {
  private rank: number;
  private file: number;
  private image: string;
  private isWhite: boolean;
  private id: id;
  private legalMoves: [number, number][];
  private readonly type: Type;
  private readonly figuirineCode: unicodeFigurine;
  private availableMoves: [number, number][];
  private coords: string;
  private readonly pieceValue: number;
  private readonly charID: string;
  constructor(
    rank: number,
    file: number,
    isWhite: boolean,
    id: id,
    legalMoves: [number, number][],
    image: string,
    coords: string,
    pieceValue: number,
    figurineCode: unicodeFigurine,
    charID: string,
    type: Type
  ) {
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
  public isSameColor(targetPiece: Piece) {
    return this.isWhite === targetPiece.isWhite;
  }
  public isValid = (rank: number, file: number): boolean => {
    return rank >= 0 && rank < 8 && file >= 0 && file < 8;
  };
  public getAvailableMoves(): [number, number][] {
    return this.availableMoves;
  }
  public setAvailableMoves(updatedMoves: [number, number][]): void {
    this.availableMoves = updatedMoves;
  }
  public appendAvailableMoves(newMoves: [number, number][]): void {
    for (const move of newMoves) {
      this.availableMoves.push(move);
    }
  }
  public getRank(): number {
    return this.rank;
  }
  public setRank(newRank: number): void {
    this.rank = newRank;
  }
  public getFile(): number {
    return this.file;
  }
  public setFile(newFile: number): void {
    this.file = newFile;
  }
  public getIsWhite(): boolean {
    return this.isWhite;
  }
  public getlegalMoves(): [number, number][] {
    return this.legalMoves;
  }
  public getCoords(): string {
    return this.coords;
  }
  public setCoords(newCoords: string): void {
    this.coords = newCoords;
  }
  public getID(): string {
    return this.id;
  }
  public getImage(): string {
    return this.image;
  }
  public getType(): string {
    return this.type;
  }
  public getPieceValue(): number {
    return this.pieceValue;
  }
  public getFigurine(): string {
    return this.figuirineCode;
  }
  public getCharID(): string {
    return this.charID;
  }
  public setLegalMoves(newLegalMoves: [number, number][]): void {
    this.legalMoves = newLegalMoves;
  }

  public getValidMoves(board: (Piece | number)[][]): [number, number][] {
    const validMoves: [number, number][] = [];
    if (this instanceof incrementalPiece) {
      if (this instanceof Pawn) {
        for (const move of this.getlegalMoves()) {
          const newPositionX = this.getRank() + move[0];
          const newPositionY = this.getFile() + move[1];

          if (this.isValid(newPositionX, newPositionY)) {
            const newPosition = board[newPositionX][newPositionY];
            if (typeof newPosition === "number") {
              validMoves.push([newPositionX, newPositionY]);
            } else {
              break;
            }
          }
        }
        for (const move of this.getAttacks()) {
          const newPositionX = this.getRank() + move[0];
          const newPositionY = this.getFile() + move[1];
          if (this.isValid(newPositionX, newPositionY)) {
            const newPosition = board[newPositionX][newPositionY];
            if (
              newPosition instanceof Piece &&
              !this.isSameColor(newPosition)
            ) {
              validMoves.push([newPositionX, newPositionY]);
            } else {
              const possiblePawn = board[this.getRank()][newPositionY];
              if (
                possiblePawn instanceof Pawn &&
                possiblePawn.getCanEnPassant()
              ) {
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
          if (
            typeof newPosition === "number" ||
            !this.isSameColor(newPosition)
          ) {
            validMoves.push([newPositionX, newPositionY]);
          }
          if (newPosition instanceof Piece) {
            break;
          }
          newPositionX += moves[0];
          newPositionY += moves[1];
        }
      }
    } else {
      for (const moves of this.getlegalMoves()) {
        const newPositionX = this.getRank() + moves[0];
        const newPositionY = this.getFile() + moves[1];
        if (this.isValid(newPositionX, newPositionY)) {
          const newPosition = board[newPositionX][newPositionY];
          if (
            typeof newPosition === "number" ||
            !this.isSameColor(newPosition)
          ) {
            validMoves.push([newPositionX, newPositionY]);
          }
        }
      }
    }
    return validMoves;
  }
  public getLegalAttackMoves(board: (Piece | number)[][]): [number, number][] {
    const validMoves: [number, number][] = [];
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
          if (
            typeof newPosition === "number" ||
            this.isSameColor(newPosition)
          ) {
            validMoves.push([newPositionX, newPositionY]);
          }
          if (newPosition instanceof Piece && !(newPosition instanceof King)) {
            break;
          }
          newPositionX += moves[0];
          newPositionY += moves[1];
        }
      }
    } else {
      for (const moves of this.getlegalMoves()) {
        const newPositionX = this.getRank() + moves[0];
        const newPositionY = this.getFile() + moves[1];
        if (this.isValid(newPositionX, newPositionY)) {
          const newPosition = board[newPositionX][newPositionY];
          if (
            typeof newPosition === "number" ||
            this.isSameColor(newPosition)
          ) {
            validMoves.push([newPositionX, newPositionY]);
          }
        }
      }
    }
    return validMoves;
  }
}

export class positionalPiece extends Piece {
  constructor(
    rank: number,
    file: number,
    isWhite: boolean,
    id: id,
    legalMoves: [number, number][],
    image: string,
    coords: string,
    value: number,
    figurineCode: unicodeFigurine,
    charID: string
  ) {
    super(
      rank,
      file,
      isWhite,
      id,
      legalMoves,
      image,
      coords,
      value,
      figurineCode,
      charID,
      "positional"
    );
  }
}
export class incrementalPiece extends Piece {
  constructor(
    rank: number,
    file: number,
    isWhite: boolean,
    id: id,
    legalMoves: [number, number][],
    image: string,
    coords: string,
    value: number,
    figurineCode: unicodeFigurine,
    charID: string
  ) {
    super(
      rank,
      file,
      isWhite,
      id,
      legalMoves,
      image,
      coords,
      value,
      figurineCode,
      charID,
      "incremental"
    );
  }
}

export class Pawn extends incrementalPiece {
  private hadFirstMove;
  private legalAttackMoves: [number, number][];
  private availableAttackMoves: [number, number][];
  private canEnPassant: boolean;
  constructor(
    rank: number,
    file: number,
    isWhite: boolean,
    id: id,
    coords: string
  ) {
    const pieceValue = 1;
    const charID = isWhite ? "P" : "p";
    const [image, legalMoves]: [string, [number, number][]] = isWhite
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
    const figurineCode: unicodeFigurine = isWhite ? "&#9817" : "&#9823";
    super(
      rank,
      file,
      isWhite,
      id,
      legalMoves,
      image,
      coords,
      pieceValue,
      figurineCode,
      charID
    );
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
  public concatMoves(): void {
    this.setAvailableMoves(
      this.getAvailableMoves().concat(this.availableAttackMoves)
    );
  }

  public getAvailableAttackMoves(): [number, number][] {
    return this.availableAttackMoves;
  }
  public setAvailableAttackMoves(updatedAttackMoves: [number, number][]): void {
    this.availableAttackMoves = updatedAttackMoves;
  }
  public getHadFirstMove(): boolean {
    return this.hadFirstMove;
  }
  public getAttacks() {
    return this.legalAttackMoves;
  }
  public setCanEnPassant(canEnPassant: boolean): void {
    this.canEnPassant = canEnPassant;
  }
  public getCanEnPassant(): boolean {
    return this.canEnPassant;
  }
  public setHadFirstMove(): void {
    this.hadFirstMove = true;
    this.setLegalMoves(this.getlegalMoves().slice(0, 1));
  }
  public isPromotable(): boolean {
    if (this.getRank() === 0 || this.getRank() === 7) {
      return true;
    }
    return false;
  }
}
export class Queen extends incrementalPiece {
  constructor(
    rank: number,
    file: number,
    isWhite: boolean,
    id: id,
    coords: string
  ) {
    const pieceValue = 9;
    const charID = isWhite ? "Q" : "q";

    const image: string = isWhite
      ? "../assets/images/wq.png"
      : "../assets/images/bq.png";
    const figurineCode: unicodeFigurine = isWhite ? "&#9813" : "&#9819";

    const legalMoves: [number, number][] = [
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
      [0, 1],
      [-1, -1],
      [-1, 0],
      [-1, 1],
    ];
    super(
      rank,
      file,
      isWhite,
      id,
      legalMoves,
      image,
      coords,
      pieceValue,
      figurineCode,
      charID
    );
  }
}
export class King extends positionalPiece {
  private hadFirstMove;
  private canCastleKingSide;
  private canCastleQueenSide;
  constructor(
    rank: number,
    file: number,
    isWhite: boolean,
    id: id,
    coords: string
  ) {
    const pieceValue = 4;
    const charID = isWhite ? "K" : "k";
    const image: string = isWhite
      ? "../assets/images/wk.png"
      : "../assets/images/bk.png";
    const figurineCode: unicodeFigurine = isWhite ? "&#9812" : "&#9818";
    const legalMoves: [number, number][] = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [1, 1],
      [1, -1],
      [-1, -1],
      [-1, 1],
    ];
    super(
      rank,
      file,
      isWhite,
      id,
      legalMoves,
      image,
      coords,
      pieceValue,
      figurineCode,
      charID
    );
    this.hadFirstMove = false;
    this.canCastleKingSide = true;
    this.canCastleQueenSide = true;
  }
  public getHadFirstMove(): boolean {
    return this.hadFirstMove;
  }
  public setHadFirstMove(): void {
    // If had first move king cant castle
    this.hadFirstMove = true;
  }
  public getCanCastleKingSide(): boolean {
    return this.canCastleKingSide;
  }
  public getCanCastleQueenSide(): boolean {
    return this.canCastleQueenSide;
  }
  public getCastlableMoves(
    board: (Piece | number)[][],
    player: Player
  ): [number, number][] {
    if (this.hadFirstMove || player.getIsChecked()) return [];
    const castableMoves: [number, number][] = [];
    if (!this.getHadFirstMove()) {
      const availableRooks: Rook[] = [];
      for (const piece of player.getAvailablePieces().values()) {
        if (piece instanceof Rook && !piece.getHadFirstMove())
          availableRooks.push(piece);
        else continue;
      }
      for (const rook of availableRooks) {
        if (!rook.getHadFirstMove()) {
          let isRookCastable = true;
          const rooksX = rook.getRank();
          let rooksY = rook.getFile();
          const incrementer = rooksY < this.getFile() ? 1 : -1;
          do {
            rooksY += incrementer;
            if (
              player.getOpponentHeatMap()[rooksX][rooksY] === -1 ||
              (board[rooksX][rooksY] instanceof Piece &&
                !(board[rooksX][rooksY] instanceof King))
            ) {
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
  private hadFirstMove;
  constructor(
    rank: number,
    file: number,
    isWhite: boolean,
    id: id,
    coords: string
  ) {
    const pieceValue = 5;
    const charID = isWhite ? "R" : "r";

    const image: string = isWhite
      ? "../assets/images/wr.png"
      : "../assets/images/br.png";
    const figurineCode: unicodeFigurine = isWhite ? "&#9814" : "&#9820";

    const legalMoves: [number, number][] = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    super(
      rank,
      file,
      isWhite,
      id,
      legalMoves,
      image,
      coords,
      pieceValue,
      figurineCode,
      charID
    );
    this.hadFirstMove = false;
  }
  public getHadFirstMove(): boolean {
    return this.hadFirstMove;
  }
  public setHadFirstMove(): void {
    // If had first move rook cant castle
    this.hadFirstMove = true;
  }
}
export class Bishop extends incrementalPiece {
  constructor(
    rank: number,
    file: number,
    isWhite: boolean,
    id: id,
    coords: string
  ) {
    const pieceValue = 3;
    const charID = isWhite ? "B" : "b";

    const image: string = isWhite
      ? "../assets/images/wb.png"
      : "../assets/images/bb.png";
    const figurineCode: unicodeFigurine = isWhite ? "&#9815" : "&#9821";

    const legalMoves: [number, number][] = [
      [1, 1],
      [1, -1],
      [-1, -1],
      [-1, 1],
    ];
    super(
      rank,
      file,
      isWhite,
      id,
      legalMoves,
      image,
      coords,
      pieceValue,
      figurineCode,
      charID
    );
  }
}
export class Knight extends positionalPiece {
  constructor(
    rank: number,
    file: number,
    isWhite: boolean,
    id: id,
    coords: string
  ) {
    const pieceValue = 3;
    const image: string = isWhite
      ? "../assets/images/wn.png"
      : "../assets/images/bn.png";
    const charID = isWhite ? "N" : "n";
    const figurineCode: unicodeFigurine = isWhite ? "&#9816" : "&#9822";
    const legalMoves: [number, number][] = [
      [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
      [1, 2],
      [1, -2],
      [-1, 2],
      [-1, -2],
    ];
    super(
      rank,
      file,
      isWhite,
      id,
      legalMoves,
      image,
      coords,
      pieceValue,
      figurineCode,
      charID
    );
  }
}
