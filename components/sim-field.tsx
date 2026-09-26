"use client";

import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import { disambiguatedNames, placeFieldLabels } from "@/lib/sim-field-labels";
import { ballArc, FIELD_HEIGHT, markerRadius, playTiming, RecordedPlay, sampleFrame, screenX, screenY } from "@/lib/sim-playback";

// Projection, paint, marker geometry and labels mirror the desktop renderer's
// field/{projection,FieldSurface,overlays} and PlayAnimation. No scripted paths.
const FieldSurface = memo(function FieldSurface({ los, distance, stripeId }: { los: number; distance: number; stripeId: string }) {
  const left = screenX(-los - 10);
  const right = screenX(110 - los);
  const top = screenY(0);
  const bottom = screenY(1);
  return <>
    <defs><pattern id={stripeId} x={screenX(-los)} width="240" height={FIELD_HEIGHT} patternUnits="userSpaceOnUse"><rect width="120" height={FIELD_HEIGHT} fill="rgba(255,255,255,.035)" /><rect x="120" width="120" height={FIELD_HEIGHT} fill="rgba(0,0,0,.045)" /></pattern></defs>
    <rect x={left - 36} width={right - left + 72} height={FIELD_HEIGHT} fill="#1b2c20" />
    <rect x={left} y={top} width={right - left} height={bottom - top} fill="#2a5c3d" />
    <rect x={screenX(-los)} y={top} width="1200" height={bottom - top} fill={`url(#${stripeId})`} />
    {[{ x: left, name: "SEA", color: "#69be28", rotation: -90 }, { x: screenX(100 - los), name: "DAL", color: "#1f4dd6", rotation: 90 }].map((zone) => <g key={zone.name}>
      <rect x={zone.x} y={top} width="120" height={bottom - top} fill={zone.color} opacity=".9" />
      <text x={zone.x + 60} y={FIELD_HEIGHT / 2} transform={`rotate(${zone.rotation} ${zone.x + 60} ${FIELD_HEIGHT / 2})`} fill="#fff8e7" fontSize="18" fontFamily="ui-monospace, monospace" fontWeight="700" textAnchor="middle" dominantBaseline="central" letterSpacing="6">{zone.name}</text>
    </g>)}
    <g transform={`translate(${screenX(50 - los)} ${screenY(.5)}) rotate(90)`} opacity=".18" fill="none" stroke="#f5f5f5" strokeWidth="3">
      <ellipse rx="40" ry="24" /><path d="M-24 0H24M-12 -7V7M0 -7V7M12 -7V7" />
    </g>
    {Array.from({ length: 21 }, (_, index) => <line key={index} x1={screenX(index * 5 - los)} x2={screenX(index * 5 - los)} y1={top} y2={bottom} stroke={index % 20 === 0 ? "#fefefe" : "rgba(255,255,255,.4)"} strokeWidth={index % 20 === 0 ? 3 : 1.2} />)}
    {Array.from({ length: 99 }, (_, index) => index + 1).filter((yard) => yard % 5 !== 0).map((yard) => <g key={yard} stroke="#cdd8c6" strokeWidth="1.3" opacity=".4">
      {[top + 3.5, bottom - 3.5, screenY(.4422), screenY(.5578)].map((y, index) => <line key={index} x1={screenX(yard - los)} x2={screenX(yard - los)} y1={y - (index < 2 ? 3.5 : 4)} y2={y + (index < 2 ? 3.5 : 4)} />)}
    </g>)}
    {Array.from({ length: 9 }, (_, index) => (index + 1) * 10).flatMap((yard) => [.18, .82].map((row) => {
      const x = screenX(yard - los);
      const y = screenY(row);
      const dir = yard < 50 ? -1 : 1;
      return <g key={`${yard}-${row}`} fill="#dfe6d8" opacity=".5">
        <text x={x} y={y} fontSize="16" fontFamily="var(--font-display), sans-serif" fontWeight="700" letterSpacing="3" textAnchor="middle" dominantBaseline="central">{Math.min(yard, 100 - yard)}</text>
        {yard !== 50 && <path d={`M${x + dir * 22} ${y}l${-dir * 5} -3v6Z`} />}
      </g>;
    }))}
    <path d={`M${left} ${top}H${right}M${left} ${bottom}H${right}`} stroke="#f5f5f5" strokeWidth="2" opacity=".85" />
    {[left, right].map((x) => <g key={x} stroke="#e9b06a" fill="#e9b06a"><line x1={x} x2={x} y1={screenY(.44)} y2={screenY(.56)} strokeWidth="5" /><circle cx={x} cy={screenY(.44)} r="4.5" /><circle cx={x} cy={screenY(.56)} r="4.5" /></g>)}
    <line x1="0" x2="0" y1={top} y2={bottom} stroke="#f5f5f5" strokeWidth="2.5" />
    <line x1={screenX(distance)} x2={screenX(distance)} y1={top} y2={bottom} stroke="#e9b06a" strokeWidth="2" strokeDasharray="6 4" />
  </>;
});

