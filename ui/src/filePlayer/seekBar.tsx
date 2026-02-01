import { useContext, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'

import settingsContext from '../settings/settingsContext'
import useSyncedState from '../hooks/useSyncedState'

import classes from './seekBar.module.scss'

import { filePlayerKey, type FilePlayerState } from '../models/filePlayer'
import { getDurationString } from '../hooks/getDurationString'

export default function SeekBar() {
    const baseUrl = useContext(settingsContext).hostUrl

    const seekTime = useRef<HTMLSpanElement>(null)
    const seekRange = useRef<HTMLInputElement>(null)

    const useInitialReqTime = useRef(true)
    const lastServerTime = useRef(0)
    const lastSyncMessageTime = useRef(performance.now())

    const { data, isLoading } = useSyncedState<FilePlayerState>(filePlayerKey,
        { queryUrl: baseUrl, enabled: false },
        { onMessage: (data) => {
            lastServerTime.current = data.seekPosition
            lastSyncMessageTime.current = performance.now()
        }
    })

    const seek = useMutation({
        mutationFn: async (seekTo: number) => {
            await fetch(new URL('./status/seek', baseUrl), {
                method: 'PUT',
                body: seekTo.toString()
            })
        }
    })

    const timeout = useRef<NodeJS.Timeout>(null)
    useEffect(() => {
        const timeSinceLastSync = () => performance.now() - lastSyncMessageTime.current
        timeout.current = setInterval(() => {
            if (seekTime.current == null || seekRange.current == null) return
            const serverTime = useInitialReqTime.current == true ? data?.seekPosition ?? 0 : lastServerTime.current
            const seekValue = serverTime + (data?.playingState == 'playing' ? timeSinceLastSync() : 0)
            seekTime.current.innerText = getDurationString(seekValue)
            seekRange.current.valueAsNumber = seekValue
        })

        return () => clearInterval(timeout.current!)
    }, [data?.playingState])
    if (isLoading == true) return 0

    return <div className={classes.seekBar}>
        <div className={classes.timeDisplay}>
            <span ref={seekTime}>00:00:00</span> /
            <span> {getDurationString(data?.playingFile?.durationMs ?? 0)}</span>
        </div>
        <input type='range' onChange={(event) => {
            seek.mutate(event.target.valueAsNumber)
        }} ref={seekRange} min={0} max={data?.playingFile?.durationMs ?? 0} />
    </div>
}