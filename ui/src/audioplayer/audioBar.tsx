import { useEffect, useRef, useState } from 'react'

import useSyncedState from '../hooks/useSyncedState'
import { audioSeekKey } from '../models/audioStatus'

interface AudioBarProps {
    isPlaying: boolean
}

export default function AudioBar(props: AudioBarProps) {
    const timeout = useRef<NodeJS.Timeout>(null)
    const syncTime = useRef(performance.now())
    const [displayTime, setDisplayTime] = useState(0)

    const { data, isError, isLoading } = useSyncedState<number | undefined>(audioSeekKey, {
        queryUrl: './status/seek',
        responseTransformer: async (response) => {
            const data = parseInt(await response.text())
            if (Number.isNaN(data)) return undefined
            syncTime.current = performance.now()
            return data
        }
    })

    useEffect(() => {
        if(props.isPlaying == false) return

        timeout.current = setInterval(() => {
            if (data == undefined) return

            const elapsedTime = performance.now() - syncTime.current
            setDisplayTime(Math.floor((data + elapsedTime) / 1000))
        }, 100)

        return () => {
            if(timeout.current != null) clearInterval(timeout.current)
        }

    })
    if (isLoading == true) return 0
    if(data == undefined || isError == true) return null

    return <p>
        Synced time: {data}<br />
        Current time: {displayTime}
    </p>
}