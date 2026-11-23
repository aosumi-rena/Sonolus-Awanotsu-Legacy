import type { LevelData, LevelDataEntity } from '@sonolus/core'
import { ArchetypeName, DataName, TICKS_PER_BEAT, introStartMsOf } from '../shared/src/engine/data/level.js'
import { addLineExtent, lineMembershipCount } from '../shared/src/engine/data/lineState.js'
import { NoteOp } from '../shared/src/engine/data/notes.js'
import type { SsRoot } from './chart.js'
import { buildNotes, type BuildResult, type GameNote } from './notes.js'
import { isJudgementNote } from './ops.js'

export type ConvertOptions = {

    mirror?: boolean

    bgmOffset?: number

    leadInMs?: number

    bgZoom?: number

    bgBand?: number

    simLines?: boolean

    meta?: LiveMetaOptions
}

export type LiveMetaOptions = {
    rankC: number
    rankB: number
    rankA: number
    rankS: number
    rankSS: number
    apScore?: number
    difficulty?: number
    level?: number
}

export type ConvertResult = {
    data: LevelData
    build: BuildResult
    stats: {
        judgementNotes: number
        comboNotes: number
        comboSkipNotes: number
        mergedEndpoints: number
        simLines: number
        connectors: number
        durationMs: number

        lastJudgedMs: number
        lastPassMs: number
    }
}

const num = (name: string, value: number) => ({ name, value })
const ref = (name: string, ref: string) => ({ name, ref })

function rhythmSupportClass(build: BuildResult, note: GameNote): number {
    const op = note.op
    if (op !== NoteOp.Normal && op !== NoteOp.SlideBegin && op !== NoteOp.Flick && op !== NoteOp.SlideBeginFlick) return 0
    const { rhythm } = build.tc.barPosition(note.t)
    if (rhythm % TICKS_PER_BEAT === 0) return 1
    return rhythm % (TICKS_PER_BEAT / 2) === 0 ? 2 : 3
}

export const archetypeOf = (n: GameNote): string => {
    switch (n.op) {
        case NoteOp.Normal:
            return ArchetypeName.TapNote
        case NoteOp.Flick:
            return ArchetypeName.FlickNote
        case NoteOp.Trace:
            return ArchetypeName.TraceNote
        case NoteOp.SlideBegin:
            return ArchetypeName.SlideStartNote
        case NoteOp.SlideBeginFlick:
            return ArchetypeName.SlideStartFlickNote
        case NoteOp.SlideBeginTrace:
            return ArchetypeName.SlideStartTraceNote
        case NoteOp.HiddenSlideBegin:
            return ArchetypeName.SlideHiddenStartNote
        case NoteOp.SlideConnection:
            return ArchetypeName.SlideTickNote
        case NoteOp.SlideConnectionTrace:
            return ArchetypeName.SlideTraceTickNote
        case NoteOp.Hidden:
            return n.lineIds[0] !== undefined && n.lineIds[0] >= 10001 ? ArchetypeName.GuideAnchorNote : ArchetypeName.SlideAnchorNote
        case NoteOp.Combo:
            return ArchetypeName.SlideComboNote
        case NoteOp.ComboSkip:
            return ArchetypeName.SlideComboSkipNote
        case NoteOp.SlideEnd:
            return ArchetypeName.SlideEndNote
        case NoteOp.SlideEndFlick:
            return ArchetypeName.SlideEndFlickNote
        case NoteOp.SlideEndTrace:
            return ArchetypeName.SlideEndTraceNote
        case NoteOp.HiddenSlideEnd:
            return ArchetypeName.SlideHiddenEndNote
        case NoteOp.GuideBegin:
            return ArchetypeName.GuideHiddenStartNote
        case NoteOp.GuideBeginNormal:
            return ArchetypeName.GuideStartNote
        case NoteOp.GuideBeginFlick:
            return ArchetypeName.GuideStartFlickNote
        case NoteOp.GuideBeginTrace:
            return ArchetypeName.GuideStartTraceNote
        case NoteOp.GuideEnd:
            return ArchetypeName.GuideHiddenEndNote
        case NoteOp.GuideEndTrace:
            return ArchetypeName.GuideEndTraceNote
        default:
            throw new Error(`unmapped NoteOperateType ${n.op}`)
    }
}

