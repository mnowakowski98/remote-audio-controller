import { useContext } from 'react'
import { useMutation } from '@tanstack/react-query'

import SettingsContext from '../settings/settingsContext'

import classes from './playerControls.module.scss'
import type { FilePlayerState } from '../models/filePlayer'

import playButton from '../assets/play-button.svg'
import pauseButton from '../assets/pause-button.svg'
import stopButton from '../assets/stop-button.svg'
import loopButton from '../assets/loop-button.svg'
import useSemantic from '../hooks/useSemantic'

export default function PlayerControls(props: { state: FilePlayerState }) {
    const baseUrl = useContext(SettingsContext).hostUrl
    const affirm = useSemantic('affirm')

    const setPlayingState = useMutation({
        mutationFn: async (command: 'start' | 'pause' | 'stop') =>
            await fetch(new URL('./status/playing', baseUrl), { method: 'PUT', body: command })
    })

    const setLoopState = useMutation({
        mutationFn: async (loop: boolean) =>
            fetch(new URL('./status/loop', baseUrl), { method: 'PUT', body: loop ? 'true' : 'false' })
    })

    const setVolume = useMutation({
        mutationFn: async (volume: number) =>
            fetch(new URL('./status/volume', baseUrl), { method: 'PUT', body: volume.toString() })
    })

    const { playingState } = props.state

    return <div className={classes.playerControls}>
        <button
            style={props.state.loop == true ? {
                backgroundColor: affirm.backgroundColor
            } : undefined}
            className={`${classes.playerButton} ${classes.loop} secondary`}
            type='button'
            onClick={() => setLoopState.mutate(!props.state.loop)}
        >
            <img src={loopButton} />
        </button>

        <div className={classes.center}>
            {playingState != 'playing' &&
                <button
                    className={`${classes.playerButton} affirm`}
                    disabled={props.state.playingState == 'unloaded'}
                    type='button'
                    onClick={() => setPlayingState.mutate('start')}
                >
                    <img src={playButton} />
                </button>
            }

            {playingState != 'unloaded' && playingState != 'paused' && playingState != 'stopped' &&
                <button
                    className={`${classes.playerButton} ${classes.playPauseButton} secondary`}
                    type='button'
                    onClick={() => setPlayingState.mutate('pause')}
                >
                    <img src={pauseButton} />
                </button>
            }

            {playingState != 'unloaded' && playingState != 'stopped' &&
                <button
                    className={`${classes.playerButton} ${classes.stopButton} warning`}
                    type='button'
                    onClick={() => setPlayingState.mutate('stop')}
                >
                    <img src={stopButton} />
                </button>
            }
        </div>

        <div className={classes.volume}>
            <input type='range' min='0' max='100' value={props.state.volume} onChange={
                (event) => setVolume.mutate(event.target.valueAsNumber)
            } />
            <span>{props.state.volume}</span>
        </div>
    </div>
}