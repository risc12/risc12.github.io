import { Canvas, Numbers, Colors, Random, Noise, UI, repeat } from "../toolkit/index.js";

let ui = UI.init(true);

ui.resetableInputs([
  ['w', 'number', () => document.documentElement.clientWidth - document.getElementById('ui').clientWidth - 20],
  ['h', 'number', () => document.documentElement.clientHeight - 50],
  ['noise seed', 'number', () => Math.random()],
  ['sysAmt', 'number', () => Math.round(Random.between(1, 4))]
])

ui.addButton('Draw', () => {
  clear();
  draw();
});

function clear() {
  document.querySelectorAll('.piece').forEach(element => element.remove());
}

function draw() {
  const w = ui.getValue('w');
  const h = ui.getValue('h');
  const seed = ui.getValue('seed');
  const sysAmount = ui.getValue('sysAmt');

  const ctx = Canvas.create2D("", w, h);
  Noise.seed(seed);

  Canvas.drawRect(ctx, [0, 0], w, h, { fill: 'rgba(0,0,0,0)' });

  const amountOfSystems = sysAmount;

  let systems = [];

  function doRectanglesCollide(rect1, rect2) {
    return rect1.sx < rect2.sx + rect2.sw &&
      rect1.sx + rect1.sw > rect2.sx &&
      rect1.sy < rect2.sy + rect2.sh &&
      rect1.sy + rect1.sh > rect2.sy;
  }

  function createRectangle() {
    const ratio = Random.between(0.5, 1.5);
    const sw = Math.floor(Random.between(200, 600));
    const sh = Math.floor(sw * ratio);

    const sx = Random.between(0, w - sw);
    const sy = Random.between(0, h - sh);

    return { sx, sy, sw, sh };
  }

  function createNonCollidingRectangle() {
    let rect = createRectangle();

    let tries = 0;

    while(systems.find(system => doRectanglesCollide(system, rect))) {
      if(tries > 500) {
        return undefined;
      }

      const ratio = Random.between(0.5, 1.5);
      const sw = Math.floor(Random.between(200, 600));
      const sh = Math.floor(sw * ratio);

      const sx = Random.between(0, w - sw);
      const sy = Random.between(0, h - sh);

      rect = { sx, sy, sw, sh };

      rect = createRectangle();
    }

    return rect;
  }

  repeat(amountOfSystems, () => {
    const rect = createNonCollidingRectangle();
    if (rect === undefined) return;
    systems.push(rect);

    const {sw, sh, sx, sy} = rect;

    const img = ctx.getImageData(sx, sy, sw, sh);
    let noiseOffset = Random.between(10000, 100000);

    let hue = Random.between(0, 360);

    repeat(sw * sh, i => {
      let [x, y] = Numbers.indexToCoordinate(i, sw);

      let center = [sw / 2, sh / 2];
      let distance = Numbers.distance(center, [x, y]);
      let maxDistance = Numbers.distance(center, [0, w > h ? x : y ]);

      let normalizedDistance  = Numbers.map(distance, 0, maxDistance * 0.6, 0, 100);

      let pattern =  Numbers.map(Noise.perlin2((noiseOffset + x) / 100, (noiseOffset + y) / 100), -1, 1, 0, 100);
      let pattern2 = Numbers.map(Noise.perlin2((noiseOffset + x) / 50,  (noiseOffset + y) / 50),  -1, 1, 0, 100);
      let pattern3 = Numbers.map(Noise.perlin2((noiseOffset + x) / 25,  (noiseOffset + y) / 25),  -1, 1, 0, 100);
      let pattern4 = Numbers.map(Noise.perlin2((noiseOffset + x) / 10,  (noiseOffset + y) / 10),  -1, 1, 0, 100);


      let c = (
        (pattern * 4) +
        pattern2 +
        (pattern3 / 2) +
        (pattern4 / 6)
      ) / 4;


      c = Numbers.clamp(c, 0, 100);

      let a = Numbers.map(c - normalizedDistance, 0, 100, 0, 255);

      const [r, g, b] = Colors.hslToRgb(
        hue,
        100 - (c / 4),
        pattern - (normalizedDistance / 3)
      );

      img.data[(i * 4) + 0] = r;  // R value
      img.data[(i * 4) + 1] = g;  // G value
      img.data[(i * 4) + 2] = b;  // B value
      img.data[(i * 4) + 3] = a;
    });


    ctx.putImageData(img, sx, sy);
    Canvas.drawCircle(ctx, [sx + sw/2,  sy + sh/2], 3, { fill: Colors.grey(255, 0.7) });

  })

  const amountOfDimStars = 600;
  repeat(amountOfDimStars, () => {
    let x = Random.between(0, w);
    let y = Random.between(0, h);
    let r = Random.normal(1, 4, 4);

    let b = Random.normal(0.3, 0.3, 1);

    Canvas.drawCircle(ctx, [x,  y], r, { fill: Colors.grey(255, b) });
  });

  const amountOfStars = 200;
  repeat(amountOfStars, () => {
    let x = Random.between(0, w);
    let y = Random.between(0, h);
    let r = Random.normal(1, 4, 4);

    let mb = Numbers.map(r, 1, 4, 0, 1);
    let b = Random.normal(1, mb, 1);

    Canvas.drawCircle(ctx, [x,  y], r, { fill: Colors.grey(255, b) });
  });

  const amountOfBrightStars = Random.between(2, 10);
  repeat(amountOfBrightStars, () => {
    let x = Random.between(50, w - 50);
    let y = Random.between(50, h - 50);
    let r = Random.normal(2, 3, 1);

    let b = Random.normal(200, 255, 1);

    Canvas.drawCircle(ctx, [x,  y], r, { fill: Colors.grey(255, b) });
  });
}

draw(document.documentElement.clientWidth, document.documentElement.clientHeight);
