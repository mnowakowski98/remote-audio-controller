import express, { Express, Request } from 'express'
import cors from 'cors'

import { AppStore } from '../store'
import { selectConfig } from '../slices/configSlice'

import { join } from 'node:path'
import { cwd } from 'node:process'

import filePlayer from '../routes/filePlayer'
import soundFiles from '../routes/soundFiles'
import config from '../routes/config'
import { existsSync } from 'node:fs'


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

    app.use('/api/fileplayer', filePlayer)
    app.use('/api/soundfiles', soundFiles)
    app.use('/api/config', config)

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

    const publicDirectory = join(cwd(), './public')
    const hasPublicDirectory = existsSync(publicDirectory)
    if (hasPublicDirectory == true) {
        app.use(express.static(publicDirectory))
        app.get(/\/*\//, (_, res) => res.sendFile(join(publicDirectory, './index.html')))
    }

    return app
}