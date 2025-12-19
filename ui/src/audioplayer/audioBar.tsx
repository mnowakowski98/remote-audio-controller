import { useEffect, useRef, useState } from 'react'

import useSyncedState from '../hooks/useSyncedState'

import type AudioStatus from '../models/audioStatus'
import { audioStatusKey } from '../models/audioStatus'

export default function AudioBar() {
    const timeout = useRef<NodeJS.Timeout>(null)
    const seekTime = useRef<HTMLSpanElement>(null)
    const lastSyncTime = useRef<HTMLSpanElement>(null)

    const secondize = (time: number) => (time / 1000).toFixed(2)

    const [lastServerTime, setLastServerTime] = useState(0)
    const [lastSyncMessageTime, setSyncTime] = useState(performance.now())
    const timeSinceLastSync = () => performance.now() - lastSyncMessageTime

    const { data, isLoading } = useSyncedState<AudioStatus>(audioStatusKey,
        { queryUrl: './status' },
        { onMessage: (data) => {
            setSyncTime(performance.now())
            setLastServerTime(data.seek)
        }})

    useEffect(() => {
        timeout.current = setInterval(() => {
            seekTime.current!.innerText = secondize(lastServerTime + (data?.playing ? timeSinceLastSync() : 0))
            lastSyncTime.current!.innerText = secondize(timeSinceLastSync())
        })

        return () => clearInterval(timeout.current!)

    })
    if (isLoading == true) return 0

    return <p>
        Server time: {secondize(data?.seek ?? 0)}s<br />
        Time since last sync: <span ref={lastSyncTime}>0.00</span>s<br />
        Seek time: <span ref={seekTime}>0.00</span>s
    </p>
}