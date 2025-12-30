import { useContext, useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Button from 'react-bootstrap/Button'

import FileInfo from './fileInfo'
import PlayerControls from './playerControls'
import FileUploader from '../soundFiles/fileUploader'
import FilesTable from '../soundFiles/filesTable'
import ClearButton from './clearButton'

import useFileInfo from './useFileInfo'
import settingsContext from '../settingsContext'
import SeekBar from './seekBar'

export default function FilePlayer() {
    const baseUrl = useContext(settingsContext).hostUrl

    const audioInfo = useFileInfo()
    const hasFile = () => audioInfo.isSuccess == true && audioInfo.data?.playingFile != null

    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const setFile = useMutation({
        mutationFn: async () => await fetch(new URL(`./${selectedFile}`, baseUrl), { method: 'POST' }),
        onSuccess: () => setSelectedFile(null)
    })

    return <Container fluid>
        <Row className='mb-2'>
            <Col xs={9}>
                <FileUploader
                    children={<ClearButton hasFile={hasFile()} />}
                />
            </Col>
            <Col className='d-flex align-items-end'>
                <PlayerControls hasFile={hasFile()} />
            </Col>
        </Row>

        <Row className='border py-3'>
            <Col className='text-center'>
                <header className='text-start fw-bolder'>Playing now</header>
                {hasFile() ? <FileInfo /> : 'No audio'}
            </Col>
        </Row>

        <Row className='border py-3'>
            <Col className='text-end'>
                <SeekBar maxDuration={audioInfo.data?.playingFile?.durationMs ?? 0} />
            </Col>
        </Row>

        <Row>
            <Col>
                <header className='fw-bolder pt-3'>Existing files</header>
                <FilesTable
                    baseUrlOverride={new URL('../soundfiles/', baseUrl)}
                    showDeleteButtons={false}
                    selectedFileId={selectedFile}
                    onSelect={(id: string) => setSelectedFile(id)}
                />
            </Col>
        </Row>

        <Row>
            <Col>
                <Button
                    type='button'
                    className='d-block w-100'
                    disabled={selectedFile == null || setFile.isPending == true}
                    onClick={() => setFile.mutate()}
                >Set selected file</Button>
            </Col>
        </Row>
    </Container>
}