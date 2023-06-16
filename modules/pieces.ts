type id = "king" | "rook" | "pawn" | "queen" | "knight" | "bishop";
type Type = "incremental" | "positional";
export class Piece {
  x: number;
  y: number;
  image: string;
  isWhite: boolean;
  id: id;
  legalMoves: number[][];
  type: Type;
  availableMoves: number[][];
  coords: string;
  constructor(
    x: number,
    y: number,
    isWhite: boolean,
    id: id,
    legalMoves: number[][],
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
  public getAvailableMoves(): number[][] {
    return this.availableMoves;
  }
  public setAvailableMoves(updatedMoves: number[][]): void {
    this.availableMoves = updatedMoves;
  }
  public getX(): number {
    return this.x;
  }
  public getY(): number {
    return this.y;
  }
  getlegalMoves(): number[][] {
    return this.legalMoves;
  }
  public getCoords(): string {
    return "";
  }
}

export class positionalPiece extends Piece {
  constructor(
    x: number,
    y: number,
    isWhite: boolean,
    id: id,
    legalMoves: number[][],
    image: string,
    coords: string
  ) {
    super(x, y, isWhite, id, legalMoves, image, coords, "positional");
  }
  public getValidMoves(
    posX: number,
    posY: number,
    board: (Piece | number)[][]
  ): [number, number][] {
    const validMoves: [number, number][] = [];
    for (let i = 0; i < this.legalMoves.length; i++) {
      let newPositionX = Number(posX + this.legalMoves[i][0]);
      let newPositionY = Number(posY + this.legalMoves[i][1]);
      if (this.isValid(newPositionX, newPositionY)) {
        let newPosition = board[newPositionX][newPositionY];
        if (typeof newPosition === "number" || !this.isSameColor(newPosition)) {
          validMoves.push([newPositionX, newPositionY]);
        }
      }
    }
    return validMoves;
  }
}
export class incrementalPiece extends Piece {
  constructor(
    x: number,
    y: number,
    isWhite: boolean,
    id: id,
    legalMoves: number[][],
    image: string,
    coords: string
  ) {
    super(x, y, isWhite, id, legalMoves, image, coords, "incremental");
  }
  public getValidMoves(
    posX: number,
    posY: number,
    board: (Piece | number)[][]
  ): [number, number][] {
    const validMoves: [number, number][] = [];
    for (let i = 0; i < this.legalMoves.length; i++) {
      let initalPosX = posX;
      let initalPosY = posY;
      while (
        this.isValid(
          Number(initalPosX + this.legalMoves[i][0]),
          Number(initalPosY + this.legalMoves[i][1])
        )
      ) {
        let newPositionX = Number(initalPosX + this.legalMoves[i][0]);
        let newPositionY = Number(initalPosY + this.legalMoves[i][1]);
        let newPosition = board[newPositionX][newPositionY];
        if (typeof newPosition === "number") {
          validMoves.push([newPositionX, newPositionY]);
          initalPosX = newPositionX;
          initalPosY = newPositionY;
        } else if (this.isSameColor(newPosition)) {
          break;
        } else {
          validMoves.push([newPositionX, newPositionY]);
          break;
        }
      }
    }
    return validMoves;
  }
}

export class Pawn extends incrementalPiece {
  hadFirstMove;
  attackMoves;
  constructor(x: number, y: number, isWhite: boolean, id: id, coords: string) {
    let image: string;
    let legalMoves: number[][];
    if (isWhite) {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/wp.png";
      legalMoves = [
        [-1, 0],
        [-2, 0],
      ];
      super(x, y, isWhite, id, legalMoves, image, coords);
      this.attackMoves = [
        [-1, 1],
        [-1, -1],
      ];
    } else {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/bp.png";
      legalMoves = [
        [1, 0],
        [2, 0],
      ];
      super(x, y, isWhite, id, legalMoves, image, coords);
      this.attackMoves = [
        [1, 1],
        [1, -1],
      ];
    }
    this.hadFirstMove = false;
  }

  // public getMoves(posX: number, posY: number, board: (number | Piece)[][]) {
  //   const attackMoves: [number, number][] = [];

  // }
  public getAttackMoves(
    posX: number,
    posY: number,
    board: (number | Piece)[][]
  ) {
    const attackMoves: [number, number][] = [];
    for (let i = 0; i < this.attackMoves.length; i++) {
      if (
        this.isValid(
          Number(posX + this.attackMoves[i][0]),
          Number(posY + this.attackMoves[i][1])
        )
      ) {
        let newPositionX = Number(posX + this.attackMoves[i][0]);
        let newPositionY = Number(posY + this.attackMoves[i][1]);
        attackMoves.push([newPositionX, newPositionY]);
      }
    }
    return attackMoves;
  }
  public getValidMoves(
    posX: number,
    posY: number,
    board: (number | Piece)[][]
  ): [number, number][] {
    const validMoves: [number, number][] = [];
    const cutOff = this.hadFirstMove ? 1 : 2;
    for (let i = 0; i < cutOff; i++) {
      if (
        this.isValid(
          Number(posX + this.legalMoves[i][0]),
          Number(posY + this.legalMoves[i][1])
        )
      ) {
        let newPositionX = Number(posX + this.legalMoves[i][0]);
        let newPositionY = Number(posY + this.legalMoves[i][1]);
        let newPosition = board[newPositionX][newPositionY];
        if (typeof newPosition === "number") {
          validMoves.push([newPositionX, newPositionY]);
        } else {
          break;
        }
      }
    }
    for (let i = 0; i < this.attackMoves.length; i++) {
      if (
        this.isValid(
          Number(posX + this.attackMoves[i][0]),
          Number(posY + this.attackMoves[i][1])
        )
      ) {
        let newPositionX = Number(posX + this.attackMoves[i][0]);
        let newPositionY = Number(posY + this.attackMoves[i][1]);
        let newPosition = board[newPositionX][newPositionY];
        if (typeof newPosition !== "number" && !this.isSameColor(newPosition)) {
          validMoves.push([newPositionX, newPositionY]);
        }
      }
    }
    return validMoves;
  }
}
export class Queen extends incrementalPiece {
  constructor(x: number, y: number, isWhite: boolean, id: id, coords: string) {
    let image: string = isWhite
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wq.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/bq.png";

    let legalMoves = [
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
    let image: string = isWhite
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wk.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/bk.png";

    let legalMoves = [
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
}
export class Rook extends incrementalPiece {
  hadFirstMove;
  constructor(x: number, y: number, isWhite: boolean, id: id, coords: string) {
    let image: string = isWhite
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wr.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/br.png";

    let legalMoves = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    super(x, y, isWhite, id, legalMoves, image, coords);
    this.hadFirstMove = false;
  }
}
export class Bishop extends incrementalPiece {
  constructor(x: number, y: number, isWhite: boolean, id: id, coords: string) {
    let image: string = isWhite
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wb.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/bb.png";

    let legalMoves = [
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
    let image: string = isWhite
      ? "https://www.chess.com/chess-themes/pieces/neo/150/wn.png"
      : "https://www.chess.com/chess-themes/pieces/neo/150/bn.png";

    let legalMoves = [
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
