import express from 'express'

import { getContext } from '../servers/express'
import { selectConfig, writeConfigFile } from '../slices/configSlice'

const router = express().router

router.get('/', (req, res) => {
    const store = getContext(req).store
    res.send(selectConfig(store.getState()))
})

router.put('/', express.text(), async (req, res) => {
    const reload = req.query.reload

    const context = getContext(req)
    const store = context.store
    const config = JSON.parse(req.body)
    await writeConfigFile(config)

    if (reload == 'true') {
        res.status(301).send({
            port: selectConfig(store.getState()).httpServer.port
        })
        context.serverControls.reload.all()
    } else res.sendStatus(200)
})

export default router