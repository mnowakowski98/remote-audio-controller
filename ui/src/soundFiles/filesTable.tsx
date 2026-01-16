import { useContext } from 'react'
import { useMutation } from '@tanstack/react-query'

import { type SoundFile } from '../models/soundFiles'
import settingsContext from '../settingsContext'

import classes from './filesTable.module.scss'
import { getDurationString } from '../hooks/getDurationString'

interface FilesTableProps {
    state: SoundFile[],
    showDeleteButtons?: boolean,
    selectedFileId?: string | null,
    onSelect?: (id: string) => void
}

export default function FilesTable(props: FilesTableProps) {
    const baseUrl = useContext(settingsContext).hostUrl

    const removeFile = useMutation({
        mutationFn: async (id: string) => await fetch(new URL(`./${id}`, baseUrl), { method: 'Delete' }),
    })

    return <div className={classes.filesTable}>
        <div className={classes.filesTableBody}>
            {(props.state.length ?? 0) > 0 && <>
                <h3>Available files</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Filename</th>
                            <th>Title</th>
                            <th>Artist</th>
                            <th>Album</th>
                            <th>Length</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.state.map((file) =>
                            <tr key={file.id}
                                className={props.selectedFileId == file.id ? 'highlight' : undefined}
                                onClick={() => props.onSelect?.(file.id)}
                            >
                                <td>{file.name}</td>
                                <td>{file.title}</td>
                                <td>{file.artist}</td>
                                <td>{file.album}</td>
                                <td>{getDurationString(file.durationMs)}</td>
                                {props.showDeleteButtons && <td>
                                    <button
                                        className={`${classes.deleteButton} warning`}
                                        type='button'
                                        onClick={() => removeFile.mutate(file.id)}
                                    >X</button>
                                </td>}
                            </tr>
                        )}
                    </tbody>
                </table>
            </>}
            {props.state.length == 0 && <div className={classes.noFiles}>No files</div>}
        </div>
    </div>
}