import { Piece, incrementalPiece, positionalPiece } from "./pieces";
export default class Player {
  isWhite: boolean;
  availablePieces: Map<string, Piece>;
  availableMoves: number = 0;
  isChecked: boolean = false;
  kingsPositions: [number, number];
  heatMap: number[][] = [];

  constructor(isWhite: boolean, kingsPosition: [number, number]) {
    this.isWhite = isWhite;
    this.kingsPositions = kingsPosition;
    this.availablePieces = new Map<string, Piece>();
  }

  public addPiece(piece: Piece): void {
    this.availablePieces.set(piece.coords, piece);
  }
  public updatePiece(piece: Piece): void {
    this.availablePieces.delete(piece.coords);
    const newCoords: string = this.getCoords(piece.x, piece.y);
    this.availablePieces.set(newCoords, piece);
    this.updateMoves();
  }
  public removePiece(piece: Piece): void {
    const piecesMoves = this.availablePieces.get(piece.coords)!.availableMoves
      .length;
    this.availablePieces.delete(piece.coords);
    this.updateMoves();
  }
  public updateMoves(): void {
    let updatedMoves = 0;
    this.availablePieces.forEach(
      (piece) => (updatedMoves += piece.availableMoves.length)
    );
    this.availableMoves = updatedMoves;
  }

  public getAvailablePieces(): Map<string, Piece> {
    return this.availablePieces;
  }
  public getAvailableMoves(): number {
    return this.availableMoves;
  }
  public getIsWhite(): boolean {
    return this.isWhite;
  }
  public getIsChecked(): boolean {
    return this.isChecked;
  }
  public setIsChecked(): void {
    this.isChecked = !this.isChecked;
  }
  public setKingsPosition(kingX: number, kingY: number): void {
    this.kingsPositions = [kingX, kingY];
  }
  public getKingsPosition(): [number, number] {
    return this.kingsPositions;
  }
  public getHeatMap(): number[][] {
    return this.heatMap;
  }
  public setHeatMap(heatMap: number[][]): void {
    this.heatMap = heatMap;
  }
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
