import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rename, rm } from 'node:fs/promises'
import { availableParallelism, totalmem } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const sdk = join(root, 'node_modules', '@sonolus', 'sonolus.js')
const { bin } = JSON.parse(await readFile(join(sdk, 'package.json'), 'utf8'))
const cli = join(sdk, bin['sonolus-cli'])
const modes = ['play', 'watch', 'preview', 'tutorial']
const selected = process.argv.slice(2)
const queue = selected.length ? [...new Set(selected)] : [...modes]
if (queue.some(mode => !modes.includes(mode))) throw new Error('Unknown build mode.')
const defaultWorkers = totalmem() >= 8 * 1024 ** 3 ? 2 : 1
const workers = Math.min(availableParallelism(), Number(process.env.BUILD_WORKERS) || defaultWorkers)
if (!Number.isSafeInteger(workers) || workers < 1) throw new Error('BUILD_WORKERS must be a positive integer.')

const dev = join(root, '.dev')
await mkdir(dev, { recursive: true })
const scratch = await mkdtemp(join(dev, 'build-'))
const finished = []

async function buildNext() {
    while (queue.length) {
        const mode = queue.shift()
        console.log('Building ' + mode)
        const child = spawn(process.execPath, [cli, '--build', './' + mode], {
            cwd: root,
            stdio: 'inherit',
            env: { ...process.env, AWANOTSU_BUILD_DIR: scratch },
        })
        await new Promise((ok, fail) => {
            child.once('error', fail)
            child.once('exit', (code, signal) => code === 0 ? ok() : fail(new Error(mode + ' build failed (' + (signal ?? code) + ')')))
        })
        finished.push(mode)
    }
}

try {
    const results = await Promise.allSettled(Array.from({ length: Math.min(workers, 2, queue.length) }, buildNext))
    for (const result of results) if (result.status === 'rejected') throw result.reason
    const dist = join(root, 'dist')
    await mkdir(dist, { recursive: true })
    const config = mode => join(scratch, mode, 'dist', 'EngineConfiguration')
    const configuration = await readFile(config(finished[0]))
    for (const mode of finished) {
        if (!configuration.equals(await readFile(config(mode)))) throw new Error('Engine configurations differ between modes.')
    }
    for (const mode of finished) {
        const name = 'Engine' + mode[0].toUpperCase() + mode.slice(1) + 'Data'
        await rename(join(scratch, mode, 'dist', name), join(dist, name))
    }
    await rename(config(finished[0]), join(dist, 'EngineConfiguration'))
} finally {
    await rm(scratch, { recursive: true, force: true })
}
