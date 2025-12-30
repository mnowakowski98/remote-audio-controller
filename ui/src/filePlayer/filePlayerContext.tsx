import { useContext } from 'react';

import FilePlayer from './filePlayer';
import SettingsContext from '../settingsContext';


export default function AudioPlayerContext() {
    const settings = useContext(SettingsContext)
    const hostUrl = new URL('./fileplayer/', settings.hostUrl)

    return <SettingsContext value={{ hostUrl }}>
        <FilePlayer />
    </SettingsContext>
}