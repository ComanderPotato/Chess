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
  private x: number;
  private y: number;
  private image: string;
  private isWhite: boolean;
  private id: id;
  private legalMoves: [number, number][];
  private readonly type: Type;
  private readonly figuirineCode: unicodeFigurine;
  private availableMoves: [number, number][];
  private coords: string;
  private readonly value: number;
  constructor(
    x: number,
    y: number,
    isWhite: boolean,
    id: id,
    legalMoves: [number, number][],
    image: string,
    coords: string,
    value: number,
    figurineCode: unicodeFigurine,
    type: Type
  ) {
    this.x = x;
    this.y = y;
    this.isWhite = isWhite;
    this.id = id;
    this.legalMoves = legalMoves;
    this.image = image;
    this.coords = coords;
    this.value = value;
    this.type = type;
    this.figuirineCode = figurineCode;

    this.availableMoves = [];
  }
  public isSameColor(targetPiece: Piece) {
    return this.isWhite === targetPiece.isWhite;
  }
  public isValid = (posX: number, posY: number): boolean => {
    return posX >= 0 && posX < 8 && posY >= 0 && posY < 8;
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
  public getX(): number {
    return this.x;
  }
  public setX(newX: number): void {
    this.x = newX;
  }
  public getY(): number {
    return this.y;
  }
  public setY(newY: number): void {
    this.y = newY;
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
  public getValue(): number {
    return this.value;
  }
  public getFigurine(): string {
    return this.figuirineCode;
  }
  public setLegalMoves(newLegalMoves: [number, number][]): void {
    this.legalMoves = newLegalMoves;
  }

  public getValidMoves(board: (Piece | number)[][]): [number, number][] {
    const validMoves: [number, number][] = [];
    if (this instanceof incrementalPiece) {
      if (this instanceof Pawn) {
        for (const move of this.getlegalMoves()) {
          const newPositionX = this.getX() + move[0];
          const newPositionY = this.getY() + move[1];

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
          const newPositionX = this.getX() + move[0];
          const newPositionY = this.getY() + move[1];
          if (this.isValid(newPositionX, newPositionY)) {
            const newPosition = board[newPositionX][newPositionY];
            if (
              newPosition instanceof Piece &&
              !this.isSameColor(newPosition)
            ) {
              validMoves.push([newPositionX, newPositionY]);
            } else {
              const possiblePawn = board[this.getX()][newPositionY];
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
        let newPositionX = this.getX() + moves[0];
        let newPositionY = this.getY() + moves[1];
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
        const newPositionX = this.getX() + moves[0];
        const newPositionY = this.getY() + moves[1];
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
        const newPositionX = this.getX() + moves[0];
        const newPositionY = this.getY() + moves[1];
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
    x: number,
    y: number,
    isWhite: boolean,
    id: id,
    legalMoves: [number, number][],
    image: string,
    coords: string,
    value: number,
    figurineCode: unicodeFigurine
  ) {
    super(
      x,
      y,
      isWhite,
      id,
      legalMoves,
      image,
      coords,
      value,
      figurineCode,
      "positional"
    );
  }
}
export class incrementalPiece extends Piece {
  constructor(
    x: number,
    y: number,
    isWhite: boolean,
    id: id,
    legalMoves: [number, number][],
    image: string,
    coords: string,
    value: number,
    figurineCode: unicodeFigurine
  ) {
    super(
      x,
      y,
      isWhite,
      id,
      legalMoves,
      image,
      coords,
      value,
      figurineCode,
      "incremental"
    );
  }
}

export class Pawn extends incrementalPiece {
  private hadFirstMove;
  private legalAttackMoves: [number, number][];
  private availableAttackMoves: [number, number][];
  private canEnPassant: boolean;
  constructor(x: number, y: number, isWhite: boolean, id: id, coords: string) {
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
    super(x, y, isWhite, id, legalMoves, image, coords, 1, figurineCode);
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
    if (this.getX() === 0 || this.getX() === 7) {
      return true;
    }
    return false;
  }
}
export class Queen extends incrementalPiece {
  constructor(x: number, y: number, isWhite: boolean, id: id, coords: string) {
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
    super(x, y, isWhite, id, legalMoves, image, coords, 9, figurineCode);
  }
}
export class King extends positionalPiece {
  hadFirstMove;
  constructor(x: number, y: number, isWhite: boolean, id: id, coords: string) {
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
    super(x, y, isWhite, id, legalMoves, image, coords, 4, figurineCode);
    this.hadFirstMove = false;
  }
  public getHadFirstMove(): boolean {
    return this.hadFirstMove;
  }
  public setHadFirstMove(): void {
    // If had first move king cant castle
    this.hadFirstMove = true;
  }
  public getCastlableMoves(
    board: (Piece | number)[][],
    player: Player
  ): [number, number][] {
    if (this.hadFirstMove) return [];
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
          const rooksX = rook.getX();
          let rooksY = rook.getY();
          const incrementer = rooksY < this.getY() ? 1 : -1;
          do {
            rooksY += incrementer;
            if (
              player.getOpponentHeatMap()[rooksX][rooksY] === -1 ||
              (board[rooksX][rooksY] instanceof Piece &&
                !(board[rooksX][rooksY] instanceof King))
            ) {
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
  private hadFirstMove;
  constructor(x: number, y: number, isWhite: boolean, id: id, coords: string) {
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
    super(x, y, isWhite, id, legalMoves, image, coords, 5, figurineCode);
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
  constructor(x: number, y: number, isWhite: boolean, id: id, coords: string) {
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
    super(x, y, isWhite, id, legalMoves, image, coords, 3, figurineCode);
  }
}
export class Knight extends positionalPiece {
  constructor(x: number, y: number, isWhite: boolean, id: id, coords: string) {
    const image: string = isWhite
      ? "../assets/images/wn.png"
      : "../assets/images/bn.png";
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
    super(x, y, isWhite, id, legalMoves, image, coords, 3, figurineCode);
  }
}
