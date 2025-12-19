import express from 'express'
import cors from 'cors'

import audioPlayer from './routes/audioplayer'
import soundFiles from './routes/soundFiles'
import stateSync from './servers/stateSync'

const port = 3000
const app = express()
app.use(cors({ origin: '*' }))

app.use('/audioplayer', audioPlayer)
app.use('/soundfiles', soundFiles)
app.use('/sync', stateSync)

app.get('/', (_req, res) => res.send('remote-audio-controller-server'))

app.listen(port, () => console.log(`Listening on ${port}`))