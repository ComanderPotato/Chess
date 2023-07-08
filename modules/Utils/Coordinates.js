export default function getCoords(x, y) {
    return getYAxis(y) + getXAxis(x);
}
export function getXAxis(num) {
    return String(8 - num);
}
export function getYAxis(num) {
    return String.fromCharCode(97 + num);
}
