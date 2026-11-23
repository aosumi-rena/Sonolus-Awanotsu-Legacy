import { NoteDirection, NoteOp } from '../shared/src/engine/data/notes.js'
import { SsEase, SsFlickDir, SsType, type SsNoteModel } from './chart.js'
import { roundHalfEven } from './tick.js'

const f32 = Math.fround

export const resolveSingleOp = (n: SsNoteModel): number =>
    n.type === SsType.Flick ? NoteOp.Flick : n.type === SsType.Trace ? NoteOp.Trace : NoteOp.Normal

export const resolveFlickDir = (n: SsNoteModel): number => {
    if (n.type !== SsType.Flick) return NoteDirection.Normal
    if (n.dir === SsFlickDir.Left) return NoteDirection.Left
    if (n.dir === SsFlickDir.Right) return NoteDirection.Right
    return NoteDirection.Normal
}

export const resolveLongNodeOp = (nodes: SsNoteModel[], i: number): number => {
    const nd = nodes[i]!
    if (i === 0) {
        if (!nd.visible) return NoteOp.HiddenSlideBegin
        if (nd.type === SsType.Flick) return NoteOp.SlideBeginFlick
        if (nd.type === SsType.Trace) return NoteOp.SlideBeginTrace
        return NoteOp.SlideBegin
    }
    if (i === nodes.length - 1) {
        if (!nd.visible) return NoteOp.HiddenSlideEnd
        if (nd.type === SsType.Flick) return NoteOp.SlideEndFlick
        if (nd.type === SsType.Trace) return NoteOp.SlideEndTrace
        return NoteOp.SlideEnd
    }
    if (nd.posAuto) return NoteOp.SlideConnection
    if (!nd.visible) return NoteOp.Hidden
    if (nd.type === SsType.Trace) return NoteOp.SlideConnectionTrace
    return NoteOp.SlideConnection
}

export type OverlapKey = string

export const overlapKey = (t: number, pos: number, size: number): OverlapKey =>
    `${t}|${roundHalfEven(pos)}|${roundHalfEven(size)}`

export const resolveGuideNodeOp = (nodes: SsNoteModel[], i: number, claim: Map<OverlapKey, SsNoteModel> | null): number => {
    const nd = nodes[i]!
    if (i === 0) {
        if (claim === null || nd.posAuto) return NoteOp.GuideBegin
        const s = claim.get(overlapKey(nd.t, nd.pos, nd.size))
        if (s !== undefined && s.type < 3) {
            if (s.type === SsType.Tap) return NoteOp.GuideBeginNormal
            if (s.type === SsType.Flick) return NoteOp.GuideBeginFlick
            return NoteOp.GuideBeginTrace
        }
        return NoteOp.GuideBegin
    }
    if (i === nodes.length - 1) {
        if (!nd.visible) return NoteOp.GuideEnd
        if (nd.type === SsType.Trace) return NoteOp.GuideEndTrace
        return NoteOp.GuideEnd
    }
    if (nd.posAuto) return NoteOp.SlideConnectionTrace
    if (!nd.visible) return NoteOp.Hidden
    return NoteOp.SlideConnectionTrace
}

export const convertEase = (e: number): number => (e === SsEase.In ? 2 : e === SsEase.Out ? 1 : 0)

export const easeF32 = (t: number, kind: number): number => {
    t = f32(t)
    if (kind === 2) return f32(t * t)
    if (kind === 1) return f32(f32(f32(2) - t) * t)
    return t
}

export const isMergeableEndpoint = (op: number) =>
    op === 20 || op === 22 || op === 41 || op === 42 || op === 61 || op === 62 || op === 80 || op === 82 || (op >= 100 && op <= 105)

export const isJudgementNote = (op: number) =>
    !(op === 0 || op === 80 || op === 82 || op === 100 || op === 103 || op === 121 || op === 122 || op === 123)

export const sortOrder = (op: number): number => {
    if (op === 20 || op === 41 || op === 61 || op === 80 || op === 100 || op === 101 || op === 102 || op === 104) return 8
    return op === 122 ? 9 : 10
}

export const mirrorPos = (pos: number, size: number) => f32(f32(24) - pos - size)

export const mirrorDir = (d: number) => (d === NoteDirection.Left ? NoteDirection.Right : d === NoteDirection.Right ? NoteDirection.Left : d)
