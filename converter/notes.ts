import { NoteOp } from '../shared/src/engine/data/notes.js'
import { readNotes, SsType, type SsNoteModel, type SsRoot } from './chart.js'
import {
    convertEase,
    easeF32,
    isJudgementNote,
    isMergeableEndpoint,
    mirrorDir,
    mirrorPos,
    overlapKey,
    resolveFlickDir,
    resolveGuideNodeOp,
    resolveLongNodeOp,
    resolveSingleOp,
    sortOrder,
    type OverlapKey,
} from './ops.js'
import { roundHalfEven, TickConverter } from './tick.js'
import { posKey, samePosition, Timing, type Pos } from './timing.js'

const f32 = Math.fround

export type NoteInfo = {
    t: number
    bar: number

    prog: number

    lane: number

    lanef: number

    width: number

    widthf: number
    op: number
    dir: number
    easeL: number
    easeR: number
    crit: boolean

    along: boolean

    lines: number[]

    src: SsNoteModel
}

export type GameNote = {

    id: number
    pos: Pos
    op: number
    along: boolean

    lineIds: number[]

    slots: number[]

    view: GameNote[]

    combos: GameNote[]
    info: NoteInfo | null

    t: number

    laneStartF: number
    laneEndF: number

    laneStartIndex: number
    laneEndIndex: number
    width: number
    crit: boolean
    dir: number
    easeL: number
    easeR: number
    fever: boolean

    pair: GameNote | null
}

export type GameLine = {

    id: number

    slot: number

    type: 1 | 2
    begin: GameNote
    end: GameNote | null

    nodes: GameNote[]
}

export type FeverRange = { start: Pos; end: Pos }

export type BuildResult = {

    notes: GameNote[]

    dictOrder: GameNote[]
    lines: GameLine[]

    pairs: [GameNote, GameNote][]
    fevers: FeverRange[]
    skills: Pos[]

    barLineMs: number[]
    tc: TickConverter
    timing: Timing
    stats: { merged: number; dropped: number; judged: number; combo: number; comboSkip: number }
}

const LINE_INDEX_MAX = 20

class LineIndexAssigner {
    private readonly active: { index: number; endTick: number }[] = []

    acquire(startTick: number): number {
        for (let j = this.active.length - 1; j >= 0; j--) {
            if (this.active[j]!.endTick < startTick) this.active.splice(j, 1)
        }
        const used = new Set(this.active.map((a) => a.index))
        let k = 0
        while (used.has(k)) {
            k++
            if (k >= LINE_INDEX_MAX) throw new Error('LineIndexAssigner: more than 20 concurrent lines')
        }
        return k
    }

    register(index: number, lastNodeTick: number) {
        this.active.push({ index, endTick: lastNodeTick })
    }
}

