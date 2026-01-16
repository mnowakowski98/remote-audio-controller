import { useContext } from 'react'
import { useMutation } from '@tanstack/react-query'

import SettingsContext from '../settingsContext'

import classes from './playerControls.module.scss'
import type { FilePlayerState } from '../models/filePlayer'

import playButton from '../assets/play-button.svg'
import pauseButton from '../assets/pause-button.svg'
import stopButton from '../assets/stop-button.svg'

import loopOff from '../assets/loop-off.svg'
import loopSingle from '../assets/loop-single.svg'

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

    const loopSrc = props.state.loop == true ? loopSingle : loopOff

    return <div className={classes.playerControls}>
        <img
            className={classes.playbackButtonImg}
            src={loopSrc}
            onClick={() => setLoopState.mutate(!props.state.loop)}
        />

        {props.state.playingState != 'unloaded' && <>
            {props.state.playingState != 'playing' && 
                <img
                    className={classes.playbackButtonImg}
                    src={playButton}
                    onClick={() => setPlayingState.mutate('start')}
                />}
            {props.state.playingState != 'paused' && props.state.playingState != 'stopped' &&
                <img
                    className={classes.playbackButtonImg}
                    src={pauseButton}
                    onClick={() => setPlayingState.mutate('pause')}
                />
            }
            {props.state.playingState != 'stopped' && <img
                className={classes.playbackButtonImg}
                src={stopButton}
                onClick={() => setPlayingState.mutate('stop')}
            />}
        </>}
    </div>
}