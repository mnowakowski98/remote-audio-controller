import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk } from '../store'

import { existsSync } from 'node:fs'
import { readFile, watch, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'

const defaultConfig = Object.freeze({
    httpServer: {
        corsOrigin: undefined as string | undefined,
        port: 80,
    },
    filePlayer: {
        currentFilePath: ':tmp:',
        mpg123Path: undefined as string | undefined,
        mpg123Pipe: undefined as string | undefined
    },
    soundFiles: {
        soundFilesDirectory: './sounds'
    }
})

export type Config = typeof defaultConfig

const slice = createSlice({
    name: 'config',
    initialState: defaultConfig,
    reducers: {
        setConfig: (state, action: PayloadAction<Config>) => state = action.payload
    },
    selectors: {
        selectHttpConfig: (state) => state.httpServer,
        selectFilePlayerConfig: (state) => state.filePlayer,
        selectSoundFilesConfig: (state) => state.soundFiles,
        selectConfig: (state) => state
    }
})

export const configReducer = slice.reducer
const { setConfig } = slice.actions
export const {
    selectHttpConfig,
    selectFilePlayerConfig,
    selectSoundFilesConfig,
    selectConfig
} = slice.selectors

const configPath = (join(cwd(), './config.json'))
let configHasLoaded = false

export const loadConfigFile = (): AppThunk => {
    return async (dispatch) => {
        let data: Config
        if (existsSync(configPath) == true) {
            const dataString = (await readFile(configPath)).toString()
            data = JSON.parse(dataString)
        } else {
            await writeConfigFile(defaultConfig)
            data = defaultConfig
        }

        const workingCopy = structuredClone(defaultConfig)
        Object.assign(workingCopy.httpServer, data.httpServer)
        Object.assign(workingCopy.filePlayer, data.filePlayer)

        dispatch(setConfig(workingCopy))
        configHasLoaded = true
    }
}

export const writeConfigFile = async (config: Config) =>
    await writeFile(configPath, JSON.stringify(config, undefined, 4))