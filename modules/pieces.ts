type id = "king" | "rook" | "pawn" | "queen" | "knight" | "bishop";
export class Piece {
  x: number;
  y: number;
  image: string;
  isWhite: boolean;
  id: id;
  validMoves: number[][];
  constructor(
    x: number,
    y: number,
    isWhite: boolean,
    id: id,
    validMoves: number[][],
    image: string
  ) {
    this.x = x;
    this.y = y;
    this.isWhite = isWhite;
    this.id = id;
    this.validMoves = validMoves;
    this.image = image;
  }
  isValidMove(oldX: number, oldY: number, newX: number, newY: number) {
    for (let i = 0; i < this.validMoves.length; i++) {
      if (
        Number(oldX) + this.validMoves[i][0] == newX &&
        Number(oldY) + this.validMoves[i][1] == newY
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
  getValidMoves(): number[][] {
    return this.validMoves;
  }
}
export class Pawn extends Piece {
  hadFirstMove;
  specialMoves;
  constructor(x: number, y: number, isWhite: boolean, id: id) {
    let image: string;
    let validMoves: number[][];
    if (isWhite) {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/wp.png";
      validMoves = [
        [-1, 0],
        [-2, 0],
      ];
      super(x, y, isWhite, id, validMoves, image);
      this.specialMoves = [
        [-1, 1],
        [-1, -1],
      ];
    } else {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/bp.png";
      validMoves = [
        [1, 0],
        [2, 0],
      ];
      super(x, y, isWhite, id, validMoves, image);
      this.specialMoves = [
        [1, 1],
        [1, -1],
      ];
    }
    this.hadFirstMove = false;
  }
  getSpecialMoves() {
    return this.specialMoves;
  }
  getValidMoves() {
    if (this.hadFirstMove) {
      this.validMoves = this.validMoves.slice(0, 1);
    }
    return this.validMoves;
  }
}
export class Queen extends Piece {
  constructor(x: number, y: number, isWhite: boolean, id: id) {
    let image: string;
    if (isWhite) {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/wq.png";
    } else {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/bq.png";
    }
    let validMoves = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [0, 7],
      [0, 8],
      [-1, 0],
      [-2, 0],
      [-3, 0],
      [-4, 0],
      [-5, 0],
      [-6, 0],
      [-7, 0],
      [-8, 0],
      [0, -1],
      [0, -2],
      [0, -3],
      [0, -4],
      [0, -5],
      [0, -6],
      [0, -7],
      [0, -8],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [5, 0],
      [6, 0],
      [7, 0],
      [8, 0],
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
      [6, 6],
      [7, 7],
      [8, 8],
      [-1, 1],
      [-2, 2],
      [-3, 3],
      [-4, 4],
      [-5, 5],
      [-6, 6],
      [-7, 7],
      [-8, 8],
      [1, -1],
      [2, -2],
      [3, -3],
      [4, -4],
      [5, -5],
      [6, -6],
      [7, -7],
      [8, -8],
      [-1, -1],
      [-2, -2],
      [-3, -3],
      [-4, -4],
      [-5, -5],
      [-6, -6],
      [-7, -7],
      [-8, -8],
    ];
    super(x, y, isWhite, id, validMoves, image);
  }
}
export class King extends Piece {
  constructor(x: number, y: number, isWhite: boolean, id: id) {
    let image: string;
    if (isWhite) {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/wk.png";
    } else {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/bk.png";
    }
    let validMoves = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [1, 1],
      [1, -1],
      [-1, -1],
      [-1, 1],
    ];
    super(x, y, isWhite, id, validMoves, image);
  }
}
export class Rook extends Piece {
  constructor(x: number, y: number, isWhite: boolean, id: id) {
    let image: string;
    if (isWhite) {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/wr.png";
    } else {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/br.png";
    }
    let validMoves = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [0, 7],
      [0, 8],
      [-1, 0],
      [-2, 0],
      [-3, 0],
      [-4, 0],
      [-5, 0],
      [-6, 0],
      [-7, 0],
      [-8, 0],
      [0, -1],
      [0, -2],
      [0, -3],
      [0, -4],
      [0, -5],
      [0, -6],
      [0, -7],
      [0, -8],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [5, 0],
      [6, 0],
      [7, 0],
      [8, 0],
    ];
    super(x, y, isWhite, id, validMoves, image);
  }
}
export class Bishop extends Piece {
  constructor(x: number, y: number, isWhite: boolean, id: id) {
    let image: string;
    if (isWhite) {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/wb.png";
    } else {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/bb.png";
    }
    let validMoves = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
      [6, 6],
      [7, 7],
      [8, 8],
      [-1, 1],
      [-2, 2],
      [-3, 3],
      [-4, 4],
      [-5, 5],
      [-6, 6],
      [-7, 7],
      [-8, 8],
      [1, -1],
      [2, -2],
      [3, -3],
      [4, -4],
      [5, -5],
      [6, -6],
      [7, -7],
      [8, -8],
      [-1, -1],
      [-2, -2],
      [-3, -3],
      [-4, -4],
      [-5, -5],
      [-6, -6],
      [-7, -7],
      [-8, -8],
    ];
    super(x, y, isWhite, id, validMoves, image);
  }
}
export class Knight extends Piece {
  constructor(x: number, y: number, isWhite: boolean, id: id) {
    let image: string;
    if (isWhite) {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/wn.png";
    } else {
      image = "https://www.chess.com/chess-themes/pieces/neo/150/bn.png";
    }
    let validMoves = [
      [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
      [1, 2],
      [1, -2],
      [-1, 2],
      [-1, -2],
    ];
    super(x, y, isWhite, id, validMoves, image);
  }
}
