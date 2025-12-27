import { addRequestListener, startServer } from './servers/http'
import { connectionListener } from './servers/stateSync'

import { store } from './store'
import { watchConfig } from './slices/configSlice'
import { createApp } from './servers/express'

store.subscribe(() => {
    const state = store.getState()

    const app = createApp(store, [(req, _res, next) => {
        const didUpgrade = connectionListener(req)
        if (didUpgrade == false) next()
    }])

    startServer(state.config.httpServer.port)
    addRequestListener(app)
})

store.dispatch(watchConfig())