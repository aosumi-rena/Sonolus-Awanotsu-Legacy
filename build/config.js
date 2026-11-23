import { availableParallelism } from 'node:os'
import { join } from 'node:path'

export const engineBuild = (type) => ({
    type,
    ...(process.env.AWANOTSU_BUILD_DIR ? {
        dev: join(process.env.AWANOTSU_BUILD_DIR, type, 'dev'),
        dist: join(process.env.AWANOTSU_BUILD_DIR, type, 'dist'),
        workerCount: 1,
    } : { workerCount: Math.max(1, Math.min(Number(process.env.BUILD_WORKERS) || 2, availableParallelism())) }),
    optimizationLevel: 'high',
})
