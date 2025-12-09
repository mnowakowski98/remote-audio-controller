import express, { NextFunction, Request, Response } from 'express'
import { WebSocketServer } from 'ws'

const syncServer = new WebSocketServer({ noServer: true })

const router = express.Router()

router.get('/sync', (req) => syncServer.handleUpgrade(req, req.socket, Buffer.from('connection:upgrade'), () => undefined))

export const sendSyncData = <DataType>(typeKey: string, data: DataType) =>
    syncServer.clients.forEach((client) => client.send(JSON.stringify({ typeKey, data })))

export default router