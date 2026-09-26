import data from "@/content/sim/plays.json";

export type PlayId = "mesh" | "inside-zone" | "flood-right";
export type SimEvent = { type: string; from?: string; to?: string; target?: string; by?: string };
export type SimFrame = { t: number; ball: number[]; carrier: string | null; players: number[][]; events: SimEvent[] };
export type RecordedPlay = {
  name: string;
  seed: number;
  yards: number;
  before: { seconds: number; number: number; distance: number; los: number };
  after: { seconds: number; number: number; distance: number; los: number };
  players: { label: string; side: string; name: string; weight: number }[];
  frames: SimFrame[];
  diagram: { marks: { label: string; pos: number[] }[]; routes: { label: string; points: number[][] }[] };
};

export const recordings: Record<PlayId, RecordedPlay> = data;
export const FIELD_HEIGHT = (53.333336 + 3) * 12;
export const screenX = (yards: number) => yards * 12;
export const screenY = (lateral: number) => (1.5 + lateral * 53.333336) * 12;
export const markerRadius = (weight: number) => Math.max(5.5, Math.min(9.5, 7 * Math.sqrt(weight / 240)));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Frame sampling follows the desktop PlayAnimation.
// Coordinates remain in the engine's world space: x = lateral, y = yards from LOS.
export function sampleFrame(play: RecordedPlay, elapsed: number): SimFrame {
  const frames = play.frames;
  if (elapsed <= frames[0].t) return frames[0];
  if (elapsed >= frames[frames.length - 1].t) return frames[frames.length - 1];
  let low = 0;
  let high = frames.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (frames[middle].t <= elapsed) low = middle;
    else high = middle;
  }
  const a = frames[low];
  const b = frames[high];
  const t = (elapsed - a.t) / (b.t - a.t);
  const players = a.players.map((p, index) => {
    const next = b.players[index];
    const angle = ((((next[2] - p[2]) % 360) + 540) % 360) - 180;
    return [lerp(p[0], next[0], t), lerp(p[1], next[1], t), p[2] + angle * t];
  });
  let ball = [lerp(a.ball[0], b.ball[0], t), lerp(a.ball[1], b.ball[1], t)];
  if (a.carrier && b.carrier && a.carrier !== b.carrier) {
    // Keep the emitted ball offsets at both boundaries. Snapping to the body
    // centers here creates a visible jump when the engine starts the exchange.
    const smooth = t * t * (3 - 2 * t);
    ball = [lerp(a.ball[0], b.ball[0], smooth), lerp(a.ball[1], b.ball[1], smooth)];
  }
  return { t: elapsed, players, ball, carrier: t < .5 ? a.carrier : b.carrier, events: [] };
}

export function playTiming(play: RecordedPlay) {
  const eventTime = (type: string) => play.frames.find((frame) => frame.events.some((e) => e.type === type))?.t;
  const throwFrame = play.frames.find((frame) => frame.events.some((e) => e.type === "pass_thrown"));
  return {
    duration: play.frames[play.frames.length - 1].t,
    snap: eventTime("snap") ?? 0,
    release: throwFrame?.t,
    catch: eventTime("catch"),
    target: throwFrame?.events.find((event) => event.type === "pass_thrown")?.target,
    releaseBall: throwFrame?.ball,
  };
}

// Desktop ballFlightArc: the shadow stays on the true engine path; only the
// glyph is lifted. Center-to-QB snap flights stay flat.
export function ballArc(play: RecordedPlay, elapsed: number) {
  const flat = { lift: 0, scale: 1, shadowScale: 1, shadowOpacity: 0 };
  const frames = play.frames;
  const index = frames.findIndex((frame, i) => i < frames.length - 1 && frame.t <= elapsed && frames[i + 1].t > elapsed);
  if (index < 0 || frames[index].carrier !== null) return flat;
  let start = index;
  let end = index;
  while (start > 0 && frames[start - 1].carrier === null) start--;
  while (end < frames.length - 1 && frames[end + 1].carrier === null) end++;
  const from = frames[Math.max(0, start - 1)];
  const to = frames[Math.min(frames.length - 1, end + 1)];
  if (to.t <= playTiming(play).snap || to.t <= from.t) return flat;
  const progress = Math.max(0, Math.min(1, (elapsed - from.t) / (to.t - from.t)));
  const height = 4 * progress * (1 - progress);
  const distance = Math.hypot(to.ball[1] - from.ball[1], (to.ball[0] - from.ball[0]) * 53.333336);
  return {
    lift: Math.max(1.5, Math.min(7, distance * .12)) * 12 * height,
    scale: 1 + .6 * height,
    shadowScale: 1 - .35 * height,
    shadowOpacity: .35 * (1 - .4 * height),
  };
}
