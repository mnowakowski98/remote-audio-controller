import express, { Express, NextFunction, Request, Response } from 'express'
import cors from 'cors'

import { AppStore } from '../store'
import { getConfig } from '../slices/configSlice'

import audioPlayer from '../routes/audioplayer'
import soundFiles from '../routes/soundFiles'
import configRoute from '../routes/config'

let app: Express | null = null

export type LocalContext = {
    store: AppStore
}

export const getContext = (req: Request): LocalContext => req.app.locals.context

export const createApp = (store: AppStore, middleware?: ((req: Request, res: Response, next: NextFunction) => void)[]) => {
    app = express()

    const config = getConfig(store.getState())
    if (config.httpServer.corsOrigin != undefined)
        app.use(cors({ origin: '*' }))

    const context: LocalContext = {
        store
    }
    app.locals.context = context

    if (middleware != undefined)
        for (const func of middleware) app.use(func)

    app.use('/audioplayer', audioPlayer)
    app.use('/soundfiles', soundFiles)
    app.use('/config', configRoute)

    app.get('/', (_req, res) => res.send('remote-audio-controller-server'))
    return app
}