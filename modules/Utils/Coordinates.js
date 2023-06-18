export default function getCoords(x, y) {
    return getYAxis(y) + getXAxis(x);
}
function getXAxis(num) {
    return String(8 - num);
}
function getYAxis(num) {
    return String.fromCharCode(97 + num);
}
