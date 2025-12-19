import { useEffect, useRef, useState } from 'react'

import useSyncedState from '../hooks/useSyncedState'

import type AudioStatus from '../models/audioStatus'
import { audioStatusKey } from '../models/audioStatus'
import type StateUpdate from '../models/stateUpdate'

export default function AudioBar() {
    const timeout = useRef<NodeJS.Timeout>(null)
    const seekTime = useRef<HTMLSpanElement>(null)

    const secondize = (time: number) => (time / 1000).toFixed(2)

    const [lastServerTime, setLastServerTime] = useState(0)
    const [lastSyncMessageTime, setSyncTime] = useState(performance.now())
    const timeSinceLastSync = () => performance.now() - lastSyncMessageTime

    const { data, isLoading } = useSyncedState<AudioStatus>(audioStatusKey,
        { queryUrl: './status' },
        { onMessage: (event) => {
            setSyncTime(performance.now())
            // Typescript seems to think data is an object. It's not
            const dataString = event.data as unknown as string
            const { data } = JSON.parse(dataString) as StateUpdate<AudioStatus>
            setLastServerTime(data.seek)
        }})

    useEffect(() => {
        if (data == undefined || data.playing == false) return

        timeout.current = setInterval(() =>
            seekTime.current!.innerText = secondize(lastServerTime + timeSinceLastSync()))

        return () => clearInterval(timeout.current!)

    })
    if (isLoading == true) return 0

    return <p>
        Synced time: {data?.seek}<br />
        Time since last sync: {secondize(timeSinceLastSync())}<br />
        Seek time: <span ref={seekTime}>0</span>
    </p>
}