import express, { Express, Request } from 'express'
import cors from 'cors'

import { AppStore } from '../store'
import { selectConfig } from '../slices/configSlice'

import {
    createCipheriv,
    createDecipheriv,
    createPrivateKey,
    KeyObject,
    randomFill,
    subtle
} from 'node:crypto'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { cwd } from 'node:process'

import filePlayer from '../routes/filePlayer'
import soundFiles from '../routes/soundFiles'
import config from '../routes/config'
import { algorithm } from '../models/validate'


let app: Express | null = null

type ServerControls = {
    reload: {
        all: () => void
        http: () => void
        filePlayer: () => void
        soundFiles: () => void
    }
}

export type LocalContext = {
    store: AppStore,
    serverControls: ServerControls
}

export const getContext = (req: Request): LocalContext => req.app.locals.context

export const createApp = (store: AppStore, options: {
    controlCallbacks: ServerControls
}) => {
    app = express()

    const serverSettings = selectConfig(store.getState())
    if (serverSettings.httpServer.corsOrigin != undefined)
        app.use(cors({ origin: '*' }))

    const context: LocalContext = {
        store,
        serverControls: options.controlCallbacks
    }
    app.locals.context = context

    app.use('/fileplayer', filePlayer)
    app.use('/soundfiles', soundFiles)
    app.use('/config', config)

    // app.get('/', (_req, res) => res.send('remote-audio-controller-server'))
    // TODO: Send frontend (maybe check for public directory/server configuration, frontend could also be hosted independently or through a proxy)

    app.post('/reload/:service', (req, res) => {
        const service = req.params.service
        const callbacks = options.controlCallbacks.reload

        const toCall = Object.entries(callbacks).find(entry => entry[0] == service)
        if (toCall == undefined) {
            res.sendStatus(404)
            return
        }

        const sendNewPortResponse = service == 'http' || service == 'all'
        if (sendNewPortResponse) {
            res.status(301).send({
                port: serverSettings.httpServer.port
            })
            toCall[1]()
            return
        }
        toCall[1]()
        res.sendStatus(200)
    })

    return app
}