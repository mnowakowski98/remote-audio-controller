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

export type ConfigType = typeof defaultConfig

const slice = createSlice({
    name: 'config',
    initialState: defaultConfig,
    reducers: {
        setConfig: (state, action: PayloadAction<ConfigType>) => {
            state.audioPlayer = action.payload.audioPlayer
            state.httpServer = action.payload.httpServer
        }
    }
})

export const configReducer = slice.reducer
export const { setConfig } = slice.actions

export const getConfig = (state: RootState) => state.config

const configPath = (join(cwd(), './config.json'))
const writeDefaultConfigFile = (): AppThunk => {
    return async () => {
        await writeFile(configPath, JSON.stringify(defaultConfig, undefined, 4))
    }
}

let configHasLoaded = false

const loadConfigFile = (): AppThunk => {
    return async (dispatch) => {
        if (existsSync(configPath) == false) dispatch(writeDefaultConfigFile())
        const dataString = (await readFile(configPath)).toString()
        const data = JSON.parse(dataString) as ConfigType
        const workingCopy = structuredClone(defaultConfig)

        Object.assign(workingCopy.httpServer, data.httpServer)
        Object.assign(workingCopy.audioPlayer, data.audioPlayer)

        dispatch(setConfig(workingCopy))
        configHasLoaded = true
    }
}

export const watchConfig = (): AppThunk => {
    return async (dispatch) => {
        if (configHasLoaded == false) dispatch(loadConfigFile())
        const watcher = watch(configPath)
        for await (const _ of watcher)
            dispatch(loadConfigFile())
    }
}

export const writeCurrentConfigFile = (): AppThunk => {
    return async (_dispatch, getState) => {
        await writeFile(configPath, JSON.stringify(getConfig(getState())))
    }
}