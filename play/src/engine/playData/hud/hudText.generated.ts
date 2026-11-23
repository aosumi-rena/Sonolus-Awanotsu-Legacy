import type { skin } from '../skin.js'

export const HUD_TEXT_SCALE = 1
export const FONT_POINT = 80
export const FONT_ASCENDER = 66.4
export const FONT_DESCENDER = -13.6

export const REGULAR_STYLE_SPACING = 0.14

export const HUD_DIGIT_SETS = {
    d44: { pt: 44, glyphs: [[-5, -8, 32, 44, 26.666406], [-6, -7, 20, 43, 16.852344], [-6, -7, 31, 44, 25.076563], [-6, -8, 31, 44, 25.033594], [-6, -7, 32, 43, 25.961719], [-6, -8, 31, 43, 25.471875], [-5, -8, 32, 44, 26.271094], [-6, -7, 29, 43, 23.100000], [-5, -8, 32, 44, 26.485937], [-6, -8, 31, 44, 26.228125], [0, 0, 0, 0, 0]] },
    d44Dim: { pt: 44, glyphs: [[-5, -8, 32, 44, 26.666406], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]] },
    d30Glow: { pt: 30, glyphs: [[-4, -5, 22, 30, 18.181641], [-4, -5, 14, 30, 11.490234], [-4, -5, 21, 30, 17.097656], [-4, -5, 21, 30, 17.068359], [-5, -5, 22, 29, 17.701172], [-4, -5, 21, 29, 17.367188], [-4, -5, 22, 30, 17.912109], [-5, -5, 20, 29, 15.750000], [-4, -5, 22, 30, 18.058594], [-4, -5, 22, 30, 17.882812], [0, 0, 0, 0, 0]] },
    d30Danger: { pt: 30, glyphs: [[-2, -4, 20, 28, 18.181641], [-3, -3, 12, 28, 11.490234], [-2, -3, 19, 28, 17.097656], [-2, -4, 19, 28, 17.068359], [-3, -3, 20, 27, 17.701172], [-2, -4, 19, 27, 17.367188], [-2, -4, 20, 28, 17.912109], [-3, -3, 18, 27, 15.750000], [-2, -4, 20, 28, 18.058594], [-2, -4, 20, 28, 17.882812], [0, 0, 0, 0, 0]] },
    d26: { pt: 26, glyphs: [[-2, -3, 17, 24, 15.757422], [-2, -3, 11, 24, 9.958203], [-2, -3, 17, 24, 14.817969], [-2, -3, 17, 24, 14.792578], [-2, -3, 18, 24, 15.341016], [-2, -3, 17, 24, 15.051562], [-2, -3, 17, 24, 15.523828], [-2, -3, 16, 24, 13.650000], [-2, -3, 17, 24, 15.650781], [-2, -3, 17, 24, 15.498437], [0, 0, 0, 0, 0]] },
    d24: { pt: 24, glyphs: [[-3, -4, 18, 24, 14.545312], [-4, -4, 11, 24, 9.192187], [-3, -4, 17, 24, 13.678125], [-4, -4, 17, 24, 13.654687], [-4, -4, 18, 24, 14.160937], [-3, -4, 17, 24, 13.893750], [-3, -4, 18, 24, 14.329688], [-4, -4, 16, 24, 12.600000], [-3, -4, 18, 24, 14.446875], [-3, -4, 17, 24, 14.306250], [-3, 0, 16, 20, 13.031250]] },
    d30: { pt: 30, glyphs: [[0, -2, 19, 27, 18.181641], [-1, -2, 11, 26, 11.490234], [-1, -2, 18, 27, 17.097656], [-1, -2, 18, 27, 17.068359], [-1, -2, 19, 26, 17.701172], [-1, -2, 18, 26, 17.367188], [0, -2, 19, 27, 17.912109], [-1, -2, 17, 26, 15.750000], [-1, -2, 19, 27, 18.058594], [-1, -2, 18, 27, 17.882812], [0, 0, 0, 0, 0]] },
} as const

export const HUD_DIGIT_KERN = [0, 0, 0, 0, 0, 0, 0, -1.04, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.4, 0, -0.8, -0.8, -3.2, 0, 0, 0, 0, 0, 0, 0, -0.8, 0, 0, 0.8, 0, 0, -0.8, 0, 0, 0, 0, -0.32, 0, 0, 1.6, 0, 0, -2.4, 0, 0, 0, 0, -1.12, 0.8, 0, 0, 0.8, 0, -1.6, 1.2, 0, 0, 0, -1.2, 0, 0, 0, 0, 0, -1.2, 0, 0, 0, -0.4, 2.8, -0.4, -0.8, -4.8, 0, -0.8, 0.8, -1.6, 0, -3.2, 0, 0, 0, 0, 0, 0, 0, -1.6, 0, -0.8, 0, 0, 0, 0, 0, 0, 0, 0, -1.2, 0, 0, 0, 0, -2.4, 0, 0, 0, 0, 0, -4.8, 0, 0, 0] as const

type HudTab = { set(index: number, value: number): void }

