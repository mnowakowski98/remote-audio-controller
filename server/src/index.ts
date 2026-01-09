import { addRequestListener, addUpgradeListener, startServer as startHttpServer } from './servers/http'
import { connectionListener } from './servers/stateSync'

import { store } from './store'
import { loadConfigFile, selectFilePlayerConfig } from './slices/configSlice'
import { createApp } from './servers/express'
import { setPort } from './slices/httpSlice'
import { loadFiles } from './slices/soundFiles'

import { spawn as _spawn } from 'node:child_process'
import { join } from 'node:path'

import findExec from 'find-exec'
import { startMpg123 } from './slices/filePlayer'
import { tmpdir } from 'node:os'

const initFilePlayer = () => {
    const config = selectFilePlayerConfig(store.getState())
    const mpg123 = findExec(config.mpg123Path ?? 'mpg123')
    if (mpg123 == null) throw 'FATAL: mpg123 is not accessible'

    startMpg123(mpg123, config.mpg123Pipe ?? join(tmpdir(), 'remote-audio-player-mpg123pipe'))
}

const initSoundFiles = () => store.dispatch(loadFiles())

const startServer = () => {
    const state = store.getState()
    const app = createApp(store, {
        controlCallbacks: {
            reload: {
                all: start,
                http: startServer,
                filePlayer: initFilePlayer,
                soundFiles: initSoundFiles
            }
        }
    })

    store.dispatch(setPort(state.config.httpServer.port))
    startHttpServer(state.config.httpServer.port)
    addRequestListener(app)
    addUpgradeListener(connectionListener)
}

const start = async () => {
    await store.dispatch(loadConfigFile())
    startServer()
    initSoundFiles()
    initFilePlayer()
}
start()