import express from 'express'
import cors from 'cors'

import audioPlayer from './routes/audioplayer'
import soundFiles from './routes/soundFiles'
import config from './routes/config'

import { addRequestListener, isRunning, startServer } from './servers/http'
import { connectionListener } from './servers/stateSync'

import { store } from './store'
import { loadConfigFile, watchConfig } from './slices/configSlice'
import LocalContext from './_models/localContex'

const app = express()
app.use(cors({ origin: '*' }))

const context: LocalContext = {
    store
}
app.locals.context = context

let latestState = store.getState()
store.subscribe(() => {
    const state = store.getState()

    const port = state.httpServerConfig.port
    if (port != latestState.httpServerConfig.port || isRunning() == false)
        startServer(port)

    latestState = state
})

store.dispatch(loadConfigFile())
store.dispatch(watchConfig())

app.use((req, _res, next) => {
    const didUpgrade = connectionListener(req)
    if (didUpgrade == false) next()
})

app.use('/audioplayer', audioPlayer)
app.use('/soundfiles', soundFiles)
app.use('/config', config)

app.get('/', (_req, res) => res.send('remote-audio-controller-server'))

addRequestListener(app)