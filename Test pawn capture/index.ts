interface Piece {
  type: string;
  isWhite: boolean;
}
function changeCount(piece: Piece) {
  // const color = enemyPiece.isWhite ? "b" : "w";
  const countEl = document.getElementById(
    `$captured--${piece.type}-${piece.isWhite ? "w" : "b"}`
  ) as HTMLSpanElement;
  const oldClassName = countEl.classList[countEl.classList.length - 1];
  countEl.classList.remove(oldClassName);
  const newClassName = oldClassName.replace(
    oldClassName.charAt(18),
    String(Number(oldClassName.charAt(18)) + 1)
  );
  countEl.classList.add(newClassName);
}

// changeCount("pawnb");
// changeCount("pawnb");
// changeCount("pawnb");
// changeCount("pawnb");
// changeCount("bishopb");
// changeCount("bishopb");
// changeCount("knightb");
// changeCount("knightb");
// changeCount("rookb");
// changeCount("rookb");
// changeCount("queenb");
// changeCount("pawnw");
// changeCount("pawnw");
// changeCount("pawnw");
// changeCount("pawnw");
// changeCount("bishopw");
// changeCount("bishopw");
// changeCount("knightw");
// changeCount("knightw");
// changeCount("rookw");
// changeCount("rookw");
// changeCount("queenw");
