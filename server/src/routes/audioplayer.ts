import express from 'express'
import multer from 'multer'

import { IAudioMetadata, parseBuffer } from 'music-metadata'

import {
    getAudioInfo,
    getAudioStatus,
    getSeekTime,
    hasAudioFile,
    pauseAudio,
    seek,
    setFile,
    setLoop,
    startAudio,
    stopAudio,
    unsetFile
} from '../repositories/audioPlayer'
import { getFile, getFileBuffer } from '../repositories/soundFiles'
import { sendSyncData } from '../servers/stateSync'
import { audioFileInfoKey } from '../models/audioFileInfo'
import { audioStatusKey } from '../models/audioStatus'

const router = express.Router()
const upload = multer()

const syncRouteStatus = () => {
    sendSyncData(audioFileInfoKey, getAudioInfo())
    sendSyncData(audioStatusKey, getAudioStatus())
}

//#region File info
router.get('/', (_req, res) => res.send(getAudioInfo()))

router.post('/', upload.single('file'), async (req, res) => {
    stopAudio()

    let metadata: IAudioMetadata | null = null
    if (req.file == null) {
        res.status(400).send('Missing file')
        return
    }

    const fileName = req.body['name']
    if(fileName == null) {
        res.status(400).send('Missing file name')
        return
    }

    try { metadata = await parseBuffer(req.file.buffer) }
    catch {
        res.status(400).send('Must be a media file')
        return
    }

    await setFile(fileName, metadata, req.file.buffer)
    res.sendStatus(200)
    syncRouteStatus()
})

router.post('/:id', async (req, res) => {
    const file = getFile(req.params.id)
    if (file == undefined) {
        res.sendStatus(404)
        return
    }

    await setFile(file.fileInfo.fileName, file.metadata, await getFileBuffer(file))
    res.sendStatus(200)
    syncRouteStatus()
})

router.delete('/', async (_req, res) => {
    await unsetFile()
    res.sendStatus(200)
    syncRouteStatus()
})
//#endregion

//#region Audio status
router.get('/status', (_req, res) => res.send(getAudioStatus()))

router.put('/status/playing', express.text(), (req, res) => {
    if(hasAudioFile() == false) {
        res.status(400).send('No file selected')
        return
    }

    switch(req.body) {
        case 'start':
            startAudio()
            break
        case 'stop':
            stopAudio()
            break
        case 'pause':
            pauseAudio()
            break
        default:
            res.status(400).send('Value must be "start" "stop" or "pause"')
            return
    }

    res.sendStatus(200)
    syncRouteStatus()
})

router.put('/status/loop', express.text(), (req, res) => {
    if (req.body === undefined) setLoop()
    else setLoop(req.body == 'true' ? true : false)
    res.sendStatus(200)
    syncRouteStatus()
})

router.put('/status/seek', express.text(), (req, res) => {
    let seekTo: number
    try { seekTo = parseInt(req.body) }
    catch {
        res.status(400).send('Body must be a number')
        return
    }

    seek(seekTo)
    res.sendStatus(200)
    syncRouteStatus()
})
//#endregion

export default router