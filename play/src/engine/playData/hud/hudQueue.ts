import { SimJudgement } from '../../../../../shared/src/engine/data/notes.js'
import { options } from '../../configuration/options.js'
import {
    HudState,
    JudgeResultPosition,
    MISS_SPLASH_LEN,
    NONE_TIME,
    hudBeginBatch,
    hudCommitFrameViews,
    hudEndBatch,
    hudFoldJudgement,
    hudMiss,
    hudTally,
    popupPoolShow,
} from './hudState.js'

export const QUEUE = 64

export const CHUNK = 32

export const hudQueue = levelMemory({
    seq: Number,
    sim: Tuple(QUEUE, Number),
    op: Tuple(QUEUE, Number),
    timing: Tuple(QUEUE, Number),
    diffMs: Tuple(QUEUE, Number),

    noteTime: Tuple(QUEUE, Number),

    hit: Tuple(QUEUE, Number),

    c: Tuple(QUEUE, Number),
    w: Tuple(QUEUE, Number),
})

export const hudPushJudgement = (
    sim: number,
    op: number,
    timing: number,
    diffMs: number,
    noteTime: number,
    hit: number,
    c: number,
    w: number,
) => {
    const i = Math.mod(hudQueue.seq, QUEUE)
    hudQueue.sim.set(i, sim)
    hudQueue.op.set(i, op)
    hudQueue.timing.set(i, timing)
    hudQueue.diffMs.set(i, diffMs)
    hudQueue.noteTime.set(i, noteTime)
    hudQueue.hit.set(i, hit)
    hudQueue.c.set(i, c)
    hudQueue.w.set(i, w)
    hudQueue.seq += 1
}

export const hudQueuePending = (s: ContainerType<typeof HudState>) => hudQueue.seq - s.folded

export const hudFoldQueue = (s: ContainerType<typeof HudState>, withScore: boolean) => {
    let start = s.folded
    if (hudQueue.seq - start > QUEUE) start = hudQueue.seq - QUEUE
    if (start >= hudQueue.seq) return
    hudBeginBatch(s)

    const score0 = s.score
    const life0 = s.life
    let at = NONE_TIME
    for (let i = start; i < hudQueue.seq; i++) {
        const k = Math.mod(i, QUEUE)
        hudFoldJudgement(s, hudQueue.sim.get(k), hudQueue.op.get(k), hudQueue.timing.get(k), hudQueue.diffMs.get(k), hudQueue.noteTime.get(k), hudQueue.hit.get(k), withScore)
        at = Math.max(at, hudQueue.hit.get(k))
    }
    hudEndBatch(s)
    if (withScore) hudCommitFrameViews(s, score0, life0, at)
    s.folded = hudQueue.seq
}

export const hudTallyQueue = (s: ContainerType<typeof HudState>) => {
    const first = Math.max(s.folded, hudQueue.seq - QUEUE)

    const laneMode = options.judgeResultPosition === JudgeResultPosition.Lane
    let comboReset = false
    if (laneMode) {
        for (let i = first; i < hudQueue.seq; i++) {
            const row = hudQueue.sim.get(Math.mod(i, QUEUE))
            if (row === SimJudgement.Miss || row === SimJudgement.Bad) comboReset = true
        }
    }
    for (let i = first; i < hudQueue.seq; i++) {
        const k = Math.mod(i, QUEUE)
        const row = hudQueue.sim.get(k)
        hudTally.n.set(row, hudTally.n.get(row) + 1)
        const hit = hudQueue.hit.get(k)

        if (options.damageEffect && row === SimJudgement.Miss && (hudMiss.start === NONE_TIME || hit - hudMiss.start >= MISS_SPLASH_LEN)) hudMiss.start = hit
        if (laneMode) popupPoolShow(row, hudQueue.timing.get(k), hudQueue.diffMs.get(k), hit, hudQueue.c.get(k), comboReset, time.now)
    }
}

export const hudChart = levelMemory({

    fcc: Number,

    apWeight: Number,

    passDone: Number,
})
