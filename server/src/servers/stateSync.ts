import { IncomingMessage } from 'node:http'
import { WebSocketServer } from 'ws'

const syncServer = new WebSocketServer({ noServer: true })

export const connectionListener = (req: IncomingMessage) => {
    if (req.url == '/sync' && req.method == 'GET')
        syncServer.handleUpgrade(req, req.socket, Buffer.from('connection:upgrade'), () => undefined)
}

export const sendSyncData = (typeKey: string, data: unknown) =>
    syncServer.clients.forEach((client) => client.send(JSON.stringify({ typeKey, data })))