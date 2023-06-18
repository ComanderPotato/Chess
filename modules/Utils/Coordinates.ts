export default function getCoords(x: number, y: number): string {
  return getYAxis(y) + getXAxis(x);
}
function getXAxis(num: number) {
  return String(8 - num);
}
function getYAxis(num: number) {
  return String.fromCharCode(97 + num);
}
