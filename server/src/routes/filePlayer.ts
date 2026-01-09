import express from 'express'
import multer from 'multer'

import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, normalize } from 'node:path'

import { IAudioMetadata, parseBuffer } from 'music-metadata'

import {
    selectPlayingState,
    selectUIState,
    setFileInfo,
    setLoop,
    start,
    stop,
    pause,
    selectPlayingFile
} from '../slices/filePlayer'
import { selectFileById, selectFileMetadata, selectFilePath } from '../slices/soundFiles'
import { selectFilePlayerConfig } from '../slices/configSlice'
import { getContext } from '../servers/express'

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
    const state = store.getState()
    const wasPlaying = selectPlayingState(state) == 'playing'
    const currentFilePath = selectFilePlayerConfig(state).currentFilePath

    const currentFile = normalize(currentFilePath == ':tmp:'
        ? join(tmpdir(), 'remote-audio-player-currentfile')
        : currentFilePath)
    await writeFile(currentFile, req.file.buffer)
    store.dispatch(setFileInfo({ path: currentFile, playingFile: { name: fileName, metadata }}))
    if (wasPlaying) store.dispatch(start())

    res.sendStatus(200)
})

router.post('/:id', async (req, res) => {
    const store = getContext(req).store
    const state = store.getState()
    const file = selectFileById(state, req.params.id)
    if (file == undefined) {
        res.sendStatus(404)
        return
    }

    const wasPlaying = selectPlayingState(state) == 'playing'
    const metadata = await selectFileMetadata(state, file)
    const path = selectFilePath(state, file)
    store.dispatch(setFileInfo({ path, playingFile: { name: file.name, metadata }}))
    if (wasPlaying) store.dispatch(start())

    res.sendStatus(200)
})

router.delete('/', async (req, res) => {
    const store = getContext(req).store
    store.dispatch(setFileInfo(null))
    res.sendStatus(200)
})
//#endregion

//#region Audio status
router.put('/status/playing', express.text(), (req, res) => {
    const store = getContext(req).store
    const state = store.getState()
    if (selectPlayingFile(state) == null) {
        res.status(400).send(`Can't set playing state when file is not loaded`)
        return
    }

    const playingState = selectPlayingState(state)
    switch(req.body) {
        case 'start':
            store.dispatch(start())
            break
        case 'pause':
            store.dispatch(pause())
            break
        case 'stop':
            store.dispatch(stop())
            break
        default:
            res.status(400).send('Value must be "start" "stop" or "pause"')
            return
    }

    res.sendStatus(200)
})

router.put('/status/loop', express.text(), (req, res) => {
    const store = getContext(req).store
    let loop: boolean | null = null
    if (req.body == 'true') loop = true
    if (req.body == 'false') loop = false
    store.dispatch(setLoop(loop))
    res.sendStatus(200)
})


router.put('/status/seek', express.text(), (req, res) => {
    let seekTo: number
    try { seekTo = parseInt(req.body) }
    catch {
        res.status(400).send('Body must be a number')
        return
    }

    // const store = getContext(req).store
    // store.dispatch(seek(seekTo))
    res.sendStatus(500)
})
//#endregion

export default router