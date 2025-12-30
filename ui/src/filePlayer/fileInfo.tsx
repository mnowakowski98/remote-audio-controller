import Table from 'react-bootstrap/Table'

import useFileInfo from './useFileInfo'

export default function FileInfo() {
    const fileInfo = useFileInfo()
    const playingFileMetadata = fileInfo.data?.playingFile?.metadata

    if (fileInfo.isLoading) return 'Loading'
    if (fileInfo.isError) return fileInfo.error.message

    return <Table className='text-start'>
        <thead className='fw-bold'>
            <tr>
                <td>Title</td>
                <td>Artist</td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{playingFileMetadata?.common.title ?? '(No title)'}</td>
                <td>{playingFileMetadata?.common.artist ?? '(No artist)'}</td>
            </tr>
        </tbody>
    </Table>
}