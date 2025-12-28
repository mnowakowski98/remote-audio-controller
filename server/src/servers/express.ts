import express, { Express, NextFunction, Request, Response } from 'express'
import cors from 'cors'

import { AppStore } from '../store'
import { getConfig } from '../slices/configSlice'

import audioPlayer from '../routes/audioplayer'
import soundFiles from '../routes/soundFiles'
import configRoute from '../routes/config'

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

    const config = getConfig(store.getState())
    if (config.httpServer.corsOrigin != undefined)
        app.use(cors({ origin: '*' }))

    const context: LocalContext = {
        store,
        serverControls: options.controlCallbacks
    }
    app.locals.context = context

    if (options.middleware != undefined) app.use(options.middleware)

    app.use('/audioplayer', audioPlayer)
    app.use('/soundfiles', soundFiles)
    app.use('/config', configRoute)

    app.get('/', (_req, res) => res.send('remote-audio-controller-server'))

    app.post('/reload', (_req, res) => {
        res.sendStatus(200)
        options.controlCallbacks.reload()
    })

    return app
}