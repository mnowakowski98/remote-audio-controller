import express from 'express'
import cors from 'cors'

import audioPlayer from './routes/audioplayer'
import soundFiles from './routes/soundFiles'

import { addRequestListener, startServer } from './servers/http'
import { connectionListener } from './servers/stateSync'

const app = express()
app.use(cors({ origin: '*' }))

app.use((req, _res, next) => {
    const didUpgrade = connectionListener(req)
    if (didUpgrade == false) next()
})

app.use('/audioplayer', audioPlayer)
app.use('/soundfiles', soundFiles)

app.get('/', (_req, res) => res.send('remote-audio-controller-server'))

addRequestListener(app)
startServer(80)