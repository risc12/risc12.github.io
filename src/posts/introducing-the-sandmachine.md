---
{
  "title": "Introducing The Sandmachine",
  "createdAt": "2024-03-07",
  "description": "I needed a simple web-app to generate noise."
}
---

Last year I become a dad to my beautiful son. As it seems to be the case with all newborns he seemed to have some problems sleeping long stretches at a time, waking up multiple times in an hour. After reading multiple articles and Reddit posts it seemed like it would be helpfull to play some white noise during the night so he wouldn't be woken up by tiny noises and to simulate the soundscape in the womb.

I set out to find a free app on the AppStore or just a web app that simply made some noise, but all of them seemed to have some problems! Most apps were either too complex, not free, or wouldn't keep playing when I locked the screen

That's when I decided to create my own!

[Click here to try it out!](/the-sandmachine)

### Prototyping

I relied heavily on CodePen's Live View (not sponsored, unfortunately) for this project. I started out with just the WebAudio API and a button. That source-code no longer lies around, but it looked something like this:

```html
<!-- Inspired by https://noisehack.com/generate-noise-web-audio-api/-->
<script>
  const audioContext = new(window.AudioContext || window.webkitAudioContext);

  const bufferSize = 2 * audioContext.sampleRate;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  for (var i = 0; i < bufferSize; i++) {
    /* Create a random sample between -1 and 0, then divide it by 10 so it isnt too loud */
    output[i] = (Math.random() * 2 - 1) / 10; 
  }

  const whiteNoise = audioContext.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;
  whiteNoise.connect(audioContext.destination);
  
  function start() {
    whiteNoise.start(0);
  }

  function stop() {
    whiteNoise.stop(0);
  }
</script>

<button onClick="start">Start The Noise</button>
<button onClick="stop">Stop The Noise</button>

```

I tweaked the design a ton, and played around with filters and different modules from the amazing [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

### Mute and the Lockscreen

It turns out, whenever you use Web Audio API, it isn't being interpreted as "media" by iOS. That means that you can't hear the noise whenever your phone is muted! That's not ideal. Besides, it seems that the Web Audio stops when the phone is locked. This isn't very nice because it means having to keep the screen active, which was one of the issues I faced with other solutions.

It turns out the fix for that is to play some sound over an 'audio'-tag...

I tried implementing this myself, and got quite somewhere, but it wasn't very stable...

Turns out I'm not the only one with this problem! Swevans on Github created [unmute.js](https://github.com/swevans/unmute) especially for this case!

### Different types of noise

White noise can be quite thin and hissy, this is because the noise is evenly distributed across the frequency spectrum. Our ears percieve mid-high frequencies as louder! Brown and pink noise might be more suitable, where pink noise tilts the power/frequency relationship. Lower frequncies get louder and higher frequencies get softer. Brown noise uses [Brownian noise](https://en.m.wikipedia.org/wiki/Brownian_noise) and tilts even further, even cutting out some high tones completely! 

At first I naively tried implementing these myself by combining different type of filters and playing around with different oscillators within the Web Audio API.

Then I stumbled onto [Tone.js](https://tonejs.github.io/). I might've seen Tone.js a few times before but dismissed it as being overkill. Now my codebase was growing past a couple of functions and I felt silly for trying to build it all myself! This was supposed to be a tool just for me!

So while I learned lot from building everything myself, it turned out to be a lot more fun to rely on Tone.js.

Instead of creating a noise buffer, a bunch of filters and then playing that I could just use the specific noise-oscillator that I wanted from Tone.js!

```js
const selectedNoise = "pink";

const osc = new Tone.Noise({
  type: selectedNoise, volume: 0
}).toDestination();
```

### Additional features

By moving over to Tone.js it also made it way easier to connect a simple controllable low-pass filter to the oscillator so I could tweak the sound as needed. I decided to also implement a fade-out, so if I wanted to turn the noise off I could hit one of the buttons and it would fade out over the specified amount of time before shutting off.

### Sourcecode

The code used to only be on CodePen: https://codepen.io/Risc12/pen/oNqrydB

But because it is now also part of this website ([click here to view the app](/the-sandmachine)) the code is also on [GitHub](https://github.com/risc12/risc12.github.io/tree/release/the-sandmachine).

<button id="the-sandmachine-feedback">Please let me know what you think!</button>
