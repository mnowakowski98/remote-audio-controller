import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from '../store'

import { ChildProcess, spawn } from 'node:child_process'
import { createReadStream, existsSync, rmSync } from 'node:fs'
import { open, writeFile } from 'node:fs/promises'
import { normalize } from 'node:path'

import { filePlayerKey, FilePlayerState as FilePlayerUIState, PlayingState } from '../models/filePlayer'
import { IAudioMetadata } from 'music-metadata'
import { getSoundFile } from './soundFiles'
import assert from 'node:assert'

//#region State Types
interface PlayingFile {
    path: string,
    name: string,
}

let playingFileMetadata: IAudioMetadata | null = null

interface PlayerControls {
    loop: boolean
}

interface SeekTimings {
    audioStart: number | null // Monotonic clock time when playingState last became 'playing' or seek occurred while playing
    initialPositionMs: number // Seek position at start or set
    lastPause: number // Monotonic clock time from last pause or when seek occurred while paused
    timePaused: number // Monotonic clock time elapsed since lastPause
}

interface FilePlayerState {
    audioPlaying: boolean,
    audioPaused: boolean,
    playingFile: PlayingFile | null,
    seekTimings: SeekTimings,
    controls: PlayerControls
}
//#endregion

const slice = createSlice({
    name: filePlayerKey,
    initialState: {
        audioPlaying: false,
        audioPaused: false,
        playingFile: null,
        seekTimings: {
            audioStart: null,
            initialPositionMs: 0,
            lastPause: 0,
            timePaused: 0
        },
        controls: {
            loop: false
        }
    } as FilePlayerState,
    reducers: {
        start: (state, action: PayloadAction<number | undefined>) => {
            if (state.audioPlaying == true && state.audioPaused == false) return

            state.seekTimings.audioStart = performance.now() - (action.payload ?? 0)

            state.audioPlaying = true
            state.audioPaused = false
        },
        pause: (state) => {
            if (state.audioPlaying == false || state.audioPaused == true) return
            state.audioPaused = true
            state.seekTimings.lastPause = performance.now()
        },
        stop: (state) => {
            if (state.audioPlaying == false && state.audioPaused == false) return
            state.audioPlaying = false
            state.audioPaused = false

            state.seekTimings.audioStart = null
            state.seekTimings.initialPositionMs = 0
            state.seekTimings.lastPause = 0
            state.seekTimings.timePaused = 0
        },
        seek: (state, action: PayloadAction<number>) => {
            state.seekTimings.initialPositionMs = action.payload
            state.seekTimings.timePaused = 0
            state.seekTimings.audioStart = performance.now()
            if (state.audioPaused == true) state.seekTimings.lastPause = performance.now()
            if (state.audioPlaying == false) state.seekTimings.lastPause = 0
        },
        setFileInfo: (state, action: PayloadAction<PlayingFile | null>) => {
            const wasPlaying = state.audioPlaying == true && state.audioPaused == false
            state.playingFile = action.payload
            state.audioPaused = false
            state.seekTimings.audioStart = null
            state.seekTimings.initialPositionMs = 0
            state.seekTimings.lastPause = 0
            state.seekTimings.timePaused = 0

            if (action.payload == null) {
                state.audioPlaying = false
                return
            }

            if (wasPlaying == true) state.seekTimings.audioStart = performance.now()
        },
        setLoop: (state, action: PayloadAction<boolean | null>) => {
            const currentLoop = state.controls.loop
            if (action.payload == undefined) state.controls.loop = !currentLoop
            else state.controls.loop = action.payload
        },
        loop: (state) => {
            state.seekTimings.audioStart = performance.now()
            state.seekTimings.initialPositionMs = 0
            state.seekTimings.lastPause = 0
            state.seekTimings.timePaused = 0
        }
    },
    selectors: {
        selectPlayingState: (state): PlayingState => {
            const isInvalidState = state.audioPlaying == false && state.audioPaused == true
            assert(isInvalidState == false, 'Playing state is invalid (paused while not playing)')

            if (state.playingFile == null) return 'unloaded'
            if (state.audioPlaying == true && state.audioPaused == false) return 'playing'
            if (state.audioPlaying == true && state.audioPaused == true) return 'paused'
            return 'stopped'
        },
        selectPlayingFile: (state) => state.playingFile,
        selectSeekTime: (state) =>
            state.seekTimings.audioStart != null ?
                ((performance.now() - state.seekTimings.audioStart) - state.seekTimings.timePaused) + state.seekTimings.initialPositionMs
                : 0
    }
})

