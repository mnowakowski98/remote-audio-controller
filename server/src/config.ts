import { existsSync, readFileSync, writeFileSync } from 'node:fs'
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

const configPath = join(cwd(), './config.json')
const fileExists = existsSync(configPath)
if (fileExists == false) writeFileSync(configPath, JSON.stringify(defaultConfig, undefined, 4))

let currentConfig: typeof defaultConfig = JSON.parse(readFileSync(configPath).toString())

const validateConfig = () => {
    // TODO: Validate config and set defaults where invalid
}
validateConfig()

export const reloadConfig = () => {
    currentConfig = JSON.parse(readFileSync(configPath).toString())
    validateConfig()
}

export const getConfig = () => structuredClone(currentConfig)
