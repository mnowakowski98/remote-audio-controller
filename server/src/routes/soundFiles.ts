import express from 'express'
import multer from 'multer'

import { parseBuffer, IAudioMetadata } from 'music-metadata'

import { getContext } from '../servers/express'
import { deleteSoundFile, selectFileById, selectFileByName, selectUIState, writeSoundFile } from '../slices/soundFiles'

const router = express.Router()
const upload = multer()

router.get('/', async (req, res) => {
    const store = getContext(req).store
    res.send(selectUIState(store.getState()))
})

router.post('/', upload.single('file'), async (req, res) => {
    const store = getContext(req).store

    if (req.file == null) {
        res.statusCode = 400
        res.send('file can not be null')
        return
    }

    const fileName = req.body['name']
    if(fileName == null) {
        res.status(400).send('name can not be null')
        return
    }

    if(selectFileByName(store.getState(), fileName)) {
        res.status(400).send('File name already exists')
        return
    }

    let metadata: IAudioMetadata | null = null;
    try { metadata = await parseBuffer(req.file.buffer) }
    catch {
        res.status(400).send('File must be an audio file')
        return
    }
    
    await store.dispatch(writeSoundFile(fileName, metadata, req.file.buffer))
    res.sendStatus(200)
})

router.delete('/:id', async (req, res) => {
    const id = req.params.id
    const store = getContext(req).store

    const file = selectFileById(store.getState(), id)
    if (file == undefined) {
        res.sendStatus(404)
        return
    }

    await store.dispatch(deleteSoundFile(id))
    res.sendStatus(200)
})

export default router