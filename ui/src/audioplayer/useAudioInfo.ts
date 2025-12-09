import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'

import SettingsContext from '../settingsContext'
import type AudioFileInfo from '../models/audioFileInfo'

import { audioFileInfoKey } from '../models/audioFileInfo'
import useSyncedState from '../hooks/useSyncedState'

export default function useAudioInfo() {
    const settings = useContext(SettingsContext)
    const queryUrl = settings.hostUrl

    const query = useQuery<AudioFileInfo>({
        queryKey: [audioFileInfoKey],
        queryFn: async () => (await fetch(queryUrl)).json()
    })

    useSyncedState<AudioFileInfo>(audioFileInfoKey)

    return query
}