export const fillHudGlyphTables = (t: { pt: HudTab; L: HudTab; B: HudTab; R: HudTab; T: HudTab; adv: HudTab; ctr: HudTab; kern: HudTab }) => {
    t.pt.set(0, 44)
    t.L.set(0, -5); t.B.set(0, -8); t.R.set(0, 32); t.T.set(0, 44); t.adv.set(0, 26.666406); t.ctr.set(0, 13.328906)
    t.L.set(1, -6); t.B.set(1, -7); t.R.set(1, 20); t.T.set(1, 43); t.adv.set(1, 16.852344); t.ctr.set(1, 7.059766)
    t.L.set(2, -6); t.B.set(2, -7); t.R.set(2, 31); t.T.set(2, 44); t.adv.set(2, 25.076563); t.ctr.set(2, 12.538281)
    t.L.set(3, -6); t.B.set(3, -8); t.R.set(3, 31); t.T.set(3, 44); t.adv.set(3, 25.033594); t.ctr.set(3, 12.340625)
    t.L.set(4, -6); t.B.set(4, -7); t.R.set(4, 32); t.T.set(4, 43); t.adv.set(4, 25.961719); t.ctr.set(4, 13.023828)
    t.L.set(5, -6); t.B.set(5, -8); t.R.set(5, 31); t.T.set(5, 43); t.adv.set(5, 25.471875); t.ctr.set(5, 12.761719)
    t.L.set(6, -5); t.B.set(6, -8); t.R.set(6, 32); t.T.set(6, 44); t.adv.set(6, 26.271094); t.ctr.set(6, 13.328906)
    t.L.set(7, -6); t.B.set(7, -7); t.R.set(7, 29); t.T.set(7, 43); t.adv.set(7, 23.100000); t.ctr.set(7, 11.550000)
    t.L.set(8, -5); t.B.set(8, -8); t.R.set(8, 32); t.T.set(8, 44); t.adv.set(8, 26.485937); t.ctr.set(8, 13.247266)
    t.L.set(9, -6); t.B.set(9, -8); t.R.set(9, 31); t.T.set(9, 44); t.adv.set(9, 26.228125); t.ctr.set(9, 12.890625)
    t.pt.set(1, 44)
    t.L.set(11, -5); t.B.set(11, -8); t.R.set(11, 32); t.T.set(11, 44); t.adv.set(11, 26.666406); t.ctr.set(11, 13.328906)
    t.pt.set(2, 30)
    t.L.set(22, -4); t.B.set(22, -5); t.R.set(22, 22); t.T.set(22, 30); t.adv.set(22, 18.181641); t.ctr.set(22, 9.087891)
    t.L.set(23, -4); t.B.set(23, -5); t.R.set(23, 14); t.T.set(23, 30); t.adv.set(23, 11.490234); t.ctr.set(23, 4.813477)
    t.L.set(24, -4); t.B.set(24, -5); t.R.set(24, 21); t.T.set(24, 30); t.adv.set(24, 17.097656); t.ctr.set(24, 8.548828)
    t.L.set(25, -4); t.B.set(25, -5); t.R.set(25, 21); t.T.set(25, 30); t.adv.set(25, 17.068359); t.ctr.set(25, 8.414062)
    t.L.set(26, -5); t.B.set(26, -5); t.R.set(26, 22); t.T.set(26, 29); t.adv.set(26, 17.701172); t.ctr.set(26, 8.879883)
    t.L.set(27, -4); t.B.set(27, -5); t.R.set(27, 21); t.T.set(27, 29); t.adv.set(27, 17.367188); t.ctr.set(27, 8.701172)
    t.L.set(28, -4); t.B.set(28, -5); t.R.set(28, 22); t.T.set(28, 30); t.adv.set(28, 17.912109); t.ctr.set(28, 9.087891)
    t.L.set(29, -5); t.B.set(29, -5); t.R.set(29, 20); t.T.set(29, 29); t.adv.set(29, 15.750000); t.ctr.set(29, 7.875000)
    t.L.set(30, -4); t.B.set(30, -5); t.R.set(30, 22); t.T.set(30, 30); t.adv.set(30, 18.058594); t.ctr.set(30, 9.032227)
    t.L.set(31, -4); t.B.set(31, -5); t.R.set(31, 22); t.T.set(31, 30); t.adv.set(31, 17.882812); t.ctr.set(31, 8.789062)
    t.pt.set(3, 30)
    t.L.set(33, -2); t.B.set(33, -4); t.R.set(33, 20); t.T.set(33, 28); t.adv.set(33, 18.181641); t.ctr.set(33, 9.087891)
    t.L.set(34, -3); t.B.set(34, -3); t.R.set(34, 12); t.T.set(34, 28); t.adv.set(34, 11.490234); t.ctr.set(34, 4.813477)
    t.L.set(35, -2); t.B.set(35, -3); t.R.set(35, 19); t.T.set(35, 28); t.adv.set(35, 17.097656); t.ctr.set(35, 8.548828)
    t.L.set(36, -2); t.B.set(36, -4); t.R.set(36, 19); t.T.set(36, 28); t.adv.set(36, 17.068359); t.ctr.set(36, 8.414062)
    t.L.set(37, -3); t.B.set(37, -3); t.R.set(37, 20); t.T.set(37, 27); t.adv.set(37, 17.701172); t.ctr.set(37, 8.879883)
    t.L.set(38, -2); t.B.set(38, -4); t.R.set(38, 19); t.T.set(38, 27); t.adv.set(38, 17.367188); t.ctr.set(38, 8.701172)
    t.L.set(39, -2); t.B.set(39, -4); t.R.set(39, 20); t.T.set(39, 28); t.adv.set(39, 17.912109); t.ctr.set(39, 9.087891)
    t.L.set(40, -3); t.B.set(40, -3); t.R.set(40, 18); t.T.set(40, 27); t.adv.set(40, 15.750000); t.ctr.set(40, 7.875000)
    t.L.set(41, -2); t.B.set(41, -4); t.R.set(41, 20); t.T.set(41, 28); t.adv.set(41, 18.058594); t.ctr.set(41, 9.032227)
    t.L.set(42, -2); t.B.set(42, -4); t.R.set(42, 20); t.T.set(42, 28); t.adv.set(42, 17.882812); t.ctr.set(42, 8.789062)
    t.pt.set(4, 26)
    t.L.set(44, -2); t.B.set(44, -3); t.R.set(44, 17); t.T.set(44, 24); t.adv.set(44, 15.757422); t.ctr.set(44, 7.876172)
    t.L.set(45, -2); t.B.set(45, -3); t.R.set(45, 11); t.T.set(45, 24); t.adv.set(45, 9.958203); t.ctr.set(45, 4.171680)
    t.L.set(46, -2); t.B.set(46, -3); t.R.set(46, 17); t.T.set(46, 24); t.adv.set(46, 14.817969); t.ctr.set(46, 7.408984)
    t.L.set(47, -2); t.B.set(47, -3); t.R.set(47, 17); t.T.set(47, 24); t.adv.set(47, 14.792578); t.ctr.set(47, 7.292187)
    t.L.set(48, -2); t.B.set(48, -3); t.R.set(48, 18); t.T.set(48, 24); t.adv.set(48, 15.341016); t.ctr.set(48, 7.695898)
    t.L.set(49, -2); t.B.set(49, -3); t.R.set(49, 17); t.T.set(49, 24); t.adv.set(49, 15.051562); t.ctr.set(49, 7.541016)
    t.L.set(50, -2); t.B.set(50, -3); t.R.set(50, 17); t.T.set(50, 24); t.adv.set(50, 15.523828); t.ctr.set(50, 7.876172)
    t.L.set(51, -2); t.B.set(51, -3); t.R.set(51, 16); t.T.set(51, 24); t.adv.set(51, 13.650000); t.ctr.set(51, 6.825000)
    t.L.set(52, -2); t.B.set(52, -3); t.R.set(52, 17); t.T.set(52, 24); t.adv.set(52, 15.650781); t.ctr.set(52, 7.827930)
    t.L.set(53, -2); t.B.set(53, -3); t.R.set(53, 17); t.T.set(53, 24); t.adv.set(53, 15.498437); t.ctr.set(53, 7.617188)
    t.pt.set(5, 24)
    t.L.set(55, -3); t.B.set(55, -4); t.R.set(55, 18); t.T.set(55, 24); t.adv.set(55, 14.545312); t.ctr.set(55, 7.270313)
    t.L.set(56, -4); t.B.set(56, -4); t.R.set(56, 11); t.T.set(56, 24); t.adv.set(56, 9.192187); t.ctr.set(56, 3.850781)
    t.L.set(57, -3); t.B.set(57, -4); t.R.set(57, 17); t.T.set(57, 24); t.adv.set(57, 13.678125); t.ctr.set(57, 6.839062)
    t.L.set(58, -4); t.B.set(58, -4); t.R.set(58, 17); t.T.set(58, 24); t.adv.set(58, 13.654687); t.ctr.set(58, 6.731250)
    t.L.set(59, -4); t.B.set(59, -4); t.R.set(59, 18); t.T.set(59, 24); t.adv.set(59, 14.160937); t.ctr.set(59, 7.103906)
    t.L.set(60, -3); t.B.set(60, -4); t.R.set(60, 17); t.T.set(60, 24); t.adv.set(60, 13.893750); t.ctr.set(60, 6.960938)
    t.L.set(61, -3); t.B.set(61, -4); t.R.set(61, 18); t.T.set(61, 24); t.adv.set(61, 14.329688); t.ctr.set(61, 7.270313)
    t.L.set(62, -4); t.B.set(62, -4); t.R.set(62, 16); t.T.set(62, 24); t.adv.set(62, 12.600000); t.ctr.set(62, 6.300000)
    t.L.set(63, -3); t.B.set(63, -4); t.R.set(63, 18); t.T.set(63, 24); t.adv.set(63, 14.446875); t.ctr.set(63, 7.225781)
    t.L.set(64, -3); t.B.set(64, -4); t.R.set(64, 17); t.T.set(64, 24); t.adv.set(64, 14.306250); t.ctr.set(64, 7.031250)
    t.L.set(65, -3); t.B.set(65, 0); t.R.set(65, 16); t.T.set(65, 20); t.adv.set(65, 13.031250); t.ctr.set(65, 6.529687)
    t.pt.set(6, 30)
    t.L.set(66, 0); t.B.set(66, -2); t.R.set(66, 19); t.T.set(66, 27); t.adv.set(66, 18.181641); t.ctr.set(66, 9.087891)
    t.L.set(67, -1); t.B.set(67, -2); t.R.set(67, 11); t.T.set(67, 26); t.adv.set(67, 11.490234); t.ctr.set(67, 4.813477)
    t.L.set(68, -1); t.B.set(68, -2); t.R.set(68, 18); t.T.set(68, 27); t.adv.set(68, 17.097656); t.ctr.set(68, 8.548828)
    t.L.set(69, -1); t.B.set(69, -2); t.R.set(69, 18); t.T.set(69, 27); t.adv.set(69, 17.068359); t.ctr.set(69, 8.414062)
    t.L.set(70, -1); t.B.set(70, -2); t.R.set(70, 19); t.T.set(70, 26); t.adv.set(70, 17.701172); t.ctr.set(70, 8.879883)
    t.L.set(71, -1); t.B.set(71, -2); t.R.set(71, 18); t.T.set(71, 26); t.adv.set(71, 17.367188); t.ctr.set(71, 8.701172)
    t.L.set(72, 0); t.B.set(72, -2); t.R.set(72, 19); t.T.set(72, 27); t.adv.set(72, 17.912109); t.ctr.set(72, 9.087891)
    t.L.set(73, -1); t.B.set(73, -2); t.R.set(73, 17); t.T.set(73, 26); t.adv.set(73, 15.750000); t.ctr.set(73, 7.875000)
    t.L.set(74, -1); t.B.set(74, -2); t.R.set(74, 19); t.T.set(74, 27); t.adv.set(74, 18.058594); t.ctr.set(74, 9.032227)
    t.L.set(75, -1); t.B.set(75, -2); t.R.set(75, 18); t.T.set(75, 27); t.adv.set(75, 17.882812); t.ctr.set(75, 8.789062)
    t.kern.set(7, -1.04)
    t.kern.set(22, -0.4)
    t.kern.set(24, -0.8)
    t.kern.set(25, -0.8)
    t.kern.set(26, -3.2)
    t.kern.set(34, -0.8)
    t.kern.set(37, 0.8)
    t.kern.set(40, -0.8)
    t.kern.set(45, -0.32)
    t.kern.set(48, 1.6)
    t.kern.set(51, -2.4)
    t.kern.set(56, -1.12)
    t.kern.set(57, 0.8)
    t.kern.set(60, 0.8)
    t.kern.set(62, -1.6)
    t.kern.set(63, 1.2)
    t.kern.set(67, -1.2)
    t.kern.set(73, -1.2)
    t.kern.set(77, -0.4)
    t.kern.set(78, 2.8)
    t.kern.set(79, -0.4)
    t.kern.set(80, -0.8)
    t.kern.set(81, -4.8)
    t.kern.set(83, -0.8)
    t.kern.set(84, 0.8)
    t.kern.set(85, -1.6)
    t.kern.set(87, -3.2)
    t.kern.set(95, -1.6)
    t.kern.set(97, -0.8)
    t.kern.set(106, -1.2)
    t.kern.set(111, -2.4)
    t.kern.set(117, -4.8)
}

export const MS_TEXT_PT = 44
export const MS_TEXT_FONT_POINT = 40
export const MS_TEXT_ASCENDER = 35.2
export const MS_TEXT_DESCENDER = -4.8

export const MS_TEXT_BASELINE_DY = 16.720000

export const MS_TEXT_REGULAR_STYLE_SPACING = 0
export const MS_TEXT_SETS = ['Fast', 'Late', 'None'] as const

export const fillHudMsTables = (t: { L: HudTab; B: HudTab; R: HudTab; T: HudTab; adv: HudTab }) => {
    t.L.set(0, 1); t.B.set(0, -2); t.R.set(0, 32); t.T.set(0, 37); t.adv.set(0, 33.395313)
    t.L.set(1, 8); t.B.set(1, -1); t.R.set(1, 23); t.T.set(1, 36); t.adv.set(1, 33.395313)
    t.L.set(2, 1); t.B.set(2, -2); t.R.set(2, 32); t.T.set(2, 37); t.adv.set(2, 33.395313)
    t.L.set(3, 1); t.B.set(3, -2); t.R.set(3, 33); t.T.set(3, 37); t.adv.set(3, 33.395313)
    t.L.set(4, 0); t.B.set(4, -1); t.R.set(4, 34); t.T.set(4, 36); t.adv.set(4, 33.395313)
    t.L.set(5, 1); t.B.set(5, -2); t.R.set(5, 32); t.T.set(5, 36); t.adv.set(5, 33.395313)
    t.L.set(6, 1); t.B.set(6, -2); t.R.set(6, 32); t.T.set(6, 37); t.adv.set(6, 33.395313)
    t.L.set(7, 1); t.B.set(7, -1); t.R.set(7, 32); t.T.set(7, 36); t.adv.set(7, 33.395313)
    t.L.set(8, 1); t.B.set(8, -2); t.R.set(8, 32); t.T.set(8, 37); t.adv.set(8, 33.395313)
    t.L.set(9, 1); t.B.set(9, -2); t.R.set(9, 32); t.T.set(9, 37); t.adv.set(9, 33.395313)
    t.L.set(10, 1); t.B.set(10, -2); t.R.set(10, 40); t.T.set(10, 28); t.adv.set(10, 41.542187)
    t.L.set(11, 1); t.B.set(11, -2); t.R.set(11, 27); t.T.set(11, 28); t.adv.set(11, 27.723437)
}

export const HUD_CAPTIONS = {
    hudTextRank: [46.0949, 17.9200, 117.0949, 40.9200],
    hudTextLiveScore: [43.0000, 213.9200, 197.0000, 242.9200],
    hudRankLetterC: [237.4238, 32.9000, 258.4238, 61.9000],
    hudRankLetterB: [326.5908, 33.9000, 348.5908, 61.9000],
    hudRankLetterA: [411.6348, 33.9000, 435.6348, 61.9000],
    hudRankLetterS: [501.2500, 32.9000, 522.2500, 61.9000],
    hudRankLetterSS: [578.4790, 32.9000, 619.4790, 61.9000],
    titleCardHighScore: [923.0000, 696.4400, 1035.0000, 715.4400],
    titleCardColon: [1036.0000, 698.7600, 1043.0000, 713.7600],
    titleCardHighScoreValue: [1160.4805, 704.4000, 1173.4805, 711.4000],
} as const

export const GAUGE_PIECE_W = 8
export const GAUGE_LEVELS = 6
export const GAUGE_EXT = 2
export const GAUGE_LEVEL_BASE = [0, 63, 95, 111, 119, 123] as const
export const GAUGE_PIECE_COUNT = 125
export const GAUGE_FILL_W = 502

export const FINISH_PIECES = {
    ap: { w: 1267, h: 208, scaledW: 634, scaledH: 104, pieceW: 16, ext: 1, count: 40 },
    fc: { w: 1146, h: 200, scaledW: 573, scaledH: 100, pieceW: 16, ext: 1, count: 36 },
    afc: { w: 1705, h: 192, scaledW: 852, scaledH: 96, pieceW: 16, ext: 1, count: 54 },
    lc: { w: 1042, h: 200, scaledW: 521, scaledH: 100, pieceW: 16, ext: 1, count: 33 },
} as const

export const FINISH_MASK_SOFTNESS = 100