export function SimField({ play, elapsed, finished }: { play: RecordedPlay; elapsed: number; finished: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  const [ratio, setRatio] = useState(2);
  const stripeId = useId().replace(/:/g, "");
  useEffect(() => {
    if (!svg.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.height > 0) setRatio(entry.contentRect.width / entry.contentRect.height);
    });
    observer.observe(svg.current);
    return () => observer.disconnect();
  }, []);
  const current = sampleFrame(play, elapsed);
  const timing = useMemo(() => playTiming(play), [play]);
  const names = useMemo(() => disambiguatedNames(play.players), [play]);
  const viewWidth = FIELD_HEIGHT * ratio;
  const fieldLeft = screenX(-play.before.los - 13);
  const fieldRight = screenX(113 - play.before.los);
  const left = viewWidth >= fieldRight - fieldLeft ? (fieldLeft + fieldRight - viewWidth) / 2 : Math.max(fieldLeft, Math.min(fieldRight - viewWidth, screenX(current.ball[1]) - viewWidth / 2));
  const inFlight = timing.release !== undefined && timing.catch !== undefined && elapsed >= timing.release && elapsed < timing.catch;
  const bodies = play.players.map((player, index) => ({
    ...player, x: screenX(current.players[index][1]), y: screenY(current.players[index][0]),
    facing: 90 - current.players[index][2], r: markerRadius(player.weight),
    carrier: current.carrier === player.label,
    target: inFlight && timing.target === player.label,
  }));
  const labels = new Map(placeFieldLabels(bodies.map((p) => ({ key: p.label, text: names.get(p.label) ?? p.label, cx: p.x, cy: p.y, r: p.r, priority: p.carrier ? 2 : p.target ? 1 : 0 }))).map((p) => [p.key, p]));
  const arc = ballArc(play, elapsed);
  const ballX = screenX(current.ball[1]);
  const ballY = screenY(current.ball[0]);
  const angle = inFlight && timing.releaseBall ? Math.atan2(screenY(current.ball[0]) - screenY(timing.releaseBall[0]), screenX(current.ball[1]) - screenX(timing.releaseBall[1])) * 180 / Math.PI : 0;
  const ballR = 6 * arc.scale;

  return <svg ref={svg} className="sim-field" viewBox={`${left} 0 ${viewWidth} ${FIELD_HEIGHT}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${play.name}: animated CatchThat Football engine replay`}>
    <FieldSurface los={play.before.los} distance={play.before.distance} stripeId={stripeId} />
    {bodies.sort((a, b) => Number(a.carrier) - Number(b.carrier)).map((p) => {
      const k = p.r * Math.SQRT1_2;
      const w = Math.max(2.4, p.r * .46);
      const cross = `M${-k} ${-k}L${k} ${k}M${-k} ${k}L${k} ${-k}`;
      const reach = p.r * 3;
      const label = labels.get(p.label)!;
      return <g key={p.label} data-player={p.label} data-carrier={p.carrier || undefined} style={{ opacity: finished && !p.carrier ? .25 : 1, transition: "opacity 400ms ease-out" }}>
        <title>{p.name} · {p.label}</title>
        <g transform={`translate(${p.x} ${p.y})`}>
          <path d={`M0 0L${reach * .8192} ${-reach * .5736}A${reach} ${reach} 0 0 1 ${reach * .8192} ${reach * .5736}Z`} transform={`rotate(${p.facing})`} fill="#f5f5f5" opacity={p.carrier ? .26 : .2} />
          {p.target && <circle r={p.r + 4} fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />}
          {p.carrier && <><circle r={p.r + 3} fill="none" stroke="#facc15" strokeWidth="2" /><path d={`M-5 ${-p.r - 13}H5L0 ${-p.r - 5}Z`} fill="#facc15" stroke="#0b0b0b" strokeWidth=".5" /></>}
          {p.side === "Offense" ? <><circle r={p.r + 1.5} fill="none" stroke="#0d1410" strokeWidth="1.5" opacity=".7" /><circle r={p.r} fill="#69be28" stroke="#1a3a00" strokeWidth="1.5" /></> : <g strokeLinecap="round" fill="none"><path d={cross} stroke="#0d1410" strokeWidth={w + 5} opacity=".7" /><path d={cross} stroke="#e8eef5" strokeWidth={w + 2} /><path d={cross} stroke="#1f4dd6" strokeWidth={w} /></g>}
        </g>
        <text x={label.x} y={label.y} fill="#f5f5f5" fontSize="8" textAnchor="middle" fontFamily="ui-monospace, monospace" opacity={label.opacity}>{label.text}</text>
      </g>;
    })}
    {inFlight && <ellipse cx={ballX} cy={ballY} rx={6.6 * arc.shadowScale} ry={3 * arc.shadowScale} fill="#0b0b0b" opacity={arc.shadowOpacity} />}
    <g transform={`translate(${ballX} ${ballY - arc.lift})`}>
      <circle r={ballR + 3} fill="none" stroke="#241a0c" strokeWidth="1.5" opacity=".55" />
      <g transform={`rotate(${angle})`}>
        <ellipse rx={ballR * (inFlight ? 1.5 : 1.25)} ry={ballR * (inFlight ? .75 : .85)} fill="#e0c9a0" stroke="#241a0c" strokeWidth="1.5" />
        <path d={`M${-ballR} 0H${ballR}`} stroke="#241a0c" strokeWidth="1" opacity=".7" />
        {inFlight && [-1, 0, 1].map((n) => <line key={n} x1={(n + (elapsed % 140) / 140 - .5) * ballR * .6} x2={(n + (elapsed % 140) / 140 - .5) * ballR * .6} y1={-ballR * .35} y2={ballR * .35} stroke="#241a0c" strokeWidth="1.1" />)}
      </g>
    </g>
  </svg>;
}
