import express from 'express'

import { getContext } from '../servers/express'
import { getConfig, setConfig, writeCurrentConfigFile } from '../slices/configSlice'

const router = express().router

router.get('/', (req, res) => {
    const store = getContext(req).store
    res.send(getConfig(store.getState()))
})

router.put('/', express.text(), (req, res) => {
    const store = getContext(req).store
    const config = JSON.parse(req.body)
    store.dispatch(setConfig(config))
    store.dispatch(writeCurrentConfigFile())
    res.sendStatus(200)
})

export default router