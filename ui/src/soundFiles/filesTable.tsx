import { useContext } from 'react'
import { useMutation } from '@tanstack/react-query'

import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'

import { soundFileKey, type SoundFile } from '../models/soundFiles'
import settingsContext from '../settingsContext'
import useSyncedState from '../hooks/useSyncedState'

interface FilesTableProps {
    showDeleteButtons?: boolean,
    baseUrlOverride?: URL,
    selectedFileId?: string | null,
    onSelect?: (id: string) => void
}

export default function FilesTable(props: FilesTableProps) {
    const baseUrl = useContext(settingsContext).hostUrl

    const soundFiles = useSyncedState<SoundFile[]>(soundFileKey, { queryUrl: props.baseUrlOverride ?? baseUrl })

    const removeFile = useMutation({
        mutationFn: async (id: string) => await fetch(new URL(`./${id}`, baseUrl), { method: 'Delete' }),
    })

    if (soundFiles.isLoading == true) return 'Loading'
    if (soundFiles.isError == true) return 'Goofed'

    return <>
        {(soundFiles.data?.length ?? 0) > 0 && <Table>
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
                        className={props.selectedFileId == file.id ? 'table-primary' : undefined}>
                        <td>{file.name}</td>
                        <td>{file.title}</td>
                        <td>{file.artist}</td>
                        <td>{(file.durationMs / 1000).toFixed(2)}</td>
                        {props.showDeleteButtons && <td>
                            <Button
                                type='button'
                                onClick={() => removeFile.mutate(file.id)}
                            >X</Button>
                        </td>}
                    </tr>
                )}
            </tbody>
        </Table>}
        {soundFiles.data?.length == 0 && <div className='text-center mb-3'>No files</div>}
    </>
}