export const fillFinishClipTables = (t: { scale: HudTab; scaleEndT: HudTab; scaleEndX: HudTab; scaleEndY: HudTab; textA: HudTab; textPre: HudTab; addA: HudTab; addPre: HudTab; pad: HudTab; padPre: HudTab; maskEnd: HudTab; len: HudTab }) => {

    t.scale.set(20, 0.8333333)
    t.scale.set(21, -0.6853413)
    t.scale.set(22, 0.1653167)
    t.scale.set(23, 0.390545)
    t.scale.set(24, 0.85)
    t.scale.set(25, 1.3166667)
    t.scale.set(26, -0.0035339)
    t.scale.set(27, 0.0086827)
    t.scale.set(28, 0.070041)
    t.scale.set(29, 1.0)
    t.scale.set(30, 0.8333333)
    t.scale.set(31, -0.5059581)
    t.scale.set(32, -0.0137037)
    t.scale.set(33, 0.4351657)
    t.scale.set(34, 0.85)
    t.scale.set(35, 1.3166667)
    t.scale.set(36, -0.0037534)
    t.scale.set(37, 0.0102266)
    t.scale.set(38, 0.0673263)
    t.scale.set(39, 1.0)
    t.scaleEndT.set(1, 4.8333335); t.scaleEndX.set(1, 1.2); t.scaleEndY.set(1, 1.2)
    t.textA.set(20, 0.8333333); t.textA.set(21, -17.7128944); t.textA.set(22, 12.8418503); t.textA.set(23, 0.0); t.textA.set(24, 0.0)
    t.textA.set(25, 1.3166667); t.textA.set(26, 0.0); t.textA.set(27, 0.0); t.textA.set(28, 0.0); t.textA.set(29, 1.0)
    t.textA.set(30, 4.25); t.textA.set(31, 10.0757933); t.textA.set(32, -8.8163214); t.textA.set(33, 0.0); t.textA.set(34, 1.0)
    t.textA.set(35, 4.8333335); t.textA.set(36, 0.0); t.textA.set(37, 0.0); t.textA.set(38, 0.0); t.textA.set(39, 0.0)
    t.textPre.set(1, 0.0)
    t.addA.set(20, 0.5166667); t.addA.set(21, -27.647995); t.addA.set(22, 17.2799988); t.addA.set(23, 0.0); t.addA.set(24, 0.0)
    t.addA.set(25, 0.9333333); t.addA.set(26, 5.5142527); t.addA.set(27, -4.5436931); t.addA.set(28, 0.0); t.addA.set(29, 1.0)
    t.addA.set(30, 1.3166667); t.addA.set(31, 3.7886252); t.addA.set(32, -2.291538); t.addA.set(33, -1.0526316); t.addA.set(34, 0.6429402)
    t.addA.set(35, 1.8833333); t.addA.set(36, 0.0); t.addA.set(37, 0.0); t.addA.set(38, 0.0); t.addA.set(39, 0.0)
    t.addPre.set(1, 0.0)
    t.pad.set(10, 0.8333333); t.pad.set(11, 8856.4472656); t.pad.set(12, -6420.925293); t.pad.set(13, 0.0); t.pad.set(14, 500.0)
    t.pad.set(15, 1.3166667); t.pad.set(16, 0.0); t.pad.set(17, 0.0); t.pad.set(18, 0.0); t.pad.set(19, 0.0)
    t.padPre.set(1, 500.0); t.maskEnd.set(1, 1.3166667); t.len.set(1, 6.433333396911621)

    t.scale.set(40, 0.8333333)
    t.scale.set(41, -0.5649239)
    t.scale.set(42, 0.107115)
    t.scale.set(43, 0.390545)
    t.scale.set(44, 0.85)
    t.scale.set(45, 1.3166667)
    t.scale.set(46, 0.0010402)
    t.scale.set(47, -0.019445)
    t.scale.set(48, 0.0981718)
    t.scale.set(49, 1.0)
    t.scale.set(50, 0.8333333)
    t.scale.set(51, -0.3699579)
    t.scale.set(52, -0.0794372)
    t.scale.set(53, 0.4351657)
    t.scale.set(54, 0.85)
    t.scale.set(55, 1.3166667)
    t.scale.set(56, 0.001115)
    t.scale.set(57, -0.0199714)
    t.scale.set(58, 0.0990975)
    t.scale.set(59, 1.0)
    t.scaleEndT.set(2, 4.8333335); t.scaleEndX.set(2, 1.15); t.scaleEndY.set(2, 1.15)
    t.textA.set(40, 0.8333333); t.textA.set(41, -17.7128944); t.textA.set(42, 12.8418503); t.textA.set(43, 0.0); t.textA.set(44, 0.0)
    t.textA.set(45, 1.3166667); t.textA.set(46, 0.0); t.textA.set(47, 0.0); t.textA.set(48, 0.0); t.textA.set(49, 1.0)
    t.textA.set(50, 3.9833333); t.textA.set(51, 3.2566643); t.textA.set(52, -4.1522474); t.textA.set(53, 0.0); t.textA.set(54, 1.0)
    t.textA.set(55, 4.8333335); t.textA.set(56, 0.0); t.textA.set(57, 0.0); t.textA.set(58, 0.0); t.textA.set(59, 0.0)
    t.textPre.set(2, 0.0)
    t.addA.set(40, 0.8333333); t.addA.set(41, -1999.9989014); t.addA.set(42, 299.9998779); t.addA.set(43, 0.0); t.addA.set(44, 0.0)
    t.addA.set(45, 0.9333333); t.addA.set(46, 5.5142527); t.addA.set(47, -4.5436931); t.addA.set(48, 0.0); t.addA.set(49, 1.0)
    t.addA.set(50, 1.3166667); t.addA.set(51, 3.7886252); t.addA.set(52, -2.291538); t.addA.set(53, -1.0526316); t.addA.set(54, 0.6429402)
    t.addA.set(55, 1.8833333); t.addA.set(56, 0.0); t.addA.set(57, 0.0); t.addA.set(58, 0.0); t.addA.set(59, 0.0)
    t.addPre.set(2, 0.0)
    t.pad.set(20, 0.8333333); t.pad.set(21, 7439.4155273); t.pad.set(22, -5393.5771484); t.pad.set(23, 0.0); t.pad.set(24, 420.0)
    t.pad.set(25, 1.3166667); t.pad.set(26, 0.0); t.pad.set(27, 0.0); t.pad.set(28, 0.0); t.pad.set(29, 0.0)
    t.padPre.set(2, 420.0); t.maskEnd.set(2, 1.3166667); t.len.set(2, 5.866666793823242)

    t.scale.set(60, 0.8333333)
    t.scale.set(61, -0.5838063)
    t.scale.set(62, 0.1162414)
    t.scale.set(63, 0.390545)
    t.scale.set(64, 0.85)
    t.scale.set(65, 1.3166667)
    t.scale.set(66, 0.0028051)
    t.scale.set(67, -0.0285859)
    t.scale.set(68, 0.0937607)
    t.scale.set(69, 1.0)
    t.scale.set(70, 0.8333333)
    t.scale.set(71, -0.3972337)
    t.scale.set(72, -0.0662539)
    t.scale.set(73, 0.4351657)
    t.scale.set(74, 0.85)
    t.scale.set(75, 1.3166667)
    t.scale.set(76, 0.0026699)
    t.scale.set(77, -0.0278376)
    t.scale.set(78, 0.0927255)
    t.scale.set(79, 1.0)
    t.scaleEndT.set(3, 4.0833335); t.scaleEndX.set(3, 1.1); t.scaleEndY.set(3, 1.1)
    t.textA.set(60, 0.8333333); t.textA.set(61, -17.7128944); t.textA.set(62, 12.8418503); t.textA.set(63, 0.0); t.textA.set(64, 0.0)
    t.textA.set(65, 1.3166667); t.textA.set(66, 0.0); t.textA.set(67, 0.0); t.textA.set(68, 0.0); t.textA.set(69, 1.0)
    t.textA.set(70, 3.25); t.textA.set(71, 3.4559984); t.textA.set(72, -4.3199987); t.textA.set(73, 0.0); t.textA.set(74, 1.0)
    t.textA.set(75, 4.0833335); t.textA.set(76, 0.0); t.textA.set(77, 0.0); t.textA.set(78, 0.0); t.textA.set(79, 0.0)
    t.textPre.set(3, 0.0)
    t.addA.set(60, 0.8333333); t.addA.set(61, -1999.9989014); t.addA.set(62, 299.9998779); t.addA.set(63, 0.0); t.addA.set(64, 0.0)
    t.addA.set(65, 0.9333333); t.addA.set(66, 5.5142527); t.addA.set(67, -4.5436931); t.addA.set(68, 0.0); t.addA.set(69, 1.0)
    t.addA.set(70, 1.3166667); t.addA.set(71, 3.7886252); t.addA.set(72, -2.291538); t.addA.set(73, -1.0526316); t.addA.set(74, 0.6429402)
    t.addA.set(75, 1.8833333); t.addA.set(76, 0.0); t.addA.set(77, 0.0); t.addA.set(78, 0.0); t.addA.set(79, 0.0)
    t.addPre.set(3, 0.0)
    t.pad.set(30, 0.8333333); t.pad.set(31, 10627.7363281); t.pad.set(32, -7705.1103516); t.pad.set(33, 0.0); t.pad.set(34, 600.0)
    t.pad.set(35, 1.3166667); t.pad.set(36, 0.0); t.pad.set(37, 0.0); t.pad.set(38, 0.0); t.pad.set(39, 0.0)
    t.padPre.set(3, 600.0); t.maskEnd.set(3, 1.3166667); t.len.set(3, 4.833333492279053)

    t.scale.set(80, 0.3333333)
    t.scale.set(81, 0.2210615)
    t.scale.set(82, -0.4751982)
    t.scale.set(83, 0.4718093)
    t.scale.set(84, 0.85)
    t.scale.set(85, 0.8666667)
    t.scale.set(86, 0.007999)
    t.scale.set(87, -0.0699513)
    t.scale.set(88, 0.1535704)
    t.scale.set(89, 1.0)
    t.scale.set(90, 0.3333333)
    t.scale.set(91, 0.2148132)
    t.scale.set(92, -0.4737181)
    t.scale.set(93, 0.4727972)
    t.scale.set(94, 0.85)
    t.scale.set(95, 0.8666667)
    t.scale.set(96, 0.0067135)
    t.scale.set(97, -0.0661804)
    t.scale.set(98, 0.1508051)
    t.scale.set(99, 1.0)
    t.scaleEndT.set(4, 2.3333333); t.scaleEndX.set(4, 1.1); t.scaleEndY.set(4, 1.1)
    t.textA.set(80, 1.8333334); t.textA.set(81, 16.0000114); t.textA.set(82, -12.0000057); t.textA.set(83, 0.0); t.textA.set(84, 1.0)
    t.textA.set(85, 2.3333333); t.textA.set(86, 0.0); t.textA.set(87, 0.0); t.textA.set(88, 0.0); t.textA.set(89, 0.0)
    t.textA.set(90, 2.3333333); t.textA.set(91, 0.0); t.textA.set(92, 0.0); t.textA.set(93, 0.0); t.textA.set(94, 0.0)
    t.textA.set(95, 2.3333333); t.textA.set(96, 0.0); t.textA.set(97, 0.0); t.textA.set(98, 0.0); t.textA.set(99, 0.0)
    t.textPre.set(4, 1.0)
    t.addA.set(80, 0.5); t.addA.set(81, 2.0); t.addA.set(82, -3.0); t.addA.set(83, 0.0); t.addA.set(84, 1.0)
    t.addA.set(85, 1.5); t.addA.set(86, 0.0); t.addA.set(87, 0.0); t.addA.set(88, 0.0); t.addA.set(89, 0.0)
    t.addA.set(90, 1.5); t.addA.set(91, 0.0); t.addA.set(92, 0.0); t.addA.set(93, 0.0); t.addA.set(94, 0.0)
    t.addA.set(95, 1.5); t.addA.set(96, 0.0); t.addA.set(97, 0.0); t.addA.set(98, 0.0); t.addA.set(99, 0.0)
    t.addPre.set(4, 1.0)
    t.pad.set(40, 0.3333333); t.pad.set(41, 6591.7983398); t.pad.set(42, -5273.4379883); t.pad.set(43, 0.0); t.pad.set(44, 500.0)
    t.pad.set(45, 0.8666667); t.pad.set(46, 0.0); t.pad.set(47, 0.0); t.pad.set(48, 0.0); t.pad.set(49, 0.0)
    t.padPre.set(4, 500.0); t.maskEnd.set(4, 0.8666667); t.len.set(4, 2.8333332538604736)
}

