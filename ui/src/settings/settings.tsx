import { useContext, useState } from 'react'

import type { Settings } from '../settingsContext'
import SettingsContext from '../settingsContext'

interface SettingsProps {
    onUpdate: (settings: Settings) => void
}

export default function Settings(props: SettingsProps) {
    const settings = useContext(SettingsContext)
    const [hostUrl, setHostUrl] = useState(settings.hostUrl.toString())

    const getSettings = (): Settings => ({
        hostUrl: new URL(hostUrl)
    })

    return <div>
        
    </div>
}