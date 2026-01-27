import { useContext, useState } from 'react'

import SettingsContext from '../settingsContext'
import settingsContext from '../settingsContext'

import FileInfo from './fileInfo'
import PlayerControls from './playerControls'
import SeekBar from './seekBar'
import FilesTable from '../soundFiles/filesTable'

import type { FilePlayerState } from '../models/filePlayer'

import classes from './filePlayer.module.scss'
import FileUploader from '../soundFiles/fileUploader'
import { useMutation } from '@tanstack/react-query'
import useSyncedState from '../hooks/useSyncedState'
import { soundFileKey, type SoundFile } from '../models/soundFiles'

export default function FilePlayer(props: { state: FilePlayerState }) {
    const settings = useContext(settingsContext)

    const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

    const setFile = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(new URL(`./${id}`, settings.hostUrl), { method: 'POST' })
            if (response.status == 404) throw await response.text()
        },
        onSuccess: () => setSelectedFileId(null),
    })

    const clearFile = useMutation({
        mutationFn: async () => await fetch(settings.hostUrl, { method: 'DELETE' }),
    })

    const queryUrl = new URL('../soundfiles/', settings.hostUrl)
    const soundFiles = useSyncedState<SoundFile[]>(soundFileKey, { queryUrl })

    if (soundFiles.isLoading == true) return 'Loading'
    if (soundFiles.data == undefined || soundFiles.error != null) return soundFiles.error?.message

    return <div className={classes.filePlayer}>
        <div className={classes.uploader}>
            <FileUploader />
            <hr />
        </div>

        <div className={classes.fileSelection}>
            <SettingsContext value={{ hostUrl: queryUrl }}>
                <FilesTable
                    state={soundFiles.data}
                    selectedFileId={selectedFileId}
                    onSelect={(id: string) => {
                        if (selectedFileId == id) setSelectedFileId(null)
                        else setSelectedFileId(id)
                    }}
                />
            </SettingsContext>
        </div>

        <button className={`${classes.setButton} primary`}
            type='button'
            onClick={() => {
                if (selectedFileId == null) return
                setFile.mutate(selectedFileId)
            }}
            disabled={selectedFileId == null}
        >Load file</button>

        <div className={classes.playingInfo}>
            <FileInfo state={props.state} />
        </div>

        <button className={`${classes.clearButton} primary`}
            type='button'
            disabled={clearFile.isPending == true || props.state.playingFile == null}
            onClick={() => clearFile.mutate()}>
            Clear file
        </button>
        <div className={`${classes.controls} primary`}>
            <SeekBar />
            <PlayerControls state={props.state} />
        </div>
    </div>
}