import express, { Express, NextFunction, Request, Response } from 'express'
import cors from 'cors'

import { AppStore } from '../store'
import { selectConfig } from '../slices/configSlice'

import filePlayer from '../routes/filePlayer'
import soundFiles from '../routes/soundFiles'
import config from '../routes/config'

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
    middleware?: ((req: Request, res: Response, next: NextFunction) => void)[],
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

    if (options.middleware != undefined) app.use(options.middleware)

    app.use('/fileplayer', filePlayer)
    app.use('/soundfiles', soundFiles)
    app.use('/config', config)

    app.get('/', (_req, res) => res.send('remote-audio-controller-server'))

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