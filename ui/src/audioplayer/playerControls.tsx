import { useContext, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'

import SettingsContext from '../settingsContext'
import type AudioStatus from '../models/audioStatus'
import { audioStatusKey } from '../models/audioStatus'
import useWebSocket from 'react-use-websocket'
import type StateUpdate from '../models/stateUpdate'

interface PlayerControlsProps {
    hasFile: boolean
}

export default function PlayerControls(props: PlayerControlsProps) {
    const baseUrl = useContext(SettingsContext).hostUrl
    const queryClient = useQueryClient()

    const audioStatus = useQuery<AudioStatus>({
        queryKey: [audioStatusKey],
        queryFn: async () => (await fetch(new URL('./status', baseUrl))).json()
    })

    const { lastJsonMessage } = useWebSocket<StateUpdate<AudioStatus>>(new URL('/sync', baseUrl).toString(), { share: true })
    useEffect(() => {
        if (lastJsonMessage == undefined) return
        if (lastJsonMessage.typeKey != audioStatusKey) return
        queryClient.setQueryData([audioStatusKey], lastJsonMessage.data)
    })

    const setPlayingState = useMutation({
        mutationFn: async (command: 'start' | 'pause' | 'stop') => {
            const response = await fetch(new URL('./status/playing', baseUrl), {
                method: 'PUT', body: command
            })
            return response.json()
        }
    })

    const setLoopState = useMutation({
        mutationFn: async (loop: boolean) => {
            const response = await fetch(new URL('./status/loop', baseUrl), {
                method: 'PUT', body: loop ? 'true' : 'false'
            })
            return response.json()
        }
    })

    if (audioStatus.isLoading) return 'Loading'
    if (audioStatus.isError || audioStatus.data == null) return 'Goofed'
    
    return <InputGroup className='justify-content-end'>
        <InputGroup.Text className={`text-light ${audioStatus.data.loop ? 'bg-success' : 'bg-secondary'}`}>
            <Form.Check reverse label='Loop' checked={audioStatus.data.loop} onChange={(event) => setLoopState.mutate(event.target.checked)} />
        </InputGroup.Text>
        <Button
            type='button'
            disabled={audioStatus.data.playing == true || props.hasFile == false}
            onClick={() => setPlayingState.mutate('start')}>
            Start
        </Button>
        <Button type='button' disabled={audioStatus.data.playing == false} onClick={() => setPlayingState.mutate('pause')}>Pause</Button>
        <Button
            type='button'
            disabled={audioStatus.data.playing == false && audioStatus.data.paused == false}
            onClick={() => setPlayingState.mutate('stop')}>
            Stop
        </Button>
    </InputGroup>
}