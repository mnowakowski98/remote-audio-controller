import { useContext, useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import FileInfo from './fileInfo'
import PlayerControls from './playerControls'
import FileUploader from '../soundFiles/fileUploader'
import FilesTable from '../soundFiles/filesTable'
import ClearButton from './clearButton'

import useFilePlayerState from './useFilePlayerState'
import settingsContext from '../settingsContext'
import SeekBar from './seekBar'

export default function FilePlayer() {
    const baseUrl = useContext(settingsContext).hostUrl

    const playerState = useFilePlayerState()
    const hasFile = () => playerState.isSuccess == true && playerState.data?.playingFile != null

    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const setFile = useMutation({
        mutationFn: async () => await fetch(new URL(`./${selectedFile}`, baseUrl), { method: 'POST' }),
        onSuccess: () => setSelectedFile(null)
    })

    return <div>
        
    </div>
}