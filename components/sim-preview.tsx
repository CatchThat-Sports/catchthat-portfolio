"use client";

import { useEffect, useRef, useState } from "react";

type Point = [number, number];
type PlayId = "mesh" | "inside-zone" | "flood-right";
type Player = { name: string; side: "offense" | "defense"; start: Point; middle: Point; end: Point };

type PlayChoice = {
  id: PlayId;
  name: string;
  family: string;
  formation: string;
  read: string;
  outcome: string;
  yards: number;
  target: number;
  diagram: string[];
};

const plays: PlayChoice[] = [
  { id: "mesh", name: "Mesh", family: "SHORT PASS", formation: "Shotgun · 11 personnel", read: "Crossers underneath", outcome: "COMPLETE · 18 YDS", yards: 18, target: 2, diagram: ["M38 73 L93 40 L140 30", "M142 73 L97 42 L45 34", "M167 73 L168 30"] },
  { id: "inside-zone", name: "Inside Zone", family: "RUN", formation: "Shotgun · 11 personnel", read: "Run between the tackles", outcome: "GAIN · 7 YDS", yards: 7, target: 1, diagram: ["M93 80 L97 33", "M49 72 L61 57", "M146 72 L132 57"] },
  { id: "flood-right", name: "Flood Right", family: "PASS", formation: "Shotgun · 11 personnel", read: "Three levels to the right", outcome: "COMPLETE · 12 YDS", yards: 12, target: 3, diagram: ["M38 73 L50 28 L119 15", "M140 73 L150 43 L175 37", "M94 73 L130 56 L174 57"] },
];

const players: Player[] = [
  { name: "HALE", side: "offense", start: [395, 222], middle: [372, 216], end: [385, 219] },
  { name: "BELL", side: "offense", start: [421, 222], middle: [451, 236], end: [480, 239] },
  { name: "WARD", side: "offense", start: [436, 78], middle: [525, 79], end: [638, 119] },
  { name: "PRICE", side: "offense", start: [436, 140], middle: [521, 162], end: [592, 208] },
  { name: "REED", side: "offense", start: [436, 305], middle: [527, 306], end: [642, 310] },
  { name: "KING", side: "offense", start: [436, 369], middle: [502, 332], end: [582, 271] },
  { name: "MOORE", side: "offense", start: [438, 184], middle: [456, 181], end: [470, 184] },
  { name: "ROSS", side: "offense", start: [438, 204], middle: [456, 203], end: [475, 205] },
  { name: "COLE", side: "offense", start: [438, 225], middle: [458, 224], end: [477, 225] },
  { name: "FOX", side: "offense", start: [438, 246], middle: [457, 247], end: [475, 249] },
  { name: "BANKS", side: "offense", start: [438, 266], middle: [458, 270], end: [473, 273] },
  { name: "HATCHER", side: "defense", start: [485, 77], middle: [538, 85], end: [622, 121] },
  { name: "MARSHALL", side: "defense", start: [490, 140], middle: [526, 161], end: [581, 211] },
  { name: "FARRELL", side: "defense", start: [487, 306], middle: [530, 306], end: [631, 312] },
  { name: "WHEELER", side: "defense", start: [485, 368], middle: [508, 329], end: [570, 271] },
  { name: "SPENCE", side: "defense", start: [490, 185], middle: [473, 183], end: [451, 181] },
  { name: "SHEPARD", side: "defense", start: [489, 205], middle: [470, 206], end: [450, 207] },
  { name: "WOODSON", side: "defense", start: [488, 226], middle: [472, 227], end: [454, 230] },
  { name: "LEONARD", side: "defense", start: [490, 247], middle: [470, 249], end: [449, 252] },
  { name: "COBB", side: "defense", start: [488, 267], middle: [471, 271], end: [452, 273] },
  { name: "DALTON", side: "defense", start: [586, 250], middle: [598, 177], end: [624, 128] },
  { name: "MILTON", side: "defense", start: [659, 340], middle: [658, 272], end: [650, 174] },
];

