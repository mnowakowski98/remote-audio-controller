import { type ChangeEvent, type ReactElement, useContext, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'

import settingsContext from '../settingsContext'

interface FileUploaderProps {
    children?: ReactElement
}

export default function FileUploader(props: FileUploaderProps) {
    const uploadUrl = useContext(settingsContext).hostUrl

    const fileInput = useRef<HTMLInputElement | null>(null)
    const [audioFile, setAudioFile] = useState<File | null>()

    const [showErrorToast, setShowErrorToast] = useState(false)

    const uploadFile = useMutation({
        mutationFn: async () => {
            if (audioFile == null) return null
            const body = new FormData()
            body.append('file', audioFile!)
            body.append('name', audioFile!.name)
            const response = await fetch(uploadUrl, { method: 'POST', body })
            if (response.status == 400) {
                const errorMessage = await response.text()
                throw new Error(errorMessage)
            }
        },
        onError: () => setShowErrorToast(true),
        onSuccess: () => {
            setAudioFile(null)
            if (fileInput.current != null) fileInput.current.value = ''
        }
    })

    return <>
        <InputGroup>
            <InputGroup.Text>Upload audio</InputGroup.Text>
            <Form.Control
                ref={fileInput}
                type='file'
                disabled={uploadFile.isPending}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setAudioFile(event.target.files?.item(0))}
            />
            <Button
                type='button'
                disabled={audioFile == null || uploadFile.isPending == true}
                onClick={() => uploadFile.mutate()}
            >Upload</Button>
            {props.children}
        </InputGroup>

        <ToastContainer position='bottom-end'>
            <Toast bg='danger' className='m-3' show={showErrorToast} onClose={() => setShowErrorToast(false)} delay={3000} autohide>
                <Toast.Body className='text-white'>{uploadFile.error?.message}</Toast.Body>
            </Toast>
        </ToastContainer>
    </>
}