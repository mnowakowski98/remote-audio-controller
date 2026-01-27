import { useState } from 'react'

import type { Settings as SettingsType } from '../settingsContext'

interface SettingsProps {
    state: SettingsType
    onUpdate: (settings: SettingsType) => void
}

export default function Settings(props: SettingsProps) {
    const [host, setHost] = useState(props.state.hostUrl.toString())

    return <div>
        <label htmlFor='host'>Host</label>
        <input id='host' type='text' value={host} onChange={(event) => setHost(event.target.value)} />
        <button type='button' onClick={() => props.onUpdate({ hostUrl: new URL(host) })}>Set</button>
    </div>
}