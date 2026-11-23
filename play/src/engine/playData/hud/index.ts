import { PASS_NOTE_MISS_AFTER_MS } from '../../../../../shared/src/engine/data/finish.js'
import { isJudgementOp } from '../../../../../shared/src/engine/data/notes.js'
import { autoMissTime } from '../../../../../shared/src/engine/data/timing.js'
import { chartTime, layout } from '../layout.js'
import { setupHudLayout } from './canvas.js'
import { setupGlyphs } from './glyphs.js'
import { setupHudSprites } from './hudDraw.js'
import { setupHudOver } from './hudOver.js'
import { hudChart } from './hudQueue.js'
import { apWeightOf } from './hudState.js'
import { setupHudMetaDefaults } from './meta.js'
import { setupBuiltinUI } from './uiSetup.js'

export const setupHud = (aspect: number) => {
    setupHudLayout(aspect)
    setupGlyphs()
    setupHudSprites()
    setupHudMetaDefaults()
    setupBuiltinUI()

    setupHudOver()
}

export const setupHudChart = (
    firstNote: number,
    lastNote: number,
    connector: number,
    getNote: (index: number) => { ms: number; op: number },
    judgeShift: number,
) => {
    let fcc = 0
    let weight = 0
    let combo = 0
    let groupCombo = 0
    let lastMs = -1
    let lastPass = -1e9
    for (const info of entityInfos) {
        const a = info.archetype
        if (a < firstNote || a > lastNote || a === connector) continue
        const imp = getNote(info.index)

        lastPass = Math.max(lastPass, isJudgementOp(imp.op) ? -1e9 : imp.ms)
        if (!isJudgementOp(imp.op)) continue
        if (imp.ms !== lastMs) {
            groupCombo = combo
            lastMs = imp.ms
        }
        weight += apWeightOf(imp.op, groupCombo)
        combo++
        fcc++
    }
    hudChart.fcc = fcc
    hudChart.apWeight = weight
    hudChart.passDone =
        lastPass < -1e8 ? -1e9 : autoMissTime(chartTime(lastPass), layout.approachS, PASS_NOTE_MISS_AFTER_MS + Math.abs(judgeShift) * 1000) + judgeShift
}

export { LiveMeta } from './meta.js'
