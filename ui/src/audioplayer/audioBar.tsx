import { useEffect, useRef, useState } from 'react'

import useSyncedState from '../hooks/useSyncedState'

import type AudioStatus from '../models/audioStatus'
import { audioStatusKey } from '../models/audioStatus'

export default function AudioBar() {
    const timeout = useRef<NodeJS.Timeout>(null)
    const syncTime = useRef(performance.now())
    const [displayTime, setDisplayTime] = useState(0)

    const { data, isLoading } = useSyncedState<AudioStatus>(audioStatusKey, { queryUrl: './status' })

    useEffect(() => {
        if (data == undefined || data.playing == false) return

        timeout.current = setInterval(() => {
            if (data == undefined) return

            const elapsedTime = performance.now() - syncTime.current
            setDisplayTime(Math.floor((data.seek + elapsedTime) / 1000))
        }, 100)

        return () => {
            if(timeout.current != null) clearInterval(timeout.current)
        }

    })
    if (isLoading == true) return 0

    return <p>
        Synced time: {data?.seek}<br />
        Current time: {displayTime}
    </p>
}