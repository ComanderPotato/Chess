import getCoords from "./Utils/Coordinates.js";
export default class Player {
    constructor(isWhite, kingsPosition) {
        this.availableMoves = 0;
        this.isChecked = false;
        this.opponentHeatMap = [];
        this.isWhite = isWhite;
        this.kingsPositions = kingsPosition;
        this.availablePieces = new Map();
    }
    addPiece(piece) {
        this.availablePieces.set(piece.getCoords(), piece);
    }
    updatePiece(piece, oldCoords) {
        this.availablePieces.delete(oldCoords);
        const newCoords = getCoords(piece.getX(), piece.getY());
        this.availablePieces.set(newCoords, piece);
        this.updateMoves();
    }
    removePiece(piece) {
        this.availablePieces.delete(piece.getCoords());
        this.updateMoves();
    }
    updateMoves() {
        let updatedMoves = 0;
        this.availablePieces.forEach((piece) => (updatedMoves += piece.getAvailableMoves().length));
        this.availableMoves = updatedMoves;
    }
    getAvailablePieces() {
        return this.availablePieces;
    }
    getAvailableMoves() {
        return this.availableMoves;
    }
    getIsWhite() {
        return this.isWhite;
    }
    getIsChecked() {
        return this.isChecked;
    }
    setIsChecked(status) {
        this.isChecked = status;
    }
    setKingsPosition(kingX, kingY) {
        this.kingsPositions = [kingX, kingY];
    }
    getKingsPosition() {
        return this.kingsPositions;
    }
    getOpponentHeatMap() {
        return this.opponentHeatMap;
    }
    setOpponentHeatMap(updatedHeatMap) {
        this.opponentHeatMap = updatedHeatMap;
    }
}
