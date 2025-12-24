import express from 'express'
import LocalContext from '../_models/localContex'
import { getConfig, setConfig } from '../slices/configSlice'

const router = express().router

router.get('/', (req, res) => {
    const store = (req.app.locals.context as LocalContext).store
    res.send(getConfig(store.getState()))
})

router.put('/', express.text(), (req, res) => {
    const store = (req.app.locals.context as LocalContext).store
    const config = JSON.parse(req.body)
    res.sendStatus(200)
    store.dispatch(setConfig(config))
})

export default router