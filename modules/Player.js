export default class Player {
    constructor(isWhite, kingsPosition) {
        this.availableMoves = 0;
        this.isChecked = false;
        this.heatMap = [];
        this.isWhite = isWhite;
        this.kingsPositions = kingsPosition;
        this.availablePieces = new Map();
    }
    addPiece(piece) {
        this.availablePieces.set(piece.coords, piece);
    }
    updatePiece(piece) {
        this.availablePieces.delete(piece.coords);
        const newCoords = this.getCoords(piece.x, piece.y);
        this.availablePieces.set(newCoords, piece);
        this.updateMoves();
    }
    removePiece(piece) {
        const piecesMoves = this.availablePieces.get(piece.coords).availableMoves
            .length;
        this.availablePieces.delete(piece.coords);
        this.updateMoves();
    }
    updateMoves() {
        let updatedMoves = 0;
        this.availablePieces.forEach((piece) => (updatedMoves += piece.availableMoves.length));
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
    setIsChecked() {
        this.isChecked = !this.isChecked;
    }
    setKingsPosition(kingX, kingY) {
        this.kingsPositions = [kingX, kingY];
    }
    getKingsPosition() {
        return this.kingsPositions;
    }
    getHeatMap() {
        return this.heatMap;
    }
    setHeatMap(heatMap) {
        this.heatMap = heatMap;
    }
    getXAxis(num) {
        return String(8 - num);
    }
    getYAxis(num) {
        return String.fromCharCode(97 + num);
    }
    getCoords(x, y) {
        return this.getYAxis(y) + this.getXAxis(x);
    }
}
