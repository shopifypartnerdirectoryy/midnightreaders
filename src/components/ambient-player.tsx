import { useEffect, useRef, useState } from "react";

const tracks = ["Rain on Lamplight", "Fireside Library", "Coastal Tides"] as const;
type Track = (typeof tracks)[number];

function noise(ctx: AudioContext, kind: "white" | "brown") {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === "white") d[i] = w;
    else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
  }
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true;
  return src;
}

/** Synthesised ambient soundscapes — no external audio files. */
export function AmbientPlayer() {
  const [playing, setPlaying] = useState<Track | null>(null);
  const [vol, setVol] = useState(0.4);
  const ctxRef = useRef<{ ctx: AudioContext; gain: GainNode; stop: () => void } | null>(null);

  function stop() { ctxRef.current?.stop(); ctxRef.current = null; setPlaying(null); }

  function play(t: Track) {
    stop();
    const ctx = new AudioContext();
    const gain = ctx.createGain(); gain.gain.value = vol; gain.connect(ctx.destination);
    const nodes: AudioScheduledSourceNode[] = [];
    let timer: ReturnType<typeof setInterval> | undefined;
    if (t === "Rain on Lamplight") {
      const n = noise(ctx, "white"); const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1200; f.Q.value = 0.6;
      const g = ctx.createGain(); g.gain.value = 0.25; n.connect(f).connect(g).connect(gain); n.start(); nodes.push(n);
    } else if (t === "Fireside Library") {
      const n = noise(ctx, "brown"); const g = ctx.createGain(); g.gain.value = 0.5; n.connect(g).connect(gain); n.start(); nodes.push(n);
      timer = setInterval(() => {
        if (Math.random() > 0.5) return;
        const o = ctx.createOscillator(); const og = ctx.createGain();
        o.frequency.value = 1500 + Math.random() * 2500; og.gain.setValueAtTime(0.15, ctx.currentTime); og.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        o.connect(og).connect(gain); o.start(); o.stop(ctx.currentTime + 0.05);
      }, 120);
    } else {
      const n = noise(ctx, "brown"); const g = ctx.createGain(); g.gain.value = 0.4;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.09; const lg = ctx.createGain(); lg.gain.value = 0.35;
      lfo.connect(lg).connect(g.gain); n.connect(g).connect(gain); n.start(); lfo.start(); nodes.push(n, lfo);
    }
    ctxRef.current = { ctx, gain, stop: () => { if (timer) clearInterval(timer); nodes.forEach((x) => x.stop()); void ctx.close(); } };
    setPlaying(t);
  }

  useEffect(() => { if (ctxRef.current) ctxRef.current.gain.gain.value = vol; }, [vol]);
  useEffect(() => () => ctxRef.current?.stop(), []);

  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold">Midnight Ambient Player</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {tracks.map((t) => (
          <button key={t} onClick={() => (playing === t ? stop() : play(t))}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${playing === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {playing === t ? "❚❚ " : "▶ "}{t}
          </button>
        ))}
      </div>
      <label className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">Volume
        <input type="range" min={0} max={1} step={0.05} value={vol} onChange={(e) => setVol(Number(e.target.value))} className="flex-1 accent-[var(--color-accent)]" />
      </label>
    </div>
  );
}
