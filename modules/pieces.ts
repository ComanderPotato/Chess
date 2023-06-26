import Player from "./Player.js";
type id = "king" | "rook" | "pawn" | "queen" | "knight" | "bishop";
type Type = "incremental" | "positional";
export class Piece {
  private x: number;
  private y: number;
  private image: string;
  private isWhite: boolean;
  private id: id;
  private legalMoves: [number, number][];
  private type: Type;
  private availableMoves: [number, number][];
  private coords: string;
  constructor(
    x: number,
    y: number,
    isWhite: boolean,
    id: id,
    legalMoves: [number, number][],
    image: string,
    coords: string,
    type: Type
  ) {
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
    coords: string
  ) {
    super(x, y, isWhite, id, legalMoves, image, coords, "positional");
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
    coords: string
  ) {
    super(x, y, isWhite, id, legalMoves, image, coords, "incremental");
  }
}

export class Pawn extends incrementalPiece {
  private hadFirstMove;
  private legalAttackMoves: [number, number][];
  private availableAttackMoves: [number, number][];
  constructor(x: number, y: number, isWhite: boolean, id: id, coords: string) {
    const [image, legalMoves]: [string, [number, number][]] = isWhite
      ? [
          "https://www.chess.com/chess-themes/pieces/neo/150/wp.png",
          [
            [-1, 0],
            [-2, 0],
          ],
        ]
      : [
          "https://www.chess.com/chess-themes/pieces/neo/150/bp.png",
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
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wq.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/bq.png";

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
    super(x, y, isWhite, id, legalMoves, image, coords);
  }
}
export class King extends positionalPiece {
  hadFirstMove;
  constructor(x: number, y: number, isWhite: boolean, id: id, coords: string) {
    const image: string = isWhite
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wk.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/bk.png";

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
    super(x, y, isWhite, id, legalMoves, image, coords);
    this.hadFirstMove = false;
  }
  public getHadFirstMove(): boolean {
    return this.hadFirstMove;
  }
  public setHadFirstMove(): void {
    // If had first move king cant castle
    this.hadFirstMove = true;
  }
  public canCastle(board: (Piece | number)[][], player: Player): void {
    if (!this.getHadFirstMove()) {
      const availableRooks: Rook[] = [];
      for (const piece of player.getAvailablePieces().values()) {
        if (piece instanceof Rook && !piece.getHadFirstMove())
          availableRooks.push(piece);
        else continue;
      }
      for (const rook of availableRooks) {
        if (!rook.getHadFirstMove()) {
          console.log(rook);
        }
      }
    }
  }
}
export class Rook extends incrementalPiece {
  private hadFirstMove;
  constructor(x: number, y: number, isWhite: boolean, id: id, coords: string) {
    const image: string = isWhite
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wr.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/br.png";

    const legalMoves: [number, number][] = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    super(x, y, isWhite, id, legalMoves, image, coords);
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
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wb.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/bb.png";

    const legalMoves: [number, number][] = [
      [1, 1],
      [1, -1],
      [-1, -1],
      [-1, 1],
    ];
    super(x, y, isWhite, id, legalMoves, image, coords);
  }
}
export class Knight extends positionalPiece {
  constructor(x: number, y: number, isWhite: boolean, id: id, coords: string) {
    const image: string = isWhite
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wn.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/bn.png";

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
    super(x, y, isWhite, id, legalMoves, image, coords);
  }
}
