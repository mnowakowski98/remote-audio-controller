import { useContext } from 'react'
import { useMutation } from '@tanstack/react-query'

import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'

import SettingsContext from '../settingsContext'
import useSyncedState from '../hooks/useSyncedState'
import { filePlayerKey } from '../models/filePlayer'
import { type FilePlayerState } from '../models/filePlayer'

interface PlayerControlsProps {
    hasFile: boolean
}

export default function PlayerControls(props: PlayerControlsProps) {
    const baseUrl = useContext(SettingsContext).hostUrl

    const audioStatus = useSyncedState<FilePlayerState>(filePlayerKey, { queryUrl: './status' })

    const setPlayingState = useMutation({
        mutationFn: async (command: 'start' | 'pause' | 'stop') =>
            await fetch(new URL('./status/playing', baseUrl), { method: 'PUT', body: command })
    })

    const setLoopState = useMutation({
        mutationFn: async (loop: boolean) =>
            await fetch(new URL('./status/loop', baseUrl), { method: 'PUT', body: loop ? 'true' : 'false' })
    })

    if (audioStatus.isLoading) return 'Loading'
    if (audioStatus.isError || audioStatus.data == null) return audioStatus.error?.message ?? 'Goofed'
    
    return <InputGroup className='justify-content-end'>
        <InputGroup.Text className={`text-light ${audioStatus.data.loop ? 'bg-success' : 'bg-secondary'}`}>
            <Form.Check reverse label='Loop' checked={audioStatus.data.loop} onChange={(event) => setLoopState.mutate(event.target.checked)} />
        </InputGroup.Text>
        <Button
            type='button'
            disabled={audioStatus.data.playingState == 'playing' || props.hasFile == false}
            onClick={() => setPlayingState.mutate('start')}>
            Start
        </Button>
        <Button
            type='button'
            disabled={audioStatus.data.playingState == 'paused' || audioStatus.data.playingState == 'stopped' || props.hasFile == false}
            onClick={() => setPlayingState.mutate('pause')}>
            Pause
        </Button>
        <Button
            type='button'
            disabled={audioStatus.data.playingState == 'stopped' || props.hasFile == false}
            onClick={() => setPlayingState.mutate('stop')}>
            Stop
        </Button>
    </InputGroup>
}