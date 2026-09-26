// Shared from CatchThat Football desktop/src/renderer/src/components/playcall/fieldLabels.ts.
// On-field player-name label layout: duplicate-surname disambiguation and
// collision handling for the PlayAnimation marker labels. Pure geometry/text —
// no runtime imports — so it unit-tests under plain `node --test`.

/** Monospace glyph width at the 8px label font; label box height in px. */
const CHAR_W = 4.8
const LINE_H = 9

export type FieldLabelInput = {
  /** Stable per-play key (the frame's positional label, e.g. "WR1"). */
  key: string
  text: string
  /** Marker center + radius, in screen px. */
  cx: number
  cy: number
  r: number
  /** Higher priority wins a collision (ball carrier > target > everyone). */
  priority: number
}

export type PlacedFieldLabel = {
  key: string
  text: string
  x: number
  y: number
  /** 1 for a clean label; collided lower-priority labels fade near-out so a
   *  pileup shows one crisp name instead of overprinted garble. */
  opacity: number
}

type Box = { x0: number; x1: number; y0: number; y1: number }

function labelBox(cx: number, y: number, text: string): Box {
  const w = text.length * CHAR_W
  return { x0: cx - w / 2, x1: cx + w / 2, y0: y - LINE_H + 2, y1: y + 2 }
}

function intersects(a: Box, b: Box): boolean {
  return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1
}

/** Place every label BELOW its marker and resolve overlaps by fading the
 *  lower-priority label, never by moving it. A label's side is therefore a
 *  constant, which is the point: bodies drift a yard or two between frames, so
 *  an above/below fallback slot made names jump from one side of a marker to
 *  the other and back several times a second while the play ran. Fading costs
 *  one name in a pileup (the lowest priority, which is never the ball carrier
 *  or the pass target) and keeps the rest anchored where the eye last saw
 *  them. Collision order is deterministic for a given input set (priority, then
 *  key), so the same pileup fades the same name every frame.
 *
 *  If this changes, `fieldLabels.test.ts` pins both halves: the side never
 *  moves across a sequence of drifting frames, and the carrier keeps a full
 *  opacity label. */
export function placeFieldLabels(items: FieldLabelInput[]): PlacedFieldLabel[] {
  const order = [...items].sort((a, b) => b.priority - a.priority || a.key.localeCompare(b.key))
  const accepted: Box[] = []
  const placed = new Map<string, PlacedFieldLabel>()
  for (const it of order) {
    const y = it.cy + it.r + 8
    const box = labelBox(it.cx, y, it.text)
    const clear = !accepted.some((b) => intersects(b, box))
    if (clear) accepted.push(box)
    placed.set(it.key, { key: it.key, text: it.text, x: it.cx, y, opacity: clear ? 1 : 0.12 })
  }
  // Return in input order so callers can zip with their render list.
  return items.map((it) => placed.get(it.key)!)
}

/** Display names for the 22 on-field bodies, disambiguating duplicate
 *  surnames broadcast-style: duplicates gain a first initial ("J. Cole" vs
 *  "T. Cole"); identical initial+surname falls back to the jersey number
 *  ("#24 Cole"), then the positional label when no jersey is known (jersey 0
 *  = pre-jersey save payload). Unique surnames stay bare. */
export function disambiguatedNames(
  players: ReadonlyArray<{ label: string; name: string; jersey?: number }>
): Map<string, string> {
  const last = (name: string): string => {
    const parts = name.trim().split(/\s+/)
    return parts[parts.length - 1] ?? ''
  }
  const initialLast = (name: string): string => {
    const parts = name.trim().split(/\s+/)
    const ln = parts[parts.length - 1] ?? ''
    return parts.length > 1 && parts[0] ? `${parts[0][0]}. ${ln}` : ln
  }
  const bySurname = new Map<string, number>()
  for (const p of players) {
    const ln = last(p.name)
    if (ln) bySurname.set(ln, (bySurname.get(ln) ?? 0) + 1)
  }
  const byInitialLast = new Map<string, number>()
  for (const p of players) {
    if ((bySurname.get(last(p.name)) ?? 0) > 1) {
      const il = initialLast(p.name)
      byInitialLast.set(il, (byInitialLast.get(il) ?? 0) + 1)
    }
  }
  const out = new Map<string, string>()
  for (const p of players) {
    const ln = last(p.name)
    if (!ln) {
      out.set(p.label, p.label)
    } else if ((bySurname.get(ln) ?? 0) <= 1) {
      out.set(p.label, ln)
    } else {
      const il = initialLast(p.name)
      if ((byInitialLast.get(il) ?? 0) > 1) {
        out.set(p.label, p.jersey ? `#${p.jersey} ${ln}` : `${p.label} ${ln}`)
      } else {
        out.set(p.label, il)
      }
    }
  }
  return out
}
