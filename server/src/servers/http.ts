import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import {
    createServer,
    IncomingMessage,
    RequestListener,
    Server,
    ServerResponse
} from 'node:http'
import { createServer as createSecureServer, Server as SecureServer } from 'node:https'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { AppStore } from '../store'
import { selectHttpConfig } from '../slices/configSlice'

const certificateKeyPath = join(cwd(), './keys/remote-audio-controller-key.pem')
const certificatePath = join(cwd(), './keys/remote-audio-controller-cert.pem')
const useSecureServer = existsSync(certificateKeyPath) == true && existsSync(certificatePath) == true

let httpServer: SecureServer | Server | null = null

export const addRequestListener = (listener: RequestListener<typeof IncomingMessage, typeof ServerResponse>) =>
    httpServer?.on('request', listener)

export const addUpgradeListener = (listener: (res: IncomingMessage, upgradeHead: Buffer) => void) =>
    httpServer?.on('upgrade', (req, _, head) => listener(req, head))

let _isRunning = false
export const isRunning = () => _isRunning

export const startServer = async (store: AppStore) => {
    const config = selectHttpConfig(store.getState())
    const port = config.port ?? (useSecureServer == true ? 443 : 80)
    if(_isRunning == true) {
        httpServer?.close()
        httpServer?.closeAllConnections()
        httpServer?.removeAllListeners()
    }

    httpServer = useSecureServer == true ? createSecureServer({
        key: await readFile(certificateKeyPath),
        cert: await readFile(certificatePath)
    }) : createServer()
    httpServer.listen(port, () => console.log(`Listening on port: ${port}`))
    _isRunning = true
}