const duration = 5200;
const ease = (value: number) => value * value * (3 - 2 * value);
const between = (a: number, b: number, t: number) => a + (b - a) * t;

function motion(player: Player, index: number, play: PlayId): Player {
  if (play === "mesh") return player;
  if (play === "inside-zone") {
    if (index === 0) return { ...player, middle: [396, 220], end: [411, 226] };
    if (index === 1) return { ...player, middle: [494, 229], end: [553, 237] };
    if ([2, 3, 4, 5].includes(index)) return { ...player, middle: [player.start[0] + 22, player.start[1]], end: [player.start[0] + 42, player.start[1] + (index % 2 ? 5 : -5)] };
    if (index >= 11) return { ...player, middle: [player.start[0] - 12, between(player.start[1], 231, .35)], end: [between(player.start[0], 546, .68), between(player.start[1], 237, .62)] };
    return player;
  }
  if (index === 2) return { ...player, middle: [525, 70], end: [630, 54] };
  if (index === 3) return { ...player, middle: [531, 153], end: [595, 153] };
  if (index === 4) return { ...player, middle: [514, 267], end: [568, 218] };
  if (index === 5) return { ...player, middle: [515, 343], end: [624, 331] };
  if (index === 11) return { ...player, middle: [540, 70], end: [618, 60] };
  if (index === 12) return { ...player, middle: [545, 155], end: [586, 159] };
  return player;
}

function position(player: Player, progress: number): Point {
  if (progress <= .1) return player.start;
  const movement = (progress - .1) / .9;
  if (movement < .55) {
    const t = ease(movement / .55);
    return [between(player.start[0], player.middle[0], t), between(player.start[1], player.middle[1], t)];
  }
  const t = ease((movement - .55) / .45);
  return [between(player.middle[0], player.end[0], t), between(player.middle[1], player.end[1], t)];
}

function ballPosition(progress: number, play: PlayChoice, lineup: Player[]): Point {
  const qb = position(lineup[0], Math.min(progress, .43));
  if (play.id === "inside-zone") {
    if (progress < .24) return [qb[0] + 10, qb[1]];
    const back = position(lineup[1], progress);
    return [back[0] + 9, back[1]];
  }
  if (progress < .43) return [qb[0] + 11, qb[1] - 2];
  if (progress < .72) {
    const target = position(lineup[play.target], progress);
    const t = (progress - .43) / .29;
    return [between(qb[0] + 11, target[0], t), between(qb[1] - 2, target[1], t) - Math.sin(t * Math.PI) * 17];
  }
  const receiver = position(lineup[play.target], progress);
  return [receiver[0] + 10, receiver[1]];
}

