import { gunzipSync } from 'node:zlib'
import { readFileSync } from 'node:fs'

export type SsEaseName = 'in' | 'out' | 'linear'
export type SsTypeName = 'tap' | 'flick' | 'trace' | 'long' | 'guide' | 'node'
export type SsDirName = 'left' | 'right' | 'up' | 'down'

export type SsJsonNote = {
    type?: SsTypeName
    t?: number
    pos?: number | 'auto'
    size?: number
    crit?: boolean
    dir?: SsDirName
    ease?: SsEaseName | [SsEaseName, SsEaseName]
    visible?: boolean
    alpha?: 'none' | 'in' | 'out'
    node?: SsJsonNote[]
}

export type SsEvents = {
    bpm?: { t: number; bpm: number }[]
    sig?: { t: number; sig: [number, number] }[]
    skill?: number[]
    fever?: [number, number][]
    call?: { t: number; timing: number[] }[]
}

export type SsRoot = {
    meta?: { version?: number; lanes?: number }
    score: {
        events: SsEvents
        notes: SsJsonNote[]
    }
}

export const SsType = { Tap: 0, Flick: 1, Trace: 2, Long: 3, Guide: 4, Node: 5 } as const

export const SsFlickDir = { Up: 0, Left: 1, Right: 2, Down: 3 } as const

export const SsEase = { Linear: 0, In: 1, Out: 2 } as const

const f32 = Math.fround

export type SsNoteModel = {
    type: number
    t: number

    pos: number
    posAuto: boolean

    size: number
    crit: boolean
    dir: number
    easeL: number
    easeR: number
    visible: boolean
    alpha: number
    node: SsNoteModel[] | null
}

const parseType = (s: string | undefined): number => {
    switch (s) {
        case undefined:
            return SsType.Tap
        case 'tap':
            return SsType.Tap
        case 'flick':
            return SsType.Flick
        case 'trace':
            return SsType.Trace
        case 'long':
            return SsType.Long
        case 'guide':
            return SsType.Guide
        case 'node':
            return SsType.Node
    }
    throw new Error(`SsRootDeserializer.ParseType: unknown type "${s}"`)
}

const parseDir = (s: string | undefined): number => {
    switch (s) {
        case undefined:
            return SsFlickDir.Up
        case 'up':
            return SsFlickDir.Up
        case 'left':
            return SsFlickDir.Left
        case 'right':
            return SsFlickDir.Right
        case 'down':
            return SsFlickDir.Down
    }
    throw new Error(`SsRootDeserializer.ParseFlickDir: unknown dir "${s}"`)
}

const parseEase = (s: string | undefined): number => {
    switch (s) {
        case undefined:
            return SsEase.Linear
        case 'linear':
            return SsEase.Linear
        case 'in':
            return SsEase.In
        case 'out':
            return SsEase.Out
    }
    throw new Error(`SsRootDeserializer.ParseEase: unknown ease "${s}"`)
}

const parseFade = (s: string | undefined): number => {
    switch (s) {
        case undefined:
        case 'none':
            return 0
        case 'in':
            return 1
        case 'out':
            return 2
    }
    throw new Error(`SsRootDeserializer.ParseFade: unknown alpha "${s}"`)
}

export const readNote = (o: SsJsonNote): SsNoteModel => {
    const n: SsNoteModel = {
        type: SsType.Tap,
        t: 0,
        pos: 0,
        posAuto: false,
        size: 6,
        crit: false,
        dir: 0,
        easeL: 0,
        easeR: 0,
        visible: true,
        alpha: 0,
        node: null,
    }
    if (typeof o.type === 'string') n.type = parseType(o.type)
    if (o.t !== undefined) n.t = Math.trunc(o.t)
    if (o.pos !== undefined) {
        if (typeof o.pos === 'string') {
            if (o.pos === 'auto') n.posAuto = true
            else throw new Error(`pos string "${o.pos}"`)
        } else n.pos = f32(o.pos)
    }
    if (o.size !== undefined) n.size = f32(o.size)
    if (o.crit !== undefined) n.crit = !!o.crit
    if (typeof o.dir === 'string') n.dir = parseDir(o.dir)
    if (Array.isArray(o.ease)) {
        n.easeL = parseEase(o.ease[0])
        n.easeR = parseEase(o.ease[1])
    } else if (typeof o.ease === 'string') {
        n.easeL = n.easeR = parseEase(o.ease)
    }
    if (o.visible !== undefined) n.visible = !!o.visible
    if (typeof o.alpha === 'string') n.alpha = parseFade(o.alpha)
    if (Array.isArray(o.node)) n.node = o.node.map(readNote)
    return n
}

export const parseChart = (bytes: Buffer): SsRoot => {
    let raw = bytes
    if (raw.length >= 2 && raw[0] === 0x1f && raw[1] === 0x8b) raw = gunzipSync(raw)
    const text = raw.toString('utf8')
    if (text.startsWith('#TITLE') || text.startsWith('#LANECOUNT')) {
        throw new Error('SUS text score (dev leftover) - the 1.0.1 client has no SUS parser')
    }
    const root = JSON.parse(text) as SsRoot
    if (!root.score || !Array.isArray(root.score.notes)) throw new Error('not an Ss chart: missing score.notes')
    if (!root.score.events) root.score.events = {}
    return root
}

export const loadChart = (path: string): SsRoot => parseChart(readFileSync(path))

export const readNotes = (root: SsRoot): SsNoteModel[] => root.score.notes.map(readNote)