export const finishGroupScale = (type: number, t: number) => {
    if (type === 1) {
        if (t >= 5.3333335) return 0.9630952
        if (t >= 1.0166667) {
            const x = t - 1.0166667
            return 0.0377827 * x + 0.8
        }
        if (t >= 0.3333333) return 0.8
        return 0.8
    }
    if (type === 2) {
        if (t >= 5.3333335) return 0.9630952
        if (t >= 0.8333333) {
            const x = t - 0.8333333
            return 0.0584656 * x + 0.7
        }
        if (t >= 0.3333333) {
            const x = t - 0.3333333
            return -0.2000001 * x + 0.8
        }
        return 0.8
    }
    return 0.85
}

export const finishBackgroundAlpha = (type: number, t: number) => {
    if (type === 1) {
        if (t >= 6.4333334) return 0.0
        if (t >= 5.5833335) {
            const x = t - 5.5833335
            return ((1.6283337 * x + -2.0761251) * x + 0.0) * x + 0.5
        }
        if (t >= 0.8166667) return 0.5
        if (t >= 0.3333333) {
            const x = t - 0.3333333
            return ((-8.8564539 * x + 6.420929) * x + 0.0) * x + 0.0
        }
        return 0.0
    }
    if (type === 2) {
        if (t >= 5.8666668) return 0.0
        if (t >= 5.0166669) {
            const x = t - 5.0166669
            return ((1.6283337 * x + -2.0761251) * x + 0.0) * x + 0.5
        }
        if (t >= 0.8166667) return 0.5
        if (t >= 0.3333333) {
            const x = t - 0.3333333
            return ((-8.8564539 * x + 6.420929) * x + 0.0) * x + 0.0
        }
        return 0.0
    }
    return 0
}

export const RANK_FX_LEN = 0.5
export const RANK_FX_ELEMENTS = 29
export const RANK_FX_POOL = 1010
export const RANK_FX_MAX_SEGS = 6
type RankFxTab = { set(index: number, value: number): void }

