import express from 'express'
import cors from 'cors'

import { getConfig } from './config'

import audioPlayer from './routes/audioplayer'
import soundFiles from './routes/soundFiles'
import stateSync from './servers/stateSync'

const { httpServer } = getConfig()
const app = express()

if (httpServer.corsOrigin != undefined)
    app.use(cors({ origin: httpServer.corsOrigin }))

app.use('/audioplayer', audioPlayer)
app.use('/soundfiles', soundFiles)
app.use('/sync', stateSync)

app.get('/', (_req, res) => res.send('remote-audio-controller-server'))

app.listen(httpServer.port, () => console.log(`Listening on ${httpServer.port}`))