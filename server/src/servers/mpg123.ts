import assert from 'node:assert';
import { spawn, ChildProcess } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { normalize } from 'node:path'

let mpg123Process: ChildProcess | undefined
let mpg123Pipe: string | undefined
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

const stopMpg123 = () => {
    if(mpg123Pipe != undefined && existsSync(mpg123Pipe) == true) rmSync(mpg123Pipe)
    if (mpg123Process != undefined && mpg123Process.killed == false)
        if(mpg123Process.kill() == false) console.error(`Failed to kill mpg123 process`)

    mpg123Process == undefined
}

export const startMpg123 = async (execPath: string, pipe: string) => {
    stopMpg123()
    if (mpg123Pipe == undefined) {
        mpg123Pipe = normalize(pipe)
        const pipeSpawn = spawn(`mkfifo`, [mpg123Pipe])
        pipeSpawn.on('exit', () => {
            console.log(`Starting mpg123\npipe: ${pipe}`)
            mpg123Process = spawn(`${execPath}`, ['-R', '--fifo', pipe])
        })
    }
}

process.addListener('exit', stopMpg123)