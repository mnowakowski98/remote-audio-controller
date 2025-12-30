import express from 'express'
import multer from 'multer'

import { IAudioMetadata, parseBuffer } from 'music-metadata'

import { getContext } from '../servers/express'
import { getFile, getFileBuffer } from '../repositories/soundFiles'

import {
    clearFileData,
    pausePlaying,
    selectPlayingFile,
    selectPlayingState,
    selectSeekTime,
    selectUIState,
    setFileData,
    startPlaying,
    stopPlaying
} from '../slices/filePlayer'

const router = express.Router()
const upload = multer()

//#region File info
router.get('/', (req, res) => {
    const store = getContext(req).store
    const audioFileInfo = selectUIState(store.getState())
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