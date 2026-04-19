const ctx = (): AudioContext => {
  if (!(window as any).__audioCtx) {
    (window as any).__audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return (window as any).__audioCtx;
};

function resume() {
  const c = ctx();
  if (c.state === "suspended") c.resume();
  return c;
}

function osc(
  frequency: number,
  type: OscillatorType,
  gainPeak: number,
  duration: number,
  decayRatio = 0.7,
  delayMs = 0,
) {
  const c = resume();
  const now = c.currentTime + delayMs / 1000;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(frequency, now);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gainPeak, now + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration * decayRatio);
  g.gain.setValueAtTime(0, now + duration);
  o.connect(g);
  g.connect(c.destination);
  o.start(now);
  o.stop(now + duration);
}

function noise(gainPeak: number, duration: number, delayMs = 0) {
  const c = resume();
  const now = c.currentTime + delayMs / 1000;
  const buf = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(gainPeak, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 3000;
  src.connect(filter);
  filter.connect(g);
  g.connect(c.destination);
  src.start(now);
  src.stop(now + duration);
}

export const sounds = {
  /** Soft UI tick — navigation, tab switches, color picker */
  tick() {
    osc(1200, "sine", 0.08, 0.07, 0.6);
    noise(0.03, 0.04);
  },

  /** Satisfying click — generic button press */
  click() {
    osc(800, "sine", 0.12, 0.09, 0.5);
    osc(400, "sine", 0.06, 0.08, 0.6, 5);
  },

  /** Toggle switch — dark mode, card freeze, etc. */
  toggle() {
    osc(900, "square", 0.06, 0.06, 0.4);
    osc(1100, "square", 0.04, 0.06, 0.5, 30);
  },

  /** Add to cart — playful pop */
  pop() {
    osc(600, "sine", 0.15, 0.1, 0.3);
    osc(900, "sine", 0.08, 0.12, 0.5, 30);
  },

  /** Remove from cart — reverse pop */
  unpop() {
    osc(900, "sine", 0.1, 0.08, 0.4);
    osc(500, "sine", 0.07, 0.1, 0.5, 20);
  },

  /** Success / completion — pleasant ascending chime */
  success() {
    osc(523, "sine", 0.14, 0.3, 0.8);
    osc(659, "sine", 0.12, 0.3, 0.8, 80);
    osc(784, "sine", 0.10, 0.4, 0.8, 160);
  },

  /** Transfer / payment — coin drop */
  coin() {
    osc(1046, "triangle", 0.14, 0.25, 0.5);
    osc(880, "triangle", 0.10, 0.3, 0.6, 60);
    osc(698, "sine", 0.07, 0.35, 0.7, 120);
  },

  /** Loan repayment — deeper satisfying thud + chime */
  loan() {
    osc(150, "sine", 0.2, 0.25, 0.4);
    osc(523, "sine", 0.12, 0.3, 0.7, 80);
    osc(784, "sine", 0.09, 0.35, 0.8, 160);
  },

  /** Recharge / top-up — energetic beep sequence */
  recharge() {
    osc(880, "square", 0.08, 0.08, 0.5);
    osc(1108, "square", 0.07, 0.08, 0.5, 90);
    osc(1318, "square", 0.06, 0.1, 0.5, 180);
  },

  /** Bill payment — receipt print tick */
  bill() {
    for (let i = 0; i < 4; i++) {
      noise(0.06, 0.03, i * 35);
    }
    osc(440, "sine", 0.10, 0.2, 0.7, 160);
  },

  /** Savings goal contribution — piggy bank clink */
  save() {
    osc(1318, "triangle", 0.12, 0.2, 0.5);
    osc(1568, "triangle", 0.09, 0.25, 0.6, 70);
    osc(1046, "sine", 0.07, 0.3, 0.7, 130);
  },

  /** Error / validation fail — low buzz */
  error() {
    osc(180, "sawtooth", 0.12, 0.18, 0.6);
    osc(150, "sawtooth", 0.09, 0.18, 0.7, 50);
  },

  /** Login / welcome — warm rising tone */
  login() {
    osc(392, "sine", 0.10, 0.25, 0.8);
    osc(523, "sine", 0.10, 0.28, 0.8, 100);
    osc(659, "sine", 0.12, 0.35, 0.8, 200);
    osc(784, "sine", 0.10, 0.4, 0.8, 300);
  },

  /** Checkout complete — triumphant flourish */
  checkout() {
    osc(523, "sine", 0.14, 0.3, 0.7);
    osc(659, "sine", 0.12, 0.3, 0.7, 80);
    osc(784, "sine", 0.11, 0.3, 0.7, 160);
    osc(1046, "sine", 0.13, 0.5, 0.8, 240);
  },

  /** Notification / info — soft ding */
  ding() {
    osc(1046, "sine", 0.10, 0.35, 0.7);
  },
};
