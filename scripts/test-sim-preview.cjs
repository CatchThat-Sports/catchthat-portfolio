const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { createRequire } = require('node:module');
const ts = require('typescript');

// Exercise the production TypeScript helpers without adding a test runtime.
function loadTs(file) {
  const absolute = resolve(__dirname, '..', file);
  const compiled = ts.transpileModule(readFileSync(absolute, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const localRequire = createRequire(absolute);
  const exports = {};
  new Function('require', 'exports', compiled)((id) => localRequire(id.startsWith('@/') ? resolve(__dirname, '..', id.slice(2)) : id), exports);
  return exports;
}
const { recordings, sampleFrame, playTiming, screenX, screenY, ballArc } = loadTs('lib/sim-playback.ts');
const { placeFieldLabels } = loadTs('lib/sim-field-labels.ts');

for (const [id, play] of Object.entries(recordings)) {
  test(`${id}: all 22 players and a consistent ball spot throughout the recording`, () => {
    const labels = play.players.map((p) => p.label);
    assert.equal(new Set(labels).size, 22);
    play.frames.forEach((f, i) => {
      assert.equal(f.players.length, 22);
      assert.ok(f.carrier === null || labels.includes(f.carrier));
      assert.ok(!i || f.t > play.frames[i - 1].t);
      assert.ok(f.players.flat().every(Number.isFinite));
    });
    const end = sampleFrame(play, Infinity);
    assert.ok(Math.abs(end.ball[1] - play.yards) <= .51);
    assert.equal(play.after.los, play.before.los + play.yards);
    assert.equal(play.after.number, play.yards >= play.before.distance ? 1 : play.before.number + 1);
  });
}

test('inside zone: center → QB → RB, handoff stays continuous and ends at the real gain', () => {
  const play = recordings['inside-zone'];
  const labels = play.players.map((p) => p.label);
  const handoffIndex = play.frames.findIndex((f) => f.events.some((e) => e.type === 'handoff'));
  const handoff = play.frames[handoffIndex];
  assert.equal(play.frames[0].carrier, 'OL3');
  assert.equal(play.frames[handoffIndex - 1].carrier, 'QB');
  const transfer = play.frames.find((f) => f.t >= handoff.t && f.carrier === 'RB');
  assert.ok(transfer && transfer.t - handoff.t <= 150);
  assert.equal(play.frames.at(-1).carrier, 'RB');
  let previous = sampleFrame(play, transfer.t - 40);
  for (let t = transfer.t - 39; t <= transfer.t + 40; t++) {
    const frame = sampleFrame(play, t);
    const yardsMoved = Math.hypot((frame.ball[0] - previous.ball[0]) * 53.333336, frame.ball[1] - previous.ball[1]);
    assert.ok(yardsMoved < .1, `Ball jumped at ${t}ms: ${yardsMoved} yards`);
    previous = frame;
  }
  assert.equal(Math.round(play.frames.at(-1).players[labels.indexOf('RB')][1]), play.yards);
});

test('passes: visible flight between release and catch; snap stays flat', () => {
  for (const id of ['mesh', 'flood-right']) {
    const play = recordings[id];
    const times = playTiming(play);
    assert.ok(times.snap < times.release && times.release < times.catch);
    assert.ok(ballArc(play, (times.release + times.catch) / 2).lift > 0);
    assert.equal(ballArc(play, times.snap - 50).lift, 0);
    assert.equal(ballArc(play, times.duration).lift, 0);
    assert.equal(sampleFrame(play, times.catch).carrier, times.target);
  }
});

test('field uses the same scale for lateral and downfield yards', () => {
  assert.ok(Math.abs((screenY(1) - screenY(0)) / 53.333336 - screenX(1)) < 1e-6);
});

test('carrier label remains readable in a tackle pile', () => {
  const placed = placeFieldLabels([
    { key: 'DL', text: 'Defender', cx: 0, cy: 0, r: 7, priority: 0 },
    { key: 'RB', text: 'Runner', cx: 1, cy: 0, r: 7, priority: 2 },
  ]);
  assert.equal(placed.find((p) => p.key === 'RB').opacity, 1);
  assert.ok(placed.find((p) => p.key === 'DL').opacity < .2);
});
