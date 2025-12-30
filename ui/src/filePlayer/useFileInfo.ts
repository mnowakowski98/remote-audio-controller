import { useContext } from 'react'

import SettingsContext from '../settingsContext'

import { filePlayerKey } from '../models/filePlayer'
import useSyncedState from '../hooks/useSyncedState'
import { type FilePlayerState } from '../models/filePlayer'

export default function useFileInfo() {
    const queryUrl = useContext(SettingsContext).hostUrl
    return useSyncedState<FilePlayerState>(filePlayerKey, {queryUrl})
}