export const filePlayerReducer = slice.reducer
export const { setLoop } = slice.actions
export const {
    selectPlayingFile,
    selectPlayingState,
    selectSeekTime
} = slice.selectors

export const selectUIState = (_state: RootState): FilePlayerUIState => {
    const state = _state.filePlayer
    return {
        playingState: selectPlayingState(_state),
        loop: state.controls.loop,
        seekPosition: selectSeekTime(_state),
        playingFile: state.playingFile != null ? getSoundFile(state.playingFile.name, playingFileMetadata!): null
    }
}

let mpg123Process: ChildProcess | undefined
let mpg123Pipe: string | undefined
const mpg123OutputPipe = () => mpg123Pipe?.concat('-output')

const sendCommand = (command: string) => writeFile(mpg123Pipe!, command.concat('\r\n'))

export const start = (): AppThunk => {
    return async (dispatch, getState) => {
        const playingState = selectPlayingState(getState())
        if (playingState == 'playing' || playingState == 'unloaded') return
        await sendCommand('pause')
        dispatch(slice.actions.start())
    }
}

export const pause = (): AppThunk => {
    return async (dispatch, getState) => {
        const playingState = selectPlayingState(getState())
        if (playingState == 'paused' || playingState == 'unloaded') return
        await sendCommand('pause')
        dispatch(slice.actions.pause())
    }
}

export const stop = (): AppThunk => {
    return async (dispatch, getState) => {
        const state = getState()
        const playingState = selectPlayingState(state)
        const playingFile = selectPlayingFile(state)
        if (playingState == 'stopped' || playingFile == null) return
        await sendCommand('stop')
        await sendCommand(`loadpaused ${playingFile.path}`)
        dispatch(slice.actions.stop())
    }
}

export const seek = (seekToMs: number): AppThunk => {
    return async (dispatch) => {
        await sendCommand(`jump ${seekToMs / 1000}s`)
        dispatch(slice.actions.seek(seekToMs))
    }
}

export const setFileInfo = (file: PlayingFile | null, metadata?: IAudioMetadata): AppThunk => {
    return async (dispatch, getState) => {
        if (file == null) {
            sendCommand('stop')
            dispatch(slice.actions.setFileInfo(null))
            return
        }

        playingFileMetadata = metadata ?? null
        const wasPlaying = selectPlayingState(getState()) == 'playing'
        await sendCommand(`loadpaused ${file.path}`)
        dispatch(slice.actions.setFileInfo(file))
        if (wasPlaying == true) sendCommand('pause')
    }
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

export const startMpg123 = (execPath: string, pipe: string): AppThunk => {
    return (dispatch, getState) => {
        stopMpg123()
        if (mpg123Pipe == undefined) {
            mpg123Pipe = normalize(pipe)

            const pipeSpawn = spawn('mkfifo', [mpg123Pipe])
            pipeSpawn.on('exit', () => {
                const outputPipe = mpg123OutputPipe()!
                const outputPipeSpawn = spawn('mkfifo', [outputPipe])
                outputPipeSpawn.on('exit', async () => {
                    const outputPipeDescriptor = await open(outputPipe, 'r+')
                    console.log(`\nStarting mpg123\nCommand pipe: ${pipe}\nOutput pipe: ${outputPipe}`)
                    mpg123Process = spawn(`${execPath}`, ['-R', '--fifo', pipe, '--no-control', '--keep-open', '-q'], {
                        stdio: ['pipe', outputPipeDescriptor.createWriteStream(), 'pipe']
                    })

                    const outputStream = createReadStream('', { fd: outputPipeDescriptor })
                    outputStream.on('data', async data => {
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
                                        break
                                    case '1': // Paused - file loaded, manual or end of file (keep-open, follows 3)
                                        break
                                    case '2': // Tried to play open file at end. Followed by: 3 then 1
                                        break;
                                    case '3': // End of file, stopped playing. Followed by: 0 or 1
                                        sendCommand('seek 0')
                                        if (getState().filePlayer.controls.loop == true) {
                                            await sendCommand('pause')
                                            dispatch(slice.actions.loop())
                                        } else dispatch(slice.actions.stop())
                                        break
                                }
                                break
                            case 'I': // Just ID3v2 info, should already be known via music-metadata
                                break
                            case 'K': // Outputs when a seek happens (value is mpeg frame), should only occur via rest api (but not impossible to inject via pipe)
                                break
                            case 'J': // Outputs when a jump happens, same note as K. Value seems to be same as seek
                                break
                            case 'E': // Error output
                                break
                        }
                    })
                })
            })
        }
    }
}

process.addListener('exit', stopMpg123) // child process should exit with parent, pipes still need to be removed tho