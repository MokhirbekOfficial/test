import Joi, { number } from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class LogValidator {
    private createSchema = Joi.object({
        status: Joi.string().valid('on', 'dr', 'sb', 'off(pc)', 'on(ym)', 'off', 'intermediate', 'sertify', 'login', 'logout', 'power on', 'power off').required(),
        location: Joi.object({
            name: Joi.string().required(),
            lat: Joi.string().required(),
            long: Joi.string().required()
        }).required(),
        odometer: Joi.number().required(),
        engine_hours: Joi.number().required(),
        trailers: Joi.string().required(),
        documents: Joi.string().required(),
        notes: Joi.string(),
        created_at: Joi.string()
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let { location, created_at } = req.body
        if (location) {
            req.body.location = JSON.parse(location)
        }
        const { error } = this.createSchema.validate(req.body)
        if (error) return next(error)

        if (created_at) {
            req.body.created_at = parseInt(created_at)
        }

        next()
    })
}
