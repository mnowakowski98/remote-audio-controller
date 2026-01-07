import assert from 'node:assert';
import { spawn, ChildProcess } from 'node:child_process'
import { createReadStream, existsSync, rmSync } from 'node:fs';
import { open, writeFile } from 'node:fs/promises';
import { normalize } from 'node:path'

let mpg123Process: ChildProcess | undefined
let mpg123Pipe: string | undefined
const mpg123OutputPipe = () => mpg123Pipe?.concat('-output')

let lastAudioPath: string | null = null

const sendCommand = (command: string) => writeFile(mpg123Pipe!, command.concat('\r\n'))

export const loadAudio = (filePath?: string) => {
    assert(filePath != undefined || lastAudioPath != null, 'Attempted to load nothing to mpg123')
    const path = filePath ?? lastAudioPath
    lastAudioPath = path
    sendCommand(`loadpaused ${path}`)
}
export const pauseAudio = () => sendCommand('pause')
export const stopAudio = () => sendCommand('stop')

export const seek = (positionMs: number) => {
    const samplePosition = positionMs // TODO: Convert positionMs to sample position
    sendCommand(`seek ${samplePosition}`)
}

const stopMpg123 = () => {
    if (mpg123Pipe != undefined && existsSync(mpg123Pipe) == true) rmSync(mpg123Pipe)
    const outpipe = mpg123OutputPipe()
    if (outpipe != undefined && existsSync(outpipe) == true) rmSync(outpipe)
    if (mpg123Process != undefined && mpg123Process.killed == false)
        if (mpg123Process.kill() == false) console.error(`Failed to kill mpg123 process`)

    mpg123Process == undefined
}

export const startMpg123 = (execPath: string, pipe: string) => {
    stopMpg123()
    if (mpg123Pipe == undefined) {
        mpg123Pipe = normalize(pipe)

        const pipeSpawn = spawn('mkfifo', [mpg123Pipe])
        pipeSpawn.on('exit', () => {
            const outputPipe = mpg123OutputPipe()!
            const outputPipeSpawn = spawn('mkfifo', [outputPipe])
            outputPipeSpawn.on('exit', async () => {
                const fd = await open(outputPipe, 'r+')
                console.log(`Starting mpg123\npipe: ${pipe}\noutput-pipe: ${outputPipe}\n`)
                mpg123Process = spawn(`${execPath}`, ['-R', '--fifo', pipe, '--no-control', '--keep-open', '-q'],{
                    stdio: ['pipe', fd.createWriteStream(), 'pipe']
                })

                const outputStream = createReadStream('', { fd })
                outputStream.on('data', data => console.log(data.toString()))
            })
        })
    }
}

process.addListener('exit', stopMpg123)