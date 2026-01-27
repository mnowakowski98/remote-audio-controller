import { useContext } from 'react'
import { useMutation } from '@tanstack/react-query'

import SettingsContext from '../SettingsContext'

import classes from './playerControls.module.scss'
import type { FilePlayerState } from '../models/filePlayer'

import playButton from '../assets/play-button.svg'
import pauseButton from '../assets/pause-button.svg'
import stopButton from '../assets/stop-button.svg'
import loopButton from '../assets/loop-button.svg'

export default function PlayerControls(props: { state: FilePlayerState }) {
    const baseUrl = useContext(SettingsContext).hostUrl

    const setPlayingState = useMutation({
        mutationFn: async (command: 'start' | 'pause' | 'stop') =>
            await fetch(new URL('./status/playing', baseUrl), { method: 'PUT', body: command })
    })

    const setLoopState = useMutation({
        mutationFn: async (loop: boolean) =>
            await fetch(new URL('./status/loop', baseUrl), { method: 'PUT', body: loop ? 'true' : 'false' })
    })
    return <div className={classes.playerControls}>
        <button
            className={`${classes.playerButton} secondary`}
            type='button'
            onClick={() => setLoopState.mutate(!props.state.loop)}
        >
            <img src={loopButton} />
        </button>
        

        {props.state.playingState != 'unloaded' && <>
            {props.state.playingState != 'playing' &&
                <button
                    className={`${classes.playerButton} ${classes.playPauseButton} affirm`}
                    type='button'
                    onClick={() => setPlayingState.mutate('start')}
                >
                    <img src={playButton} />
                </button>}
            {props.state.playingState != 'paused' && props.state.playingState != 'stopped' &&
                <button
                    className={`${classes.playerButton} ${classes.playPauseButton} secondary`}
                    type='button'
                    onClick={() => setPlayingState.mutate('pause')}
                >
                    <img src={pauseButton} />
                </button>
            }
            {props.state.playingState != 'stopped' &&
                <button
                    className={`${classes.playerButton} ${classes.stopButton} warning`}
                    type='button'
                    onClick={() => setPlayingState.mutate('stop')}
                >
                    <img src={stopButton} />
                </button>}
        </>}
    </div>
}