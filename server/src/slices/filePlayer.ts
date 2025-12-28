import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk } from '../store'

import { selectFilePlayerConfig } from './configSlice'

import { exec as _exec } from 'node:child_process'
import { accessSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, normalize } from 'node:path'
import { promisify } from 'node:util'

import findExec from 'find-exec'
import { IAudioMetadata } from 'music-metadata'

interface PlayingFile {
    name: string,
    metadata: IAudioMetadata,
    audio: ReadableStream | null
}

interface PlayerSettings {
    ffmpeg: string,
    originalFile: string,
    playingFile: string
}

interface FilePlayerState {
    audioPlaying: boolean,
    audioPaused: boolean,
    playerSettings: PlayerSettings,
    playingFile: PlayingFile | null
}

const slice = createSlice({
    name: 'filePlayer',
    initialState: {
        audioPlaying: false,
        audioPaused: false,
        playerSettings: {
            ffmpeg: '',
            originalFile: '',
            playingFile: '',
        },
        playingFile: null
    } as FilePlayerState,
    reducers: {
        start: (state) => {
            if (state.audioPlaying == true && state.audioPaused == false) return
            state.audioPlaying = true
            state.audioPaused = false

        },
        pause: (state) => {
            if (state.audioPlaying == false || state.audioPaused == true) return
            state.audioPaused = true
        },
        stop: (state) => {
            if (state.audioPlaying == false && state.audioPaused == false) return
            state.audioPlaying = false
            state.audioPaused = false
        },
        setPlayerSettings: (state, action: PayloadAction<PlayerSettings>) => {state.playerSettings = action.payload},
        setFileInfo: (state, action: PayloadAction<PlayingFile | null>) => {state.playingFile = action.payload},
    },
    selectors: {
        selectPlayingState: (state): 'playing' | 'paused' | 'stopped' => {
            if (state.audioPlaying == true && state.audioPaused == false) return 'playing'
            else if (state.audioPlaying == true && state.audioPaused == true) return 'paused'
            else if (state.audioPlaying == false && state.audioPaused == true) throw 'File player state corrupted'
            else return 'stopped'
        },
        selectPlayingFile: (state) => state.playingFile,
        selectPlayerSettings: (state) => state.playerSettings
    }
})

export const filePlayerReducer = slice.reducer
const { start, pause, stop, setPlayerSettings, setFileInfo } = slice.actions
const { selectPlayingFile, selectPlayingState, selectPlayerSettings } = slice.selectors

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

export const startPlaying = (): AppThunk => {
    return (dispatch, getState) => {
        if (selectPlayingState(getState()) == 'playing') return
        if (selectPlayingFile(getState()) == null) return

        dispatch(start())
    }
}

export const pausePlaying = (): AppThunk => {
    return (dispatch, getState) => {
        
    }
}

export const stopPlaying = (): AppThunk => {
    return (dispatch, getState) => {

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
            audio: null
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