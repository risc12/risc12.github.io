import { Canvas, Numbers, Colors, Noise, UI, Vector } from "../toolkit/index.js";

let ui = UI.init(false);

ui.resetableInputs([
  ['w', 'number', () => document.documentElement.clientWidth - document.getElementById('ui').clientWidth - 20],
  ['h', 'number', () => document.documentElement.clientHeight - 50],
  ['t', 'range', () => 0, {min: 1, max: 500, step: 0.001}],
  ['seed', 'range', () => (Math.random()), { min: 0, max: 1, step: 0.0001 }],
  ['res', 'range', () => 20, {min: 1, max: 50}],
  ['noiseRes', 'range', () => 50, {min: 1, max: 50}],
  ['showGrid', 'range', () => 0, {min: 0, max: 1}],
  ['steps', 'range', () => 100, { min: 1, max: 100, step: 1 }],
  ['particles', 'range', () => 70, {min: 1, max: 1000}],

])

function clearAndDraw() {
  clear();
  draw();
}

ui.onChange(clearAndDraw);

ui.addButton('Draw', clearAndDraw);

const w = ui.getValue('w');
const h = ui.getValue('h');
const ctx = Canvas.create2D("", w, h);


function clear() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

class Particle {
  constructor(c, v) {
    this.c = c;
    this.v = v;
  }

  get x() {
    return this.c.x;
  }

  get y() {
    return this.c.y;
  }

  set x(val) {
    this.c.x = val;
  }

  set y(val) {
    this.c.y = val;
  }

  update() {
    this.c.x += this.v[0];
    this.c.y += this.v[1];

    this.v = Vector.v2(0, 0);
  }

  addForce(f) {
    this.v = Vector.v2(this.v.x + f.x, this.v.y + f.y);
  }
}

function draw() {
  const t = ui.getValue('t');
  const steps = ui.getValue('steps');
  const showGrid = ui.getValue('showGrid') == 1;

  const res = Math.max(1, ui.getValue('res'));
  const noiseRes = Math.max(1, ui.getValue('noiseRes'));
  const particles = ui.getValue('particles');


  const seed = ui.getValue('seed');
  Noise.seed(seed);

  Canvas.drawRect(ctx, [0, 0], w, h, { fill: 'rgba(0,0,0,0)' });

  const angleAt = (x, y, z = t) => Numbers.map(Noise.perlin3(x / noiseRes, y / noiseRes, z), -1, 1, 0, Math.PI * 2);
  const vectorAt = (x, y, z = t) => Vector.fromAngle(angleAt(x, y, z));


  if (showGrid) {
    for(let x = 0; x < Math.floor(w / res); x++) {
      for(let y = 0; y < Math.floor(h / res); y++) {
        const x1 = x * res;
        const y1 = y * res;

        let v = vectorAt(x, y)

        Canvas.drawLine(ctx, [x1, y1], [x1 + v.x * 10, y1 + v.y * 10], {
          stroke: 'white',
          lineWidth: 1,
        });

        Canvas.drawCircle(ctx, [x1, y1], 1, { fill: Numbers.map(Noise.perlin2(x / 10, y / 10), -1, 1, 0, 1) > 0.5 ? '#fff' : '#000' });
      }
    }
  }

  for (let p = 0; p < particles; p++) {
    let particle = new Particle(
      Vector.v2(w/res, (h/res) - p),
      Vector.v2(0, 0)
    );

    const path = [
      [particle.x * res, particle.y * res]
    ]

    for (let s = 0; s < steps; s++) {
      const x = particle.x;
      const y = particle.y;

      const f = vectorAt(x, y);

      particle.addForce(f);
      particle.update();

      path.push([particle.x * res, particle.y * res]);
    }

    Canvas.drawPath(ctx, path, { stroke: Colors.hsl(p * 2.6, 100, 50), lineWidth: '3' });
  }

}

draw();

let playing = false;

function animate() {
  if (!playing) return;

  ui.setValue('t', parseFloat(ui.getValue('t')) + 0.005)


  let particles = parseInt(ui.getValue('particles'));

  console.log(particles);

  if (particles < 70) {
    ui.setValue('particles', particles + 1)
  }

  clearAndDraw();

  requestAnimationFrame(() => {
    animate();
  })
}

document.querySelector('canvas').addEventListener('click', () => {
  playing = !playing;

  let m = document.querySelector('#message');
  if (m) m.remove();

  ui.setValue('particles', 1);

  if (playing) animate();
})
