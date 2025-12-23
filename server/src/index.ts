import express from 'express'
import cors from 'cors'

import audioPlayer from './routes/audioplayer'
import soundFiles from './routes/soundFiles'

import { addRequestListener, startServer } from './servers/http'
import { connectionListener } from './servers/stateSync'

import { store } from './store'
import { loadConfigFile, watchConfig } from './slices/configSlice'

const app = express()
app.use(cors({ origin: '*' }))

app.locals['reduxStore'] = store

let latestState = store.getState()
store.subscribe(() => {
    const state = store.getState()
    const port = state.httpServer.port
    if (port == latestState.httpServer.port) return
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

app.get('/', (_req, res) => res.send('remote-audio-controller-server'))

addRequestListener(app)