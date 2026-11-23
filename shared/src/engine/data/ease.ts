import { LineEase } from './notes.js'

export const lineEase = (t: number, ease: number) => {
    if (ease === LineEase.EaseIn) return (2 - t) * t
    if (ease === LineEase.EaseOut) return t * t
    return t
}

export const chartEaseToLineEase = (s: string | undefined) => {
    if (s === 'in') return LineEase.EaseOut
    if (s === 'out') return LineEase.EaseIn
    return LineEase.Linear
}
