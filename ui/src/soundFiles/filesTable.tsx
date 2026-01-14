import { useContext } from 'react'
import { useMutation } from '@tanstack/react-query'

import { soundFileKey, type SoundFile } from '../models/soundFiles'
import settingsContext from '../settingsContext'
import useSyncedState from '../hooks/useSyncedState'

import classes from './filesTable.module.scss'
import useProperty from '../hooks/useColor'

interface FilesTableProps {
    showDeleteButtons?: boolean,
    selectedFileId?: string | null,
    onSelect?: (id: string) => void
}

export default function FilesTable(props: FilesTableProps) {
    const baseUrl = useContext(settingsContext).hostUrl
    const primaryColor = useProperty('primary')

    const soundFiles = useSyncedState<SoundFile[]>(soundFileKey, { queryUrl: baseUrl })

    const removeFile = useMutation({
        mutationFn: async (id: string) => await fetch(new URL(`./${id}`, baseUrl), { method: 'Delete' }),
    })

    if (soundFiles.isLoading == true) return 'Loading'
    if (soundFiles.isError == true) return soundFiles.error.message

    return <div className={classes.filesTable}>
        {(soundFiles.data?.length ?? 0) > 0 && <table>
            <caption><h3>Available files</h3></caption>
            <thead>
                <tr>
                    <th>Filename</th>
                    <th>Title</th>
                    <th>Artist</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
                {soundFiles.data?.map((file) =>
                    <tr key={file.id}
                        onClick={() => {
                            if (props.onSelect != undefined) props.onSelect(file.id)
                        }}
                        style={{
                            backgroundColor: props.selectedFileId == file.id ? primaryColor.background : 'transparent',
                            color: props.selectedFileId == file.id ? primaryColor.text : 'black'
                        }}>
                        <td>{file.name}</td>
                        <td>{file.title}</td>
                        <td>{file.artist}</td>
                        <td>{(file.durationMs / 1000).toFixed(2)}</td>
                        {props.showDeleteButtons && <td>
                            <button
                                type='button'
                                onClick={() => removeFile.mutate(file.id)}
                            >X</button>
                        </td>}
                    </tr>
                )}
            </tbody>
        </table>}
        {soundFiles.data?.length == 0 && <div className={classes.noFiles}>No files</div>}
    </div>
}