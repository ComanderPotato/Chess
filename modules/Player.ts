import { Piece, incrementalPiece, positionalPiece } from "./pieces";
import getCoords from "./Utils/Coordinates.js";
export default class Player {
  private isWhite: boolean;
  private availablePieces: Map<string, Piece>;
  private availableMoves: number = 0;
  private isChecked: boolean = false;
  private kingsPositions: [number, number];
  private opponentHeatMap: number[][] = [];

  constructor(isWhite: boolean, kingsPosition: [number, number]) {
    this.isWhite = isWhite;
    this.kingsPositions = kingsPosition;
    this.availablePieces = new Map<string, Piece>();
  }

  public addPiece(piece: Piece): void {
    this.availablePieces.set(piece.getCoords(), piece);
  }
  public updatePiece(piece: Piece, oldCoords: string): void {
    this.availablePieces.delete(oldCoords);
    const newCoords: string = getCoords(piece.getX(), piece.getY());
    this.availablePieces.set(newCoords, piece);
    this.availableMoves += piece.getAvailableMoves().length;
  }
  public removePiece(piece: Piece): void {
    this.availablePieces.delete(piece.getCoords());
    this.updateMoves();
  }
  // public resetAvailableMoves(): void {
  //   this.availableMoves = 0;
  // }
  public updateMoves(): void {
    let updatedMoves = 0;
    this.availablePieces.forEach(
      (piece) => (updatedMoves += piece.getAvailableMoves().length)
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
  public setIsChecked(status: boolean): void {
    this.isChecked = status;
  }
  public setKingsPosition(kingX: number, kingY: number): void {
    this.kingsPositions = [kingX, kingY];
  }
  public getKingsPosition(): [number, number] {
    return this.kingsPositions;
  }
  public getOpponentHeatMap(): number[][] {
    return this.opponentHeatMap;
  }
  public setOpponentHeatMap(updatedHeatMap: number[][]): void {
    this.opponentHeatMap = updatedHeatMap;
  }
}