function Field({ progress, play }: { progress: number; play: PlayChoice }) {
  const lineup = players.map((player, index) => motion(player, index, play.id));
  const ball = ballPosition(progress, play, lineup);
  return <svg className="sim-field" viewBox="0 0 1000 445" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Football field with animated offense and defense player markers">
    <defs><pattern id="field-stripe" width="160" height="445" patternUnits="userSpaceOnUse"><rect width="80" height="445" fill="rgba(255,255,255,.035)" /><rect x="80" width="80" height="445" fill="rgba(0,0,0,.045)" /></pattern></defs>
    <rect width="1000" height="445" fill="#1b2c20" />
    <rect x="0" y="17" width="1000" height="411" fill="#2a5c3d" />
    <rect x="0" y="17" width="1000" height="411" fill="url(#field-stripe)" />
    <path d="M0 17H1000M0 428H1000" stroke="#f5f5f5" strokeWidth="2" opacity=".9" />
    {Array.from({ length: 13 }, (_, index) => {
      const x = 20 + index * 80;
      return <g key={x}>
        <line x1={x} x2={x} y1="17" y2="428" stroke="rgba(255,255,255,.4)" strokeWidth="1.2" />
        {index % 2 === 1 && <><text x={x} y="145" textAnchor="middle" className="field-number">{index <= 7 ? 15 + index * 5 : 85 - index * 5}</text><text x={x} y="328" textAnchor="middle" className="field-number">{index <= 7 ? 15 + index * 5 : 85 - index * 5}</text></>}
      </g>;
    })}
    {Array.from({ length: 60 }, (_, index) => {
      const x = index * 17;
      return <g key={index} stroke="#cdd8c6" strokeWidth="1" opacity=".65">
        <line x1={x} x2={x} y1="17" y2="24" /><line x1={x} x2={x} y1="421" y2="428" />
        <line x1={x} x2={x} y1="194" y2="201" /><line x1={x} x2={x} y1="244" y2="251" />
      </g>;
    })}
    <line x1="460" x2="460" y1="18" y2="428" stroke="#f5f5f5" strokeWidth="2.5" opacity=".95" />
    <line x1="550" x2="550" y1="18" y2="428" stroke="#e9b06a" strokeWidth="2" strokeDasharray="8 6" opacity=".95" />
    {lineup.map((player, index) => {
      const [x, y] = position(player, progress);
      const isCarrier = index === (play.id === "inside-zone" ? 1 : progress >= .72 ? play.target : 0);
      return <g key={player.name} transform={`translate(${x} ${y})`}>
        {isCarrier && <><circle r="12" fill="none" stroke="#facc15" strokeWidth="2" /><path d="M-4 -21H4L0 -14Z" fill="#facc15" /></>}
        {player.side === "offense" ? <circle r="8" fill="#65ad26" stroke="#f4eede" strokeWidth="1.7" className="sim-marker" /> : <g stroke="#f4eede" strokeWidth="5" strokeLinecap="round" className="sim-marker"><path d="M-6 -6L6 6M6 -6L-6 6" /><path d="M-6 -6L6 6M6 -6L-6 6" stroke="#2054b7" strokeWidth="3.1" /></g>}
        <text y="21" textAnchor="middle" className="player-name">{player.name}</text>
      </g>;
    })}
    <g transform={`translate(${ball[0]} ${ball[1]}) rotate(-25)`}><ellipse rx="8" ry="5" fill="#e0c9a0" stroke="#241a0c" strokeWidth="1.5" /><path d="M-3 0H3" stroke="#f5f5f5" strokeWidth="1.2" /></g>
    {progress >= 1 && <g transform="translate(404 46)"><rect width="192" height="37" rx="3" fill="#16211b" stroke="rgba(233,217,168,.28)" /><text x="96" y="24" textAnchor="middle" className="play-result">{play.outcome}</text></g>}
  </svg>;
}

