import type { SsEvents } from './chart.js'

export const TICKS_PER_BEAT = 480

const f32 = Math.fround

export const roundHalfEven = (x: number): number => {
    const f = Math.floor(x)
    const d = x - f
    if (d < 0.5) return f
    if (d > 0.5) return f + 1
    return f % 2 === 0 ? f : f + 1
}

export type BpmSegment = { startTick: number; startTimeMs: number; bpm: number }
export type SigSegment = { startTick: number; startBar: number; tpm: number; num: number; den: number }

export type BarPosition = {
    bar: number

    progress: number
    rhythm: number
    rhythmicUnit: number
}

export class TickConverter {
    readonly bpmSegments: BpmSegment[] = []
    readonly sigSegments: SigSegment[] = []

    constructor(events: SsEvents) {
        const bpms = [...(events.bpm ?? [])].sort((a, b) => a.t - b.t)
        if (bpms.length === 0 || bpms[0]!.t >= 1) this.bpmSegments.push({ startTick: 0, startTimeMs: 0, bpm: 120 })
        let acc = 0
        let prevT = 0
        let prevBpm = 120
        for (const b of bpms) {
            const dt = b.t - prevT
            if (dt > 0) acc += (dt * 60000.0) / f32(f32(prevBpm) * 480)
            const bpm = f32(b.bpm)
            this.bpmSegments.push({ startTick: b.t, startTimeMs: roundHalfEven(acc), bpm })
            prevT = b.t
            prevBpm = bpm
        }

        const sigs = [...(events.sig ?? [])].sort((a, b) => a.t - b.t)
        if (sigs.length === 0 || sigs[0]!.t >= 1) this.sigSegments.push({ startTick: 0, startBar: 0, tpm: 1920, num: 4, den: 4 })
        let bar = 0
        let pt = 0
        let ptpm = 1920
        for (const s of sigs) {
            if (s.t - pt > 0) bar += Math.trunc((s.t - pt) / ptpm)
            const [num, den] = s.sig
            const tpm = Math.trunc((num * 1920) / den)
            this.sigSegments.push({ startTick: s.t, startBar: bar, tpm, num, den })
            pt = s.t
            ptpm = tpm
        }
    }

    private bpmSegmentAt(tick: number): BpmSegment {
        for (let i = this.bpmSegments.length - 1; i >= 0; i--) {
            const s = this.bpmSegments[i]!
            if (s.startTick <= tick) return s
        }
        return this.bpmSegments[0]!
    }

    private sigSegmentAt(tick: number): SigSegment {
        for (let i = this.sigSegments.length - 1; i >= 0; i--) {
            const s = this.sigSegments[i]!
            if (s.startTick <= tick) return s
        }
        return this.sigSegments[0]!
    }

    tickToTimeMs(tick: number): number {
        const s = this.bpmSegmentAt(tick)
        return Math.floor(((tick - s.startTick) * 60000.0) / f32(s.bpm * 480) + s.startTimeMs)
    }

    barPosition(tick: number): BarPosition {
        const s = this.sigSegmentAt(tick)
        const d = tick - s.startTick
        const q = Math.trunc(d / s.tpm)
        const r = d - q * s.tpm
        return { bar: s.startBar + q, progress: f32(r / s.tpm), rhythm: r, rhythmicUnit: s.tpm }
    }

    barHeadTick(bar: number): number {
        let seg = this.sigSegments[0]!
        for (let i = this.sigSegments.length - 1; i >= 0; i--) {
            if (this.sigSegments[i]!.startBar <= bar) {
                seg = this.sigSegments[i]!
                break
            }
        }
        return seg.startTick + (bar - seg.startBar) * seg.tpm
    }

    barHeadTimeMs(bar: number): number {
        return this.tickToTimeMs(this.barHeadTick(bar))
    }

    bpmAtTick(tick: number): number {
        return this.bpmSegmentAt(tick).bpm
    }
}
