import express from 'express'
import multer from 'multer'

import { parseBuffer, IAudioMetadata } from 'music-metadata'

// import { addSoundFile, fileNameExists, getAudioInfos, getFile, makeSoundFile, removeSoundFile } from '../repositories/soundFiles'
// import { sendSyncData } from '../servers/stateSync'
// import { soundFileInfoKey } from '../models/soundFiles'

const router = express.Router()
const upload = multer()

// router.get('/', async (_req, res) => res.send(getAudioInfos()))

// router.get('/:id', (req, res) => {
//     const id = req.params.id
//     const file = getAudioInfos().find(file => file.id == id)
//     if (file == undefined) {
//         res.sendStatus(400)
//         return
//     }

//     res.send(file)
// })

// router.post('/', upload.single('file'), async (req, res) => {
//     if (req.file == null) {
//         res.statusCode = 400
//         res.send('file can not be null')
//         return
//     }

//     const fileName = req.body['name']
//     if(fileName == null) {
//         res.status(400).send('name can not be null')
//         return
//     }

//     if(fileNameExists(fileName)) {
//         res.status(400).send('File name already exists')
//         return
//     }

//     let metadata: IAudioMetadata | null = null;
//     try { metadata = await parseBuffer(req.file.buffer) }
//     catch {
//         res.status(400).send('File must be an audio file')
//         return
//     }
    
//     await addSoundFile(makeSoundFile(fileName, metadata), req.file.buffer)
//     res.sendStatus(200)
//     sendSyncData(soundFileInfoKey, getAudioInfos())
// })

// router.delete('/:id', async (req, res) => {
//     const id = req.params.id
//     const file = getFile(id)
//     if (file == undefined) {
//         res.sendStatus(400)
//         return
//     }

//     await removeSoundFile(file)
//     res.sendStatus(200)
//     sendSyncData(soundFileInfoKey, getAudioInfos())
// })

export default router