import express from 'express'

import { getContext } from '../servers/express'
import { getConfig, writeConfigFile } from '../slices/configSlice'

const router = express().router

router.get('/', (req, res) => {
    const store = getContext(req).store
    res.send(getConfig(store.getState()))
})

router.put('/', express.text(), async (req, res) => {
    const reload = req.query.reload

    const store = getContext(req).store
    const config = JSON.parse(req.body)
    await writeConfigFile(config)
    res.send(getConfig(store.getState()))

    if (reload == 'true') getContext(req).serverControls.reload()
})

export default router