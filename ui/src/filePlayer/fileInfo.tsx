import Table from 'react-bootstrap/Table'

import useFileInfo from './useFileInfo'

export default function AudioInfo() {
    const fileInfo = useFileInfo()

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
                <td>{fileInfo.data?.title ?? '(No title)'}</td>
                <td>{fileInfo.data?.artist ?? '(No artist)'}</td>
            </tr>
        </tbody>
    </Table>
}