import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from '../store'

import { filePlayerKey, FilePlayerState as FilePlayerUIState, PlayingState } from '../models/filePlayer'
import { IAudioMetadata } from 'music-metadata'

//#region State Types
interface PlayingFile {
    name: string,
    metadata: IAudioMetadata,
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
        setFileInfo: (state, action: PayloadAction<PlayingFile | null>) => {
            state.playingFile = action.payload
            state.audioPaused = false
            if (action.payload == null) state.audioPlaying = false
        },
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
        selectSeekTime: (state) =>
            state.seekTimings.audioStart != null ? (performance.now() - state.seekTimings.audioStart) - state.seekTimings.timePaused : 0
    }
})
export const filePlayerReducer = slice.reducer

export const {
    start,
    pause,
    stop,
    setFileInfo
} = slice.actions
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