export const convertChart = (root: SsRoot, opts: ConvertOptions = {}): ConvertResult => {
    const build = buildNotes(root, opts.mirror ?? false)
    const simLines = opts.simLines ?? true
    const lead = opts.leadInMs ?? 0
    if (!Number.isInteger(lead) || lead < 0) throw new Error(`leadInMs must be a non-negative integer (got ${lead})`)

    const lvl = (ms: number) => ms + lead

    const entities: LevelDataEntity[] = []

    entities.push({
        archetype: ArchetypeName.Initialization,
        data: lead > 0 ? [num(DataName.MusicStartMs, lead), num(DataName.IntroStartMs, introStartMsOf(lead))] : [],
    })
    const bgZoom = opts.bgZoom ?? 0
    if (!(bgZoom >= 0)) throw new Error(`bgZoom must be >= 0 (got ${bgZoom})`)
    const bgBand = opts.bgBand
    const withBand = bgZoom > 0 && bgBand !== undefined && Number.isInteger(bgBand) && bgBand >= 0 && bgBand <= 5
    entities.push({
        archetype: ArchetypeName.Stage,
        data: bgZoom > 0 ? [num(DataName.BgZoom, bgZoom), ...(withBand ? [num(DataName.BgBand, bgBand!)] : [])] : [],
    })
    if (opts.meta) {

        const m = opts.meta
        entities.push({
            name: 'meta',
            archetype: ArchetypeName.LiveMeta,
            data: [
                num(DataName.RankC, m.rankC),
                num(DataName.RankB, m.rankB),
                num(DataName.RankA, m.rankA),
                num(DataName.RankS, m.rankS),
                num(DataName.RankSS, m.rankSS),
                num(DataName.ApScore, m.apScore ?? 0),
                num(DataName.Difficulty, m.difficulty ?? 0),
                num(DataName.Level, m.level ?? 0),
            ],
        })
    }

    entities.push({ archetype: ArchetypeName.FxLayer, data: [] })
    for (const b of [...(root.score.events.bpm ?? [])].sort((a, b) => a.t - b.t)) {
        entities.push({
            archetype: ArchetypeName.BpmChange,
            data: [num(DataName.Beat, b.t / TICKS_PER_BEAT), num(DataName.Bpm, b.bpm)],
        })
    }

    const nameOf = (n: GameNote) => (n.op === NoteOp.Combo || n.op === NoteOp.ComboSkip ? `c${n.id}` : `n${n.id}`)
    const nameSeen = new Set<string>()

    const lineById = new Map(build.lines.map((l) => [l.id, l]))
    const memberLines = (n: GameNote) => n.lineIds.slice(0, lineMembershipCount(n.op, n.lineIds.length))
    const lineExt = new Map<number, { start: number; end: number }>()
    for (const n of build.dictOrder) {
        for (const lid of memberLines(n)) {
            let ext = lineExt.get(lid)
            if (!ext) lineExt.set(lid, (ext = { start: 0, end: 0 }))
            addLineExtent(ext, n.laneStartIndex, n.laneEndIndex)
        }
    }
    const longLineBegins = (n: GameNote) =>
        memberLines(n)
            .map((lid) => lineById.get(lid))
            .filter((l): l is NonNullable<typeof l> => l !== undefined && l.type === 1)
            .map((l) => l.begin)

    const notes = [...build.notes].sort((a, b) => a.pos.ms - b.pos.ms || a.id - b.id)
    for (const n of notes) {
        const name = nameOf(n)
        if (nameSeen.has(name)) throw new Error(`duplicate entity name ${name}`)
        nameSeen.add(name)
        const support = rhythmSupportClass(build, n)
        entities.push({
            name,
            archetype: archetypeOf(n),
            data: [
                num(DataName.Beat, n.t >= 0 ? n.t / TICKS_PER_BEAT : approxBeatFromMs(build, n.pos.ms)),
                num(DataName.Ms, lvl(n.pos.ms)),
                num(DataName.Pos, n.laneStartF),
                num(DataName.Size, n.op === NoteOp.Combo || n.op === NoteOp.ComboSkip ? n.width : (n.info?.widthf ?? n.width)),
                num(DataName.Lane, n.laneStartIndex),
                num(DataName.Width, n.info ? n.info.width : n.laneEndIndex - n.laneStartIndex + 1),
                num(DataName.Crit, n.crit ? 1 : 0),
                num(DataName.Dir, n.dir),
                num(DataName.Op, n.op),
                num(DataName.Auto, n.along ? 1 : 0),
                num(DataName.Slot, n.slots[0] ?? -1),
                num(DataName.SlotB, n.slots[1] ?? -1),
                num(DataName.Fever, n.fever ? 1 : 0),
                num(DataName.Id, n.id),
                ...longLineBegins(n)
                    .slice(0, 2)
                    .map((b, i) => ref(i === 0 ? DataName.Line0 : DataName.Line1, nameOf(b))),
                ...(support ? [num(DataName.RhythmSupportClass, support)] : []),
            ],
        })
    }

    let connectors = 0
    const linesByBegin = [...build.lines].sort((a, b) => a.begin.pos.ms - b.begin.pos.ms || a.id - b.id)
    for (const line of linesByBegin) {
        const start = line.begin
        const end = line.end ?? line.nodes[line.nodes.length - 1]!
        for (let i = 0; i + 1 < line.nodes.length; i++) {
            const head = line.nodes[i]!
            const tail = line.nodes[i + 1]!
            entities.push({
                name: `l${line.id}_${i}`,
                archetype: line.type === 1 ? ArchetypeName.SlideConnector : ArchetypeName.GuideConnector,
                data: [
                    ref(DataName.Head, nameOf(head)),
                    ref(DataName.Tail, nameOf(tail)),
                    ref(DataName.Start, nameOf(start)),
                    ref(DataName.End, nameOf(end)),
                    num(DataName.EaseL, head.easeL),
                    num(DataName.EaseR, head.easeR),
                    num(DataName.Slot, line.slot),
                    num(DataName.LineId, line.id),
                    num(DataName.Unit, i),
                    num(DataName.UnitCount, line.nodes.length - 1),
                    ...(line.type === 1 && lineExt.has(line.id)
                        ? [num(DataName.LineLaneStart, lineExt.get(line.id)!.start), num(DataName.LineLaneEndX, lineExt.get(line.id)!.end + 1)]
                        : []),
                ],
            })
            connectors++
        }
    }

    let simCount = 0
    if (simLines) {
        build.pairs.forEach(([a, b], i) => {
            entities.push({
                name: `s${i}`,
                archetype: ArchetypeName.SimLine,
                data: [ref(DataName.A, nameOf(a)), ref(DataName.B, nameOf(b))],
            })
            simCount++
        })
    }

    build.skills.forEach((p, i) => {
        entities.push({ name: `k${i}`, archetype: ArchetypeName.SkillMarker, data: [num(DataName.Ms, lvl(p.ms)), num(DataName.Beat, approxBeatFromMs(build, p.ms))] })
    })
    build.fevers.forEach((f, i) => {
        entities.push({
            name: `f${i}`,
            archetype: ArchetypeName.FeverRange,
            data: [num(DataName.Ms, lvl(f.start.ms)), num(DataName.EndMs, lvl(f.end.ms)), num(DataName.Beat, approxBeatFromMs(build, f.start.ms))],
        })
    })
    build.barLineMs.forEach((ms, i) => {
        entities.push({ name: `b${i}`, archetype: ArchetypeName.BarLine, data: [num(DataName.Ms, lvl(ms)), num(DataName.Beat, i * 4)] })
    })

    const judgementNotes = build.notes.filter((n) => isJudgementNote(n.op)).length
    const durationMs = build.notes.length ? Math.max(...build.notes.map((n) => n.pos.ms)) : 0
    let lastJudgedMs = -1
    let lastPassMs = -1
    for (const n of build.notes) {
        if (isJudgementNote(n.op)) lastJudgedMs = Math.max(lastJudgedMs, n.pos.ms)
        else lastPassMs = Math.max(lastPassMs, n.pos.ms)
    }

    return {
        data: { bgmOffset: opts.bgmOffset ?? 0, entities },
        build,
        stats: {
            judgementNotes,
            comboNotes: build.stats.combo,
            comboSkipNotes: build.stats.comboSkip,
            mergedEndpoints: build.stats.merged,
            simLines: simCount,
            connectors,
            durationMs,
            lastJudgedMs,
            lastPassMs,
        },
    }
}

const approxBeatFromMs = (build: BuildResult, ms: number): number => {
    const segs = build.tc.bpmSegments
    let seg = segs[0]!
    for (const s of segs) if (s.startTimeMs <= ms) seg = s
    const tick = seg.startTick + ((ms - seg.startTimeMs) * seg.bpm * TICKS_PER_BEAT) / 60000
    return tick / TICKS_PER_BEAT
}
