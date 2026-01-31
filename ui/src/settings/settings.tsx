import { useState } from 'react'

import type { Settings as SettingsType } from './settingsContext'

import classes from './settings.module.scss'

interface SettingsProps {
    state: SettingsType
    onUpdate: (settings: SettingsType) => void
}

export default function Settings(props: SettingsProps) {
    const [host, setHost] = useState(props.state.hostUrl.toString())

    return <div className={classes.settings}>
        <div className='inputGroup'>
            <label htmlFor='host'>Host</label>
            <input id='host' type='text' value={host} onChange={(event) => setHost(event.target.value)} />
        </div>
        <button
            className={`${classes.saveButton} primary`}
            onClick={() => props.onUpdate({
                hostUrl: new URL(host)
            })}
        >Save</button>
    </div>
}