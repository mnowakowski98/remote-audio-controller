import { useContext, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import useWebSocket from 'react-use-websocket'

import settingsContext from '../settingsContext'

import type StateUpdate from '../models/stateUpdate'

export default function useSyncedState<DataType>(typeKey: string, queryOptions?:{
    queryUrl?: URL | string,
    responseTransformer?: (response: Response) => Promise<DataType>
}) {
    const baseUrl = useContext(settingsContext).hostUrl
    const queryClient = useQueryClient()

    const query = useQuery<DataType>({
        queryKey: [typeKey],
        queryFn: async () => {
            if(queryOptions?.queryUrl == undefined) return null
            const response = await fetch(new URL(queryOptions.queryUrl, baseUrl))
            if (queryOptions.responseTransformer) return await queryOptions.responseTransformer(response)
            return await response.json()
        }
    })

    const syncUrl = new URL('/sync', baseUrl).toString()
    const { lastJsonMessage } = useWebSocket<StateUpdate<DataType>>(syncUrl, {
        share: true,
        shouldReconnect: () => true,
    })

    useEffect(() => {
        if (lastJsonMessage == undefined) return
        if (lastJsonMessage.typeKey != typeKey) return
        queryClient.setQueryData([typeKey], lastJsonMessage.data)
    }, [lastJsonMessage, queryClient, typeKey])

    return query
}