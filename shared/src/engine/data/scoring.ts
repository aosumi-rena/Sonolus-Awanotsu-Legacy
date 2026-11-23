export const comboBonus = {
    step: 10,
    phase1: { factor: 0.01, untilCombo: 100 },
    phase2: { factor: 0.005, untilCombo: 500 },
} as const

export const comboBonusFactor = (combo: number) => {
    const steps = Math.floor(combo / 10)
    const steps1 = steps < 10 ? steps : 10
    let steps2 = steps - 10
    if (steps2 < 0) steps2 = 0
    if (steps2 > 40) steps2 = 40
    return 1 + steps1 * 0.01 + steps2 * 0.005
}

export const baseScore = { perfect: 1, great: 0.8, good: 0.5 } as const
