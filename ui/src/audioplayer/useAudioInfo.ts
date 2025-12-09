import { useContext, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import useWebSocket from 'react-use-websocket'

import SettingsContext from '../settingsContext'
import type AudioFileInfo from '../models/audioFileInfo'
import type StateUpdate from '../models/stateUpdate'

import { audioFileInfoKey } from '../models/audioFileInfo'

export default function useAudioInfo() {
    const queryClient = useQueryClient()

    const settings = useContext(SettingsContext)
    const queryUrl = settings.hostUrl

    const query = useQuery<AudioFileInfo>({
        queryKey: [audioFileInfoKey],
        queryFn: async () => (await fetch(queryUrl)).json()
    })

    const { lastJsonMessage } = useWebSocket<StateUpdate<AudioFileInfo>>(new URL('/sync', settings.hostUrl).toString(), { share: true })

    useEffect(() => {
        if (lastJsonMessage == undefined) return
        if (lastJsonMessage.typeKey != audioFileInfoKey) return
        queryClient.setQueryData([audioFileInfoKey], lastJsonMessage.data)
    }, [lastJsonMessage, queryClient])

    return query
}