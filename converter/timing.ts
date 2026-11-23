import type { SsEvents } from './chart.js'
import type { TickConverter } from './tick.js'

const f32 = Math.fround

export type Pos = { bar: number; prog: number; ms: number }

export const posKey = (p: { bar: number; prog: number }) => f32(f32(p.prog) + f32(p.bar))

export const approximately = (a: number, b: number): boolean => {
    a = f32(a)
    b = f32(b)
    return Math.abs(b - a) < Math.max(1e-6 * Math.max(Math.abs(a), Math.abs(b)), 1.401298e-45 * 8)
}

export const samePosition = (l: Pos, r: Pos) => l.bar === r.bar && approximately(l.prog, r.prog)

type BpmEv = { bar: number; prog: number; ms: number; bpm: number }
type BarEv = { bar: number; prog: number; ms: number; change: number }

export class Timing {
    readonly bpmEvents: BpmEv[] = []
    readonly barEvents: BarEv[] = []

    constructor(events: SsEvents, tc: TickConverter) {
        const bpms = [...(events.bpm ?? [])].sort((a, b) => a.t - b.t)
        for (const b of bpms) {
            const bp = tc.barPosition(b.t)
            this.bpmEvents.push({ bar: bp.bar, prog: f32(bp.progress), ms: tc.tickToTimeMs(b.t), bpm: f32(b.bpm) })
        }
        const sigs = [...(events.sig ?? [])].sort((a, b) => a.t - b.t)
        for (const s of sigs) {
            const bp = tc.barPosition(s.t)
            const [num, den] = s.sig
            this.barEvents.push({
                bar: bp.bar,
                prog: f32(bp.progress),
                ms: tc.tickToTimeMs(s.t),
                change: f32(f32(f32(num) * f32(4)) / f32(den)),
            })
        }
    }

    timeFromBar(bar: number, prog: number): number {
        prog = f32(prog)
        let refBar = 0
        let refProg = f32(0)
        let refMs = 0
        let beats = f32(4)
        for (const e of this.barEvents) {
            if (e.bar < bar || (e.bar === bar && e.prog < prog)) {
                beats = e.change
                if (refMs < e.ms) {
                    refBar = e.bar
                    refProg = e.prog
                    refMs = e.ms
                }
            }
        }
        let bpm = f32(160)
        for (const e of this.bpmEvents) {
            if (e.bar < bar || (e.bar === bar && e.prog < prog)) {
                bpm = e.bpm
                if (refMs < e.ms) {
                    refBar = e.bar
                    refProg = e.prog
                    refMs = e.ms
                }
            }
        }
        const spb = f32(f32(beats * f32(60)) / bpm)
        const a = f32(spb * f32(bar - refBar))
        const c = f32(spb * f32(prog - refProg))
        const v = f32(f32(a + c) * f32(1000))
        return refMs + Math.floor(v)
    }

    makePos(bar: number, prog: number): Pos {
        prog = f32(prog)
        return { bar, prog, ms: this.timeFromBar(bar, prog) }
    }

    barRhythm(bar: number): number {
        let r = f32(4)
        for (const e of this.barEvents) {
            if (e.bar > bar) return r
            r = e.change
        }
        return r
    }

    bpmAt(ms: number): number {
        let v = f32(160)
        for (const e of this.bpmEvents) if (e.ms <= ms) v = e.bpm
        return v
    }

    eighths(s: Pos, e: Pos): Pos[] {
        let bar = s.bar
        let prog = s.prog
        let r = this.barRhythm(bar)
        let step = 1.0 / f32(r + r)
        const out: Pos[] = []
        for (;;) {
            prog = prog + step
            if (prog >= 1.0) {
                bar += 1
                prog = prog - 1.0
                r = this.barRhythm(bar)
                step = 1.0 / f32(r + r)
            }
            const pf = f32(prog)
            const ms = this.timeFromBar(bar, pf)
            if (!(ms < e.ms)) break
            out.push({ bar, prog: pf, ms })
            if (out.length > 100000) throw new Error('eighths: runaway loop')
        }
        return out
    }
}
