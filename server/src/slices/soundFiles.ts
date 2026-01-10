import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from '../store'

import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, normalize } from 'node:path'

import { SoundFile, soundFileKey } from '../models/soundFiles'
import { selectSoundFilesConfig } from './configSlice'
import { IAudioMetadata, parseBuffer, parseFile } from 'music-metadata'
import { randomUUID } from 'node:crypto'

const slice = createSlice({
    name: soundFileKey,
    initialState: {
        soundFilesDirectory: '',
        soundFiles: [] as SoundFile[]
    },
    reducers: {
        setFilesDirectory: (state, action: PayloadAction<string>) => { state.soundFilesDirectory = action.payload },
        addFile: (state, action: PayloadAction<SoundFile>) => {
            const existingIndex = state.soundFiles.findIndex(file => file.id == action.payload.id)
            if (existingIndex == -1) state.soundFiles.push(action.payload)
            else state.soundFiles[existingIndex] = action.payload
        },
        addFiles: (state, action: PayloadAction<SoundFile[]>) => {
            const fileMap = action.payload.map(file => ({
                file,
                existingIndex: state.soundFiles.findIndex(_file => _file.id == file.id)
            }))

            fileMap.forEach(file => {
                if (file.existingIndex != -1) state.soundFiles[file.existingIndex] = file.file
                else state.soundFiles.push(file.file)
            })
        },
        removeFile: (state, action: PayloadAction<SoundFile>) => {
            const fileIndex = state.soundFiles.findIndex(file => action.payload.id == file.id)
            state.soundFiles.splice(fileIndex, 1)
        }
    },
    selectors: {
        selectFileById: (state, id: string) => state.soundFiles.find(file => file.id == id),
        selectFileByName: (state, name: string) => state.soundFiles.find(file => file.name == name),
        selectFileMetadata: async (state, file: SoundFile) => {
            const filePath = join(state.soundFilesDirectory, file.name)
            let metadata: IAudioMetadata | null = null
            try { metadata = await parseFile(filePath) }
            catch { throw `Failed to parse selected metadata for file: ${file.id}: ${file.name}` }
            return metadata
        },
        selectFileBuffer: async (state, file: SoundFile) => {
            const filePath = join(state.soundFilesDirectory, file.name)
            return readFile(filePath)
        },
        selectFilePath: (state, file: SoundFile) => join(state.soundFilesDirectory, file.name)
    }
})
export const soundFilesReducer = slice.reducer
const { setFilesDirectory, addFile, addFiles, removeFile } = slice.actions
export const {
    selectFileById,
    selectFileByName,
    selectFileMetadata,
    selectFileBuffer,
    selectFilePath
} = slice.selectors

export const selectUIState = (state: RootState) => state.soundFiles.soundFiles

export const getSoundFile = (name: string, metadata: IAudioMetadata) => ({
    id: randomUUID(),
    name,
    title: metadata.common.title ?? '(No title)',
    artist: metadata.common.artist ?? '(No artist)',
    album: metadata.common.album ?? '(No album)',
    durationMs: (metadata.format.duration ?? 0) * 1000
})

export const loadFiles = (): AppThunk => {
    return async (dispatch, getState) => {
        const config = selectSoundFilesConfig(getState())
        const directory = normalize(config.soundFilesDirectory)
        if (existsSync(directory) == false)
            await mkdir(directory)

        dispatch(setFilesDirectory(config.soundFilesDirectory))

        const files = await readdir(directory)
        const soundFiles = await Promise.all(files.map<Promise<SoundFile | undefined>>(async (fileName) => {
            const fullPath = join(directory, fileName)
            let metadata: IAudioMetadata | null = null
            try { metadata = await parseFile(fullPath) }
            catch { console.error(`Found invalid file: ${fileName}`) }
            if (metadata == null) return
            return getSoundFile(fileName, metadata)
        }))

        dispatch(addFiles(soundFiles.filter((file) => file != undefined)))
    }
}

export const writeSoundFile = (name: string, metadata: IAudioMetadata, data: Buffer): AppThunk => {
    return async (dispatch, getState) => {
        const file = getSoundFile(name, metadata)
        await writeFile(join(getState().soundFiles.soundFilesDirectory, name), data)
        dispatch(addFile(file))
    }
}

export const deleteSoundFile = (id: string): AppThunk => {
    return async (dispatch, getState) => {
        const state = getState()
        const file = selectFileById(state, id)
        if (file == undefined) return

        const filePath = join(state.soundFiles.soundFilesDirectory, file.name)
        await rm(filePath)
        dispatch(removeFile(file))
    }
}