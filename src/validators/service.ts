import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class ServiceValidator {
    createSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(5).max(10).required(),
        name: Joi.object({
            first_name: Joi.string().required(),
            last_name: Joi.string().required()
        }).required(),
        timezone: Joi.string(),
        dot_number: Joi.number().required()
    })

    updateSchema = Joi.object({
        email: Joi.string().email(),
        name: Joi.object({
            first_name: Joi.string().required(),
            last_name: Joi.string().required()
        }),
        timezone: Joi.string(),
        dot_number: Joi.number(),
        password: Joi.string().min(5).max(10).when('status', {
            is: 'inactive',
            then: Joi.forbidden()
        }),
        status: Joi.string().valid('active', 'inactive')
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.createSchema.validate(req.body)
        if (error) return next(error)

        next()
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const {error} = this.updateSchema.validate(req.body)
        if (error) return next(error)

        next()
    })
}
