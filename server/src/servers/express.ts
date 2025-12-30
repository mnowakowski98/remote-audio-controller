import express, { Express, NextFunction, Request, Response } from 'express'
import cors from 'cors'

import { AppStore } from '../store'
import { selectConfig } from '../slices/configSlice'

import filePlayer from '../routes/filePlayer'
import soundFiles from '../routes/soundFiles'
import config from '../routes/config'

let app: Express | null = null

export type LocalContext = {
    store: AppStore,
    serverControls: {
        reload: () => void
    }
}

export const getContext = (req: Request): LocalContext => req.app.locals.context

export const createApp = (store: AppStore, options: {
    middleware?: ((req: Request, res: Response, next: NextFunction) => void)[],
    controlCallbacks: {
        reload: () => void
    }
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

    app.post('/reload', (_req, res) => {
        res.sendStatus(200)
        options.controlCallbacks.reload()
    })

    return app
}