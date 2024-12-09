export default {
  v2(x, y) {
    let v = [x, y]
    v.x = x;
    v.y = y;

    return v;
  },
  fromAngle(angle) {
    return this.v2(Math.cos(angle), Math.sin(angle));
  },
}
