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
  constructor(
    x: number,
    y: number,
    isWhite: boolean,
    id: id,
    legalMoves: number[][],
    image: string,
    type: Type
  ) {
    this.x = x;
    this.y = y;
    this.isWhite = isWhite;
    this.id = id;
    this.legalMoves = legalMoves;
    this.image = image;
    this.type = type;
  }
  public isSameColor(targetPiece: Piece) {
    return this.isWhite === targetPiece.isWhite;
  }
  public isValid = (posX: number, posY: number): boolean => {
    return posX >= 0 && posX < 8 && posY >= 0 && posY < 8;
  };

  isValidMove1(oldX: number, oldY: number, newX: number, newY: number) {
    for (let i = 0; i < this.legalMoves.length; i++) {
      if (
        Number(oldX) + this.legalMoves[i][0] == newX &&
        Number(oldY) + this.legalMoves[i][1] == newY
      ) {
        return true;
      }
    }
    return false;
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
}

export class positionalPiece extends Piece {
  constructor(
    x: number,
    y: number,
    isWhite: boolean,
    id: id,
    legalMoves: number[][],
    image: string
  ) {
    super(x, y, isWhite, id, legalMoves, image, "positional");
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
    image: string
  ) {
    super(x, y, isWhite, id, legalMoves, image, "incremental");
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
  constructor(x: number, y: number, isWhite: boolean, id: id) {
    let image: string;
    let legalMoves: number[][];
    if (isWhite) {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/wp.png";
      legalMoves = [
        [-1, 0],
        [-2, 0],
      ];
      super(x, y, isWhite, id, legalMoves, image);
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
      super(x, y, isWhite, id, legalMoves, image);
      this.attackMoves = [
        [1, 1],
        [1, -1],
      ];
    }
    this.hadFirstMove = false;
  }
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
        let newPosition = board[newPositionX][newPositionY];
        if (typeof newPosition !== "number" && !this.isSameColor(newPosition)) {
          attackMoves.push([newPositionX, newPositionY]);
        }
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
    let cutOff;
    if (this.hadFirstMove) {
      cutOff = 1;
    } else {
      cutOff = 2;
    }
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
  constructor(x: number, y: number, isWhite: boolean, id: id) {
    let image: string;
    if (isWhite) {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/wq.png";
    } else {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/bq.png";
    }
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
    super(x, y, isWhite, id, legalMoves, image);
  }
}
export class King extends positionalPiece {
  hadFirstMove;
  constructor(x: number, y: number, isWhite: boolean, id: id) {
    let image: string;
    if (isWhite) {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/wk.png";
    } else {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/bk.png";
    }
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
    super(x, y, isWhite, id, legalMoves, image);
    this.hadFirstMove = false;
  }
}
export class Rook extends incrementalPiece {
  hadFirstMove;
  constructor(x: number, y: number, isWhite: boolean, id: id) {
    let image: string;
    if (isWhite) {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/wr.png";
    } else {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/br.png";
    }
    let legalMoves = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    super(x, y, isWhite, id, legalMoves, image);
    this.hadFirstMove = false;
  }
}
export class Bishop extends incrementalPiece {
  constructor(x: number, y: number, isWhite: boolean, id: id) {
    let image: string;
    if (isWhite) {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/wb.png";
    } else {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/bb.png";
    }
    let legalMoves = [
      [1, 1],
      [1, -1],
      [-1, -1],
      [-1, 1],
    ];
    super(x, y, isWhite, id, legalMoves, image);
  }
}
export class Knight extends positionalPiece {
  constructor(x: number, y: number, isWhite: boolean, id: id) {
    let image: string;
    if (isWhite) {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/wn.png";
    } else {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/bn.png";
    }
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
    super(x, y, isWhite, id, legalMoves, image);
  }
}
