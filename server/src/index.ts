import { addRequestListener, addUpgradeListener, startServer as startHttpServer } from './servers/http'
import { connectionListener } from './servers/stateSync'

import { store } from './store'
import { watchConfig } from './slices/configSlice'
import { createApp } from './servers/express'

const startServer = () => {
    const state = store.getState()

    const app = createApp(store, {
        controlCallbacks: {
            reload: startServer
        }
    })

    startHttpServer(state.config.httpServer.port)
    addRequestListener(app)
    addUpgradeListener(connectionListener)
}

store.dispatch(watchConfig())
startServer()