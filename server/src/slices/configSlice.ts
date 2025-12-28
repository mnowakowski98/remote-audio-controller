import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from '../store'

import { existsSync } from 'node:fs'
import { readFile, watch, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'

const defaultConfig = Object.freeze({
    httpServer: {
        corsOrigin: undefined as string | undefined,
        port: 80,
    },
    audioPlayer: {
        tempFileDirectory: ':tmp:',
        soundsDirectory: './sounds'
    },
})

export type ConfigType = typeof defaultConfig

const slice = createSlice({
    name: 'config',
    initialState: defaultConfig,
    reducers: {
        setConfig: (state, action: PayloadAction<ConfigType>) => state = action.payload
    },
    selectors: {
        selectHttpConfig: (state) => state.httpServer,
        selectFilePlayerConfig: (state) => state.audioPlayer,
        selectConfig: (state) => state
    }
})

export const configReducer = slice.reducer
const { setConfig } = slice.actions
export const { selectHttpConfig, selectFilePlayerConfig, selectConfig } = slice.selectors

const configPath = (join(cwd(), './config.json'))
let configHasLoaded = false

const loadConfigFile = (): AppThunk => {
    return async (dispatch) => {
        let data: ConfigType
        if (existsSync(configPath) == true) {
            const dataString = (await readFile(configPath)).toString()
            data = JSON.parse(dataString)
        } else data = defaultConfig

        const workingCopy = structuredClone(defaultConfig)
        Object.assign(workingCopy.httpServer, data.httpServer)
        Object.assign(workingCopy.audioPlayer, data.audioPlayer)

        dispatch(setConfig(workingCopy))
        configHasLoaded = true
    }
}

export const writeConfigFile = async (config: ConfigType) =>
    await writeFile(configPath, JSON.stringify(config, undefined, 4))

export const watchConfig = (): AppThunk => {
    return async (dispatch) => {
        if (existsSync(configPath) == false) await writeConfigFile(defaultConfig)
        if (configHasLoaded == false) dispatch(loadConfigFile())
        
        const watcher = watch(configPath)
        for await (const event of watcher)
            dispatch(loadConfigFile())
    }
}