const toggle = document.querySelector("input#cb1");

unmute(Tone.getContext().rawContext, true);

const selectedNoise = "pink";
const lpCutoff = 50000;

const lpFilter = new Tone.Filter({
  frequency: lpCutoff,
  type: "lowpass",
  Q: 1,
  rolloff: -24
}).toDestination();

const osc = new Tone.Noise({ type: selectedNoise, volume: 0 }).connect(
  lpFilter
);

let isPlaying = false;
function onStart() {
  osc.start();
  osc.volume.linearRampTo(0, 0);
  isPlaying = true;
  document.body.classList.add("active");
}

function onStop() {
  osc.stop();
  isPlaying = false;
  document.body.classList.remove("active");
}

function onToggle() {
  if (isPlaying) {
    onStop();
  } else {
    onStart();
  }
}

function changeLP(value) {
  // position will be between 0 and 100
  const minp = 0;
  const maxp = 100;

  // The result should be between 100 an 10000000
  const minv = Math.log(100);
  const maxv = Math.log(20_000);

  // calculate adjustment factor
  const scale = (maxv - minv) / (maxp - minp);

  const scaledValue = Math.exp(minv + scale * (value - minp));

  lpFilter.frequency.rampTo(scaledValue, 0.1);
}

document.getElementById("lp").addEventListener("input", (e) => {
  changeLP(e.target.value);
});

const buttons = document.querySelectorAll("button.type");
buttons.forEach((button) =>
  button.addEventListener("click", (e) => {
    osc.type = e.target.id;
    buttons.forEach((btn) => {
      if (btn === e.target) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  })
);

const fadeButtons = document.querySelectorAll("button.fade");
fadeButtons.forEach((button) =>
  button.addEventListener("click", (e) => {
    fadeButtons.forEach((btn) => {
      if (btn === e.target) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  })
);

let interval = 0;
function fadeOut(fade, afterP = 0) {
  const progress = document.querySelector("progress");
  progress.classList.toggle("visible", true);

  const after = `+${afterP}`;
  osc.volume.cancelScheduledValues();

  if (interval) clearInterval(interval);

  osc.volume.linearRampTo(-40, fade, after);

  let total = fade + afterP;
  let elapsed = 0;

  setTimeout(() => {
    interval = setInterval(() => {
      console.log(osc.volume.value);
      elapsed += 1;

      document.querySelector("progress").value =
        100 - (elapsed / (fade + afterP)) * 100;

      console.log(elapsed, total);
      if (elapsed > total) {
        onStop();

        osc.volume.rampTo(0, 0);
        osc.volume.value = 0;
        fadeButtons.forEach((btn) => {
          btn.classList.remove("active");
        });

        progress.value = 0;

        clearInterval(interval);
      }
    }, 1000);
  }, 100);
}
