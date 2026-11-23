import { INPUT_LANE_MARGIN_PLANE, NO_LANE, edgeOfLane, laneOfPlaneX } from '../../../../../shared/src/engine/data/inputLane.js'
import { layout } from '../layout.js'

export { INPUT_LANE_MARGIN_PLANE, NO_LANE, edgeOfLane }

export const laneOfScreenX = (x: number) => laneOfPlaneX(x / layout.scale / (1 + layout.judgeOffset))

export const edgeOfTouchX = (x: number) => edgeOfLane(laneOfScreenX(x))