export const fillRankFxTables = (t: { first: RankFxTab; count: RankFxTab; sprite: RankFxTab; mul: RankFxTab; ox: RankFxTab; oy: RankFxTab; hw: RankFxTab; hh: RankFxTab; rot: RankFxTab; on: RankFxTab; off: RankFxTab; sx: RankFxTab; sxN: RankFxTab; sy: RankFxTab; syN: RankFxTab; al: RankFxTab; alN: RankFxTab; pool: RankFxTab }, sp: typeof skin.sprites) => {
    t.first.set(0, 0); t.count.set(0, 0)
    t.first.set(1, 0); t.count.set(1, 0)
    t.first.set(2, 0); t.count.set(2, 3)
    t.first.set(3, 3); t.count.set(3, 5)
    t.first.set(4, 8); t.count.set(4, 9)
    t.first.set(5, 17); t.count.set(5, 12)

    t.sprite.set(0, sp.hudRankFxBTextGlowB.id); t.mul.set(0, 1.0); t.ox.set(0, 0.0); t.oy.set(0, -0.0); t.hw.set(0, 25.0); t.hh.set(0, 25.0); t.rot.set(0, 0); t.on.set(0, 0.0); t.off.set(0, 99.0)
    t.sx.set(0, 0); t.sxN.set(0, 3); t.sy.set(0, 0); t.syN.set(0, 3); t.al.set(0, 15); t.alN.set(0, 4)

    t.sprite.set(1, sp.hudRankFxLine00B.id); t.mul.set(1, 1.0); t.ox.set(1, 0.0); t.oy.set(1, -0.0); t.hw.set(1, 32.0); t.hh.set(1, 32.0); t.rot.set(1, 0); t.on.set(1, 0.0); t.off.set(1, 99.0)
    t.sx.set(1, 35); t.sxN.set(1, 3); t.sy.set(1, 35); t.syN.set(1, 3); t.al.set(1, 50); t.alN.set(1, 4)

    t.sprite.set(2, sp.hudRankFxLine01B.id); t.mul.set(2, 1.0); t.ox.set(2, 0.0); t.oy.set(2, -0.0); t.hw.set(2, 32.0); t.hh.set(2, 32.0); t.rot.set(2, 0); t.on.set(2, 0.0); t.off.set(2, 99.0)
    t.sx.set(2, 70); t.sxN.set(2, 4); t.sy.set(2, 70); t.syN.set(2, 4); t.al.set(2, 90); t.alN.set(2, 5)

    t.sprite.set(3, sp.hudRankFxATextGlow00A.id); t.mul.set(3, 1.0); t.ox.set(3, 0.0); t.oy.set(3, -0.0); t.hw.set(3, 32.0); t.hh.set(3, 32.0); t.rot.set(3, 0); t.on.set(3, 0.0); t.off.set(3, 99.0)
    t.sx.set(3, 115); t.sxN.set(3, 1); t.sy.set(3, 115); t.syN.set(3, 1); t.al.set(3, 120); t.alN.set(3, 4)

    t.sprite.set(4, sp.hudRankFxATextGlow01A.id); t.mul.set(4, 1.0); t.ox.set(4, 0.0); t.oy.set(4, -0.0); t.hw.set(4, 25.0); t.hh.set(4, 25.0); t.rot.set(4, 0); t.on.set(4, 0.0); t.off.set(4, 99.0)
    t.sx.set(4, 140); t.sxN.set(4, 3); t.sy.set(4, 140); t.syN.set(4, 3); t.al.set(4, 155); t.alN.set(4, 5)

    t.sprite.set(5, sp.hudRankFxLine00A.id); t.mul.set(5, 1.0); t.ox.set(5, 0.0); t.oy.set(5, -0.0); t.hw.set(5, 32.0); t.hh.set(5, 32.0); t.rot.set(5, 0); t.on.set(5, 0.0); t.off.set(5, 99.0)
    t.sx.set(5, 180); t.sxN.set(5, 4); t.sy.set(5, 180); t.syN.set(5, 4); t.al.set(5, 50); t.alN.set(5, 4)

    t.sprite.set(6, sp.hudRankFxLine01A.id); t.mul.set(6, 1.0); t.ox.set(6, 0.0); t.oy.set(6, -0.0); t.hw.set(6, 32.0); t.hh.set(6, 32.0); t.rot.set(6, 0); t.on.set(6, 0.0); t.off.set(6, 99.0)
    t.sx.set(6, 200); t.sxN.set(6, 4); t.sy.set(6, 200); t.syN.set(6, 4); t.al.set(6, 220); t.alN.set(6, 5)

    t.sprite.set(7, sp.hudRankFxLine01A.id); t.mul.set(7, 1.0); t.ox.set(7, 0.0); t.oy.set(7, -0.0); t.hw.set(7, 32.0); t.hh.set(7, 32.0); t.rot.set(7, 0); t.on.set(7, 0.0); t.off.set(7, 99.0)
    t.sx.set(7, 245); t.sxN.set(7, 4); t.sy.set(7, 245); t.syN.set(7, 4); t.al.set(7, 220); t.alN.set(7, 5)

    t.sprite.set(8, sp.hudRankFxRing.id); t.mul.set(8, 1.0); t.ox.set(8, 0.0); t.oy.set(8, -0.0); t.hw.set(8, 32.0); t.hh.set(8, 32.0); t.rot.set(8, 0); t.on.set(8, 0.0); t.off.set(8, 99.0)
    t.sx.set(8, 265); t.sxN.set(8, 4); t.sy.set(8, 265); t.syN.set(8, 4); t.al.set(8, 285); t.alN.set(8, 5)

    t.sprite.set(9, sp.hudRankFxSTextGlow00.id); t.mul.set(9, 0.4556249920036639); t.ox.set(9, 3.5999999046325684); t.oy.set(9, -0.0); t.hw.set(9, 32.0); t.hh.set(9, 32.0); t.rot.set(9, 0); t.on.set(9, 0.0); t.off.set(9, 99.0)
    t.sx.set(9, 115); t.sxN.set(9, 1); t.sy.set(9, 115); t.syN.set(9, 1); t.al.set(9, 310); t.alN.set(9, 6)

    t.sprite.set(10, sp.hudRankFxSTextGlow01.id); t.mul.set(10, 0.4556249920036639); t.ox.set(10, 0.0); t.oy.set(10, -0.0); t.hw.set(10, 25.0); t.hh.set(10, 25.0); t.rot.set(10, 0); t.on.set(10, 0.0); t.off.set(10, 99.0)
    t.sx.set(10, 340); t.sxN.set(10, 3); t.sy.set(10, 340); t.syN.set(10, 3); t.al.set(10, 355); t.alN.set(10, 6)

    t.sprite.set(11, sp.hudRankFxSTextGlow01.id); t.mul.set(11, 0.4556249920036639); t.ox.set(11, 0.0); t.oy.set(11, -0.0); t.hw.set(11, 25.0); t.hh.set(11, 25.0); t.rot.set(11, 0); t.on.set(11, 0.0); t.off.set(11, 99.0)
    t.sx.set(11, 385); t.sxN.set(11, 4); t.sy.set(11, 385); t.syN.set(11, 4); t.al.set(11, 405); t.alN.set(11, 5)

    t.sprite.set(12, sp.hudRankFxFlare.id); t.mul.set(12, 0.4556249920036639); t.ox.set(12, -14.800000190734863); t.oy.set(12, -29.5); t.hw.set(12, 25.0); t.hh.set(12, 25.0); t.rot.set(12, 0); t.on.set(12, 0.0); t.off.set(12, 99.0)
    t.sx.set(12, 430); t.sxN.set(12, 5); t.sy.set(12, 455); t.syN.set(12, 5); t.al.set(12, 480); t.alN.set(12, 5)

    t.sprite.set(13, sp.hudRankFxFlare.id); t.mul.set(13, 0.4556249920036639); t.ox.set(13, -12.800000190734863); t.oy.set(13, -23.200000762939453); t.hw.set(13, 25.0); t.hh.set(13, 25.0); t.rot.set(13, 0); t.on.set(13, 0.0); t.off.set(13, 99.0)
    t.sx.set(13, 430); t.sxN.set(13, 5); t.sy.set(13, 455); t.syN.set(13, 5); t.al.set(13, 480); t.alN.set(13, 5)

    t.sprite.set(14, sp.hudRankFxLineGrad.id); t.mul.set(14, 0.8176100254058838); t.ox.set(14, 0.0); t.oy.set(14, -0.0); t.hw.set(14, 32.0); t.hh.set(14, 32.0); t.rot.set(14, 0); t.on.set(14, 0.0); t.off.set(14, 99.0)
    t.sx.set(14, 505); t.sxN.set(14, 3); t.sy.set(14, 505); t.syN.set(14, 3); t.al.set(14, 520); t.alN.set(14, 5)

    t.sprite.set(15, sp.hudRankFxLineGrad.id); t.mul.set(15, 1.0); t.ox.set(15, 0.0); t.oy.set(15, -0.0); t.hw.set(15, 32.0); t.hh.set(15, 32.0); t.rot.set(15, 0); t.on.set(15, 0.0); t.off.set(15, 99.0)
    t.sx.set(15, 545); t.sxN.set(15, 4); t.sy.set(15, 545); t.syN.set(15, 4); t.al.set(15, 565); t.alN.set(15, 6)

    t.sprite.set(16, sp.hudRankFxLineGrad.id); t.mul.set(16, 1.0); t.ox.set(16, 0.0); t.oy.set(16, -0.0); t.hw.set(16, 32.0); t.hh.set(16, 32.0); t.rot.set(16, 0); t.on.set(16, 0.0); t.off.set(16, 99.0)
    t.sx.set(16, 595); t.sxN.set(16, 4); t.sy.set(16, 595); t.syN.set(16, 4); t.al.set(16, 615); t.alN.set(16, 6)

    t.sprite.set(17, sp.hudRankFxRing.id); t.mul.set(17, 1.0); t.ox.set(17, 0.0); t.oy.set(17, -0.0); t.hw.set(17, 32.0); t.hh.set(17, 32.0); t.rot.set(17, 0); t.on.set(17, 0.0); t.off.set(17, 99.0)
    t.sx.set(17, 645); t.sxN.set(17, 3); t.sy.set(17, 645); t.syN.set(17, 3); t.al.set(17, 285); t.alN.set(17, 5)

    t.sprite.set(18, sp.hudRankFxSsTextGlow00.id); t.mul.set(18, 1.0); t.ox.set(18, -23.299999237060547); t.oy.set(18, -0.0); t.hw.set(18, 32.0); t.hh.set(18, 32.0); t.rot.set(18, 0); t.on.set(18, 0.0); t.off.set(18, 99.0)
    t.sx.set(18, 115); t.sxN.set(18, 1); t.sy.set(18, 115); t.syN.set(18, 1); t.al.set(18, 660); t.alN.set(18, 5)

    t.sprite.set(19, sp.hudRankFxSTextGlow00.id); t.mul.set(19, 1.0); t.ox.set(19, 21.350000381469727); t.oy.set(19, -0.0); t.hw.set(19, 32.0); t.hh.set(19, 32.0); t.rot.set(19, 0); t.on.set(19, 0.0); t.off.set(19, 99.0)
    t.sx.set(19, 115); t.sxN.set(19, 1); t.sy.set(19, 115); t.syN.set(19, 1); t.al.set(19, 660); t.alN.set(19, 5)

    t.sprite.set(20, sp.hudRankFxSsTextGlow01.id); t.mul.set(20, 1.0); t.ox.set(20, -22.0); t.oy.set(20, -0.0); t.hw.set(20, 25.0); t.hh.set(20, 25.0); t.rot.set(20, 0); t.on.set(20, 0.0); t.off.set(20, 99.0)
    t.sx.set(20, 685); t.sxN.set(20, 3); t.sy.set(20, 685); t.syN.set(20, 3); t.al.set(20, 700); t.alN.set(20, 4)

    t.sprite.set(21, sp.hudRankFxSsTextGlow01.id); t.mul.set(21, 1.0); t.ox.set(21, -22.0); t.oy.set(21, -0.0); t.hw.set(21, 25.0); t.hh.set(21, 25.0); t.rot.set(21, 0); t.on.set(21, 0.0); t.off.set(21, 99.0)
    t.sx.set(21, 720); t.sxN.set(21, 4); t.sy.set(21, 720); t.syN.set(21, 4); t.al.set(21, 615); t.alN.set(21, 6)

    t.sprite.set(22, sp.hudRankFxSTextGlow01.id); t.mul.set(22, 1.0); t.ox.set(22, 22.0); t.oy.set(22, -0.0); t.hw.set(22, 25.0); t.hh.set(22, 25.0); t.rot.set(22, 0); t.on.set(22, 0.0); t.off.set(22, 99.0)
    t.sx.set(22, 740); t.sxN.set(22, 3); t.sy.set(22, 740); t.syN.set(22, 3); t.al.set(22, 700); t.alN.set(22, 4)

    t.sprite.set(23, sp.hudRankFxSTextGlow01.id); t.mul.set(23, 1.0); t.ox.set(23, 22.0); t.oy.set(23, -0.0); t.hw.set(23, 25.0); t.hh.set(23, 25.0); t.rot.set(23, 0); t.on.set(23, 0.0); t.off.set(23, 99.0)
    t.sx.set(23, 720); t.sxN.set(23, 4); t.sy.set(23, 720); t.syN.set(23, 4); t.al.set(23, 615); t.alN.set(23, 6)

    t.sprite.set(24, sp.hudRankFxFlare.id); t.mul.set(24, 1.0); t.ox.set(24, -10.193499565124512); t.oy.set(24, 1.1999530792236328); t.hw.set(24, 25.0); t.hh.set(24, 25.0); t.rot.set(24, 0); t.on.set(24, 0.0); t.off.set(24, 99.0)
    t.sx.set(24, 755); t.sxN.set(24, 4); t.sy.set(24, 775); t.syN.set(24, 4); t.al.set(24, 795); t.alN.set(24, 4)

    t.sprite.set(25, sp.hudRankFxFlare.id); t.mul.set(25, 1.0); t.ox.set(25, 0.0); t.oy.set(25, -0.0); t.hw.set(25, 25.0); t.hh.set(25, 25.0); t.rot.set(25, 1); t.on.set(25, 0.0); t.off.set(25, 99.0)
    t.sx.set(25, 815); t.sxN.set(25, 3); t.sy.set(25, 830); t.syN.set(25, 3); t.al.set(25, 795); t.alN.set(25, 4)

    t.sprite.set(26, sp.hudRankFxLineGrad.id); t.mul.set(26, 1.0); t.ox.set(26, 0.0); t.oy.set(26, -0.0); t.hw.set(26, 32.0); t.hh.set(26, 32.0); t.rot.set(26, 0); t.on.set(26, 0.0); t.off.set(26, 99.0)
    t.sx.set(26, 845); t.sxN.set(26, 3); t.sy.set(26, 845); t.syN.set(26, 3); t.al.set(26, 860); t.alN.set(26, 4)

    t.sprite.set(27, sp.hudRankFxLineGrad.id); t.mul.set(27, 1.0); t.ox.set(27, 0.0); t.oy.set(27, -0.0); t.hw.set(27, 32.0); t.hh.set(27, 32.0); t.rot.set(27, 0); t.on.set(27, 0.13333334028720856); t.off.set(27, 99.0)
    t.sx.set(27, 880); t.sxN.set(27, 4); t.sy.set(27, 900); t.syN.set(27, 4); t.al.set(27, 920); t.alN.set(27, 5)

    t.sprite.set(28, sp.hudRankFxLineGrad.id); t.mul.set(28, 1.0); t.ox.set(28, 0.0); t.oy.set(28, -0.0); t.hw.set(28, 32.0); t.hh.set(28, 32.0); t.rot.set(28, 0); t.on.set(28, 0.13333334028720856); t.off.set(28, 99.0)
    t.sx.set(28, 945); t.sxN.set(28, 4); t.sy.set(28, 965); t.syN.set(28, 4); t.al.set(28, 985); t.alN.set(28, 5)
    t.pool.set(0, -1.0); t.pool.set(1, 0.0); t.pool.set(2, 0.0); t.pool.set(3, 0.0); t.pool.set(4, 2.0)
    t.pool.set(5, 0.0); t.pool.set(6, 127.8106460571289); t.pool.set(7, -41.53845977783203); t.pool.set(8, 0.0); t.pool.set(9, 2.0)
    t.pool.set(10, 0.21666666865348816); t.pool.set(11, 0.0); t.pool.set(12, 0.0); t.pool.set(13, 0.0); t.pool.set(14, 1.350000023841858)
    t.pool.set(15, -1.0); t.pool.set(16, 0.0); t.pool.set(17, 0.0); t.pool.set(18, 0.0); t.pool.set(19, 0.0)
    t.pool.set(20, 0.0); t.pool.set(21, -196.63177490234375); t.pool.set(22, 63.90532684326172); t.pool.set(23, 0.0); t.pool.set(24, 0.0)
    t.pool.set(25, 0.21666666865348816); t.pool.set(26, 196.63177490234375); t.pool.set(27, -63.90532684326172); t.pool.set(28, 0.0); t.pool.set(29, 1.0)
    t.pool.set(30, 0.4333333373069763); t.pool.set(31, 0.0); t.pool.set(32, 0.0); t.pool.set(33, 0.0); t.pool.set(34, 0.0)
    t.pool.set(35, -1.0); t.pool.set(36, 0.0); t.pool.set(37, 0.0); t.pool.set(38, 0.0); t.pool.set(39, 0.0)
    t.pool.set(40, 0.0); t.pool.set(41, -265.09893798828125); t.pool.set(42, 86.15715789794922); t.pool.set(43, 0.0); t.pool.set(44, 0.0)
    t.pool.set(45, 0.21666666865348816); t.pool.set(46, 0.0); t.pool.set(47, 0.0); t.pool.set(48, 0.0); t.pool.set(49, 1.3481999635696411)
    t.pool.set(50, -1.0); t.pool.set(51, 0.0); t.pool.set(52, 0.0); t.pool.set(53, 0.0); t.pool.set(54, 0.0)
    t.pool.set(55, 0.0); t.pool.set(56, -196.63177490234375); t.pool.set(57, 63.90532684326172); t.pool.set(58, 0.0); t.pool.set(59, 0.0)
    t.pool.set(60, 0.21666666865348816); t.pool.set(61, 87.92998504638672); t.pool.set(62, -37.370243072509766); t.pool.set(63, 0.0); t.pool.set(64, 1.0)
    t.pool.set(65, 0.5); t.pool.set(66, 0.0); t.pool.set(67, 0.0); t.pool.set(68, 0.0); t.pool.set(69, 0.0)
    t.pool.set(70, -1.0); t.pool.set(71, 0.0); t.pool.set(72, 0.0); t.pool.set(73, 0.0); t.pool.set(74, 1.3951576948165894)
    t.pool.set(75, 0.0); t.pool.set(76, 0.0); t.pool.set(77, 0.0); t.pool.set(78, 0.0); t.pool.set(79, 1.3951576948165894)
    t.pool.set(80, 0.21666666865348816); t.pool.set(81, -965.7791748046875); t.pool.set(82, 120.722412109375); t.pool.set(83, 0.0); t.pool.set(84, 1.3951576948165894)
    t.pool.set(85, 0.30000001192092896); t.pool.set(86, 0.0); t.pool.set(87, 0.0); t.pool.set(88, 0.0); t.pool.set(89, 1.674607753753662)
    t.pool.set(90, -1.0); t.pool.set(91, 0.0); t.pool.set(92, 0.0); t.pool.set(93, 0.0); t.pool.set(94, 0.0)
    t.pool.set(95, 0.0); t.pool.set(96, 0.0); t.pool.set(97, 0.0); t.pool.set(98, 0.0); t.pool.set(99, 0.0)
    t.pool.set(100, 0.20000000298023224); t.pool.set(101, -432000.09375); t.pool.set(102, 10800.001953125); t.pool.set(103, 0.0); t.pool.set(104, 0.0)
    t.pool.set(105, 0.21666666865348816); t.pool.set(106, 1259.47509765625); t.pool.set(107, -220.40814208984375); t.pool.set(108, 0.0); t.pool.set(109, 1.0)
    t.pool.set(110, 0.3333333432674408); t.pool.set(111, 0.0); t.pool.set(112, 0.0); t.pool.set(113, 0.0); t.pool.set(114, 0.0)
    t.pool.set(115, -1.0); t.pool.set(116, 0.0); t.pool.set(117, 0.0); t.pool.set(118, 0.0); t.pool.set(119, 1.1399998664855957)
    t.pool.set(120, -1.0); t.pool.set(121, 0.0); t.pool.set(122, 0.0); t.pool.set(123, 0.0); t.pool.set(124, 0.0)
    t.pool.set(125, 0.0); t.pool.set(126, -58.98953628540039); t.pool.set(127, 19.171598434448242); t.pool.set(128, 0.0); t.pool.set(129, 0.0)
    t.pool.set(130, 0.21666666865348816); t.pool.set(131, 26.378997802734375); t.pool.set(132, -11.211073875427246); t.pool.set(133, 0.0); t.pool.set(134, 0.30000001192092896)
    t.pool.set(135, 0.5); t.pool.set(136, 0.0); t.pool.set(137, 0.0); t.pool.set(138, 0.0); t.pool.set(139, 0.0)
    t.pool.set(140, -1.0); t.pool.set(141, 0.0); t.pool.set(142, 0.0); t.pool.set(143, 0.0); t.pool.set(144, 2.0708000659942627)
    t.pool.set(145, 0.0); t.pool.set(146, 119.9847183227539); t.pool.set(147, -38.995033264160156); t.pool.set(148, 0.0); t.pool.set(149, 2.0708000659942627)
    t.pool.set(150, 0.21666666865348816); t.pool.set(151, 0.0); t.pool.set(152, 0.0); t.pool.set(153, 0.0); t.pool.set(154, 1.4606000185012817)
    t.pool.set(155, -1.0); t.pool.set(156, 0.0); t.pool.set(157, 0.0); t.pool.set(158, 0.0); t.pool.set(159, 0.0)
    t.pool.set(160, 0.0); t.pool.set(161, 0.0); t.pool.set(162, 0.0); t.pool.set(163, 0.0); t.pool.set(164, 0.0)
    t.pool.set(165, 0.06666667014360428); t.pool.set(166, -592.592529296875); t.pool.set(167, 133.3333282470703); t.pool.set(168, 0.0); t.pool.set(169, 0.0)
    t.pool.set(170, 0.21666666865348816); t.pool.set(171, 196.63177490234375); t.pool.set(172, -63.90532684326172); t.pool.set(173, 0.0); t.pool.set(174, 1.0)
    t.pool.set(175, 0.4333333373069763); t.pool.set(176, 0.0); t.pool.set(177, 0.0); t.pool.set(178, 0.0); t.pool.set(179, 0.0)
    t.pool.set(180, -1.0); t.pool.set(181, 0.0); t.pool.set(182, 0.0); t.pool.set(183, 0.0); t.pool.set(184, 0.30000001192092896)
    t.pool.set(185, 0.0); t.pool.set(186, -42.962432861328125); t.pool.set(187, 32.22182846069336); t.pool.set(188, 0.0); t.pool.set(189, 0.30000001192092896)
    t.pool.set(190, 0.10000000149011612); t.pool.set(191, -729.259033203125); t.pool.set(192, 105.5253677368164); t.pool.set(193, 5.155492782592773); t.pool.set(194, 0.5792558789253235)
    t.pool.set(195, 0.21666666865348816); t.pool.set(196, 0.0); t.pool.set(197, 0.0); t.pool.set(198, 0.0); t.pool.set(199, 1.459011197090149)
    t.pool.set(200, -1.0); t.pool.set(201, 0.0); t.pool.set(202, 0.0); t.pool.set(203, 0.0); t.pool.set(204, 1.3951575756072998)
    t.pool.set(205, 0.0); t.pool.set(206, 8.879408836364746); t.pool.set(207, -2.885807991027832); t.pool.set(208, 0.0); t.pool.set(209, 1.3951575756072998)
    t.pool.set(210, 0.21666666865348816); t.pool.set(211, -38.81669235229492); t.pool.set(212, 16.497095108032227); t.pool.set(213, 0.0); t.pool.set(214, 1.350000023841858)
    t.pool.set(215, 0.5); t.pool.set(216, 0.0); t.pool.set(217, 0.0); t.pool.set(218, 0.0); t.pool.set(219, 1.791450023651123)
    t.pool.set(220, -1.0); t.pool.set(221, 0.0); t.pool.set(222, 0.0); t.pool.set(223, 0.0); t.pool.set(224, 0.0)
    t.pool.set(225, 0.0); t.pool.set(226, 0.0); t.pool.set(227, 0.0); t.pool.set(228, 0.0); t.pool.set(229, 0.0)
    t.pool.set(230, 0.21666666865348816); t.pool.set(231, -432000.09375); t.pool.set(232, 10800.001953125); t.pool.set(233, 0.0); t.pool.set(234, 0.0)
    t.pool.set(235, 0.23333333432674408); t.pool.set(236, 105.4687728881836); t.pool.set(237, -42.18750762939453); t.pool.set(238, 0.0); t.pool.set(239, 1.0)
    t.pool.set(240, 0.5); t.pool.set(241, 0.0); t.pool.set(242, 0.0); t.pool.set(243, 0.0); t.pool.set(244, 0.0)
    t.pool.set(245, -1.0); t.pool.set(246, 0.0); t.pool.set(247, 0.0); t.pool.set(248, 0.0); t.pool.set(249, 1.3951575756072998)
    t.pool.set(250, 0.0); t.pool.set(251, -22.853288650512695); t.pool.set(252, 10.252835273742676); t.pool.set(253, 0.0); t.pool.set(254, 1.3951575756072998)
    t.pool.set(255, 0.21666666865348816); t.pool.set(256, -16.69560432434082); t.pool.set(257, 4.934942722320557); t.pool.set(258, 1.2243905067443848); t.pool.set(259, 1.6440236568450928)
    t.pool.set(260, 0.5); t.pool.set(261, 0.0); t.pool.set(262, 0.0); t.pool.set(263, 0.0); t.pool.set(264, 2.007352828979492)
    t.pool.set(265, -1.0); t.pool.set(266, 0.0); t.pool.set(267, 0.0); t.pool.set(268, 0.0); t.pool.set(269, 1.0)
    t.pool.set(270, 0.0); t.pool.set(271, 0.0); t.pool.set(272, 0.0); t.pool.set(273, 0.0); t.pool.set(274, 1.0)
    t.pool.set(275, 0.13333334028720856); t.pool.set(276, -196.63182067871094); t.pool.set(277, 63.90533447265625); t.pool.set(278, 0.0); t.pool.set(279, 1.0)
    t.pool.set(280, 0.3499999940395355); t.pool.set(281, 0.0); t.pool.set(282, 0.0); t.pool.set(283, 0.0); t.pool.set(284, 2.0)
    t.pool.set(285, -1.0); t.pool.set(286, 0.0); t.pool.set(287, 0.0); t.pool.set(288, 0.0); t.pool.set(289, 0.0)
    t.pool.set(290, 0.0); t.pool.set(291, 0.0); t.pool.set(292, 0.0); t.pool.set(293, 0.0); t.pool.set(294, 0.0)
    t.pool.set(295, 0.13333334028720856); t.pool.set(296, -432000.09375); t.pool.set(297, 10800.001953125); t.pool.set(298, 0.0); t.pool.set(299, 0.0)
    t.pool.set(300, 0.15000000596046448); t.pool.set(301, 250.0000762939453); t.pool.set(302, -75.00001525878906); t.pool.set(303, 0.0); t.pool.set(304, 1.0)
    t.pool.set(305, 0.3499999940395355); t.pool.set(306, 0.0); t.pool.set(307, 0.0); t.pool.set(308, 0.0); t.pool.set(309, 0.0)
    t.pool.set(310, -1.0); t.pool.set(311, 0.0); t.pool.set(312, 0.0); t.pool.set(313, 0.0); t.pool.set(314, 0.0)
    t.pool.set(315, 0.0); t.pool.set(316, 0.0); t.pool.set(317, 0.0); t.pool.set(318, 0.0); t.pool.set(319, 0.0)
    t.pool.set(320, 0.13333334028720856); t.pool.set(321, -3456.0009765625); t.pool.set(322, 432.0000915527344); t.pool.set(323, 0.0); t.pool.set(324, 0.0)
    t.pool.set(325, 0.21666666865348816); t.pool.set(326, 0.0); t.pool.set(327, 0.0); t.pool.set(328, 0.0); t.pool.set(329, 1.0)
    t.pool.set(330, 0.3499999940395355); t.pool.set(331, 592.592529296875); t.pool.set(332, -133.3333282470703); t.pool.set(333, 0.0); t.pool.set(334, 1.0)
    t.pool.set(335, 0.5); t.pool.set(336, 0.0); t.pool.set(337, 0.0); t.pool.set(338, 0.0); t.pool.set(339, 0.0)
    t.pool.set(340, -1.0); t.pool.set(341, 0.0); t.pool.set(342, 0.0); t.pool.set(343, 0.0); t.pool.set(344, 3.0)
    t.pool.set(345, 0.0); t.pool.set(346, 1147.499755859375); t.pool.set(347, -229.49996948242188); t.pool.set(348, 0.0); t.pool.set(349, 3.0)
    t.pool.set(350, 0.13333334028720856); t.pool.set(351, 0.0); t.pool.set(352, 0.0); t.pool.set(353, 0.0); t.pool.set(354, 1.6399999856948853)
    t.pool.set(355, -1.0); t.pool.set(356, 0.0); t.pool.set(357, 0.0); t.pool.set(358, 0.0); t.pool.set(359, 0.0)
    t.pool.set(360, 0.0); t.pool.set(361, 0.0); t.pool.set(362, 0.0); t.pool.set(363, 0.0); t.pool.set(364, 0.0)
    t.pool.set(365, 0.03333333507180214); t.pool.set(366, -1999.99951171875); t.pool.set(367, 299.99993896484375); t.pool.set(368, 0.0); t.pool.set(369, 0.0)
    t.pool.set(370, 0.13333334028720856); t.pool.set(371, 0.0); t.pool.set(372, 0.0); t.pool.set(373, 0.0); t.pool.set(374, 1.0)
    t.pool.set(375, 0.21666666865348816); t.pool.set(376, 196.63177490234375); t.pool.set(377, -63.90532684326172); t.pool.set(378, 0.0); t.pool.set(379, 1.0)
    t.pool.set(380, 0.4333333373069763); t.pool.set(381, 0.0); t.pool.set(382, 0.0); t.pool.set(383, 0.0); t.pool.set(384, 0.0)
    t.pool.set(385, -1.0); t.pool.set(386, 0.0); t.pool.set(387, 0.0); t.pool.set(388, 0.0); t.pool.set(389, 1.7000000476837158)
    t.pool.set(390, 0.0); t.pool.set(391, 0.0); t.pool.set(392, 0.0); t.pool.set(393, 0.0); t.pool.set(394, 1.7000000476837158)
    t.pool.set(395, 0.13333334028720856); t.pool.set(396, -32.4567985534668); t.pool.set(397, 17.851238250732422); t.pool.set(398, 0.0); t.pool.set(399, 1.7000000476837158)
    t.pool.set(400, 0.5); t.pool.set(401, 0.0); t.pool.set(402, 0.0); t.pool.set(403, 0.0); t.pool.set(404, 2.5)
    t.pool.set(405, -1.0); t.pool.set(406, 0.0); t.pool.set(407, 0.0); t.pool.set(408, 0.0); t.pool.set(409, 0.0)
    t.pool.set(410, 0.0); t.pool.set(411, 0.0); t.pool.set(412, 0.0); t.pool.set(413, 0.0); t.pool.set(414, 0.0)
    t.pool.set(415, 0.13333334028720856); t.pool.set(416, -432000.09375); t.pool.set(417, 10800.001953125); t.pool.set(418, 0.0); t.pool.set(419, 0.0)
    t.pool.set(420, 0.15000000596046448); t.pool.set(421, 46.64723205566406); t.pool.set(422, -24.489795684814453); t.pool.set(423, 0.0); t.pool.set(424, 1.0)
    t.pool.set(425, 0.5); t.pool.set(426, 0.0); t.pool.set(427, 0.0); t.pool.set(428, 0.0); t.pool.set(429, 0.0)
    t.pool.set(430, -1.0); t.pool.set(431, 0.0); t.pool.set(432, 0.0); t.pool.set(433, 0.0); t.pool.set(434, 2.0)
    t.pool.set(435, 0.0); t.pool.set(436, 0.0); t.pool.set(437, 0.0); t.pool.set(438, 0.0); t.pool.set(439, 2.0)
    t.pool.set(440, 0.10000000149011612); t.pool.set(441, -1259.47509765625); t.pool.set(442, 220.40814208984375); t.pool.set(443, 0.0); t.pool.set(444, 2.0)
    t.pool.set(445, 0.21666666865348816); t.pool.set(446, 0.0); t.pool.set(447, 0.0); t.pool.set(448, 0.0); t.pool.set(449, 3.0)
    t.pool.set(450, 0.3499999940395355); t.pool.set(451, 0.0); t.pool.set(452, 0.0); t.pool.set(453, 0.0); t.pool.set(454, 3.0)
    t.pool.set(455, -1.0); t.pool.set(456, 0.0); t.pool.set(457, 0.0); t.pool.set(458, 0.0); t.pool.set(459, 2.0)
    t.pool.set(460, 0.0); t.pool.set(461, 0.0); t.pool.set(462, 0.0); t.pool.set(463, 0.0); t.pool.set(464, 2.0)
    t.pool.set(465, 0.10000000149011612); t.pool.set(466, 0.0); t.pool.set(467, 0.0); t.pool.set(468, 0.0); t.pool.set(469, 2.0)
    t.pool.set(470, 0.21666666865348816); t.pool.set(471, 1687.5003662109375); t.pool.set(472, -337.50006103515625); t.pool.set(473, 0.0); t.pool.set(474, 2.0)
    t.pool.set(475, 0.3499999940395355); t.pool.set(476, 0.0); t.pool.set(477, 0.0); t.pool.set(478, 0.0); t.pool.set(479, 0.0)
    t.pool.set(480, -1.0); t.pool.set(481, 0.0); t.pool.set(482, 0.0); t.pool.set(483, 0.0); t.pool.set(484, 0.0)
    t.pool.set(485, 0.0); t.pool.set(486, 0.0); t.pool.set(487, 0.0); t.pool.set(488, 0.0); t.pool.set(489, 0.0)
    t.pool.set(490, 0.10000000149011612); t.pool.set(491, -432000.09375); t.pool.set(492, 10800.001953125); t.pool.set(493, 0.0); t.pool.set(494, 0.0)
    t.pool.set(495, 0.11666666716337204); t.pool.set(496, 157.43443298339844); t.pool.set(497, -55.10205078125); t.pool.set(498, 0.0); t.pool.set(499, 1.0)
    t.pool.set(500, 0.3499999940395355); t.pool.set(501, 0.0); t.pool.set(502, 0.0); t.pool.set(503, 0.0); t.pool.set(504, 0.0)
    t.pool.set(505, -1.0); t.pool.set(506, 0.0); t.pool.set(507, 0.0); t.pool.set(508, 0.0); t.pool.set(509, 0.30000001192092896)
    t.pool.set(510, 0.0); t.pool.set(511, -938.671630859375); t.pool.set(512, 187.73434448242188); t.pool.set(513, 0.0); t.pool.set(514, 0.30000001192092896)
    t.pool.set(515, 0.13333334028720856); t.pool.set(516, 0.0); t.pool.set(517, 0.0); t.pool.set(518, 0.0); t.pool.set(519, 1.412500023841858)
    t.pool.set(520, -1.0); t.pool.set(521, 0.0); t.pool.set(522, 0.0); t.pool.set(523, 0.0); t.pool.set(524, 0.0)
    t.pool.set(525, 0.0); t.pool.set(526, -843.7498168945312); t.pool.set(527, 168.74996948242188); t.pool.set(528, 0.0); t.pool.set(529, 0.0)
    t.pool.set(530, 0.13333334028720856); t.pool.set(531, 0.0); t.pool.set(532, 0.0); t.pool.set(533, 0.0); t.pool.set(534, 1.0)
    t.pool.set(535, 0.4333333373069763); t.pool.set(536, 6750.00146484375); t.pool.set(537, -675.0001220703125); t.pool.set(538, 0.0); t.pool.set(539, 1.0)
    t.pool.set(540, 0.5); t.pool.set(541, 0.0); t.pool.set(542, 0.0); t.pool.set(543, 0.0); t.pool.set(544, 0.0)
    t.pool.set(545, -1.0); t.pool.set(546, 0.0); t.pool.set(547, 0.0); t.pool.set(548, 0.0); t.pool.set(549, 1.3899999856948853)
    t.pool.set(550, 0.0); t.pool.set(551, 0.0); t.pool.set(552, 0.0); t.pool.set(553, 0.0); t.pool.set(554, 1.3899999856948853)
    t.pool.set(555, 0.13333334028720856); t.pool.set(556, -32.862510681152344); t.pool.set(557, 18.074382781982422); t.pool.set(558, 0.0); t.pool.set(559, 1.3899999856948853)
    t.pool.set(560, 0.5); t.pool.set(561, 0.0); t.pool.set(562, 0.0); t.pool.set(563, 0.0); t.pool.set(564, 2.200000047683716)
    t.pool.set(565, -1.0); t.pool.set(566, 0.0); t.pool.set(567, 0.0); t.pool.set(568, 0.0); t.pool.set(569, 0.0)
    t.pool.set(570, 0.0); t.pool.set(571, 0.0); t.pool.set(572, 0.0); t.pool.set(573, 0.0); t.pool.set(574, 0.0)
    t.pool.set(575, 0.13333334028720856); t.pool.set(576, -432000.09375); t.pool.set(577, 10800.001953125); t.pool.set(578, 0.0); t.pool.set(579, 0.0)
    t.pool.set(580, 0.15000000596046448); t.pool.set(581, 0.0); t.pool.set(582, 0.0); t.pool.set(583, 0.0); t.pool.set(584, 1.0)
    t.pool.set(585, 0.36666667461395264); t.pool.set(586, 843.7501831054688); t.pool.set(587, -168.75003051757812); t.pool.set(588, 0.0); t.pool.set(589, 1.0)
    t.pool.set(590, 0.5); t.pool.set(591, 0.0); t.pool.set(592, 0.0); t.pool.set(593, 0.0); t.pool.set(594, 0.0)
    t.pool.set(595, -1.0); t.pool.set(596, 0.0); t.pool.set(597, 0.0); t.pool.set(598, 0.0); t.pool.set(599, 1.3899999856948853)
    t.pool.set(600, 0.0); t.pool.set(601, 0.0); t.pool.set(602, 0.0); t.pool.set(603, 0.0); t.pool.set(604, 1.3899999856948853)
    t.pool.set(605, 0.13333334028720856); t.pool.set(606, -45.03380584716797); t.pool.set(607, 24.76859474182129); t.pool.set(608, 0.0); t.pool.set(609, 1.3899999856948853)
    t.pool.set(610, 0.5); t.pool.set(611, 0.0); t.pool.set(612, 0.0); t.pool.set(613, 0.0); t.pool.set(614, 2.5)
    t.pool.set(615, -1.0); t.pool.set(616, 0.0); t.pool.set(617, 0.0); t.pool.set(618, 0.0); t.pool.set(619, 0.0)
    t.pool.set(620, 0.0); t.pool.set(621, 0.0); t.pool.set(622, 0.0); t.pool.set(623, 0.0); t.pool.set(624, 0.0)
    t.pool.set(625, 0.13333334028720856); t.pool.set(626, -432000.09375); t.pool.set(627, 10800.001953125); t.pool.set(628, 0.0); t.pool.set(629, 0.0)
    t.pool.set(630, 0.15000000596046448); t.pool.set(631, 0.0); t.pool.set(632, 0.0); t.pool.set(633, 0.0); t.pool.set(634, 1.0)
    t.pool.set(635, 0.30000001192092896); t.pool.set(636, 250.0000762939453); t.pool.set(637, -75.00001525878906); t.pool.set(638, 0.0); t.pool.set(639, 1.0)
    t.pool.set(640, 0.5); t.pool.set(641, 0.0); t.pool.set(642, 0.0); t.pool.set(643, 0.0); t.pool.set(644, 0.0)
    t.pool.set(645, -1.0); t.pool.set(646, 0.0); t.pool.set(647, 0.0); t.pool.set(648, 0.0); t.pool.set(649, 1.1399998664855957)
    t.pool.set(650, 0.0); t.pool.set(651, -100.44001007080078); t.pool.set(652, 50.22000503540039); t.pool.set(653, 0.0); t.pool.set(654, 1.1399998664855957)
    t.pool.set(655, 0.3333333432674408); t.pool.set(656, 0.0); t.pool.set(657, 0.0); t.pool.set(658, 0.0); t.pool.set(659, 3.0)
    t.pool.set(660, -1.0); t.pool.set(661, 0.0); t.pool.set(662, 0.0); t.pool.set(663, 0.0); t.pool.set(664, 0.0)
    t.pool.set(665, 0.0); t.pool.set(666, 0.0); t.pool.set(667, 0.0); t.pool.set(668, 0.0); t.pool.set(669, 0.0)
    t.pool.set(670, 0.13333334028720856); t.pool.set(671, -1382.400390625); t.pool.set(672, 172.800048828125); t.pool.set(673, 0.0); t.pool.set(674, 0.0)
    t.pool.set(675, 0.21666666865348816); t.pool.set(676, 35.1719970703125); t.pool.set(677, -14.948098182678223); t.pool.set(678, 0.0); t.pool.set(679, 0.4000000059604645)
    t.pool.set(680, 0.5); t.pool.set(681, 0.0); t.pool.set(682, 0.0); t.pool.set(683, 0.0); t.pool.set(684, 0.0)
    t.pool.set(685, -1.0); t.pool.set(686, 0.0); t.pool.set(687, 0.0); t.pool.set(688, 0.0); t.pool.set(689, 3.0)
    t.pool.set(690, 0.0); t.pool.set(691, 1147.3726806640625); t.pool.set(692, -229.4745330810547); t.pool.set(693, 0.0); t.pool.set(694, 3.0)
    t.pool.set(695, 0.13333334028720856); t.pool.set(696, 0.0); t.pool.set(697, 0.0); t.pool.set(698, 0.0); t.pool.set(699, 1.6401506662368774)
    t.pool.set(700, -1.0); t.pool.set(701, 0.0); t.pool.set(702, 0.0); t.pool.set(703, 0.0); t.pool.set(704, 0.0)
    t.pool.set(705, 0.0); t.pool.set(706, -3456.0); t.pool.set(707, 432.0); t.pool.set(708, 0.0); t.pool.set(709, 0.0)
    t.pool.set(710, 0.0833333358168602); t.pool.set(711, 27.64800262451172); t.pool.set(712, -17.280000686645508); t.pool.set(713, 0.0); t.pool.set(714, 1.0)
    t.pool.set(715, 0.5); t.pool.set(716, 0.0); t.pool.set(717, 0.0); t.pool.set(718, 0.0); t.pool.set(719, 0.0)
    t.pool.set(720, -1.0); t.pool.set(721, 0.0); t.pool.set(722, 0.0); t.pool.set(723, 0.0); t.pool.set(724, 1.6999999284744263)
    t.pool.set(725, 0.0); t.pool.set(726, -4.693864320870489e-05); t.pool.set(727, 1.2964008419658057e-05); t.pool.set(728, 0.0); t.pool.set(729, 1.6999999284744263)
    t.pool.set(730, 0.13333334028720856); t.pool.set(731, -52.742286682128906); t.pool.set(732, 29.008258819580078); t.pool.set(733, 9.5367431640625e-07); t.pool.set(734, 1.7000000476837158)
    t.pool.set(735, 0.5); t.pool.set(736, 0.0); t.pool.set(737, 0.0); t.pool.set(738, 0.0); t.pool.set(739, 3.0)
    t.pool.set(740, -1.0); t.pool.set(741, 0.0); t.pool.set(742, 0.0); t.pool.set(743, 0.0); t.pool.set(744, 3.0)
    t.pool.set(745, 0.0); t.pool.set(746, 1147.372314453125); t.pool.set(747, -229.4744873046875); t.pool.set(748, 0.0); t.pool.set(749, 3.0)
    t.pool.set(750, 0.13333334028720856); t.pool.set(751, 0.0); t.pool.set(752, 0.0); t.pool.set(753, 0.0); t.pool.set(754, 1.640151023864746)
    t.pool.set(755, -1.0); t.pool.set(756, 0.0); t.pool.set(757, 0.0); t.pool.set(758, 0.0); t.pool.set(759, 2.0)
    t.pool.set(760, 0.0); t.pool.set(761, -206.71876525878906); t.pool.set(762, 92.25); t.pool.set(763, 0.0); t.pool.set(764, 2.0)
    t.pool.set(765, 0.13333334028720856); t.pool.set(766, -15990.0029296875); t.pool.set(767, 1063.5001220703125); t.pool.set(768, 13.574999809265137); t.pool.set(769, 3.1500000953674316)
    t.pool.set(770, 0.18333333730697632); t.pool.set(771, 0.0); t.pool.set(772, 0.0); t.pool.set(773, 0.0); t.pool.set(774, 4.488749980926514)
    t.pool.set(775, -1.0); t.pool.set(776, 0.0); t.pool.set(777, 0.0); t.pool.set(778, 0.0); t.pool.set(779, 1.0)
    t.pool.set(780, 0.0); t.pool.set(781, -843.7498168945312); t.pool.set(782, 168.74996948242188); t.pool.set(783, 0.0); t.pool.set(784, 1.0)
    t.pool.set(785, 0.13333334028720856); t.pool.set(786, 0.0); t.pool.set(787, 0.0); t.pool.set(788, 0.0); t.pool.set(789, 2.0)
    t.pool.set(790, 0.18333333730697632); t.pool.set(791, 0.0); t.pool.set(792, 0.0); t.pool.set(793, 0.0); t.pool.set(794, 2.0)
    t.pool.set(795, -1.0); t.pool.set(796, 0.0); t.pool.set(797, 0.0); t.pool.set(798, 0.0); t.pool.set(799, 0.0)
    t.pool.set(800, 0.0); t.pool.set(801, -506.2499084472656); t.pool.set(802, 101.24999237060547); t.pool.set(803, 0.0); t.pool.set(804, 0.0)
    t.pool.set(805, 0.13333334028720856); t.pool.set(806, 24.342599868774414); t.pool.set(807, -13.388429641723633); t.pool.set(808, 0.0); t.pool.set(809, 0.6000000238418579)
    t.pool.set(810, 0.5); t.pool.set(811, 0.0); t.pool.set(812, 0.0); t.pool.set(813, 0.0); t.pool.set(814, 0.0)
    t.pool.set(815, -1.0); t.pool.set(816, 0.0); t.pool.set(817, 0.0); t.pool.set(818, 0.0); t.pool.set(819, 2.0)
    t.pool.set(820, 0.0); t.pool.set(821, -843.7498168945312); t.pool.set(822, 168.74996948242188); t.pool.set(823, 0.0); t.pool.set(824, 2.0)
    t.pool.set(825, 0.13333334028720856); t.pool.set(826, 0.0); t.pool.set(827, 0.0); t.pool.set(828, 0.0); t.pool.set(829, 3.0)
    t.pool.set(830, -1.0); t.pool.set(831, 0.0); t.pool.set(832, 0.0); t.pool.set(833, 0.0); t.pool.set(834, 1.0)
    t.pool.set(835, 0.0); t.pool.set(836, 0.0); t.pool.set(837, 0.0); t.pool.set(838, 0.0); t.pool.set(839, 1.0)
    t.pool.set(840, 0.13333334028720856); t.pool.set(841, 0.0); t.pool.set(842, 0.0); t.pool.set(843, 0.0); t.pool.set(844, 1.0)
    t.pool.set(845, -1.0); t.pool.set(846, 0.0); t.pool.set(847, 0.0); t.pool.set(848, 0.0); t.pool.set(849, 0.20000000298023224)
    t.pool.set(850, 0.0); t.pool.set(851, -734.8148193359375); t.pool.set(852, 165.3333282470703); t.pool.set(853, 0.0); t.pool.set(854, 0.20000000298023224)
    t.pool.set(855, 0.15000000596046448); t.pool.set(856, 0.0); t.pool.set(857, 0.0); t.pool.set(858, 0.0); t.pool.set(859, 1.440000057220459)
    t.pool.set(860, -1.0); t.pool.set(861, 0.0); t.pool.set(862, 0.0); t.pool.set(863, 0.0); t.pool.set(864, 0.0)
    t.pool.set(865, 0.0); t.pool.set(866, -592.592529296875); t.pool.set(867, 133.3333282470703); t.pool.set(868, 0.0); t.pool.set(869, 0.0)
    t.pool.set(870, 0.15000000596046448); t.pool.set(871, 46.64723205566406); t.pool.set(872, -24.489795684814453); t.pool.set(873, 0.0); t.pool.set(874, 1.0)
    t.pool.set(875, 0.5); t.pool.set(876, 0.0); t.pool.set(877, 0.0); t.pool.set(878, 0.0); t.pool.set(879, 0.0)
    t.pool.set(880, -1.0); t.pool.set(881, 0.0); t.pool.set(882, 0.0); t.pool.set(883, 0.0); t.pool.set(884, 1.3951575756072998)
    t.pool.set(885, 0.0); t.pool.set(886, 4.351715564727783); t.pool.set(887, -0.8703432083129883); t.pool.set(888, 0.0); t.pool.set(889, 1.3951575756072998)
    t.pool.set(890, 0.13333334028720856); t.pool.set(891, -32.862510681152344); t.pool.set(892, 18.074382781982422); t.pool.set(893, 0.0); t.pool.set(894, 1.3899999856948853)
    t.pool.set(895, 0.5); t.pool.set(896, 0.0); t.pool.set(897, 0.0); t.pool.set(898, 0.0); t.pool.set(899, 2.200000047683716)
    t.pool.set(900, -1.0); t.pool.set(901, 0.0); t.pool.set(902, 0.0); t.pool.set(903, 0.0); t.pool.set(904, 1.395158052444458)
    t.pool.set(905, 0.0); t.pool.set(906, 4.352118015289307); t.pool.set(907, -0.8704236745834351); t.pool.set(908, 0.0); t.pool.set(909, 1.395158052444458)
    t.pool.set(910, 0.13333334028720856); t.pool.set(911, -32.862510681152344); t.pool.set(912, 18.074382781982422); t.pool.set(913, 0.0); t.pool.set(914, 1.3899999856948853)
    t.pool.set(915, 0.5); t.pool.set(916, 0.0); t.pool.set(917, 0.0); t.pool.set(918, 0.0); t.pool.set(919, 2.200000047683716)
    t.pool.set(920, -1.0); t.pool.set(921, 0.0); t.pool.set(922, 0.0); t.pool.set(923, 0.0); t.pool.set(924, 0.0)
    t.pool.set(925, 0.0); t.pool.set(926, 0.0); t.pool.set(927, 0.0); t.pool.set(928, 0.0); t.pool.set(929, 0.0)
    t.pool.set(930, 0.15000000596046448); t.pool.set(931, -3375.000732421875); t.pool.set(932, 337.50006103515625); t.pool.set(933, 0.0); t.pool.set(934, 0.0)
    t.pool.set(935, 0.21666666865348816); t.pool.set(936, 43.96499252319336); t.pool.set(937, -18.685121536254883); t.pool.set(938, 0.0); t.pool.set(939, 0.5)
    t.pool.set(940, 0.5); t.pool.set(941, 0.0); t.pool.set(942, 0.0); t.pool.set(943, 0.0); t.pool.set(944, 0.0)
    t.pool.set(945, -1.0); t.pool.set(946, 0.0); t.pool.set(947, 0.0); t.pool.set(948, 0.0); t.pool.set(949, 1.3951575756072998)
    t.pool.set(950, 0.0); t.pool.set(951, 4.351715564727783); t.pool.set(952, -0.8703432083129883); t.pool.set(953, 0.0); t.pool.set(954, 1.3951575756072998)
    t.pool.set(955, 0.13333334028720856); t.pool.set(956, -45.03380584716797); t.pool.set(957, 24.76859474182129); t.pool.set(958, 0.0); t.pool.set(959, 1.3899999856948853)
    t.pool.set(960, 0.5); t.pool.set(961, 0.0); t.pool.set(962, 0.0); t.pool.set(963, 0.0); t.pool.set(964, 2.5)
    t.pool.set(965, -1.0); t.pool.set(966, 0.0); t.pool.set(967, 0.0); t.pool.set(968, 0.0); t.pool.set(969, 1.395158052444458)
    t.pool.set(970, 0.0); t.pool.set(971, 4.352118015289307); t.pool.set(972, -0.8704236745834351); t.pool.set(973, 0.0); t.pool.set(974, 1.395158052444458)
    t.pool.set(975, 0.13333334028720856); t.pool.set(976, -45.03380584716797); t.pool.set(977, 24.76859474182129); t.pool.set(978, 0.0); t.pool.set(979, 1.3899999856948853)
    t.pool.set(980, 0.5); t.pool.set(981, 0.0); t.pool.set(982, 0.0); t.pool.set(983, 0.0); t.pool.set(984, 2.5)
    t.pool.set(985, -1.0); t.pool.set(986, 0.0); t.pool.set(987, 0.0); t.pool.set(988, 0.0); t.pool.set(989, 0.0)
    t.pool.set(990, 0.0); t.pool.set(991, 0.0); t.pool.set(992, 0.0); t.pool.set(993, 0.0); t.pool.set(994, 0.0)
    t.pool.set(995, 0.15000000596046448); t.pool.set(996, -6750.00146484375); t.pool.set(997, 675.0001220703125); t.pool.set(998, 0.0); t.pool.set(999, 0.0)
    t.pool.set(1000, 0.21666666865348816); t.pool.set(1001, 87.92998504638672); t.pool.set(1002, -37.370243072509766); t.pool.set(1003, 0.0); t.pool.set(1004, 1.0)
    t.pool.set(1005, 0.5); t.pool.set(1006, 0.0); t.pool.set(1007, 0.0); t.pool.set(1008, 0.0); t.pool.set(1009, 0.0)
    return sp.hudRankFxBTextGlowB.exists && sp.hudRankFxLine00B.exists && sp.hudRankFxLine01B.exists && sp.hudRankFxATextGlow00A.exists && sp.hudRankFxATextGlow01A.exists && sp.hudRankFxLine00A.exists && sp.hudRankFxLine01A.exists && sp.hudRankFxRing.exists && sp.hudRankFxSTextGlow00.exists && sp.hudRankFxSTextGlow01.exists && sp.hudRankFxFlare.exists && sp.hudRankFxLineGrad.exists && sp.hudRankFxSsTextGlow00.exists && sp.hudRankFxSsTextGlow01.exists
}
