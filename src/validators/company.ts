import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class CompanyValidator {

    private createSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(5).max(10).required(),
        dot_number: Joi.number().required(),
        phone_number: Joi.number().required(),
        address: Joi.string().required(),
        terminal: Joi.object({
            address: Joi.string().required(),
            zone: Joi.string().required()
        }).required()
    })

    private updateSchema = Joi.object({
        name: Joi.string(),
        email: Joi.string().email(),
        dot_number: Joi.number(),
        phone_number: Joi.number(),
        address: Joi.string(),
        terminal: Joi.object({
            address: Joi.string().required(),
            zone: Joi.string().required()
        }),
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
        const { error } = this.updateSchema.validate(req.body)
        if (error) return next(error)

        next()
    })
}
