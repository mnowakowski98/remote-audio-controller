import { IncomingMessage } from 'node:http'
import { WebSocketServer } from 'ws'

const syncServer = new WebSocketServer({ noServer: true })

export const connectionListener = (req: IncomingMessage, head: Buffer) => {
    const isSyncRequest = req.url == '/sync' && req.method == 'GET'
    if (isSyncRequest) syncServer.handleUpgrade(req, req.socket, head, () => undefined)
    return isSyncRequest
}

export const sendSyncData = (typeKey: string, data: unknown) =>
    syncServer.clients.forEach((client) => client.send(JSON.stringify({ typeKey, data })))