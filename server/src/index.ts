import { addRequestListener, addUpgradeListener, startServer as startHttpServer } from './servers/http'
import { connectionListener } from './servers/stateSync'

import { store } from './store'
import { watchConfig } from './slices/configSlice'
import { createApp } from './servers/express'
import { setPort } from './slices/httpSlice'
import { setInitialState } from './slices/filePlayer'
import { loadFiles } from './slices/soundFiles'

const initFilePlayer = () => store.dispatch(setInitialState())
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

const start = () => {
    startServer()
    initFilePlayer()
    initSoundFiles()
}

store.dispatch(watchConfig())
start()