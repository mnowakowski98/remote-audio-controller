import { useContext, useEffect, useRef, useState } from 'react'

import useSyncedState from '../hooks/useSyncedState'

import { useMutation } from '@tanstack/react-query'
import settingsContext from '../settingsContext'
import { filePlayerKey, type FilePlayerState } from '../models/filePlayer'

interface SeekBarProps {
    maxDuration: number
}

export default function SeekBar(props: SeekBarProps) {
    const baseUrl = useContext(settingsContext).hostUrl

    const doUpdate = useRef(true)
    const seekTime = useRef<HTMLSpanElement>(null)
    const audio = useRef<HTMLInputElement>(null)

    const [lastServerTime, setLastServerTime] = useState(0)
    const [lastSyncMessageTime, setLastSyncMessageTime] = useState(performance.now())

    const { data, isLoading } = useSyncedState<FilePlayerState>(filePlayerKey,
        { queryUrl: './status', enabled: false },
        { onMessage: (data) => {
            setLastServerTime(data.seekPosition)
            setLastSyncMessageTime(performance.now())
        }})

    const seek = useMutation({
        mutationFn: async (seekTo: number) => {
            await fetch(new URL('./status/seek', baseUrl), {
                method: 'PUT',
                body: seekTo.toString()
            })
        }
    })

    const timeout = useRef<number>(null)
    useEffect(() => {
        const timeSinceLastSync = () => performance.now() - lastSyncMessageTime
        timeout.current = setInterval(() => {
            if (doUpdate.current == false) return
            if (seekTime.current == null || audio.current == null) return
            const seekValue = lastServerTime + (data?.playingState == 'playing' ? timeSinceLastSync() : 0)
            seekTime.current.innerText = (seekValue / 1000).toFixed(2)
            audio.current.valueAsNumber = seekValue
        })

        return () => clearInterval(timeout.current!)
    }, [data?.playingState, lastServerTime, lastSyncMessageTime])
    if (isLoading == true) return 0

    return <div>
        <div>
            <span ref={seekTime}>0.00</span> /
            <span> {(props.maxDuration / 1000).toFixed(2)}s</span>
        </div>
        <input className='w-100' type='range' onChange={(event) => {
            seek.mutate(event.target.valueAsNumber)
        }} ref={audio} min={0} max={props.maxDuration} />
    </div>
}