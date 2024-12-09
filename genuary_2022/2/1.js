import { Canvas, Numbers, Colors } from "../toolkit/index.js";

console.log("Hello!");

function draw(imageUrl, w, h) {
  const ctx = Canvas.create2D("", w * 3, h * 3);

  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  const image = new Image();

  image.onload = function () {
    ctx.drawImage(this, 0, 0);

    const imageData = ctx.getImageData(0, 0, W, H);

    Canvas.drawRect(ctx, [0, 0], W, H, { fill: '#222'});

    let rgbaAt = (x, y) => {
      const index = (x + y * W) * 4;

      return [
        imageData.data[index],
        imageData.data[index + 1],
        imageData.data[index + 2],
        imageData.data[index + 3]
      ];
    };

    for(let y = 0; y < h; y++) {
      for(let x = 0; x < w; x++){

        if(y % 3 !== 0 || x % 3 !== 0) {
          continue;
        }

        let neighbours = [
          [x - 1, y - 1],
          //[x,     y - 1],
          [x + 1, y - 1],
          //[x - 1, y    ],
          //[x + 1, y    ],
          [x - 1, y + 1],
          //[x    , y + 1],
          [x + 1, y + 1]
        ];

        let brightest = [x, y, 0];

        let closest = [x + 1, y + 1,  Colors.luminance(rgbaAt(x + 1, y + 1))];
        let nearestDistance = Math.abs(Colors.luminance(rgbaAt(x, y)) - closest[2]);

        let luminance = (neighbours
          .map(([x, y]) =>
            [
              x,
              y,
              Colors.luminance(rgbaAt(x, y))
            ]
          )
          .reduce((acc, [x, y, l]) => {
            if(l > brightest[2]) {
              brightest = [x, y, l];
            }

            let distance = Math.abs(l - closest[2]);
            if(distance < nearestDistance) {
              closest = [x, y, l];
              nearestDistance = distance;
            }

            return l + acc;
          }, 0)) / 4;


        const radius = Numbers.map(luminance, 0, 255, 0, 3);

        // console.log(brightest[2])

        Canvas.drawCircle(ctx, [ brightest[0] * 3 , brightest[1] * 3], radius, {
          fill: `rgba(${luminance}, ${luminance}, 51, 0.4)`
        });

        Canvas.drawLine(ctx, [x * 3, y * 3], [closest[0] * 3, closest[1] * 3], { stroke: `rgba(${luminance}, ${luminance}, 0, 0.4)` })

      }
    }
  };

  image.src = imageUrl
}

draw('./kitty.webp', 590, 393);
// first('./kitty2.png', 1200, 600);
