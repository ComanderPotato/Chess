import { Piece, King } from "./pieces";
import getCoords from "./Utils/Coordinates.js";
import Timer from "./Timer.js";
export default class Player {
  private isWhite: boolean;
  private availablePieces: Map<string, Piece>;
  private availableMoves: number = 0;
  private isChecked: boolean = false;
  private kingsPositions: [number, number];
  private opponentHeatMap: number[][] = [];
  private playersTimer: Timer;
  constructor(isWhite: boolean, kingsPosition: [number, number]) {
    this.isWhite = isWhite;
    this.kingsPositions = kingsPosition;
    this.availablePieces = new Map<string, Piece>();
    this.playersTimer = new Timer(10, isWhite);
  }
  public getPlayersTimer(): Timer {
    return this.playersTimer;
  }
  public addPiece(piece: Piece): void {
    this.availablePieces.set(piece.getCoords(), piece);
  }
  public updatePiece(piece: Piece, oldCoords: string): void {
    this.availablePieces.delete(oldCoords);
    const newCoords: string = getCoords(piece.getRank(), piece.getFile());
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
  public canCastle(board: (number | Piece)[][]) {
    const king = this.getAvailablePieces().get(
      getCoords(this.kingsPositions[0], this.kingsPositions[1])
    ) as King;
    king.getCastlableMoves(board, this);
    // const moves = king.getCastableMoves(board, this);
    // return moves;
  }
  public createNewTimer() {
    this.playersTimer.resetTimer();
  }
}