export const buildNotes = (root: SsRoot, mirror = false): BuildResult => {
    const notes = readNotes(root)
    const tc = new TickConverter(root.score.events)
    const timing = new Timing(root.score.events, tc)

    const infos: NoteInfo[] = []

    const laneOf = (pos: number, size: number) => (mirror ? mirrorPos(pos, size) : pos)
    const dirOf = (d: number) => (mirror ? mirrorDir(d) : d)

    const infoSingle = (n: SsNoteModel): NoteInfo => {

        const bp = tc.barPosition(n.t)
        const lanef = f32(laneOf(n.pos, n.size))
        return {
            t: n.t,
            bar: bp.bar,
            prog: bp.progress,
            lane: roundHalfEven(lanef),
            lanef,
            width: Math.max(1, roundHalfEven(n.size)),
            widthf: f32(n.size),
            op: resolveSingleOp(n),
            dir: dirOf(resolveFlickDir(n)),
            easeL: 0,
            easeR: 0,
            crit: n.crit,
            along: false,
            lines: [],
            src: n,
        }
    }

    const guideKeys = new Set<OverlapKey>()
    for (const n of notes) {
        if (n.type === SsType.Guide && n.node && n.node.length !== 0 && !n.node[0]!.posAuto) {
            const f = n.node[0]!
            guideKeys.add(overlapKey(f.t, f.pos, f.size))
        }
    }
    const claim = new Map<OverlapKey, SsNoteModel>()
    const claimedIdx = new Set<number>()
    notes.forEach((n, i) => {
        if (n.type <= SsType.Trace) {
            const k = overlapKey(n.t, n.pos, n.size)
            if (guideKeys.has(k) && !claim.has(k)) {
                claim.set(k, n)
                claimedIdx.add(i)
            }
        }
    })
    notes.forEach((n, i) => {
        if (!claimedIdx.has(i) && n.type <= SsType.Trace) infos.push(infoSingle(n))
    })

    const assigner = new LineIndexAssigner()

    const buildLongOrGuide = (isLong: boolean) => {
        const typ = isLong ? SsType.Long : SsType.Guide
        const lst: { i: number; n: SsNoteModel }[] = []
        notes.forEach((n, i) => {
            if (n.type === typ && n.node && n.node.length >= 2) lst.push({ i, n })
        })
        lst.sort((a, b) => a.n.node![0]!.t - b.n.node![0]!.t || a.i - b.i)
        for (const { n } of lst) {
            const nodes = n.node!
            const li = assigner.acquire(nodes[0]!.t)
            const last = nodes.length - 1
            for (let i = 0; i < nodes.length; i++) {
                const nd = nodes[i]!
                const op = isLong ? resolveLongNodeOp(nodes, i) : resolveGuideNodeOp(nodes, i, claim)
                let lanef: number
                let wf: number
                if (nd.posAuto) {
                    if (i !== 0 && i < last) {

                        let a = i
                        do {
                            a--
                        } while (a >= 1 && nodes[a]!.posAuto)
                        let b = i + 1
                        while (b < last && nodes[b]!.posAuto) b++
                        const A = nodes[a]!
                        const B = nodes[b]!
                        const t = B.t - A.t <= 0 ? f32(0) : f32(f32(nd.t - A.t) / f32(B.t - A.t))
                        const el = easeF32(t, convertEase(A.easeL))
                        const er = easeF32(t, convertEase(A.easeR))
                        lanef = f32(A.pos + f32(el * f32(B.pos - A.pos)))
                        wf = f32(f32(f32(A.pos + A.size) + f32(er * f32(f32(B.pos + B.size) - f32(A.pos + A.size)))) - lanef)
                    } else {
                        lanef = f32(nodes[0]!.pos)
                        wf = f32(nodes[0]!.size)
                    }
                } else {
                    lanef = f32(nd.pos)
                    wf = f32(nd.size)
                }
                const bp = tc.barPosition(nd.t)

                let src = nd
                if (!isLong && i === 0 && !nd.posAuto) {
                    const s = claim.get(overlapKey(nd.t, nd.pos, nd.size))
                    if (s !== undefined) src = s
                }
                const dir = src.type === SsType.Flick ? resolveFlickDir(src) : 0
                const laneM = f32(laneOf(lanef, wf))
                infos.push({
                    t: nd.t,
                    bar: bp.bar,
                    prog: bp.progress,
                    lane: roundHalfEven(laneM),
                    lanef: laneM,
                    width: Math.max(1, roundHalfEven(wf)),
                    widthf: wf,
                    op,
                    dir: dirOf(dir),
                    easeL: mirror ? convertEase(nd.easeR) : convertEase(nd.easeL),
                    easeR: mirror ? convertEase(nd.easeL) : convertEase(nd.easeR),
                    crit: nd.crit,
                    along: nd.posAuto,
                    lines: [li],
                    src: nd,
                })
            }
            assigner.register(li, nodes[last]!.t)
        }
    }
    buildLongOrGuide(true)
    buildLongOrGuide(false)

    const dic = new Map<number, Map<number, NoteInfo[]>>()
    let dropped = 0
    let merged = 0
    for (const inf of infos) {
        const key = posKey(inf)
        let lanes = dic.get(key)
        if (!lanes) {
            lanes = new Map()
            dic.set(key, lanes)
        }
        let lst = lanes.get(inf.lane)
        if (!lst) {
            lst = []
            lanes.set(inf.lane, lst)
        }
        if (isMergeableEndpoint(inf.op) && inf.lines.length) {

            const hit = lst.find(
                (it) =>
                    it.op === inf.op &&
                    it.width === inf.width &&
                    it.crit === inf.crit &&
                    it.dir === inf.dir &&
                    it.easeL === inf.easeL &&
                    it.easeR === inf.easeR,
            )
            if (hit) {
                hit.lines.push(...inf.lines)
                merged++
                continue
            }
        }
        if (isJudgementNote(inf.op)) {
            if (lst.filter((it) => isJudgementNote(it.op)).length >= 3) {
                dropped++
                continue
            }
        }
        lst.push(inf)
    }

    let currentNoteId = 0
    let currentLineId = 0
    let currentGuideLineId = 0
    const lineArr: number[] = new Array<number>(LINE_INDEX_MAX).fill(-1)
    const glineArr: number[] = new Array<number>(LINE_INDEX_MAX).fill(-1)
    const beginByLine = new Map<number, GameNote>()
    const lineSlotById = new Map<number, number>()
    const lines: GameLine[] = []
    const lineById = new Map<number, GameLine>()
    const result = new Map<number, GameNote[]>()
    const creationOrder: GameNote[] = []
    let comboCount = 0
    let comboSkipCount = 0

    const makeNote = (id: number, pos: Pos, op: number, info: NoteInfo | null, lanef: number, widthf: number): GameNote => {
        const laneStartF = lanef
        const laneEndF = f32(f32(lanef + widthf) - f32(1))
        return {
            id,
            pos,
            op,
            along: info ? info.along : false,
            lineIds: [],
            slots: info ? [...info.lines] : [],
            view: [],
            combos: [],
            info,
            t: info ? info.t : -1,
            laneStartF,
            laneEndF,
            laneStartIndex: info ? info.lane : Math.floor(laneStartF),
            laneEndIndex: info ? info.lane + info.width - 1 : Math.ceil(laneEndF),
            width: info ? info.width : 1,
            crit: info ? info.crit : false,
            dir: info ? info.dir : 0,
            easeL: info ? info.easeL : 0,
            easeR: info ? info.easeR : 0,
            fever: false,
            pair: null,
        }
    }

    const lanePosition = (p: Pos, start: GameNote, end: GameNote): { laneStart: number; laneEnd: number } => {
        let t: number
        if (end.pos.ms !== start.pos.ms) t = f32(f32(p.ms - start.pos.ms) / f32(end.pos.ms - start.pos.ms))
        else {
            const span = f32(f32(end.pos.bar + end.pos.prog) - f32(start.pos.bar + start.pos.prog))
            t = span > 0 ? f32(f32(f32(p.bar + p.prog) - f32(start.pos.bar + start.pos.prog)) / span) : f32(1)
        }
        let e = easeF32(t, start.easeL)
        if (e < 0) e = 0
        if (e > 1) e = 1
        return {
            laneStart: f32(start.laneStartF + f32(e * f32(end.laneStartF - start.laneStartF))),
            laneEnd: f32(start.laneEndF + f32(e * f32(end.laneEndF - start.laneEndF))),
        }
    }

    const trySetSlideNoteId = (end: GameNote): { ok: boolean; begins: GameNote[] } => {
        const begins: GameNote[] = []
        for (const lid of end.lineIds) {
            const b = beginByLine.get(lid)
            if (!b) return { ok: false, begins }
            begins.push(b)
            const ns = b.view.filter((x) => x.lineIds.includes(lid))
            ns.sort((x, y) => x.pos.bar - y.pos.bar || x.pos.prog - y.pos.prog)
            ns.push(end)
            let cur = ns.find((x) => !x.along) ?? end
            let prev = b
            const start = b.pos
            const endp = end.pos
            const mids = ns.filter((x) => x !== end && isJudgementNote(x.op)).map((x) => x.pos)
            const bounds = [start, ...mids, endp]
            const ticks: Pos[] = []
            for (let s = 0; s + 1 < bounds.length; s++) ticks.push(...timing.eighths(bounds[s]!, bounds[s + 1]!))
            let k = 0
            for (let idx = 0; idx < ticks.length; idx++) {
                const p = ticks[idx]!
                if (ns.some((x) => isJudgementNote(x.op) && samePosition(x.pos, p))) continue
                const six = 15000.0 / timing.bpmAt(p.ms)
                let skip = mids.some((m) => p.ms < m.ms && !(m.ms - six > p.ms))
                if (idx === 0 && six > p.ms - start.ms) skip = true
                if (idx === ticks.length - 1 && six > endp.ms - p.ms) skip = true

                while (posKey(cur.pos) < posKey(p) && k < ns.length) {
                    const n2 = ns[k]!
                    k++
                    if (n2.id !== cur.id && !n2.along) {
                        prev = cur
                        cur = n2
                    }
                }
                const { laneStart, laneEnd } = lanePosition(p, prev, cur)
                const c: GameNote = {
                    id: lid + 10000 * idx + 10000,
                    pos: p,
                    op: skip ? NoteOp.ComboSkip : NoteOp.Combo,
                    along: false,
                    lineIds: [lid],
                    slots: [lineSlotById.get(lid) ?? -1],
                    view: [],
                    combos: [],
                    info: null,
                    t: -1,
                    laneStartF: laneStart,
                    laneEndF: laneEnd,

                    laneStartIndex: Math.floor(laneStart),
                    laneEndIndex: Math.ceil(laneEnd),
                    width: f32(f32(laneEnd - laneStart) + f32(1)),
                    crit: false,
                    dir: 0,
                    easeL: 0,
                    easeR: 0,
                    fever: false,
                    pair: null,
                }
                b.combos.push(c)
            }
        }
        return { ok: true, begins }
    }

    const addResult = (key: number, note: GameNote) => {
        let bucket = result.get(key)
        if (!bucket) {
            bucket = []
            result.set(key, bucket)
        }
        bucket.push(note)
    }

    let pairTmp: GameNote | null = null
    const isPairAllowed = (op: number) => op === 1 || op === 20 || op === 22 || (op >= 40 && op <= 42)
    const pairs: [GameNote, GameNote][] = []

    const keys = [...dic.keys()].sort((a, b) => a - b)
    for (const key of keys) {
        const seq: NoteInfo[] = []
        for (const lst of dic.get(key)!.values()) seq.push(...lst)
        seq.sort((a, b) => sortOrder(a.op) - sortOrder(b.op))
        for (const inf of seq) {
            const op = inf.op
            const pos = timing.makePos(inf.bar, inf.prog)
            currentNoteId++
            const note = makeNote(currentNoteId, pos, op, inf, inf.lanef, inf.widthf)
            const extra: GameNote[] = []

            if (op === 20 || op === 41 || op === 61 || op === 80) {

                for (const li of inf.lines) {
                    currentLineId++
                    note.lineIds.push(currentLineId)
                    lineArr[li] = currentLineId
                    beginByLine.set(currentLineId, note)
                    lineSlotById.set(currentLineId, li)
                    const line: GameLine = { id: currentLineId, slot: li, type: 1, begin: note, end: null, nodes: [] }
                    lines.push(line)
                    lineById.set(currentLineId, line)
                }
            } else if (op === 100 || op === 101 || op === 102 || op === 104) {

                for (const li of inf.lines) {
                    const id = currentGuideLineId++ + 10001
                    note.lineIds.push(id)
                    glineArr[li] = id
                    beginByLine.set(id, note)
                    lineSlotById.set(id, li)
                    const line: GameLine = { id, slot: li, type: 2, begin: note, end: null, nodes: [] }
                    lines.push(line)
                    lineById.set(id, line)
                }
            } else if (op === 21) {
                const lid = lineArr[inf.lines[0]!]!
                note.lineIds = [lid]
                beginByLine.get(lid)?.view.push(note)
            } else if (op === 63) {
                const lid = glineArr[inf.lines[0]!]!
                note.lineIds = [lid]
                beginByLine.get(lid)?.view.push(note)
            } else if (op === 122) {
                let v = lineArr[inf.lines[0]!]!
                if (v <= 0) v = glineArr[inf.lines[0]!]!
                note.lineIds = [v]
                beginByLine.get(v)?.view.push(note)
            } else if (op === 22 || op === 42 || op === 62 || op === 82 || op === 105) {
                for (const li of inf.lines) {
                    if (op !== 105) {
                        note.lineIds.push(lineArr[li]!)
                        lineArr[li] = -1
                    } else {
                        note.lineIds.push(glineArr[li]!)
                        glineArr[li] = -1
                    }
                }
                const { ok, begins } = trySetSlideNoteId(note)
                if (ok) {
                    for (const b of begins) {
                        b.view.push(note)
                        if (b.op === 20 || b.op === 41 || b.op === 61 || b.op === 80 || b.op === 104) extra.push(...b.combos)
                    }
                }
                for (const lid of note.lineIds) {
                    const line = lineById.get(lid)
                    if (line) line.end = note
                }
            } else if (op === 103) {
                for (const li of inf.lines) {
                    note.lineIds.push(glineArr[li]!)
                    glineArr[li] = -1
                }
                const { ok, begins } = trySetSlideNoteId(note)
                if (ok) for (const b of begins) b.view.push(note)
                for (const lid of note.lineIds) {
                    const line = lineById.get(lid)
                    if (line) line.end = note
                }
            }

            if (isPairAllowed(op)) {
                if (pairTmp && samePosition(pairTmp.pos, note.pos)) {
                    note.pair = pairTmp
                    pairs.push([pairTmp, note])
                }
                pairTmp = note
            }

            addResult(key, note)
            creationOrder.push(note)
            for (const c of extra) {
                const ck = posKey(c.pos)
                let bucket = result.get(ck)
                if (!bucket) {
                    bucket = []
                    result.set(ck, bucket)
                }
                if (!bucket.some((x) => x.id === c.id)) {
                    bucket.push(c)
                    creationOrder.push(c)
                    if (c.op === NoteOp.Combo) comboCount++
                    else comboSkipCount++
                }
            }
        }
    }

    for (const line of lines) {
        const vs = line.begin.view.filter((x) => x.lineIds.includes(line.id))
        vs.sort((x, y) => x.pos.bar - y.pos.bar || x.pos.prog - y.pos.prog)
        line.nodes = [line.begin, ...vs]
    }

    const ev = root.score.events
    const fevers: FeverRange[] = [...(ev.fever ?? [])]
        .sort((a, b) => a[0] - b[0])
        .map(([a, b]) => {
            const pa = tc.barPosition(a)
            const pb = tc.barPosition(b)
            return {
                start: { bar: pa.bar, prog: pa.progress, ms: tc.tickToTimeMs(a) },
                end: { bar: pb.bar, prog: pb.progress, ms: tc.tickToTimeMs(b) },
            }
        })
    const skills: Pos[] = (ev.skill ?? []).map((t) => {
        const bp = tc.barPosition(t)
        return { bar: bp.bar, prog: bp.progress, ms: tc.tickToTimeMs(t) }
    })
    for (const n of creationOrder) {

        const k = posKey(n.pos)
        n.fever = fevers.some((f) => posKey(f.start) <= k && k <= posKey(f.end))
    }
    let maxBar = 0
    for (const n of creationOrder) if (n.pos.bar > maxBar) maxBar = n.pos.bar
    const barLineMs: number[] = []
    for (let b = 0; b <= maxBar; b++) barLineMs.push(tc.barHeadTimeMs(b))

    const judged = creationOrder.filter((n) => isJudgementNote(n.op)).length

    return {
        notes: creationOrder,
        dictOrder: [...result.values()].flat(),
        lines,
        pairs,
        fevers,
        skills,
        barLineMs,
        tc,
        timing,
        stats: { merged, dropped, judged, combo: comboCount, comboSkip: comboSkipCount },
    }
}
