import { useContext } from 'react'
import { useMutation } from '@tanstack/react-query'

import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'

import SettingsContext from '../settingsContext'
import useFilePlayerState from './useFilePlayerState'

interface PlayerControlsProps {
    hasFile: boolean
}

export default function PlayerControls(props: PlayerControlsProps) {
    const baseUrl = useContext(SettingsContext).hostUrl

    const playerState = useFilePlayerState()

    const setPlayingState = useMutation({
        mutationFn: async (command: 'start' | 'pause' | 'stop') =>
            await fetch(new URL('./status/playing', baseUrl), { method: 'PUT', body: command })
    })

    const setLoopState = useMutation({
        mutationFn: async (loop: boolean) =>
            await fetch(new URL('./status/loop', baseUrl), { method: 'PUT', body: loop ? 'true' : 'false' })
    })

    if (playerState.isLoading) return 'Loading'
    if (playerState.isError || playerState.data == null) return playerState.error?.message ?? 'Goofed'
    
    return <InputGroup className='justify-content-end'>
        <InputGroup.Text className={`text-light ${playerState.data.loop ? 'bg-success' : 'bg-secondary'}`}>
            <Form.Check reverse label='Loop' checked={playerState.data.loop} onChange={(event) => setLoopState.mutate(event.target.checked)} />
        </InputGroup.Text>
        <Button
            type='button'
            disabled={playerState.data.playingState == 'playing' || props.hasFile == false}
            onClick={() => setPlayingState.mutate('start')}>
            Start
        </Button>
        <Button
            type='button'
            disabled={playerState.data.playingState == 'paused' || playerState.data.playingState == 'stopped' || props.hasFile == false}
            onClick={() => setPlayingState.mutate('pause')}>
            Pause
        </Button>
        <Button
            type='button'
            disabled={playerState.data.playingState == 'stopped' || props.hasFile == false}
            onClick={() => setPlayingState.mutate('stop')}>
            Stop
        </Button>
    </InputGroup>
}