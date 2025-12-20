import { randomUUID } from 'node:crypto'
import { accessSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { join, normalize } from 'node:path'

import { IAudioMetadata, parseFile } from 'music-metadata'

import SoundFile from '../models/soundFile'
import { getConfig } from '../config'

const { audioPlayer } = getConfig()

const soundsFolder = normalize(audioPlayer.soundsDirectory)
if(existsSync(soundsFolder) == false) mkdirSync(soundsFolder)
try { accessSync(soundsFolder) }
catch { throw `Fatal: Can't access sound folder: ${soundsFolder}` }

const soundFiles: SoundFile[] = []

readdirSync(soundsFolder).forEach(async (fileName, id) => {
    const fullPath = join(soundsFolder, fileName)
    let metadata: IAudioMetadata | null = null
    try { metadata = await parseFile(fullPath) }
    catch { console.error(`Found invalid file: ${fileName}`) }
    if (metadata == null) return
    addSoundFile(makeSoundFile(fileName, metadata))
})

export const getFile = (id: string) => soundFiles.find(file => file.fileInfo.id == id)
export const getFileBuffer = async (file: SoundFile) => await readFile(join(soundsFolder,file.fileInfo.fileName))

export const getAudioInfos = () => soundFiles.map(file => file.fileInfo)
export const fileNameExists = (fileName: string) => soundFiles.find(file => file.fileInfo.fileName == fileName) != undefined

export const makeSoundFile = (fileName: string, metadata: IAudioMetadata) => ({
    fileInfo: {
        id: randomUUID(),
        fileName,
        title: metadata.common.title ?? 'No title',
        artist: metadata.common.artist ?? 'No artist',
        duration: (metadata.format.duration ?? 0) * 1000
    },
    metadata
})

export const addSoundFile = async (file: SoundFile, buffer?: Buffer) => {
    soundFiles.push(file)
    if(buffer != undefined)
        await writeFile(join(soundsFolder, file.fileInfo.fileName), buffer)
}

export const removeSoundFile = async (file: SoundFile) => {
    const index = soundFiles.indexOf(file)
    await rm(join(soundsFolder, file.fileInfo.fileName))
    soundFiles.splice(index, 1)
}