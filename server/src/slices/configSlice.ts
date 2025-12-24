import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from '../store'

import { existsSync } from 'node:fs'
import { readFile, watch, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'

const defaultConfig = {
    httpServer: {
        corsOrigin: undefined as string | undefined,
        port: 80,
    },
    audioPlayer: {
        tempFileDirectory: ':tmp:',
        soundsDirectory: './sounds'
    },
}

type configType = typeof defaultConfig

const httpSlice = createSlice({
    name: 'httpServerConfig',
    initialState: defaultConfig.httpServer,
    reducers: {
        setPort: (state, action: PayloadAction<number>) => {
            state.port = action.payload
        },
        setCors: (state, action: PayloadAction<string | undefined>) => {
            state.corsOrigin = action.payload
        }
    }
})

export const httpReducer = httpSlice.reducer
export const { setPort, setCors } = httpSlice.actions

export const setHttpConfig = (config: typeof defaultConfig.httpServer): AppThunk => {
    return (dispatch) => {
        dispatch(setPort(config.port))
        dispatch(setCors(config.corsOrigin))
    }
}

const audioPlayerSlice = createSlice({
    name: 'audioPlayerConfig',
    initialState: defaultConfig.audioPlayer,
    reducers: {
        setTempPath: (state, action: PayloadAction<string>) => {
            state.tempFileDirectory = action.payload
        },
        setSoundsPath: (state, action: PayloadAction<string>) => {
            state.soundsDirectory = action.payload
        }
    }
})

export const audioPlayerReducer = audioPlayerSlice.reducer
export const { setTempPath, setSoundsPath } = audioPlayerSlice.actions

export const setAudioPlayerConfig = (config: typeof defaultConfig.audioPlayer): AppThunk => {
    return (dispatch) => {
        dispatch(setTempPath(config.tempFileDirectory))
        dispatch(setSoundsPath(config.soundsDirectory))
    }
}

export const setConfig = (config: configType): AppThunk => {
    return (dispatch) => {
        dispatch(setHttpConfig(config.httpServer))
        dispatch(setAudioPlayerConfig(config.audioPlayer))
    }
}

export const getConfig = (state: RootState) => {
    const { httpServerConfig, audioPlayerConfig } = state
    return {
        httpServer: httpServerConfig,
        audioPlayer: audioPlayerConfig
    }
}

const configPath = (join(cwd(), './config.json'))
export const writeDefaultConfigFile = (): AppThunk => {
    return async () => {
        await writeFile(configPath, JSON.stringify(defaultConfig, undefined, 4))
    }
}

export const loadConfigFile = (): AppThunk => {
    return async (dispatch) => {
        if (existsSync(configPath) == false) dispatch(writeDefaultConfigFile())
        const dataString = (await readFile(configPath)).toString()
        const data = JSON.parse(dataString) as configType
        const workingCopy = structuredClone(defaultConfig)

        Object.assign(workingCopy.httpServer, data.httpServer)
        Object.assign(workingCopy.audioPlayer, data.audioPlayer)

        dispatch(setHttpConfig(workingCopy.httpServer))
        dispatch(setAudioPlayerConfig(workingCopy.audioPlayer))
    }
}

export const watchConfig = (): AppThunk => {
    return async (dispatch) => {
        const watcher = watch(configPath)
        for await (const _event of watcher) {
            dispatch(loadConfigFile())
        }
    }
}

export const writeCurrentConfigFile = (): AppThunk => {
    return async (_dispatch, getState) => {
        await writeFile(configPath, JSON.stringify(getConfig(getState())))
    }
}