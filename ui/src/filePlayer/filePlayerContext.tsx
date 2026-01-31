import { useContext } from 'react';

import FilePlayer from './filePlayer';
import SettingsContext from '../settings/settingsContext';
import useSyncedState from '../hooks/useSyncedState';
import { filePlayerKey, type FilePlayerState } from '../models/filePlayer';

export default function FilePlayerContext() {
    const settings = useContext(SettingsContext)
    const baseUrl = new URL('./fileplayer/', settings.hostUrl)
    const playerState = useSyncedState<FilePlayerState>(filePlayerKey, { queryUrl: baseUrl })

    if (playerState.isLoading == true) return 'Loading'
    if (playerState.data == undefined || playerState.error != null) return playerState.error?.message

    return <SettingsContext value={{ hostUrl: baseUrl }}>
        <FilePlayer state={playerState.data} />
    </SettingsContext>
}