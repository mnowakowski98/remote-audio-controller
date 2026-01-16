import { useContext, useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import settingsContext from '../settingsContext'
import useSyncedState from '../hooks/useSyncedState'

import classes from './seekBar.module.scss'

import { filePlayerKey, type FilePlayerState } from '../models/filePlayer'
import { getDurationString } from '../hooks/getDurationString'

export default function SeekBar() {
    const baseUrl = useContext(settingsContext).hostUrl

    const seekTime = useRef<HTMLSpanElement>(null)
    const audio = useRef<HTMLInputElement>(null)

    const [lastServerTime, setLastServerTime] = useState(0)
    const [lastSyncMessageTime, setLastSyncMessageTime] = useState(performance.now())

    const { data, isLoading } = useSyncedState<FilePlayerState>(filePlayerKey,
        { queryUrl: baseUrl, enabled: false },
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
            if (seekTime.current == null || audio.current == null) return
            const seekValue = lastServerTime + (data?.playingState == 'playing' ? timeSinceLastSync() : 0)
            seekTime.current.innerText = getDurationString(seekValue)
            audio.current.valueAsNumber = seekValue
        })

        return () => clearInterval(timeout.current!)
    }, [data?.playingState, lastServerTime, lastSyncMessageTime])
    if (isLoading == true) return 0

    return <div className={classes.seekBar}>
        <div className={classes.timeDisplay}>
            <span ref={seekTime}>00:00:00</span> /
            <span> {getDurationString(data?.playingFile?.durationMs ?? 0)}</span>
        </div>
        <input type='range' onChange={(event) => {
            seek.mutate(event.target.valueAsNumber)
        }} ref={audio} min={0} max={data?.playingFile?.durationMs ?? 0} />
    </div>
}