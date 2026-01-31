import { useContext, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import useWebSocket from 'react-use-websocket'

import settingsContext from '../settings/settingsContext'

import type StateUpdate from '../models/stateUpdate'

export default function useSyncedState<DataType>(typeKey: string,
    queryOptions?: {
        queryUrl?: URL | string,
        enabled?: boolean
    },
    socketOptions?: {
        onMessage?: (data: DataType) => void
    }
) {
    const baseUrl = useContext(settingsContext).hostUrl
    const queryClient = useQueryClient()

    const query = useQuery<DataType>({
        enabled: queryOptions?.enabled,
        queryKey: [typeKey],
        queryFn: async () => {
            if(queryOptions?.queryUrl == undefined) return null
            const response = await fetch(new URL(queryOptions.queryUrl, baseUrl))
            return response.json()
        }
    })

    const syncUrl = new URL('/api/sync', baseUrl).toString()
    const { lastJsonMessage } = useWebSocket<StateUpdate<DataType>>(syncUrl, {
        share: true,
        shouldReconnect: (event) => event.code == 1006,
        onMessage: (event) => {
            const data = JSON.parse(event.data) as StateUpdate<DataType>
            if (data.typeKey != typeKey) return
            if (socketOptions?.onMessage) socketOptions.onMessage(data.data)
        }
    })

    useEffect(() => {
        if (lastJsonMessage == undefined) return
        if (lastJsonMessage.typeKey != typeKey) return
        queryClient.setQueryData([typeKey], lastJsonMessage.data)
    }, [lastJsonMessage, queryClient, typeKey])

    return query
}