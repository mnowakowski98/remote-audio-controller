import express from 'express'
import multer from 'multer'

import { IAudioMetadata, parseBuffer } from 'music-metadata'

import { getContext } from '../servers/express'
import { sendSyncData } from '../servers/stateSync'
import { AppStore } from '../store'

import AudioStatus, { audioStatusKey } from '../models/audioStatus'
import AudioFileInfo, { audioFileInfoKey } from '../models/audioFileInfo'
import { getFile, getFileBuffer } from '../repositories/soundFiles'

import {
    clearFileData,
    pausePlaying,
    selectPlayingFile,
    selectPlayingState,
    selectSeekTime,
    setFileData,
    startPlaying,
    stopPlaying
} from '../slices/filePlayer'

const router = express.Router()
const upload = multer()

const getAudioInfo = (store: AppStore) => {
    const playingFile = selectPlayingFile(store.getState())
    if (playingFile == null) {
        return {
            id: 'none',
            fileName: 'No file',
            title: 'No file',
            artist: 'No file',
            duration: 0
        }
    }

    return {
        id: 'playing',
        fileName: playingFile.name,
        title: playingFile.metadata.common.title ?? 'No title',
        artist: playingFile.metadata.common.artist ?? 'No artist',
        duration: (playingFile.metadata.format.duration ?? 0) * 1000
    }
}

const getAudioStatus = (store: AppStore) => {
    const playingStatus = selectPlayingState(store.getState())

    return {
        playing: playingStatus == 'playing' || playingStatus == 'paused',
        paused: playingStatus == 'paused',
        seek: selectSeekTime(store.getState()),
        loop: false,
        volume: 0
    }
}

//#region File info
router.get('/', (req, res) => {
    const store = getContext(req).store
    const audioFileInfo = getAudioInfo(store)
    res.send(audioFileInfo)
})

router.post('/', upload.single('file'), async (req, res) => {
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

    const store = getContext(req).store
    store.dispatch(await setFileData(fileName, metadata, req.file.buffer))
    res.sendStatus(200)
})

router.post('/:id', async (req, res) => {
    const file = getFile(req.params.id)
    if (file == undefined) {
        res.sendStatus(404)
        return
    }

    const store = getContext(req).store
    store.dispatch(await setFileData(file.fileInfo.fileName, file.metadata, await getFileBuffer(file)))

    res.sendStatus(200)
})

router.delete('/', async (req, res) => {
    const store = getContext(req).store
    store.dispatch(clearFileData())
    res.sendStatus(200)
})
//#endregion

//#region Audio status
router.get('/status', (req, res) => {
    const store = getContext(req).store
    const audioStatus = getAudioStatus(store)
    res.send(audioStatus)
})

router.put('/status/playing', express.text(), (req, res) => {
    const store = getContext(req).store
    if(selectPlayingFile(store.getState()) == null) {
        res.status(400).send('No file selected')
        return
    }

    switch(req.body) {
        case 'start':
            store.dispatch(startPlaying())
            break
        case 'stop':
            store.dispatch(stopPlaying())
            break
        case 'pause':
            store.dispatch(pausePlaying())
            break
        default:
            res.status(400).send('Value must be "start" "stop" or "pause"')
            return
    }

    res.sendStatus(200)
})

// router.put('/status/loop', express.text(), (req, res) => {
//     if (req.body === undefined) setLoop()
//     else setLoop(req.body == 'true' ? true : false)
//     res.sendStatus(200)
// })

// router.put('/status/seek', express.text(), (req, res) => {
//     let seekTo: number
//     try { seekTo = parseInt(req.body) }
//     catch {
//         res.status(400).send('Body must be a number')
//         return
//     }

//     seek(seekTo)
//     res.sendStatus(200)
// })
//#endregion

export default router