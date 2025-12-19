import { useEffect, useRef, useState } from 'react'

import useSyncedState from '../hooks/useSyncedState'

import type AudioStatus from '../models/audioStatus'
import { audioStatusKey } from '../models/audioStatus'

interface AudioBarProps {
    maxDuration: number
}

export default function AudioBar(props: AudioBarProps) {
    const secondize = (time: number) => (time / 1000).toFixed(2)

    const seekTime = useRef<HTMLSpanElement>(null)
    const audio = useRef<HTMLInputElement>(null)

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
            if (seekTime.current == null || audio.current == null) return
            const seekValue = lastServerTime + (data?.playing ? timeSinceLastSync() : 0)
            seekTime.current.innerText = secondize(seekValue)
            audio.current.valueAsNumber = seekValue
        })

        return () => clearInterval(timeout.current!)
    }, [data?.playing, lastServerTime, lastSyncMessageTime])
    if (isLoading == true) return 0

    return <div>
        <div>
            <span ref={seekTime}>0.00</span> /
            <span> {secondize(props.maxDuration)}s</span>
        </div>
        <input type='range' ref={audio} min={0} max={props.maxDuration} />
    </div>

    // return <p>
    //     Server time: {secondize(lastServerTime)}s<br />
    //     Time since last sync: <span ref={timeSinceSync}>0.00</span>s<br />
    //     Seek time: 
    // </p>
}