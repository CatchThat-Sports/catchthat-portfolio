"use client";

import { useEffect, useRef, useState } from "react";
import { SimField } from "@/components/sim-field";
import { PlayId, playTiming, recordings } from "@/lib/sim-playback";

type PlayChoice = { id: PlayId; name: string; family: string; formation: string; read: string };
const plays: PlayChoice[] = [
  { id: "mesh", name: "Mesh", family: "SHORT PASS", formation: "Shotgun · 11 personnel", read: "Crossers underneath" },
  { id: "inside-zone", name: "Inside Zone", family: "RUN", formation: "Shotgun · 11 personnel", read: "Run between the tackles" },
  { id: "flood-right", name: "Flood Right", family: "SHORT PASS", formation: "Shotgun · 11 personnel", read: "Three levels to the right" },
];

function PlayDiagram({ play }: { play: PlayChoice }) {
  const diagram = recordings[play.id].diagram;
  const project = (point: number[]) => `${10 + point[0] * 160},${73 - point[1] * 3.5}`;
  return <svg viewBox="0 0 180 108" className="call-diagram" aria-hidden="true">
    <rect width="180" height="108" fill="#2a5c3d" /><path d="M0 20H180M0 38H180M0 55H180M0 90H180" stroke="rgba(233,217,168,.16)" /><path d="M0 73H180" stroke="#f4eede" strokeWidth="1.4" />
    {diagram.routes.map((route) => {
      const start = diagram.marks.find((mark) => mark.label === route.label)!.pos;
      return <polyline key={route.label} points={[start, ...route.points].map(project).join(" ")} fill="none" stroke="#e9d9a8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />;
    })}
    {diagram.marks.map((mark) => <circle key={mark.label} cx={10 + mark.pos[0] * 160} cy={73 - mark.pos[1] * 3.5} r={mark.label.startsWith("OL") ? 3.5 : 3} fill="#69be28" stroke="#1a3a00" strokeWidth="1" />)}
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
  const [playId, setPlayId] = useState<PlayId>("mesh");
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clock, setClock] = useState(40);
  const callButton = useRef<HTMLButtonElement>(null);
  const play = recordings[playId];
  const timing = playTiming(play);
  const finished = elapsed >= timing.duration;

  const call = (id: PlayId) => {
    setPlayId(id);
    setDialogOpen(false);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setElapsed(reduceMotion ? playTiming(recordings[id]).duration : 0);
    setPlaying(!reduceMotion);
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
    let animation: number;
    const started = performance.now();
    const tick = (now: number) => {
      const next = Math.min(timing.duration, now - started);
      setElapsed(next);
      if (next < timing.duration) animation = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    animation = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animation);
  }, [playing, timing.duration]);

  useEffect(() => {
    if (!dialogOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { setDialogOpen(false); callButton.current?.focus(); } };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialogOpen]);

  const openCallSheet = () => {
    setClock(40);
    setElapsed(0);
    setDialogOpen(true);
  };
  const state = finished ? play.after : play.before;
  const seconds = finished ? state.seconds : play.before.seconds - Math.min(play.before.seconds - play.after.seconds, Math.floor(Math.max(0, elapsed - timing.snap) / 1000));
  const situation = `${["", "1ST", "2ND", "3RD", "4TH"][state.number]} & ${state.distance}`;
  const spot = state.los === 50 ? "50" : state.los < 50 ? `SEA ${state.los}` : `DAL ${100 - state.los}`;
  const outcome = `${playId === "inside-zone" ? "GAIN" : "COMPLETE"} · ${play.yards} YDS`;

  return <div className="sim-preview">
    <div className="sim-stage">
      <SimField play={play} elapsed={elapsed} finished={finished} />
      <div className="sim-field-controls">
        <div className="sim-result-slot" role="status" aria-live="polite">{finished && <span className="sim-result">{outcome}</span>}</div>
        {!dialogOpen && !playing && <button ref={callButton} type="button" className="sim-call-action" onClick={openCallSheet}>▶ CALL PLAY</button>}
      </div>
      {dialogOpen && <PlayCallDialog seconds={clock} onChoose={call} onClose={() => { setDialogOpen(false); callButton.current?.focus(); }} />}
    </div>
    <div className="sim-control-bar">
      <div className="sim-score">
        <span className="sim-team sea"><span className="sim-team-main">SEA <i>▶</i> <b>0</b></span><span className="sim-timeouts"><i /><i /><i /></span></span>
        <span className="sim-team dal"><span className="sim-team-main">DAL <b>0</b></span><span className="sim-timeouts"><i /><i /><i /></span></span>
        <span className="sim-clock"><small>Q1</small><b>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</b></span>
        <span className={`sim-playclock ${playing || finished ? "inactive" : ""}`}><small>Play clock</small><b>{playing || finished ? "—" : clock}</b></span>
      </div>
      <span className="sim-down"><em>{situation}</em> {spot}</span>
    </div>
  </div>;
}
