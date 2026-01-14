import { type ChangeEvent, useContext, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import settingsContext from '../settingsContext'

import classes from './fileUploader.module.scss'

export default function FileUploader() {
    const uploadUrl = useContext(settingsContext).hostUrl

    const fileInput = useRef<HTMLInputElement | null>(null)
    const [audioFile, setAudioFile] = useState<File | null>()

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
        onSuccess: () => {
            setAudioFile(null)
            if (fileInput.current != null) fileInput.current.value = ''
        }
    })

    return <>
        <div className={classes.fileUploader}>
            <label><h3>Upload audio</h3></label>
            <div className={classes.inputs}>
                <input
                    ref={fileInput}
                    type='file'
                    disabled={uploadFile.isPending}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setAudioFile(event.target.files?.item(0))}
                />
                <button
                type='button'
                disabled={audioFile == null || uploadFile.isPending == true}
                onClick={() => uploadFile.mutate()}
            >Upload</button>
            </div>
        </div>

        {/* <ToastContainer position='bottom-end'>
            <Toast bg='danger' className='m-3' show={showErrorToast} onClose={() => setShowErrorToast(false)} delay={3000} autohide>
                <Toast.Body className='text-white'>{uploadFile.error?.message}</Toast.Body>
            </Toast>
        </ToastContainer> */}
    </>
}