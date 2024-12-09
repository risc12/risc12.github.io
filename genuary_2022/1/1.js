import { Canvas, Random, Noise } from '../toolkit/index.js';

console.log('Hello!')

function first() {
  Noise.seed(Math.random());
  const ctx = Canvas.create2D('', 800, 800);

  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);  


  for(let i = 0; i < 10_000; i ++) {
    const location = [
      Random.normal() * W,
      Random.normal() * H,
    ];

    const size =  Random.normal(1,5);

    const hl = i > 9990;

    const gs = (Noise.perlin2(location[0], location[1]) + 0.5) / 2;

    const color = hl ? 'rgba(0, 255, 255, 1)' : `rgba(${gs * 255}, ${gs * 255}, ${gs * 50}, ${gs})`;

    Canvas.drawCircle(ctx, location, size, { stroke: color, lineWidth: 1 });
  }
}

first();
