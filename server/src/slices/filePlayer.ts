import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from '../store'

import { selectFilePlayerConfig } from './configSlice'
import { filePlayerKey, FilePlayerState as FilePlayerUIState, PlayingState } from '../models/filePlayer'

import { exec as _exec } from 'node:child_process'
import { accessSync, createReadStream } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, normalize } from 'node:path'
import { promisify } from 'node:util'

import findExec from 'find-exec'
import { IAudioMetadata } from 'music-metadata'
import Speaker, { Stream } from 'speaker'

//#region State Types
interface PlayingFile {
    name: string,
    metadata: IAudioMetadata,
    audio: Stream.Readable | null,
    speaker: Speaker | null
}

interface PlayerSettings {
    ffmpeg: string,
    originalFile: string,
    playingFile: string
}

interface PlayerControls {
    loop: boolean
}

interface SeekTimings {
    audioStart: number | null,
    lastPause: number,
    timePaused: number
}

interface FilePlayerState {
    audioPlaying: boolean,
    audioPaused: boolean,
    playerSettings: PlayerSettings,
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
        playerSettings: {
            ffmpeg: '',
            originalFile: '',
            playingFile: '',
        },
        playingFile: null,
        seekTimings: {
            audioStart: null,
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
                
            if (state.audioPaused == true) state.seekTimings.timePaused += performance.now() - state.seekTimings.lastPause
            else state.seekTimings.audioStart = performance.now() - (action.payload ?? 0)
        
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
            state.seekTimings.lastPause = 0
            state.seekTimings.timePaused = 0
        },
        setPlayerSettings: (state, action: PayloadAction<PlayerSettings>) => { state.playerSettings = action.payload },
        setFileInfo: (state, action: PayloadAction<PlayingFile | null>) => { state.playingFile = action.payload },
        setSpeaker: (state, action: PayloadAction<Speaker | null>) => { state.playingFile!.speaker = action.payload },
        setAudio: (state, action: PayloadAction<Stream.Readable | null>) => { state.playingFile!.audio = action.payload },
        setLoop: (state, action: PayloadAction<boolean | null>) => {
            const currentLoop = state.controls.loop
            if (action.payload == undefined) state.controls.loop = !currentLoop
            else state.controls.loop = action.payload
        }
    },
    selectors: {
        selectPlayingState: (state): PlayingState => {
            if (state.audioPlaying == true && state.audioPaused == false) return 'playing'
            else if (state.audioPlaying == true && state.audioPaused == true) return 'paused'
            else if (state.audioPlaying == false && state.audioPaused == true) throw 'File player state corrupted'
            else return 'stopped'
        },
        selectPlayingFile: (state) => state.playingFile,
        selectPlayerSettings: (state) => state.playerSettings,
        selectSeekTime: (state) =>
            state.seekTimings.audioStart != null ? (performance.now() - state.seekTimings.audioStart) - state.seekTimings.timePaused : 0
    }
})
export const filePlayerReducer = slice.reducer

const {
    start,
    pause,
    stop,
    setPlayerSettings,
    setFileInfo,
    setSpeaker,
    setAudio
} = slice.actions
export const { setLoop } = slice.actions

const {
    selectPlayingFile,
    selectPlayingState,
    selectPlayerSettings,
    selectSeekTime
} = slice.selectors

export const selectUIState = (_state: RootState): FilePlayerUIState => {
    const state = _state.filePlayer
    return {
        playingState: selectPlayingState(_state),
        loop: state.controls.loop,
        seekPosition: selectSeekTime(_state),
        playingFile: state.playingFile != null ? {
            id: 'playing',
            name: state.playingFile.name,
            title: state.playingFile?.metadata.common.title ?? '(No title)',
            artist: state.playingFile?.metadata.common.artist ?? '(No artist)',
            album: state.playingFile?.metadata.common.album ?? '(No album)',
            durationMs: (state.playingFile?.metadata.format.duration ?? 0) * 1000
        } : null
    }
}

