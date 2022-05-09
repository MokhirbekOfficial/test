import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class IFTAValidator {
    private createSchema = Joi.object({
        company_id: Joi.string().uuid().required(),
        date: Joi.number().integer().required(),
        vehicle_id: Joi.string().uuid().required(),
        states: Joi.array().items(Joi.string().required()).required(),
        type: Joi.string().required(),
        name: Joi.string().required()
    })

    private updateSchema = Joi.object({
        date: Joi.number().integer(),
        vehicle_id: Joi.string().uuid().when("status", {
            is: 'inactive',
            then: Joi.forbidden()
        }),
        states: Joi.array().items(Joi.string().required()),
        status: Joi.string().valid('active', 'inactive'),
        type: Joi.string(),
        name: Joi.string()
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
