import { type ChangeEvent, useContext, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import settingsContext from '../settingsContext'
import useSemantic from '../hooks/useSemantic'

import classes from './fileUploader.module.scss'

export default function FileUploader() {
    const uploadUrl = useContext(settingsContext).hostUrl

    const fileInput = useRef<HTMLInputElement | null>(null)
    const [audioFile, setAudioFile] = useState<File | null>()

    const errorColors = useSemantic('error')

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
            toast.success('File uploaded successfully')
        },
        onError: (error) => toast.error(error.message, {
            style: {
                background: errorColors.background,
                color: errorColors.text
            }
        })
    })

    return <>
        <div className={classes.fileUploader}>
            <h3>Upload audio</h3>
            <div className={classes.inputs}>
                <input
                    ref={fileInput}
                    type='file'
                    disabled={uploadFile.isPending}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setAudioFile(event.target.files?.item(0))}
                />
                <div className={classes.browseButton}>
                    <button
                        className='secondary'
                        onClick={() => fileInput.current?.click()}
                    >Browse...</button>
                </div>
                <span className={classes.fileName}>{audioFile?.name ?? 'No file selected'}</span>
                <button
                    className={`${classes.uploadButton} primary`}
                    type='button'
                    disabled={audioFile == null || uploadFile.isPending == true}
                    onClick={() => uploadFile.mutate()}
                >Upload</button>
            </div>
        </div>
    </>
}