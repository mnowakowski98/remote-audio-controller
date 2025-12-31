import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from '../store'

import { existsSync } from 'node:fs'
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { join, normalize } from 'node:path'

import { SoundFile, soundFileKey } from '../models/soundFiles'
import { selectSoundFilesConfig } from './configSlice'
import { IAudioMetadata, parseFile } from 'music-metadata'
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
        }
    }
})
export const soundFilesReducer = slice.reducer
const { setFilesDirectory, addFile, addFiles } = slice.actions

export const selectUIState = (state: RootState) => state.soundFiles.soundFiles

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

            return {
                id: randomUUID(),
                name: fileName,
                title: metadata.common.title ?? '(No title)',
                artist: metadata.common.artist ?? '(No artist)',
                album: metadata.common.album ?? '(No album)',
                durationMs: (metadata.format.duration ?? 0) * 1000
            }
        }))

        dispatch(addFiles(soundFiles.filter((file) => file != undefined)))
    }
}