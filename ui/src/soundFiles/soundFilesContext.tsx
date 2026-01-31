import { useContext } from 'react'

import SettingsContext from '../settings/settingsContext'
import useSyncedState from '../hooks/useSyncedState'

import SoundFiles from './soundFiles'

import { soundFileKey, type SoundFile } from '../models/soundFiles'

export default function SoundFilesContext() {
    const settings = useContext(SettingsContext)
    const queryUrl = new URL('./soundfiles/', settings.hostUrl)
    const filesState = useSyncedState<SoundFile[]>(soundFileKey, {queryUrl})

    if (filesState.isLoading == true) return 'Loading'
    if (filesState.data == undefined || filesState.error != null) return filesState.error?.message

    return <SettingsContext value={{ hostUrl: queryUrl }}>
        <SoundFiles state={filesState.data} />
    </SettingsContext>
}