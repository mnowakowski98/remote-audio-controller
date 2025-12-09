import express from 'express'
import { WebSocketServer } from 'ws'

const syncServer = new WebSocketServer({ noServer: true })

const router = express.Router()

router.get('/', (req) => syncServer.handleUpgrade(req, req.socket, Buffer.from('connection:upgrade'), () => undefined))

export const sendSyncData = (typeKey: string, data: unknown) =>
    syncServer.clients.forEach((client) => client.send(JSON.stringify({ typeKey, data })))

export default router