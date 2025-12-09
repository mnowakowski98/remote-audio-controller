import { useContext } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'

import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'

import settingsContext from '../settingsContext'
import type AudioFileInfo from '../models/audioFileInfo'
import { soundFileInfoKey } from '../models/soundFile'
import useSyncedState from '../hooks/useSyncedState'

interface FilesTableProps {
    showDeleteButtons?: boolean,
    baseUrlOverride?: URL,
    selectedFileId?: string | null,
    onSelect?: (id: string) => void
}

export default function FilesTable(props: FilesTableProps) {
    const baseUrl = useContext(settingsContext).hostUrl

    const soundFiles = useQuery<AudioFileInfo[]>({
        queryKey: [soundFileInfoKey],
        queryFn: async () => (await fetch(props.baseUrlOverride ?? baseUrl)).json()
    })

    const removeFile = useMutation({
        mutationFn: async (id: string) => await fetch(new URL(`./${id}`, baseUrl), { method: 'Delete' }),
    })

    useSyncedState<AudioFileInfo[]>(soundFileInfoKey)

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
                        <td>{file.fileName}</td>
                        <td>{file.title}</td>
                        <td>{file.artist}</td>
                        <td>{file.duration?.toFixed(2)}</td>
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