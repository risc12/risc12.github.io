export { default as UI } from './ui.js';
export { default as Noise } from './noise.js';
export { default as Vector } from './vector.js';

export const Canvas = {
  create2D(title, w = 300, h = 300) {
    const piece = document.createElement("div");
    const nameOfPiece = document.createElement("p");

    piece.classList.add("piece");

    nameOfPiece.innerText = title;

    const el = document.createElement("canvas");
    el.width = w;
    el.height = h;

    piece.append(el);
    piece.append(nameOfPiece);
    document.body.append(piece);

    return el.getContext("2d");
  },
  drawCircle(ctx, [x, y], radius, { fill, stroke, lineWidth }) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }

    if (stroke) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  },
  drawRect(ctx, [x, y], w, h, { fill, stroke, lineWidth }) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }

    if (stroke) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  },
  drawLine(ctx, [x1, y1], [x2, y2], { stroke, lineWidth, lineJoin = 'miter' }) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    if (stroke) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = stroke;
      ctx.lineJoin = lineJoin;
      ctx.stroke();
    }
  },
  drawPath(ctx, [first, ...coords], { stroke, lineWidth, lineJoin = 'miter'}) {
    ctx.beginPath();
    ctx.moveTo(first[0], first[1]);

    coords.forEach(([x, y]) => {
      ctx.lineTo(x, y); 
    });

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = stroke;
    ctx.lineJoin = lineJoin;

    ctx.stroke();
    ctx.closePath();
  }
};

export const Random = {
  normal(min = 0, max = 1, skew = 1) {
    min = min || 0;
    max = max || 1;
    skew = skew || 1;

    let u = 0,
      v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = Random.normal(min, max, skew);
    // resample between 0 and 1 if out of range
    else {
      num = Math.pow(num, skew); // Skew
      num *= max - min; // Stretch to fill range
      num += min; // offset to min
    }
    return num;
  },
  between(from, to) {
    return Numbers.map(Math.random(), 0, 1, from, to);
  },
};

export const Numbers = {
  map(val, minIn, maxIn, minOut, maxOut) {
    return ((val - minIn) * (maxOut - minOut)) / (maxIn - minIn) + minOut;
  },
  indexToCoordinate(index, width) {
    // convert index of 1 dimensional array to coordinate
    return [index % width, Math.floor(index / width)];
  },
  distance(pointA, pointB) {
    return Math.sqrt(
      Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2)
    );
  },
  clamp(num, min, max) {
    return Math.min(Math.max(num, min), max)
  }
};

export const Colors = {
  luminance([r, g, b]) {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },
  grey(v = 100, a = 1) {
    return `rgba(${v}, ${v}, ${v}, ${a})`;
  },
  /**
   * Returns CSS string for HSL-color
   * @param {number} hue degrees (0 - 360)
   * @param {number} saturation percentage
   * @param {number} lightness, percentage
   * @param {number} alpha, percentage
   * @returns {string}
   */
  hsl(hue, saturation, lightness, alpha = 100) {
    return `hsl(${hue}, ${saturation}%, ${lightness}%, ${alpha}%)`;
  },
  /**
   * Returns CSS string for HSL-color
   * @param {number} hue degrees (0 - 360)
   * @param {number} saturation percentage
   * @param {number} lightness, percentage
   * @param {number} alpha, percentage
   * @author Thanks to https://css-tricks.com/converting-color-spaces-in-javascript/
   * @returns {string}
   */
  hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
      m = l - c / 2,
      r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (300 <= h && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b];
  },
  mixRGBA(base, added) {
    var mix = [];
    mix[3] = 1 - (1 - added[3]) * (1 - base[3]); // alpha
    mix[0] = Math.round(
      (added[0] * added[3]) / mix[3] +
        (base[0] * base[3] * (1 - added[3])) / mix[3]
    ); // red
    mix[1] = Math.round(
      (added[1] * added[3]) / mix[3] +
        (base[1] * base[3] * (1 - added[3])) / mix[3]
    ); // green
    mix[2] = Math.round(
      (added[2] * added[3]) / mix[3] +
        (base[2] * base[3] * (1 - added[3])) / mix[3]
    ); // blue

    return mix;
  },
};

export function repeat(amt, fn) {
  for (let i = 0; i < amt; i++) {
    fn(i);
  }
}
