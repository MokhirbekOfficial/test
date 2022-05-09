import NodeCache from 'node-cache'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

const cache = new NodeCache()

export const set = () => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { role, id } = res.locals

        let result = `${req.originalUrl}-${role}-${id}`

        const data = JSON.stringify(res.locals.data)

        if (result && data) {

            cache.set(result, data)

            return next()
        }
    })
}

export const get = () => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { role, id } = res.locals

        let result = `${req.originalUrl}-${role}-${id}`

        if (result) {
            const content: any = cache.get(result)

            if (content) {
                const data = JSON.parse(content)

                if (data) {
                    return res.status(200).send(data)
                }
            }

            return next()
        }
    })
}

export const clear = () => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const keys = cache.keys(), url = `/v1/`

        if (keys.length > 0) {
            cache.del(keys.filter((k) => k.startsWith(url)))

            return next()
        }
    })
}
