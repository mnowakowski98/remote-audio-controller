import { useEffect, useRef, useState } from 'react'

import useSyncedState from '../hooks/useSyncedState'

import type AudioStatus from '../models/audioStatus'
import { audioStatusKey } from '../models/audioStatus'

export default function AudioBar() {
    const secondize = (time: number) => (time / 1000).toFixed(2)

    const timeSinceSync = useRef<HTMLSpanElement>(null)
    const seekTime = useRef<HTMLSpanElement>(null)

    const [lastServerTime, setLastServerTime] = useState(0)
    const [lastSyncMessageTime, setLastSyncMessageTime] = useState(performance.now())

    const { data, isLoading } = useSyncedState<AudioStatus>(audioStatusKey,
        { queryUrl: './status' },
        { onMessage: (data) => {
            setLastServerTime(data.seek)
            setLastSyncMessageTime(performance.now())
        }})

    const timeout = useRef<NodeJS.Timeout>(null)
    useEffect(() => {
        const timeSinceLastSync = () => performance.now() - lastSyncMessageTime
        timeout.current = setInterval(() => {
            if (timeSinceSync.current == null || seekTime.current == null) return
            timeSinceSync.current!.innerText = secondize(timeSinceLastSync())
            seekTime.current!.innerText = secondize(lastServerTime + (data?.playing ? timeSinceLastSync() : 0))
        })

        return () => clearInterval(timeout.current!)
    }, [data?.playing, lastServerTime, lastSyncMessageTime])
    if (isLoading == true) return 0

    return <p>
        Server time: {secondize(lastServerTime)}s<br />
        Time since last sync: <span ref={timeSinceSync}>0.00</span>s<br />
        Seek time: <span ref={seekTime}>0.00</span>s
    </p>
}