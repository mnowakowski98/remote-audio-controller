import { useContext, useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Button from 'react-bootstrap/Button'

import AudioInfo from './audioInfo'
import PlayerControls from './playerControls'
import FileUploader from '../soundFiles/fileUploader'
import FilesTable from '../soundFiles/filesTable'
import ClearButton from './clearButton'

import useAudioInfo from './useAudioInfo'
import settingsContext from '../settingsContext'

export default function AudioPlayer() {
    const baseUrl = useContext(settingsContext).hostUrl

    const audioInfo = useAudioInfo()
    const hasFile = () => audioInfo.isSuccess == true && audioInfo.data?.id != 'none'

    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const setFile = useMutation({
        mutationFn: async () => (await fetch(new URL(`./${selectedFile}`, baseUrl), { method: 'POST' })).json(),
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
                {hasFile() ? <AudioInfo /> : 'No audio'}
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