function PlayDiagram({ play }: { play: PlayChoice }) {
  return <svg viewBox="0 0 180 100" className="call-diagram" aria-hidden="true">
    <rect width="180" height="100" fill="#2a5c3d" /><path d="M0 25H180M0 50H180M0 75H180" stroke="rgba(233,217,168,.16)" /><path d="M0 73H180" stroke="#f4eede" strokeWidth="1.4" />
    {play.diagram.map((path, index) => <path key={index} d={path} fill="none" stroke="#e9d9a8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />)}
    {[38, 94, 140, 167].map((x) => <circle key={x} cx={x} cy="73" r="3.5" fill="#65ad26" stroke="#f4eede" strokeWidth="1" />)}
  </svg>;
}

function PlayCallDialog({ seconds, onChoose, onClose }: { seconds: number; onChoose: (id: PlayId) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"recommended" | "playbook">("recommended");
  const visible = tab === "recommended" ? plays.slice(0, 2) : plays;
  return <div className="call-scrim">
    <div className="call-dialog" role="dialog" aria-modal="true" aria-labelledby="call-title">
      <div className="call-dialog-head"><h2 id="call-title">CALL YOUR PLAY</h2><button type="button" onClick={onClose} aria-label="Close call sheet">×</button></div>
      <div className="call-dialog-body">
        <div className="call-tabs"><button type="button" className={tab === "recommended" ? "active" : ""} onClick={() => setTab("recommended")}>RECOMMENDED <span>2</span></button><button type="button" className={tab === "playbook" ? "active" : ""} onClick={() => setTab("playbook")}>PLAYBOOK <span>3</span></button></div>
        <div className="call-plays">{visible.map((choice, index) => <button className={`call-card ${index === 0 && tab === "recommended" ? "featured" : ""}`} type="button" key={choice.id} onClick={() => onChoose(choice.id)}>
          <PlayDiagram play={choice} /><span className="call-card-copy"><span className="call-card-kicker">{choice.family}{index === 0 && tab === "recommended" && <b> · COORDINATOR&apos;S CALL</b>}</span><strong>{choice.name}</strong><span className="call-card-formation">{choice.formation}</span><span className="call-card-read">{choice.read}</span></span>
        </button>)}</div>
        <p className="call-cutoff">COORDINATOR CALLS AT :15 <span>PLAY CLOCK {seconds}</span></p>
      </div>
    </div>
  </div>;
}

export function SimPreview() {
  const [play, setPlay] = useState<PlayChoice>(plays[0]);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clock, setClock] = useState(40);
  const frame = useRef<number>();

  const call = (id: PlayId) => {
    setPlay(plays.find((choice) => choice.id === id)!);
    setDialogOpen(false);
    setProgress(0);
    setPlaying(true);
  };

  useEffect(() => {
    if (!dialogOpen) return;
    const timer = window.setInterval(() => setClock((value) => Math.max(15, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [dialogOpen]);

  useEffect(() => {
    if (dialogOpen && clock === 15) call("mesh");
  }, [clock, dialogOpen]);

  useEffect(() => {
    if (!playing) return;
    const started = performance.now();
    const tick = (now: number) => {
      const next = Math.min(1, (now - started) / duration);
      setProgress(next);
      if (next < 1) frame.current = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current!);
  }, [playing]);

  useEffect(() => {
    if (!dialogOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setDialogOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialogOpen]);

  const openCallSheet = () => {
    setClock(40);
    setProgress(0);
    setDialogOpen(true);
  };
  const gameSeconds = 24 - Math.round(progress * 6);
  const situation = progress >= 1 ? `1ST & 10` : `2ND & 6`;
  const spot = progress >= 1 ? `DAL ${100 - (44 + play.yards)}` : "SEA 44";

  return <div className="sim-preview">
    <div className="sim-stage">
      <Field progress={progress} play={play} />
      {!dialogOpen && !playing && <button type="button" className="sim-call-action" onClick={openCallSheet}>▶ CALL PLAY</button>}
      {dialogOpen && <PlayCallDialog seconds={clock} onChoose={call} onClose={() => setDialogOpen(false)} />}
    </div>
    <div className="sim-control-bar">
      <div className="sim-score">
        <span className="sim-team sea"><span className="sim-team-main">SEA <i>▶</i> <b>0</b></span><span className="sim-timeouts"><i /><i /><i /></span></span>
        <span className="sim-team dal"><span className="sim-team-main">DAL <b>0</b></span><span className="sim-timeouts"><i /><i /><i /></span></span>
        <span className="sim-clock"><small>Q1</small><b>13:{String(gameSeconds).padStart(2, "0")}</b></span>
        <span className={`sim-playclock ${playing || progress >= 1 ? "inactive" : ""}`}><small>Play clock</small><b>{playing || progress >= 1 ? "—" : clock}</b></span>
      </div>
      <span className="sim-down"><em>{situation}</em> {spot}</span>
    </div>
  </div>;
}
