import { useContext, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import useWebSocket from 'react-use-websocket'

import settingsContext from '../settingsContext'

import type StateUpdate from '../models/stateUpdate'

export default function useSyncedState<DataType>(typeKey: string) {
    const queryClient = useQueryClient()

    const url = new URL('/sync', useContext(settingsContext).hostUrl).toString()
    const { lastJsonMessage } = useWebSocket<StateUpdate<DataType>>(url, { share: true })

    useEffect(() => {
        if (lastJsonMessage == undefined) return
        if (lastJsonMessage.typeKey != typeKey) return
        queryClient.setQueryData([typeKey], lastJsonMessage.data)
    }, [lastJsonMessage, queryClient, typeKey])
}