import assert from 'node:assert';
import { spawn, ChildProcess } from 'node:child_process'
import { createReadStream, existsSync, rmSync } from 'node:fs';
import { open, writeFile } from 'node:fs/promises';
import { normalize } from 'node:path'

let mpg123Process: ChildProcess | undefined
let mpg123Pipe: string | undefined
const mpg123OutputPipe = () => mpg123Pipe?.concat('-output')

let lastAudioPath: string | null = null

type Mpg123Listeners = {
    listenerKey: string
    onAudioEnd?: () => void
    onAudioPause?: () => void
    onAudioUnpause?: () => void
}

const eventListeners = new Map<string, Mpg123Listeners>()

export const setAudioEventListeners = (key: string, listeners: Mpg123Listeners) => eventListeners.set(key, listeners)
export const removeAudioEventListeners = (key: string) => eventListeners.delete(key)

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

// Called by process.exit listener, can't use async code
const stopMpg123 = () => {
    if (mpg123Pipe != undefined && existsSync(mpg123Pipe) == true) rmSync(mpg123Pipe)
    const outpipe = mpg123OutputPipe()
    if (outpipe != undefined && existsSync(outpipe) == true) rmSync(outpipe)
    if (mpg123Process != undefined && mpg123Process.killed == false)
        if (mpg123Process.kill() == false) console.error(`Failed to kill mpg123 process`)

    mpg123Process == undefined
}

// TODO: Add callbacks for external state updates
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
                outputStream.on('data', data => {
                    const dataString = data.toString()
                    console.log(dataString)

                    const lineTypeChar = dataString.at(1)
                    switch (lineTypeChar) {
                        case 'R': // Version info, maybe nothing to do
                            break
                        case 'F': // TODO: Handle propagating frame information (for audio progress)

                            break
                        case 'P': // Playing/paused states
                            const value = dataString.at(3)
                            switch (value) {
                                case '0': // Playing or end of file (closed, follows 3)
                                    for (const listeners of eventListeners.values()) listeners.onAudioUnpause?.()
                                    break
                                case '1': // Paused - manual or end of file (keep-open, follows 3)
                                    for (const listeners of eventListeners.values()) listeners.onAudioPause?.()
                                    break
                                case '2': // Tried to play open file at end. Followed by: 3 then 1
                                    break;
                                case '3': // End of file, stopped playing. Followed by: 0 or 1
                                    for (const listeners of eventListeners.values()) listeners.onAudioEnd?.()
                                    break
                            }
                            break

                        case 'I': // Just ID3v2 info, should already be known via music-metadata
                            break
                        case 'K': // Outputs when a seek happens, should only occur via rest api (but not impossible to inject via pipe)
                            break
                    }
                })
            })
        })
    }
}

process.addListener('exit', stopMpg123) // child process should exit with parent, pipes still need to be removed tho