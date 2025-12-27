import { createServer, IncomingMessage, RequestListener, ServerResponse } from 'node:http'

const httpServer = createServer()

export const addRequestListener = (listener: RequestListener<typeof IncomingMessage, typeof ServerResponse>) =>
    httpServer.on('request', listener)

let _isRunning = false
export const isRunning = () => _isRunning

export const startServer = (port: number) => {
    if(_isRunning == true) {
        httpServer.close()
        httpServer.closeAllConnections()
        httpServer.removeAllListeners()
    }

    httpServer.listen(port, () => console.log(`Listening on port: ${port}`))
    _isRunning = true
}