export const setInitialState = (): AppThunk => {
    return async (dispatch, getState) => {
        const ffmpegPath = selectFilePlayerConfig(getState()).ffmpegPath ?? 'ffmpeg'
        const ffmpeg = findExec(normalize(ffmpegPath))
        if (ffmpeg == null) throw 'FATAL: ffmpeg is not accessible'

        const configDir = selectFilePlayerConfig(getState()).tempFileDirectory
        const tempDir = configDir == ':tmp:' ? tmpdir() : configDir
        try { accessSync(tempDir) }
        catch { throw `FATAL: Can't access temp folder: ${tempDir}` }

        const originalFile = join(tempDir, './audioplayer-original')
        const playingFile = join(tempDir, './audioplayer-playing')
        await writeFile(originalFile, '')
        await writeFile(playingFile, '')

        dispatch(setPlayerSettings({ ffmpeg, originalFile, playingFile }))
    }
}

export const stopPlaying = (): AppThunk => {
    return (dispatch, getState) => {
        if (selectPlayingFile(getState()) == null) return

        const playingState = selectPlayingState(getState())
        const playingFile = selectPlayingFile(getState())

        if (playingState == 'stopped') return
        if (playingFile == null) return

        if (playingFile.audio == null) throw 'Audio does not exist to pause'
        playingFile.audio.unpipe()
        playingFile.audio.removeAllListeners()
        if (playingFile.speaker != null) playingFile.speaker.close(true)

        dispatch(setAudio(null))
        dispatch(setSpeaker(null))
        dispatch(stop())
    }
}

export const pausePlaying = (): AppThunk => {
    return (dispatch, getState) => {
        if (selectPlayingFile(getState()) == null) return

        const playingState = selectPlayingState(getState())
        const playingFile = selectPlayingFile(getState())

        if (playingState == 'paused') return
        if (playingFile == null) return

        if (playingFile.audio == null) throw 'Audio does not exist to pause'
        if (playingFile.speaker == null) throw 'Speaker does not exist to close'
        playingFile.audio.unpipe()
        playingFile.speaker.close(true)

        dispatch(setSpeaker(null))
        dispatch(pause())
    }
}

export const startPlaying = (startAt?: number): AppThunk => {
    return (dispatch, getState) => {
        if (selectPlayingFile(getState()) == null) return
        
        const playingState = selectPlayingState(getState())
        const playingFile = selectPlayingFile(getState())
        const playingSettings = selectPlayerSettings(getState())

        if (playingState == 'playing') return
        if (playingFile == null) return

        const speaker = new Speaker({
            channels: playingFile.metadata.format.numberOfChannels ?? 2,
            bitDepth: playingFile.metadata.format.bitsPerSample ?? 16,
            sampleRate: playingFile.metadata.format.sampleRate ?? 44100
        })

        const state = getState().filePlayer
        const startingByte = Math.floor((startAt ?? 0) / 1000
                * (((state.playingFile?.metadata.format.bitsPerSample ?? 16) / 8)
                * (state.playingFile?.metadata.format.sampleRate ?? 44100)))

        const audio = playingFile.audio ?? createReadStream(playingSettings.playingFile, { start: startingByte })
        audio.addListener('end', () => {
            dispatch(stopPlaying())
            if (getState().filePlayer.controls.loop == true) dispatch(startPlaying())
        })


        audio.pipe(speaker)
        dispatch(start())
        dispatch(setSpeaker(speaker))
        dispatch(setAudio(audio))
    }
}

export const seek = (seekTo: number): AppThunk => {
    return (dispatch, getState) => {
        dispatch(stopPlaying())
        dispatch(startPlaying(seekTo))
    }
}

export const setFileData = (fileName: string, metadata: IAudioMetadata, fileData: Buffer): AppThunk => {
    return async (dispatch, getState) => {
        const wasPlaying = selectPlayingState(getState()) == 'playing'
        dispatch(stopPlaying())

        const playerSettings = selectPlayerSettings(getState())
        await writeFile(playerSettings.originalFile, fileData)
        const exec = promisify(_exec)
        await exec(`${playerSettings.ffmpeg} -i ${playerSettings.originalFile} -y -f s16le -acodec pcm_s16le ${playerSettings.playingFile}`)

        dispatch(setFileInfo({
            name: fileName,
            metadata: metadata,
            audio: null,
            speaker: null
        }))

        if (wasPlaying == true) dispatch(startPlaying())
    }
}

export const clearFileData = (): AppThunk => {
    return async (dispatch, getState) => {
        dispatch(stopPlaying())

        const playerSettings = selectPlayerSettings(getState())
        await writeFile(playerSettings.originalFile, '')
        await writeFile(playerSettings.playingFile, '')

        dispatch(setFileInfo(null))
    }
}