import { setupRankFx } from './rankFx.js'

export const LIVE_META_ARCHETYPE = 'LiveMeta'

export const MetaDataName = {
    RankC: 'rankC',
    RankB: 'rankB',
    RankA: 'rankA',
    RankS: 'rankS',
    RankSS: 'rankSS',
    ApScore: 'apScore',
    Difficulty: 'difficulty',
    Level: 'level',
    ExpandBase: 'expandBase',
} as const

export const hudMeta = levelMemory({
    rankC: Number,
    rankB: Number,
    rankA: Number,
    rankS: Number,
    rankSS: Number,

    rankMax: Number,

    apScore: Number,
    difficulty: Number,
    level: Number,

    expandBase: Number,
    hasMeta: Boolean,
})

export const DEFAULT_RANK = { c: 724018, b: 2236994, a: 5287427, s: 7280312, ss: 8905492 } as const

const roundHalfEvenNode = (x: number) => {
    const f = Math.floor(x)
    const d = x - f
    if (d < 0.5) return f
    if (d > 0.5) return f + 1
    return Math.mod(f, 2) === 0 ? f : f + 1
}

export const setupHudMetaDefaults = () => {
    hudMeta.rankC = DEFAULT_RANK.c
    hudMeta.rankB = DEFAULT_RANK.b
    hudMeta.rankA = DEFAULT_RANK.a
    hudMeta.rankS = DEFAULT_RANK.s
    hudMeta.rankSS = DEFAULT_RANK.ss
    hudMeta.rankMax = roundHalfEvenNode(1.2 * DEFAULT_RANK.ss)
    hudMeta.apScore = hudMeta.rankMax
    hudMeta.difficulty = 0
    hudMeta.level = 0
    hudMeta.expandBase = 0
    hudMeta.hasMeta = false
}

export class LiveMeta extends Archetype {
    import = this.defineImport({
        rankC: { name: MetaDataName.RankC, type: Number, def: DEFAULT_RANK.c },
        rankB: { name: MetaDataName.RankB, type: Number, def: DEFAULT_RANK.b },
        rankA: { name: MetaDataName.RankA, type: Number, def: DEFAULT_RANK.a },
        rankS: { name: MetaDataName.RankS, type: Number, def: DEFAULT_RANK.s },
        rankSS: { name: MetaDataName.RankSS, type: Number, def: DEFAULT_RANK.ss },
        apScore: { name: MetaDataName.ApScore, type: Number, def: 0 },
        difficulty: { name: MetaDataName.Difficulty, type: Number, def: 0 },
        level: { name: MetaDataName.Level, type: Number, def: 0 },
        expandBase: { name: MetaDataName.ExpandBase, type: Number, def: 0 },
    })

    preprocess() {
        hudMeta.rankC = this.import.rankC || DEFAULT_RANK.c
        hudMeta.rankB = this.import.rankB || DEFAULT_RANK.b
        hudMeta.rankA = this.import.rankA || DEFAULT_RANK.a
        hudMeta.rankS = this.import.rankS || DEFAULT_RANK.s
        hudMeta.rankSS = this.import.rankSS || DEFAULT_RANK.ss
        hudMeta.rankMax = roundHalfEvenNode(1.2 * hudMeta.rankSS)
        hudMeta.apScore = this.import.apScore > 0 ? this.import.apScore : hudMeta.rankMax
        hudMeta.difficulty = this.import.difficulty
        hudMeta.level = this.import.level
        hudMeta.expandBase = this.import.expandBase > 0 ? 1 : 0
        hudMeta.hasMeta = true

        setupRankFx()
    }
}
