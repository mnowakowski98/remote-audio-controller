import { NextFunction, Request, Response } from 'express'

export default function parseNumber() {
    return (req: Request, res: Response, next: NextFunction) => {
        const bodyBuffer: Uint8Array[] = []
        req.on('data', (data) => bodyBuffer.push(data))
        req.on('end', () => {
            const parsed = parseInt(Buffer.concat(bodyBuffer).toString())
            if (Number.isNaN(parsed) == true) {
                res.status(400).send('Body must be a number')
                return
            }
            req.body = parsed
            next()
        })
    }
}