import { createServer, IncomingMessage, RequestListener, ServerResponse } from 'node:http'

const httpServer = createServer()

export const addRequestListener = (listener: RequestListener<typeof IncomingMessage, typeof ServerResponse> | undefined) => {
    if(listener == undefined) return
    httpServer.on('request', listener)
}

export const startServer = (port: number) => {
    httpServer.close()
    httpServer.closeAllConnections()

    httpServer.listen(port, () => console.log(`Listening on port: ${port}`))
}