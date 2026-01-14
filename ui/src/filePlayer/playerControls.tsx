import { useContext } from 'react'
import { useMutation } from '@tanstack/react-query'

import SettingsContext from '../settingsContext'

import classes from './playerControls.module.scss'
import type { FilePlayerState } from '../models/filePlayer'

import playButton from '../assets/play-button.svg'
import pauseButton from '../assets/pause-button.svg'
import stopButton from '../assets/stop-button.svg'

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
        <div className={classes.loopControl}>
            <label htmlFor='loopCheck'>Loop</label>
            <input id='loopCheck' type='checkbox' checked={props.state.loop} onChange={(event) => setLoopState.mutate(event.target.checked)} />
        </div>

        <div className={classes.playbackControl}>
            <button
                className={classes.playbackButton}
                type='button'
                disabled={props.state.playingState == 'playing' || props.state.playingState == 'unloaded'}
                onClick={() => setPlayingState.mutate('start')}>
                <img src={playButton} className={classes.playbackButtonImg} />
            </button>
            <button
                className={classes.playbackButton}
                type='button'
                disabled={props.state.playingState == 'paused' || props.state.playingState == 'stopped' ||  props.state.playingState == 'unloaded'}
                onClick={() => setPlayingState.mutate('pause')}>
                <img src={pauseButton} className={classes.playbackButtonImg} />
            </button>
            <button
                className={classes.playbackButton}
                type='button'
                disabled={props.state.playingState == 'stopped' ||  props.state.playingState == 'unloaded'}
                onClick={() => setPlayingState.mutate('stop')}>
                <img src={stopButton} className={classes.playbackButtonImg} />
            </button>
        </div>
    </div>
}